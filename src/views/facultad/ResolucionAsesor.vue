<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconPdf from "@/components/icons/IconPdf.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";

// Texto que queremos escribir automáticamente
const text = `<h3 class="text-4xl font-semibold text-center text-azul">Resoluciones para Designacion de Asesor</h3>`;
const typedText = ref(''); // Inicializamos el texto como vacío
let index = 0; // Índice para controlar la posición en el texto

const typeWriter = () => {
  if (index < text.length) {
    typedText.value += text.charAt(index); 
    index++;
    setTimeout(typeWriter, 30); 
  }
};

// Definimos una interfaz para tipar los elementos de `tableData`
interface Resolucion {
  id: string;
  estudiante_nombre: string;
  asesor_nombre: string;
  fecha_creado: string;
  estado: string;
}

// Estados y propiedades
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const showModal = ref(false);
const showRejectModal = ref(false);
const showSendModal = ref(false);
const nroOficio1 = ref('');
const isLoading = ref(false); // Indicador de carga
const load = ref(false);  // Estado de carga
const nroExpedi = ref('');

// Estado de la tabla que almacenará los datos de la API, tipada con `Resolucion[]`
const tableData = ref<Resolucion[]>([]);

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

// Filtrado y paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    // Filtrar por la propiedad "estado"
    filteredData = filteredData.filter(
      (data) => data.estado === selectedFilter.value
    );
  }

  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.estado === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// Función para obtener los datos desde la API
const fetchOffices = async () => {
  isLoading.value = true;

  try {
    // Llamada a la API para obtener los datos
    const response = await axios.get<{ data: Resolucion[] }>('api/faculty/getOffices');
    console.log(response.data);
    tableData.value = response.data.data;
  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
  } finally {
    isLoading.value = false; // Ocultar indicador de carga
  }
};

// Cargar los datos cuando el componente se monta
onMounted(() => {
  fetchOffices();
  typeWriter();
});
</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <div v-html="typedText"></div> 
      <!-- Mostrar un spinner mientras se cargan los datos -->
      <div v-if="isLoading" class="flex justify-center text-xl text-base">
          <span>Cargando solicitudes...</span>
      </div>

      <!-- Tabla de datos -->
      <div v-else>
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
                  class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300"
                />
                </div>
              <div class="relative">
                <select
                    v-model="rowsPerPage"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
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
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
                  >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="observado">Observado</option>
                  <option value="tramitado">Tramitado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla de datos -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal sm:table md:table lg:table">
                <thead class="custom-thead font-Quicksand border-b-5">
                  <tr class="text-center text-black  bg-baseClarito">
                    <th class="py-3 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-3 px-3 text-left tracking-wider">ASESOR</th>
                    <th class="py-3 px-4 tracking-wider">OFICIO PAISI</th>
                    <th class="py-3 px-14 text-left tracking-wider">FECHA</th>
                    <th class="py-3 px-3 tracking-wider">VALIDAR TRÁMITE</th>
                    <th class="py-3 px-3 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(u, index) in filteredTableData"
                    :key="u.id"
                    class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-42">
                        {{ u.estudiante_nombre || 'Nombre desconocido' }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-42">
                        {{ u.asesor_nombre || 'Asesor desconocido' }}
                      </p>
                    </td>
                    <td class="text-center px-4">
                      <button>
                        <svg fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.288"></g><g id="SVGRepo_iconCarrier"> <g id="document-pdf"> <g> <path d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z"></path> </g> <g> <rect x="15" y="12" width="6" height="2"></rect> </g> <g> <rect x="15" y="12" width="2" height="8"></rect> </g> <g> <rect x="15" y="16" width="5" height="2"></rect> </g> <g> <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 "></polygon> </g> <g> <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon> </g> </g> </g></svg>
                      </button>
                    </td>
                    <td class="px-3 py-5 text-base text-center">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.fecha_creado || 'Fecha no disponible' }}
                      </p>
                    </td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        class="w-20 px-3 py-1 mb-2 text-sm text-white bg-[#48bb78] rounded-xl focus:outline-none hover:bg-green-600 transform active:translate-y-1 transition-transform duration-150"
                        @click="openModal"
                      >
                        Generar
                      </button>
                      <button
                        class="w-20 px-3 py-1 text-sm text-white bg-[#e79e38] rounded-xl focus:outline-none hover:bg-orange-400 transform active:translate-y-1 transition-transform duration-150"
                        @click="openRejectModal"
                      >
                        Observar
                      </button>
                    </td>
                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.estado.toLowerCase().replace(' ', '-')}`">
                        {{ u.estado || 'Estado desconocido' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-base text-gray-800 bg-baseClarito hover:bg-base rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-base text-black bg-baseClarito hover:bg-base rounded-e-2xl">Siguiente</button>
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
              Se autogenerará la resolución de asesor para este estudiante
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-500 text-base text-left mb-2">
              Dígite el N° de expediente
            </p>
            <input type="text" id="nroExpedi" v-model="nroExpedi" class="px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" maxlength="4" inputmode="numeric" pattern="[0-9]*" >
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
            <textarea class="text-gray-950 rounded-md w-full mt-3 border text-lg focus:border-gray-900 focus:ring-0" name="observarTesis" id="observarTesis" placeholder="Escriba aquí..."></textarea>
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
