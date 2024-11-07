<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import axios from "axios";
import { alertToast } from "@/functions";
import { useAuthStore } from "@/stores/auth";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

interface Review {
  estudiante_id: string;
  estudiante_nombre: string;
  titulo: string;
  revision_estado: string;
  rev_file: string;
  contador: number;
  [key: string]: any;
}

// ***** Texto que escribe automáticamente ********
const text = "Revisiones Pendientes de Informe Final";
const textoTipiado2 = ref("");
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado2.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};

onMounted(() => {
  typeWriter();
});
// **************************************************

// Estados para la paginación y modales
const rowsPerPage = ref(5);
const selectedFilter = ref("");
const currentPage = ref(1);
const showModal = ref(false); // Modal para aprobar proyecto
const showRejectModal = ref(false); // Modal para observar proyecto

// Funciones para abrir y cerrar modales
function openModal(id: string) {
  const solicitud = tableData.value.find((sol) => sol.estudiante_id === id);
  if (solicitud) {
    solicitudSeleccionada.value = solicitud;
    showModal.value = true;
  }
}
function openRejectModal(id: string) {
  const solicitud = tableData.value.find((sol) => sol.estudiante_id === id);
  if (solicitud) {
    solicitudSeleccionada.value = solicitud;
    showRejectModal.value = true;
  }
}
function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
  solicitudSeleccionada.value = null;
  nroCarta.value = ""; 
}

// Funciones para la paginación
function goToPreviousPage() { if (currentPage.value > 1) currentPage.value--;}
function goToNextPage() { if (currentPage.value < totalPages.value) currentPage.value++;}

// Filtrar datos y aplicar paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;
  
  if (selectedFilter.value) {
    filteredData = filteredData.filter((data) =>
      data.revision_estado.toLowerCase() === selectedFilter.value.toLowerCase()
    );
  }

// Aplicar la paginación
const startIndex = (currentPage.value - 1) * rowsPerPage.value;
const endIndex = startIndex + rowsPerPage.value;
return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.revision_estado === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

//*********************************** INTEGRACION CON EL BACKEND *************************************************** */
const solicitudSeleccionada = ref<Review | null>(null);
const nroCarta = ref("");
const authStore = useAuthStore();
const tableData = ref<Review[]>([]);
const load = ref(false);
const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;

const validateObservaciones = () => {
  nroCarta.value = nroCarta.value.replace(/[^0-9]/g, '');
  if (nroCarta.value.length > 3) {
    nroCarta.value = nroCarta.value.slice(0, 3);
  }
};

const fetchReviews = async () => {
  load.value = true;
  try {
    const response = await axios.get(`/api/asesor/get-revisiones/informe/${authStore.id}`);
    console.log("Datos recibidos de la APIs:", response.data.data);

    tableData.value = response.data.data.map((review: any) => {
      return {
        ...review,
        oficio_generado: review.revision_estado === 'aprobado',
        rev_num_of: review.rev_num_of,
        revision_id: review.revision_id
      };
    });
    console.log("Datos transformados con oficio_generado:", tableData.value);
  } catch (error) {
    console.error("Error al obtener las correcciones pendientes:", error);
  } finally {
    load.value = false;
  }
};

const sendObservacion = async () => {
  try {
    const solicitudeId = solicitudSeleccionada.value?.revision_id;
    if (!solicitudeId) {
      alert("Debe seleccionar una solicitud");
      return;
    }

    const params = {
      rev_status: "observado",  // Cambiado a rev_status
    };

    const response = await axios.put(`/api/review/${solicitudeId}/status`, params);

    if (response.data.message === "Observacion enviada") {
      await fetchReviews();
      closeModal();
      alertToast("La solicitud ha sido observada correctamente", "Éxito", "success");      
    } else {
      alert("No se pudo observar la solicitud");
    }
  } catch (error) {
    alert("Ocurrió un error al procesar la solicitud");
    console.error("Error en sendObservacion:", error);
  }
};


const acceptCorrecion = async () => {
  try {
    const solicitudId = solicitudSeleccionada.value?.revision_id;
    if (!solicitudId) {
      alert("Debe seleccionar una solicitud");
      return;
    }

    if (!nroCarta.value || nroCarta.value.length !== 3) {
      alertToast("El N° de Oficio debe tener exactamente 3 caracteres", "Error", "error");
      return;
    }

    const params = {
      rev_status: "aprobado",
      rev_num_of: nroCarta.value,
    };

    const response = await axios.put(`/api/review/${solicitudId}/status`, params);

    if (response.status === 200 || response.status === 201) {
      alertToast("El informe final ha sido aprobado", "Éxito", "success");

      // Actualiza directamente el estado en `tableData`
      const solicitud = tableData.value.find((sol) => sol.revision_id === solicitudId);
      if (solicitud) {
        solicitud.revision_estado = "aprobado";
        solicitud.oficio_generado = true;
        solicitud.rev_num_of = params.rev_num_of;
      }

      closeModal();
    } else {
      alert("Hubo un problema al aprobar la solicitud.");
    }
  } catch (error) {
    alertToast("Error al aceptar la solicitud", "Error", "error");
    console.error("Error al aceptar la corrección:", error);
  }
};

onMounted(() => {
  fetchReviews();
});
</script>

