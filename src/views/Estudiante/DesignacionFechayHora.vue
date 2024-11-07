<script lang="ts" setup>
import { alertToast } from '@/functions';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from '@/components/modalToolTip.vue';

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
  const documentoResolucion = documentos.value.find(
    (doc) => doc.nombre === "Resolución de Declaración de Apto para Sustentación"
  );
  return documentoResolucion?.estado.toLowerCase() !== "tramitado";
});


//************************************* INTEGRACION EL BACKEND PARA VER Y SOLICITAR JURADOS ********************************************* */
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const isLoading = ref(false);
const load = ref(false);
// Estados para accesitario, fecha y hora
const accesitario = ref<string>("");  // Nombre del accesitario
const fechaSustentacion = ref<string>("");  // Fecha de la sustentación
const horaSustentacion = ref<string>(""); 

const VIEW_OSINFORME  = import.meta.env.VITE_URL_VIEW_OSINFORME ;
const DOWNLOAD_OSINFORME  = import.meta.env.VITE_URL_DOWNLOAD_OSINFORME ;

const VIEW_RSNFORME = import.meta.env.VITE_URL_VIEW_RSNFORME;
const DOWNLOAD_RSNFORME = import.meta.env.VITE_URL_DOWNLOAD_RSNFORME;

const oficio_id = ref<string>("");
const resolucion_id = ref<string>("");

const documentos = ref([
  { nombre: 'Oficio del Programa Académico de Ingeniería de Sistemas.', estado: 'Pendiente', observacion: '' },
  { nombre: 'Resolución de Declaración de Apto para Sustentación', estado: 'Pendiente', observacion: '' }
]);

// para que el botón quede deshabilitado
const isSolicitarDisabled = computed(() => {
  return isLoading.value || documentos.value.some(doc => doc.estado.toLowerCase() === 'tramitado');
});

// funcion para solicitar que me asignen jurados
const solicitarSustentacionFechayHora= async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/desigancion-fecha-hora-sustentacion/${student_id}`);
  
    if (response.data.estado) {
      solicitudEstado.value = "pendiente";  // mostrar el estado de la solicitud
      alertToast("Solicitud enviada, al Programa Académico de Ingeniería de Sistemas e Informática", "Éxito", "success");
      // await obtenerDocumentosSustentancion();
    }
    
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      const mensaje = error.response.data.message;
      alertToast(mensaje, "Error", "error");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

// Función para obtener datos de sustentación (accesitario, fecha y hora)
const obtenerDatosSustentacion = async () => {
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/datos-sustentacion/${student_id}`);
    if (response.data) {
      accesitario.value = response.data.accesitario || "No asignado";
      fechaSustentacion.value = response.data.fecha || "Fecha no asignada";
      horaSustentacion.value = response.data.hora || "Hora no asignada";
    }
  } catch (error: any) {
    console.error("Error al obtener datos de sustentación:", error.response?.data?.message || error.message);
  }
};

// Llama a `obtenerDatosSustentacion` al montar el componente
onMounted(() => {
  obtenerDatosSustentacion();
  // También puedes llamar a otras funciones de carga aquí, como obtenerDocumentosSustentancion
});

