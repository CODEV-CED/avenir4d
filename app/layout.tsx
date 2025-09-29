import './globals.css';
import Providers from './providers';
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'NextYou — Ton futur, version toi',
  description: "Ikigaï + IA pour révéler ton Sweet Spot et passer à l'action.",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#000000' }],
};

// On ajoute 'async' ici
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Récupère le nonce posé par le middleware de manière sûre pour l'hydratation
  const headersList = await headers(); // Et on utilise 'await' ici
  const nonce = headersList.get('x-csp-nonce') || undefined;

  return (
    <html lang="fr">
      <body>
        {/* Boot inline avec nonce → nécessaire pour CSP 'strict-dynamic' */}
        <Script id="boot" nonce={nonce} strategy="beforeInteractive">{`
          window.__BOOT__ = true;
        `}</Script>

        {/* Optionnel : Segment uniquement si activé via .env */}
        {process.env.NEXT_PUBLIC_ENABLE_SEGMENT === 'true' && (
          <Script
            id="segment"
            nonce={nonce}
            src="https://cdn.segment.com/analytics.js/v1/XXXX/analytics.min.js"
            strategy="afterInteractive"
          />
        )}

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
