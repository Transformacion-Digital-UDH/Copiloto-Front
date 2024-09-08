<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "#" },
  { name: "Copilot", href: "https://copiloto.udh.edu.pe/" },
];

const token = localStorage.getItem("token");
const selected = ref("Inicio");
const menuOpen = ref(false);
const router = useRouter();

function selectItem(name) {
  selected.value = name;
  menuOpen.value = false;
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function goToLoginOrEstudiante() {
  if (token) {
    router.push("/estudiante");
  } else {
    router.push("/login");
  }
}
</script>

<template>
  <nav class="bg-white-800 shadow-md font-Roboto">
    <div
      class="max-w-full w-[1700px] px-2 sm:px-6 lg:px-8 flex justify-between items-center h-20 mx-auto "
    >
      <!-- Logo -->
      <a href="/" aria-label="Inicio">
        <img class="h-12" src="/img/logo_light.svg" alt="Logo" />
      </a>
      <!-- Menu -->
      <div class="hidden sm:flex space-x-6 ">
        <a
          v-for="item in navigation"
          :key="item.name"
          :href="item.href"
          @click="selectItem(item.name)"
          :class="[
            selected === item.name
              ? 'bg-base text-white'
              : 'text-custom-gray hover:bg-base hover:text-white',
            'rounded-md px-4 py-3 text-lg font-light',
          ]"
        >
          {{ item.name }}
        </a>
      </div>
      <button
        @click="goToLoginOrEstudiante"
        class="bg-base text-white p-2 rounded-full min-w-[140px] hidden sm:block"
      >
        Iniciar Sesion
      </button>
      <!-- Mobile Menu Button -->
      <button
        @click="toggleMenu"
        class="sm:hidden p-2 text-custom-gray hover:bg-base hover:text-white focus:ring-2 focus:ring-inset focus:ring-white"
      >
        <i :class="[menuOpen ? 'fas fa-times' : 'fas fa-bars', 'h-6 w-6']"></i>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="menuOpen" class="sm:hidden">
      <div class="space-y-1 px-2 pb-3 pt-2">
        <a
          v-for="item in navigation"
          :key="item.name"
          :href="item.href"
          @click="selectItem(item.name)"
          :class="[
            selected === item.name
              ? 'bg-base text-white'
              : 'text-custom-gray hover:bg-base hover:text-white',
            'block rounded-md px-4 py-3 text-lg font-light',
          ]"
        >
          {{ item.name }}
        </a>
        <button
          @click="handleButtonClick"
          class="block w-full text-left rounded-md px-4 py-3 bg-base text-white"
        >
          Iniciar Sesion
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Ajusta estilos para mantener la barra de navegación responsiva */
@media (max-width: 640px) {
  .nav-item {
    font-size: 0.875rem; /* Ajusta el tamaño de fuente para pantallas pequeñas */
  }
}
</style>
