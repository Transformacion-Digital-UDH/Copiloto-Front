<template>
  <div v-if="data" class="bg-baseClarito rounded-lg shadow-lg text-xm text-azul w-full p-6">
    <div class="space-y-4 relative max-w-[820px] w-full mx-auto">
      <!-- Información del Asesor -->
      <div class="grid grid-cols-1 gap-6">
        <div class="bg-white rounded-lg p-4 flex flex-col items-center shadow-lg w-full">
          <i class="fas fa-user-tie text-azul text-2xl mb-3"></i>
          <p class="font-bold text-xm text-azul">Asesor</p>
          <p class="text-gray-600 text-center uppercase text-sm">
            {{ data.asesor || 'Asesor no asignado' }}
          </p>
        </div>
      </div>

      <!-- Título -->
      <div class="bg-white rounded-lg p-6 shadow-lg max-w-[820px] w-full mx-auto">
        <div class="flex py-2 px-2">
          <i class="fa-regular fa-file text-azul text-2xl mb-3"></i>
          <p class="font-bold text-xm text-azul"> Título provisional</p>
        </div>
        <p class="max-full text-sm text-gray-600 uppercase text-center">
          {{ data.titulo || 'Título no asignado' }}
        </p>
      </div>

      <!-- Enlace -->
      <div v-if="data.link" class="text-center mt-6">
        <a
          :href="data.link"
          target="_blank"
          class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <i class="fas fa-external-link-alt"></i> Abrir proyecto
        </a>
      </div>

      <!-- Mensaje -->
      <p class="text-sm text-gray-600 text-center">Asegúrate de corregir y actualizar tu información en Google Docs antes de hacer clic en "Solicitar revisión"</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

interface InfoCardData {
  asesor?: string;
  titulo?: string;
  link?: string;
}

const props = defineProps({
  data: {
    type: Object as PropType<InfoCardData>,
    required: true,
  }
});
</script>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
  display: inline-block;
}
.text-center {
  text-align: center;
  padding: 1rem;
}
</style>