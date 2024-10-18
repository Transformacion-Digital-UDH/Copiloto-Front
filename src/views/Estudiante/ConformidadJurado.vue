<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { alertToast } from "@/functions";
import router from "@/router";
import Swal from "sweetalert2";

// interface Documento {
//   nombre: string;
//   estado: string;
//   documentoUrl: string;
//   revision_id?: string | null;
// }
// interface Asesor {
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno: string;
// }

// Documentos es un array reactivo de tipo Documento usando reactive
// const documentos = reactive<Documento[]>([
//   {
//     nombre: "Informe de Conformidad de Observaciones",
//     estado: "pendiente",
//     documentoUrl: "",
//     revision_id: null,
//   },
// ]);

// function estadoClase(estado: string) {
//   switch (estado) {
//     case "aprobado":
//       return "bg-[#48bb78] text-white";
//     case "pendiente":
//       return "bg-[#8898aa] text-white";
//     case "observado":
//       return "bg-[#e79e38] text-white";
//     default:
//       return "";
//   }
// }

const mostrarModalRevision = ref(false);
const mostrarModalObservaciones = ref(false);
const mostrarModalDocumentos = ref(false);

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad de proyecto de tesis por los jurados";
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
//   router.push("/estudiante/aprobacion-proyecto");
// };

// const isNextButtonDisabled = computed(() => {
//   const documentoPaso3 = documentos.find(
//     (doc) => doc.nombre === "Informe de Conformidad de Observaciones"
//   );
//   return documentoPaso3?.estado !== "Hecho";
// });

// ******************************************************

//*********************************** INTEGRACIÓN CON EL BACKEND *************************************************** */
const load = ref(false);
const authStore = useAuthStore();
const titulo = ref<string>('');
const link = ref<string>('');
const presidente = ref<string>('');
const vocal = ref<string>('');
const secretario = ref<string>('');
const revisionesPresidente = ref<Jurado[]>([]);
const revisionesVocal = ref<Jurado[]>([]);
const revisionesSecretario = ref<Jurado[]>([]);

interface Jurado {
  nombre: string;
  rol: string;
  numero_revision?: string;
  fecha?: string;
  estado?: string;
  revision_id?: string;
  isLoading?: boolean;
}

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

const isRevisionDisabled = (estado: string | undefined) => {
  return ["pendiente", "aprobado"].includes(estado?.toLowerCase() || '');
};

