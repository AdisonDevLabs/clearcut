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
 * Converts a base64 encoded string to a Blob instantly without network calls.
 */
function base64ToBlob(base64: string, mimeType = 'image/png'): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
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

  const handleEvent = async (event: Record<string, unknown>) => {
    if (event.type === 'progress') {
      if (onProgress) {
        onProgress({
          stage: event.stage as RemovalProgress['stage'],
          rawKey: (event.rawKey as string) || 'progress',
          label: (event.label as string) || 'Processing image...',
          percent: event.percent as number,
          currentBytes: (event.currentBytes as number) || 0,
          totalBytes: (event.totalBytes as number) || 0,
          elapsedSeconds: (event.elapsedSeconds as number) || Math.round((performance.now() - startTime) / 100) / 10,
        });
      }
    } else if (event.type === 'complete') {
      let outputBlob: Blob;

      if (typeof event.base64 === 'string') {
        outputBlob = base64ToBlob(event.base64, 'image/png');
      } else if (typeof event.dataUrl === 'string') {
        const b64 = event.dataUrl.includes(',') ? event.dataUrl.split(',')[1] : event.dataUrl;
        outputBlob = base64ToBlob(b64, 'image/png');
      } else if (typeof event.resultId === 'string') {
        const res = await fetch(`/api/remove-background?id=${event.resultId}`, { signal });
        if (!res.ok) throw new Error('Failed to retrieve processed image from server');
        outputBlob = await res.blob();
      } else {
        throw new Error('Server returned empty image result');
      }

      const outputUrl = URL.createObjectURL(outputBlob);

      finalResult = {
        outputBlob,
        outputUrl,
        durationMs: (event.durationMs as number) || 0,
        originalSize: (event.originalSize as number) || 0,
        outputSize: (event.outputSize as number) || outputBlob.size,
        width: (event.width as number) || 800,
        height: (event.height as number) || 600,
      };

      if (onProgress) {
        onProgress({
          stage: 'complete',
          rawKey: 'done',
          label: 'Background removal completed',
          percent: 100,
          currentBytes: finalResult.outputSize,
          totalBytes: finalResult.outputSize,
          elapsedSeconds: Math.round(finalResult.durationMs / 100) / 10,
        });
      }
    } else if (event.type === 'error') {
      serverErrorMessage = (event.message as string) || 'Background removal encountered an error';
    }
  };

  const processLine = async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) return;
    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr) return;

    try {
      const event = JSON.parse(jsonStr);
      await handleEvent(event);
    } catch (parseErr) {
      console.warn('Failed to parse SSE JSON line:', trimmed, parseErr);
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (value) {
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        await processLine(line);
      }
    }

    if (done) {
      if (buffer.trim()) {
        await processLine(buffer.trim());
      }
      break;
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
