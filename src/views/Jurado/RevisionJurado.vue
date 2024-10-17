<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { alertToast } from "@/functions";
import { useAuthStore } from "@/stores/auth";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";

// Estados y propiedades
const showModal = ref(false);
const showRejectModal = ref(false);
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const showArchivoModal = ref(false);
const load = ref(false);

// Texto que se escribe automáticamente
const text = "Pendientes de correción de Proyecto de Tesis";
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

function openModal(revisionId: string) {
  showModal.value = true;
  solicitudSeleccionada.value = tableData.value.find(
    (solicitud) => solicitud.revision_id === revisionId
  ) || null;
}

function openRejectModal(revisionId: string) {
  showRejectModal.value = true;
  solicitudSeleccionada.value = tableData.value.find(
    (solicitud) => solicitud.revision_id === revisionId
  ) || null;
}

function openArchivoModal() {
  showArchivoModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
  showArchivoModal.value = false;
}

// Filtrado y paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  if (selectedFilter.value) {
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

//*********************************** INTEGRACION CON EL BACKEND *************************************************** */
interface Review {
  revision_id: string;
  nombre: string;
  titulo: string;
  estado: string;
  rol: string;
  presidente_estado: string,
  presidente_cont: number,
  secretario_estado: string,
  secretario_cont: number,
  vocal_estado: string,
  vocal_cont: number,
  rev_status: string,
  rev_num_of: number,
  oficio_generado: boolean,
  presidente_aprobado: string,
  secretario_aprobado:string,
  vocal_aprobado:string,
  review_id: string,

}

const validateObservaciones = () => {
  nroCarta.value = nroCarta.value.replace(/[^0-9]/g, '');
  if (nroCarta.value.length > 3) {
    nroCarta.value = nroCarta.value.slice(0, 3);
  }
};

const solicitudSeleccionada = ref<Review | null>(null);
const nroCarta = ref("");
const authStore = useAuthStore();
const tableData = ref<Review[]>([]);
const VIEW_CPA = import.meta.env.VITE_URL_VIEW_CPA;

