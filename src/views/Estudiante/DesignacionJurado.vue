<script lang="ts" setup>
import { alertToast } from "@/functions";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import router from "@/router";
import Swal from "sweetalert2";
import ModalToolTip from "@/components/modalToolTip.vue";
import DocumentCard from "@/components/DocumentCard.vue";
import ButtonRequest from "@/components/ButtonRequest.vue";
import JuradoTabla from "@/components/JuradoTabla.vue";
import { useTypewriter } from "@/composables/useTypewriter";
import NavigationButton from "@/components/NavigationButton.vue";
import SkeletonDesignarJurados from "@/components/SkeletonDesignarJurados.vue";
import EstadoBolita from "@/components/EstadoBolita.vue";


// extrayendo funcionn del composable
const { textoTipiado, typeWriter } = useTypewriter(
  "Designación de Jurados para el Proyecto de Investigación"
);
onMounted(typeWriter);


// Función para solicitar cambio de jurado
const solicitarCambioJurado = (jurado: any) => {
  alert(`Has solicitado el cambio del jurado: ${jurado.nombre}`);
  // Aquí puedes agregar la lógica adicional para solicitar el cambio del jurado
};

const estadoBolitaJurados = computed(() => {
  if (isSolicitarDisabled.value) {
    return "hecho"; // Estado cuando el botón está deshabilitado
  } else if (isLoading.value) {
    return "pendiente"; // Estado cuando está cargando
  }
  return "pendiente"; // Valor por defecto
});

// Computed para determinar el estado de la bolita
const estadoBolitaJuradosCargados = computed(() => {
  return jurados.value.length > 0 ? "hecho" : "pendiente";
});

// Computed para manejar el estado de la bolita en esta sección (documento)
const estadoDocumentoJurado = computed(() => {
  const estadoDoc = obtener.value?.estado ?? '';

  // Si el estado es "aprobado", la bolita debe mostrar "aprobado"
  if (estadoDoc === "tramitado") {
    return "tramitado";
  }

  // Si el estado es "observado", la bolita debe mostrar "observado"
  if (estadoDoc === "observado") {
    return "observado";
  }

  // Por defecto, si no es aprobado ni observado, mostrar "pendiente"
  return "pendiente";
});


//************************************* INTEGRACION EL BACKEND PARA VER Y SOLICITAR JURADOS ********************************************* */
const authStore = useAuthStore();
const solicitudEstado = ref<string>("");
const isLoading = ref(false);
const load = ref(false);
const obtener = ref<Informacion | null>(null);
const jurados = ref<Jurado[]>([]);

const VIEW_OFFICEJURADO = import.meta.env.VITE_URL_VIEW_OFFICEJURADO;
const DOWNLOAD_OFFICEJURADO = import.meta.env.VITE_URL_DOWNLOAD_OFFICEJURADO;

// para que el boton quede deshabilitado
const bloquear = ["pendiente", "observado", "tramitado"];
const isSolicitarDisabled = computed(() => {
  return (isLoading.value || (bloquear.includes(obtener.value?.estado ?? "")));
});


interface Jurado {
  rol: string;
  nombre: string;
}

interface Informacion {
  estudiante_id: string;
  tramite?: string;
  estado: string;
  docof_id?: string;
  jurados: Jurado[];
  mensaje?: string;
}

// funcion para ver los jurados asignados
const obtenerDatosEstudiante = async () => {
  load.value = true;
  try {
    const response = await axios.get(`api/student/get-juries/${authStore.id}`);
    console.log("Respuesta de la API:", response.data);

    if (!response.data || !response.data.jurados || response.data.jurados.length === 0) {
      alertToast(
        "No se encontraron jurados designados. Verifica si ya solicitó sus jurados.",
        "Advertencia",
        "warning"
      );
    } else {
      // Asignar el estado y otros datos al objeto `obtener`
      obtener.value = response.data;
      jurados.value = response.data.jurados.map((jurado: { rol: string; asesor: string }) => ({
        rol: jurado.rol,
        nombre: jurado.asesor,
      }));
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      alertToast(
        "No se encontraron jurados designados. Verifica si ya solicitó sus jurados.",
        "Advertencia",
        "warning"
      );
    } else {
      alertToast(
        error.message || "Error inesperado al obtener los datos de los jurados.",
        "Error",
        "error"
      );
    }
  } finally {
    load.value = false;
  }
};

