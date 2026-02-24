// database/MusicExportDB.js
// Export and import operations for Music Player

class MusicExportDB {
    constructor(db, database) {
        this.db = db;
        this.database = database;
    }

    async importMusicData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (!data.music || !Array.isArray(data.music)) {
                        throw new Error('Invalid music file format');
                    }
                    
                    let importedCount = 0;
                    for (const song of data.music) {
                        try {
                            if (song.title && song.src) {
                                await this.database.music.add(song);
                                importedCount++;
                            }
                        } catch (error) {
                            console.warn('Failed to import song:', song.title, error);
                        }
                    }
                    
                    resolve({ success: true, count: importedCount });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }

    async exportMusicAsJSON(music = null) {
        const musicList = music || await this.database.music.getAll();

        const exportData = {
            version: 2,
            exportDate: new Date().toISOString(),
            totalSongs: normalizedMusicList.length,
            appName: 'Local Music Player',
            music: musicList
        };
        
        return {
            data: JSON.stringify(exportData, null, 2),
            filename: `music-library-${new Date().toISOString().split('T')[0]}.json.txt`,
            type: 'application/json'
        };
    }

    async exportPlaylistAsJSON(playlistId) {
        const playlist = await this.database.playlists.getById(playlistId);
        const songs = await this.database.playlistSongs.getPlaylistSongs(playlistId);
        
        const exportData = {
            version: 2,
            exportDate: new Date().toISOString(),
            playlist: playlist.name,
            description: playlist.description,
            totalSongs: songs.length,
            songs: songs.map(song => ({
                title: song.title,
                artist: song.artist,
                album: song.album,
                year: song.year,
                duration: song.duration,
                src: song.src,
                image: song.image,
                synced_lyrics: song.synced_lyrics || null
            }))
        };
        
        return {
            data: JSON.stringify(exportData, null, 2),
            filename: `playlist-${playlist.name}-${new Date().toISOString().split('T')[0]}.json.txt`,
            type: 'application/json'
        };
    }

    async exportData(format = 'json', options = {}) {
        let exportResult;
        
        if (options.playlistId) {
            exportResult = await this.exportPlaylistAsJSON(options.playlistId);
        } else {
            exportResult = await this.exportMusicAsJSON(options.music);
        }
        
        // Download the file
        this.database.utility.downloadFile(exportResult.data, exportResult.filename, exportResult.type);
        
        return {
            format: format,
            filename: exportResult.filename,
            songCount: options.playlistId ? 
                (await this.database.playlistSongs.getPlaylistSongs(options.playlistId)).length :
                (await this.database.music.getCount())
        };
    }
}

// Make globally available
window.MusicExportDB = MusicExportDB;