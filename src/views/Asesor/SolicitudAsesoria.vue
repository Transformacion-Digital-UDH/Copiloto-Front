<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import { alertToast } from "@/functions";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

// Define una interfaz para los datos de la solicitud
interface Solicitud {
  id: string;
  estado: string;
  titulo: string;
  estudiante: {
    nombre_completo: string;
  };
}

// ***** Texto que escribe automáticamente ********
const text = "Solicitudes Pendientes de Asesoría";
const textoTipiado = ref("");
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};
onMounted(() => {
  typeWriter();
});

// Estado de los modales y datos
const showModal = ref(false); // Modal de aceptación
const showRejectModal = ref(false); // Modal de rechazo
const nroCarta = ref(""); // Número de oficio para la carta
const motivoRechazo = ref(""); // Motivo de rechazo
const isHovered = ref(false);
const selectedFilter = ref(""); // Filtro por estado
const rowsPerPage = ref(5); // Número de filas por página
const currentPage = ref(1); // Página actual
const tableData = ref<Solicitud[]>([]); // Datos obtenidos del backend, con el tipo especificado
const load = ref(false); // Estado de carga
const authStore = useAuthStore(); // Accedemos al authStore para obtener el id del asesor
let solicitudSeleccionada = ref<string | null>(null); // Almacena la solicitud seleccionada para los modales

//VARIABLES DE ENTORNO
const VIEW_LETTER = import.meta.env.VITE_URL_VIEW_LETTER;

// Función para abrir y cerrar modales
function openModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId; // Guardar la solicitud seleccionada
  showModal.value = true;
}

function openRejectModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId; // Guardar la solicitud seleccionada
  showRejectModal.value = true;
}

// Función para cerrar ambos modales
function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
  nroCarta.value = ""; // Limpiar el campo de número de carta
  motivoRechazo.value = ""; // Limpiar el campo de motivo de rechazo
}

// Función para obtener las solicitudes del backend
const fetchSolicitudes = async () => {
  load.value = true;

  try {
    if (!authStore.id) {
      throw new Error("El ID del asesor no está definido.");
    }

    const response = await axios.get(
      `/api/adviser/getSolicitude/${authStore.id}`
    );

    const solicitudes: Solicitud[] = response.data.data;
    tableData.value = solicitudes;
  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
  } finally {
    load.value = false;
  }
};

// Función para aceptar la solicitud
const acceptSolicitude = async () => {
  try {
    const solicitudId = solicitudSeleccionada.value;
    const params = {
      sol_status: "aceptado",
      sol_num: nroCarta.value,
    };
    const response = await axios.patch(
      `/api/solicitudes/${solicitudId}/status`,
      params
    );

    if (response.data.status) {
      const solicitud = tableData.value.find((sol) => sol.id === solicitudId);
      if (solicitud) solicitud.estado = "aceptado";
      closeModal();
      alertToast("La solicitud ha sido aceptada", "Éxito", "success");
    }
  } catch (error) {
    alertToast("Error al aceptar la solicitud", "Error", "error");
  }
};

// Función para rechazar la solicitud
const rejectSolicitude = async () => {
  try {
    const solicitudId = solicitudSeleccionada.value;
    const params = {
      sol_status: "rechazado",
      sol_observation: motivoRechazo.value,
    };

    const response = await axios.patch(
      `/api/solicitudes/${solicitudId}/status`,
      params
    );

    if (response.data.status) {
      const solicitud = tableData.value.find((sol) => sol.id === solicitudId);
      if (solicitud) solicitud.estado = "rechazado";
      closeModal();
      alertToast("La solicitud ha sido rechazada", "Éxito", "success");
    }
  } catch (error) {
    console.error("Error al rechazar la solicitud:", error);
  }
};

// Filtrar datos y aplicar paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.estado === selectedFilter.value.toLowerCase()
    );
  }

  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter(
        (data) => data.estado === selectedFilter.value.toLowerCase()
      )
    : tableData.value;

  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Navegación de paginación
function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

onMounted(() => {
  fetchSolicitudes();
});

// Estado de los modales y documentos
const showDocumentModal = ref(false); // Modal de documentos
const documents = ref([]); // Documentos obtenidos del backend

function openDocumentModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId;
  showDocumentModal.value = true;
}

function closeDocumentModal() {
  showDocumentModal.value = false;
}

