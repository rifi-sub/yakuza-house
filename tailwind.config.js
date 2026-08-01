/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070709',
          800: '#0f0f14',
          700: '#171722',
          600: '#232332'
        },
        crimson: {
          500: '#e63946',
          600: '#d62828',
          700: '#9b111e'
        },
        gold: {
          400: '#f4d068',
          500: '#d4af37',
          600: '#aa8c2c'
        }
      },
      fontFamily: {
        sans: ['Cinzel', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
