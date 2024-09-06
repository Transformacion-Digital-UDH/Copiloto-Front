<script lang="ts" setup>
import { ref } from 'vue';

const procesos = ref([
  { título: 'Trámite en el sistema', estado: 'Hecho' },
  { título: 'Pago de Trámite', estado: 'Hecho' },
  { título: 'Solicitar Jurados', estado: 'En Proceso' },
  { título: 'Oficio múltiple con los jurados seleccionados', estado: 'Pendiente' },
  { título: 'Solicitar cambio de jurado', estado: 'No solicitado' },
]);
</script>

<template>
  <div class="flex-1 p-6 font-Roboto">
    <h3 class="text-4xl font-medium text-center text-gray-700">
      Designación de Jurados para el Proyecto de Tesis
    </h3>
    <div class="mt-6">

      <!-- Sección 1: Inicio de Trámite -->
      <h2 class="text-2xl font-medium text-black">
        1. Inicio de Trámite
      </h2>
      <div class="mt-4">
        <div class="flex flex-col space-y-6">
          <div v-for="(proceso, index) in procesos.slice(0, 2)" :key="index"
            class="bg-white rounded-md shadow-xl px-6 py-4 flex items-center justify-between">
            <h4 class="text-lg font-light text-gray-800 flex-1">
              {{ proceso.título }}
            </h4>
            <span :class="{
              'estado-hecho': proceso.estado === 'Hecho',
              'estado-en-proceso': proceso.estado === 'En Proceso',
              'estado-pendiente': proceso.estado === 'Pendiente',
              'estado-no-solicitado': proceso.estado === 'No solicitado',
            }" class="estado-estilo ml-4">
              {{ proceso.estado }}
            </span>
          </div>
        </div>
      </div>

      <!-- Sección 2: Solicitar Designación de Jurados -->
      <div class="mt-8">
        <h2 class="text-2xl font-medium text-black">
          2. Solicitar designación de Jurados
        </h2>
        <div class="mt-4">
          <div class="bg-white rounded-md shadow-xl px-5 py-6">
            <!-- Contenedor del título y estado en una fila -->
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-light text-gray-800">
                Haz click en el botón de Solicitar Jurados para seguir con el proceso
              </h4>
              <span class="estado-estilo estado-en-proceso">En Proceso</span>
            </div>
            <!-- Botón centrado abajo -->
            <div class="flex justify-center mt-6">
              <button class="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed" disabled>
                SOLICITAR JURADOS
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 3: Designación de Jurados por el Coordinador -->
      <div class="mt-8">
        <h2 class="text-2xl font-medium text-black">
          3. Designación de Jurados por el Coordinador
        </h2>
        <div class="mt-4">
          <div class="bg-white rounded-md shadow-xl px-5 py-6 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-light text-gray-800 flex-1">
                Oficio múltiple con los jurados seleccionados
              </h4>
              <span class="estado-estilo estado-pendiente ml-4">Pendiente</span>
            </div>
            <div class="flex justify-center mt-3">
              <input id="OficioJurados" type="text" value="imageattachment.jpg"
                class="w-full max-w-md p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                disabled>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 4: Solicitar Cambio de Jurado -->
      <div class="mt-8">
        <h2 class="text-2xl font-medium text-black">
          4. Solicitar cambio de jurado
        </h2>
        <div class="mt-4">
          <div class="bg-white rounded-md shadow-xl px-5 py-6">
            <!-- Contenedor del título y estado en una fila -->
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-light text-gray-800">
                Haz click en el botón de Solicitar cambio de jurado
              </h4>
              <span class="estado-estilo estado-no-solicitado">No solicitado</span>
            </div>
            <!-- Botón centrado abajo -->
            <div class="flex justify-center mt-6">
              <button class="px-4 py-2 bg-base text-white rounded-md flex justify-center">
                SOLICITAR CAMBIO DE JURADOS
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
}

.estado-hecho {
  background-color: #48bb78;
  color: white;
}

.estado-en-proceso {
  background-color: #E89519;
  color: white;
}

.estado-pendiente {
  background-color: #8898AA;
  color: white;
}

.estado-no-solicitado {
  background-color: #555555;
  color: white;
}
</style>
