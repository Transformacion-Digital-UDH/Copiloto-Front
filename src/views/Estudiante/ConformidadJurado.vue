<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { alertToast } from "@/functions";
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from "@/components/modalToolTip.vue";
import JuradoCard from "@/components/JuradoCard.vue";
import CorrecionTabla from "@/components/CorrecionTabla.vue";
import DocumentCard from "@/components/DocumentCard.vue";

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad del Proyecto de Investigación por los Jurados";
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
/****************************************************** */

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
  router.push("/estudiante/aprobacion-proyecto");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.estado_general !== 'aprobado';
});

//*********************************** INTEGRACIÓN CON EL BACKEND PARA CONFORMIDAD DE JURADOS PY*************************************************** */
const load = ref(false);
const authStore = useAuthStore();
const loading = ref<{[key: string]: boolean}>({});

const obtener = ref<Estudiante | null>(null);
const jurados = computed(() => obtener.value?.data ?? []);
const estadoRevision = ref<string | null>(null);

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;

// esta funcion es para obtener revisiones por cada rol con el array data[]
const obtenerRol = (rol:string) => {
  return computed(() => obtener.value?.data?.filter(revision => revision.rol.toLowerCase() === rol.toLowerCase()) || []);
};
const presidenteRevisiones = obtenerRol('presidente');
const secretarioRevisiones = obtenerRol('secretario');
const vocalRevisiones = obtenerRol('vocal');

// aqui se obtiene el id de la revision dependiente del rol con el array data[]
const obtenerIdRol = (rol: string) => {
  return computed(() => obtener.value?.data?.find(revision => revision.rol.toLowerCase() === rol.toLowerCase())?.revision_id || '');
};
const presidente_id = obtenerIdRol('presidente');
const secretario_id = obtenerIdRol('secretario');
const vocal_id = obtenerIdRol('vocal');

//para mostrar el estado del docuemtno de cada jurado
const obtenerEstadoDocumento = (estadoRevision: string | undefined): string => {
  if(!estadoRevision) return '';
  return estadoRevision === 'aprobado' ? 'aprobado' : 'pendiente';
}

// para bloquear el boton de las revisiones dependiedno del estado
const isRevisionDisabled = (estado: string | undefined) => {
  return ['pendiente', 'aprobado'].includes(estado?.toLowerCase() || '')
}

interface Estudiante {
  estudiante_id: string;
  titulo: string;
  link: string;
  oficio_id: string;
  oficio_estado: string;
  estado_general: string;
  data: Revision[] | null;
}

interface Revision {
  revision_id: string;
  nombre: string;
  rol: string;
  numero_revision: number;
  fecha: string | null;
  estado: string;
}

