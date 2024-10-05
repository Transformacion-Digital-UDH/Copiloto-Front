<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";

// Define los tipos para observaciones y documentos
interface Observacion {
  descripcion: string;
  revision: number;
  fecha: string;
  accion: string;
  estado: string;
}

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Estado de solicitud (reactivo usando ref)
const solicitudEstado = ref<string>('');
const solicitudMensaje = ref('');

// Observaciones es un array reactivo de tipo Observacion usando reactive
const observaciones = reactive<Observacion[]>([
  { descripcion: 'Reporte.xlsx', revision: 5, fecha: '10/08/2023', accion: 'Solicitar revisión', estado: 'pendiente' }
]);

// Documentos es un array reactivo de tipo Documento usando reactive
const documentos = reactive<Documento[]>([
  { nombre: 'Informe de Conformidad de Observaciones', estado: 'Hecho', documentoUrl: 'imageattachment.jpg' }
]);

// Método para determinar la clase del estado basado en el estado del documento o solicitud
function estadoClase(estado: string) {
  switch (estado) {
    case 'Hecho': return 'bg-green-500 text-white';
    case 'En Proceso': return 'bg-orange-500 text-white';
    case 'pendiente': return 'bg-gray-400 text-white';
    case 'Rechazado': return 'bg-red-500 text-white';
    default: return '';
  }
}

// Estados para los modales
const mostrarModalRevision = ref(false);
const mostrarModalObservaciones = ref(false);
const mostrarModalDocumentos = ref(false);

// ***** Texto que escribe automatiqueshionmente ********
const text = "Conformidad de proyecto de tesis por el asesor";
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
// *******************************************************

//*********************************** INTEGRACION CON EL BACKEND *************************************************** */
const asesor = ref('');
const titulo = ref('');
const link = ref('');
const load = ref(false);
const authStore = useAuthStore();
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

const solicitarRevision = async () => {
  try {
    const response = await axios.post(`/api/student/first-review/${authStore.id}`);
    console.log(response)
    if (response.data.status) {
      solicitudEstado.value = 'pendiente';
        solicitudMensaje.value = 'Solicitud enviada, espere las indicaciones del asesor por favor!';
      }
  } catch (error :any) {
    console.log(error)
    solicitudMensaje.value = error.response.data.message;
  }
};

const obtenerRevisiones = async () =>{
  load.value = true;
    await axios.get(`api/student/get-review/${authStore.id}`)
    .then((response) => {
      if(response.data.status){
        console.log(response)
        const data = response.data.data;
        const revision = response.data.revision;
        
        // Asignar datos del estudiante
        asesor.value = data.asesor;
        titulo.value = data.titulo;
        link.value = data['link-tesis'];
        
        // Asignar estado de la revisión
        solicitudEstado.value = revision.estado;
      }
    }).catch((error) => {
      solicitudMensaje.value = error.response.data.message;
    }).finally(() => {
      load.value = false;
    });    
};

onMounted(() => {
  obtenerRevisiones();
});

