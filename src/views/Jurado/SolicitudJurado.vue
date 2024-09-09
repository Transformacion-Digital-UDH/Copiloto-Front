<script lang="ts" setup>
import { ref, computed } from "vue";

// Variables y funciones
const activeDropdownIndex = ref<number | null>(null);
const rowsPerPage = ref(5);
const selectedFilter = ref("");
const currentPage = ref(1);
const showModal = ref(false);
const showRejectModal = ref(false);
const activo = ref(false);
const searchQuery = ref(""); // Para búsqueda

const cambiarEstado = () => {
  activo.value = !activo.value;
};

function toggleDropdown(index: number) {
  activeDropdownIndex.value =
    activeDropdownIndex.value === index ? null : index;
}

function openModal() {
  showModal.value = true;
}

function openRejectModal() {
  showRejectModal.value = true;
}

function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
}

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// Simulación de datos
const tableData = ref([
{
    estudiante: "Estudiante 1",
    titulo: "Implementación de un algoritmo muy básico para que los estudiantes entiendan y sepan qué hacer con dicho algoritmo",
    observaciones: "5",
    numRevision: "1",
    presidente: "Presidente 1",
    secretario: "Secretario 1",
    vocal: "Vocal 1",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 2",
    titulo: "Optimización de un algoritmo de búsqueda para mejorar el rendimiento en grandes datasets",
    observaciones: "10",
    numRevision: "2",
    presidente: "Presidente 2",
    secretario: "Secretario 2",
    vocal: "Vocal 2",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 3",
    titulo: "Desarrollo de una aplicación móvil para la gestión de tareas diarias",
    observaciones: "8",
    numRevision: "1",
    presidente: "Presidente 3",
    secretario: "Secretario 3",
    vocal: "Vocal 3",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 4",
    titulo: "Implementación de un sistema de recomendación basado en filtrado colaborativo",
    observaciones: "12",
    numRevision: "3",
    presidente: "Presidente 4",
    secretario: "Secretario 4",
    vocal: "Vocal 4",
    estado: "Terminado",
    estadoColor: "estado-terminado",
  },
  {
    estudiante: "Estudiante 5",
    titulo: "Creación de un chatbot para atención al cliente utilizando procesamiento de lenguaje natural",
    observaciones: "7",
    numRevision: "2",
    presidente: "Presidente 5",
    secretario: "Secretario 5",
    vocal: "Vocal 5",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 6",
    titulo: "Diseño e implementación de un sistema de gestión de inventario en línea",
    observaciones: "6",
    numRevision: "1",
    presidente: "Presidente 6",
    secretario: "Secretario 6",
    vocal: "Vocal 6",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 7",
    titulo: "Estudio de técnicas de compresión de datos para transmisión eficiente en redes",
    observaciones: "20",
    numRevision: "4",
    presidente: "Presidente 7",
    secretario: "Secretario 7",
    vocal: "Vocal 7",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 8",
    titulo: "Desarrollo de un sistema de gestión de proyectos utilizando metodología ágil",
    observaciones: "15",
    numRevision: "2",
    presidente: "Presidente 8",
    secretario: "Secretario 8",
    vocal: "Vocal 8",
    estado: "Terminado",
    estadoColor: "estado-terminado",
  },
  {
    estudiante: "Estudiante 9",
    titulo: "Implementación de un sistema de reconocimiento facial para control de accesos",
    observaciones: "9",
    numRevision: "1",
    presidente: "Presidente 9",
    secretario: "Secretario 9",
    vocal: "Vocal 9",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 10",
    titulo: "Análisis de algoritmos de clasificación y su aplicación en la detección de fraudes",
    observaciones: "11",
    numRevision: "3",
    presidente: "Presidente 10",
    secretario: "Secretario 10",
    vocal: "Vocal 10",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 11",
    titulo: "Desarrollo de una plataforma de e-learning para educación en línea",
    observaciones: "13",
    numRevision: "2",
    presidente: "Presidente 11",
    secretario: "Secretario 11",
    vocal: "Vocal 11",
    estado: "Terminado",
    estadoColor: "estado-terminado",
  },
  {
    estudiante: "Estudiante 12",
    titulo: "Optimización de consultas en bases de datos relacionales para mejorar el rendimiento",
    observaciones: "10",
    numRevision: "1",
    presidente: "Presidente 12",
    secretario: "Secretario 12",
    vocal: "Vocal 12",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 13",
    titulo: "Implementación de un sistema de detección de intrusiones en redes informáticas",
    observaciones: "16",
    numRevision: "4",
    presidente: "Presidente 13",
    secretario: "Secretario 13",
    vocal: "Vocal 13",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 14",
    titulo: "Desarrollo de un sistema de reservas en línea para restaurantes",
    observaciones: "18",
    numRevision: "3",
    presidente: "Presidente 14",
    secretario: "Secretario 14",
    vocal: "Vocal 14",
    estado: "Terminado",
    estadoColor: "estado-terminado",
  },
  {
    estudiante: "Estudiante 15",
    titulo: "Estudio y comparación de técnicas de aprendizaje automático para clasificación de imágenes",
    observaciones: "14",
    numRevision: "2",
    presidente: "Presidente 15",
    secretario: "Secretario 15",
    vocal: "Vocal 15",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 16",
    titulo: "Implementación de un sistema de análisis de sentimientos en redes sociales",
    observaciones: "12",
    numRevision: "1",
    presidente: "Presidente 16",
    secretario: "Secretario 16",
    vocal: "Vocal 16",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 17",
    titulo: "Desarrollo de una herramienta para la gestión de tareas en proyectos colaborativos",
    observaciones: "11",
    numRevision: "3",
    presidente: "Presidente 17",
    secretario: "Secretario 17",
    vocal: "Vocal 17",
    estado: "Terminado",
    estadoColor: "estado-terminado",
  },
  {
    estudiante: "Estudiante 18",
    titulo: "Análisis de seguridad en aplicaciones web y estrategias de mitigación",
    observaciones: "19",
    numRevision: "4",
    presidente: "Presidente 18",
    secretario: "Secretario 18",
    vocal: "Vocal 18",
    estado: "Pendiente",
    estadoColor: "estado-pendiente",
  },
  {
    estudiante: "Estudiante 19",
    titulo: "Implementación de un sistema de seguimiento de pedidos en línea",
    observaciones: "8",
    numRevision: "2",
    presidente: "Presidente 19",
    secretario: "Secretario 19",
    vocal: "Vocal 19",
    estado: "Corregido",
    estadoColor: "estado-corregido",
  },
  {
    estudiante: "Estudiante 20",
    titulo: "Desarrollo de una aplicación de finanzas personales con análisis predictivo",
    observaciones: "22",
    numRevision: "3",
    presidente: "Presidente 20",
    secretario: "Secretario 20",
    vocal: "Vocal 20",
    estado: "Terminado",
    estadoColor: "estado-terminado",
  },


  
]);

