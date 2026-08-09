/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Exact tokens from Trip2Talk-Mockup-Teal.html :root
        teal: {
          900: '#16262b',
          800: '#20363c',
          700: '#2e4d53',
          600: '#e8935a',
          500: '#efa565',
          400: '#f4b476',
          // Mobile app-mode Discover palette
          dark: '#122f2a',
          darker: '#0c211d',
          mid: '#1c3f38',
          soft: '#e3ece8',
        },
        mint: {
          100: '#f0efe9',
          200: '#f4ece0',
        },
        cream: '#f7f5f0',
        'cream-app': '#f8f5ee',
        card: '#ffffff',
        ink: '#1b2a2c',
        'ink-soft': '#5a6c6a',
        'ink-app': '#1b1d19',
        line: '#e6e4dc',
        coral: '#e2734a',
        orange: {
          DEFAULT: '#e6935a',
          soft: '#f0ab7d',
          deep: '#c46e37',
        },

        // Legacy aliases → exact mockup values (do not invent new usages)
        'deep-green': '#16262b',
        'near-black-green': '#16262b',
        gold: '#efa565',
        'gold-dark': '#1b2a2c',
        'cream-muted': '#5a6c6a',
        'surface-card': '#20363c',
        'brand-green': '#16262b',
        'brand-green-light': '#f7f5f0',
        'brand-dark': '#1b2a2c',
        amber: '#e8935a',
        'amber-bg': '#faf1dc',
      },
      fontFamily: {
        // body/UI — mockup body { font-family: Inter, Sarabun }
        sans: ['Inter', 'Sarabun', 'system-ui', 'sans-serif'],
        // Discover / app-mode display headings — LATIN ONLY.
        // Never put Thai fonts in this stack: Fraunces has no Thai glyphs, and
        // per-character fallback mid-word breaks Thai vowel/tone shaping.
        // Thai display lines must use `font-serif` (Noto Serif Thai) on a sibling node.
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        // Thai display headings (sibling to font-display, never nested under it)
        // Body Thai UI lines use `thai` (Sarabun).
        serif: ['"Noto Serif Thai"', 'Sarabun', 'serif'],
        thai: ['Sarabun', 'Prompt', 'Noto Serif Thai', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['Inter', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        editorial: '4px',
        spot: '24px',
      },
      boxShadow: {
        mockup: '0 20px 45px -20px rgba(15, 28, 30, 0.4)',
        spot: '0 18px 40px -22px rgba(18, 47, 42, 0.45)',
      },
    },
  },
  plugins: [],
}
