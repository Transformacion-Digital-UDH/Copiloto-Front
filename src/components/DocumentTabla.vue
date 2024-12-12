<template>
  <div class="overflow-x-auto">
    <table class="w-full bg-white border rounded-md shadow text-xs">
      <thead>
        <tr class="text-center text-azul bg-gray-300 truncate">
          <th class="px-2 py-1 text-left tracking-wider">DOCUMENTOS</th>
          <th class="px-2 py-1 text-left tracking-wider">EMISOR</th>
          <th class="px-2 py-1 tracking-wider">FECHA EMISIÓN</th>
          <th class="px-2 py-1 tracking-wider">ACCIÓN</th>
        </tr>
      </thead>
      <tbody v-if="documents && documents.length > 0">
        <tr
          v-for="(doc, index) in documents"
          :key="index"
          class="border-b border-gray-200 text-center uppercase"
        >
          <td class="px-2 py-1 text-left text-gray-600 truncate">
            <p class="truncate">{{ documentCambioDeTexto(doc.nombre) }}</p>
          </td>
          <td class="px-2 py-1 text-left text-gray-600 truncate">
            <p class="truncate">{{ doc.emisor || "Sin emisor" }}</p>
          </td>
          <td class="px-2 py-1 text-gray-600 truncate">
            <p class="truncate">{{ doc.fechaEmision || "Sin fecha" }}</p>
          </td>
          <td class="px-2 py-1 flex justify-center items-center">
            <a
              :href="doc.urlView"
              target="_blank"
              class="flex items-center px-2 py-1 text-xs border rounded text-gray-600 border-gray-400 hover:bg-gray-100 justify-center"
            >
              <i class="fas fa-eye mr-1"></i> Ver
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