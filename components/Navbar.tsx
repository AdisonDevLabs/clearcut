'use client';

import React from 'react';
import { Sparkles, Upload, ShieldCheck, Zap } from 'lucide-react';

interface NavbarProps {
  onUploadClick: () => void;
  hasActiveImage: boolean;
  onResetClick: () => void;
}

export function Navbar({ onUploadClick, hasActiveImage, onResetClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <button
            onClick={onResetClick}
            className="text-left font-bold text-lg tracking-tight text-neutral-900 dark:text-white hover:opacity-85 transition-opacity"
          >
            ClearCut
          </button>
          <span className="hidden sm:inline text-xs font-medium text-neutral-500 dark:text-neutral-400">
            · Node.js AI
          </span>
        </div>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <a
            href="#workspace"
            className="whitespace-nowrap hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Studio
          </a>
          <a
            href="#presets"
            className="whitespace-nowrap hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Preset Samples
          </a>
          <a
            href="#how-it-works"
            className="whitespace-nowrap hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            How it Works
          </a>
          <a
            href="#privacy"
            className="whitespace-nowrap hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            ONNX Engine
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasActiveImage ? (
            <button
              onClick={onResetClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="h-3.5 w-3.5" />
              New Image
            </button>
          ) : (
            <button
              onClick={onUploadClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="h-3.5 w-3.5" />
              Select Image
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
