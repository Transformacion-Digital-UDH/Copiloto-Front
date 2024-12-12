<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import ButtonRequest from '@/components/ButtonRequest.vue';
import DocumentCard from '@/components/DocumentCard.vue';

// ***** Texto que se escribe automáticamente ********
const text = "Aprobación del Proyecto de Investigación";
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
  router.push("/estudiante/progreso");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.oficio_estado !== 'tramitado' || obtener.value.resolucion_estado !== 'tramitado';
});

/*************************************** INTEGRACION CON EL BACKEND PARA APROBACION DE PROYECTO ************************************************ */
const load = ref(false);
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false);
const obtener = ref<Estudiante | null>(null);

const VIEW_APROBACIONPAISI = import.meta.env.VITE_URL_VIEW_APAISI;
const DOWNLOAD_APROBACIONPAISI = import.meta.env.VITE_URL_DOWNLOAD_APAISI;
const VIEW_APROBACIONFACULTAD = import.meta.env.VITE_URL_VIEW_AFACULTAD;
const DOWNLOAD_APROBACIONFACULTAD = import.meta.env.VITE_URL_DOWNLOAD_AFACULTAD;

const bloquear = ['pendiente', 'observado', 'tramitado']
const isAprobacionDisabled = computed(() => {
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

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`/api/estudiante/get-info-aprobar-tesis/${student_id}`);
    //console.log("Datos recibidos: ", response.data);
    obtener.value = response.data;

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data?.mensaje || error.mensaje);
  } finally {
    load.value = false;
  }
};

const solicitarAprobacionProyecto = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar-tesis/${student_id}`);
    //console.log("Mostrando lo recibido: ",response);

    if (response.data.estado){
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada. Espere las indicaciones para la aprobación del proyecto de tesis.", "Éxito", "success");
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
})

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
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
        <div class="mt-6 space-y-10">
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex flex-col  sm:flex-row items-center justify-between w-full">
              <div class="flex items-center space-x-3">
                <!-- Bolita con estado -->
                <!-- <span
                  class="flex items-center justify-center h-8 w-8 rounded-full border-2"
                  :class="{
                    'bg-green-500 border-green-500 text-white': solicitude.estado === 'aceptado',
                    'bg-orange-500 border-orange-500 text-white': solicitude.estado === 'en progreso',
                    'bg-gray-400 border-gray-400 text-white': !solicitude.estado || solicitude.estado === 'pendiente' || solicitude.estado === 'rechazado'
                  }"
                >
                  <i
                    :class="{
                      'fas fa-check': solicitude.estado === 'aceptado',
                      'fas fa-hourglass-half': solicitude.estado === 'en progreso',
                      'fas fa-ellipsis-h': !solicitude.estado || solicitude.estado === 'pendiente' || solicitude.estado === 'rechazado'
                    }"
                    class="text-sm"
                  ></i>
                </span> -->
                <!-- Título del encabezado -->
                <h2 class="text-xl font-medium text-black">
                  1. Escribe el titulo final de tu tesis
                </h2>
                <!-- Modal con Tooltip -->
                <ModalToolTip
                  :infoModal="[{
                    info: 'Este título ya no lo podrás cambiar posteriormente',
                  }]"
                />
              </div>
              <!-- <Estados :estado="capitalizarEstado(solicitude.estado)" /> -->
            </div>
            <div class="mt-4">
              <!-- Título de tesis -->
              <label for="tituloTesis" class="block text-xm font-medium text-gray-700 mb-2">
                Título de proyecto de investigación (definitivo)
              </label>
              <div class="flex items-center">
                <input
                  id="tituloTesis"
                  type="text"
                  class="w-full p-3 text-sm bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Escribe el título de tu proyecto de investigación aquí"
                />
                <!-- Ícono de check solo si el título está completo -->
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="7"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <br>
              <!-- Botón de enviar -->
              <button class="bg-base   transition-all duration-200 px-6 py-3 text-white rounded-lg shadow-md text-sm md:text-base">
                Enviar
              </button>
          </div>
        </div>


          <!-- solicitar aprobacion de proyecto de tesis-->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="relative flex items-center">
              <h2 class="text-xl font-medium text-black">1. Solicitar aprobación</h2>
                <ModalToolTip :infoModal="[{ info: 'Se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />
            </div>            
            <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en el botón  
              <strong class="text-green-500 text-sm font-medium">"Solicitar aprobación"</strong> para enviar tu solicitud a la Facultad y al Programa Académico.
            </p>
            <!-- boton para solicitar aprobacion de proyecto de tesis -->
            <div class="flex justify-center mt-4">
              <ButtonRequest 
              label="Solicitar aprobación" 
              :loading="isLoading" 
              :disabled="isAprobacionDisabled" 
              @click="solicitarAprobacionProyecto" />
            </div>
          </div>

          <!-- documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="flex items-center">
              <h2 class="text-xl font-medium text-black">2. Documentos que verifican la aprobacion del proyecto de tesis </h2>
            </div>
            <!-- oficio de programa academico-->
            <div class="mt-4 space-y-4">
              <DocumentCard 
                titulo="Solicitud de resolución de aprobación del proyecto de investigación"
                :estado="obtener?.oficio_estado || ''"
                :id="obtener?.oficio_id ?? ''"
                :observacion="obtener?.oficio_observacion || 'Por favor, comunícate con secretaría del programa académico'"
                :view="VIEW_APROBACIONPAISI"
                :download="DOWNLOAD_APROBACIONPAISI || ''"/>
            </div>

            <!-- resolución de Facultad -->
            <div class="mt-4 space-y-4">
              <DocumentCard 
                titulo="Resolución de aprobación del proyecto de investigación"
                :estado="obtener?.oficio_estado || ''"
                :id="obtener?.oficio_id ?? ''"
                :observacion="obtener?.oficio_observacion || 'Por favor, comunícate con secretaría Facultad'"
                :view="VIEW_APROBACIONFACULTAD"
                :download="DOWNLOAD_APROBACIONFACULTAD || ''"/>
            </div>
          </div>

          <!-- Botones siguiente y anteerior -->
          <div class="flex justify-between">
            <button 
              @click="$router.push('/estudiante/conformidad-jurado')" 
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