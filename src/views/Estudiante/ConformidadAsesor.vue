<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { alertToast } from "@/functions";
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from "@/components/modalToolTip.vue";
import CorrecionAsesorPY from "@/components/CorrecionAsesorPY.vue";
import DocumentCard from "@/components/DocumentCard.vue";
import ButtonRequest from "@/components/ButtonRequest.vue";
import NavigationButton from "@/components/NavigationButton.vue";
import SkeletonConformidadesAsesor from "@/components/SkeletonConformidadesAsesor.vue";
import InfoCardConformidad from "@/components/InfoCardConformidad.vue";
import { useTypewriter } from "@/composables/useTypewriter";

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter(
  "Conformidad de Proyecto de Investigación"
);
onMounted(typeWriter);

//*********************************** INTEGRACIÓN CON EL BACKEND *************************************************** */
const authStore = useAuthStore();
const solicitudEstado = ref("");
const load = ref(false);
const isLoading = ref(false);
const isLoading1 = ref(false);
const obtener = ref<RevisionResponse | null>(null);

const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const DOWNLOAD_CPA = import.meta.env.VITE_URL_DOWNLOAD_CPA;

// para que el botón quede deshabilitado
const bloquear = ["pendiente", "observado", "aprobado"];
const isRevisionDisabled = computed(() => {
  return (
    isLoading.value || bloquear.includes(obtener.value?.revision?.estado ?? "")
  );
});

interface Revision {
  estudiante_id: string;
  estado: string;
  cantidad: number;
  archivos: string;
  fecha: string;
}

interface HistoryRevision {
  rev_file: string;
  rev_count: number;
  updated_at: string;
  rev_status: string;
}

interface RevisionData {
  asesor: string;
  titulo: string;
  "link-tesis": string;
}

interface RevisionResponse {
  status: boolean;
  data: RevisionData;
  revision: Revision;
  historial: HistoryRevision[];
}

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/student/get-review/${student_id}`);
    //console.log("Mostrando lo recibido", response.data);
    obtener.value = response.data;
  } catch (error) {
    console.error("Error al obtener datos", error);
  } finally {
    load.value = false;
  }
};

// funcion de disparador para solicitar revision asesor
const solicitarRevisionAsesorProyecto = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.post(
      `/api/student/first-review/${student_id}`
    );

    if (response.data.status) {
      solicitudEstado.value = "pendiente";
      alertToast(
        "Su solicitud de revisión fue enviada con éxito a su asesor.",
        "Éxito",
        "success"
      );
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

const actualizarEstadoRevision = async () => {
  isLoading1.value = true;
  const student_id = authStore.id;
  try {
    const payload = { rev_status: "pendiente" };
    const response = await axios.put(
      `/api/student/review/${student_id}/status`,
      payload
    );

    if (response.data.message) {
      alertToast(
        "Las observaciones han sido corregidas y enviadas correctamente.",
        "Éxito",
        "success"
      );
      await obtenerDatosEstudiante();
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      const mensaje = error.response.data.message;
      alertToast(mensaje, "Advertencia", "warning");
    } else {
      alertToast(
        "Error al actualizar el estado de la revisión.",
        "Error",
        "error"
      );
    }
  } finally {
    isLoading1.value = false;
  }
};

onMounted(() => {
  obtenerDatosEstudiante();
});
</script>

<template>
  <template v-if="load"><SkeletonConformidadesAsesor /></template>
  <template v-else>
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <h3 class="text-4xl font-bold text-center text-azul">
        {{ textoTipiado }}
      </h3>
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

        <!-- Informacion de asesor y titulo con la tesis -->
        <InfoCardConformidad
          :data="{
            asesor: obtener?.data?.asesor || 'No asignado',
            titulo: obtener?.data?.titulo || 'Sin título',
            link: obtener?.data?.['link-tesis'] || '#',
          }"
        />

        <!-- solicitar correciones aL asesor PI -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-2xl font-medium text-black">
              1. Correcciones con tu asesor
            </h2>
            <ModalToolTip
              :infoModal="[
                {
                  info: 'Asegúrate de haber subido tu proyecto de investigación en el documento de google para que el asesor pueda revisar y realizar las correcciones.',
                },
              ]"
            />
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-lg">
            Haz clic en
            <strong class="text-green-500 text-lg font-medium"
              >"Solicitar revisión"</strong
            >
            para iniciar las observaciones del proyecto de investigación.
          </p>
          <div class="flex justify-center mt-2">
            <!-- boton para solicitar revision de asesor -->
            <ButtonRequest
              label="Solicitar revisión"
              :loading="isLoading"
              :disabled="isRevisionDisabled"
              @click="solicitarRevisionAsesorProyecto"
            />
          </div>
        </div>

        <!-- revision del asesor para PI -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h4 class="text-2xl font-medium text-black">
              2. Revisión de observaciones
            </h4>
            <ModalToolTip
              :infoModal="[
                {
                  info: 'En esta sección se revisarán y corregirán las observaciones de tu proyecto de investigación con tu asesor, hasta que esté todo conforme.',
                },
              ]"
            />
          </div>

          <p class="text-gray-500 mt-2 mb-1 text-lg">
            Si tu asesor deja observaciones, el estado será
            <strong class="text-[#8898aa] text-lg font-medium"
              >"Pendiente"</strong
            >. Corrige en Google Docs.
          </p>
          <p class="text-gray-500 text-lg">
            Luego, haz clic en
            <strong class="text-green-500 text-lg font-medium"
              >“Observaciones corregidas”</strong
            >. Si todo está bien, el estado cambiará a
            <strong class="text-green-500 text-lg font-medium"
              >"Aprobado"</strong
            >.
          </p>

          <!-- Tabla de observaciones -->
          <div class="overflow-x-auto mt-4">
            <CorrecionAsesorPY
              :revisiones="obtener?.revision ? [obtener.revision] : []"
              @actualizarEstado="actualizarEstadoRevision"
            />
          </div>
        </div>

        <!--  informe de conformidad de observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">3. Documento para verificar la conformidad del proyecto de
              tesis
              por el asesor</h2>

            <!--toolTip-->
            <ModalToolTip
              :infoModal="[{ info: 'Asegúrate de revisar el documento para verificar las observaciones antes de continuar.' },]" />
          </div>
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
                  <span v-else class="text-gray-500 italic">El documento aún no se ha cargado</span>
                  <span
                    :class="`estado-estilo estado-${documentos[documentos.length - 1].estado.toLowerCase().replace(' ', '-')}`">
                    {{ documentos[documentos.length - 1].estado || "Estado desconocido" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--Botones siguiente y anteerior-->
        <NavigationButton
          prevRoute="/estudiante/designacion-asesor"
          nextRoute="/estudiante/designacion-jurado"
          :nextCondition="() => obtener?.revision?.estado === 'aprobado'"
        />
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