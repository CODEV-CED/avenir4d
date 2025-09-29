'use client';
import { useEffect, useState } from 'react';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // hauteur clavier estimée = innerHeight - viewport visible
      const h = Math.max(0, window.innerHeight - vv.height);
      setKeyboardHeight(h);
    };

    vv.addEventListener('resize', handleResize);
    handleResize();
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  return keyboardHeight;
};
