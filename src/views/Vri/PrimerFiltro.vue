<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";
import { alertToast } from "@/functions";

// Interfaces
interface Solicitude {
  id: string;
  nombre: string;
  filtroId: string;
  filtroFecha: string;
  filtroEstado: string;
  documentos: Document[];
}

interface Document {
  nombre: string;
  emisor: string;
  fechaEmision: string;
  urlView: string;
  urlDownload: string;
}

// Variables Reactivas
const load = ref<boolean>(false); // Indicador de carga
const textoTipiado1 = ref(""); // Texto animado
const tableData = ref<Solicitude[]>([]); // Solicitudes cargadas
const documents = ref<Document[]>([]); // Documentos del modal
const isHovered = ref(false); // Efecto hover en botones
const selectedFilter = ref(""); // Filtro de estado
const rowsPerPage = ref(5); // Filas por página
const currentPage = ref(1); // Página actual
const showDocumentModal = ref(false); // Modal de documentos

// Animación de texto
const text = "Validación de documentos - Primer filtro";
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado1.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};

// Función para abrir modal con documentos
function openDocumentModal(docs: Document[]) {
  documents.value = docs;
  showDocumentModal.value = true;
}

// Función para cerrar el modal de documentos
function closeDocumentModal() {
  documents.value = [];
  showDocumentModal.value = false;
}

// Función para obtener solicitudes desde la API
// Función para obtener solicitudes desde la API
const fetchSolicitudes = async () => {
  try {
    const response = await axios.get("/api/vri/get-primer-filtro");
    console.log("Datos recibidos:", response.data);

    // Mapear cada solicitud y sus documentos
    tableData.value = response.data.map((item: any) => ({
      id: item.estudiante_id,
      nombre: item.nombre,
      filtroId: item.filtro_id,
      filtroFecha: item.filtro_fecha,
      filtroEstado: item.filtro_estado,
      documentos: item.documentos.map((doc: any) => {
        // Detectar tipo de documento para asignar la URL correcta
        let viewUrl = "";
        let downloadUrl = "";

        if (doc.doc_nombre === "Resolución de designación de asesor") {
          viewUrl = `${import.meta.env.VITE_URL_VIEW_RESOLUTION}/${doc.doc_id}`;
          downloadUrl = `${import.meta.env.VITE_URL_DOWNLOAD_RESOLUTION}/${doc.doc_id}`;
        } else if (doc.doc_nombre.startsWith("Acta de conformidad de informe final")) {
          viewUrl = `${import.meta.env.VITE_URL_VIEW_CPA}/${doc.doc_id}`;
          downloadUrl = `${import.meta.env.VITE_URL_DOWNLOAD_CPA}/${doc.doc_id}`;
        } else {
          console.warn(`Documento desconocido: ${doc.doc_nombre}`);
        }

        return {
          nombre: doc.doc_nombre,
          emisor: doc.doc_emisor,
          fechaEmision: doc.doc_fecha,
          urlView: viewUrl,
          urlDownload: downloadUrl,
        };
      }),
    }));
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
    alertToast("Error al cargar solicitudes", "Error", "error");
  }
};

// Función para aprobar una solicitud
const approveSolicitud = async (filterId: string) => {
  try {
    const payload = {
      fil_estado: "aprobado", // Estado que se enviará
    };
    const response = await axios.put(`/api/vri/update-filter/${filterId}/status`, payload);

    if (response.data.estado === "aprobado") {
      // Actualizar el estado en la tabla
      const solicitud = tableData.value.find((item) => item.filtroId === filterId);
      if (solicitud) solicitud.filtroEstado = "aprobado";

      // Mostrar alerta de éxito
      alertToast("La solicitud fue aprobada con éxito.", "Éxito", "success");
    }
  } catch (error) {
    console.error("Error al aprobar la solicitud:", error);
    alertToast("Error al aprobar la solicitud.", "Error", "error");
  }
};


