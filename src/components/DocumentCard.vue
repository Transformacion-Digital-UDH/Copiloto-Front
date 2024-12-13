<template>
  <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-700 font-medium space-y-4 sm:space-y-0">
      <!-- Sección izquierda: Icono y título -->
      <div class="flex items-start sm:items-center sm:space-x-4">
        <i class="fas fa-file-alt text-[#39B49E] text-xl sm:text-2xl mr-2"></i>
        <span class="text-sm sm:text-md font-medium break-all text-left text-gray-700">
          {{ titulo }}
        </span>
      </div>

      <!-- Sección derecha: Botón "Ver" y estado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-left sm:text-left">
        <!-- Botón Ver -->
        <div v-if="estado === 'tramitado' || estado === 'aprobado' || estado === 'emitido'">
          <a :href="generateURL(view, id)" target="_blank" rel="noopener noreferrer"
            class="flex items-center m-2 relative group">
            <IconEyeCerrar class="mr-1 group-hover:hidden" />
            <IconEyeAbrir class="mr-1 hidden group-hover:block" />
            <span class="text-[#34495e]">Ver</span>
          </a>
        </div>
        <p v-else-if="estado === 'observado'" class="text-gray-500 italic text-sm sm:text-base">
          {{ observacion }}
        </p>
        <span v-else class="text-gray-400 italic text-sm sm:text-md">El documento aún no se ha cargado</span>

        <!-- Estado -->
        <span :class="`estado-estilo estado-${estado
          .toLowerCase()
          .replace(' ', '-')}`">
          {{ formatearTexto(estado) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

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

.estado-no-iniciado {
  background-color: #8898aa;
  color: #ffffff;
}

.estado-aprobado {
  background-color: #39b49e;
  color: #ffffff;
}

.estado-tramitado {
  background-color: #38a169;
  color: #ffffff;
}

.estado-observado {
  background-color: #e79e38;
  color: #ffffff;
}

.break-all {
  word-break: break-word;
}
</style>
