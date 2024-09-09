<script lang="ts" setup>
import { ref, computed } from "vue";

const activeDropdownIndex = ref<number | null>(null); // dropdown para generar y rechazar
const rowsPerPage = ref(5); // cantidad para mostrar en la tabla
const selectedFilter = ref(""); // para seleccionar el estado
const currentPage = ref(1); // página actual
const showModal = ref(false); // modal no necesita más correcciones
const showRejectModal = ref(false); // modal si falta más correcciones

function toggleDropdown(index: number) {
  activeDropdownIndex.value =
    activeDropdownIndex.value === index ? null : index;
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
}

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// simulación de datos
const tableData = ref([
  {
    name: "Estudiante 1",
    title: "Título 1",
    obs: "5",
    status: "Completado",
    statusColor: "estadoVerde",
  },
  {
    name: "Estudiante 2",
    title: "Título 2",
    obs: "15",
    status: "Pendiente",
    statusColor: "estadoPlomo",
  },
  {
    name: "Estudiante 3",
    title: "Título 3",
    obs: "25",
    status: "En proceso",
    statusColor: "yellow",
  },
]);

// para filtrar datos en base al filtro y paginación seleccionado
const filteredTableData = computed(() => {
  let filteredData = tableData.value;
  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.status === selectedFilter.value
    );
  }
  // paginar datos filtrados
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.status === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-medium text-center text-gray-800">
        Pendientes de confirmación
      </h3>
      <div class="mt-8">
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <!-- Filtro de cantidad de entradas -->
            <div class="flex">
              <div class="relative">
                <select
                  v-model="rowsPerPage"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-l appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none"
                >
                  
                </div>
              </div>
              <!-- Filtro de estado -->
              <div class="relative">
                <select
                  v-model="selectedFilter"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight font-Thin 100 text-gray-700 bg-white border-t border-b border-r border-gray-400 rounded-r appearance-none sm:rounded-r-none sm:border-r-0 focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500"
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none"
                >
                  
                </div>
              </div>
            </div>
            <!-- Búsqueda -->
            <div class="relative block mt-2 sm:mt-0">
              <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                <svg
                  viewBox="0 0 24 24"
                  class="w-4 h-4 text-gray-500 fill-current"
                >
                  <path
                    d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"
                  />
                </svg>
              </span>
              <input
                placeholder="Buscar"
                class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-gray-400 bg-white border border-b border-gray-400 rounded-l rounded-r appearance-none sm:rounded-l-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
              />
            </div>
          </div>
          <!-- Tabla de proyectos de tesis pendientes por confirmar -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div
              class="inline-block min-w-full overflow-hidden rounded-lg shadow"
            >
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      ESTUDIANTE
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      TÍTULO
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      OBSERVACIONES
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      N° REVISIÓN
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      ACCIÓN
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      ESTADO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, index) in filteredTableData" :key="index">
                    <td
                      class="px-5 py-5 text-sm bg-white border-b border-gray-200"
                    >
                      <p class="text-gray-900 whitespace-nowrap">
                        {{ u.name }}
                      </p>
                    </td>
                    <td
                      class="px-5 py-5 text-sm bg-white border-b border-gray-200"
                    >
                      <p class="text-gray-900 whitespace-nowrap">
                        {{ u.title }}
                      </p>
                    </td>
                    <td
                      class="px-5 py-5 text-sm bg-white border-b border-gray-200 relative"
                    >
                      <button
                        class="focus:outline-none"
                        @click="toggleDropdown(index)"
                      >
                        <label class="custum-file-upload" for="file">
                          <div class="icon">
                            <img
                              src="/img/subirarchivo.svg"
                              alt="Icono Subir archivo"
                            />
                          </div>
                          <div class="text">
                            <span>Haga clic para subir su archivo</span>
                          </div>
                          <input type="file" id="file" class="hidden" />
                        </label>
                      </button>
                    </td>
                    <td
                      class="px-10 py-5 text-sm bg-white border-b border-gray-200"
                    >
                      <p class="text-gray-900 whitespace-nowrap">{{ u.obs }}</p>
                    </td>
                    <td
                      class="px-5 py-5 text-sm bg-white border-b border-gray-200"
                    >
                      <div class="flex items-center space-x-2">
                        <button class="focus:outline-none" @click="openModal">
                          <img src="/img/confirmar.svg" alt="Icono Confirmar" />
                        </button>
                        <button
                          class="focus:outline-none"
                          @click="openRejectModal"
                        >
                          <img
                            src="/img/corregir.svg"
                            alt="Icono No confirmar"
                          />
                        </button>
                      </div>
                    </td>

                    <td
                      class="px-5 py-5 text-sm bg-white border-b border-gray-200"
                    >
                      <span
                        :class="`estado-estilo estado-${u.status
                          .toLowerCase()
                          .replace(' ', '-')}`"
                        >{{ u.status }}</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- paginacion -->
              <div
                class="flex flex-col items-center px-5 py-5 bg-white border-t xs:flex-row xs:justify-between"
              >
                <span class="text-xs text-gray-900 xs:text-sm"
                  >Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                  {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de
                  {{ tableData.length }}
                  entradas
                </span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-8">
                  <button
                    :disabled="currentPage === 1"
                    @click="goToPreviousPage"
                    class="button"
                  >
                    Anterior
                  </button>
                  <button
                    :disabled="currentPage === totalPages"
                    @click="goToNextPage"
                    class="button"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- modal no necesita más correcciones -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-lg font-light text-gray-900 text-center flex-1">
              Confirmación
            </h5>
            <button class="text-gray-900" @click="closeModal">
              <svg
                class="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <p class="text-gray-600">
              ¿Está seguro que este proyecto de tesis no necesita más
              correcciones?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm text-gray-700 bg-gray-300 rounded-2xl"
              @click="closeModal"
            >
              Sí
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm text-white bg-base hover:bg-base rounded-2xl"
              @click="closeModal"
            >
              No
            </button>
          </div>
        </div>
      </div>

      <!-- modal si falta más correcciones -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-lg font-light text-gray-900 text-center flex-1">
              Confirmación
            </h5>
            <button class="text-gray-900" @click="closeModal">
              <svg
                class="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <p class="text-gray-600">
              ¿Aún le falta correcciones a este proyecto de tesis?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm text-gray-700 bg-gray-300 rounded-2xl"
              @click="closeModal"
            >
              Sí
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm text-white bg-base hover:bg-base rounded-2xl"
              @click="closeModal"
            >
              No
            </button>
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

.estado-completado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-en-proceso {
  background-color: #e89519;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
</style>
