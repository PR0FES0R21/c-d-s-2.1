/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          400: '#b026ff',
          500: '#9600ef',
          600: '#8400d6',
          900: '#36006e',
        },
        cyan: {
          300: '#80f0ff',
          400: '#00e5ff',
          500: '#00c8f0',
          600: '#00a3c9',
        },
        green: {
          400: '#39ff14',
          500: '#29e300',
          600: '#1cc700',
        },
        gray: {
          800: '#1a1b26',
          900: '#0f101a',
          950: '#0a0b14',
        }
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '2%': { transform: 'translate(2px, 2px)' },
          '4%': { transform: 'translate(-2px, -2px)' },
          '5%': { transform: 'translate(0)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
  plugins: [],
};