'use client';

import { Download, Share, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari =
    /safari/.test(ua) && !/crios|fxios|edgios|chrome|chromium/.test(ua);

  return isIos && isSafari;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowIosHint(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (isStandalone || deferredPrompt) {
      return;
    }

    if (isIosSafari() && !sessionStorage.getItem('pwa-ios-hint-dismissed')) {
      setShowIosHint(true);
    }
  }, [deferredPrompt, isStandalone]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  const dismissIosHint = () => {
    sessionStorage.setItem('pwa-ios-hint-dismissed', '1');
    setShowIosHint(false);
  };

  if (isStandalone) {
    return null;
  }

  if (deferredPrompt) {
    return (
      <div
        role="region"
        aria-label="Instalar aplicación"
        className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium">Instalar Ring Training</p>
          <p className="text-xs text-muted-foreground">
            Acceso rápido desde la pantalla de inicio.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleInstall}
          disabled={isInstalling}
          className="shrink-0"
        >
          <Download aria-hidden="true" />
          {isInstalling ? 'Instalando…' : 'Instalar'}
        </Button>
      </div>
    );
  }

  if (!showIosHint) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Agregar a pantalla de inicio"
      className="fixed inset-x-4 bottom-4 z-50 rounded-lg border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Agregar a pantalla de inicio</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tocá <Share className="inline size-3.5 align-text-bottom" /> Compartir
            y elegí &quot;Agregar a pantalla de inicio&quot;.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Cerrar"
          onClick={dismissIosHint}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
