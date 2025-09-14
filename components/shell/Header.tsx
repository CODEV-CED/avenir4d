'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/sjt', label: 'Questionnaire' },
  { href: '/formations', label: 'Formations' },
  { href: '/voeux', label: 'Mes vœux' },
];

export default function Header() {
  const pathname = usePathname() ?? '/';
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ny-border)] bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[var(--ny-fuchsia)] via-[var(--ny-indigo)] to-[var(--ny-cyan)] bg-clip-text text-transparent">
              NextYou&gt;
            </span>
          </span>
        </Link>

        <nav>
          <ul className="flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href));
              return (
                <li key={l.href}>
                  <Link href={l.href} className={`ny-nav ${active ? 'is-active' : ''}`}>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
