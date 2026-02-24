// js/export-import/core/importer.js
// Handles data import from JSON

class Importer {
    constructor() {
        this.version = '1.0';
    }

    async importMusicData(file) {
        try {
            console.log('Starting import of file:', file.name);
            
            // Read file
            const content = await ExportUtils.readFileAsText(file);
            console.log('File content length:', content.length);
            
            let importData;
            try {
                importData = JSON.parse(content);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid JSON file: ' + parseError.message);
            }

            // Normalize the data format
            importData = ExportUtils.normalizeImportData(importData);
            
            // Validate structure
            try {
                ExportUtils.validateMusicData(importData);
            } catch (validationError) {
                console.error('❌ Validation error:', validationError);
                throw validationError;
            }

            // Get the songs array (handles both formats)
            let songsArray = [];
            if (Array.isArray(importData)) {
                songsArray = importData;
            } else if (importData.data && Array.isArray(importData.data)) {
                songsArray = importData.data;
            } else if (importData.music && Array.isArray(importData.music)) {
                songsArray = importData.music;
            }

            // Import songs
            let importedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;
            let lyricsImported = 0;
            
            for (const songData of songsArray) {
                try {
                    // Ensure required fields
                    if (!songData.title || !songData.artist || !songData.src) {
                        console.warn('⚠️ Skipping song with missing required fields:', {
                            title: songData.title,
                            artist: songData.artist,
                            src: songData.src
                        });
                        skippedCount++;
                        continue;
                    }

                    // Check if song already exists
                    const existing = await this.findExistingSong(songData);
                    
                    if (!existing) {
                        // Get the next ID for file path generation
                        const nextId = await this.getNextSongId();
                        
                        // Try to load LRC content if synced_lyrics path exists in import
                        let lrcContent = songData.lrc_content || null;
                        
                        // If there's a path but no content, try to load it
                        if (!lrcContent && songData.synced_lyrics) {
                            try {
                                // Attempt to load from the path (relative to import file maybe)
                                lrcContent = await this.loadLRCFromPath(songData.synced_lyrics);
                                if (lrcContent) {
                                    lyricsImported++;
                                    console.log(`📝 Loaded LRC for: ${songData.title}`);
                                }
                            } catch (e) {
                                console.warn(`Could not load LRC for ${songData.title}:`, e);
                            }
                        } else if (lrcContent) {
                            lyricsImported++;
                        }
                        
                        // Add new song with generated file paths
                        const newSong = {
                            title: songData.title,
                            artist: songData.artist,
                            album: songData.album || 'Unknown Album',
                            year: songData.year || new Date().getFullYear(),
                            src: songData.src || `music/music-${nextId}.opus`,
                            image: songData.image || `images/cover-${nextId}.jpg`,
                            synced_lyrics: songData.synced_lyrics || `lyrics/lyrics-${nextId}.lrc`,
                            lrc_content: lrcContent, // Store the actual content
                            addedDate: songData.addedDate || new Date().toISOString()
                        };
                        
                        await database.music.add(newSong);
                        importedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (songError) {
                    console.warn('❌ Failed to import song:', songData.title, songError);
                    errorCount++;
                }
            }

            console.log(`📊 Import complete: ${importedCount} imported, ${skippedCount} skipped, ${errorCount} errors, ${lyricsImported} with lyrics`);

            return {
                count: importedCount,
                skipped: skippedCount,
                errors: errorCount,
                lyricsImported: lyricsImported,
                total: songsArray.length,
                filename: file.name
            };

        } catch (error) {
            console.error('❌ Import error:', error);
            throw new Error('Failed to import: ' + error.message);
        }
    }

    async loadLRCFromPath(path) {
        return new Promise((resolve) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', path, true);
                xhr.overrideMimeType('text/plain');
                
                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.responseText);
                    } else {
                        resolve(null);
                    }
                };
                
                xhr.onerror = () => resolve(null);
                xhr.send();
            } catch {
                resolve(null);
            }
        });
    }

    async getNextSongId() {
        try {
            const allSongs = await database.music.getAll();
            if (allSongs.length === 0) return 1;
            
            // Get the highest ID and add 1
            const maxId = Math.max(...allSongs.map(song => song.id || 0));
            return maxId + 1;
        } catch (error) {
            console.error('Error getting next song ID:', error);
            return Date.now();
        }
    }

    async findExistingSong(songData) {
        try {
            const allSongs = await database.music.getAll();
            
            return allSongs.find(s => 
                s.title.toLowerCase().trim() === songData.title.toLowerCase().trim() &&
                s.artist.toLowerCase().trim() === (songData.artist || '').toLowerCase().trim() &&
                s.album.toLowerCase().trim() === (songData.album || 'Unknown Album').toLowerCase().trim()
            );
        } catch (error) {
            console.warn('Error finding existing song:', error);
            return null;
        }
    }

    async importPlaylist(file) {
            try {
                // Read file
                const content = await ExportUtils.readFileAsText(file);
                const importData = JSON.parse(content);

                // Validate structure
                ExportUtils.validatePlaylistData(importData);

                const { playlist, songs } = importData.data || importData;

                // Create new playlist
                const newPlaylist = await database.playlists.add({
                    name: playlist.name + ' (Imported)',
                    description: playlist.description || `Imported from ${file.name}`,
                    created: new Date().toISOString()
                });

                // Import songs
                let importedSongs = 0;
                for (const songData of songs) {
                    try {
                        // Check if song exists
                        let song = await this.findExistingSong(songData);
                        
                        // If not, add it
                        if (!song) {
                            song = await database.music.add({
                                title: songData.title,
                                artist: songData.artist,
                                album: songData.album || 'Unknown Album',
                                year: songData.year || new Date().getFullYear(),
                                src: songData.src,
                                image: songData.image || 'images/default-album.jpg',
                                synced_lyrics: songData.synced_lyrics
                            });
                        }

                        // Add to playlist
                        await database.playlistSongs.addSongToPlaylist(song.id, newPlaylist.id);
                        importedSongs++;
                        
                    } catch (songError) {
                        console.warn('Failed to import song:', songData.title, songError);
                    }
                }

                return {
                    playlistId: newPlaylist.id,
                    playlistName: newPlaylist.name,
                    songsImported: importedSongs,
                    totalSongs: songs.length,
                    filename: file.name
                };

            } catch (error) {
                console.error('Playlist import error:', error);
                throw new Error('Failed to import playlist: ' + error.message);
            }
    }
}

window.Importer = Importer;