<script lang="ts" setup>
import { ref } from 'vue';

const observaciones = ref([
  { descripcion: 'Reporte.xlsx', revision: 5, fecha: '10/08/2023', accion: 'Solicitar revisión', estado: 'Pendiente' },
]);

const solicitudEstado = ref('Pendiente');
const informeEstado = ref('Pendiente');

function solicitarRevision() {
  // Lógica para solicitar revisión
}

</script>

<template>
    <div class="flex-1 flex flex-col font-roboto">
      <div class="flex-1 p-6  ">
        <h3 class="text-4xl font-medium text-black text-center mb-6">Conformidad de proyecto de tesis por el asesor</h3>

        <div class="mb-8 " >
          <p class="text-lg"><strong>Asesor:</strong> Aldo Ramirez</p>
          <p class="text-lg"><strong>Título de Tesis:</strong> Implementacion de un algoritmo</p>
          <p class="text-lg"><strong>Link de tesis:</strong> <a href="https://docs.google.com/document/" class="text-blue-500 underline">https://docs.google.com/document/</a></p>
        </div>

        <!-- Observaciones -->
        <div class="mb-8">
          <h4 class="text-2xl font-medium text-black mb-4">1. Observaciones</h4>
          <p class="text-gray-500 mb-4">Haz click en el botón de Solicitar Revisión para iniciar</p>
          <button class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" @click="solicitarRevision">Solicitar Revisión</button>
          <span :class="{'estado-pendiente': solicitudEstado === 'Pendiente'}" class="estado-estilo ml-4">{{ solicitudEstado }}</span>
        </div>

        <!-- Solicitar revisión de levantamiento de observaciones -->
        <div class="mb-8">
          <h4 class="text-2xl font-medium text-black mb-4">2. Solicitar revisión de levantamiento de observaciones</h4>
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 border-b">DESCRIPCION</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">ACCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(obs, index) in observaciones" :key="index">
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">{{ obs.descripcion }}</a></td>
                <td class="px-4 py-2 border-b">{{ obs.revision }}</td>
                <td class="px-4 py-2 border-b">{{ obs.fecha }}</td>
                <td class="px-4 py-2 border-b">
                  <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>{{ obs.accion }}</button>
                </td>
                <td class="px-4 py-2 border-b"><span :class="{'estado-pendiente': obs.estado === 'Pendiente'}" class="estado-estilo">{{ obs.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Informe de Conformidad de Observaciones -->
        <div class="mb-8">
          <h4 class="text-2xl font-medium text-black mb-4">3. Informe de Conformidad de Observaciones</h4>
          <div class="bg-white rounded-md shadow-xl custom-rounded px-5 py-6">
            <p class="mb-4 text-1xl">Por tu asesor elegido</p>
            <div class="flex items-center justify-between mb-4">
              <input id="informe" type="text" value="imageattachment.jpg" class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" disabled>
              <span :class="{'estado-pendiente': informeEstado === 'Pendiente'}" class="estado-estilo ml-4">{{ informeEstado }}</span>
            </div>
          </div>
        </div>

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

.estado-pendiente {
  background-color: #8898AA;
  color: #ffffff;
}
</style>