<template>
  <template v-if="load">
    <div class="flex h-screen border-s-2 bg-gray-100">
      <div class="flex-1 p-10">
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 
            class="bg-gray-200 h-9 w-3/4 rounded-lg duration-200 skeleton-loader">
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
        <h3 class="text-4xl font-semibold text-center text-azul">
          {{ textoTipiado2 }}
        </h3>
        <div class="mt-8">
          <div class="mt-6">
            <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
              <div class="w-full flex justify-end items-center space-x-2">
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                    <IconBuscar />
                  </span>
                  <input
                      placeholder="Buscar"
                      class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:gray-700 focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300"/>
                </div>
                <div class="relative">
                  <select
                    v-model="rowsPerPage"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
                <div class="relative">
                  <select
                    v-model="selectedFilter"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="observado">Observado</option>
                    <option value="aprobado">Aprobado</option>
                  </select>
                </div>
              </div>
            </div>
            <!-- Tabla de proyectos de tesis -->
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
              <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
                <table class="min-w-full leading-normal">
                  <thead class="custom-thead font-Quicksand">
                    <tr class="text-center text-azul border-b-2 bg-gray-300">
                      <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                      <th class="py-2 px-3 text-left tracking-wider">TÍTULO</th>
                      <th class="py-2 px-4 tracking-wider">VISUALIZAR INFORME</th>
                      <th class="py-2 px-3 tracking-wider">N° REVISIÓN</th>
                      <th class="py-2 px-4 tracking-wider">ACCIÓN</th>
                      <th class="py-2 px-4 tracking-wider">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(u, index) in filteredTableData" :key="u.estudiante_id" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 whitespace-nowrap w-64">{{ u.estudiante_nombre || "Nombre desconocido" }}</p>
                      </td>
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-80 uppercase">{{ u.titulo || "Título no disponible" }}</p>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <a :href="u['link-tesis']" target="_blank" class="text-blue-800 hover:text-base flex items-center justify-center group">
                          <!-- Ícono que se muestra normalmente -->
                          <IconEyeCerrar class="mr-1 group-hover:hidden" />
                          <IconEyeAbrir class="mr-1 hidden group-hover:block" />
                          <span class="text-[#34495e]">Ver proyecto</span>
                        </a>
                      </td>

                      <td class="px-3 py-5 text-center">{{ u.contador }}</td>
                      <td class="px-3 py-5 text-center align-middle">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px;">
                        <button
                           v-if="!u.oficio_generado && u.rev_status !== 'aprobado'" 
                          :disabled="u.rev_status === 'observado'" 
                          :class="['w-24 px-4 py-1 text-sm rounded-xl focus:outline-none', u.revision_estado === 'observado' ? 'bg-gray-400  text-white cursor-not-allowed' : 'bg-base text-white']"
                          @click="openModal(u.estudiante_id)">Aprobar
                        </button>
                        <button
                          v-if="!u.oficio_generado && u.rev_status !== 'aprobado'" 
                          :disabled="u.rev_status === 'observado'" 
                          :class="['w-24 px-4 py-1 text-sm rounded-xl focus:outline-none', u.revision_estado === 'observado' ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-500 text-white']"
                          @click="openRejectModal(u.estudiante_id)">Observar
                        </button>
                        <a
                          v-if="u.oficio_generado && u.revision_estado === 'aprobado'" 
                          :href="`${VIEW_CPA}/${u.revision_id}`"  
                          target="_blank" 
                          class="text-blue-800">
                        <button>
                          <svg fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.288"></g><g id="SVGRepo_iconCarrier"> <g id="document-pdf"> <g> <path d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z"></path> </g> <g> <rect x="15" y="12" width="6" height="2"></rect> </g> <g> <rect x="15" y="12" width="2" height="8"></rect> </g> <g> <rect x="15" y="16" width="5" height="2"></rect> </g> <g> <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 "></polygon> </g> <g> <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon> </g> </g> </g></svg>
                        </button>
                        <!-- <br>
                          Ver Conformidad -->
                        </a>

                        </div>
                      </td>
                      <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.revision_estado.toLowerCase().replace(' ', '-')}`">
                        {{ u.revision_estado ? u.revision_estado.charAt(0).toUpperCase() + u.revision_estado.slice(1).toLowerCase() : 'Estado desconocido' }}
                      </span>
                    </td>

                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

      <!-- Modal para aprobar proyecto -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">¿Está seguro de que este informe final ya no requiere mas observaciones?</h5>
          </div>
          <div class="p-6">
              <p class="text-[#5d6d7e] text-lg text-left mb-2">Dígite el N° de Oficio para el Documento de Conformidad</p>
              <input
                type="text"
                id="nroCarta"
                v-model="nroCarta"
                class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0"
                maxlength="3"
                inputmode="numeric"
                @input="validateObservaciones"
                required/>
                <p v-if="nroCarta.length !== 3 && nroCarta !== ''" class="text-red-800">Debe ingresar 3 dígitos</p>
            </div>
          <div class="flex items-center justify-center p-1 border-gray-200">
            <button class="px-4 py-2 text-xm text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
            <button class="ml-4 px-4 py-2 text-xm text-white bg-base rounded-2xl" :disabled="nroCarta.length !== 3" @click="acceptCorrecion">Confirmar</button>
          </div>
        </div>
      </div>

      <!-- Modal para corregir y observar proyecto -->
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Observación de proyecto</h5>
          </div>
          <div class="p-6">
            <p class="text-gray-600 text-center mb-4">¿Esta seguro que los comentarios han sido enviados correctamente en el documento de Google?</p>
          </div>
          <div class="flex items-center justify-center p-3 border-gray-200">
            <button class="px-4 py-2 text-xm text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
            <button class="ml-4 px-4 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl hover:bg-base" @click="sendObservacion">Enviar</button>
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

.estado-aprobado {
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
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
}
</style>
