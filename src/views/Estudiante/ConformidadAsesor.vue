<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";
import { computed } from 'vue';
import { alertToast } from "@/functions";
import router from "@/router";
import Swal from "sweetalert2";


// Define los tipos para observaciones y documentos
interface Observacion {
  cantidad: number;
  fecha: string;
  accion: string;
  estado: string;
}

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
  revision_id?: string | null;  // Campo opcional
}


// Estado de solicitud (reactivo usando ref)
const solicitudEstado1 = ref('');
const solicitudEstado = ref('');
const solicitudMensaje = ref('');
const revision = ref<any[]>([]); 

//Variables de entorno
const VIEW_CONFORMIDAD = import.meta.env.VITE_URL_VIEW_CONFORMIDAD;
const DOWNLOAD_CONFORMIDAD = import.meta.env.VITE_URL_DOWNLOAD_CONFORMIDAD;

// Documentos es un array reactivo de tipo Documento usando reactive
const documentos = reactive<Documento[]>([
  { 
    nombre: 'Informe de Conformidad de Observaciones', 
    estado: 'pendiente',  // Inicialmente en pendiente
    documentoUrl: '',  // Inicialmente sin URL, ya que puede no estar disponible
    revision_id: null  // Inicialmente null, será asignado con el ID correcto más adelante
  }
]);

// Método para determinar la clase del estado basado en el estado del documento o solicitud
function estadoClase(estado: string) {
  switch (estado) {
    case 'aprobado': return 'bg-[#48bb78] text-white';
    case 'pendiente': return 'bg-[#8898aa] text-white';
    case 'observado': return 'bg-[#e79e38] text-white';
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

const authStore = useAuthStore();
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

const primeraRevision = async () => {
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

const obtenerRevisiones = async () => {
  await axios.get(`/api/student/get-review/${authStore.id}`)
    .then((response) => {
      if (response.data.status) {
        console.log(response);
        const data = response.data.data;
        const revision = response.data.revision;
        const historial = response.data.historial;
                
        solicitudEstado.value = revision.estado;
        console.log('Estado de la solicitud:', solicitudEstado.value); 
      }
    }).catch((error) => {
      solicitudMensaje.value = error.response.data.message;
    });
};

const ObetenerRev = async () => {
  try {
    const response = await axios.get(`/api/student/get-review/${authStore.id}`);
    console.log("Datos recibidos de revisión:", response.data);

    if (response.data.status) {
      console.log("Estructura de los datos recibidos:", response.data);
      
      // Extraer la información de revisión del backend
      const revisionData = response.data.revision;

      // Actualizar los datos locales con la información recibida
      cantidad.value = revisionData.cantidad;
      fecha.value = revisionData.fecha || 'Desconocido';
      estado.value = revisionData.estado;
      revision_id.value = revisionData.revision_id;

      // Actualizar el array de documentos con revision_id
      documentos[0].revision_id = revisionData.revision_id;

      // Aquí verificamos si el estado de la revisión es "aprobado"
      if (revisionData.estado === 'aprobado') {
        // Si la revisión está aprobada, cambiamos el estado del documento a "Hecho"
        documentos[0].estado = 'Hecho';
        documentos[0].documentoUrl = 'https://titulacion-back.abimaelfv.site/api/view-cpa';  // Simula que ya tienes la URL del documento
      } else {
        // Si no está aprobado, el estado sigue siendo "pendiente"
        documentos[0].estado = 'pendiente';
      }

      // Encapsula la revisión en un array para poder iterarla en la tabla
      revision.value = [{
        cantidad: revisionData.cantidad,
        fecha: revisionData.fecha || 'Desconocido',
        accion: 'Solicitar Revisión',
        estado: revisionData.estado
      }];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      alert(`Error al actualizar la revisión: ${error.response?.data.message || 'Error desconocido'}`);
    } else {
      alert('Ocurrió un error desconocido.');
    }
    console.error(error);
  }
};

// Computada para habilitar o deshabilitar el botón basado solo en el estado del paso 3 (Documentos)
const isNextButtonDisabled = computed(() => {
  // Busca el documento correspondiente al paso 3
  const documentoPaso3 = documentos.find(doc => doc.nombre === 'Informe de Conformidad de Observaciones');
  
  // Verifica si ese documento está en estado "Hecho"
  return documentoPaso3?.estado !== 'Hecho';
});

const handleNextButtonClick = () => {
  if (isNextButtonDisabled.value) {
    // Mostrar un mensaje si el botón está deshabilitado
    Swal.fire({
      icon: 'warning',
      title: 'Pasos incompletos',
      text: 'Por favor, completa todos los pasos antes de continuar.',
      confirmButtonText: 'OK',
    });
  } else {
    // Navegar a la siguiente página si el estado del paso 3 es "Hecho"
    goToNextPage();
  }
};

// Función para redirigir a la siguiente página
const goToNextPage = () => {
  router.push("/estudiante/designacion-jurado");
};





// Función para actualizar el estado de la revisión en la tabla (Botón en la tabla)
const actualizarRevision = async (studentId: string) => {
  try {
    if (!studentId) {
      alert('No se pudo encontrar el ID del estudiante');
      return;
    }

    // Llamada para actualizar el estado a 'pendiente'
    const response = await axios.put(`/api/student/review/${studentId}/status`, {
      rev_status: 'pendiente'
    });

    // Verificar si la respuesta HTTP fue exitosa (status 200 o 201)
    if (response.status === 200 || response.status === 201) {
      // Si la respuesta fue exitosa, actualizamos las revisiones
      await ObetenerRev(); // <-- Actualiza los datos localmente llamando a ObetenerRev

      // Mostrar una alerta de éxito
      alert("Se han enviado las observaciones corregidas.");
      alertToast("Revisión actualizada", "Éxito", "success");
    } else {
      // Si la respuesta no es exitosa, mostramos una alerta
      alert("Hubo un problema al actualizar la revisión.");
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Manejo del error de Axios con el mensaje del servidor
      alert(`Error al actualizar la revisión: ${error.response?.data.message || 'Error desconocido'}`);
    } else {
      // Manejo de otros errores desconocidos
      alert('Ocurrió un error desconocido.');
    }
    console.error(error);
  }
};

const obtenerDatosEstudiante = async () => {
  try {
    const response = await axios.get(`/api/student/getInfo/${authStore.id}`);
    if (response.data.status) {
      const solicitud = response.data.solicitud;
      asesor.value = solicitud.asesor_id;
      titulo.value = solicitud.titulo;
      link.value = solicitud.link;
    }
  } catch (error) {
    console.error('Error al obtener los datos del estudiante:', error);
  }
};

onMounted(() => {
  obtenerRevisiones();
  ObetenerRev();
  obtenerDatosEstudiante();
});

const mostrarAlerta = (mensaje: string) => {
  window.alert(mensaje);
};

</script>

<template>
  <div class="flex-1 p-10 border-s-2 bg-gray-100 font-roboto">
    <h3 class="text-4xl font-bold text-center text-azul">Conformidad de proyecto de tesis por el asesor</h3>

    <div class="mt-6 space-y-10">
      <!-- Información del asesor y tesis -->
      <div class="bg-white rounded-lg shadow-lg p-6 text-gray-600">
        <p class="text-lg mb-2"><strong>Asesor: </strong>{{ asesor }}</p>
        <p class="text-lg mb-2 block truncate max-w-7xl"><strong>Título de Tesis: </strong>{{ titulo }}</p>
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

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  display: inline-block;
}
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-hecho {
  background-color: #48bb78;
  color: #ffffff;
}
.estado-aprobado {
  background-color: #48bb78;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
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
