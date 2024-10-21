<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";

const load = ref(false);

// ***** Texto que se escribe automáticamente ********
const text = "Aprobación del proyecto de tesis";
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
const mostrarModalAprobar = ref(false); 

// Estado del trámite de aprobación
const tramiteAprobacion = ref({ titulo: 'Solicitar Aprobación' });


// Documentos para la aprobación del proyecto
const documentos = ref<Documento[]>([
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' },
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },
]);

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'Hecho':
      return 'bg-green-500 text-white';
    case 'pendiente':
      return 'bg-gray-400 text-white';
    default:
      return '';
  }
};

///////////////////////////// CONEXION CON EL BACKEND //////////////////////////
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false); 

// para que el botón quede deshabilitado
const isAprobacionDisabled = computed(() => {
  const estadoSolicitud = solicitudEstado.value?.toLowerCase();
  return ["", ""].includes(estadoSolicitud);// se deshabilita el botón dependiendo del estado
});

// Función para cargar el estado actual de la solicitud desde el backend
const solicitarAprobacion = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar-tesis/${authStore.id}`);
    console.log("Mostrando lo recibido: ",response);

    if (response.data.estado){
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada correctamente, espere las indicaciones", "Éxito", "success");
    }

  } catch (error: any) {
    console.error(error);

    // Asegúrate de manejar errores correctamente basándote en la respuesta del backend
    if (error.response?.status == 404) {
      const message = error.response?.data?.mensaje;

      if (message.includes("conformidad")) {
        alertToast("Estimado estudiante, no tiene la conformidad de sus jurados", "warning");
      } else if (message.includes("solicitud de aprobación de tesis pendiente")) {
        alertToast("Estimado estudiante, ya solicitó la aprobación de su proyecto", "success");
      } else {
        alertToast(message || "Error desconocido en la solicitud.", "Error", "error");
      }
    } else {
      alertToast("Error al conectar con el servidor", "Error", "error");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div
        class="flex justify-center items-center content-center px-14 flex-col">
        <h3
          class="bg-gray-200 h-11 w-4/5 rounded-lg duration-200 skeleton-loader"
        ></h3>
      </div>
      <div class="mt-6 space-y-10">
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-28 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-1/6 rounded-md skeleton-loader duration-200"
            ></h2>
            <div class="flex justify-between items-center">
              <h2
                class="bg-gray-200 h-6 w-96 rounded-md skeleton-loader duration-200"
              ></h2>
            </div>
            <div class="h-7">
              <h2
                class="bg-gray-200 h-10 w-40 mx-auto rounded-md skeleton-loader duration-200"
              ></h2>
            </div>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"
            ></h2>
            <h2
              class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"
            ></h2>
            <h2
              class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="block space-y-5">
            <h2
              class="px-4 py-2 h-11 w-24 rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
        <div class="mt-6 space-y-10">
          <!-- Card 1: Solicitud-->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <h2 class="text-2xl font-medium text-black">1. Solicitar aprobación</h2>
                  <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                    @mouseover="mostrarModalAprobar = true"
                    @mouseleave="mostrarModalAprobar = false" />
              </div>
              <span :class="['estado-estilo', `estado-${solicitudEstado.toLowerCase().replace(' ', '-')}`]" class="ml-4">{{ solicitudEstado }}</span>
            </div>
            <div v-show="mostrarModalAprobar" class="absolute left-40 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
              <p class="text-sm text-gray-600">Se enviará tu solicitud al Programa Académico y a la Facultad.</p>
            </div>

            <div class="flex items-center justify-between mt-2">
              <p class="text-gray-500 text-lg">Haz clic en el botón para enviar tu solicitud de aprobación del proyecto de tesis a la Facultad y al Programa Académico.</p>
            </div>
            <div class="mt-4">
              <div class="flex justify-center mt-2">
                <button 
                  :disabled="isAprobacionDisabled" 
                  :class="[ isAprobacionDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                  class="px-4 py-2 text-white rounded-md"
                  @click="solicitarAprobacion">
                  {{ isLoading ?'Solicitando...' : 'SOLICITAR APROBACIÓN' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Card 2: Documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-medium text-black">2. Documentos para la aprobacion del proyecto de tesis</h2>
            <div class="mt-4 space-y-6">
              <div v-for="(documento, index) in documentos" :key="index" class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
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
                  <span :class="estadoClase(documento.estado)" class="estado-estilo">{{ documento.estado }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón "Siguiente" -->
          <div class="flex justify-end mt-8">
            <button 
              class="px-4 py-2 text-white bg-gray-300 rounded-md">
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
  border-radius: 0.375rem;
  display: inline-block;
}
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.estado-no-solicitado {
  background-color: #718096;
  color: #ffffff;
}
.break-all {
  word-break: break-all;
}
</style>
