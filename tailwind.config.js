/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: "#2e8a45",
        "background-light": "#f6f8f6",
        "background-dark": "#141e16",
      },
    },
  },
  plugins: [],
};
