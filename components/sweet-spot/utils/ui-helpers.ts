// components/sweet-spot/utils/ui-helpers.ts

import type { FilterMode } from '@sweet-spot/types';

export const createGradient = (
  rgb: readonly [number, number, number] | [number, number, number], // Accepte les deux
  a1: number,
  a2: number,
): string =>
  `radial-gradient(circle at center,
    rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a1}) 20%,
    rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a2}) 60%,
    transparent 100%)`;

export const getResponsiveClass = (
  isMobile: boolean,
  mobileClass: string,
  desktopClass: string,
): string => {
  return isMobile ? mobileClass : desktopClass;
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
};

export const getCirclePosition = (index: number) => {
  const positions = [
    { top: '30px', left: '30px' },
    { top: '30px', right: '30px' },
    { bottom: '30px', left: '30px' },
    { bottom: '30px', right: '30px' },
  ];
  return positions[index] || positions[0];
};

export const getCircleColor = (index: number): [number, number, number] => {
  const colors: [number, number, number][] = [
    [255, 0, 80], // red
    [0, 128, 255], // blue
    [0, 255, 128], // green
    [255, 200, 0], // yellow
  ];
  return colors[index] || colors[0];
};

export const getFilterStyle = (filterMode: FilterMode, isEureka: boolean): string => {
  if (filterMode === 'intersection') {
    return isEureka ? 'saturate(140%) contrast(120%)' : 'saturate(120%) contrast(110%)';
  }
  return isEureka
    ? 'blur(0.3px) saturate(130%) contrast(115%)'
    : 'blur(0.4px) saturate(115%) contrast(108%)';
};
