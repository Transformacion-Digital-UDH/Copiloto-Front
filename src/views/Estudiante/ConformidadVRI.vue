<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';

// Estado de los trámites
const tramites = ref([
  { titulo: 'Trámite en el Sistema', estado: 'Pendiente' },
  { titulo: 'Pago de Trámite', estado: 'Pendiente' },
]);

// Estado de la constancia de curso
const constanciaCurso = ref({
  titulo: '2. Constancia de Tu Coach UDH',
  descripcion: 'Te falta llevar el curso de TCOACH, por favor haz click en llevar curso',
  estado: 'Pendiente',
  completado: false, // Indica si el curso ha sido completado
  documentoUrl: '',  // URL para el certificado o documento del curso
});

// Estado de las observaciones de buenas prácticas
const observaciones = ref([
  { descripcion: 'Tienes observaciones', observacion: 'Malas_Practicas.xlsx', veces: 1, fecha: '20/09/2023', accion: 'Solicitar Revisión', estado: 'Pendiente' }
]);

// Estado de la revisión de Turnitin
const turnitinObservacion = ref([
  { descripcion: 'Rechazado con porcentaje mínimo', observacion: 'turnitin.xlsx', veces: 1, fecha: '20/09/2023', accion: 'Revisar', estado: 'Rechazado' }
]);

// Estado de los documentos
const documentos = ref([
  { nombre: 'Constancia de originalidad', estado: 'Hecho', documentoUrl: 'resolucion_xxxxxx' }
]);

// Función para cambiar el estado de la solicitud de revisión
function solicitarRevision() {
  observaciones.value[0].estado = 'Hecho';
  tramites.value[0].estado = 'Hecho'; // Trámite en el Sistema pasa a Hecho
}

// Función para iniciar el curso
function llevarCurso() {
  window.open('https://link.al.curso', '_blank');
  setTimeout(() => {
    constanciaCurso.value.completado = true;
    constanciaCurso.value.estado = 'Hecho';
    constanciaCurso.value.descripcion = 'Has completado el curso de TCOACH.';
    constanciaCurso.value.documentoUrl = 'ruta/al/certificado.pdf'; // Actualizar con la URL real
  }, 3000);
}

// Computed para habilitar el botón "Siguiente" solo si todos los trámites y documentos están en "Hecho"
const puedeContinuar = computed(() => {
  const tramitesHechos = tramites.value.every(tramite => tramite.estado === 'Hecho');
  const documentosHechos = documentos.value.every(documento => documento.estado === 'Hecho');
  return tramitesHechos && documentosHechos;
});

// Método para determinar la clase del estado basado en el estado del documento o solicitud
function estadoClase(estado: string) {
  switch (estado) {
    case 'Hecho': return 'bg-green-500 text-white';
    case 'Pendiente': return 'bg-gray-400 text-white';
    case 'Rechazado': return 'bg-red-500 text-white';
    default: return '';
  }
}

/*************************************** INTEGRACION CON EL BACKEND ************************************************ */
const authStore = useAuthStore();
const load = ref(false);
const certificado = ref<Certificado | null>(null);

interface Certificado {
  doc_name: string;
  doc_estado: string;
  doc_ver?: string;
}

const obtenerCertificadoEstudiante = async () => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`api/estudiante/get-certificado-buenas-practicas/${student_id}`);
    console.log("Mostrando lo recibido: ", response);
    
    certificado.value = response.data;

  } catch (error) {
    console.log("Error al obtener certificado", error);
  } finally {
    load.value = false;
  }
}

onMounted(() => {
  obtenerCertificadoEstudiante();
});

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad por Integridad VRI";
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

</script>

