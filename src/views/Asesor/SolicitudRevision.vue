<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import axios from "axios";
import { alertToast } from "@/functions";
import { useAuthStore } from "@/stores/auth";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

// ***** Texto que escribe automáticamente *********************
const text = "Pendientes de revisiones de proyecto de tesis";
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
// **************************************************************

// Estados para la paginación y modales
const rowsPerPage = ref(5);
const selectedFilter = ref("");
const currentPage = ref(1);
const showModal = ref(false); // Modal para aprobar proyecto
const showRejectModal = ref(false); // Modal para observar proyecto

function openModal(id: string) {
  const solicitud = tableData.value.find((sol) => sol.stu_id === id);
  if (solicitud) {
    solicitudSeleccionada.value = solicitud;
    showModal.value = true;
  }
}

function openRejectModal(id: string) {
  const solicitud = tableData.value.find((sol) => sol.stu_id === id);
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
      data.rev_status.toLowerCase() === selectedFilter.value.toLowerCase()
    );
  }
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  const endIndex = startIndex + rowsPerPage.value;
  return filteredData.slice(startIndex, endIndex);
});

// Calcular el total de páginas
const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.rev_status === selectedFilter.value)
    : tableData.value;
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

//*********************************** INTEGRACION CON EL BACKEND *************************************************** */
const authStore = useAuthStore();
const load = ref(false);
const tableData = ref<Review[]>([]);
const VIEW_LETTER = import.meta.env.VITE_URL_VIEW_LETTER;
const solicitudSeleccionada = ref<Review | null>(null);
const nroCarta = ref("");

const validateResolution = () => {
  nroCarta.value = nroCarta.value.replace(/[^0-9]/g, '');
  if (nroCarta.value.length > 3) {
    nroCarta.value = nroCarta.value.slice(0, 3);
  }
};

interface Review {
  stu_id: string;
  stu_name: string;
  sol_title_inve: string;
  rev_status: string;
  rev_file: string;
  rev_count: number;
  [key: string]: any; // Permite acceder a 'link-tesis' con corchetes
}

// Función para obtener las revisiones desde el backend
const fetchReviews = async () => {
  load.value = true;
  try {
    const response = await axios.get(`/api/adviser/get-review/${authStore.id}`);
    console.log("Datos recibidos de la API:", response.data.data);
    // Asume que `response.data.data` contiene un array de objetos Review
    tableData.value = response.data.data.map((review: any) => {
      return {
        ...review,
        // Agrega la propiedad `oficio_generado` basándote en el estado o alguna otra lógica
        oficio_generado: review.rev_status === 'aprobado',  // Aquí se asume que si está 'aprobado', se generó el oficio
        rev_num_of: review.rev_num_of|| null  // Almacena el ID del oficio si está presente
      };
    });
    console.log("Datos transformados con oficio_generado:", tableData.value);
  } catch (error) {
    console.error("Error al obtener las correcciones pendientes:", error);
  } finally {
    load.value = false;
  }
};

// Función para enviar la observación al estudiante
const sendObservacion = async () => {
  try {
    const solicitudeId = solicitudSeleccionada.value?.stu_id;
    if (!solicitudeId) {
      alert("Debe seleccionar una solicitud");
      return;
    }
    const params = {
      rev_status: "observado",  // Enviar el estado que deseas actualizar
    };
    const response = await axios.put(`/api/student/review/${solicitudeId}/status`, params);
    // Verificar si el servidor confirmó el envío de la observación
    if (response.data.message === "Observacion enviada") {
      alert("La solicitud ha sido observada correctamente");
      // Llamar a fetchReviews para actualizar los datos localmente
      await fetchReviews();  // <-- Esto recargará los datos actualizados
      // Cerrar el modal
      closeModal();
    } else {
      alert("No se pudo observar la solicitud");
    }
  } catch (error) {
    // Manejo de error general
    alert("Ocurrió un error al procesar la solicitud");
  }
};

