<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { alertToast } from "@/functions";
import { useAuthStore } from "@/stores/auth";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";


// Estados y propiedades
const showCalificarModal = ref(false);
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const load = ref(false);
const calificacionNota = ref<number | undefined>(undefined);
const notaValida = ref(false);
const solicitudCalificada = ref<Review | null>(null);
const solicitudSeleccionada = ref<Review | null>(null);

const textoTipiado = ref("");
let index = 0;

// Texto que se escribe automáticamente
const text = "Notas Finales de Sustentación";
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};

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

// Interfaz y datos
interface Review {
  link_informe: string;
  revision_id: string;
  estudiante_nombre: string;
  titulo: string;
  estado: string;
  rol: string;
  count: number;
  revision_estado: string;
  rev_status: string;
  rev_num_of: number;
  oficio_generado: boolean;
  actualizado: Date;
  review_id: string;
  calificacion?: number;
  sustentacion: string;
  sustentacion_estado:string;
}

const authStore = useAuthStore();
const tableData = ref<Review[]>([]);

const VIEW_SUS = import.meta.env.VITE_URL_VIEW_SUS;

const fetchReviews = () => {
  load.value = true;
  axios
    .get(`/api/asesor/get-revisiones/sustentacion/${authStore.id}`)
    .then((response) => {
      console.log("Respuesta recibida:", response.data);
      tableData.value = response.data.data.map((review: any) => ({
        ...review,
        oficio_generado: review.rev_status === "calificado",
        calificacion: review.calificacion || undefined,
        sustentacion_estado: review.sustentacion_estado || "", // Agregar sustentacion_estado
      }));
    })
    .catch((error) => {
      console.error("Error al obtener las revisiones:", error);
    })
    .finally(() => {
      load.value = false;
    });
};


// Inicializar datos
onMounted(() => {
  typeWriter();
  fetchReviews();
});

// Validar la nota ingresada
function validateCalificacionNota() {
  notaValida.value =
    calificacionNota.value !== undefined &&
    calificacionNota.value >= 0 &&
    calificacionNota.value <= 20;
}

// Abrir modal de calificación
function openCalificarModal(revisionId: string) {
  showCalificarModal.value = true;
  solicitudCalificada.value =
    tableData.value.find((solicitud) => solicitud.revision_id === revisionId) ||
    null;
  calificacionNota.value = undefined;
  notaValida.value = false;
}

// Cerrar modal de calificación
function closeCalificarModal() {
  showCalificarModal.value = false;
  solicitudCalificada.value = null;
  calificacionNota.value = undefined;
  notaValida.value = false;
}

// Confirmar calificación (POST a /review/{review_id}/status)
function confirmarCalificacion() {
  if (!notaValida.value || solicitudCalificada.value === null) {
    alertToast("Ingrese una calificación válida entre 0 y 20", "Error", "error");
    return;
  }

  const solicitudId = solicitudCalificada.value.revision_id;
  const params = {
    rev_status: "calificado",
    rev_score: String(calificacionNota.value)
  };

  axios
    .put(`/api/review/${solicitudId}/status`, params)
    .then((response) => {
      console.log("Respuesta recibida calificar:", response.data);
      if (response.status === 200 || response.status === 201) {
        alertToast("Calificación asignada correctamente", "Éxito", "success");
        // Recargar la tabla para sincronizar el estado
        fetchReviews();
        closeCalificarModal();
      } else {
        alertToast("No se pudo asignar la calificación", "Error", "error");
      }
    })
    .catch((error) => {
      console.error("Error al asignar la calificación:", error);
      alertToast("Error al asignar la calificación", "Error", "error");
    });
}



