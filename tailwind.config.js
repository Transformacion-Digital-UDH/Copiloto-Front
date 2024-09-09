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
        'baseClarito': '#A0D6C9 ',
        'azul': '#011B4B',
        'amarillo': '#F2A603',
        'custom-green': '#2ebaa1',
        'plomosidebar': '#222D32',
        'barra': '#F2A603',
        'grisTabla': '#ECECEC',
        'azulbajo': '#2C8AAA',
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
