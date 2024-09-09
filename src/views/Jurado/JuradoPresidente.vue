<script lang="ts" setup>
import { ref, computed } from "vue";

const rowsPerPage = ref(5); //cantidad para mostrar en la tabla
const selectedFilter = ref(""); //para seleccionar el estado
const currentPage = ref(1); //pagina actual
const showModal = ref(false); //modal no necesita mas correciones
const showRejectModal = ref(false); //modal si falta mas correciones
const showSendModal = ref(false); //modal para enviar las revisiones de todos los jurados

function openModal() {
  showModal.value = true;
}

function openRejectModal() {
  showRejectModal.value = true;
}

function openSendModal(){
  showSendModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; //cerrar ambos modales
  showSendModal.value = false;
}


function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// simulacion de datos
const tableData = ref([
  {
    name: "Rodríguez Meléndez, Fabio",
    title:
      "Evaluación de la usabilidad de la plataforma de aprendizaje remota Google Classroom en la Universidad de Huánuco en el 2021",
    obs: "5",
    status: "Pendiente",
    statusColor: "estadoVerde",
  },
  {
    name: "López De La Cruz, Edgardo Cristiam Iván",
    title: "Implementación de una red privada virtual usando software libre bajo la arquitectura de computadora Raspberry pi para la interconexión de la sucursal de Tingo María de la empresa Chapacuete S.R.L de la ciudad de Huánuco en el 2023",
    obs: "15",
    status: "Corregido",
    statusColor: "estadoPlomo",
  },
  {
    name: "Sulca Correa, Omar Iván",
    title: "Metodología para la implementación del servicio de infraestructura en la nube para las revistas científicas de la UDH",
    obs: "25",
    status: "Terminado",
    statusColor: "yellow",
  },
  {
    name: "Nuñez Vicente, José Antonio",
    title: "Diseño y desarrollo de una aplicación web para la gestión de paquetes turísticos de la agencia de viajes destinos Perú de la ciudad de Lima en el 2021",
    obs: "25",
    status: "Terminado",
    statusColor: "yellow",
  },
  {
    name: "Zacarias Ventura, Héctor Raúl",
    title: "Diseño, desarrollo y evaluación de la usabilidad de un sistema de información para la ferretería Huánuco del distrito de Amarilis en el 2022",
    obs: "25",
    status: "Terminado",
    statusColor: "yellow",
  },
  {
    name: "Zacarías Ventura, Héctor Raúl",
    title: "Auditoria informática y propuesta de mejora bajo la metodología cobit al área de compras y abastecimiento de la empresa chapacuete s.a.c de la ciudad de Huánuco en el 2019",
    obs: "25",
    status: "Terminado",
    statusColor: "yellow",
  },
  {
    name: "Huapalla García, Juan Manuel",
    title: "Implementación de una aplicación cliente servidor para la mejora de la Gestión de Ventas de la Empresa Comercial Gómez, Huánuco - 2022",
    obs: "25",
    status: "Terminado",
    statusColor: "yellow",
  }
]);

// para filtrar datos en base al filtro y paginacion seleccionado
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

