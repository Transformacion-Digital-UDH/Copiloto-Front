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
  documentos?: Documento[];
}

// Definir los trámites y documentos a cargar solo en el punto 3
const trámites = ref<Trámite[]>([
  { título: 'Trámite en el Sistema', estado: 'Pendiente' },
  { título: 'Pago de Trámite', estado: 'Pendiente' },
  { título: 'Documentos', estado: 'Pendiente', documentos: [
    { nombre: 'Respuesta del asesor', estado: 'Hecho', documentoUrl: '/docs/constancia_1.pdf' },
    { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '/docs/constancia_3.pdf' },  
    { nombre: 'Resolucion de Facultad', estado: 'Pendiente', documentoUrl: '' },
  ] },
]);

// Título de tesis simulado como si viniera del backend
const tituloTesis = ref('Implementación de un chatbot para el sistema de trámite');
const mostrarModal = ref(false);

// Asesor seleccionado (vacío al inicio)
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
    default:
      return '';
  }
};

// Computed para habilitar el botón "Enviar" cuando el asesor esté seleccionado
const puedeEnviar = computed(() => asesorSeleccionado.value !== '' && trámites.value[1].estado !== 'Hecho');

// Computed para verificar si todos los trámites (y sus documentos) están en estado "Hecho"
const todosHechos = computed(() => {
  return trámites.value.every(trámite => {
    if (trámite.documentos) {
      return trámite.documentos.every(doc => doc.estado === 'Hecho');
    }
    return trámite.estado === 'Hecho';
  });
});

// Método para manejar el envío
const enviarSolicitud = () => {
  if (asesorSeleccionado.value) {
    trámites.value[1].estado = 'Hecho'; // Simulamos que el segundo trámite está "Hecho"
    alert(`Solicitud enviada con el asesor: ${asesorSeleccionado.value}`);
  }
};
</script>

<template>
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
    <!-- Título principal -->
    <h3 class="text-4xl font-semibold text-center text-azul">Designación de Asesor</h3>

    <div class="mt-6 space-y-10">
      
      <!-- Card 1: Inicio de Trámite -->
      <!-- Card 1: Inicio de Trámite -->
<div class="bg-white rounded-lg shadow-lg p-6 relative">
  <div class="flex items-center">
    <h2 class="text-2xl font-medium text-azul">1. Inicio de Trámite</h2>
    <!-- Icono de información con eventos para mostrar el modal -->
    <img 
      src="/icon/info2.svg" 
      alt="Info" 
      class="ml-2 w-4 h-4 cursor-pointer" 
      @mouseover="mostrarModal = true" 
      @mouseleave="mostrarModal = false" 
    />
  </div>

  <!-- Modal de información que aparece al pasar el mouse -->
  <div v-if="mostrarModal" class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
    <p class="text-sm text-gray-600">
      En esta sección se va a mostrar los estados de los trámites que debiste de haber hecho en el sistema de la UDH.
    </p>
  </div>

  <!-- Listado de trámites dinámico -->
  <div class="mt-4 space-y-6">
    <div v-for="(trámite, index) in trámites.slice(0, 2)" :key="index" class=" bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
      <h4 class="text-lg font-light text-gray-800 flex-1">{{ trámite.título }}</h4>
      <span :class="estadoClase(trámite.estado)" class="estado-estilo ml-4">{{ trámite.estado }}</span>
    </div>
  </div>
</div>

      <!-- Card 2: Solicitud de Asesor -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center ">
          <h2 class="text-2xl font-medium text-black">2. Solicitud de Asesor</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4" />
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-light text-gray-800 flex-1">{{ trámites[1]?.título || '' }}</h4>
            <span :class="estadoClase(trámites[1]?.estado)" class="estado-estilo ml-4">{{ trámites[1]?.estado || '' }}</span>
          </div>

          <!-- Título de tesis cargado del backend -->
          <label for="tituloTesis" class="block text-lg font-medium text-gray-800 mb-2">Título de Tesis</label>
          <input id="tituloTesis" type="text" v-model="tituloTesis" class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" disabled>

          <!-- Selección de Asesor -->
          <label for="asesor" class="block text-lg font-medium text-gray-800 mb-2">Elige tu asesor</label>
          <select id="asesor" v-model="asesorSeleccionado" class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6">
            <option value="">Selecciona un asesor</option>
            <option value="Aldo Ramirez">Aldo Ramirez</option>
            <option value="Otra opción">Otra opción</option>
          </select>

          <!-- Botón de Enviar -->
          <div class="flex justify-end">
            <button @click="enviarSolicitud" :disabled="!puedeEnviar" :class="puedeEnviar ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'" class="px-4 py-2 text-white rounded-md">
              Enviar
            </button>
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
          <div v-for="documento in trámites[2]?.documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <!-- Nombre del documento -->
              <span class="w-full md:w-auto mb-2 md:mb-0">{{ documento.nombre }}</span>
              
              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <div v-if="documento.estado === 'Hecho'" class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                  <!-- Botón de Ver -->
                  <a :href="documento.documentoUrl" target="_blank" class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- Botón de Descargar -->
                  <a :href="documento.documentoUrl" download class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <span v-else class="text-gray-500 italic">El documento aún no se ha cargado</span>

                <!-- Estado del documento al final -->
                <span :class="estadoClase(documento.estado)" class="estado-estilo">{{ documento.estado }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de ir a siguiente -->
      <div class="flex justify-end mt-8">
        <button :disabled="!todosHechos" 
                :class="todosHechos ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'" 
                class="px-4 py-2 text-white rounded-md">
          Ir a Siguiente
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
