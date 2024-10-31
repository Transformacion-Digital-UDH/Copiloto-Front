<script lang="ts" setup>
import { alertToast } from '@/functions';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import router from "@/router";
import Swal from "sweetalert2";

// ***** Texto que se escribe automáticamente (efecto de máquina de escribir) ********
const text = "Designación de Jurados";
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
const mostrarModalTramite = ref(false);
const mostrarModalJurados = ref(false); 
const mostrarModalDocumentos = ref(false);
const mostrarModalCambioJurado = ref(false);

// Función para solicitar cambio de jurado
const solicitarCambioJurado = (jurado: any) => {
  alert(`Has solicitado el cambio del jurado: ${jurado.nombre}`);
  // Aquí puedes agregar la lógica adicional para solicitar el cambio del jurado
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
  router.push("/estudiante/conformidad-jurado");
};

const isNextButtonDisabled = computed(() => {
  const documentoPaso3 = documentos.value.find(
  (doc) => doc.nombre === "Oficio múltiple"
);
  return documentoPaso3?.estado !== "Tramitado";
});


//************************************* INTEGRACION EL BACKEND PARA VER Y SOLICITAR JURADOS ********************************************* */
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const solicitudEstado2 = ref<string>("");
const isLoading = ref(false);
const load = ref(false);
const jurados = ref<Jurado[]>([]);
const documentos = ref([{ nombre: 'Oficio múltiple', estado: 'Pendiente' }]);
const VIEW_OFFICEJURADO = import.meta.env.VITE_URL_VIEW_OFFICEJURADO;
const DOWNLOAD_OFFICEJURADO = import.meta.env.VITE_URL_DOWNLOAD_OFFICEJURADO;
const docof_id = ref<string>("");

interface Jurado {
  id: string;
  rol: string;
  asesor: string;
}

