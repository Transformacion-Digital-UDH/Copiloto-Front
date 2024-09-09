/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite/plugin';

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'custom-gray': '#838383',
        'base': '#39B49E',
        'azul': '#0F2757',
        'amarillo': '#F2A603',
        'custom-green': '#2ebaa1',
        'grisTabla': '#ECECEC',
      },
      fontFamily: {
        Roboto: ["Roboto", "sans-serif"], // Corregido el formato aquí
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
  plugins: [
    flowbite, // Añadido el plugin de Flowbite
  ],
};
