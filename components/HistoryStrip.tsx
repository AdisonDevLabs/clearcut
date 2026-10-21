'use client';

import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';
import { ProcessImageResult } from '@/lib/background-removal';

export interface HistoryItem {
  id: string;
  filename: string;
  originalUrl: string;
  result: ProcessImageResult;
  timestamp: number;
}

interface HistoryStripProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  activeId?: string;
}

export function HistoryStrip({ items, onSelect, onClear, activeId }: HistoryStripProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-neutral-500" />
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">
            Session History ({items.length})
          </h4>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`shrink-0 flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                isActive
                  ? 'border-neutral-900 bg-neutral-100/80 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/40 dark:hover:bg-neutral-800'
              }`}
            >
              <div
                className="h-12 w-12 rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-700"
                style={{
                  backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%)`,
                  backgroundSize: '12px 12px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.result.outputUrl}
                  alt={item.filename}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="max-w-[130px] space-y-0.5">
                <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                  {item.filename}
                </p>
                <p className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                  {item.result.width}×{item.result.height} · {(item.result.durationMs / 1000).toFixed(1)}s
                </p>
              </div>

              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
