<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";
import { useAuthStore } from "@/stores/auth";

// Interfaces
interface Comment {
  id: string; // ID del comentario
  author: string; // Autor del comentario
  content: string; // Contenido del comentario
  created_time: string; // Fecha de creación
}

interface Solicitude {
  id: string; // ID del estudiante
  nombre: string; // Nombre del estudiante
  fecha: string; // Fecha de la solicitud o actualización
  comentarios: Comment[]; // Lista de comentarios
}

// Variables Reactivas
const load = ref<boolean>(false); // Indicador de carga
const textoTipiado1 = ref(""); // Texto animado
const tableData = ref<Solicitude[]>([]); // Datos para la tabla
const showCommentModal = ref(false); // Control del modal
const currentComments = ref<Comment[]>([]); // Comentarios en el modal
const rowsPerPage = ref<number>(5); // Filas por página
const currentPage = ref<number>(1); // Página actual
const searchQuery = ref<string>(""); // Término de búsqueda
const authStore = useAuthStore(); // Estado de autenticación

// Animación de texto
const text = "Turnitin - Tercer filtro";
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado1.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};

// Función para abrir el modal de comentarios
function openCommentModal(comments: Comment[]) {
  currentComments.value = comments;
  showCommentModal.value = true;
}

// Función para cerrar el modal
function closeCommentModal() {
  currentComments.value = [];
  showCommentModal.value = false;
}

// Función para obtener datos del estudiante
const obtenerDatosEstudiante = async () => {
  if (!authStore.id) {
    console.error("El ID del estudiante no está definido en el authStore");
    return;
  }

  load.value = true;
  const estudiante_id = authStore.id; // ID del estudiante
  try {
    const response = await axios.get(`/api/vri/coments/${estudiante_id}`);
    console.log("Datos recibidos del estudiante:", response.data);

    // Mapear los datos al formato de `tableData`
    if (response.data) {
      tableData.value = [
        {
          id: response.data.est_id, // ID del estudiante
          nombre: response.data.est_nombre, // Nombre del estudiante
          fecha: response.data.updated_at, // Última actualización
          comentarios: response.data.comentarios.comments, // Comentarios asociados
        },
      ];
      console.log("Datos mapeados para la tabla:", tableData.value);
    } else {
      console.warn("No se recibieron datos del estudiante");
    }
  } catch (error: any) {
    console.error("Error al obtener datos del estudiante", error.response?.data?.mensaje || error.message);
  } finally {
    load.value = false;
  }
};

// Filtrado por búsqueda y paginación
const filteredTableData = computed(() => {
  // Filtro por búsqueda
  let filtered = tableData.value.filter((item) =>
    item.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  // Paginación
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filtered.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(
    tableData.value.filter((item) =>
      item.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).length / rowsPerPage.value
  )
);

// Funciones para paginación
const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Ejecutar al montar el componente
onMounted(() => {
  typeWriter(); // Animación del título
  obtenerDatosEstudiante(); // Cargar los datos del estudiante
});
</script>

<template>
    <div v-if="load" class="flex h-screen justify-center items-center">
      <div class="loader">Cargando...</div>
    </div>
    <div v-else class="flex h-screen border-s-2 font-Roboto bg-gray-100">
      <div class="flex-1 p-10 overflow-auto">
        <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado1 }}</h3>
  
        <!-- Barra de búsqueda y filas por página -->
        <div class="mt-8 flex justify-between items-center max-w-4xl mx-auto">
          <!-- Barra de búsqueda -->
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
              <IconBuscar />
            </span>
            <input
              v-model="searchQuery"
              placeholder="Buscar"
              class="block w-full py-2 pl-8 pr-4 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-base transition ease-in-out duration-300"
            />
          </div>
  
          <!-- Selector de filas por página -->
          <div class="relative ml-4">
            <select
              v-model="rowsPerPage"
              class="block w-full px-4 py-2 text-base bg-white border border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-base transition ease-in-out duration-300"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
  
        <!-- Tabla -->
        <div class="mt-4 flex justify-center">
          <div class="w-full max-w-4xl px-4 py-4 overflow-hidden rounded-lg shadow bg-white">
            <table class="min-w-full leading-normal">
              <thead class="custom-thead font-Quicksand">
                <tr class="text-center text-azul border-b-2 bg-gray-300">
                  <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                  <th class="py-2 px-3 text-center tracking-wider">COMENTARIOS</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="solicitude in filteredTableData"
                  :key="solicitude.id"
                  class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300"
                >
                  <td class="px-3 py-5 text-base">
                    <p class="text-gray-900 text-wrap w-64 uppercase">{{ solicitude.nombre }}</p>
                  </td>
                  <td class="px-3 py-5 text-center">
                    <div class="flex justify-center items-center space-x-2">
                      <button
                        class="flex items-center justify-center text-azul hover:underline"
                        @click="openCommentModal(solicitude.comentarios)"
                      >
                        <IconEyeCerrar class="mr-1 w-5 h-5" />
                        <span class="text-[#34495e]">Ver comentarios</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Paginación -->
        <div class="mt-4 flex justify-between items-center max-w-4xl mx-auto">
          <span class="text-sm text-gray-500 italic">
            Mostrando del {{ (currentPage - 1) * rowsPerPage + 1 }} al
            {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}
          </span>
          <div class="flex space-x-2">
            <button
              :disabled="currentPage === 1"
              @click="goToPreviousPage"
              class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-lg"
            >
              Anterior
            </button>
            <button
              :disabled="currentPage === totalPages"
              @click="goToNextPage"
              class="px-4 py-2 text-white bg-base hover:bg-baseClarito rounded-lg"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal de Comentarios -->
      <div
        v-if="showCommentModal"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center"
      >
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 class="text-xl font-semibold mb-4 text-gray-700">Comentarios</h3>
          <ul class="space-y-3">
            <li
              v-for="comment in currentComments"
              :key="comment.id"
              class="border-b pb-2 text-gray-700"
            >
              <p class="font-bold">{{ comment.author }}</p>
              <p class="text-sm">{{ comment.content }}</p>
              <p class="text-xs text-gray-500">{{ comment.created_time }}</p>
            </li>
          </ul>
          <button
            class="mt-4 w-full bg-base text-white py-2 rounded hover:bg-baseClarito"
            @click="closeCommentModal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </template>
  