<template>
  <div class="flex-1 p-4 sm:p-10 bg-gray-100 font-roboto">
    <h3 class="text-4xl sm:text-4xl font-bold text-center text-azul mb-4">{{ textoTipiado2 }}</h3>

    <!-- Información del Título de Tesis -->
    <div class="bg-baseClarito text-white rounded-lg shadow-lg p-4 sm:p-6  mb-4">
      <p class="text-base sm:text-lg mb-2 text-white"><strong>Título de Tesis:</strong> Implementación de un algoritmo xxxxxxxxxxxxxxxxxxxxxxx</p>
      <p class="text-base sm:text-lg break-words text-white">
        <strong>Link de informe final:</strong> 
        <a href="https://docs.google.com/document/" class="text-blue-500 underline">https://docs.google.com/document/</a>
      </p>
    </div>

    <div class="space-y-8 sm:space-y-10">
      <!-- Punto 1: Observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-4">1. Observaciones</h4>
        <div class="flex items-center justify-between">
          <p class="text-gray-500">Haz click en el botón de Solicitar Revision para iniciar</p>
          <span :class="estadoClase(observaciones[0].estado)" class="estado-estilo mt-2 sm:mt-0 ml-4">{{ observaciones[0].estado }}</span>
        </div>
        <div class="flex justify-center mt-4">
          <button class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-600" @click="solicitarRevision">Solicitar revisión</button>
        </div>
      </div>

      <!-- Punto 2: Constancia de Curso -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-medium text-black">{{ constanciaCurso.titulo }}</h2>
          <span :class="estadoClase(constanciaCurso.estado)" class="estado-estilo mt-2 sm:mt-0 ml-4">{{ constanciaCurso.estado }}</span>
        </div>
        <div class="bg-gray-100 p-4 border border-gray-300 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
          <p class="text-gray-900">{{ constanciaCurso.descripcion }}</p>
          <div class="flex items-center space-x-4 mt-4 sm:mt-0">
            <!-- Mostrar botón "Llevar Curso" si no ha completado el curso -->
            <button v-if="!constanciaCurso.completado" @click="llevarCurso" class="px-4 py-2 bg-base text-white rounded-md">
              Llevar Curso
            </button>
            <!-- Mostrar íconos si ha completado el curso -->
            <div v-else class="flex items-center space-x-4">
              <!-- Ícono de verificado -->
              <div class="flex items-center space-x-2">
                <svg fill="#000000" viewBox="0 0 24 24" id="check-mark-circle" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <polyline points="8 11.5 11 14.5 16 9.5" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline>
                    <rect x="3" y="3" width="18" height="18" rx="9" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></rect>
                  </g>
                </svg>
                <p>Verificado</p>
              </div>

              <!-- Botón "Ver" -->
              <a :href="constanciaCurso.documentoUrl" target="_blank" class="px-3 py-1 bg-base text-white rounded-md flex items-center space-x-2">
                <i class="fas fa-eye"></i>
                <span>Ver</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Punto 3: Revisión de Buenas Prácticas -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-medium text-black mb-4">3. Revisión de Buenas Prácticas</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 border-b">DESCRIPCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">OBSERVACIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISION</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA OBSERVACIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(obs, index) in observaciones" :key="index" class="border-b">
                <td class="px-4 py-2">{{ obs.descripcion }}</td>
                <td class="px-4 py-2 text-blue-500 underline">{{ obs.observacion }}</td>
                <td class="px-4 py-2">{{ obs.veces }}</td>
                <td class="px-4 py-2">{{ obs.fecha }}</td>
                <td class="px-4 py-2">
                  <button class="px-3 py-1 bg-base text-white rounded-md">{{ obs.accion }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Punto 4: Revisión de Turnitin -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-medium text-black mb-4">4. Revisión de Turnitin</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-gray-600 border-b">DESCRIPCIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">OBSERVACIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">N° REVISION</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">FECHA OBSERVACIÓN</th>
                <th class="px-4 py-2 text-left text-gray-600 border-b">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(obs, index) in turnitinObservacion" :key="index" class="border-b">
                <td class="px-4 py-2">{{ obs.descripcion }}</td>
                <td class="px-4 py-2 text-blue-500 underline">{{ obs.observacion }}</td>
                <td class="px-4 py-2">{{ obs.veces }}</td>
                <td class="px-4 py-2">{{ obs.fecha }}</td>
                <td class="px-4 py-2">
                  <button class="px-3 py-1 bg-base text-white rounded-md">{{ obs.accion }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Punto 5: Documentos -->
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div class="flex items-center">
          <h2 class="text-xl sm:text-2xl font-medium text-black">5. Documentos</h2>
          <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4" />
        </div>
        <br>
        <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
          <div class="flex flex-col md:flex-row justify-between md:items-center">
            <span class="flex-1">{{ documentos[0].nombre }}</span>
            <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
              <div v-if="documentos[0].estado === 'Hecho'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                <!-- Botón de Ver -->
                <a :href="documentos[0].documentoUrl" target="_blank"
                  class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                  <i class="fas fa-eye mr-2"></i> Ver
                </a>
                <!-- Botón de Descargar -->
                <a :href="documentos[0].documentoUrl" download
                  class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
                  <i class="fas fa-download mr-2"></i> Descargar
                </a>
              </div>
              <span v-else-if="documentos[0].estado === 'Pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>
              <span :class="estadoClase(documentos[0].estado)" class="estado-estilo ml-4">{{ documentos[0].estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de siguiente -->
      <div class="flex justify-end mt-8">
        <button :disabled="!puedeContinuar" :class="puedeContinuar ? 'bg-base hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'" class="px-4 py-2 text-white rounded-md">
          Siguiente
        </button>
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
  display: inline-block;
}
.break-all {
  word-break: break-all;
}
</style>

