<template>
    <!-- Mensaje cuando no hay jurados -->
    <div v-if="jurados.length === 0" class="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-4">
      <i class="fas fa-exclamation-circle text-red-500 text-2xl"></i>
      <p class="text-gray-600">Aún no se han asignado jurados.</p>
    </div>

    <!-- Lista de jurados en una fila -->
    <div v-else class="flex flex-wrap gap-4">
      <div
        v-for="(jurado, index) in jurados"
        :key="index"
        class="bg-gray-50 border border-gray-200 rounded-md shadow p-4 flex-1 min-w-[300px] text-center hover:shadow-md transition-all"
      >
        <!-- Rol del jurado -->
        <p class="text-lg font-semibold text-azul">Rol</p>
        <p class="text-xm font-medium text-base mb-2 capitalize">{{ jurado.rol }}</p>

        <!-- Nombre del jurado -->
        <p class="text-lg font-semibold text-azul"> Apellido y Nombre</p>
        <p class="text-sm font-medium text-gray-700 capitalize">{{ jurado.nombre }}</p>
      </div>
    </div>
    </template>

<script lang="ts" setup>
import type { PropType } from "vue";

interface Jurado {
  rol: string;
  nombre: string;
}

const props = defineProps({
  jurados: {
    type: Array as PropType<Jurado[]>,
    required: true,
  },
});
</script>

<style scoped>
/* Sombra suave al pasar el mouse */
.hover\:shadow-md:hover {
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
}

/* Fondo para las tarjetas */
.bg-gray-50 {
  background-color: #f9fafb;
}

/* Bordes suaves */
.border-gray-200 {
  border-color: #e5e7eb;
}

/* Bordes para error */
.border-red-200 {
  border-color: #fecaca;
}

/* Color para iconos de error */
.text-red-500 {
  color: #ef4444;
}
</style>
