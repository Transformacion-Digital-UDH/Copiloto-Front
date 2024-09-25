<script lang="ts" setup>
import { ref, computed } from "vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";

const rowsPerPage = ref(5); // cantidad para mostrar en la tabla
const selectedFilter = ref(""); // para seleccionar el estado
const currentPage = ref(1); // página actual

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

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

// simulación de datos
const tableData = ref([
  {  
    name: "Rodríguez Meléndez, Fabio",
    title: "Evaluación de la usabilidad de la plataforma de aprendizaje remota Google Classroom en la Universidad de Huánuco en el 2021",
    attended: "10",
    status: "Pendiente",
  },
  {
    name: "Sulca Correa, Omar Iván",
    title: "Metodología para la implementación del servicio de infraestructura en la nube para las revistas científicas de la UDH",
    attended: "20",
    status: "Atendido",
  },
  {
    name: "Nuñez Vicente, José Antonio",
    title: "Implementación de una aplicación cliente servidor para la mejora de la Gestión de Ventas de la Empresa Comercial Gómez, Huánuco - 2021",
    attended: "30",
    status: "Pendiente",
  },
]);
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">Primer Filtro</h3>
      <div class="mt-8">
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <!-- Filtro de cantidad de entradas -->
            <div class="w-full flex justify-end items-center space-x-2">
              <!-- Búsqueda -->
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <IconBuscar />
                </span>
                <input placeholder="Buscar" class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg appearance-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"/>
              </div>
              <div class="relative">
                <select v-model="rowsPerPage" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-gray-500">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <!-- Filtro de estado -->
              <div class="relative">
                <select v-model="selectedFilter" class="block w-full h-full px-4 py-2 pr-8 leading-tight font-Thin 100 text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-nonefocus:bg-white focus:border-gray-500">
                  <option value="">Todos</option>
                  <option value="Atendido">Atendido</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla de proyectos de tesis pendientes por confirmar -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-black border-b-2 bg-gray-300">
                    <th class="py-2 px-3 text-left tracking-wider"> ESTUDIANTE </th>
                    <th class="py-2 px-3 text-left tracking-wider"> TÍTULO </th>
                    <th class="py-2 px-3 tracking-wider"> N° ATENDIDO </th>
                    <th class="py-2 px-4 tracking-wider"> ACCIÓN </th>
                    <th class="py-2 px-4 tracking-wider"> ESTADO </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, index) in filteredTableData" :key="index" :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'" class="border-b border-gray-200">
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 whitespace-nowrap w-64">{{ u.name }}</p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-80">{{ u.title }}</p>
                    </td>
                    <td class="px-3 py-5 text-center">{{ u.attended }}</td>
                    <td class="px-3 py-5 text-center">
                      <button class="w-24 px-4 py-1 text-sm text-white bg-base rounded-xl focus:outline-none">
                        Atender
                      </button>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.status .toLowerCase() .replace(' ', '-')}`">{{ u.status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- paginacion -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-900 xs:text-sm"
                  >Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                  {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de
                  {{ tableData.length }}
                </span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button
                    :disabled="currentPage === 1"
                    @click="goToPreviousPage"
                    class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-s-2xl">
                    Anterior
                  </button>
                  <button
                    :disabled="currentPage === totalPages"
                    @click="goToNextPage"
                    class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-e-2xl">
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

.estado-atendido {
  background-color: #48bb78;
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