// funcion para solicitar que me asignen jurados
const solicitarJuradoProyecto = async () => {
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(
      `api/office/solicitude-juries/${student_id}`
    );

    if (response.data.estado) {
      solicitudEstado.value = "pendiente";
      alertToast(
        "Solicitud enviada. Espere las indicaciones para la designación de tus jurados",
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
 
onMounted(() => {
  obtenerDatosEstudiante();
  //console.log("Estado del documento:", obtener.value?.estado);
});


</script>
<template>
  <template v-if="load"><SkeletonDesignarJurados/></template>
  <template v-else>
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-full">
      <h3 class="text-4xl font-bold text-center text-azul">
        {{ textoTipiado }}
      </h3>
      <div class="mt-6 space-y-8">
        <!-- Card 1: Pago de Trámite
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Pago de Trámite</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalTramite = true"
                @mouseleave="mostrarModalTramite = false" />
          </div>

          <div v-show="mostrarModalTramite" class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">
              Asegurate de haber realizado el pago del trámite.
            </p>
          </div>

           Listado de trámites dinámico -->
        <!-- <div class="mt-4 space-y-6">
            <div v-for="(proceso, index) in procesos.slice(0, 1)" :key="index"
              class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
              <h4 class="text-black flex-1">{{ proceso.título }}</h4>
              <span :class="estadoClase(proceso.estado)" class="estado-estilo ml-4">{{ proceso.estado }}</span>
            </div>
          </div>
        </div> -->
        <!-- solicitar designacion de jurados PY -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center space-x-3">
            <EstadoBolita :estado="estadoBolitaJurados" />
            <h2 class="text-xl font-medium text-black">
              1. Solicitar designación de jurados
            </h2>
            <ModalToolTip
              :infoModal="[
                {
                  info: 'Tus jurados serán seleccionados por el coordinador y se mostrarán en la brevedad en el sistema.',
                },
              ]"
            />
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-sm">
            Haz clic en el botón
            <strong class="text-green-500 text-sm font-medium"
              >"Solicitar jurados"</strong
            >
            para la designación de jurados.
          </p>
          <!-- boton para solicitar designacion de jurados -->
          <div class="flex justify-center mt-4">
            <ButtonRequest
              label="Solicitar jurados"
              :loading="isLoading"
              :disabled="isSolicitarDisabled"
              @click="solicitarJuradoProyecto"
            />
          </div>
        </div>

        <!-- jurados designados por el decano -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center space-x-3">
            <EstadoBolita :estado="estadoBolitaJuradosCargados" />
            <h2 class="text-xl font-medium text-black">
              2. Los jurados designados para tu proyecto de investigación son:
            </h2>
          </div>
          <div class="overflow-x-auto mt-4 flex justify-center">
            <JuradoTabla :jurados="jurados" />
          </div>
        </div>

        <!-- se muestra oficio mutiple -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <EstadoBolita :estado="estadoDocumentoJurado" />
              <h2 class="text-xl font-medium text-black">
                3. Documento para la designación de jurados de proyecto de investigación

              </h2>
              <ModalToolTip
                :infoModal="[
                  {
                    info: 'Este es el documento oficial con los jurados designados. Asegúrate de revisarlo antes de continuar.',
                  },
                ]"
              />
            </div>
          </div>
          <!-- oficion multiple emitido por el programa academico -->
          <div class="mt-4 space-y-4">
            <DocumentCard
              titulo="OFICIO MULTIPLE DE DESIGNACION DE JURADOS PARA LA REV. DEL TRABAJO DE INV. (TESIS) - POR EL PROGRAMA ACADEMICO"
              :estado="obtener?.estado || ''"
              :id="obtener?.docof_id ?? ''"
              :view="VIEW_OFFICEJURADO"
              :download="DOWNLOAD_OFFICEJURADO"
            />
          </div>
        </div>

        <!--Botones siguiente y anteerior-->
        <NavigationButton
          prevRoute="/estudiante/conformidad-asesor"
          nextRoute="/estudiante/conformidad-jurado"
          :nextCondition="() => obtener?.estado === 'tramitado'"
        />

        <!-- Card 4: Solicitar cambio de jurado
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-gray-500"> Solicitar cambio de jurado</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalCambioJurado = true"
              @mouseleave="mostrarModalCambioJurado = false" />
          </div>

          <div v-show="mostrarModalCambioJurado" class="absolute left-56 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Puedes solicitar el cambio de uno o más jurados si consideras necesario.</p>
          </div>

          <div class="flex items-center justify-between mt-2">
            <p class="text-lg text-gray-800">Haz clic en el botón para solicitar un cambio de jurado.</p>
          </div>

          <div class="mt-4">
            <div class="flex justify-center mt-6">
              <button class="px-4 py-2 bg-base text-white rounded-md" @click="solicitarCambioJurado">
                SOLICITAR CAMBIO DE JURADO
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-medium text-gray-500">Selecciona los Jurados que deseas cambiar</h2>
            <span :class="`estado-${procesos[3].estado.toLowerCase().replace(' ', '-')}`" class="estado-estilo ml-4">{{ procesos[3].estado }}</span>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-left uppercase bg-gray-50 border border-gray-200 rounded-md shadow">
              <thead>
                <tr class="text-black border-b-2 bg-gray-300">
                  <th class="px-4 py-2 text-gray-600 border-b">ROL</th>
                  <th class="px-4 py-2 text-gray-600 border-b">NOMBRE Y APELLIDO</th>
                  <th class="px-4 py-2 text-gray-600 border-b">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="jurado in jurados" :key="jurado.id" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-4 py-2 border-b">{{ jurado.rol }}</td>
                  <td class="px-4 py-2 border-b">{{ jurado.asesor }}</td>
                  <td class="px-4 py-2 border-b">
                  <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm" @click="solicitarCambioJurado(jurado)">
                    Cambiar
                  </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> -->
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
}
.text-center {
  text-align: center;
  padding: 1rem;
}
</style>