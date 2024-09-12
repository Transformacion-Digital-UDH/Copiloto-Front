<script lang="ts" setup>
import { ref, computed } from "vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";

const showModal = ref(false); // para ver el modal de aprobado
const showRejectModal = ref(false); // para ver el modal de rechazado
const selectedFilter = ref(""); // para seleccionar el estado
const rowsPerPage = ref(5); // cantidad para mostrar en la tabla
const currentPage = ref(1); // pagina actual

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

// para filtrar datos segun el filtro y paginacion seleccionado
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.status === selectedFilter.value
    );
  }

  // Paginar los datos filtrados
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Total de páginas
const totalPages = computed(() => {
  // Filtra los datos si hay un filtro seleccionado
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.status === selectedFilter.value)
    : tableData.value;
  // Calcula el número total de páginas basadas en los datos filtrados y las filas por pagina
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Manejo de la página anterior y siguiente
function goToPreviousPage() {
  // decrementa la página actual si no es la última página
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  // Incrementa la página actual si no es la última página
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// simulacion de datos
const tableData = ref([
  {
    name: "Rodríguez Meléndez, Fabio",
    title: "Evaluación de la usabilidad de la plataforma de aprendizaje remota Google Classroom en la Universidad de Huánuco en el 2021",
    status: "Aceptado",
  },
  {
    name: "Sulca Correa, Omar Iván",
    title: "Metodología para la implementación del servicio de infraestructura en la nube para las revistas científicas de la UDH",
    status: "Rechazado",
  },
  {
    name: "Nuñez Vicente, José Antonio",
    title: "Implementación de una aplicación cliente servidor para la mejora de la Gestión de Ventas de la Empresa Comercial Gómez, Huánuco - 2021",
    status: "Pendiente",
  },
]);
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-medium text-center text-gray-800">
        Solicitud de asesoría
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

          <!-- Tabla -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div
              class="inline-block min-w-full overflow-hidden rounded-lg shadow"
            >
              <table class="min-w-full leading-normal">
                <thead>
                  <tr class="text-xs text-center text-black uppercase border-b-2 border-gray-300">
                    <th
                      class="py-2 px-3 text-left"
                    >
                      ESTUDIANTE
                    </th>
                    <th
                      class="py-2 px-3 text-left"
                    >
                      TÍTULO
                    </th>
                    <th
                      class="py-2 px-4"
                    >
                      ACCIÓN
                    </th>
                    <th
                      class="py-2 px-4"
                    >
                      ESTADO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(u, index) in filteredTableData" :key="index"
                    :class="index % 2 === 0 ? 'bg-grisTabla' : 'bg-white'"
                    class="border-b border-gray-200"
                  >
                    <td
                      class="px-3 py-5 text-base"
                    >
                      <p class="text-gray-900 whitespace-nowrap w-64">
                        {{ u.name }}
                      </p>
                    </td>
                    <td
                      class="px-3 py-5 text-base"
                    >
                      <p class="text-gray-900 text-wrap w-80">
                        {{ u.title }}
                      </p>
                    </td>
                    <td
                      class="px-3 py-5 flex flex-col items-center justify-center"
                    >
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
                    <td
                      class="px-3 py-5 text-center"
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
      <!-- Modal de confirmación -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
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
            <p class="text-gray-600 text-lg text-center">
              ¿Estás seguro de que quieres generar una Carta de Aceptacion?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm font-Thin 100 text-white bg-base rounded-2xl"
              @click="closeModal"
            >
              Aceptar
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
              <IconCerrar />
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
            <p class="text-gray-600 text-lg text-center">
              ¿Estás seguro de que quieres rechazar a ser el asesor de este estudiante?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm font-Thin 100 text-white bg-base rounded-2xl"
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
</style>
