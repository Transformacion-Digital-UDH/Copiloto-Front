<script lang="ts" setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { alertToast } from '@/functions';
import { watch } from 'vue';
import Swal from 'sweetalert2';
import router from '@/router';

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
  return documentos.value[0].estado.toLowerCase() !== "aprobado";
});

const mostrarModalRevision = ref(false);
const mostrarModalObservaciones = ref(false);
const mostrarModalDocumentos = ref(false);

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

/****************************** INTEGRACION CON EL BACKEND *********************************** */
const load = ref(false);
const isLoading = ref(false);
const authStore = useAuthStore();
const rev_id = ref('');
const solicitudEstado = ref('');
const obtener = ref<Estudiante | null>(null);
const documentos = ref([{ nombre: 'Informe de conformidad de observaciones por el asesor', estado: 'Pendiente' }]);
const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;

const isSolicitarDisabled = computed(() => {
  const estadoSolicitud = solicitudEstado.value?.toLowerCase();
  return ["pendiente", "aprobado", "observado"].includes(estadoSolicitud) // se deshabilita el botón dependiendo del estado
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

const obtenerDatosEstudianteInforme = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`/api/estudiante/info-conf-asesor/informe/${student_id}`);
    console.log("Mostrando lo recibido", response)

    obtener.value = response.data;

    if (obtener.value?.revision) {
      rev_id.value = obtener.value.revision.rev_id;
      solicitudEstado.value = obtener.value.revision.rev_estado;

      documentos.value[0].estado = solicitudEstado.value.charAt(0).toUpperCase() + solicitudEstado.value.slice(1).toLowerCase();
    }

  } catch (error) {
    console.error("Error al obtener información", error);
  } finally {
    load.value = false;
  }
};

onMounted(() => {
  obtenerDatosEstudianteInforme();
});

const solicitarRevision = async () => {
  isLoading.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`/api/review/create-revision/informe/${student_id}`);

    if (response.data.estado) {
      solicitudEstado.value = 'pendiente';
      alertToast('Su solicitud de revisión fue enviada con éxito a su asesor.', 'success');
      await obtenerDatosEstudianteInforme();
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

const actualizarEstadoRevision = async (review_id: string) => {
  try {
    // Construimos el payload para cambiar el estado a "pendiente"
    const payload = { rev_status: "pendiente" };
    const response = await axios.put(`/api/review/${review_id}/status`, payload);

    if (response.data.estado) {
      const nuevoEstado = response.data.estado.toLowerCase();
      alertToast("Observaciones enviadas correctamente", "Éxito", "success");

      // Actualizamos el estado en el objeto obtener
      if (obtener.value && obtener.value.revision) {
        obtener.value.revision.rev_estado = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1);
      }
      await obtenerDatosEstudianteInforme();
    }
  } catch (error) {
    console.error("Error al actualizar el estado de la revisión", error);
    alertToast("Hubo un error al actualizar la revisión.", "Error", "error");
  }
};

