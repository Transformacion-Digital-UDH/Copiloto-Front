<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";

// Estado de carga
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
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Pendiente', documentoUrl: '' },
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },
]);

// Variables de entorno para los enlaces de los documentos
const VIEW_APAISI = import.meta.env.VITE_URL_VIEW_APAISI;
const DOWNLOAD_APAISI = import.meta.env.VITE_URL_DOWNLOAD_APSISI;

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'tramitado':
    case 'hecho':
      return 'bg-green-500 text-white';
    case 'pendiente':
      return 'bg-gray-400 text-white';
    case 'no iniciado':
      return 'bg-gray-300 text-white';
    default:
      return '';
  }
};

///////////////////////////// CONEXION CON EL BACKEND //////////////////////////
const authStore = useAuthStore();
const solicitudEstado = ref<string>("No Iniciado"); 
const isLoading = ref<boolean>(false);
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

// Función para cargar el estado actual de la solicitud y documentos desde el backend
const cargarDocumentosSolicitud = async () => {
  try {
    const response = await axios.get(`/api/estudiante/get-info-aprobar-tesis/${authStore.id}`);
    const data = response.data;

    // Actualizamos los documentos con la información del backend
    documentos.value[0].estado = data.oficio_estado;  // Actualizamos el estado del oficio
    documentos.value[1].estado = data.resolucion_estado;  // Actualizamos el estado de la resolución

    // Generamos las URLs si los documentos están disponibles
    if (data.oficio_estado === 'tramitado') {
      documentos.value[0].documentoUrl = `${VIEW_APAISI}/${data.oficio_id}`;
    }
    if (data.resolucion_estado === 'tramitado') {
      documentos.value[1].documentoUrl = `${VIEW_APAISI}/${data.resolucion_id}`;
    }

    // Actualizamos el estado general de la solicitud
    solicitudEstado.value = data.oficio_estado || "No Iniciado";

  } catch (error) {
    console.error("Error al cargar los documentos de la solicitud:", error);
    alertToast("No se pudo cargar los documentos de la solicitud", "Error", "error");
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
  cargarDocumentosSolicitud();  // Cargar el estado desde el backend cuando se monta el componente
});

</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <!-- Mostrar una pantalla de carga -->
    </div>
  </template>

  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl font-bold text-center text-azul">
        {{ textoTipiado2 }}
      </h3>
      <br>

      <!-- Card 1: Solicitar Aprobación -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center">
          <h2 class="text-2xl font-medium text-black">
            1. Solicitar Aprobación 
          </h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
            @mouseover="mostrarModalAprobar = true"
            @mouseleave="mostrarModalAprobar = false" />
        </div>

        <!-- Tooltip -->
        <div v-show="mostrarModalAprobar" class="absolute left-48 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">Se enviará tu solicitud al Programa Académico y a la Facultad.</p>
        </div>

        <div class="flex items-center justify-between mt-2">
          <p class="text-gray-500 text-lg">Haz clic en el botón para solicitar la aprobación de tu Proyecto de Tesis</p>
          
        </div>

        <div class="mt-4 flex justify-center">
          <!-- Botón para enviar la solicitud -->
          <button 
            @click="primeraRevision"
            :disabled="['pendiente', 'observado', 'tramitado', 'Hecho'].includes(solicitudEstado) || isLoading"  
            :class="[
              ['pendiente', 'observado', 'tramitado', 'Hecho'].includes(solicitudEstado) ? 'bg-gray-300 cursor-not-allowed' : 'bg-base cursor-pointer',
              isLoading ? 'bg-green-500' : ''
            ]"
            class="px-4 py-2 text-white rounded-md">
            {{ isLoading ? 'Solicitando...' : 'Solicitar Aprobación' }}
          </button>
        </div>
      </div>

      <!-- Card 2: Documentos para la Aprobacion del Proyecto de Tesis -->
      <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-medium text-black">2. Documentos para la Aprobación del Proyecto de Tesis</h2>

        <!-- Listado de documentos -->
        <div class="mt-4 space-y-6">
          <div v-for="(documento, index) in documentos" :key="index" class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
            <!-- Nombre del documento -->
            <span class="text-black flex-1">{{ documento.nombre }}</span>

            <div class="flex space-x-4 items-center">
              <!-- Botón de Ver -->
              <a v-if="documento.estado === 'tramitado'" :href="documento.documentoUrl" target="_blank"
                class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                <i class="fas fa-eye mr-2"></i> Ver
              </a>

              <!-- Botón de Descargar -->
              <a v-if="documento.estado === 'tramitado'" :href="documento.documentoUrl" download
                class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                <i class="fas fa-download mr-2"></i> Descargar
              </a>

              <!-- Estado del documento -->
              <span :class="estadoClase(documento.estado)" class="estado-estilo">{{ documento.estado }}</span>
            </div>
          </div>
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


</style>
