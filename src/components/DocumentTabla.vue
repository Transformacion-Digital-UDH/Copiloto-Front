<template>
  <div class="overflow-x-auto">
    <table class="w-11/12 mx-auto bg-white border rounded-md shadow text-sm">
      <thead>
        <tr class="bg-gray-200 text-azul">
          <th class="px-4 py-2 text-left whitespace-nowrap">DOCUMENTOS</th>
          <th class="px-4 py-2 text-left whitespace-nowrap">EMISOR</th>
          <th class="px-4 py-2 text-center whitespace-nowrap">FECHA EMISIÓN</th> <!-- Cambié a text-center -->
          <th class="px-4 py-2 text-center whitespace-nowrap">ACCIÓN</th>
        </tr>
      </thead>
      <tbody v-if="documents && documents.length > 0">
        <tr
          v-for="(doc, index) in documents"
          :key="index"
          class="border-b border-gray-300"
        >
          <!-- Documento -->
          <td class="px-4 py-2 text-gray-700">
            <div class="flex items-start space-x-2">
              <i class="fas fa-file-alt text-green-500 text-base"></i>
              <p class="whitespace-normal break-words uppercase">{{ documentCambioDeTexto(doc.nombre) }}</p>
            </div>
          </td>
          <!-- Emisor -->
          <td class="px-4 py-2 text-gray-700">
            <p class="whitespace-normal break-words uppercase">{{ doc.emisor || "Sin emisor" }}</p>
          </td>
          <!-- Fecha de emisión -->
          <td class="px-4 py-2 text-center text-gray-700"> <!-- Cambié a text-center -->
            <p class="whitespace-normal break-words">{{ doc.fechaEmision || "Sin fecha" }}</p>
          </td>
          <!-- Acción -->
          <td class="px-4 py-2 text-center">
            <a
              :href="doc.urlView"
              target="_blank"
              class="flex items-center m-2 relative group">
              <IconEyeCerrar class="mr-1 group-hover:hidden" />
              <IconEyeAbrir class="mr-1 hidden group-hover:block" />
              <span class="text-[#34495e]">Ver</span>
            </a>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="4" class="px-4 py-4 text-center text-gray-600">
            <i class="fas fa-exclamation-circle mr-2 text-red-700"></i>No hay documentos disponibles.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



<script lang="ts" setup>
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

interface Document {
  nombre: string;
  urlView: string;
  urlDownload: string;
  fechaEmision: string;
  emisor: string;
}

function documentCambioDeTexto(documentName: string): string {
  const documentoTextoMapeo: Record<string, string> = {
    'Oficio de conformidad - Asesor': 'OFICIO MULTIPLE DE DESIGNACION DE JURADOS PARA LA REV. DEL TRABAJO DE INV. (TESIS) - POR EL PROGRAMA ACADEMICO',
    'Oficio múltiple de designación de jurados': 'ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL JURADO PRESIDENTE',
    'Oficio de conformidad - Presidente': 'ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL JURADO SECRETARIO',
    'Oficio de conformidad - Secretario': 'ACTA DE CONFORMIDAD DEL PROYECTO DE INVESTIGACION - POR EL JURADO VOCAL',
    'Oficio de conformidad - Vocal': 'OFICIO DE APROBACIÓN DEL TRABAJO DE INVESTIGACIÓN (TESIS)',
    'Resolución de aprobación de trabajo de investigación (Tesis)': 'RESOLUCION DE APROBACIÓN DEL TRABAJO DE INVESTIGACIÓN (TESIS)',
    'Carta de aceptación': 'primero',
    'Resolución de designación de asesor': 'segundo',
  };

  return documentoTextoMapeo[documentName] || documentName || 'Sin documento';
}

defineProps<{ documents: Document[] }>();
</script>