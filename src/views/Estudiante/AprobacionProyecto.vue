<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";
import Swal from 'sweetalert2';
import router from '@/router';

// ***** Texto que se escribe automáticamente ********
const text = "Aprobación del Proyecto de Tesis";
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

const mostrarModalAprobar = ref(false); 

// Estado del trámite de aprobación
const tramiteAprobacion = ref({ titulo: 'Solicitar Aprobación' });

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
  return documentos.value.some(doc => doc.estado !== "tramitado");
});

/*************************************** INTEGRACION CON EL BACKEND ************************************************ */
const load = ref(false);
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false); 
const VIEW_APROBACIONPAISI = import.meta.env.VITE_URL_VIEW_APAISI;
const DOWNLOAD_APROBACIONPAISI = import.meta.env.VITE_URL_DOWNLOAD_APAISI;

const VIEW_APROBACIONFACULTAD = import.meta.env.VITE_URL_VIEW_AFACULTAD;
const DOWNLOAD_APROBACIONFACULTAD = import.meta.env.VITE_URL_DOWNLOAD_AFACULTAD;

const oficio_id = ref<string>("");
const resolucion_id = ref<string>("");

const documentos = ref([
  { nombre: 'Oficio del Programa Académico de Ingeniería de Sistemas.', estado: 'Pendiente', observacion: '' }, 
  { nombre: 'Resolución de Facultad de Ingeniería de Sistemas.', estado: 'Pendiente', observacion: '' }
]);


const isAprobacionDisabled = computed(() => {
  return isLoading.value || documentos.value.some(doc => doc.estado === 'pendiente' || doc.estado === 'tramitado');
});


const solicitarAprobacion = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar-tesis/${student_id}`);
    console.log("Mostrando lo recibido: ",response);

    if (response.data.estado){
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada correctamente, espere las indicaciones", "Éxito", "success");
      await obtenerDatosEstudiante();
    }

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      const mensaje = error.response.data.mensaje;
      alertToast(mensaje, "Error", "error");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`/api/estudiante/get-info-aprobar-tesis/${student_id}`);
    console.log("Datos recibidos: ", response.data);

    // Actualizar el estado y observación de oficio
    if (response.data.oficio_estado === 'tramitado') {
      oficio_id.value = response.data.oficio_id;
      documentos.value[0].estado = 'tramitado';
    } else if (response.data.oficio_estado === 'observado') {
      documentos.value[0].estado = 'observado';
      documentos.value[0].observacion = response.data.oficio_observacion || 'comunicate con secretaria de PAISI';
    } else {
      documentos.value[0].estado = 'pendiente';
    }

    // Actualizar el estado y observación de resolución
    if (response.data.resolucion_estado === 'tramitado') {
      resolucion_id.value = response.data.resolucion_id;
      documentos.value[1].estado = 'tramitado';
    } else if (response.data.resolucion_estado === 'observado') {
      documentos.value[1].estado = 'observado';
      documentos.value[1].observacion = response.data.resolucion_observacion || 'cominicate con secretaria de Facultad';
    } else {
      documentos.value[1].estado = 'pendiente';
    }

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data?.mensaje || error.mensaje);
  } finally {
    load.value = false;
  }
};


onMounted(() =>{
  obtenerDatosEstudiante();
})

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
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
        <div class="mt-6 space-y-10">
          <!-- Card 1: Solicitud-->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="relative flex items-center">
              <h2 class="text-2xl font-medium text-black">1. Solicitar aprobación</h2>
                <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                  @mouseover="mostrarModalAprobar = true"
                  @mouseleave="mostrarModalAprobar = false" />
            </div>
            <div v-show="mostrarModalAprobar" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
              <p class="text-sm text-gray-600">Se enviará tu solicitud al Programa Académico y a la Facultad.</p>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-gray-500 mt-2 mb-1 text-base">Haz clic en el botón  
                <strong class="text-green-500 text-lg font-medium">"Solicitar aprobación"</strong> para enviar tu solicitud a la Facultad y al Programa Académico.
              </p>
            </div>
            
            <div class="mt-4">
              <div class="flex justify-center mt-2">
                <button 
                  :disabled="isAprobacionDisabled" 
                  :class="[ isAprobacionDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                  class="px-4 py-2 w-56 text-white rounded-md text-lg"
                  @click="solicitarAprobacion">
                  {{ isLoading ?'Solicitando...' : 'Solicitar aprobación' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Card 2: Documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative mb-20">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">2. Documentos que verifican la aprobacion del proyecto de tesis </h2>
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
                        :href="`${VIEW_APROBACIONPAISI}/${oficio_id}`"
                        target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <a
                        :href="`${DOWNLOAD_APROBACIONPAISI}/${oficio_id}`"
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
                        :href="`${VIEW_APROBACIONFACULTAD}/${resolucion_id}`"
                        target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <!-- BOTON DESCARGAR -->
                      <a
                        :href="`${DOWNLOAD_APROBACIONFACULTAD}/${resolucion_id}`"
                        download
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar
                      </a>
                    </div>
                    <span v-else class="text-gray-500 italic text-base">El documento aún no se ha cargado</span>
                    <span :class="`estado-estilo estado-${documentos[1].estado.toLowerCase().replace(' ', '-')}`">{{ documentos[1].estado.charAt(0).toUpperCase() + documentos[1].estado.slice(1).toLowerCase() || "Estado desconocido" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- BOTONES ANTERIOR Y SIGUIENTE -->
          <div class="flex justify-between">
            <button 
              @click="$router.push('/estudiante/conformidad-jurado')" 
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
              Anterior
            </button>
            <button
              @click="handleNextButtonClick"
              :class="['px-4 py-2 text-white rounded-md', isNextButtonDisabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600',]">
              Siguiente
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
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-tramitado {
  background-color: #38a169;
  color: #ffffff;
}
.estado-no-solicitado {
  background-color: #718096;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
.break-all {
  word-break: break-all;
}
</style>