/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        gaming: {
          dark:          '#0d0d1a',
          darker:        '#07070f',
          card:          '#13132a',
          border:        '#1e1e3f',
          accent:        '#7c3aed',
          'accent-light': '#a855f7',
          cyan:          '#06b6d4',
          pink:          '#ec4899',
          green:         '#10b981',
        },
      },
    },
  },
  plugins: [],
};
