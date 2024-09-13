<template>
  <div
    v-if="isVisible"
    :class="`fixed top-4 right-4 p-4 rounded-lg shadow-lg bg-white text-black w-96`"
  >
    <div class="flex items-center">
      <!-- Ícono basado en el tipo de alerta -->
      <div :class="`w-10 h-10 mr-2 ${iconColor}`">
        <svg
          v-if="type === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-if="type === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <svg
          v-if="type === 'warning'"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01M5.22 4.22a8 8 0 0111.56 0A8 8 0 0112 20a8 8 0 01-6.78-11.78z"
          />
        </svg>
      </div>
      <ol v-for="msg in message" :key="message" class="flex flex-col">
        <li> - {{ msg }}</li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";

// Props
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "success", // Tipos posibles: success, error, warning
  },
  duration: {
    type: Number,
    default: 3000, // Tiempo en milisegundos (3 segundos por defecto)
  },
});

// Estado para controlar la visibilidad de la alerta
const isVisible = ref(true);

// Color y estilo según el tipo de alerta
const iconColor = computed(() => {
  switch (props.type) {
    case "success":
      return "text-green-500";
    case "error":
      return "text-red-500";
    case "warning":
      return "text-yellow-500";
    default:
      return "text-blue-500";
  }
});

// Cuando el componente se monta, se inicia el temporizador para ocultar la alerta
onMounted(() => {
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});
</script>
