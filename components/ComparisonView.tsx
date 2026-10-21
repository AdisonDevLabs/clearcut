'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Columns2,
  Layers,
  Sparkles,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { ProcessImageResult, formatBytes } from '@/lib/background-removal';

interface ComparisonViewProps {
  originalUrl: string;
  originalFilename: string;
  result: ProcessImageResult;
  onReset: () => void;
}

type ViewMode = 'slider' | 'side-by-side' | 'toggle';
type CheckerTheme = 'light' | 'dark';

interface BackdropOption {
  id: string;
  label: string;
  type: 'transparent' | 'color' | 'gradient' | 'blur';
  value: string;
}

const BACKDROPS: BackdropOption[] = [
  { id: 'trans', label: 'Transparent', type: 'transparent', value: 'transparent' },
  { id: 'white', label: 'Pure White (E-comm)', type: 'color', value: '#ffffff' },
  { id: 'studio-black', label: 'Studio Dark', type: 'color', value: '#0f172a' },
  { id: 'slate', label: 'Neutral Slate', type: 'color', value: '#64748b' },
  { id: 'warm', label: 'Warm Cream', type: 'color', value: '#fef3c7' },
  { id: 'sky', label: 'Soft Sky', type: 'color', value: '#e0f2fe' },
  { id: 'rose', label: 'Soft Rose', type: 'color', value: '#ffe4e6' },
  { id: 'green', label: 'Chroma Green', type: 'color', value: '#22c55e' },
  {
    id: 'gradient-studio',
    label: 'Studio Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
  },
  {
    id: 'gradient-sunset',
    label: 'Sunset Glow',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ffedd5 0%, #fecdd3 100%)',
  },
  {
    id: 'gradient-dusk',
    label: 'Cyber Dusk',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  },
  { id: 'blur-bg', label: 'Blurred Original', type: 'blur', value: 'blur' },
];

