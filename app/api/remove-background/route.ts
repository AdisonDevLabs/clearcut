import { NextRequest } from 'next/server';
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Ensure canvas native image processing hooks are initialized for smoother alpha matting
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
      // Default to medium (IS-Net 32-bit floating point precision)
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

    // Stream SSE progress to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          sendEvent({
            type: 'progress',
            stage: 'initializing',
            rawKey: 'init',
            label: 'Preparing image buffer for Node.js segmentation',
            percent: 5,
            currentBytes: 0,
            totalBytes: 0,
            elapsedSeconds: 0,
          });

          // Ensure mime type is recognized
          let mimeType = file.type || 'image/png';
          if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
            mimeType = 'image/png';
          }

          const inputBlob = new Blob([originalBuffer], { type: mimeType });

          let currentPercent = 5;

          const outputBlob = await removeBackground(inputBlob, {
            model: resolvedModel,
            output: {
              format: 'image/png',
              quality: 1.0,
            },
            progress: (key: string, current: number, total: number) => {
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
              const elapsedSeconds = Math.round((performance.now() - startTime) / 100) / 10;

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
            },
          });

          // Extract array buffer and dimensions via sharp
          const resultBuffer = Buffer.from(await outputBlob.arrayBuffer());
          const metadata = await sharp(resultBuffer).metadata();
          const width = metadata.width || 800;
          const height = metadata.height || 600;
          const base64Data = resultBuffer.toString('base64');
          const dataUrl = `data:image/png;base64,${base64Data}`;
          const durationMs = Math.round(performance.now() - startTime);

          sendEvent({
            type: 'complete',
            dataUrl,
            width,
            height,
            originalSize,
            outputSize: resultBuffer.byteLength,
            durationMs,
          });

          controller.close();
        } catch (error: unknown) {
          console.error('Error during Node.js background removal:', error);
          const message =
            error instanceof Error ? error.message : 'Node.js background removal failed';
          sendEvent({
            type: 'error',
            message,
          });
          controller.close();
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
