// app/layout.tsx
import './globals.css';
import '../styles/print.css';
import Providers from './providers';
import { PaywallModal } from '@/components/paywall/PaywallModal';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Récupère le nonce pour CSP
  const headersList = await headers();
  const nonce = headersList.get('x-csp-nonce') || undefined;

  return (
    <html lang="fr">
      <body>
        {/* Boot inline avec nonce */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: 'window.__BOOT__ = true;',
          }}
        />

        {/* Segment analytics (optionnel) */}
        {process.env.NEXT_PUBLIC_ENABLE_SEGMENT === 'true' && (
          <Script
            id="segment"
            nonce={nonce}
            src="https://cdn.segment.com/analytics.js/v1/XXXX/analytics.min.js"
            strategy="afterInteractive"
          />
        )}

        {/* Providers wrapper (Supabase, etc.) */}
        <Providers>{children}</Providers>

        {/* ✅ MODAL PAYWALL GLOBALE - en dehors du Providers */}
        <PaywallModal />
      </body>
    </html>
  );
}
