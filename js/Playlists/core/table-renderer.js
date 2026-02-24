// js/playlists/core/table-renderer.js
// Handles displaying playlists in the table

class PlaylistTableRenderer {
    constructor() {
        this.tbody = document.getElementById('playlistsTableBody');
    }

    displayPlaylists(playlists) {
        if (!this.tbody) return;

        if (playlists.length === 0) {
            this.tbody.innerHTML = PlaylistUtils.getEmptyPlaylistsHTML();
            return;
        }

        this.tbody.innerHTML = playlists.map(playlist => 
            PlaylistUtils.getPlaylistRowHTML(playlist)
        ).join('');

        // Load song counts
        playlists.forEach(playlist => this.updateSongCount(playlist.id));
    }

    async updateSongCount(playlistId) {
        try {
            const songIds = await database.playlistSongs.getPlaylistSongIds(playlistId);
            const countElement = document.querySelector(`.playlist-song-count[data-id="${playlistId}"]`);
            if (countElement) {
                const count = songIds.length;
                countElement.textContent = `${count} song${count !== 1 ? 's' : ''}`;
            }
        } catch (error) {
            console.error('Failed to update song count:', error);
        }
    }

    setupEventListeners(callbacks) {
        if (!this.tbody) return;

        // View playlist
        this.tbody.querySelectorAll('.view-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistId = parseInt(e.target.closest('button').dataset.id);
                callbacks.onView?.(playlistId);
            });
        });

        // Export playlist
        this.tbody.querySelectorAll('.export-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistId = parseInt(e.target.closest('button').dataset.id);
                callbacks.onExport?.(playlistId);
            });
        });

        // Delete playlist
        this.tbody.querySelectorAll('.delete-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const playlistId = parseInt(row.dataset.id);
                const playlistName = row.querySelector('td:nth-child(2) strong').textContent;
                callbacks.onDelete?.(playlistId, playlistName);
            });
        });
    }
}

window.PlaylistTableRenderer = PlaylistTableRenderer;