// components/sweet-spot/constants/styles.ts

export const UI_CLASSES = {
  CARD: 'rounded-2xl border border-white/10 bg-black/80 p-7',
  SUBTITLE: 'text-white/70',
  TITLE: 'text-2xl font-bold text-white',
  BTN_PRIMARY:
    'px-8 py-3.5 bg-white text-black rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all',
  BTN_SECONDARY:
    'px-8 py-3.5 border border-white/20 text-white rounded-full font-semibold hover:bg-white/5 hover:-translate-y-0.5 transition-all',
} as const;

export const sliderToneStyles = {
  red: {
    badgeBg: 'rgba(255, 0, 80, 0.2)',
    badgeText: '#ff0050',
    gradient: 'linear-gradient(to right, #ff0050, #ff4080)',
  },
  blue: {
    badgeBg: 'rgba(0, 128, 255, 0.2)',
    badgeText: '#0080ff',
    gradient: 'linear-gradient(to right, #0080ff, #40a0ff)',
  },
  green: {
    badgeBg: 'rgba(0, 255, 128, 0.2)',
    badgeText: '#00ff80',
    gradient: 'linear-gradient(to right, #00ff80, #40ffb0)',
  },
  yellow: {
    badgeBg: 'rgba(255, 200, 0, 0.2)',
    badgeText: '#ffc800',
    gradient: 'linear-gradient(to right, #ffc800, #ffd840)',
  },
} as const;

export const RESPONSIVE_SIZES = {
  mobile: {
    canvas: 'w-72 h-72',
    canvasWrapper: 'min-h-[320px]',
    ring: 'w-24 h-24',
    score: 'w-20 h-20',
  },
  desktop: {
    canvas: 'w-96 h-96',
    canvasWrapper: 'min-h-[420px]',
    ring: 'w-36 h-36',
    score: 'w-24 h-24',
  },
} as const;
