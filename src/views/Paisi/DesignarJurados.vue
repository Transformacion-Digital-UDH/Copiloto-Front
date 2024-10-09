<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import axios from "axios";
import { alertToast } from "@/functions";

const rowsPerPage = ref(5); //cantidad para mostrar en la tabla
const selectedFilter = ref(""); //para seleccionar el estado
const currentPage = ref(1); //pagina actual
const showModal = ref(false); //elegir jurado
const showRejectModal = ref(false); //editar jurado
const selectedPresidente = ref('');
const selectedSecretario = ref('');
const selectedVocal = ref('');

// ***** Texto que escribe automáticamente ********
const text = "Oficio para designación de asesor";
const textoTipiado1 = ref('');
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado1.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};
onMounted(() => {
  typeWriter();
});

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
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        Designación de jurados
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
                  <option value="Solicitud">Solicitud</option>
                  <option value="Asignado">Asignado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div
              class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white"
            >
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-black border-b-2 bg-gray-300">
                    <th
                      class="py-2 px-3 tracking-wider text-left"
                    >
                      ESTUDIANTE
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider text-left"
                    >
                      TÍTULO
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider"
                    >
                      ACCIÓN
                    </th>
                    <th
                      class="py-2 px-3 tracking-wider"
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
                      <p class="text-gray-900 text-wrap w-64">
                        {{ u.name }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-80">
                        {{ u.title }}
                      </p>
                    </td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        class="w-24 px-5 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal"
                        > Asignar
                      </button>
                      <button
                        class="w-24 px-4 py-1 text-sm text-white bg-[#5d6d7e] rounded-xl focus:outline-none"
                        @click="openRejectModal"
                        > Enviar
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

        <!-- modal para la designacion de jurados -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
          <div class="relative max-w-lg w-full flex flex-col p-8 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <IconCerrar />
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
                <button class="px-4 py-2 text-base text-white bg-[#5d6d7e]  rounded-lg w-60"
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
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
}
.estado-asignado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-solicitud {
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