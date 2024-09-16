<script>
export default {
  data() {
    const startDate = "2024-07-16"; // Fecha de inicio en formato YYYY-MM-DD
    const endDate = "2022-07-16"; // Fecha de finalización en formato YYYY-MM-DD
    const progressValue = 45; // Progreso en porcentaje

    // Calcular los días restantes
    const currentDate = new Date(); // Fecha actual
    const end = new Date(endDate); // Convertimos la fecha de finalización a objeto Date
    const timeDiff = end - currentDate; // Diferencia en milisegundos entre la fecha actual y la de finalización
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convertimos los milisegundos a días

    return {
      progressValue,
      startDate,
      endDate,
      daysLeft, // Días restantes calculados
    };
  },
};
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-gray-100 p-4">
      <div class="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-lg md:max-w-2xl lg:max-w-3xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 tracking-wide text-gray-800">Progreso de tu Proyecto de Tesis</h2>
  
        <!-- Barra de progreso circular -->
        <div class="relative mb-6 flex justify-center">
          <div class="radial-progress" :style="{ '--value': progressValue }">
            <div class="text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl md:text-3xl lg:text-4xl font-bold text-gray-700">
              {{ progressValue }}%
            </div>
          </div>
        </div>
  
        <!-- Fechas de inicio y finalización -->
        <div class="flex justify-between text-sm md:text-lg lg:text-xl text-gray-600 mb-4">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"></path>
            </svg>
            <span>Inicio: {{ startDate }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"></path>
            </svg>
            <span>Fin: {{ endDate }}</span>
          </div>
        </div>
  
        <!-- Barra de progreso horizontal -->
        <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div class="bg-green-500 h-2 rounded-full transition-all duration-500" :style="{ width: progressValue + '%' }"></div>
        </div>
  
        <!-- Mensaje de alerta con los días faltantes -->
        <div v-if="daysLeft > 0" class="text-center text-yellow-600 font-semibold bg-yellow-100 p-3 rounded mb-4 text-sm md:text-lg lg:text-xl">
          Aún no puedes presentar tu informe final. Faltan {{ daysLeft }} días.
        </div>
        <div v-else class="text-center text-green-600 font-semibold bg-green-100 p-3 rounded mb-4 text-sm md:text-lg lg:text-xl">
          ¡Puedes presentar tu informe final!
        </div>
  
        <!-- Botones de acción -->
        <div class="flex justify-center gap-4">
          <button class="flex items-center bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-400 text-sm md:text-lg lg:text-xl transition-all duration-300">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Ver más detalles
          </button>
          <button class="flex items-center bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-200 text-sm md:text-lg lg:text-xl transition-all duration-300">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v16c0 .55.45 1 1 1h14a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1z"></path>
            </svg>
            Subir borrador
          </button>
        </div>
      </div>
    </div>
  </template>
  

  
  <style scoped>
  /* Estilo para la barra de progreso circular */
  .radial-progress {
    --size: 150px; /* Tamaño base */
    --thickness: 12px;
    --color: #4ade80; /* Color verde de Tailwind */
    position: relative;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: conic-gradient(var(--color) calc(var(--value) * 1%), #e5e7eb 0%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: #374151; /* Texto en gris oscuro */
    animation: progress-animation 2s ease-out;
  }
  @keyframes progress-animation {
    from {
      --value: 0;
    }
    to {
      --value: calc(var(--value));
    }
  }
  
  @media (min-width: 768px) {
    /* Ajustamos el tamaño de la barra circular en pantallas medianas */
    .radial-progress {
      --size: 200px;
    }
  }
  
  @media (min-width: 1024px) {
    /* Ajustamos el tamaño de la barra circular en pantallas grandes */
    .radial-progress {
      --size: 250px;
    }
  }
  
  .radial-progress::before {
    content: '';
    position: absolute;
    width: calc(var(--size) - var(--thickness) * 2);
    height: calc(var(--size) - var(--thickness) * 2);
    border-radius: 50%;
    background-color: white;
  }
  </style>
  