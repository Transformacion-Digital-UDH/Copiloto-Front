<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Composables
const router = useRouter();

// Refs para los campos del formulario
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

const handleLogin = () => {
  // Aquí puedes agregar la lógica de autenticación
  // Luego redirigir al usuario a otra página
  router.push('/estudiante/designacion-asesor'); // Redirige al usuario a la ruta principal
};
</script>

<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg px-8 py-6">
      <div class="flex justify-center mb-6">
        <img src="/img/logo.svg" alt="Logo" class="h-16 w-auto"/>
      </div>
      <div class="text-center mb-6">
        <h6 class="text-2xl text-azul font-semibold">Iniciar sesión</h6>
        <p class="text-sm text-gray-600">
          ¿Aún no tienes una cuenta?
          <router-link to="/register" class="text-base hover:underline">Regístrate aquí</router-link>
        </p>
      </div>
      <div class="flex justify-center mb-4">
        <button
          class="flex items-center justify-center bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-4 py-2 rounded-lg shadow hover:shadow-md transition duration-150"
          type="button"
        >
          <img src="/img/google.png" alt="Google" class="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Continuar con Google</span>
        </button>
      </div>
      <div class="flex items-center justify-center my-4">
        <hr class="w-1/3 border-t border-gray-300" />
        <span class="mx-2 text-gray-500">o</span>
        <hr class="w-1/3 border-t border-gray-300" />
      </div>
      <div>
        <form>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2" for="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Correo electrónico" 
              v-model="email" 
              class="input-field" 
            />
          </div>
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700" for="password">Contraseña</label>
              <router-link to="/forgot-password" class="text-base text-sm hover:underline">¿Olvidó su contraseña?</router-link>
            </div>
            <input 
              type="password" 
              id="password" 
              placeholder="Contraseña" 
              v-model="password" 
              class="input-field" 
            />
          </div>
          <div class="flex justify-between items-center mb-4">
            <label class="inline-flex items-center">
              <input type="checkbox" class="form-checkbox rounded text-blue-600" v-model="rememberMe" />
              <span class="ml-2 text-sm text-gray-600">Mantener sesión activa</span>
            </label>
          </div>
          <div class="text-center mt-6">
            <button @click="handleLogin" type="button" class="w-full bg-base text-white py-3 rounded-lg hover:bg-azulOscuro transition duration-150">
              INICIAR SESIÓN
            </button>
          </div>
        </form>
      </div>
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

.bg-azulOscuro {
  background-color: #1e3a8a;
}
</style>
