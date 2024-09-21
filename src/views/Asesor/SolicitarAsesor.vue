<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from 'axios'; // Importar axios para hacer las peticiones HTTP
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";

// Definir un tipo para la estructura de las solicitudes
interface Solicitude {
  _id: string;
  name: string;
  title: string;
  status: string;
}

// Estado inicial y variables
const showModal = ref(false); // Modal para aceptar una solicitud
const showRejectModal = ref(false); // Modal para rechazar una solicitud
const selectedFilter = ref(""); // Filtro por estado de la solicitud
const rowsPerPage = ref(5); // Filas por página
const currentPage = ref(1); // Página actual
const nroCarta = ref(''); // Número de carta para aceptar la solicitud
const isLoading = ref(false); // Indicador de carga

// Inicializar tableData como un array del tipo definido Solicitude
const tableData = ref<Solicitude[]>([]); // Aquí se almacenarán las solicitudes desde la API

// Función para abrir el modal de aceptación
function openModal() {
  showModal.value = true;
}

// Función para abrir el modal de rechazo
function openRejectModal() {
  showRejectModal.value = true;
}

// Función para cerrar ambos modales
function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
}

// Filtrar y paginar datos
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    filteredData = filteredData.filter((data: Solicitude) => data.status === selectedFilter.value);
  }

  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data: Solicitude) => data.status === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Navegar entre páginas
function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// Función para obtener solicitudes desde la API
async function fetchSolicitudes() {
  try {
    isLoading.value = true; // Mostrar indicador de carga
    const response = await axios.get('/api/adviser/getSolicitude/12345', { // Ajusta el ID del asesor
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });
    tableData.value = response.data.solicitudes; // Asigna las solicitudes obtenidas
  } catch (error) {
    console.error("Error al obtener las solicitudes", error);
  } finally {
    isLoading.value = false; // Ocultar indicador de carga
  }
}

// Función para actualizar el estado de la solicitud (Aceptar o Rechazar)
async function updateStatus(solicitudeId: string, status: string) {
  try {
    await axios.put(`/api/solicitudes/${solicitudeId}/status`, { sol_status: status }, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });
    fetchSolicitudes(); // Recargar las solicitudes después de actualizar el estado
  } catch (error) {
    console.error(`Error al actualizar el estado a ${status}`, error);
  }
}

// Montar el componente y cargar las solicitudes
onMounted(() => {
  fetchSolicitudes(); // Cargar solicitudes al montar el componente
});

</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        Solicitud de asesor
      </h3>

      <div class="mt-8">
        <!-- Filtros de tabla -->
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <!-- Filtro de cantidad de entradas -->
            <div class="w-full flex justify-end items-center space-x-2">
              <!-- Búsqueda -->
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <IconBuscar />
                </span>
                <input
                  placeholder="Buscar"
                  class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg appearance-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                />
              </div>
              <div class="relative">
                <select
                  v-model="rowsPerPage"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
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
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight font-Thin 100 text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-nonefocus:bg-white focus:border-gray-500"
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
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-black border-b-2 bg-gray-300">
                    <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-2 px-3 text-left tracking-wider">TÍTULO</th>
                    <th class="py-2 px-4 tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-4 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(u, index) in filteredTableData" :key="index"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'"
                    class="border-b border-gray-200"
                  >
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 whitespace-nowrap w-64">{{ u.name }}</p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-80">{{ u.title }}</p>
                    </td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal"
                      > Aceptar
                      </button>
                      <button 
                        class="w-24 px-4 py-1 text-sm text-white bg-[#5d6d7e] rounded-xl focus:outline-none"
                        @click="openRejectModal"
                      > Rechazar
                      </button>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.status.toLowerCase().replace(' ', '-')}`">{{ u.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-900 xs:text-sm">
                  Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                  {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de
                  {{ tableData.length }}
                </span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-s-2xl">
                    Anterior
                  </button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-e-2xl">
                    Siguiente
                  </button>
                </div>
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
            <p class="text-gray-500 text-base text-left mb-2">Porfavor escribe el N° de Oficio para la Carta de Aceptación</p>
            <input type="text" id="nroCarta" v-model="nroCarta" class="px-2 w-full rounded-md focus:border-gray-900 focus:ring-0">
            <p class="text-base text-left mb-2"><i>Esta carta se autogenerará por el sistema</i></p>
          </div>
          <div class="flex items-center justify-end p-3 border-t border-gray-200">
            <button class="px-4 py-3 text-sl font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
            <button class="ml-5 px-4 py-3 text-sl font-Thin 100 text-white bg-base rounded-2xl" @click="closeModal">Generar</button>
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
            <textarea class="text-gray-950 rounded-md w-full mt-3 border text-xm focus:border-gray-900 focus:ring-0" name="observarTesis" id="observarTesis" placeholder="Escriba aquí su observación..."></textarea>
          </div>
          <div class="flex items-center justify-end p-3 border-t border-gray-200">
            <button class="px-4 py-3 text-sl font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
            <button class="ml-4 px-4 py-3 text-sl font-Thin 100 text-white bg-base rounded-2xl hover:bg-base" @click="closeModal">Confirmar</button>
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
  background-color: #DC2626;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.custom-thead th {
  font-weight: 700; /* Grosor delgado */
  font-size: 16px;  /* Tamaño de la fuente */
  text-transform: uppercase; /* Todo el texto en mayúsculas */
}
</style>
