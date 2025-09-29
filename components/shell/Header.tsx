'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header(props: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  useEffect(() => {
    // Debug : voir si ça se monte sur la home et à quel moment
    // @ts-ignore
    console.log('[Header] mounted on', window.location.pathname, new Date().toISOString());
  }, []);

  return (
    <header
      {...props}
      className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        {pathname !== '/' && (
          <Link href="/" className="text-sm font-semibold text-white/90">
            NextYou&gt;
          </Link>
        )}
        <nav className="ml-auto flex items-center gap-4 text-sm text-white/80">
          <Link href="/">Accueil</Link>
          <Link href="/sjt">Questionnaire</Link>
          <Link href="/formations">Formations</Link>
          <Link href="/voeux">Mes vœux</Link>
        </nav>
      </div>
    </header>
  );
}
