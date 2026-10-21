import { NextRequest } from 'next/server';
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Initialize native canvas hooks if present for smoother alpha matting
try {
  const canvasPkg = require('canvas');
  if (canvasPkg) {
    const g = global as unknown as Record<string, unknown>;
    if (!g.HTMLCanvasElement && canvasPkg.Canvas) {
      g.HTMLCanvasElement = canvasPkg.Canvas;
    }
    if (!g.Image && canvasPkg.Image) {
      g.Image = canvasPkg.Image;
    }
    if (!g.ImageData && canvasPkg.ImageData) {
      g.ImageData = canvasPkg.ImageData;
    }
  }
} catch (e) {
  console.debug('Canvas runtime note:', e);
}

// In-memory cache for processed images to avoid sending huge base64 strings over SSE
interface CachedResult {
  buffer: Buffer;
  mimeType: string;
  timestamp: number;
}
const resultMap = new Map<string, CachedResult>();

// Clean up results older than 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    for (const [id, item] of resultMap.entries()) {
      if (item.timestamp < cutoff) {
        resultMap.delete(id);
      }
    }
  }, 60 * 1000);
}

// Endpoint to retrieve binary image result by ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || !resultMap.has(id)) {
    return new Response('Image result not found or expired', { status: 404 });
  }

  const cached = resultMap.get(id)!;
  return new Response(new Uint8Array(cached.buffer), {
    headers: {
      'Content-Type': cached.mimeType,
      'Cache-Control': 'public, max-age=300, immutable',
    },
  });
}

function parseProgressStage(key: string): {
  stage: 'downloading' | 'initializing' | 'inferring' | 'compositing';
  label: string;
} {
  if (key.startsWith('fetch:')) {
    if (key.includes('model') || key.includes('onnx')) {
      return { stage: 'downloading', label: 'Downloading IS-Net FP32 neural model' };
    }
    if (key.includes('wasm')) {
      return { stage: 'downloading', label: 'Loading WebAssembly runtime' };
    }
    return { stage: 'downloading', label: 'Fetching model resources' };
  }

  if (key.includes('init') || key.includes('session')) {
    return { stage: 'initializing', label: 'Initializing ONNX runtime session' };
  }

  if (key.startsWith('compute:decode')) {
    return { stage: 'initializing', label: 'Decoding image buffer via Sharp' };
  }

  if (key.startsWith('compute:inference')) {
    return { stage: 'inferring', label: 'Running 32-bit floating-point (FP32) segmentation' };
  }

  if (key.startsWith('compute:mask') || key.startsWith('compute:encode')) {
    return { stage: 'compositing', label: 'Rendering smooth alpha mask & edge feathering' };
  }

  return { stage: 'inferring', label: 'Processing image' };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const modelParam = ((formData.get('model') as string) || 'isnet').toLowerCase();

    // Map 'isnet' / 'fp32' to the 32-bit precision model ('medium' in @imgly/background-removal-node is the 88MB FP32 IS-Net)
    let resolvedModel: 'small' | 'medium' | 'large' = 'medium';
    if (modelParam === 'small' || modelParam === 'fast') {
      resolvedModel = 'small';
    } else if (modelParam === 'large') {
      resolvedModel = 'large';
    } else {
      resolvedModel = 'medium';
    }

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startTime = performance.now();
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const originalSize = originalBuffer.byteLength;

    // Normalize input buffer to clean RGBA PNG via sharp so any format (SVG, AVIF, JPEG, etc.) works
    let normalizedBuffer: Buffer;
    try {
      normalizedBuffer = await sharp(originalBuffer).png().toBuffer();
    } catch {
      normalizedBuffer = originalBuffer;
    }

    // Stream SSE progress to client with robust closed-state guards
    const encoder = new TextEncoder();
    let isStreamClosed = false;

    // Listen to abort on incoming request
    req.signal.addEventListener('abort', () => {
      isStreamClosed = true;
    });

    const stream = new ReadableStream({
      cancel() {
        isStreamClosed = true;
      },
      async start(controller) {
        // Safe event sender that never throws when controller is already closed
        const sendEvent = (payload: Record<string, unknown>) => {
          if (isStreamClosed) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          } catch {
            isStreamClosed = true;
          }
        };

        const closeStream = () => {
          if (!isStreamClosed) {
            isStreamClosed = true;
            try {
              controller.close();
            } catch {
              // ignore
            }
          }
        };

        try {
          sendEvent({
            type: 'progress',
            stage: 'initializing',
            rawKey: 'init',
            label: 'Preparing image buffer for IS-Net FP32 segmentation',
            percent: 5,
            currentBytes: 0,
            totalBytes: 0,
            elapsedSeconds: 0,
          });

          const inputBlob = new Blob([new Uint8Array(normalizedBuffer)], { type: 'image/png' });

          let currentPercent = 5;
          let lastProgressTime = 0;
          let lastProgressPercent = -1;

          const outputBlob = await removeBackground(inputBlob, {
            model: resolvedModel,
            output: {
              format: 'image/png',
              quality: 1.0,
            },
            progress: (key: string, current: number, total: number) => {
              // If stream already closed (e.g. client navigated away), do not send
              if (isStreamClosed) return;

              const { stage, label } = parseProgressStage(key);
              let calcPercent = 0;
              if (total > 0 && current > 0) {
                calcPercent = Math.min(100, Math.round((current / total) * 100));
              } else {
                if (stage === 'downloading') calcPercent = 35;
                else if (stage === 'initializing') calcPercent = 50;
                else if (stage === 'inferring') calcPercent = 80;
                else if (stage === 'compositing') calcPercent = 95;
              }

              currentPercent = Math.max(currentPercent, calcPercent);
              const now = performance.now();
              const elapsedSeconds = Math.round((now - startTime) / 100) / 10;

              // Throttle progress events to prevent stream congestion & backpressure
              if (
                calcPercent !== lastProgressPercent &&
                (now - lastProgressTime > 120 || calcPercent >= 100)
              ) {
                lastProgressTime = now;
                lastProgressPercent = calcPercent;

                sendEvent({
                  type: 'progress',
                  stage,
                  rawKey: key,
                  label,
                  percent: currentPercent,
                  currentBytes: current || 0,
                  totalBytes: total || 0,
                  elapsedSeconds,
                });
              }
            },
          });

          // Extract array buffer and dimensions via sharp
          const resultBuffer = Buffer.from(await outputBlob.arrayBuffer());
          const metadata = await sharp(resultBuffer).metadata();
          const width = metadata.width || 800;
          const height = metadata.height || 600;
          const durationMs = Math.round(performance.now() - startTime);

          // Store result in memory map for clean binary delivery
          const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          resultMap.set(resultId, {
            buffer: resultBuffer,
            mimeType: 'image/png',
            timestamp: Date.now(),
          });

          // Also provide dataUrl for small images (< 1.5MB)
          let dataUrl: string | undefined = undefined;
          if (resultBuffer.byteLength < 1.5 * 1024 * 1024) {
            dataUrl = `data:image/png;base64,${resultBuffer.toString('base64')}`;
          }

          sendEvent({
            type: 'complete',
            resultId,
            dataUrl,
            width,
            height,
            originalSize,
            outputSize: resultBuffer.byteLength,
            durationMs,
          });

          closeStream();
        } catch (error: unknown) {
          console.error('Error during Node.js background removal:', error);
          if (!isStreamClosed) {
            const message =
              error instanceof Error ? error.message : 'Node.js background removal failed';
            sendEvent({
              type: 'error',
              message,
            });
            closeStream();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    console.error('API route error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Server error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
