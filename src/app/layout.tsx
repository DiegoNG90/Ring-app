import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ring Training',
  description: 'Rutinas de boxeo y HIIT con temporizador',
  applicationName: 'Ring Training',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ring Training',
  },
  icons: {
    icon: [
      { url: '/icons/boxing-glove-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/boxing-glove-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/boxing-glove-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#14b8a6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
