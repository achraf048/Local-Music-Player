// js/export-import/core/exporter.js
// Handles data export to JSON

class Exporter {
    constructor() {
        this.version = '1.0';
    }

    async exportAllMusic() {
        try {
            // Get all music data
            const songs = await database.music.getAll();
            
            // Prepare export data
            const exportData = {
                version: this.version,
                exportDate: new Date().toISOString(),
                type: 'music-library',
                data: songs.map(song => ({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album,
                    year: song.year,
                    src: song.src,
                    image: song.image,
                    synced_lyrics: song.synced_lyrics,
                    lrc_content: song.lrc_content,
                    addedDate: song.addedDate
                }))
            };

            return exportData;
        } catch (error) {
            console.error('Export error:', error);
            throw new Error('Failed to export music data: ' + error.message);
        }
    }

    async exportPlaylist(playlistId) {
        try {
            // Get playlist info
            const playlist = await database.playlists.getById(playlistId);
            if (!playlist) {
                throw new Error('Playlist not found');
            }

            // Get playlist songs
            const songs = await database.playlistSongs.getPlaylistSongs(playlistId);

            // Prepare export data
            const exportData = {
                version: this.version,
                exportDate: new Date().toISOString(),
                type: 'playlist',
                data: {
                    playlist: {
                        id: playlist.id,
                        name: playlist.name,
                        description: playlist.description,
                        created: playlist.created
                    },
                    songs: songs.map(song => ({
                        id: song.id,
                        title: song.title,
                        artist: song.artist,
                        album: song.album,
                        year: song.year,
                        src: song.src,
                        image: song.image,
                        synced_lyrics: song.synced_lyrics
                    }))
                }
            };

            return exportData;
        } catch (error) {
            console.error('Playlist export error:', error);
            throw new Error('Failed to export playlist: ' + error.message);
        }
    }

    download(exportData, filename = null) {
        if (!filename) {
            filename = ExportUtils.generateFilename(
                exportData.type === 'playlist' ? 'playlist' : 'music-library',
                'json'
            );
            filename = filename.replace('.json', '.txt');
        }

        const jsonString = JSON.stringify(exportData, null, 2);
        ExportUtils.downloadFile(jsonString, filename);
        
        return {
            filename,
            songCount: exportData.data.length || exportData.data.songs?.length || 0,
            format: 'json'
        };
    }
}

window.Exporter = Exporter;