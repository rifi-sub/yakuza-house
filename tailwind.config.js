/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Negro mármol
        dark: {
          950: '#040405',
          900: '#070709',
          800: '#0c0c10',
          700: '#12121a',
          600: '#1c1c28'
        },
        // Carmesí heredado
        crimson: {
          500: '#e63946',
          600: '#d62828',
          700: '#9b111e'
        },
        // Burdeos profundo
        bordeaux: {
          400: '#9c2b3e',
          500: '#7a1225',
          600: '#4a0e1b',
          700: '#2d0710'
        },
        // Oro envejecido
        gold: {
          300: '#f7e08b',
          400: '#e8c96a',
          500: '#c9a227',
          600: '#8c6a2f',
          700: '#5f4717'
        },
        // Marfil (texto solemne)
        ivory: {
          300: '#f6f1e3',
          400: '#efe6d0',
          500: '#d9cdaf'
        },
        // Plata joyería
        silver: {
          400: '#c9cddb',
          500: '#8f96ad'
        }
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        sans: ['Cinzel', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      letterSpacing: {
        widest2: '0.35em'
      }
    },
  },
  plugins: [],
}
