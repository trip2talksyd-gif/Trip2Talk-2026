/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // New palette (Phase 0)
        // Note: teal-600/500/400 are warm amber accents in the approved mockup
        // naming (not literal teal). Dark stops are moody teal-grey.
        teal: {
          900: '#16262b',
          800: '#20363c',
          700: '#2e4d53',
          600: '#e8935a',
          500: '#efa565',
          400: '#f4b476',
        },
        mint: {
          100: '#f0efe9',
        },
        cream: '#f7f5f0',
        ink: '#1b2a2c',
        'ink-soft': '#5a6c6a',
        line: '#e6e4dc',
        coral: '#e2734a',

  // Legacy aliases -> new values (kept until remaining pages are renamed).
  // Do not add new usages — prefer teal-*, ink, mint-100, line, coral.
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
      },
      fontFamily: {
        // EN body
        sans: ['Inter', 'Sarabun', 'system-ui', 'sans-serif'],
        // Thai display (headlines / bilingual hero lines)
        thai: ['Prompt', 'Sarabun', 'system-ui', 'sans-serif'],
        // Editorial serif (kept for existing EN display usage)
        serif: ['"Noto Serif"', '"Noto Serif Thai"', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: {
        editorial: '4px',
      },
    },
  },
  plugins: [],
}
