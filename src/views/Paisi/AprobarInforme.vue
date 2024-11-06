<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import axios from "axios";
import { alertToast } from "@/functions";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

// Definir la interfaz para las solicitudes


interface Solicitude {
  id: number;
  nombre: string;
  oficio_id: number;
  revision_id_asesor: number;
  oficio_estado: string | null;
  revision_id_presidente: number | null;
  revision_id_secretario: string | null;
  revision_id_vocal: string | null;
  estado: string;
}

// ***** Texto que escribe automáticamente ********
const text = "Aprobacion de Informe Final";
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
// *******************************************************

// Estados y propiedades
const isHovered = ref(false);
const selectedFilter = ref<string>("");  // Tipo explícito string
const rowsPerPage = ref<number>(5);      // Tipo explícito number
const currentPage = ref<number>(1);      // Tipo explícito number
const showModal = ref<boolean>(false);   // Tipo explícito boolean
const showRejectModal = ref<boolean>(false);  // Tipo explícito boolean
const nroOficio1 = ref<string>('');  // Tipo explícito string
const nroExped1 = ref<string>('');   // Tipo explícito string
const motivoObservacion = ref<string>("");  // Tipo explícito string
let oficio_id = ref<number | null>(null);   // Puede ser null
  

//VARIABLES DE ENTORNO
const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;
const VIEW_OFFICE = import.meta.env.VITE_URL_VIEW_OFFICE;
const VIEW_AINFORME = import.meta.env.VITE_URL_VIEW_AINFORME ;



// Función para abrir modal
function openModal(oficioId: number) {
  showModal.value = true;
  oficio_id.value = oficioId;
}

// Función para abrir modal de rechazo
function openRejectModal(oficioId: number) {
  showRejectModal.value = true;
  oficio_id.value = oficioId;
}

// Función para cerrar modal
function closeModal() {
  console.log('Ejecutando closeModal');  // Verificación
  showModal.value = false;
  showRejectModal.value = false;
  motivoObservacion.value = "";
}


// Filtrar datos y aplicar paginación
const tableData = ref<Solicitude[]>([]); // Tipo explícito: Array de Solicitude
  const filteredTableData = computed(() => {
  let filteredData = tableData.value ?? [];  // Si tableData.value es null o undefined, usa []

  // Aplicar filtro por estado
  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => (data.estado?.toLowerCase() ?? '') === selectedFilter.value.toLowerCase()
    );
  }

  console.log('Filtrando datos:', filteredData);

  // Asegúrate de que siempre se obtenga un valor válido para startIndex y endIndex
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.oficio_estado?.toLowerCase() === selectedFilter.value.toLowerCase())
    : tableData.value;

  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Cambiar página a la anterior
function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

// Cambiar página a la siguiente
function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

//*********************************** INTEGRACIÓN CON EL BACKEND *************************************************** */
const load = ref<boolean>(false);
const selectedSolicitude = ref<Solicitude | null>(null);  // Ahora puede ser null
const showDocumentModal = ref(false); // Modal de documentos
let solicitudSeleccionada = ref<string | null>(null); 

// Función para obtener solicitudes desde el backend
const fetchSolicitudes = async () => {
  load.value = true;
  try {
    const response = await axios.get('/api/oficio/get-aprobar/informe');
    console.log('Datos recibidos de la AP:', response.data);

    // Asigna los datos directamente desde response.data, ya que no está en response.data.data
    if (response.data && Array.isArray(response.data)) {
      tableData.value = response.data as Solicitude[];  // Asignamos los datos si existe un array
      console.log('Datos asignados a tableData:', tableData.value);
    } else {
      console.log('Estructura inesperada en la respuesta de la API');
      //tableData.value = [];  // Si no hay datos, asignamos un array vacío
    }
  } catch (error) {
    console.error('Error al cargar las solicitudes:', error);
  } finally {
    load.value = false;
  }
};


onMounted(() => {
  fetchSolicitudes();
  typeWriter();
});

