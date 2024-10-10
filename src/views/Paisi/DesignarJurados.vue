<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import axios from "axios";
import { alertToast } from "@/functions";

// Configuración de la tabla
const rowsPerPage = ref(5); // cantidad para mostrar en la tabla
const selectedFilter = ref(""); // para seleccionar el estado
const currentPage = ref(1); // página actual
const showModal = ref(false); // modal para elegir jurado
const showRejectModal = ref(false); // modal para editar jurado

// Texto que se escribe automáticamente
const text = "Oficio para Designación de Jurados";
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

function openModal() {
  if (!jurados.value.length) {
    fetchJurados();  // Solo cargamos los jurados si no están ya cargados
  }
  console.log('Jurados cargados en el modal:', jurados.value); // Verificar si los datos están disponibles
  showModal.value = true;
}

function openRejectModal() {
  showRejectModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false; // cerrar ambos modales
}

// Filtrado de datos y paginación
const filteredTableData = computed(() => {
  // Asegurarse de que `tableData` esté inicializado
  let filteredData = tableData.value ?? [];

  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.of_status === selectedFilter.value
    );
  }

  // Paginación de los datos filtrados
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.of_status === selectedFilter.value)
    : tableData.value ?? [];
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Funciones para cambiar de página
function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

//*********************************** INTEGRACIÓN CON EL BACKEND *************************************************** */
// Estado de carga
const load = ref(false); 
const tableData = ref<Solicitude[]>([]); // Inicializar como un array vacío

interface Solicitude {
  name: string | null;
  title: string | null;
  of_status: string;
}

// Función para obtener solicitudes desde el backend
const fetchSolicitudes = async () => {
  load.value = true;
  try {
    const response = await axios.get('/api/office/get-solicitude-juries');
    
    // Verifica si response.data está definido
    if (response.data && Array.isArray(response.data)) {
      // Mapea los datos directamente desde response.data
      tableData.value = response.data.map((item: any) => ({
        name: item.nombre || 'N/A', 
        title: item.titulo || 'N/A', 
        of_status: item.estado || 'Desconocido' 
      }));

      console.log('Datos API:', tableData.value); 
    } else {
      console.error('La respuesta de la API no contiene datos válidos:', response);
    }
  } catch (error) {
    console.error('Error al cargar las solicitudes:', error);
  } finally {
    load.value = false;
  }
};

///////////////////////////////////////////////// MODAL JURADOS /////////////////////////////////////////////////////////////////////////
// Estado de carga y datos para jurados
const jurados = ref<{ asesor: string, asesor_id: string, revisiones: { rol: string, estudiante: string, tiempo_dias: number }[] }[]>([]);
const selectedPresidente = ref('');
const selectedSecretario = ref('');
const selectedVocal = ref('');
const selectedRevisiones = ref<Revision[]>([]); // Aquí decimos que es un array de objetos de tipo Revision
const loadJurados = ref(false);

interface Revision {
  rol: string;
  estudiante: string;
  tiempo_dias: number;
}

// Interface para los jurados
interface Jurado {
  asesor: string;
  asesor_id: string;
  revisiones: Revision[];
}

// Función para obtener los jurados desde el backend
const fetchJurados = async () => {
  loadJurados.value = true;
  try {
    const response = await axios.get('/api/juries/get-select');

    console.log('Respuesta cruda de la API:', response); // Verifica la estructura de la respuesta completa

    let data = response.data.data; // Acceder a los datos internos correctamente

    if (Array.isArray(data) && data.length > 0) {
      // Asignar los datos de los jurados al estado
      jurados.value = data.map((item) => ({
        asesor: item.asesor,
        asesor_id: item.asesor_id,
        revisiones: item.revisiones || []
      }));

      console.log('Jurados procesados desde la API:', jurados.value); // Confirmar los datos cargados
    } else {
      console.error('La respuesta de la API no contiene jurados válidos');
    }
  } catch (error) {
    console.error('Error al cargar los jurados:', error);
  } finally {
    loadJurados.value = false;
  }
};

// Función para asignar jurado
const asignarJurado = () => {
  // Validar que los tres roles tengan un asesor seleccionado
  if (!selectedPresidente.value || !selectedSecretario.value || !selectedVocal.value) {
    alertToast('Por favor, selecciona un docente para cada rol.', 'error');
    return; // Salir de la función si no están todos los asesores seleccionados
  }

  // Validación para asegurar que no se seleccione el mismo asesor en más de un rol
  if (
    selectedPresidente.value === selectedSecretario.value ||
    selectedPresidente.value === selectedVocal.value ||
    selectedSecretario.value === selectedVocal.value
  ) {
    alertToast('No puedes seleccionar al mismo docente en roles diferentes', 'error');
    return; // Salir de la función si la validación falla
  }

  // Si la validación es exitosa, proceder a la asignación
  alertToast(`Jurados asignados:
    Presidente: ${selectedPresidente.value}
    Secretario: ${selectedSecretario.value}
    Vocal: ${selectedVocal.value}`, 'success');
  
  // Limpiar las selecciones después de asignar
  selectedPresidente.value = "";
  selectedSecretario.value = "";
  selectedVocal.value = "";
};



// Función para manejar la selección de un jurado y mostrar sus revisiones
const handleJuradoSelect = (rol: string, value: string) => {
  const juradoSeleccionado = jurados.value.find(jurado => jurado.asesor_id === value);

  if (juradoSeleccionado) {
    // Asignamos las revisiones
    selectedRevisiones.value = juradoSeleccionado.revisiones;
    console.log(`Revisiones para el ${rol}:`, selectedRevisiones.value);
  } else {
    // Si no hay revisiones
    selectedRevisiones.value = [];
  }
};

