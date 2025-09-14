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
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
