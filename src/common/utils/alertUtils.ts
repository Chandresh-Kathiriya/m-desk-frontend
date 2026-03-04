import Swal, { SweetAlertIcon } from 'sweetalert2';

// 1. Auto-closing Toast (Perfect for "Master Offer Created!")
export const showToast = (title: string, icon: SweetAlertIcon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    return Toast.fire({
        icon,
        title
    });
};

// 2. Standard Success Alert (Center screen with a button)
export const showSuccessAlert = (title: string, text?: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonColor: '#059669', // Match your theme's success color
        customClass: {
            popup: 'swal-custom-popup',
            confirmButton: 'swal-custom-btn'
        }
    });
};

// 3. Standard Error Alert
export const showErrorAlert = (title: string, text?: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#DC2626', // Match your theme's error color
    });
};

// 4. Confirmation Dialog (Perfect for "Are you sure you want to delete?")
export const showConfirmDialog = async (title: string, text: string, confirmText = 'Yes, proceed!') => {
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: confirmText,
    });
    
    // Returns true if the user clicks "Yes", false if they cancel
    return result.isConfirmed; 
};

export const showPromptDialog = async (title: string, inputPlaceholder: string) => {
    const result = await Swal.fire({
        title,
        input: 'text',
        inputPlaceholder,
        showCancelButton: true,
        confirmButtonColor: '#059669', // Success color
        cancelButtonColor: '#6B7280',  // Neutral color
        inputValidator: (value) => {
            if (!value || !value.trim()) {
                return 'You need to write something!';
            }
        }
    });
    
    return result.value; // Returns the typed text, or undefined if cancelled
};