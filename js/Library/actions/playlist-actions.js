// js/library/actions/playlist-actions.js
// Handles playlist-related actions

class PlaylistActions {
    addToPlaylist(songId) {
        window.modalHandler?.showAddToPlaylistModal(songId);
    }
}

window.PlaylistActions = PlaylistActions;