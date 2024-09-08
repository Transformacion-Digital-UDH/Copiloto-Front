import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AppLogin from '../components/auth/AppLogin.vue'
import AppRegister from '../components/auth/AppRegister.vue'
import DesignacionAsesor from '../views/Estudiante/DesignacionAsesor.vue'
import SolicitudAsesoria from '../views/Asesor/SolicitudAsesoria.vue'
import ConformidadAsesor from '@/views/Estudiante/ConformidadAsesor.vue'
import ProyectoTesis from '../views/Asesor/ProyectoTesis.vue'
import DesignacionJurado from '@/views/Estudiante/DesignacionJurado.vue'
import ConformidadJurado from '@/views/Estudiante/ConformidadJurado.vue'
import AprobacionProyecto from '@/views/Estudiante/AprobacionProyecto.vue'
import SolicitudJurado from '@/views/Jurado/SolicitudJurado.vue'
import JuradoPresidente from '@/views/Jurado/JuradoPresidente.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: AppLogin,
      meta: {
        title: 'Login',
      },
    },
    {
      path: '/estudiante',
      name: 'estudiante',
      meta: { roles: ['estudiante'] },
      component: AdminLayout,
      children: [
        { path: 'designacion-asesor', name: 'DesignacionAsesor', component: DesignacionAsesor },
        { path: 'conformidad-asesor', name: 'ConformidadAsesor', component: ConformidadAsesor },
        { path: 'designacion-jurado', name: 'DesignacionJurado', component: DesignacionJurado },
        { path: 'conformidad-jurado', name: 'ConformidadJurado', component: ConformidadJurado },
        { path: 'aprobacion-proyecto', name: 'AprobacionProyecto', component: AprobacionProyecto },
      ]
    },
    {
      path: '/asesor',
      name: 'asesor',
      meta: { roles: ['asesor'] },
      component: AdminLayout,
      children: [
        { path: 'solicitud-asesoria', name: 'SolicitudAsesoria', component: SolicitudAsesoria },
        { path: 'proyecto-tesis', name: 'ProyectoTesis', component: ProyectoTesis },
      ]
    },
    {
      path: '/jurado',
      name: 'jurado',
      meta: { roles: ['jurado'] },
      component: AdminLayout,
      children: [
        { path: 'solicitud-jurado', name: 'SolicitudJurado', component: SolicitudJurado },
        { path: 'solicitud-jurado-presidente', name: 'JuradoPresidente', component: JuradoPresidente },

      ]
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || '';

  // Si no hay token y la ruta requiere autenticación, redirigir al login
  if (!token && to.name !== 'login' && to.name !== 'register') {
    return next({ name: 'login' });
  }

  // Si hay token, verificar el rol del usuario
  if (token && !to.meta.roles.includes(role)) {
    // Si el usuario no tiene permiso para acceder a la ruta, redirigir a la ruta de su rol
    const routesByRole: Record<string, string> = {
      estudiante: 'estudiante',
      asesor: 'asesor',
      jurado: 'jurado'
    };
    return next({ name: routesByRole[role] });
  }

  if ((to.name === 'login' || to.name === 'register') && token) {
    const routesByRole: Record<string, string> = {
      estudiante: 'estudiante',
      asesor: 'asesor',
      jurado: 'jurado'
    };
    return next({ name: routesByRole[role] });
  }


  // Si todo está bien, continuar con la navegación
  next();
})

export default router
