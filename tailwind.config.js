import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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
        display: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: "#2e8a45",
        "background-light": "#f6f8f6",
        "background-dark": "#141e16",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-3px) rotate(-8deg)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(3px) rotate(8deg)" },
        },
        "bell-ring": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "10%, 30%": { transform: "rotate(-15deg)" },
          "20%, 40%": { transform: "rotate(15deg)" },
          "50%": { transform: "rotate(-10deg)" },
          "60%, 80%": { transform: "rotate(10deg)" },
          "70%": { transform: "rotate(-5deg)" },
          "90%": { transform: "rotate(5deg)" },
        },
      },
      animation: {
        shake: "shake 0.6s ease-in-out",
        "bell-ring": "bell-ring 0.8s ease-in-out",
      },
    },
  },
  plugins: [],
};