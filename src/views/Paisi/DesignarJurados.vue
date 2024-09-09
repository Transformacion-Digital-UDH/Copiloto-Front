<script lang="ts" setup>
import { ref, computed } from "vue";

const rowsPerPage = ref(5); //cantidad para mostrar en la tabla
const selectedFilter = ref(""); //para seleccionar el estado
const currentPage = ref(1); //pagina actual
const showModal = ref(false); //elegir jurado
const showRejectModal = ref(false); //editar jurado
const selectedPresidente = ref('');
const selectedSecretario = ref('');
const selectedVocal = ref('');

const asignarJurado = () => {
  if (selectedPresidente.value && selectedSecretario.value && selectedVocal.value) {
    alert('Jurados asignados correctamente!');
    selectedPresidente.value = "";
    selectedSecretario.value = "";
    selectedVocal.value = "";
    closeModal();
  } else {
    alert('Por favor, selecciona todos los jurados.');
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
  showRejectModal.value = false; //cerrar ambos modales
}

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

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

// simulacion de datos
const tableData = ref([
  {
    name: "Rodríguez Meléndez, Fabio",
    title: "Evaluación de la usabilidad de la plataforma de aprendizaje remota Google Classroom en la Universidad de Huánuco en el 2021",
    obs: "5",
    status: "Pendiente",
  },
  {
    name: "López De La Cruz, Edgardo Cristiam Iván",
    title: "Implementación de una red privada virtual usando software libre bajo la arquitectura de computadora Raspberry pi para la interconexión de la sucursal de Tingo María de la empresa Chapacuete S.R.L de la ciudad de Huánuco en el 2023",
    obs: "15",
    status: "Solicitud",
  },
  {
    name: "Sulca Correa, Omar Iván",
    title: "Metodología para la implementación del servicio de infraestructura en la nube para las revistas científicas de la UDH",
    obs: "25",
    status: "Solicitud",
  },
  {
    name: "Nuñez Vicente, José Antonio",
    title: "Diseño y desarrollo de una aplicación web para la gestión de paquetes turísticos de la agencia de viajes destinos Perú de la ciudad de Lima en el 2021",
    obs: "25",
    status: "Solicitud",
  },
  {
    name: "Zacarias Ventura, Héctor Raúl",
    title: "Diseño, desarrollo y evaluación de la usabilidad de un sistema de información para la ferretería Huánuco del distrito de Amarilis en el 2022",
    obs: "25",
    status: "Asignado",
  },
  {
    name: "Zacarías Ventura, Héctor Raúl",
    title: "Auditoria informática y propuesta de mejora bajo la metodología cobit al área de compras y abastecimiento de la empresa chapacuete s.a.c de la ciudad de Huánuco en el 2019",
    obs: "25",
    status: "Solicitud",
  },
  {
    name: "Huapalla García, Juan Manuel",
    title: "Implementación de una aplicación cliente servidor para la mejora de la Gestión de Ventas de la Empresa Comercial Gómez, Huánuco - 2022",
    obs: "25",
    status: "Pendiente",
  }
]);
</script>

<template>
    <div class="flex h-screen border-s-2 font-Roboto">
      <div class="flex-1 p-8 overflow-auto">
        <h3 class="text-4xl font-medium text-center text-gray-800">
          Designación de Jurados
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
                    <option value="Solicitud">Solicitud</option>
                    <option value="Asignado">Asignado</option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                    <img src="/img/mayor_abajo.svg" alt="Icono mayor abajo">
                  </div>
                </div>
              </div>
            </div>
            <!-- Tabla de proyecto de tesis los pendientes por confirmar -->
            <div class="p-1 relative overflow-x-auto">
              <div class="inline-block min-w-full overflow-hidden border rounded-xl">
                <table class="w-full text-lg text-left rtl:text-right text-white dark:text-black">
                  <thead class="text-lg text-white uppercase dark:text-black">
                    <tr class="border-b border-gray-400">
                      <th scope="col" class="px-6 py-3">
                        Estudiante
                      </th>
                      <th scope="col" class="px-6 py-3">
                        Título
                      </th>
                      <th scope="col" class="px-6 py-3">
                        Asignar
                      </th>
                      <th scope="col" class="px-6 py-3">
                        Enviar
                      </th>
                      <th scope="col" class="px-6 py-3">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(u, index) in filteredTableData" :key="index" :class="index % 2 === 0 ? 'bg-grisTabla' : 'bg-white'" class="border-b border-gray-400" >
                      <td class="px-6 py-4">
                        {{ u.name }}
                      </td>
                      <td class="px-6 py-4">
                          {{ u.title }}
                      </td>
                      <td class="px-11 py-4">
                        <button class="focus:outline-none" @click="openModal">
                            <img src="/img/asignar.svg" alt="Icono asignar jurado"/>
                        </button>
                      </td>
                      <td class="px-10 py-4">
                        <button class="focus:outline-none" @click="openRejectModal">
                            <img src="/img/enviar.svg" alt="Icono asignar jurado"/>
                        </button>
                      </td>
                      <td class="px-6 py-4 text-base">
                        <span
                          :class="`estado-${u.status
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
                  class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between "
                >
                  <span class="text-sm text-gray-900 xs:text-sm"
                    >Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                    {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de
                    {{ tableData.length }}
                  </span>
                  <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                    <button
                      :enabled="currentPage === 1"
                      @click="goToPreviousPage"
                      class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-s-2xl"
                    >
                      Anterior
                    </button>
                    <button
                      :enabled="currentPage === totalPages"
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
  
        <!-- modal para la designacion de jurados -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
          <div class="relative max-w-screen-md w-full flex flex-col p-8 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <img src="/img/cerrar.svg" alt="Icono cerrar">
              </button>
            </div>
            <!-- Primera columna -->
            <div class="w-full w:w-1/2 pr-4">
              <div class="flex items-start justify-between p-3">
                <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
                  Designación de jurados
                </h5>
              </div>
              <div class="p-6">
                <!-- Columna para seleccionar jurados -->
                <div class="flex-1">
                    <label for="presidente" class="block mb-1 font-medium text-gray-900">Presidente</label>
                    <select v-model="selectedPresidente" id="presidente" class="w-full p-2 border border-gray-300 rounded mb-4" required>
                      <option disabled value="">Selecciona un presidente</option>
                      <option>Renzo Paolo Luciano</option>
                    </select>

                    <label for="secretario" class="block mb-1 font-medium text-gray-900">Secretario</label>
                    <select v-model="selectedSecretario" id="secretario" class="w-full p-2 border border-gray-300 rounded mb-4" required>
                      <option disabled value="">Selecciona un secretario</option>
                      <option>Juan Manual Pino</option>
                    </select>

                    <label for="vocal" class="block mb-1 font-medium text-gray-900">Vocal</label>
                    <select v-model="selectedVocal" id="vocal" class="w-full p-2 border border-gray-300 rounded" required>
                      <option disabled value="">Selecciona un vocal</option>
                      <option>Dina Boluarte Ermilia</option>
                    </select>
                </div>
              </div>
              <div class="flex items-center justify-center p-3">
                <button class="px-4 py-2 text-base text-white bg-base hover:bg-gray-400 rounded-xl w-60"
                  @click="asignarJurado">Asignar
                </button>
              </div>
            </div>
            <div class="flex items-center justify-end p-3 border-t border-gray-600"></div>
            <!-- Segunda columna -->
            <div class="w-full w:w-1/2 pl-4">
              <div class="flex items-center justify-between mb-4">
                <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">
                  Resultados del docente
                </h5>
              </div>
              <p class="mb-8"><strong>Nombre:</strong> Aldo Ramirez</p>
                <table class="border w-full text-lg text-left rtl:text-right text-white dark:text-black">
                <thead class="text-lg text-white uppercase text-center dark:text-black bg-grisTabla">
                  <tr class="border-b border-gray-200">
                    <th scope="col" class="px-6 py-2">Rol</th>
                    <th scope="col" class="px-6 py-2">Alumno</th>
                    <th scope="col" class="px-6 py-2">Tiempo</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  <tr class="border-b" v-if="selectedPresidente">
                    <td class="p-2">Presidente</td>
                    <td class="p-2">{{ selectedPresidente }}</td>
                    <td class="p-2">5 meses</td>
                  </tr>
                  <tr class="border-b" v-if="selectedSecretario">
                    <td class="p-2">Secretario</td>
                    <td class="p-2">{{  selectedSecretario}}</td>
                    <td class="p-2">3 meses</td>
                  </tr>
                  <tr class="" v-if="selectedVocal">
                    <td class="p-2">Vocal</td>
                    <td class="p-2">{{ selectedVocal }}</td>
                    <td class="p-2">2 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>   
          </div>
        </div>
  
        <!-- modal para editar la designacion de jurados -->

      </div>
    </div>
  </template>

<style scoped>
.estado-asignado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-solicitud {
  background-color: #e89519;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
</style>