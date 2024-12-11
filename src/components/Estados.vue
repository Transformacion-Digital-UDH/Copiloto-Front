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
        case "rechazado":
          return "bg-red-500 text-white";
        case "pendiente":
          return "bg-gray-400 text-white";
        case "aceptado":
          return "bg-[#39B49E] text-white";
        case "tramitado":
          return "bg-green-500 text-white";
        case "observado":
          return "bg-orange-400 text-white";
        case "en_progreso":
          return "bg-gray-400 text-white";
        default:
          return "bg-gray-400 text-white";
      }
    },
  },
  methods: {
    capitalizeFirstLetter(text) {
      if (!text) return "Pendiente";
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
  border-radius: 0.375rem;
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
