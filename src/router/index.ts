import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AppLogin from '@/components/auth/AppLogin.vue'
import AppRegister from '@/components/auth/AppRegister.vue'
import DesignacionAsesor from '@/views/Estudiante/DesignacionAsesor.vue'
import SolicitudAsesoria from '@/views/Asesor/SolicitudAsesoria.vue'
import ConformidadAsesor from '@/views/Estudiante/ConformidadAsesor.vue'
import SolicitudRevision from '@/views/Asesor/SolicitudRevision.vue'
import DesignacionJurado from '@/views/Estudiante/DesignacionJurado.vue'
import ConformidadJurado from '@/views/Estudiante/ConformidadJurado.vue'
import AprobacionProyecto from '@/views/Estudiante/AprobacionProyecto.vue'
import RevisionJurado from '@/views/Jurado/RevisionJurado.vue'
import RevisionJuradoPresidente from '@/views/Jurado/RevisionJuradoPresidente.vue'
import DesignarJurados from '@/views/Paisi/DesignarJurados.vue'
import AprobarProyecto from '@/views/Paisi/AprobarProyecto.vue'
import ResolucionProyecto from '@/views/facultad/ResolucionProyecto.vue'
import ConformidadInformeAsesor from '@/views/Estudiante/ConformidadInformeAsesor.vue'
import DesignacionJuradoInforme from '@/views/Estudiante/DesignacionJuradoInforme.vue'
import ConformidadInformeJurados from '@/views/Estudiante/ConformidadInformeJurados.vue'
import AprobacionInforme from '@/views/Estudiante/AprobacionInforme.vue'
import ConformidadVRI from '@/views/Estudiante/ConformidadVRI.vue'
import DesignarAsesor from '@/views/Paisi/DesignarAsesor.vue'
import ResolucionAsesor from '@/views/facultad/ResolucionAsesor.vue'
import RevisionInforme from '@/views/Asesor/RevisionInforme.vue'
import RevisionJuradoInforme from '@/views/Jurado/RevisionJuradoInforme.vue'
import RevisionSustentacion from '@/views/Jurado/RevisionSustentacion.vue'
import AprobarInforme from '@/views/Paisi/AprobarInforme.vue'
import ResolucionInforme from '@/views/facultad/ResolucionInforme.vue'
import PrimerFiltro from '@/views/Vri/PrimerFiltro.vue'
import SegundoFiltro from '@/views/Vri/SegundoFiltro.vue'
import TercerFiltro from '@/views/Vri/TercerFiltro.vue'
import DesignacionJurados from '@/views/facultad/DesignacionJurados.vue'
import LinkInforme from '@/views/Paisi/LinkInforme.vue'
import DesignarJuradoInforme from '@/views/Paisi/DesignarJuradoInforme.vue'
import ProgresoProyecto from '@/views/Estudiante/ProgresoProyecto.vue'
import DesignacionJuradoSus from '@/views/Estudiante/DesignacionJuradoSus.vue'
import AptoSustentacion from '@/views/Paisi/AptoSustentacion.vue'
import DesignacionFechayHora from '@/views/Estudiante/DesignacionFechayHora.vue'
import CorrecionSustentacion from '@/views/Estudiante/CorrecionSustentacion.vue'
import AptoParaSustentarR from '@/views/facultad/AptoParaSustentarR.vue'
import DesignarFechaHora from '@/views/Paisi/DesignarFechaHora.vue'
import ResolucionFechaHora from '@/views/facultad/ResolucionFechaHora.vue'
import { useAuthStore } from '@/stores/auth'
import AptoParaSustentar from '@/views/Estudiante/AptoParaSustentar.vue'
import AppProfile from '@/components/auth/AppProfile.vue'
import Dashboard from '@/views/Admin/Dashboard.vue'
import Lista from '@/views/Admin/Usuarios/Lista.vue'

