import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AppLogin from '@/components/auth/AppLogin.vue'
import AppRegister from '@/components/auth/AppRegister.vue'
import DesignacionAsesor from '@/views/Estudiante/DesignacionAsesor.vue'
import SolicitudAsesoria from '@/views/Asesor/SolicitudAsesoria.vue'
import ConformidadAsesor from '@/views/Estudiante/ConformidadAsesor.vue'
import ProyectoTesis from '@/views/Asesor/ProyectoTesis.vue'
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
        title: 'Inicio de sesión',
      }
    },
    {
      path: '/estudiante',
      name: 'estudiante',
      meta: { roles: ['estudiante'], title: 'Estudiante' },
      component: AdminLayout,
      children: [
        { path: 'designacion-asesor', name: 'DesignacionAsesor', component: DesignacionAsesor, meta: { title: 'Designación asesor' } },
        { path: 'conformidad-asesor', name: 'ConformidadAsesor', component: ConformidadAsesor, meta: { title: 'Conformidad de asesor' } },
        { path: 'designacion-jurado', name: 'DesignacionJurado', component: DesignacionJurado, meta: { title: 'Designación de jurado' } },
        { path: 'conformidad-jurado', name: 'ConformidadJurado', component: ConformidadJurado, meta: { title: 'Conformidad de jurado' } },
        { path: 'aprobacion-proyecto', name: 'AprobacionProyecto', component: AprobacionProyecto, meta: { title: 'Aprobación de proyecto' } },
      ]
    },
    {
      path: '/asesor',
      name: 'asesor',
      meta: { roles: ['asesor'], title: 'Asesor' },
      component: AdminLayout,
      children: [
        { path: 'solicitud-asesoria', name: 'SolicitudAsesoria', component: SolicitudAsesoria, meta: { title: 'Solicitud de asesoria' } },
        { path: 'proyecto-tesis', name: 'ProyectoTesis', component: ProyectoTesis, meta: { title: 'Proyecto de tesis' } },
      ]
    },
    {
      path: '/jurado',
      name: 'jurado',
      meta: { roles: ['jurado'], title: 'Jurado' },
      component: AdminLayout,
      children: [
        { path: 'solicitud-jurado', name: 'SolicitudJurado', component: SolicitudJurado, meta: { title: 'Solicitud de jurado' } },
        { path: 'solicitud-jurado-presidente', name: 'JuradoPresidente', component: JuradoPresidente, meta: { title: 'Solicitud de jurado presidente' } },

      ]
    },
    {
      path: '/register',
      name: 'register',
      component: AppRegister,
      meta: {
        title: 'Registrarme',
      },
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || '';
  const title = to.meta?.title as String;
  document.title = title as string;

  // Si no hay token y la ruta requiere autenticación, redirigir al login
  if (!token && to.name !== 'login' && to.name !== 'register') {
    return next({ name: 'login' });
  }

  // Si hay token, verificar el rol del usuario
  // if (token && !to.meta.roles.includes(role)) {
  //   // Si el usuario no tiene permiso para acceder a la ruta, redirigir a la ruta de su rol
  //   const routesByRole: Record<string, string> = {
  //     estudiante: 'estudiante',
  //     asesor: 'asesor',
  //     jurado: 'jurado'
  //   };
  //   return next({ name: routesByRole[role] });
  // }

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