// el total de paginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.status === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto">
    <div class="flex-1 p-8 overflow-auto">
      <h3 class="text-4xl font-medium text-center text-gray-800">
        Pendientes de confirmación
      </h3>
      <div class="mt-8">
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto mb-4">
            <!-- Filtro de cantidad de entradas -->
            <div class="w-full flex justify-end items-center space-x-3">
              <!-- Búsqueda -->
              <div class="relative block mt-2 sm:mt-0">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <img src="/img/buscar.svg" alt="Icono buscar">
                </span>
                <input
                  placeholder="Buscar"
                  class="block w-full py-2 pl-8 pr-6 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-full appearance-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
                />
              </div>
              <div class="relative">
                <select
                  v-model="rowsPerPage"
                  class="block w-full h-full rounded px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-l appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                  <img src="/img/mayor_abajo.svg" alt="Icono mayor abajo">
                </div>
              </div>
              <!-- Filtro de estado -->
              <div class="relative">
                <select
                  v-model="selectedFilter"
                  class="block w-full h-full rounded px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-l appearance-none focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Corregido">Corregido</option>
                  <option value="Terminado">Terminado</option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                  <img src="/img/mayor_abajo.svg" alt="Icono mayor abajo">
                </div>
              </div>
            </div>
          </div>
          <!-- Tabla de proyecto de tesis los pendientes por confirmar -->
          <div class="p-1 relative overflow-x-auto tabla1">
            <div class="inline-block min-w-full overflow-hidden border rounded-xl">
              <table class="w-full text-lg text-left rtl:text-right text-white dark:text-black">
                <thead class="text-lg text-white uppercase dark:text-black">
                  <tr class="border-b border-gray-400">
                    <th scope="col" class="px-6 py-3">
                      Estudiante
                    </th>
                    <th scope="col" class="px-40 py-3">
                      Título
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Observaciones
                    </th>
                    <th scope="col" class="py-1">
                      N° revisión
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Presidente
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Secretario
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Vocal
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Acción
                    </th>
                    <th scope="col" class="px-9 py-3">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, index) in filteredTableData" :key="index" :class="index % 2 === 0 ? 'bg-grisTabla' : 'bg-white'" class="border-b border-gray-400" >
                    <td class="px-6 py-4 ">
                      {{ u.name }}
                    </td>
                    <td class="px-6 py-4">
                        {{ u.title }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-center">
                        <button class="focus:outline-none border rounded-3xl p-2 custum-file-upload mx-auto">
                          <label class="custom-file-upload flex items-center space-x-2 cursor-pointer" for="file">
                            <div class="icon">
                              <img
                                src="/img/subirarchivo.svg"
                                alt="Icono Subir archivo"
                              />
                            </div>
                            <div class="text">
                              <span>Subir archivo</span>
                            </div>
                            <input type="file" id="file" class="hidden" />
                          </label>
                        </button>
                      </div>
                    </td>
                    <td class="px-12 py-4">
                      {{ u.obs }}
                    </td>
                    <td class="px-6 py-4">
                    </td>
                    <td class="px-6 py-4"></td>
                    <td class="px-6 py-4"></td>
                    <td class="px-10 py-4">
                      <div class="flex flex-col space-y-2">
                        <button class="focus:outline-none" @click="openModal">
                          <img src="/img/confirmar.svg" alt="Icono confirmar" />
                        </button>
                        <button class="focus:outline-none" @click="openRejectModal">
                          <img src="/img/corregir.svg" alt="Icono No confirmar" />
                        </button>
                        <button class="focus:outline-none" @click="openSendModal">
                          <img src="/img/enviar.svg" alt="Icono de enviar">
                        </button>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-base">
                      <span
                        :class="`estado-estilo estado-${u.status
                          .toLowerCase()
                          .replace(' ', '-')} rounded-2xl px-2 py-2`"
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
                <span class="text-sm text-gray-900 xs:text-sm"
                  >Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
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

      <!-- modal no necesita mas correciones -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <img src="/img/cerrar.svg" alt="Icono cerrar">
            </button>
          </div>
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Confirmación
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-600 text-lg">
              ¿Está seguro que este proyecto de tesis no necesita mas
              correciones?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-base text-white bg-base rounded-xl"
              @click="closeModal"
            >
              Sí
            </button>
            <button
              class="ml-4 px-4 py-2 text-base text-white bg-gray-400 rounded-xl"
              @click="closeModal"
            >
              No
            </button>
          </div>
        </div>
      </div>

      <!-- modal si falta mas correciones -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50"
      >
        <div class="relative w-full max-w-lg p-4 bg-white rounded-lg shadow-lg">
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <img src="/img/cerrar.svg" alt="Icono cerrar">
            </button>
          </div>
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              Confirmación
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-600 text-lg">
              ¿Aún le falta correciones a este proyecto de tesis?
            </p>
          </div>
          <div
            class="flex items-center justify-end p-3 border-t border-gray-200"
          >
            <button
              class="px-4 py-2 text-base text-white bg-base rounded-xl"
              @click="closeModal"
            >
              Sí
            </button>
            <button
              class="ml-4 px-4 py-2 text-base text-white bg-gray-400 rounded-xl"
              @click="closeModal"
            >
              No
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
              <img src="/img/cerrar.svg" alt="Icono cerrar">
            </button>
          </div>
          <div
            class="flex items-start justify-between p-3 border-b border-gray-200"
          >
            <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
              ¿Está seguro que todo el proyecto de tesis esta corregido por los jurados?
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
                    <img
                      src="/img/subirarchivo.svg"
                      alt="Icono Subir archivo"
                    />
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
              class="px-4 py-2 text-base text-white bg-base hover:bg-base rounded-2xl"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              class="ml-4 px-4 py-2 ext-base text-white bg-gray-400 rounded-xl"
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
.estado-terminado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-corregido {
  background-color: #e89519;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
</style>