// Filtrado y paginación
const filteredTableData = computed(() => {
  let filtered = tableData.value;
  if (selectedFilter.value) {
    filtered = filtered.filter(
      (item) =>
        item.filtroEstado?.toLowerCase() === selectedFilter.value.toLowerCase()
    );
  }
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filtered.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(
    (selectedFilter.value
      ? tableData.value.filter(
          (item) =>
            item.filtroEstado?.toLowerCase() ===
            selectedFilter.value.toLowerCase()
        )
      : tableData.value
    ).length / rowsPerPage.value
  )
);

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Ejecutar al montar el componente
onMounted(() => {
  fetchSolicitudes();
  typeWriter();
});
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
                  <tr class="text-center text-azul border-b-2 bg-gray-300">
                    <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                    <th class="py-2 px-3 text-center tracking-wider">FECHA</th>
                    <th class="py-2 px-4 text-center tracking-wider">DOCUMENTOS</th>
                    <th class="py-2 px-3 text-center tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-3 text-center tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="solicitude in filteredTableData"
                    :key="solicitude.filtroId"
                    class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300"
                  >
                    <!-- Columna Estudiante -->
                    <td class="px-3 py-5 text-base">
                      <p class="text-gray-900 text-wrap w-64 uppercase">{{ solicitude.nombre }}</p>
                    </td>

                    <!-- Columna Fecha -->
                    <td class="px-3 py-5 text-base text-center">
                      <!-- Flexbox para centrar verticalmente -->
                      <div class="flex justify-center items-center">
                        <p class="text-gray-900">{{ solicitude.filtroFecha }}</p>
                      </div>
                    </td>

                    <!-- Columna Documentos -->
                    <td class="px-3 py-5 text-center">
                      <!-- Flexbox para alinear el botón con ícono y texto -->
                      <div class="flex justify-center items-center space-x-2">
                        <button
                          @click="openDocumentModal(solicitude.documentos)"
                          class="flex items-center justify-center text-azul hover:underline"
                        >
                          <IconEyeCerrar class="mr-1 w-5 h-5" />
                          <span class="text-[#34495e]">Documentos</span>
                        </button>
                      </div>
                    </td>
                    <td class="px-3 py-5 flex flex-col items-center justify-center">
                      <button
                        :class="[ 
                          'w-24 px-4 py-1 text-sm text-white bg-base rounded-xl focus:outline-none', 
                          solicitude.filtroEstado === 'aprobado' 
                            ? 'cursor-not-allowed bg-gray-300' 
                            : 'hover:bg-green-600' 
                        ]"
                        :disabled="solicitude.filtroEstado === 'aprobado'"
                        @click="approveSolicitud(solicitude.filtroId)"
                      >
                        Aprobar
                      </button>
                      <!-- Botón de Aprobar (sin deshabilitar para pruebas) -->
                      <!-- <button
                        class="w-24 px-4 py-1 text-sm text-white bg-base rounded-xl focus:outline-none hover:bg-green-600"
                        @click="approveSolicitud(solicitude.filtroId)"
                      >
                        Aprobar
                      </button> -->
                    </td>
                    


                    <td class="px-3 py-5 text-center">
                      <span
                        :class="`estado-estilo estado-${solicitude.filtroEstado?.toLowerCase().replace(' ', '-')}`"
                      >
                        {{ solicitude.filtroEstado
                          ? solicitude.filtroEstado.charAt(0).toUpperCase() +
                            solicitude.filtroEstado.slice(1).toLowerCase()
                          : "Estado desconocido" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>


                <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage +
                  1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage"
                    class="px-4 py-2 text-white  bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage"
                    class="px-4 py-2 text-white   bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>

    
       <!-- Modal de Documentos -->
      <div 
        v-if="showDocumentModal" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 sm:p-6"
      >
        <div 
          class="relative w-full max-w-sm sm:max-w-md lg:max-w-4xl p-6 bg-white rounded-lg shadow-lg"
        >
          <!-- Encabezado -->
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg sm:text-xl lg:text-2xl font-medium text-gray-600">
              Validación de documentos
            </h3>
            <button @click="closeDocumentModal" class="text-gray-600 hover:text-gray-900">
              <IconCerrar />
            </button>
          </div>

          <!-- Tabla Responsiva -->
          <div class="overflow-x-auto mt-4">
            <table class="w-full table-auto border-collapse border rounded-md shadow">
              <thead>
                <tr class="text-center text-sm  text-azul bg-gray-300">
                  <th class="px-2 sm:px-4 py-2 text-left">DOCUMENTOS</th>
                  <th class="px-2 sm:px-4 py-2 text-left">EMISOR</th>
                  <th class="px-2 sm:px-4 py-2">FECHA EMISIÓN</th>
                  <th class="px-2 sm:px-4 py-2">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(doc, index) in documents" 
                  :key="index" 
                  class="border-b border-gray-200 text-center text-xs sm:text-sm lg:text-md"
                >
                  <td class="px-2 sm:px-4 py-2 text-left text-gray-600">
                    <p>{{ doc.nombre || "Sin documento" }}</p>
                  </td>
                  <td class="px-2 sm:px-4 py-2 text-left text-gray-600">
                    <p>{{ doc.emisor || "Sin emisor" }}</p>
                  </td>
                  <td class="px-2 sm:px-4 py-2 text-gray-600">
                    <p>{{ doc.fechaEmision || "Sin fecha" }}</p>
                  </td>
                  <td 
                    class="px-2 sm:px-4 py-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 justify-center"
                  >
                    <a 
                      :href="doc.urlView" 
                      target="_blank" 
                      class="flex items-center px-2 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-eye mr-2 text-xs"></i> Ver
                    </a>
                    <a 
                      :href="doc.urlDownload" 
                      download 
                      class="flex items-center px-2 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-download mr-2 text-xs"></i> Descargar
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Botón de Cerrar -->
          <div class="flex justify-end mt-4">
            <button 
              @click="closeDocumentModal" 
              class="px-4 py-2 text-white bg-base rounded-lg hover:bg-baseClarito"
            >
              Cerrar
            </button>
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