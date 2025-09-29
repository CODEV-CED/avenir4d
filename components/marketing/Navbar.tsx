'use client';
import Link from 'next/link';
import BrandLockup from './BrandLockup';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLockup
          layout="column" // ⬅️ empile logo + texte
          align="start" // 'center' si tu préfères centré
          minSize={64}
          maxSize={120}
          showTitle
          showSlogan
          className="shrink-0"
        />

        <nav className="ml-6 flex items-center gap-6 text-sm text-white/80">
          <Link href="/sweet-spot/lab" className="hover:text-white">
            Produit
          </Link>
          <a href="#features" className="hover:text-white">
            Fonctionnalités
          </a>
          <a href="#prix" className="hover:text-white">
            Prix
          </a>
          <Link
            href="/dev-login"
            className="rounded-lg border border-white/20 px-3 py-1.5 hover:border-white/40"
          >
            Se connecter
          </Link>
        </nav>
      </div>
    </header>
  );
}
