/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
      },
    },
  },
  plugins: [],
}