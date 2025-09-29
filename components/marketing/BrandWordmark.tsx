'use client';
import Link from 'next/link';

type Props = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'row' (par défaut), 'column' (empilé), 'responsive' (col → md:row) */
  stack?: 'row' | 'column' | 'responsive';
  align?: 'start' | 'center' | 'end';
};

export default function BrandWordmark({
  className = '',
  size = 'md',
  stack = 'row',
  align = 'start',
}: Props) {
  const s =
    size === 'lg'
      ? { title: 'text-[24px] md:text-[28px]', slogan: 'text-[13px] md:text-[15px]' }
      : size === 'sm'
        ? { title: 'text-[16px] md:text-[18px]', slogan: 'text-[11px] md:text-[12px]' }
        : { title: 'text-[20px] md:text-[22px]', slogan: 'text-[12px] md:text-[14px]' };

  const dir =
    stack === 'column'
      ? 'flex-col gap-0'
      : stack === 'responsive'
        ? 'flex-col md:flex-row gap-0 md:gap-2'
        : 'flex-row gap-2';

  const alignCls =
    align === 'center'
      ? 'items-center'
      : align === 'end'
        ? 'items-end'
        : 'items-start md:items-baseline';

  const slashVisible = stack === 'row' || stack === 'responsive';

  return (
    <Link
      href="/"
      aria-label="NextYou — Ton futur, version toi"
      className={`flex ${dir} ${alignCls} ${className}`}
    >
      <div
        className={`flex ${stack !== 'row' ? 'flex-col gap-8 md:gap-10' : 'items-center gap-6'} items-start`}
      >
        <span className={`${s.title} leading-none font-extrabold tracking-tight text-white`}>
          NextYou&gt;
        </span>

        {slashVisible ? (
          <span className="mx-1 text-white/40 md:inline" aria-hidden="true">
            /
          </span>
        ) : null}

        <span className={`${s.slogan} leading-none text-white/75`}>Ton futur, version toi</span>
      </div>
    </Link>
  );
}
