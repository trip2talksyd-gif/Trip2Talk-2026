/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-green': '#0d4a2e',
        'near-black-green': '#13201a',
        gold: '#d4a853',
        'gold-dark': '#1a1305',
        cream: '#f7f4ec',
        'cream-muted': '#c9c4b4',
        'surface-card': '#1a2b22',
        'brand-green': '#0d4a2e',
        'brand-green-light': '#f7f4ec',
        'brand-dark': '#13201a',
        coral: '#e07a6a',
        amber: '#c9952e',
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Noto Serif Thai"', 'Georgia', 'serif'],
        sans: ['Inter', 'Sarabun', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: {
        editorial: '4px',
      },
    },
  },
  plugins: [],
}
