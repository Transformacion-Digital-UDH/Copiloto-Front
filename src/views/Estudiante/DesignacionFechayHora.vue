<script lang="ts" setup>
import { alertToast } from '@/functions';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from '@/components/modalToolTip.vue';
import JuradoCard from '@/components/JuradoCard.vue';
import DocumentCard from '@/components/DocumentCard.vue';

// ***** Texto que se escribe automáticamente (efecto de máquina de escribir) ********
const text = "Designación de Fecha y Hora para Sustentación";
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

// Estados para los modales
const mostrarModalSustentacion = ref(false); 
const mostrarModalDocumentos = ref(false);

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
  router.push("/estudiante/designacion-jurado-sustentacion");
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
const jurados = computed(() => obtener.value?.data ?? []);

const VIEW_OFHINFORME  = import.meta.env.VITE_URL_VIEW_OFHINFORME;
const DOWNLOAD_OFHINFORME  = import.meta.env.VITE_URL_DOWNLOAD_OFHINFORME;
const VIEW_RFHNFORME = import.meta.env.VITE_URL_VIEW_RFHNFORME;
const DOWNLOAD_RFHNFORME = import.meta.env.VITE_URL_DOWNLOAD_RFHNFORME;

// para que el botón quede deshabilitado
const bloquearBoton = ['pendiente', 'observado', 'tramitado']
const isSolicitarDisabled = computed(() => {
  return (isLoading.value || (bloquearBoton.includes(obtener.value?.oficio_estado ?? '') || bloquearBoton.includes(obtener.value?.resolucion_estado ?? '')));
});

interface Asesor {
  asesor_nombre: string;
  asesor_rol: string;
}

interface Estudiante {
  data: Asesor[];
  sus_fecha: string;
  sus_hora: string;
  oficio_id: string;
  oficio_estado: string;
  resolucion_id: string;
  resolucion_estado: string;
  resolucion_observacion: string;
}

const obtenerDatosEstudianteFechayHora = async () => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/estudiante/get-info/desigancion-fecha-hora-sustentacion/${student_id}`);
    console.log("Mostrando lo recibido", response)
    obtener.value = response.data;

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data?.error || "Error en la solicitud");
  } finally {
    load.value = false;
  }
};

// funcion para solicitar que me asignen jurados
const solicitarFechayHora = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/desigancion-fecha-hora-sustentacion/${student_id}`);
    console.log("Mostrando lo recibido", response)
    if (response.data.estado === 'pendiente') {
      solicitudEstado.value = 'pendiente';
      alertToast("Solicitud enviada. Espere indicaciones sobre la fecha y hora de sustentación.", "Éxito", "success");
      await obtenerDatosEstudianteFechayHora();
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
  obtenerDatosEstudianteFechayHora();
});

</script>
<template>
   <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-5/6 rounded-lg duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8 animate-pulse">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gray-200 rounded-lg h-40 p-6 flex flex-col items-center shadow-md duration-200 skeleton-loader"></div>
            <div class="bg-gray-200 rounded-lg h-40 p-6 flex flex-col items-center shadow-md duration-200 skeleton-loader"></div>            
            <div class="bg-gray-200 rounded-lg h-40 p-6 flex flex-col items-center shadow-md duration-200 skeleton-loader"></div>            
            <div class="bg-gray-200 rounded-lg h-40 p-6 flex flex-col items-center shadow-md duration-200 skeleton-loader"></div>
          </div>
          <div class="flex flex-col md:flex-row gap-4 mt-8">
            <div class="flex-1 rounded-lg h-36 shadow-md p-6 duration-200 skeleton-loader"></div>
            <div class="flex-1 rounded-lg h-36 shadow-md p-6 duration-200 skeleton-loader"></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto -mt-6 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-52 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
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
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-4xl -mb-2 font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
      <div class="mt-6 space-y-10">
        <div v-if="obtener" class="bg-baseClarito rounded-lg shadow-lg p-6 mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <JuradoCard
              v-for="jurado in jurados"
              :rol="jurado.asesor_rol"
              :nombre="jurado.asesor_nombre"/>
          </div>
          <!-- mostrar fehcha y hora -->
          <div class="flex flex-col md:flex-row gap-4 mt-8">
            <div class="flex-1 bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <i class="fas fa-calendar-alt text-blue-500 text-3xl mb-2"></i>
              <span class="block text-lg font-semibold text-gray-700 mt-2">Fecha de Sustentación</span>
              <span class="text-gray-600 text-center mt-2 text-2xl">{{ obtener?.sus_fecha || 'Fecha no asignada' }}</span>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <i class="fas fa-clock text-blue-500 text-3xl mb-2"></i>
              <span class="block text-lg font-semibold text-gray-700 mt-2">Hora de Sustentación</span>
              <span class="text-gray-600 text-center mt-2 text-2xl">{{ obtener?.sus_hora || 'Hora no asignada' }}</span>
            </div>
          </div>
        </div>

        <!-- Card 1: Solicitar designación de Jurados -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Solicitar oficio para fecha y hora</h2>
            <ModalToolTip 
              :infoModal="[{ info: 'Se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />               
          </div>
          <div class="flex items-center justify-between mt-2">
            <p class="text-gray-500 text-base">Haz clic en el botón para solicitar el oficio con la fecha y hora asignadas para la sustentación.</p>
          </div>          
          <div class="mt-4">
            <div class="flex justify-center mt-2">
              <button
                :disabled="isSolicitarDisabled" 
                :class="[ isSolicitarDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-azul', 
                isLoading ? 'cursor-not-allowed' : '' ]"
                class="px-4 py-2 w-64 text-white rounded-md text-lg"
                @click="solicitarFechayHora">
                {{ isLoading ? 'Enviando...' : 'Solicitar Fecha y Hora' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Card 2: Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative mb-20">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">2. Documentos de fecha y hora</h2>
            <ModalToolTip 
              :infoModal="[{ info: 'Por favor espere que se carguen los documentos que verifiquen la designación de fecha y hora para la sustentación' },]" /> 
          </div>
          <!-- Para Oficio de PAISI -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
                titulo="Oficio del Programa Académico de Ingeniería de Sistemas."
                :estado="obtener?.oficio_estado || ''"
                :id="obtener?.oficio_id ?? ''"
                :view="VIEW_OFHINFORME"
                :download="DOWNLOAD_OFHINFORME"/>
          </div>

          <!-- Para Resolución de Facultad -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
                titulo="Resolución de Declaración de Apto para Sustentación."
                :estado="obtener?.resolucion_estado || ''"
                :id="obtener?.resolucion_id ?? ''"
                :observacion="obtener?.resolucion_observacion || 'Por favor, comunícate con secretaría PAISI'"
                :view="VIEW_RFHNFORME"
                :download="DOWNLOAD_RFHNFORME"/>
          </div>
        </div>

        <!--Botones siguiente y anteerior-->
        <div class="flex justify-between">
          <button
            @click="$router.push('/estudiante/declaracion-apto-sustentar')" 
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