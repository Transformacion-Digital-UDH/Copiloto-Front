<script lang="ts" setup>
import { ref, computed } from 'vue';

// Definir tipos para trámites y documentos
interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}
interface Trámite {
  título: string;
  estado: string;
}

// Estado general del punto 2
const estadoPunto2 = ref('En Proceso');  // Estados: Pendiente, En Proceso, Hecho

const trámites = ref<Trámite[]>([
  { título: 'Trámite en el Sistema', estado: 'Hecho' }  // Punto 1
]);

// Documentos para el punto 2 (Respuesta del asesor) y 3
const documentos = ref<Documento[]>([
  { nombre: 'Respuesta del asesor', estado: 'Rechazado', documentoUrl: '' },  // Punto 2
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' },  // Punto 3
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },  // Punto 3
]);

// Simulación del título de tesis y asesor como si vinieran del backend
const tituloTesis = ref('Implementación de un chatbot para el sistema de trámite');
const nombreAsesor = ref('Aldo Ramirez');  // Simulación del nombre del asesor desde el backend

// Estados separados para los modales
const mostrarModalTramite = ref(false);
const mostrarModalDocumentos = ref(false);
const mostrarModalCambioJurado = ref(false);

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'Hecho':
      return 'bg-green-500 text-white';
    case 'En Proceso':
      return 'bg-orange-500 text-white';
    case 'Pendiente':
      return 'bg-gray-400 text-white';
    case 'Rechazado':
      return 'bg-red-500 text-white';
    default:
      return '';
  }
};

// Función para solicitar cambio de jurado
const solicitarCambioJurado = (jurado: any) => {
  alert(`Has solicitado el cambio del jurado: ${jurado.nombre}`);
  // Aquí puedes agregar la lógica adicional para solicitar el cambio del jurado
};

// Computed para habilitar el botón "Siguiente" solo si todos los trámites y documentos están en "Hecho"
const todosCompletos = computed(() => {
  const tramitesHechos = trámites.value.every(tramite => tramite.estado === 'Hecho');
  const documentosHechos = documentos.value.every(documento => documento.estado === 'Hecho');
  return tramitesHechos && documentosHechos && estadoPunto2.value === 'Hecho';
});

// Simulación de la respuesta del asesor desde el backend
const respuestaAsesor = (respuesta: 'aceptar' | 'rechazar') => {
  if (respuesta === 'aceptar') {
    documentos.value[0].estado = 'Aceptado'; // El asesor aceptó
    documentos.value[0].documentoUrl = '/docs/respuesta_asesor.pdf'; // Documento disponible
    estadoPunto2.value = 'Hecho'; // Cambia el estado general del punto 2 a "Hecho"
    alert('El asesor ha aceptado. El documento está disponible para ver y descargar.');
  } else if (respuesta === 'rechazar') {
    documentos.value[0].estado = 'Rechazado'; // El asesor rechazó
    estadoPunto2.value = 'Pendiente';  // Vuelve a "Pendiente"
    alert('El asesor ha rechazado, por favor espera otra respuesta.');
  }
};
</script>

