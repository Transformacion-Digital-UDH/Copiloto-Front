<script lang="ts" setup>
import { alertToast } from '@/functions';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const mostrarModalAprobar = ref(false); 

// ***** Texto que se escribe automáticamente ********
const text = "Aprobación del Informe Final por la facultad";
const textoTipiado2 = ref("");
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado2.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};
onMounted(() => {
  typeWriter();
});

// Definir tipos para trámites y documentos
interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Estado general del sistema
const estadoTramite = ref('Pendiente');  // Puede ser: Pendiente, En Proceso, Hecho

// Trámites del sistema
const tramites = ref([
  { titulo: 'Trámite en el Sistema', estado: 'Pendiente' },
  { titulo: 'Pago de Trámite', estado: 'Pendiente' },
]);

// Documentos para la aprobación del proyecto
const documentos = ref<Documento[]>([
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' },
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },
]);

// Computed para habilitar el botón "Siguiente" solo si todos los trámites y documentos están en "Hecho"
const todosCompletos = computed(() => {
  const tramitesHechos = tramites.value.every(tramite => tramite.estado === 'Hecho');
  const documentosHechos = documentos.value.every(documento => documento.estado === 'Hecho');
  return tramitesHechos && documentosHechos;
});

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'Hecho':
      return 'bg-green-500 text-white';
    case 'Pendiente':
      return 'bg-gray-400 text-white';
    default:
      return '';
  }
};

/*************************************** INTEGRACION CON EL BACKEND ************************************************ */
const load = ref(false);
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const isLoading = ref(false);

const isAprobacionDisabled = computed(() => {
  return documentos.value?.some(doc => doc.estado === 'pendiente' || doc.estado === 'tramitado');
});

const solicitarAprobacionInforme = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar/informe/${authStore.id}`);
    console.log("Mostrando lo recibido: ", response);

    if (response.data && response.data.estado === "pendiente") {
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada correctamente, espere las indicaciones", "Éxito", "success");
    } else {
      alertToast("Solicitud enviada, pero sin estado definido.", "Éxito", "info");
    }

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      const mensaje = error.response.data.mensaje;

      if (mensaje.includes("El estudiante no existe")) {
        alertToast("El estudiante no existe en el sistema. Verifique los datos.", "Error", "error");
      } else if (mensaje.includes("El estudiante aún no tiene la conformidad de sus jurados")) {
        alertToast("Estimado estudiante, no tiene conformidad de jurados", "", "warning");
      } else if (mensaje.includes("El estudiante ya tiene una solicitud de aprobación de tesis pendiente")) {
        alertToast("Estimado estudiante, ya solicitó su aprobación de tesis", "", "info");
      } else {
        alertToast("Error desconocido en la solicitud", "Error", "error");
      }
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-2/3 rounded-lg duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto -mt-6 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-52 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="flex justify-between">
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
  <div class="flex-1 p-10 border-s-2 bg-gray-100 font-Roboto">
    <h3 class="text-5xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
      <div class="mt-6 space-y-10">
        <!-- Card 1: Solicitud-->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="relative flex items-center">
              <h2 class="text-2xl font-medium text-black">1. Solicitar aprobación</h2>
                <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                  @mouseover="mostrarModalAprobar = true"
                  @mouseleave="mostrarModalAprobar = false" />
            </div>
            <div v-show="mostrarModalAprobar" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
              <p class="text-sm text-gray-600">Se enviará tu solicitud al Programa Académico y a la Facultad.</p>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-gray-500 mt-2 mb-1 text-base">Haz clic en el botón  
                <strong class="text-green-500 text-lg font-medium">"Solicitar aprobación"</strong> para enviar tu solicitud a la Facultad y al Programa Académico.
              </p>
            </div>
            
            <div class="mt-4">
              <div class="flex justify-center mt-2">
                <button 
                  :disabled="isAprobacionDisabled" 
                  :class="[ isAprobacionDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                  class="px-4 py-2 w-56 text-white rounded-md text-lg"
                  @click="solicitarAprobacionInforme">
                  {{ isLoading ? 'Solicitando...' : 'Solicitar aprobación' }}
                </button>
              </div>
            </div>
          </div>

        <!-- Card 2: Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-medium text-black">2. Documentos</h2>

          <!-- Listado de documentos -->
          <div class="mt-4 space-y-6">
            <div v-for="(documento, index) in documentos" :key="index"
              class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
              <!-- Nombre del documento -->
              <span class="text-black flex-1">{{ documento.nombre }}</span>

              <div class="flex space-x-4 items-center">
                <!-- Botón de Ver -->
                <a v-if="documento.estado === 'Hecho'" :href="documento.documentoUrl" target="_blank"
                  class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                  <i class="fas fa-eye mr-2"></i> Ver
                </a>

                <!-- Botón de Descargar -->
                <a v-if="documento.estado === 'Hecho'" :href="documento.documentoUrl" download
                  class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                <i class="fas fa-download mr-2"></i> Descargar
                </a>

                <!-- Estado del documento -->
                <span :class="estadoClase(documento.estado)" class="estado-estilo">{{ documento.estado }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón "Siguiente" -->
        <div class="flex justify-end mt-8">
          <button :disabled="!todosCompletos"
            :class="todosCompletos ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'"
            class="px-4 py-2 text-white rounded-md">
            Siguiente
          </button>
        </div>
      </div>
  </div>
  </template>
</template>


<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}
</style>