// Función para aprobar las observaciones y devolver al estudiante
const acceptCorrecion = async () => {
  try {
    // Asegúrate de que la solicitud esté seleccionada
    const solicitudId = solicitudSeleccionada.value?.stu_id;
    if (!solicitudId) {
      alert("Debe seleccionar una solicitud antes de aceptar la corrección.");
      return;
    }

    // Validar el número de oficio
    if (!nroCarta.value || nroCarta.value.length !== 3) {
      alertToast("El N° de Oficio debe tener exactamente 3 caracteres", "Error", "error");
      return;
    }

    // Preparar los parámetros para la API
    const params = {
      rev_status: "aprobado",
      rev_num_of: nroCarta.value,
    };

    // Hacer la llamada a la API
    const response = await axios.put(`/api/student/review/${solicitudId}/status`, params);
    
    // Verificar la respuesta
    if (response.status === 200 || response.status === 201) {
      console.log("Datos actualizados desde la API:", response.data);

      // Actualiza manualmente la tabla con los nuevos datos
      const solicitud = tableData.value.find((sol) => sol.stu_id === solicitudId);
      if (solicitud) {
        solicitud.rev_status = 'aprobado'; // Actualiza el estado de la solicitud
        solicitud.oficio_generado = true;   // Marca como oficio generado
        solicitud.rev_num_of = nroCarta.value; // Asigna el número de oficio
      }

      alertToast("El informe de observaciones ha sido aprobado", "Éxito", "success");
      closeModal(); // Cierra el modal
    } else {
      alertToast("Hubo un problema al aprobar la solicitud.", "Error", "error");
    }
  } catch (error) {
    // Manejo de errores
    alertToast("Error al aceptar la solicitud: " + error.message, "Error", "error");
    console.error("Error:", error); // Imprime detalles del error
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
                      class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-400 rounded-lg appearance-none focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"/>
                </div>
                <div class="relative">
                  <select
                    v-model="rowsPerPage"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-gray-500">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
                <div class="relative">
                  <select
                    v-model="selectedFilter"
                    class="block w-full h-full px-4 py-2 pr-8 leading-tight font-Thin 100 text-gray-700 bg-white border border-gray-400 rounded-lg appearance-none focus:outline-nonefocus:bg-white focus:border-gray-500">
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
                    <tr v-for="(u, index) in filteredTableData" :key="u.stu_id" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 whitespace-nowrap w-64">{{ u.stu_name || "Nombre desconocido" }}</p>
                      </td>
                      <td class="px-3 py-5 text-base">
                        <p class="text-gray-900 text-wrap w-80">{{ u.sol_title_inve || "Título no disponible" }}</p>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <a :href="u['link-tesis']" target="_blank" class="text-black hover:text-blue-700 underline"> Ver documento </a>
                      </td>
                      <td class="px-3 py-5 text-center">{{ u.rev_count }}</td>
                      <td class="px-3 py-5 text-center align-middle">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px;">
                          <button
                            v-if="!u.oficio_generado"  
                            class="w-24 px-4 py-1 text-sm text-white bg-base rounded-xl focus:outline-none"
                            @click="openModal(u.stu_id)">Aprobar
                          </button>

                          <button
                            v-if="!u.oficio_generado" 
                            class="w-24 px-4 py-1 text-sm text-white bg-[#5d6d7e] rounded-xl focus:outline-none"
                            @click="openRejectModal(u.stu_id)">Observar
                          </button>
                          
                          <a 
                            :href="`${VIEW_LETTER}/${u.rev_num_of}`" 
                            target="_blank"
                            class="flex items-center m-2 relative group"
                            v-if="u.oficio_generado">
                            <IconEyeCerrar class="mr-1 group-hover:hidden" />
                            <IconEyeAbrir class="mr-1 hidden group-hover:block" />
                            <span class="text-[#34495e]"> Ver oficio</span>
                          </a>
                        </div>
                      </td>
                      <td class="px-3 py-5 text-center">
                        <span :class="`estado-estilo estado-${u.rev_status.toLowerCase().replace(' ', '-')}`">{{ u.rev_status }}</span>
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
                    <button :disabled="currentPage === 1" @click="goToPreviousPage" class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-s-2xl">Anterior</button>
                    <button :disabled="currentPage === totalPages" @click="goToNextPage" class="px-4 py-2 text-base text-white bg-gray-400 hover:bg-base rounded-e-2xl">Siguiente</button>
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
              <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Aprobación de proyecto</h5>
            </div>
            <div class="p-6">
              <p class="text-black text-lg text-center mb-4">¿Está seguro de que el proyecto de tesis ya no requiere observaciones adicionales?</p>
                <p class="text-[#5d6d7e] text-sm text-left mb-2">Digite el N° de Oficio para el documento de conformidad</p>
                <input
                  type="text"
                  id="nroCarta"
                  v-model="nroCarta"
                  class="px-2 w-full rounded-md focus:border-gray-900 focus:ring-0"
                  maxlength="3"
                  inputmode="numeric"
                  @input="validateResolution"
                  required/>
                  <p v-if="nroCarta.length !== 3 && nroCarta !== ''" class="text-red-800">Debe ingresar 3 dígitos</p>
              </div>
            <div class="flex items-center justify-end p-3 border-t border-gray-200">
              <button class="px-4 py-2 text-lg text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
              <button class="ml-4 px-4 py-2 text-lg text-white bg-base rounded-2xl" @click="acceptCorrecion" :disabled="nroCarta.length !== 3">Aceptar</button>
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
              <p class="text-black text-lg text-center mb-4">¿Está conforme con haber subido los comentarios en el documento de google?</p>
            </div>
            <div class="flex items-center justify-end p-3 border-t border-gray-200">
              <button class="px-4 py-2 text-lg text-white bg-[#5d6d7e] rounded-2xl" @click="closeModal">Cancelar</button>
              <button class="ml-4 px-4 py-2 text-lg text-white bg-base rounded-2xl hover:bg-base" @click="sendObservacion">Enviar</button>
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