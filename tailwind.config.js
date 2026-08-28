/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondo negro mármol profundo
        dark: {
          950: '#040405',
          900: '#070709',
          800: '#0c0c10',
          700: '#12121a',
          600: '#1c1c28'
        },
        // Burdeos / Vino (Protagonista)
        bordeaux: {
          300: '#d97a8f',
          400: '#9c2b3e',
          500: '#7a1225',
          600: '#4a0e1b',
          700: '#2d0710',
          800: '#1a0409'
        },
        // Dorado envejecido Art Déco
        gold: {
          300: '#f7e08b',
          400: '#e8c96a',
          500: '#c9a227',
          600: '#8c6a2f',
          700: '#5f4717'
        },
        // Crema / Marfil (Textos y contrastes)
        ivory: {
          100: '#ffffff',
          200: '#faf8f5',
          300: '#f6f1e3',
          400: '#efe6d0',
          500: '#d9cdaf',
          600: '#b5a686'
        },
        // Carmesí acento
        crimson: {
          500: '#7a1225',
          600: '#4a0e1b',
          700: '#2d0710'
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
      },
      backgroundImage: {
        'artdeco-gold-grad': 'linear-gradient(180deg, #f7e08b 0%, #c9a227 50%, #8c6a2f 100%)',
        'bordeaux-grad': 'linear-gradient(180deg, #7a1225 0%, #4a0e1b 60%, #2d0710 100%)',
        'dark-grad': 'linear-gradient(180deg, #070709 0%, #040405 100%)'
      }
    },
  },
  plugins: [],
}