const obtenerConformidadJuradosProyecto = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/review/get-review-jury/${student_id}`);
    //console.log('Mostrando lo recibido:',response.data);
    obtener.value = response.data;
    
  } catch(error) {
    console.error('Error al obtener datos:', error);
  } finally {
    load.value = false;
  }
};

const solicitarRevisionProyecto = async (review_id: string, status: string, num_of?: string) => {
  loading.value[review_id] = true;
  try {
    const response = await axios.put(`api/review/${review_id}/status`, {
      rev_status: status,
      rev_num_of: num_of,
    })

    estadoRevision.value = response.data.estado;
    alertToast('Revisión solicitada. Espere la respuesta de tus jurados.', 'Éxito', 'success')
    await obtenerConformidadJuradosProyecto();

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      const mensaje = error.response.data.message;
      alertToast(mensaje, "Advertencia", "warning");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    loading.value[review_id] = false; 
  }
};

onMounted(() => {
  obtenerConformidadJuradosProyecto();
})

</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 bg-gray-100 min-h-full">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md p-6 space-y-4 animate-pulse duration-200">
          <div class="text-center"><p class="h-4 rounded w-2/3"></p></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-gray-200 rounded-md h-36 p-6 skeleton-loader duration-200"></div>
            <div class="bg-gray-200 rounded-md h-36 p-6 skeleton-loader duration-200"></div>
            <div class="bg-gray-200 rounded-md h-36 p-6 skeleton-loader duration-200"></div>
          </div>
          <div class="bg-gray-200 h-44 rounded-md p-6 -m-0 skeleton-loader duration-200"></div>
          <div class="text-center mt-6">
            <div class="h-10 bg-gray-200 rounded w-44 mx-auto skeleton-loader duration-200"></div>
          </div><p class="h-4 mt-6"></p>
        </div>
        <div class="bg-white rounded-md p-6 relative animate-pulse">
          <div class="flex items-center">
            <div class="h-8 bg-gray-200 rounded w-80 skeleton-loader duration-200"></div>
          </div>
          <div class="overflow-x-auto mt-4">
            <div class="h-6 rounded w-1/3 mb-2"></div>
            <div class="block space-y-5">
              <h2 class="bg-gray-200 h-8 w-2/5 rounded-md skeleton-loader duration-200"></h2>
              <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
            </div>
            <div class="h-6 rounded w-1/3 mb-2"></div>
            <div class="block space-y-5">
              <h2 class="bg-gray-200 h-8 w-2/5 rounded-md skeleton-loader duration-200"></h2>
              <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
            </div>
            <div class="h-6 rounded w-1/3 mb-2"></div>
            <div class="block space-y-5">
              <h2 class="bg-gray-200 h-8 w-2/5 rounded-md skeleton-loader duration-200"></h2>
              <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5 mb-3">
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
        <!-- card para mostrar los jurados y titulo -->
        <div v-if="obtener" class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4 relative">
          <p class="text-gray-600 text-sm text-center">Estos son los jurados asignados y el título de tu proyecto de investigación. Verifica la información y revisa las actualizaciones.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <JuradoCard 
              v-for="jurado in jurados"
              :key="jurado.revision_id"
              :rol="jurado.rol"
              :nombre="jurado.nombre"/>
          </div>
          <div class="bg-blue-50 rounded-lg p-6 shadow-lg">
            <p class="max-full text-xm text-gray-600 uppercase text-center">{{ obtener?.titulo || 'Título no asignado' }}</p>
          </div>
          <!-- Enlace del proyecto de Tesis -->
          <div v-if="obtener?.link" class="text-center mt-6">
            <a
              :href="obtener?.link"
              target="_blank"
              class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <i class="fas fa-external-link-alt"></i> Abrir proyecto
            </a>
          </div>
          <!-- Explicación breve -->
          <p class="text-sm text-gray-600 text-center">Asegúrate de corregir y actualizar tu información en Google Docs antes de hacer clic en "Solicitar revisión".</p>
        </div>

        <!-- Card 2:  Solicitar revisión para las observaciones -->
        <!-- <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Observaciones</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalRevision = true"
              @mouseleave="mostrarModalRevision = false"/>
          </div>

          <div v-show="mostrarModalRevision" class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Este botón permitira empezar el proceso para inciar las correcciones con los jurados</p>
          </div>

          <div class="flex items-center justify-between">
            <p class="text-gray-500 text-lg">Haz clic en <strong class="text-[#39B49E]">solicitar Revision</strong> para iniciar con el proceso de correcciones con los jurados.</p>
            <span :class="['estado-estilo', `estado-${solicitudEstado.toLocaleLowerCase()}`]" class="ml-4">{{ solicitudEstado }}</span>
          </div>

          <div class="mt-4">
            <div class="flex justify-center mt-2">
              <button
                :disabled="isRevisionDisabled" 
                :class="[ isRevisionDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
                class="px-4 py-2 text-white rounded-md"
                @click="solicitarRevision">
                {{ isLoading ?'SOLICITANDO...' : 'SOLICITAR REVISIÓN' }}
              </button>
            </div>
          </div>
        </div> -->

        <!-- Revisión de levantamiento de observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h4 class="text-xl font-medium text-black">1. Revisión de observaciones</h4>
            <ModalToolTip :infoModal="[{ info: 'En esta sección se revisarán y corregirán las observaciones de tu proyecto de investigación con tus jurados, hasta que esté todo conforme.' },]" />
          </div>

          <p class="text-gray-500 mt-1 text-sm">Si el jurado deja observaciones el estado será 
          <strong class="text-gray-400 text-sm font-medium">"Pendiente"</strong>. Corrige las observaciones en Google Docs. Luego de corregir, haz clic en<strong class="text-green-500 text-sm font-medium">“Solicitar revisión”</strong> para una nueva revisión.<br> Cuando los 3 jurados aprueben, el estado cambiará a <strong class="text-green-500 text-sm font-medium">Aprobado</strong>
          </p>
          <!-- Tabla de observaciones Presidente -->
          <div class="overflow-x-auto mt-4">
            <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por el jurado presidente</p>
            <CorrecionTabla
              :revisiones="presidenteRevisiones"
              :loading="loading"
              :isRevisionDisabled="isRevisionDisabled"
              :solicitarRevision="solicitarRevisionProyecto"/>
          </div>
          <!-- Tabla de observaciones Secretario -->
          <div class="overflow-x-auto mt-4">
            <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por el jurado secretario</p>
            <CorrecionTabla 
              :revisiones="secretarioRevisiones"
              :loading="loading"
              :isRevisionDisabled="isRevisionDisabled"
              :solicitarRevision="solicitarRevisionProyecto"/>
          </div>
          <!-- Tabla de observaciones Vocal -->
          <div class="overflow-x-auto mt-4">
            <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por el jurado vocal</p>
            <CorrecionTabla 
              :revisiones="vocalRevisiones"
              :loading="loading"
              :isRevisionDisabled="isRevisionDisabled"
              :solicitarRevision="solicitarRevisionProyecto"/>
          </div>
        </div>

        <!-- documentos de cada jurado -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-xl font-medium text-black">2. Documentos de conformidad del proyecto de investigación por los jurados</h2>
            <ModalToolTip
            :infoModal="[{ info: 'Asegúrate de revisar los documentos de Informe de Conformidad por los Jurados antes de continuar.' },]" />
          </div>

          <!-- INFORME DE CONFORMIDAD POR EL PRESIDENTE -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo='Informe de conformidad - Presidente'
              :estado="obtenerEstadoDocumento(presidenteRevisiones[0]?.estado || '')"
              :id="presidente_id"
              :view="VIEW_CPA"
              :download="DOWNLOAD_CPA"/>
          </div>

          <!-- INFORME DE CONFORMIDAD POR EL SECRETARIO -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo='Informe de conformidad - Secretario'
              :estado="obtenerEstadoDocumento(secretarioRevisiones[0]?.estado || '')"
              :id="secretario_id"
              :view="VIEW_CPA"
              :download="DOWNLOAD_CPA"/>
          </div>

          <!-- INFORME DE CONFORMIDAD POR EL VOCAL -->
          <div class="mt-4 space-y-4">
            <DocumentCard 
              titulo='Informe de conformidad - Secretario'
              :estado="obtenerEstadoDocumento(vocalRevisiones[0]?.estado || '')"
              :id="vocal_id"
              :view="VIEW_CPA"
              :download="DOWNLOAD_CPA"/>
          </div>
        </div>

        <!--Botones siguiente y anteerior-->
        <div class="flex justify-between">
          <button 
            @click="$router.push('/estudiante/designacion-jurado')" 
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