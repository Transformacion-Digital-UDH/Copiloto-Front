<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconPdf from "@/components/icons/IconPdf.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import { alertToast } from "@/functions";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

// ***** Texto que escribe automatiqueshionmente ********
const text = "Resoluciones para designación de asesor";
const textoTipiado = ref("");
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
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
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const showModal = ref(false);
const showRejectModal = ref(false);
const showSendModal = ref(false);
const nroResolution = ref('');
const load = ref(false); 
const motivoObservacion = ref("");

// Variables de entorno
const VIEW_OFFICE = import.meta.env.VITE_URL_VIEW_OFFICE
const VIEW_RESOLUTION = import.meta.env.VITE_URL_VIEW_RESOLUTION

// Estado de la tabla que almacenará los datos de la API
const tableData = ref([]);

let oficio_id = ref(null);

// Función para abrir y cerrar modales
function openSendModal() {
  showSendModal.value = true;
}

function openModal(oficioId: string) {
  showModal.value = true;
  oficio_id.value = oficioId
}

function openRejectModal(oficioId: string) {
  showRejectModal.value = true;
  oficio_id.value = oficioId
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; // cerrar ambos modales
  showSendModal.value = false;
}

// Filtrado y paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
    // Filtrar por la propiedad "estado", ya que así es como la API lo devuelve
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
  load.value = true;

  try {
    // Llamada a la API para obtener los datos
    const response = await axios.get('api/faculty/getOffices');
    tableData.value = response.data.data; 
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


// Función generar resolucion
const updateResolution = async () => {
  try {
    const oficioId = oficio_id.value;
    const params = {
      docres_status: 'tramitado',
      docres_num_res: nroResolution.value
    };
    const response = await axios.put(`/api/resolution/${oficioId}/status`, params);  // URL y request body

    if (response.data.status) {
      const oficio = tableData.value.find((of) => of.id === oficioId);
      if (oficio) oficio.resolucion_estado = 'tramitado';  // Actualizar la tabla localmente
      closeModal();  // Cerrar el modal después de la actualización
      alertToast('La resolución a sido generado', 'Éxito', 'success');
    }

  } catch (error) {
    alertToast('Error al generar resolución', 'Error', 'error');
  }
};

// función para observar el oficio
const rejectResolution = async () => {
  try {
    const oficioId = oficio_id.value;
    const params = {
      docres_status: 'observado',
      docres_observation: motivoObservacion.value,  // Motivo de rechazo
    };
    const response = await axios.put(`/api/resolution/${oficioId}/status`, params);  // URL y request body

    if (response.data.status) {
      const oficio = tableData.value.find((of) => of.id === oficioId);
      if (oficio) oficio.resolucion_estado = 'observado';  // Actualizar la tabla localmente
      closeModal();  // Cerrar el modal   de la actualización
      alertToast('El oficio ha sido observada', 'Éxito', 'success');
    }

  } catch (error) {
    alertToast('Error al observar el oficio', 'Error', 'error');
  }
};
</script>

<template>
  <template v-if="load">
    <div class="flex h-screen bg-gray-100">
      <div class="flex-1 p-10 border-s-2 bg-gray-100">
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 class="bg-gray-200 h-12 w-[70%] rounded-lg duration-200 skeleton-loader"></h3>
        </div>
        <div class="mt-8">
          <div class="mt-4">
            <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
              <div class="w-full flex justify-end items-center space-x-2">
                <h3 class="bg-gray-200 h-12 w-[30%] rounded-lg duration-200 skeleton-loader"></h3>
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
        <h3 class="text-4xl font-semibold text-center text-azul">
          {{ textoTipiado }}
        </h3>
        <!-- Tabla de datos -->
        <div>
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
                <table class="min-w-full leading-normal">
                  <thead class="custom-thead font-Quicksand">
                    <tr class="text-center text-black border-b-2 bg-gray-300">
                      <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                      <th class="py-2 px-3 text-left tracking-wider">ASESOR</th>
                      <th class="py-2 px-4 tracking-wider">OFICIO PAISI</th>
                      <th class="py-2 px-14 text-left tracking-wider">FECHA</th>
                      <th class="py-2 px-3 tracking-wider">VALIDAR TRÁMITE</th>
                      <th class="py-2 px-3 tracking-wider">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(u, index) in filteredTableData"
                      :key="u.id"
                      :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'"
                      class="border-b border-gray-200"
                    >
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-64">
                          {{ u.estudiante_nombre || 'Nombre desconocido' }}
                        </p>
                      </td>
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-64">
                          {{ u.asesor_nombre || 'Asesor desconocido' }}
                        </p>
                      </td>
                      <td class="text-center px-4">
                        <a :href="`${VIEW_OFFICE}/${ u.id }`" target="_blank">
                          <button>
                            <IconPdf />
                          </button>
                        </a>
                      </td>
                      <td class="px-3 py-5 text-base text-center">
                        <p class="text-gray-900 text-wrap w-32">
                          {{ u.fecha_creado || 'Fecha no disponible' }}
                        </p>
                      </td>
                      <td class="px-3 py-5 flex flex-col items-center justify-center">
                        <button
                          v-if="['pendiente', 'observado'].includes(u.resolucion_estado)"
                          :class="['w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none', 
                            ['tramitado'].includes(u.resolucion_estado) 
                              ? 'cursor-not-allowed' 
                              : 'hover:bg-green-600'
                          ]"
                          :disabled="['tramitado'].includes(u.resolucion_estado)"       
                          @click="openModal(u.id)"
                        >
                          Generar
                        </button>
                        <button
                          v-if="['pendiente', 'observado'].includes(u.resolucion_estado)"
                          :class="['w-24 px-4 py-1 mb-2 text-sm text-black bg-gray-300 rounded-xl focus:outline-none', 
                            ['tramitado'].includes(u.resolucion_estado) 
                              ? 'cursor-not-allowed' 
                              : 'hover:bg-gray-400'
                          ]"
                          :disabled="['tramitado'].includes(u.resolucion_estado)"
                          @click="openRejectModal(u.id)"
                        >
                          Observar
                        </button>

                        <a
                          :href="`${VIEW_RESOLUTION}/${u.resolucion_id}`"
                          target="_blank"
                          @mouseenter="isHovered = true"
                          @mouseleave="isHovered = false"
                          v-if="['tramitado'].includes(u.resolucion_estado)"
                          class="flex items-center text-blue-950 hover:underline">
                          <IconEyeCerrar v-if="!isHovered" class="mr-1" /> 
                          <IconEyeAbrir v-else class="mr-1"/>
                          <span class="text-black text-base">Ver resolución</span>
                        </a>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <span :class="`estado-estilo estado-${u.resolucion_estado.toLowerCase().replace(' ', '-')}`">
                          {{ u.resolucion_estado || 'Estado desconocido' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
                <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                  <span class="text-sm text-gray-900 xs:text-sm">
                    Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
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
          <!-- Modal para generar un oficio al estudiante -->
          <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
            <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
              <div class="flex justify-end items-start">
                <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
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
                  Dígite el N° de expediente
                </p>
                <input type="text" id="nroResolution" v-model="nroResolution" class="px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" maxlength="4" inputmode="numeric" pattern="[0-9]*" >
              </div>
              <div class="flex items-center justify-end p-3 border-t border-gray-200">
                <button class="px-4 py-2 text-lg font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">
                  Cancelar
                </button>
                <button class="ml-4 px-4 py-2 text-lg font-Thin 100 text-white bg-base rounded-2xl" @click="updateResolution">
                  Generar
                </button>
              </div>
            </div>
          </div>

        <!-- Modal de observacion -->
        <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button  class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
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
              <textarea v-model="motivoObservacion" class="text-gray-950 rounded-md w-full mt-3 border text-lg focus:border-gray-900 focus:ring-0" name="observarTesis" id="observarTesis" placeholder="Escriba aquí..."></textarea>
            </div>
            <div class="flex items-center justify-end p-3 border-t border-gray-200">
              <button class="px-4 py-2 text-lg font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">
                Cancelar
              </button>
              <button class="ml-4 px-4 py-2 text-lg font-Thin 100 text-white bg-base rounded-2xl hover:bg-base" @click="rejectResolution">
                Confirmar
              </button>
            </div>
          </div>
        </div>

        <!-- modal para enviar tramite a la facultad 
        <div v-if="showSendModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
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
        </div -->
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
