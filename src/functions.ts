import Swal, { type SweetAlertIcon } from 'sweetalert2';
import { useAuthStore } from './stores/auth';
import axios from 'axios';

export const alertToast = (message: string, title: string, icon: string = 'question') => {
    const toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
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

export const alertConfirmation = (message: string, title: string, icon: string = 'question', params: any, url: string, method: string, onSuccess: Function) => {
    const alert = Swal.mixin({buttonsStyling: true})
    alert.fire({
        title: title,
        icon: icon as SweetAlertIcon,
        text: message,
        customClass: {
            confirmButton: 'bg-base text-white px-4 py-2 rounded-md hover:bg-emerald-400',
            cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-300'
        },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'No',
    }).then((result) => {
        if(result.isConfirmed){
            sendRequest(method, url, params, onSuccess);
        }
    })
}

export const sendRequest = async (method: string, url: string, params: any, onSuccess: Function) => {
    const authStore = useAuthStore();
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
    
    await axios({
        method: method,
        url: url,
        data: params
    }).then((response) => {
        alertToast(response.data.message, 'Éxito', 'success');
        onSuccess(response.data);

    }).catch((error) => {
        let description = '';
        error.response.data.error.map((e: any) => {
            description = description + ' ' + e
        })
        alertToast(description, 'error', 'error');
    });
}