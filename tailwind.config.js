/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'robotics': {
          primary: '#4A90E2',
          secondary: '#2E5BBA', 
          accent: '#1E40AF',
          dark: '#1E3A8A',
          light: '#DBEAFE',
        }
      },
      fontFamily: {
        'arabic': ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