// Función para actualizar o generar oficio
const updateOffice = async () => {
  try {
    const oficioId = oficio_id.value;
    if (oficioId === null || !nroOficio1.value || !nroExped1.value) return;  // Verificamos que `oficioId` y los valores no sean null

    const params = {
      estado: 'tramitado',
      numero_oficio: nroOficio1.value,  
      expediente: nroExped1.value,
    };

    const response = await axios.put(`/api/oficio/aprobacion-tesis/${oficioId}/status`, params);
    console.log('Datos en update:', response.data);  // Verificación del response

    if (response.data.estado) {
      const oficio = tableData.value.find((of) => of.oficio_id === oficioId);
      if (oficio) {
        oficio.estado = 'tramitado';  
      }
      closeModal();  
      alertToast('El oficio ha sido generado', 'Éxito', 'success');
    }
  } catch (error) {
    alertToast('Error al generar oficio', 'Error', 'error');
  }
};


// Función para observar la solicitud
const rejectSolicitude = async () => {
  try {
    const oficioId = oficio_id.value;
    if (oficioId === null) return;  // Verificamos que `oficioId` no sea null
    const params = {
      estado: 'observado',
      observacion: motivoObservacion.value,  // Motivo de rechazo
    };
    const response = await axios.put(`/api/oficio/aprobacion-tesis/${oficioId}/status`, params);
    console.log('Datos en rechazo:', response.data);  // Verificación del response

    if (response.data.estado) {
      const oficio = tableData.value.find((of) => of.oficio_id === oficioId);
      if (oficio) oficio.estado = 'observado';  // Actualizar la tabla localmente
      closeModal();  // Cerrar el modal tras la actualización
      alertToast('La solicitud ha sido observada', 'Éxito', 'success');
    }
  } catch (error) {
    alertToast('Error al observar la solicitud', 'Error', 'error');
  }
};

// Validación para N° de oficio: exactamente 3 dígitos
const validateNroOficio = () => {
  nroOficio1.value = nroOficio1.value.replace(/[^0-9]/g, ''); // Solo permite números
  if (nroOficio1.value.length > 3) {
    nroOficio1.value = nroOficio1.value.slice(0, 3); // Limitar a 3 caracteres
  }
};

// Validación para N° de expediente: hasta 17 caracteres con números y un guion permitido
const validateNroExped = () => {
  nroExped1.value = nroExped1.value.replace(/[^0-9-]/g, ''); // Permitir solo números y un guion
  if (nroExped1.value.length > 17) {
    nroExped1.value = nroExped1.value.slice(0, 17); // Limitar a 17 caracteres
  }
};

// Computar si el formulario es válido
const formIsValid = computed(() => {
  return nroOficio1.value.length === 3 && nroExped1.value.length === 17;
});

// Variables para almacenar los IDs de los documentos
let presidenteId = ref<string | null>(null);
let secretarioId = ref<string | null>(null);
let vocalId = ref<string | null>(null);

function openDocumentModal(presidente: string | null, secretario: string | null, vocal: string | null) {
  // Asignamos los valores de los IDs a las variables reactivas
  presidenteId.value = presidente;
  secretarioId.value = secretario;
  vocalId.value = vocal;

  // Solo mostramos el modal si alguno de los tres IDs no es null
  if (presidente !== null || secretario !== null || vocal !== null) {
    showDocumentModal.value = true;
  }
}


function closeDocumentModal() {
  showDocumentModal.value = false;
}
</script>


