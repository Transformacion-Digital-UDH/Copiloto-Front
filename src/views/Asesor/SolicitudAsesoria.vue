<template>
  <div>
    <h3 class="text-4xl font-medium text-gray-700 text-center my-4">Solicitud de Asesoría</h3>
    <br>

    <!-- Barra de acciones y búsqueda -->
    <div class="flex items-center justify-between flex-row flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
      <!-- Filtro por estado -->
      <div class="relative">
        <button id="dropdownActionButton" @click="toggleFilterDropdown" class="inline-flex items-center text-gray-500 bg-transparent border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5" type="button">
          <span class="sr-only">Action button</span>
          Filtrar Estado
          <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <!-- Dropdown menu para filtrar estados -->
        <div v-if="filterDropdownOpen" id="dropdownAction" class="absolute z-10 mt-2 w-44 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul class="py-1 text-sm text-gray-700">
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-100" @click="filterByStatus('Todos')">Todos</a></li>
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-100" @click="filterByStatus('Aceptado')">Aceptado</a></li>
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-100" @click="filterByStatus('Pendiente')">Pendiente</a></li>
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-100" @click="filterByStatus('Completado')">Completado</a></li>
          </ul>
        </div>
      </div>

      <!-- Campo de búsqueda -->
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input type="text" id="table-search-users" class="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar">
      </div>

      <!-- Filtro de filas por página -->
      <div>
        <select v-model="rowsPerPage" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>

    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <!-- Tabla -->
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-200 dark:text-gray-400">
          <tr>
            <th scope="col" class="p-4">N°</th>
            <th scope="col" class="px-6 py-3">Estudiante</th>
            <th scope="col" class="px-6 py-3">Título</th>
            <th scope="col" class="px-6 py-3">Acción</th>
            <th scope="col" class="px-6 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedTableData" :key="index" class="bg-white border-b dark:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 relative">
            <td class="p-4">{{ index + 1 }}</td>
            <th scope="row" class="px-6 py-4 text-base">{{ item.name }}</th>
            <td class="px-6 py-4">{{ item.role }}</td>
            <td class="px-6 py-4 relative">
              <button @click="toggleDropdown(index)" class="focus:outline-none">
                <svg class="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                </svg>
              </button>
              <div v-if="activeDropdownIndex === index" class="absolute right-0 z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                <div class="py-1">
                  <a href="#" class="block px-4 py-2 text-sm text-green-600 hover:bg-green-100" @click="openModal">Aceptar</a>
                  <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-100" @click="openRejectModal">Rechazar</a>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="`estado-${item.status.toLowerCase()}`">{{ item.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="flex justify-between items-center p-4">
        <span class="text-sm text-gray-400 dark:text-gray-400">Mostrando {{ paginatedTableData.length }} de {{ filteredTableData.length }} entradas</span>
        <div>
          <button @click="goToPreviousPage" class="px-3 py-2 bg-white rounded-l-md text-gray-600 hover:bg-base">Anterior</button>
          <button @click="goToNextPage" class="px-3 py-2 bg-gray-200 rounded-r-md text-gray-600 hover:bg-base">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Modales de confirmación y rechazo -->
    <!-- Modal de confirmación -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-4">
        <h2 class="text-lg font-semibold">Confirmación</h2>
        <br>
        <p>¿Estás seguro de que deseas aceptar la solicitud?</p>
        <br>
        <div class="flex justify-end mt-4">
          <button class="px-4 py-2 bg-gray-300 rounded-md text-gray-700 mr-2" @click="closeModal">Cancelar</button>
          <button class="px-4 py-2 bg-base text-white rounded-md" @click="closeModal">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de rechazo -->
    <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-4">
        <h2 class="text-lg font-semibold">Confirmación</h2>
        <br>
        <p>¿Estás seguro de que deseas rechazar la solicitud?</p>
        <br>
        <div class="flex justify-end mt-4">
          <button class="px-4 py-2 bg-gray-300 rounded-md text-gray-700 mr-2" @click="closeModal">Cancelar</button>
          <button class="px-4 py-2 bg-red-500 text-white rounded-md" @click="closeModal">Rechazar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Datos simulados
const tableData = ref([
  { name: 'Laurent Michael', role: 'Implementacion de una plataforma de comercio electrónicoooooooooooooooo', status: 'Aceptado' },
  { name: 'Freduario Hill', role: 'Implementación de sistema de gestión', status: 'Pendiente' },
  { name: 'Daniel Thomas', role: 'Desarrollo de app de inventarios', status: 'Pendiente' },
  { name: 'Mark Wilson', role: 'Implementación de pagos en línea', status: 'Completado' },
  { name: 'Laurent Michael', role: 'Implementacion de una plataforma de comercio electrónico', status: 'Aceptado' },
  { name: 'Freduario Hill', role: 'Implementación de sistema de gestión', status: 'Pendiente' },
  { name: 'Daniel Thomas', role: 'Desarrollo de app de inventarios', status: 'Pendiente' },
  { name: 'Mark Wilson', role: 'Implementación de pagos en línea', status: 'Completado' },
]);

// Estados del filtro
const filterDropdownOpen = ref(false);
const selectedStatus = ref('Todos');

// Filas por página
const rowsPerPage = ref(5);
const currentPage = ref(1);

// Modales
const showModal = ref(false);
const showRejectModal = ref(false);
const activeDropdownIndex = ref(null);

// Función para alternar el dropdown
function toggleDropdown(index) {
  activeDropdownIndex.value = activeDropdownIndex.value === index ? null : index;
}

// Función para abrir y cerrar el filtro de estado
function toggleFilterDropdown() {
  filterDropdownOpen.value = !filterDropdownOpen.value;
}

// Función para aplicar filtro por estado
function filterByStatus(status) {
  selectedStatus.value = status;
  filterDropdownOpen.value = false; // Cerrar dropdown después de seleccionar
}

// Computed para filtrar la tabla según el estado seleccionado
const filteredTableData = computed(() => {
  if (selectedStatus.value === 'Todos') {
    return tableData.value;
  }
  return tableData.value.filter(item => item.status === selectedStatus.value);
});

// Computed para paginación
const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredTableData.value.slice(start, end);
});

// Manejo de la página anterior
function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Manejo de la página siguiente
function goToNextPage() {
  if (currentPage.value * rowsPerPage.value < filteredTableData.value.length) {
    currentPage.value++;
  }
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
</script>

<style scoped>
.estado-aceptado {
  background-color: #48bb78;
  color: #ffffff;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.estado-completado {
  background-color: #48bb78;
  color: #ffffff;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}
</style>
