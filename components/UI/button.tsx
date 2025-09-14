import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const base =
  'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600/40',
  outline:
    'border border-white/15 text-white/85 hover:bg-white/10 focus:ring-white/30 backdrop-blur-sm',
  ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-gray-300',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  const cls = [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
  return <button className={cls} {...props} />;
}

export default Button;
