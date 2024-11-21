<template>
<div class="bg-white rounded-lg p-4 flex flex-col items-center shadow-lg w-full">
  <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
  <p class="font-bold text-xl text-azul">{{ letraMayus(rol) }}</p>
  <p class="text-gray-600 text-center uppercase">{{ letraMayus(nombre) }}</p>
</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "JuradoCard",
  props: {
    rol: {
      type: String,
      required: true,
      default: '',
    },
    nombre: {
      type: String,
      default: 'No asignado',
    },
  },
  methods: {
    letraMayus(text: string): string {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
  }
});
</script>
<style scoped>
</style>