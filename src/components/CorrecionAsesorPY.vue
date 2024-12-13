<template>
  <table class="w-full max-w-full bg-white border rounded-md shadow">
    <thead class="text-sm ">
      <tr class="text-center text-azul bg-gray-200 truncate">
        <th class="px-2 py-2 tracking-wider">N° REVISIÓN</th>
        <th class="px-2 py-2 tracking-wider">FECHA</th>
        <th class="px-2 py-2 tracking-wider">ACCIÓN</th>
        <th class="px-2 py-2 tracking-wider">ESTADO</th>
      </tr>
    </thead>
    <tbody v-if="revisiones && revisiones.length > 0">
      <tr
        v-for="revision in revisiones"
        :key="revision.revision_id"
        class="text-center">
        <td class="px-4 py-2 text-xm text-gray-600">
          <p class="truncate">{{ revision.cantidad || 'Sin revisión' }}</p>
        </td>
        <td class="px-4 py-2 text-xm text-gray-600">
          <p class="truncate">{{ revision.fecha || 'Sin fecha' }}</p>
        </td>
        <td class="px-4 py-4">
          <button
            :disabled="revision.estado === 'pendiente' || revision.estado === 'aprobado'"
            :class="[ 
              'truncate px-4 py-2 text-sm text-white bg-base rounded-md focus:outline-none font-medium', 
              revision.estado === 'pendiente' || revision.estado === 'aprobado' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-base hover:bg-[#29a790]',]"
            @click="actualizarEstado(revision.revision_id)"
          >
            <i class="fas fa-comment text-blue-500 mr-2"></i> Observaciones corregidas
          </button>
        </td>
        <td class="px-4 py-2">
          <span :class="`estado-estilo estado-${revision.estado.toLowerCase().replace(' ', '-')}`">
            {{ formatearTexto(revision.estado) }}
          </span>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="4" class="px-4 py-6 text-gray-500 text-center align-middle">
          <i class="fas fa-exclamation-circle mr-2 text-red-700 text-xm"></i>No hay observaciones disponibles por el momento.
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

interface Revision {
  revision_id: string;
  cantidad: number;
  estado: string;
  fecha: string;
}

const props = defineProps({
  revisiones: {
    type: Array as PropType<Revision[]>,
    required: true,
  },
});

const emit = defineEmits(["actualizarEstado"]);

const actualizarEstado = (id: string) => {
  emit("actualizarEstado", id);
};

const formatearTexto = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
</script>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.775rem;
  border-radius: 0.375rem;
  display: inline-block;
}
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
.estado-tramitado,
.estado-aprobado {
  background-color: #38a169;
  color: #ffffff;
}
.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}
</style>