// para que el botón quede deshabilitado
const isSolicitarDisabled = computed(() => {
  const estadoSolicitud = solicitudEstado.value?.toLowerCase();
  const estadoSolicitud2 = solicitudEstado2.value?.toLowerCase();
  return ["pendiente", "tramitado"].includes(estadoSolicitud) || ["pendiente", "tramitado"].includes(estadoSolicitud2);// se deshabilita el botón dependiendo del estado
});
// funcion para solicitar que me asignen jurados
const solicitarJurado = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/api/office/solicitude-juries/${authStore.id}`);
    console.log(response);
  
    if (response.data.estado) {
      solicitudEstado.value = "pendiente";  // mostrar el estado de la solicitud
      alertToast("Solicitud enviada, al Programa Académico de Ingeniería de Sistemas e Informática", "Éxito", "success");
    }
    
  } catch (error: any) {
    console.error(error);
    
    if (error.response?.status === 404) {
      const message = error.response?.data?.message;
      if (message.includes("conformidad")) {
        alertToast("Estimado estudiante, no tiene conformidad de observaciones", ""); // esto es un mnsaje de falta de conformidad
      } else if (message.includes("solicitud en proceso")) {
        alertToast("Estimado estudiante, ya solicito su designacion de jurados", "success"); // esto es un mensaje de que solicito su designacion
      } else {
        alertToast("Error desconocido en la solicitud.", "Error", "error");
      }
    } else {
      alertToast("Error en la solicitud.", "Error", "error"); // para otros errores
    }
  } finally {
    isLoading.value = false;
  }
};
// funcion para ver los jurados asignados
const mostrarJurados = async () => {
  load.value = true;
  try {
    const response = await axios.get(`api/student/get-juries/${authStore.id}`)
    console.log('Mostrando lo recibido: ', response.data);
    if(response.data.estado){
      solicitudEstado2.value = response.data.estado.charAt(0).toUpperCase() + response.data.estado.slice(1).toLowerCase();// para formatear el estado con la primera letra en mayuscula
      console.log("Estado de la solicitud: ", solicitudEstado2.value);
    }
    
    jurados.value = response.data.jurados// la lista de jurados asignados

    if(response.data.docof_id){
      docof_id.value = response.data.docof_id;
      documentos.value[0].estado = 'Tramitado';
    }
  } catch (error) {
    console.error('Error al obtener jurados designados: ', error);
  } finally {
    load.value = false;
  }
};
// montar para ver los jurados asignados
onMounted(() => {
  mostrarJurados();
})
</script>
<template>
   <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-2/3 rounded-lg duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-48 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-7 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-28 w-2/4 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-7 w-48 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="flex justify-between">
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
        </div>
        <!-- <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-7 w-72 rounded-md skeleton-loader duration-200 mb-14"></h2>
            <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>            
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-7 w-2/6 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-40 w-full mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div> -->
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl -mb-2 font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
      <div class="mt-6 space-y-10">
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

        <!-- Card 2: Solicitar designación de Jurados -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
          <h2 class="text-2xl font-medium text-black ">1. Solicitar designación de jurados</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
            @mouseover="mostrarModalJurados = true"
            @mouseleave="mostrarModalJurados = false" />
          </div>

          <div v-show="mostrarModalJurados" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Tus jurados serán seleccionados por el coordinador y se mostrarán en la brevedad en el sistema.</p>
          </div>

          <div class="flex items-center justify-between mt-2">
            <p class="text-gray-500 text-base">Haz clic en el botón para solicitar la designación de jurados.</p>
            <span :class="['estado-estilo', `estado-${solicitudEstado.toLowerCase()}`]" class="ml-4">{{ solicitudEstado }}</span>
          </div>

          <div class="mt-4">
            <div class="flex justify-center mt-2">
              <button
                :disabled="isSolicitarDisabled" 
                :class="[ isSolicitarDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                class="px-4 py-2 w-52 text-white rounded-md text-lg"
                @click="solicitarJurado">
                {{ isLoading ?'Solicitando...' : 'Solicitar jurados' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Jurados seleccionados -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mt-2">
            <h2 class="text-2xl font-medium text-black">2. Tus jurados designados son:</h2>
            <span :class="['estado-estilo', `estado-${solicitudEstado2.toLowerCase()}`]" class="ml-4">{{ solicitudEstado2 }}</span>
          </div>

          <div class="overflow-x-auto mt-4 flex justify-center">
            <div class="w-full max-w-2xl">
              <table class="w-full text-left bg-white border border-gray-200 rounded-md shadow-lg">
                <thead class="leading-normal">
                  <tr class="text-azul text-left border-b-2 bg-gray-300">
                    <th class="px-4 py-2 tracking-wide">ROL</th>
                    <th class="px-4 py-2 tracking-wide">NOMBRE Y APELLIDO</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Si no hay jurados, mostramos un mensaje -->
                  <tr v-if="jurados.length === 0">
                    <td colspan="2" class="px-4 py-6 text-center text-gray-500 text-base">
                      <i class="fas fa-exclamation-circle mr-2 text-red-700"></i> Aún no se han asignado jurados.
                    </td>
                  </tr>
                  <!-- Iteramos los jurados si hay registros -->
                  <tr v-else v-for="jurado in jurados" :key="jurado.id" class="border-b uppercase border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                    <td class="px-4 py-2">
                      <p class="text-wrap w-24">{{jurado.rol || "No asignado" }}</p>
                    </td>
                    <td class="px-4 py-2">
                      <p class="text-wrap w-72">{{jurado.asesor || "No asignado" }}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Card 3: Oficio múltiple con los jurados seleccionados -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">4. Documentos para la conformidad de designacion de jurados</h2>
              <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
                  @mouseover="mostrarModalDocumentos = true"
                  @mouseleave="mostrarModalDocumentos = false" />
            </div>            
          </div>

          <div v-show="mostrarModalDocumentos" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Este es el documento oficial con los jurados designados. Asegúrate de revisarlo antes de continuar.</p>
          </div>

          <div class="mt-4 space-y-4">
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <span class="flex-1 text-xm bg-gray-50">{{ documentos[0].nombre }}</span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <div v-if="documentos[0].estado === 'Tramitado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    <!-- Botón de Ver -->
                    <a 
                      :href="`${VIEW_OFFICEJURADO}/${docof_id}`" 
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    <!-- Botón de Descargar -->
                    <a 
                      :href="`${DOWNLOAD_OFFICEJURADO}/${docof_id}`" 
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>
                  <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                  <span :class="`estado-${documentos[0].estado.toLowerCase()}`" class="estado-estilo">{{ documentos[0].estado }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

       <!--Botones siguiente y anteerior-->
       <div class="flex justify-between">
          <button
            @click="$router.push('/estudiante/conformidad-asesor')" 
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
  font-weight: 400;
  border-radius: 0.375rem;
}

.estado-hecho {
  background-color: #38a169;
  color: #ffffff;
}

.estado-tramitado {
  background-color: #38a169;
  color: #ffffff;
}

.estado-en-proceso {
  background-color: #ed8936;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.estado-no-solicitado {
  background-color: #718096;
  color: #ffffff;
}
.text-center {
  text-align: center;
  padding: 1rem;
}
</style>