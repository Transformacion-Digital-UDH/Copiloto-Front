<script lang="ts" setup>
import ModalToolTip from '@/components/modalToolTip.vue';
import { alertToast } from '@/functions';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ref, computed, onMounted } from 'vue';
import JuradoCard from '@/components/JuradoCard.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import CorrecionTabla from '@/components/CorrecionTabla.vue';
import { useTypewriter } from '@/composables/useTypewriter';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Conformidad del Informe Final por los Jurados");
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
  router.push("/estudiante/conformidad-vri");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.estado_general !== 'aprobado';
});

//*********************************** INTEGRACIÓN CON EL BACKEND PARA CONFORMIDAD DE IF *************************************************** */
const load = ref(false);
const authStore = useAuthStore();
const loading = ref<{ [key: string]: boolean }>({});

const obtener = ref<Estudiante | null>(null);
const jurados = computed(() => obtener.value?.data ?? []);
const estadoRevision = ref<string | null>(null);

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;

// para obtener las revisiones por rol con el array data[]
const obtenerRol = (rol: string) => {
  return computed(() => obtener.value?.data?.filter(revision => revision.rol.toLowerCase() === rol.toLowerCase()) || []);
};
const presidenteRevisiones = obtenerRol('presidente');
const secretarioRevisiones = obtenerRol('secretario');
const vocalRevisiones = obtenerRol('vocal');

// para obtener el id de las revisiones por rol con el array data[]
const obtenerIdRol = (rol: string) => {
  return computed(() => obtener.value?.data?.find(revision => revision.rol.toLowerCase() === rol.toLowerCase())?.revision_id || '');
};
const presidente_id = obtenerIdRol('presidente');
const secretario_id = obtenerIdRol('secretario');
const vocal_id = obtenerIdRol('vocal');

// para mostrar el estado del docuemtno con condiciones
const obtenerEstadoDocumento = (estadoRevision: string | undefined): string => {
  if (!estadoRevision) return ''; 
  return estadoRevision === 'aprobado' ? 'aprobado' : 'pendiente';
};

// para bloquear el boton de las revisiones
const isRevisionDisabled = (estado: string | undefined) => {
  return ["pendiente", "aprobado"].includes(estado?.toLowerCase() || '');
};

