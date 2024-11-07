<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";
import IconPdf from "@/components/icons/IconPdf.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import axios from "axios";
import { alertToast } from "@/functions";

// Estados y propiedades
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const showModal = ref(false);
const showRejectModal = ref(false);
const nroOficio1 = ref<string>('');
const nroExped1 = ref<string>(''); 

// Validación para N° de expediente: hasta 17 caracteres con números y un guion permitido
const validateNroExped = () => {
  nroExped1.value = nroExped1.value.replace(/[^0-9-]/g, ''); // Permitir solo números y un guion
  if (nroExped1.value.length > 17) {
    nroExped1.value = nroExped1.value.slice(0, 17); // Limitar a 17 caracteres
  }
};

// Computar si el formulario es válido
const formIsValid = computed(() => {
  return nroExped1.value.length === 17;
});

function openModal(resolucionId: number) {
  showModal.value = true;
  resolucion_id.value = resolucionId;
}

function openRejectModal(resolucionId: number) {
  showRejectModal.value = true;
  resolucion_id.value = resolucionId;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; //cerrar ambos modales
  motivoObservacion.value = "";
}

// Filtrado y paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => (data.estado?.toLowerCase() ?? '') === selectedFilter.value.toLowerCase()
    );
  }
 console.log('Filtrando datos:', filteredData);

  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.resolucion_estado?.toLowerCase() === selectedFilter.value.toLowerCase())
    : tableData.value;

  return Math.ceil(filteredData.length / rowsPerPage.value);
});

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

interface Solicitude {
  resolucion_id: number;
  nombre: string;
  oficio_id: number;
  titulo: string;
  estado: string;
  resolucion_estado: string | null;
}
const tableData = ref<Solicitude[]>([]); 
const motivoObservacion = ref<string>("");
const VIEW_OSINFORME = import.meta.env.VITE_URL_VIEW_OSINFORME;
const VIEW_RSNFORME = import.meta.env.VITE_URL_VIEW_RSNFORME;
let resolucion_id = ref<number | null>(null);


const obtenerSolicitudes = async () => {
  try {
    const response = await axios.get('/api/resolucion/get/declarar-apto/informe');
    console.log('Datos recibidos de la API:', response.data);

    if (response.data && Array.isArray(response.data)) {
      tableData.value = response.data as Solicitude[];  // Asignamos los datos si existe un array
      console.log('Datos asignados a tableData:', tableData.value);
    } else {
      console.log('Estructura inesperada en la respuesta de la API');
      tableData.value = [];  // Si no hay datos, asignamos un array vacío
    }

  } catch (error) {
    console.error('Error al cargar las solicitudes:', error);
  }
};

const generarResolucion = async () => {
  try {
    const resolucionId = resolucion_id.value;
    if (resolucionId === null || !nroExped1.value) return;  // Verificamos que `oficioId` y los valores no sean null

    const params = {
      estado: 'tramitado',
      numero_resolucion: nroExped1.value,
    };

    const response = await axios.put(`/api/resolucion/aprobacion-tesis/${resolucionId}/status`, params);
    console.log('Datos en update:', response.data);  // Verificación del response

    if (response.data.estado) {
      const resolucion = tableData.value.find((of) => of.resolucion_id === resolucionId);
      if (resolucion) {
        resolucion.estado = 'tramitado';  
      }
      closeModal();  
      alertToast('El oficio ha sido generado', 'Éxito', 'success');
    }
  } catch (error) {
    alertToast('Error al generar oficio', 'Error', 'error');
  }
};

const observarResolucion = async () => {
  try {
    const resolucionId = resolucion_id.value;
    if (resolucionId === null) return;  // Verificamos que `oficioId` no sea null
    const params = {
      estado: 'observado',
      observacion: motivoObservacion.value,  // Motivo de rechazo
    };
    const response = await axios.put(`/api/resolucion/aprobacion-tesis/${resolucionId}/status`, params);
    console.log('Datos en rechazo:', response.data);  // Verificación del response

    if (response.data.estado) {
      const resolucion = tableData.value.find((of) => of.resolucion_id === resolucionId);
      if (resolucion) resolucion.estado = 'observado';  // Actualizar la tabla localmente
      closeModal();  // Cerrar el modal tras la actualización
      alertToast('La solicitud ha sido observada', 'Éxito', 'success');
    }
  } catch (error) {
    alertToast('Error al observar la solicitud', 'Error', 'error');
  }
};

onMounted(() => {
  obtenerSolicitudes()
})

</script>

