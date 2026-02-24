// database/PlaylistDB.js
// All playlist-related operations

class PlaylistDB {
    constructor(db) {
        this.db = db;
    }

    async add(playlistData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readwrite');
            const store = transaction.objectStore('playlists');
            
            const playlist = {
                name: playlistData.name.trim(),
                description: playlistData.description?.trim() || '',
                coverImage: playlistData.coverImage || 'img/default-playlist.jpg',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                songIds: [] // Will be managed by playlistSongs
            };
            
            const request = store.add(playlist);
            
            request.onsuccess = () => {
                resolve({ ...playlist, id: request.result });
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async update(playlistId, playlistData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readwrite');
            const store = transaction.objectStore('playlists');
            
            const getRequest = store.get(playlistId);
            
            getRequest.onsuccess = () => {
                const existingPlaylist = getRequest.result;
                if (!existingPlaylist) {
                    reject('Playlist not found');
                    return;
                }
                
                const updatedPlaylist = {
                    ...existingPlaylist,
                    ...playlistData,
                    updated: new Date().toISOString()
                };
                
                const updateRequest = store.put(updatedPlaylist);
                
                updateRequest.onsuccess = () => resolve(updatedPlaylist);
                updateRequest.onerror = (event) => reject(event.target.error);
            };
            
            getRequest.onerror = (event) => reject(event.target.error);
        });
    }

    async delete(playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readwrite');
            const store = transaction.objectStore('playlists');
            
            const request = store.delete(playlistId);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readonly');
            const store = transaction.objectStore('playlists');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getCount() {
        const playlists = await this.getAll();
        return playlists.length;
    }

    async getById(playlistId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['playlists'], 'readonly');
            const store = transaction.objectStore('playlists');
            const request = store.get(playlistId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getByName(name) {
        const playlists = await this.getAll();
        return playlists.find(playlist => 
            playlist.name.toLowerCase() === name.toLowerCase()
        );
    }

    async getPlaylistWithSongs(playlistId) {
        const playlist = await this.getById(playlistId);
        if (!playlist) return null;
        
        // Get songs from playlistSongs
        const songIds = await database.playlistSongs.getPlaylistSongIds(playlistId);
        const songs = await database.music.getByIds(songIds);
        
        return {
            ...playlist,
            songs: songs,
            songCount: songs.length
        };
    }
}

// Make globally available
window.PlaylistDB = PlaylistDB;