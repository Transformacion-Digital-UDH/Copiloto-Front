<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import ButtonRequest from '@/components/ButtonRequest.vue';
import { useTypewriter } from '@/composables/useTypewriter';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Aprobación del Informe Final");
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
  router.push("/estudiante/declaracion-apto-sustentar");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.oficio_estado !== 'tramitado' || obtener.value.resolucion_estado !== 'tramitado';
});

/*************************************** INTEGRACION CON EL BACKEND ************************************************ */
const load = ref(false);
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false); 
const obtener = ref<Estudiante | null>(null);

const VIEW_AINFORME  = import.meta.env.VITE_URL_VIEW_AINFORME ;
const DOWNLOAD_AINFROME  = import.meta.env.VITE_URL_DOWNLOAD_AINFROME ;
const VIEW_RINFORME = import.meta.env.VITE_URL_VIEW_RINFORME;
const DOWNLOAD_RINFORME = import.meta.env.VITE_URL_DOWNLOAD_RINFORME;

// para que el botón quede deshabilitado
const bloquearBoton = ['pendiente', 'observado', 'tramitado']
const isAprobacionDisabled = computed(() => {
  return (isLoading.value || (bloquearBoton.includes(obtener.value?.oficio_estado ?? '') || bloquearBoton.includes(obtener.value?.resolucion_estado ?? '')));
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

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`/api/estudiante/get-info-aprobar/informe/${student_id}`);
    // console.log("Mostrando lo recibido", response.data);
    obtener.value = response.data;

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data?.mensaje || error.mensaje);
  } finally {
    load.value = false;
  }
};

// funcion de disparador para solicitar aprob informe
const solicitarAprobacionInforme = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar/informe/${student_id}`);

    if (response.data.estado) {
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada. Espere las indicaciones para la aprobación del informe final.", "Éxito", "success");
      await obtenerDatosEstudiante();
    }

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      const mensaje1 = error.response.data.mensaje;
      alertToast(mensaje1, "Advertencia", "warning");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

onMounted(() =>{
  obtenerDatosEstudiante();
});

</script>
<template>
  <template v-if="load">
    <div class="flex-1 p-10 bg-gray-100 min-h-full">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br><br>
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
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
      <div class="mt-6 space-y-10">
        <!-- solicitar aprobacion de informe final -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center space-x-3">
            <h2 class="text-xl font-medium text-black">1. Solicitar aprobación del informe final por la facultad</h2>
              <ModalToolTip :infoModal="[{ info: 'Se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />       
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en el botón  
            <strong class="text-green-500 text-sm font-medium">"Solicitar aprobación"</strong> para enviar tu solicitud a la Facultad y al Programa Académico.
          </p>
          <!-- boton para solicitar aprobacion informe final -->
          <div class="flex justify-center mt-5">
            <ButtonRequest 
              label="Solicitar aprobación" 
              :loading="isLoading" 
              :disabled="isAprobacionDisabled" 
              @click="solicitarAprobacionInforme" />
          </div>
        </div>

        <!-- documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-xl font-medium text-black">2. Documentos que verifican la aprobacion del informe final </h2>
          </div>
          <!-- oficio de programa academico -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo="OFICIO DE APROBACION DEL INFORME FINAL DEL TRABAJO DE INVESTIGACION (TESIS) - POR EL PROGRAMA ACADEMICO"
              :estado="obtener?.oficio_estado || ''"
              :id="obtener?.oficio_id ?? ''"
              :observacion="obtener?.oficio_observacion || 'Por favor, comunícate con secretaría del programa académico'"
              :view="VIEW_AINFORME"
              :download="DOWNLOAD_AINFROME || ''"/>
          </div>

          <!-- resolución de Facultad -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo="RESOLUCION DE APROBACION DEL INFORME FINAL DEL TRABAJO DE INVESTIGACION (TESIS) - POR LA FACULTAD"
              :estado="obtener?.resolucion_estado || ''"
              :id="obtener?.resolucion_id ?? ''"
              :observacion="obtener?.resolucion_observacion || 'Por favor, comunícate con secretaría Facultad'"
              :view="VIEW_RINFORME"
              :download="DOWNLOAD_RINFORME"/>
          </div>
        </div>

        <!-- Botones siguiente y anteerior -->
        <div class="flex justify-between">
          <button 
            @click="$router.push('/estudiante/conformidad-vri')" 
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
          </button>
          <button
            @click="handleNextButtonClick"
            :class="['px-4 py-2 text-white rounded-md', isNextButtonDisabled 
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
  border-radius: 0.375rem;
  display: inline-block;
}
.text-center {
  text-align: center;
  padding: 1rem;
}
</style>