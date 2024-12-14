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
import FechayHoraCard from '@/components/FechayHoraCard.vue';
import ButtonRequest from '@/components/ButtonRequest.vue';
import { useTypewriter } from '@/composables/useTypewriter';
import EstadoBolita from "@/components/EstadoBolita.vue";

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Designación de Fecha y Hora para Sustentación");
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
  router.push("/estudiante/sustentacion");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.oficio_estado !== 'tramitado' || obtener.value.resolucion_estado !== 'tramitado';
});

const estadoBolitaFechayHora = computed(() => {
  if (isSolicitarDisabled.value) {
    return "hecho"; // Estado cuando el botón está deshabilitado
  } else if (isLoading.value) {
    return "pendiente"; // Estado cuando está cargando
  }
  return "pendiente"; // Valor por defecto
});

// Computed para manejar el estado de la bolita de los documentos de fecha y hora
const estadoBolitaFechayHoraDocumentos = computed(() => {
  const estados = [
    obtener.value?.oficio_estado || "pendiente",
    obtener.value?.resolucion_estado || "pendiente",
  ];

  // Si alguno de los estados es "observado", retornar "observado"
  if (estados.includes("observado")) {
    return "observado";
  }

  // Si alguno de los estados es "pendiente", retornar "pendiente"
  if (estados.includes("pendiente")) {
    return "pendiente";
  }

  // Si todos los estados son "tramitado", retornar "hecho"
  if (estados.every(estado => estado === "tramitado")) {
    return "hecho";
  }

  // Valor por defecto
  return "pendiente";
});


//************************************* INTEGRACION EL BACKEND PARA VER Y SOLICITAR JURADOS ********************************************* */
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false);
const load = ref(false);
const obtener = ref<Estudiante | null>(null);
const jurados = computed(() => obtener.value?.data ?? []);

const VIEW_FYH  = import.meta.env.VITE_URL_VIEW_FYH;
const DOWNLOAD_FYH  = import.meta.env.VITE_URL_DOWNLOAD_FYH;
const VIEW_RFYH = import.meta.env.VITE_URL_VIEW_RFYH;
const DOWNLOAD_RFYH = import.meta.env.VITE_URL_DOWNLOAD_RFYH;

// para que el botón quede deshabilitado
const bloquear = ['pendiente', 'observado', 'tramitado']
const isSolicitarDisabled = computed(() => {
  return (isLoading.value || (bloquear.includes(obtener.value?.oficio_estado ?? '') || bloquear.includes(obtener.value?.resolucion_estado ?? '')));
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
    // console.log("Mostrando lo recibido", response)
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
    // console.log("Mostrando lo recibido", response)
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
    <div class="flex-1 p-10 bg-gray-100 min-h-full">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class=" h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md shadow-lg p-6 relative">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div class="bg-gray-200 rounded-md h-32 p-6 flex flex-col items-center shadow-md skeleton-loader"></div>
            <div class="bg-gray-200 rounded-md h-32 p-6 flex flex-col items-center shadow-md skeleton-loader"></div>            
            <div class="bg-gray-200 rounded-md h-32 p-6 flex flex-col items-center shadow-md skeleton-loader"></div>            
            <div class="bg-gray-200 rounded-md h-32 p-6 flex flex-col items-center shadow-md skeleton-loader"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="flex-1 rounded-md h-36 shadow-md p-6 duration-200 skeleton-loader"></div>
            <div class="flex-1 rounded-md h-36 shadow-md p-6 duration-200 skeleton-loader"></div>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto -mt-6 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"></h2>
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
        <div v-if="obtener" class="bg-white rounded-lg shadow-lg p-6 relative">
          <!-- mostrar jurados -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <JuradoCard
              v-for="jurado in jurados"
              :rol="jurado.asesor_rol"
              :nombre="jurado.asesor_nombre"/>
          </div>
          <!-- mostrar fehcha y hora -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <FechayHoraCard :fecha="obtener?.sus_fecha" :hora="obtener?.sus_hora"/>
          </div>
        </div>

        <!-- solicitar fecha y hora de sustentacion -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center space-x-3">
            <EstadoBolita :estado="estadoBolitaFechayHora" />
            <h2 class="text-xl font-medium text-black">1. Solicitar designación de fecha y hora para sustentar</h2>
            <ModalToolTip :infoModal="[{ info: 'Se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />               
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">Haz click en el botón  
            <strong class="text-base text-sm font-medium">"Solicitar fecha y hora"</strong> para solicitar la fecha y hora asignadas para la sustentación.
          </p>
          <!-- boton de solicitud fecha y hora --> 
          <div class="flex justify-center mt-4">
            <ButtonRequest 
              label="Solicitar fecha y hora" 
              :loading="isLoading" 
              :disabled="isSolicitarDisabled" 
              @click="solicitarFechayHora" />
          </div>
        </div>

        <!-- documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center space-x-3">
            <EstadoBolita :estado="estadoBolitaFechayHoraDocumentos" />
            <h2 class="text-xl font-medium text-black">2. Documentos de designación de fecha y hora para sustentar</h2>
            <ModalToolTip :infoModal="[{ info: 'Por favor espere que se carguen los documentos que verifiquen la designación de fecha y hora para la sustentación' },]" /> 
          </div>
          <!-- oficio de PAISI -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
                titulo="OFICIO PARA DESIGANCION DE FECHA Y HORA PARA SUSTENTACION DE TESIS - POR EL PROGRAMA ACADEMICO"
                :estado="obtener?.oficio_estado || ''"
                :id="obtener?.oficio_id ?? ''"
                :view="VIEW_FYH"
                :download="DOWNLOAD_FYH"/>
          </div>

          <!-- resolución de Facultad -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
                titulo="RESOLUCION PARA DESIGANCION DE FECHA Y HORA PARA SUSTENTACION DE TESIS - POR LA FACULTAD"
                :estado="obtener?.resolucion_estado || ''"
                :id="obtener?.resolucion_id ?? ''"
                :observacion="obtener?.resolucion_observacion || 'Por favor, comunícate con secretaría PAISI'"
                :view="VIEW_RFYH"
                :download="DOWNLOAD_RFYH"/>
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