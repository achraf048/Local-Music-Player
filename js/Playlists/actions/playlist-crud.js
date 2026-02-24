// js/playlists/actions/playlist-crud.js
// Handles create, edit, delete operations

class PlaylistCrudActions {
    constructor(detailManager) {
        this.detailManager = detailManager;
        this.onPlaylistsChanged = null;
    }

    async deletePlaylist(playlistId, playlistName) {
        const result = await Swal.fire({
            title: 'Delete Playlist',
            html: `
                <div class="delete-confirm">
                    <i class="fas fa-trash-alt delete-icon"></i>
                    <h3>Delete "${PlaylistUtils.escapeHtml(playlistName)}"?</h3>
                    <p>This will remove the playlist and all its songs from your library.</p>
                    <p class="warning-text">This action cannot be undone!</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await database.playlistSongs.clearPlaylist(playlistId);
                await database.playlists.delete(playlistId);
                
                database.utility.showToast('Playlist deleted', 'success');
                this.onPlaylistsChanged?.();
                
                if (this.detailManager.getCurrentPlaylistId() === playlistId) {
                    this.detailManager.hide();
                }
            } catch (error) {
                database.utility.showToast('Failed to delete playlist: ' + error.message, 'error');
            }
        }
    }

    async removeSongFromPlaylist(songId, playlistId) {
        if (!playlistId) return;

        try {
            await database.playlistSongs.removeSongFromPlaylist(songId, playlistId);
            return true;
        } catch (error) {
            database.utility.showToast('Failed to remove song: ' + error.message, 'error');
            return false;
        }
    }

    // These methods will call the modal handler
    createPlaylist() {
        window.modalHandler?.showCreatePlaylistModal();
    }

    exportPlaylist(playlistId) {
        window.exportImportManager?.exportPlaylist(playlistId);
    }
}

window.PlaylistCrudActions = PlaylistCrudActions;