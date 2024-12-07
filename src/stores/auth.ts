import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import router from "@/router";  // Asegúrate de que el router esté configurado correctamente.
import { decodeCredential } from "vue3-google-login";
import { alertToast } from "@/functions";

export const useAuthStore = defineStore("auth", () => {
  const id = ref<string | null>(null);
  const token = ref<string | null>(null);
  const fullName = ref<string | null>(null);
  const email = ref<string | null>(null);
  const role = ref<string | null>(null);
  const image = ref<string | null>(null);
  const is_jury = ref<boolean>(false);
  const loading = ref(false);

  const roleRoutes: Record<string, string> = {
    estudiante: "/estudiante",
    asesor: "/asesor",
    program: "/program",
    facultad: "/facultad",
    vri: "vri-turnitin",
    turnitin: "vri-turnitin",
    admin: "/admin",
  };

  // Acción de inicio de sesión por formulario
  const handleLogin = async (emailInput: string, passwordInput: string) => {
    try {
      loading.value = true;

      if (!emailInput.includes('@udh.edu.pe')) {
        alertToast('Ingresa con una cuenta institucional @udh.edu.pe', 'Error al iniciar sesión', 'error')
      } else {
        const response = await axios.post("/api/login", {
          email: emailInput,
          password: passwordInput,
        });

        // Almacenar datos en Pinia
        id.value = response.data.data.id;
        token.value = response.data.token;
        fullName.value = response.data.data.nombre;
        email.value = response.data.data.correo;
        role.value = response.data.data.rol;
        is_jury.value = response.data.data.es_jurado;

        // Redirigir al usuario según su rol
        const userRole = role.value;
        const route = roleRoutes[userRole!];

        alertToast('', 'Bienvenido de nuevo' + ' ' + fullName.value , 'success')
        setTimeout(() => {
          if (route) {
            router.push(route);
          }
        }, 500);
      }
    } catch (error: any) {
      let description = ''
      error.response.data.error.map((e: any) => {
        description = description + ' ' + e 
      })
      alertToast(description, 'Error al iniciar sesión', 'error')
    } finally {
      loading.value = false;
    }
  };

  // Acción de inicio de sesión por google auth
  const googleLogin = async (response: any) => {
    try {
      loading.value = true;
      
      const user: any = decodeCredential(response.credential);
      if (user.hd !== "udh.edu.pe") {
        alertToast('Ingresa con una cuenta institucional @udh.edu.pe', 'Error al iniciar sesión', 'error')
      } else {
        const response = await axios.post("/api/login/google", {
          email: user.email,
        });

        // Almacenar datos en Pinia
        id.value = response.data.data.id; 
        token.value = response.data.token;
        email.value = response.data.data.correo;
        role.value = response.data.data.rol;
        fullName.value = user.name;
        image.value = user.picture;
        is_jury.value = response.data.data.es_jurado;
  
        const userRole = response.data.data.rol;
        const route: string = roleRoutes[userRole];
  
        alertToast('Has iniciado sesión exitosamente', 'Bienvenido de nuevo' + ' ' + fullName.value, 'success')
        setTimeout(() => {
          if (route) {
            router.push(route);
          }
        }, 500);
      }
    } catch (error: any) {
      let description = ''
      error.response.data.error.map((e: any) => {
        description = description + ' ' + e 
      })
      alertToast(description, 'Error al iniciar sesión', 'error')
    } finally {
      loading.value = false;
    }
  }

  // Acción de registro
  const handleRegister = async (emailInput: string, passwordInput: string) => {
    try {
      loading.value = true
      if(!emailInput.includes('@udh.edu.pe')){
        alertToast('Registrate con una cuenta institucional @udh.edu.pe', 'Error al registrarse', 'error')

      }else{
        const response = await axios.post("/api/register", {
          email: emailInput,
          password: passwordInput,
        });
    
        // Almacenar datos en Pinia
        id.value = response.data.data.id;
        token.value = response.data.token;
        email.value = response.data.data.correo;
        role.value = response.data.data.rol;
        fullName.value = response.data.data.nombre;
        alertToast('Te has registrado exitosamente', 'Bienvenido' + ' ' + fullName.value, 'success')
        setTimeout(() => {
          router.push('/estudiante');  
        }, 500);
      }
    } catch (error: any) {
      let description = ''
      error.response.data.error.map((e: any) => {
        description = description + ' ' + e 
      })
      alertToast(description, 'Error al registrarse', 'error')
    } finally {
      loading.value = false;
    }
  };

  // Acción de register por google auth
  const googleRegister = async (response: any) => {
    try {
      loading.value = true;
      
      const user: any = decodeCredential(response.credential);
      if (user.hd !== "udh.edu.pe") {
        alertToast('Registrate con una cuenta institucional @udh.edu.pe', 'Error al registrarse', 'error')
      } else {
        const code = user.email.split('@')[0];
        const response = await axios.post("/api/register/google", {
          email: user.email,
          password: code,
        });

        id.value = response.data.data.id;
        token.value = response.data.token;
        email.value = response.data.data.correo;
        role.value = response.data.data.rol;
        fullName.value = user.name;
        image.value = user.picture;
  
        alertToast('Te has registrado exitosamente', 'Bienvenido' + ' ' + fullName.value, 'success')
        setTimeout(() => {
          router.push('/estudiante');  
        }, 500);
      }
    } catch (error: any) {
      let description = ''
      error.response.data.error.map((e: any) => {
        description = description + ' ' + e 
      })
      alertToast(description, 'Error al registrarse', 'error')
    } finally {
      loading.value = false;
    }
  }

  // Acción de cierre de sesión
  const handleLogout = () => {
    id.value = null;
    token.value = null;
    fullName.value = null;
    email.value = null;
    role.value = null;
    is_jury.value = false;
    image.value = null;
    router.push("/");  // Redirige al usuario al login
  };

  return {
    id,
    token,
    fullName,
    email,
    role,
    image,
    is_jury,
    loading,
    handleLogin,
    googleLogin,
    handleRegister,
    googleRegister,
    handleLogout
  };
},{
  persist: true
});
