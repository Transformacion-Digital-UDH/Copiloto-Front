<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";

// Define los tipos para observaciones y documentos
interface Observacion {
  rev_file: string;
  rev_count: number;
  updated_at: string;
  accion: string;
  estado: string;
}

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Variables reactivas para almacenar datos
const solicitudEstado = ref<string>('Pendiente');  // Estado de la solicitud
const solicitudMensaje = ref('');  // Mensaje de la solicitud
const historial = ref<any[]>([]);  // Array para almacenar el historial de observaciones

// Variables reactivas para almacenar los datos del asesor y tesis
const asesorNombre = ref<string>('');  // Nombre del asesor
const tesis = ref<string>('');  // Título de la tesis
const tesisLink = ref<string | null>(null); 
const rev_file = ref<string>(''); 
const rev_status = ref<string>(''); 
const rev_count = ref<number>(); 
const updated_at =  ref<string>(''); 
// Método para determinar la clase CSS del estado
function estadoClase(estado: string) {
  switch (estado) {
    case 'Hecho': return 'bg-green-500 text-white';
    case 'En Proceso': return 'bg-orange-500 text-white';
    case 'Pendiente': return 'bg-gray-400 text-white';
    case 'Rechazado': return 'bg-red-500 text-white';
    default: return '';
  }
}


// Estados para los modales
const mostrarModalRevision = ref(false);

//*********************************** INTEGRACION CON EL BACKEND *************************************************** */
const authStore = useAuthStore();
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

// Función para solicitar una nueva revisión
const solicitarRevision = async () => {
  try {
    const response = await axios.post(`/api/student/first-review/${authStore.id}`);
    if (response.data.status) {
      solicitudMensaje.value = 'Solicitud enviada, espere las indicaciones del asesor por favor!';
      solicitudEstado.value = 'En Proceso';  // Actualiza el estado
    }
  } catch (error: any) {
    solicitudMensaje.value = error.response?.data.message || 'Error en la solicitud';
  }
};

const obtenerRevisiones = async () => {
  try {
    const response = await axios.get(`/api/student/get-review/${authStore.id}`);
    //console.log("Datos recibidos de la API:", response.data);

    if (response.data.status) {
      // Asigna los valores recibidos de la API a las variables reactivas
      asesorNombre.value = response.data.data.asesor;
      tesis.value = response.data.data.título;
      tesisLink.value = response.data.data['link-tesis'] || null;  // Asigna null si no hay link

      // Cargar el historial para las observaciones
      if (response.data.data.historial) {
        historial.value = response.data.data.historial;  // Guardar el historial completo
      }
    }
  } catch (error: any) {
    solicitudMensaje.value = error.response?.data.message || "Error al cargar los datos.";
  }
};

// Computed para las observaciones derivadas del historial
const ObetenerRev = async () => {
  try {
    const response = await axios.get(`/api/student/get-review/${authStore.id}`);
    console.log("Datos recibidos de historial:", response.data);

    if (response.data.status) {
      console.log("Estructura de los datos recibidos:", response.data);
      
      // Asigna los valores recibidos de la API a las variables reactivas
      rev_file.value = response.data.revision.rev_file;
      rev_count.value = response.data.revision.rev_count;
      updated_at.value = response.data.revision.updated_at || null;
      rev_status.value = response.data.revision.rev_status;  // Asigna null si no hay link
      
      // Verifica si el historial existe directamente en response.data
      if (response.data.historial) {
        console.log("Historial completo:", response.data.historial);
        historial.value = response.data.historial || [];  // Asigna el historial si existe
      } else {
        console.error("No se encontró el historial en la estructura de datos");
      }
    }
  } catch (error) {
    console.error("Error al cargar los datos:", error.response?.data.message || "Error desconocido.");
  }
};


// Llama a la función cuando el componente se monta
onMounted(() => {
  obtenerRevisiones();
  ObetenerRev();
  solicitarRevision();
});
</script>

<template>
  <div class="flex-1 p-10 border-s-2 bg-gray-100 font-roboto">
    <h3 class="text-4xl font-bold text-center text-azul">Conformidad de proyecto de tesis por el asesor</h3>

    <div class="mt-6 space-y-10">
      <!-- Información del asesor y tesis -->
      <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-white">
        <p class="text-lg mb-2"><strong>Asesor:</strong> {{ asesorNombre }}</p>
        <p class="text-lg mb-2"><strong>Título de Tesis:</strong> {{ tesis }}</p>

        <!-- Mostrar el link solo si existe -->
        <p class="text-lg break-words">
          <strong>Link de tesis:</strong>
          <a v-if="tesisLink" :href="tesisLink" class="text-blue-500 underline break-all">{{ tesisLink }}</a>
          <span v-else>No disponible</span> <!-- Muestra un mensaje si no hay link -->
        </p>
      </div>

      <!-- Observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center justify-between">
          <h4 class="text-2xl font-medium text-black mb-3">1. Observaciones</h4>
          <div class="relative">
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                 @mouseover="mostrarModalRevision = true"
                 @mouseleave="mostrarModalRevision = false" />
            <div v-if="mostrarModalRevision" class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
              <p class="text-sm text-gray-600">
                Asegúrate de revisar todas las observaciones antes de solicitar una nueva revisión.
              </p>
            </div>
          </div>
        </div>

        <!-- Estado de la solicitud -->
        <div class="flex items-center justify-between">
          <p class="text-gray-500">Haz click en el botón de Solicitar Revisión para iniciar</p>
          <span :class="estadoClase(solicitudEstado)" class="estado-estilo ml-4">{{ solicitudEstado }}</span>
        </div>

        <div class="flex justify-center mt-3">
          <button 
            :disabled="solicitudEstado === 'Pendiente'"
            :class="solicitudEstado === 'Pendiente' ? 'bg-gray-300 cursor-not-allowed' : 'bg-base hover:bg-green-600'" 
            class="px-4 py-2 text-white rounded-md"
            @click="solicitarRevision">
            Solicitar Revisión
          </button>
        </div>
        <div v-if="solicitudMensaje">{{ solicitudMensaje }}</div> <!-- Mensaje de la solicitud -->
      </div>

      <!-- Tabla de Observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h4 class="text-2xl font-medium text-black">2. Revisión de levantamiento de observaciones</h4>
        </div>

        <!-- Tabla con las observaciones -->
        <div class="overflow-x-auto mt-4">
          <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 border-b">DESCRIPCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">ACCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(obs, index) in historial" :key="index">
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">{{ obs.rev_file || 'Nombre desconocido' }}</a></td>
                <td class="px-4 py-2 border-b">{{ obs.rev_count || 'Desconocido' }}</td>
                <td class="px-4 py-2 border-b">{{ obs.updated_at || 'Desconocido' }}</td>
                <td class="px-4 py-2 border-b">
                  <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>{{ obs.accion || 'solicitar Revision' }}</button>
                </td>
                <td class="px-4 py-2 border-b">
                  <span :class="`estado-estilo estado-${obs.rev_status.toLowerCase().replace(' ', '-')}`">{{ obs.rev_status || 'Desconocido' }}</span>
                </td>
              </tr>
            </tbody>

          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
  display: inline-block;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}

.break-all {
  word-break: break-all;
}
</style>
