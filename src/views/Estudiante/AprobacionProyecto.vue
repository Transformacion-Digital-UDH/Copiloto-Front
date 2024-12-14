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
import EstadoBolita from "@/components/EstadoBolita.vue";

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter(
  "Aprobación del Proyecto de Investigación"
);
onMounted(typeWriter);

const estadoBolitaAprobacion = computed(() => {
  if ( isAprobacionDisabled.value) {
    return "hecho"; // Estado cuando el botón está deshabilitado
  } else if (isLoading.value) {
    return "pendiente"; // Estado cuando está cargando
  }
  return "pendiente"; // Valor por defecto
});

// Computed para manejar el estado de la bolita de los documentos
const estadoBolitaDocumentos = computed(() => {
  // Asegurarse de que 'obtener.value' no sea null
  if (!obtener.value) {
    return "pendiente"; // Valor por defecto si 'obtener' es null
  }

  const estados = [
    obtener.value.oficio_estado || "pendiente", // Usar '.value' para acceder al contenido del Ref
    obtener.value.resolucion_estado || "pendiente",
  ];

  // Si alguno de los estados es "observado", retornar "observado"
  if (estados.includes("observado")) {
    return "observado";
  }

  // Si alguno de los estados es "pendiente", retornar "pendiente"
  if (estados.includes("pendiente")) {
    return "pendiente";
  }

  // Si todos los estados son "aprobado", retornar "hecho"
  if (estados.every(estado => estado === "tramitado")) {
    return "hecho";
  }

  // Valor por defecto
  return "pendiente";
});


/*************************************** INTEGRACION CON EL BACKEND PARA APROBACION DE PROYECTO ************************************************ */
const load = ref(false);
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const isLoading = ref(false);
const obtener = ref<Estudiante | null>(null);
// const tituloActual = ref<string>("");
const mostrarModal = ref(false);

function abrirModal() {
  if (!obtener.value || !obtener.value.titulo) {
    alertToast('Cargando datos, por favor espera...', 'Advertencia', 'warning');
    obtenerDatosEstudiante().then(() => {
      if (obtener.value?.titulo) {
          mostrarModal.value = true;
      } else {
          alertToast('No se pudo cargar el título. Intenta nuevamente.', 'Error', 'error');
      }
    }).catch(() => {
        alertToast('Error al cargar los datos. Intenta nuevamente.', 'Error', 'error');
    });
    return;
  }
  mostrarModal.value = true;
}
function cerrarModal() {
  mostrarModal.value = false;
}

// se guarda el titulo que ha definido para el informe final
const guardarTitulo = async (tituloDefinitivo: string) => {
  try {
    console.log("Título guardado:", tituloDefinitivo);
    alertToast("El título ha sido guardado correctamente.", "Éxito", "success");
    if (obtener.value) {
      obtener.value.titulo = tituloDefinitivo;
    }

    cerrarModal();
  } catch (error) {
    alertToast("Error al guardar el título. Intente nuevamente.", "Error", "error");
  }
};

const VIEW_APROBACIONPAISI = import.meta.env.VITE_URL_VIEW_APAISI;
const DOWNLOAD_APROBACIONPAISI = import.meta.env.VITE_URL_DOWNLOAD_APAISI;
const VIEW_APROBACIONFACULTAD = import.meta.env.VITE_URL_VIEW_AFACULTAD;
const DOWNLOAD_APROBACIONFACULTAD = import.meta.env.VITE_URL_DOWNLOAD_AFACULTAD;

const bloquear = ['pendiente', 'observado', 'tramitado']
const isAprobacionDisabled = computed(() => {
  return (isLoading.value || (bloquear.includes(obtener.value?.oficio_estado ?? '') || bloquear.includes(obtener.value?.resolucion_estado ?? '')));
});

interface Estudiante {
  titulo: string;
  estudiante_id: string;
  oficio_id?: string;
  oficio_estado?: string;
  oficio_observacion?: string;
  resolucion_id?: string;
  resolucion_estado?: string;
  resolucion_observacion?: string;
}

const obtenerDatosEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id
  try {
    const response = await axios.get(`api/estudiante/get-info-aprobar-tesis/${student_id}`);
    //console.log("Mostrando", response.data);

    // mapeo de los datos para asegurar que cumplen con la interfaz Estudiante
    obtener.value = {
      titulo: response.data.titulo || '',
      estudiante_id: response.data.estudiante_id || student_id,
      oficio_id: response.data.oficio_id || '',
      oficio_estado: response.data.oficio_estado || '',
      oficio_observacion: response.data.oficio_observacion || '',
      resolucion_id: response.data.resolucion_id || '',
      resolucion_estado: response.data.resolucion_estado || 'no iniciado',
      resolucion_observacion: response.data.resolucion_observacion || '',
    };

  } catch (error: any) {
    console.error("Error al obtener datos", error.response?.data || error.message);
    if (error.response?.status === 400 && error.response.data?.titulo) {
        obtener.value = {
            titulo: error.response.data.titulo || '',
            estudiante_id: student_id || '',
            oficio_id: '',
            oficio_estado: '',
            resolucion_id: '',
            resolucion_estado: 'no iniciado',
        };
    } else {
        alertToast('Error al obtener datos del estudiante.', 'Error', 'error');
    }
} finally {
    load.value = false;
  }
};

const revocarPermisosProyecto = async () => {
  const student_id = authStore.id;
  try {
    const response = await axios.post('api/revoke-permissions', { estudiante_id: student_id });
    console.log("que me devuelves:", response.data)
  } catch (error: any) {
    console.error("No se pudo revocar los permisos", error.response?.data || error.message);
  }
}
// funcion de disparador para solicitar aprob proyecto
const solicitarAprobacionProyecto = async (tituloDefinitivo?: string) => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {

    // revocar todos los permisos proyecto
    await revocarPermisosProyecto();
    
    const response = await axios.post(`api/oficio/solicitud-aprobar-tesis/${student_id}`, {
      titulo: tituloDefinitivo || obtener.value?.titulo || "",
    });

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

onMounted(() =>{
  obtenerDatosEstudiante();
});

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
          <div class="relative flex items-center space-x-3">
            <EstadoBolita :estado="estadoBolitaAprobacion" />
            <h2 class="text-xl font-medium text-black">1. Solicitar aprobación de proyecto de investigación por la facultad</h2>
            <ModalToolTip
              :infoModal="[{ info: 'Este título ya no lo podrás cambiar posteriormente y se enviará tu solicitud al Programa Académico y a la Facultad.' },]" />
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en el botón
            <strong class="text-green-500 text-sm font-medium">"Solicitar aprobación"</strong> para enviar tu solicitud
            de cambio de título.
          </p>
          <!-- boton para solicitar aprobacion de proyecto de investigacion y si desea el cambio de titulo  -->
          <div class="flex justify-center mt-4">
            <modalCambioTitulo
              :mostrarModal="mostrarModal"
              :tituloActual="obtener?.titulo || 'Título no disponible'"
              @close="cerrarModal"
              @tituloGuardado="guardarTitulo"
              @solicitarAprobacionProyecto="solicitarAprobacionProyecto"
            />
            <ButtonRequest label="Solicitar aprobación" :loading="isLoading" @click="abrirModal" :disabled="isAprobacionDisabled" />
            
          </div>
        </div>
      </div>

      <!-- documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center space-x-3">
          <EstadoBolita :estado="estadoBolitaDocumentos" />
          <h2 class="text-xl font-medium text-black">2. Documentos para la aprobación de proyecto de investigación
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