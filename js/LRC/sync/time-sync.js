// js/lyrics/sync/time-sync.js
// Syncs lyrics with audio time using RAF

class LRCTimeSync {
    constructor(highlighter) {
        this.highlighter = highlighter;
        this.audioElement = null;
        this._boundTimeUpdate = null;
        this._rafId = null;
    }

    syncWithAudio(audioElement) {
        // Remove old listener
        if (this.audioElement && this._boundTimeUpdate) {
            this.audioElement.removeEventListener('timeupdate', this._boundTimeUpdate);
        }
        
        this.audioElement = audioElement;
        this._boundTimeUpdate = (e) => {
            const currentTime = e.target.currentTime;
            this.highlighter.update(currentTime);
        };
        
        audioElement.addEventListener('timeupdate', this._boundTimeUpdate);
        console.log('🔄 TimeSync attached to audio element');
        
        return () => this.cleanup();
    }

    cleanup() {
        if (this.audioElement && this._boundTimeUpdate) {
            this.audioElement.removeEventListener('timeupdate', this._boundTimeUpdate);
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this.audioElement = null;
        this._boundTimeUpdate = null;
    }
}

window.LRCTimeSync = LRCTimeSync;