// Llamar a la función fetchJurados al montar el componente
onMounted(() => {
  fetchSolicitudes(); // Cargar solicitudes
  fetchJurados();     // Cargar jurados
});

</script>

<template>
  <template v-if="load">
    <div class="flex h-screen border-s-2 bg-gray-100">
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
  </template>

<template v-else>
    <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
      <div class="flex-1 p-10 overflow-auto">
        <h3 class="text-5xl font-semibold text-center text-azul">{{ textoTipiado }}</h3>

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
                    <option value="Solicitud">Solicitud</option>
                    <option value="Asignado">Asignado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tabla -->
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
              <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
                <table class="min-w-full leading-normal">
                  <thead class="custom-thead font-Quicksand">
                    <tr class="text-center text-azul border-b-2 bg-gray-300">
                      <th class="py-2 px-3 tracking-wider text-left">ESTUDIANTE</th>
                      <th class="py-2 px-3 tracking-wider text-left">TÍTULO</th>
                      <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                      <th class="py-2 px-3 tracking-wider">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(u, index) in filteredTableData" 
                      :key="index"
                      :class="index % 2 === 0 ? 'bg-white' : 'bg-grisTabla'"
                      class="border-b border-gray-200"
                    >
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-64">{{ u.name }}</p>
                      </td>
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-80">{{ u.title }}</p>
                      </td>
                      <td class="px-3 py-5 flex flex-col items-center justify-center">
                        <button class="w-24 px-5 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none" @click="openModal"> Asignar </button>
                        <button class="w-24 px-4 py-1 text-sm text-white bg-[#5d6d7e] rounded-xl focus:outline-none" @click="openRejectModal"> Enviar </button>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <span :class="`estado-estilo estado-${u.of_status.toLowerCase().replace(' ', '-')}`">{{ u.of_status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
                <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                  <span class="text-sm text-gray-900 xs:text-sm">
                    Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
                    {{ Math.min(currentPage * rowsPerPage, tableData?.length || 0) }} de
                    {{ tableData?.length || 0 }}
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
        
        <!-- Modal para la designación de jurados -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
          <div class="relative max-w-lg w-full flex flex-col p-8 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out" @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="w-full pr-4">
              <div class="flex items-start justify-between p-3">
                <h5 class="text-xl font-ligth text-gray-900 text-center flex-1">Designación de jurados</h5>
              </div>
              <div class="p-6">
                <div class="flex-1">
                  <!-- Selección del presidente -->
                  <select v-model="selectedPresidente" id="presidente" class="w-full p-2 border border-gray-300 rounded mb-4" 
                          @change="handleJuradoSelect('Presidente', selectedPresidente)">
                    <option disabled value="">Selecciona un presidente</option>
                    <option v-for="jurado in jurados" :key="jurado.asesor_id" :value="jurado.asesor_id">
                      {{ jurado.asesor }}
                    </option>
                  </select>

                  <!-- Selección del secretario -->
                  <select v-model="selectedSecretario" id="secretario" class="w-full p-2 border border-gray-300 rounded mb-4"
                          @change="handleJuradoSelect('Secretario', selectedSecretario)">
                    <option disabled value="">Selecciona un secretario</option>
                    <option v-for="jurado in jurados" :key="jurado.asesor_id" :value="jurado.asesor_id">
                      {{ jurado.asesor }}
                    </option>
                  </select>

                  <!-- Selección del vocal -->
                  <select v-model="selectedVocal" id="vocal" class="w-full p-2 border border-gray-300 rounded"
                          @change="handleJuradoSelect('Vocal', selectedVocal)">
                    <option disabled value="">Selecciona un vocal</option>
                    <option v-for="jurado in jurados" :key="jurado.asesor_id" :value="jurado.asesor_id">
                      {{ jurado.asesor }}
                    </option>
                  </select>
                </div>
              </div>
              <!-- Botón para asignar -->
                <div class="mt-6 flex justify-center">
                  <button @click="asignarJurado" class="px-4 py-2 text-base justify-center  text-white bg-[#5d6d7e] rounded-lg w-60">Asignar</button>
                </div><br>
              <div class="flex items-center justify-end p-3 border-t border-gray-600"></div>
              <!-- Tabla para mostrar las revisiones si existen -->
              <div v-if="selectedRevisiones.length" class="mt-6">
                <h3 class="text-xl font-semibold">Revisiones del jurado seleccionado</h3>
                <!-- Aplicamos un contenedor con scroll si la tabla crece mucho -->
                <div class="overflow-y-auto max-h-48"> <!-- Aquí se agrega el scroll -->
                  <table class="min-w-full table-auto mt-4 bg-white shadow-lg rounded-lg">
                    <thead>
                      <tr class="bg-gray-200 text-left">
                        <th class="px-4 py-2">Rol</th>
                        <th class="px-4 py-2">Estudiante</th>
                        <th class="px-4 py-2">Días</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(revision, index) in selectedRevisiones" :key="index">
                        <td class="border px-4 py-2">{{ revision.rol }}</td>
                        <td class="border px-4 py-2">{{ revision.estudiante }}</td>
                        <td class="border px-4 py-2">{{ revision.tiempo_dias }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div> <!-- Fin del contenedor con scroll -->
              </div>

              <!-- Mensaje cuando no hay revisiones -->
              <div v-else class="mt-6 text-gray-500 text-center">
                <p>No hay revisiones disponibles para el jurado seleccionado.</p>
              </div>
             <!-- Modal para editar la designación de jurados -->
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
.estado-asignado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-solicitud {
  background-color: #5dade2;
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
