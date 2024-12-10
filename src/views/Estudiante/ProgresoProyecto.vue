<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useTypewriter } from '@/composables/useTypewriter';
import DocumentTabla from '@/components/DocumentTabla.vue';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Ejecución de tu Proyecto de Tesis");
onMounted(typeWriter);

//************************************* INTEGRACION EL BACKEND ********************************************* */

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
const load = ref(false);

// Array de documentos con URLs de "Ver" y "Descargar"
const documents = ref<Document[]>([]);
const router = useRouter();

// computed para bloquear boton mientras no tiene documetnos
const isButtonDisabled = computed (() => {
  return documents.value.length === 0;
})

const goToConformidadInformeAsesor = () => {
  router.push({ name: 'ConformidadInformeAsesor' });
};

// Función para abrir y cerrar el modal
// const openDocumentModal = () => (showDocumentModal.value = true);
// const closeDocumentModal = () => (showDocumentModal.value = false);

// Función para obtener las fechas y URLs de documentos de la API
const fetchThesisInfo = async () => {
  load.value = true;
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
    console.error("Error al obtener la información de los documentos:", error);
  } finally {
    load.value = false;
  }
};

onMounted(() => {
  fetchThesisInfo();
});
</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full mx-auto rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-x-16 w-full max-w-7xl mx-auto mb-10">
          <div class="w-auto lg:w-full flex justify-center items-center h-full">
            <div class="w-96 h-96 bg-gray-300 rounded-full duration-200 skeleton-loader"></div>
          </div>
          <div class="flex-grow flex flex-col space-y-8 items-center text-center mt-2 w-full lg:w-2/3">
            <div class="relative grid grid-cols-4 gap-4 sm:gap-16 lg:gap-24 xl:gap-16 mb-8">
              <div v-for="i in 4" :key="i" class="flex flex-col items-center">
                <div class="w-20 h-20 bg-gray-300 rounded-full duration-200 skeleton-loader"></div>
                <div class="h-4 w-16 mt-4 bg-gray-300 rounded duration-200 skeleton-loader"></div>
              </div>
              <span class="mt-4 text-center font-semibold text-gray-700">Proyecto de Tesis</span>
            </div>
            <div class="h-4 w-2/3 bg-gray-300 mx-auto rounded duration-200 skeleton-loader"></div>
            <div class="flex flex-col md:flex-row justify-around items-center w-full space-y-4 md:space-y-0 md:space-x-8">
              <div class="bg-gray-300 h-20 w-40 rounded-lg shadow-lg duration-200 skeleton-loader"></div>
              <div class="bg-gray-300 h-20 w-40 rounded-lg shadow-lg duration-200 skeleton-loader"></div>
            </div><br><br><br>
            <div class="h-14 w-64 bg-gray-300 mx-auto rounded duration-200 skeleton-loader"></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="bg-gray-300 h-8 w-2/4 rounded duration-200 skeleton-loader"></div>
          <div class="h-20 bg-gray-300 w-full rounded mt-4 duration-200 skeleton-loader"></div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
      <div class="mt-6 space-y-10">
        <div class="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-x-16 w-full max-w-7xl mx-auto mb-10">
          <!-- imagen a la izquierda -->
          <div class="w-auto lg:w-full flex justify-center items-center h-full">
            <img src="/img/c2.svg" alt="Descripción de la imagen"
              class="w-96 h-96 object-contain max-h-screen transform transition duration-500 ease-in-out hover:scale-105 fade-in"/>
          </div>
          <!-- contenido por etapas -->
          <div class="flex-grow flex flex-col space-y-8 items-center text-center mt-2 w-full lg:w-2/3">
            <div class="relative grid grid-cols-4 gap-4 sm:gap-16 lg:gap-24 xl:gap-16 mb-8">
              <div class="flex flex-col items-center">
                <div class="w-20 h-20 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xl font-bold">1</div>
                <span class="mt-4 text-center font-semibold text-gray-700">Proyecto de Investigación</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-20 h-20 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xl font-bold">2</div>
                <span class="mt-4 text-center font-semibold text-gray-700">Ejecución (Actual)</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-20 h-20 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xl font-bold">3</div>
                <span class="mt-4 text-center font-semibold text-gray-700">Informe Final</span>
              </div>
              <div class="flex flex-col items-center">
                <div class="w-20 h-20 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xl font-bold">4</div>
                <span class="mt-4 text-center font-semibold text-gray-700">Sustentación</span>
              </div>
            </div>
            <!-- mensaje en que etapa se encuentra -->
            <p class="text-lg md:text-xl text-gray-600">¡Estás a mitad de camino! Mantente enfocado y recuerda que cada paso te lleva más cerca de tu meta.</p>
            <!-- fecha de inicio y fin -->
            <div class="flex flex-col md:flex-row justify-around items-center w-full space-y-4 md:space-y-0 md:space-x-8">
              <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-full max-w-xs transform transition duration-500 ease-in-out hover:scale-105">
                <div class="text-lg font-semibold text-gray-800">Inicio</div>
                <div class="text-1xl text-azul font-bold">{{ startDate }}</div>
              </div>
              <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-full max-w-xs transform transition duration-500 ease-in-out hover:scale-105">
                <div class="text-lg font-semibold text-gray-800">Fin</div>
                <div class="text-1xl text-azul font-bold">{{ endDate }}</div>
              </div>
            </div>
            <!-- boton para ir al siguiente paso -->
            <div class="flex justify-center gap-6">
              <button 
                class="px-6 py-3 w-64 bg-base text-white rounded-lg transition text-lg"
                :disabled="documents.length === 0"
                :class="documents.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-azul'"
                @click="goToConformidadInformeAsesor">Ir a Informe Final
              </button>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-2xl font-medium text-black">Documentos de Proyecto de Investigación</h2>
          </div>
          <div class="overflow-x-auto mt-4">
            <DocumentTabla 
              :documents="documents"/>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 2s ease-in;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>