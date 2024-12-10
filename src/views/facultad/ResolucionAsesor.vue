<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import { alertToast } from "@/functions";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

// ***** Texto que escribe automáticamente ********
const text = "Resoluciones para Designación de Asesor";
const textoTipiado = ref<string>("");  // Definimos el tipo de `textoTipiado` como string
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};

// Definimos una interfaz para tipar los elementos de `tableData`
interface Resolucion {
  id: string;
  estudiante_nombre: string;
  asesor_nombre: string;
  fecha_creado: string;
  estado: string;
  resolucion_estado: string;
  resolucion_id: string;
}

// Estados y propiedades
const isHovered = ref<boolean>(false);  // Aseguramos que `isHovered` es un booleano
const selectedFilter = ref<string>(""); // Filtro seleccionado
const rowsPerPage = ref<number>(5);     // Número de filas por página
const currentPage = ref<number>(1);     // Página actual de la tabla
const showModal = ref<boolean>(false);  // Modal de confirmación de resolución
const showRejectModal = ref<boolean>(false);  // Modal de rechazo/observación
const showSendModal = ref<boolean>(false);  // Modal para enviar a facultad
const nroResolution = ref<string>("");  // Número de resolución
const load = ref<boolean>(false);       // Estado de carga de datos
const motivoObservacion = ref<string>("");  // Motivo de observación

// Variables de entorno
const VIEW_OFFICE = import.meta.env.VITE_URL_VIEW_OFFICE;
const VIEW_RESOLUTION = import.meta.env.VITE_URL_VIEW_RESOLUTION;

// Estado de carga y datos
const isLoading = ref<boolean>(false);  // Añadimos isLoading para mostrar el estado de carga
const tableData = ref<Resolucion[]>([]);  // Los datos de la tabla son un array de `Resolucion`
const selectedOfficeId = ref<string | null>(null); // ID de la resolución seleccionada

// Definimos oficio_id como `string | null` para manejar posibles valores nulos
let oficio_id = ref<string | null>(null);

function openModal(oficioId: string) {
  showModal.value = true;
  oficio_id.value = oficioId;
}

function openRejectModal(oficioId: string) {
  showRejectModal.value = true;
  oficio_id.value = oficioId;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; // Cerrar ambos modales
}

// Filtrado y paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  // Aplicamos el filtro por estado si está seleccionado
  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.estado === selectedFilter.value
    );
  }

  // Paginación
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

//*********************************** INTEGRACION CON EL BACKEND *************************************************** */

const validateResolution = () => {
  nroResolution.value = nroResolution.value.replace(/[^0-9]/g, '');
  if (nroResolution.value.length > 4) {
    nroResolution.value = nroResolution.value.slice(0, 4);
  }
};

// Función para obtener los datos desde la API
const fetchOffices = async () => {
  load.value = true;

  try {
    // Llamada a la API para obtener los datos
    const response = await axios.get("/api/faculty/getOffices");
    console.log(response);
    tableData.value = response.data.data; // Tipado como `Resolucion[]`
  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
  } finally {
    load.value = false; // Ocultar indicador de carga
  }
};

// Cargar los datos cuando el componente se monta
onMounted(() => {
  fetchOffices();
  typeWriter();
});

// Función generar resolución
const updateResolution = async () => {
  try {
    const oficioId = oficio_id.value;
    if (!oficioId) return; // Verificación por seguridad
    const params = {
      docres_status: "tramitado",
      docres_num_res: nroResolution.value,
    };
    const response = await axios.put(`/api/resolution/${oficioId}/status`, params);  // URL y request body

    if (response.data.status) {
      const oficio = tableData.value.find((of) => of.id === oficioId);
      if (oficio) oficio.resolucion_estado = "tramitado"; // Actualizar la tabla localmente
      closeModal(); // Cerrar el modal después de la actualización
      alertToast("La resolución ha sido generada", "Éxito", "success");
    }
  } catch (error) {
    alertToast("Error al generar la resolución", "Error", "error");
  }
};

