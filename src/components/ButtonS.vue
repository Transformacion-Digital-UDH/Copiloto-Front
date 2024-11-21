<template>
    <button
      :disabled="disabled"
      :class="[disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-azul', 
      loading ? 'cursor-not-allowed' : '', 'px-4 py-2 w-64 text-white rounded-md text-lg']"
      @click="enviarSolicitud">
      {{ loading ? 'Enviando...' : label }}
    </button>
</template>

<script>
export default {
  name: "ButtonS",
  props: {
    label: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["clic"],
  methods: {
    enviarSolicitud() {
      if (!this.disabled && !this.loading) {
        this.$emit("clic");
      }
    },
  },
};
</script>

<style scoped>
</style>
  