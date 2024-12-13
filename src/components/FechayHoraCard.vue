<template>
  <div class="bg-white rounded-lg shadow-md p-6 text-center border border-gray-300">
    <i class="fas fa-calendar-alt text-[#39B49E] text-3xl mb-2"></i>
    <span class="block text-lg font-semibold text-azul mt-2">Fecha de sustentación</span>
    <span class="text-gray-600 text-center mt-2 text-lg">{{ fecha || 'Fecha no asignada' }}</span>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6 text-center border border-gray-300">
    <i class="fas fa-clock text-[#39B49E] text-3xl mb-2"></i>
    <span class="block text-lg font-semibold text-azul mt-2">Hora de sustentación</span>
    <span class="text-gray-600 text-center mt-2 text-lg">{{ hora || 'Hora no asignada' }}</span>
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