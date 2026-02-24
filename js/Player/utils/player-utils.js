// js/player/utils/player-utils.js
// Helper functions and utilities for the player

const PlayerUtils = {
    // Database helpers
    async waitForDatabase() {
        if (window.database?.db) return;
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.database?.db) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    },

    // Settings helpers
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
    },

    getValidVolume(volume) {
        const numVolume = Number(volume);
        return isNaN(numVolume) ? 70 : Math.max(0, Math.min(100, numVolume));
    },

    // UI helpers
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Array helpers
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // URL helpers
    getSongIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id'));
    },

    updateUrl(songId) {
        window.history.replaceState({}, '', `player.html?id=${songId}`);
    }
};

// Make available globally
window.PlayerUtils = PlayerUtils;