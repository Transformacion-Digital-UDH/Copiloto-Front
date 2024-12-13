<script lang="ts" setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { alertToast } from '@/functions';
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import { useTypewriter } from '@/composables/useTypewriter';
import EstadoBolita from "@/components/EstadoBolita.vue";

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Sustentación de tesis");
onMounted(typeWriter);

// const handleNextButtonClick = () => {
//   if (isNextButtonDisabled.value) {
//     Swal.fire({
//       icon: "warning",
//       title: "Pasos incompletos",
//       text: "Por favor, completa todos los pasos antes de continuar.",
//       confirmButtonText: "OK",
//     });
//   } else {
//     goToNextPage();
//   }
// };

// const goToNextPage = () => {
//   router.push("/estudiante/designacion-informe-jurado");
// };

// const isNextButtonDisabled = computed(() => {
//   return obtener.value?.revision?.rev_estado !== 'aprobado';
// });


// Computed para manejar el estado de la bolita del acta de sustentación
const estadoBolitaActaSustentacion = computed(() => {
  const estadoActa = obtener.value?.sus_estado || "pendiente";

  if (estadoActa === "observado") {
    return "observado";
  }

  if (estadoActa === "aprobado") {
    return "hecho";
  }

  return "pendiente"; // Valor por defecto
});


/****************************** INTEGRACION CON EL BACKEND *********************************** */
const authStore = useAuthStore();
const load = ref(false);
const obtener = ref<Estudiante | null>(null);

const VIEW_SUS = import.meta.env.VITE_URL_VIEW_SUS;
const DOWNLOAD_SUS = import.meta.env.VITE_URL_DOWNLOAD_SUS;

interface Estudiante {
  sus_id: string;
  sus_nota: string;
  sus_fecha: string;
  sus_estado: string;
  nota_estado: string;
}

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/estudiante/get/resultado-sustentacion/${student_id}`);
    console.log("Mostrando lo recibido", response);
    obtener.value = response.data;

  } catch (error) {
    console.error("Error al obtener datos", error);
  } finally {
    load.value = false;
  }
};

onMounted(() => {
  obtenerDatosEstudiante();
});

</script>
<template>
  <template v-if="load">
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
    <div class="flex justify-center items-center content-center px-14 flex-col">
      <h3 class="bg-gray-200 h-10 w-full mx-auto rounded-md animate-pulse"></h3><br>
    </div>
    <div class="mt-6 space-y-10">
      <div class="bg-slate-200 rounded-lg shadow-lg p-6 relative">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div class="bg-white rounded-lg p-14 flex flex-col items-center shadow-lg w-full">
            <div class="bg-gray-300 h-10 w-10 rounded-full mb-4 animate-pulse"></div>
            <div class="h-6 w-1/2 bg-gray-300 rounded mb-2 animate-pulse"></div>
            <div class="h-6 w-1/3 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div class="bg-white rounded-lg p-14 flex flex-col items-center shadow-lg w-full">
            <div class="bg-gray-300 h-10 w-10 rounded-full mb-4 animate-pulse"></div>
            <div class="h-6 w-1/2 bg-gray-300 rounded mb-2 animate-pulse"></div>
            <div class="h-6 w-1/3 bg-gray-300 rounded animate-pulse"></div>
            <div class="relative w-full bg-gray-200 h-4 rounded-full overflow-hidden mt-4">
              <div class="absolute top-0 left-0 h-full bg-gray-300 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="h-6 bg-gray-300 w-1/2 rounded animate-pulse"></div>
        <div class="h-20 bg-gray-300 w-full rounded mt-4 animate-pulse"></div>
      </div>
      <div class="flex justify-between">
        <div class="h-10 w-28 bg-gray-300 rounded animate-pulse"></div>
        <!-- <div class="h-10 w-28 bg-gray-300 rounded animate-pulse"></div> -->
      </div>
    </div>
  </div>
  </template>
  <template v-else>
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
      <div class="mt-6 space-y-10">
        <!-- mistrar fecha y hora de sustentacion final -->
        <div v-if="obtener" class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <!-- fecha de susnteacion -->
            <div class="bg-white border rounded-lg p-6 flex flex-col items-center shadow-lg w-full border-gray-300">
              <i class="fas fa-calendar-alt text-[#39B49E] text-3xl mb-4"></i>
              <p class="text-lg font-semibold text-azul mb-2">Fecha y hora final de sustentacion</p>
              <p class="text-gray-700 text-lg font-medium">{{ obtener?.sus_fecha || 'Fecha no asignada' }}</p>
            </div>
            <!-- nota de sustneacion -->
            <div class="bg-white border rounded-lg p-6 flex flex-col items-center shadow-lg w-full border-gray-300">
              <i class="fas fa-star text-[#39B49E] text-3xl mb-4"></i>
              <p class="text-lg font-semibold text-azul mb-2">Nota de sustentación</p>
              <p class="text-gray-700 text-lg font-medium">{{ obtener?.sus_nota || 'Nota no asignada' }}</p>
              <!-- barra de la ntoa -->
              <div class="relative w-full bg-gray-200 h-4 rounded-full overflow-hidden mt-4 progress-bar">
                <div
                  class="absolute top-0 left-0 h-full transition-all duration-500"
                  :class="obtener?.nota_estado === 'APROBADO' ? 'bg-green-500' : 'bg-red-500'"
                  :style="{ width: `${(Number(obtener?.sus_nota) / 20) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- docuemnto de informe de conformidad de observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <EstadoBolita :estado="estadoBolitaActaSustentacion" />
              <h2 class="text-xl font-medium text-black">1. Acta de sustentación de tesis</h2>
              <ModalToolTip :infoModal="[{ info: 'Por favor espere que se carguen los documentos que verifiquen la sustentación' },]" />
            </div>            
          </div>
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo="ACTA DE SUSTENTACIÓN DE TESIS PARA OPTAR EL TÍTULO PROFESIONAL"
              :estado="obtener?.sus_estado || ''"
              :id="obtener?.sus_id ?? ''"
              :view="VIEW_SUS"
              :download="DOWNLOAD_SUS"/>
          </div>
        </div>

        <!--Botones siguiente y anteerior-->
        <div class="flex justify-between">
          <button 
            @click="$router.push('/estudiante/designacion-fecha-hora')"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
          </button>
          <!-- <button
            @click="handleNextButtonClick"
            :class="[ 'px-4 py-2 text-white rounded-md', isNextButtonDisabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600',]">Siguiente
          </button> -->
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