<script lang="ts" setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { alertToast } from '@/functions';
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import DocumentCard from '@/components/DocumentCard.vue';

// ***** Texto que se escribe automáticamente ********
const text = "Sustentación";
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
// ******************************************************

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
    
  </template>
  <template v-else>
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-screen">
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
      
      <div class="mt-6 space-y-10">
        <!-- mistrar fecha y hora de sustentacion final -->
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 relative">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <!-- fecha de susnteacion -->
            <div class="bg-white rounded-lg p-14 flex flex-col items-center shadow-lg w-full">
              <i class="fas fa-calendar-alt text-blue-500 text-3xl mb-4"></i>
              <p class="text-lg font-semibold text-azul mb-2">Fecha de Sustentación</p>
              <p class="text-gray-600 text-lg">{{ obtener?.sus_fecha || 'Fecha no asignada' }}</p>
            </div>

            <!-- nota de sustneacion -->
            <div class="bg-white rounded-lg p-14 flex flex-col items-center shadow-lg w-full">
              <i class="fas fa-star text-yellow-500 text-3xl mb-4"></i>
              <p class="text-lg font-semibold text-azul mb-2">Nota de Sustentación</p>
              <p class="text-gray-600 text-lg">{{ obtener?.sus_nota || 'Nota no asignada' }}/20</p>
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
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">1. Acta de sustentación de tesis</h2>
              <ModalToolTip :infoModal="[{ info: 'Falta información' },]" />
            </div>            
          </div>
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo="Carta de Conformidad de Sustentación"
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