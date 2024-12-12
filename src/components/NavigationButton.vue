<template>
  <!--Botones siguiente y anterior-->
  <div v-if="!prevRoute" class="flex justify-end mt-6">
    <button 
      @click="handleNext" 
      :class="[ 'px-4 py-2 text-white rounded-md', isNextDisabled
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-[#38A169] hover:bg-green-600',]">Siguiente
    </button>
  </div>
  <div v-else class="flex justify-between mt-6">
    <button 
      v-if="prevRoute"
      @click="goToRoute(prevRoute)"
      class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Anterior
    </button>
    <button 
      @click="handleNext" 
      :class="[ 'px-4 py-2 text-white rounded-md', isNextDisabled
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-base hover:bg-green-600',]">Siguiente
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import router from '@/router';
import Swal from 'sweetalert2';

const props = defineProps({
  prevRoute: {
    type: String,
    required: false,
  },
  nextRoute: {
    type: String,
    required: true,
  },
  nextCondition: {
    type: Function,
    required: true,
  },
})

// manejo para el boton siguiente
const handleNext = () => {
  if (isNextDisabled.value) {
    // Mostrar alerta si no cumple la condición
    Swal.fire({
      icon: 'warning',
      title: 'Pasos incompletos',
      text: 'Por favor, completa todos los pasos antes de continuar.',
      confirmButtonText: 'OK',
    });
  } else {
    goToRoute(props.nextRoute);
  }
};

//navegar por las rutas que se define 
const goToRoute = (route: string) => {
  router.push(route);
}

//estado para deshabilitar el boton
const isNextDisabled = computed (() => !props.nextCondition());
</script>