<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import IconCerrar from '@/components/icons/IconCerrar.vue';

// Definición de tipo para documentos
interface Document {
  nombre: string;
  urlView: string;
  urlDownload: string;
}

// Propiedades reactivas
const startDate = ref<string>('');
const endDate = ref<string>('');
const showDocumentModal = ref<boolean>(false);
const authStore = useAuthStore();

// Array de documentos con URLs de "Ver" y "Descargar"
const documents = ref<Document[]>([
  { nombre: "Carta de Aceptación", urlView: "", urlDownload: "" },
  { nombre: "Conformidad Asesor", urlView: "", urlDownload: "" },
  { nombre: "Designación de Jurados", urlView: "", urlDownload: "" },
  { nombre: "Conformidad Jurado Presidente", urlView: "", urlDownload: "" },
  { nombre: "Conformidad Jurado Secretario", urlView: "", urlDownload: "" },
  { nombre: "Conformidad Jurado Vocal", urlView: "", urlDownload: "" },
  { nombre: "Aprobación de Tesis", urlView: "", urlDownload: "" },
]);

// Función para abrir y cerrar el modal
const openDocumentModal = () => (showDocumentModal.value = true);
const closeDocumentModal = () => (showDocumentModal.value = false);

// Función para obtener las fechas y URLs de documentos de la API
const fetchThesisInfo = async () => {
  try {
    const response = await axios.get(`/api/estudiante/get-info-tesis/aprobado/${authStore.id}`);
    console.log("Datos recibidos:", response.data);

    startDate.value = response.data.fecha_ini;
    endDate.value = response.data.aprobacion_tesis.doc_fecha;

    // Actualización de URLs de documentos
    documents.value[0].urlView = `${import.meta.env.VITE_URL_VIEW_LETTER}/${response.data.designacion_asesor.doc_id}`;
    documents.value[0].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_LETTER}/${response.data.designacion_asesor.doc_id}`;

    documents.value[1].urlView = `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_asesor.doc_id}`;
    documents.value[1].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_asesor.doc_id}`;

    documents.value[2].urlView = `${import.meta.env.VITE_URL_VIEW_OFFICEJURADO}/${response.data.desigancion_jurados.doc_id}`;
    documents.value[2].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_OFFICEJURADO}/${response.data.desigancion_jurados.doc_id}`;

    documents.value[3].urlView = `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_pres.doc_id}`;
    documents.value[3].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_pres.doc_id}`;

    documents.value[4].urlView = `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_secre.doc_id}`;
    documents.value[4].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_secre.doc_id}`;

    documents.value[5].urlView = `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_vocal.doc_id}`;
    documents.value[5].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_vocal.doc_id}`;

    documents.value[6].urlView = `${import.meta.env.VITE_URL_VIEW_AFACULTAD}/${response.data.aprobacion_tesis.doc_id}`;
    documents.value[6].urlDownload = `${import.meta.env.VITE_URL_DOWNLOAD_AFACULTAD}/${response.data.aprobacion_tesis.doc_id}`;
  } catch (error) {
    console.error("Error al obtener la información de la tesis:", error);
  }
};

// Ejecutar la función al montar el componente
onMounted(() => {
  fetchThesisInfo();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
      <div class="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-x-16 w-full max-w-7xl mx-auto">
        <!-- Imagen SVG a la izquierda -->
        <div class="w-full lg:w-full flex justify-center items-center h-full">
        <img src="/img/e1.svg" alt="Descripción de la imagen" class="w-full h-full object-contain max-h-screen" />
      </div>



      <!-- Contenido central -->
      <div class="flex-grow flex flex-col space-y-8 items-center text-center mt-2 w-full lg:w-2/3">
        <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-azul">
          Ejecución de tu Proyecto de Tesis
        </h2>
        
        <!-- Fechas de Inicio y Fin -->
        <div class="flex justify-around w-full space-x-8">
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-32 md:w-48 lg:w-64">
            <div class="text-lg font-semibold text-gray-600">Inicio</div>
            <div class="text-2xl font-bold">{{ startDate }}</div>
          </div>
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-32 md:w-48 lg:w-64">
            <div class="text-lg font-semibold text-gray-600">Fin</div>
            <div class="text-2xl font-bold">{{ endDate }}</div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-center gap-6">
          <button 
            @click="openDocumentModal" 
            class="px-4 py-2 md:px-8 md:py-4 bg-baseClarito text-white rounded-lg hover:bg-base transition text-lg md:text-xl">
            Ver mis documentos de proyecto de tesis
          </button>
          <button class="px-4 py-2 md:px-8 md:py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-baseClarito transition text-lg md:text-xl">
            Ir a Informe Final
          </button>
        </div>
      </div>
    </div>
    <!-- Modal de documentos -->
    <div v-if="showDocumentModal" 
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" 
        @click.self="closeDocumentModal">
      <div class="relative w-full max-w-lg mx-4 sm:mx-6 md:mx-8 lg:mx-auto p-4 bg-white rounded-lg shadow-lg max-h-full overflow-y-auto">
        <div class="flex justify-end items-start">
          <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeDocumentModal">
            <IconCerrar />
          </button>
        </div>
        <div class="p-4 sm:p-6 md:p-8">
          <h5 class="text-xl sm:text-2xl font-medium text-gray-900 text-center">Documentos Adjuntos</h5>
          <div class="space-y-4 mt-6">
            <div v-for="(doc, index) in documents" :key="index" class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 items-center justify-between">
              <p class="text-gray-600 text-base sm:text-lg">{{ doc.nombre }}</p>
              <div class="flex flex-row space-x-4">
                <!-- Botón Ver -->
                <a 
                  :href="doc.urlView" 
                  target="_blank" 
                  class="flex items-center px-3 py-2 sm:px-4 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                  <i class="fas fa-eye mr-2"></i> Ver
                </a>
                <!-- Botón Descargar -->
                <a 
                  :href="doc.urlDownload" 
                  download 
                  class="flex items-center px-3 py-2 sm:px-4 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                  <i class="fas fa-download mr-2"></i> Descargar
                </a>
              </div>
            </div>
          </div>
          <div class="flex justify-center p-6 mt-2 border-t border-gray-200">
            <button class="px-4 py-2 text-lg font-thin text-white bg-[#5d6d7e] rounded-2xl" @click="closeDocumentModal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Responsivo y mejoras de UI */
@media (max-width: 768px) {
  h2 {
    font-size: 2.5rem;
  }
}
</style>