<template>
  <template v-if="load">
    <div class="flex h-screen border-s-2 bg-gray-100">
      <div class="flex-1 p-10">
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 
            class="bg-gray-200 h-9 w-1/2 rounded-lg duration-200 skeleton-loader">
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
        <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado1 }}</h3>
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
            <br>

            <!-- Tabla -->
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6 ">
              <div
                class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white"
              >
                <table class="min-w-full leading-normal">
                  <thead class="custom-thead font-Quicksand">
                    <tr
                      class="text-center text-azul border-b-2 bg-gray-300"
                    >
                      <th class="py-2 px-3 text-left font-thin tracking-wider">ESTUDIANTE</th>
                      <th class="py-2 px-3 text-left tracking-wider">CONFORMIDAD ASESOR </th>
                      <th class="py-2 px-4 tracking-wider">CONFORMIDAD JURADO</th>
                      <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                      <th class="py-2 px-3 tracking-wider">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(solicitude, index) in filteredTableData"
                      :key="solicitude.oficio_id"
                      class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300"
                    >
                      <td class="px-3 py-5 text-base">
                        <p class="text-black text-wrap w-52">
                          {{ solicitude.nombre }} 
                        </p>
                      </td>
                      <td class="text-center px-3">
                          <a v-if="solicitude.oficio_id" :href="`${VIEW_CPA}/${ solicitude.revision_id_asesor }`" target="_blank">
                            <button>
                              <svg fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.288"></g><g id="SVGRepo_iconCarrier"> <g id="document-pdf"> <g> <path d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z"></path> </g> <g> <rect x="15" y="12" width="6" height="2"></rect> </g> <g> <rect x="15" y="12" width="2" height="8"></rect> </g> <g> <rect x="15" y="16" width="5" height="2"></rect> </g> <g> <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 "></polygon> </g> <g> <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon> </g> </g> </g></svg>
                            </button>
                          </a>
                          <span v-else class="italic text-gray-400">No disponible</span>
                      </td>

                      <td class="text-center px-4">
                        <div class="flex justify-center items-center">
                          <!-- Botón de Documentos -->
                          <button 
                            @click="openDocumentModal(
                              solicitude.revision_id_presidente ? String(solicitude.revision_id_presidente) : null, 
                              solicitude.revision_id_secretario ? String(solicitude.revision_id_secretario) : null, 
                              solicitude.revision_id_vocal ? String(solicitude.revision_id_vocal) : null
                            )" 
                            class="focus:outline-none flex justify-center items-center space-x-1"
                          >
                            <IconEyeCerrar v-if="!isHovered" class="mr-1"/>
                            <IconEyeAbrir v-else class="mr-1"/>
                            <span class="text-[#34495e]">Informes de Conformidad</span>
                          </button>
                        </div>
                      </td>

                      <td class="px-3 py-5 flex flex-col items-center justify-center">
                        <!-- Botón para Generar -->
                        <button
                        v-if="['pendiente', 'observado'].includes(solicitude.estado ?? '')"
                          :class="[ 
                            'w-20 px-2 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none', 
                            'hover:bg-green-600' 
                          ]"  :disabled="['tramitado'].includes(solicitude.estado ?? '')"
                          @click="openModal(solicitude.oficio_id)"
                        >
                          Generar
                        </button>

                        <!-- Botón para Observar -->
                        <button
                          v-if="['pendiente', 'observado'].includes(solicitude.estado ?? '')"
                          :class="[ 
                            'w-20 px-2 py-1 text-sm text-white bg-[#e79e38] rounded-xl focus:outline-none', 
                            'hover:bg-gray-400'
                          ]" :disabled="['tramitado'].includes(solicitude.estado ?? '')"
                          @click="openRejectModal(solicitude.oficio_id)"
                        >
                          Observar
                        </button>

                        <!-- Enlace para Visualizar Oficio (deshabilitado por ahora) -->
                        <button>
                          <a
                            :href="`${VIEW_AINFORME }/${solicitude.oficio_id}`" 
                            target="_blank"
                            class="flex items-center m-2 relative group"
                            v-if="['tramitado'].includes(solicitude.estado)"
                          >
                            <IconEyeCerrar class="mr-1 group-hover:hidden" />
                            <IconEyeAbrir class="mr-1 hidden group-hover:block" />
                            <span class="text-[#34495e]">Oficio</span>
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
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-3 border-b border-gray-200">
              <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
                Se autogenerará el oficio para este estudiante
              </h5>
            </div>
            <div class="p-6">
              <p class="text-gray-500 text-lg text-left mb-2">
                Por favor dígite el N° de oficio.
              </p>
              <input 
                type="text" 
                id="nroOficio1" 
                v-model="nroOficio1" 
                class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" 
                maxlength="3" 
                @input="validateNroOficio"
                required>
                <p v-if="nroOficio1.length !== 3 && nroOficio1 !== ''" class="text-red-800 mb-3">Debe ingresar 3 dígitos</p>
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
            <div class="flex items-center justify-center p-3  border-gray-200">
              <button class="px-3 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl"
                @click="closeModal">
                Cancelar
              </button>
              <button class="ml-4 px-3 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl" :disabled="!formIsValid" 
                @click="updateOffice">
                Enviar
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de observacion -->
        <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-3 border-b border-gray-200">
              <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
                Observación
              </h5>
            </div>
            <div class="p-6 bg-white rounded-lg">
              <p class="text-gray-600 text-lg text-center mb-4">
                Por favor escriba el motivo de su observación
              </p>
              <textarea class="text-gray-950 rounded-md w-full mt-3 border text-lg focus:border-gray-900 focus:ring-0" name="observarTesis" id="observarTesis" v-model="motivoObservacion" placeholder="Escriba aquí..."></textarea>
            </div>
            <div class="flex items-center justify-center p-3  border-gray-200">
              <button
                class="px-4 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl"
                @click="closeModal">
                Cancelar
              </button>
              <button class="ml-4 px-4 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl hover:bg-base"
                @click="rejectSolicitude">
                Confirmar
              </button>
            </div>
          </div>
        </div>

         <!-- Modal de documentos -->
         <div v-if="showDocumentModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeDocumentModal">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeDocumentModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-8 border-b border-gray-200">
              <h5 class="text-2xl font-medium text-gray-900 text-center flex-1">Documentos Adjuntos</h5>
            </div>
            <div class="p-6 bg-white rounded-lg">
              <!-- Conformidad Presidente -->
              <div class="flex justify-between items-center" v-if="presidenteId">
                <p class="text-gray-600 text-lg">Conformidad Presidente</p>
                <a
                  :href="`${VIEW_CPA}/${presidenteId}`"
                  target="_blank"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                  class="flex items-center">
                  <IconEyeCerrar v-if="!isHovered" class="mr-1"/>
                  <IconEyeAbrir v-else class="mr-1"/>
                  <span class="text-[#34495e]">Visualizar</span>
                </a>
              </div>
              <hr>
        <br>

              <!-- Conformidad Secretario -->
              <div class="flex justify-between items-center" v-if="secretarioId">
                <p class="text-gray-600 text-lg">Conformidad Secretario</p>
                <a
                  :href="`${VIEW_CPA}/${secretarioId}`"
                  target="_blank"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                  class="flex items-center">
                  <IconEyeCerrar v-if="!isHovered" class="mr-1"/>
                  <IconEyeAbrir v-else class="mr-1"/>
                  <span class="text-[#34495e]">Visualizar</span>
                </a>
              </div>
        <hr>
        <br>
              <!-- Conformidad Vocal -->
              <div class="flex justify-between items-center" v-if="vocalId">
                <p class="text-gray-600 text-lg">Conformidad Vocal</p>
                <a
                  :href="`${VIEW_CPA}/${vocalId}`"
                  target="_blank"
                  @mouseenter="isHovered = true"
                  @mouseleave="isHovered = false"
                  class="flex items-center">
                  <IconEyeCerrar v-if="!isHovered" class="mr-1"/>
                  <IconEyeAbrir v-else class="mr-1"/>
                  <span class="text-[#34495e]">Visualizar</span>
                </a>
              </div>
            </div>
            <div class="flex items-center justify-center p-6 border-t border-gray-200">
              <button class="px-3 py-2 text-xm font-thin text-white bg-[#5d6d7e] rounded-2xl" @click="closeDocumentModal">Cancelar</button>
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
  background-color: #39B49E;
  color: #ffffff;
}

.estado-aceptado {
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