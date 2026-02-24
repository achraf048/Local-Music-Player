// database/SettingsDB.js
// Player settings operations

class SettingsDB {
    constructor(db) {
        this.db = db;
    }

    async getSettings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('player_settings');
            
            request.onsuccess = () => {
                resolve(request.result || this.getDefaultSettings());
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async updateSettings(settings) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            
            const updatedSettings = {
                ...settings,
                id: 'player_settings'
            };
            
            const request = store.put(updatedSettings);
            
            request.onsuccess = () => {
                // Resolve after the transaction completes
                transaction.oncomplete = () => resolve(updatedSettings);
            };
            
            request.onerror = (event) => reject(event.target.error);
            transaction.onerror = (event) => reject(event.target.error);
        });
    }

    async updatePlayerState(currentPlaylist = [], currentSongIndex = 0) {
        // Get current settings first
        const currentSettings = await this.getSettings();
        
        return this.updateSettings({
            ...currentSettings,
            currentPlaylist: currentPlaylist,
            currentSongIndex: currentSongIndex,
            lastPlayed: new Date().toISOString()
        });
    }

    async updateVolume(volume) {
        const settings = await this.getSettings();
        return this.updateSettings({ 
            ...settings, 
            volume: Math.max(0, Math.min(100, volume)) 
        });
    }

    async toggleShuffle() {
        const settings = await this.getSettings();
        return this.updateSettings({ 
            ...settings, 
            shuffle: !settings.shuffle 
        });
    }

    async toggleRepeat() {
        const settings = await this.getSettings();
        return this.updateSettings({ 
            ...settings, 
            repeat: !settings.repeat 
        });
    }

    getDefaultSettings() {
        return {
            id: 'player_settings',
            shuffle: false,
            repeat: false,
            volume: 70,
            currentPlaylist: [],
            currentSongIndex: 0,
            lastPlayed: null
        };
    }
}

// Make globally available
window.SettingsDB = SettingsDB;