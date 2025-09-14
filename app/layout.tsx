import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/shell/Header';
import Footer from '@/components/shell/Footer';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'NextYou',
  description: 'Ton futur, version toi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--ny-bg)] text-[var(--ny-foreground)] antialiased">
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
