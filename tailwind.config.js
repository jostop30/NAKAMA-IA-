/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tsundere-rosa': '#FF69B4',
        'tsundere-rojo': '#FF4444',
        'cyber-neon': '#00FFCC',
        'cyber-purpura': '#B026FF',
        'shonen-rojo': '#FF4500',
        'shonen-naranja': '#FF8C00',
      },
      animation: {
        'tsundere-tsun': 'tsunTsun 0.5s ease-in-out',
        'tsundere-dere': 'dereDere 0.3s ease-in-out',
        'aura-shonen': 'auraPulse 2s ease-in-out infinite',
        'flotar': 'float 3s ease-in-out infinite',
        'brillo': 'glow 1.5s ease-in-out infinite alternate',
        'sonrojo': 'blush 1s ease-in-out infinite alternate',
      },
      keyframes: {
        tsunTsun: { 
          '0%,100%': { transform: 'translateX(0)' }, 
          '25%': { transform: 'translateX(-5px)' }, 
          '75%': { transform: 'translateX(5px)' } 
        },
        dereDere: { 
          '0%': { opacity: 0.5, transform: 'scale(0.95)' }, 
          '100%': { opacity: 1, transform: 'scale(1)' } 
        },
        auraPulse: { 
          '0%,100%': { opacity: 0.6, transform: 'scale(1)' }, 
          '50%': { opacity: 1, transform: 'scale(1.1)' } 
        },
        float: { 
          '0%,100%': { transform: 'translateY(0px)' }, 
          '50%': { transform: 'translateY(-10px)' } 
        },
        glow: { 
          '0%': { boxShadow: '0 0 5px #FF69B4, 0 0 10px #FF69B4' }, 
          '100%': { boxShadow: '0 0 20px #FF69B4, 0 0 30px #FF69B4' } 
        },
        blush: { 
          '0%': { backgroundColor: 'rgba(255, 105, 180, 0.1)' }, 
          '100%': { backgroundColor: 'rgba(255, 105, 180, 0.3)' } 
        },
      },
    },
  },
  plugins: [],
}