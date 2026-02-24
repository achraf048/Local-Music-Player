// js/modals/utils/modal-utils.js
// Helper functions for modals

const ModalUtils = {
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showLoading(title = 'Loading...', text = 'Please wait') {
        Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    },

    closeLoading() {
        Swal.close();
    },

    showSuccess(title, html, onClose) {
        Swal.fire({
            icon: 'success',
            title,
            html,
            confirmButtonText: '<i class="fas fa-check"></i> Done'
        }).then(onClose);
    },

    showError(title, message) {
        Swal.fire({
            icon: 'error',
            title,
            text: message,
            confirmButtonText: 'OK'
        });
    },

    showInfo(title, message) {
        Swal.fire({
            icon: 'info',
            title,
            text: message,
            confirmButtonText: 'OK'
        });
    },

    showToast(message, type = 'success') {
        database.utility?.showToast(message, type);
    },

    // Genre options for select dropdowns
    genres: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'],

    getGenreOptions(selectedGenre = '') {
        return this.genres.map(g => 
            `<option value="${this.escapeHtml(g)}" ${selectedGenre === g ? 'selected' : ''}>${this.escapeHtml(g)}</option>`
        ).join('');
    },

    // Create SweetAlert with Bootstrap styling
    createSwal() {
        return Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-secondary'
            },
            buttonsStyling: false
        });
    }
};

window.ModalUtils = ModalUtils;