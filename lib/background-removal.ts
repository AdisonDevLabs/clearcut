// Client service communicating with @imgly/background-removal-node backend via SSE stream

export interface RemovalProgress {
  stage: 'idle' | 'downloading' | 'initializing' | 'inferring' | 'compositing' | 'complete' | 'error';
  rawKey: string;
  label: string;
  percent: number;
  currentBytes: number;
  totalBytes: number;
  elapsedSeconds: number;
}

export type RemovalModel = 'isnet' | 'small' | 'large' | 'medium';

export interface ProcessImageOptions {
  model?: RemovalModel;
  onProgress?: (progress: RemovalProgress) => void;
  signal?: AbortSignal;
}

export interface ProcessImageResult {
  outputBlob: Blob;
  outputUrl: string;
  durationMs: number;
  originalSize: number;
  outputSize: number;
  width: number;
  height: number;
}

/**
 * Removes background using the server-side @imgly/background-removal-node engine,
 * streaming live real-time progress callbacks back to the client.
 */
export async function removeImageBackground(
  imageSource: File | Blob | string,
  options: ProcessImageOptions = {}
): Promise<ProcessImageResult> {
  const { model = 'isnet', onProgress, signal } = options;
  const startTime = performance.now();

  // Convert input into a File or Blob
  let fileToUpload: Blob;
  let filename = 'upload.png';

  if (imageSource instanceof File) {
    fileToUpload = imageSource;
    filename = imageSource.name;
  } else if (imageSource instanceof Blob) {
    fileToUpload = imageSource;
  } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
    const res = await fetch(imageSource);
    fileToUpload = await res.blob();
  } else {
    throw new Error('Unsupported image input format');
  }

  const formData = new FormData();
  formData.append('file', fileToUpload, filename);
  formData.append('model', model);

  if (onProgress) {
    onProgress({
      stage: 'initializing',
      rawKey: 'init:network',
      label: 'Connecting to background removal service...',
      percent: 5,
      currentBytes: 0,
      totalBytes: 0,
      elapsedSeconds: 0,
    });
  }

  const response = await fetch('/api/remove-background', {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => null);
    throw new Error(errJson?.error || `Server responded with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is missing from server');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let finalResult: ProcessImageResult | null = null;
  let serverErrorMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete trailing fragment

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr) continue;

      try {
        const event = JSON.parse(jsonStr);

        if (event.type === 'progress') {
          if (onProgress) {
            onProgress({
              stage: event.stage,
              rawKey: event.rawKey || 'progress',
              label: event.label || 'Processing image...',
              percent: event.percent,
              currentBytes: event.currentBytes || 0,
              totalBytes: event.totalBytes || 0,
              elapsedSeconds: event.elapsedSeconds || Math.round((performance.now() - startTime) / 100) / 10,
            });
          }
        } else if (event.type === 'complete') {
          // Convert base64 dataUrl to Blob
          const fetchRes = await fetch(event.dataUrl);
          const outputBlob = await fetchRes.blob();
          const outputUrl = URL.createObjectURL(outputBlob);

          finalResult = {
            outputBlob,
            outputUrl,
            durationMs: event.durationMs,
            originalSize: event.originalSize,
            outputSize: event.outputSize,
            width: event.width,
            height: event.height,
          };

          if (onProgress) {
            onProgress({
              stage: 'complete',
              rawKey: 'done',
              label: 'Background removal completed',
              percent: 100,
              currentBytes: event.outputSize,
              totalBytes: event.outputSize,
              elapsedSeconds: Math.round(event.durationMs / 100) / 10,
            });
          }
        } else if (event.type === 'error') {
          serverErrorMessage = event.message || 'Background removal encountered an error';
        }
      } catch (parseErr) {
        console.warn('Failed to parse SSE line', trimmed, parseErr);
      }
    }
  }

  if (serverErrorMessage) {
    throw new Error(serverErrorMessage);
  }

  if (!finalResult) {
    throw new Error('Server terminated connection without returning processed image');
  }

  return finalResult;
}

/**
 * Format bytes to readable string (KB / MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
