<template>
    <div class="relative" v-for="(info, index) in infoModal" :key="index">
      <!-- Contenedor flexible para el título e ícono -->
      <div class="flex items-start justify-between space-x-2">
        <!-- Título -->
        <h2 class="flex-grow text-black font-medium text-sm sm:text-base">
          {{ info.title }}
        </h2>
  
        <!-- Ícono con tooltip -->
        <div class="group relative inline-block flex-shrink-0">
          <!-- Ícono de información -->
          <img
            src="/icon/info2.svg"
            alt="Info"
            class="w-4 h-4 cursor-pointer"
          />
  
          <!-- Tooltip responsivo y correctamente posicionado -->
          <div
            class="absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg w-40 sm:w-56 max-w-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          >
            <!-- Triángulo del tooltip -->
            <div
              class="absolute top-0 left-1/2 mr-5 transform -translate-x-1/2 -translate-y-full w-2 h-2 bg-white border-t border-l border-gray-300 rotate-45 sm:left-auto sm:right-4"
            >
            </div>
            <!-- Texto del tooltip -->
            <p class="text-xs sm:text-xs pr-3 text-gray-700 text-left leading-snug break-words">
              {{ info.info }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from "vue";
  
  const props = defineProps({
    infoModal: {
      type: Array,
      required: true,
      default: () => [{ title: "", info: "" }],
    },
  });
  </script>
  
  <style scoped>
  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  
  /* Tamaño fijo del ícono */
  img {
    width: 1rem; /* Tamaño fijo del ícono */
    height: 1rem;
  }
  
  /* Tooltip responsivo */
  .tooltip {
    word-wrap: break-word; /* Asegura que el texto se ajuste */
   /* max-width: 70%; /* Ajuste máximo para pantallas móviles */
    white-space: normal; /* Permite que el texto ocupe varias líneas */
  }
  
  /* Corrección del posicionamiento para pantallas pequeñas */
  @media (max-width: 640px) {
    .tooltip {
      left: 10%; /* Añade margen desde el borde izquierdo */
      right: 50%; /* Añade margen desde el borde derecho */
      transform: none; /* Quita el centrado absoluto */
      max-width: calc(80% - 20%); /* Limita el ancho para que no se desborde */
    }
  }
  </style>
  