// js/library/utils/library-utils.js
// Helper functions for the library

const LibraryUtils = {
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    getEmptyStateHTML(query = '') {
        if (query) {
            return `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                        <h3>No songs found for "${this.escapeHtml(query)}"</h3>
                        <p>Try different keywords</p>
                    </td>
                </tr>
            `;
        }
        
        return `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-music" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <h3>No songs in your library</h3>
                    <p>Click "Add New Song" to get started</p>
                </td>
            </tr>
        `;
    },

    getSongRowHTML(song) {
        return `
            <tr data-id="${song.id}">
                <td data-label="Play">
                    <button class="play-btn" data-song-id="${song.id}" title="Play ${this.escapeHtml(song.title)}">
                        <i class="fas fa-play"></i>
                    </button>
                </td>
                <td data-label="Title"><strong>${this.escapeHtml(song.title)}</strong></td>
                <td data-label="Artist">${this.escapeHtml(song.artist)}</td>
                <td data-label="Album">${this.escapeHtml(song.album)}</td>
                <td data-label="Actions" class="action-cell">
                    <div class="action-buttons-group">
                        <button class="action-btn playlist-btn" data-song-id="${song.id}" title="Add to playlist">
                            <i class="fas fa-plus"></i><span class="btn-text">Playlist</span>
                        </button>
                        <button class="action-btn edit-btn" data-song-id="${song.id}" title="Edit song">
                            <i class="fas fa-edit"></i><span class="btn-text">Edit</span>
                        </button>
                        <button class="action-btn delete-btn" data-song-id="${song.id}" title="Delete song">
                            <i class="fas fa-trash-alt"></i><span class="btn-text">Delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
};

window.LibraryUtils = LibraryUtils;