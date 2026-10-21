'use client';

import React from 'react';
import { Loader2, CheckCircle2, Download, Cpu, Sparkles, AlertCircle } from 'lucide-react';
import { RemovalProgress, formatBytes } from '@/lib/background-removal';

interface ProgressTrackerProps {
  progress: RemovalProgress;
  filename: string;
  onCancel?: () => void;
}

export function ProgressTracker({ progress, filename, onCancel }: ProgressTrackerProps) {
  const { stage, label, percent, currentBytes, totalBytes, elapsedSeconds } = progress;

  const steps = [
    {
      id: 'downloading',
      title: 'Download AI Model',
      description: 'ONNX model weights & layers',
      isCompleted: ['initializing', 'inferring', 'compositing', 'complete'].includes(stage),
      isCurrent: stage === 'downloading',
      icon: Download,
    },
    {
      id: 'initializing',
      title: 'Initialize Session',
      description: 'ONNX Runtime & Sharp pipeline',
      isCompleted: ['inferring', 'compositing', 'complete'].includes(stage),
      isCurrent: stage === 'initializing',
      icon: Cpu,
    },
    {
      id: 'inferring',
      title: 'Neural Segmentation',
      description: 'Detect foreground subject contours',
      isCompleted: ['compositing', 'complete'].includes(stage),
      isCurrent: stage === 'inferring',
      icon: Sparkles,
    },
    {
      id: 'compositing',
      title: 'Alpha Matte Refinement',
      description: 'Generate transparent PNG layer',
      isCompleted: stage === 'complete',
      isCurrent: stage === 'compositing',
      icon: CheckCircle2,
    },
  ];

  const hasByteCounts = totalBytes > 0 && currentBytes > 0;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
      {/* Header with filename and timer */}
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-900 dark:bg-white"></span>
            </span>
            <h3 className="font-semibold text-base text-neutral-900 dark:text-white">
              Processing Image with Node.js AI
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-md">
            Target file: <span className="font-mono text-neutral-700 dark:text-neutral-300">{filename}</span>
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
            Elapsed Time
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-white">
            {elapsedSeconds.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Main Live Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-900 dark:text-white" />
            {label}
          </span>
          <span className="font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">
            {percent}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 p-0.5">
          <div
            className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, Math.min(100, percent))}%` }}
          />
        </div>

        {/* Byte statistics if downloading */}
        {hasByteCounts && (
          <div className="flex justify-between text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
            <span>Transfer: {formatBytes(currentBytes)}</span>
            <span>Total: {formatBytes(totalBytes)}</span>
          </div>
        )}
      </div>

      {/* Multi-Step Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                step.isCompleted
                  ? 'border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-800/40 text-neutral-900 dark:text-white'
                  : step.isCurrent
                  ? 'border-neutral-900 bg-neutral-100/50 dark:border-neutral-400 dark:bg-neutral-800/80 text-neutral-900 dark:text-white ring-1 ring-neutral-900/10 dark:ring-white/10'
                  : 'border-neutral-200/60 bg-transparent text-neutral-400 dark:border-neutral-800/50 dark:text-neutral-500 opacity-60'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  step.isCompleted
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : step.isCurrent
                    ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                }`}
              >
                {step.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">
                  {step.title}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative Note for First-Time Users */}
      <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/50 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
        <p className="font-medium text-neutral-900 dark:text-neutral-200 mb-0.5">
          First run note:
        </p>
        The AI neural network model (~40MB) is fetched on first execution. Once warmed up, subsequent image cuts execute rapidly in under two seconds.
      </div>

      {onCancel && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onCancel}
            type="button"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            Cancel processing
          </button>
        </div>
      )}
    </div>
  );
}
