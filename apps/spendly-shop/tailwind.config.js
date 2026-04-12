/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C6FF7",
        secondary: "#FF7043",
        accent: "#C56BB0",
        surface: "#FFFFFF",
        base: "#F8F7FF",
      },
      borderRadius: {
        'card': '32px',
        'button': '20px',
      },
      boxShadow: {
        'premium': '0 20px 40px -10px rgba(124, 111, 247, 0.1)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
