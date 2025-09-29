'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-white/10"
      aria-label="Basculer le thème"
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      <span>{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
