<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore }from '@/stores/auth';
import axios from 'axios';
import { alertToast, alertConfirmation } from '@/functions';
import confetti from 'canvas-confetti';

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

// Documentos para el punto 2 (Respuesta del asesor) y 3 (Documentos adicionales)
const documentos = ref<Documento[]>([
  { nombre: 'Respuesta del asesor', estado: 'Rechazado', documentoUrl: '' },  // Punto 2
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' }, // Punto 3
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' }  // Punto 3
]);

// Modal de confirmación
const mostrarModalDocumentos = ref(false); // Controla el modal de documentos
const mostrarModalCambioAsesor = ref(false); // Controla el modal de cambio de asesor
const mostrarModalConfirmacion = ref(false); // Modal de confirmación para cambio de asesor



// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'en progreso':
      return 'bg-orange-500 text-white';
    case 'pendiente':
      return 'bg-gray-400 text-white';
    case 'rechazado':
      return 'bg-red-500 text-white';
    case 'aceptado':
      return 'bg-green-500 text-white';
    default:
      return '';
  }
};

const authStore = useAuthStore();
const initSolicitude = ref(false);
const solicitude = ref({ estudiante_id:'', titulo: '', asesor_id: '', estado: '', solicitud_id: '' });
const advisers = ref({ id: '', nombre: '' });
const load = ref(false)
const enviado = ref(false);

axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
onMounted(() => {
  getInfoStudent();
  getAdvisers();
})

const getInfoStudent = async () => {
  load.value = true
  await axios.get(`/api/student/getInfo/${authStore.id}`).then((response) => {
    console.log(response.data)
    if(response.data.status) {
      solicitude.value.solicitud_id = response.data.solicitude_pendiente.id
      solicitude.value.titulo = response.data.solicitude_pendiente.titulo
      solicitude.value.asesor_id = response.data.solicitude_pendiente.asesor_id || ''
      solicitude.value.estado = response.data.solicitude_pendiente.estado
    }
  }).catch((error) => {
    alertToast(error.response.data.message, 'Error', 'error')
  }).finally(() => {
    load.value = false
  })
}
const getAdvisers = async () => {
  const res = await axios.get('/api/adviser/get-select')
  advisers.value = res.data.data
}

const sendSolicitude = async (student_id: string) => {
  try {
    const params = {
      student_id: student_id
    }
    alertConfirmation(
      'Estás seguro de iniciar este trámite?',
      'Iniciar trámite', 
      'question', 
      params, 
      '/api/solicitudes-store', 
      'POST',
      (response) => {
        solicitude.value.titulo = response.data.sol_title_inve;
        solicitude.value.asesor_id = response.data.adviser_id;
        solicitude.value.estado = response.data.sol_status;
        confetti({
          particleCount: 500,
          spread: 1010,
          origin: { y: 0.6 }
        });
      }
    )
  } catch (error: any) {
    let description = ''
    error.response.data.error.map((e: any) => {
    description = description + ' ' + e 
    })
    alertToast(description, 'Error', 'error')  
  }
}

const updateSolicitude = async (solicitud_id: string, titulo: string, asesor_id: string) => {
  try {
    const params = {
      sol_title_inve: titulo,
      adviser_id: asesor_id,
      sol_status: 'pendiente'
    }
    alertConfirmation(
      'Asegurate de ingresar los datos correctos. Todo ok?', 
      'Solicitar asesor', 
      'question', 
      params, 
      `/api/solicitudes/${solicitud_id}`, 
      'PUT',
      (response) => {
        // Aquí actualizamos los datos locales con la respuesta del servidor
        solicitude.value.titulo = response.data.sol_title_inve;
        solicitude.value.asesor_id = response.data.adviser_id;
        solicitude.value.estado = response.data.sol_status;
      }
    );
  } catch (error: any) {
    let description = ''
    error.response.data.error.map((e: any) => {
    description = description + ' ' + e 
    })
    alertToast(description, 'Error', 'error')  
  }
}
</script>

