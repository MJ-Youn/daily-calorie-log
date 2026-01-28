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
        primary: '#3b82f6', // Example blue
        secondary: '#10b981', // Example green
        glass: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
