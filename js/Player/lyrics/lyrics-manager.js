// js/player/lyrics/lyrics-manager.js
// Manages lyrics loading and display

class LyricsManager {
    constructor() {
        this.lyricsContainer = document.getElementById('lyrics');
        this.lrcManager = new LRCManager();
        this.audioPlayer = document.getElementById('audioPlayer');
        
        this.scrollBtn = document.getElementById('scrollToCurrentBtn');
    }

    async loadLyrics(song) {
        this.clear();
        
        if (!song) {
            console.log('No song provided');
            this.showNoLyrics();
            return;
        }
        
        console.log('📝 Loading lyrics for song:', song.title);
        
        // Check if song has lyrics content
        if (!song.lrc_content) {
            console.log('No lyrics content found for this song');
            this.showNoLyrics();
            return;
        }
        
        this.showLoading();
        
        try {
            console.log('✅ Using embedded lyrics from database');
            
            // Parse the lyrics
            const parsedLyrics = this.lrcManager.parse(song.lrc_content);
            console.log('✅ Parsed successfully, lines:', parsedLyrics.length);
            
            // Log sample if available
            if (parsedLyrics.length > 0) {
                console.log('Sample line:', parsedLyrics[0]);
            }
            
            // Render and sync
            this.lrcManager.render(this.lyricsContainer, parsedLyrics);
            this.lrcManager.syncWithAudio(this.audioPlayer);
            this.setupScrollButton();
            
            console.log('🎵 Lyrics displayed successfully');
            
        } catch (error) {
            console.error('❌ Error loading lyrics:', error);
            console.error('Error details:', error.message);
            this.showError();
        }
    }

    clear() {
        if (this.lrcManager) {
            this.lrcManager.clear();
        }
        if (this.lyricsContainer) {
            this.lyricsContainer.innerHTML = '';
        }
    }

    showNoLyrics() {
        if (this.lyricsContainer) {
            this.lyricsContainer.innerHTML = '<div class="no-lyrics">🎵 No lyrics available for this song</div>';
        }
    }

    showLoading() {
        if (this.lyricsContainer) {
            this.lyricsContainer.innerHTML = '<div class="lyrics-loading">Loading lyrics...</div>';
        }
    }

    showError() {
        if (this.lyricsContainer) {
            this.lyricsContainer.innerHTML = '<div class="error">Failed to load lyrics</div>';
        }
    }

    setupScrollButton() {
        if (!this.scrollBtn) return;
        
        // Remove old event listeners by cloning
        const newBtn = this.scrollBtn.cloneNode(true);
        if (this.scrollBtn.parentNode) {
            this.scrollBtn.parentNode.replaceChild(newBtn, this.scrollBtn);
        }
        
        // Add new event listener
        newBtn.addEventListener('click', () => this.scrollToCurrent());
        this.scrollBtn = newBtn;
    }

    scrollToCurrent() {
        const activeLine = document.querySelector('.lyric-line.active');
        if (activeLine) {
            activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    getLyricsLines() {
        return document.querySelectorAll('#lyrics .lyric-line');
    }

    // Check if song has lyrics content
    hasLyrics(song) {
        return !!(song && song.lrc_content);
    }

    // Get lyrics stats
    getLyricsStats(song) {
        if (!song) return { hasAny: false, hasEmbedded: false };
        
        return {
            hasAny: !!song.lrc_content,
            hasEmbedded: !!song.lrc_content,
            embeddedSize: song.lrc_content?.length || 0
        };
    }
}

// Make available globally
window.LyricsManager = LyricsManager;