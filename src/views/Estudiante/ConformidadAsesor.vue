<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { alertToast } from "@/functions";
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from "@/components/modalToolTip.vue";

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
  revision_id?: string | null;
}
interface Asesor {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
}

// Documentos es un array reactivo de tipo Documento usando reactive
const documentos = reactive<Documento[]>([
  {
    nombre: "Informe de Conformidad de Observaciones",
    estado: "pendiente",
    documentoUrl: "",
    revision_id: null,
  }
]);

function estadoClase(estado: string) {
  switch (estado) {
    case "aprobado":
      return "bg-[#48bb78] text-white";
    case "pendiente":
      return "bg-[#8898aa] text-white";
    case "observado":
      return "bg-[#e79e38] text-white";
    default:
      return "";
  }
}

const mostrarModalRevision = ref(false);
const mostrarModalObservaciones = ref(false);
const mostrarModalDocumentos = ref(false);

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad de Proyecto de Investigación por el Asesor";
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

//*********************************** INTEGRACIÓN CON EL BACKEND *************************************************** */
const asesor = ref<Asesor | null>(null);
const titulo = ref("");
const link = ref("");
const load = ref(false);
const estado = ref<string>("");
const cantidad = ref<number>();
const fecha = ref<string>("");
const revision_id = ref(null);
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const solicitudEstado2 = ref<string>("");
const solicitudMensaje = ref("");
const revision = ref<any[]>([]);
const isLoading = ref(false);

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

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
  router.push("/estudiante/designacion-jurado");
};

const isRevisionDisabled = computed(() => {
  const estado = solicitudEstado.value?.toLowerCase();
  console.log("Estado actual para deshabilitar botón:", estado);
  return ["pendiente", "aprobado", "observado"].includes(estado);
});

const mostrarAlerta = (mensaje: string) => {
  window.alert(mensaje);
};

const isNextButtonDisabled = computed(() => {
  const documentoPaso3 = documentos.find(
    (doc) => doc.nombre === "Informe de Conformidad de Observaciones"
  );
  return documentoPaso3?.estado !== "Hecho";
});


const primeraRevision = async () => {
  isLoading.value = true;
  try {
    const response = await axios.post(
      `/api/student/first-review/${authStore.id}`
    );
    console.log(response);
    if (response.data.status) {
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada, espere las indicaciones del asesor por favor", "Éxito", "success");
    }
  } catch (error: any) {
    console.log(error);
    alertToast(error.response.data.message || "Error al enviar la solicitud", "Error", "error");
  } finally {
    isLoading.value = false;
  }
};

const obtenerRevisiones = async () => {
  try {
    const response = await axios.get(`/api/student/get-review/${authStore.id}`);
    if (response.data.status) {
      console.log(response);
      solicitudEstado.value = response.data.revision.estado;
      console.log("Estado de la solicitud:", solicitudEstado.value);
    }
  } catch (error: any) {
    solicitudMensaje.value =
      error.response?.data.message || "Error desconocido";
  }
};

const obtenerRev = async () => {
  load.value = true;
  try {
    const response = await axios.get(`/api/student/get-review/${authStore.id}`);
    console.log("Datos recibidos de revisión:", response.data);

    if (response.data.status) {
      console.log("Estructura de los datos recibidos:", response.data);
      const revisionData = response.data.revision;

      cantidad.value = revisionData.cantidad;
      fecha.value = revisionData.fecha || "Desconocido";
      estado.value = revisionData.estado;
      revision_id.value = revisionData.revision_id;

      documentos[0].revision_id = revisionData.revision_id;

      if (revisionData.estado === "aprobado") {
        documentos[0].estado = "Hecho";
        documentos[0].documentoUrl =
          "https://titulacion-back.abimaelfv.site/api/view-cpa";
      } else {
        documentos[0].estado = "pendiente";
      }

      revision.value = [
        {
          cantidad: revisionData.cantidad,
          fecha: revisionData.fecha || "Desconocido",
          accion: "Solicitar Revisión",
          estado: revisionData.estado,
        },
      ];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      alert(
        `Error al actualizar la revisión: ${error.response?.data.message || "Error desconocido"
        }`
      );
    } else {
      alert("Ocurrió un error desconocido.");
    }
    console.error(error);
  } finally {
    load.value = false;
  }
};

