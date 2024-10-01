<script lang="ts" setup>
// Importaciones necesarias desde Vue y otras dependencias
import { ref, computed, watch, onMounted } from "vue";
import Swal from "sweetalert2";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { alertToast, alertConfirmation } from "@/functions";
import confetti from "canvas-confetti";
import router from "@/router";

// ***** Texto que se escribe automáticamente (efecto de máquina de escribir) ********
const text = "Designación de Asesor"; // Texto que se va a escribir automáticamente
const textoTipiado = ref(""); // Estado para almacenar el texto que se va escribiendo
let index = 0; // Índice para ir controlando la posición del texto

// Función para simular el efecto de escribir en la pantalla
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80); // Llama de nuevo la función cada 80ms
  }
};

// Al montar el componente, inicia el efecto de escritura
onMounted(() => {
  typeWriter();
});
// *******************************************************

// Estados para controlar los modales
const mostrarModalDocumentos = ref(false); // Modal de documentos
const mostrarModalCambioAsesor = ref(false); // Modal de cambio de asesor
const mostrarModalConfirmacion = ref(false);
const mostrarModalSolicitudAsesor = ref(false);  // Modal de confirmación para el cambio de asesor

// VARIABLES DE ENTORNO
const VIEW_LETTER = import.meta.env.VITE_URL_VIEW_LETTER;
const DOWNLOAD_LETTER = import.meta.env.VITE_URL_DOWNLOAD_LETTER;
const VIEW_OFFICE = import.meta.env.VITE_URL_VIEW_OFFICE;
const DOWNLOAD_OFFICE = import.meta.env.VITE_URL_DOWNLOAD_OFFICE;
const VIEW_RESOLUTION = import.meta.env.VITE_URL_VIEW_RESOLUTION;
const DOWNLOAD_RESOLUTION = import.meta.env.VITE_URL_DOWNLOAD_RESOLUTION;

// Método para determinar la clase CSS dependiendo del estado
const estadoClase = (estado: string) => {
  switch (estado) {
    case "en progreso":
      return "bg-orange-500 text-white";
    case "pendiente":
      return "bg-gray-400 text-white";
    case "rechazado":
      return "bg-red-500 text-white";
    case "aceptado":
      return "bg-green-500 text-white";
    case "tramitado":
      return "bg-green-500 text-white";
    case "observado":
      return "bg-orange-500 text-white";
    default:
      return "";
  }
};

// Inicialización de estados y almacenes
const authStore = useAuthStore();
const initSolicitude = ref(false); // Control de inicialización de la solicitud
const advisers = ref<{ id: string, nombre: string }[]>([]); // Asesores (tipado correcto con un arreglo de objetos)
const load = ref(false); // Control de carga
const enviado = ref(false); // Control de envío de solicitud

// Tipos definidos para mayor seguridad y claridad
interface Solicitude {
  estudiante_id: string;
  titulo: string;
  asesor_id: string;
  estado: string;
  solicitud_id: string;
  observacion: string;
}

interface Resolucion {
  id: string;
  nombre: string;
  fecha_creado: string;
  estado: string;
  observacion: string;
}

interface Oficio {
  id: string;
  estado: string;
  fecha_creado: string;
  nombre_de_oficio: string;
  observacion: string;
}

// Ref para los objetos usando los tipos definidos
const solicitude = ref<Solicitude>({
  estudiante_id: "",
  titulo: "",
  asesor_id: "",
  estado: "",
  solicitud_id: "",
  observacion: "",
});

const resolucion = ref<Resolucion>({
  id: "",
  nombre: "",
  fecha_creado: "",
  estado: "",
  observacion: "",
});

const oficio = ref<Oficio>({
  id: "",
  estado: "",
  fecha_creado: "",
  nombre_de_oficio: "",
  observacion: "",
});

// Historial de acciones
const historial = ref<{ accion: string, asesor: string, fecha: string, observacion: string, titulo: string }[]>([]); // Tipado del historial correctamente

// Configuración de los headers de axios para la autenticación
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

// Al montar el componente, cargamos los asesores y la información del estudiante
onMounted(() => {
  getAdvisers(); // Carga la lista de asesores
  getInfoStudent(); // Carga la información del estudiante
});

// Función para redirigir a la siguiente página
const goToNextPage = () => {
  router.push("/estudiante/conformidad-asesor");
};

