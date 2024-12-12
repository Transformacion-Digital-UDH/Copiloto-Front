<script lang="ts" setup>
import { ref } from "vue";
import { defineEmits, defineProps } from "vue";
import IconCerrar from "./icons/IconCerrar.vue";

defineProps<{ showModal: boolean; initialTitle: string }>();
const emit = defineEmits(["close", "tituloGuardado", "solicitarAprobacionProyecto"]);

const mostrarInputCambio = ref(false);
</script>

<template>
    <div v-if="showModal"
        class="font-Roboto fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
        <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <template v-if="!mostrarInputCambio">
                <div class="flex justify-end items-start">
                    <button
                        class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
                        @click="emit('close')">
                        <!-- IconCerrar puede ser añadido aquí -->
                        <IconCerrar />
                    </button>
                </div>
                <div class="flex items-start justify-between p-3 border-b border-gray-200">
                    <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
                        ¿Confirma el cambio del título de su proyecto de investigación?
                    </h5>
                </div>
                <div class="p-6">
                    <p class="text-gray-500 text-lg text-center">
                        Por favor, indique su aprobación o rechazo para que el título pueda ser registrado en el informe final.
                    </p>
                </div>
                <div class="flex items-center justify-center p-3 border-gray-200">
                    <button class="mr-4 px-7 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl"
                        @click="mostrarInputCambio = true">
                        Sí
                    </button>
                    <button class="px-7 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl">
                        No
                    </button>
                </div>
            </template>
            <template v-else>
                <div class="flex items-start justify-between p-3 border-b border-gray-200">
                    <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">
                        Título de proyecto de investigación (definitivo)
                    </h5>
                </div>
                <div class="p-6">
                    <p class="text-gray-500 text-lg text-left mb-2">
                        Por favor añada su titulo de proyecto de investigación.
                    </p>
                    <input type="text" id="" class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0"
                        maxlength="3" @input="" required />
                </div>
                <div class="flex items-center justify-center p-3 border-gray-200">
                    <button class="px-3 py-2 text-xm font-thin 100 text-white bg-[#5d6d7e] rounded-2xl"
                        @click="mostrarInputCambio = false">
                        Cancelar
                    </button>
                    <button class="ml-4 px-3 py-2 text-xm font-thin 100 text-white bg-base rounded-2xl" @click="">
                        Enviar
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>