// Función para observar el oficio
const rejectResolution = async () => {
  try {
    const oficioId = oficio_id.value;
    if (!oficioId) return; // Verificación por seguridad
    const params = {
      docres_status: "observado",
      docres_observation: motivoObservacion.value, // Motivo de rechazo
    };
    const response = await axios.put(`/api/resolution/${oficioId}/status`, params);  // URL y request body

    if (response.data.status) {
      const oficio = tableData.value.find((of) => of.id === oficioId);
      if (oficio) oficio.resolucion_estado = "observado"; // Actualizar la tabla localmente
      closeModal(); // Cerrar el modal después de la actualización
      alertToast("El oficio ha sido observado", "Éxito", "success");
    }
  } catch (error) {
    alertToast("Error al observar el oficio", "Error", "error");
  }
};
</script>

<template>
  <template v-if="load">
    <div class="flex h-screen bg-gray-100">
      <div class="flex-1 p-10 border-s-2 bg-gray-100">
        <!-- Indicadores de carga de esqueleto -->
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 class="bg-gray-200 h-9 w-1/2 rounded-lg duration-200 skeleton-loader">
          </h3>
        </div>
        <div class="mt-8">
          <div class="mt-6">
            <div class="flex flex-col mt-3 sm:flex-row">
              <div class="w-full flex justify-end items-center space-x-2">
                <h3 class="bg-gray-200 h-10 w-1/3 rounded-lg duration-200 skeleton-loader"></h3>
              </div>
            </div>
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-5">
              <h3 class="bg-gray-200 h-[500px] w-[100%] rounded-lg duration-200 skeleton-loader"></h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
      <div class="flex-1 p-10 overflow-auto">
        <!-- Texto tipiado -->
        <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado }}</h3>

        <!-- Tabla de datos -->
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
                  <input placeholder="Buscar"
                    class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:gray-700 focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300" />
                </div>
                <div class="relative">
                  <select v-model="rowsPerPage"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <!-- Filtro de estado -->
                <div class="relative">
                  <select v-model="selectedFilter"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="observado">Observado</option>
                    <option value="tramitado">Tramitado</option>
                  </select>
                </div>
              </div>
            </div>
            <br>

            <!-- Tabla de datos -->
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
              <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
                <table class="min-w-full leading-normal">
                  <thead class="custom-thead font-Quicksand">
                    <tr class="text-center text-azul border-b-2 bg-gray-300">
                      <th class="py-2 px-3 text-left tracking-wider col-estudiante">ESTUDIANTE</th>
                      <th class="py-2 px-3 text-left tracking-wider">ASESOR</th>
                      <th class="py-2 px-2 tracking-wider whitespace-nowrap">OFICIO PAISI</th>
                      <th class="py-2 px-12 text-left tracking-wider">FECHA</th>
                      <th class="py-2 px-3 tracking-wider whitespace-nowrap">VALIDAR TRÁMITE</th>
                      <th class="py-2 px-3 tracking-wider">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(u, index) in filteredTableData" :key="u.id"
                      class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 whitespace-nowrap">{{ u.estudiante_nombre || 'Nombre desconocido' }}</p>
                      </td>
                      <td class="px-2 py-4 text-base">
                        <p class="text-gray-900 whitespace-nowrap">{{ u.asesor_nombre || 'Asesor desconocido' }}</p>
                      </td>
                      <td class="text-center px-4">
                        <a :href="`${VIEW_OFFICE}/${u.id}`" target="_blank">
                          <button>
                            <svg fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_"
                              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                              viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E"
                              stroke-width="0.00024000000000000003">
                              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"
                                stroke="#CCCCCC" stroke-width="0.288"></g>
                              <g id="SVGRepo_iconCarrier">
                                <g id="document-pdf">
                                  <g>
                                    <path
                                      d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z">
                                    </path>
                                  </g>
                                  <g>
                                    <rect x="15" y="12" width="6" height="2"></rect>
                                  </g>
                                  <g>
                                    <rect x="15" y="12" width="2" height="8"></rect>
                                  </g>
                                  <g>
                                    <rect x="15" y="16" width="5" height="2"></rect>
                                  </g>
                                  <g>
                                    <polygon
                                      points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 ">
                                    </polygon>
                                  </g>
                                  <g>
                                    <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </button>
                        </a>
                      </td>
                      <td class="px-3 py-5 text-base text-center">
                        <p class="text-gray-900 text-wrap w-32">{{ u.fecha_creado || 'Fecha no disponible' }}</p>
                      </td>
                      <td class="px-3 py-5 flex flex-col items-center justify-center">
                        <button v-if="['pendiente', 'observado'].includes(u.resolucion_estado)" :class="['w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none',
                          ['tramitado'].includes(u.resolucion_estado)
                            ? 'cursor-not-allowed'
                            : 'hover:bg-green-600'
                        ]" :disabled="['tramitado'].includes(u.resolucion_estado)" @click="openModal(u.id)">
                          Generar
                        </button>
                        <button v-if="['pendiente', 'observado'].includes(u.resolucion_estado)" :class="['w-24 px-3 py-1 mb-2 text-sm text-white bg-[#e79e38] rounded-xl focus:outline-none',
                          ['tramitado'].includes(u.resolucion_estado)
                            ? 'cursor-not-allowed'
                            : 'hover:bg-[#f1aa47e8]'
                        ]" :disabled="['tramitado'].includes(u.resolucion_estado)" @click="openRejectModal(u.id)">
                          Observar
                        </button>
                        <a :href="`${VIEW_RESOLUTION}/${u.resolucion_id}`" target="_blank"
                          class="flex items-center m-2 relative group"
                          v-if="['tramitado'].includes(u.resolucion_estado)">
                          <IconEyeCerrar class="mr-1 group-hover:hidden" />
                          <IconEyeAbrir class="mr-1 hidden group-hover:block" />
                          <span class="text-[#34495e]">Resolución</span>
                        </a>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <span :class="`estado-estilo estado-${u.resolucion_estado?.toLowerCase().replace(' ', '-')}`">
                          {{ u.resolucion_estado ? u.resolucion_estado.charAt(0).toUpperCase() +
                            u.resolucion_estado.slice(1).toLowerCase() : 'Estado desconocido' }}
                        </span>
                      </td>

                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
                <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                  <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage
                    + 1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length
                    }}</span>
                  <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                    <button :disabled="currentPage === 1" @click="goToPreviousPage"
                      class="px-4 py-2 text-white  bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                    <button :disabled="currentPage === totalPages" @click="goToNextPage"
                      class="px-4 py-2 text-white   bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
                  </div>
                </div>


                <!-- Modal para generar un oficio al estudiante -->
                <div v-if="showModal"
                  class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
                  <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
                    <div class="flex justify-end items-start">
                      <button
                        class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
                        @click="closeModal">
                        <IconCerrar />
                      </button>
                    </div>
                    <div class="flex items-start justify-between p-3 border-b border-gray-200">
                      <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
                        Se autogenerará la resolucion de asesor para este estudiante
                      </h5>
                    </div>
                    <div class="p-6">
                      <p class="text-gray-500 text-lg text-left mb-2">
                        Dígite el N° de resolución.
                      </p>
                      <input type="text" id="nroResolution" v-model="nroResolution"
                        class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" maxlength="4"
                        inputmode="numeric" @input="validateResolution" required>
                      <p v-if="nroResolution.length !== 4 && nroResolution !== ''" class="text-red-800">Debe ingresar 4
                        dígitos</p>
                    </div>
                    <div class="flex items-center justify-center p-3  border-gray-200">
                      <button class="px-4 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl"
                        @click="closeModal">
                        Cancelar
                      </button>
                      <button class="ml-4 px-4 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl"
                        :disabled="nroResolution.length !== 4" @click="updateResolution">
                        Generar
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Modal de observacion -->
                <div v-if="showRejectModal"
                  class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
                  <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
                    <div class="flex justify-end items-start">
                      <button
                        class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
                        @click="closeModal">
                        <IconCerrar />
                      </button>
                    </div>
                    <div class="flex items-start justify-between p-3 border-b border-gray-200">
                      <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Observación</h5>
                    </div>
                    <div class="p-6 bg-white rounded-lg">
                      <p class="text-gray-600 text-lg text-center mb-4">
                        Por favor escriba el motivo de su observación
                      </p>
                      <textarea v-model="motivoObservacion"
                        class="text-gray-950 rounded-md w-full mt-3 border text-lg focus:border-gray-900 focus:ring-0"
                        name="observarTesis" id="observarTesis" placeholder="Escriba aquí..."></textarea>
                    </div>
                    <div class="flex items-center justify-center p-3  border-gray-200">
                      <button class="px-4 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl"
                        @click="closeModal">
                        Cancelar
                      </button>
                      <button class="ml-4 px-4 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl hover:bg-base"
                        @click="rejectResolution">
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
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