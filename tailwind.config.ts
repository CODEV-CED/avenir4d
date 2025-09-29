import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // ✅ fix here
  theme: {
    extend: {
      boxShadow: { soft: '0 6px 20px rgba(0,0,0,0.08)' },
      colors: {
        background: '#0B0B15',
        primary: '#8b5cf6',
        secondary: '#38bdf8',
        muted: '#1E1E2A',
      },
      fontFamily: {
        sans: ["'Satoshi Variable'", 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.015em',
        tighter: '-0.03em',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
