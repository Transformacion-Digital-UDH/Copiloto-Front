<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import router from "@/router";
import { decodeCredential, googleOneTap } from "vue3-google-login";
import Alert from "@/components/Alert.vue";
import IconLoading from "@/components/icons/IconLoading.vue";

// Refs para los campos del formulario
const email = ref("");
const password = ref("");
const message = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const rememberMe = ref(false);
const loading = ref(false);

const roleRoutes: Record<string, string> = {
  estudiante: "/estudiante",
  asesor: "/asesor",
  jurado: "/jurado",
}

// Manejo del inicio de sesión
const handleLogin = async () => {
  errorMessage.value = null;
  try {
    loading.value = true;
    if(!email.value.includes('@udh.edu.pe')){
      errorMessage.value = ['No puedes registrarte con esta cuenta, elige una cuenta de udh.edu.pe'];
    }else{
      const response = await axios.post("/api/login", {
        email: email.value,
        password: password.value,
      });

      // Procesar la respuesta, guardar el token y redirigir al usuario
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("full_name", response.data.data.nombre);
      localStorage.setItem("email", response.data.data.correo);
      localStorage.setItem("role", response.data.data.rol);

      // Aquí podrías redirigir al usuario segun su rol
      const userRole = response.data.data.rol;
      const route: string = roleRoutes[userRole];

      if (route) {
        router.push(route);
      }
      errorMessage.value = null;
    }

  } catch (error: any) {
    //manejar validacion del backend
    errorMessage.value = error.response.data.error;
  } finally {
    loading.value = false;
  }
};

// Manejo del inicio de sesión con google
const loginGoogle = () => {  
  googleOneTap({ autoLogin: false })
    .then(async (response) => {
      errorMessage.value = null;

      const user = decodeCredential(response.credential);
      if (user.hd !== "udh.edu.pe") {
        errorMessage.value =
          ["No puedes iniciar sesión con esta cuenta, elige una cuenta de udh.edu.pe"];
      } else {
        const response = await axios.post("/api/login/google", {
          email: user.email,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("full_name", response.data.data.nombre);
        localStorage.setItem("email", response.data.data.correo);
        localStorage.setItem("role", response.data.data.rol);
        localStorage.setItem("image_profile", user.picture);

        const userRole = response.data.data.rol;
        const route: string = roleRoutes[userRole];

        if (route) {
          router.push(route);
        }
        errorMessage.value = null;
      }
    })
    .catch((error) => {
      errorMessage.value = error.response.data.error;
      console.log("Handle the error", error);
    });
};
</script>

<template>
  <Alert
    v-if="errorMessage"
    :message="errorMessage"
    type="error"
    :duration="8000"
  />

  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg px-8 py-6">
      <div class="text-center mb-6">
        <img src="/img/logo_light.svg" alt="Logo" class="mx-auto mb-6 w-48" />
        <h6 class="text-2xl text-azul font-semibold">Iniciar sesión</h6>
        <p class="text-sm text-gray-600">
          ¿Aún no tienes una cuenta?
          <router-link to="/register" class="text-base hover:underline">Regístrate aquí</router-link>
        </p>
      </div>

      <!-- Botón de Google -->
      <div class="mb-4">
        <button
          type="button"
          @click="loginGoogle"
          class="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-150"
        >
          <img src="/img/google.png" alt="Google" class="w-5 h-5 mr-2" />
          Continuar con Google
        </button>
      </div>

      <div class="relative mb-4 text-center">
        <hr class="border-t border-gray-300" />
        <span class="absolute bg-white px-2 text-gray-500 text-sm"
          style="top: -0.75rem; left: 50%; transform: translateX(-50%)">
          O
        </span>
      </div>

      <!-- Formulario de inicio de sesión -->
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700" for="email"
            >Correo electrónico</label
          >
          <input
            type="email"
            id="email"
            placeholder="Correo electrónico"
            v-model="email"
            class="input-field"
            required
            autofocus
          />
        </div>

        <!-- Modificación aquí para alinear el enlace "Olvidó su contraseña" -->
        <div class="mb-4">
          <div class="flex justify-between items-center">
            <label class="block text-sm font-medium text-gray-700" for="password">Contraseña</label>
            <router-link to="/forgot-password" class="text-sm text-base hover:underline">
              ¿Olvidó su contraseña?
            </router-link>
          </div>
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            v-model="password"
            class="input-field"
            required
            autocomplete
          />
        </div>
        <div class="flex justify-between items-center mb-4">
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox rounded text-blue-600" v-model="rememberMe" />
            <span class="ml-2 text-sm text-gray-600">Mantener sesión activa</span>
          </label>
        </div>
        <div class="text-center mt-6">
          <button
            type="submit"
            class="w-full bg-base text-white py-3 rounded-lg hover:bg-azul transition duration-150 disabled:opacity-50 disabled:bg-base flex items-center justify-center"
            :disabled="loading"
          >
            <IconLoading v-if="loading" />
            INICIAR SESIÓN
          </button>
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

.form-checkbox {
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 0.25rem;
}

.bg-azulOscuro {
  background-color: #1e3a8a;
}
</style>
