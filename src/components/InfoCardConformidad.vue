<template>
  <div v-if="data" class="bg-baseClarito rounded-lg shadow-lg text-lg text-azul w-full px-2 py-6">
    <div class="space-y-6 relative max-w-[820px] w-full mx-auto">
      <!-- Información del Asesor -->
      <div class="bg-white rounded-lg p-4 flex items-center shadow-lg w-full">
        <i class="fas fa-user-tie text-azul text-3xl mr-4"></i>
        <div class="flex flex-col">
          <p class="text-sm font-bold text-azul uppercase">Asesor</p>
          <p class="text-sm text-black uppercase">
            {{ data.asesor || 'Asesor no asignado' }}
          </p>
        </div>
      </div>

      <!-- Título -->
      <div class="bg-white rounded-lg p-4 flex items-center shadow-md w-full">
        <i class="fas fa-file-alt text-[#39B49E] text-2xl mr-4"></i>
        <div class="flex flex-col">
          <p class="text-sm font-bold text-azul uppercase">
            Título Provisional del Proyecto de Investigación
          </p>
          <p class="text-sm text-black uppercase break-words">
            {{ data.titulo || 'Título no asignado' }} 
          </p>
        </div>
      </div>

      <!-- Enlace -->
      <div v-if="data.link" class="text-center mt-8">
        <a
          :href="data.link"
          target="_blank"
          class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-md transition-all duration-300">
          <i class="fas fa-external-link-alt"></i> Abrir proyecto
        </a>
      </div>

      <!-- Mensaje -->
      <p class="text-xs text-gray-600 text-center mt-6">
        Asegúrate de corregir y actualizar tu información en Google Docs antes de hacer clic en "Solicitar revisión"
      </p>
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
  },
});
</script>

<style scoped>
/* Manejo de títulos largos */
.titulo-largo {
  display: block;
  overflow: visible;
  white-space: normal;
  word-break: break-word; /* Permite dividir palabras largas */
}
</style>
