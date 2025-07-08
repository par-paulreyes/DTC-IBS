/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryRed: '#C1121F',
        primaryBlue: '#162C49',
      },
      fontFamily: {
        sans: [
          'Montserrat',
          'Inter',
          'Poppins',
          'Arial',
          'Helvetica',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}; 