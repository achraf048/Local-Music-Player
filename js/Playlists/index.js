// js/playlists/index.js
// Main PlaylistsManager that orchestrates all sub-modules

class PlaylistsManager {
    constructor() {
        this.tableRenderer = new PlaylistTableRenderer();
        this.search = new PlaylistSearchManager();
        this.detail = new PlaylistDetailManager();
        this.crud = new PlaylistCrudActions(this.detail);
        this.player = new PlaylistPlayerActions();
        
        this.createPlaylistBtn = document.getElementById('createPlaylistBtn');
    }

    init() {
        // Set up search callbacks
        this.search.onSearch = (query) => this.handleSearch(query);
        this.search.onClear = () => this.loadPlaylists();
        this.search.init();
        
        // Set up CRUD callback
        this.crud.onPlaylistsChanged = () => this.loadPlaylists();
        
        // Set up detail callback
        this.detail.onRemoveSong = (songId) => this.handleRemoveSong(songId);
        
        // Load initial data
        this.loadPlaylists();
        this.setupCreateButton();
    }

    async handleSearch(query) {
        if (!query) {
            await this.loadPlaylists();
            return;
        }
        
        try {
            const playlists = await database.playlists.getAll();
            const filtered = playlists.filter(playlist => 
                playlist.name.toLowerCase().includes(query.toLowerCase()) ||
                (playlist.description?.toLowerCase().includes(query.toLowerCase()))
            );
            this.tableRenderer.displayPlaylists(filtered);
            this.setupTableEventListeners();
        } catch (error) {
            database.utility.showToast('Search error: ' + error.message, 'error');
        }
    }

    async loadPlaylists() {
        try {
            const playlists = await database.playlists.getAll();
            this.tableRenderer.displayPlaylists(playlists);
            this.setupTableEventListeners();
        } catch (error) {
            database.utility.showToast('Failed to load playlists: ' + error.message, 'error');
        }
    }

    setupTableEventListeners() {
        this.tableRenderer.setupEventListeners({
            onView: (playlistId) => this.viewPlaylist(playlistId),
            onExport: (playlistId) => this.crud.exportPlaylist(playlistId),
            onDelete: (playlistId, playlistName) => this.crud.deletePlaylist(playlistId, playlistName)
        });
    }

    setupCreateButton() {
        this.createPlaylistBtn?.addEventListener('click', () => {
            this.crud.createPlaylist();
        });
    }

    async viewPlaylist(playlistId) {
        try {
            this.detail.setCurrentPlaylistId(playlistId);
            
            const [playlist, songs] = await Promise.all([
                database.playlists.getById(playlistId),
                database.playlistSongs.getPlaylistSongs(playlistId)
            ]);
            
            if (!playlist) {
                database.utility.showToast('Playlist not found', 'error');
                return;
            }

            await this.detail.displayPlaylist(playlist, songs);
            
        } catch (error) {
            database.utility.showToast('Failed to load playlist: ' + error.message, 'error');
        }
    }

    async handleRemoveSong(songId) {
        const playlistId = this.detail.getCurrentPlaylistId();
        const success = await this.crud.removeSongFromPlaylist(songId, playlistId);
        
        if (success) {
            await this.viewPlaylist(playlistId);
            this.tableRenderer.updateSongCount(playlistId);
            database.utility.showToast('Song removed from playlist', 'success');
        }
    }

    hidePlaylistDetail() {
        this.detail.hide();
    }

    // Public methods for HTML onclick
    async playPlaylist(playlistId) {
        await this.player.playPlaylist(playlistId);
    }

    async playSongFromPlaylist(songId) {
        await this.player.playSongFromPlaylist(songId, this.detail.getCurrentPlaylistId());
    }
}

// Create global instance
const playlistsManager = new PlaylistsManager();
window.playlistsManager = playlistsManager;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('playlistsTableBody')) {
        // Wait for database
        if (!window.database?.db) {
            await new Promise(resolve => {
                const checkDB = setInterval(() => {
                    if (window.database?.db) {
                        clearInterval(checkDB);
                        resolve();
                    }
                }, 100);
            });
        }
        
        playlistsManager.init();
    }
});

// Global function for playing from playlist (for HTML onclick)
window.playSongFromPlaylist = (songId) => playlistsManager.playSongFromPlaylist(songId);