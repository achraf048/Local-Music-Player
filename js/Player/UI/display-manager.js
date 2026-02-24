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
        this.albumArt.src = song.image || "images/default-album.jpg";
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