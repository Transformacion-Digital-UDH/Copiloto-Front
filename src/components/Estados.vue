<script>
export default {
  props: {
    estado: {
      type: String,
      required: true,
    },
  },
  methods: {
    capitalizeFirstLetter(text) {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
  },
};
</script>

<template>
  <span class="bg-green-500 text-white estado-estilo">
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

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}
</style>