<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 items-center content-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Card Principal -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col sm:flex-row h-[600px]">
          <!-- Tabs Verticales -->
          <div class="sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700">
            <nav class="flex sm:flex-col space-x-4 sm:space-x-0 sm:space-y-2 p-4" aria-label="Tabs">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="currentTab = tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-emerald-100 dark:hover:text-gray-300',
                  'w-full text-left px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3'
                ]"
              >
                <component 
                  :is="tab.icon" 
                  class="h-5 w-5"
                  :class="currentTab === tab.id ? 'text-emerald-700 dark:text-emerald-200' : ''"
                />
                {{ tab.name }}
              </button>
            </nav>
          </div>
  
          <!-- Contenido -->
          <div class="flex-1 p-8 overflow-y-auto">
            <!-- Tab de Perfil -->
            <div v-if="currentTab === 'profile'" class="space-y-6">
              <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Foto de Perfil -->
                <div class="relative">
                  <img 
                    class="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow"
                    :src="authStore.image ||'https://ui-avatars.com/api/?name=' + userData.names + '+' + userData.lastname_m"
                    :alt="authStore.fullName!"
                  />
                  <button 
                    @click="handleImageUpload"
                    class="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full text-white hover:bg-emerald-700"
                  >
                    <IconCamera class="h-5 w-5" />
                  </button>
                </div>
  
                <!-- Información Básica -->
                <div class="flex-1 space-y-4">
                  <div class="flex gap-3 mb-8">
                      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ userData.names + ' ' + userData.lastname_m + ' ' + userData.lastname_f }}</h2>
                      <button class="p-2 rounded-md ml-2 text-sm bg-base hover:bg-green-400 text-gray-50 dark:text-green-400 dark:hover:text-green-300 ">Editar</button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Correo institucional</label>
                      <p class="text-gray-900 dark:text-white">{{ userData.email }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">DNI</label>
                      <p class="text-gray-900 dark:text-white">{{ userData.dni }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Código</label>
                      <p class="text-gray-900 dark:text-white">{{ userData.code }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Tab de Edición -->
            <div v-if="currentTab === 'edit'" class="max-w-3xl">
              <form @submit.prevent="handleUpdateProfile" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombres
                    </label>
                    <input 
                      type="text" 
                      v-model="form.names"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Apellido paterno
                    </label>
                    <input 
                      type="text" 
                      v-model="form.lastname_m"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Apellido materno
                    </label>
                    <input 
                      type="text" 
                      v-model="form.lastname_f"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Correo institucional
                    </label>
                    <input 
                      type="email" 
                      v-model="form.email"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      DNI
                    </label>
                    <input 
                      type="text" 
                      v-model="form.dni"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Código
                    </label>
                    <input 
                      type="text" 
                      v-model="form.code"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button 
                    type="submit"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-base hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
  
            <!-- Tab de Contraseña -->
            <div v-if="currentTab === 'password'" class="max-w-xl">
              <form @submit.prevent="handleUpdatePassword" class="space-y-6">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña Actual
                    </label>
                    <input 
                      type="password" 
                      v-model="passwordForm.currentPassword"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nueva Contraseña
                    </label>
                    <input 
                      type="password" 
                      v-model="passwordForm.newPassword"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmar Nueva Contraseña
                    </label>
                    <input 
                      type="password" 
                      v-model="passwordForm.confirmPassword"
                      class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button 
                    type="submit"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, markRaw, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth';
  import IconUser from '@/components/icons/IconUser.vue'
  import IconCamera from '@/components/icons/IconCamera.vue'
  import IconSettings from '@/components/icons/IconSettings.vue'
  import IconLock from '@/components/icons/IconLock.vue'
  import axios from 'axios';

  const authStore = useAuthStore()
  const load = ref(false);
  const userData = reactive<UserData>({
    names: '',
    lastname_m: '',
    lastname_f: '',
    email: '',
    code: '',
    dni: ''
  })
  
  interface Tab {
    id: string
    name: string
    icon: any
  }
  
  interface UserForm {
    names: string
    lastname_m: string
    lastname_f: string
    email: string
    code: string
    dni: string
  }
  
  interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }

  interface UserData {
    names: string
    lastname_m: string
    lastname_f: string
    email: string
    code: string
    dni: string
  }
  
  // Estado
  const currentTab = ref<string>('profile')
  
  const tabs: Tab[] = [
    { id: 'profile', name: 'Perfil', icon: markRaw(IconUser)  },
    { id: 'edit', name: 'Editar', icon: markRaw(IconSettings) },
    { id: 'password', name: 'Contraseña', icon: markRaw(IconLock) }
  ]
  
  axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;
  
  const getUserData = async () => {
    load.value = true;
  await axios
    .get(`/api/me`)
    .then((response) => {
        if(response.data.status) {
          userData.names = response.data.data.nombres;
          userData.lastname_m = response.data.data.apellido_paterno;
          userData.lastname_f = response.data.data.apellido_materno;
          userData.email = response.data.data.correo;
          userData.code = response.data.data.codigo;
          userData.dni = response.data.data.dni;

          form.names = response.data.data.nombres;
          form.lastname_m = response.data.data.apellido_paterno;
          form.lastname_f = response.data.data.apellido_materno;
          form.email = response.data.data.correo;
          form.code = response.data.data.codigo;
          form.dni = response.data.data.dni;
        }
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      load.value = false;
    });
  }

  onMounted(() => {
    getUserData();
  })
  
  const form = reactive<UserForm>({
    names: '',
    lastname_m: '',
    lastname_f: '',
    email: '',
    code: '',
    dni: ''
  })
  
  const passwordForm = reactive<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Métodos
  const handleUpdateProfile = async () => {
    try {
      // Aquí iría la lógica para actualizar el perfil
      console.log('Actualizando perfil:', form)
      // Actualizar userData con los nuevos valores
      Object.assign(authStore, form)
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
    }
  }
  
  const handleUpdatePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }
      // Aquí iría la lógica para actualizar la contraseña
      console.log('Actualizando contraseña')
      // Limpiar el formulario después de actualizar
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } catch (error) {
      console.error('Error al actualizar contraseña:', error)
    }
  }
  
  const handleImageUpload = () => {
    // Aquí iría la lógica para subir una nueva imagen de perfil
    console.log('Subiendo nueva imagen de perfil')
  }
  </script>