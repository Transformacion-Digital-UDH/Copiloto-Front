<template>
<div class="bg-baseClarito rounded-lg p-4 flex flex-col items-center shadow-lg w-full">
  <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
  <p class="font-bold text-lg text-azul">{{ formatearTexto(rol) }}</p>
  <p class="text-gray-700 text-center text-sm uppercase">{{ formatearTexto(nombre) }}</p>
</div>

</template>

<script lang="ts" setup>

const props = defineProps({
  rol: {
    type: String,
    required: true,
    default: '',
  },
  nombre: {
    type: String,
    default: 'No asignado',
  },
});

const formatearTexto = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

</script>