<script lang="ts" setup>
import { alertToast } from '@/functions';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ref, computed, onMounted } from 'vue';

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
  router.push("/estudiante/aprobacion-informe");
};

const isNextButtonDisabled = computed(() => {
  return documentos.value.some(doc => doc.estado !== "Aprobado");
});

// ***** Texto que se escribe automáticamente ********
const text = "Correciones de Sustentación";
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

const mostrarModalObservaciones = ref(false); 
const mostrarModalDocumentos = ref(false); 

//*********************************** INTEGRACIÓN CON EL BACKEND *************************************************** */
const load = ref(false);
const authStore = useAuthStore();
const titulo = ref<string>('');
const link = ref<string>('');
const presidente = ref<string>('');
const vocal = ref<string>('');
const secretario = ref<string>('');

const documentos = ref([
  { nombre: 'Informe de conformidad - Presidente', estado: 'Pendiente' },
  { nombre: 'Informe de conformidad - Secretario', estado: 'Pendiente' },
  { nombre: 'Informe de conformidad - Vocal', estado: 'Pendiente' },
]);

const revisionesPresidente = ref<Jurado[]>([]);
const revisionesVocal = ref<Jurado[]>([]);
const revisionesSecretario = ref<Jurado[]>([]);

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;

const review_id = ref<string>("");
const review_id_presidente = ref<string>(''); 
const review_id_secretario = ref<string>('');
const review_id_vocal = ref<string>('');

const isRevisionDisabled = (estado: string | undefined) => {
  return ["pendiente", "aprobado"].includes(estado?.toLowerCase() || '');
};

interface Jurado {
  nombre: string;
  rol: string;
  numero_revision?: string;
  fecha?: string;
  estado?: string;
  revision_id?: string;
  isLoading?: boolean;
}

const solicitarRevisionInforme = async (review: Jurado) => {
  if (!review.revision_id) {
    alertToast('ID de revisión no disponible', 'Error', 'error');
    return;
  }

  review.isLoading = true;// Bloquear el botón solo para esta revisión
  try {
    console.log('Solicitando revisión para el ID:', review.revision_id);
    const response = await axios.put(`/api/review/${review.revision_id}/status`, {
      rev_status: 'pendiente',
    });

    if (response.data.estado) {
      const nuevoEstado = response.data.estado.toLowerCase();
      alertToast("Solicitud enviada correctamente", "Éxito", "success");
      await mostrarConformidadJuradosInforme();
      review.estado = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1);
    } else {
      alertToast("Error al procesar la solicitud", "Error", "error");
    }
  } catch (error) {
    console.error('Error al solicitar la revisión:', error);
    alertToast("Revisión no encontrada.", "Error", "error");
  } finally {
    review.isLoading = false;
  }
};

