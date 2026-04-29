import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: '#D4537E',
        'hot-pink': '#ED93B1',
        'deep-pink': '#993556',
        blush: '#FBEAF0',
        cream: '#FFF8F2',
        wine: '#4B1528',
        mauve: '#8A6070',
        gold: '#D4A853',
        'gold-light': '#F5E6C8',
        lavender: '#E0D0F0',
        mint: '#C8EDDA',
        peach: '#FFD8B8',
        sky: '#C8DFF5',
        paper: '#FFF5EB',
      },
      fontFamily: {
        serif: ['var(--font-instrument-serif)', 'serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-space-grotesk)', 'sans-serif'],
        scrawl: ['var(--font-caveat)', 'cursive'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        bob: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'float-petal': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-10px) rotate(6deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(8px)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'marquee-fast': 'marquee 20s linear infinite',
        'fade-up': 'fade-up 0.8s ease-out both',
        bob: 'bob 6s ease-in-out infinite',
        'bob-slow': 'bob 8s ease-in-out infinite 2s',
        'float-petal': 'float-petal 5s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