// Emitir calificación (POST a /sustentacion/{sustentacion_id}/status)
function emitirCalificacion(solicitud: Review) {
  const params = { sus_estado: "emitido" };

  axios
    .put(`/api/sustentacion/${solicitud.sustentacion}/status`, params)
    .then((response) => {
      if (response.status === 200 || response.status === 201) {
        alertToast("Estado actualizado a 'emitido' correctamente", "Éxito", "success");
        fetchReviews(); // Recargar datos para actualizar la tabla
      } else {
        alertToast("No se pudo emitir el estado", "Error", "error");
      }
    })
    .catch((error) => {
      // Capturar el mensaje de error de la API
      const apiMessage = error.response?.data?.message;

      if (apiMessage === "No se pueden calcular suficientes puntajes válidos.") {
        alertToast(
          "No se puede emitir el estado porque aún faltan calificaciones de otros asesores.",
          "Advertencia",
          "warning"
        );
      } else {
        alertToast("Error al emitir estado", "Error", "error");
      }

      console.error("Error al emitir estado:", error);
    });
}


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
      <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado }}</h3>

      <div class="mt-8">
        <!-- Filtros de tabla -->
        <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
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
                <select v-model="rowsPerPage" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>

              <!-- Filtro de estado -->
              <div class="relative">
                <select v-model="selectedFilter" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
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
                  <th class="py-2 px-3 text-left tracking-wider">ROL</th>
                  <th class="py-2 px-3 tracking-wider">FECHA</th>
                  <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                  <th class="py-2 px-3 tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(u, index) in filteredTableData" :key="u.revision_id"
                  class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                  <td class="px-2 py-3 text-base">
                    <p class="text-gray-900 text-wrap w-58 uppercase">{{ u.estudiante_nombre }}</p>
                  </td>
                  <td class="px-2 py-3 text-base">
                    <template v-if="u.link_informe">
                      <a :href="u.link_informe" target="_blank"
                        class="text-gray-900 text-wrap w-64 hover:text-blue-700 uppercase">
                        {{ u.titulo }}
                      </a>
                    </template>
                    <template v-else>
                      <p class="text-gray-900 text-wrap w-64 uppercase">
                        {{ u.titulo }}
                      </p>
                    </template>
                  </td>
                  <td class="px-2 py-3 text-center align-middle">
                    <span class="px-3 py-1 text-white bg-base rounded-full">
                      {{ u.rol }}
                    </span>
                  </td>
                  <td class="px-2 py-3 text-center">{{ u.actualizado }}</td>
                  
                  <td class="px-2 py-3 text-center align-middle">
                    <div
                      style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px;">

                      <!-- Mostrar botón "Emitir" si el estado es calificado -->
                      <button
                        v-if="u.revision_estado === 'calificado' && u.sustentacion_estado !== 'emitido'"
                        class="w-24 px-3 py-1 text-sm bg-azul text-white rounded-xl focus:outline-none"
                        @click="emitirCalificacion(u)">
                        Emitir
                      </button>

                      <!-- Mostrar botón "Calificar" si el estado no es calificado ni emitido -->
                      <button
                        v-else-if="u.revision_estado !== 'calificado' && u.sustentacion_estado !== 'emitido'"
                        class="w-24 px-3 py-1 text-sm bg-green-400 text-white rounded-xl focus:outline-none"
                        @click="openCalificarModal(u.revision_id)">
                        Calificar
                      </button>

                      <!-- Mostrar ícono de la carta de sustentación si el estado es emitido -->
                      <a
                        v-if="u.sustentacion_estado === 'emitido'"
                        :href="`${VIEW_SUS}/${u.sustentacion}`"
                        target="_blank"
                        class="text-blue-800">
                        <button>
                          <svg fill="#39B49E" class="w-6 h-6" version="1.1" id="XMLID_38_" xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24.00 24.00" xml:space="preserve" width="64px"
                            height="64px" stroke="#39B49E" stroke-width="0.00024000000000000003">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"
                              stroke-width="0.288"></g>
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
                                  <polygon points="24,24 4,24 4,22 22,22 22,6.4 17.6,2 6,2 6,9 4,9 4,0 18.4,0 24,5.6 ">
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

                    </div>
                  </td>



                  <td class="px-2 py-3 text-center">
                    <span :class="`estado-estilo estado-${
                      u.sustentacion_estado === 'emitido'
                        ? 'emitido'
                        : u.revision_estado.toLowerCase().replace(' ', '-')
                    }`">
                      {{
                        u.sustentacion_estado === 'emitido'
                          ? 'Emitido'
                          : u.revision_estado.charAt(0).toUpperCase() + u.revision_estado.slice(1).toLowerCase()
                      }}
                    </span>
                  </td>

                </tr>
              </tbody>
            </table>

            <!-- Paginación -->
            <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
              <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage + 1
                }} al {{
                  Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
              <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                <button :disabled="currentPage === 1" @click="goToPreviousPage"
                  class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                <button :disabled="currentPage === totalPages" @click="goToNextPage"
                  class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para calificar -->
      <div v-if="showCalificarModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
        @click.self="closeCalificarModal">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button
              class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
              @click="closeCalificarModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-2xl font-light text-gray-900 text-center flex-1">Calificar Informe</h5>
          </div>
          <div class="p-6">
            <p class="text-[#5d6d7e] text-lg text-left mb-2">Ingrese una nota</p>
            <input
        type="number"
        v-model="calificacionNota"
        class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0"
        min="0"
        max="20"
        @input="validateCalificacionNota"
        required
      />

      <p v-if="(calificacionNota ?? 0) < 0 || (calificacionNota ?? 0) > 20" class="text-red-800">
        Debe ingresar una nota válida entre 0 y 20
      </p>

          </div>
          <div class="flex items-center justify-center p-1 border-gray-200">
            <button
              class="px-4 py-2 text-sm text-white bg-gray-500 rounded-2xl"
              @click="closeCalificarModal">
              Cancelar
            </button>
            <button
              class="ml-4 px-4 py-2 text-sm text-white bg-green-400 rounded-2xl"
              :disabled="!notaValida"
              @click="confirmarCalificacion">
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
  font-size: 0.75rem;
  /* Se reduce el tamaño de la fuente */
  font-weight: 400;
  border-radius: 0.375rem;
}
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.estado-emitido {
  background-color: #011B4B;
  color: #ffffff;
}


.estado-calificado {
  background-color: #48bb78;
  color: #ffffff;
}

</style>
