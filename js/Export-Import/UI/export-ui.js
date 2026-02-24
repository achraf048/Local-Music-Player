// js/export-import/ui/export-ui.js
// Export modal UI and interactions

class ExportUI {
    constructor(exporter) {
        this.exporter = exporter;
        this.swal = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-secondary'
            },
            buttonsStyling: false
        });
    }

    async showExportOptions() {
        const { value: format } = await this.swal.fire({
            title: '<i class="fas fa-download"></i> Export Music Library',
            html: this.getExportOptionsHTML(),
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-download"></i> Export',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const selected = document.querySelector('.format-option.selected');
                if (!selected) {
                    Swal.showValidationMessage('Please select a format');
                    return false;
                }
                return selected.dataset.format;
            },
            allowOutsideClick: () => !Swal.isLoading(),
            didOpen: () => this.setupEventListeners()
        });

        return format;
    }

    getExportOptionsHTML() {
        return `
            <div class="export-options">
                <p>Choose export format:</p>
                <div class="format-grid">
                    <div class="format-option" data-format="json">
                        <i class="fas fa-code"></i>
                        <h4>JSON</h4>
                        <p>Full music data with metadata</p>
                        <small>Best for backups</small>
                    </div>
                </div>
                <div class="export-details">
                    <p><i class="fas fa-info-circle"></i> JSON format includes all song information:</p>
                    <p>• Song metadata (title, artist, album, etc.)</p>
                    <p>• Play counts and timestamps</p>
                    <p>• Lyrics and file paths</p>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.querySelectorAll('.format-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.format-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
        document.querySelector('.format-option[data-format="json"]')?.classList.add('selected');
    }

    showExportSuccess(result) {
        return Swal.fire({
            icon: 'success',
            title: 'Export Complete!',
            html: this.getSuccessHTML(result),
            confirmButtonText: 'OK'
        });
    }

    getSuccessHTML(result) {
        return `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-color);"></i>
                <h3>Music Library Exported</h3>
                <div class="export-details">
                    <p><strong>Format:</strong> ${result.format.toUpperCase()}</p>
                    <p><strong>File:</strong> ${ExportUtils.escapeHtml(result.filename)}</p>
                    <p><strong>Songs exported:</strong> ${result.songCount}</p>
                </div>
                <p class="help-text">File saved to your Downloads folder</p>
            </div>
        `;
    }

    showError(error) {
        return Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: error.message,
            confirmButtonText: 'OK'
        });
    }

    showLoading() {
        Swal.fire({
            title: 'Exporting...',
            text: 'Please wait while we prepare your data',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    }

    closeLoading() {
        Swal.close();
    }
}

window.ExportUI = ExportUI;