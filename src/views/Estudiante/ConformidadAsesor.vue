<script lang="ts" setup>
import { reactive, ref } from 'vue';

// Define los tipos para observaciones y documentos
interface Observacion {
  descripcion: string;
  revision: number;
  fecha: string;
  accion: string;
  estado: string;
}

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Estado de solicitud (reactivo usando ref)
const solicitudEstado = ref<string>('Pendiente');

// Observaciones es un array reactivo de tipo Observacion usando reactive
const observaciones = reactive<Observacion[]>([
  { descripcion: 'Reporte.xlsx', revision: 5, fecha: '10/08/2023', accion: 'Solicitar revisión', estado: 'Pendiente' }
]);

// Documentos es un array reactivo de tipo Documento usando reactive
const documentos = reactive<Documento[]>([
  { nombre: 'Informe de Conformidad de Observaciones', estado: 'Hecho', documentoUrl: 'imageattachment.jpg' }
]);

// Función para cambiar el estado de la solicitud
function solicitarRevision() {
  solicitudEstado.value = 'En Proceso';
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
</script>

<template>
  <div class="flex-1 p-10 border-s-2 bg-gray-100 font-roboto">
    <h3 class="text-4xl font-bold text-center text-azul">Conformidad de proyecto de tesis por el asesor</h3>

    <div class="mt-6 space-y-10">
      <!-- Información del asesor y tesis -->
      <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-white">
        <p class="text-lg mb-2"><strong>Asesor:</strong> Aldo Ramirez</p>
        <p class="text-lg mb-2"><strong>Título de Tesis:</strong> Implementación de un algoritmo</p>
        <!-- Responsividad para el link de tesis -->
        <p class="text-lg break-words">
          <strong>Link de tesis:</strong> 
          <a href="https://docs.google.com/document/" class="text-blue-500 underline break-all">https://docs.google.com/document/</a>
        </p>
      </div>

      <!-- Observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-4">1. Observaciones</h4>
        <div class="flex items-center justify-between">
          <p class="text-gray-500">Haz click en el botón de Solicitar Revisión para iniciar</p>
          <!-- solicitudEstado es un ref, así que aquí sí usamos .value -->
          <span :class="estadoClase(solicitudEstado)" class="estado-estilo ml-4">{{ solicitudEstado }}</span>

        </div>
        <div class="flex justify-center mt-4">
          <button class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-600" @click="solicitarRevision">Solicitar Revisión</button>
        </div>
      </div>

      <!-- Revisión de levantamiento de observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-4">2. Solicitar revisión de levantamiento de observaciones</h4>
        <!-- Hacemos la tabla responsiva con overflow-x-auto -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 border-b">DESCRIPCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">ACCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">Estado</th>
              </tr>
            </thead>
            <tbody>
              <!-- observaciones es un reactive, así que NO usamos .value para las propiedades internas -->
              <tr v-for="(obs, index) in observaciones" :key="index">
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">{{ obs.descripcion }}</a></td>
                <td class="px-4 py-2 border-b">{{ obs.revision }}</td>
                <td class="px-4 py-2 border-b">{{ obs.fecha }}</td>
                <td class="px-4 py-2 border-b">
                  <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>{{ obs.accion }}</button>
                </td>
                <td class="px-4 py-2 border-b"><span :class="estadoClase(obs.estado)" class="estado-estilo">{{ obs.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">3. Documentos</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4" />
        </div>

        <div class="mt-4 space-y-4">
          <!-- documentos es un reactive, así que NO usamos .value para las propiedades internas -->
          <div v-for="(documento, index) in documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <span class="flex-1">{{ documento.nombre }}</span>

              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <!-- Mostrar botones "Ver" y "Descargar" si el estado es 'Hecho' -->
                <div v-if="documento.estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                  <!-- Botón de Ver -->
                  <a :href="documento.documentoUrl" target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- Botón de Descargar -->
                  <a :href="documento.documentoUrl" download
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <!-- Mostrar mensaje de espera si el estado es 'Pendiente' -->
                <span v-else-if="documento.estado === 'Pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>

                <!-- Estado del documento -->
                <span :class="estadoClase(documento.estado)" class="estado-estilo ml-4">{{ documento.estado }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de siguiente -->
      <div class="flex justify-end">
        <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>Siguiente</button>
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

 