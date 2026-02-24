// database/MusicDB.js
// All music-related operations

class MusicDB {
    constructor(db) {
        this.db = db;
    }

    async add(musicData) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['music'], 'readwrite');
                const store = transaction.objectStore('music');
                
                const musicWithMeta = {
                    ...musicData,
                    title: musicData.title.trim(),
                    artist: musicData.artist?.trim() || 'Unknown Artist',
                    album: musicData.album?.trim() || 'Unknown Album',
                    duration: musicData.duration || '0:00',
                    src: musicData.src || '',
                    image: musicData.image || 'img/default-album.jpg',
                    synced_lyrics: musicData.synced_lyrics || null,
                    lrc_content: musicData.lrc_content || null,
                    year: musicData.year || new Date().getFullYear(),
                    addedDate: musicData.addedDate || new Date().toISOString()
                };
                
                const request = store.add(musicWithMeta);

                request.onsuccess = () => {
                    resolve({ ...musicWithMeta, id: request.result });
                };

                request.onerror = (event) => {
                    console.error('❌ Error adding song:', event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error('❌ Error in add method:', error);
                reject(error);
            }
        });
    }

    async getById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readonly');
            const store = transaction.objectStore('music');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async getAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readonly');
            const store = transaction.objectStore('music');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async search(query, searchIn = 'all') {
        const allMusic = await this.getAll();
        const queryLower = query.toLowerCase();
        
        return allMusic.filter(song => {
            if (!query) return true;
            
            if (searchIn === 'all' || searchIn === 'title') {
                if (song.title.toLowerCase().includes(queryLower)) return true;
            }
            if (searchIn === 'all' || searchIn === 'artist') {
                if (song.artist.toLowerCase().includes(queryLower)) return true;
            }
            if (searchIn === 'all' || searchIn === 'album') {
                if (song.album.toLowerCase().includes(queryLower)) return true;
            }
            return false;
        });
    }

    async update(id, musicData) {
        // ✅ Validate ID first!
        if (id === undefined || id === null) {
            return Promise.reject(new Error('Song ID is required for update'));
        }
        
        // Convert to number
        const numId = Number(id);
        if (isNaN(numId)) {
            return Promise.reject(new Error(`Invalid song ID: ${id}`));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readwrite');
            const store = transaction.objectStore('music');
            
            const getRequest = store.get(numId);
            
            getRequest.onsuccess = () => {
                const existingSong = getRequest.result;
                if (!existingSong) {
                    reject(new Error(`Song with ID ${numId} not found`));
                    return;
                }
                
                // Create updated song
                const updatedSong = {
                    ...existingSong,
                    ...musicData,
                    id: numId,
                    // Preserve lrc_content if not overwritten
                    lrc_content: musicData.lrc_content !== undefined ? 
                        musicData.lrc_content : existingSong.lrc_content
                };
                
                const updateRequest = store.put(updatedSong);
                
                updateRequest.onsuccess = () => {
                    resolve(updatedSong);
                };
                
                updateRequest.onerror = (event) => {
                    console.error('❌ Update failed:', event.target.error);
                    reject(event.target.error);
                };
            };
            
            getRequest.onerror = (event) => {
                console.error('❌ Get failed:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async delete(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readwrite');
            const store = transaction.objectStore('music');
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['music'], 'readwrite');
            const store = transaction.objectStore('music');
            const request = store.clear();
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getCount() {
        const music = await this.getAll();
        return music.length;
    }
}

// Make globally available
window.MusicDB = MusicDB;