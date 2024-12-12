<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { alertToast, alertConfirmation } from "@/functions";
import Estados from "@/components/Estados.vue";
import confetti from "canvas-confetti";
import router from "@/router";
import ModalToolTip from "@/components/modalToolTip.vue";

// ***** Texto que se escribe automáticamente (efecto de máquina de escribir) ********
const text = "Designación de Asesor";
const textoTipiado = ref("");
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80); // Llama de nuevo la función cada 80ms
  }
};
onMounted(() => {
  typeWriter();
});

// Estados para controlar los modales
const mostrarModalTramite = ref(false);
const mostrarModalDocumentos = ref(false);
const mostrarModalCambioAsesor = ref(false);
const mostrarModalConfirmacion = ref(false);
const mostrarModalSolicitudAsesor = ref(false);

// VARIABLES DE ENTORNO
const VIEW_LETTER = import.meta.env.VITE_URL_VIEW_LETTER;
const DOWNLOAD_LETTER = import.meta.env.VITE_URL_DOWNLOAD_LETTER;
const VIEW_OFFICE = import.meta.env.VITE_URL_VIEW_OFFICE;
const DOWNLOAD_OFFICE = import.meta.env.VITE_URL_DOWNLOAD_OFFICE;
const VIEW_RESOLUTION = import.meta.env.VITE_URL_VIEW_RESOLUTION;
const DOWNLOAD_RESOLUTION = import.meta.env.VITE_URL_DOWNLOAD_RESOLUTION;

const capitalizarEstado = (estado: string): string => {
  if (!estado) return "Pendiente";
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
};

const procesos = ref([
  {
    título: "TRAMITE: DESIGNACIÓN DEL DOCENTE ASESOR PARA LA TESIS",
    estado: "Hecho",
  }, // Eliminamos "Pago de Trámite"
]);

// Inicialización de estados y almacenes
const authStore = useAuthStore();
const initSolicitude = ref(false);
const advisers = ref<{ id: string; nombre: string }[]>([]);
const load = ref(false);
const enviado = ref(false);

const solicitude = ref<Solicitude>({
  estudiante_id: "",
  titulo: "",
  asesor_id: "",
  estado: "",
  solicitud_id: "",
  observacion: "",
  tipo_investigacion: "",
});

const oficio = ref<Oficio>({
  id: "",
  estado: "",
  fecha_creado: "",
  nombre_de_oficio: "",
  observacion: "",
});

