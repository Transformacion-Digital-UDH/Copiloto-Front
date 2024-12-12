import './assets/css/main.css'
import '@fortawesome/fontawesome-free/css/all.css';
import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import axios from 'axios';
import vue3GoogleLogin from 'vue3-google-login'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const BASE_URL = import.meta.env.VITE_URI_BACK;

axios.defaults.baseURL = BASE_URL;
// axios.defaults.baseURL = 'http://127.0.0.1:8000';

const pinia = createPinia()

pinia.use(({store}) => {
    store.router = markRaw(router)
})

pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.use(pinia)
app.use(router)

app.mount('#app')
