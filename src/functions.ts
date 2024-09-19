import Swal, { type SweetAlertIcon } from 'sweetalert2';
import { useAuthStore } from './stores/auth';
import axios from 'axios';

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

export const alertConfirmation = (message: string, title: string, icon: string = 'question') => {
    const alert = Swal.mixin({buttonsStyling: true})
    alert.fire({
        title: title,
        icon: icon as SweetAlertIcon,
        text: message,
        customClass: {
            confirmButton: 'bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700'
        },
        confirmButtonText: 'Sí, acepto',
        cancelButtonText: 'No',
    }).then((result) => {
        if(result.isConfirmed){
            return 
        }
    })
}

export const sendRequest = async (method: string, url: string, params: any, redirect: string = '') => {
    const authStore = useAuthStore();
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
    let res = '';

    await axios({
        method: method,
        url: url,
        data: params
    }).then((response) => {
        res = response.data.status;
        alertToast(response.data.message, 'Todo OK', 'success');
        setTimeout(() => {
            redirect !== '' ? window.location.href = redirect : '';
        },1000);
    }).catch((error) => {
        let description = '';
        error.response.data.error.map((e: any) => {
            description = description + ' ' + e
        })
        alertToast(description, 'Todo BAD', 'error');
    });
    return res;
}