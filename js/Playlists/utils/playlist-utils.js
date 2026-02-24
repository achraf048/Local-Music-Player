// js/playlists/utils/playlist-utils.js
// Helper functions for playlists

const PlaylistUtils = {
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getEmptyPlaylistsHTML() {
        return `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-list-music" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <h3>No playlists yet</h3>
                    <p>Create your first playlist to get started</p>
                </td>
            </tr>
        `;
    },

    getPlaylistRowHTML(playlist) {
        return `
            <tr data-id="${playlist.id}">
                <td data-label="Play">
                    <button class="play-btn" onclick="playlistsManager.playPlaylist(${playlist.id})" title="Play playlist">
                        <i class="fas fa-play"></i>
                    </button>
                </td>
                <td data-label="Name">
                    <strong>${this.escapeHtml(playlist.name)}</strong>
                    ${playlist.description ? `<br><small>${this.escapeHtml(playlist.description)}</small>` : ''}
                </td>
                <td data-label="Songs">
                    <span class="playlist-song-count" data-id="${playlist.id}">Loading...</span>
                </td>
                <td data-label="Created">${new Date(playlist.created).toLocaleDateString()}</td>
                <td data-label="Actions" class="action-cell">
                    <div class="action-buttons-group">
                        <button class="action-btn view-playlist-btn" data-id="${playlist.id}" title="View playlist">
                            <i class="fas fa-eye"></i><span class="btn-text">View</span>
                        </button>
                        <button class="action-btn export-playlist-btn" data-id="${playlist.id}" title="Export playlist">
                            <i class="fas fa-download"></i><span class="btn-text">Export</span>
                        </button>
                        <button class="action-btn delete-playlist-btn" title="Delete playlist">
                            <i class="fas fa-trash-alt"></i><span class="btn-text">Delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    getPlaylistSongsHTML(songs) {
        if (!songs.length) {
            return `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-music-slash" style="font-size: 2rem; color: var(--text-secondary);"></i>
                        <p>No songs in this playlist</p>
                    </td>
                </tr>
            `;
        }
        
        return songs.map(song => `
            <tr data-id="${song.id}">
                <td data-label="Play">
                    <button class="play-btn" onclick="playSongFromPlaylist(${song.id})" title="Play ${this.escapeHtml(song.title)}">
                        <i class="fas fa-play"></i>
                    </button>
                </td>
                <td data-label="Title"><strong>${this.escapeHtml(song.title)}</strong></td>
                <td data-label="Artist">${this.escapeHtml(song.artist)}</td>
                <td data-label="Album">${this.escapeHtml(song.album)}</td>
                <td data-label="Remove" class="action-cell">
                    <button class="action-btn remove-from-playlist-btn" data-song-id="${song.id}" title="Remove from playlist">
                        <i class="fas fa-times"></i><span class="btn-text">Remove</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }
};

window.PlaylistUtils = PlaylistUtils;