<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { computed } from "vue";

const mostrarModalTramite = ref(false);
const load = ref(false);

// ***** Texto que se escribe automáticamente ********
const text = "Conformidad de Proyecto de Tesis por el Asesor";
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

// Definir tipos para trámites y documentos
interface Documento {
  nombre: string;
  estado: string;
  documentoUrl: string;
}

const procesos = ref([
  { título: 'TRAMITE: APROBACIÓN DEL TRABAJO DE INVESTIGACIÓN (TESIS)', estado: 'Hecho' }, 
]);

// Estado general del sistema
const estadoTramite = ref('Pendiente');  // Puede ser: Pendiente, En Proceso, Hecho

// Trámites del sistema
const tramites = ref([
  { titulo: 'Trámite en el Sistema', estado: 'Pendiente' },
  { titulo: 'Pago de Trámite', estado: 'Pendiente' },
]);

// Documentos para la aprobación del proyecto
const documentos = ref<Documento[]>([
  { nombre: 'Oficio de Secretaria PAISI', estado: 'Hecho', documentoUrl: '' },
  { nombre: 'Resolución de Facultad', estado: 'Pendiente', documentoUrl: '' },
]);

// Computed para habilitar el botón "Siguiente" solo si todos los trámites y documentos están en "Hecho"
const todosCompletos = computed(() => {
  const tramitesHechos = tramites.value.every(tramite => tramite.estado === 'Hecho');
  const documentosHechos = documentos.value.every(documento => documento.estado === 'Hecho');
  return tramitesHechos && documentosHechos;
});

// Método para determinar la clase del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case 'Hecho':
      return 'bg-green-500 text-white';
    case 'Pendiente':
      return 'bg-gray-400 text-white';
    default:
      return '';
  }
};

</script>
<template>
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div
        class="flex justify-center items-center content-center px-14 flex-col">
        <h3
          class="bg-gray-200 h-11 w-4/5 rounded-lg duration-200 skeleton-loader"
        ></h3>
      </div>
      <div class="mt-6 space-y-10">
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-28 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-1/6 rounded-md skeleton-loader duration-200"
            ></h2>
            <div class="flex justify-between items-center">
              <h2
                class="bg-gray-200 h-6 w-96 rounded-md skeleton-loader duration-200"
              ></h2>
            </div>
            <div class="h-7">
              <h2
                class="bg-gray-200 h-10 w-40 mx-auto rounded-md skeleton-loader duration-200"
              ></h2>
            </div>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-2/4 rounded-md skeleton-loader duration-200"
            ></h2>
            <h2
              class="bg-gray-200 h-24 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
        >
          <div class="block space-y-5">
            <h2
              class="bg-gray-200 h-8 w-44 rounded-md skeleton-loader duration-200"
            ></h2>
            <h2
              class="bg-gray-200 h-20 w-full rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="block space-y-5">
            <h2
              class="px-4 py-2 h-11 w-24 rounded-md skeleton-loader duration-200"
            ></h2>
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
      <h3 class="text-5xl font-bold text-center text-azul">
        {{ textoTipiado2 }}
      </h3>
      <br>
      <!-- Card 1: Pago de Trámite -->
      <div class="bg-white rounded-lg shadow-lg p-6 relative">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-black">1. Pago de Trámite</h2>
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalTramite = true"
                @mouseleave="mostrarModalTramite = false" />
          </div>

          <div v-show="mostrarModalTramite" class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10">
            <p class="text-sm text-gray-600">
              Asegurate de haber realizado el pago del trámite.
            </p>
          </div>

          <!-- Listado de trámites dinámico -->
          <div class="mt-4 space-y-6">
            <div v-for="(proceso, index) in procesos.slice(0, 1)" :key="index"
              class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
              <h4 class="text-black flex-1">{{ proceso.título }}</h4>
              <span :class="estadoClase(proceso.estado)" class="estado-estilo ml-4">{{ proceso.estado }}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 space-y-10">
          <!-- Card 1: Inicio de Trámite -->
          <div class="bg-white rounded-lg shadow-lg p-6 relative">
            <h2 class="text-2xl font-medium text-black">1. Inicio de Trámite</h2>
            <!-- Listado de trámites dinámico -->
            <div class="mt-4 space-y-6">
              <div v-for="(tramite, index) in tramites" :key="index"
                class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
                <h4 class="text-black flex-1">{{ tramite.titulo }}</h4>
                <span :class="estadoClase(tramite.estado)" class="estado-estilo ml-4">{{ tramite.estado }}</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Documentos -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-medium text-black">2. Documentos</h2>

            <!-- Listado de documentos -->
            <div class="mt-4 space-y-6">
              <div v-for="(documento, index) in documentos" :key="index"
                class="bg-gray-50 p-4 border border-gray-200 rounded-md flex items-center justify-between">
                <!-- Nombre del documento -->
                <span class="text-black flex-1">{{ documento.nombre }}</span>

                <div class="flex space-x-4 items-center">
                  <!-- Botón de Ver -->
                  <a v-if="documento.estado === 'Hecho'" :href="documento.documentoUrl" target="_blank"
                    class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>

                  <!-- Botón de Descargar -->
                  <a v-if="documento.estado === 'Hecho'" :href="documento.documentoUrl" download
                    class="px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100">
                  <i class="fas fa-download mr-2"></i> Descargar
                  </a>

                  <!-- Estado del documento -->
                  <span :class="estadoClase(documento.estado)" class="estado-estilo">{{ documento.estado }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón "Siguiente" -->
          <div class="flex justify-end mt-8">
            <button :disabled="!todosCompletos"
              :class="todosCompletos ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'"
              class="px-4 py-2 text-white rounded-md">
              Siguiente
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
  font-weight: 400;
  border-radius: 0.375rem;
  display: inline-block;
}

.break-all {
  word-break: break-all;
}
</style>