<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        Resoluciones de apto para sustentación
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
                  class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:gray-700 focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300"
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
              class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white"
            >
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr
                    class="text-center text-black border-b-2 bg-gray-300"
                  >
                    <th class="px-3 py-1 tracking-wider text-left">ESTUDIANTE</th>
                    <th class="px-3 py-1 tracking-wider text-left">TÍTULO</th>
                    <th class="px-4 py-2 tracking-wider whitespace-nowrap">OFICIO PAISI</th>
                    <th class="px-3 py-1 tracking-wider">ACCIÓN</th>
                    <th class="px-3 py-1 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(solicitude, index) in filteredTableData"
                    :key="solicitude.resolucion_id"
                    class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300"
                  >
                    <td class="px-3 text-base">
                      <p class="text-gray-900 text-wrap w-40 uppercase">
                        {{ solicitude.nombre }}
                      </p>
                    </td>
                    <td class="px-3 py-2 text-base w-80 min-w-80 max-w-80 p-0 uppercase">
                      <p class="text-gray-900 break-words p-1">
                        {{ solicitude.titulo }}
                      </p>
                    </td>
                    <td class="text-center px-4">
                      <a v-if="solicitude.oficio_id" :href="`${VIEW_OSINFORME}/${ solicitude.oficio_id }`" target="_blank">
                        <button>
                          <svg fill="#39B49E" class="w-6 h-6" version="1.1"oficio_id="XMoficio_id_38_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.288"></g><g id="SVGRepo_iconCarrier"> <g id="document-pdf"> <g> <path d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z"></path> </g> <g> <rect x="15" y="12" width="6" height="2"></rect> </g> <g> <rect x="15" y="12" width="2" height="8"></rect> </g> <g> <rect x="15" y="16" width="5" height="2"></rect> </g> <g> <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 "></polygon> </g> <g> <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon> </g> </g> </g></svg>
                        </button>
                      </a>
                      <span v-else class="italic text-gray-400">No disponible</span>
                    </td>
                    <td class="px-3 py-5 flex items-center justify-center min-h-[140px]">
                      <button
                        v-if="['pendiente', 'observado'].includes(solicitude.estado ?? '')"
                        :class="[ 'w-20 px-2 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none','hover:bg-green-600']"  :disabled="['tramitado'].includes(solicitude.estado ?? '')"
                        @click="openModal(solicitude.resolucion_id)"
                      >
                        Generar
                      </button>

                      <button
                          v-if="['pendiente', 'observado'].includes(solicitude.estado ?? '')"
                          :class="[ 
                            'w-20 px-2 py-1 text-sm text-white bg-[#e79e38] rounded-xl focus:outline-none', 
                            'hover:bg-gray-400'
                          ]" :disabled="['tramitado'].includes(solicitude.estado ?? '')"
                          @click="openRejectModal(solicitude.resolucion_id)"
                        >
                          Observar
                        </button>

                      <button>
                          <a
                            :href="`${VIEW_RSNFORME}/${solicitude.resolucion_id}`" 
                            target="_blank"
                            class="flex items-center m-2 relative group"
                            v-if="['tramitado'].includes(solicitude.estado)"
                          >
                            <IconEyeCerrar class="mr-1 w-7 h-7 group-hover:hidden" />
                            <IconEyeAbrir class="mr-1 w-7 h-7 hidden group-hover:block" />
                            <span class="text-[#34495e] whitespace-nowrap"> Ver resolución</span>
                          </a>
                        </button>
                    </td>
                    <td class="px-3 py-5 text-center">
                        <span :class="`estado-estilo estado-${solicitude.estado ? solicitude.estado.toLowerCase().replace(' ', '-') : ''}`">
                          {{ solicitude.estado ? solicitude.estado.charAt(0).toUpperCase() + solicitude.estado.slice(1).toLowerCase() : 'Estado desconocido' }}
                        </span>
                      </td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-white  bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-white   bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para generar la resolucion de aprobacion de tesis -->
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
              Se autogenerará la resolución de aprobación del proyecto de tesis
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-500 text-lg text-left mb-2">
              Por favor dígite el N° de expediente.
            </p>
            <input 
              type="text" 
              id="nroExped1" 
              v-model="nroExped1" 
              class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" 
              maxlength="17" 
              @input="validateNroExped"
              required>
              <p v-if="nroExped1.length !== 17 && nroExped1 !== ''" class="text-red-800">Debe ingresar 17 dígitos</p>
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
              :disabled="!formIsValid" @click="generarResolucion"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de observacion de tesis -->
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
            <textarea class="text-gray-950 rounded-md w-full mt-3 border text-lg focus:border-gray-900 focus:ring-0" name="observarTesis" id="observarTesis" v-model="motivoObservacion" placeholder="Escriba aquí..."></textarea>
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
              @click="observarResolucion"
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

.custom-thead th {
  font-weight: 700; /* Grosor delgado */
  font-size: 16px;  /* Tamaño de la fuente */
  text-transform: uppercase; /* Todo el texto en mayúsculas */
}
</style>