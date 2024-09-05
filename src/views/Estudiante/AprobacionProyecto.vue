<script lang="ts" setup>
import { ref } from 'vue';

const tramites = ref([
  { titulo: 'Trámite en el sistema', estado: 'Hecho' },
  { titulo: 'Pago de Trámite', estado: 'Hecho' },
  { titulo: 'Oficio de secretaria PAISI', estado: 'Pendiente', archivo: 'Oficio xxxxxx.jpg' },
  { titulo: 'Resolución de Facultad', estado: 'Pendiente', archivo: 'Resolucion xxxxxx.jpg' },
]);
</script>

<template>
  <div class="flex-1 p-6 font-Roboto">
    <h3 class="text-4xl font-medium text-center text-gray-700 mb-6">
      Aprobación de proyectos de tesis por la facultad
    </h3>

    <!-- Sección 1: Inicio de Trámite -->
    <h2 class="text-2xl font-medium text-black">
      1. Inicio de Trámite
    </h2>
    <div class="mt-4">
      <div class="flex flex-col space-y-6">
        <div v-for="(tramite, index) in tramites.slice(0, 2)" :key="index" class="bg-white rounded-md shadow-xl px-6 py-4 flex items-center justify-between">
          <h4 class="text-lg font-light text-gray-800 flex-1">
            {{ tramite.titulo }}
          </h4>
          <span :class="{
            'estado-hecho': tramite.estado === 'Hecho',
            'estado-pendiente': tramite.estado === 'Pendiente',
          }" class="estado-estilo ml-4">
            {{ tramite.estado }}
          </span>
        </div>
      </div>
    </div>

    <!-- Sección 2: Solicitud de aprobación de oficio -->
    <div class="mt-8">
      <h2 class="text-2xl font-medium text-black">
        2. Solicitud de aprobación de oficio (Secretaria PAISI)
      </h2>
      <div class="mt-4">
        <div class="bg-white rounded-md shadow-xl px-5 py-6 flex items-center justify-between">
          <div class="flex flex-col flex-1">
            <label for="oficio" class="text-lg font-medium text-gray-800 mb-2">
              Oficio de secretaria PAISI
            </label>
            <input id="oficio" type="text" :value="tramites[2].archivo" class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" disabled>
          </div>
          <span :class="{
            'estado-hecho': tramites[2].estado === 'Hecho',
            'estado-pendiente': tramites[2].estado === 'Pendiente',
          }" class="estado-estilo ml-4">
            {{ tramites[2].estado }}
          </span>
        </div>
      </div>
    </div>

    <!-- Sección 3: Emisión de Resolución (Facultad) -->
    <div class="mt-8">
      <h2 class="text-2xl font-medium text-black">
        3. Emisión de Resolución (Facultad)
      </h2>
      <div class="mt-4">
        <div class="bg-white rounded-md shadow-xl px-5 py-6 flex items-center justify-between">
          <div class="flex flex-col flex-1">
            <label for="resolucion" class="text-lg font-medium text-gray-800 mb-2">
              Resolución de Facultad
            </label>
            <input id="resolucion" type="text" :value="tramites[3].archivo" class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" disabled>
          </div>
          <span :class="{
            'estado-hecho': tramites[3].estado === 'Hecho',
            'estado-pendiente': tramites[3].estado === 'Pendiente',
          }" class="estado-estilo ml-4">
            {{ tramites[3].estado }}
          </span>
        </div>
      </div>
    </div>

    <!-- Botón de siguiente -->
    <div class="flex justify-end mt-8">
      <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>
        Siguiente
      </button>
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

.estado-hecho {
  background-color: #48BB78;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898AA;
  color: #ffffff;
}
</style>
