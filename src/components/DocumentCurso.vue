<template>
  <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
    <div class="flex flex-col md:flex-row justify-between md:items-center text-gray-700 font-medium ">
      <span class="flex-1 text-xm bg-gray-50">{{ titulo }}</span>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
        <div
          v-if="estado === 'aprobado'"
          class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
          <a 
            :href="dynamicHref"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
            <i class="fas fa-eye mr-2"></i> Ver
          </a>
        </div>

        <span v-else class="text-gray-500 italic text-sm">
          El documento aún no se ha cargado
        </span>

        <span :class="`estado-estilo estado-${estado.toLowerCase().replace(' ', '-')}`">
          {{ formatearTexto(estado) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const BASE_URL = import.meta.env.VITE_URI_BACK;

const props = defineProps({
  titulo: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
  },
  view: {
    type: String,
    default: "",
  },
});

const dynamicHref = computed(() => {
  return props.view.startsWith("http") ? props.view : `${BASE_URL}${props.view}`;
});

const formatearTexto = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  
</script>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  display: inline-block;
}
.estado-no-iniciado,
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-aprobado {
  background-color: #38a169;
  color: #ffffff;
}
</style>
  