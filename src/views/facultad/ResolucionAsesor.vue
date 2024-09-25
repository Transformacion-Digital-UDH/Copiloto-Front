<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconPdf from "@/components/icons/IconPdf.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";

// Estados y propiedades
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const showModal = ref(false);
const showRejectModal = ref(false);
const showSendModal = ref(false);
const nroOficio1 = ref('');
const isLoading = ref(false); // Indicador de carga

// Estado de la tabla que almacenará los datos de la API
const tableData = ref([]);

// Función para abrir y cerrar modales
function openSendModal() {
  showSendModal.value = true;
}

function openModal() {
  showModal.value = true;
}

function openRejectModal() {
  showRejectModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; // cerrar ambos modales
  showSendModal.value = false;
}

// Filtrado y paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.status === selectedFilter.value
    );
  }

  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.estado === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// Función para obtener los datos desde la API
const fetchOffices = async () => {
  isLoading.value = true; // Mostrar indicador de carga

  try {
    // Llamada a la API para obtener los datos
    const response = await axios.get('/faculty/getOffices');
    console.log(response.data);
    
    // Asignar los datos obtenidos al estado de la tabla
    tableData.value = response.data;

  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
  } finally {
    isLoading.value = false; // Ocultar indicador de carga
  }
};

// Cargar los datos cuando el componente se monta
onMounted(() => {
  fetchOffices();
});
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        Resolución de designación de asesor
      </h3>

      <!-- Mostrar indicador de carga si se están obteniendo datos -->
      <div v-if="isLoading" class="flex justify-center">
        <span>Cargando solicitudes...</span>
      </div>

      <!-- Tabla de datos -->
      <div v-else>
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
                  <option value="pendiente">Pendiente</option>
                  <option value="observado">Observado</option>
                  <option value="tramitado">Tramitado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla de datos -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-black border-b-2 bg-gray-300">
                    <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-2 px-3 text-left tracking-wider">ASESOR</th>
                    <th class="py-2 px-4 tracking-wider">OFICIO PAISI</th>
                    <th class="py-2 px-14 text-left tracking-wider">FECHA</th>
                    <th class="py-2 px-3 tracking-wider">VALIDAR TRÁMITE</th>
                    <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-3 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(u, index) in filteredTableData"
                    :key="u._id"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'"
                    class="border-b border-gray-200"
                  >
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.estudiante?.nombre_completo || 'Nombre desconocido' }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.asesor.nombre_completo || 'Asesor desconocido' }}
                      </p>
                    </td>
                    <td class="text-center px-4">
                      <button>
                        <IconPdf />
                      </button>
                    </td>
                    <td class="px-3 py-5 text-base text-center">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.fecha || 'Fecha no disponible' }}
                      </p>
                    </td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal"
                      >
                        Generar
                      </button>
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-black bg-gray-300 rounded-xl focus:outline-none"
                        @click="openRejectModal"
                      >
                        Observar
                      </button>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <button
                        class="w-24 px-4 py-1 text-sm text-white bg-azulbajo rounded-xl focus:outline-none"
                        @click="openSendModal"
                      >
                        Enviar
                      </button>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.estado.toLowerCase().replace(' ', '-')}`">
                        {{ u.estado || 'Estado desconocido' }}
                      </span>
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
                  <button
                    :disabled="currentPage === 1"
                    @click="goToPreviousPage"
                    class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-s-2xl"
                  >
                    Anterior
                  </button>
                  <button
                    :disabled="currentPage === totalPages"
                    @click="goToNextPage"
                    class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-e-2xl"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
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

.estado-tramitado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
</style>
