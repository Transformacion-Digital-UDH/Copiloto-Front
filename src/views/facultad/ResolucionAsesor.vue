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

// Estados y propiedades
const selectedFilter = ref<string>("");
const rowsPerPage = ref<number>(5);
const currentPage = ref<number>(1);
const showModal = ref<boolean>(false);
const showRejectModal = ref<boolean>(false);
const showSendModal = ref<boolean>(false);
const nroExpedi = ref<string>(''); // Número de expediente
const nroResolucion = ref<string>(''); // Número de resolución

// Estado de carga y datos
const isLoading = ref<boolean>(false);  // Añadimos isLoading para mostrar el estado de carga
const tableData = ref<any[]>([]);  // El tipo de los datos de la tabla lo dejamos como un array de objetos
const selectedOfficeId = ref<number | null>(null); // ID de la resolución seleccionada

// Función para abrir y cerrar modales
function openSendModal() {
  showSendModal.value = true;
}

function openModal(officeId: number) {
  selectedOfficeId.value = officeId; // Guardar el ID de la resolución seleccionada
  showModal.value = true;
}

function openRejectModal() {
  showRejectModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; // cerrar ambos modales
  showSendModal.value = false;
  nroResolucion.value = ''; // Limpiar el número de resolución al cerrar
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

// Función para obtener los datos desde la API
const fetchOffices = async () => {
  isLoading.value = true;

  try {
    const response = await axios.get('/api/faculty/getOffices');
    console.log(response.data);
    tableData.value = response.data.data; 
  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
  } finally {
    isLoading.value = false;
  }
};

// Función para generar la resolución
const generateResolution = async () => {
  if (!selectedOfficeId.value || !nroResolucion.value) {
    alert("Debe ingresar el número de resolución.");
    return;
  }

  try {
    // Datos a enviar según la estructura de la API
    const payload = {
      office_id: selectedOfficeId.value, // ID del oficio/resolución
      res_status: "tramitado",           // Estado tramitado
      res_num_res: nroResolucion.value,  // Número de resolución ingresado por el usuario
      res_date_emit: new Date().toISOString().split('T')[0], // Fecha de emisión
    };

    const response = await axios.post('/api/resolution/store', payload);
    console.log("Resolución creada:", response.data);
    alert("Resolución generada exitosamente.");
    closeModal(); // Cerrar modal después de éxito
  } catch (error) {
    console.error("Error al generar la resolución:", error);
    alert("Hubo un error al generar la resolución.");
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
      <div v-if="isLoading" class="flex justify-center text-xl text-base">
          <span>Cargando solicitudes...</span>
      </div>

      <div v-else>
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <div class="w-full flex justify-end items-center space-x-2">
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
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.estudiante_nombre || 'Nombre desconocido' }}
                      </p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.asesor_nombre || 'Asesor desconocido' }}
                      </p>
                    </td>
                    <td class="text-center px-4">
                      <button>
                        <IconPdf />
                      </button>
                    </td>
                    <td class="px-3 py-5 text-base text-center">
                      <p class="text-gray-900 text-wrap w-32">
                        {{ u.fecha_creado || 'Fecha no disponible' }}
                      </p>
                    </td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal(u.id)"
                      >
                        Generar
                      </button>
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-black bg-gray-300 rounded-xl focus:outline-none"
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
      
      <!-- Modal para generar resolución -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-xl font-light text-gray-900 text-center flex-1">
              Generar Resolución
            </h5>
          </div>
          <div class="p-6">
            <p class="text-gray-500 text-base text-left mb-2">
              Ingrese el número de resolución
            </p>
            <input type="text" v-model="nroResolucion" class="px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" maxlength="10" placeholder="Ej: 2024-001" />
          </div>
          <div class="flex items-center justify-end p-3 border-t border-gray-200">
            <button class="px-4 py-2 text-sm text-white bg-gray-500 rounded-2xl" @click="closeModal">
              Cancelar
            </button>
            <button class="ml-4 px-4 py-2 text-sm text-white bg-blue-600 rounded-2xl" @click="generateResolution">
              Generar
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
</style>
