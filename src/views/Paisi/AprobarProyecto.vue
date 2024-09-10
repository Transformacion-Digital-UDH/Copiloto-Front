<script lang="ts" setup>
import { ref, computed } from "vue";

// Estados y propiedades
const activeDropdownIndex = ref<number | null>(null);
const showModal = ref(false);
const showRejectModal = ref(false);
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);

// Funciones para manejar dropdown y modales
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
  showRejectModal.value = false;
}

// Datos actuales
const tableData = ref([
  {
    name: "Estudiante 1",
    status: "Pendiente",
  },
  {
    name: "Estudiante 2",
    status: "Aprobado",
  },
  {
    name: "Estudiante 3",
    status: "Aprobado",
  },
]);

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
    ? tableData.value.filter((data) => data.status === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-medium text-center text-gray-800">
        Aprobacion de proyecto de tesis
      </h3>

      <div class="mt-8">
        <!-- Filtros de tabla -->
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
                ></div>
              </div>

              <!-- Filtro de estado -->
              <div class="relative">
                <select
                  v-model="selectedFilter"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight font-Thin 100 text-gray-700 bg-white border-t border-b border-r border-gray-400 rounded-r appearance-none sm:rounded-r-none sm:border-r-0 focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500"
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Terminado">Terminado</option>
                  <option value="Corregido">Corregido</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none"
                ></div>
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
                placeholder="Search"
                class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-gray-400 bg-white border border-b border-gray-400 rounded-l rounded-r appearance-none sm:rounded-l-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <!-- Tabla -->
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
                      CONFORMIDAD ASESOR
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      CONFORMIDAD JURADO
                    </th>
                    <th
                      class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200"
                    >
                      VALIDAR TRÁMITE 
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
                  <tr
                    v-for="(u, index) in filteredTableData"
                    :key="index"
                    class="bg-white border-b border-gray-200"
                  >
                    <td class="px-5 py-5 text-sm">
                      {{ u.name }}
                    </td>
                    <td class="px-5 py-5 text-sm">
                      <img src="/img/pdf.svg" alt="Icono pdf">
                    </td>
                    <td class="px-5 py-5 text-sm">
                      <img src="/img/pdf.svg" alt="Icono pdf">
                    </td>
                    <td class="px-5 py-5 text-sm">
                      <button
                        class="block w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal"
                        > Generar
                      </button>
                      <button
                        class="block w-24 px-4 py-1 text-sm text-black bg-gray-300 rounded-xl focus:outline-none"
                        @click="openRejectModal"
                        > Observar
                      </button>
                    </td>
                    <td class="px-5 py-5 text-sm">
                    </td>
                    <td class="px-5 py-5 text-sm">
                      <span
                        :class="`estado-estilo estado-${u.status
                          .toLowerCase()
                          .replace(' ', '-')}`"
                      >
                        {{ u.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginación -->
              <div
                class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between"
              >
                <span class="text-sm text-gray-900 xs:text-sm"
                  >Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                  {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de
                  {{ tableData.length }}</span
                >
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

      <!-- Modal para generar un oficio al estudiante -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <img src="/img/cerrar.svg" alt="Icono cerrar">
            </button>
          </div>
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Se autogenerará el oficio para este estudiante
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-600 text-lg text-center">
              Por favor escriba el número de oficio que va a autogenerar
            </p>
            <input type="text" placeholder="Nro de oficio">
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm font-Thin 100 text-white bg-base rounded-2xl"
              @click="closeModal"
            >
              Generar
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm font-Thin 100 text-black bg-gray-300 rounded-2xl"
              @click="closeModal"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de rechazo -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <img src="/img/cerrar.svg" alt="Icono cerrar">
            </button>
          </div>
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Confirmación
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-600">
              ¿Aún le falta correciones a este proyecto de tesis?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm font-Thin 100 text-gray-700 bg-gray-300 rounded-2xl"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              class="ml-2 px-4 py-2 text-sm font-Thin 100 text-white bg-base rounded-2xl hover:bg-base"
              @click="closeModal"
            >
              Aceptar
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

.estado-terminado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-corregido {
  background-color: #3B82F6;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.estadoVerde {
  color: #38a169;
}

.estadoRojo {
  color: #e53e3e;
}

.estadoPlomo {
  color: #d6d6d6;
}
</style>
