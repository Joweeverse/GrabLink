/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { sense: '#00E5FF', 'sense-dark': '#08333C', ocean: '#030C10' },
      animation: { 'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite' },
      keyframes: { 'pulse-dot': { '0%, 100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .35, transform: 'scale(.7)' } } }
    }
  },
  plugins: []
}
