import type { Config } from 'tailwindcss';

/**
 * Design tokens live in ONE place: the `:root` block of `src/styles/index.css`.
 * Each colour is stored there twice — once as `--x-rgb: R G B` (consumed here so
 * Tailwind's `/opacity` modifiers work) and once as `--x: rgb(R G B)` for hand
 * written CSS. Change the value in index.css and every utility follows.
 */
const rgb = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: rgb('ink'),
          soft: rgb('ink-soft'),
        },
        accent: rgb('ink'),
        brand: {
          blue: rgb('brand-blue'),
          mid: rgb('brand-blue-mid'),
          cyan: rgb('brand-cyan'),
        },
        paper: {
          DEFAULT: rgb('paper'),
          2: rgb('paper-2'),
        },
        steel: {
          100: rgb('steel-100'),
          300: rgb('steel-300'),
          500: rgb('steel-500'),
          700: rgb('steel-700'),
        },
      },
      fontFamily: {
        display: ['"Libre Baskerville"', 'Baskerville', '"Times New Roman"', 'serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        scene: 'cubic-bezier(.22,1,.36,1)',
      },
      transitionDuration: {
        400: '400ms',
        500: '500ms',
        700: '700ms',
        1200: '1200ms',
      },
      maxWidth: {
        scene: '32rem',
      },
      boxShadow: {
        card: '0 18px 50px -20px rgba(1,17,46,.28)',
        pill: '0 10px 30px -12px rgba(1,17,46,.55)',
      },
    },
  },
  plugins: [],
};

export default config;
