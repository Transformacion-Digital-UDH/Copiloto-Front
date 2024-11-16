<script lang="ts">
import { defineComponent, ref, onMounted, markRaw } from 'vue';
import { useSidebar } from '@/assets/ts/useSidebar';
import { useDark } from '@vueuse/core';
import { useRoute } from 'vue-router';
import proyecto from '@/components/icons/proyecto.vue';
import ejecucion from '@/components/icons/ejecucion.vue';
import informe from '@/components/icons/informe.vue';
import sustentacion from '@/components/icons/sustentacion.vue';
import cierre from '@/components/icons/cierre.vue';
import { useAuthStore } from '@/stores/auth'
import IconUser from './icons/IconUser.vue';
import IconPanel from './icons/IconPanel.vue';

// Definir tipos para las secciones y submenús
interface Submenu {
  name: string;
  label: string;
  path: string;
}

interface Section {
  name: string;
  label: string;
  isOpen: boolean;
  icon: any;
  submenus: Submenu[];
}

export default defineComponent({
  data() {
    return {
      progreso: 30, // Valor inicial del progreso en porcentaje
    }
  },

  setup() {
    const { isOpen } = useSidebar();
    const isDark = useDark();
    const authStore = useAuthStore();

    const role = ref<string>('');  // Tipado explícito para role
    const full_name = ref<string>('');
    const is_jury = ref<boolean>(false);
    const image_profile = ref<string>('');
    const route = useRoute();

    // Definir el tipo explícito para `sections`
    const sections = ref<Section[]>([]);

    const setupSectionsForRole = () => {
      // Todas las secciones base, pero se mostrarán dependiendo del rol.
      const allSections: Section[] = [
        {
          name: 'ProyectoDeTesis',
          label: 'Proyecto Tesis',
          isOpen: false,
          icon: markRaw(proyecto),
          submenus: [] // Se llenará según el rol
        },
        {
          name: 'Ejecucion',
          label: 'Ejecución',
          isOpen: false,
          icon: markRaw(ejecucion),
          submenus: [] // Se llenará según el rol
        },
        {
          name: 'InformeFinal',
          label: 'Informe Final',
          isOpen: false,
          icon: markRaw(informe),
          submenus: [] // Se llenará según el rol
        },
        {
          name: 'Sustentacion',
          label: 'Sustentación',
          isOpen: false,
          icon: markRaw(sustentacion),
          submenus: [] // Se llenará según el rol
        },
        {
          name: 'Cierre',
          label: 'Cierre de Trámites',
          isOpen: false,
          icon: markRaw(cierre),
          submenus: [] // Se llenará según el rol
        },
        {
          name: 'Panel',
          label: 'Panel',
          isOpen: false,
          icon: markRaw(IconPanel),
          submenus: [] 
        },
        {
          name: 'Usuarios',
          label: 'Usuarios',
          isOpen: false,
          icon: markRaw(IconUser),
          submenus: []
        }
      ];

      // Aquí ajustamos qué secciones mostrar según el rol
      if (role.value === 'estudiante') {
        // Estudiante tiene acceso a todas las secciones
        allSections[0].submenus.push(
          { name: 'Designacion de asesor', label: 'Designación de Asesor', path: '/estudiante/designacion-asesor' },
          { name: 'Conformidad por el asesor', label: 'Conformidad por el Asesor', path: '/estudiante/conformidad-asesor' },
          { name: 'Designacion de jurados', label: 'Designación de Jurados', path: '/estudiante/designacion-jurado' },
          { name: 'Conformidad por los jurados', label: 'Conformidad por los Jurados', path: '/estudiante/conformidad-jurado' },
          { name: 'Aprobacion del proyecto', label: 'Aprobación del Proyecto', path: '/estudiante/aprobacion-proyecto' }
        );
        allSections[1].submenus.push(
          { name: 'Progreso', label: 'Progreso', path: '/estudiante/progreso' }
        );
        allSections[2].submenus.push(
          { name: 'Conformidad del informe final por el asesor', label: 'Conformidad por el Asesor', path: '/estudiante/conformidad-informe-asesor' },
          { name: 'Designacion de jurado para el informe final', label: 'Designación de Jurado', path: '/estudiante/designacion-informe-jurado' },
          { name: 'Conformidad del informe final por los jurados', label: 'Conformidad del Informe Final', path: '/estudiante/conformidad-informe-jurado' },
          { name: 'Aprobacion del informe final', label: 'Aprobación del Informe Final', path: '/estudiante/aprobacion-informe' },
          { name: 'Conformidad por integridad VRI', label: 'Conformidad por Integridad VRI', path: '/estudiante/conformidad-vri' }
        );
        allSections[3].submenus.push(
          //{ name: 'SustentacionEstudiante', label: 'Sustentación Submenu', path: '/sustentacion/estudiante' },
          { name: 'AptoParaSustentar', label: 'Declaración Apto para Sustentar', path: '/estudiante/declaracion-apto-sustentar' },
          { name: 'DesignacionFechayHora', label: 'Designación de Fecha y Hora', path: '/estudiante/designacion-fecha-hora' },
          { name: 'CorrecionSustentacion', label: 'Correccion Sustentacion', path: '/estudiante/correccion-sustentacion' }
        );
        allSections[4].submenus.push(
          { name: 'CierreEstudiante', label: 'Cierre de Trámites Submenu', path: '/cierre/estudiante' }
        );
        sections.value = allSections; // Mostrar todas las secciones.
      } else if (role.value === 'asesor') {
        // Asesor solo tiene acceso a Proyecto Tesis, Ejecución e Informe Final
        allSections[0].submenus.push(
          { name: 'SolicitudesAsesoria', label: 'Pendientes de Aceptar', path: '/asesor/solicitud-asesoria' },
          { name: 'SolicitudesRevision', label: 'Revisión de proyectos', path: '/asesor/solicitud-revision' },
        );
        // allSections[1].submenus.push(
        //   { name: 'EjecucionAsesor', label: 'Ejecución Submenu Asesor', path: '/ejecucion/asesor' }
        // );

        allSections[2].submenus.push(
          { name: 'Revisión informe', label: 'Revisión de Informes', path: '/asesor/revision-informe' },
          
        );

        if (is_jury.value) {
          allSections[0].submenus.push(
            { name: 'revision jurado proyecto', label: 'Revision Jurado Proyecto', path: '/jurado/revision-jurado' },
          );
          allSections[2].submenus.push(
            { name: 'revision jurado informe', label: 'Revision Jurado Informe', path: '/jurado/revisionJurado-informe' },
          );
        }
        // Solo mantenemos las secciones de Proyecto, Ejecución, e Informe Final
        sections.value = allSections.filter(section =>
          section.name === 'ProyectoDeTesis' ||
         // section.name === 'Ejecucion' ||
          section.name === 'InformeFinal'
        );
      } else if (role.value === 'paisi') {
        // Paisi solo tiene Proyecto Tesis, Informe Final y Sustentación
        allSections[0].submenus.push(
          { name: 'Designar asesor', label: 'Designar Asesor', path: '/paisi/designar-asesor' },
          { name: 'Designar jurados', label: 'Designar Jurados', path: '/paisi/designar-jurado' },
          { name: 'Aprobar proyecto', label: 'Aprobar Proyecto', path: '/paisi/aprobar-proyecto' }
        );
        allSections[2].submenus.push(
          { name: 'Link de informe', label: 'Link de Informe', path: '/paisi/link-informe' },
          { name: 'Designar jurados informe', label: 'Designar Jurados Informe', path: '/paisi/designar-jurado-informe' },
          { name: 'Aprobar informe', label: 'Aprobar Informe', path: '/paisi/aprobar-informe' },
        );
        allSections[3].submenus.push(
          { name: 'AptoParaSustentar', label: 'Apto para Sustentar', path: '/paisi/apto-sustentacion' },
          { name: 'DesignarFechaHora', label: 'Designar Fecha y Hora', path: '/paisi/designar-fecha-hora' },
        );
        // Filtramos las secciones de Proyecto, Informe, y Sustentación
        sections.value = allSections.filter(section =>
          section.name === 'ProyectoDeTesis' ||
          section.name === 'InformeFinal' ||
          section.name === 'Sustentacion'
        );
      } else if (role.value === 'facultad') {
        // Facultad tiene acceso a Proyecto Tesis, Informe Final, Sustentación y Cierre
        allSections[0].submenus.push(
          { name: 'Resolución designación asesor', label: 'Resolución Designación Asesor', path: '/facultad/resolucion-asesor' },
          { name: 'Resolución aprobación proyecto', label: 'Resolución Aprobación Proyecto', path: '/facultad/resolucion-proyecto' }
        );
        allSections[2].submenus.push(
          { name: 'Designar jurado', label: 'Designar Jurados', path: '/facultad/designarJurado-informe' },
          { name: 'Resolución informe', label: 'Resolución Informe', path: '/facultad/resolucion-informe' }
        );
        allSections[3].submenus.push(
          { name: 'ResolucionApto', label: 'Resolución Apto Sustentar', path: '/facultad/resolucion-apto' },
          { name: 'ResolucionFechaHora', label: 'Resolución Fecha y Hora para Sustentar', path: '/facultad/resolucion-fecha-hora' },
        );
        allSections[4].submenus.push(
          { name: 'CierreFacultad', label: 'Cierre de Trámites', path: '/cierre/facultad' }
        );
        // Filtramos las secciones de Proyecto, Informe, Sustentación, y Cierre
        sections.value = allSections.filter(section =>
          section.name === 'ProyectoDeTesis' ||
          section.name === 'InformeFinal' ||
          section.name === 'Sustentacion' ||
          section.name === 'Cierre'
        );
      } else if (role.value === 'admin') {
        allSections[5].submenus.push(
          { name: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' }
        );
        allSections[6].submenus.push(
          { name: 'users', label: 'Usuarios', path: '/admin/usuarios' }
        );
        sections.value = allSections.filter(section =>
          section.name === 'Panel' ||
          section.name === 'Usuarios'
        );
      }
    };

    const toggleSubmenu = (name: string) => {
      const section = sections.value.find(section => section.name === name);
      if (section) {
        section.isOpen = !section.isOpen;
      }
    };

    const isActive = (submenu: Submenu) => {
      return route.path.includes(submenu.path);
    };

    const openSectionIfActive = () => {
      sections.value.forEach(section => {
        section.isOpen = section.submenus.some(submenu => isActive(submenu));
      });
    };

    onMounted(() => {
      is_jury.value = authStore.is_jury;
      role.value = authStore.role!;
      full_name.value = authStore.fullName!;
      image_profile.value = authStore.image || `https://ui-avatars.com/api/?name=${full_name.value}`;
      setupSectionsForRole();
      openSectionIfActive();
    });

    return {
      isOpen,
      sections,
      toggleSubmenu,
      isDark,
      full_name,
      is_jury,
      role,
      isActive,
      image_profile
    };
  }
});
</script>

<template>
  <div :class="[isOpen ? 'w-0 lg:w-64' : '', 'flex bg-white dark:bg-gray-800']">
    <!-- Backdrop -->
    <div :class="isOpen ? 'block' : 'hidden'" @click="isOpen = !isOpen"
      class="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"></div>
    <!-- End Backdrop -->

    <div :class="[isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in',
      'fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform',
      isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900',
      'sidebar']">

      <!-- INFO DEL ESTUDIANTE COMO EL NOMBRE -->
      <div class="flex flex-col items-center justify-center mt-6">
        <div class="w-24 h-24 mb-4 overflow-hidden rounded-full shadow-lg">
          <img class="object-cover w-full h-full" :src="image_profile" alt="Avatar" />
        </div>
        <div class="w-full text-center max-w-44">
          <h2 class="text-xl font-semibold break-words">{{ full_name }}</h2>
          <p class="text-base text-green-600 font-semibold break-words">{{ role }}</p>
        </div>
      </div>

      <!-- INFO DEL ESTUDIANTE COMO PROGRESO -->
      <div class="px-6 mt-6 mb-8">
        <div class="flex justify-between mb-4">
          <span class="font-medium text-gray-600 dark:text-gray-300">Progreso General</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div :style="{ width: progreso + '%' }" class="bg-blue-600 h-2.5 rounded-full"></div>
          <span class="text-sm font-medium text-blue-700 dark:text-blue-200">{{ progreso }}%</span>
        </div>
      </div>
      <hr class="border-gray-300 dark:border-gray-600" />

      <nav class="mt-5 mb-10">
        <!-- Secciones Dinámicas -->
        <div v-for="section in sections" :key="section.name" class="mb-4">
          <button
            @click="toggleSubmenu(section.name)"
            class="flex w-full items-center px-6 py-2 mt-4 duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group">
            <component :is="section.icon" class="w-8 h-8 transition-transform transform group-hover:translate-x-2 duration-300" />
            <span class="mx-4 text-left text-base font-medium transition-transform transform group-hover:translate-x-2 duration-300">
              {{ section.label }}
            </span>
            <svg
              v-if="!section.isOpen"
              viewBox="0 0 24 24"
              class="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M11.9999 13.9394L17.4696 8.46973L18.5303 9.53039L11.9999 16.0607L5.46961 9.53039L6.53027 8.46973L11.9999 13.9394Z"
                fill="currentColor"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              class="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 rotate-180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M11.9999 13.9394L17.4696 8.46973L18.5303 9.53039L11.9999 16.0607L5.46961 9.53039L6.53027 8.46973L11.9999 13.9394Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <div v-if="section.isOpen">
            <ul class="pl-8 mt-2">
              <li v-for="submenu in section.submenus" :key="submenu.name" class="flex items-center mb-1">
                <div v-if="role === 'asesor' && submenu.name.includes('jurado')" class="w-1 bg-green-600 mr-2 h-full rounded"></div>
                <router-link
                    :to="submenu.path"
                    class="flex items-center justify-between p-3 text-sm  transition duration-200"
                    :class="[
                      isActive(submenu)
                        ? 'bg-base text-white hover:bg-base dark:hover:bg-base'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                    style="margin: 0; width: 100%; box-sizing: border-box;"
                  >
                    <span>{{ submenu.label }}</span>
                    <span
                      v-if="role === 'asesor' && submenu.name.includes('jurado')"
                      class="ml-2 text-xs text-white bg-green-600 px-2 py-1 rounded-lg"
                    >
                      Jurado
                    </span>
                  </router-link>


              </li>

            </ul>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* Estilos mejorados para el sidebar */
.dark .sidebar {
  background-color: #1a202c;
  color: #edf2f7;
}

.sidebar ul li .text-sm {
  font-size: 0.875rem;
}

.router-link-active {
  font-weight: bold;
}

/* Badge personalizado para el rol de jurado */
.badge-jurado {
  background-color: #34d399; /* Verde claro */
  color: #fff;
  padding: 2px 6px;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}
</style>
