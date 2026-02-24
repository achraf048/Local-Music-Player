// js/library/actions/song-actions.js
// Handles song-related actions (play, edit, delete)

class SongActions {
    constructor(playerConnector) {
        this.playerConnector = playerConnector;
    }

    async playSong(songId, playlistContext = null) {
        try {
            const song = await database.music.getById(songId);
            if (!song) {
                database.utility.showToast('Song not found', 'error');
                return;
            }
            
            const [songIds, songIndex] = await this.getPlaylistContext(songId, playlistContext);
            
            await database.settings.updatePlayerState(songIds, songIndex);
            this.updateNowPlaying(song);
            
            await this.playerConnector.playSong(songId, songIds, songIndex);
            
        } catch (error) {
            database.utility.showToast('Error playing song: ' + error.message, 'error');
        }
    }

    async getPlaylistContext(songId, playlistContext) {
        if (playlistContext) {
            return [playlistContext, playlistContext.indexOf(songId)];
        }
        
        const allSongs = await database.music.getAll();
        const songIds = allSongs.map(s => s.id);
        return [songIds, songIds.indexOf(songId)];
    }

    updateNowPlaying(song) {
        const nowPlayingElement = document.getElementById('nowPlaying');
        if (nowPlayingElement) {
            nowPlayingElement.textContent = `${song.title} - ${song.artist}`;
        }
    }

    async shuffleAll() {
        try {
            const allSongs = await database.music.getAll();
            if (allSongs.length === 0) {
                database.utility.showToast('No songs in library', 'warning');
                return;
            }
            
            const shuffled = LibraryUtils.shuffleArray([...allSongs]);
            const songIds = shuffled.map(s => s.id);
            const firstSong = shuffled[0];
            
            await database.settings.updatePlayerState(songIds, 0);
            this.updateNowPlaying(firstSong);
            
            await this.playerConnector.playPlaylist(songIds, firstSong.id);
            
            database.utility.showToast(`🔀 Shuffling ${songIds.length} songs`, 'success');
            
        } catch (error) {
            database.utility.showToast('Error shuffling: ' + error.message, 'error');
        }
    }

    // These methods will call the modal handler
    editSong(songId) {
        window.modalHandler?.showEditModal(songId);
    }

    deleteSong(songId) {
        window.modalHandler?.showDeleteModal(songId);
    }
}

window.SongActions = SongActions;