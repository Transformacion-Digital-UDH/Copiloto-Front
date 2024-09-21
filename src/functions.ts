import Swal, { type SweetAlertIcon } from 'sweetalert2';
import { useAuthStore } from './stores/auth';
import axios from 'axios';
import confetti from 'canvas-confetti';

export const alertToast = (message: string, title: string, icon: string = 'question') => {
    const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
    })
    toast.fire({
        icon: icon as SweetAlertIcon,
        title: title,
        text: message
    })
}

export const alertConfirmation = (message: string, title: string, icon: string = 'question', params: any, url: string, redirect: string, method: string) => {
    const alert = Swal.mixin({buttonsStyling: true})
    alert.fire({
        title: title,
        icon: icon as SweetAlertIcon,
        text: message,
        customClass: {
            confirmButton: 'bg-base text-white px-4 py-2 rounded-md hover:bg-emerald-600',
            cancelButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
        },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Sí, acepto',
        cancelButtonText: 'No',
    }).then((result) => {
        if(result.isConfirmed){
            sendRequest(method, url, params, redirect);
        }
    })
}

export const sendRequest = async (method: string, url: string, params: any, redirect: string = '') => {
    const authStore = useAuthStore();
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
    let res = '';
    console.log(method, url, params);
    
    await axios({
        method: method,
        url: url,
        data: params
    }).then((response) => {
        res = response.data.status;
        confetti({
              particleCount: 300,
              spread: 1010,
              origin: { y: 0.6 }
            });
        alertToast(response.data.message, 'Éxito', 'success');
        setTimeout(() => {
            redirect !== '' ? window.location.href = redirect : '';
        }, 3000);
    }).catch((error) => {
        let description = '';
        error.response.data.error.map((e: any) => {
            description = description + ' ' + e
        })
        alertToast(description, 'error', 'error');
    });
    return res;
}