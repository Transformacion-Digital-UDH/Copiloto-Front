<template>
  <div class="bg-white rounded-lg p-4 flex flex-col items-center shadow-lg transition transform hover:scale-105">
    <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
    <p class="font-bold text-xl text-azul">{{ rol }}</p>
    <p class="text-gray-600 text-center">{{ nombre }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  rol: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    default: 'No asignado',
  },
});
</script>  