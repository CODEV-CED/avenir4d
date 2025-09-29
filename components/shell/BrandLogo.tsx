'use client';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<BrandLogoSize, { w: number; h: number; className: string }> = {
  sm: { w: 48, h: 48, className: 'h-12 w-12' },
  md: { w: 64, h: 64, className: 'h-16 w-16' },
  lg: { w: 96, h: 96, className: 'h-24 w-24' },
  xl: { w: 128, h: 128, className: 'h-28 w-28' },
};

const LOGO_URL = '/brand/nextyou-logo.png';

export default function BrandLogo({ size = 'sm' as BrandLogoSize }) {
  const pathname = usePathname();
  const { w, h, className } = sizeMap[size];
  const [showFallback, setShowFallback] = useState(false);

  // If we're on the marketing home, prefer the marketing lockup visual
  // (BrandLockup) to avoid duplicate logo images. Render the text
  // fallback on `/` so only the marketing navbar shows the image.
  if (pathname === '/') {
    return (
      <span className="text-xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-[var(--ny-fuchsia)] via-[var(--ny-indigo)] to-[var(--ny-cyan)] bg-clip-text text-transparent">
          NextYou&gt;
        </span>
      </span>
    );
  }

  if (showFallback) {
    return (
      <span className="text-xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-[var(--ny-fuchsia)] via-[var(--ny-indigo)] to-[var(--ny-cyan)] bg-clip-text text-transparent">
          NextYou&gt;
        </span>
      </span>
    );
  }

  return (
    <Image
      src={LOGO_URL}
      alt="NextYou"
      width={w}
      height={h}
      priority
      className={`${className} object-contain`}
      onError={() => setShowFallback(true)}
    />
  );
}