const validateResolution = () => {
  nroCarta.value = nroCarta.value.replace(/[^0-9]/g, '');
  if (nroCarta.value.length > 3) {
    nroCarta.value = nroCarta.value.slice(0, 3);
  }
};
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        {{ textoTipiado }}
      </h3>

      <div class="mt-8">
        <!-- Filtros de tabla -->
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <div class="w-full flex justify-end items-center space-x-2">
              <!-- Búsqueda -->
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <IconBuscar />
                </span>
                <input
                  placeholder="Buscar"
                  class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300"
                 />
              </div>
              <div class="relative">
                <select v-model="rowsPerPage" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>

              <!-- Filtro de estado -->
              <div class="relative">
                <select v-model="selectedFilter" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla de solicitudes -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-azul border-b-2 bg-gray-300">
                    <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-2 px-3 text-left tracking-wider">TÍTULO</th>
                    <th class="py-2 px-4 tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-3 tracking-wider text-center">DOCUMENTOS</th>
                    <th class="py-2 px-4 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, index) in filteredTableData" :key="u.id" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                    <td class="px-3 py-5 text-base">
                      <p class="text-black whitespace-nowrap w-64">
                        {{ u.estudiante?.nombre_completo || "Nombre desconocido" }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-black text-wrap w-80 ">{{ u.titulo || "Título no disponible" }}</p>
                    </td>
                    <td class="px-3 py-5 text-center align-middle">
                      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px;">
                        <button
                          v-if="['pendiente', 'rechazado'].includes(u.estado)"
                          :class="[
                            'w-20 px-3 py-1 mb-2 text-sm text-white bg-[#48bb78] rounded-xl focus:outline-none transform active:translate-y-1 transition-transform duration-150',
                            ['rechazado'].includes(u.estado) ? 'cursor-not-allowed' : 'hover:bg-green-600'
                          ]"
                          :disabled="['rechazado'].includes(u.estado)"
                          @click="openModal(u.id)">Aceptar
                        </button>

                        <button
                          v-if="['pendiente', 'rechazado'].includes(u.estado)"
                          :class="[
                            'w-20 px-3 py-1 mb-2 text-sm text-white bg-[#dd4e4e] rounded-xl focus:outline-none transform active:translate-y-1 transition-transform duration-150',
                            ['rechazado'].includes(u.estado) ? 'cursor-not-allowed' : 'hover:bg-red-600'
                          ]"
                          :disabled="['rechazado'].includes(u.estado)"
                          @click="openRejectModal(u.id)">Rechazar
                        </button>

                        <button
                          v-if="['aceptado'].includes(u.estado)"
                          class="w-20 px-3 py-1 text-sm text-white bg-azul rounded-xl focus:outline-none hover:bg-slate-700 transform active:translate-y-1 transition-transform duration-150"
                          @click="openRejectModal(u.id)">Declinar
                        </button>
                      </div>
                    </td>

                    <!-- Ajuste en la columna DOCUMENTOS para centrar -->
                    <td class="px-3 py-5 text-center">
                      <div class="flex justify-center items-center">
                        <!-- Botón de Documentos -->
                        <button v-if="u.estado === 'aceptado'" @click="openDocumentModal(u.id)" class="focus:outline-none flex justify-center items-center space-x-1">
                          <IconEyeCerrar v-if="!isHovered" class="mr-1"/>
                          <IconEyeAbrir v-else class="mr-1"/>
                          <span class="text-[#34495e]">Documentos</span>
                        </button>
                        <!-- Mensaje alternativo cuando no está aceptado -->
                        <p v-else class="italic text-gray-400">No generado</p>
                      </div>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.estado?.toLowerCase().replace(' ', '-')}`">
                        {{ u.estado ? u.estado.charAt(0).toUpperCase() + u.estado.slice(1).toLowerCase() : "Estado desconocido" }}
                      </span>
                    </td>

                  </tr>
                </tbody>
              </table>
              <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal de confirmación -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-3 border-b border-gray-200">
              <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Confirmación</h5>
            </div>
            <div class="p-6">
              <p class="text-[#5d6d7e] text-lg text-left mb-2">Porfavor escriba el N° de Oficio para la Carta de Aceptación</p>
              <input
                type="text"
                id="nroCarta"
                v-model="nroCarta"
                class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0"
                maxlength="3"
                inputmode="numeric"
                @input="validateResolution"
                required>
                <p v-if="nroCarta.length !== 3 && nroCarta !== ''" class="text-red-800">Debe ingresar 3 dígitos</p>
                <p class="text-base text-left mb-2"><i>Esta carta se autogenerará por el sistema</i></p>
            </div>
            <div class="flex items-center justify-center p-1 border-gray-200">
              <button class="px-3 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
              <button class="ml-5 px-3 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl" :disabled="nroCarta.length !== 3" @click="acceptSolicitude">Generar</button>
            </div>
          </div>
        </div>

        <!-- Modal de rechazo -->
        <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-3 border-b border-gray-200">
              <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Observación</h5>
            </div>
            <div class="p-6 bg-white rounded-lg">
              <p class="text-gray-600 text-lg mb-4">Por favor escriba el motivo de su decisión</p>
              <textarea class="text-gray-950 rounded-md w-full mt-3 border text-xm focus:border-gray-900 focus:ring-0" v-model="motivoRechazo" placeholder="Escriba aquí su observación..."></textarea>
            </div>
            <div class="flex items-center justify-center p-3 border-gray-200">
              <button class="px-3 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
              <button class="ml-4 px-3 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl hover:bg-base" @click="rejectSolicitude">Confirmar</button>
            </div>
          </div>
        </div>

        <!-- Modal de documentos -->
        <div v-if="showDocumentModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeDocumentModal">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeDocumentModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-8 border-b border-gray-200">
              <h5 class="text-2xl font-medium text-gray-900 text-center flex-1">Documentos Adjuntos</h5>
            </div>
            <div class="p-6 bg-white rounded-lg">
              <div class="flex justify-between items-center">
                <p class="text-gray-600 text-lg">Carta de aceptación</p>
                <a
                  :href="`${VIEW_LETTER}/${solicitudSeleccionada}`"
                  target="_blank"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                  class="flex items-center">
                  <IconEyeCerrar v-if="!isHovered" class="mr-1"/>
                  <IconEyeAbrir v-else class="mr-1"/>
                  <span class="text-[#34495e]">Visualizar</span>
                </a>
              </div>
            </div>
            <div class="flex items-center justify-center p-6 border-t border-gray-200">
              <button class="px-3 py-2 text-xm font-thin text-white bg-[#5d6d7e] rounded-2xl" @click="closeDocumentModal">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
}

.estado-aceptado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-rechazado {
  background-color: #dc2626;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.custom-thead th {
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
}

</style>
