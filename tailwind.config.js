/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        golf: {
          50: '#f2f9f4',
          100: '#e1f2e6',
          200: '#c5e5ce',
          300: '#99d2ab',
          400: '#64b681',
          500: '#3e995f',
          600: '#2f7c4c',
          700: '#27623e',
          800: '#224e34',
          900: '#1d412d',
          950: '#0d2419',
        },
        fairway: {
          DEFAULT: '#10b981',
          dark: '#064e3b',
          light: '#34d399',
        },
        uskids: {
          DEFAULT: '#059669',
          light: '#d1fae5',
          border: '#34d399',
          dark: '#065f46'
        },
        scjga: {
          DEFAULT: '#2563eb',
          light: '#dbeafe',
          border: '#60a5fa',
          dark: '#1e40af'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.3)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
