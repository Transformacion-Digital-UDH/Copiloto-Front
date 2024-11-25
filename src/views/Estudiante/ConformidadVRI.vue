<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from "@/stores/auth";
import axios from 'axios';
import CursoCard from '@/components/CursoCard.vue';
import DocumentCurso from '@/components/DocumentCurso.vue';
import ModalToolTip from '@/components/modalToolTip.vue';
import ButtonS from '@/components/ButtonS.vue';
import Swal from 'sweetalert2';
import router from '@/router';
import { alertToast } from '@/functions';

// Estado de la constancia de curso
// const constanciaCurso = ref({
//   titulo: '2. Constancia de Tu Coach UDH',
//   descripcion: 'Te falta llevar el curso de TCOACH, por favor haz click en llevar curso',
//   estado: 'Pendiente',
//   completado: false, // Indica si el curso ha sido completado
//   documentoUrl: '',  // URL para el certificado o documento del curso
// });

// // Estado de las observaciones de buenas prácticas
// const observaciones = ref([
//   { descripcion: 'Tienes observaciones', observacion: 'Malas_Practicas.xlsx', veces: 1, fecha: '20/09/2023', accion: 'Solicitar Revisión', estado: 'Pendiente' }
// ]);

// // Estado de la revisión de Turnitin
// const turnitinObservacion = ref([
//   { descripcion: 'Rechazado con porcentaje mínimo', observacion: 'turnitin.xlsx', veces: 1, fecha: '20/09/2023', accion: 'Revisar', estado: 'Rechazado' }
// ]);

// // Estado de los documentos
// const documentos = ref([
//   { nombre: 'Constancia de originalidad', estado: 'Hecho', documentoUrl: 'resolucion_xxxxxx' }
// ]);

// // Función para cambiar el estado de la solicitud de revisión
// function solicitarRevision() {
//   observaciones.value[0].estado = 'Hecho';
//   //tramites.value[0].estado = 'Hecho'; Trámite en el Sistema pasa a Hecho
// }

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

const handleNextButtonClick = () => {
  if (isNextButtonDisabled.value) {
    Swal.fire({
      icon: "warning",
      title: "Pasos incompletos",
      text: "Por favor, completa todos los pasos antes de continuar.",
      confirmButtonText: "OK",
    });
  } else {
    goToNextPage();
  }
};

const goToNextPage = () => {
  router.push("/estudiante/aprobacion-informe");
};

const isNextButtonDisabled = computed(() => {
  return !obtener.value?.filtros.every(filtro => filtro.fil_estado === 'aprobado');
});

/*************************************** INTEGRACION CON EL BACKEND ************************************************ */
const authStore = useAuthStore();
const load = ref(false);
const solicitudEstado = ref<string>("");
const obtener = ref<Estudiante | null>(null);
const isLoading = ref(false);

const formatearTexto = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const isAprobacionDisabled = computed(() => {
  const primerFiltro = obtener.value?.filtros.find(filtro => filtro.fil_nombre === 'primer filtro');
  return solicitudEstado.value === "pendiente" || 
         obtener.value?.tu_coach.doc_estado !== "aprobado" || 
         primerFiltro?.fil_estado !== "no iniciado";
});

const primerFiltro = computed(() => {
  return obtener.value?.filtros.find(filtro => filtro.fil_nombre === 'primer filtro') || { fil_estado: 'no iniciado', fil_ruta: '' };
});

const segundoFiltro = computed(() => {
  return obtener.value?.filtros.find(filtro => filtro.fil_nombre === 'segundo filtro') || { fil_estado: 'no iniciado', fil_ruta: '' };
});

const tercerFiltro = computed(() => {
  return obtener.value?.filtros.find(filtro => filtro.fil_nombre === 'tercer filtro') || { fil_estado: 'no iniciado', fil_ruta: '' };
});

interface TuCoach {
  doc_name: string;
  doc_estado: string;
  doc_ver: string;
}

interface Filtro {
  fil_nombre: string;
  fil_estado: string;
  fil_ruta: string;
}

interface Estudiante {
  tu_coach: TuCoach;
  filtros: Filtro[];
}