// Función para obtener la información del estudiante
const getInfoStudent = async () => {
  load.value = true; // Indica que se están cargando los datos
  try {
    const response = await axios.get(`/api/student/getInfo/${authStore.id}`);
    if (response.data.status) {
      // Mapeo de los datos recibidos a los objetos de solicitud, oficio y resolución
      const solicitud = response.data.solicitud;
      solicitude.value = {
        estudiante_id: solicitud.estudiante_id ?? "",  // Verifica si es null o undefined
        titulo: solicitud.titulo ?? "",               // Verifica si es null o undefined
        asesor_id: solicitud.asesor_id ?? "",         // Verifica si es null o undefined
        estado: solicitud.estado ?? "",               // Verifica si es null o undefined
        solicitud_id: solicitud.id ?? "",             // Verifica si es null o undefined
        observacion: solicitud.observacion ?? "",     // Verifica si es null o undefined
      };

      const res = response.data.resolucion;
      resolucion.value = {
        id: res.id ?? "",                             // Verifica si es null o undefined
        nombre: res.nombre ?? "",                     // Verifica si es null o undefined
        fecha_creado: res.fecha_creado ?? "",         // Verifica si es null o undefined
        estado: res.estado ?? "",                     // Verifica si es null o undefined
        observacion: res.observacion ?? "",           // Verifica si es null o undefined
      };

      const oficioData = response.data.oficio;
      oficio.value = {
        id: oficioData.id ?? "",                      // Verifica si es null o undefined
        estado: oficioData.estado ?? "",              // Verifica si es null o undefined
        fecha_creado: oficioData.fecha_creado ?? "",  // Verifica si es null o undefined
        nombre_de_oficio: oficioData.nombre_de_oficio ?? "", // Verifica si es null o undefined
        observacion: oficioData.observacion ?? "",    // Verifica si es null o undefined
      };

      historial.value = response.data.historial || []; // Carga el historial si existe
    }
  } catch (error) {
    console.error("Error al cargar información del estudiante", error);
    // Aquí puedes manejar el error mostrando un mensaje si es necesario
  } finally {
    load.value = false; // Finaliza la carga
  }
};

// Función para obtener la lista de asesores desde el backend
const getAdvisers = async () => {
  try {
    const res = await axios.get("/api/adviser/get-select");
    advisers.value = res.data.data; // Almacena la lista de asesores
  } catch (error) {
    console.error("Error al cargar los asesores", error);
    // Manejo de errores aquí
  }
};

// Función para enviar una solicitud de asesor
const sendSolicitude = async (student_id: string) => {
  try {
    const params = {
      student_id: student_id,
    };
    // Llamada a la función de confirmación antes de enviar la solicitud
    alertConfirmation(
      "¿Estás seguro de iniciar este trámite?",
      "Iniciar trámite",
      "question",
      params,
      "/api/solicitudes-store",
      "POST",
      (response: any) => {
        // Actualiza los datos de la solicitud con los datos recibidos del backend
        solicitude.value.solicitud_id = response.data._id;
        solicitude.value.titulo = response.data.sol_title_inve;
        solicitude.value.asesor_id = response.data.adviser_id ?? "";
        solicitude.value.estado = response.data.sol_status;

        // Dispara confetti como señal de éxito
        confetti({
          particleCount: 500,
          spread: 1010,
          origin: { y: 0.6 },
        });
      }
    );
  } catch (error: any) {
    let description = "";
    error.response.data.error.forEach((e: any) => {
      description = description + " " + e;
    });
    alertToast(description, "Error", "error"); // Muestra el error
  }
};

// Función para actualizar una solicitud de asesor existente
const updateSolicitude = async (
  solicitud_id: string,
  titulo: string,
  asesor_id: string,
  estado: string
) => {
  // Si el estado es "aceptado", no se puede actualizar
  if (["aceptado"].includes(estado)) {
    alertToast(
      "No puedes actualizar una solicitud que fue aceptada",
      "Error",
      "error"
    );
    return;
  }
  try {
    const params = {
      sol_title_inve: titulo, // Título de la tesis
      adviser_id: asesor_id, // ID del asesor
      sol_status: "pendiente", // Estado de la solicitud
    };
    // Llamada a la función de confirmación antes de actualizar la solicitud
    alertConfirmation(
      "Asegurate de ingresar los datos correctos. ¿Todo ok?",
      "Solicitar asesor",
      "question",
      params,
      `/api/solicitudes/${solicitud_id}`,
      "PUT",
      (response: any) => {
        // Actualiza los datos de la solicitud con los nuevos valores
        solicitude.value.titulo = response.data.sol_title_inve;
        solicitude.value.asesor_id = response.data.adviser_id ?? "";
        solicitude.value.estado = response.data.sol_status;
      }
    );
  } catch (error: any) {
    let description = "";
    error.response.data.error.forEach((e: any) => {
      description = description + " " + e;
    });
    alertToast(description, "Error", "error");
  }
};

