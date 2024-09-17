<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import Swal from 'sweetalert2';

// Definir tipos para trámites, documentos y acciones del historial
interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

interface Asesor {
  id: number;
  nombre: string;
}

interface Trámite {
  título: string;
  estado: string;
}

interface HistorialAccion {
  fecha: Date;
  descripcion: string;
}

// Estado general del punto 2
const estadoPunto2 = ref('En Proceso'); // Estados: Pendiente, En Proceso, Hecho

const trámites = ref<Trámite[]>([
  { título: 'Solicitud de Asesor', estado: 'Pendiente' }
]);

// Historial de acciones
const historial = ref<HistorialAccion[]>([]);

// Documentos para el punto 2 (Respuesta del asesor) y 3 (Documentos adicionales)
const documentos = ref<Documento[]>([
  { nombre: 'Respuesta del asesor', estado: 'Rechazado', documentoUrl: '' },  // Punto 2
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' }, // Punto 3
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' }  // Punto 3
]);

// Simulación del título de tesis y asesores
const tituloTesis = ref(localStorage.getItem('tituloTesis') || '');
const nombreAsesor = ref(localStorage.getItem('nombreAsesor') || '');
const asesores = ref<Asesor[]>([
  { id: 1, nombre: 'Aldo Ramírez' },
  { id: 2, nombre: 'María Pérez' },
  { id: 3, nombre: 'José García' }
]);

// Botón de enviar deshabilitado si ya está en proceso o hecho
const enviado = ref(false);

// Modal de confirmación
const mostrarModalDocumentos = ref(false); // Controla el modal de documentos
const mostrarModalCambioAsesor = ref(false); // Controla el modal de cambio de asesor
const mostrarModalConfirmacion = ref(false); // Modal de confirmación para cambio de asesor

// Watch para guardar automáticamente en localStorage
watch([tituloTesis, nombreAsesor], ([nuevoTitulo, nuevoAsesor]) => {
  localStorage.setItem('tituloTesis', nuevoTitulo);
  localStorage.setItem('nombreAsesor', nuevoAsesor);
});

// Computed para habilitar el botón "Enviar" solo si se han completado los campos
const puedeEnviar = computed(() => tituloTesis.value && nombreAsesor.value && !enviado.value);

// Función para enviar los datos
const enviarSolicitud = () => {
  if (puedeEnviar.value) {
    estadoPunto2.value = 'En Proceso';
    enviado.value = true; // Deshabilitar botón y campos
    agregarHistorial('Solicitud de asesor enviada, esperando respuesta.');

    // SweetAlert para mostrar mensaje de éxito
    Swal.fire({
      title: 'Solicitud Enviada',
      text: 'Tu solicitud ha sido enviada. Ahora debes esperar la respuesta del asesor.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700'
      }
    });
  }
};

// Función para solicitar cambio de asesor
const solicitarCambioAsesor = () => {
  mostrarModalConfirmacion.value = true; // Mostrar modal de confirmación
};

// Confirmar cambio de asesor con SweetAlert2
const confirmarCambioAsesor = () => {
  mostrarModalConfirmacion.value = false; // Cerrar modal
  agregarHistorial('Se ha solicitado un cambio de asesor. Todo el proceso debe repetirse.');

  Swal.fire({
    title: 'Cambio de asesor solicitado',
    text: 'Debes repetir todo el proceso nuevamente.',
    icon: 'success', // Puedes usar 'success', 'error', 'warning', 'info'
    confirmButtonText: 'Aceptar',
    customClass: {
      confirmButton: 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700'
    }
  });
};

// Función para agregar eventos al historial
const agregarHistorial = (descripcion: string) => {
  historial.value.push({
    fecha: new Date(),
    descripcion
  });
};

// Función para simular respuesta del asesor
const respuestaAsesor = (respuesta: 'aceptar' | 'rechazar') => {
  if (respuesta === 'aceptar') {
    documentos.value[0].estado = 'Aceptado'; // El asesor aceptó
    estadoPunto2.value = 'Hecho'; // Cambia el estado general del punto 2 a "Hecho"
    agregarHistorial('El asesor ha aceptado la solicitud.');
    alert('El asesor ha aceptado. El documento está disponible para ver y descargar.');
  } else if (respuesta === 'rechazar') {
    documentos.value[0].estado = 'Rechazado'; // El asesor rechazó
    estadoPunto2.value = 'En Proceso'; // Mantener en "En Proceso"
    enviado.value = false; // Habilitar nuevamente el botón y los campos
    agregarHistorial('El asesor ha rechazado la solicitud.');
    alert('El asesor ha rechazado, por favor elige un nuevo asesor y vuelve a enviar la solicitud.');
  }
};

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
    case 'Aceptado':
      return 'bg-green-500 text-white';
    default:
      return '';
  }
};

// Computed para habilitar el botón "Siguiente"
const puedeContinuar = computed(() => {
  const estadoPunto1Hecho = estadoPunto2.value === 'Hecho';
  const documentosCompletos = documentos.value.slice(1).every(doc => doc.estado === 'Hecho');
  return estadoPunto1Hecho && documentosCompletos;
});

</script>

