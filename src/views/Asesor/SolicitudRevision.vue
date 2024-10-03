<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import { alertToast } from "@/functions";

// Define una interfaz para los datos de la solicitud
interface Solicitud {
  id: string;
  rev_status: string;
  sol_title_inve: string;
  estudiante: {
    stu_name: string;
  };
}

// Texto de tipo máquina de escribir
const text = "Pendientes de solicitudes de asesoría";
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

// Estado de los modales y datos
const showModal = ref(false);
const showRejectModal = ref(false);
const nroCarta = ref("");
const motivoRechazo = ref("");
const isHovered = ref(false);
const selectedFilter = ref("");
const rowsPerPage = ref(5);
const currentPage = ref(1);
const tableData = ref<Solicitud[]>([]);
const load = ref(false);
const authStore = useAuthStore();
let solicitudSeleccionada = ref<string | null>(null);

// Variables para el archivo
const fileInput = ref<HTMLInputElement | null>(null); // Input file ref
const fileName = ref<string | null>(null); // Nombre del archivo
const selectedFile = ref<File | null>(null); // Archivo seleccionado

// Función para manejar la subida de archivo
const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (file) {
    fileName.value = file.name;
    selectedFile.value = file;
  }
};

// Función para leer el archivo y convertirlo en una cadena (en base64 o texto)
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file); // Alternativamente, puedes usar readAsDataURL(file) para base64
  });
};

// Función para abrir y cerrar modales
function openModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId;  
  showModal.value = true;
}

function openRejectModal(solicitudId: string) {
  solicitudSeleccionada.value = solicitudId;  
  showRejectModal.value = true;
}


// Función para cerrar ambos modales
function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
  nroCarta.value = "";
  motivoRechazo.value = "";
  fileName.value = null;
  selectedFile.value = null;
}

// Función para enviar archivo y observación al backend usando la API
const sendObservacion = async () => {
  try {
    // Verificar si hay un archivo seleccionado
    if (!selectedFile.value) {
      alertToast("Debe seleccionar un archivo", "Error", "error");
      return;
    }

    // Verificar si hay una solicitud seleccionada
    const solicitudeId = solicitudSeleccionada.value;
    if (!solicitudeId) {
      alertToast("Debe seleccionar una solicitud", "Error", "error");
      return;
    }

    // Leer el archivo como texto (o base64)
    const fileContent = await readFileAsText(selectedFile.value);

    const params = {
      rev_status: "observado",
      rev_file: fileContent, // Archivo como contenido
    };

    // Realizar la solicitud PUT al backend
    const response = await axios.put(`/api/student/review/${solicitudeId}/status`, params);

    if (response.data.status) {
      const solicitud = tableData.value.find((sol) => sol.id === solicitudeId);
      if (solicitud) solicitud.rev_status = "observado";
      closeModal(); // Cerrar el modal
      alertToast("La solicitud ha sido observada", "Éxito", "success");
    }
  } catch (error) {
    console.error("Error al observar la solicitud:", error);
    alertToast("Ocurrió un error al observar la solicitud", "Error", "error");
  }
};

// Función para obtener las solicitudes del backend
const fetchSolicitudes = async () => {
  load.value = true;

  try {
    const response = await axios.get(`/api/adviser/get-review/${authStore.id}`);
    if (response.data && response.data.data) {
      const solicitudes: Solicitud[] = response.data.data;
      tableData.value = solicitudes;
    }
  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
  } finally {
    load.value = false;
  }
};

// Filtrar datos y aplicar paginación
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  // Aplicar filtro por estado (reemplazar `estado` con `rev_status`)
  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.rev_status === selectedFilter.value.toLowerCase()
    );
  }

  // Paginación
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter(
        (data) => data.rev_status === selectedFilter.value.toLowerCase()
      )
    : tableData.value;

  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Navegación de paginación
function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

onMounted(() => {
  fetchSolicitudes();
});
</script>



