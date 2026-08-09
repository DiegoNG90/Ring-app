'use client';

import { ChevronDown, Smartphone, SunMedium } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { SegmentType } from '../../interfaces';

const SCREEN_ON_TOOLTIP =
  'Mantiene la pantalla encendida mientras corre el timer';
const POCKET_MODE_TOOLTIP =
  'Modo bolsillo: la pantalla puede apagarse sola durante el round';
const LONG_PRESS_MS = 500;

interface SegmentControlsProps {
  type: SegmentType;
  hasStarted: boolean;
  cardKey: number;
  isRunning: boolean;
  isPaused: boolean;
  preferredKeepScreenOn?: boolean;
  screenLockActive?: boolean;
  onPause: () => void;
  onStartOrResume: (keepScreenOn: boolean) => void;
  onReset: () => void;
}

function actionClass(type: SegmentType, variant: 'start' | 'pause' | 'resume') {
  if (variant === 'pause') {
    return 'bg-red-600 hover:bg-red-500 text-white';
  }

  return type === 'round'
    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
    : 'bg-orange-600 hover:bg-orange-500 text-white';
}

export default function SegmentControls({
  type,
  hasStarted,
  cardKey,
  isPaused,
  preferredKeepScreenOn = true,
  screenLockActive = false,
  onPause,
  onStartOrResume,
  onReset,
}: SegmentControlsProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const isInitialStart = !hasStarted && cardKey === 0;
  const showSplitStart = isInitialStart || isPaused;
  const primaryLabel = isInitialStart ? 'Empezar' : 'Reanudar';
  const primaryTooltip = preferredKeepScreenOn
    ? SCREEN_ON_TOOLTIP
    : POCKET_MODE_TOOLTIP;
  const alternateKeepScreenOn = !preferredKeepScreenOn;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const hideTooltip = useCallback(() => {
    clearLongPressTimer();
    setTooltipVisible(false);
  }, [clearLongPressTimer]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => hideTooltip, [hideTooltip]);

  const handlePrimaryStart = () => {
    hideTooltip();
    closeMenu();
    onStartOrResume(preferredKeepScreenOn);
  };

  const handleAlternateStart = () => {
    hideTooltip();
    closeMenu();
    onStartOrResume(alternateKeepScreenOn);
  };

  const handlePrimaryTouchStart = () => {
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      setTooltipVisible(true);
    }, LONG_PRESS_MS);
  };

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      {screenLockActive ? (
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300"
          aria-live="polite"
        >
          <SunMedium className="size-3.5 shrink-0" aria-hidden />
          Pantalla activa
        </div>
      ) : null}

      <div className="flex justify-center gap-3">
        {showSplitStart ? (
          <div ref={containerRef} className="relative inline-flex">
            <button
              type="button"
              title={primaryTooltip}
              onClick={handlePrimaryStart}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={hideTooltip}
              onFocus={() => setTooltipVisible(true)}
              onBlur={hideTooltip}
              onTouchStart={handlePrimaryTouchStart}
              onTouchEnd={hideTooltip}
              onTouchCancel={hideTooltip}
              className={`px-5 py-2 rounded-l-full text-sm font-medium transition-colors border-r border-black/20 ${actionClass(type, isInitialStart ? 'start' : 'resume')}`}
            >
              {primaryLabel}
            </button>

            {tooltipVisible ? (
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-0 z-30 w-56 rounded-lg border border-zinc-600/80 bg-zinc-900 px-3 py-2 text-left text-xs leading-snug text-zinc-200 shadow-xl"
              >
                {primaryTooltip}
              </div>
            ) : null}

            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={`Más opciones para ${primaryLabel.toLowerCase()}`}
              onClick={() => setMenuOpen((open) => !open)}
              className={`px-2.5 py-2 rounded-r-full text-sm font-medium transition-colors ${actionClass(type, isInitialStart ? 'start' : 'resume')}`}
            >
              <ChevronDown
                className={`size-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>

            {menuOpen ? (
              <div
                id={menuId}
                role="menu"
                className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-64 rounded-xl border border-zinc-600/80 bg-zinc-900 p-1.5 text-left shadow-xl"
              >
                {preferredKeepScreenOn ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleAlternateStart}
                    className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                  >
                    <Smartphone
                      className="mt-0.5 size-4 shrink-0 text-zinc-400"
                      aria-hidden
                    />
                    <span>
                      <span className="block text-sm font-medium text-zinc-100">
                        Modo bolsillo
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-zinc-400">
                        {isInitialStart ? 'Empezar' : 'Reanudar'} sin mantener la
                        pantalla encendida. Útil si tenés el teléfono en el
                        bolsillo.
                      </span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleAlternateStart}
                    className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                  >
                    <SunMedium
                      className="mt-0.5 size-4 shrink-0 text-zinc-400"
                      aria-hidden
                    />
                    <span>
                      <span className="block text-sm font-medium text-zinc-100">
                        Mantener pantalla encendida
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-zinc-400">
                        {isInitialStart ? 'Empezar' : 'Reanudar'} evitando que
                        el dispositivo apague la pantalla durante el round.
                      </span>
                    </span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={onPause}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${actionClass(type, 'pause')}`}
          >
            Pausar
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
