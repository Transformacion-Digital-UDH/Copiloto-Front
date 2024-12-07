<template>
  <table class="w-full max-w-full bg-white border rounded-md shadow">
    <thead>
      <tr class="text-center text-azul bg-gray-300 truncate">
        <th class="px-2 py-2 tracking-wider">N° REVISIÓN</th>
        <th class="px-2 py-2 tracking-wider">FECHA</th>
        <th class="px-2 py-2 tracking-wider">ACCIÓN</th>
        <th class="px-2 py-2 tracking-wider">ESTADO</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!revisiones.length">
        <td colspan="4" class="px-4 py-6 text-gray-500  text-center align-middle">
          <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>Aún no hay revisiones realizadas por el jurado.
        </td>
      </tr>
      <tr v-else v-for="revision in revisiones" :key="revision.revision_id" class="text-center">
        <td class="px-4 py-2 text-base text-gray-600">
          <p class="truncate">{{ revision.numero_revision || 'Sin revisión' }}</p>
        </td>
        <td class="px-4 py-2 text-base text-gray-600">
          <p class="truncate">{{ revision.fecha || 'Sin fecha' }}</p>
        </td> 
        <td class="px-4 py-4">
          <button
            :disabled="isRevisionDisabled(revision.estado) || loading[revision.revision_id]"
            :class="[isRevisionDisabled(revision.estado) ? 'truncate px-4 py-2 bg-gray-400 cursor-not-allowed' : 'bg-base', loading[revision.revision_id] ? 'bg-azul' : '']"
             class="px-4 py-1 w-44 text-white rounded-md text-lg"
            @click="solicitarRevision(revision.revision_id, 'pendiente')">
            {{ loading[revision.revision_id] ? 'Enviando...' : 'Solicitar revisión' }}
          </button>
        </td>
        <td class="px-4 py-2">
          <span :class="`estado-estilo estado-${revision.estado.toLowerCase().replace(' ', '-')}`">
            {{ revision.estado.charAt(0).toUpperCase() + revision.estado.slice(1).toLowerCase() }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

interface Revision {
  revision_id: string;
  numero_revision: number | null;
  fecha: string | null;
  estado: string;
}

const props = defineProps<{
  revisiones: Revision[];
  loading: {[key: string]: boolean}
  isRevisionDisabled: (estado: string) => boolean;
  solicitarRevision: (reviewId: string, status: string) => void;
}>();
</script>

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
.estado-tramitado,
.estado-aprobado {
  background-color: #48bb78;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
</style>