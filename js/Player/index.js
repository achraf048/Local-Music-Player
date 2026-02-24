// js/player/index.js
// Main PlayerManager that orchestrates all sub-modules

class PlayerManager {
    constructor() {
        // Initialize sub-modules
        this.audio = new AudioManager();
        this.playlist = new PlaylistManager();
        this.display = new DisplayManager();
        this.controls = new ControlsManager();
        this.lyrics = new LyricsManager();    
        this.lrcManager = new LRCManager();
        this.modal = new ModalManager();
        
        this.settings = {};
        this.appOrigin = window.location.origin;
    }

    async init() {
        await PlayerUtils.waitForDatabase();
        await this.loadSettings();
        
        // Initialize sub-modules with settings
        this.audio.init(this.settings);
        this.playlist.init(this.settings);
        this.controls.init();
        this.modal.init(this.lrcManager);  // Pass LRCManager, not LyricsManager
        
        // Set up callbacks
        this.setupCallbacks();
        
        // Set up message listener for opener communication
        this.setupMessageListener();
        
        // Initialize playback based on URL or settings
        await this.initializePlayback();
        
        // Update UI
        this.updateSettingsUI();
    }

    async loadSong(songId) {
        try {
            const song = await database.music.getById(songId);
            if (!song) {
                database.utility?.showToast('Song not found', 'error');
                this.display.updateNoSong();
                return;
            }

            // Update UI
            this.display.updateSongInfo(song);
            this.display.enablePlayButton();
            
            // Load audio
            await this.audio.loadSong(song);
            
            // Update playlist state
            this.playlist.updateCurrentSong(songId);
            
            // Load lyrics - THIS USES LYRICS MANAGER FOR DISPLAY
            await this.lyrics.loadLyrics(song);
            
            // Also need to load lyrics into LRCManager for highlighting
            if (song.lrc_content) {
                this.lrcManager.parse(song.lrc_content);
                this.lrcManager.render(document.getElementById('lyrics'), this.lrcManager.lyrics);
                this.lrcManager.syncWithAudio(this.audio.audioPlayer);
            }
            
            // Update URL
            PlayerUtils.updateUrl(songId);
            
            // Auto-play
            const played = await this.audio.play();
            if (!played) {
                this.audio.isPlaying = false;
                this.audio.updatePlayPauseButton();
            }
            
        } catch (error) {
            console.error('Error loading song:', error);
            database.utility?.showToast('Error loading song', 'error');
            this.display.updateNoSong();
        }
    }

    async loadSettings() {
        try {
            this.settings = await database.settings.getSettings() || PlayerUtils.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = PlayerUtils.getDefaultSettings();
        }
    }

    setupCallbacks() {
        // Audio callbacks
        this.audio.onSongEnd = () => this.playNext();
        this.audio.onTimeUpdate = () => this.modal.syncHighlight();
        
        // Controls callbacks
        this.controls.onPlayToggle = () => this.togglePlay();
        this.controls.onShuffleToggle = () => this.toggleShuffle();
        this.controls.onRepeatToggle = () => this.toggleRepeat();
        this.controls.onPrevious = () => this.playPrevious();
        this.controls.onNext = () => this.playNext();
        this.controls.onExpandLyrics = () => this.openLyricsModal();
        
        // Playlist callback
        this.playlist.onSongChange = (songId) => this.loadSong(songId);
    }

    setupMessageListener() {
        if (!window.opener) return;
        
        window.addEventListener('message', (event) => {
            if (event.origin !== this.appOrigin) return;
            
            const { type, songId, playlist, currentIndex, songIds, playNow } = event.data;
            
            if (type === 'playSong' && playlist) {
                this.playlist.setPlaylist(playlist, currentIndex);
                this.playlist.saveState();
                this.loadSong(songId);
            }
            
            if (type === 'setPlaylist' && songIds) {
                this.playlist.setPlaylist(songIds, currentIndex);
                this.playlist.saveState();
                
                if (playNow && songIds[currentIndex]) {
                    this.loadSong(songIds[currentIndex]);
                }
            }
        });
    }

    async initializePlayback() {
        const urlSongId = PlayerUtils.getSongIdFromUrl();
        
        if (urlSongId) {
            await this.initializeFromUrl(urlSongId);
        } else if (!this.playlist.isEmpty) {
            await this.playlist.goToIndex(this.playlist.currentIndex);
        } else {
            this.display.updateNoSong();
        }
    }

    async initializeFromUrl(urlSongId) {
        if (!this.playlist.isEmpty) {
            const urlIndex = this.playlist.currentPlaylist.indexOf(urlSongId);
            if (urlIndex !== -1) {
                this.playlist.currentIndex = urlIndex;
                this.playlist.currentSongId = urlSongId;
            } else {
                await this.playlist.setPlaylistFromDatabase();
                this.playlist.updateCurrentSong(urlSongId);
            }
        } else {
            await this.playlist.setPlaylistFromDatabase();
            this.playlist.updateCurrentSong(urlSongId);
        }
        
        await this.loadSong(urlSongId);
    }

    togglePlay() {
        if (!this.audio.hasSong) {
            database.utility?.showToast('No song loaded', 'warning');
            return;
        }
        this.audio.toggle();
    }

    async playNext() {
        const nextIndex = this.playlist.getNextIndex();
        if (nextIndex === -1) {
            database.utility?.showToast('End of playlist', 'info');
            return;
        }
        await this.playlist.goToIndex(nextIndex);
    }

    async playPrevious() {
        if (this.audio.currentTime > 5) {
            this.audio.restart();
            return;
        }
        
        const prevIndex = this.playlist.getPreviousIndex();
        if (prevIndex === -1) {
            database.utility?.showToast('At beginning of playlist', 'info');
            return;
        }
        await this.playlist.goToIndex(prevIndex);
    }

    async toggleShuffle() {
        const isActive = this.playlist.toggleShuffle();
        await database.settings?.updateSettings({ shuffle: isActive });
        this.controls.updateShuffleButton(isActive);
        database.utility?.showToast(`Shuffle ${isActive ? 'On' : 'Off'}`, 'info');
    }

    async toggleRepeat() {
        const isActive = this.playlist.toggleRepeat();
        await database.settings?.updateSettings({ repeat: isActive });
        this.controls.updateRepeatButton(isActive);
        database.utility?.showToast(`Repeat ${isActive ? 'On' : 'Off'}`, 'info');
    }

    updateSettingsUI() {
        this.controls.updateShuffleButton(this.playlist.settings.shuffle);
        this.controls.updateRepeatButton(this.playlist.settings.repeat);
    }

    openLyricsModal() {
        this.modal.open(
            this.display.songTitle.textContent,
            this.display.songArtist.textContent,
            this.playlist.currentSongId
        );
    }
}

// Create global instance
const playerManager = new PlayerManager();
window.playerManager = playerManager;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('audioPlayer')) {
        playerManager.init();
    }
});

// Global functions for HTML onclick compatibility
window.togglePlay = () => playerManager.togglePlay();
window.playNext = () => playerManager.playNext();
window.playPrevious = () => playerManager.playPrevious();
window.toggleShuffle = () => playerManager.toggleShuffle();
window.toggleRepeat = () => playerManager.toggleRepeat();
window.goToLibrary = () => window.location.href = 'index.html';