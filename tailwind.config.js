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
        },
        mint: {
          100: '#f0efe9',
          200: '#f4ece0',
        },
        cream: '#f7f5f0',
        card: '#ffffff',
        ink: '#1b2a2c',
        'ink-soft': '#5a6c6a',
        line: '#e6e4dc',
        coral: '#e2734a',

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
      },
      fontFamily: {
        // body/UI — mockup body { font-family: Inter, Sarabun }
        sans: ['Inter', 'Sarabun', 'system-ui', 'sans-serif'],
        // Thai sub-lines — mockup --font-th: Prompt, Noto Serif Thai
        thai: ['Prompt', 'Noto Serif Thai', 'sans-serif'],
        // Headings — mockup h1,h2,h3 { Noto Serif Thai, Inter, serif }
        serif: ['"Noto Serif Thai"', 'Inter', 'serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['Inter', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        editorial: '4px',
      },
      boxShadow: {
        mockup: '0 20px 45px -20px rgba(15, 28, 30, 0.4)',
      },
    },
  },
  plugins: [],
}
