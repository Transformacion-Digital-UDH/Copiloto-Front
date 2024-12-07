<template>
  <table class="w-full max-w-4xl bg-white border rounded-md shadow">
    <thead>
      <tr class="text-center text-azul bg-gray-300 truncate">
        <th class="px-2 py-2 tracking-wider">ROL</th>
        <th class="px-2 py-2 tracking-wider">NOMBRE Y APELLIDO</th>
      </tr>
    </thead>
    <tbody>
    <tr v-if="jurados.length === 0">
      <td colspan="2" class="px-4 py-6 text-gray-500 text-center align-middle">
        <i class="fas fa-exclamation-circle mr-2 text-red-700"></i> Aún no se han asignado jurados.
      </td>
    </tr>
    <tr v-else v-for="(jurado, index) in jurados" :key="index" class="text-center uppercase border-b">
      <td class="px-4 py-2 text-base text-gray-600">
        <p class="truncate">{{ jurado.rol }}</p>
      </td>
      <td class="px-4 py-2 text-base text-gray-600">
        <p class="truncate">{{ jurado.nombre }}</p>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

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