/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        background: '#FFFDF5',
        foreground: '#2D2A2E',
        card: '#FFFFFF',
        'card-foreground': '#2D2A2E',
        primary: '#FF6B6B',
        'primary-foreground': '#FFFFFF',
        secondary: '#FFD93D',
        'secondary-foreground': '#2D2A2E',
        accent: '#4D96FF',
        'accent-foreground': '#FFFFFF',
        success: '#6BCB77',
        warning: '#FF9F43',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
      boxShadow: {
        hard: '4px 4px 0px 0px #000000',
        soft: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        button: '0px 4px 0px 0px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};