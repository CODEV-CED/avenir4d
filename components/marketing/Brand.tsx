'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const LOGO_URL = '/brand/nextyou-logo.png';

export default function Brand({ link = true }: { link?: boolean }) {
  const [hasLogo, setHasLogo] = useState(true);

  const content = hasLogo ? (
    <Image
      src={LOGO_URL}
      alt="NextYou"
      width={96}
      height={96}
      priority
      onError={() => setHasLogo(false)}
      className="h-20 w-20 object-contain"
    />
  ) : (
    <div className="grid h-14 w-14 place-items-center rounded bg-white/90 text-sm font-bold text-slate-900">
      N
    </div>
  );

  if (!link) return <div className="flex items-center gap-3">{content}</div>;

  return (
    <Link href="/" className="flex items-center gap-3">
      {content}
    </Link>
  );
}