</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3
          class="bg-gray-200 h-12 w-[70%] rounded-lg duration-200 skeleton-loader">
        </h3>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200">
            </h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-1/6 rounded-md skeleton-loader duration-200">
            </h2>
            <div class="flex justify-between items-center">
              <h2 class="bg-gray-200 h-6 w-96 rounded-md skeleton-loader duration-200"></h2>
            </div>
            <div class="h-7">
              <h2 class="bg-gray-200 h-10 w-40 mx-auto rounded-md skeleton-loader duration-200"></h2>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200">
            </h2>
            <h2
              class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200">
            </h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200">
            </h2>
            <h2
              class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200">
            </h2>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="block space-y-5">
            <h2 class="px-4 py-2 h-11 w-24 rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>  
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
        <h3 class="text-4xl font-bold text-center text-azul">
          {{ textoTipiado2 }}
        </h3>
    
        <div class="mt-6 space-y-10">
          <div class="bg-white rounded-lg shadow-lg p-6 text-gray-600" v-if="solicitudEstado === 'pendiente'">
            <p class="text-lg mb-2"><strong>Asesor: </strong>{{ asesor }}</p>
            <p class="text-lg mb-2 block truncate max-w-xl"><strong>Título de Tesis: </strong>{{ titulo }}</p>
            <p class="text-lg"><strong>Link de tesis: </strong> 
              <a :href="`${link}`" target="_blank" class="text-gray-600 hover:text-blue-700 underline"> Ver proyecto de investigación</a>
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
                <!-- Modal informativo del punto 1 -->
                <div v-if="mostrarModalRevision" class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
                  <p class="text-sm text-gray-600">
                    Asegúrate de revisar todas las observaciones antes de solicitar una nueva revisión.
                  </p>
                </div>
              </div>
            </div>
    
            <div class="flex items-center justify-between">
              <p class="text-gray-500">Haz click en el botón de Solicitar Revisión para iniciar</p>
              <span :class="estadoClase(solicitudEstado)" class="estado-estilo ml-4">{{ solicitudEstado }}</span>
            </div>
            <div class="flex justify-center mt-3">
              <button 
                :disabled="solicitudEstado === 'pendiente'"
                :class="solicitudEstado === 'pendiente' ? 'bg-gray-300 cursor-not-allowed' : 'bg-base hover:bg-green-600'" 
                class="px-4 py-2 text-white rounded-md"
                @click="solicitarRevision">
                Solicitar Revisión
              </button>
            </div>
            <div v-if="solicitudMensaje">{{ solicitudMensaje }}</div> <!-- Mensaje de la solicitud -->
          </div>
    
          <!-- Revisión de levantamiento de observaciones -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="flex items-center">
              <h4 class="text-2xl font-medium text-black">2. Solicitar revisión de levantamiento de observaciones</h4>
              <div class="relative">
                <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                     @mouseover="mostrarModalObservaciones = true"
                     @mouseleave="mostrarModalObservaciones = false" />
                <!-- Modal informativo del punto 2 -->
                <div v-show="mostrarModalObservaciones" 
                     class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10 modal-pos">
                  <p class="text-sm text-gray-600">
                    Aquí podrás solicitar la revisión de las observaciones levantadas para la tesis. 
                    Asegúrate de que todos los documentos están en orden antes de continuar.
                  </p>
                </div>
              </div>
            </div>
    
            <!-- Tabla de observaciones -->
            <div class="overflow-x-auto mt-4">
              <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISIÓN</th>
                    <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA</th>
                    <th class="px-4 py-2 text-left text-gray-600 border-b">ACCIÓN</th>
                    <th class="px-4 py-2 text-left text-gray-600 border-b">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(obs, index) in observaciones" :key="index">
                    <td class="px-4 py-2 border-b">{{ obs.revision }}</td>
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
    
          <!-- Documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">3. Documentos</h2>
              <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
                   @mouseover="mostrarModalDocumentos = true"
                   @mouseleave="mostrarModalDocumentos = false" />
            </div>
    
            <!-- Modal informativo del punto 3 -->
            <div v-if="mostrarModalDocumentos" class="absolute mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
              <p class="text-sm text-gray-600">
                Asegúrate de revisar el documento para verificar las observaciones antes de continuar.
              </p>
            </div>
    
            <div class="mt-4 space-y-4">
              <!-- documentos es un reactive, así que NO usamos .value para las propiedades internas -->
              <div v-for="(documento, index) in documentos" :key="documento.nombre" class="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div class="flex flex-col md:flex-row justify-between md:items-center">
                  <span class="flex-1">{{ documento.nombre }}</span>
    
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                    <!-- Mostrar botones "Ver" y "Descargar" si el estado es 'Hecho' -->
                    <div v-if="documento.estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                      <!-- Botón de Ver -->
                      <a :href="documento.documentoUrl" target="_blank"
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-eye mr-2"></i> Ver
                      </a>
                      <!-- Botón de Descargar -->
                      <a :href="documento.documentoUrl" download
                        class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar
                      </a>
                    </div>
                    <!-- Mostrar mensaje de espera si el estado es 'pendiente' -->
                    <span v-else-if="documento.estado === 'pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>
    
                    <!-- Estado del documento -->
                    <span :class="estadoClase(documento.estado)" class="estado-estilo ml-4">{{ documento.estado }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Botón de siguiente -->
          <div class="flex justify-end">
            <button class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed" disabled>Siguiente</button>
          </div>
    
        </div>
    </div>
  </template>
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

/* Estilos para hacer que el modal se ajuste en pantallas móviles */
.modal-pos {
  right: 0;
  top: 100%;
}

@media (max-width: 640px) {
  .modal-pos {
    left: 50%;
    transform: translateX(-50%);
    top: 120%;
  }
}
</style>