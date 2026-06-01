'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.info('[PWA] Service worker registered:', registration.scope);
      })
      .catch((error: unknown) => {
        console.warn('[PWA] Service worker registration failed:', error);
      });
  }, []);

  return null;
}