<template>
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
    <!-- Título principal -->
    <h3 class="text-4xl font-semibold text-center text-azul">Designación de Asesor</h3>
    <br>
    <p class="text-gray-500 text-center">Cada punto en este proceso debe estar en Hecho para que pueda continuar con el siguiente tramite | El pago de este tramite se sumara al pago del monto final de toda la Tesis.</p>
    <br>

    <!-- Card 1: Solicitud de Asesor -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center">
        <h2 class="text-2xl font-medium text-black">1. Solicitud de Asesor</h2>
        <span :class="estadoClase(estadoPunto2)" class="estado-estilo ml-4">{{ estadoPunto2 }}</span>
      </div>

      <div class="mt-4">
        <!-- Título de tesis -->
        <label for="tituloTesis" class="block text-lg font-medium text-gray-800 mb-2">Título de Tesis</label>
        <input id="tituloTesis" type="text" v-model="tituloTesis" 
               :disabled="enviado"
               class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
               placeholder="Escribe tu título de tesis aquí...">

        <!-- Select para elegir asesor -->
        <label for="nombreAsesor" class="block text-lg font-medium text-gray-800 mb-2">Elige a tu Asesor</label>
        <select id="nombreAsesor" v-model="nombreAsesor" :disabled="enviado"
                class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6">
          <option disabled value="">Selecciona un asesor...</option>
          <option v-for="asesor in asesores" :key="asesor.id" :value="asesor.nombre">{{ asesor.nombre }}</option>
        </select>

        <!-- Botón de enviar -->
        <button @click="enviarSolicitud" :disabled="!puedeEnviar"
                class="px-3 py-2 text-white bg-base rounded-md hover:bg-green-500 focus:outline-none"
                :class="!puedeEnviar ? 'bg-gray-400 cursor-not-allowed' : ''">
          Enviar
        </button>

      </div>

      <!-- Respuesta del asesor -->
      <div class="mt-6 bg-gray-50 p-4 border border-gray-200 rounded-md">
        <div class="flex justify-between items-center">
          <h4 class="text-black">Respuesta del asesor</h4>
          <span :class="estadoClase(documentos[0].estado)" class="estado-estilo">{{ documentos[0].estado }}</span>
        </div>
      </div>
      <br>

      <!-- Mensaje de espera o rechazo según el estado -->
      <span v-if="documentos[0].estado === 'Pendiente'" class="text-gray-500 italic">Esperando la respuesta del asesor...</span>
      <span v-else-if="documentos[0].estado === 'Rechazado'" class="text-red-500 italic">El asesor ha rechazado la solicitud, porfavor vuelve a seleccionar tu asesor.</span>
      <span v-else-if="documentos[0].estado === 'Aceptado'" class="text-green-500 italic">El asesor ha aceptado tu solicitud, puedes pasar el punto 2.</span>

    </div>

    <!-- Card 2: Documentos -->
    <div class="bg-white rounded-lg shadow-lg p-6 relative mt-6">
      <div class="flex items-center">
        <h2 class="text-2xl font-medium text-black">2. Documentos</h2>
        <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
             @mouseover="mostrarModalDocumentos = true"
             @mouseleave="mostrarModalDocumentos = false" />
      </div>

      <div v-show="mostrarModalDocumentos"
          class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
        <p class="text-sm text-gray-600">
          Por favor espere que se carguen los documentos que verifican su trámite de Designación de Asesor para continuar con el siguiente paso.
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

    <!-- Botón "Siguiente" -->
    <div class="flex justify-end mt-6">
      <button :disabled="!puedeContinuar" class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed"
        :class="puedeContinuar ? 'bg-green-600 hover:bg-base cursor-pointer' : 'bg-gray-300 cursor-not-allowed'">
        Siguiente
      </button>
    </div>

    <!-- Card 3: Solicitar Cambio de Asesor -->
    <div class="bg-white rounded-lg shadow-lg p-6 relative mt-6">
      <div class="flex items-center">
        <h2 class="text-2xl font-medium text-gray-600">Cambio de Asesor</h2>
        <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
             @mouseover="mostrarModalCambioAsesor = true"
             @mouseleave="mostrarModalCambioAsesor = false" />
      </div>
      <br>
      <p class="text-gray-400"> Si consideras que necesitas un cambio de asesor, puedes solicitarlo en cualquier momento.</p>

      <div v-show="mostrarModalCambioAsesor"
          class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
        <p class="text-sm text-gray-500">
          Si consideras que necesitas un cambio de asesor, puedes solicitarlo en cualquier momento.
        </p>
      </div>

      <div class="mt-4 space-y-4">
        <!-- Botón de Solicitar Cambio de Asesor -->
        <div class="flex justify-center">
          <button @click="solicitarCambioAsesor" class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-500 focus:outline-none">
            Solicitar Cambio de Asesor
          </button>
        </div>
      </div>
    </div>

    <!-- Historial de Acciones -->
    <div class="bg-baseClarito rounded-lg shadow-lg p-6 mt-6">
      <h2 class="text-2xl font-medium text-white">Historial de Acciones</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="(accion, index) in historial" :key="index" class="border p-3 rounded-md bg-gray-50">
          <span class="font-light">{{ new Date(accion.fecha).toLocaleString() }}:</span> {{ accion.descripcion }}
        </li>
      </ul>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="mostrarModalConfirmacion" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4"> <!-- Responsivo -->
        <h3 class="text-3xl text-center font-medium mb-4">Confirmación</h3>
        <hr>
        <br>
        <p class="mb-6">¿Estás seguro de que deseas solicitar un cambio de asesor? Todo el proceso tendrá que repetirse.</p>
        <div class="flex justify-end">
          <button @click="mostrarModalConfirmacion = false" class="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 hover:bg-gray-600">Cancelar</button>
          <button @click="confirmarCambioAsesor" class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-500">Aceptar</button>
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
