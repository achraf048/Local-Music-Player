// js/player/core/audio-manager.js
// Handles audio playback, progress, and volume

class AudioManager {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.isPlaying = false;
        
        // UI Elements
        this.playBtn = document.getElementById('playBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.progressBar = document.getElementById('progressBar');
        this.progress = document.getElementById('progress');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');
        
        // Callbacks
        this.onPlayStateChange = null;
        this.onTimeUpdate = null;
        this.onSongEnd = null;
    }

    init(settings) {
        this.setVolume(settings.volume);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Audio events
        this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.onTimeUpdate?.();
        });
        
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('ended', () => this.onSongEnd?.());
        
        this.audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
            this.onPlayStateChange?.(true);
        });
        
        this.audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
            this.onPlayStateChange?.(false);
        });

        // Progress bar click
        this.progressBar?.addEventListener('click', (e) => {
            if (!this.audioPlayer.duration) return;
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
        });

        // Volume slider
        this.volumeSlider?.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.setVolume(volume);
        });
    }

    async loadSong(song) {
        return new Promise((resolve, reject) => {
            this.audioPlayer.src = song.src;
            this.audioPlayer.oncanplay = resolve;
            this.audioPlayer.onerror = reject;
            this.audioPlayer.load();
        });
    }

    async play() {
        try {
            await this.audioPlayer.play();
            return true;
        } catch (error) {
            console.warn('Play failed:', error);
            return false;
        }
    }

    pause() {
        this.audioPlayer.pause();
    }

    toggle() {
        if (!this.audioPlayer.src) return false;
        this.audioPlayer.paused ? this.play() : this.pause();
        return true;
    }

    setVolume(volume) {
        const validVolume = PlayerUtils.getValidVolume(volume);
        this.audioPlayer.volume = validVolume / 100;
        if (this.volumeSlider) {
            this.volumeSlider.value = validVolume;
        }
        return validVolume;
    }

    updateProgress() {
        if (!this.audioPlayer.duration) return;
        
        const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        this.progress.style.width = `${percent}%`;
        this.currentTimeEl.textContent = database.utility?.formatDuration(this.audioPlayer.currentTime) || '0:00';
    }

    updateDuration() {
        if (this.totalTimeEl && this.audioPlayer.duration) {
            this.totalTimeEl.textContent = database.utility?.formatDuration(this.audioPlayer.duration) || '0:00';
        }
    }

    updatePlayPauseButton() {
        if (!this.playBtn) return;
        this.playBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        this.playBtn.title = this.isPlaying ? 'Pause' : 'Play';
    }

    restart() {
        this.audioPlayer.currentTime = 0;
    }

    get currentTime() {
        return this.audioPlayer.currentTime;
    }

    get duration() {
        return this.audioPlayer.duration;
    }

    get hasSong() {
        return !!this.audioPlayer.src;
    }
}

// Make available globally
window.AudioManager = AudioManager;