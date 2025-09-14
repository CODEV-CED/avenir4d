import * as React from 'react';
import { cn } from '@/lib/utils'; // ou remplace par une simple concat si tu n'as pas ce helper

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800', className)}
      {...props}
    />
  );
}
