<script lang="ts" setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { alertToast } from '@/functions';
import Swal from 'sweetalert2';
import router from '@/router';
import ModalToolTip from '@/components/modalToolTip.vue';
import DocumentCard from '@/components/DocumentCard.vue';
import ButtonRequest from '@/components/ButtonRequest.vue';
import CorrecionAsesor from '@/components/CorrecionAsesor.vue';
import NavigationButton from '@/components/NavigationButton.vue';
import SkeletonConformidadesAsesor from '@/components/SkeletonConformidadesAsesor.vue';
import InfoCardConformidad from '@/components/InfoCardConformidad.vue';
import { useTypewriter } from '@/composables/useTypewriter';
import EstadoBolita from "@/components/EstadoBolita.vue";

// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter("Conformidad de Informe Final por Asesor");
onMounted(typeWriter);

const estadoBolitaRevision = computed(() => {
  if ( isSolicitarDisabled.value) {
    return "hecho"; // Estado cuando el botón está deshabilitado
  } else if (isLoading.value) {
    return "pendiente"; // Estado cuando está cargando
  }
  return "pendiente"; // Valor por defecto
});

// Computed para manejar el estado de la bolita en la revisión de observaciones
// Computed para manejar el estado de la bolita en la revisión de observaciones
const estadoBolitaObservaciones = computed(() => {
  const estadoRevision = obtener.value?.revision?.rev_estado ?? "pendiente";

  if (estadoRevision === "observado") {
    return "observado";
  }
  if (estadoRevision === "aprobado") {
    return "hecho";
  }
  return "pendiente"; // Valor por defecto
});

// Computed para manejar el estado de la bolita
const estadoBolitaDocumento = computed(() => {
  const estadoDocumento = obtener.value?.revision?.rev_estado ?? "pendiente";

  // Manejar los posibles estados
  if (estadoDocumento === "aprobado") {
    return "hecho";
  }
  if (estadoDocumento === "observado") {
    return "observado";
  }
  return "pendiente"; // Valor por defecto
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
  <template v-if="load"><SkeletonConformidadesAsesor /></template>
  <template v-else>
  <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
    <h3 class="text-4xl font-bold text-center text-azul">{{ textoTipiado }}</h3>
    <div class="mt-6 space-y-8">
      <div class=" bg-white rounded-lg shadow-lg p-6  space-y-2 relative">
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
          asesor: obtener?.asesor,
          titulo: obtener?.titulo,
          link: obtener?.['link-informe']}"/>
         </div> 

      <!-- solicitar correcion al asesor IF -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center space-x-3">
          <EstadoBolita :estado="estadoBolitaRevision" />
          <h2 class="text-xl font-medium text-black">1. Solicitar revisión a tu asesor</h2>
          <ModalToolTip :infoModal="[{ info: 'Asegúrate de haber subido tu informe final en el documento de google para que el asesor pueda revisar y realizar las correcciones.' },]" />
        </div>
        <p class="text-gray-500 mt-2 mb-1 text-sm">Haz clic en  
          <strong class="text-green-500 text-sm font-medium">"Solicitar revisión"</strong> para iniciar las observaciones del informe final. 
        </p>
        <div class="flex justify-center mt-4">
          <!-- boton para solicitar revision de asesor -->
          <ButtonRequest 
              label="Solicitar revisión" 
              :loading="isLoading" 
              :disabled="isSolicitarDisabled" 
              @click="solicitarRevisionAsesorInforme" />
        </div>
      </div>

      <!-- revision del asesor para IF -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="relative flex items-center space-x-3">
          <EstadoBolita :estado="estadoBolitaObservaciones" />
          <h4 class="text-xl font-medium text-black">2. Revisión de observaciones</h4>
          <ModalToolTip :infoModal="[{ info: 'En esta sección se revisarán y corregirán las observaciones de tu informe final con tu asesor, hasta que esté todo conforme.' },]" />            
        </div>
        <p class="text-gray-500 mt-2 mb-1 text-sm">
            Si tu asesor deja observaciones el estado será
            <strong class="text-gray-500 text-xm font-medium">"Pendiente"</strong>. Corrige las observaciones en el documento de Google Docs. Luego, haz click en <br>
            <strong class="text-green-500 text-xm font-medium">“Observaciones corregidas”</strong> para que el asesor pueda ver tus correcciones. Si todo está bien, el estado cambiará a
            <strong class="text-green-500 text-xm font-medium">"Aprobado"</strong>.
          </p>
        <!-- Tabla de observaciones -->
        <div class="overflow-x-auto mt-4">
          <p class="text-lg py-2 text-azul text-center font-bold"> <i class="fas fa-edit"></i> Revisiones realizadas por tu asesor designado</p>
          <CorrecionAsesor 
            :revisiones="obtener?.revision ? [obtener.revision] : []"
            @actualizarEstado="actualizarEstadoRevision"/>
        </div>
      </div>

      <!-- informe de conformidad de observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center space-x-3">
            <EstadoBolita :estado="estadoBolitaDocumento" />
            <h2 class="text-xl font-medium text-black">3. Documento de conformidad del asesor para el informe final del proyecto de investigación </h2>
            <ModalToolTip :infoModal="[{ info: 'Asegúrate de revisar el documento para verificar las observaciones antes de continuar.' },]" />
          </div>            
       
        <div class="mt-4 space-y-4">
          <DocumentCard 
            titulo="ACTA DE CONFORMIDAD DEL INFORME FINAL - POR EL ASESOR"
            :estado="['aprobado'].includes(obtener?.revision?.rev_estado ?? '') ? obtener?.revision?.rev_estado ?? '' : ''"
            :id="obtener?.revision?.rev_id ?? ''"
            :view="VIEW_CPA"
            :download="DOWNLOAD_CPA"/>
        </div>
      </div>

      <!--Botones siguiente y anteerior-->
      <NavigationButton 
        prevRoute="/estudiante/progreso"
        nextRoute="/estudiante/designacion-informe-jurado"
        :nextCondition="() => obtener?.revision?.rev_estado === 'aprobado'"/>

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
</style>