const actualizarRevision = async (studentId: string) => {
  try {
    if (!studentId) {
      alert("No se pudo encontrar el ID del estudiante");
      return;
    }

    const response = await axios.put(
      `/api/student/review/${studentId}/status`,
      {
        rev_status: "pendiente",
      }
    );

    if (response.status === 200 || response.status === 201) {
      await obtenerRev();

      alertToast(
        "Se han enviado las observaciones corregidas.",
        "Éxito",
        "success"
      );
    } else {
      alert("Hubo un problema al actualizar la revisión.");
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      alert(
        `Error al actualizar la revisión: ${error.response?.data.message || "Error desconocido"
        }`
      );
    } else {
      alert("Ocurrió un error desconocido.");
    }
    console.error(error);
  }
};

const obtenerDatosEstudiante = async () => {
  try {
    const response = await axios.get(`/api/student/getInfo/${authStore.id}`);
    if (response.data.status) {
      const solicitud = response.data.solicitud;
      asesor.value = solicitud.asesor;
      titulo.value = solicitud.titulo;
      link.value = solicitud.link;
    }
  } catch (error) {
    console.error("Error al obtener los datos del estudiante:", error);
  }
};

onMounted(() => {
  obtenerRevisiones();
  obtenerRev();
  obtenerDatosEstudiante();
});
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
          </div>
          <p class="h-4 mt-6"></p>
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
          <div class="block space-y-5">
            <h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5">
            <h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>
      <br>
      <div class="mt-6 space-y-10">
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 mt-6 relative">
          <div class="grid grid-cols-1 gap-6">

            <!-- Información del Asesor -->
            <div class="grid grid-cols-1 gap-6">
              <div class="bg-gray-100 rounded-lg p-4 flex flex-col items-center shadow-lg">
                <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
                <p class="font-bold text-2xl text-azul">Asesor</p>
                <p class="text-gray-600 text-center">
                  {{ asesor?.nombre && asesor?.apellido_paterno && asesor?.apellido_materno
                    ? `${asesor.nombre} ${asesor.apellido_paterno} ${asesor.apellido_materno}`
                    : 'Asesor no asignado' }}
                </p>
              </div>
            </div>

            <!-- Título de Tesis -->
            <div class="flex-col bg-gray-100 rounded-lg p-6 shadow-lg">
              <p class="max-full text-xm text-gray-600 uppercase text-center">{{ titulo || 'Título no asignado' }}</p>
            </div>

            <!-- Enlace al Proyecto de Tesis -->
            <div v-if="link" class="text-center mt-6">
              <a :href="link" target="_blank"
                class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <i class="fas fa-external-link-alt"></i> Abrir proyecto
              </a>
            </div>
            <!-- Explicación breve -->
            <p class="text-sm text-gray-600 text-center">Sube la información de tu proyecto de investigación en el documento de
              Google Docs proporcionado y, cuando estés listo, haz clic en 'Solicitar Revisión' para iniciar el proceso.
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 mt-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Correcciones con tu asesor</h2>
            <ModalToolTip
              :infoModal="[{ info: 'Asegúrate de haber subido tu proyecto de investigación en el documento de google para que el asesor pueda revisar y realizar las correcciones.' },]" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-gray-500 text-base mt-2">
              Para comenzar con el proceso de observaciones en el proyecto de investigación, haz clic en <strong
                class="text-[#39B49E] font-medium">"Solicitar revisión"</strong>
            </p>
            <span :class="estadoClase(solicitudEstado2)" class="estado-estilo ml-4">{{ solicitudEstado2 }}</span>
          </div>

          <div class="flex justify-center mt-3">
            <button :disabled="isRevisionDisabled || isLoading"
              :class="[isRevisionDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
              class="px-4 py-2 w-52 text-white rounded-md text-lg" @click="primeraRevision">
              {{ isLoading ? 'Solicitando...' : 'Solicitar revisión' }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 mt-6 relative">
          <div class="flex items-center">
            <h4 class="text-2xl font-medium text-black">
              2. Revisión de observaciones
            </h4>
            <ModalToolTip
              :infoModal="[{ info: 'En esta sección se revisarán y corregirán las observaciones de tu proyecto de investigación con tu asesor, hasta que esté todo conforme.' },]" />
          </div>

          <div>
            <p class="text-gray-500 mt-2 mb-1 lg:text-sm 2xl:text-gray-500 2xl:text-base">Si tu asesor ha dejado observaciones, el estado de la revisión
            cambiará a
            <strong class="text-[#8898aa] text-md font-medium lg:text-sm 2xl:text-base">"Pendiente"</strong>. Realiza las correcciones
            directamente en el documento de Google Docs.
          </p>
          <p class="text-gray-500 lg:text-sm 2xl:text-gray-500 2xl:text-base">Una vez que hayas corregido, haz clic en
            <strong class="text-green-500 text-base font-medium lg:text-sm 2xl:text-base">“Observaciones corregidas”</strong> para que el asesor
            revise nuevamente. Si todo está en orden, el estado cambiará a <strong
              class="text-green-500 text-base font-medium lg:text-sm 2xl:text-base">"Aprobado"</strong>.
          </p>
          </div>
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

              <!-- Verificamos si hay datos en 'revision' -->
              <tbody v-if="revision.length > 0">
                <tr v-for="(obs, index) in revision" :key="obs.id"
                  class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">{{ obs.cantidad || 'Desconocido' }}</p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-40">{{ obs.fecha || 'Desconocido' }}</p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button :disabled="obs.estado === 'pendiente' || obs.estado === 'aprobado'" :class="[
                      'w-56 px-3 py-1 text-base text-white bg-base rounded-xl focus:outline-none',
                      obs.estado === 'pendiente' || obs.estado === 'aprobado'
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-base hover:bg-[#48bb78]',
                    ]" @click="
                      authStore.id
                        ? actualizarRevision(authStore.id)
                        : mostrarAlerta('ID no disponible')
                      ">
                      Observaciones corregidas
                    </button>
                  </td>
                  <td class="px-4 py-2">
                    <span
                      :class="`estado-estilo estado-${obs.estado ? obs.estado.toLowerCase().replace(' ', '-') : 'desconocido'}`">
                      {{ obs.estado ? obs.estado.charAt(0).toUpperCase() + obs.estado.slice(1).toLowerCase() :
                        'Desconocido' }}
                    </span>
                  </td>

                </tr>
              </tbody>

              <!-- Mostrar mensaje si no hay observaciones -->
              <tbody v-else>
                <tr>
                  <td colspan="4" class="px-4 py-4 text-center text-gray-600">
                    <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay observaciones disponibles por el
                    momento.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>



        </div>

        <!-- Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">3. Documento para verificar la conformidad del proyecto de
              investigación
              por el asesor</h2>

            <!--toolTip-->
            <ModalToolTip
              :infoModal="[{ info: 'Asegúrate de revisar el documento para verificar las observaciones antes de continuar.' },]" />
          </div>
          <!-- <span v-if="documentos.length > 0" 
              class="absolute right-0 top-0 mt-6 mr-6 text-gray-500 text-sm">
            <span :class="`estado-estilo estado-${documentos[documentos.length - 1].estado.toLowerCase().replace(' ', '-')}`">
              {{ documentos[documentos.length - 1].estado || "Estado desconocido" }}
            </span>
          </span> -->

          <div class="mt-4 space-y-4">
            <div v-for="(documento, index) in documentos" :key="documento.nombre"
              class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <span class="w-full md:w-auto mb-2 md:mb-0 text-xm bg-gray-50">Informe de conformidad de observaciones
                  por el asesor</span>
                <div
                  class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <div v-if="documento.estado === 'Hecho'"
                    class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    <!-- Botón de Ver -->
                    <a :href="`${VIEW_CPA}/${documento.revision_id}`" target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    <!-- Botón de Descargar -->
                    <a :href="`${DOWNLOAD_CPA}/${documento.revision_id}`" download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>
                  <span v-else class="text-gray-500 italic text-lg">El documento aún no se ha cargado</span>
                  <span
                    :class="`estado-estilo estado-${documentos[documentos.length - 1].estado.toLowerCase().replace(' ', '-')}`">
                    {{ documentos[documentos.length - 1].estado || "Estado desconocido" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--Botones siguiente y anterior-->
        <div class="flex justify-between">
          <!-- Botón de Anterior -->
          <button @click="$router.push('/estudiante/designacion-asesor')"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"> Anterior
          </button>
          <!-- Botón de Siguiente -->
          <button @click="handleNextButtonClick" :class="[
            'px-4 py-2 text-white rounded-md',
            isNextButtonDisabled
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

.break-all {
  word-break: break-all;
}

.modal-pos {
  right: 0;
  top: 100%;
}

@media (max-width: 640px) {
  .modal-pos {
    left: 50%;
    transform: translateX(-50%);
    top: 120%;
  }
}
</style>