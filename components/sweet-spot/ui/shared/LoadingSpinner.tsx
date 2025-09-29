// components/sweet-spot/ui/shared/LoadingSpinner.tsx

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/30 border-t-white/60`}
      />
      {message && <p className="mt-3 text-sm text-white/60">{message}</p>}
    </div>
  );
};

export const CanvasLoader: React.FC = () => (
  <div className="flex h-96 items-center justify-center">
    <LoadingSpinner size="md" message="Chargement du canvas..." />
  </div>
);

export const ConvergencesLoader: React.FC = () => (
  <div className="flex h-64 items-center justify-center">
    <LoadingSpinner size="md" message="Analyse des convergences..." />
  </div>
);
