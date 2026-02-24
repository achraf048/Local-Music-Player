// js/export-import/ui/import-ui.js
// Import modal UI and interactions

class ImportUI {
    constructor(importer) {
        this.importer = importer;
        this.swal = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-secondary'
            },
            buttonsStyling: false
        });
    }

    async showImportOptions() {
        const { value: importType } = await this.swal.fire({
            title: '<i class="fas fa-upload"></i> Import Music Data',
            html: this.getImportOptionsHTML(),
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-upload"></i> Continue',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const selected = document.querySelector('.format-option.selected');
                if (!selected) {
                    Swal.showValidationMessage('Please select an import type');
                    return false;
                }
                return selected.dataset.type;
            },
            allowOutsideClick: () => !Swal.isLoading(),
            didOpen: () => this.setupEventListeners()
        });

        return importType;
    }

    getImportOptionsHTML() {
        return `
            <div class="import-options">
                <p>Choose what to import:</p>
                <div class="format-grid">
                    <div class="format-option" data-type="music">
                        <i class="fas fa-music"></i>
                        <h4>Music Library</h4>
                        <p>Import song metadata</p>
                        <small>JSON format only</small>
                    </div>
                </div>
                <div class="warning-details">
                    <p><i class="fas fa-exclamation-triangle"></i> Important notes:</p>
                    <p>• This will add new songs to your existing library</p>
                    <p>• Duplicate songs will be skipped</p>
                    <p>• Only JSON format is supported</p>
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
        document.querySelector('.format-option[data-type="music"]')?.classList.add('selected');
    }

    showFilePicker() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                resolve(file);
            };
            
            input.click();
        });
    }

    showImportProgress() {
        Swal.fire({
            title: 'Importing...',
            text: 'Please wait while we import your music data',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    }

    showImportSuccess(result) {
        return Swal.fire({
            icon: 'success',
            title: 'Import Complete!',
            html: this.getSuccessHTML(result),
            confirmButtonText: 'Continue'
        });
    }

    getSuccessHTML(result) {
        return `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-color);"></i>
                <h3>${result.count} songs imported</h3>
                <p>Your music library has been updated.</p>
                ${result.skipped > 0 ? `<p style="color: #ffc107;">⏭️ ${result.skipped} duplicates skipped</p>` : ''}
                ${result.errors > 0 ? `<p style="color: #dc3545;">❌ ${result.errors} errors</p>` : ''}
                <p><small>File: ${ExportUtils.escapeHtml(result.filename)}</small></p>
            </div>
        `;
    }

    showPlaylistImportSuccess(result) {
        return Swal.fire({
            icon: 'success',
            title: 'Playlist Imported!',
            html: this.getPlaylistSuccessHTML(result),
            confirmButtonText: 'View Playlist'
        }).then(() => {
            if (window.playlistsManager) {
                window.playlistsManager.viewPlaylist(result.playlistId);
            }
        });
    }

    getPlaylistSuccessHTML(result) {
        return `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-color);"></i>
                <h3>Playlist Imported</h3>
                <p><strong>${ExportUtils.escapeHtml(result.playlistName)}</strong></p>
                <p>${result.songsImported} of ${result.totalSongs} songs imported</p>
            </div>
        `;
    }

    showError(error) {
        return Swal.fire({
            icon: 'error',
            title: 'Import Failed',
            text: error.message || 'Invalid file format',
            confirmButtonText: 'OK'
        });
    }

    close() {
        Swal.close();
    }
}

window.ImportUI = ImportUI;