const fetchReviews = async () => {
  load.value = true;
  try {
    const response = await axios.get(`/api/adviser/get-review-jury/${authStore.id}`);
    console.log("Datos recibidos de la API adviser:", response.data.data);

    tableData.value = response.data.data.map((review: any) => {
      return {
        ...review,
        oficio_generado: review.rev_status === 'aprobado',
        revision_id: review.revision_id,
        presidente_aprobado: review.presidente_estado === 'aprobado',
        secretario_aprobado: review.secretario_estado === 'aprobado',
        vocal_aprobado: review.vocal_estado === 'aprobado',
        presidente_cont: review.presidente_cont,
        secretario_cont: review.secretario_cont,
        vocal_cont: review.vocal_cont,
        estado: review.estado === 'pendiente' ? 'pendiente' : review.estado,  // Actualiza el estado correctamente
        review_id: review.revision_id
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
      rev_status: "observado",
    };

    const response = await axios.put(`/api/review/${solicitudeId}/status`, params);
    console.log("que estoy enviando ", response);

    if (response.data.message === "Observacion enviada") {
      await fetchReviews(); // Asegúrate de volver a traer los datos después de la acción
      closeModal();
      alertToast("La solicitud ha sido observada correctamente", "Éxito", "success");      
    } else {
      alert("No se pudo observar la solicitud");
    }
  } catch (error) {
    alert("Ocurrió un error al procesar la solicitud");
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
      const solicitud = tableData.value.find((sol) => sol.revision_id === solicitudId);
      if (solicitud) {
        solicitud.rev_status = 'aprobado';
        solicitud.oficio_generado = true;
        solicitud.rev_num_of = response.data?.data?.rev_num_of || params.rev_num_of;  
      }
      await fetchReviews(); // Asegúrate de actualizar los datos después de aprobar
      alertToast("El proyecto de tesis ha sido aprobado", "Éxito", "success");
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
  <!-- Loader de carga -->
  <div v-if="load" class="flex h-screen border-s-2 bg-gray-100">
    <div class="flex-1 p-10">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-9 w-1/2 rounded-lg duration-200 skeleton-loader"></h3>
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

  <!-- Contenido principal -->
  <div v-else class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-5xl font-semibold text-center text-azul">{{ textoTipiado }}</h3>

      <div class="mt-8">
        <!-- Filtros de tabla -->
        <div class="flex flex-col sm:flex-row font-Roboto justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-3">
          <!-- Búsqueda -->
          <div class="relative ml-auto">  <!-- Añadimos ml-auto para empujar los filtros a la derecha -->
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
              <IconBuscar />
            </span>
            <input
              placeholder="Buscar"
              class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300"
            />
          </div>
          
          <!-- Paginación por cantidad de entradas -->
          <div class="relative">
            <select
              v-model="rowsPerPage"
              class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
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
              class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="corregido">Corregido</option>
              <option value="aprobado">Aprobado</option>
            </select>
          </div>
        </div>


        <!-- Tabla compactada -->
        <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
          <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
            <table class="min-w-full leading-normal compact-table">
              <thead class="custom-thead font-Quicksand">
                <tr class="text-center text-azul border-b-2 bg-gray-300">
                  <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                  <th class="py-2 px-3 text-left tracking-wider">TÍTULO</th>
                  <th class="py-2 px-3 tracking-wider">ROL</th>
                  <th class="py-2 px-3 tracking-wider">N° REVISIÓN</th>
                  <th class="py-2 px-3 tracking-wider">APROBADO</th>
                  <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                  <th class="py-2 px-3 tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, index) in filteredTableData" :key="u.revision_id" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-2 py-3 text-base">
                    <p class="text-gray-900 text-wrap w-48">{{ u.nombre }}</p>
                  </td>
                  <td class="px-2 py-3 text-base">
                    <p class="text-gray-900 text-wrap w-64">{{ u.titulo }}</p>
                  </td>
                  <td class="px-2 py-3 text-center">
                    <span class="px-3 py-1 text-white bg-base rounded-full">
                      {{ u.rol }}
                    </span>
                  </td>
                  <td class="px-2 py-3 text-center">{{ u.vocal_cont }}</td>
                  <td class="px-2 py-3 text-center align-middle">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 5px;">
                      <!-- Mostrar presidente si el asesor no es presidente -->
                      <div v-if="u.rol !== 'presidente'" class="w-full flex justify-center">
                        <span class="block px-3 py-1 text-white rounded-full" 
                          :class="u.presidente_aprobado ? 'bg-green-400' : 'bg-gray-400'">
                          Presidente: {{ u.presidente_aprobado ? 'Aprobado' : u.presidente_cont + ' revisiones' }}
                        </span>
                      </div>

                      <!-- Mostrar secretario si el asesor no es secretario -->
                      <div v-if="u.rol !== 'secretario'" class="w-full flex justify-center">
                        <span class="block px-3 py-1 text-white rounded-full" 
                          :class="u.secretario_aprobado ? 'bg-green-400' : 'bg-gray-400'">
                          Secretario: {{ u.secretario_aprobado ? 'Aprobado' : u.secretario_cont + ' revisiones' }}
                        </span>
                      </div>

                      <!-- Mostrar vocal si el asesor no es vocal -->
                      <div v-if="u.rol !== 'vocal'" class="w-full flex justify-center">
                        <span class="block px-3 py-1 text-white rounded-full" 
                          :class="u.vocal_aprobado ? 'bg-green-400' : 'bg-gray-400'">
                          Vocal: {{ u.vocal_aprobado ? 'Aprobado' : u.vocal_cont + ' revisiones' }}
                        </span>
                      </div>
                    </div>
                  </td>
                   
                  <td class="px-2 py-3 text-center align-middle">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px;">
                        <button
                          v-if="!u.oficio_generado && u.estado !== 'aprobado'" 
                          :disabled="u.estado === 'observado'" 
                          :class="['w-24 px-3  py-1 text-sm rounded-xl focus:outline-none', u.estado === 'observado' ? 'bg-gray-400  text-white cursor-not-allowed' : 'bg-green-400 text-white']"
                          @click="openModal(u.revision_id)">Aprobar
                        </button>
                        <button
                          v-if="!u.oficio_generado && u.estado !== 'aprobado'"  
                          :disabled="u.estado === 'observado'" 
                          :class="['w-24 px-3 py-1 text-sm rounded-xl focus:outline-none', u.estado === 'observado' ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-500 text-white']"
                          @click="openRejectModal(u.revision_id)">Observar
                        </button>
                        <a
                          v-if=" u.estado === 'aprobado'" 
                          :href="`${VIEW_CPA}/${u.revision_id}`"  
                          target="_blank" 
                          class="text-blue-800">
                        <button>
                          <svg fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px" height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.288"></g><g id="SVGRepo_iconCarrier"> <g id="document-pdf"> <g> <path d="M11,20H7v-8h4c1.6,0,3,1.5,3,3.2v1.6C14,18.5,12.6,20,11,20z M9,18h2c0.5,0,1-0.6,1-1.2v-1.6c0-0.6-0.5-1.2-1-1.2H9V18z M2,20H0v-8h3c1.7,0,3,1.3,3,3s-1.3,3-3,3H2V20z M2,16h1c0.6,0,1-0.4,1-1s-0.4-1-1-1H2V16z"></path> </g> <g> <rect x="15" y="12" width="6" height="2"></rect> </g> <g> <rect x="15" y="12" width="2" height="8"></rect> </g> <g> <rect x="15" y="16" width="5" height="2"></rect> </g> <g> <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 "></polygon> </g> <g> <polygon points="23,8 16,8 16,2 18,2 18,6 23,6 "></polygon> </g> </g> </g></svg>
                        </button>
                        </a>

                        </div>
                  </td>

                  <td class="px-2 py-3 text-center">
                    <span :class="`estado-estilo estado-${u.estado.toLowerCase().replace(' ', '-')}`">
                      {{ u.estado }}
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

      <!-- Modal para aprobar proyecto -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" @click.self="closeModal">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">¿Está seguro de que el Proyecto de Tesis ya no requiere mas observaciones?</h5>
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

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem; /* Se reduce el tamaño de la fuente */
  font-weight: 400;
  border-radius: 0.375rem;
}

.estado-terminado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-corregido {
  background-color: #5dade2;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-aprobado {
  background-color: #48bb78;
  color: #ffffff;
}

.custom-thead th {
  font-weight: 600;
  font-size: 14px; /* Tamaño reducido */
  text-transform: uppercase;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}

.compact-table td {
  padding: 4px 8px; /* Se reduce el padding para compactar más las celdas */
  font-size: 0.875rem; /* Texto más pequeño para compactar */
}
</style>
