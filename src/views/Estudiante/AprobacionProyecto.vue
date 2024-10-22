<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";
import Swal from 'sweetalert2';
import router from '@/router';

// Estado de carga
const load = ref(false);

// ***** Texto que se escribe automáticamente ********
const text = "Aprobación del proyecto de tesis";
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

// Definir tipos para trámites y documentos
interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

const mostrarModalAprobar = ref(false); 

// Estado del trámite de aprobación
const tramiteAprobacion = ref({ titulo: 'Solicitar Aprobación' });

// Documentos para la aprobación del proyecto

// Variables de entorno para los enlaces de los documentos
const VIEW_APAISI = import.meta.env.VITE_URL_VIEW_APAISI;
const DOWNLOAD_APAISI = import.meta.env.VITE_URL_DOWNLOAD_APSISI;

// Método para determinar la clase del estado
// const estadoClase = (estado: string) => {
//   switch (estado) {
//     case 'Hecho':
//       return 'bg-green-500 text-white';
//     case 'pendiente':
//       return 'bg-gray-400 text-white';
//     default:
//       return '';
//   }
// };

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
  return documentos.value.some(doc => doc.estado !== "Tramitado");
});

///////////////////////////// CONEXION CON EL BACKEND //////////////////////////
const authStore = useAuthStore();
const solicitudEstado = ref<string>(""); 
const isLoading = ref(false); 
const VIEW_APROBACION = import.meta.env.VITE_URL_VIEW_APROBACION;
const DOWNLOAD_APROBACION = import.meta.env.VITE_URL_DOWNLOAD_APROBACION;
const oficio_id = ref<string>("");
const documentos = ref([{ nombre: 'Oficio de Secretaria PAISI', estado:'Pendiente' }]);


// para que el botón quede deshabilitado
const isAprobacionDisabled = computed(() => {
  const estadoSolicitud = solicitudEstado.value?.toLowerCase();
  return ["pendiente", "tramitado"].includes(estadoSolicitud);// se deshabilita el botón dependiendo del estado
});

const solicitarAprobacion = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar-tesis/${authStore.id}`);
    console.log("Mostrando lo recibido: ",response);

    if (response.data.estado){
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada correctamente, espere las indicaciones", "Éxito", "success");
    }

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      const mensaje = error.response.data.mensaje;

      if (mensaje.includes("El estudiante no existe")) {
        alertToast("El estudiante no existe en el sistema. Verifique los datos.", "Error", "error");
      } else if (mensaje.includes("El estudiante aún no tiene la conformidad de sus jurados")) {
        alertToast("Estimado estudiante, no tiene conformidad de jurados", "", "warning");
      } else if (mensaje.includes("El estudiante ya tiene una solicitud de aprobación de tesis pendiente")) {
        alertToast("Estimado estudiante, ya solicito su aprobación de tesis", "", "info");
      } else {
        alertToast("Error desconocido en la solicitud", "Error", "error");
      }
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

const obtenerDatosEstudiante = async () => {
  load.value = true;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar-tesis/${authStore.id}`);  // Cambia la URL si es necesario

    // Verificamos el resultado de la solicitud
    if (response.data.status) {
      solicitudEstado.value = "Hecho";  // Si todo va bien, el estado se cambia a "Hecho"
      alertToast("Aprobación de Tesis creada correctamente", "Éxito", "success");
    } else {
      solicitudEstado.value = "pendiente";  // Si falla algo, sigue en pendiente
    }
  } catch (error) {
    console.error("Error en la solicitud de aprobación:", error);
    alertToast(error.response?.data?.message || "Error al enviar la solicitud", "Error", "error");
    solicitudEstado.value = "No Iniciado";  // Volvemos al estado inicial si falla
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
      <!-- Mostrar una pantalla de carga -->
    </div>
  </template>

  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
        <div class="mt-6 space-y-10">
          <!-- Card 1: Solicitud-->
          <div class="bg-white rounded-lg shadow-lg p-6 relative mb-20">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <h2 class="text-2xl font-medium text-black">1. Solicitar aprobación</h2>
                  <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                    @mouseover="mostrarModalAprobar = true"
                    @mouseleave="mostrarModalAprobar = false" />
              </div>
              <span :class="['estado-estilo', `estado-${solicitudEstado.toLowerCase().replace(' ', '-')}`]" class="ml-4">{{ solicitudEstado }}</span>
            </div>
            <div v-show="mostrarModalAprobar" class="absolute left-40 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
              <p class="text-sm text-gray-600">Se enviará tu solicitud al Programa Académico y a la Facultad.</p>
            </div>

            <div class="flex items-center justify-between mt-2">
              <p class="text-gray-500 text-lg">Haz clic en el botón para enviar tu solicitud de aprobación del proyecto de tesis a la Facultad y al Programa Académico.</p>
            </div>
            <div class="mt-4">
              <div class="flex justify-center mt-2">
                <button 
                  :disabled="isAprobacionDisabled" 
                  :class="[ isAprobacionDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                  class="px-4 py-2 text-white rounded-md"
                  @click="solicitarAprobacion">
                  {{ isLoading ?'Solicitando...' : 'SOLICITAR APROBACIÓN' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Card 2: Documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">2. Documentos para la aprobacion del proyecto de tesis</h2>
            </div>
            <div class="mt-4 space-y-4">
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div class="flex flex-col md:flex-row justify-between md:items-center">
                  <span class="flex-1 text-lg">{{ documentos[0].nombre }}</span>
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                    <div v-if="documentos[0].estado === 'Tramitado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                      <!-- BOTON VER -->
                      <a
                        :href="`${VIEW_APROBACION}/${oficio_id}`"
                        target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <!-- BOTON DESCARGAR -->
                      <a
                        :href="`${DOWNLOAD_APROBACION}/${oficio_id}`"
                        download
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar
                      </a>
                    </div>
                    <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                    <span :class="`estado-estilo estado-${documentos[0].estado.toLowerCase().replace(' ', '-')}`">{{ documentos[0].estado || "Estado desconocido" }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 space-y-4">
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div class="flex flex-col md:flex-row justify-between md:items-center">
                  <span class="flex-1 text-lg">{{ documentos[0].nombre }}</span>
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                    <div v-if="documentos[0].estado === 'Tramitado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                      <!-- BOTON VER -->
                      <a
                        :href="`${VIEW_APROBACION}/${oficio_id}`"
                        target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <!-- BOTON DESCARGAR -->
                      <a
                        :href="`${DOWNLOAD_APROBACION}/${oficio_id}`"
                        download
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar
                      </a>
                    </div>
                    <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                    <span :class="`estado-estilo estado-${documentos[0].estado.toLowerCase().replace(' ', '-')}`">{{ documentos[0].estado || "Estado desconocido" }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <!-- BOTONES ANTERIOR Y SIGUIENTE -->
          <div class="flex justify-between">
            <button 
              @click="$router.push('/estudiante/designacion-jurado')" 
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
.break-all {
  word-break: break-all;
}
</style>
