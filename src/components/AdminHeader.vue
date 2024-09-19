<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { useSidebar } from "@/assets/ts/useSidebar.ts";
import IconMoon from "@/components/icons/IconMoon.vue";
import IconSun from "@/components/icons/IconSun.vue";
import router from "@/router";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const isDark = useDark();
const toggleDark = useToggle(isDark);
const authStore = useAuthStore();
const image_profile = ref("");

const dropdownOpen = ref(false);
const { isOpen } = useSidebar();
axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;

const logout = async () => {
  await axios.post("/api/logout").then(() => {
    authStore.handleLogout();
  })
}

onMounted(() => {
  image_profile.value = authStore.image || `https://ui-avatars.com/api/?name=${authStore.fullName}`;
})
</script>

<template>
  <header
    class="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-700 dark:text-white border-b-2 "
  >
    <div class="flex items-center">
      <!-- boton hamburguesa cerrar y abrir menu de navegacion -->
      <button
        @click="isOpen = !isOpen"
        :class="[
          isOpen
          ? 'lg:left-[18rem] translate-x-0 ease-out duration-200 delay-300' 
          : 'lg:left-8 translate-x-0 ease-in duration-200 delay-0',      
        'dark:text-white focus:outline-none transition transform fixed z-40 top-4 left-4 lg:z-0'
        ]"
      >
        <svg
          class="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6H20M4 12H20M4 18H11"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="flex items-center">
      <!-- boton para cambiar tema -->
      <button
        @click="toggleDark()"
        class="flex dark:text-gray-100 text-gray-900 focus:outline-none"
      >
        <!-- svg moon -->
        <IconMoon v-if="isDark" />
        <!-- svg sun -->
        <IconSun v-else />
      </button>

      <!-- boton para la notificacion -->
      <button
        class="flex mx-4 dark:text-gray-100 text-gray-700 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
          />
        </svg>
      </button>

      <!-- boton del usuario, perfil y cerrar sesion -->
      <div class="relative">
        <button
          @click="dropdownOpen = !dropdownOpen"
          class="relative z-10 block w-10 h-10 overflow-hidden rounded-full shadow focus:outline-none"
        >
          <img
            class="object-cover w-full h-full"
            :src="image_profile"
            alt="Avatar"
          />
        </button>

        <div
          v-show="dropdownOpen"
          @click="dropdownOpen = false"
          class="fixed inset-0 z-10 w-full h-full"
        ></div>

        <transition
          enter-active-class="transition duration-150 ease-out transform"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in transform"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-show="dropdownOpen"
            class="absolute right-0 z-20 w-48 py-2 mt-2 bg-white rounded-md shadow-xl"
          >
            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-900 hover:bg-base hover:text-white"
              >Perfil</a
            >
            <button
              @click="logout"
              class="block w-full text-start px-4 py-2 text-sm text-gray-900 hover:bg-base hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>
