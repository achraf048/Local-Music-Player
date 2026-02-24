// js/library/core/table-renderer.js
// Handles displaying songs in the table

class TableRenderer {
    constructor() {
        
        // Try multiple selectors
        this.tbody = document.getElementById('musicTableBody');
        
        if (!this.tbody) {
            console.warn('musicTableBody not found by ID, trying .container tbody');
            this.tbody = document.querySelector('.container tbody');
        }
        
        if (!this.tbody) {
            console.error('❌ Could not find table body! Check your HTML');
        }
    }

    displayResults(results, query = '') {
        
        if (!this.tbody) {
            console.error('❌ Table body not found! Cannot display results');
            return;
        }

        if (results.length === 0) {
            this.tbody.innerHTML = LibraryUtils.getEmptyStateHTML(query);
            return;
        }

        const sortedResults = [...results].sort((a, b) => 
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );
        
        const html = sortedResults.map(song => 
            LibraryUtils.getSongRowHTML(song)
        ).join('');
        
        this.tbody.innerHTML = html;
    }

    clear() {
        if (this.tbody) {
            this.tbody.innerHTML = '';
        }
    }

    setupEventListeners(callbacks) {
        if (!this.tbody) {
            console.error('Cannot setup listeners: table body not found');
            return;
        }

        // Play buttons
        this.tbody.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const songId = parseInt(e.currentTarget.dataset.songId);
                callbacks.onPlay?.(songId);
            });
        });
        
        // Playlist buttons
        this.tbody.querySelectorAll('.playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const songId = parseInt(e.currentTarget.dataset.songId);
                callbacks.onAddToPlaylist?.(songId);
            });
        });
        
        // Edit buttons
        this.tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const songId = parseInt(e.currentTarget.dataset.songId);
                callbacks.onEdit?.(songId);
            });
        });
        
        // Delete buttons
        this.tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const songId = parseInt(e.currentTarget.dataset.songId);
                callbacks.onDelete?.(songId);
            });
        });
    }
}

window.TableRenderer = TableRenderer;