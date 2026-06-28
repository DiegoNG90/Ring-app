import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Ring Training',
    short_name: 'Training',
    description: 'Rutinas de boxeo y HIIT con temporizador',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#14b8a6',
    icons: [
      {
        src: '/icons/boxing-glove-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/boxing-glove-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/boxing-glove-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
