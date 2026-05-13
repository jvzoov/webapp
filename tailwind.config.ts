import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#FF6B00',
          light: '#FF8C3A',
          dark: '#CC5500',
          foreground: '#ffffff',
        },
        ink: {
          DEFAULT: '#1A1612',
          2: '#a08060',
          3: '#5a4030',
        },
        surface: {
          DEFAULT: '#F7F4EE',
          dark: '#1f180e',
          darker: '#141008',
        },
        border: {
          DEFAULT: '#D4CFC6',
          dark: '#362a16',
        },
        success: '#1A7A4A',
        warning: '#E8A000',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem', // 10px
        md: 'calc(0.625rem - 2px)',
        sm: 'calc(0.625rem - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
