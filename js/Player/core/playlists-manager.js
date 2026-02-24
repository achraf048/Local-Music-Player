// js/player/core/playlist-manager.js
// Manages playlist navigation and state

class PlaylistManager {
    constructor() {
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.currentSongId = null;
        this.settings = {
            shuffle: false,
            repeat: false
        };
        
        // Callbacks
        this.onSongChange = null;
    }

    init(settings) {
        this.settings.shuffle = settings.shuffle || false;
        this.settings.repeat = settings.repeat || false;
        
        if (settings.currentPlaylist?.length > 0) {
            this.currentPlaylist = settings.currentPlaylist;
            this.currentIndex = settings.currentSongIndex || 0;
        }
    }

    setPlaylist(songIds, index = 0) {
        this.currentPlaylist = songIds || [];
        this.currentIndex = Math.min(index, this.currentPlaylist.length - 1);
        this.currentSongId = this.currentPlaylist[this.currentIndex];
        return this.currentSongId;
    }

    async setPlaylistFromDatabase() {
        const allSongs = await database.music.getAll();
        this.currentPlaylist = allSongs.map(s => s.id);
        return this.currentPlaylist;
    }

    updateCurrentSong(songId) {
        this.currentSongId = songId;
        if (this.currentPlaylist?.length > 0) {
            const newIndex = this.currentPlaylist.findIndex(id => id === songId);
            if (newIndex !== -1) {
                this.currentIndex = newIndex;
            }
        }
        return this.currentIndex;
    }

    getNextIndex() {
        if (!this.currentPlaylist?.length) return -1;
        
        if (this.settings.shuffle) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
            } while (this.currentPlaylist.length > 1 && randomIndex === this.currentIndex);
            return randomIndex;
        }
        
        if (this.currentIndex < this.currentPlaylist.length - 1) {
            return this.currentIndex + 1;
        }
        
        if (this.settings.repeat) {
            return 0;
        }
        
        return -1; // End of playlist
    }

    getPreviousIndex() {
        if (!this.currentPlaylist?.length) return -1;
        
        if (this.settings.shuffle) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
            } while (this.currentPlaylist.length > 1 && randomIndex === this.currentIndex);
            return randomIndex;
        }
        
        if (this.currentIndex > 0) {
            return this.currentIndex - 1;
        }
        
        if (this.settings.repeat) {
            return this.currentPlaylist.length - 1;
        }
        
        return -1; // Beginning of playlist
    }

    async goToIndex(index) {
        if (index < 0 || index >= this.currentPlaylist.length) return null;
        
        this.currentIndex = index;
        this.currentSongId = this.currentPlaylist[index];
        await this.saveState();
        this.onSongChange?.(this.currentSongId);
        return this.currentSongId;
    }

    async saveState() {
        await database.settings?.updatePlayerState(this.currentPlaylist, this.currentIndex);
    }

    toggleShuffle() {
        this.settings.shuffle = !this.settings.shuffle;
        return this.settings.shuffle;
    }

    toggleRepeat() {
        this.settings.repeat = !this.settings.repeat;
        return this.settings.repeat;
    }

    get currentSong() {
        return this.currentSongId;
    }

    get length() {
        return this.currentPlaylist.length;
    }

    get isEmpty() {
        return !this.currentPlaylist?.length;
    }
}

// Make available globally
window.PlaylistManager = PlaylistManager;