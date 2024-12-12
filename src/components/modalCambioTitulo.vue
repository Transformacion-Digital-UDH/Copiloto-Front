<script lang="ts" setup>
import { ref } from "vue";
import { defineEmits, defineProps } from "vue";

defineProps<{ showModal: boolean; initialTitle: string }>();
const emit = defineEmits(["close", "tituloGuardado"]);

const newTitle = ref("");
const isValid = ref(false);
const validationMessage = ref("");

function validateTitle() {
  if (newTitle.value.trim().length === 0) {
      isValid.value = false;
      validationMessage.value = "El título no puede estar vacío.";
      return;
  }
  if (newTitle.value.trim().length < 5) {
      isValid.value = false;
      validationMessage.value = "El título debe tener al menos 5 caracteres.";
      return;
  }
  isValid.value = true;
  validationMessage.value = "Título válido. Puedes guardar el cambio.";
}

function saveTitle() {
  if (isValid.value) {
    emit("tituloGuardado", newTitle.value);
    emit("close");
  }
}
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div class="bg-white rounded-md shadow-md p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Editar Título del Proyecto</h2>

      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700">
            Nuevo Título
        </label>
        <input id="title" type="text" v-model="newTitle"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            @input="validateTitle" />
        <p class="mt-2 text-sm" :class="isValid ? 'text-green-600' : 'text-red-600'">
            {{ validationMessage }}
        </p>
      </div>

      <div class="flex justify-end space-x-2">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Cancelar
        </button>
        <button @click="saveTitle" :disabled="!isValid"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Guardar
        </button>
      </div>
    </div>
  </div>
</template>
