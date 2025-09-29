// components/marketing/HideAppHeaderOnHome.tsx
'use client';

import { useEffect } from 'react';

export default function HideAppHeaderOnHome() {
  useEffect(() => {
    const hide = () => {
      const el = document.getElementById('app-shell-header');
      if (el) el.style.display = 'none';
    };

    // 1) Cache au montage
    hide();

    // 2) Surveille le DOM (si un header apparaît plus tard → on le recache)
    const mo = new MutationObserver(hide);
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // 3) Nettoyage
    return () => mo.disconnect();
  }, []);

  return null;
}
