<script setup>
import { defineProps } from "vue";

const props = defineProps({
    infoModal: {
        type: Array,
        required: true,
        default: () => [
            { info: '' }
        ],
    },
});
</script>

<template>
    <div class="relative" v-for="(info, index) in infoModal" :key="index">
        <!-- Ícono de información con grupo de hover -->
        <div class="group relative inline-block">
            <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" />

            <!-- Tooltip, ahora aparece más abajo y con anclaje -->
            <div
                class="absolute left-1/2 transform -translate-x-1/2 mt-4 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <!-- Triángulo (punta) del tooltip -->
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-3 h-3 bg-white border-t border-l border-gray-300 rotate-45"></div>
                <p class="text-sm text-gray-600">
                    {{ info.info }}
                </p>
            </div>
        </div>
    </div>
</template>
