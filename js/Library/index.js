// js/library/index.js
// Main LibraryManager that orchestrates all sub-modules

class LibraryManager {
    constructor() {   
        this.renderer = new TableRenderer();
        this.search = new SearchManager();
        this.playerConnector = new PlayerConnector();
        this.songActions = new SongActions(this.playerConnector);
        this.playlistActions = new PlaylistActions();
        
        this.addSongBtn = document.getElementById('addSongBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        
        this._initialized = false;
    }

    init() {
        if (this._initialized) {
            console.log('⚠️ LibraryManager already initialized');
            return;
        }
        
        // Check if database is available
        if (!window.database) {
            console.error('❌ window.database is not available!');
            return;
        }
        
        if (!window.database.music) {
            console.error('❌ database.music is not available!');
            return;
        }
        
        this.search.onSearch = (query) => this.handleSearch(query);
        this.search.onClear = () => this.refreshTable();
        this.search.init();
        
        this.setupActionButtons();
        
        // Initial load
        setTimeout(() => {
            this.refreshTable();
            this.updateStats();
        }, 100);
        
        this._initialized = true;
    }

    async handleSearch(query) {
        console.log('🔍 Searching for:', query);
        if (!query) {
            await this.refreshTable();
            return;
        }
        
        try {
            const results = await database.music.search(query, 'all');
            console.log(`Found ${results.length} results for "${query}"`);
            this.renderer.displayResults(results, query);
            this.setupTableListeners();
        } catch (error) {
            console.error('Search error:', error);
            database.utility?.showToast('Search error: ' + error.message, 'error');
        }
    }

    async refreshTable() {
        console.log('🔄 Refreshing music table...');
        
        try {
            console.log('Calling database.music.getAll()...');
            const allMusic = await database.music.getAll();
            console.log(`📊 Loaded ${allMusic.length} songs from database`);
            
            if (allMusic.length === 0) {
                console.log('⚠️ No songs in database');
            } else {
                console.log('First song:', allMusic[0]);
            }
            
            console.log('Calling renderer.displayResults...');
            this.renderer.displayResults(allMusic, '');
            
            console.log('Setting up table listeners...');
            this.setupTableListeners();
            
            console.log('Updating stats...');
            await this.updateStats();
            
        } catch (error) {
            console.error('Error refreshing table:', error);
        }
    }

    setupTableListeners() {
        this.renderer.setupEventListeners({
            onPlay: (songId) => {
                console.log('Play button clicked for song:', songId);
                this.songActions.playSong(songId);
            },
            onAddToPlaylist: (songId) => {
                console.log('Add to playlist clicked for song:', songId);
                this.playlistActions.addToPlaylist(songId);
            },
            onEdit: (songId) => {
                console.log('Edit clicked for song:', songId);
                this.songActions.editSong(songId);
            },
            onDelete: (songId) => {
                console.log('Delete clicked for song:', songId);
                this.songActions.deleteSong(songId);
            }
        });
    }

    async updateStats() {
        try {
            if (database.stats) {
                await database.stats.updateStatsDisplay();
            } else {
                console.warn('database.stats not available');
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    setupActionButtons() {
        // Add Song button
        if (this.addSongBtn && !this.addSongBtn.dataset.listenerAdded) {
            this.addSongBtn.addEventListener('click', () => {
                window.modalHandler?.showAddSongModal();
            });
            this.addSongBtn.dataset.listenerAdded = 'true';
        }

        // Export button
        if (this.exportBtn && !this.exportBtn.dataset.listenerAdded) {
            this.exportBtn.addEventListener('click', () => {
                window.exportImportManager?.handleExport();
            });
            this.exportBtn.dataset.listenerAdded = 'true';
        }

        // Import button
        if (this.importBtn && !this.importBtn.dataset.listenerAdded) {
            this.importBtn.addEventListener('click', () => {
                window.exportImportManager?.handleImport();
            });
            this.importBtn.dataset.listenerAdded = 'true';
        }
    }

    // Public methods for HTML onclick
    async playSong(songId) {
        await this.songActions.playSong(songId);
    }

    async shuffleAll() {
        await this.songActions.shuffleAll();
    }
}

// Create global instance
console.log('Creating libraryManager instance...');
const libraryManager = new LibraryManager();
window.libraryManager = libraryManager;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, checking for library table...');
    
    const initializeLibrary = () => {
        if (document.getElementById('musicTableBody')) {
            console.log('🎵 Found musicTableBody, initializing library on index page');
            libraryManager.init();
        } else {
            console.error('❌ musicTableBody not found in DOM!');
        }
    };
    
    // Try immediate initialization if database is ready
    if (window.database?.db) {
        console.log('Database already ready, initializing now');
        initializeLibrary();
    } else {
        console.log('Waiting for databaseReady event...');
        window.addEventListener('databaseReady', () => {
            console.log('databaseReady event received');
            initializeLibrary();
        }, { once: true });
        
        // Fallback: try again after a delay
        setTimeout(() => {
            if (!libraryManager._initialized && window.database?.db) {
                console.log('Fallback: initializing after timeout');
                initializeLibrary();
            }
        }, 2000);
    }
});

// Global functions for HTML onclick
window.playSong = (songId) => libraryManager.playSong(songId);
window.shuffleAll = () => libraryManager.shuffleAll();