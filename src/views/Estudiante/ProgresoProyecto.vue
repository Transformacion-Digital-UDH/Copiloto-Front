<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useTypewriter } from '@/composables/useTypewriter';
import DocumentTabla from '@/components/DocumentTabla.vue';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Ejecución de tu Proyecto de Investigación");
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
        nombre: "Carta de Aceptación",
        emisor: response.data.designacion_asesor.doc_emisor,
        fechaEmision: response.data.designacion_asesor.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_LETTER}/${response.data.designacion_asesor.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_LETTER}/${response.data.designacion_asesor.doc_id}`,
      },
      {
        nombre: "RESOLUCION DE DESIGNACION DE DOCENTE ASESOR PARA TRABAJO DE INVESTIGACION - POR LA FACULTAD",
        emisor: response.data.designacion_asesor.res_emisor,
        fechaEmision: response.data.designacion_asesor.res_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_RESOLUTION}/${response.data.designacion_asesor.res_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_RESOLUTION}/${response.data.designacion_asesor.res_id}`,
      },
      {
        nombre: "ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL ASESOR",
        emisor: response.data.conformidad_asesor.doc_emisor,
        fechaEmision: response.data.conformidad_asesor.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_asesor.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_asesor.doc_id}`,
      },
      {
        nombre: "OFICIO MULTIPLE DE DESIGNACION DE JURADOS PARA LA REV. DEL TRABAJO DE INV. (TESIS) - POR EL PROGRAMA ACADEMICO",
        emisor: response.data.desigancion_jurados.doc_emisor,
        fechaEmision: response.data.desigancion_jurados.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_OFFICEJURADO}/${response.data.desigancion_jurados.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_OFFICEJURADO}/${response.data.desigancion_jurados.doc_id}`,
      },
      {
        nombre: "ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL JURADO PRESIDENTE",
        emisor: response.data.conformidad_jurado_pres.doc_emisor,
        fechaEmision: response.data.conformidad_jurado_pres.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_pres.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_pres.doc_id}`,
      },
      {
        nombre: "ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL JURADO SECRETARIO",
        emisor: response.data.conformidad_jurado_secre.doc_emisor,
        fechaEmision: response.data.conformidad_jurado_secre.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_secre.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_secre.doc_id}`,
      },
      {
        nombre: "ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL JURADO VOCAL",
        emisor: response.data.conformidad_jurado_vocal.doc_emisor,
        fechaEmision: response.data.conformidad_jurado_vocal.doc_fecha,
        urlView: `${import.meta.env.VITE_URL_VIEW_CPA}/${response.data.conformidad_jurado_vocal.doc_id}`,
        urlDownload: `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${response.data.conformidad_jurado_vocal.doc_id}`,
      },
      {
        nombre: "RESOLUCION DE APROBACIÓN DEL TRABAJO DE INVESTIGACIÓN (TESIS)",
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
  <div class="flex-1 p-6 font-Roboto bg-white min-h-full">
    <!-- Título Tipiado -->
    <h3 class="text-2xl md:text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
    <div class="mt-8 space-y-8">
      <!-- Indicadores del Progreso -->
      <div class="flex flex-wrap justify-center items-center gap-4 lg:gap-8 mb-4">
        <!-- Paso 1 -->
        <div class="flex flex-col items-center w-1/2 sm:w-auto">
          <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xs md:text-sm font-bold">
            1
          </div>
          <span class="mt-2 text-xs md:text-sm font-medium text-azul text-center">
            Proyecto de Investigación
          </span>
        </div>

        <!-- Paso 2 -->
        <div class="flex flex-col items-center w-1/2 sm:w-auto">
          <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-base text-white rounded-full shadow-lg text-xs md:text-sm font-bold">
            2
          </div>
          <span class="mt-2 text-xs md:text-sm font-medium text-azul text-center">
            Ejecución (Actual)
          </span>
        </div>

        <!-- Paso 3 -->
        <div class="flex flex-col items-center w-1/2 sm:w-auto">
          <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xs md:text-sm font-bold">
            3
          </div>
          <span class="mt-2 text-xs md:text-sm font-medium text-azul text-center">
            Informe Final
          </span>
        </div>

        <!-- Paso 4 -->
        <div class="flex flex-col items-center w-1/2 sm:w-auto">
          <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-400 text-white rounded-full shadow-lg text-xs md:text-sm font-bold">
            4
          </div>
          <span class="mt-2 text-xs md:text-sm font-medium text-azul text-center">
            Sustentación
          </span>
        </div>
      </div>

    </div>

    <!-- Imagen y Contenido -->
    <div class="flex flex-col lg:flex-row items-center justify-center gap-8 py-10 bg-gray-50">
      <!-- Imagen -->
      <div class="flex justify-center items-center lg:w-1/2">
        <img src="/img/pr2.svg" alt="Progreso del Proyecto"
          class="w-72 sm:w-96 lg:w-[400px] h-auto object-contain transition-transform duration-500 hover:scale-105" />
      </div>

      <!-- Contenido -->
      <div class="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 w-full lg:w-1/2 px-4">
        <!-- Título -->
        <h2 class="text-xl sm:text-3xl font-bold text-gray-800">
          ¡Estás a mitad de camino!
        </h2>
        <p class="text-gray-600 text-xm sm:text-md">
          Mantente enfocado y recuerda que cada paso te lleva más cerca de tu meta.
        </p>

        <!-- Tarjetas -->
        <div class="flex flex-col sm:flex-row items-center lg:items-start justify-center gap-4">
          <!-- Tarjeta Inicio -->
          <div class="bg-white p-4 rounded-lg shadow-md w-48 text-center">
            <div class="text-sm font-bold text-azul">Inicio</div>
            <div class="text-lg font-bold text-base">{{ startDate }}</div>
          </div>

          <!-- Tarjeta Fin -->
          <div class="bg-white p-4 rounded-lg shadow-md w-48 text-center">
            <div class="text-sm font-bold text-azul">Fin</div>
            <div class="text-lg font-bold text-base">{{ endDate }}</div>
          </div>
        </div>

        <!-- Botón -->
        <button
          class="mt-4 px-6 py-3 bg-base text-white rounded-lg shadow-md hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-transform transform hover:scale-105 text-lg font-medium"
          :disabled="documents.length === 0"
          :class="documents.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-green-500'">
          Ir a Informe Final
        </button>
      </div>
    </div>

    <!-- Tabla de Documentos -->
    <div class="bg-white rounded-lg shadow-lg p-4 mt-6">
      <!-- Título centrado -->
      <h2 class="text-xl sm:text-xl font-medium text-gray-700 text-center">
        Documentos del proyecto de investigación
      </h2>
      <!-- Contenedor de la tabla -->
      <div class="overflow-x-auto mt-4">
        <DocumentTabla :documents="documents" />
      </div>
    </div>
  </div>
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
