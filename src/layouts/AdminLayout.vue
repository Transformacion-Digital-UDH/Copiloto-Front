<script setup>
import { useRoute } from 'vue-router';
import AdminHeader from '@/components/AdminHeader.vue';
import Sidebar from '@/components/Sidebar.vue';
const route = useRoute();
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <div class="flex-grow flex flex-col overflow-hidden">
      <!-- Header -->
      <AdminHeader />

      <!-- Content area with scroll -->
      <main class="flex-grow overflow-y-auto bg-white">
        <div v-if="route.path === '/estudiante'" class="flex items-center justify-center h-full">
          <div class="text-center animate-bounce">
            <h1 class="text-4xl font-bold mb-6 text-azul uppercase">Bienvenido(a) al sistema de titulación</h1>
          </div>
        </div>
        <div v-else-if="route.path === '/paisi'" class="flex items-center justify-center h-full">
          <div class="text-center animate-bounce absolute p-10">
            <h1 class="text-4xl font-bold mb-6 text-azul uppercase">Bienvenido(a) Programa Académico de Ingeniería de Sistemas e Informática</h1>
          </div>
        </div>
        <router-view v-else />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Estilo para asegurar que el Sidebar sea fijo y el contenido tenga scroll */
.sidebar {
  width: 16rem; /* Ancho del Sidebar */
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto; /* Scroll solo en el sidebar */
  box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
}

.main-content {
  margin-left: 16rem; /* Deja espacio para el sidebar */
}

</style>
