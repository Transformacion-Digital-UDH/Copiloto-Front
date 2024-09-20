import './assets/css/main.css'

import '@fortawesome/fontawesome-free/css/all.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import axios from 'axios';
import vue3GoogleLogin from 'vue3-google-login'

axios.defaults.baseURL = 'https://titulacion-back.abimaelfv.site';
//axios.defaults.baseURL = 'http://127.0.0.1:8000';

const app = createApp(App)

app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.use(createPinia())
app.use(router)

app.mount('#app')
