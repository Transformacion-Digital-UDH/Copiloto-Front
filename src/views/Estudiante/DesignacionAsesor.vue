<script lang="ts" setup>
import { ref } from 'vue';

const trámites = ref([
  { título: 'Trámite en el Sistema', estado: 'Completado' },
  { título: 'Pago de Trámite', estado: 'En Proceso' },
  { título: 'Solicitud de Asesor', estado: 'Pendiente' },
  { título: 'Título de Tesis', estado: 'Pendiente' },
  { título: 'Carta del Asesor Elegido', estado: 'Pendiente' },
  { título: 'Oficio de Secretaría PAISI', estado: 'Pendiente' },
  { título: 'Resolución de Facultad', estado: 'Pendiente' },
]);
</script>

<template>
  <div class="flex-1 p-6 font-Roboto">
    <h3 class="text-4xl font-medium text-center text-gray-700">
      Designación de Asesor
    </h3>
    <div class="mt-6">
      <!-- Sección 1: Inicio de Trámite -->
      <h2 class="text-2xl font-medium text-black">
        1. Inicio de Trámite
      </h2>
      <div class="mt-4">
        <div class="flex flex-col space-y-6">
          <div v-for="(trámite, index) in trámites.slice(0, 3)" :key="index"
            class="bg-white rounded-md shadow-xl px-6 py-4 flex items-center justify-between">
            <h4 class="text-lg font-light text-gray-800 flex-1">
              {{ trámite.título }}
            </h4>
            <span :class="{
              'estado-completado': trámite.estado === 'Completado',
              'estado-en-proceso': trámite.estado === 'En Proceso',
              'estado-pendiente': trámite.estado === 'Pendiente',
            }" class="estado-estilo ml-4">
              {{ trámite.estado }}
            </span>
          </div>
        </div>
      </div>

      <!-- Sección 2: Solicitud de Asesor -->
      <div class="mt-8">
        <h2 class="text-2xl font-medium text-black">
          2. Solicitud de Asesor
        </h2>
        <div class="mt-4">
          <div class="bg-white rounded-md shadow-xl custom-rounded px-5 py-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-light text-gray-800 flex-1">
                {{ trámites[3].título }}
              </h4>
              <span :class="{
                'estado-completado': trámites[3].estado === 'Completado',
                'estado-en-proceso': trámites[3].estado === 'En Proceso',
                'estado-pendiente': trámites[3].estado === 'Pendiente',
              }" class="estado-estilo ml-4">
                {{ trámites[3].estado }}
              </span>
            </div>
            <input id="tituloTesis" type="text" value="Implementación de un chatbot para el sistema de trámite"
              class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              disabled>
            <!-- Selección de Asesor -->
            <label for="asesor" class="block text-lg font-medium text-gray-800 mb-2">
              Elige tu asesor
            </label>
            <select id="asesor"
              class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6">
              <option>Aldo Ramirez</option>
              <option>Otra opción</option>
            </select>

            <!-- Botón de Enviar -->
            <div class="flex justify-end">
              <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>
                Enviar
              </button>
            </div>
          </div>
        </div>

        <!-- Sección 3: Respuesta del asesor -->
        <div class="mt-8">
          <h2 class="text-2xl font-medium text-black">
            3. Respuesta del Asesor
          </h2>
          <div class="mt-4">
            <div class="bg-white rounded-md shadow-xl custom-rounded px-5 py-4 mb-1">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-light flex-1">
                  {{ trámites[4].título }}
                </h4>
                <span :class="{
                  'estado-completado': trámites[4].estado === 'Completado',
                  'estado-en-proceso': trámites[4].estado === 'En Proceso',
                  'estado-pendiente': trámites[4].estado === 'Pendiente',
                }" class="estado-estilo ml-4">
                  {{ trámites[4].estado }}
                </span>
              </div>
              <div class="flex justify-center mt-3">
                <input id="CartaAsesor" value="Carta del Asesor"
                  class="w-full max-w-md p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                  disabled>
              </div>
            </div>
          </div>


          <!-- Sección 4: Solicitud de Emisión PAISI -->
          <div class="mt-8">
            <h2 class="text-2xl font-medium text-black">
              4. Solicitud de Emisión (PAISI)
            </h2>
            <div class="mt-4">
              <div class="bg-white rounded-md shadow-xl custom-rounded px-5 py-4 mb-1">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-light flex-1">
                    {{ trámites[5].título }}
                  </h4>
                  <span :class="{
                    'estado-completado': trámites[5].estado === 'Completado',
                    'estado-en-proceso': trámites[5].estado === 'En Proceso',
                    'estado-pendiente': trámites[5].estado === 'Pendiente',
                  }" class="estado-estilo ml-4">
                    {{ trámites[5].estado }}
                  </span>
                </div>
                <div class="flex justify-center mt-3">
                  <input id="OficioPaisi" value="Oficio PAISI"
                    class="w-full max-w-md p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                    disabled>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección 5: Emisión de Resolución Facultad -->
          <div class="mt-8">
            <h2 class="text-2xl font-medium text-black">
              5. Resolución de Facultad de Designación de Asesor
            </h2>
            <div class="mt-4">
              <div class="bg-white rounded-md shadow-xl custom-rounded px-5 py-4 mb-1">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-light flex-1">
                    {{ trámites[6].título }}
                  </h4>
                  <span :class="{
                    'estado-completado': trámites[6].estado === 'Completado',
                    'estado-en-proceso': trámites[6].estado === 'En Proceso',
                    'estado-pendiente': trámites[6].estado === 'Pendiente',
                  }" class="estado-estilo ml-4">
                    {{ trámites[6].estado }}
                  </span>
                </div>
                <div class="flex justify-center mt-3">
                  <input id="ResolucionFacultad" value="Resolución de Facultad"
                    class="w-full max-w-md p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                    disabled>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de ir a siguiente -->
          <div class="flex justify-end mt-8">
            <button class="px-4 py-2 bg-blue-500 text-white rounded-md">
              Ir a Siguiente
            </button>
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
  font-weight: 400;
  /* Cambiar a 400 para un grosor más delgado */
  border-radius: 0.375rem;
}

.estado-completado {
  background-color: #48BB78;
  color: #ffffff;
}

.estado-en-proceso {
  background-color: #E89519;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898AA;
  color: #ffffff;
}
</style>
