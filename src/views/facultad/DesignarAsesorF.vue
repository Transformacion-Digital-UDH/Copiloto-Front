<script lang="ts" setup>
import { ref, computed } from "vue";
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

function openSendModal (){
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
  showRejectModal.value = false; //cerrar ambos modales
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
    advisor: "Renzo Paolo, Luciano Estela",
    status: "Pendiente",
    date: "31-02-2024",
  },
  {
    name: "Sulca Correa, Omar Iván",
    advisor: "Juan Manual, Vicente Rojas",
    status: "Observado",
    date: "15-08-2023",
  },
  {
    name: "Nuñez Vicente, José Antonio",
    advisor: "Enrique Carlos, Murga Cespedes",
    status: "Tramitado",
    date: "19-10-2022",
  },
]);
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-medium text-center text-gray-800">
        Designación de asesor (FACULTAD)
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
                  <option value="Observado">Observado</option>
                  <option value="Tramitado">Tramitado</option>
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
                  <tr
                    class="text-xs text-center text-black uppercase border-b-2 border-gray-300"
                  >
                    <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-2 px-3 text-left tracking-wider">ASESOR</th>
                    <th class="py-2 px-4 tracking-wider">OFICIO PAISI</th>
                    <th class="py-2 px-14 text-left tracking-wider">FECHA</th>
                    <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-3 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(u, index) in filteredTableData"
                    :key="index"
                    :class="index % 2 === 0 ? 'bg-grisTabla' : 'bg-white'"
                    class="border-b border-gray-200"
                  >
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.name }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.advisor }}
                      </p>
                    </td>
                    <td class="text-center px-4">
                      <button>
                        <IconPdf />
                      </button>
                    </td>
                    <td class="px-3 py-5 text-base text-center">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.date }}
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
                      <button
                        class="w-24 px-4 py-1 text-sm text-white bg-azulbajo rounded-xl focus:outline-none"
                        @click="openSendModal"
                      >
                        Enviar
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

      <!-- Modal para generar un oficio al estudiante -->
      <div
        v-if="showModal"
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
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Se autogenerará la resolucion de asesor para este estudiante
            </h5>
          </div>
          <div class="p-6">
            <p class="text-black text-lg text-left mb-2">
              Por favor escriba el número de expediente correspondiente
            </p>
            <input type="text" id="nroOficio1" v-model="nroOficio1" class="w-full px-10 py-1 rounded-xl bg-gray-100 focus:border-gray-900 focus:ring-0">
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
              Generar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de observacion -->
      <div
        v-if="showRejectModal"
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
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Observación
            </h5>
          </div>
          <div class="p-6 bg-white rounded-lg">
            <p class="text-gray-600 text-lg text-center mb-4">
              Por favor escriba el motivo de su observación
            </p>
            <textarea class="text-gray-950 bg-gray-100 rounded-lg w-full mt-3 border text-lg focus:border-gray-900 focus:ring-0" name="observarTesis" id="observarTesis" placeholder="Escriba aquí..."></textarea>
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
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- modal para enviar tramite a la facultad -->
      <div v-if="showSendModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">            
          <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"     @click="closeModal">
                <IconCerrar />
              </button>
          </div>
          <div
              class="flex items-start justify-between p-3 border-b border-gray-200">
              <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Confirmación
              </h5>
          </div>
          <div class="p-6">
              <p class="text-gray-900 text-center text-lg mb-4">
              ¿Desea enviar la resolución al estudiante y asesor?
              </p>
          </div>
          <div
              class="flex items-center justify-end p-3 border-t border-gray-200">
              <button
              class="px-4 py-2 text-sm text-white bg-[#5d6d7e] rounded-2xl"
              @click="closeModal">
              Cancelar
              </button>
              <button
              class="ml-4 px-4 py-2 text-sm text-white bg-base rounded-xl"
              @click="closeModal">
              Confirmar
              </button>
          </div>
        </div>
      </div>

      <!-- Modal para subir link de tesis -->

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