export function ComparisonView({
  originalUrl,
  originalFilename,
  result,
  onReset,
}: ComparisonViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [checkerTheme, setCheckerTheme] = useState<CheckerTheme>('light');
  const [selectedBackdrop, setSelectedBackdrop] = useState<BackdropOption>(BACKDROPS[0]);
  const [toggleState, setToggleState] = useState<'after' | 'before'>('after');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sliderBarRef = useRef<HTMLDivElement>(null);

  // Checkered pattern CSS
  const lightCheckerStyle = {
    backgroundColor: '#ffffff',
    backgroundImage: `
      linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
      linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
    `,
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
  };

  const darkCheckerStyle = {
    backgroundColor: '#090d16',
    backgroundImage: `
      linear-gradient(45deg, #1e293b 25%, transparent 25%),
      linear-gradient(-45deg, #1e293b 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #1e293b 75%),
      linear-gradient(-45deg, transparent 75%, #1e293b 75%)
    `,
    backgroundSize: '24px 24px',
    backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
  };

  const activeCheckerStyle = checkerTheme === 'light' ? lightCheckerStyle : darkCheckerStyle;

  // Slider dragging logic
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingSlider) return;
      handleMove(e.touches[0].clientX);
    },
    [isDraggingSlider, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingSlider) return;
      handleMove(e.clientX);
    },
    [isDraggingSlider, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingSlider(false);
  }, []);

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSlider, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Copy PNG to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [result.outputBlob.type]: result.outputBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Directly download the original pure transparent PNG result without altering anything
  const handleDownloadTransparentPng = () => {
    try {
      const url = URL.createObjectURL(result.outputBlob);
      const link = document.createElement('a');
      link.href = url;
      const base = originalFilename.replace(/\.[^/.]+$/, '') || 'image';
      link.download = `${base}-transparent.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Download transparent PNG failed', err);
    }
  };

  // Download logic (handles transparent PNG, or renders backdrop onto canvas)
  const handleDownload = async (format: 'png' | 'webp' = 'png') => {
    setIsExporting(true);
    try {
      // If transparent backdrop and PNG, download directly
      if (selectedBackdrop.type === 'transparent' && format === 'png') {
        handleDownloadTransparentPng();
        setIsExporting(false);
        return;
      }

      // If custom backdrop is chosen, composite onto full-res canvas
      const canvas = document.createElement('canvas');
      canvas.width = result.width;
      canvas.height = result.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // Draw backdrop
      if (selectedBackdrop.type === 'color') {
        ctx.fillStyle = selectedBackdrop.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBackdrop.type === 'gradient') {
        // Simple linear gradient approximation
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (selectedBackdrop.id === 'gradient-studio') {
          grad.addColorStop(0, '#f8fafc');
          grad.addColorStop(1, '#cbd5e1');
        } else if (selectedBackdrop.id === 'gradient-sunset') {
          grad.addColorStop(0, '#ffedd5');
          grad.addColorStop(1, '#fecdd3');
        } else {
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(1, '#312e81');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBackdrop.type === 'blur') {
        // Draw blurred original
        const origImg = new Image();
        origImg.src = originalUrl;
        await new Promise((res) => (origImg.onload = res));
        ctx.filter = 'blur(16px)';
        ctx.drawImage(origImg, -20, -20, canvas.width + 40, canvas.height + 40);
        ctx.filter = 'none';
      }

      // Draw cutout on top
      const cutImg = new Image();
      cutImg.src = result.outputUrl;
      await new Promise((res) => (cutImg.onload = res));
      ctx.drawImage(cutImg, 0, 0, canvas.width, canvas.height);

      const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
      const base = originalFilename.replace(/\.[^/.]+$/, '');
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mimeType, 0.95));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${base}-clearcut.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download composition failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const reductionPercent =
    result.originalSize > 0
      ? Math.round(((result.originalSize - result.outputSize) / result.originalSize) * 100)
      : null;

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-neutral-950 p-6 overflow-y-auto max-w-none' : ''}`}>
      {/* Top Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
        {/* Left: View Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setViewMode('slider')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'slider'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Split Wipe
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'side-by-side'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('toggle')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'toggle'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            A/B Toggle
          </button>
        </div>

        {/* Center: Checker Theme & Zoom */}
        <div className="flex items-center gap-3">
          {/* Checker Pattern Toggle */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">Grid:</span>
            <button
              onClick={() => setCheckerTheme('light')}
              title="Light Checkered Pattern"
              className={`h-6 w-6 rounded border transition-all ${
                checkerTheme === 'light'
                  ? 'ring-2 ring-neutral-900 dark:ring-white border-transparent'
                  : 'border-neutral-300 dark:border-neutral-700'
              }`}
              style={lightCheckerStyle}
            />
            <button
              onClick={() => setCheckerTheme('dark')}
              title="Dark Checkered Pattern"
              className={`h-6 w-6 rounded border transition-all ${
                checkerTheme === 'dark'
                  ? 'ring-2 ring-neutral-900 dark:ring-white border-transparent'
                  : 'border-neutral-300 dark:border-neutral-700'
              }`}
              style={darkCheckerStyle}
            />
          </div>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              disabled={zoomLevel <= 0.5}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-600 dark:text-neutral-400"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-xs tabular-nums w-12 text-center text-neutral-700 dark:text-neutral-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              disabled={zoomLevel >= 2.5}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-600 dark:text-neutral-400"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-1.5 py-0.5 rounded"
              >
                Reset
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Right: Reset & New Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Image
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative rounded-2xl border border-neutral-200 bg-neutral-100/50 p-2 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden">
        {/* Mode 1: Split Slider Wipe */}
        {viewMode === 'slider' && (
          <div
            ref={containerRef}
            onMouseDown={(e) => {
              setIsDraggingSlider(true);
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDraggingSlider(true);
              handleMove(e.touches[0].clientX);
            }}
            className="relative w-full aspect-[4/3] max-h-[640px] rounded-xl overflow-hidden cursor-ew-resize select-none mx-auto"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isDraggingSlider ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Background Layer: Cutout with Checkered / Chosen backdrop */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center"
              style={
                selectedBackdrop.type === 'transparent'
                  ? activeCheckerStyle
                  : selectedBackdrop.type === 'color'
                  ? { backgroundColor: selectedBackdrop.value }
                  : selectedBackdrop.type === 'gradient'
                  ? { background: selectedBackdrop.value }
                  : undefined
              }
            >
              {selectedBackdrop.type === 'blur' && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105"
                  style={{ backgroundImage: `url(${originalUrl})` }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.outputUrl}
                alt="Removed Background"
                className="relative max-h-full max-w-full object-contain pointer-events-none drop-shadow-sm"
              />
              <span className="absolute bottom-3 right-3 text-[11px] font-semibold bg-neutral-900/80 text-white px-2.5 py-1 rounded backdrop-blur-xs">
                Removed Background
              </span>
            </div>

            {/* Foreground Clipped Layer: Original Image using clipPath */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
              <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-neutral-900/80 text-white px-2.5 py-1 rounded backdrop-blur-xs">
                Original
              </span>
            </div>

            {/* Divider Line with Draggable Handle */}
            <div
              ref={sliderBarRef}
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg text-neutral-900 border border-neutral-200">
                <Sliders className="h-4 w-4 rotate-90" />
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Side by Side (2-Column) */}
        {viewMode === 'side-by-side' && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Original Card */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden relative aspect-[4/3] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original Image"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 left-3 text-[11px] font-semibold bg-neutral-900/80 text-white px-2.5 py-1 rounded backdrop-blur-xs">
                Original
              </span>
            </div>

            {/* Result Card with Checkered Background */}
            <div
              className="rounded-xl border border-neutral-200 overflow-hidden relative aspect-[4/3] flex items-center justify-center dark:border-neutral-800"
              style={
                selectedBackdrop.type === 'transparent'
                  ? activeCheckerStyle
                  : selectedBackdrop.type === 'color'
                  ? { backgroundColor: selectedBackdrop.value }
                  : selectedBackdrop.type === 'gradient'
                  ? { background: selectedBackdrop.value }
                  : undefined
              }
            >
              {selectedBackdrop.type === 'blur' && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105"
                  style={{ backgroundImage: `url(${originalUrl})` }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.outputUrl}
                alt="Removed Background"
                className="relative max-h-full max-w-full object-contain drop-shadow-sm"
              />
              <span className="absolute top-3 left-3 text-[11px] font-semibold bg-neutral-900/80 text-white px-2.5 py-1 rounded backdrop-blur-xs">
                Background Removed
              </span>
            </div>
          </div>
        )}

        {/* Mode 3: A/B Instant Toggle */}
        {viewMode === 'toggle' && (
          <div className="space-y-3">
            <div
              className="relative w-full aspect-[4/3] max-h-[640px] rounded-xl overflow-hidden mx-auto flex items-center justify-center"
              style={
                toggleState === 'after'
                  ? selectedBackdrop.type === 'transparent'
                    ? activeCheckerStyle
                    : selectedBackdrop.type === 'color'
                    ? { backgroundColor: selectedBackdrop.value }
                    : selectedBackdrop.type === 'gradient'
                    ? { background: selectedBackdrop.value }
                    : undefined
                  : { backgroundColor: '#0f172a' }
              }
            >
              {toggleState === 'after' && selectedBackdrop.type === 'blur' && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105"
                  style={{ backgroundImage: `url(${originalUrl})` }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={toggleState === 'after' ? result.outputUrl : originalUrl}
                alt={toggleState === 'after' ? 'Removed Background' : 'Original'}
                className="relative max-h-full max-w-full object-contain"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
              />
              <span className="absolute bottom-3 left-3 text-xs font-semibold bg-neutral-900/80 text-white px-3 py-1.5 rounded backdrop-blur-xs">
                Currently Viewing: {toggleState === 'after' ? 'Background Removed' : 'Original Image'}
              </span>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
                <button
                  onClick={() => setToggleState('after')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    toggleState === 'after'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Background Removed
                </button>
                <button
                  onClick={() => setToggleState('before')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    toggleState === 'before'
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Original Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop Studio & Replacement Selector */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white">
            <Palette className="h-4 w-4" />
            <span>Backdrop Studio & Preview Colors</span>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Selected: <span className="font-medium text-neutral-800 dark:text-neutral-200">{selectedBackdrop.label}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {BACKDROPS.map((b) => {
            const isSelected = selectedBackdrop.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBackdrop(b)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                {b.type === 'transparent' ? (
                  <div className="h-4 w-4 rounded-full border border-neutral-300 shrink-0" style={lightCheckerStyle} />
                ) : b.type === 'color' ? (
                  <div className="h-4 w-4 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: b.value }} />
                ) : b.type === 'gradient' ? (
                  <div className="h-4 w-4 rounded-full border border-neutral-300 shrink-0" style={{ background: b.value }} />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-neutral-300 shrink-0 bg-neutral-400" />
                )}
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export & Actions Deck */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
        {/* Unboxed Metadata per Constitution */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-mono tabular-nums">{result.width} × {result.height} px</span>
          <span aria-hidden="true">·</span>
          <span>Original: <span className="font-mono tabular-nums">{formatBytes(result.originalSize)}</span></span>
          <span aria-hidden="true">·</span>
          <span>PNG: <span className="font-mono tabular-nums">{formatBytes(result.outputSize)}</span></span>
          {reductionPercent !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono tabular-nums">
                {reductionPercent > 0 ? `-${reductionPercent}%` : `+${Math.abs(reductionPercent)}%`}
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>Processed in <span className="font-mono tabular-nums">{(result.durationMs / 1000).toFixed(1)}s</span></span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyToClipboard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy PNG'}
          </button>

          <button
            onClick={() => handleDownload('webp')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Download WebP
          </button>

          {selectedBackdrop.type !== 'transparent' && (
            <button
              onClick={() => handleDownload('png')}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Download with {selectedBackdrop.label}
            </button>
          )}

          <button
            onClick={handleDownloadTransparentPng}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Download Transparent PNG
          </button>
        </div>
      </div>
    </div>
  );
}
