<script>
</script>
<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-5">
    <div class="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-2xl border border-gray-200">
      <!-- Logo copiloto -->
      <div class="flex justify-center py-6">
        <img src="/img/logo.svg" alt="Logo" class="h-12 w-auto" />
      </div>
      <!-- Encabezado -->
      <div class="text-center mb-6">
        <h6 class="text-2xl text-azul font-Medium">Regístrate</h6>
        <p>
          ¿Ya tienes una cuenta?
          <router-link to="/login" class="text-base hover:underline">Inicia sesión aquí</router-link>
        </p>
      </div>
      <!-- Separador -->
      <div class="flex items-center justify-center my-2">
        <hr class="flex-1 border-t border-gray-300" />
        <span class="mx-4 text-gray-900"> </span>
        <hr class="flex-1 border-t border-gray-300" />
      </div>
      <!-- Formulario de Registro -->
      <div class="px-6 lg:px-10 py-4">
        <form>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-900 mb-2" for="email">Correo electrónico</label>
            <input type="email" id="email" placeholder="Correo electrónico" class="input-field"/>
          </div>
          <div class="mb-4 ">
            <label class="block text-sm font-medium text-gray-900 mb-2 " for="password">Contraseña</label>
            <input type="password" id="password" placeholder="Contraseña" class="input-field"/>
          </div>
          <div class="flex items-center mb-4">
            <label class="inline-flex items-center">
              <input type="checkbox" class="form-checkbox rounded text-blue-600"/>
              <span class="ml-2 text-sm text-gray-600">Estoy de acuerdo con la
                <a href="#" class="text-[#2ebaa1] ">Política de Privacidad</a>
              </span>
            </label>
          </div>
          <div class="text-center mt-6">
            <button type="button" class="w-full bg-custom-green text-white py-3 rounded-lg hover:bg-azulOscuro transition duration-150">
              CREA TU CUENTA
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
  padding: 0.5rem;
  border: 1px solid #114491;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
}

.bg-azulOscuro {
  background-color: #1e3a8a; /* Color oscuro para el botón al pasar el cursor */
}
</style>