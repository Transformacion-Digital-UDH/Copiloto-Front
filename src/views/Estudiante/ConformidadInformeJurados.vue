<script lang="ts" setup>
import { ref, computed } from 'vue';

// Estado del punto 1 (Observaciones)
const solicitudEstado = ref<string>('Pendiente');

// Estado del punto 3 (Informe de Conformidad de Observaciones)
const documentos = ref([
  { nombre: 'Informe de Conformidad de Observaciones', estado: 'Hecho', documentoUrl: 'Informe de conformidad.jpg' }
]);

// Función para cambiar el estado del punto 1 a "Hecho"
function solicitarRevision() {
  solicitudEstado.value = 'Hecho';  // Cambia el estado del punto 1 a "Hecho"
}

// Método para determinar la clase del estado basado en el estado del documento o solicitud
function estadoClase(estado: string) {
  switch (estado) {
    case 'Hecho': return 'bg-green-500 text-white';
    case 'En Proceso': return 'bg-orange-500 text-white';
    case 'Pendiente': return 'bg-gray-400 text-white';
    case 'Rechazado': return 'bg-red-500 text-white';
    default: return '';
  }
}

// Computed para habilitar el botón "Siguiente" solo si el Punto 1 y el Punto 3 están en "Hecho"
const puedeContinuar = computed(() => {
  return solicitudEstado.value === 'Hecho' && documentos.value[0].estado === 'Hecho';
});
</script>

<template>
  <div class="flex-1 p-10 bg-gray-100 font-roboto ">
    <h3 class="text-4xl font-bold text-center text-azul mb-4">Conformidad del Informe Final por los jurados</h3>

    <!-- Información del Título de Tesis -->
    <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-white mb-4">
      <p class="text-lg mb-2"><strong>Título de Tesis:</strong> Implementación de un algoritmo xxxxxxxxxxxxxxxxxxxxxxx</p>
      <p class="text-lg break-words">
        <strong>Link de informe final:</strong> 
        <a href="https://docs.google.com/document/" class="text-blue-500 underline">https://docs.google.com/document/</a>
      </p>
    </div>

    <div class="space-y-10">
      <!-- Punto 1: Observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-4">1. Observaciones</h4>
        <div class="flex items-center justify-between">
          <p class="text-gray-500">Haz click en el botón de Solicitar Revisión para iniciar</p>
          <span :class="estadoClase(solicitudEstado)" class="estado-estilo ml-4">{{ solicitudEstado }}</span>
        </div>
        <div class="flex justify-center mt-4">
          <button class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-600" @click="solicitarRevision">Solicitar revisión</button>
        </div>
      </div>

      <!-- Punto 2: Solicitar revisión de levantamiento de observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-4">2. Solicitar revisión</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 border-b">JURADO</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">CARGO</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">DESCRIPCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="px-4 py-2 border-b">Aldo Ramirez</td>
                <td class="px-4 py-2 border-b">Presidente</td>
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">Reporte.xlsx</a></td>
                <td class="px-4 py-2 border-b">7</td>
                <td class="px-4 py-2 border-b">13/10/2024</td>
              </tr>
              <tr>
                <td class="px-4 py-2 border-b">Juan Huapalla</td>
                <td class="px-4 py-2 border-b">Secretario</td>
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">Reporte.xlsx</a></td>
                <td class="px-4 py-2 border-b">4</td>
                <td class="px-4 py-2 border-b">13/10/2024</td>
              </tr>
              <tr>
                <td class="px-4 py-2 border-b">Cristian Soto</td>
                <td class="px-4 py-2 border-b">Vocal</td>
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">Reporte.xlsx</a></td>
                <td class="px-4 py-2 border-b">5</td>
                <td class="px-4 py-2 border-b">13/10/2024</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Punto 3: Documentos (Informe de Conformidad de Observaciones) -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-4">3. Informe de conformidad de observaciones</h4>
        <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
          <div class="flex flex-col md:flex-row justify-between md:items-center">
            <span class="flex-1">{{ documentos[0].nombre }}</span>
            <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
              <!-- Mostrar botones "Ver" y "Descargar" si el estado es 'Hecho' -->
              <div v-if="documentos[0].estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                <!-- Botón de Ver -->
                <a :href="documentos[0].documentoUrl" target="_blank"
                  class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                  <i class="fas fa-eye mr-2"></i> Ver
                </a>
                <!-- Botón de Descargar -->
                <a :href="documentos[0].documentoUrl" download
                  class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                  <i class="fas fa-download mr-2"></i> Descargar
                </a>
              </div>
              <span :class="estadoClase(documentos[0].estado)" class="estado-estilo ml-4">{{ documentos[0].estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de siguiente -->
      <div class="flex justify-end">
        <button :disabled="!puedeContinuar" :class="puedeContinuar ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'" class="px-4 py-2 text-white rounded-md">
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
  font-weight: 600;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}
</style>
