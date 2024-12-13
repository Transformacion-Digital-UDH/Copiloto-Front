<script setup lang="ts">
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

defineProps({
    href: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <button>
        <a :href="href" target="_blank" class="flex items-center m-2 relative group">
            <IconEyeCerrar class="mr-1 group-hover:hidden" />
            <IconEyeAbrir class="mr-1 hidden group-hover:block" />
            <span class="text-[#34495e]">Ver</span>
        </a>
    </button>
</template>