const mostrarConformidadJurados = async () => {
  load.value = true;
  try {
    const response = await axios.get(`api/review/get-review-jury/${authStore.id}`);
    const data = response.data;

    console.log('Mostrando lo recido: ', data);

    titulo.value = data.titulo || '';
    link.value = data.link || '';

    revisionesPresidente.value = [];
    revisionesVocal.value = [];
    revisionesSecretario.value = [];

    data.data.forEach((jurado: Jurado) => {
      const formatearEstado = jurado.estado
      ? jurado.estado.charAt(0).toUpperCase() + jurado.estado.slice(1).toLowerCase() : 'Pendiente de revisión';

      // Asignar nombre del jurado según su rol
      if (jurado.rol === 'presidente') {
        presidente.value = jurado.nombre;
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
      if (jurado.rol === 'vocal') {
        vocal.value = jurado.nombre;
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
      if (jurado.rol === 'secretario') {
        secretario.value = jurado.nombre;
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
    });
  } catch (error) {
    console.error('Error al obtener jurados designados: ', error);
  } finally {
    load.value = false;
  }
};

const solicitarRevision = async (review: Jurado) => {
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

onMounted(() => {
  mostrarConformidadJurados();
})

// const obtenerRevisiones = async () => {
//   try {
//     const response = await axios.get(`/api/student/get-review/${authStore.id}`);
//     if (response.data.status) {
//       console.log(response);
//       solicitudEstado.value = response.data.revision.estado;
//       console.log("Estado de la solicitud:", solicitudEstado.value);
//     }
//   } catch (error: any) {
//     solicitudMensaje.value =
//       error.response?.data.message || "Error desconocido";
//   }
// };

// const obtenerRev = async () => {
//   load.value = true;
//   try {
//     const response = await axios.get(`/api/student/get-review/${authStore.id}`);
//     console.log("Datos recibidos de revisión:", response.data);

//     if (response.data.status) {
//       console.log("Estructura de los datos recibidos:", response.data);
//       const revisionData = response.data.revision;

//       cantidad.value = revisionData.cantidad;
//       fecha.value = revisionData.fecha || "Desconocido";
//       estado.value = revisionData.estado;
//       revision_id.value = revisionData.revision_id;

//       documentos[0].revision_id = revisionData.revision_id;

//       if (revisionData.estado === "aprobado") {
//         documentos[0].estado = "Hecho";
//         documentos[0].documentoUrl =
//           "https://titulacion-back.abimaelfv.site/api/view-cpa";
//       } else {
//         documentos[0].estado = "pendiente";
//       }

//       revision.value = [
//         {
//           cantidad: revisionData.cantidad,
//           fecha: revisionData.fecha || "Desconocido",
//           accion: "Solicitar Revisión",
//           estado: revisionData.estado,
//         },
//       ];
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       alert(
//         `Error al actualizar la revisión: ${
//           error.response?.data.message || "Error desconocido"
//         }`
//       );
//     } else {
//       alert("Ocurrió un error desconocido.");
//     }
//     console.error(error);
//   } finally {
//     load.value = false;
//   }
// };

// const actualizarRevision = async (studentId: string) => {
//   try {
//     if (!studentId) {
//       alert("No se pudo encontrar el ID del estudiante");
//       return;
//     }

//     const response = await axios.put(
//       `/api/student/review/${studentId}/status`,
//       {
//         rev_status: "pendiente",
//       }
//     );

//     if (response.status === 200 || response.status === 201) {
//       await obtenerRev();

//       alertToast(
//         "Se han enviado las observaciones corregidas.",
//         "Éxito",
//         "success"
//       );
//     } else {
//       alert("Hubo un problema al actualizar la revisión.");
//     }
//   } catch (error: unknown) {
//     if (axios.isAxiosError(error)) {
//       alert(
//         `Error al actualizar la revisión: ${
//           error.response?.data.message || "Error desconocido"
//         }`
//       );
//     } else {
//       alert("Ocurrió un error desconocido.");
//     }
//     console.error(error);
//   }
// };

// const obtenerDatosEstudiante = async () => {
//   try {
//     const response = await axios.get(`/api/student/getInfo/${authStore.id}`);
//     if (response.data.status) {
//       const solicitud = response.data.solicitud;
//       asesor.value = solicitud.asesor;
//       titulo.value = solicitud.titulo;
//       link.value = solicitud.link;
//     }
//   } catch (error) {
//     console.error("Error al obtener los datos del estudiante:", error);
//   }
// };

// onMounted(() => {
//   obtenerRevisiones();
//   obtenerRev();
//   obtenerDatosEstudiante();
// });
</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-11 w-5/6 rounded-lg duration-200 skeleton-loader"></h3>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-64 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
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
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="block space-y-5">
            <h2 class="px-4 py-2 h-11 w-24 rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
      <div class="mt-6 space-y-10 ">
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4">
          <!-- mostrar informacion al estudiante conformidad de jurados -->
          <div class="space-y-2">
            <div class="flex space-x-3">
              <i class="fas fa-user-tie text-black text-2xl"></i>
              <p class="font-bold text-lg text-azul">PRESIDENTE:</p>
              <p>{{ presidente || 'Aún no asignado' }}</p> 
            </div>

            <div class="flex space-x-3">
              <i class="fas fa-user-tie text-black text-2xl"></i>
              <p class="font-bold text-lg text-azul">SECRETARIO:</p>
              <p>{{ secretario || 'Aún no asignado' }}</p>
            </div>

            <div class="flex space-x-3">
              <i class="fas fa-user-tie text-black text-2xl"></i>
              <p class="font-bold text-lg text-azul">VOCAL:</p>
              <p>{{ vocal || 'Aún no asignado' }}</p>
            </div>
          </div> 
          <!-- Título de Tesis -->
          <div>
            <p class="max-w-7xl"><strong>TÍTULO DE TESIS: </strong> {{ titulo }}</p>
          </div>
          <!-- Enlace del proyecto de Tesis -->
          <p><strong>PROYECTO DE TESIS </strong>
            <a
              :href="`${link}`"
              target="_blank"
              class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-azulOscuro hover:shadow-lg transition-all duration-300 text-base">
              <i class="fas fa-external-link-alt"></i> Abrir Google Docs
            </a>
          </p>
          <!-- Explicación breve -->
          <p class="text-sm text-gray-600">Asegurate de tener toda tu informacion corregida y actualizada en el documento de Google Docs proporcionado y luego haga clic en "Solicitar Revisión".</p>
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
          <div class="flex items-center">
            <h4 class="text-2xl font-medium text-black">1. Revisión de observaciones</h4>
            <div class="relative">
              <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalObservaciones = true"
                @mouseleave="mostrarModalObservaciones = false"/>
              <div v-show="mostrarModalObservaciones" class="absolute -left-20 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
                <p class="text-sm text-gray-600">En esta sección se revisarán y corregirán las observaciones de tu proyecto de tesis con tus jurados, hasta que esté todo conforme.</p>
              </div>
            </div>
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-lg">Si tu jurado ha dejado observaciones, el estado cambiará a 
            <strong class="text-[#8898aa] text-lg">Pendiente</strong>. Por favor, corrige todas las observaciones directamente en el documento de Google Docs.
          </p>
          <p class="text-gray-500 mt-2 mb-1 text-lg">Una vez que hayas realizado las correcciones, haz clic en 
            <strong class="text-green-500 text-lg">“Solicitar revisión”</strong>. para que el jurado revise nuevamente.
          </p>
          <p class="text-gray-500 mt-2 mb-1 text-lg">Cuando los 3 jurados aprueben tu proyecto de tesis, el estado cambiará automáticamente a 
            <strong class="text-green-500 text-lg">Aprobado</strong>
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
                <tr v-else v-for="revision in revisionesPresidente" :key="revision.numero_revision" class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">{{ revision.numero_revision || "Sin revisión" }}</p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-40">{{ revision.fecha || "Fecha no asignada" }}</p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button
                      :disabled="isRevisionDisabled(revision.estado) || !revision.revision_id || revision.isLoading"
                      :class="[isRevisionDisabled(revision.estado) ? 'w-40 px-3 py-1 bg-gray-400 cursor-not-allowed' : 'bg-green-400', revision.isLoading ? 'bg-green-500' : '']"
                      class="px-4 py-2 text-white rounded-md"
                      @click="solicitarRevision(revision)">
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
                <tr v-else v-for="revision in revisionesSecretario" :key="revision.numero_revision" class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">{{ revision.numero_revision || "Sin revisión" }}</p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-40">{{revision.fecha || "Fecha no asignada" }}</p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button
                      :disabled="isRevisionDisabled(revision.estado) || !revision.revision_id || revision.isLoading"
                      :class="[isRevisionDisabled(revision.estado) ? 'w-40 px-3 py-1 bg-gray-400 cursor-not-allowed' : 'bg-green-400', revision.isLoading ? 'bg-green-500' : '']"
                      class="px-4 py-2 text-white rounded-md"
                      @click="solicitarRevision(revision)">
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
                <tr v-else v-for="revision in revisionesVocal" :key="revision.numero_revision" class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">{{ revision.numero_revision || "Sin revisión" }}</p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-40">{{ revision.fecha || "Fecha no asignada" }}</p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button
                      :disabled="isRevisionDisabled(revision.estado) || !revision.revision_id || revision.isLoading"
                      :class="[isRevisionDisabled(revision.estado) ? 'w-40 px-3 py-1 bg-gray-400 cursor-not-allowed' : 'bg-green-400', revision.isLoading ? 'bg-green-500' : '']"
                      class="px-4 py-2 text-white rounded-md"
                      @click="solicitarRevision(revision)">
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
        </div>

        <!-- Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">2. Documentos</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalDocumentos = true"
              @mouseleave="mostrarModalDocumentos = false"/>
          </div>
          <div v-if="mostrarModalDocumentos" class="absolute left-40 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Asegúrate de revisar los documentos de Informe de Conformidad por los Jurados antes de continuar.</p>
          </div>

          <!-- INFORME DE CONFORMIDAD POR EL PRESIDENTE >
          <div-- class="mt-4 space-y-4">
            <div v-for="(documento, index) in documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <span class="w-full md:w-auto mb-2 md:mb-0 text-lg">Informe de Conformidad de Observaciones por Presidente</span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <div v-if="documento.estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    
                    <a
                      :href="`${VIEW_CPA}/${documento.revision_id}`"
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    
                    <a
                      :href="`${DOWNLOAD_CPA}/${documento.revision_id}`"
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>
                  <span v-else-if="documento.estado === 'pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>
                  <span :class="`estado-estilo estado-${documento.estado.toLowerCase().replace(' ', '-')}`">{{ documento.estado || "Estado desconocido" }}</span>
                </div>
              </div>
            </div>
          </div-->

          <!-- INFORME DE CONFORMIDAD POR EL SECRETARIO >
          <div-- class="mt-4 space-y-4">
            <div v-for="(documento, index) in documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <span class="w-full md:w-auto mb-2 md:mb-0 text-lg">Informe de Conformidad de Observaciones por Secretario</span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <div v-if="documento.estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    
                    <a
                      :href="`${VIEW_CPA}/${documento.revision_id}`"
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    
                    <a
                      :href="`${DOWNLOAD_CPA}/${documento.revision_id}`"
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>
                  <span v-else-if="documento.estado === 'pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>
                  <span :class="`estado-estilo estado-${documento.estado.toLowerCase().replace(' ', '-')}`">{{ documento.estado || "Estado desconocido" }}</span>
                </div>
              </div>
            </div>
          </div-->

          <!-- INFORME DE CONFORMIDAD POR EL VOCAL >
          <div-- class="mt-4 space-y-4">
            <div v-for="(documento, index) in documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <span class="w-full md:w-auto mb-2 md:mb-0 text-lg">Informe de Conformidad de Observaciones por vocal</span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <div v-if="documento.estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    
                    <a
                      :href="`${VIEW_CPA}/${documento.revision_id}`"
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    
                    <a
                      :href="`${DOWNLOAD_CPA}/${documento.revision_id}`"
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>
                  <span v-else-if="documento.estado === 'pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>
                  <span :class="`estado-estilo estado-${documento.estado.toLowerCase().replace(' ', '-')}`">{{ documento.estado || "Estado desconocido" }}</span>
                </div>
              </div>
            </div>
          </div-->
        </div>

        <!--Botones siguiente y anterior-->
        <div class="flex justify-between">
          <!-- Botón de Anterior -->
          <button 
            @click="$router.push('/estudiante/designacion-jurado')" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
            Anterior
          </button>
          <!-- Botón de Siguiente -->
          <!-- <button
            @click="handleNextButtonClick"
            :class="['px-4 py-2 text-white rounded-md', isNextButtonDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600',]">
            Siguiente
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
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-hecho {
  background-color: #48bb78;
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