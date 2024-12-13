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
import JuradoTabla from '@/components/JuradoTabla.vue';
import { useTypewriter } from '@/composables/useTypewriter';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Designación de Jurados para el Informe Final");
onMounted(typeWriter);

// Función para solicitar cambio de jurado
const solicitarCambioJurado = (jurado: any) => {
  alert(`Has solicitado el cambio del jurado: ${jurado.nombre}`);
};

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
  router.push("/estudiante/conformidad-informe-jurado");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.oficio.of_estado !== 'tramitado' || obtener.value.resolucion.of_estado !== 'tramitado';
});

//************************************* INTEGRACION EL BACKEND PARA VER Y SOLICITAR JURADOS ********************************************* */
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const isLoading = ref(false);
const load = ref(false);
const obtener = ref<Informacion | null>(null);
const jurados = ref<{ rol: string; nombre: string }[]>([]);

const VIEW_OFINFORME = import.meta.env.VITE_URL_VIEW_OFINFORME;
const DOWNLOAD_OFINFORME = import.meta.env.VITE_URL_DOWNLOAD_OFINFORME;
const VIEW_RINFORME = import.meta.env.VITE_URL_VIEW_RINFORME;
const DOWNLOAD_RINFORME = import.meta.env.VITE_URL_DOWNLOAD_RINFORME;

// para que el botón quede deshabilitado
const bloquear = ['pendiente', 'observado', 'tramitado']
const isSolicitarDisabled = computed(() => {
  return ( isLoading.value || (bloquear.includes(obtener.value?.oficio.of_estado ?? '') || bloquear.includes(obtener.value?.resolucion.of_estado ?? '')));
});

interface Jurado {
  rol: string;
  nombre: string;
}

interface Informacion {
  estudiante_id: string;
  presidente: Jurado;
  secretario: Jurado;
  vocal: Jurado;
  oficio: {
    of_id: string;
    of_estado: string;
  };
  resolucion: {
    of_id: string;
    of_estado: string;
    resolucion_observacion: string;
  };
}

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/estudiante/info-juries/informe/${student_id}`);
    // console.log('Mostrando lo recibido: ', response.data);

    obtener.value = response.data;

    jurados.value = [
      { rol: "Presidente", nombre: obtener.value?.presidente.nombre || "" },
      { rol: "Secretario", nombre: obtener.value?.secretario.nombre || "" },
      { rol: "Vocal", nombre: obtener.value?.vocal.nombre || "" },
    ].filter(jurado => jurado.nombre);

  } catch (error) {
    console.error('Error al obtener jurados designados', error);
  } finally {
    load.value = false;
  }
};

// funcion para solicitar jurado
const solicitarJuradoInforme = async () => {
  isLoading.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/oficio/crear-solicitud-jurados/informe/${student_id}`);
  
    if (response.data.estado) {
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada. Espere las indicaciones para la designación de tus jurados.", "Éxito", "success");
      await obtenerDatosEstudiante();
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
  obtenerDatosEstudiante();
});

