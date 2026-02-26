// database/index.js
// Main database initialization & exports for Music Player

class Database {
    constructor() {
        this.dbName = 'MusicPlayerDB';
        this.version = 6; 
        this.db = null;
        
        // Initialize sub-modules - Updated for music
        this.musicDB = null;
        this.playlistDB = null;
        this.playlistSongDB = null;
        this.exportDB = null;
        this.statsDB = null;
        this.utilityDB = null;
        this.settingsDB = null;
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                
                // Initialize sub-modules after db is ready
                this.initializeModules();
                
                // Dispatch event for modules waiting for database
                if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('databaseReady'));
                }
                
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store for music
                if (!db.objectStoreNames.contains('music')) {
                    const store = db.createObjectStore('music', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('artist', 'artist', { unique: false });
                    store.createIndex('album', 'album', { unique: false });
                    store.createIndex('genre', 'genre', { unique: false });
                    store.createIndex('addedDate', 'addedDate', { unique: false });
                }
                
                // Create object store for playlists
                if (!db.objectStoreNames.contains('playlists')) {
                    const playlistStore = db.createObjectStore('playlists', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    playlistStore.createIndex('name', 'name', { unique: false });
                    playlistStore.createIndex('created', 'created', { unique: false });
                }
                
                // Create object store for playlist-song relationships
                if (!db.objectStoreNames.contains('playlistSongs')) {
                    const playlistSongsStore = db.createObjectStore('playlistSongs', { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    playlistSongsStore.createIndex('playlistId', 'playlistId', { unique: false });
                    playlistSongsStore.createIndex('songId', 'songId', { unique: false });
                }
                
                // Create object store for settings
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { 
                        keyPath: 'id'
                    });
                    
                    // Add default settings
                    settingsStore.add({
                        id: 'player_settings',
                        shuffle: false,
                        repeat: false,
                        volume: 70,
                        currentPlaylist: [],
                        currentSongIndex: 0,
                        lastPlayed: null
                    });
                }
            };
        });
    }

    initializeModules() {
        // Initialize all sub-modules with db reference
        this.musicDB = new MusicDB(this.db);
        this.playlistDB = new PlaylistDB(this.db);
        this.playlistSongDB = new PlaylistSongDB(this.db);
        this.exportDB = new MusicExportDB(this.db, this);
        this.statsDB = new MusicStatsDB(this.db, this);
        this.utilityDB = new MusicUtilityDB(this.db, this);
        this.settingsDB = new SettingsDB(this.db);
    }

    // Convenience getters
    get music() { return this.musicDB; }
    get playlists() { return this.playlistDB; }
    get playlistSongs() { return this.playlistSongDB; }
    get export() { return this.exportDB; }
    get stats() { return this.statsDB; }
    get utility() { return this.utilityDB; }
    get settings() { return this.settingsDB; }
}

// Create and export global instance
const database = new Database();
window.database = database;
window.Database = Database;

// Initialize database automatically when loaded
document.addEventListener('DOMContentLoaded', () => {
    database.initDB().then(() => {
        // Success
    }).catch(error => {
        console.error('❌ Failed to initialize database:', error);
    });
});