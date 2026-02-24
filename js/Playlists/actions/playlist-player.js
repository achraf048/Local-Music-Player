// js/playlists/actions/playlist-player.js
// Handles playing playlists and songs

class PlaylistPlayerActions {
    async playPlaylist(playlistId) {
        try {
            const songIds = await database.playlistSongs.getPlaylistSongIds(playlistId);
            
            if (songIds.length === 0) {
                database.utility.showToast('Playlist is empty', 'warning');
                return;
            }
            
            const firstSongId = songIds[0];
            const firstSong = await database.music.getById(firstSongId);
            
            this.updateNowPlaying(firstSong);
            await database.settings.updatePlayerState(songIds, 0);
            
            window.open(
                `player.html?id=${firstSongId}`,
                'musicPlayer',
                'width=800,height=700,left=100,top=100,resizable=yes,scrollbars=yes'
            )?.focus();
            
        } catch (error) {
            database.utility.showToast('Error playing playlist: ' + error.message, 'error');
        }
    }

    async playSongFromPlaylist(songId, playlistId) {
        if (!playlistId) return;
        
        try {
            const songIds = await database.playlistSongs.getPlaylistSongIds(playlistId);
            const songIndex = songIds.indexOf(songId);
            
            if (songIndex === -1) return;
            
            await database.settings.updatePlayerState(songIds, songIndex);
            
            const song = await database.music.getById(songId);
            this.updateNowPlaying(song);
            
            window.open(
                `player.html?id=${songId}`,
                'musicPlayer',
                'width=800,height=700,left=100,top=100,resizable=yes,scrollbars=yes'
            )?.focus();
            
        } catch (error) {
            database.utility.showToast('Error playing song: ' + error.message, 'error');
        }
    }

    updateNowPlaying(song) {
        const nowPlayingElement = document.getElementById('nowPlaying');
        if (nowPlayingElement && song) {
            nowPlayingElement.textContent = `${song.title} - ${song.artist}`;
        }
    }
}

window.PlaylistPlayerActions = PlaylistPlayerActions;