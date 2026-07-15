/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { grab: '#00B14F', 'grab-dark': '#004A26', forest: '#003D20' },
      animation: { 'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite' },
      keyframes: { 'pulse-dot': { '0%, 100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .35, transform: 'scale(.7)' } } }
    }
  },
  plugins: []
}