// Filtrar datos en base al filtro y paginación seleccionados
const filteredTableData = computed(() => {
  let filteredData = tableData.value;

  // Filtrar por búsqueda
  if (searchQuery.value) {
    filteredData = filteredData.filter((data) =>
      Object.values(data).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }

  // Filtrar por estado
  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.estado === selectedFilter.value
    );
  }

  // Paginación
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.estado === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Array de páginas para la navegación
const totalPagesArray = computed(() => {
  const totalPagesCount = totalPages.value;
  return Array.from({ length: totalPagesCount }, (_, i) => i + 1);
});

// Rango actual de elementos mostrados
const rangeInfo = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value + 1;
  const end = Math.min(
    currentPage.value * rowsPerPage.value,
    tableData.value.length
  );
  return `Mostrando ${start}-${end} of ${tableData.value.length}`;
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4">
    <h1 class="text-3xl font-bold mb-6 text-center">
      Pendientes de Confirmación
    </h1>
    <div class="relative w-full max-w-full">
      <!-- Buscador -->
      <div class="mb-6">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar..."
          class="block w-full px-6 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tabla -->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-10">
        <table
          class="w-full text-lg text-left text-gray-500 dark:black"
        >
          <thead
            class="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white"
          >
            <tr>
              <th scope="col" class="px-8 py-4">ESTUDIANTE</th>
              <th scope="col" class="px-8 py-4">TÍTULO</th>
              <th scope="col" class="px-8 py-4">OBSERVACIONES</th>
              <th scope="col" class="px-8 py-4">N° REVISIÓN</th>
              <th scope="col" class="px-8 py-4">PRESIDENTE</th>
              <th scope="col" class="px-8 py-4">SECRETARIO</th>
              <th scope="col" class="px-8 py-4">VOCAL</th>
              <th scope="col" class="px-8 py-4">ACCIÓN</th>
              <th scope="col" class="px-8 py-4">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            <tr
  v-for="(item, index) in filteredTableData"
  :key="index"
  class="border-b bg-white border-gray-200"
>
  <td
    class="px-8 py-5 font-medium text-gray-900 whitespace-nowrap"
  >
                {{ item.estudiante }}
              </td>
              <td class="px-8 py-5 title-cell">
                <p>{{ item.titulo }}</p>
              </td>
              <td class="px-8 py-5">
                {{ item.observaciones }}
              </td>
              <td class="px-8 py-5">
                {{ item.numRevision }}
              </td>
              <td class="px-8 py-5">
                {{ item.presidente }}
              </td>
              <td class="px-8 py-5">
                {{ item.secretario }}
              </td>
              <td class="px-8 py-5">
                {{ item.vocal }}
              </td>
              <td class="px-8 py-5">
                <a
                  href="#"
                  class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >Editar</a
                >
              </td>
              <td class="px-8 py-5">
                <span :class="`estado-estilo ${item.estadoColor}`">{{
                  item.estado
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Navegación -->
      <nav
        class="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
        aria-label="Table navigation"
      >
        <span
          class="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto"
        >
          {{ rangeInfo }}
        </span>
        <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
          <li>
            <a
              href="#"
              @click.prevent="goToPreviousPage"
              class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Anterior
            </a>
          </li>
          <li v-for="page in totalPagesArray" :key="page">
            <a
              href="#"
              @click.prevent="currentPage = page.valueOf()"
              :class="[
                'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
                currentPage === page.valueOf()
                  ? 'text-blue-600 border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-gray-700 dark:text-white'
                  : '',
              ]"
              :aria-current="
                currentPage === page.valueOf() ? 'page' : undefined
              "
            >
              {{ page }}
            </a>
          </li>

          <li>
            <a
              href="#"
              @click.prevent="goToNextPage"
              class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Siguiente
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.estado-estilo {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
}

.estado-terminado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-corregido {
  background-color: #e89519;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.title-cell {
  max-width: 600px;
  overflow-wrap: break-word;
}

.title-cell p {
  margin: 0;
  white-space: normal;
}
</style>