const obtenerEstudianteConformidadVRI = async () => {
  load.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/estudiante/info-filtro/${student_id}`);
    console.log("Mostrando lo recibido: ", response);
    
    obtener.value = response.data;

  } catch (error) {
    console.log("Error al obtener datos", error);
  } finally {
    load.value = false;
  }
};

// funcion de disparador para solicitar aprob informe
const solicitarConformidadporVRI = async () => {
  if (isAprobacionDisabled.value || isLoading.value) return;
  isLoading.value = true;
  const student_id = authStore.id;
  try {
    const response = await axios.get(`/api/vri/crear-primer-filtro/${student_id}`);

    if (response.data.estado) {
      solicitudEstado.value = "pendiente";
      alertToast("Solicitud enviada. Espere las indicaciones correspondientes.", "Éxito", "success");
      await solicitarConformidadporVRI();
    }

  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.mensaje) {
      const mensaje1 = error.response.data.mensaje;
      alertToast(mensaje1, "Advertencia", "warning");
    } else {
      alertToast("Error en la solicitud.", "Error", "error");
    }
  } finally {
    isLoading.value = false; 
  }
};

onMounted(() => {
  obtenerEstudianteConformidadVRI();
});

</script>

<template>
  <template v-if="load">
    <div class="flex-1 p-10 bg-gray-100 min-h-screen">
      <div class="flex justify-center items-center content-center px-14 flex-col">
        <h3 class="bg-gray-200 h-10 w-full rounded-md duration-200 skeleton-loader"></h3><br>
      </div>
      <div class="mt-6 space-y-10">
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5">
            <h2 class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200 mb-20"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto -mt-6 animate-pulse duration-200">
          <div class="block space-y-4">
            <h2 class="bg-gray-200 h-6 w-2/4 rounded-md skeleton-loader duration-200 mb-10"></h2>
            <h2 class="bg-gray-200 h-10 w-64 mx-auto rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="bg-white rounded-md shadow-lg p-6 h-auto mt-4 animate-pulse duration-200">
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"></h2>
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
          <div class="block space-y-5 mb-3">
            <h2 class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"></h2>
          </div>
        </div>
        <div class="flex justify-between">
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
          <div class="block space-y-5"><h2 class="px-4 py-2 h-11 w-28 rounded-md skeleton-loader duration-200"></h2></div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex-1 p-10 font-Roboto bg-gray-100 min-h-screen">
      <h3 class="text-4xl sm:text-4xl font-bold text-center text-azul mb-4">{{ textoTipiado2 }}</h3>
      <div class="mt-6 space-y-10">
        <!-- constancia de tucoach -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h4 class="text-2xl font-medium text-black">1. Curso de Buenas Prácticas - TUCOACH.UDH</h4>
          </div>

          <p class="text-gray-500 mt-1 text-base">Completa el Curso de Buenas Prácticas para obtener la conformidad por Integridad VRI. </p>
          <p class="text-gray-500 mt-1  text-base">Haz clic en
            <strong class="text-base font-medium">“Ir al curso”</strong> para comenzar. Una vez aprobado, podrás visualizar el documento correspondiente.
          </p>
          
          <!-- documento de buuenas practicas -->
          <div class="mt-4 space-y-4">
            <CursoCard 
            :titulo="'Documento emitido por TUCOACH'"
            :estado="obtener?.tu_coach.doc_estado || ''"
            :view="obtener?.tu_coach.doc_ver"/>
          </div>
        </div>

        <!-- solicitar conformidad por VRI -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="relative flex items-center">
            <h2 class="text-2xl font-medium text-black">2. Solicitar conformidad de VRI</h2>      
          </div>
          <p class="text-gray-500 mt-2 mb-1 text-base">Haz clic en el botón  
            <strong class="text-green-500 text-base font-medium">"Solicitar conformidad"</strong> para enviar tu solicitud a la Facultad y al Programa Académico.
          </p>
          <!-- boton para solicitar aprobacion informe final -->
          <div class="flex justify-center mt-2">
              <ButtonS 
                label="Solicitar conformidad" 
                :loading="isLoading" 
                :disabled="isAprobacionDisabled" 
                @click="solicitarConformidadporVRI" />
            </div>
        </div>

        <!-- Punto 3: Revisión de Buenas Prácticas -->
        <!-- <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
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
        </div> -->

        <!-- Punto 4: Revisión de Turnitin -->
        <!-- <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
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
        </div> -->
        
        <!-- documentos de cada filtro del VRI -->
        <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">3. Documentos de cada filtro del VRI</h2>
          </div>

          <div class="mt-4 space-y-4">
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <span class="flex-1 text-xm bg-gray-50">Primer Filtro - VRI.</span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <div v-if="primerFiltro.fil_estado === 'aprobado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2"></div>
                  <span v-else class="text-gray-500 italic">La solicitud se encuentra en proceso</span>
                  <span :class="`estado-estilo estado-${primerFiltro.fil_estado.toLowerCase().replace(' ', '-')}`">
                    {{ formatearTexto(primerFiltro.fil_estado) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 space-y-4">
            <!-- segundo filtro -->
            <DocumentCurso
              :titulo="'Segundo Filtro - VRI.'"
              :estado="segundoFiltro.fil_estado"
              :view="segundoFiltro.fil_ruta"/>

            <!-- tercer filtro -->
            <DocumentCurso
              :titulo="'Tercer Filtro - VRI.'"
              :estado="tercerFiltro.fil_estado"
              :view="tercerFiltro.fil_ruta"/>
          </div>
        </div>

        <!-- Botones siguiente y anteerior -->
        <div class="flex justify-between">
          <button 
            @click="$router.push('/estudiante/conformidad-informe-jurado')" 
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
          </button>
          <button
            @click="handleNextButtonClick"
            :class="['px-4 py-2 text-white rounded-md', isNextButtonDisabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600',]">Siguiente
          </button>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  display: inline-block;
}
.estado-no-iniciado,
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-aprobado {
  background-color: #38a169;
  color: #ffffff;
}
.text-center {
  text-align: center;
  padding: 1rem;
}
</style>