<template>
  <div class="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
    <i class="fas fa-calendar-alt text-blue-500 text-3xl mb-2"></i>
    <span class="block text-lg font-semibold text-gray-700 mt-2">Fecha de Sustentación</span>
    <span class="text-gray-600 text-center mt-2 text-2xl">{{ fecha || 'Fecha no asignada' }}</span>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
    <i class="fas fa-clock text-blue-500 text-3xl mb-2"></i>
    <span class="block text-lg font-semibold text-gray-700 mt-2">Hora de Sustentación</span>
    <span class="text-gray-600 text-center mt-2 text-2xl">{{ hora || 'Hora no asignada' }}</span>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps({
  fecha: {
    type: String,
    default: null,
  },
  hora: {
    type: String,
    default: null,
  },
});

</script>