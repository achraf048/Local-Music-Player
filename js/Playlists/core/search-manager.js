// js/playlists/core/search-manager.js
// Manages search functionality for playlists

class PlaylistSearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchPlaylistInput');
        this.clearSearchBtn = document.getElementById('clearPlaylistSearch');
        this.debounceTimeout = null;
        
        this.onSearch = null;
        this.onClear = null;
    }

    init() {
        this.setupSearch();
        this.setupClearSearch();
    }

    setupSearch() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimeout);
            
            this.debounceTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                this.onSearch?.(query);
            }, 300);
        });
    }

    setupClearSearch() {
        this.clearSearchBtn?.addEventListener('click', () => {
            if (this.searchInput) {
                this.searchInput.value = '';
                this.searchInput.focus();
                this.onClear?.();
            }
        });
    }

    getCurrentQuery() {
        return this.searchInput?.value.trim() || '';
    }

    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }
}

window.PlaylistSearchManager = PlaylistSearchManager;