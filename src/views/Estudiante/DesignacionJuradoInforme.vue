<script lang="ts" setup>
import { ref, computed } from 'vue';

// Estado y datos para Designación de Jurados
const procesos = ref([
  { título: 'Trámite en el sistema', estado: 'Hecho' },
  { título: 'Pago de Trámite', estado: 'Hecho' },
  { título: 'Solicitar Jurados', estado: 'Pendiente' },
  { título: 'Tus jurados seleccionados', estado: 'Hecho' }, // Nuevo estado para los jurados
  { título: 'Solicitar cambio de jurado', estado: 'No solicitado' },
]);

// Jurados seleccionados
const jurados = ref([
  { rol: 'Vocal', nombre: 'Lucas Vadivia' },
  { rol: 'Presidente', nombre: 'Sebastian Martínez' },
  { rol: 'Secretario', nombre: 'Lorenzo Perez' }
]);

// Documentos asociados a la designación
const documentos = ref([
  { nombre: 'Oficio Múltiple (Facultad)', estado: 'Hecho', documentoUrl: '/docs/informe_de_conformidad.jpg' }
]);

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'Hecho':
      return 'bg-green-500 text-white';
    case 'En Proceso':
      return 'bg-orange-500 text-white';
    case 'Pendiente':
      return 'bg-gray-400 text-white';
    case 'No solicitado':
      return 'bg-gray-500 text-white';
    default:
      return '';
  }
};

// Función para solicitar jurados y cambiar el estado
const solicitarJurados = () => {
  procesos.value[2].estado = 'Hecho'; // Cambiar el estado de 'Solicitar Jurados' a 'Hecho'
  procesos.value[3].estado = 'Hecho'; // Cambiar también el estado de 'Tus jurados seleccionados' a 'Hecho'
  isSolicitarJuradosDisabled.value = true; // Deshabilitar el botón
};

// Función para solicitar cambio de jurado
const solicitarCambioJurado = () => {
  alert('Cambio de jurado solicitado.');
};

// Estado para habilitar/deshabilitar el botón de solicitar jurados
const isSolicitarJuradosDisabled = ref(false);

// Función que verifica si los estados del punto 1 al 3 están en 'Hecho'
const puedeContinuar = computed(() => {
  return procesos.value.slice(0, 4).every(proceso => proceso.estado === 'Hecho');
});
</script>

<template>
  <div class="flex-1 p-10 bg-gray-100 font-Roboto">
    <!-- Título principal -->
    <h3 class="text-4xl font-semibold text-center text-azul">Designación de Jurados para el Informe Final</h3>

    <div class="mt-6 space-y-10">
      <!-- Card 1: Inicio de Trámite -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-medium text-black">1. Inicio de Trámite</h2>

        <!-- Listado de trámites dinámico -->
        <div class="mt-4 space-y-6">
          <div v-for="(proceso, index) in procesos.slice(0, 2)" :key="index"
            class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
            <h4 class="text-black flex-1">{{ proceso.título }}</h4>
            <span :class="estadoClase(proceso.estado)" class="estado-estilo ml-4">{{ proceso.estado }}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Solicitar designación de Jurados -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-medium text-black mb-4">2. Solicitar designación de Jurados</h2>
        <div class="flex items-center justify-between">
          <p class="text-lg text-gray-500">Haz click en el botón para solicitar jurados.</p>
          <span :class="estadoClase(procesos[2].estado)" class="estado-estilo ml-4">{{ procesos[2].estado }}</span>
        </div>

        <div class="flex justify-center mt-4">
            <button :disabled="isSolicitarJuradosDisabled" @click="solicitarJurados"
              :class="isSolicitarJuradosDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-green-600'"
              class="px-4 py-2 text-white rounded-md">
              SOLICITAR JURADOS
            </button>
        </div>
      </div>

     <!-- Card 3: Jurados seleccionados -->
        <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-medium text-black">3. Tus jurados seleccionados son:</h2>
            <span :class="estadoClase(procesos[3].estado)" class="estado-estilo ml-4">{{ procesos[3].estado }}</span>
        </div>
        
        <!-- Tabla centrada y con ajuste de ancho -->
        <div class="mt-4 flex justify-center">
            <table class="w-full max-w-2xl text-left bg-gray-50 border border-gray-200 rounded-md shadow">
            <thead>
                <tr>
                <th class="px-4 py-2 text-azul border-b">ROL</th>
                <th class="px-4 py-2 text-azul border-b">NOMBRE Y APELLIDO</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(jurado, index) in jurados" :key="index" class="bg-white">
                <td class="px-4 py-2 border-b">{{ jurado.rol }}</td>
                <td class="px-4 py-2 border-b">{{ jurado.nombre }}</td>
                </tr>
            </tbody>
            </table>
        </div>
  
 
</div>


      <!-- Card 4: Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-medium text-black">4. Documentos</h2>

        <div class="mt-4">
          <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <!-- Nombre del documento -->
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
                <!-- Mostrar mensaje de espera si el estado es 'Pendiente' -->
                <span v-else-if="documentos[0].estado === 'Pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>

                <!-- Estado del documento -->
                <span :class="estadoClase(documentos[0].estado)" class="estado-estilo ml-4">{{ documentos[0].estado }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Siguiente -->
      <div class="flex justify-end mt-6">
        <button :disabled="!puedeContinuar" class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed"
          :class="puedeContinuar ? 'bg-green-600 hover:bg-base cursor-pointer' : 'bg-gray-300 cursor-not-allowed'">
          Siguiente
        </button>
      </div>

      <!-- Card 5: Solicitar cambio de jurado -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">Solicitar cambio de jurado</h2>
          <span :class="estadoClase(procesos[4].estado)" class="estado-estilo ml-4">{{ procesos[4].estado }}</span>
        </div>

        <div class="mt-4">
          <p class="text-lg text-gray-800">Haz click en el botón para solicitar un cambio de jurado.</p>
          <div class="flex justify-center mt-6">
            <button class="px-4 py-2 bg-base text-white rounded-md" @click="solicitarCambioJurado">
              SOLICITAR CAMBIO DE JURADO
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
  font-weight: 500;
  border-radius: 0.375rem;
}
</style>
