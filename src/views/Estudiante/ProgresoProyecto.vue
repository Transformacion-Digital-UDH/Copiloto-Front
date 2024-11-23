<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';


// ***** Texto que se escribe automáticamente ********
const text = "Ejecución de tu Proyecto de Tesis";
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
  <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
    <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
    <div class="mt-6 space-y-10">
      <div
        class="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-x-16 w-full max-w-7xl mx-auto mb-10">
        <!-- Imagen SVG a la izquierda -->
        <div class="w-auto lg:w-full flex justify-center items-center h-full">
          <img src="/img/c2.svg" alt="Descripción de la imagen"
            class="w-96 h-96 object-contain max-h-screen transform transition duration-500 ease-in-out hover:scale-105 fade-in" />
        </div>

        <!-- Contenido central -->
        <div class="flex-grow flex flex-col space-y-8 items-center text-center mt-2 w-full lg:w-2/3">
          <!-- Etapas del proceso -->
          <div class="relative grid grid-cols-4 gap-4 sm:gap-16 lg:gap-24 xl:gap-16 mb-8">
            <div class="flex flex-col items-center">
              <div
                class="w-20 h-20 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xl font-bold">
                1
              </div>
              <span class="mt-4 text-center font-semibold text-gray-700">Proyecto de Tesis</span>
            </div>
            <div class="flex flex-col items-center">
              <div
                class="w-20 h-20 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xl font-bold">
                2
              </div>
              <span class="mt-4 text-center font-semibold text-gray-700">Ejecución (Actual)</span>
            </div>
            <div class="flex flex-col items-center">
              <div
                class="w-20 h-20 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xl font-bold">
                3
              </div>
              <span class="mt-4 text-center font-semibold text-gray-700">Informe Final</span>
            </div>
            <div class="flex flex-col items-center">
              <div
                class="w-20 h-20 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xl font-bold">
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
            <div
              class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-full max-w-xs transform transition duration-500 ease-in-out hover:scale-105">
              <div class="text-lg font-semibold text-gray-800">Inicio</div>
              <div class="text-1xl text-azul font-bold">{{ startDate }}</div>
            </div>
            <div
              class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-full max-w-xs transform transition duration-500 ease-in-out hover:scale-105">
              <div class="text-lg font-semibold text-gray-800">Fin</div>
              <div class="text-1xl text-azul font-bold">{{ endDate }}</div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-center gap-6">
            <button
              class="px-4 py-2 md:px-8 md:py-4 bg-base text-white rounded-lg hover:bg-baseClarito transition text-lg md:text-xl"
              @click="goToConformidadInformeAsesor">
              Ir a Informe Final
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center">
          <h2 class="text-2xl font-medium text-black">Documentos de Proyecto de Tesis</h2>
        </div>
        <div class="overflow-x-auto mt-4">
          <table class="w-full max-w-full bg-white border rounded-md shadow">
            <thead>
              <tr class="text-center text-azul bg-gray-300 truncate">
                <th class="px-4 py-2 text-left tracking-wider">DOCUMENTOS</th>
                <th class="px-4 py-2 text-left tracking-wider">EMISOR</th>
                <th class="px-4 py-2 tracking-wider">FECHA EMISIÓN</th>
                <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
              </tr>
            </thead>
            <tbody v-if="documents && documents.length > 0">
              <tr v-for="(doc, index) in documents" :key="index" class="border-b border-gray-200 text-center uppercase">
                <td class="px-4 py-2 text-md text-left text-gray-600">
                  <p class="">{{ doc.nombre || "Sin documento" }}</p>
                </td>
                <td class="px-4 py-2 text-md text-left text-gray-600">
                  <p class="">{{ doc.emisor || "Sin emisor" }}</p>
                </td>
                <td class="px-4 py-2 text-md text-gray-600">
                  <p class="truncate">{{ doc.fechaEmision || "Sin fecha" }}</p>
                </td>
                <td class="px-4 py-4 justify-center flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 w-full">
                  <a 
                    :href="doc.urlView" target="_blank"
                    class="flex items-center px-2 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2 text-xs"></i> Ver
                  </a>
                  <a 
                    :href="doc.urlDownload" download
                    class="flex items-center px-2 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2 text-xs"></i> Descargar
                  </a>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="4" class="px-4 py-6 text-center text-gray-600 align-middle">
                  <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay observaciones disponibles por el momento.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsivo y mejoras de UI */

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