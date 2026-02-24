// js/playlists/detail/playlist-detail.js
// Manages playlist detail view

class PlaylistDetailManager {
    constructor() {
        this.detailElement = document.getElementById('playlistDetail');
        this.playlistNameElement = document.getElementById('playlistName');
        this.songsTbody = document.getElementById('playlistSongsBody');
        
        this.currentPlaylistId = null;
        this.onRemoveSong = null;
    }

    show() {
        if (this.detailElement) {
            this.detailElement.style.display = 'block';
        }
    }

    hide() {
        if (this.detailElement) {
            this.detailElement.style.display = 'none';
        }
        this.currentPlaylistId = null;
    }

    async displayPlaylist(playlist, songs) {
        if (!this.playlistNameElement || !this.songsTbody) return;
        
        this.playlistNameElement.textContent = playlist.name;
        this.show();
        
        this.songsTbody.innerHTML = PlaylistUtils.getPlaylistSongsHTML(songs);
        this.setupRemoveButtons();
        
        // Scroll to detail
        this.detailElement.scrollIntoView({ behavior: 'smooth' });
    }

    setupRemoveButtons() {
        this.songsTbody.querySelectorAll('.remove-from-playlist-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const songId = parseInt(e.target.closest('button').dataset.songId);
                await this.onRemoveSong?.(songId);
            });
        });
    }

    setCurrentPlaylistId(id) {
        this.currentPlaylistId = id;
    }

    getCurrentPlaylistId() {
        return this.currentPlaylistId;
    }
}

window.PlaylistDetailManager = PlaylistDetailManager;