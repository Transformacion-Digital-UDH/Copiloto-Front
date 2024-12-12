# copiloto-front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

```sh
npm install axios
```

```sh
npm install flowbite
```

```sh
npm install vue3-google-login
```

### Setup variable enviroments
    - Create file .env
    - Add variables or copy from file .env.example: 
        VITE_GOOGLE_CLIENT_ID="CLIENT_ID PASTE HERE"
        VITE_GOOGLE_CLIENT_SECRET="SECRET PASTE HERE" 
        VITE_URL_VIEW_LETTER="https://copiloto.udh.edu.pe/titulacionback/api/view-letter"
        VITE_URL_DOWNLOAD_LETTER="https://copiloto.udh.edu.pe/titulacionback/api/download-letter"
        VITE_URL_VIEW_OFFICE="https://copiloto.udh.edu.pe/titulacionback/api/view-office"
        VITE_URL_DOWNLOAD_OFFICE="https://copiloto.udh.edu.pe/titulacionback/api/download-office"
        VITE_URL_VIEW_RESOLUTION="https://copiloto.udh.edu.pe/titulacionback/api/view-resolution"
        VITE_URL_DOWNLOAD_RESOLUTION="https://copiloto.udh.edu.pe/titulacionback/api/download-resolution"

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```
