/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12362B',
          light: '#1B4A3A',
          dark: '#0B2119',
        },
        paper: '#F6F4EE',
        card: '#FFFFFF',
        gold: {
          DEFAULT: '#C9A15A',
          light: '#DCC08B',
          dark: '#A9813F',
        },
        growth: '#3E8367',
        rust: '#9A4530',
        line: '#E3DFD2',
        ink2: '#55645C',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 54, 43, 0.06), 0 1px 12px rgba(18, 54, 43, 0.04)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
