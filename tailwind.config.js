/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/*/.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#838383',
        'base': '#39B49E',
        'azul': '#0F2757',
        'amarillo': '#F2A603',
        'custom-green': '#2ebaa1',
      },
      fontFamily: {
        Roboto: ["Roboto, sans-serif"],
        Quicksand: ["Quicksand", "sans-serif"],
      },
      fontWeight: {
        Medium: 500,
        SemiBold: 600, 
      },
      width: {
        '7/10': '75%',
        '3/10': '25%',
      },
    
    },
  },
  plugins: [],
};