/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#142B4F',
          secondary: '#2563EB',
          accent: '#14B8A6',
          bg: '#F5F7FB',
          card: '#FFFFFF',
          text: '#172033',
          dark: '#0B132B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        sinhala: ['"Noto Sans Sinhala"', 'system-ui', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
