<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";

// Define los tipos para observaciones y documentos
interface Solicitud {
  id: string;
  estado: string;
  titulo: string;
  estudiante: {
    nombre_completo: string;
  };
}

interface Observacion {
  descripcion: string;
  rev_count: number;
  fecha: string;
  accion: string;
  estado: string;
}

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Variables reactivas para almacenar datos
const solicitudEstado = ref<string>('Pendiente');      // Estado de la solicitud
const solicitudMensaje = ref('');             // Mensaje de la solicitud
const observaciones = reactive<Observacion[]>([]);  // Lista de observaciones reactivas
const documentos = reactive<Documento[]>([]);      // Lista de documentos reactivas
// Variables reactivas para almacenar los datos del asesor y tesis
const asesorNombre = ref<string>(''); // Nombre del asesor
const tesis = ref<string>(''); // Título de la tesis
const tesisLink = ref<string | null>(null);  // Link de la tesis (puede ser null)
  const historial = ref<any[]>([]);

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

// Función para obtener las revisiones y observaciones desde el backend
const obtenerRevisiones = async () => {
  try {
    const response = await axios.get(`/api/student/get-review/${authStore.id}`);
    console.log("Datos recibidos de la API:", response.data);

    if (response.data.status) {
      // Asigna los valores recibidos de la API a las variables reactivas
      asesorNombre.value = response.data.data.asesor;
      tesis.value = response.data.data.título;
      tesisLink.value = response.data.data['link-tesis'] || null; // Asigna null si no hay link

      // Cargar las observaciones
      if (response.data.data.historial) {
        observaciones.length = 0;  // Limpiar observaciones anteriores
        observaciones.push(...response.data.data.historial.map((rev: any) => ({
          descripcion: rev.rev_file || 'Sin descripción',
          rev_count: rev.rev_count,
          fecha: new Date(rev.updated_at).toLocaleDateString(),
          accion: 'Acción',  // Puedes cambiar esto según tu lógica
          estado: rev.rev_status,
        })));
      }
    }
  } catch (error: any) {
    solicitudMensaje.value = error.response?.data.message || "Error al cargar los datos.";
  }
};

// Llama a la función cuando el componente se monta
onMounted(() => {
  obtenerRevisiones();
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
              <tr v-for="(obs, index) in observaciones" :key="index">
                <td class="px-4 py-2 border-b"><a href="#" class="text-blue-500 underline">{{ obs.descripcion }}</a></td>
                <td class="px-4 py-2 border-b">{{ obs.rev_count }}</td>
                <td class="px-4 py-2 border-b">{{ obs.fecha }}</td>
                <td class="px-4 py-2 border-b">
                  <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>{{ obs.accion }}</button>
                </td>
                <td class="px-4 py-2 border-b">
                  <span :class="estadoClase(obs.estado)" class="estado-estilo">{{ obs.estado }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabla de Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
        <div class="flex items-center">
          <h2 class="text-2xl font-medium text-black">3. Documentos</h2>
        </div>

        <div class="mt-4 space-y-4">
          <div v-for="(documento, index) in documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
            <div class="flex flex-col md:flex-row justify-between md:items-center">
              <span class="flex-1">{{ documento.nombre }}</span>

              <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                <!-- Botones de Ver y Descargar si el documento está disponible -->
                <div v-if="documento.estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                  <a :href="documento.documentoUrl" target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <a :href="documento.documentoUrl" download
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <span v-else-if="documento.estado === 'Pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>
                <span :class="estadoClase(documento.estado)" class="estado-estilo ml-4">{{ documento.estado }}</span>
              </div>
            </div>
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
  font-weight: 600;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}
</style>
