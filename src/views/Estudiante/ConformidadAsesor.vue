<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { alertToast } from "@/functions";
import router from "@/router";
import Swal from "sweetalert2";

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
  },
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
const text = "Conformidad de Proyecto de Tesis por el Asesor";
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
        `Error al actualizar la revisión: ${
          error.response?.data.message || "Error desconocido"
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
        `Error al actualizar la revisión: ${
          error.response?.data.message || "Error desconocido"
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
      <div
        class="flex justify-center items-center content-center px-14 flex-col">
        <h3
          class="bg-gray-200 h-11 w-4/5 rounded-lg duration-200 skeleton-loader"
        ></h3>
      </div>
      <div class="mt-6 space-y-10">
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-28 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-1/6 rounded-md skeleton-loader duration-200"
            ></h2>
            <div class="flex justify-between items-center">
              <h2
                class="bg-gray-200 h-6 w-96 rounded-md skeleton-loader duration-200"
              ></h2>
            </div>
            <div class="h-7">
              <h2
                class="bg-gray-200 h-10 w-40 mx-auto rounded-md skeleton-loader duration-200"
              ></h2>
            </div>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"
            ></h2>
            <h2
              class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"
            ></h2>
            <h2
              class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="block space-y-5">
            <h2
              class="px-4 py-2 h-11 w-24 rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl font-bold text-center text-azul">
        {{ textoTipiado2 }}
      </h3>

      <div class="mt-6 space-y-10 ">
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4">
          <!-- Información del Asesor -->
          <p v-if="asesor">
            <strong >ASESOR:</strong> {{ asesor.nombre }} {{ asesor.apellido_paterno }} {{ asesor.apellido_materno }}
          </p>
          
          <!-- Título de Tesis -->
          <p v-if="titulo" class="max-w-7xl">
            <strong>TÍTULO DE TESIS:</strong> {{ titulo }}
          </p>
          
          <!-- Enlace al Proyecto de Tesis -->
          <p v-if="link">
            <strong>PROYECTO DE TESIS: </strong>
            <a
              :href="`${link}`"
              target="_blank"
              class="inline-block bg-azul text-white px-3 py-2 rounded-lg hover:bg-azulOscuro transition text-base"
              > Abrir link de Google Docs</a>
          </p>

          <!-- Explicación breve -->
          <p class="text-sm text-gray-600">
            Suba su información del proyecto de tesis en el documento de Google Docs proporcionado y luego haga clic en "Solicitar Revisión".
          </p>
        </div>


        <!-- Observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Observaciones</h2>
            <img
              src="/icon/info2.svg"
              alt="Info"
              class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalRevision = true"
              @mouseleave="mostrarModalRevision = false"
            />
          </div>
          <div
            v-show="mostrarModalRevision"
            class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10"
          >
            <p class="text-sm text-gray-600">
              Asegúrate de haber subido tu proyecto de tesis en el documento de google para que el asesor pueda revisar y realizar las correcciones.
            </p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-gray-500 text-lg">
              Haz click en <strong class="text-[#39B49E]">Solicitar Revision</strong> para iniciar con el proceso de correcciones.
            </p>
            <span
              :class="estadoClase(solicitudEstado2)"
              class="estado-estilo ml-4"
              >{{ solicitudEstado2 }}</span
            >
          </div>
          <div class="flex justify-center mt-3">
            <button
              :disabled="isRevisionDisabled"
              :class="
                isRevisionDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-base'
              "
              class="px-4 py-2 text-white rounded-lg text-lg"
              @click="primeraRevision"
            >
              Solicitar revisión
            </button>
          </div>
          <div v-if="solicitudMensaje">{{ solicitudMensaje }}</div>
        </div>

        <!-- Revisión de levantamiento de observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h4 class="text-2xl font-medium text-black">
              2. Revisión de Observaciones
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
                class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10 modal-pos"
              >
                <p class="text-sm text-gray-600">
                  En esta sección se revisarán y corregirán las observaciones de tu proyecto de tesis con tu asesor, hasta que esté todo conforme.
                </p>
              </div>
            </div>
            
          </div>
          <p class="text-gray-500 mt-2 mb-1">
            Si tu asesor dejó observaciones, el estado será <strong class="text-gray-400">pendiente</strong>. Corrige las observaciones en el documento de Google Docs.
          </p>
          <p class="text-gray-500">
            Después de corregir, haz clic en <strong class="text-[#39B49E]">“Observaciones corregidas”</strong> para que el asesor revise nuevamente. Si todo está bien, el estado cambiará a <strong class="text-green-500">aprobado</strong>.
          </p>
          <!-- Tabla de observaciones -->
          <div class="overflow-x-auto mt-4">
            <table
              class="min-w-full bg-white border border-gray-200 rounded-md shadow"
            >
              <thead class="min-w-full leading-normal">
                <tr class="text-center text-black border-b-2 bg-gray-300">
                  <th class="px-4 py-2 text-left tracking-wider">
                    N° REVISIÓN
                  </th>
                  <th class="px-4 py-2 text-left tracking-wider">FECHA</th>
                  <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                  <th class="px-4 py-2 tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(obs, index) in revision"
                  :key="obs.id"
                  class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300"
                >
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">
                      {{ obs.cantidad || "Desconocido" }}
                    </p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-40">
                      {{ obs.fecha || "Desconocido" }}
                    </p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button
                      :disabled="
                        obs.estado === 'pendiente' || obs.estado === 'aprobado'
                      "
                      :class="[
                        'w-56 px-3 py-1 text-base text-white bg-base rounded-xl focus:outline-none',
                        obs.estado === 'pendiente' || obs.estado === 'aprobado'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-base hover:bg-[#48bb78]',
                      ]"
                      @click="
                        authStore.id
                          ? actualizarRevision(authStore.id)
                          : mostrarAlerta('ID no disponible')
                      "
                    >
                      Observaciones corregidas
                    </button>
                  </td>
                  <td class="px-4 py-2">
                    <span
                      :class="`estado-estilo estado-${obs.estado
                        .toLowerCase()
                        .replace(' ', '-')}`"
                      >{{ obs.estado || "Desconocido" }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">3. Documentos</h2>
            <img
              src="/icon/info2.svg"
              alt="Info"
              class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalDocumentos = true"
              @mouseleave="mostrarModalDocumentos = false"
            />
          </div>
          <div
            v-if="mostrarModalDocumentos"
            class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10"
          >
            <p class="text-sm text-gray-600">
              Asegúrate de revisar el documento para verificar las observaciones
              antes de continuar.
            </p>
          </div>
          <div class="mt-4 space-y-4">
            <div
              v-for="(documento, index) in documentos"
              :key="documento.nombre"
              class="bg-gray-50 p-4 border border-gray-200 rounded-md"
            >
              <div
                class="flex flex-col md:flex-row justify-between md:items-center"
              >
                <span class="w-full md:w-auto mb-2 md:mb-0 text-lg"
                  >Informe de Conformidad de Observaciones</span
                >
                <div
                  class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4"
                >
                  <div
                    v-if="documento.estado === 'Hecho'"
                    class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2"
                  >
                    <!-- Botón de Ver -->
                    <a
                      :href="`${VIEW_CPA}/${documento.revision_id}`"
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    <!-- Botón de Descargar -->
                    <a
                      :href="`${DOWNLOAD_CPA}/${documento.revision_id}`"
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>
                  <span
                    v-else-if="documento.estado === 'pendiente'"
                    class="text-gray-500 italic"
                    >El documento aún no se ha cargado</span
                  >
                  <span
                    :class="`estado-estilo estado-${documento.estado
                      .toLowerCase()
                      .replace(' ', '-')}`"
                    >{{ documento.estado || "Estado desconocido" }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--Botones siguiente y anteerior-->
        <div class="flex justify-between">
            <!-- Botón de Anterior -->
            <button
              @click="$router.push('/estudiante/designacion-asesor')" 
              class="px-4 py-2 bg-gray-300 text-white rounded-md hover:bg-gray-400"
            >
              Anterior
            </button>

            <!-- Botón de Siguiente -->
            <button
              @click="handleNextButtonClick"
              :class="[ 
                'px-4 py-2 text-white rounded-md',
                isNextButtonDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600',
              ]"
            >
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
