// js/lyrics/core/loader.js
// Handles loading LRC content from song objects only

class LRCLoader {
    constructor() {
        this.currentSongId = null;
    }

    // Load from song object (only uses database content)
    async loadFromSong(song) {
        if (!song) return null;
        
        // Check if we have content in the database
        if (song.lrc_content) {
            console.log(`📝 Using stored LRC content for: ${song.title}`);
            this.currentSongId = song.id;
            return song.lrc_content;
        }
        
        console.log(`ℹ️ No LRC content found for: ${song.title}`);
        return null;
    }

    // Load by song ID
    async loadById(songId) {
        try {
            const song = await database.music.getById(songId);
            if (song) {
                return await this.loadFromSong(song);
            }
        } catch (error) {
            console.error('Failed to load song from database:', error);
        }
        return null;
    }

    getCurrentSongId() {
        return this.currentSongId;
    }

    clear() {
        this.currentSongId = null;
    }
}

window.LRCLoader = LRCLoader;