// Función para solicitar el cambio de asesor
const solicitarCambioAsesor = () => {
  mostrarModalConfirmacion.value = true; // Muestra el modal de confirmación
};

// Función para confirmar el cambio de asesor
const confirmarCambioAsesor = () => {
  mostrarModalConfirmacion.value = false; // Oculta el modal
  alertToast("Solicitud enviada correctamente", "Éxito", "success");
  // Aquí podrías enviar una petición al backend para realizar el cambio de asesor
};

const estadoDocumentos = computed(() => {
  if (oficio.value.estado === "tramitado" && resolucion.value.estado === "tramitado") {
    return "hecho"; // Ambos documentos están tramitados
  } else {
    return "pendiente"; // Alguno o ambos no están tramitados
  }
});

const isNextButtonDisabled = computed(() => estadoDocumentos.value !== "hecho");
</script>


<template>
  <!-- Muestra si hay una solicitud ya sea pendiente rechazada o aceptada -->
  <template v-if="load">
    <div class="flex-1 p-10 border-s-2 bg-gray-100">
      <div
        class="flex justify-center items-center content-center px-14 flex-col"
      >
        <h3
          class="bg-gray-200 h-12 w-[70%] rounded-lg duration-200 skeleton-loader"
        ></h3>
      </div>
      <div
        class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
      >
        <div class="block space-y-5">
          <h2
            class="bg-gray-200 h-10 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-10 mt-1 w-[5%] rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 mt-4 w-full rounded-md skeleton-loader duration-200"
          ></h2>
        </div>
      </div>
      <div
        class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
      >
        <div class="block space-y-5">
          <h2
            class="bg-gray-200 h-7 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"
          ></h2>
        </div>
      </div>
      <div
        class="bg-white rounded-lg shadow-lg p-6 h-auto mt-4 animate-pulse duration-200"
      >
        <div class="block space-y-5">
          <h2
            class="bg-gray-200 h-7 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 w-full rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 mt-1 w-15 rounded-md skeleton-loader duration-200"
          ></h2>
          <h2
            class="bg-gray-200 h-14 mt-4 w-full rounded-md skeleton-loader duration-200"
          ></h2>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <template v-if="!solicitude.estado">
      <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100 h-screen">
        <div class="p-10 bg-white rounded-lg shadow-lg space-y-8 text-center">
          <h3 class="text-4xl font-semibold text-azul">
            Usted no ha iniciado un trámite
          </h3>
          <p class="text-gray-500">Iniciar trámite para solicitar un asesor</p>

          <div class="flex justify-center">
            <img
              src="/img/notInitSolicitude.svg"
              alt="Iniciar trámite o solicitar asesor"
              class="w-[40%] h-auto object-cover rounded-md shadow-md"
            />
          </div>

          <div class="flex justify-center">
            <button
              class="bg-base text-white px-6 py-3 rounded-lg text-lg hover:bg-base transition duration-300"
              @click="sendSolicitude(authStore.id)"
            >
              Iniciar trámite
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex-1 p-10 border-s-2 font-Roboto bg-gray-100">
        <h3 class="text-5xl font-semibold text-center text-azul">
          {{ textoTipiado }}
        </h3>
    <div class="bg-white rounded-lg shadow-lg p-6 mt-6 relative ">
      <div class="flex justify-between">
        <div class="flex flex-col sm:flex-row items-center justify-between w-full">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">1. Solicitud de Asesor</h2>
              <img
                src="/icon/info2.svg"
                alt="Info"
                class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalSolicitudAsesor = true"
                @mouseleave="mostrarModalSolicitudAsesor = false"
              />
            </div>
            <span :class="estadoClase(solicitude.estado)" class="estado-estilo">
              {{ solicitude.estado }}
            </span>
         </div>
      </div>
          <!-- Modal informativo para el Punto 1 -->
          <div
              v-show="mostrarModalSolicitudAsesor"
              class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10"
            >
              <p class="text-sm text-gray-600">
                Aquí puedes gestionar la solicitud de tu asesor. Recuerda que una vez enviada, deberás esperar la respuesta.
              </p>
          </div>
          <div class="mt-4">
            <!-- Título de tesis -->
            <label
              for="tituloTesis"
              class="block text-lg font-medium text-gray-800 mb-2"
              >Título de Tesis</label
            >
            <input
              id="tituloTesis"
              type="text"
              v-model="solicitude.titulo"
              :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
              class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              placeholder="Escribe tu título de tesis aquí..."
            />
            <!-- <label class="block text-lg font-medium text-gray-800 mb-2">Elige tu formato de Tesis</label>
              <select class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6">
                <option disabled selected value="">Selecciona un formato...</option>
                <option value="Formato_Investigativo">Formato Investigativo</option>
                <option value="Formato_Tecnologico">Formato Tecnológico</option>
              </select> -->

            <!-- Select para elegir asesor -->
            <label
              for="nombreAsesor"
              class="block text-lg font-medium text-gray-800 mb-2"
              >Elige a tu Asesor</label
            >
            <select
              id="nombreAsesor"
              v-model="solicitude.asesor_id"
              :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
              class="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            >
              <option disabled value="">Selecciona un asesor...</option>
              <option
                v-for="asesor in advisers"
                :key="asesor.id"
                :value="asesor.id"
              >
                {{ asesor.nombre }}
              </option>
            </select>

            <!-- Botón de enviar -->
            <button
              @click="
                updateSolicitude(
                  solicitude.solicitud_id,
                  solicitude.titulo,
                  solicitude.asesor_id,
                  solicitude.estado

                )
              "
              :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
              :class="[
                'px-3 py-2 text-white rounded-md focus:outline-none',
                ['pendiente', 'aceptado'].includes(solicitude.estado)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600',
              ]"
            >
              Enviar
            </button>
          </div>

          <!-- Respuesta del asesor -->
          <div
            class="mt-6 bg-gray-50 p-4 border border-gray-200 rounded-md"
            v-if="solicitude.estado !== 'en progreso'"
          >
            <div class="flex justify-between items-center">
              <h4 class="text-black">
                Respuesta del asesor:
                <span
                  v-if="solicitude.estado === 'rechazado'"
                  class="text-red-500 italic"
                >
                  "{{ solicitude.observacion }}"</span
                >
              </h4>

              <div
                class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4"
              >
                <div
                  v-if="['aceptado'].includes(solicitude.estado)"
                  class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2"
                >
                  <!-- Botón de Ver -->
                  <a
                    :href="`${VIEW_LETTER}/${solicitude.solicitud_id}`"
                    target="_blank"
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                  >
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                  <!-- Botón de Descargar -->
                  <a
                    :href="`${DOWNLOAD_LETTER}/${solicitude.solicitud_id}`"
                    download
                    class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                  >
                    <i class="fas fa-download mr-2"></i> Descargar
                  </a>
                </div>
                <span
                  :class="estadoClase(solicitude.estado)"
                  class="estado-estilo"
                  >{{ solicitude.estado }}</span
                >
                <a
                  href="#historial"
                  v-if="solicitude.estado === 'rechazado'"
                  class="ml-4 p-1 text-blue-500"
                >
                  ver motivo
                </a>
              </div>
            </div>
          </div>
        
          <br />

          <!-- Mensaje de espera según el estado -->
          <span
            v-if="solicitude.estado === 'pendiente'"
            class="text-gray-500 italic"
            >Esperando la respuesta del asesor...</span
          >
          <span
            v-else-if="solicitude.estado === 'rechazado'"
            class="text-red-500 italic"
            >El asesor ha rechazado la solicitud, revise el historial de
            acciones y porfavor vuelve a seleccionar tu asesor.</span
          >
          <span
            v-else-if="solicitude.estado === 'aceptado'"
            class="text-green-500 italic"
            >El asesor ha aceptado tu solicitud, puedes pasar el punto 2.
            Documentos</span
          >
    </div>
    
    <br>

       <!-- Card 2: Documentos -->
        <div class="mt-4"
          :disabled="
            ['en progreso', 'pendiente', 'rechazado'].includes(
              solicitude.estado
            )
          "
          :class="[ 
            'rounded-lg shadow-lg p-6 relative mt-6',
            ['en progreso', 'pendiente', 'rechazado'].includes(
              solicitude.estado
            )
              ? 'cursor-not-allowed bg-gray-50'
              : 'bg-white',
          ]"
        >
          <div class="flex flex-col sm:flex-row items-center justify-between w-full">
            <div class="flex items-center">
              <h2 class="text-2xl font-medium text-black">2. Documentos</h2>
              <img
                src="/icon/info2.svg"
                alt="Info"
                class="ml-2 w-4 h-4 cursor-pointer"
                @mouseover="mostrarModalDocumentos = true"
                @mouseleave="mostrarModalDocumentos = false"
              />
            </div>
            <span
              :class="estadoClase(solicitude.estado)"
              class="estado-estilo ml-4"
              >{{ estadoDocumentos }}</span
            >
          </div>

          <!-- Modal punto 2 -->
          <div
            v-show="mostrarModalDocumentos"
            class="absolute left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10"
          >
            <p class="text-sm text-gray-600">
              Por favor espere que se carguen los documentos que verifican su
              trámite de Designación de Asesor para continuar con el siguiente
              paso.
            </p>
          </div>

          <!-- Listado de documentos -->
          <div class="mt-4 space-y-4">
            <!-- Listado de documentos OFICIO-->
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center">
                <!-- Nombre del documento -->
                <span class="w-full md:w-auto mb-2 md:mb-0">
                  Oficio de Secretaria PAISI
                  <p v-if="oficio.estado === 'observado'" class="italic">
                    "{{ oficio.observacion }}"
                  </p>
                </span>

                <div
                  class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4"
                >
                  <!-- Mostrar botones si el documento está listo -->
                  <div
                    v-if="['tramitado'].includes(oficio.estado)"
                    class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2"
                  >
                    <!-- Botón de Ver -->
                    <a
                      :href="`${VIEW_OFFICE}/${oficio.id}`"
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    <!-- Botón de Descargar -->
                    <a
                      :href="`${DOWNLOAD_OFFICE}/${oficio.id}`"
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>

                  <!-- Mensaje de que aún no está cargado -->
                  <span v-else class="text-gray-500 italic"
                    >El documento aún no se ha cargado</span
                  >

                  <!-- Estado del documento -->
                  <span
                    :class="estadoClase(oficio.estado)"
                    class="estado-estilo ml-4"
                    >{{ oficio.estado }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Listado de documentos RESOLUCION-->
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div
                class="flex flex-col md:flex-row justify-between md:items-center"
              >
                <!-- Nombre del documento -->
                <span class="w-full md:w-auto mb-2 md:mb-0">
                  Resolución de Facultad
                  <p v-if="resolucion.estado === 'observado'" class="italic">
                    "{{ resolucion.observacion }}"
                  </p>
                </span>

                <div
                  class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4"
                >
                  <!-- Mostrar botones si el documento está listo -->
                  <div
                    v-if="['tramitado'].includes(resolucion.estado)"
                    class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2"
                  >
                    <!-- Botón de Ver -->
                    <a
                      :href="`${VIEW_RESOLUTION}/${resolucion.id}`"
                      target="_blank"
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>
                    <!-- Botón de Descargar -->
                    <a
                      :href="`${DOWNLOAD_RESOLUTION}/${resolucion.id}`"
                      download
                      class="flex items-center px-4 py-2 border rounded text-gray-600 border-gray-400 hover:bg-gray-100 w-full md:w-auto justify-center"
                    >
                      <i class="fas fa-download mr-2"></i> Descargar
                    </a>
                  </div>

                  <!-- Mensaje de que aún no está cargado -->
                  <span v-else class="text-gray-500 italic"
                    >El documento aún no se ha cargado</span
                  >

                  <!-- Estado del documento -->
                  <span
                    :class="estadoClase(resolucion.estado)"
                    class="estado-estilo ml-4"
                    >{{ resolucion.estado }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
       <!-- Botón "Siguiente" -->
        <div class="flex justify-end mt-6">
          <button
            :disabled="isNextButtonDisabled"
            @click="goToNextPage"
            :class="['px-4 py-2 text-white rounded-md', isNextButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600']"
          >
            Siguiente
          </button>
        </div>
        <!-- Card 3: Solicitar Cambio de Asesor -->
        <div
          :disabled="
            ['pendiente', 'en progreso', 'rechazado'].includes(
              solicitude.estado
            )
          "
          :class="[
            'rounded-lg shadow-lg p-6 relative mt-6',
            ['en progreso', 'pendiente', 'rechazado'].includes(
              solicitude.estado
            )
              ? 'cursor-not-allowed bg-gray-50'
              : 'bg-white',
          ]"
        >
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-[#39B49E]"> * Cambio de Asesor</h2>
            <img
              src="/icon/info2.svg"
              alt="Info"
              class="ml-2 w-4 h-4 cursor-pointer"
              @mouseover="mostrarModalCambioAsesor = true"
              @mouseleave="mostrarModalCambioAsesor = false"
            />
          </div>
          <br />
          <p class="text-gray-400">
            Este botón se activará cuando recibas la resolución de Designación de Asesor en '2. Documentos' por parte de Facultad.
          </p>


          <div
            v-show="mostrarModalCambioAsesor"
            class="absolute left-0 mt-1 top-16 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-64 z-10"
          >
            <p class="text-sm text-gray-500">
              Si consideras que necesitas un cambio de asesor, puedes
              solicitarlo en cualquier momento.
            </p>
          </div>

          <div class="mt-4 space-y-4">
            <!-- Botón de Solicitar Cambio de Asesor -->
            <div class="flex justify-center">
              <button
                :disabled="
                  ['pendiente', 'en progreso', 'rechazado'].includes(
                    solicitude.estado
                  )
                "
                @click="solicitarCambioAsesor"
                :class="[
                  'px-4 py-2 text-white rounded-md focus:outline-none',
                  ['en progreso', 'pendiente', 'rechazado'].includes(
                    solicitude.estado
                  )
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-base hover:bg-green-500 ',
                ]"
              >
                Solicitar Cambio de Asesor
              </button>
            </div>
          </div>
        </div>
        <!-- Historial de Acciones -->
        <div class="bg-baseClarito rounded-lg shadow-lg p-6 mt-6" id="historial">
          <h2 class="text-2xl font-medium text-azul">Historial de Acciones</h2>
          <div class="overflow-x-auto mt-4">
            <table class="min-w-full table-auto bg-gray-50 rounded-lg">
              <thead class="bg-gray-100 rounded-lg text-azul">
                <tr>
                  <th class="px-4 py-2 text-left font-medium">Acción</th>
                  <th class="px-4 py-2 text-left font-medium">Asesor</th>
                  <th class="px-4 py-2 text-left font-medium">Fecha</th>
                  <th class="px-4 py-2 text-left font-medium">Observación</th>
                  <th class="px-4 py-2 text-left font-medium">Título</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-if="historial.length > 0"
                  v-for="(h, index) in historial"
                  :key="index"
                >
                  <td class="px-4 py-2">{{ h.accion }}</td>
                  <td class="px-4 py-2">{{ h.asesor }}</td>
                  <td class="px-4 py-2">{{ h.fecha }}</td>
                  <td class="px-4 py-2">{{ h.observacion }}</td>
                  <td class="px-4 py-2">{{ h.titulo }}</td>
                </tr>
                <tr v-else>
                  <td class="px-4 py-2 text-center h-5 text-gray-500" colspan="5">
                    Aún no hay acciones registradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Modal de Confirmación -->
        <div
          v-if="mostrarModalConfirmacion"
          class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
        >
          <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <!-- Responsivo -->
            <h3 class="text-3xl text-center font-medium mb-4">Confirmación</h3>
            <hr />
            <br />
            <p class="mb-6">
              ¿Estás seguro de que deseas solicitar un cambio de asesor? Todo el
              proceso tendrá que repetirse.
            </p>
            <div class="flex justify-end">
              <button
                @click="mostrarModalConfirmacion = false"
                class="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                @click="confirmarCambioAsesor"
                class="px-4 py-2 bg-base text-white rounded-md hover:bg-green-500"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>

      </div>
      
    </template>
  </template>
</template>

<style scoped>

.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
}
</style>
