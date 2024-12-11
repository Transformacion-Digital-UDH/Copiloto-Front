<script>
export default {
  props: {
    estado: {
      type: String,
      required: true,
    },
  },
  computed: {
    estadoClase() {
      const estadoLowerCase = this.estado.toLowerCase();
      switch (estadoLowerCase) {
        case "pendiente":
          return "bg-gray-400 text-white";
        case "en progreso":
          return "bg-gray-400 text-white";
        case "aceptado":
          return "bg-green-500 text-white";
        case "tramitado":
          return "bg-green-500 text-white";
        case "rechazado":
          return "bg-red-500 text-white";
        default:
          return "bg-gray-200 text-gray-700";
      }
    },
  },
  methods: {
    capitalizeFirstLetter(text) {
      if (!text) return "Desconocido";
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
  },
};
</script>

<template>
  <span :class="['estado-estilo', estadoClase]">
    {{ capitalizeFirstLetter(estado) }}
  </span>
</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 9999px; /* Esto aplica rounded-full */
  border: 1px solid #d1d5db;

}

.bg-gray-400 {
  background-color: #9ca3af;
  color: white;
}

.bg-red-500 {
  background-color: #e53e3e;
  color: white;
}

.bg-green-500 {
  background-color: #38a169;
  color: white;
}

.bg-orange-500 {
  background-color: #ed8936;
  color: white;
}

.bg-gray-200 {
  background-color: #e2e8f0;
  color: #4a5568;
}
</style>
