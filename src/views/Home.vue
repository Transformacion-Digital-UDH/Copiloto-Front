<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
});
window.addEventListener('scroll', function() {
  const parallaxImage = document.getElementById('parallaxImage');
  let scrollPosition = window.scrollY;
  parallaxImage.style.transform = `translateY(${scrollPosition * 0.2}px)`;
});

onMounted(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  });

  document.querySelectorAll('.number-slide').forEach(el => {
    observer.observe(el);
  });
});
</script>

<template>
  <div class="w-full h-screen flex flex-col justify-between">
    <!-- Contenido principal -->
    <div class="flex flex-col md:flex-row items-center justify-between flex-grow px-8 pt-8 md:pt-10">
      <!-- Sección Izquierda: Contenido -->
      <div class="flex flex-col justify-start w-full md:w-9/12 lg:w-9/12 h-full">
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-medium text-azul mb-8 md:mb-10 font-Quicksand leading-tight">
            SISTEMA DE <br> ACOMPAÑAMIENTO<br> PARA LA OBTENCIÓN <br>  DEL TÍTULO
        </h1>
        <br>
        <p class="text-lg mt-4 md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 ">
          Tu viaje hacia la graduación, simplificado y a tu alcance. <br> Porque cada trámite cuenta en tu camino al éxito académico.
        </p>
        <div class="mt-6">
            <router-link to="/login">
                <button
                @click="handleButtonClick"
                class="bg-base hover:bg-green-600 text-white p-4 rounded-full w-50 text-xl transition-transform duration-500 ease-in-out transform hover:scale-110">
                Empezar Ahora
                </button>
            </router-link>
            </div>
        <!-- Sección de estadísticas -->
        <div class="mt-8 w-full max-w-3xl">
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col items-start">
              <p class="text-4xl md:text-5xl lg:text-6xl font-regular text-amarillo number-slide">124</p>
              <p class="text-lg md:text-xl lg:text-2xl text-amarillo w-full ">Titulados</p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-4xl md:text-5xl lg:text-6xl font-regular text-amarillo number-slide">124</p>
              <p class="text-lg md:text-xl lg:text-2xl text-amarillo w-full ">Proyectos</p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-4xl md:text-5xl lg:text-6xl font-regular text-amarillo number-slide">54,749</p>
              <p class="text-lg md:text-xl lg:text-2xl text-amarillo w-full">Estudiantes</p>
            </div>
          </div>
        </div>

      </div>
       <!-- Sección Derecha: Imágenes -->
      <div class="flex items-center justify-center w-full md:w-7/12 lg:w-7/12 h-auto mb-0">
        <img src="/img/tesis_hero.png" alt="Imagen de Tesis" class="transition-transform duration-500 ease-in-out transform hover:scale-110 w-full h-auto max-w-[87%] object-contain">
      </div>
    </div>
   
  </div>
</template>


<style scoped>
/* Estilos adicionales si es necesario */
h1, p {
  margin: 0;
  padding: 0;
}

.w-full {
  width: 100%;
}

.h-screen {
  height: 100vh;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}
h1, p {
  margin: 0;
  padding: 0;
}

.w-full {
  width: 100%;
}

.h-screen {
  height: 100vh;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Animación para los números */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.number-slide {
  opacity: 0; /* Esconder inicialmente */
  transform: translateX(-100%); /* Iniciar fuera de la pantalla */
  transition: all 0.5s ease-in-out;
}

.number-slide.visible {
  animation: slideInLeft 1s forwards;
}
</style>