</script>
<template>
   <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-2/3 rounded-lg duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
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
        <!-- Card 2: Solicitar designación de Jurados -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Solicitar oficio para fecha y hora</h2>
            <ModalToolTip 
              :infoModal="[{ info: 'Falta definir la información' },]" />               
          </div>

          <div class="flex items-center justify-between mt-2">
            <p class="text-gray-500 text-base">Haz clic en el botón para solicitar el oficio con la fecha y hora asignadas para la sustentación.</p>
          </div>
          
          <div class="mt-4">
            <div class="flex justify-center mt-2">
              <button
                :disabled="isSolicitarDisabled" 
                :class="[ isSolicitarDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                class="px-4 py-2 w-52 text-white rounded-md text-lg"
                @click="solicitarSustentacionFechayHora">
                {{ isLoading ? 'Solicitando...' : 'Solicitar' }}
              </button>
            </div>
          </div>
        </div>

       <!-- Nueva Sección: Detalles de Accesitario, Fecha y Hora -->
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 relative mb-8">
          <!-- Tarjeta de Accesitario -->
          <div class="bg-gray-50 rounded-md shadow-lg p-4 mb-4 flex flex-col items-center justify-center text-center">
            <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
            <span class="text-2xl font-semibold text-azul">Jurado Accesitario</span>
            <span class="text-gray-600 text-center">{{ accesitario || 'No asignado' }}</span>
          </div>

          <!-- Tarjetas de Fecha y Hora en Paralelo -->
          <div class="flex flex-col md:flex-row gap-4 mt-4">
            <!-- Tarjeta de Fecha de Sustentación -->
            <div class="flex-1 bg-gray-50 rounded-md shadow-lg p-4 text-center">
              <span class="block text-lg font-semibold text-[#1d3557]">Fecha de Sustentación</span>
              <span class="text-gray-600 text-center">{{ fechaSustentacion || 'Fecha no asignada' }}</span>
            </div>

            <!-- Tarjeta de Hora de Sustentación -->
            <div class="flex-1 bg-gray-50 rounded-md shadow-lg p-4 text-center">
              <span class="block text-lg font-semibold text-[#1d3557]">Hora de Sustentación</span>
              <span class="text-gray-600 text-center">{{ horaSustentacion || 'Hora no asignada' }}</span>
            </div>
          </div>
        </div>



        <!-- Card 2: Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative mb-20">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">2. Documentos de fecha y hora</h2>
              <ModalToolTip 
                :infoModal="[{ info: 'Falta definir la información' },]" /> 
            </div>
            <!-- Para Oficio de PAISI -->
            <div class="mt-4 space-y-4">
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div class="flex flex-col md:flex-row justify-between md:items-center">
                  <span class="flex-1 text-xm bg-gray-50">{{ documentos[0].nombre }}</span>
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                    <!-- Condición para cuando el estado es "tramitado" -->
                    <div v-if="documentos[0].estado === 'tramitado' && oficio_id" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                      <a
                        :href="`${VIEW_OSINFORME }/${oficio_id}`"
                        target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <a
                        :href="`${DOWNLOAD_OSINFORME }/${oficio_id}`"
                        download
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar
                      </a>
                    </div>

                    <!-- Condición para mostrar la observación cuando el estado es "observado" -->
                    <p v-else-if="documentos[0].estado === 'observado'" class="text-gray-500 italic">
                      "{{ documentos[0].observacion || 'Observación no disponible' }}"
                    </p>

                    <!-- Mensaje de que aún no está cargado para estado "pendiente" -->
                    <span v-else class="text-gray-500 italic">El documento aún no se ha cargado</span>

                    <!-- Estado del documento -->
                    <span :class="`estado-estilo estado-${documentos[0].estado.toLowerCase().replace(' ', '-')}`">
                      {{ documentos[0].estado.charAt(0).toUpperCase() + documentos[0].estado.slice(1).toLowerCase() || "Estado desconocido" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Para Resolución de Facultad -->
            <div class="mt-4 space-y-4">
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div class="flex flex-col md:flex-row justify-between md:items-center">
                  <span class="flex-1 text-xm bg-gray-50">{{ documentos[1].nombre }}</span>
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                    <div v-if="documentos[1].estado === 'tramitado' && resolucion_id" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                      <!-- BOTON VER -->
                      <a
                        :href="`${VIEW_RSNFORME}/${resolucion_id}`"
                        target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <!-- BOTON DESCARGAR -->
                      <a
                        :href="`${DOWNLOAD_RSNFORME}/${resolucion_id}`"
                        download
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar
                      </a>
                    </div>

                      <!-- Condición para mostrar la observación cuando el estado es "observado" -->
                      <p v-else-if="documentos[1].estado === 'observado'" class="text-gray-500 italic">
                        "{{ documentos[1].observacion || 'Observación no disponible' }}"
                      </p>

                    <span v-else class="text-gray-500 italic text-base">El documento aún no se ha cargado</span>
                    <span :class="`estado-estilo estado-${documentos[1].estado.toLowerCase().replace(' ', '-')}`">{{ documentos[1].estado.charAt(0).toUpperCase() + documentos[1].estado.slice(1).toLowerCase() || "Estado desconocido" }}</span>
                  </div>
                </div>
              </div>
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
            :class="[ 
              'px-4 py-2 text-white rounded-md',
              isNextButtonDisabled
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
.estado-tramitado {
  background-color: #38a169;
  color: #ffffff;
}
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
</style>