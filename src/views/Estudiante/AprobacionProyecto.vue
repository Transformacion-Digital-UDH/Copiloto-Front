<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";

const load = ref(false);

// ***** Texto que se escribe automáticamente ********
const text = "Aprobación del Proyecto de Tesis";
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
const solicitudEstado = ref<string>("No Iniciado"); 
const isLoading = ref<boolean>(false);  
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

// Función para cargar el estado actual de la solicitud desde el backend
const cargarEstadoSolicitud = async () => {
  try {
    const response = await axios.get(`/api/oficio/estado-solicitud-tesis/${authStore.id}`);
    console.log("Estado actual de la solicitud:", response.data);

    // Asumimos que el backend devuelve el estado como "Pendiente", "Hecho", o "No Iniciado"
    solicitudEstado.value = response.data.estado || "No Iniciado";  // Establecemos el estado inicial desde el backend

    if (solicitudEstado.value === "Hecho") {
      alertToast("La solicitud ya fue realizada y está aprobada.", "Información", "info");
    }
  } catch (error) {
    console.error("Error al cargar el estado de la solicitud:", error);
    alertToast("No se pudo obtener el estado actual de la solicitud", "Error", "error");
  }
};

// Función para realizar la solicitud de aprobación
const primeraRevision = async () => {
  if (isLoading.value || solicitudEstado.value === "Hecho" || solicitudEstado.value === "pendiente") return;

  isLoading.value = true;
  solicitudEstado.value = "pendiente";  // Cambiamos el estado mientras enviamos la solicitud

  try {
    const response = await axios.post(`/api/oficio/solicitud-aprobar-tesis/${authStore.id}`);  // Cambia la URL si es necesario

    // Verificamos el resultado de la solicitud
    if (response.data.status) {
      solicitudEstado.value = "Hecho";  // Si todo va bien, el estado se cambia a "Hecho"
      alertToast("Aprobación de Tesis creada correctamente", "Éxito", "success");
    } else {
      solicitudEstado.value = "pendiente";  // Si falla algo, sigue en pendiente
    }
  } catch (error) {
    console.error("Error en la solicitud de aprobación:", error);
    alertToast(error.response?.data?.message || "Error al enviar la solicitud", "Error", "error");
    solicitudEstado.value = "No Iniciado";  // Volvemos al estado inicial si falla
  } finally {
    isLoading.value = false;  // Finalizamos la carga
  }
};


// Cargar el estado de la solicitud al montar el componente
onMounted(() => {
  cargarEstadoSolicitud();  // Cargar el estado desde el backend cuando se monta el componente
});

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
      <h3 class="text-5xl font-bold text-center text-azul">
        {{ textoTipiado2 }}
      </h3>
      <br>
       <!-- Card 1: Solicitud-->
    <div class="bg-white rounded-lg shadow-lg p-6 relative">
      <div class="relative flex items-center">
        <h2 class="text-2xl font-medium text-black">
          1. Solicitar Aprobación 
        </h2>
        <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
          @mouseover="mostrarModalAprobar = true"
          @mouseleave="mostrarModalAprobar = false" />
      </div>

      <!-- Tooltip que se muestra al hacer hover sobre el ícono de información -->
      <div v-show="mostrarModalAprobar" class="absolute left-48 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
        <p class="text-sm text-gray-600">Se enviará tu solicitud al Programa Académico y a la Facultad.</p>
      </div>

      <div class="flex items-center justify-between mt-2">
        <p class="text-gray-500 text-lg">Haz clic en el botón para solicitar la aprobación de tu Proyecto de Tesis</p>
        <!-- Mostrar el estado de la solicitud -->
        <span :class="estadoClase(solicitudEstado)" class="estado-estilo">{{ solicitudEstado }}</span>
      </div>

      <div class="mt-4">
        <div class="flex justify-center mt-2">
          <!-- Botón para enviar la solicitud -->
          <button 
            @click="primeraRevision"
            :disabled="solicitudEstado === 'pendiente' || solicitudEstado === 'Hecho' || isLoading"  
            :class="[
              solicitudEstado === 'pendiente' || solicitudEstado === 'Hecho' ? 'bg-gray-300 cursor-not-allowed' : 'bg-base cursor-pointer',
              isLoading ? 'bg-green-500' : ''
            ]"
            class="px-4 py-2 text-white rounded-md">
            {{ isLoading ? 'Solicitando...' : 'Solicitar Aprobación' }}
          </button>
        </div>
      </div>
    </div>



        <div class="mt-6 space-y-10">
          <!-- Card 2: Documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-medium text-black">2. Documentos para la Aprobacion del Proyecto de Tesis</h2>

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
  font-weight: 400;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}
</style>
