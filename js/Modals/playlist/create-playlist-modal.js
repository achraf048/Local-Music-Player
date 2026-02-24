// js/modals/playlist/create-playlist-modal.js
// Create playlist modal functionality

class CreatePlaylistModal extends BaseModal {
    constructor() {
        super();
        this.setupTrigger();
    }

    setupTrigger() {
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => this.show());
        }
    }

    show() {
        this.swal.fire({
            title: '<i class="fas fa-plus-circle"></i> Create New Playlist',
            html: this.getFormHTML(),
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save"></i> Create Playlist',
            cancelButtonText: '<i class="fas fa-times"></i> Cancel',
            showLoaderOnConfirm: true,
            preConfirm: () => this.validateForm(),
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.handleSubmit(result.value);
            }
        });
    }

    getFormHTML() {
        return `
            <div class="sweet-form">
                <div class="form-group">
                    <label for="swal-playlist-name"><i class="fas fa-heading"></i> Playlist Name *</label>
                    <input type="text" id="swal-playlist-name" class="swal-input" placeholder="Enter playlist name">
                </div>
                <div class="form-group">
                    <label for="swal-playlist-desc"><i class="fas fa-align-left"></i> Description (Optional)</label>
                    <textarea id="swal-playlist-desc" class="swal-textarea" placeholder="Enter description..." rows="2"></textarea>
                </div>
            </div>
        `; 
    }

    validateForm() {
        const name = document.getElementById('swal-playlist-name').value.trim();

        if (!this.validateRequired(name, 'Playlist name')) return false;

        return {
            name,
            description: document.getElementById('swal-playlist-desc').value.trim() || null
        };
    }

    async handleSubmit(playlistData) {
        try {
            ModalUtils.showLoading();
            
            const playlist = await database.playlists.add(playlistData);
            
            ModalUtils.closeLoading();
            
            ModalUtils.showSuccess(
                'Success!',
                this.getSuccessHTML(playlist),
                () => {
                    if (window.playlistsManager) playlistsManager.loadPlaylists();
                    database.stats?.updateStatsDisplay();
                }
            );
            
        } catch (error) {
            this.handleError(error, 'Failed to create playlist');
        }
    }

    getSuccessHTML(playlist) {
        return `
            <div class="success-card">
                <i class="fas fa-check-circle success-icon"></i>
                <h3>Playlist Created</h3>
                <div class="word-preview">
                    <div><strong>Name:</strong> ${ModalUtils.escapeHtml(playlist.name)}</div>
                    ${playlist.description ? `<div><strong>Description:</strong> ${ModalUtils.escapeHtml(playlist.description)}</div>` : ''}
                </div>
            </div>
        `;
    }
}

window.CreatePlaylistModal = CreatePlaylistModal;