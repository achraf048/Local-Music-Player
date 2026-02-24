// js/player/ui/controls-manager.js
// Handles button events and keyboard shortcuts

class ControlsManager {
    constructor() {
        // Buttons
        this.playBtn = document.getElementById('playBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.libraryBtn = document.getElementById('libraryBtn');
        this.playlistsBtn = document.getElementById('playlistsBtn');
        this.expandLyricsBtn = document.getElementById('expandLyricsBtn');
        
        // Callbacks
        this.onPlayToggle = null;
        this.onShuffleToggle = null;
        this.onRepeatToggle = null;
        this.onPrevious = null;
        this.onNext = null;
        this.onExpandLyrics = null;
    }

    init() {
        this.setupButtonListeners();
        this.setupKeyboardShortcuts();
    }

    setupButtonListeners() {
        this.playBtn?.addEventListener('click', () => this.onPlayToggle?.());
        this.shuffleBtn?.addEventListener('click', () => this.onShuffleToggle?.());
        this.repeatBtn?.addEventListener('click', () => this.onRepeatToggle?.());
        this.prevBtn?.addEventListener('click', () => this.onPrevious?.());
        this.nextBtn?.addEventListener('click', () => this.onNext?.());
        this.expandLyricsBtn?.addEventListener('click', () => this.onExpandLyrics?.());
        
        this.libraryBtn?.addEventListener('click', () => window.location.href = 'index.html');
        this.playlistsBtn?.addEventListener('click', () => window.location.href = 'playlists.html');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.onPlayToggle?.();
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey) this.onNext?.();
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey) this.onPrevious?.();
                    break;
                case 'Escape':
                    // Handle escape in modal-manager instead
                    break;
            }
        });
    }

    updateShuffleButton(isActive) {
        if (!this.shuffleBtn) return;
        this.shuffleBtn.classList.toggle('active', isActive);
        this.shuffleBtn.title = `Shuffle ${isActive ? 'On' : 'Off'}`;
    }

    updateRepeatButton(isActive) {
        if (!this.repeatBtn) return;
        this.repeatBtn.classList.toggle('active', isActive);
        this.repeatBtn.title = `Repeat ${isActive ? 'On' : 'Off'}`;
    }
}

// Make available globally
window.ControlsManager = ControlsManager;