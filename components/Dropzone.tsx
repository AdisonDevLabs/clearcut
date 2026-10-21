'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Shield, Cpu, Zap, ArrowRight } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '@/lib/sample-images';
import { RemovalModel } from '@/lib/background-removal';

interface DropzoneProps {
  onFileSelect: (file: File | Blob, filename: string) => void;
  selectedModel: RemovalModel;
  onModelChange: (model: RemovalModel) => void;
  isProcessing: boolean;
}

export function Dropzone({
  onFileSelect,
  selectedModel,
  onModelChange,
  isProcessing,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            onFileSelect(file, file.name || `clipboard-${Date.now()}.png`);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing, onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file, file.name);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onFileSelect(file, file.name);
      e.target.value = ''; // Reset input
    }
  };

  const handleSampleClick = async (sample: SampleImage) => {
    if (isProcessing) return;
    try {
      const res = await fetch(sample.dataUrl);
      const blob = await res.blob();
      onFileSelect(blob, `${sample.id}-sample.png`);
    } catch (err) {
      console.error('Failed to load sample image', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span>@imgly/background-removal-node</span>
          <span aria-hidden="true">·</span>
          <span>ONNX Runtime & Sharp Engine</span>
          <span aria-hidden="true">·</span>
          <span>Real-Time SSE Progress</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-3xl mx-auto" style={{ textWrap: 'balance' }}>
          Automated background removal powered by Node.js AI.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Powered by @imgly/background-removal-node and ONNX deep learning models. High fidelity edge matting with live streaming progress updates.
        </p>
      </div>

      {/* Main Upload Dropzone */}
      <div
        id="workspace"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 transition-all duration-200 text-center ${
          isDragging
            ? 'border-neutral-900 bg-neutral-100/80 dark:border-white dark:bg-neutral-800/80 scale-[1.01]'
            : 'border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/70 dark:hover:border-neutral-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-900 dark:text-white group-hover:scale-105 transition-transform">
            <UploadCloud className="h-8 w-8 stroke-[1.75]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Drop your image here, or browse files
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Supports PNG, JPG, WEBP, or AVIF up to 25MB · Or press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[11px] font-mono">Ctrl+V</kbd> to paste
            </p>
          </div>

          <button
            type="button"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors pointer-events-none"
          >
            <ImageIcon className="h-4 w-4" />
            Choose Image File
          </button>
        </div>

        {/* Model Selector Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col items-center justify-center gap-3 text-xs"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">
              Neural Model:
            </span>

            <div className="flex items-center p-1 bg-neutral-200/70 dark:bg-neutral-800 rounded-lg">
              <button
                type="button"
                onClick={() => onModelChange('isnet')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedModel === 'isnet' || selectedModel === 'medium'
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                IS-Net FP32 (Full 32-bit Precision · Cleanest Edges)
              </button>
              <button
                type="button"
                onClick={() => onModelChange('small')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedModel === 'small'
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Small (Fast Quantized · ~40MB)
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Forced 32-bit floating-point precision (FP32) with native Node canvas & Sharp acceleration for smooth alpha edge matting.
          </p>
        </div>
      </div>

      {/* Preset Samples Showcase */}
      <div id="presets" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Try with sample images
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Click any subject below to see instant in-browser background separation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              disabled={isProcessing}
              className="group text-left rounded-xl border border-neutral-200 bg-white p-3 hover:border-neutral-400 hover:shadow-xs dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.dataUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[11px] font-semibold bg-white/95 text-neutral-900 px-2 py-1 rounded shadow-xs dark:bg-neutral-900/95 dark:text-white">
                    Process Sample
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
                  {sample.category}
                </span>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-1">
                  {sample.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy & Engine Benefits Row */}
      <div id="privacy" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Node.js ONNX Engine
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Powered by @imgly/background-removal-node and sharp for high throughput image buffer segmentation.
            </p>
          </div>
        </div>

        <div className="flex gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Live Progress Streaming
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Server-Sent Events stream model download byte counts and inference steps to the UI in real time.
            </p>
          </div>
        </div>

        <div className="flex gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Self-Contained Processing
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Runs in your private Node server instance with zero external 3rd-party SaaS API dependencies or keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
