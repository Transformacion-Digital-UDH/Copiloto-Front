<script lang="ts" setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from "@/stores/auth";
import { alertToast } from '@/functions';

interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

const mostrarModalRevision = ref(false);
const mostrarModalObservaciones = ref(false);

// Documentos asociados a la conformidad
const documentos = reactive<Documento[]>([
  { nombre: 'Informe de conformidad de Observaciones', estado: 'Hecho', documentoUrl: 'informe_conformidad' }
]);

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad de Informe Final por Asesor";
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
// ******************************************************

/****************************** INTEGRACION CON EL BACKEND *********************************** */

const authStore = useAuthStore();
const isLoading = ref(false);
const solicitudEstado = ref<string>("No iniciado");
const load = ref(false);

const asesor = ref<string | null>(null);
const titulo = ref<string | null>(null);
const linkInforme = ref<string | null>(null);
const revision = ref<Revision | null>(null);

interface Revision {
  rev_id: string;
  rev_contador: number;
  rev_estado: string;
  rev_update: string;
}

// para deshabilitar el boton cuando esta pendiente
const isSolicitarDisabled = computed(() => solicitudEstado.value === 'Pendiente');

const solicitarRevision = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/api/review/create-revision/informe/${authStore.id}`);

    if (response.data.estado === "pendiente") {
      solicitudEstado.value = response.data.estado.charAt(0).toUpperCase() + response.data.estado.slice(1); // formatear para mostrar en mayuscula la primera letra
    } else if (response.data.estado === "no-iniciado") {
      solicitudEstado.value = "Pendiente";
      alertToast("Solicitud enviada al asesor, espere las indicaciones correspondientes.", "Éxito", "success");
    }
  } catch (error: any) {
    console.error("Error al solicitar revisión", error);

    if (error.response?.status === 404) {
      const message = error.response?.data?.message;
      if (message.includes("Espere a que su link de informe sea creado")) {
        alertToast("Estimado alumno, por favor espere a que se cree el enlace de su informe o comuníquese con su escuela académica.", "", "warning");
      } else if (message.includes("Ya tiene una revisión pendiente")) {
        solicitudEstado.value = "Pendiente";
        alertToast("Estimado alumno, ya tiene una revisión pendiente de su asesor", "", "info");
      } else {
        alertToast("Error desconocido al solicitar la revisión.", "Error", "error");
      }
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

const ObtenerDatosInforme = async () => {
  load.value = true;
  try {
    const response = await axios.get(`/api/estudiante/info-conf-asesor/informe/${authStore.id}`);
    console.log("Mostrando lo recibido: ", response);

    const data = response.data;
    asesor.value = data.asesor;
    titulo.value = data.titulo;
    linkInforme.value = data['link-informe'];
    revision.value = data.revision;

    // para verificar que hizo su solicitud en estado pendiente o si falta el link de informe final
    if (revision.value && revision.value.rev_estado === "pendiente") {
      solicitudEstado.value = revision.value.rev_estado.charAt(0).toUpperCase() + revision.value.rev_estado.slice(1);
    } else if (!linkInforme.value) {
      solicitudEstado.value = "No iniciado";
    }
  } catch (error) {
    console.error("Error al obtener información del estudiante", error);
  } finally {
    load.value = false;
  }
};

const actualizarEstadoRevision = async (reviewId: string, nuevoEstado: string) => {
  isLoading.value = true;

  try {
    const response = await axios.put(`/api/review/${reviewId}/status`, { rev_status: nuevoEstado });

    if (revision.value) {
      revision.value.rev_estado = response.data.estado;
    }
    alertToast(response.data.message, "Éxito", "success");

  } catch (error:any) {
    console.log("Error al actualizar el estado del boton", error)
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  ObtenerDatosInforme();
});

</script>
<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-12 w-2/3 rounded-lg duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-48 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-7 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-28 w-2/4 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-7 w-48 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="flex justify-between">
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
        </div>
        <!-- <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-7 w-72 rounded-md skeleton-loader duration-200 mb-14"></h2>
            <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>            
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-7 w-2/6 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-40 w-full mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div> -->
      </div>
    </div>
  </template>
  <template v-else>
  <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
    <h3 class="text-5xl font-bold text-center text-azul">{{ textoTipiado2 }}</h3>

    <div class="mt-6 space-y-10">
      <!-- Sección 1: Solicitar link para cargar el Informe Final -->
      <!-- <div class="bg-white rounded-lg shadow-lg p-6">
        <h4 class="text-2xl font-medium text-black mb-3">1. Solicitar link para cargar su Informe final</h4>
        <div class="flex items-center justify-between"> 
        <p class="text-gray-500 mb-3">Haz click en el botón de Solicitar link para cargar el informe final</p>
        <span :class="estadoClase(solicitudLinkEstado)" class="estado-estilo ml-4">{{ solicitudLinkEstado }}</span>
      </div>
     
        <div class="flex justify-center mt-4">
          <button class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-600" @click="solicitarLink">Solicitar link</button>
        </div>
      </div> -->

      <div class="bg-baseClarito rounded-lg shadow-lg p-6 text-lg text-azul space-y-4">
          <!-- Nombre del Asesor -->
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-gray-100 rounded-lg p-4 flex flex-col items-center shadow-lg">
              <i class="fas fa-user-tie text-azul text-4xl mb-3"></i>
              <p class="font-bold text-2xl text-azul">Asesor</p>
              <p class="text-gray-600 text-center uppercase">
                {{ asesor || 'Asesor no asignado' }}
              </p>
            </div>
          </div>
          <!-- Título de Tesis -->
          <div class="bg-gray-100 rounded-lg p-6 shadow-lg">
            <p class="text-azul text-center font-bold text-2xl">Título de tesis</p>
            <p class="max-w-7xl text-xm text-gray-600 uppercase text-center">{{ titulo || 'Título no asignado' }}</p>
          </div>
          <!-- Enlace del Informe final -->
          <div v-if="linkInforme" class="text-center mt-6">
            <a
              :href="linkInforme"
              target="_blank"
              class="inline-block bg-azul text-white px-4 py-2 rounded-lg hover:bg-blue-900 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <i class="fas fa-external-link-alt"></i> Abrir proyecto
            </a>
          </div>  
          <!-- Explicación breve -->
          <p class="text-sm text-gray-600 text-center">Sube la información de tu informe final en el documento de Google Docs proporcionado y, cuando estés listo, haz clic en 'Solicitar Revisión' para iniciar el proceso.</p>
        </div>

        <!-- Sección 2: Correcciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Correcciones con tu asesor</h2>
            <img
              src="/icon/info2.svg"
              alt="Info"
              class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalRevision = true"
              @mouseleave="mostrarModalRevision = false"
            />
            <!-- <span :class="['estado-estilo', `estado-${solicitudEstado.replace(/\s+/g, '-').toLowerCase()}`]" class="ml-4">{{ solicitudEstado }}</span> -->
          </div>
          <div v-show="mostrarModalRevision" class="absolute left-4 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">Asegúrate de haber subido tu informe final en el documento de google para que el asesor pueda revisar y realizar las correcciones.</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-gray-500 text-base mt-2">
              Para comenzar con el proceso de observaciones en el informe final de proyecto de tesis, haz clic en <strong class="text-[#39B49E] font-medium">"Solicitar revisión"</strong>
            </p>
            
          </div>
          <div class="flex justify-center mt-3">
            <button
              :disabled="isSolicitarDisabled || isLoading"
              :class="[ isSolicitarDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base', isLoading ? 'hover:bg-azul' : '']"
              class="px-4 py-2 w-56 text-white rounded-lg text-lg"
              @click="solicitarRevision">
              {{ isLoading ? 'Solicitando...' : 'Solicitar revisión' }}
            </button>
          </div>
        </div>

        <!-- Sección 3: Solicitar revisión de levantamiento de observaciones -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h4 class="text-2xl font-medium text-black">
              2. Revisión de observaciones
            </h4>

            <div class="relative">
              <img
                src="/icon/info2.svg"
                alt="Info"
                class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalObservaciones = true"
                @mouseleave="mostrarModalObservaciones = false"
              />
              <div
                v-show="mostrarModalObservaciones"
                class="absolute -left-60 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
                <p class="text-sm text-gray-600">
                  En esta sección se revisarán y corregirán las observaciones de tu informe final con tu asesor, hasta que esté todo conforme.
                </p>
              </div>
            </div>
            
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-base">Si tu asesor ha dejado observaciones, el estado de la revisión cambiará a
            <strong class="text-[#8898aa] text-md font-medium">"Pendiente"</strong>. Realiza las correcciones directamente en el documento de Google Docs.
          </p>
          <p class="text-gray-500 text-base">Una vez que hayas corregido, haz clic en 
            <strong class="text-green-500 text-base font-medium">“Observaciones corregidas”</strong> para que el asesor revise nuevamente. Si todo está en orden, el estado cambiará a <strong class="text-green-500 text-base font-medium">"Aprobado"</strong>.
          </p>
          <!-- Tabla de observaciones -->
          <div class="overflow-x-auto mt-4">
            <table class="min-w-full bg-white border border-gray-200 rounded-md shadow">
              <thead class="min-w-full leading-normal">
                <tr class="text-center text-azul border-b-2 bg-gray-300">
                  <th class="px-4 py-2 text-left tracking-wider">N° REVISIÓN</th>
                  <th class="px-4 py-2 text-left tracking-wider">FECHA</th>
                  <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
                  <th class="px-4 py-2 tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <!-- Mostrar la revisión si existe -->
              <tbody v-if="revision">
                <tr
                  class="border-b border-gray-200 text-center hover:bg-gray-200 transition-colors duration-300"
                >
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-28">{{ revision.rev_contador || 'Desconocido' }}</p>
                  </td>
                  <td class="px-4 py-2 text-base text-gray-600">
                    <p class="text-wrap w-40">{{ revision.rev_update || 'Desconocido' }}</p>
                  </td>
                  <td class="px-4 py-2 text-base">
                    <button
                      :disabled="revision.rev_estado === 'pendiente' || revision.rev_estado === 'aprobado'"
                      :class="[ 
                        'w-56 px-3 py-1 text-base text-white rounded-xl focus:outline-none',
                        revision.rev_estado === 'pendiente' || revision.rev_estado === 'aprobado'
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-base hover:bg-[#48bb78]'
                      ]"
                      @click="authStore.id ? actualizarEstadoRevision(revision.rev_id, 'pendiente') : alertToast('ID no disponible', 'Error', 'error')">
                      Observaciones corregidas
                    </button>
                  </td>
                  <td class="px-4 py-2">
                    <span :class="`estado-estilo estado-${revision.rev_estado ? revision.rev_estado.toLowerCase().replace(' ', '-') : 'desconocido'}`">
                      {{ revision.rev_estado ? revision.rev_estado[0].toUpperCase() + revision.rev_estado.slice(1).toLowerCase() : 'Desconocido' }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <!-- Mostrar mensaje si no hay revisión -->
              <tbody v-else>
                <tr>
                  <td colspan="4" class="px-4 py-4 text-center text-gray-600">
                    <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay observaciones disponibles por el momento.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      <!-- Sección 4: Informe de conformidad de observaciones -->
      <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center">
                <h2 class="text-2xl font-medium text-black">4. Documentos</h2>
                <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4" />
            </div>
            <br>
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
                <div class="flex flex-col md:flex-row justify-between md:items-center">
                <!-- Nombre del documento -->
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

                    <!-- Mostrar mensaje de espera si el estado es 'Pendiente' -->
                    <span v-else-if="documentos[0].estado === 'Pendiente'" class="text-gray-500 italic">El documento aún no se ha cargado</span>

                    <!-- Mostrar el estado -->
                    <!-- <span :class="estadoClase(documentos[0].estado)" class="estado-estilo ml-4">{{ documentos[0].estado }}</span> -->
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
  font-weight: 400;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}

.estado-hecho {
  background-color: #38a169;
  color: #ffffff;
}

.estado-aprobado {
  background-color: #38a169;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
.estado-no-iniciado {
  background-color: #718096;
  color: #ffffff;
}
</style>
