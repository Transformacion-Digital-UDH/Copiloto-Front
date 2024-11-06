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
    <div class="relative group" v-for="(info, index) in infoModal" :key="index">
        <!-- Ícono de información -->
        <img src="/icon/info2.svg" alt="Info" class="ml-2 w-4 h-4 cursor-pointer" />

        <!-- Tooltip -->
        <div
            class="absolute -left-60 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p class="text-sm text-gray-600">
                {{ info.info }}
            </p>
        </div>
    </div>
</template>