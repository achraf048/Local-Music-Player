// database/PlaylistSongDB.js
// Playlist-song relationship operations

class PlaylistSongDB {
    constructor(db) {
        this.db = db;
    }

    async addSongToPlaylist(songId, playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlistSongs'], 'readwrite');
            const store = transaction.objectStore('playlistSongs');
            
            const index = store.index('playlistId');
            const checkRequest = index.getAll(playlistId);
            
            checkRequest.onsuccess = (event) => {
                const existingLinks = event.target.result || [];
                const alreadyLinked = existingLinks.some(link => link.songId === songId);
                
                if (alreadyLinked) {
                    reject('Song is already in this playlist');
                    return;
                }
                
                const playlistSong = {
                    playlistId: playlistId,
                    songId: songId,
                    addedDate: new Date().toISOString(),
                    position: existingLinks.length // Add to end
                };
                
                const addRequest = store.add(playlistSong);
                
                addRequest.onsuccess = () => {
                    resolve({ ...playlistSong, id: addRequest.result });
                };
                
                addRequest.onerror = (event) => reject(event.target.error);
            };
            
            checkRequest.onerror = (event) => reject(event.target.error);
        });
    }

    async removeSongFromPlaylist(songId, playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlistSongs'], 'readwrite');
            const store = transaction.objectStore('playlistSongs');
            
            const index = store.index('playlistId');
            const request = index.getAll(playlistId);
            
            request.onsuccess = (event) => {
                const links = event.target.result || [];
                const linkToDelete = links.find(link => link.songId === songId);
                
                if (!linkToDelete) {
                    reject('Song not found in playlist');
                    return;
                }
                
                const deleteRequest = store.delete(linkToDelete.id);
                
                deleteRequest.onsuccess = () => resolve(true);
                deleteRequest.onerror = (event) => reject(event.target.error);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getPlaylistSongIds(playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlistSongs'], 'readonly');
            const store = transaction.objectStore('playlistSongs');
            
            const index = store.index('playlistId');
            const request = index.getAll(playlistId);
            
            request.onsuccess = (event) => {
                const links = event.target.result || [];
                const songIds = links.map(link => link.songId);
                resolve(songIds);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getPlaylistSongs(playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlistSongs', 'music'], 'readonly');
            const playlistSongsStore = transaction.objectStore('playlistSongs');
            const musicStore = transaction.objectStore('music');
            
            const index = playlistSongsStore.index('playlistId');
            const request = index.getAll(playlistId);
            
            request.onsuccess = async (event) => {
                const playlistSongLinks = event.target.result || [];
                const songs = [];
                
                for (const link of playlistSongLinks) {
                    const songRequest = musicStore.get(link.songId);
                    
                    const song = await new Promise(resolve => {
                        songRequest.onsuccess = (e) => resolve(e.target.result);
                        songRequest.onerror = () => resolve(null);
                    });
                    
                    if (song) {
                        songs.push({
                            ...song,
                            position: link.position,
                            addedToPlaylistDate: link.addedDate
                        });
                    }
                }
                
                // Sort by position
                songs.sort((a, b) => a.position - b.position);
                resolve(songs);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async clearPlaylist(playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlistSongs'], 'readwrite');
            const store = transaction.objectStore('playlistSongs');
            
            const index = store.index('playlistId');
            const request = index.getAll(playlistId);
            
            request.onsuccess = (event) => {
                event.target.result.forEach(link => {
                    store.delete(link.id);
                });
                resolve(true);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async reorderPlaylist(playlistId, newOrder) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlistSongs'], 'readwrite');
            const store = transaction.objectStore('playlistSongs');
            
            const index = store.index('playlistId');
            const request = index.getAll(playlistId);
            
            request.onsuccess = (event) => {
                const links = event.target.result || [];
                
                // Update positions
                links.forEach(link => {
                    const newPosition = newOrder.indexOf(link.songId);
                    if (newPosition !== -1) {
                        const updatedLink = {
                            ...link,
                            position: newPosition
                        };
                        store.put(updatedLink);
                    }
                });
                
                resolve(true);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }
}

// Make globally available
window.PlaylistSongDB = PlaylistSongDB;