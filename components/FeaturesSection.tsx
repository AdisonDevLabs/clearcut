'use client';

import React from 'react';
import { Cpu, Zap, CheckCircle2, Layers, Server } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="how-it-works" className="w-full max-w-5xl mx-auto space-y-16 pt-12 pb-16">
      {/* Editorial Chapter Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span>Backend Architecture</span>
          <span aria-hidden="true">·</span>
          <span>@imgly/background-removal-node</span>
          <span aria-hidden="true">·</span>
          <span>ONNX Runtime & Sharp</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50" style={{ textWrap: 'balance' }}>
          How Node.js background separation works
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          ClearCut utilizes @imgly/background-removal-node combined with native Sharp image buffers and ONNX Runtime to perform high-precision subject segmentation.
        </p>
      </div>

      {/* 3 Step Mechanism-to-Outcome Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-xs font-semibold">
            01
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Native Sharp Pipeline
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Uploaded images are decoded via high-performance libvips/sharp buffers directly in memory, ensuring fast pre-processing and zero quality degradation.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-xs font-semibold">
            02
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            ONNX Runtime Neural Inference
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            @imgly/background-removal-node runs the deep learning model through onnxruntime-node, producing high-resolution saliency probability maps.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-xs font-semibold">
            03
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Real-Time SSE Streaming
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Server-Sent Events continuously stream download bytes and neural step progress directly into the browser progress tracker with low latency.
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          Why native Node.js background removal excels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2 border-r border-neutral-200/80 pr-4 dark:border-neutral-800/80">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
              ClearCut Node.js Architecture
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Self-hosted with zero external SaaS dependencies</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>No API keys or credit card requirements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Multi-threaded native CPU/GPU execution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Full resolution alpha matte preservation</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pl-0 sm:pl-4">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
              External SaaS Removers
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-500 dark:text-neutral-500">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                <span>Requires paid API subscriptions ($0.20/image)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                <span>Aggressive monthly rate limits and throttling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                <span>Data stored on foreign commercial servers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                <span>Vendor lock-in and unexpected API outages</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
