<template>
  <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
    <div class="flex flex-row justify-between items-center text-gray-700 font-medium">
      <!-- Sección izquierda: Icono y título -->
      <div class="flex items-center space-x-4">
        <i class="fas fa-file-alt text-[#39B49E] text-2xl"></i>
        <span class="text-xm text-gray-700 font-medium">{{ titulo }}</span>
      </div>

      <!-- Sección derecha: Botón "Ver" y estado -->
      <div class="flex items-center space-x-4">
        <!-- Botón Ver -->
        <div v-if="estado === 'tramitado' || estado === 'aprobado' || estado === 'emitido'">
          <a
        :href="generateURL(view, id)"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center px-2 py-1 border rounded text-gray-600 border-gray-400 hover:bg-baseClarito transition">
        <i class="fas fa-eye mr-2"></i> Ver
      </a>  
        </div>
        <p v-else-if="estado === 'observado'" class="text-gray-500 italic">{{ observacion }}</p>
        <span v-else class="text-gray-400 italic text-sm">El documento aún no se ha cargado</span>

        <!-- Estado -->
        <span :class="`estado-estilo estado-${estado.toLowerCase().replace(' ', '-')}`">
          {{ formatearTexto(estado) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  titulo: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
  },
  observacion: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    required: true,
  },
  view: {
    type: String,
    required: true,
  },
  download: {
    type: String,
    required: true,
  },
});

const formatearTexto = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  const generateURL = (view: string, id: string): string => {
  console.log("Generando URL con:", { view, id });
  if (!view || !id) {
    console.error("View o ID no proporcionados correctamente:", { view, id });
    return "#";
  }
  return `${view}/${id}`;
};

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
.estado-aprobado {
  background-color: #39B49E;
  color: #ffffff;
}
.estado-tramitado {
  background-color: #38a169;
  color: #ffffff;
}
.estado-tramitado {
  background-color:  #38a169;
  color: #ffffff;
}
.estado-tramitado {
  background-color:  #38a169;
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