<template>
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
    <!-- Título principal -->
    <h3 class="text-4xl font-semibold text-center text-azul">Designación de Asesor</h3>
    <br>
    <p class="text-gray-500 text-center">Cada punto en este proceso debe estar en Hecho para que pueda continuar con el siguiente tramite | El pago de este tramite se sumara al pago del monto final de toda la Tesis </p>

    <div class="mt-6 space-y-10">

      <!-- Card 1: Inicio de Trámite (sin "Pago de Trámite") -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">1. Inicio de Trámite</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
               @mouseover="mostrarModalTramite = true"
               @mouseleave="mostrarModalTramite = false" />
        </div>

        <div v-show="mostrarModalTramite" class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">
            Asegurate de haber realizado el tramite de Designacion de Asesor en el sistema de Login de la UDH.
          </p>
        </div>

        <!-- Listado de trámites dinámico -->
        <div class="mt-4 space-y-6">
          <div v-for="(trámite, index) in trámites" :key="index"
            class=" bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
            <h4 class=" text-black flex-1">{{ trámite.título }}</h4>
            <span :class="estadoClase(trámite.estado)" class="estado-estilo ml-4">{{ trámite.estado }}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Solicitud de Asesor -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">2. Solicitud de Asesor</h2>
          <span :class="estadoClase(estadoPunto2)" class="estado-estilo ml-4">{{ estadoPunto2 }}</span>
        </div>

        <div class="mt-4">
          <!-- Título de tesis -->
          <label for="tituloTesis" class="block text-lg font-medium text-gray-800 mb-2">Título de Tesis</label>
          <input id="tituloTesis" type="text" v-model="tituloTesis"
            class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            disabled>

          <!-- Nombre del Asesor -->
          <label for="nombreAsesor" class="block text-lg font-medium text-gray-800 mb-2">Nombre del Asesor</label>
          <input id="nombreAsesor" type="text" v-model="nombreAsesor"
            class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            disabled>

          <!-- Respuesta del asesor -->
          <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <h4 class="text-black flex-1">Respuesta del asesor</h4>
              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <div v-if="documentos[0].estado === 'Aceptado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
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

                <!-- Mensaje de espera o rechazo según el estado -->
                <span v-else-if="documentos[0].estado === 'Pendiente'" class="text-gray-500 italic">Esperando la respuesta del asesor...</span>
                <span v-else-if="documentos[0].estado === 'Rechazado'" class="text-red-500 italic">El asesor ha rechazado la solicitud.</span>

                <!-- Estado del documento -->
                <span :class="estadoClase(documentos[0].estado)" class="estado-estilo ml-4">{{ documentos[0].estado }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">3. Documentos</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
               @mouseover="mostrarModalDocumentos = true"
               @mouseleave="mostrarModalDocumentos = false" />
        </div>

        <div v-show="mostrarModalDocumentos"
          class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">
            Por favor espere  que se carguen los documentos que verifican su tramite de Designacion de Asesor para continuar con el siguiente paso.
          </p>
        </div>

        <div class="mt-4 space-y-4">
        <!-- Listado de documentos -->
        <div v-for="(documento, index) in documentos.slice(1)" :key="documento.nombre"
          class="bg-gray-50 p-4 border border-gray-200 rounded-md">
          <div class="flex flex-col md:flex-row justify-between md:items-center">
            <!-- Nombre del documento -->
            <span class="w-full md:w-auto mb-2 md:mb-0">{{ documento.nombre }}</span>

            <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
              <!-- Mostrar botones si el documento está listo -->
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

              <!-- Mensaje de que aún no está cargado -->
              <span v-else class="text-gray-500 italic">El documento aún no se ha cargado</span>

              <!-- Estado del documento -->
              <span :class="estadoClase(documento.estado)" class="estado-estilo ml-4">{{ documento.estado }}</span>
            </div>
          </div>
        </div>
      </div>

      </div>

      <!-- Botón "Siguiente" habilitado cuando todos los estados están completos -->
      <div class="flex justify-end mt-6">
        <button :disabled="!todosCompletos" class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed"
          :class="todosCompletos ? 'bg-green-600 hover:bg-base cursor-pointer' : 'bg-gray-300 cursor-not-allowed'">
          Siguiente
        </button>
      </div>

      <!-- Card 4: Solicitar cambio de jurado -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-gray-500"> Solicitar cambio de asesor</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
               @mouseover="mostrarModalCambioJurado = true"
               @mouseleave="mostrarModalCambioJurado = false" />
        </div>

        <div v-show="mostrarModalCambioJurado" class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">
            Puedes solicitar el cambio de uno o más jurados si consideras necesario.
          </p>
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
  font-weight: 400;
  border-radius: 0.375rem;
}
</style>
