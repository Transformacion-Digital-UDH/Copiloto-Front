<template>
  <table class="w-full max-w-full bg-white border rounded-md shadow">
    <thead>
      <tr class="text-center text-azul bg-gray-300 truncate">
        <th class="px-4 py-2 text-left tracking-wider">DOCUMENTOS</th>
        <th class="px-4 py-2 text-left tracking-wider">EMISOR</th>
        <th class="px-4 py-2 tracking-wider">FECHA EMISIÓN</th>
        <th class="px-4 py-2 tracking-wider">ACCIÓN</th>
      </tr>
    </thead>
    <tbody v-if="documents && documents.length > 0">
      <tr v-for="(doc, index) in documents" :key="index" class="border-b border-gray-200 text-center uppercase">
        <td class="px-4 py-2 text-md text-left text-gray-600">
          <p class="">{{ doc.nombre || "Sin documento" }}</p>
        </td>
        <td class="px-4 py-2 text-md text-left text-gray-600">
          <p class="">{{ doc.emisor || "Sin emisor" }}</p>
        </td>
        <td class="px-4 py-2 text-md text-gray-600">
          <p class="truncate">{{ doc.fechaEmision || "Sin fecha" }}</p>
        </td>
        <td class="px-4 py-4 justify-center flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 w-full">
          <a 
            :href="doc.urlView" target="_blank"
            class="flex items-center px-2 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
            <i class="fas fa-eye mr-2 text-xs"></i> Ver
          </a>
          <a 
            :href="doc.urlDownload" download
            class="flex items-center px-2 py-1 text-sm border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center">
            <i class="fas fa-download mr-2 text-xs"></i> Descargar
          </a>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-gray-600 align-middle">
          <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay documentos disponibles.
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>

interface Document {
  nombre: string;
  urlView: string;
  urlDownload: string;
  fechaEmision: string;
  emisor: string;
}

defineProps<{ documents: Document[] }>();
</script>