// Tipos definidos para mayor seguridad y claridad
interface Solicitude {
  estudiante_id: string;
  titulo: string;
  asesor_id: string;
  estado: string;
  solicitud_id: string;
  observacion: string;
  tipo_investigacion: string;
  oficio?: Oficio; // Se añadió oficio como opcional
  resolucion?: Resolucion; // Se añadió resolucion como opcional
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
interface SolicitudeResponse {
  data: {
    _id: string;
    sol_title_inve: string;
    adviser_id?: string;
    sol_status: string;
  };
}

const resolucion = ref<Resolucion>({
  id: "",
  nombre: "",
  fecha_creado: "",
  estado: "",
  observacion: "",
});

// Historial de acciones
const historial = ref<
  {
    accion: string;
    asesor: string;
    fecha: string;
    observacion: string;
    titulo: string;
  }[]
>([]);

// Configuración de los headers de axios para la autenticación
axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`;

// Al montar el componente, cargamos los asesores y la información del estudiante
onMounted(() => {
  getAdvisers();
  getInfoStudent();
});

// Función para redirigir a la siguiente página
const goToNextPage = () => {
  router.push("/estudiante/conformidad-asesor");
};

// Función para obtener la información del estudiante
const getInfoStudent = async () => {
  load.value = true;
  await axios
    .get(`/api/student/getInfo/${authStore.id}`)
    .then((response) => {
      console.log(response.data);
      if (response.data.status) {
        // Actualizamos los datos de solicitud
        solicitude.value.solicitud_id = response.data.solicitud.id;
        solicitude.value.titulo = response.data.solicitud.titulo;
        solicitude.value.asesor_id = response.data.solicitud.asesor_id || "";
        solicitude.value.estado = response.data.solicitud.estado;
        solicitude.value.observacion = response.data.solicitud.observacion;
        solicitude.value.tipo_investigacion =
          response.data.solicitud.tipo_investigacion || "";

        // Actualizamos oficio y resolución
        if (response.data.resolucion) {
          resolucion.value.id = response.data.resolucion.id;
          resolucion.value.nombre = response.data.resolucion.nombre;
          resolucion.value.fecha_creado = response.data.resolucion.fecha_creado;
          resolucion.value.estado = response.data.resolucion.estado;
          resolucion.value.observacion = response.data.resolucion.observacion;
        }

        if (response.data.oficio) {
          oficio.value.id = response.data.oficio.id;
          oficio.value.estado = response.data.oficio.estado;
          oficio.value.fecha_creado = response.data.oficio.fecha_creado;
          oficio.value.nombre_de_oficio = response.data.oficio.nombre_de_oficio;
          oficio.value.observacion = response.data.oficio.observacion;
        }

        historial.value = response.data.historial;
      }
    })
    .catch((error) => {
      // alertToast(error.response.data.message, 'Error', 'error')
    })
    .finally(() => {
      load.value = false;
    });
};

const sendSolicitude = async (student_id: string) => {
  try {
    const params = {
      student_id: student_id,
    };

    alertConfirmation(
      "Estás seguro de iniciar este trámite?",
      "Iniciar trámite",
      "question",
      params,
      "/api/solicitudes-store",
      "POST",
      (response: SolicitudeResponse) => {
        // Tipamos aquí la respuesta
        solicitude.value.solicitud_id = response.data._id;
        solicitude.value.titulo = response.data.sol_title_inve;
        solicitude.value.asesor_id = response.data.adviser_id || "";
        solicitude.value.estado = response.data.sol_status;

        //Lanza confetti en la pantalla
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
    alertToast(description, "Error", "error");
  }
};

// Función para obtener la lista de asesores
const getAdvisers = async () => {
  try {
    const res = await axios.get("/api/adviser/get-select");
    advisers.value = res.data.data;
  } catch (error) {
    console.error("Error al cargar los asesores", error);
  }
};

// Función para actualizar una solicitud de asesor existente
const updateSolicitude = async (
  solicitud_id: string,
  titulo: string,
  asesor_id: string,
  estado: string,
  tipo_investigacion: string
) => {
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
      sol_title_inve: titulo,
      adviser_id: asesor_id,
      sol_status: "pendiente",
      sol_type_inve: tipo_investigacion,
    };
    alertConfirmation(
      "Verifica que los datos sean correctos antes de proceder",
      "¿Confirmas tu solicitud de designación de asesor?",
      "question",
      params,
      `/api/solicitudes/${solicitud_id}`,
      "PUT",
      (response: any) => {
        solicitude.value.titulo = response.data.sol_title_inve;
        solicitude.value.asesor_id = response.data.adviser_id ?? "";
        solicitude.value.estado = response.data.sol_status;
        solicitude.value.tipo_investigacion = response.data.sol_type_inve || "";
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
  mostrarModalConfirmacion.value = true;
};

// Función para confirmar el cambio de asesor
const confirmarCambioAsesor = () => {
  mostrarModalConfirmacion.value = false;
  alertToast("Solicitud enviada correctamente", "Éxito", "success");
};

// Computed para determinar el estado de los documentos
const estadoDocumentos = computed(() => {
  if (
    oficio.value.estado === "observado" ||
    resolucion.value.estado === "observado"
  ) {
    return "observado";
  } else if (
    oficio.value.estado === "tramitado" &&
    resolucion.value.estado === "tramitado"
  ) {
    return "hecho";
  } else {
    return "pendiente";
  }
});


//alerta Boton siguiente

const isNextButtonDisabled = computed(() => {
  // Tu lógica para habilitar o deshabilitar el botón
  return estadoDocumentos.value !== "hecho";
});

const handleNextButtonClick = () => {
  if (isNextButtonDisabled.value) {
    // Mostrar un mensaje si el botón está deshabilitado
    Swal.fire({
      icon: "warning",
      title: "Pasos incompletos",
      text: "Por favor, completa todos los pasos antes de continuar.",
      confirmButtonText: "OK",
    });
  } else {
    // Navegar a la siguiente página
    goToNextPage();
  }
};
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
              v-if="authStore.id"
              class="bg-base text-white px-6 py-3 rounded-lg text-xm hover:bg-base transition duration-300"
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
        <h3 class="text-4xl font-semibold text-center text-azul">
          {{ textoTipiado }}
        </h3>
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6 relative">
          <div class="flex justify-between">
            <div class="flex flex-col sm:flex-row items-center justify-between w-full">
              <div class="flex items-center space-x-3">
                <!-- Bolita con estado -->
                <span
                  class="flex items-center justify-center h-8 w-8 rounded-full border-2"
                  :class="{
                    'bg-green-500 border-green-500 text-white': solicitude.estado === 'aceptado',
                    'bg-orange-500 border-orange-500 text-white': solicitude.estado === 'en progreso',
                    'bg-gray-400 border-gray-400 text-white': !solicitude.estado || solicitude.estado === 'pendiente' || solicitude.estado === 'rechazado'
                  }"
                >
                  <i
                    :class="{
                      'fas fa-check': solicitude.estado === 'aceptado',
                      'fas fa-hourglass-half': solicitude.estado === 'en progreso',
                      'fas fa-ellipsis-h': !solicitude.estado || solicitude.estado === 'pendiente' || solicitude.estado === 'rechazado'
                    }"
                    class="text-sm"
                  ></i>
                </span>
                <!-- Título del encabezado -->
                <h2 class="text-xl font-medium text-black">
                  1. Solicita tu asesor
                </h2>
                <!-- Modal con Tooltip -->
                <ModalToolTip
                  :infoModal="[{
                    info: 'Aquí puedes gestionar la solicitud de tu asesor. Recuerda que una vez enviada, deberás esperar la respuesta.',
                  }]"
                />
              </div>

              <!-- <Estados :estado="capitalizarEstado(solicitude.estado)" /> -->
            </div>
          </div>

          <div class="mt-4">
              <!-- Título de tesis -->
              <label for="tituloTesis" class="block text-xm font-medium text-gray-700 mb-2">
                Título de proyecto de investigación (provisional)
              </label>
              <div class="flex items-center">
                <input
                  id="tituloTesis"
                  type="text"
                  v-model="solicitude.titulo"
                  :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
                  class="w-full p-3 text-sm bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Escribe el título de tu proyecto de investigación aquí"
                />
                <!-- Ícono de check solo si el título está completo -->
                <span v-if="solicitude.titulo && solicitude.titulo.trim() !== ''" class="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="7"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              <!-- Select para elegir asesor -->
              <label for="nombreAsesor" class="block text-xm font-medium text-gray-700 mb-2 mt-4">
                Elige a tu asesor
              </label>
              <div class="flex items-center">
                <select
                  id="nombreAsesor"
                  v-model="solicitude.asesor_id"
                  :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
                  class="w-full p-3 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">Selecciona un docente asesor</option>
                  <option v-for="asesor in advisers" :key="asesor.id" :value="asesor.id">
                    {{ asesor.nombre }}
                  </option>
                </select>
                <!-- Ícono de check solo si un asesor ha sido seleccionado -->
                <span v-if="solicitude.asesor_id" class="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="7"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              <!-- Select para elegir tipo de investigacion -->
              <label for="tipoInvestigacion" class="block text-xm font-medium text-gray-700 mb-2 mt-4">
                Elige tu tipo de investigación
              </label>
              <div class="flex items-center">
                <select
                  id="tipoInvestigacion"
                  v-model="solicitude.tipo_investigacion"
                  :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
                  class="w-full p-3 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">Selecciona un tipo de investigación</option>
                  <option value="cientifica">CIENTÍFICA</option>
                  <option value="tecnologica">TECNOLÓGICA</option>
                </select>
                <!-- Ícono de check solo si el tipo de investigación ha sido seleccionado -->
                <span v-if="solicitude.tipo_investigacion" class="ml-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="7"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              <!-- Botón de enviar -->
              <button
                @click="
                  updateSolicitude(
                    solicitude.solicitud_id,
                    solicitude.titulo,
                    solicitude.asesor_id,
                    solicitude.estado,
                    solicitude.tipo_investigacion
                  )
                "
                :disabled="['pendiente', 'aceptado'].includes(solicitude.estado)"
                :class="[
                  'px-3 py-2 text-white rounded-md focus:outline-none mt-4',
                  ['pendiente', 'aceptado'].includes(solicitude.estado)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600',
                ]"
              >
                Enviar
              </button>
            </div>

          <!-- Respuesta del asesor -->
          <div class="mt-6 bg-gray-100 p-2 border border-base rounded-md"
            v-if="solicitude.estado !== 'en progreso'">
            <!-- Contenedor principal -->
            <div class="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
              <!-- Encabezado con respuesta -->
              <h4 class="text-gray-700  font-medium px-2 py-1 rounded-md flex items-center text-base md:text-xm">
                <i class="fas fa-info-circle text-blue-500 mr-2"></i> Respuesta del asesor:
                <span v-if="solicitude.estado === 'aceptado'" class="ml-2 text-gray-700  font-medium md:text-xm">
                   Carta de aceptación 😊
                </span>
                <span v-else-if="solicitude.estado === 'rechazado'" class="ml-2 text-red-500 font-medium md:text-xm">
                   {{ solicitude.observacion }} 😢
                </span>
              </h4>

              <!-- Contenedor de botones y estado -->
              <div class="flex flex-col  sm:space-y-0 sm:flex-row sm:space-x-4 items-start sm:items-center md:space-y-0 md:space-x-4">
                <div v-if="['aceptado'].includes(solicitude.estado)" class="w-full sm:w-auto">
                  <!-- Botón de Ver -->
                  <a
                    :href="`${VIEW_LETTER}/${solicitude.solicitud_id}`"
                    target="_blank"
                    class="flex items-center px-2 py-1 border rounded text-gray-600 border-gray-400 hover:bg-baseClarito justify-center w-full sm:w-auto text-sm"
                  >
                    <i class="fas fa-eye mr-2"></i> Ver
                  </a>
                </div>
                <Estados :estado="capitalizarEstado(solicitude.estado)" />
                <!-- <a
                  href="#historial"
                  v-if="solicitude.estado === 'rechazado'"
                  class="text-blue-500 text-sm sm:text-base"
                >
                  Ver motivo
                </a> -->
              </div>
            </div>
            <br>
            <!-- Mensaje de acuerdo al estado -->
            <div class="text-center md:text-left px-5">
              <span
                v-if="solicitude.estado === 'pendiente'"
                class="text-black italic text-sm"
              >
                Estamos esperando la respuesta del asesor. Se mostrará aquí cuando esté disponible.
              </span>
              <span
                v-else-if="solicitude.estado === 'rechazado'"
                class="text-red-500 italic text-sm "
              >
                El docente ha rechazado la solicitud de ser tu asesor, por favor vuelve a seleccionar tu asesor.
              </span>
              <span
                v-else-if="solicitude.estado === 'aceptado'"
                class="text-base italic text-sm "
              >
                El docente ha aceptado tu solicitud de ser tu asesor, por favor espera a que se carguen los documentos de conformidad en el punto 2.
              </span>
            </div>
          </div>
        </div>      
        <!-- Card 2: Documentos -->
        <div class="mt-4"
          :disabled="
            ['en progreso', 'pendiente', 'rechazado'].includes(
              solicitude.estado)"
         :class="[
            'rounded-lg shadow-lg p-6 relative mt-6',
            ['en progreso', 'pendiente', 'rechazado'].includes(
              solicitude.estado
            )
              ? 'cursor-not-allowed bg-gray-50'
              : 'bg-white',
          ]"
        >
        <div class="flex flex-col sm:flex-row items-center justify-between w-full space-y-4 sm:space-y-0 sm:space-x-4">
          <div class="flex items-center space-x-3">
            <!-- Bolita de estado -->
            <span
              class="flex items-center justify-center h-8 w-8 rounded-full border-2"
              :class="{
                'bg-green-500 border-green-500 text-white': estadoDocumentos === 'hecho',
                'bg-gray-400 border-gray-400 text-white': estadoDocumentos === 'pendiente',
                'bg-orange-400 border-yellow-500 text-white': estadoDocumentos === 'observado'
              }"
            >
              <i
                :class="{
                  'fas fa-check': estadoDocumentos === 'hecho',
                  'fas fa-ellipsis-h': estadoDocumentos === 'pendiente',
                  'fas fa-exclamation-circle': estadoDocumentos === 'observado'
                }"
                class="text-sm"
              ></i>
            </span>
            <!-- Título -->
            <h2 class="text-xl font-medium text-black">
              2. Documentos para la conformidad de designación de asesor
            </h2>
            <!-- Tooltip -->
            <ModalToolTip
              :infoModal="[{
                info: 'Por favor espere que se carguen los documentos que verifican su trámite de Designación de Asesor para continuar con el siguiente trámite.',
              }]"
            />
          </div>
          <!-- Estado -->
          <!-- <Estados :estado="estadoDocumentos" /> -->
        </div>
          <!-- Listado de documentos -->
          <div class="mt-4 space-y-4">
            <!-- Listado de documentos OFICIO-->
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center text-gray-700 font-medium">
                <!-- Nombre del documento -->
                <span class="w-full md:w-auto mb-2 md:mb-0 text-xm">
                  {{oficio.nombre_de_oficio}}
                  <p v-if="oficio.estado === 'observado'" class="italic text-gray-500">
                    <!-- "{{ oficio.observacion }}" --> Por favor comuníquese con secretaría del programa académico
                  </p>
                </span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <!-- Mostrar botones si el documento está listo -->
                  <div v-if="['tramitado'].includes(oficio.estado)"
                    class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    <!-- Botón de Ver -->
                    <a
                      :href="`${VIEW_OFFICE}/${oficio.id}`"
                      target="_blank"
                      class="flex items-center px-2 py-1 border rounded text-gray-600 border-gray-400 hover:bg-baseClarito w-full md:w-auto justify-center text-sm"
                    >
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>                  
                  </div>
                  <!-- Mensaje de que aún no está cargado -->
                  <span v-else class="text-sm text-gray-400 italic">El documento aún no se ha cargado</span
                  >
                  <!-- Estado del documento -->
                  <Estados :estado="capitalizarEstado(oficio.estado)" />
                </div>
              </div>
            </div>

            <!-- Listado de documentos RESOLUCION-->
            <div class="bg-gray-50 p-4 border border-gray-200 rounded-md">
              <div class="flex flex-col md:flex-row justify-between md:items-center text-gray-700 font-medium">
                <!-- Nombre del documento -->
                <span class="w-full md:w-auto mb-2 md:mb-0 text-xm">
                  {{resolucion.nombre}}
                  <p v-if="resolucion.estado === 'observado'" class="italic text-gray-500">
                    <!-- "{{ resolucion.observacion }}" --> Por favor comuníquese con secretaría de facultad.
                  </p>
                </span>
                <div class="flex flex-col md:flex-row items-start md:items-center justify-end w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <!-- Mostrar botones si el documento está listo -->
                  <div v-if="['tramitado'].includes(resolucion.estado)"
                    class="flex flex-col space-y-2 w-full md:flex-row md:space-y-0 md:space-x-2">
                    <!-- Botón de Ver -->
                    <a
                      :href="`${VIEW_RESOLUTION}/${resolucion.id}`"
                      target="_blank"
                      class="flex items-center px-2 py-1 border rounded text-gray-600 border-gray-400 hover:bg-baseClarito w-full md:w-auto justify-center text-sm"
                    >
                      <i class="fas fa-eye mr-2"></i> Ver
                    </a>                 
                  </div>
                  <!-- Mensaje de que aún no está cargado -->
                  <span v-else class="text-sm text-gray-400 italic">El documento aún no se ha cargado</span>
                  <!-- Estado del documento -->
                  <Estados :estado="capitalizarEstado(resolucion.estado)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón "Siguiente" -->
        <div class="flex justify-end mt-6">
          <button
            @click="handleNextButtonClick"
            :class="[
              'px-4 py-2 text-white rounded-md',
              isNextButtonDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-base hover:bg-green-500',
            ]"
          >
            Siguiente
          </button>
        </div>
        <!-- Card 3: Solicitar Cambio de Asesor -->
        <!-- <div :disabled="['pendiente', 'en progreso', 'rechazado'].includes(
          solicitude.estado
        )
          " :class="[
            'rounded-lg shadow-lg p-6 relative mt-6',
            ['en progreso', 'pendiente', 'rechazado'].includes(
              solicitude.estado
            )
              ? 'cursor-not-allowed bg-gray-50'
              : 'bg-white',
          ]">
          <div class="flex items-center">
            <h2 class="text-2xl font-medium text-[#39B49E]"> * Cambio de asesor</h2>
            <ModalToolTip
              :infoModal="[{ info: 'Si consideras que necesitas un cambio de asesor, puedes solicitarlo en cualquier momento.' },]" />
          </div>

          <br />
          
          <p class="text-gray-400">
            Este botón se activará cuando recibas la resolución de designación de asesor por parte de la Facultad de
            Ingeniería de Sistemas.
          </p>

          <div class="mt-4 space-y-4">
            //Botón de Solicitar Cambio de Asesor 
            <div class="flex justify-center">
              <button :disabled="['pendiente', 'en progreso', 'rechazado'].includes(
                solicitude.estado
              )
                " @click="solicitarCambioAsesor" :class="[
                  'px-4 py-2 text-white rounded-md focus:outline-none',
                  ['en progreso', 'pendiente', 'rechazado'].includes(
                    solicitude.estado
                  )
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-base hover:bg-green-500 ',
                ]">
                Solicitar cambio de asesor
              </button>
            </div>
          </div>
        </div> -->
        <!-- Historial de Acciones -->
        <!-- <div class="bg-baseClarito rounded-lg shadow-lg p-6 mt-6" id="historial">
          <h2 class="text-2xl font-medium text-azul">Historial de acciones</h2>
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
                <tr v-if="historial.length > 0" v-for="(h, index) in historial" :key="index">
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
        </div> -->
        <!-- Modal de Confirmación -->
        <!-- <div
          v-if="mostrarModalConfirmacion"
          class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
        >
          <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
           
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
        </div> -->
      </div>
    </template>
  </template>
</template>

<style scoped>
input::placeholder {
    text-transform: none; /* Mantiene el placeholder sin cambios */
  }

  input {
    text-transform: uppercase; /* Hace que el texto ingresado sea en mayúsculas */
  }
</style>