const mostrarConformidadJuradosInforme = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/estudiante/get-revision-jurados/informe/${student_id}`);
    const data = response.data;
    console.log("Mostrando lo recibido: ", data);

    if(response.data.review_id){
      review_id.value = response.data.review_id;
    }

    titulo.value = data.titulo || '';
    link.value = data.link || '';

    revisionesPresidente.value = [];
    revisionesVocal.value = [];
    revisionesSecretario.value = [];

    data.data.forEach((jurado: Jurado) => {
      console.log('Datos del jurado:', jurado);
      const formatearEstado = jurado.estado
      ? jurado.estado.charAt(0).toUpperCase() + jurado.estado.slice(1).toLowerCase() : 'Pendiente de revisión';

      // Asignar nombre del jurado según su rol
      if (jurado.rol === 'presidente') {
        presidente.value = jurado.nombre;
        review_id_presidente.value = jurado.revision_id ?? '';
        documentos.value[0].estado = jurado.estado === 'aprobado' ? 'Aprobado' : 'Pendiente';
        revisionesPresidente.value.push({
          nombre: jurado.nombre,
          rol: jurado.rol,
          numero_revision: jurado.numero_revision,
          fecha: jurado.fecha,
          estado: formatearEstado,
          revision_id: jurado.revision_id,
          isLoading: false,
        });
      }

      if (jurado.rol === 'secretario') {
        secretario.value = jurado.nombre;
        review_id_secretario.value = jurado.revision_id ?? '';
        documentos.value[1].estado = jurado.estado === 'aprobado' ? 'Aprobado' : 'Pendiente';
        revisionesSecretario.value.push({
          nombre: jurado.nombre,
          rol: jurado.rol,
          numero_revision: jurado.numero_revision,
          fecha: jurado.fecha,
          estado: formatearEstado,
          revision_id: jurado.revision_id,
          isLoading: false,
        });
      }

      if (jurado.rol === 'vocal') {
        vocal.value = jurado.nombre;
        review_id_vocal.value = jurado.revision_id ?? '';
        documentos.value[2].estado = jurado.estado === 'aprobado' ? 'Aprobado' : 'Pendiente';
        revisionesVocal.value.push({
          nombre: jurado.nombre,
          rol: jurado.rol,
          numero_revision: jurado.numero_revision,
          fecha: jurado.fecha,
          estado: formatearEstado,
          revision_id: jurado.revision_id,
          isLoading: false,
        });
      }
    });
  } catch (error) {
    console.error('Error al obtener jurados designados: ', error);
  } finally {
    load.value = false;
  }
};

onMounted(() => {
  mostrarConformidadJuradosInforme();
})
</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-5/6 rounded-lg duration-200 skeleton-loader"></h3>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg p-6 space-y-4 animate-pulse duration-200">
          <div class="text-center"><p class="h-4 rounded w-2/3"></p></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-gray-200 rounded-lg h-36 p-6 skeleton-loader duration-200"></div>
            <div class="bg-gray-200 rounded-lg h-36 p-6 skeleton-loader duration-200"></div>
            <div class="bg-gray-200 rounded-lg h-36 p-6 skeleton-loader duration-200"></div>
          </div>
          <div class="bg-gray-200 h-44 rounded-lg p-6 -m-0 skeleton-loader duration-200"></div>
          <div class="text-center mt-6">
            <div class="h-10 bg-gray-200 rounded w-44 mx-auto skeleton-loader duration-200"></div>
          </div><p class="h-4 mt-6"></p>
        </div>
        <div class="bg-white rounded-lg p-6 relative animate-pulse">
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
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
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
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
    <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
    <div class="mt-6 space-y-10">
      <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4">
        <div class="text-center"><p class="text-gray-600 text-sm">A continuación, se muestra los jurados designados a tu informe final y el título. Asegúrate de verificar la información y estar atento a las actualizaciones.</p></div>
        <!-- Información de los jurados -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow-lg transition transform hover:scale-105">
            <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
            <p class="font-bold text-xl text-azul">Presidente</p>
            <p class="text-gray-600">{{ presidente || 'Presidente no asignado' }}</p>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow-lg transition transform hover:scale-105">
            <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
            <p class="font-bold text-xl text-azul">Secretario</p>
            <p class="text-gray-600">{{ secretario || 'Secretario no asignado' }}</p>
          </div>

          <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow-lg transition transform hover:scale-105">
            <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
            <p class="font-bold text-xl text-azul">Vocal</p>
            <p class="text-gray-600">{{ vocal || 'Vocal no asignado' }}</p>
          </div>
        </div>
        <!-- Título de Tesis -->
        <div class="bg-blue-50 rounded-lg p-6 shadow-lg">
          <p class="max-w-7xl text-xm text-gray-600 uppercase text-center">{{ titulo || 'Título no asignado' }}</p>
        </div>
        <!-- Enlace del proyecto de Tesis -->
        <div v-if="link" class="text-center mt-6">
          <a
            :href="link"
            target="_blank"
            class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <i class="fas fa-external-link-alt"></i> Abrir proyecto
          </a>
        </div>

        <!-- Explicación breve -->
        <p class="text-sm text-gray-600 text-center">Asegúrate de tener toda tu información corregida y actualizada en el documento de Google Docs proporcionado y luego haga clic en "Solicitar revisión".</p>
      </div>

      <!-- Revisión de levantamiento de observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center">
          <h4 class="text-2xl font-medium text-black">1. Revisión de observaciones</h4>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalObservaciones = true"
              @mouseleave="mostrarModalObservaciones = false"/>
        </div>

        <div v-show="mostrarModalObservaciones" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">En esta sección se revisarán y corregirán las observaciones de tu proyecto de tesis con tus jurados, hasta que esté todo conforme.</p>
        </div>

        <p class="text-gray-500 mt-1 text-base">Si tu jurado ha dejado observaciones, el estado cambiará a 
          <strong class="text-[#8898aa] text-base font-medium">Pendiente</strong>. Por favor, corrige todas las observaciones directamente en el documento de Google Docs.
        </p>
        <p class="text-gray-500 mt-1  text-base">Una vez que hayas realizado las correcciones, haz clic en 
          <strong class="text-green-500 text-base font-medium">“Solicitar revisión”</strong>. para que el jurado revise nuevamente.
        </p>
        <p class="text-gray-500 mt-1 text-base">Cuando los 3 jurados aprueben tu proyecto de tesis, el estado cambiará automáticamente
          <strong class="text-green-500 text-base font-medium">Aprobado</strong>
        </p>

        <!-- Tabla de observaciones Presidente -->
        <div class="overflow-x-auto mt-4">
          <p class="text-2xl py-2 text-azul font-bold">Revisiones realizadas por el jurado presidente</p>
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead class="min-w-full leading-normal">
              <tr class="text-center text-azul border-b-2 bg-gray-300">
                <th class="px-4 py-2 text-left tracking-wider">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left tracking-wider">FECHA</th>
                <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                <th class="px-4 py-2 tracking-wider">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="revisionesPresidente.length === 0">
                <td colspan="4" class="px-4 py-6 text-gray-500">
                  <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>Aún no hay revisiones realizadas por el jurado
                </td>
              </tr>
              <tr v-else v-for="revision in revisionesPresidente" :key="revision.numero_revision" class="border-b border-gray-200 text-center">
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="text-wrap w-28">{{ revision.numero_revision || "Sin revisión" }}</p>
                </td>
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="text-wrap w-40">{{ revision.fecha || "Fecha no asignada" }}</p>
                </td>
                <td class="px-4 py-2 text-base">
                  <button
                    :disabled="isRevisionDisabled(revision.estado) || !revision.revision_id || revision.isLoading"
                    :class="[isRevisionDisabled(revision.estado) ? 'w-40 px-3 py-1 bg-gray-400 cursor-not-allowed' : 'bg-base', revision.isLoading ? 'bg-azul' : '']"
                    class="px-4 py-1 w-44 text-white rounded-md text-lg"
                    @click="solicitarRevisionInforme(revision)">
                    {{ revision.isLoading ? 'SOLICITANDO...' : 'Solicitar revisión' }}
                  </button>
                </td>
                <td class="px-4 py-2">
                  <span :class="['estado-estilo', revision.estado ? `estado-${revision.estado.toLowerCase()}` : 'estado-desconocido']" class="ml-4">{{ revision.estado || "No revisado aún" }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Tabla de observaciones Secretario -->
        <div class="overflow-x-auto mt-4">
          <p class="text-2xl py-2 text-azul font-bold">Revisiones realizadas por el jurado secretario</p>
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead class="min-w-full leading-normal">
              <tr class="text-center text-azul border-b-2 bg-gray-300">
                <th class="px-4 py-2 text-left tracking-wider">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left tracking-wider">FECHA</th>
                <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                <th class="px-4 py-2 tracking-wider">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="revisionesSecretario.length === 0">
                <td colspan="4" class="px-4 py-6 text-gray-500">
                  <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>Aún no hay revisiones realizadas por el jurado
                </td>
              </tr>
              <tr v-else v-for="revision in revisionesSecretario" :key="revision.numero_revision" class="border-b border-gray-200 text-center">
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="text-wrap w-28">{{ revision.numero_revision || "Sin revisión" }}</p>
                </td>
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="text-wrap w-40">{{revision.fecha || "Fecha no asignada" }}</p>
                </td>
                <td class="px-4 py-2 text-base">
                  <button
                    :disabled="isRevisionDisabled(revision.estado) || !revision.revision_id || revision.isLoading"
                    :class="[isRevisionDisabled(revision.estado) ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', revision.isLoading ? 'bg-azul' : '']"
                    class="px-4 py-1 w-44 text-white rounded-md text-lg"
                    @click="solicitarRevisionInforme(revision)">
                    {{ revision.isLoading ? 'Solicitando...' : 'Solicitar revisión' }}
                  </button>
                </td>
                <td class="px-4 py-2">
                  <span :class="['estado-estilo', revision.estado ? `estado-${revision.estado.toLowerCase()}` : 'estado-desconocido']" class="ml-4">{{ revision.estado || "No revisado aún" }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Tabla de observaciones Vocal -->
        <div class="overflow-x-auto mt-4">
          <p class="text-2xl py-2 text-azul font-bold">Revisiones realizadas por el jurado vocal</p>
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead class="min-w-full leading-normal">
              <tr class="text-center text-azul border-b-2 bg-gray-300">
                <th class="px-4 py-2 text-left tracking-wider">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left tracking-wider">FECHA</th>
                <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                <th class="px-4 py-2 tracking-wider">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="revisionesVocal.length === 0">
                <td colspan="4" class="px-4 py-6 text-gray-500">
                  <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>Aún no hay revisiones realizadas por el jurado
                </td>
              </tr>
              <tr v-else v-for="revision in revisionesVocal" :key="revision.numero_revision" class="border-b border-gray-200 text-center">
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="text-wrap w-28">{{ revision.numero_revision || "Sin revisión" }}</p>
                </td>
                <td class="px-4 py-2 text-base text-gray-600">
                  <p class="text-wrap w-40">{{ revision.fecha || "Fecha no asignada" }}</p>
                </td>
                <td class="px-4 py-2 text-base">
                  <button
                    :disabled="isRevisionDisabled(revision.estado) || !revision.revision_id || revision.isLoading"
                    :class="[isRevisionDisabled(revision.estado) ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', revision.isLoading ? 'bg-azul' : '']"
                    class="px-4 py-1 w-44 text-white rounded-md text-lg"
                    @click="solicitarRevisionInforme(revision)">
                    {{ revision.isLoading ? 'Solicitando...' : 'Solicitar revisión' }}
                  </button>
                </td>
                <td class="px-4 py-2">
                  <span :class="['estado-estilo', revision.estado ? `estado-${revision.estado.toLowerCase()}` : 'estado-desconocido']" class="ml-4">{{ revision.estado || "No revisado aún" }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">2. Documentos para verificar la conformidad del informe final por los jurados</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
            @mouseover="mostrarModalDocumentos = true"
            @mouseleave="mostrarModalDocumentos = false"/>
        </div>
        <div v-if="mostrarModalDocumentos" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
          <p class="text-sm text-gray-600">Asegúrate de revisar los documentos de Informe de Conformidad por los Jurados antes de continuar.</p>
        </div>

        <!-- INFORME DE CONFORMIDAD POR EL PRESIDENTE -->
        <div class="mt-4 space-y-4">
          <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <span class="flex-1 text-xm">{{ documentos[0].nombre }}</span>
              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <div v-if="documentos[0].estado === 'Aprobado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                  <!-- BOTON VER -->
                  <a
                    :href="`${VIEW_CPA}/${review_id_presidente}`"
                    target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- BOTON DESCARGAR -->
                  <a
                    :href="`${DOWNLOAD_CPA}/${review_id_presidente}`"
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

        <!-- INFORME DE CONFORMIDAD POR EL SECRETARIO -->
        <div class="mt-4 space-y-4">
          <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <span class="flex-1 text-xm">{{ documentos[1].nombre }}</span>
              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <div v-if="documentos[1].estado === 'Aprobado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                  <!-- BOTON VER -->
                  <a
                    :href="`${VIEW_CPA}/${review_id_secretario}`"
                    target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- BOTON DESCARGAR -->
                  <a
                    :href="`${DOWNLOAD_CPA}/${review_id_secretario}`"
                    download
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                <span :class="`estado-estilo estado-${documentos[1].estado.toLowerCase().replace(' ', '-')}`">{{ documentos[1].estado || "Estado desconocido" }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- INFORME DE CONFORMIDAD POR EL VOCAL -->
        <div class="mt-4 space-y-4">
          <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <span class="flex-1 text-xm">{{ documentos[2].nombre }}</span>
              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <div v-if="documentos[2].estado === 'Aprobado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                  <!-- BOTON VER -->
                  <a
                    :href="`${VIEW_CPA}/${review_id_vocal}`"
                    target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- BOTON DESCARGAR -->
                  <a
                    :href="`${DOWNLOAD_CPA}/${review_id_vocal}`"
                    download
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                <span :class="`estado-estilo estado-${documentos[2].estado.toLowerCase().replace(' ', '-')}`">{{ documentos[2].estado || "Estado desconocido" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between">
        <!-- Botón de Anterior -->
        <button 
          @click="$router.push('/estudiante/designacion-informe-jurado')" 
          class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
          Anterior
        </button>
        <!-- Botón de Siguiente -->
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
.estado-aprobado {
  background-color: #48bb78;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
.estado-desconocido {
  background-color: #8898aa;
  color: #ffffff;
}
</style>