<template>
  <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
    <div class="flex-1 p-10 overflow-auto">
      <h3 class="text-4xl font-semibold text-center text-azul">
        {{ textoTipiado }}
      </h3>
      <div class="mt-8">
        <div class="mt-6">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <div class="w-full flex justify-end items-center space-x-2">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <IconBuscar />
                </span>
                <input placeholder="Buscar" class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg appearance-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"/>
              </div>
              <div class="relative">
                <select v-model="rowsPerPage" class="block w-full h-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-gray-500">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>

              <div class="relative">
                <select v-model="selectedFilter" class="block w-full h-full px-4 py-2 pr-8 leading-tight font-Thin 100 text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-nonefocus:bg-white focus:border-gray-500">
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Observado">Observado</option>
                  <option value="Aprobado">Aprobado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tabla de proyectos de tesis -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-black border-b-2 bg-gray-300">
                    <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-2 px-3 text-left tracking-wider">TÍTULO</th>
                    <th class="py-2 px-4 tracking-wider">VISUALIZAR TESIS</th>
                    <th class="py-2 px-3 tracking-wider">N° REVISIÓN</th>
                    <th class="py-2 px-4 tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-4 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, index) in filteredTableData" :key="index" :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'" class="border-b border-gray-200">
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 whitespace-nowrap w-64">{{ u.stu_name }}</p>
                    </td>
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-80">{{ u.sol_title_inve }}</p>
                    </td>
                    <td class="px-3 py-5 text-center"><a target="_blank" class="text-blue-800 hover:underline">Ver proyecto</a></td>
                    <td class="px-3 py-5 text-center">{{ u.rev_count }}</td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        class="w-24 px-4 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none"
                        @click="openModal(u.id)">Aprobar
                      </button>
                      <button
                            v-if="['pendiente', 'observado'].includes(u.rev_status)"
                            :class="[
                              'w-20 px-3 py-1 text-sm text-white bg-[#6d6868] rounded-xl focus:outline-none transform active:translate-y-1 transition-transform duration-150',
                              ['observado'].includes(u.rev_status)
                                ? 'cursor-not-allowed'
                                : 'hover:bg-gray-600',
                            ]"
                            :disabled="['rechazado'].includes(u.rev_status)"
                            @click="openRejectModal(u.id)">
                            Observar
                          </button>
                    </td>

                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.rev_status.toLowerCase().replace(' ', '-')}`">{{ u.rev_status }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-900 xs:text-sm"
                  >Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                  {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de
                  {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button
                    :disabled="currentPage === 1"
                    @click="goToPreviousPage"
                    class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-s-2xl">
                    Anterior
                  </button>
                  <button
                    :disabled="currentPage === totalPages"
                    @click="goToNextPage"
                    class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-e-2xl">
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para aprobar proyecto -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
              Aprobación de proyecto
            </h5>
          </div>
          <div class="p-6">
            <p class="text-black text-lg text-center">
              ¿Está seguro de que el proyecto de tesis ya no requiere observaciones adicionales?
            </p>
          </div>
          <div class="flex items-center justify-end p-3 border-t border-gray-200">
            <button
              class="px-4 py-2 text-lg text-white bg-[#5d6d7e] rounded-2xl"
              @click="closeModal">
              Cancelar
            </button>
            <button
              class="ml-4 px-4 py-2 text-lg text-white bg-base rounded-2xl"
              @click="closeModal">
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para corregir y observar proyecto -->
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          <div class="flex justify-end items-start">
            <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
              <IconCerrar />
            </button>
          </div>
          <div class="flex items-start justify-between p-3 border-b border-gray-200">
            <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
              Observación de proyecto
            </h5>
          </div>
          <div class="p-6">
            <p class="text-black text-lg text-center mb-4">¿Desea agregar correcciones a este proyecto de tesis?</p>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition flex flex-col items-center justify-center" @dragover.prevent @drop.prevent="handleDrop">
              <p class="text-black text-base mb-4">Arrastra y suelta el archivo aquí o</p>
              <button class="flex items-center text-black underline" @click="fileInput.click()">
                <IconCerrar class="mr-2"/> 
                <span>Subir archivo</span>
              </button>
              <input type="file" id="file" ref="fileInput" class="hidden" @change="handleFileUpload">
              <div v-if="fileName" class="mt-4 text-sl text-azul">
                <span>Archivo: </span><strong>{{ fileName }}</strong>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end p-3 border-t border-gray-200">
            <button class="px-4 py-2 text-lg text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
            <button class="ml-4 px-4 py-2 text-lg text-white bg-base rounded-2xl" @click="sendObservacion">Enviar</button>
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
