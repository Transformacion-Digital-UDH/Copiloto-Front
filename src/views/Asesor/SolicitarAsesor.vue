<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";

// ***** Texto que escribe automáticamente ********
const text = "Pendientes de confirmar, rechazar o declinar";
const textoTipiado = ref('');
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 40);
  }
};
onMounted(() => {
  typeWriter(); // Llamamos la función al montar el componente
});

// Definir la interfaz de los datos de solicitud
interface Estudiante {
  nombre_completo: string;
}

interface Solicitud {
  _id: string;
  estudiante: Estudiante;
  titulo: string;
  estado: string;
}

// Estado de los modales y datos
const showModal = ref(false);  // Modal de aceptación
const showRejectModal = ref(false);  // Modal de rechazo
const nroCarta = ref("");  // Número de oficio para la carta
const motivoRechazo = ref(""); // Motivo de rechazo

const selectedFilter = ref("");  // Filtro por estado
const rowsPerPage = ref(5);  // Número de filas por página
const currentPage = ref(1);  // Página actual
const tableData = ref<Solicitud[]>([]);  // Datos obtenidos del backend (tipado)
const load = ref(false);  // Estado de carga
const authStore = useAuthStore();  // Accedemos al authStore para obtener el id del asesor
let solicitudSeleccionada = ref<string | null>(null);  // Almacena la solicitud seleccionada para los modales

// Función para abrir y cerrar modales
function openModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId;  // Guardar la solicitud seleccionada
  showModal.value = true;
}

function openRejectModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId;  // Guardar la solicitud seleccionada
  showRejectModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
  nroCarta.value = "";  // Limpiar el campo de número de carta
  motivoRechazo.value = "";  // Limpiar el campo de motivo de rechazo
}

// Función para obtener las solicitudes del backend
const fetchSolicitudes = async () => {
  load.value = true;

  try {
    if (!authStore.id) {
      throw new Error("El ID del asesor no está definido.");
    }

    const response = await axios.get(`/api/adviser/getSolicitude/${authStore.id}`);
    const solicitudes: Solicitud[] = response.data.data;
    tableData.value = solicitudes;

  } catch (error) {
    console.error('Error al cargar las solicitudes:', error);
  } finally {
    load.value = false;
  }
};

// Función para aceptar la solicitud
const acceptSolicitude = async () => {
  try {
    const solicitudId = solicitudSeleccionada.value;
    const params = {
      sol_status: 'aceptado',
      sol_num: nroCarta.value,
    };
    const response = await axios.patch(`/api/solicitudes/${solicitudId}/status`, params);

    if (response.data.status) {
      const solicitud = tableData.value.find((sol) => sol._id === solicitudId);
      if (solicitud) solicitud.estado = 'aceptado';
      closeModal();
    }
  } catch (error) {
    console.error('Error al aceptar la solicitud:', error);
  }
};

// Función para rechazar la solicitud
const rejectSolicitude = async () => {
  try {
    const solicitudId = solicitudSeleccionada.value;
    const params = {
      sol_status: 'rechazado',
      sol_observation: motivoRechazo.value,
    };

    const response = await axios.patch(`/api/solicitudes/${solicitudId}/status`, params);

    if (response.data.status) {
      const solicitud = tableData.value.find((sol) => sol._id === solicitudId);
      if (solicitud) solicitud.estado = 'rechazado';
      closeModal();
    }
  } catch (error) {
    console.error('Error al rechazar la solicitud:', error);
  }
};

// Filtrar datos y aplicar paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.estado.toLowerCase() === selectedFilter.value.toLowerCase()
    );
  }

  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.estado.toLowerCase() === selectedFilter.value.toLowerCase())
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

// Llama a la función cuando el componente se monta
onMounted(() => {
  fetchSolicitudes();
});

// Estado de los modales y documentos
const showDocumentModal = ref(false);  // Modal de documentos
const documents = ref([]);  // Documentos obtenidos del backend

function openDocumentModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId;
  showDocumentModal.value = true;
}

function closeDocumentModal() {
  showDocumentModal.value = false;
}
</script>

<template>
  <template v-if="load">
    <!-- Loading Screen -->
    <div class="flex h-screen bg-gray-100">
      <div class="flex-1 p-10 border-s-2 bg-gray-100">
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 class="bg-gray-200 h-12 w-[70%] rounded-lg duration-200 skeleton-loader"></h3>
        </div>
        <div class="mt-8">
          <div class="mt-4">
            <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
              <div class="w-full flex justify-end items-center space-x-2">
                <h3 class="bg-gray-200 h-12 w-[30%] rounded-lg duration-200 skeleton-loader"></h3>
              </div>
            </div>
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-5">
              <h3 class="bg-gray-200 h-[500px] w-[100%] rounded-lg duration-200 skeleton-loader"></h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
      <div class="flex-1 p-10 overflow-auto">
        <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado }}</h3>

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
                  <select
                    v-model="rowsPerPage"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <!-- Filtro de estado -->
                <div class="relative">
                  <select
                    v-model="selectedFilter"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
                  >
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
                <table class="min-w-full leading-normal sm:table md:table lg:table">
                  <thead class="custom-thead font-Quicksand border-b-5">
                    <tr class="text-center text-black  bg-baseClarito">
                      <th class="py-3 px-3 text-left tracking-wider">ESTUDIANTE</th>
                      <th class="py-3 px-3 text-left tracking-wider">TÍTULO</th>
                      <th class="py-3 px-4 tracking-wider">ACCIÓN</th>
                      <th class="py-3 px-3 tracking-wider">DOCUMENTOS</th>
                      <th class="py-3 px-4 tracking-wider">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(u, index) in filteredTableData"
                      :key="u._id"
                      class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 whitespace-nowrap w-64">{{ u.estudiante?.nombre_completo || 'Nombre desconocido' }}</p>
                      </td>
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-90">{{ u.titulo || 'Título no disponible' }}</p>
                      </td>
                      <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button class="w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none" @click="openModal(u._id)" v-if="u.estado === 'pendiente'">Aceptar</button>
                      <button class="w-24 px-4 py-1 text-sm text-white bg-[#5d6d7e] rounded-xl focus:outline-none" @click="openRejectModal(u._id)" v-if="u.estado === 'pendiente'">Rechazar</button>
                      <!-- <button class="w-24 px-4 py-1 text-sm text-white bg-[#5d6d7e] rounded-xl focus:outline-none" @click="openDeclineModal(u._id)" v-if="u.estado === 'aceptado'">Declinar</button> -->
                    </td>
                      <td class="px-3 py-5 text-center">
                        <button>
                        <svg @click="openDocumentModal(u._id)"  fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.288"></g><g id="SVGRepo_iconCarrier"> <g id="document-pdf"> <g> <path d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z"></path> </g> <g> <rect x="15" y="12" width="6" height="2"></rect> </g> <g> <rect x="15" y="12" width="2" height="8"></rect> </g> <g> <rect x="15" y="16" width="5" height="2"></rect> </g> <g> <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 "></polygon> </g> <g> <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon> </g> </g> </g></svg>
                      </button>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <span :class="`estado-estilo estado-${u.estado ? u.estado.toLowerCase().replace(' ', '-') : ''}`">{{ u.estado || 'Estado desconocido' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
                <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-base text-gray-800 bg-baseClarito hover:bg-base rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-base text-black bg-baseClarito hover:bg-base rounded-e-2xl">Siguiente</button>
                </div>
               </div>
              </div>
            </div>
          </div>

          <!-- Modal de confirmación -->
          <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
            <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
              <div class="flex justify-end items-start">
                <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                  <IconCerrar />
                </button>
              </div>
              <div class="flex items-start justify-between p-3 border-b border-gray-200">
                <h5 class="text-3xl font-ligth text-gray-900 text-center flex-1">Confirmación</h5>
              </div>
              <div class="p-6">
                <p class="text-gray-500 text-base text-left mb-2">Por favor escribe el N° de Oficio para la Carta de Aceptación</p>
                <input type="text" v-model="nroCarta" class="px-2 w-full rounded-md focus:border-gray-900 focus:ring-0">
                <br><br>
                <p class="text-base text-left mb-2"><i>Esta carta se autogenerará por el sistema</i></p>
              </div>
              <div class="flex items-center justify-end p-3 border-t border-gray-200">
                <button class="px-4 py-3 text-sl font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
                <button class="ml-5 px-4 py-3 text-sl font-Thin 100 text-white bg-base rounded-2xl" @click="acceptSolicitude">Generar</button>
              </div>
            </div>
          </div>

          <!-- Modal de rechazo -->
          <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
            <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
              <div class="flex justify-end items-start">
                <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                  <IconCerrar />
                </button>
              </div>
              <div class="flex items-start justify-between p-3 border-b border-gray-200">
                <h5 class="text-3xl font-ligth text-gray-900 text-center flex-1">Observación</h5>
              </div>
              <div class="p-6 bg-white rounded-lg">
                <p class="text-gray-600 text-base mb-4">Por favor escriba el motivo de su rechazo</p>
                <textarea class="text-gray-950 rounded-md w-full mt-3 border text-xm focus:border-gray-900 focus:ring-0" v-model="motivoRechazo" placeholder="Escriba aquí su observación..."></textarea>
              </div>
              <div class="flex items-center justify-end p-3 border-t border-gray-200">
                <button class="px-4 py-3 text-sl font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
                <button class="ml-4 px-4 py-3 text-sl font-Thin 100 text-white bg-base rounded-2xl hover:bg-base" @click="rejectSolicitude">Confirmar</button>
              </div>
            </div>
          </div>

          <!-- Modal de documentos -->
          <transition name="fade">
            <div
              v-if="showDocumentModal"
              class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 transition-opacity duration-300 ease-in-out"
            >
              <div
                class="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out scale-100"
                @click.stop
              >
                <!-- Botón cerrar con diseño flotante -->
                <div class="absolute top-0 right-0 p-2">
                  <button
                    class="text-gray-500 bg-gray-100 p-2 rounded-full shadow-lg hover:shadow-xl hover:text-red-500 hover:bg-red-100 transition-all duration-200"
                    @click="closeDocumentModal"
                  >
                    <IconCerrar />
                  </button>
                </div>

                <!-- Contenido del modal -->
                <div class="p-4">
                  <h5 class="text-2xl font-bold text-center text-gray-800 mb-4">Documentos Adjuntos</h5>
                  
                  <!-- Separador sutil debajo del título -->
                  <hr class="my-4 border-gray-200">

                  <!-- Enlace personalizado con efecto hover -->
                  <a
                    :href="`https://titulacion-back.abimaelfv.site/api/view-letter/${solicitudSeleccionada}`"
                    target="_blank"
                    class="block text-center text-lg text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
                  >
                    Ver carta de aceptación
                  </a>
                </div>

                <!-- Footer con botón de cerrar mejorado -->
                <div class="flex items-center justify-end p-4 mt-4 border-t border-gray-100">
                  <button
                    class="px-6 py-2 font-semibold text-white bg-gradient-to-r from-base to-green-500 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out"
                    @click="closeDocumentModal"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
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

.estado-aceptado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-rechazado {
  background-color: #DC2626;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.custom-thead th {
  font-weight: 800;
  font-size: 16px;
  text-transform: uppercase;
}

select {
  border-color: #39B49E; /* Color del borde por defecto */
  color: #39B49E; /* Color del texto */
}

select:focus {
  outline: none; /* Quitar borde azul del navegador */
  border-color: #39B49E; /* Borde al hacer foco */
}

/*modal documento*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Ajuste para eliminar el scroll mientras el modal está activo */
body {
  overflow: hidden;
}

</style>
