import './assets/css/main.css'

import '@fortawesome/fontawesome-free/css/all.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import axios from 'axios';

axios.defaults.baseURL = 'https://titulacion-back.abimaelfv.site';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