<template>
  <!-- Muestra si hay una solicitud ya sea pendiente rechazada o aceptada -->
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-[70%] animate-pulse rounded-lg duration-200"></h3>
        <p class="bg-gray-200 text-center w-[70%] h-8 rounded-lg mt-5 animate-pulse duration-200"></p>
      </div>
      <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
       <div class="block space-y-5">
          <h2 class="bg-gray-200 h-10 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-10 mt-1 w-[5%] rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 mt-4 w-full rounded-md animate-pulse duration-200"></h2>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
       <div class="block space-y-5">
          <h2 class="bg-gray-200 h-7 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 w-full rounded-md animate-pulse duration-200"></h2>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
       <div class="block space-y-5">
          <h2 class="bg-gray-200 h-7 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 w-full rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 mt-1 w-15 rounded-md animate-pulse duration-200"></h2>
          <h2 class="bg-gray-200 h-14 mt-4 w-full rounded-md animate-pulse duration-200"></h2>
        </div>
      </div>
    </div>
  </template>
  
  <template v-else>
    <template v-if="!solicitude.estado">
      <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100 h-screen">
        <div class="p-10 bg-white rounded-lg shadow-lg space-y-8 text-center">
          <h3 class="text-4xl font-semibold text-azul">Usted no ha iniciado un trámite</h3>
          <p class="text-gray-500">Iniciar trámite para solicitar un asesor</p>

          <div class="flex justify-center">
            <img src="/img/notInitSolicitude.svg" 
                alt="Iniciar trámite o solicitar asesor" 
                class="w-[40%] h-auto object-cover rounded-md shadow-md">
          </div>

          <div class="flex justify-center">
            <button class="bg-base text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-950 transition duration-300"
                    @click="sendSolicitude(authStore.id)">
              Iniciar trámite
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100" >
        <!-- Título principal -->
        <h3 class="text-4xl font-semibold text-center text-azul">Designación de Asesor</h3>
        <br>
        <p class="text-gray-500 text-center">Cada punto en este proceso debe estar en Hecho para que pueda continuar con el siguiente tramite | El pago de este tramite se sumara al pago del monto final de toda la Tesis.</p>
        <br>

        <!-- Card 1: Solicitud de Asesor -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Solicitud de Asesor</h2>
            <span :class="estadoClase(solicitude.estado)" class="estado-estilo ml-4">{{ solicitude.estado }}</span>
          </div>

          <div class="mt-4">
            <!-- Título de tesis -->
            <label for="tituloTesis" class="block text-lg font-medium text-gray-800 mb-2">Título de Tesis</label>
            <input id="tituloTesis" type="text" v-model="solicitude.titulo" 
              :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
              class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              placeholder="Escribe tu título de tesis aquí...">

            <!-- Select para elegir asesor -->
            <label for="nombreAsesor" class="block text-lg font-medium text-gray-800 mb-2">Elige a tu Asesor</label>
            <select id="nombreAsesor" v-model="solicitude.asesor_id"
              :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
              class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6">
              <option disabled value="">Selecciona un asesor...</option>
              <option v-for="asesor in advisers" :key="asesor.id" :value="asesor.id">{{ asesor.nombre }}</option>
            </select>

            <!-- Botón de enviar -->
            <button @click="updateSolicitude(solicitude.solicitud_id, solicitude.titulo, solicitude.asesor_id)"
              :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
              :class="[
                'px-3 py-2 text-white rounded-md focus:outline-none', 
                ['pendiente', 'aceptado'].includes(solicitude.estado) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              ]">
              Enviar
            </button>

          </div>

          <!-- Respuesta del asesor -->
          <div class="mt-6 bg-gray-50 p-4 border border-gray-200 rounded-md" v-if="solicitude.estado !== 'en progreso'">
            <div class="flex justify-between items-center">
              <h4 class="text-black">Respuesta del asesor</h4>
              <span  :class="estadoClase(solicitude.estado)" class="estado-estilo">{{ solicitude.estado }}</span>
            </div>
          </div>
          <br>

          <!-- Mensaje de espera según el estado -->
          <span v-if="solicitude.estado === 'pendiente'" class="text-gray-500 italic">Esperando la respuesta del asesor...</span>
          <span v-else-if="solicitude.estado === 'rechazado'" class="text-red-500 italic">El asesor ha rechazado la solicitud, porfavor vuelve a seleccionar tu asesor.</span>
          <span v-else-if="solicitude.estado === 'aceptado'" class="text-green-500 italic">El asesor ha aceptado tu solicitud, puedes pasar el punto 2.</span>

        </div>

        <!-- Card 2: Documentos -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative mt-6">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">2. Documentos</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
                @mouseover="mostrarModalDocumentos = true"
                @mouseleave="mostrarModalDocumentos = false" />
          </div>

          <div v-show="mostrarModalDocumentos"
              class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">
              Por favor espere que se carguen los documentos que verifican su trámite de Designación de Asesor para continuar con el siguiente paso.
            </p>
          </div>

          <div class="mt-4 space-y-4">
            <!-- Listado de documentos -->
            <div v-for="(documento, index) in documentos.slice(1)" :key="documento.nombre"
                class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <!-- Nombre del documento -->
                <span class="w-full md:w-auto mb-2 md:mb-0">{{ documento.nombre }}</span>

                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <!-- Mostrar botones si el documento está listo -->
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

                  <!-- Mensaje de que aún no está cargado -->
                  <span v-else class="text-gray-500 italic">El documento aún no se ha cargado</span>

                  <!-- Estado del documento -->
                  <span :class="estadoClase(documento.estado)" class="estado-estilo ml-4">{{ documento.estado }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón "Siguiente" -->
        <div class="flex justify-end mt-6">
          <button  class="px-4 py-2 bg-gray-300 text-white rounded-md cursor-not-allowed"
            >
            Siguiente
          </button>
        </div>

        <!-- Card 3: Solicitar Cambio de Asesor -->
        <div 
          class=" " 
          :disabled="['pendiente', 'en progreso'].includes(solicitude.estado)"
          :class="[
                'rounded-lg shadow-lg p-6 relative mt-6', 
                ['pendiente', 'en progreso'].includes(solicitude.estado) 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'bg-white'
              ]"
        >
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-gray-600">Cambio de Asesor</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" 
                @mouseover="mostrarModalCambioAsesor = true"
                @mouseleave="mostrarModalCambioAsesor = false" />
          </div>
          <br>
          <p class="text-gray-400"> Si consideras que necesitas un cambio de asesor, puedes solicitarlo en cualquier momento.</p>

          <div v-show="mostrarModalCambioAsesor"
              class="absolute left-0 mt-1 top-16 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-500">
              Si consideras que necesitas un cambio de asesor, puedes solicitarlo en cualquier momento.
            </p>
          </div>

          <div class="mt-4 space-y-4">
            <!-- Botón de Solicitar Cambio de Asesor -->
            <div class="flex justify-center">
              <button @click="solicitarCambioAsesor" class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-500 focus:outline-none">
                Solicitar Cambio de Asesor
              </button>
            </div>
          </div>
        </div>

        <!-- Historial de Acciones -->
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 mt-6" v-if="solicitude.estado === 'rechazado'">
          <h2 class="text-2xl font-medium text-white">Historial de Acciones</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="(accion, index) in historial" :key="index" class="border p-3 rounded-md bg-gray-50">
              <span class="font-light">{{ new Date(accion.fecha).toLocaleString() }}:</span> {{ accion.descripcion }}
            </li>
          </ul>
        </div>

        <!-- Modal de Confirmación -->
        <div v-if="mostrarModalConfirmacion" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4"> <!-- Responsivo -->
            <h3 class="text-3xl text-center font-medium mb-4">Confirmación</h3>
            <hr>
            <br>
            <p class="mb-6">¿Estás seguro de que deseas solicitar un cambio de asesor? Todo el proceso tendrá que repetirse.</p>
            <div class="flex justify-end">
              <button @click="mostrarModalConfirmacion = false" class="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 hover:bg-gray-600">Cancelar</button>
              <button @click="confirmarCambioAsesor" class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-500">Aceptar</button>
            </div>
          </div>
        </div>

      </div>
    </template>
  </template>

</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
}
</style>