interface Estudiante {
  estudiante_id: string;
  titulo: string;
  link: string;
  oficio_id: string;
  oficio_estado: string;
  resolucion_id: string;
  resolucion_estado: string;
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

const obtenerConformidadJuradosInforme = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/estudiante/get-revision-jurados/informe/${student_id}`);
    // console.log("Mostrando lo recibido: ", response.data);

    obtener.value = response.data;

  } catch (error) {
    console.error('Error al obtener datos', error);
  } finally {
    load.value = false;
  }
};

const solicitarRevisionInforme = async (review_id: string, status: string, num_of?: string) => {
  loading.value[review_id] = true;
  try {
    const response = await axios.put(`/api/review/${review_id}/status`, { 
      rev_status: status,
      rev_num_of: num_of, 
    });

    estadoRevision.value = response.data.estado;
    alertToast('Revisión solicitada. Espere la respuesta de tus jurados.', "Éxito", "success");
    await obtenerConformidadJuradosInforme();

    
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
  obtenerConformidadJuradosInforme();
});

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
    <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
    <div class="space-y-8">
      <!-- card para mostrar jurados y titulo -->
      <div v-if="obtener" class=" text-azul space-y-2 relative">
        <p class="text-gray-600 text-sm text-center">Estos son los jurados asignados y el título de tu informe. Verifica la información y revisa las actualizaciones.</p>
        <!-- para mostrar jurados -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <JuradoCard
            v-for="jurado in jurados"
            :key="jurado.revision_id"
            :rol="jurado.rol"
            :nombre="jurado.nombre"/>
        </div>  
         <!-- enlace del proyecto de Tesis -->
         <div v-if="obtener?.link" class="text-center mt-2">
          <a
            :href="obtener?.link"
            target="_blank"
            class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <i class="fas fa-external-link-alt"></i> Abrir proyecto
          </a>
        </div>      
       
        <!-- Título -->
        <div class="flex justify-center items-center">
              <div class="bg-baseClarito rounded-lg p-4 shadow-md w-full text-center hover:shadow-lg transition-all">
                <i class="fas fa-file-alt text-azul text-4xl mb-2"></i>
                <p class="font-bold text-lg text-azul mb-2">Título de proyecto de investigación</p>
                <p class="text-gray-700 uppercase text-sm font-medium">
                  {{ obtener?.titulo || 'Título no asignado' }}
                </p>
              </div>
            </div>       
      </div>

      <!-- revisiones de cada jurado P,S y V -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center">
          <h4 class="text-xl font-medium text-black">1. Revisión de observaciones</h4>
            <ModalToolTip :infoModal="[{ info: 'En esta sección se revisarán y corregirán las observaciones de tu informe final con tus jurados, hasta que esté todo conforme.' },]" />
        </div>

        <p class="text-gray-500 mt-1 text-sm">Si el jurado deja observaciones el estado será 
          <strong class="text-gray-400 text-sm font-medium">"Pendiente"</strong>. Corrige las observaciones en Google Docs. Luego de corregir, haz clic en<strong class="text-green-500 text-sm font-medium">“Solicitar revisión”</strong> para una nueva revisión.<br> Cuando los 3 jurados aprueben, el estado cambiará a <strong class="text-green-500 text-sm font-medium">Aprobado</strong>
        </p>

        <!-- Tabla del Presidente -->
        <div class="overflow-x-auto mt-4">
          <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por el jurado presidente</p>
          <CorrecionTabla
            :revisiones="presidenteRevisiones"
            :loading="loading"
            :isRevisionDisabled="isRevisionDisabled"
            :solicitarRevision="solicitarRevisionInforme"/>
        </div>
        <!-- Tabla del Secretario -->
        <div class="overflow-x-auto mt-4">
          <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por el jurado secretario</p>
          <CorrecionTabla
            :revisiones="secretarioRevisiones"
            :loading="loading"
            :isRevisionDisabled="isRevisionDisabled"
            :solicitarRevision="solicitarRevisionInforme"/>
        </div>        
        <!-- Tabla del Vocal -->
        <div class="overflow-x-auto mt-4">
          <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por el jurado vocal</p>
          <CorrecionTabla
            :revisiones="vocalRevisiones"
            :loading="loading"
            :isRevisionDisabled="isRevisionDisabled"
            :solicitarRevision="solicitarRevisionInforme"/>
        </div>
      </div>

      <!-- documentos de cada jurado revisor -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">2. Documentos de conformidad del informe final por los jurados</h2>
          <ModalToolTip :infoModal="[{ info: 'Asegúrate de revisar los documentos de Informe de Conformidad por los Jurados antes de continuar.' },]" />
        </div>

        <!-- informe de conformidad del presidnetne -->
        <div class="mt-4 space-y-4">
          <DocumentCard 
            titulo="ACTA DE CONFORMIDAD DEL INFORME FINAL DEL TRABAJO DE INVESTIGACION (TESIS) - POR EL JURADO PRESIDENTE"
            :estado="obtenerEstadoDocumento(presidenteRevisiones[0]?.estado || '')"
            :id="presidente_id"
            :view="VIEW_CPA"
            :download="DOWNLOAD_CPA"/>
        </div>
        <!-- informe de conformidad del sercretario -->
        <div class="mt-4 space-y-4">
          <DocumentCard 
            titulo="ACTA DE CONFORMIDAD DEL INFORME FINAL DEL TRABAJO DE INVESTIGACION (TESIS) - POR EL JURADO SECRETARIO"
            :estado="obtenerEstadoDocumento(secretarioRevisiones[0]?.estado || '')"
            :id="secretario_id"
            :view="VIEW_CPA"
            :download="DOWNLOAD_CPA"/>
        </div>
        <!-- informe de conformidad del vocal -->
        <div class="mt-4 space-y-4">
          <DocumentCard 
            titulo="ACTA DE CONFORMIDAD DEL INFORME FINAL DEL TRABAJO DE INVESTIGACION (TESIS) - POR EL JURADO VOCAL"
            :estado="obtenerEstadoDocumento(vocalRevisiones[0]?.estado || '')"
            :id="vocal_id"
            :view="VIEW_CPA"
            :download="DOWNLOAD_CPA"/>
        </div>
      </div>

      <!--Botones siguiente y anteerior-->
      <div class="flex justify-between">
        <button 
          @click="$router.push('/estudiante/designacion-informe-jurado')" 
          class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
          Anterior
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