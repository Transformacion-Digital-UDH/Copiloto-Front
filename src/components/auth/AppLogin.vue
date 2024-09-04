<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import router from "@/router";

// Refs para los campos del formulario
const email = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);

// Manejo del inicio de sesión
const handleLogin = async () => {
  try {
    console.log("Email:", email.value);
    console.log("Password:", password.value);

    const response = await axios.post("http://192.168.22.122:8000/api/login", {
      email: email.value,
      password: password.value,
    });

    console.log("Response:", response.data); // Verifica la respuesta completa

    if (response.data) {
      console.log("Login successful:", response.data);
      // Procesar la respuesta, por ejemplo, guardar el token y redirigir al usuario
      localStorage.setItem("token", response.data.token);
    
      // Aquí podrías redirigir al usuario a la página principal o a otra ruta
      router.push('/estudiante');
      errorMessage.value = null; // Asegúrate de limpiar el mensaje de error en caso de éxito
    } else {
      console.log("Login failed:", response.data.message);
      errorMessage.value = response.data.message || "Credenciales incorrectas.";
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error en el inicio de sesión:", error.response?.data);
      errorMessage.value =
        error.response?.data.message ||
        "Hubo un error al intentar iniciar sesión. Por favor, inténtelo de nuevo.";
    } else {
      console.error("Error en el inicio de sesión:", error);
      errorMessage.value =
        "Hubo un error al intentar iniciar sesión. Por favor, inténtelo de nuevo.";
    }
  }
};
</script>

<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg px-8 py-6">
      <div class="text-center mb-6">
        <h6 class="text-2xl text-azul font-semibold">Iniciar sesión</h6>
        <p class="text-sm text-gray-600">
          ¿Aún no tienes una cuenta?
          <router-link to="/register" class="text-base hover:underline"
            >Regístrate aquí</router-link
          >
        </p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
            for="email"
            >Correo electrónico</label
          >
          <input
            type="email"
            id="email"
            placeholder="Correo electrónico"
            v-model="email"
            class="input-field"
            required
          />
        </div>
        <div class="mb-4">
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
            for="password"
            >Contraseña</label
          >
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            v-model="password"
            class="input-field"
            required
          />
        </div>
        <div class="text-center mt-6">
          <button
            type="submit"
            class="w-full bg-base text-white py-3 rounded-lg hover:bg-azulOscuro transition duration-150"
          >
            INICIAR SESIÓN
          </button>
        </div>
        <div v-if="errorMessage" class="mt-4 text-red-600 text-center">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
}

.bg-base {
  background-color: #007bff; /* Cambia esto a tu color base */
}

.bg-azulOscuro {
  background-color: #1e3a8a;
}
</style>
