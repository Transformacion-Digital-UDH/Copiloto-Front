<template>
    Bienvenido administrador {{ authStore.fullName }}
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/auth';
    const authStore = useAuthStore();
</script>