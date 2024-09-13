<script lang="ts">
import { defineComponent, ref, onMounted, markRaw } from 'vue';
import { useSidebar } from '@/assets/ts/useSidebar';
import { useDark } from '@vueuse/core';
import { useRoute } from 'vue-router';
import proyecto from '@/components/icons/proyecto.vue';
import ejecucion from '@/components/icons/ejecucion.vue';
import informe from '@/components/icons/informe.vue';
import sustentacion from  '@/components/icons/sustentacion.vue';
import cierre from '@/components/icons/cierre.vue';

export default defineComponent({
  data() {
    return {
      avatar: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=296&q=80',
      progreso: 30, // Valor inicial del progreso en porcentaje
    }
  },
  
  setup() {
    const { isOpen } = useSidebar();
    const isDark = useDark();

    const role = ref('');
    const full_name = ref('');
    const route = useRoute();

    // Definición de secciones con submenús
    const sections = ref([
      {
        name: 'ProyectoDeTesis',
        label: 'Proyecto Tesis',
        isOpen: false,
        icon: markRaw(proyecto),
        submenus: [
          { name: 'Designacion de asesor', 
            label: 'Designación de asesor', 
            path: '/estudiante/designacion-asesor' },

          { name: 'Conformidad por el asesor', 
            label: 'Conformidad por el asesor', 
            path: '/estudiante/conformidad-asesor' },

          { name: 'Designacion de jurados', 
            label: 'Designación de jurados', 
            path: '/estudiante/designacion-jurado' },

          { name: 'Conformidad por el jurado', 
            label: 'Conformidad por el jurado', 
            path: '/estudiante/conformidad-jurado' },

          { name: 'Aprobacion del proyecto', 
            label: 'Aprobación del proyecto', 
            path: '/estudiante/aprobacion-proyecto' },

          { name: 'Solicitar asesor', 
            label: 'Solicitar asesor', 
            path: '/asesor/solicitar-asesor' },
            
          { name: 'Designar asesor',
            label: 'Designar asesor',
            path: '/paisi/designar-asesor'},

          { name: 'Resolución asesor',
            label: 'Resolución asesor',
            path: '/facultad/resolucion-asesor'},

          { name: 'Solicitar revisión', 
            label: 'Solicitar revisión', 
            path: '/asesor/solicitar-revision' },

          { name: 'Designar jurados',
            label: 'Designar jurados',
            path: '/paisi/designar-jurado'},

          { name: 'Revisión jurado',
            label: 'Revisión jurado',
            path: '/jurado/revision-jurado'},

          { name: 'Revisión presidente',
            label: 'Revisión presidente',
            path: '/jurado/revision-presidente'},
          
          { name: 'Aprobar proyecto',
            label: 'Aprobacion proyecto',
            path: '/paisi/aprobar-proyecto'},

          { name: 'Resolución proyecto',
            label: 'Resolución proyecto',
            path: '/facultad/resolucion-proyecto'},
        ]
      },
      {
        name: 'Ejecucion',
        label: 'Ejecución',
        isOpen: false,
        icon: markRaw(ejecucion),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/ejecucion/submenu1' },
        ]
      },
      {
        name: 'InformeFinal',
        label: 'Informe Final',
        isOpen: false,
        icon: markRaw(informe),
        submenus: [
          { name: 'Conformidad del Informe Final por el Asesor', 
            label: 'Conformidad por el asesor', 
            path: '/estudiante/conformidad-informe-asesor' },

          { name: 'Designacion de Jurado para el Informe Final', 
            label: 'Designacion de Jurado', 
            path: '/estudiante/designacion-informe-jurado' },

          { name: 'Conformidad de Informe Final por los Jurados', 
            label: 'Conformidad Jurados', 
            path: '/estudiante/conformidad-informe-jurado' },

          { name: 'Aprobacion de Informe Final por los Jurados', 
            label: 'Aprobacion del Informe ', 
            path: '/estudiante/aprobacion-informe' },

          { name: 'Conformidad por Integridad VRI', 
            label: 'Conformidad por Integridad VRI', 
            path: '/estudiante/conformidad-vri' },

          { name: 'Revisión informe', 
            label: 'Revisión informe', 
            path: '/asesor/revision-informe' },
          
          { name: 'Designar jurado', 
            label: 'Designar jurado', 
            path: '/paisi/designarJurado-informe' },

          { name: 'Revisión jurado', 
            label: 'Revisión jurado', 
            path: '/jurado/revisionJurado-informe' },
            
          { name: 'Revisión presidente', 
            label: 'Revisión presidente', 
            path: '/jurado/revisionJuradoPresidente-informe' },

          { name: 'Aprobar informe',
            label: 'Aprobacion informe',
            path: '/paisi/aprobar-informe'},

          { name: 'Resolución informe',
            label: 'Resolución informe',
            path: '/facultad/resolucion-informe'},

        ]
      },
      {
        name: 'Sustentacion',
        label: 'Sustentación',
        isOpen: false,
        icon: markRaw(sustentacion),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/sustentacion/submenu1' },
        ]
      },
      {
        name: 'Cierre',
        label: 'Cierre de Tramites',
        isOpen: false,
        icon: markRaw(cierre),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/cierre/submenu1' },
        ]
      }
    ]);

    // Función para alternar la visibilidad de los submenús
    const toggleSubmenu = (name: string) => {
      const section = sections.value.find(section => section.name === name);
      if (section) {
        section.isOpen = !section.isOpen;
      }
      };
      
      
    const isActive = (submenu: any) => {
      // compara la ruta actual con la sección seleccionada.
      return route.path.includes(submenu.path); 
    };

    const openSectionIfActive = () => {
      sections.value.forEach(section => {
        section.isOpen = section.submenus.some(submenu => isActive(submenu));
      });
    };

    onMounted(() => {
      full_name.value = localStorage.getItem('full_name') || '';
      role.value = localStorage.getItem('role') || '';
      openSectionIfActive();

    })

    return {
      isOpen,
      sections,
      toggleSubmenu,
      isDark,
      full_name,
      role,
      isActive
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

    <div :class="[
      isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in',
      'fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform',
      isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900',
      'sidebar'
    ]">
      <!-- LOGO COPILOTO -->
      <div class="flex items-center justify-center mt-8">
        <a aria-label="Inicio">
          <img v-if="isDark" class="w-auto h-10" src="/img/logo_dark.svg" alt="Logo" />
          <img v-else class="w-auto h-10" src="/img/logo_light.svg" alt="Logo" />
        </a>
      </div>

      <!-- INFO DEL ESTUDIANTE COMO EL NOMBRE -->
      <div class="flex flex-col items-center justify-center mt-6">
        <div class="w-24 h-24 mb-4 overflow-hidden rounded-full shadow-lg">
          <img class="object-cover w-full h-full" :src="avatar" alt="Avatar" />
        </div>
        <div class="w-full text-center max-w-44">
          <h2 class="text-xl font-semibold break-words">{{ full_name }}</h2>
          <p class="text-base break-words">{{ role }}</p>
        </div>
      </div>

      <!-- INFO DEL ESTUDIANTE COMO PROGRESO -->
      <div class="px-6 mt-6 mb-8">
        <div class="flex justify-between mb-4">
          <span class="font-medium">Progreso General</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div :style="{ width: progreso + '%' }" class="bg-blue-600 h-2.5 rounded-full"></div>
          <span class="text-sm font-medium text-blue-700 dark:text-blue-200">{{ progreso }}%</span>
        </div>
      </div>
      <hr />

      <nav class="mt-5 mb-10">
      <!-- Secciones Dinámicas -->
      <div v-for="section in sections" :key="section.name" class="mb-4">
        <button
          @click="toggleSubmenu(section.name)"
          class="flex w-full items-center px-6 py-2 mt-4 duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group" >
          <component :is="section.icon" class="w-8 h-8 transition-transform transform group-hover:translate-x-2 duration-300" />
          <span class="mx-4 text-left text-sl font-medium transition-transform transform group-hover:translate-x-2 duration-300">
          {{ section.label }}
        </span>
          <svg
            v-if="!section.isOpen"
            viewBox="0 0 24 24"
            class="w-4 h-4 ml-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
            class="w-4 h-4 ml-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            transform="rotate(270)"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M11.9999 13.9394L17.4696 8.46973L18.5303 9.53039L11.9999 16.0607L5.46961 9.53039L6.53027 8.46973L11.9999 13.9394Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <div v-if="section.isOpen">
          <ul class="pl-8">
            <li v-for="submenu in section.submenus" :key="submenu.name">
              <router-link
                :to="submenu.path"
                class="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                :class="[
                  isActive(submenu) ? 'bg-base text-white hover:bg-base dark:hover:bg-base' : ''
                ]"
              >
                {{ submenu.label }}
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
/* Estilos específicos para el modo oscuro */
.dark .sidebar {
  background-color: #1a202c; /* Fondo oscuro */
  color: #edf2f7; /* Texto claro */
}

.dark .hover:bg-gray-200 {
  background-color: #482d2d; /* Color de fondo para hover en modo oscuro */
}
/* Estilos específicos para el modo oscuro */
.dark .sidebar {
  background-color: #1a202c; /* Fondo oscuro */
  color: #edf2f7; /* Texto claro */
}

.dark .hover:bg-gray-200 {
  background-color: #482d2d; /* Color de fondo para hover en modo oscuro */
}

.sidebar ul li .text-sm {
  font-size: 0.875rem; /* Ajusta el tamaño de fuente para los submenús */
}

</style>
