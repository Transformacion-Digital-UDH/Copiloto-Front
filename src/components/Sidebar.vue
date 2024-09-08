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
      <div class="flex flex-col items-center justify-center mt-10">
        <div class="w-24 h-24 mb-4 overflow-hidden rounded-full shadow-lg">
          <img class="object-cover w-full h-full" :src="avatar" alt="Avatar" />
        </div>
        <div class="w-full text-center max-w-44">
          <h2 class="text-xl font-semibold break-words">{{ full_name }}</h2>
          <p class="text-base break-words">{{ role }}</p>
        </div>
      </div>

      <!-- INFO DEL ESTUDIANTE COMO PROGRESO -->
      <div class="px-6 mt-6 mb-10">
        <div class="flex justify-between mb-4">
          <span class="font-medium">Progreso General</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div :style="{ width: progreso + '%' }" class="bg-blue-600 h-2.5 rounded-full"></div>
          <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ progreso }}%</span>
        </div>
      </div>
      <hr />

      <nav class="mt-5 mb-10">
        <!-- Secciones Dinámicas -->
        <div v-for="section in sections" :key="section.name" class="mb-4">
          <button
            @click="toggleSubmenu(section.name)"
            class="flex w-full items-center px-6 py-2 mt-4 duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <component :is="section.icon" />
            <span class="mx-4">{{ section.label }}</span>
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
            <ul class="pl-4">
              <li v-for="submenu in section.submenus" :key="submenu.name">
                <router-link
                  :to="submenu.path"
                  class=""
                  :class="[
                    'block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700',
                    isActive(submenu) ? 'bg-green-500 text-white hover:bg-green-500 dark:hover:bg-green-500' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
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

<script lang="ts">
import { defineComponent, ref, onMounted, markRaw } from 'vue';
import { useSidebar } from '@/assets/ts/useSidebar';
import { useDark } from '@vueuse/core';
import IconProject from '@/components/icons/IconProject.vue';
import IconExecution from '@/components/icons/IconExecution.vue';
import IconFinally from '@/components/icons/IconFinally.vue';
import IconTest from '@/components/icons/IconTest.vue';
import IconClosed from '@/components/icons/IconClosed.vue';
import { useRoute } from 'vue-router';

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
        icon: markRaw(IconProject),
        submenus: [
          { name: 'Designacion de asesor', label: 'Designación de asesor', path: '/estudiante/designacion-asesor' },
          { name: 'Conformidad por el asesor', label: 'Conformidad por el asesor', path: '/estudiante/conformidad-asesor' },
          { name: 'Designacion de jurados', label: 'Designación de jurados', path: '/estudiante/designacion-jurado' },
          { name: 'Conformidad por el jurado', label: 'Conformidad por el jurado', path: '/estudiante/conformidad-jurado' },
          { name: 'Aprobacion del proyecto', label: 'Aprobación del proyecto', path: '/estudiante/aprobacion-proyecto' },
          { name: 'Solicitud asesoria', label: 'Solicitud asesoria', path: '/asesor/solicitud-asesoria' },
          { name: 'Proyecto Tesis', label: 'Proyecto tesis', path: '/asesor/proyecto-tesis' },
          { name: 'Solicitud Jurado', label: 'Solicitud Jurado', path: '/jurado/solicitud-jurado' },
          { name: 'Jurado Presidente', label: 'Jurado Presidente', path: '/jurado/solicitud-jurado-presidente' },
        ]
      },
      {
        name: 'Ejecucion',
        label: 'Ejecución',
        isOpen: false,
        icon: markRaw(IconExecution),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/ejecucion/submenu1' },
          { name: 'Submenu2', label: 'Submenu 2', path: '/ejecucion/submenu2' },
          { name: 'Submenu3', label: 'Submenu 3', path: '/ejecucion/submenu3' },
          { name: 'Submenu4', label: 'Submenu 4', path: '/ejecucion/submenu4' }
        ]
      },
      {
        name: 'InformeFinal',
        label: 'Informe Final',
        isOpen: false,
        icon: markRaw(IconFinally),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/informe-final/submenu1' },
          { name: 'Submenu2', label: 'Submenu 2', path: '/informe-final/submenu2' },
          { name: 'Submenu3', label: 'Submenu 3', path: '/informe-final/submenu3' },
          { name: 'Submenu4', label: 'Submenu 4', path: '/informe-final/submenu4' }
        ]
      },
      {
        name: 'Sustentacion',
        label: 'Sustentación',
        isOpen: false,
        icon: markRaw(IconTest),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/sustentacion/submenu1' },
          { name: 'Submenu2', label: 'Submenu 2', path: '/sustentacion/submenu2' },
          { name: 'Submenu3', label: 'Submenu 3', path: '/sustentacion/submenu3' },
          { name: 'Submenu4', label: 'Submenu 4', path: '/sustentacion/submenu4' }
        ]
      },
      {
        name: 'Cierre',
        label: 'Cierre',
        isOpen: false,
        icon: markRaw(IconClosed),
        submenus: [
          { name: 'Submenu1', label: 'Submenu 1', path: '/cierre/submenu1' },
          { name: 'Submenu2', label: 'Submenu 2', path: '/cierre/submenu2' },
          { name: 'Submenu3', label: 'Submenu 3', path: '/cierre/submenu3' },
          { name: 'Submenu4', label: 'Submenu 4', path: '/cierre/submenu4' }
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

<style scoped>
/* Estilos específicos para el modo oscuro */
.dark .sidebar {
  background-color: #1a202c; /* Fondo oscuro */
  color: #edf2f7; /* Texto claro */
}

.dark .hover:bg-gray-200 {
  background-color: #482d2d; /* Color de fondo para hover en modo oscuro */
}
</style>
