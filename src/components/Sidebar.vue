<template>
  <div class="flex">
    <!-- Backdrop -->
    <div
      :class="isOpen ? 'block' : 'hidden'"
      @click="isOpen = false"
      class="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"
    ></div>
    <!-- End Backdrop -->

    <div
      :class="isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'"
      class="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white sidebar lg:translate-x-0 lg:static lg:inset-0"
    >
      <!-- LOGO COPILOTO -->
      <div class="flex items-center justify-center mt-8">
          <a aria-label="Inicio">
            <img class="h-10 w-auto" src="/img/logo.svg" alt="Logo" />
          </a>
      </div>

      <!-- INFO DEL ESTUDIANTE COMO EL NOMBRE -->
      <div class="flex flex-col items-center justify-center mt-10">
        <div class="w-24 h-24 overflow-hidden rounded-full shadow-lg mb-4">
          <img
            class="object-cover w-full h-full"
            :src="EstudianteAvatar"
            alt="Avatar"/>
        </div>
        <div class="text-center w-full max-w-44">
          <h2 class="text-xl font-semibold break-words">{{ EstudianteNombre }}</h2>
          <p class="text-base text-gray-600 break-words">{{ EstudianteCarrera }}</p>
        </div>
        
      </div>

      <!-- INFO DEL ESTUDIANTE COMO PROGRESO -->
      <div class="mt-6 px-6 mb-10">
        <div class="flex justify-between mb-4">
          <span class="text-base font-medium text-black">Progreso General</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div :style="{ width: progreso + '%' }" class="bg-blue-600 h-2.5 rounded-full"></div>
          <span class="text-sm font-medium text-blue-700">{{ progreso }}%</span>
        </div>
      </div><hr>

      <nav class="mt-5 mb-10">
        <!-- Secciones Dinámicas -->
        <div v-for="section in sections" :key="section.name" class="mb-4">
          <button @click="toggleSubmenu(section.name)" class="flex items-center px-6 py-2 mt-4 duration-200 cursor-pointer">
            <span v-if="section.name !== 'Bienvenidos'" v-html="section.icon" class="w-5 h-5 text-black"></span>
            <span class="mx-4 text-black text-base">{{ section.label }}</span><svg v-if="!section.isOpen" viewBox="0 0 24 24" class="ml-auto h-4 w-4" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M11.9999 13.9394L17.4696 8.46973L18.5303 9.53039L11.9999 16.0607L5.46961 9.53039L6.53027 8.46973L11.9999 13.9394Z"
                  fill="#000000"></path>
              </g>
            </svg>
            <svg v-else viewBox="0 0 24 24" class="ml-auto h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg"
              transform="rotate(270)">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M11.9999 13.9394L17.4696 8.46973L18.5303 9.53039L11.9999 16.0607L5.46961 9.53039L6.53027 8.46973L11.9999 13.9394Z"
                  fill="#000000"></path>
              </g>
            </svg>
          </button>
          <div v-if="section.isOpen">
            <ul class="pl-4">
              <li v-for="submenu in section.submenus" :key="submenu.name">
                <router-link :to="submenu.path" class="block px-4 py-2 text-gray-600 hover:bg-gray-200">
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
import { defineComponent, ref } from 'vue';
import { useSidebar } from '../assets/ts/useSidebar';

export default defineComponent({
  data() {
    return {
      EstudianteNombre: 'Renzo Paolo Luciano Estela',
      EstudianteCarrera: 'Ingeniería de Sistemas',
      EstudianteAvatar: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=296&q=80',
      progreso: 30, // Valor inicial del progreso en porcentaje
    };
  },

  setup() {
    const { isOpen } = useSidebar();

    // Definición de secciones con submenús
    const sections = ref([
      { 
        name: 'ProyectoDeTesis', 
        label: 'Proyecto Tesis',
        isOpen: false,
        icon: '<img src="/img/project-icon.svg" alt="Icono Proyecto Tesis">',
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

          { name: 'Solicitud asesoria', 
            label: 'Solicitud asesoria', 
            path: '/asesor/solicitud-asesoria' },

          { name: 'Proyecto Tesis', 
            label: 'Proyecto tesis', 
            path: '/asesor/proyecto-tesis' },
        ]
      },
      { 
        name: 'Ejecucion', 
        label: 'Ejecución',
        isOpen: false,
        icon: '<img src="/img/execution-icon.svg" alt="Icono Proyecto Tesis">',
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
        icon: '<img src="/img/finally-icon.svg" alt="Icono Proyecto Tesis">',
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
        icon: '<img src="/img/test-icon.svg" alt="Icono Proyecto Tesis">',
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
        icon: '<img src="/img/closed-icon.svg" alt="Icono Proyecto Tesis">',
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

    return {
      isOpen,
      sections,
      toggleSubmenu
    };
  }
});
</script>

<style scoped>
/* Puedes agregar estilos específicos para tu sidebar aquí */
</style>