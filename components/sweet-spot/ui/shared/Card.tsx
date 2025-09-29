// components/sweet-spot/ui/shared/Card.tsx

import React, { forwardRef, ReactNode } from 'react';
import { UI_CLASSES } from '@sweet-spot/constants';

interface CardProps {
  number?: number;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ number, title, children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`${UI_CLASSES.CARD} ${className}`}>
        {(number || title) && (
          <div className="mb-5 flex items-center gap-4">
            {number && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                {number}
              </span>
            )}
            {title && <h2 className={UI_CLASSES.TITLE}>{title}</h2>}
          </div>
        )}
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
