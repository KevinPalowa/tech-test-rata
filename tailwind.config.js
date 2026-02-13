/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f8ff',
          100: '#dce9ff',
          200: '#b9d3ff',
          300: '#8fb9ff',
          400: '#6397ff',
          500: '#336ef7',
          600: '#1f52d4',
          700: '#173fa6',
          800: '#153785',
          900: '#142f6a',
        },
      },
    },
  },
  plugins: [],
}
