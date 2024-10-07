<!-- TableComponent.vue -->
<template>
    <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
      <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
        <table class="min-w-full leading-normal">
          <thead class="custom-thead font-Quicksand border-b-5">
            <tr class="text-center text-black bg-baseClarito">
              <!-- Iteramos sobre las cabeceras -->
              <th v-for="(header, index) in headers" :key="index" class="py-3 px-3 text-left tracking-wider">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Iteramos sobre los datos -->
            <tr v-for="(row, index) in paginatedData" :key="index" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
              <!-- Iteramos sobre cada columna de una fila -->
              <td v-for="(column, columnIndex) in columns" :key="columnIndex" class="px-3 py-5 text-base">
                <!-- Mostramos el valor de la columna correspondiente -->
                {{ row[column] || 'N/A' }}
              </td>
  
              <!-- Acciones personalizables -->
              <td v-if="actions.length > 0" class="px-3 py-5 flex flex-col items-center justify-center">
                <button v-for="action in actions" :key="action.label" class="action-btn" @click="action.handler(row)">
                  {{ action.label }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <!-- Paginación -->
        <div class="flex flex-col items-center px-5 py-4 border-t xs:flex-row xs:justify-between">
          <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al {{ Math.min(currentPage * rowsPerPage, totalData) }} de {{ totalData }}</span>
          <div class="inline-flex mt-2 xs:mt-0 space-x-4">
            <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-base text-gray-800 bg-baseClarito hover:bg-base rounded-s-2xl">Anterior</button>
            <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-base text-black bg-baseClarito hover:bg-base rounded-e-2xl">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { computed, ref } from "vue";
  
  // Props recibidos
  const props = defineProps({
    headers: { type: Array as () => string[], required: true }, // Cabeceras de la tabla
    columns: { type: Array as () => string[], required: true }, // Columnas de los datos
    data: { type: Array as () => any[], required: true },       // Datos de la tabla
    rowsPerPage: { type: Number, default: 5 },                  // Número de filas por página
    actions: { type: Array as () => { label: string, handler: (row: any) => void }[], default: () => [] } // Acciones personalizadas
  });
  
  // Paginación y datos filtrados
  const currentPage = ref(1);
  const paginatedData = computed(() => {
    const startIndex = (currentPage.value - 1) * props.rowsPerPage;
    return props.data.slice(startIndex, startIndex + props.rowsPerPage);
  });
  const totalData = computed(() => props.data.length);
  const totalPages = computed(() => Math.ceil(totalData.value / props.rowsPerPage));
  
  function goToPreviousPage() {
    if (currentPage.value > 1) currentPage.value--;
  }
  
  function goToNextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++;
  }
  </script>
  
  <style scoped>
  .custom-thead th {
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
  }
  
  .action-btn {
    margin-bottom: 10px;
    padding: 5px 10px;
    color: white;
    border-radius: 5px;
    background-color: #48bb78;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  
  .action-btn:hover {
    background-color: #3fa166;
  }
  
  .action-btn:last-child {
    background-color: #dd4e4e;
  }
  
  .action-btn:last-child:hover {
    background-color: #c44242;
  }
  
  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  button:not(:disabled):hover {
    transform: translateY(-2px);
    transition: all 0.2s ease-in-out;
  }
  </style>
  