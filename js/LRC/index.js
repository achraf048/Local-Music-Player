// js/lyrics/index.js
// Main LRCManager that orchestrates all sub-modules

class LRCManager {
    constructor() {
        this.loader = new LRCLoader();
        this.parser = new LRCParser();
        this.renderer = new LRCRenderer();
        this.highlighter = new LRCHighlighter();
        this.timeSync = new LRCTimeSync(this.highlighter);
        
        this.lyrics = [];
        this.container = null;
        this.audioElement = null;
        this.currentSongId = null;
    }

    // ============ MAIN API ============

    async loadFromSong(song) {
        if (!song) return null;
        
        const content = await this.loader.loadFromSong(song);
        if (content) {
            this.parse(content);
            this.currentSongId = song.id;
        }
        return content;
    }

    async loadById(songId) {
        try {
            const song = await database.music.getById(songId);
            if (song) {
                return await this.loadFromSong(song);
            }
        } catch (error) {
            console.error('Failed to load song:', error);
        }
        return null;
    }

    parse(lrcText) {
        this.lyrics = this.parser.parse(lrcText);
        return this.lyrics;
    }

    render(container, lyricsArray = null) {
        this.container = container;
        const lyrics = lyricsArray || this.lyrics;
        
        this.renderer.render(container, lyrics, this.parser.isEnhancedFormat());
        this.highlighter.init(container, lyrics, this.parser.isEnhancedFormat());
        
        return lyrics;
    }

    syncWithAudio(audioElement) {
        this.audioElement = audioElement;
        return this.timeSync.syncWithAudio(audioElement);
    }

    // ============ UTILITY METHODS ============

    setModalContainer(modalContainer) {
        if (this.highlighter) {
            this.highlighter.setModalContainer(modalContainer);
        }
    }

    syncModal(modalContainer) {
        if (this.highlighter && this.highlighter.currentLine >= 0) {
            this.highlighter.updateModalHighlight(this.highlighter.currentLine);
        }
    }

    scrollToCurrent(behavior = 'smooth') {
        this.highlighter.scrollToActive(behavior);
    }

    getDuration() {
        return this.parser.getDuration(this.lyrics);
    }

    clear() {
        this.lyrics = [];
        this.parser.isEnhanced = false;
        this.renderer.clear();
        this.highlighter.clear();
        this.timeSync.cleanup();
        this.loader.clear(); // Changed from clearPath() to clear()
        this.container = null;
        this.audioElement = null;
        this.currentSongId = null;
    }

    // ============ GETTERS ============

    isEnhanced() {
        return this.parser.isEnhancedFormat();
    }

    hasLyrics() {
        return this.lyrics.length > 0;
    }

    getLineCount() {
        return this.lyrics.length;
    }

    getCurrentSongId() {
        return this.currentSongId;
    }
}

window.LRCManager = LRCManager;