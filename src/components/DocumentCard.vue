<template>
  <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
    <div class="flex flex-col md:flex-row justify-between md:items-center">
      <span class="flex-1 text-xm bg-gray-50">{{ titulo }}</span>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
          <div v-if="estado === 'tramitado'" class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
            <a
              :href="`${view}/${id}`"
              target="_blank"
              class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
              <i class="fas fa-eye mr-2"></i> Ver
            </a>
            <a
              :href="`${download}/${id}`"
              download
              class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
              <i class="fas fa-download mr-2"></i> Descargar
            </a>
          </div>
          <p v-else-if="estado === 'observado'" class="text-gray-500 italic">
            {{ observacion }}
          </p>

          <span v-else class="text-gray-500 italic">
            El documento aún no se ha cargado 
            <span v-if="estado === 'pendiente'"></span>
          </span>

          <span :class="`estado-estilo estado-${estado.toLowerCase().replace(' ', '-')}`">
            {{ letraMayus(estado) }}
          </span>
        </div>
    </div>
  </div>
  </template>
  
<script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: "DocumentoCard",
    props: {
      titulo: {
        type: String,
        required: true
      },
      estado: {
        type: String,
        required: true
      },
      observacion: {
        type: String,
        default: "Por favor, comunícate con secretaría"
      },
      id: {
        type: String,
        required: true
      },
      view: {
        type: String,
        required: true
      },
      download: {
        type: String,
        required: true
      }
    },
    methods: {
      letraMayus(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      }
    }
  });
</script>
  
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
  .estado-tramitado {
    background-color: #38a169;
    color: #ffffff;
  }
  .estado-no-iniciado {
    background-color: #718096;
    color: #ffffff;
  }
  .estado-observado {
    background-color: #e79e38;
    color: #ffffff;
  }
  .break-all {
    word-break: break-all;
  }
</style>
