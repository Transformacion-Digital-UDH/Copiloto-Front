import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AppLogin from '../components/auth/AppLogin.vue' 
import AppRegister from '../components/auth/AppRegister.vue'
import DesignacionAsesor from '../views/Estudiante/DesignacionAsesor.vue'
import SolicitudAsesoria from '../views/Asesor/SolicitudAsesoria.vue'
import ConformidadAsesor from '@/views/Estudiante/ConformidadAsesor.vue'
import ProyectoTesis from '../views/Asesor/ProyectoTesis.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'home', component: Home },
      ]
    },
    {
      path: '/estudiante',
      component: AdminLayout,
      children: [
        { path: 'designacion-asesor', name: 'DesignacionAsesor', component: DesignacionAsesor },
        { path: 'conformidad-asesor', name: 'ConformidadAsesor', component: ConformidadAsesor },
      ]
    },
    {
      path: '/asesor',
      component: AdminLayout,
      children: [
        { path: 'solicitud-asesoria', name: 'SolicitudAsesoria', component: SolicitudAsesoria },
        { path: 'proyecto-tesis', name: 'ProyectoTesis', component: ProyectoTesis},
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: AppLogin,
      meta: {
        title: 'Login',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: AppRegister,
      meta: {
        title: 'Register',
      },
    },
  ]
})

export default router
