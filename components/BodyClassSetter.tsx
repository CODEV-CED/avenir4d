'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function BodyClassSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.body;
    const isMarketing = pathname === '/';
    if (isMarketing) el.classList.add('marketing');
    else el.classList.remove('marketing');
    return () => {
      el.classList.remove('marketing');
    };
  }, [pathname]);

  return null;
}
