<script lang="ts" setup>
import { alertToast } from '@/functions';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from '@/components/modalToolTip.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import ButtonRequest from '@/components/ButtonRequest.vue';
import { useTypewriter } from '@/composables/useTypewriter';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Declaración de Apto para Sustentar");
onMounted(typeWriter);

const handleNextButtonClick = () => {
  if (isNextButtonDisabled.value) {
    Swal.fire({
      icon: "warning",
      title: "Pasos incompletos",
      text: "Por favor, completa todos los pasos antes de continuar.",
      confirmButtonText: "OK",
    });
  } else {
    goToNextPage();
  }
};

const goToNextPage = () => {
  router.push("/estudiante/designacion-fecha-hora");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.oficio_estado !== 'tramitado' || obtener.value.resolucion_estado !== 'tramitado';
});

//************************************* INTEGRACION EL BACKEND PARA VER Y SOLICITAR JURADOS ********************************************* */
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false);
const load = ref(false);
const obtener = ref<Estudiante | null>(null);

const VIEW_OSINFORME  = import.meta.env.VITE_URL_VIEW_OSINFORME ;
const DOWNLOAD_OSINFORME  = import.meta.env.VITE_URL_DOWNLOAD_OSINFORME ;
const VIEW_RSNFORME = import.meta.env.VITE_URL_VIEW_RSNFORME;
const DOWNLOAD_RSNFORME = import.meta.env.VITE_URL_DOWNLOAD_RSNFORME;

// para que el botón quede deshabilitado
const bloquear = ['pendiente', 'observado', 'tramitado']
const isSolicitarDisabled = computed(() => {
  return (isLoading.value || (bloquear.includes(obtener.value?.oficio_estado ?? '') || bloquear.includes(obtener.value?.resolucion_estado ?? '')));
});

interface Estudiante {
  estudiante_id: string;
  oficio_id: string;
  oficio_estado: string;
  oficio_observacion?: string;
  resolucion_id: string;
  resolucion_estado: string;
  resolucion_observacion?: string;
}

const obtenerDatosEstudianteAptoSustentacion = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/estudiante/get-info/declarar-apto/${student_id}`);
    // console.log("Datos recibidos: ", response.data);

    obtener.value = response.data;

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data?.message || error.message);
  } finally {
    load.value = false;
  }
};

// funcion para solicitar apto para sustentar
const solicitarAptoSustentar = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/declarar-apto/${student_id}`);
  
    if (response.data.estado === 'pendiente') {
      solicitudEstado.value = 'pendiente';
      alertToast("Solicitud enviada. Espere indicaciones para la sustentación de tesis.", "Éxito", "success");
      await obtenerDatosEstudianteAptoSustentacion();
    }
    
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      const mensaje = error.response.data.message;
      alertToast(mensaje, "Advertencia", "warning");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

onMounted(() => {
  obtenerDatosEstudianteAptoSustentacion();
});

</script>
<template>
   <template v-if="load">
    <div class="flex-1 p-10 bg-gray-100 min-h-screen">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md shadow-lg p-6 h-auto -mt-6 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-52 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
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
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <h3 class="text-4xl -mb-2 font-bold text-center text-azul">{{ textoTipiado }}</h3>
      <div class="mt-6 space-y-10">
        <!-- solicitar declracion apto para suistentar -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-xl font-medium text-black">1. Solicitar oficio para sustentar</h2>
            <ModalToolTip :infoModal="[{ info: 'Se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />                
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en el botón  
            <strong class="text-green-500 text-sm font-medium">"Solicitar Oficio de Apto"</strong> para solicitar la aprobación necesaria para sustentar.
          </p>
          <!-- boton para solicitar apto para sustentar -->
          <div class="flex justify-center mt-4">
            <ButtonRequest 
              label="Solicitar oficio de apto" 
              :loading="isLoading" 
              :disabled="isSolicitarDisabled" 
              @click="solicitarAptoSustentar" />
          </div>
        </div>

        <!-- documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="flex items-center">
              <h2 class="text-xl font-medium text-black">2. Documentos para la sustentación</h2>
              <ModalToolTip 
                :infoModal="[{ info: 'Por favor espere que se carguen los documentos que verifican su conformidad de Apto para Sustentar.' },]" /> 
            </div>
            <!-- oficio de PAISI -->
            <div class="mt-4 space-y-4">
              <DocumentCard 
                  titulo="Oficio emitido por el Programa Académico."
                  :estado="obtener?.oficio_estado || ''"
                  :id="obtener?.oficio_id ?? ''"
                  :observacion="obtener?.oficio_observacion || 'Por favor, comunícate con secretaría PAISI'"
                  :view="VIEW_OSINFORME"
                  :download="DOWNLOAD_OSINFORME"/>
            </div>

            <!-- resolución de Facultad -->
            <div class="mt-4 space-y-4">
              <DocumentCard 
                  titulo="Resolución de Declaración de Apto para Sustentación."
                  :estado="obtener?.resolucion_estado || ''"
                  :id="obtener?.resolucion_id ?? ''"
                  :observacion="obtener?.resolucion_observacion || 'Por favor, comunícate con secretaría Facultad'"
                  :view="VIEW_RSNFORME"
                  :download="DOWNLOAD_RSNFORME"/>
            </div>
          </div>
        
        <!--Botones siguiente y anteerior-->
        <div class="flex justify-between">
          <button
            @click="$router.push('/estudiante/aprobacion-informe')" 
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
          </button>
          <button
            @click="handleNextButtonClick"
            :class="[ 'px-4 py-2 text-white rounded-md', isNextButtonDisabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600',]">Siguiente
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
}
.text-center {
  text-align: center;
  padding: 1rem;
}
</style>