</script>
<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-11 w-4/5 rounded-lg duration-200 skeleton-loader"></h3>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg p-6 space-y-4">
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-gray-200 rounded-lg h-36 p-4 flex flex-col items-center skeleton-loader duration-200"></div>
          </div>
          <div class="bg-gray-200 h-44 rounded-lg p-6 -m-0 skeleton-loader duration-200"></div>
          <div class="text-center mt-6">
            <div class="h-10 bg-gray-200 rounded w-44 mx-auto skeleton-loader duration-200"></div>
          </div><p class="h-4 mt-6"></p>
        </div>
        <div class="bg-white rounded-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-1/6 rounded-md skeleton-loader duration-200"></h2>
            <div class="flex justify-between items-center">
              <h2 class="bg-gray-200 h-6 w-96 rounded-md skeleton-loader duration-200"></h2>
            </div>
            <div class="h-7">
              <h2 class="bg-gray-200 h-10 w-40 mx-auto rounded-md skeleton-loader duration-200"></h2>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg p-6 h-auto mt-4 animate-pulse duration-200">
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
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
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

      <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4">
          <!-- Nombre del Asesor -->
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-gray-100 rounded-lg p-4 flex flex-col items-center shadow-lg">
              <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
              <p class="font-bold text-2xl text-azul">Asesor</p>
              <p class="text-gray-600 text-center uppercase">
                {{ obtener?.asesor || 'Asesor no asignado' }}
              </p>
            </div>
          </div>
          <!-- Título de Tesis -->
          <div class="bg-gray-100 rounded-lg p-6 shadow-lg">
            <p class="max-full text-xm text-gray-600 uppercase text-center">{{ obtener?.titulo || 'Título no asignado' }}</p>
          </div>
          <!-- Enlace del Informe final -->
          <div v-if="obtener?.['link-informe']" class="text-center mt-6">
            <a
              :href="obtener?.['link-informe']"
              target="_blank"
              class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <i class="fas fa-external-link-alt"></i> Abrir proyecto
            </a>
          </div>  
          <!-- Explicación breve -->
          <p class="text-sm text-gray-600 text-center">Sube la información de tu informe final en el documento de Google Docs proporcionado y, cuando estés listo, haz clic en 'Solicitar Revisión' para iniciar el proceso.</p>
        </div>

        <!-- Sección 2: Correcciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Correcciones con tu asesor</h2>
            <img
              src="/icon/info2.svg"
              alt="Info"
              class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalRevision = true"
              @mouseleave="mostrarModalRevision = false"
            />
            <!-- <span :class="['estado-estilo', `estado-${solicitudEstado.replace(/\s+/g, '-').toLowerCase()}`]" class="ml-4">{{ solicitudEstado }}</span> -->
          </div>
          <div v-show="mostrarModalRevision" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Asegúrate de haber subido tu informe final en el documento de google para que el asesor pueda revisar y realizar las correcciones.</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-gray-500 text-base mt-2">
              Para comenzar con el proceso de observaciones en el informe final de proyecto de tesis, haz clic en <strong class="text-[#39B49E] font-medium">"Solicitar revisión"</strong>
            </p>
          </div>
          <!-- <div class="flex justify-end">
            <span :class="['estado-estilo', `estado-${solicitudEstado.toLowerCase()}`]">{{ solicitudEstado.charAt(0).toUpperCase() + solicitudEstado.slice(1).toLowerCase() }}</span>
          </div> -->
          <div class="mt-4">
            <div class="flex justify-center mt-2">
              <button
                :disabled="isSolicitarDisabled || isLoading"
                :class="[ 
                  isSolicitarDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-azul',
                  isLoading ? 'cursor-not-allowed' : '' 
                ]"
                class="px-4 py-2 w-56 text-white rounded-lg text-lg"
                @click="solicitarRevision">
                {{ isLoading ? 'Solicitando...' : 'Solicitar revisión' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Sección 3: Solicitar revisión de levantamiento de observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h4 class="text-2xl font-medium text-black">
              2. Revisión de observaciones
            </h4>

            <div class="relative">
              <img
                src="/icon/info2.svg"
                alt="Info"
                class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalObservaciones = true"
                @mouseleave="mostrarModalObservaciones = false"
              />
              <div
                v-show="mostrarModalObservaciones"
                class="absolute -left-60 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
                <p class="text-sm text-gray-600">
                  En esta sección se revisarán y corregirán las observaciones de tu informe final con tu asesor, hasta que esté todo conforme.
                </p>
              </div>
            </div>
            
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-base">Si tu asesor ha dejado observaciones, el estado de la revisión cambiará a
            <strong class="text-[#8898aa] text-md font-medium">"Pendiente"</strong>. Realiza las correcciones directamente en el documento de Google Docs.
          </p>
          <p class="text-gray-500 text-base">Una vez que hayas corregido, haz clic en 
            <strong class="text-green-500 text-base font-medium">“Observaciones corregidas”</strong> para que el asesor revise nuevamente. Si todo está en orden, el estado cambiará a <strong class="text-green-500 text-base font-medium">"Aprobado"</strong>.
          </p>
          <!-- Tabla de observaciones -->
          <div class="overflow-x-auto mt-4">
            <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
              <thead class="min-w-full leading-normal">
                <tr class="text-center text-azul border-b-2 bg-gray-300">
                  <th class="px-4 py-2 text-left tracking-wider">N° REVISIÓN</th>
                  <th class="px-4 py-2 text-left tracking-wider">FECHA</th>
                  <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                  <th class="px-4 py-2 tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody v-if="obtener?.revision">
                <tr
                  v-for="(obs, index) in [obtener.revision]"
                  :key="obs.rev_id"
                  class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300"
                >
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">{{ obs.rev_contador  || 'Sin revisión' }}</p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap text-left w-24">{{ obs.rev_update   || 'Sin fecha' }}</p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button
                      :disabled="obs.rev_estado === 'pendiente' || obs.rev_estado === 'aprobado'"
                      :class="[
                        'w-56 px-3 py-1 text-base text-white bg-base rounded-xl focus:outline-none',
                        obs.rev_estado === 'pendiente' || obs.rev_estado === 'aprobado'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-base hover:bg-[#48bb78]',
                      ]"
                      @click="actualizarEstadoRevision(obs.rev_id)"
                    >
                      Observaciones corregidas
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
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">4. Documento para verificar la conformidad del informe final por el asesor</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
                @mouseover="mostrarModalDocumentos = true"
                @mouseleave="mostrarModalDocumentos = false" />
          </div>            
        </div>

        <div v-show="mostrarModalDocumentos" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">Asegúrate de revisar el documento para verificar las observaciones antes de continuar.</p>
        </div>

        <div class="mt-4 space-y-4">
          <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <span class="flex-1 text-xm bg-gray-50">{{ documentos[0].nombre }}</span>
              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <!-- Mostrar botones de ver y descargar solo si el estado es aprobado -->
                <div v-if="documentos[0].estado.toLowerCase() === 'aprobado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                  <!-- Botón de Ver -->
                  <a 
                    :href="`${VIEW_CPA}/${rev_id}`" 
                    target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- Botón de Descargar -->
                  <a 
                    :href="`${DOWNLOAD_CPA}/${rev_id}`" 
                    download
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <!-- Mensaje de documento no disponible si el estado no es aprobado -->
                <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                <span :class="`estado-${documentos[0].estado.toLowerCase()}`" class="estado-estilo">
                  {{ documentos[0].estado.charAt(0).toUpperCase() + documentos[0].estado.slice(1).toLowerCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--Botones siguiente y anteerior-->
      <div class="flex justify-end">
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
  display: inline-block;
}

.break-all {
  word-break: break-all;
}

.estado-hecho {
  background-color: #38a169;
  color: #ffffff;
}

.estado-aprobado {
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
.estado-no-iniciado {
  background-color: #718096;
  color: #ffffff;
}
</style>