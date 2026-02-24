// database/MusicStatsDB.js
// Statistics operations for Music Player

class MusicStatsDB {
    constructor(db, database) {
        this.db = db;
        this.database = database;
    }

    async getStats() {
        const totalSongs = await this.database.music.getCount();
        const totalPlaylists = await this.database.playlists.getCount();
        
        return {
            totalSongs,
            totalPlaylists
        };
    }

    async updateStatsDisplay() {
        try {
            const stats = await this.getStats();
            
            // Update total songs
            const totalSongsElement = document.getElementById('totalSongs');
            if (totalSongsElement) {
                totalSongsElement.textContent = stats.totalSongs;
            }
            
            // Update total playlists
            const totalPlaylistsElement = document.getElementById('totalPlaylists');
            if (totalPlaylistsElement) {
                totalPlaylistsElement.textContent = stats.totalPlaylists;
            }
            
            // Update now playing if available
            const settings = await this.database.settings.getSettings();
            const nowPlayingElement = document.getElementById('nowPlaying');
            if (nowPlayingElement && settings.currentPlaylist.length > 0) {
                const currentSongId = settings.currentPlaylist[settings.currentSongIndex];
                if (currentSongId) {
                    const song = await this.database.music.getById(currentSongId);
                    if (song) {
                        nowPlayingElement.textContent = `${song.title} - ${song.artist}`;
                    }
                }
            }
            
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }
}

// Make globally available
window.MusicStatsDB = MusicStatsDB;