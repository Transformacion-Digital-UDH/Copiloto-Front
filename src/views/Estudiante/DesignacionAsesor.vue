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
  documentos?: Documento[]; // Lista de documentos opcional en los trámites
}

// Estado general del punto 2
const estadoPunto2 = ref('Pendiente');  // Estados: Pendiente, En Proceso, Hecho

// Trámites en el punto 1
const trámites = ref<Trámite[]>([
  { título: 'Trámite en el Sistema', estado: 'Pendiente' },  // Punto 1
  { título: 'Pago de Trámite', estado: 'Pendiente' },        // Punto 1
]);

// Documentos para el punto 2 (Respuesta del asesor) y 3
const documentos: Documento[] = [
  { nombre: 'Respuesta del asesor', estado: 'Aceptado', documentoUrl: '' },  // Punto 2
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' },  // Punto 3
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },  // Punto 3
];

// Título de tesis simulado como si viniera del backend
const tituloTesis = ref('Implementación de un chatbot para el sistema de trámite');
const mostrarModal = ref(false);

// Asesor seleccionado
const asesorSeleccionado = ref('');

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

// Computed para habilitar el botón "Enviar" cuando el asesor esté seleccionado
const puedeEnviar = computed(() => asesorSeleccionado.value !== '' && estadoPunto2.value !== 'Hecho');

// Computed para habilitar el botón "Siguiente" solo si todos los trámites y documentos están en "Hecho"
const todosCompletos = computed(() => {
  const tramitesHechos = trámites.value.every(tramite => tramite.estado === 'Hecho');
  const documentosHechos = documentos.every(documento => documento.estado === 'Hecho');
  return tramitesHechos && documentosHechos && estadoPunto2.value === 'Hecho';
});

// Método para manejar el envío
const enviarSolicitud = () => {
  if (asesorSeleccionado.value) {
    documentos[0].estado = 'Pendiente';  // Reiniciar el estado de la respuesta del asesor a "Pendiente"
    estadoPunto2.value = 'En Proceso';  // Cambia a "En Proceso" cuando se selecciona un asesor
    alert(`Has seleccionado a ${asesorSeleccionado.value}. Ahora debes esperar la respuesta del asesor.`);
  }
};

// Simulación de la respuesta del asesor desde el backend
const respuestaAsesor = (respuesta: 'aceptar' | 'rechazar') => {
  if (respuesta === 'aceptar') {
    documentos[0].estado = 'Aceptado'; // El asesor aceptó
    documentos[0].documentoUrl = '/docs/respuesta_asesor.pdf'; // Documento disponible
    estadoPunto2.value = 'Hecho'; // Cambia el estado general del punto 2 a "Hecho"
    alert('El asesor ha aceptado. El documento está disponible para ver y descargar.');
  } else if (respuesta === 'rechazar') {
    documentos[0].estado = 'Rechazado'; // El asesor rechazó
    estadoPunto2.value = 'Pendiente';  // Vuelve a "Pendiente" para seleccionar otro asesor
    asesorSeleccionado.value = '';  // Limpia la selección del asesor
    alert('El asesor ha rechazado, por favor selecciona otro asesor.');
  }
};
</script>

<template>
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
    <!-- Título principal -->
    <h3 class="text-4xl font-semibold text-center text-azul">Designación de Asesor</h3>

    <div class="mt-6 space-y-10">

      <!-- Card 1: Inicio de Trámite -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">1. Inicio de Trámite</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" @mouseover="mostrarModal = true"
            @mouseleave="mostrarModal = false" />
        </div>

        <div v-show="mostrarModal"
          class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">
            En esta sección se va a mostrar los estados de los trámites que debiste de haber hecho en el sistema de la
            UDH.
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
        <div class="flex items-center ">
          <h2 class="text-2xl font-medium text-black">2. Solicitud de Asesor</h2>
          <span :class="estadoClase(estadoPunto2)" class="estado-estilo ml-4">{{ estadoPunto2 }}</span>
        </div>

        <div class="mt-4">
          <!-- Título de tesis -->
          <label for="tituloTesis" class="block text-lg font-medium text-gray-800 mb-2">Título de Tesis</label>
          <input id="tituloTesis" type="text" v-model="tituloTesis"
            class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            disabled>

          <!-- Selección de Asesor -->
          <label for="asesor" class="block text-lg font-medium text-gray-800 mb-2">Elige tu asesor</label>
          <select id="asesor" v-model="asesorSeleccionado"
            :disabled="estadoPunto2 === 'En Proceso' || estadoPunto2 === 'Hecho'"
            class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6">
            <option value="">Selecciona un asesor</option>
            <option value="Aldo Ramirez">Aldo Ramirez</option>
            <option value="Otra opción">Otra opción</option>
          </select>

          <!-- Botón de Enviar -->
          <div class="flex justify-end mb-4">
            <button @click="enviarSolicitud" 
              :disabled="!puedeEnviar || estadoPunto2 === 'En Proceso' || estadoPunto2 === 'Hecho'"
              :class="{
                'bg-blue-500 cursor-pointer': puedeEnviar && estadoPunto2 !== 'En Proceso' && estadoPunto2 !== 'Hecho',
                'bg-gray-300 cursor-not-allowed': !puedeEnviar || estadoPunto2 === 'En Proceso' || estadoPunto2 === 'Hecho'
              }" class="px-4 py-2 text-white rounded-md">
              Enviar
            </button>
          </div>

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
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center ">
          <h2 class="text-2xl font-medium text-black">3. Documentos</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4" />
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
