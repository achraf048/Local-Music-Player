// js/player/ui/display-manager.js
// Updates UI elements with song information

class DisplayManager {
    constructor() {
        // UI Elements
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.songAlbum = document.getElementById('songAlbum');
        this.albumArt = document.getElementById('albumArt');
        this.currentSongInfo = document.getElementById('currentSongInfo');
        this.playBtn = document.getElementById('playBtn');
    }

    updateSongInfo(song) {
        this.songTitle.textContent = song.title;
        this.songArtist.textContent = song.artist;
        this.songAlbum.textContent = `${song.album} • ${song.year}`;
        
        // Set up error handler before setting src
        this.albumArt.onerror = () => {
            console.log("Cover image was not found, using default album image!");
            this.albumArt.src = "images/default-album.jpg";
            this.albumArt.onerror = null; // Prevent infinite loop if default is also missing
        };
        
        // Try to load the requested image
        this.albumArt.src = song.image;
        this.albumArt.alt = `${song.title} - ${song.artist}`;
        
        if (this.currentSongInfo) {
            this.currentSongInfo.textContent = `${song.title} - ${song.artist}`;
        }
    }

    updateNoSong() {
        this.songTitle.textContent = 'Select a song to play';
        this.songArtist.textContent = 'No song playing';
        this.songAlbum.textContent = 'Select from library • --';
        this.albumArt.src = 'images/default-album.jpg';
        
        if (this.currentSongInfo) {
            this.currentSongInfo.textContent = 'No song playing';
        }
        
        if (this.playBtn) {
            this.playBtn.disabled = true;
        }
    }

    enablePlayButton() {
        if (this.playBtn) {
            this.playBtn.disabled = false;
        }
    }
}

// Make available globally
window.DisplayManager = DisplayManager;