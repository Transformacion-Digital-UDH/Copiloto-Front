<template>
    <span
      class="flex items-center justify-center h-8 w-8 rounded-full border-2"
      :class="{
        'bg-green-500 border-green-500 text-white': estado === 'aceptado' || estado === 'hecho' || estado === 'aprobado' || estado === 'tramitado',
        'bg-orange-500 border-orange-500 text-white': estado === 'en progreso',
        'bg-gray-400 border-gray-400 text-white': !estado || estado === 'pendiente' || estado === 'rechazado',
        'bg-yellow-500 border-yellow-500 text-white': estado === 'observado'
      }"
    >
      <i
        :class="{
          'fas fa-check': estado === 'aceptado' || estado === 'hecho' || estado === 'aprobado' || estado === 'tramitado',
          'fas fa-hourglass-half': estado === 'en progreso',
          'fas fa-ellipsis-h': !estado || estado === 'pendiente' || estado === 'rechazado',
          'fas fa-exclamation-circle': estado === 'observado'
        }"
        class="text-sm"
      ></i>
    </span>
  </template>
  
  <script>
  export default {
    props: {
      estado: {
        type: String,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  /* Puedes agregar estilos adicionales aquí si lo necesitas */
  </style>
  