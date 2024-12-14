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
          label: 'Proyecto de Investigación',
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
          { name: 'Designacion de asesor', label: 'Designación de asesor', path: '/estudiante/designacion-asesor' },
          { name: 'Conformidad por el asesor', label: 'Conformidad por el asesor', path: '/estudiante/conformidad-asesor' },
          { name: 'Designacion de jurados', label: 'Designación de jurados', path: '/estudiante/designacion-jurado' },
          { name: 'Conformidad por los jurados', label: 'Conformidad por los jurados', path: '/estudiante/conformidad-jurado' },
          { name: 'Aprobacion del proyecto', label: 'Aprobación del proyecto de investigación', path: '/estudiante/aprobacion-proyecto' }
        );
        allSections[1].submenus.push(
          { name: 'Progreso', label: 'Ejecución del proyecto de investigación', path: '/estudiante/progreso' }
        );
        allSections[2].submenus.push(
          { name: 'Conformidad del informe final por el asesor', label: 'Conformidad por el asesor', path: '/estudiante/conformidad-informe-asesor' },
          { name: 'Designacion de jurado para el informe final', label: 'Designación de jurados', path: '/estudiante/designacion-informe-jurado' },
          { name: 'Conformidad del informe final por los jurados', label: 'Conformidad por los jurados', path: '/estudiante/conformidad-informe-jurado' },
          { name: 'Conformidad por integridad VRI', label: 'Conformidad de integridad por el VRI', path: '/estudiante/conformidad-vri' },
          { name: 'Aprobacion del informe final', label: 'Aprobación del informe final', path: '/estudiante/aprobacion-informe' }
        );
        allSections[3].submenus.push(
          //{ name: 'SustentacionEstudiante', label: 'Sustentación Submenu', path: '/sustentacion/estudiante' },
          { name: 'AptoParaSustentar', label: 'Declaración de apto para sustentar', path: '/estudiante/declaracion-apto-sustentar' },
          { name: 'DesignacionFechayHora', label: 'Designación de fecha y hora', path: '/estudiante/designacion-fecha-hora' },
          { name: 'Sustentación', label: 'Sustentación de tesis', path: '/estudiante/sustentacion' }
        );
        // allSections[4].submenus.push(
        //   { name: 'CierreEstudiante', label: 'Cierre de Trámites Submenu', path: '/cierre/estudiante' }
        // );
        sections.value = allSections.filter(section => 
          section.name === 'ProyectoDeTesis' ||
          section.name === 'Ejecucion' ||
          section.name === 'InformeFinal' ||
          section.name === 'Sustentacion' 
         //section.name === 'Cierre'
        ); // Mostrar todas las secciones.
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
          allSections[3].submenus.push(
            { name: 'revision jurado sustentacion', label: 'Revision Jurado Sustentacion', path: '/jurado/revisionJurado-sustentacion' },
          );
        }
        // Solo mantenemos las secciones de Proyecto, Ejecución, e Informe Final
        sections.value = allSections.filter(section =>
          section.name === 'ProyectoDeTesis' ||
         // section.name === 'Ejecucion' ||
          section.name === 'InformeFinal' ||
          section.name === 'Sustentacion'
        );
      } else if (role.value === 'programa') {
        // pa solo tiene Proyecto Tesis, Informe Final y Sustentación
        allSections[0].submenus.push(
          { name: 'Designar asesor', label: 'Designar Asesor', path: '/programa/designar-asesor' },
          { name: 'Designar jurados', label: 'Designar Jurados', path: '/programa/designar-jurado' },
          { name: 'Aprobar proyecto', label: 'Aprobar Proyecto', path: '/programa/aprobar-proyecto' }
        );
        allSections[2].submenus.push(
          { name: 'Link de informe', label: 'Link de Informe', path: '/programa/link-informe' },
          { name: 'Designar jurados informe', label: 'Designar Jurados Informe', path: '/programa/designar-jurado-informe' },
          { name: 'Aprobar informe', label: 'Aprobar Informe', path: '/programa/aprobar-informe' },
        );
        allSections[3].submenus.push(
          { name: 'AptoParaSustentar', label: 'Apto para Sustentar', path: '/programa/apto-sustentacion' },
          { name: 'DesignarFechaHora', label: 'Designar Fecha y Hora', path: '/programa/designar-fecha-hora' },
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
      } else if (role.value === 'vri' || role.value === 'turnitin') {
        // Rutas específicas para los filtros bajo "Informe Final"
        allSections[2].submenus.push(
          { name: 'Primer filtro', label: 'Primer Filtro', path: '/vri-turnitin/primer-filtro' },
          { name: 'Segundo filtro', label: 'Segundo Filtro', path: '/vri-turnitin/segundo-filtro' },
          { name: 'Tercer filtro', label: 'Tercer Filtro', path: '/vri-turnitin/tercer-filtro' }
        );

        // // Crear una nueva sección separada para "BD Observaciones"
        // allSections.push({
        //   name: 'BDObservaciones',
        //   label: 'BD Observaciones',
        //   isOpen: false,
        //   icon: markRaw(informe), // Puedes cambiar este ícono si lo deseas
        //   submenus: [
        //     { name: 'BD Observaciones', label: 'BD Observaciones', path: '/vri-turnitin/comentarios' },
        //   ],
        // });

        // Mostrar ambas secciones: Informe Final y BD Observaciones
        sections.value = allSections.filter(
          (section) =>
            section.name === 'InformeFinal' || section.name === 'BDObservaciones'
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
  },
  methods:{
    // mayuscula la primera letra
    formatearTexto(text: string): string {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
  }
});
</script>

<template>
  <div class="flex">
    <div
      :class="[isOpen ? 'lg:w-64' : 'lg:w-16 collapsed', 
                'flex flex-shrink-0 h-full border-r border-gray-300 dark:border-gray-800']">
      <!-- Sidebar Content -->
      <div :class="[isOpen ? 'w-64' : 'w-16', 'h-full overflow-y-auto', isDark ? 'bg-gray-900  transition-opacity text-gray-100' : 'bg-white text-gray-900']">
       <!-- Profile Section -->
      <div
        v-if="isOpen"
        class="flex flex-col items-center justify-center mt-6 border-b border-gray-300 dark:border-gray-700">
        <div class="w-24 h-24 mb-4 overflow-hidden rounded-full shadow-lg">
          <img class="object-cover w-full h-full" :src="image_profile" alt="Avatar" />
        </div>
        <div class="w-full text-center max-w-44">
          <h2 class="text-xl font-semibold break-words">{{ full_name }}</h2>
          <p class="text-lg text-[#2EBAA1] tracking-wide">{{ formatearTexto(role) }}</p>
        </div>
        <hr>
        <br>
      </div>
        <!-- Sidebar Navigation -->
        <nav class="mt-5">
          <div v-for="section in sections" :key="section.name" class="mb-4">
            <!-- Section Button -->
            <button
              @click="isOpen = true; toggleSubmenu(section.name)"
              class="flex items-center w-full text-left group"
              :class="isOpen ? 'px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-600' : 'justify-center mt-2'">
              <component
                :is="section.icon"
                :class="isOpen ? 'w-9 h-9' : 'w-6 h-6 mt-20'" 
                class="transition-transform transform group-hover:scale-110 duration-300"
              />
              <span
                v-if="isOpen"
                class="ml-4 text-base font-medium text-[#39B49E] dark:text-[#39B49E]">
                {{ section.label }}
              </span>
              <!-- Toggle Icon -->
              <svg v-if="section.submenus.length && isOpen"
                  :class="[section.isOpen ? 'rotate-180' : 'rotate-0']"
                  class="ml-auto w-5 h-5 transition-transform duration-300"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>


            <!-- Submenu -->
            <div v-if="section.isOpen && isOpen" class="pl-8 mt-2">
              <ul>
                <li v-for="submenu in section.submenus" :key="submenu.name" class="mb-1">
                  <router-link
                    :to="submenu.path"
                    class="flex items-center justify-between p-3 text-sm  transition duration-200"
                    :class="[
                      isActive(submenu)
                        ? 'bg-base text-white hover:bg-base dark:hover:bg-base'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                    style="margin: 0; width: 100%; box-sizing: border-box;">
                    {{ submenu.label }}
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sidebar Background and Text Color */
.sidebar {
  border-right: 1px solid #e5e7eb; /* Border light mode */
  transition: all 0.3s ease; /* Smooth transition */
}

.dark .sidebar {
  background-color: #1a202c; /* Dark mode background */
  color: #edf2f7; /* Light text in dark mode */
  border-right: 1px solid #374151; /* Dark mode border */
}

.sidebar .submenu-item {
  padding: 8px 16px; /* Adjust padding for submenu items */
}



</style>



