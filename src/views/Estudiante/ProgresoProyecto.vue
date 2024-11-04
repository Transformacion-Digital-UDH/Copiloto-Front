<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

// Definición de tipo para documentos
interface Document {
  nombre: string;
  urlView: string;
  urlDownload: string;
  fechaEmision: string;
  emisor: string;
}

// Propiedades reactivas
const startDate = ref<string>('');
const endDate = ref<string>('');
// const showDocumentModal = ref<boolean>(false);
const authStore = useAuthStore();

// Array de documentos con URLs de "Ver" y "Descargar"
const documents = ref<Document[]>([]);
const router = useRouter();

const goToConformidadInformeAsesor = () => {
  router.push({ name: 'ConformidadInformeAsesor' });
};

// Función para abrir y cerrar el modal
// const openDocumentModal = () => (showDocumentModal.value = true);
// const closeDocumentModal = () => (showDocumentModal.value = false);

// Función para obtener las fechas y URLs de documentos de la API
const fetchThesisInfo = async () => {
  try {
    const response = await axios.get(`/api/estudiante/get-info-tesis/aprobado/${authStore.id}`);
    console.log("Datos recibidos:", response.data);

    startDate.value = response.data.fecha_ini;
    endDate.value = response.data.aprobacion_tesis.doc_fecha;

    // Actualización de URLs de documentos
    documents.value = [
      {
        nombre: response.data.designacion_asesor.nombre_doc,
        emisor: response.data.designacion_asesor.doc_emisor,
        fechaEmision: response.data.designacion_asesor.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_LETTER}/${response.data.designacion_asesor.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_LETTER}/${response.data.designacion_asesor.doc_id}`,
      },
      {
        nombre: response.data.conformidad_asesor.nombre_doc,
        emisor: response.data.conformidad_asesor.doc_emisor,
        fechaEmision: response.data.conformidad_asesor.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_asesor.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_asesor.doc_id}`,
      },
      {
        nombre: response.data.desigancion_jurados.nombre_doc,
        emisor: response.data.desigancion_jurados.doc_emisor,
        fechaEmision: response.data.desigancion_jurados.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_OFFICEJURADO}/${response.data.desigancion_jurados.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_OFFICEJURADO}/${response.data.desigancion_jurados.doc_id}`,
      },
      {
        nombre: response.data.conformidad_jurado_pres.nombre_doc,
        emisor: response.data.conformidad_jurado_pres.doc_emisor,
        fechaEmision: response.data.conformidad_jurado_pres.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_pres.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_pres.doc_id}`,
      },
      {
        nombre: response.data.conformidad_jurado_secre.nombre_doc,
        emisor: response.data.conformidad_jurado_secre.doc_emisor,
        fechaEmision: response.data.conformidad_jurado_secre.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_secre.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_secre.doc_id}`,
      },
      {
        nombre: response.data.conformidad_jurado_vocal.nombre_doc,
        emisor: response.data.conformidad_jurado_vocal.doc_emisor,
        fechaEmision: response.data.conformidad_jurado_vocal.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_vocal.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_vocal.doc_id}`,
      },
      {
        nombre: response.data.aprobacion_tesis.nombre_doc,
        emisor: response.data.aprobacion_tesis.doc_emisor,
        fechaEmision: response.data.aprobacion_tesis.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_AFACULTAD}/${response.data.aprobacion_tesis.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_AFACULTAD}/${response.data.aprobacion_tesis.doc_id}`,
      },
    ];
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
    <!-- Título principal -->
    <h2 class="text-6xl md:text-6xl lg:text-6xl font-bold text-center text-azul mb-12">
      Ejecución de tu Proyecto de Tesis
    </h2>

    <div class="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-x-16 w-full max-w-7xl mx-auto mb-10">
      <!-- Imagen SVG a la izquierda -->
      <div class="w-full lg:w-full flex justify-center items-center h-full">
        <img src="/img/c2.svg" alt="Descripción de la imagen" class="w-full h-full object-contain max-h-screen transform transition duration-500 ease-in-out hover:scale-105 fade-in" />
      </div>

      <!-- Contenido central -->
      <div class="flex-grow flex flex-col space-y-8 items-center text-center mt-2 w-full lg:w-2/3">
        <!-- Etapas del proceso -->
        <div class="grid grid-cols-4 gap-4 mb-8">
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xl font-bold">
              1
            </div>
            <span class="mt-4 text-center font-semibold text-gray-700">Proyecto de Tesis</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xl font-bold">
              2
            </div>
            <span class="mt-4 text-center font-semibold text-gray-700">Ejecución (Actual)</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xl font-bold">
              3
            </div>
            <span class="mt-4 text-center font-semibold text-gray-700">Informe Final</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-20 h-20 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xl font-bold">
              4
            </div>
            <span class="mt-4 text-center font-semibold text-gray-700">Sustentación</span>
          </div>
        </div>

        <!-- Mensaje motivacional -->
        <p class="text-lg md:text-xl text-gray-600">
          ¡Estás a mitad de camino! Mantente enfocado y recuerda que cada paso te lleva más cerca de tu meta.
        </p>
        <!-- Fechas de Inicio y Fin -->
        <div class="flex flex-col md:flex-row justify-around items-center w-full space-y-4 md:space-y-0 md:space-x-8">
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-full max-w-xs transform transition duration-500 ease-in-out hover:scale-105">
            <div class="text-lg font-semibold text-gray-800">Inicio</div>
            <div class="text-2xl text-azul font-bold">{{ startDate }}</div>
          </div>
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-full max-w-xs transform transition duration-500 ease-in-out hover:scale-105">
            <div class="text-lg font-semibold text-gray-800">Fin</div>
            <div class="text-2xl text-azul font-bold">{{ endDate }}</div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-center gap-6">
    <button 
      class="px-4 py-2 md:px-8 md:py-4 bg-base text-white rounded-lg hover:bg-baseClarito transition text-lg md:text-xl"
      @click="goToConformidadInformeAsesor"
    >
      Ir a Informe Final
    </button>
  </div>

        <br>
      </div>
    </div>
    
    <!-- Tabla de documentos aprobados por todas las areas -->
    <div class="bg-white rounded-lg shadow-lg p-6 relative">
      <p class="text-2xl py-2 text-azul font-bold">Documentos de Proyecto de Tesis</p>
      <div class="overflow-x-auto mt-4">
        <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
          <thead class="min-w-full leading-normal">
            <tr class="text-center text-azul border-b-2 bg-gray-300">
              <th class="px-4 py-2 text-left tracking-wider">DOCUMENTOS</th>
              <th class="px-4 py-2 text-left tracking-wider">EMISOR</th>
              <th class="px-4 py-2 text-left tracking-wider">FECHA EMISIÓN</th>
              <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
            </tr>
          </thead>
          <tbody v-if="documents && documents.length > 0">
            <tr v-for="(doc, index) in documents" :key="index" class="border-b border-gray-200 text-left">
              <td class="px-3 py-4 text-base text-gray-600">
                <p class="block text-wrap w-80 uppercase">{{ doc.nombre || "Sin documento"}}</p>
              </td>
              <td class="px-4 py-4 text-base text-gray-600">
                <p class="block text-wrap w-72 uppercase">{{ doc.emisor || "Sin emisor" }}</p>
              </td>
              <td class="px-4 py-4 text-base text-gray-600 font-medium">
                <p class="block text-wrap w-24">{{ doc.fechaEmision || "Sin fecha de emisión" }}</p>
              </td>
              <td class="px-4 py-2 justify-center flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                <a 
                  :href="doc.urlView" 
                  target="_blank" 
                  class="w-full items-center mr-2 px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-200 md:w-auto justify-center">
                  <i class="fas fa-eye mr-2"></i> Ver
                </a>
                <a 
                  :href="doc.urlDownload" 
                  download 
                  class="w-full items-center text-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-200 md:w-auto justify-center">
                  <i class="fas fa-download mr-2"></i> Descargar
                </a>
              </td>
            </tr>
          </tbody>
          <!-- Mostrar mensaje de no hay documentos si la lista está vacía -->
          <tbody v-else>
            <tr>
              <td colspan="4" class="px-4 py-4 text-center text-gray-600">
                <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay documentos disponibles por el momento.
              </td>
            </tr>
          </tbody>
        </table>
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

.fade-in {
  animation: fadeIn 2s ease-in;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>