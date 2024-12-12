<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import { alertToast } from "@/functions";
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import ButtonRequest from '@/components/ButtonRequest.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import { useTypewriter } from '@/composables/useTypewriter';
import NavigationButton from '@/components/NavigationButton.vue';
import modalCambioTitulo from '@/components/modalCambioTitulo.vue';

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter(
  "Aprobación del Proyecto de Investigación"
);
onMounted(typeWriter);

/*************************************** INTEGRACION CON EL BACKEND PARA APROBACION DE PROYECTO ************************************************ */
const load = ref(false);
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const isLoading = ref(false);
const obtener = ref<Estudiante | null>(null);
const tituloActual = ref<string>("");
const showModal = ref(false);

function abrirModal() {
  showModal.value = true;
}

function cerrarModal() {
  showModal.value = false;
}

const VIEW_APROBACIONPAISI = import.meta.env.VITE_URL_VIEW_APAISI;
const DOWNLOAD_APROBACIONPAISI = import.meta.env.VITE_URL_DOWNLOAD_APAISI;
const VIEW_APROBACIONFACULTAD = import.meta.env.VITE_URL_VIEW_AFACULTAD;
const DOWNLOAD_APROBACIONFACULTAD = import.meta.env.VITE_URL_DOWNLOAD_AFACULTAD;
const VITE_URL_OBTAINED_INFO = import.meta.env.VITE_URL_OBTAINED_INFO;
const VITE_URL_CHANGE_INFO = import.meta.env.VITE_URL_CHANGE_INFO;

const bloquear = ['pendiente', 'observado', 'tramitado']
const isAprobacionDisabled = computed(() => {
  return (isLoading.value || (bloquear.includes(obtener.value?.oficio_estado ?? '') || bloquear.includes(obtener.value?.resolucion_estado ?? '')));
});

interface Estudiante {
  estudiante_id: string;
  oficio_id: string;
  oficio_estado: string;
  oficio_observacion?: string;
  resolucion_id: string;
  resolucion_estado: string;
  resolucion_observacion?: string;
}

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`${VITE_URL_OBTAINED_INFO}/${student_id}`);
    obtener.value = response.data;
    tituloActual.value = response.data.titulo;
    // console.log("Datos recibidos: ", tituloActual.value);

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data?.mensaje || error.mensaje);
  } finally {
    load.value = false;
  }
};

// ACA GUARDAREMOS O MEJOR DICHO ACTUALIZAREMOS EL TITULO
const guardarNuevoTitulo = async (nuevoTitulo: string) => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.post(`${VITE_URL_CHANGE_INFO}/${student_id}`, {
      titulo: nuevoTitulo,
    });

    if (response.data.estado === "pendiente") {
      alertToast("Título actualizado correctamente.", "Éxito", "success");
      tituloActual.value = nuevoTitulo;
    }
  } catch (error: any) {
    console.error("Error al actualizar el título", error.response?.data?.mensaje || error.message);
    alertToast("No se pudo actualizar el título.", "Error", "error");
  } finally {
    load.value = false;
  }
};

function manejarCambioTitulo(nuevoTitulo: string) {
  tituloActual.value = nuevoTitulo;
  cerrarModal();
}

const solicitarAprobacionProyecto = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/oficio/solicitud-aprobar-tesis/${student_id}`);
    //console.log("Mostrando lo recibido: ",response);

    if (response.data.estado) {
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada. Espere las indicaciones para la aprobación del proyecto de tesis.", "Éxito", "success");
      await obtenerDatosEstudiante();
    }

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      const mensaje1 = error.response.data.mensaje;
      alertToast(mensaje1, "Advertencia", "warning");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  obtenerDatosEstudiante();
})

</script>
<template>
  <template v-if="load">
    <div class="flex-1 p-10 bg-gray-100 min-h-full">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md shadow-lg p-6 h-auto -mt-6 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-52 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5 mb-3">
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
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
      <div class="mt-6 space-y-10">

        <!-- solicitar aprobacion de proyecto de investigacion y cambio de titulo-->
        <div class="bg-white rounded-lg shadow-lg p-6 relative mb-9">
          <div class="relative flex items-center">
            <h2 class="text-xl font-medium text-black">1. Solicitar aprobación para el cambio de título</h2>
            <ModalToolTip :infoModal="[{ info: 'Este título ya no lo podrás cambiar posteriormente y se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en el botón
            <strong class="text-green-500 text-sm font-medium">"Solicitar aprobación"</strong> para enviar tu solicitud de cambio de título.
          </p>
          <!-- boton para solicitar aprobacion de proyecto de investigacion y si desea el cambio de titulo  -->
          <div class="flex justify-center mt-4">
            <ButtonRequest label="Solicitar aprobación" :loading="isLoading"
              @click="abrirModal" />
              <!-- :disabled="isAprobacionDisabled" -->
          </div>
        </div>
      </div>

      <!-- documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-xl font-medium text-black">2. Documentos que verifican la aprobacion del proyecto de tesis
          </h2>
        </div>
        <!-- oficio de programa academico-->
        <div class="mt-4 space-y-4">
          <DocumentCard titulo="OFICIO DE APROBACIÓN DEL TRABAJO DE INVESTIGACIÓN (TESIS)"
            :estado="obtener?.oficio_estado || ''" :id="obtener?.oficio_id ?? ''"
            :observacion="obtener?.oficio_observacion || 'Por favor, comunícate con secretaría del programa académico'"
            :view="VIEW_APROBACIONPAISI" :download="DOWNLOAD_APROBACIONPAISI || ''" />
        </div>

        <!-- resolución de Facultad -->
        <div class="mt-4 space-y-4">
          <DocumentCard titulo="RESOLUCION DE APROBACIÓN DEL TRABAJO DE INVESTIGACIÓN (TESIS)"
            :estado="obtener?.resolucion_estado || ''" :id="obtener?.resolucion_id ?? ''"
            :observacion="obtener?.resolucion_observacion || 'Por favor, comunícate con secretaría Facultad'"
            :view="VIEW_APROBACIONFACULTAD" :download="DOWNLOAD_APROBACIONFACULTAD || ''" />
        </div>
      </div>

      <!-- Botones siguiente y anteerior -->
      <NavigationButton prevRoute="/estudiante/conformidad-jurado" nextRoute="/estudiante/progreso"
        :nextCondition="() => obtener?.oficio_estado === 'tramitado' && obtener?.resolucion_estado === 'tramitado'" />
    </div>
    <modalCambioTitulo :showModal="showModal" :initialTitle="tituloActual" @close="cerrarModal"
      @tituloGuardado="manejarCambioTitulo" @solicitarAprobacionProyecto="solicitarAprobacionProyecto" />
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