<script lang="ts" setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { alertToast } from '@/functions';
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import ButtonS from '@/components/ButtonS.vue';

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad de Informe Final por Asesor";
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

const mostrarModalRevision = ref(false);
const mostrarModalObservaciones = ref(false);
const mostrarModalDocumentos = ref(false)

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
  router.push("/estudiante/designacion-informe-jurado");
};

const isNextButtonDisabled = computed(() => {
  return obtener.value?.revision?.rev_estado !== 'aprobado';
});

/****************************** INTEGRACION CON EL BACKEND *********************************** */
const authStore = useAuthStore();
const solicitudEstado = ref('');
const load = ref(false);
const isLoading = ref(false);
const obtener = ref<Estudiante | null>(null);

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;

// para que el botón quede deshabilitado
const bloquear = ['pendiente', 'observado', 'aprobado']
const isSolicitarDisabled = computed(() => {
  return (isLoading.value || (bloquear.includes(obtener.value?.revision?.rev_estado ?? '')))
});

interface Revision {
  rev_id: string;
  rev_contador: number;
  rev_estado: string;
  rev_update: string;
}

interface Estudiante {
  asesor: string;
  titulo: string;
  'link-informe': string;
  revision: Revision | null;
}

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/estudiante/info-conf-asesor/informe/${student_id}`);
    // console.log("Mostrando lo recibido", response);

    obtener.value = response.data;

  } catch (error) {
    console.error("Error al obtener datos", error);
  } finally {
    load.value = false;
  }
};

// funcion de disparador para solicitar revision asesor informe
const solicitarRevisionAsesorInforme = async () => {
  isLoading.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`/api/review/create-revision/informe/${student_id}`);

    if (response.data.estado) {
      solicitudEstado.value = 'pendiente';
      alertToast('Su solicitud de revisión fue enviada con éxito a su asesor.', "Éxito", "success");
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

const actualizarEstadoRevision = async (review_id: string) => {
  try {
    const payload = { rev_status: "pendiente" };
    const response = await axios.put(`/api/review/${review_id}/status`, payload);

    if (response.data.estado) {
      const nuevoEstado = response.data.estado.toLowerCase();
      alertToast("Las observaciones han sido corregidas y enviadas correctamente.", "Éxito", "success");

      if (obtener.value && obtener.value.revision) {
        obtener.value.revision.rev_estado = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1);
      }
      await obtenerDatosEstudiante();
    }
  } catch (error) {
    console.error("Error al actualizar el estado de la revisión", error);
    alertToast("Hubo un error al actualizar la revisión.", "Error", "error");
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
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md p-6 space-y-4">
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-gray-200 rounded-md h-36 p-4 flex flex-col items-center skeleton-loader duration-200"></div>
          </div>
          <div class="bg-gray-200 h-44 rounded-md p-6 -m-0 skeleton-loader duration-200"></div>
          <div class="text-center mt-6">
            <div class="h-10 bg-gray-200 rounded w-44 mx-auto skeleton-loader duration-200"></div>
          </div><p class="h-4 mt-6"></p>
        </div>
        <div class="bg-white rounded-md p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-9"></h2>
            <div class="h-7">
              <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-md p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"></h2>
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
      <!-- Sección 1: Solicitar link para cargar el Informe Final -->
      <!-- <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-3">1. Solicitar link para cargar su Informe final</h4>
        <div class="flex items-center justify-between"> 
        <p class="text-gray-500 mb-3">Haz click en el botón de Solicitar link para cargar el informe final</p>
        <span :class="estadoClase(solicitudLinkEstado)" class="estado-estilo ml-4">{{ solicitudLinkEstado }}</span>
      </div>
    
        <div class="flex justify-center mt-4">
          <button class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-600" @click="solicitarLink">Solicitar link</button>
        </div>
      </div> -->
      <div v-if="obtener" class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4 relative">
        <div class="grid grid-cols-1 gap-6">
          <div class="bg-white rounded-lg p-4 flex flex-col items-center shadow-lg w-full">
            <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
            <p class="font-bold text-xl text-azul">Asesor</p>
            <p class="text-gray-600 text-center uppercase">
              {{ obtener?.asesor || 'Asesor no asignado' }}
            </p>
          </div>
        </div>
        <div class="bg-blue-50 rounded-lg p-6 shadow-lg">
          <p class="max-w-7xl text-xm text-gray-600 uppercase text-center">{{ obtener?.titulo || 'Título no asignado' }}</p>
        </div>
        <!-- enlace del informe final -->
        <div v-if="obtener?.['link-informe']" class="text-center mt-6">
          <a
            :href="obtener?.['link-informe']"
            target="_blank"
            class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <i class="fas fa-external-link-alt"></i> Abrir proyecto
          </a>
        </div>
        <p class="text-sm text-gray-600 text-center">Asegúrate de corregir y actualizar tu información en Google Docs antes de hacer clic en "Solicitar revisión".</p>
      </div>

      <!-- solicitar correcion al asesor IF -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center">
          <h2 class="text-2xl font-medium text-black">1. Correcciones con tu asesor</h2>
          <ModalToolTip :infoModal="[{ info: 'Asegúrate de haber subido tu informe final en el documento de google para que el asesor pueda revisar y realizar las correcciones.' },]" />
        </div>
        <p class="text-gray-500 mt-2 mb-1 text-base">Haz clic en  
          <strong class="text-green-500 text-md font-medium">"Solicitar revisión"</strong> para iniciar las observaciones del informe final. 
        </p>
        <div class="flex justify-center mt-2">
          <!-- boton para solicitar revision de asesor -->
          <ButtonS 
              label="Solicitar revisión" 
              :loading="isLoading" 
              :disabled="isSolicitarDisabled" 
              @click="solicitarRevisionAsesorInforme" />
        </div>
      </div>

      <!-- revision del asesor para IF -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center">
          <h4 class="text-2xl font-medium text-black">2. Revisión de observaciones</h4>
          <ModalToolTip :infoModal="[{ info: 'En esta sección se revisarán y corregirán las observaciones de tu informe final con tu asesor, hasta que esté todo conforme.' },]" />            
        </div>

        <p class="text-gray-500 mt-2 mb-1 text-base">Si tu asesor deja observaciones, el estado será 
          <strong class="text-[#8898aa] text-md font-medium">"Pendiente"</strong>. Corrige en Google Docs.
        </p>
        <p class="text-gray-500 text-base">Luego, haz clic en 
          <strong class="text-green-500 text-md font-medium">“Observaciones corregidas”</strong>. Si todo está bien, el estado cambiará a 
          <strong class="text-green-500 text-md font-medium">"Aprobado"</strong>.
        </p>

        <!-- Tabla de observaciones -->
        <div class="overflow-x-auto mt-4">
          <table class="w-full max-w-full bg-white border rounded-md shadow">
            <thead>
              <tr class="text-center text-azul bg-gray-300">
                <th class="px-4 py-2 tracking-wider">N° REVISIÓN</th>
                <th class="px-4 py-2 tracking-wider">FECHA</th>
                <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                <th class="px-4 py-2 tracking-wider">ESTADO</th>
              </tr>
            </thead>
            <tbody v-if="obtener?.revision">
              <tr
                v-for="(obs, index) in [obtener.revision]" :key="obs.rev_id" class="text-center">
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="truncate">{{ obs.rev_contador  || 'Sin revisión' }}</p>
                </td>
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="truncate">{{ obs.rev_update   || 'Sin fecha' }}</p>
                </td>
                <td class="px-4 py-4">
                  <button
                    :disabled="obs.rev_estado === 'pendiente' || obs.rev_estado === 'aprobado'"
                    :class="['truncate px-4 py-2 text-base text-white bg-base rounded-md focus:outline-none',
                    obs.rev_estado === 'pendiente' || obs.rev_estado === 'aprobado'
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-base hover:bg-[#48bb78]',]"
                    @click="actualizarEstadoRevision(obs.rev_id)">Observaciones corregidas
                  </button>
                </td>
                <td class="px-4 py-2">
                  <span :class="`estado-estilo estado-${ obs.rev_estado.toLowerCase().replace(' ', '-')}`">
                    {{ obs.rev_estado.charAt(0).toUpperCase() + obs.rev_estado.slice(1).toLowerCase() }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="4" class="px-4 py-4 text-center text-gray-600">
                  <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay observaciones disponibles por el momento.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sección 4: Informe de conformidad de observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">3. Documento de conformidad del informe final por el asesor</h2>
            <ModalToolTip :infoModal="[{ info: 'Asegúrate de revisar el documento para verificar las observaciones antes de continuar.' },]" />
          </div>            
        </div>
        <div class="mt-4 space-y-4">
          <DocumentCard 
            titulo="Informe de conformidad de observaciones por el asesor."
            :estado="['aprobado'].includes(obtener?.revision?.rev_estado ?? '') ? obtener?.revision?.rev_estado ?? '' : ''"
            :id="obtener?.revision?.rev_id ?? ''"
            :view="VIEW_CPA"
            :download="DOWNLOAD_CPA"/>
        </div>
      </div>

      <!--Botones siguiente y anteerior-->
      <div class="flex justify-between">
        <button 
            @click="$router.push('/estudiante/progreso')"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
          </button>
        <button
          @click="handleNextButtonClick"
          :class="[ 'px-4 py-2 text-white rounded-md', isNextButtonDisabled
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
  display: inline-block;
}
.text-center {
  text-align: center;
  padding: 1rem;
}
.estado-no-iniciado,
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-tramitado,
.estado-aprobado {
  background-color: #48bb78;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
</style>