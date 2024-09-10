<script lang="ts" setup>
import { ref, computed } from 'vue';

// Definir tipos para trámites y documentos
interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Estado general del sistema
const estadoTramite = ref('Pendiente');  // Puede ser: Pendiente, En Proceso, Hecho

// Trámites del sistema
const tramites = ref([
  { titulo: 'Trámite en el Sistema', estado: 'Pendiente' },
  { titulo: 'Pago de Trámite', estado: 'Pendiente' },
]);

// Documentos para la aprobación del proyecto
const documentos = ref<Documento[]>([
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' },
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },
]);

// Computed para habilitar el botón "Siguiente" solo si todos los trámites y documentos están en "Hecho"
const todosCompletos = computed(() => {
  const tramitesHechos = tramites.value.every(tramite => tramite.estado === 'Hecho');
  const documentosHechos = documentos.value.every(documento => documento.estado === 'Hecho');
  return tramitesHechos && documentosHechos;
});

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'Hecho':
      return 'bg-green-500 text-white';
    case 'Pendiente':
      return 'bg-gray-400 text-white';
    default:
      return '';
  }
};

</script>

<template>
  <div class="flex-1 p-10 bg-gray-100 font-Roboto">
    <h3 class="text-4xl font-semibold text-center text-azul">Aprobación del Informe Final por la facultad</h3>

    <div class="mt-6 space-y-10">
      <!-- Card 1: Inicio de Trámite -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <h2 class="text-2xl font-medium text-black">1. Inicio de Trámite</h2>
        <!-- Listado de trámites dinámico -->
        <div class="mt-4 space-y-6">
          <div v-for="(tramite, index) in tramites" :key="index"
            class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
            <h4 class="text-black flex-1">{{ tramite.titulo }}</h4>
            <span :class="estadoClase(tramite.estado)" class="estado-estilo ml-4">{{ tramite.estado }}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-medium text-black">2. Documentos</h2>

        <!-- Listado de documentos -->
        <div class="mt-4 space-y-6">
          <div v-for="(documento, index) in documentos" :key="index"
            class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
            <!-- Nombre del documento -->
            <span class="text-black flex-1">{{ documento.nombre }}</span>

            <div class="flex space-x-4 items-center">
              <!-- Botón de Ver -->
              <a v-if="documento.estado === 'Hecho'" :href="documento.documentoUrl" target="_blank"
                class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                <i class="fas fa-eye mr-2"></i> Ver
              </a>

              <!-- Botón de Descargar -->
              <a v-if="documento.estado === 'Hecho'" :href="documento.documentoUrl" download
                class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
               <i class="fas fa-download mr-2"></i> Descargar
              </a>

              <!-- Estado del documento -->
              <span :class="estadoClase(documento.estado)" class="estado-estilo">{{ documento.estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón "Siguiente" -->
      <div class="flex justify-end mt-8">
        <button :disabled="!todosCompletos"
          :class="todosCompletos ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'"
          class="px-4 py-2 text-white rounded-md">
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}
</style>
