import Swal from 'sweetalert2'

// Custom theme configuration matching VillageVault orange-red gradient theme
const customTheme = {
  primary: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', // orange-500 to red-500
  primaryHover: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', // orange-600 to red-600
  danger: '#ef4444', // red-500
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  info: '#3b82f6', // blue-500
  background: '#ffffff',
  text: '#1f2937', // gray-800
  border: '#e5e7eb' // gray-200
}

// Custom button styles (for future use)
// const customButtons = {
//   confirmButton: {
//     background: customTheme.primary,
//     borderRadius: '12px',
//     padding: '12px 24px',
//     fontWeight: '600',
//     fontSize: '14px',
//     border: 'none',
//     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
//   },
//   cancelButton: {
//     background: '#ffffff',
//     borderRadius: '12px',
//     padding: '12px 24px',
//     fontWeight: '500',
//     fontSize: '14px',
//     border: '1px solid #f97316',
//     color: '#374151'
//   }
// }

// Base configuration
const baseConfig = {
  customClass: {
    container: 'villagevault-swal-container',
    popup: 'villagevault-swal-popup',
    header: 'villagevault-swal-header',
    title: 'villagevault-swal-title',
    closeButton: 'villagevault-swal-close',
    icon: 'villagevault-swal-icon',
    image: 'villagevault-swal-image',
    content: 'villagevault-swal-content',
    input: 'villagevault-swal-input',
    inputLabel: 'villagevault-swal-input-label',
    validationMessage: 'villagevault-swal-validation',
    actions: 'villagevault-swal-actions',
    confirmButton: 'villagevault-swal-confirm',
    cancelButton: 'villagevault-swal-cancel',
    footer: 'villagevault-swal-footer',
    timerProgressBar: 'villagevault-swal-timer'
  },
  buttonsStyling: false,
  allowOutsideClick: true,
  allowEscapeKey: true,
  showCloseButton: true,
  showClass: {
    popup: 'animate-fadeInUp'
  },
  hideClass: {
    popup: 'animate-fadeOut'
  }
}

export const alertService = {
  // Success alert
  success: (message: string, title: string = 'Success!') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: customTheme.success,
      background: customTheme.background,
      color: customTheme.text,
      timer: 3000,
      timerProgressBar: true
    })
  },

  // Error alert
  error: (message: string, title: string = 'Error!') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: customTheme.danger,
      background: customTheme.background,
      color: customTheme.text,
      timer: 4000,
      timerProgressBar: true
    })
  },

  // Warning alert
  warning: (message: string, title: string = 'Warning!') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: customTheme.warning,
      background: customTheme.background,
      color: customTheme.text
    })
  },

  // Info alert
  info: (message: string, title: string = 'Information') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: customTheme.info,
      background: customTheme.background,
      color: customTheme.text
    })
  },

  // Question/Confirmation alert
  confirm: (message: string, title: string = 'Are you sure?') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: customTheme.danger,
      cancelButtonColor: '#6b7280',
      background: customTheme.background,
      color: customTheme.text,
      focusCancel: true
    })
  },

  // Custom alert with HTML content
  custom: (options: any) => {
    return Swal.fire({
      ...baseConfig,
      ...options,
      background: options.background || customTheme.background,
      color: options.color || customTheme.text
    })
  },

  // Loading alert
  loading: (message: string = 'Please wait...') => {
    return Swal.fire({
      ...baseConfig,
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      },
      background: customTheme.background
    })
  },

  // Close any open alert
  close: () => {
    Swal.close()
  }
}

// Export default
export default alertService

