// js/modals/song/delete-song-modal.js
// Delete song modal functionality

class DeleteSongModal extends BaseModal {
    async show(songId) {
        try {
            ModalUtils.showLoading('Loading...', 'Fetching song details');
            
            const song = await database.music.getById(songId);
            ModalUtils.closeLoading();

            if (!song) {
                ModalUtils.showError('Error', 'Song not found');
                return;
            }

            this.showDeleteConfirmation(song);
            
        } catch (error) {
            this.handleError(error, 'Failed to load song');
        }
    }

    showDeleteConfirmation(song) {
        this.swal.fire({
            title: '<i class="fas fa-exclamation-triangle"></i> Delete Song',
            html: this.getConfirmationHTML(song),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-trash-alt"></i> Yes, delete it!',
            cancelButtonText: '<i class="fas fa-ban"></i> No, keep it',
            reverseButtons: true,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    await database.music.delete(song.id);
                    return { success: true, title: song.title, artist: song.artist };
                } catch (error) {
                    Swal.showValidationMessage(`Delete failed: ${error.message}`);
                    return false;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                this.showSuccess(result.value);
            }
        });
    }

    getConfirmationHTML(song) {
        return `
            <div class="delete-confirm">
                <i class="fas fa-trash-alt delete-icon" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3>Are you sure?</h3>
                <p>You are about to delete:</p>
                <div class="word-to-delete" style="margin: 1.5rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <strong style="font-size: 1.2rem;">"${ModalUtils.escapeHtml(song.title)}"</strong><br>
                    <small style="color: #6c757d;">by ${ModalUtils.escapeHtml(song.artist)}</small>
                </div>
                <p class="warning-text" style="color: #dc3545; font-weight: bold;">
                    <i class="fas fa-exclamation-circle"></i> This action cannot be undone!
                </p>
            </div>
        `;
    }

    showSuccess(result) {
        Swal.fire({
            title: 'Deleted!',
            html: `
                <div class="success-card">
                    <i class="fas fa-trash-alt" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
                    <h3>Song Deleted</h3>
                    <p><strong>"${ModalUtils.escapeHtml(result.title)}"</strong> by ${ModalUtils.escapeHtml(result.artist)} has been removed.</p>
                </div>
            `,
            icon: 'success',
            confirmButtonText: '<i class="fas fa-check"></i> OK'
        }).then(() => {
            if (window.libraryManager) libraryManager.refreshTable();
            database.stats?.updateStatsDisplay();
            ModalUtils.showToast(`🗑️ "${result.title}" deleted`, 'success');
        });
    }
}

window.DeleteSongModal = DeleteSongModal;