<template>
  <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
    <div class="flex flex-col md:flex-row justify-between md:items-center">
      <span class="flex-1 text-xm bg-gray-50">{{ titulo }}</span>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
        <!-- boton ir al curso -->
        <div v-if="estado === 'pendiente'" class="flex">
          <a
            href="https://tucoach.udh.edu.pe/curso/buenas-practicas-para-la-presentacion-de-la-tesis"
            target="_blank"
            class="px-4 py-2 w-28 text-center text-white rounded-md text-md transition bg-base hover:bg-azul">Ir al curso
          </a>
        </div>
        <!-- para ver documetno -->
        <div v-if="estado === 'aprobado'" class="flex items-center space-x-4">
          <a
            :href="view"
            target="_blank"
            class="flex items-center px-2 py-1 border rounded text-gray-600 border-gray-400 hover:bg-baseClarito w-full md:w-auto justify-center">
            <i class="fas fa-eye mr-2"></i> Ver
          </a>
        </div>

        <span :class="`estado-estilo estado-${estado.toLowerCase().replace(' ', '-')}`">
          {{ formatearTexto(estado) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-aprobado {
  background-color: #38a169;
  color: #ffffff;
}
</style>
  