</script>
<template>
   <template v-if="load">
    <div class="flex-1 p-10 bg-gray-100 min-h-full">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-28 w-2/4 mx-auto rounded-md skeleton-loader duration-200"></h2>
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
      <div class="mt-6 space-y-8">
        <!-- Card 1: Pago de Trámite
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Pago de Trámite</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalTramite = true"
                @mouseleave="mostrarModalTramite = false" />
          </div>

          <div v-show="mostrarModalTramite" class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">
              Asegurate de haber realizado el pago del trámite.
            </p>
          </div>

           Listado de trámites dinámico -->
          <!-- <div class="mt-4 space-y-6">
            <div v-for="(proceso, index) in procesos.slice(0, 1)" :key="index"
              class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
              <h4 class="text-black flex-1">{{ proceso.título }}</h4>
              <span :class="estadoClase(proceso.estado)" class="estado-estilo ml-4">{{ proceso.estado }}</span>
            </div>
          </div>
        </div> --> 
        <!-- solicitar designacion de jurados IF -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-xl font-medium text-black">1. Solicitar designación de jurados</h2>
            <ModalToolTip :infoModal="[{ info: 'Tus jurados serán seleccionados por el coordinador y se mostrarán en la brevedad en el sistema.' },]" />               
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en el botón  
            <strong class="text-green-500 text-sm font-medium">"Solicitar jurados"</strong> para la designación de jurados.
          </p>
          <!-- boton para solicitar designacion de jurados -->
          <div class="flex justify-center mt-4">
            <ButtonRequest 
              label="Solicitar jurados" 
              :loading="isLoading" 
              :disabled="isSolicitarDisabled" 
              @click="solicitarJuradoInforme" />
          </div>
        </div>

        <!-- jurados designados -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-xl font-medium text-black">2. Los jurados designados para tu informe final son:</h2>
          </div>
          <div class="overflow-x-auto mt-4 flex justify-center">
            <JuradoTabla :jurados="jurados"/>
          </div>
        </div>

        <!-- se muestra oficio y resolucion de cada area -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-xl font-medium text-black">3. Documentos para la conformidad de designación de jurados</h2>
            <ModalToolTip :infoModal="[{ info: 'Estos son los documentos oficiales con los jurados designados. Asegúrate de revisarlos antes de continuar.' },]" />                   
          </div>
          <!-- oficio de PAISI -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo="OFICIO DE DESIGNACION DE JURADOS REV. PARA EL INF.FINAL DEL TRAB. INV.(TESIS) - POR EL PROGRAMA ACADEMICO."
              :estado="obtener?.oficio.of_estado || ''"
              :id="obtener?.oficio.of_id ?? ''"
              :view="VIEW_OFINFORME"
              :download="DOWNLOAD_OFINFORME"/>
          </div>
          
          <!-- resolucion de facultad -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo="RESOLUCION DE DESIGNACION DE JURADOS REV. PARA EL INF.FINAL DEL TRAB. INV.(TESIS) - POR LA FACULTAD"
              :estado="obtener?.resolucion.of_estado || ''"
              :id="obtener?.resolucion.of_id ?? ''"
              :observacion="obtener?.resolucion.resolucion_observacion || 'Por favor, comunícate con secretaría Facultad'"
              :view="VIEW_RINFORME"
              :download="DOWNLOAD_RINFORME"/>
          </div>
        </div>

        <!--Botones siguiente y anteerior-->
        <div class="flex justify-between">
          <button
            @click="$router.push('/estudiante/conformidad-informe-asesor')" 
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
          </button>
          <button
            @click="handleNextButtonClick"
            :class="[ 'px-4 py-2 text-white rounded-md', isNextButtonDisabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600',]">Siguiente
          </button> 
        </div>

          <!-- Card 4: Solicitar cambio de jurado
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-gray-500"> Solicitar cambio de jurado</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalCambioJurado = true"
              @mouseleave="mostrarModalCambioJurado = false" />
          </div>

          <div v-show="mostrarModalCambioJurado" class="absolute left-56 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Puedes solicitar el cambio de uno o más jurados si consideras necesario.</p>
          </div>

          <div class="flex items-center justify-between mt-2">
            <p class="text-lg text-gray-800">Haz clic en el botón para solicitar un cambio de jurado.</p>
          </div>

          <div class="mt-4">
            <div class="flex justify-center mt-6">
              <button class="px-4 py-2 bg-base text-white rounded-md" @click="solicitarCambioJurado">
                SOLICITAR CAMBIO DE JURADO
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-medium text-gray-500">Selecciona los Jurados que deseas cambiar</h2>
            <span :class="`estado-${procesos[3].estado.toLowerCase().replace(' ', '-')}`" class="estado-estilo ml-4">{{ procesos[3].estado }}</span>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-left uppercase bg-gray-50 border border-gray-200 rounded-md shadow">
              <thead>
                <tr class="text-black border-b-2 bg-gray-300">
                  <th class="px-4 py-2 text-gray-600 border-b">ROL</th>
                  <th class="px-4 py-2 text-gray-600 border-b">NOMBRE Y APELLIDO</th>
                  <th class="px-4 py-2 text-gray-600 border-b">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="jurado in jurados" :key="jurado.id" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-4 py-2 border-b">{{ jurado.rol }}</td>
                  <td class="px-4 py-2 border-b">{{ jurado.asesor }}</td>
                  <td class="px-4 py-2 border-b">
                  <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm" @click="solicitarCambioJurado(jurado)">
                    Cambiar
                  </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> -->
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