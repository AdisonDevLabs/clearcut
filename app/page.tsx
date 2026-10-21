'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Dropzone } from '@/components/Dropzone';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ComparisonView } from '@/components/ComparisonView';
import { FeaturesSection } from '@/components/FeaturesSection';
import { HistoryStrip, HistoryItem } from '@/components/HistoryStrip';
import {
  removeImageBackground,
  RemovalProgress,
  RemovalModel,
  ProcessImageResult,
} from '@/lib/background-removal';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<RemovalModel>('isnet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<RemovalProgress | null>(null);
  const [result, setResult] = useState<ProcessImageResult | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [activeFile, setActiveFile] = useState<File | Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);

  const fileInputHiddenRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processImage = useCallback(
    async (file: File | Blob, filename: string, model: RemovalModel) => {
      // Abort any previous ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsProcessing(true);
      setErrorMessage(null);
      setResult(null);

      // Create preview URL for original
      const previewUrl = URL.createObjectURL(file);
      setOriginalUrl(previewUrl);
      setOriginalFilename(filename);
      setActiveFile(file);

      // Scroll to workspace
      const el = document.getElementById('workspace-view');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      try {
        const removalResult = await removeImageBackground(file, {
          model,
          signal: abortController.signal,
          onProgress: (p) => setProgress(p),
        });

        if (abortController.signal.aborted) return;

        setResult(removalResult);
        setIsProcessing(false);

        // Add to history
        const historyId = `item-${Date.now()}`;
        setActiveHistoryId(historyId);
        setHistory((prev) => [
          {
            id: historyId,
            filename,
            originalUrl: previewUrl,
            result: removalResult,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 7), // Keep last 8 items
        ]);
      } catch (err: unknown) {
        if (abortController.signal.aborted) {
          // Aborted by user, do not show error
          return;
        }
        console.error('Background removal failed', err);
        setIsProcessing(false);
        const msg =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while processing the image.';
        setErrorMessage(msg);
      }
    },
    []
  );

  const handleFileSelect = (file: File | Blob, filename: string) => {
    processImage(file, filename, selectedModel);
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResult(null);
    setOriginalUrl(null);
    setOriginalFilename('');
    setActiveFile(null);
    setProgress(null);
    setErrorMessage(null);
    setActiveHistoryId(undefined);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setOriginalUrl(item.originalUrl);
    setOriginalFilename(item.filename);
    setResult(item.result);
    setActiveHistoryId(item.id);
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleUploadNavClick = () => {
    fileInputHiddenRef.current?.click();
  };

  const handleHiddenFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelect(file, file.name);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 flex flex-col font-sans antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
      {/* Hidden file input for header CTA button */}
      <input
        ref={fileInputHiddenRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={handleHiddenFileInputChange}
        className="hidden"
      />

      {/* Top Bar */}
      <Navbar
        onUploadClick={handleUploadNavClick}
        hasActiveImage={!!result || isProcessing}
        onResetClick={handleReset}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto space-y-12">
        <div id="workspace-view" className="w-full">
          {/* State 1: Error Display */}
          {errorMessage && !isProcessing && (
            <div className="w-full max-w-2xl mx-auto mb-8 rounded-2xl border border-red-200 bg-red-50/70 p-6 dark:border-red-900/60 dark:bg-red-950/40 space-y-4">
              <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Background Removal Interrupted</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200 transition-colors"
                >
                  Choose Another Image
                </button>
                {activeFile && (
                  <button
                    onClick={() => processImage(activeFile, originalFilename, 'small')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry with Small Model
                  </button>
                )}
              </div>
            </div>
          )}

          {/* State 2: Processing Progress */}
          {isProcessing && progress && (
            <div className="py-8">
              <ProgressTracker
                progress={progress}
                filename={originalFilename}
                onCancel={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                  setIsProcessing(false);
                  setProgress(null);
                }}
              />
            </div>
          )}

          {/* State 3: Comparison View with Result */}
          {!isProcessing && result && originalUrl && (
            <div className="space-y-8">
              <ComparisonView
                originalUrl={originalUrl}
                originalFilename={originalFilename}
                result={result}
                onReset={handleReset}
              />
            </div>
          )}

          {/* State 4: Default Upload Dropzone */}
          {!isProcessing && !result && (
            <Dropzone
              onFileSelect={handleFileSelect}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Session History Carousel */}
        {history.length > 0 && (
          <HistoryStrip
            items={history}
            onSelect={handleHistorySelect}
            onClear={() => setHistory([])}
            activeId={activeHistoryId}
          />
        )}

        {/* Informative Architectural Details & Benefits */}
        <FeaturesSection />
      </main>

      {/* Footer per Constitution */}
      <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900 dark:text-white">ClearCut</span>
            <span aria-hidden="true">·</span>
            <span>AI background removal powered by @imgly/background-removal-node & sharp</span>
          </div>
          <div className="flex items-center gap-4">
            <span>High precision ONNX runtime</span>
            <span aria-hidden="true">·</span>
            <span>Real-time SSE progress</span>
            <span aria-hidden="true">·</span>
            <span>Zero 3rd-party API keys</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
