<script lang="ts" setup>
import { ref, computed } from "vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconArchivo from "@/components/icons/IconArchivo.vue";
// Estados y propiedades
const showModal = ref(false);
const showRejectModal = ref(false);
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const showSendModal = ref(false); //modal para enviar las revisiones de todos los jurados
const showArchivoModal = ref(false);

function openModal() {
  showModal.value = true;
}

function openRejectModal() {
  showRejectModal.value = true;
}

function openSendModal(){
  showSendModal.value = true;
}

function openArchivoModal(){
  showArchivoModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
  showSendModal.value = false;
  showArchivoModal.value = false;
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

// Datos actuales
const tableData = ref([
  {
    name: "Rodríguez Meléndez, Fabio",
    title: "Evaluación de la usabilidad de la plataforma de aprendizaje remota Google Classroom en la Universidad de Huánuco en el 2021",
    reviewNumber: "10",
    president: "Presidente 1",
    secretary: "Secretario 1",
    vocal: "Vocal 1",
    status: "Corregido",
  },
  {
    name: "Sulca Correa, Omar Iván",
    title: "Metodología para la implementación del servicio de infraestructura en la nube para las revistas científicas de la UDH",
    reviewNumber: "20",
    president: "Presidente 2",
    secretary: "Secretario 2",
    vocal: "Vocal 2",
    status: "Terminado",
  },
  {
    name: "Nuñez Vicente, José Antonio",
    title: "Implementación de una aplicación cliente servidor para la mejora de la Gestión de Ventas de la Empresa Comercial Gómez, Huánuco - 2021",
    reviewNumber: "30",
    president: "Presidente 3",
    secretary: "Secretario 3",
    vocal: "Vocal 3",
    status: "Pendiente",
  },
]);
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        Pendientes de corrección de informe final
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
                  <option value="Corregido">Corregido</option>
                  <option value="Terminado">Terminado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-black border-b-2 bg-gray-300">
                    <th
                      class="py-2 px-3 text-left tracking-wider"
                    >
                      ESTUDIANTE
                    </th>
                    <th
                      class="py-2 px-3 text-left tracking-wider"
                    >
                      TÍTULO
                    </th>
                    <th
                      class="py-2 px-4 tracking-wider"
                    >
                      OBSERVACIONES
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider"
                    >
                      N° REVISIÓN
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider"
                    >
                      PRESIDENTE
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider"
                    >
                      SECRETARIO
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider"
                    >
                      VOCAL
                    </th>
                    <th
                      class="py-2 px-4 tracking-wider"
                    >
                      ACCIÓN
                    </th>
                    <th
                      class="py-2 px-4 tracking-wider"
                    >
                      ESTADO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(u, index) in filteredTableData"
                    :key="index"
                    :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'"
                    class="border-b border-gray-200"
                  >
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-64">{{ u.name }}</p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-80">
                        {{ u.title }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <button @click="openArchivoModal" class="text-white bg-azulbajo w-25 px-4 py-1 text-sm rounded-xl focus:outline-none">Subir archivo</button>
                    </td>
                    <td class="px-3 py-5 text-center">
                      {{ u.reviewNumber }}
                    </td>
                    <td class="px-3 py-5 text-center">
                      {{ u.president }}
                    </td>
                    <td class="px-3 py-5 text-center">
                      {{ u.secretary }}
                    </td>
                    <td class="px-3 py-5 text-center">
                      {{ u.vocal }}
                    </td>
                    <td
                      class="px-3 py-5 flex flex-col items-center justify-center"
                    >
                      <button 
                        class="w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal"
                      > Aprobar
                      </button>
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-black bg-gray-300 rounded-xl focus:outline-none"
                        @click="openRejectModal"
                        > Corregir
                      </button>
                      <button
                        class="w-24 px-4 py-1 text-sm text-white bg-azulbajo rounded-xl focus:outline-none"
                        @click="openSendModal"
                        > Enviar
                      </button>
                    </td>
                    <td class="px-3 py-5 text-center">
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

      <!-- Modal de aprobar tesis si no necesita mas correciones -->
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
              ¿Estás seguro que este informe final no necesita más correciones?
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

      <!-- Modal para corregir los proyectos de tesis -->
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
              ¿Aún le falta correciones a este informe final?
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
              class="ml-4 px-4 py-2 text-sm font-Thin 100 text-white bg-base rounded-2xl hover:bg-base"
              @click="closeModal"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

      <!-- modal enviar el proyecto corregido por todos los jurados -->
      <div
        v-if="showSendModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">            
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              ¿Está seguro que todo el informe final está corregido por los jurados?
            </h5>

          </div>
          <div class="p-6">
            <p class="text-gray-900 text-center text-lg mb-4">
              Por favor suba el Informe de Conformidad
            </p>
            <div class="text-center">
              <button class="focus:outline-none border rounded-3xl p-2 custum-file-upload mx-auto">
                <label class="custom-file-upload flex items-center space-x-2 cursor-pointer" for="file">
                  <div class="icon">
                    
                  </div>
                  <div class="text">
                    <span>Subir archivo</span>
                  </div>
                  <input type="file" id="file" class="hidden" />
                </label>
              </button>
            </div>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-sm text-white bg-[#5d6d7e] rounded-2xl"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm text-white bg-base rounded-xl"
              @click="closeModal"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para archivo de observaciones -->
      <div
        v-if="showArchivoModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button
              class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
              @click="closeModal"
            >
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Cargar archivo de observaciones
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-600 text-lg text-center mb-4">
              Por favor suba las observaciones
            </p>
            <button class="focus:outline-none border rounded-s-full p-2 custum-file-upload mx-auto">
              <label class="custom-file-upload flex items-center space-x-2 cursor-pointer" for="file">
                <div class="icon">
                  <IconArchivo />
                </div>
                <input type="file" id="file" class="hidden">
              </label>
            </button>
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
              Confirmar
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
  background-color: #5dade2;
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