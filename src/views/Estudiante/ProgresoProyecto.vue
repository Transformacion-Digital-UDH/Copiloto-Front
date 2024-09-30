<script>
export default {
  data() {
    const startDate = "2024-07-16";
    const endDate = "2024-11-16";
    const progressValue = 45;

    return {
      startDate,
      endDate,
      progressValue
    };
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-x-16 w-full max-w-7xl mx-auto">

      <!-- Imagen SVG a la izquierda -->
      <div class="w-72 h-72 lg:w-96 lg:h-96 flex-shrink-0">
        <img src="/img/p4.svg" alt="Descripción de la imagen" class="w-full h-full object-contain" />
      </div>

      <!-- Contenido central -->
      <div class="flex-grow flex flex-col space-y-8 items-center lg:items-center text-center lg:text-center">
        <h2 class="text-4xl text-base md:text-4xl lg:text-6xl font-bold">Progreso de tu Proyecto de Tesis</h2>
        <br>
        <br>

        <div class="flex justify-around w-full space-x-8">
          <!-- Tarjeta de Fecha de Inicio -->
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-64">
            <div class="text-lg font-semibold text-gray-600">Inicio</div>
            <div class="text-2xl font-bold">{{ startDate }}</div>
          </div>

          <!-- Circular Progress -->
          <div class="flex items-center justify-center">
            <div class="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-3xl sm:text-4xl md:text-5xl font-medium">{{ progressValue }}%</div>
              </div>
              <svg class="transform -rotate-90 w-full h-full" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.91549431" fill="transparent" stroke="#e5e7eb" stroke-width="3"></circle>
                <circle cx="21" cy="21" r="15.91549431" fill="transparent" stroke="#10b981" stroke-width="3" stroke-dasharray="100" :stroke-dashoffset="100 - progressValue"></circle>
              </svg>
            </div>
          </div>

          <!-- Tarjeta de Fecha de Fin -->
          <div class="bg-gray-100 p-6 rounded-lg shadow-lg text-center w-64">
            <div class="text-lg font-semibold text-gray-600">Fin</div>
            <div class="text-2xl font-bold">{{ endDate }}</div>
          </div>
        </div>

        <!-- Mensaje -->
        <div class="text-yellow-600 text-lg md:text-xl">
          Aún no puedes presentar tu informe.
        </div>

        <!-- Botones debajo del circular progress -->
        <div class="flex justify-center gap-6">
          <button class="px-8 py-4 bg-baseClarito text-white rounded-lg hover:bg-blue-700 transition text-lg md:text-xl">
            Ver más detalles
          </button>
          <button class="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-lg md:text-xl">
            Ir a Informe Final
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
svg {
  overflow: visible;
}
circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(90deg);
  transform-origin: 50% 50%;
}
</style>