const roleRoutes: Record<string, string> = {
  estudiante: "estudiante",
  asesor: "asesor",
  paisi: "paisi",
  facultad: "facultad",
  admin: "admin",
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: AppLogin,
      meta: {
        title: 'Inicio de sesión',
        roles: ['']
      }
    },
    {
      path: '/estudiante',
      name: 'estudiante',
      meta: { roles: ['estudiante'], title: 'Estudiante' },
      component: AdminLayout,
      children: [
        { path: 'designacion-asesor', name: 'DesignacionAsesor', component: DesignacionAsesor, meta: {  roles: ['estudiante'], title: 'Designación asesor' } },
        { path: 'conformidad-asesor', name: 'ConformidadAsesor', component: ConformidadAsesor, meta: {  roles: ['estudiante'], title: 'Conformidad de asesor' } },
        { path: 'designacion-jurado', name: 'DesignacionJurado', component: DesignacionJurado, meta: {  roles: ['estudiante'], title: 'Designación de jurado' } },
        { path: 'conformidad-jurado', name: 'ConformidadJurado', component: ConformidadJurado, meta: {  roles: ['estudiante'], title: 'Conformidad de jurado' } },
        { path: 'aprobacion-proyecto', name: 'AprobacionProyecto', component: AprobacionProyecto, meta: {  roles: ['estudiante'], title: 'Aprobación de proyecto' } },
        { path: 'conformidad-informe-asesor', name: 'ConformidadInformeAsesor', component: ConformidadInformeAsesor, meta: {  roles: ['estudiante'], title: 'Conformidad de Informe Final por el Asesor' } },
        { path: 'designacion-informe-jurado', name: 'DesignacionJuradoInforme', component: DesignacionJuradoInforme, meta: {  roles: ['estudiante'], title: 'Designacion de Jurado para el Informe Final' } },
        { path: 'conformidad-informe-jurado', name: 'ConformidadJuradoInforme', component: ConformidadInformeJurados, meta: {  roles: ['estudiante'], title: 'Conformidad de Informe Final por los Jurados' } },
        { path: 'aprobacion-informe', name: 'AprobacionInforme', component: AprobacionInforme, meta: {  roles: ['estudiante'], title: 'Aprobacion de Informe por los Jurados' } },
        { path: 'conformidad-vri', name: 'ConformidadVRI', component: ConformidadVRI, meta: {  roles: ['estudiante'], title: 'Conformidad por Integridad VRI' } },
        { path: 'progreso', name: 'Progreso', component: ProgresoProyecto, meta: {  roles: ['estudiante'], title: 'progreso' } },
        { path: 'declaracion-apto-sustentar', name: 'Apto para Sustentar', component: AptoParaSustentar, meta: {  roles: ['estudiante'], title: 'Apto para Sustentar' } },
        { path: 'designacion-fecha-hora', name: 'Designación de Fecha y Hora', component: DesignacionFechayHora, meta: {  roles: ['estudiante'], title: 'Designación de Fecha y Hora' } },
        { path: 'correccion-sustentacion', name: 'Correccion Sustentacion', component: CorrecionSustentacion, meta: {  roles:['estudiante'], title: 'Correccion de Sustentación' } },
      ]
    },
    {
      path: '/asesor',
      name: 'asesor',
      meta: { roles: ['asesor', 'jurado'], title: 'Asesor' },
      component: AdminLayout,
      children: [
        { path: 'solicitud-asesoria', name: 'SolicitudesAsesoria', component: SolicitudAsesoria, meta: { title: 'Solicitudes de asesoría' } },
        { path: 'solicitud-revision', name: 'SolicitudesRevision', component: SolicitudRevision, meta: { title: 'Solicitudes de revisión' } },
        { path: 'revision-informe', name: 'RevisionInforme', component: RevisionInforme, meta: { title: 'Revision informe' } },
        { path: 'revision-jurado', name: 'RevisionJurado', component: RevisionJurado, meta: { title: 'Revision jurado' } },
        { path: 'revisionJurado-informe', name: 'RevisiónJurado', component: RevisionJuradoInforme, meta: { title: 'Revisión jurado' } },
      ]
    },
    {
      path: '/jurado',
      name: 'jurado',
      meta: { roles: ['jurado'], title: 'Jurado' },
      component: AdminLayout,
      children: [
        { path: 'revision-jurado', name: 'RevisionJurado', component: RevisionJurado, meta: { roles: ['jurado'], title: 'Revision jurado' } },
        { path: 'revisionJurado-informe', name: 'RevisiónJurado', component: RevisionJuradoInforme, meta: { roles: ['jurado'], title: 'Revisión jurado' } },
        { path: 'revisionJurado-sustentacion', name: 'RevisiónSustentacion', component: RevisionSustentacion, meta: { roles: ['jurado'], title: 'Revisión sustentacion' } },

      ]
    },
    {
      path: '/paisi',
      name: 'paisi',
      component: AdminLayout,
      meta: { roles: ['paisi'], title: 'Paisi' },
      children: [
        { path: 'designar-jurado', name: 'DesignarJurados', component: DesignarJurados, meta: { roles: ['paisi'], title: 'Designar Jurados' } },
        { path: 'aprobar-proyecto', name: 'AprobarProyecto', component: AprobarProyecto, meta: { roles: ['paisi'], title: 'Aprobar proyecto' } },
        { path: 'designar-asesor', name: 'DesignarAsesor', component: DesignarAsesor, meta: { roles: ['paisi'], title: 'Designar asesor' } },
        { path: 'aprobar-informe', name: 'AprobarInforme', component: AprobarInforme, meta: { roles: ['paisi'], title: 'Aprobar informe' } },
        { path: 'link-informe', name: 'LinkInforme', component: LinkInforme, meta: { roles: ['paisi'], title: 'Link informe' } },
        { path: 'designar-jurado-informe', name: 'DesignarJuradoInforme', component: DesignarJuradoInforme, meta: { roles: ['paisi'], title: 'Designar Jurados Informe' } },
        { path: 'apto-sustentacion', name: 'AptoParaSustentar', component: AptoSustentacion, meta: { roles: ['paisi'], title: 'Apto para Sustentar' } },
        { path: 'designar-fecha-hora', name: 'DesignarFechaHora', component: DesignarFechaHora, meta: { roles: ['paisi'], title: 'Designar Fecha y Hora' } },
      ]
    },
    {
      path: '/facultad',
      name: 'facultad',
      component: AdminLayout,
      meta: { roles: ['facultad'], title: 'Facultad' },
      children: [
        { path: 'resolucion-proyecto', name: 'ResolucionProyecto', component: ResolucionProyecto, meta: { roles: ['facultad'], title: 'Resolucion proyecto' } },
        { path: 'resolucion-asesor', name: 'ResoluciónAsesor', component: ResolucionAsesor, meta: { roles: ['facultad'], title: 'Resolución asesor' } },
        { path: 'designarJurado-informe', name: 'DesignarJurado', component: DesignacionJurados, meta: { roles: ['facultad'], title: 'Designar jurados' } },
        { path: 'resolucion-informe', name: 'ResolucionInforme', component: ResolucionInforme, meta: { roles: ['facultad'], title: 'Resolucion informe' } },
        { path: 'resolucion-apto', name: 'ResolucionApto', component: AptoParaSustentarR, meta: { roles: ['facultad'], title: 'Resolucion apto para sustentar' } },
        { path: 'resolucion-fecha-hora', name: 'ResolucionFechaHora', component: ResolucionFechaHora, meta: { roles: ['facultad'], title: 'Resolucion fecha y hora para sustentar' } },

      ]
    },
    {
      path: '/vri',
      component: AdminLayout,
      meta: { roles: ['vri'], title: 'VRI' },
      children: [
        { path: 'primer-filtro', name: 'PrimerFiltro', component: PrimerFiltro, meta: { roles: ['vri'], title: 'Primer Filtro' } },
        { path: 'segundo-filtro', name: 'SegundoFiltro', component: SegundoFiltro, meta: { roles: ['vri'], title: 'Segundo Filtro' } },
        { path: 'tercer-filtro', name: 'TercerFiltro', component: TercerFiltro, meta: { roles: ['vri'], title: 'Tercer Filtro' } },
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { roles: ['admin'], title: 'Administrador' },
      children: [
        { path: 'usuarios', name: 'Users', component: Lista, meta: { roles: ['admin'], title: 'Usuarios' } },
        { path: 'dashboard', name: 'dashboard', component: Dashboard, meta: { roles: ['admin'], title: 'Usuarios' } },
      ]
    },
    {
      path: '/register',
      name: 'register',
      component: AppRegister,
      meta: {
        roles: [''],
        title: 'Registrarme'
      },
    },
    {
      path: '/perfil',
      name: 'profile',
      component: AppProfile,
      meta: {
        roles: ['estudiante', 'admin', 'facultad', 'asesor', 'paisi', 'vri'],
        title: 'Mi perfil'
      },
    },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const { token, fullName, role, is_jury } = authStore; 
  const title = to.meta?.title as String;
  document.title = title as string;

  const publicRoutes = ['login', 'register'];

  // Si no hay token y la ruta requiere autenticación, redirigir al login
  if (!token && !publicRoutes.includes(to.name as string)) {
    return next({ name: 'login' });
  }

  if (token && !fullName && to.name !== 'profile' && !publicRoutes.includes(to.name as string)) {
    return next({ name: 'profile' });
  }

  // Si el usuario está autenticado e intenta acceder a login/register
  if (token && publicRoutes.includes(to.name as string) && role !== null) {
    return next({ name: roleRoutes[role] });
  }

   // Verificar permisos de rol
   if (token && !to.meta.roles.includes(role)) {
    if (!is_jury) {
      return next({ name: roleRoutes[role!] });
    }
  }

  // Si todo está bien, continuar con la navegación
  next();
})

export default router
