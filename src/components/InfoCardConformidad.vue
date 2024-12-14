<template>
  <div v-if="data" class="rounded-lg text-xm text-azul w-full p-2 flex flex-col md:flex-row items-start mb-0">
    <!-- Imagen a la izquierda -->
    <div class="flex justify-center items-center w-full md:w-1/2">
      <img src="/img/conformidad1.svg" alt="Conformidad" class="w-full max-w-[400px] md:max-w-[520px] ">
    </div>

    <!-- Contenido principal -->
    <div class="space-y-5 relative w-full md:w-1/2 p-2 ">
      <!-- Información del Asesor -->
      <div class="bg-baseClarito rounded-lg p-4 mr-10 shadow-md w-full sm:w-96 md:w-[400px] lg:w-[500px] text-center hover:shadow-lg transition-all">
        <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
        <p class="font-bold text-lg text-azul mb-2">Asesor</p>
        <p class="text-gray-700 uppercase text-sm font-medium">
          {{ data.asesor || 'No asignado' }}
        </p>
      </div>

      <!-- Título -->
      <div class="bg-baseClarito rounded-lg p-4 mr-10 shadow-md w-full sm:w-96 md:w-[400px] lg:w-[500px] text-center hover:shadow-lg transition-all">
        <i class="fas fa-file-alt text-azul text-4xl mb-2"></i>
        <p class="font-bold text-lg text-azul mb-2">Título de Proyecto de Investigación</p>
        <p class="text-gray-700 uppercase text-sm font-medium">
          {{ data.titulo || 'Sin título' }}  
        </p>
      </div>
    </div>
  </div>
    <!-- Botón para abrir el proyecto -->
    <div v-if="data.link" class="flex justify-center ">
        <a
          :href="data.link"
          target="_blank"
          class="inline-block bg-azul text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-xm font-medium">
          <i class="fas fa-external-link-alt mr-2"></i> Abrir proyecto
        </a>
      </div>
      <!-- Mensaje -->
      <p class="text-sm text-gray-500 text-center pt-4">
        Asegúrate de corregir y actualizar tu información del proyecto de investigación en Google Docs antes de hacer clic en
        <strong class="text-g font-medium">"Solicitar revisión"</strong>.
      </p>
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
.text-g {
  color: #39B49E;
}

.hover\:shadow-lg:hover {
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.1);
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
