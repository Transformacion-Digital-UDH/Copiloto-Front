<script setup>
import AdminHeader from '../components/AdminHeader.vue';
import Sidebar from '../components/Sidebar.vue';
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
      <main class="flex-grow overflow-y-auto p-4 bg-gray-100">
        <router-view />
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
