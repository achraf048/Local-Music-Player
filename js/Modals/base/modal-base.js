// js/modals/base/modal-base.js
// Base class for all modals with common functionality

class BaseModal {
    constructor() {
        this.swal = ModalUtils.createSwal();
    }

    // Common form validation
    validateRequired(value, fieldName) {
        if (!value || !value.trim()) {
            Swal.showValidationMessage(`${fieldName} is required`);
            return false;
        }
        return true;
    }

    // Common number validation
    validateNumber(value, fieldName, min = 1900, max = 2099) {
        const num = parseInt(value);
        if (isNaN(num) || num < min || num > max) {
            Swal.showValidationMessage(`Please enter a valid ${fieldName} between ${min} and ${max}`);
            return false;
        }
        return true;
    }

    // Show confirmation dialog
    async confirm(message, title = 'Are you sure?') {
        const result = await this.swal.fire({
            title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true
        });
        return result.isConfirmed;
    }

    // Handle errors consistently
    handleError(error, defaultMessage = 'An error occurred') {
        console.error('Modal error:', error);
        ModalUtils.showError('Error', error.message || defaultMessage);
    }

    // Success with auto-refresh
    handleSuccess(message, refreshCallback) {
        ModalUtils.showToast(message, 'success');
        if (refreshCallback) refreshCallback();
    }
}

window.BaseModal = BaseModal;