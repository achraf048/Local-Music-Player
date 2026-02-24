// js/library/player/player-connector.js
// Handles communication with the player window

class PlayerConnector {
    constructor() {
        this.playerWindow = null;
        this.playerReady = false;
        this.pendingPlaylist = null;
        this.appOrigin = window.location.origin;
        
        this.setupMessageListener();
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.origin !== this.appOrigin) return;
            
            if (event.data.type === 'playerReady') {
                console.log('✅ Player window ready');
                this.playerReady = true;
                if (this.pendingPlaylist) {
                    this.sendPlaylist(this.pendingPlaylist.songIds, this.pendingPlaylist.currentIndex);
                    this.pendingPlaylist = null;
                }
            }
            
            if (event.data.type === 'playerClosed') {
                console.log('📪 Player window closed');
                this.playerWindow = null;
                this.playerReady = false;
            }
        });
    }

    async playSong(songId, songIds, songIndex) {
        console.log('🎵 Playing song:', songId, 'at index:', songIndex);
        
        if (!this.playerWindow || this.playerWindow.closed) {
            await this.openNewWindow(songId, songIds, songIndex);
        } else {
            this.updateExistingWindow(songId, songIds, songIndex);
        }
    }

    async playPlaylist(songIds, firstSongId) {
        console.log('🎵 Playing playlist with', songIds.length, 'songs');
        
        if (!this.playerWindow || this.playerWindow.closed) {
            await this.openNewWindow(firstSongId, songIds, 0);
        } else {
            this.updateExistingWindowWithPlaylist(songIds);
        }
    }

    async openNewWindow(songId, songIds, songIndex) {
        console.log('🆕 Opening new player window');
        
        this.playerWindow = window.open(
            `player.html?id=${songId}`,
            'musicPlayer',
            'width=800,height=700,left=100,top=100'
        );
        
        this.pendingPlaylist = { songIds, currentIndex: songIndex };
        this.playerReady = false;
        
        // Wait for player to be ready
        return new Promise(resolve => {
            const checkReady = () => {
                if (this.playerReady) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            setTimeout(checkReady, 500);
        });
    }

    updateExistingWindow(songId, songIds, songIndex) {
        console.log('🔄 Updating existing player window');
        this.playerWindow.focus();
        this.playerWindow.postMessage({
            type: 'playSong',
            songId,
            playlist: songIds,
            currentIndex: songIndex
        }, this.appOrigin);
    }

    updateExistingWindowWithPlaylist(songIds) {
        console.log('🔄 Sending playlist to existing player');
        this.playerWindow.focus();
        this.playerWindow.postMessage({
            type: 'setPlaylist',
            songIds,
            currentIndex: 0,
            playNow: true
        }, this.appOrigin);
    }

    sendPlaylist(songIds, currentIndex = 0) {
        if (this.playerWindow && !this.playerWindow.closed) {
            this.playerWindow.postMessage({
                type: 'setPlaylist',
                songIds,
                currentIndex,
                playNow: true
            }, this.appOrigin);
        }
    }

    close() {
        this.playerWindow?.close();
        this.playerWindow = null;
        this.playerReady = false;
    }
}

window.PlayerConnector = PlayerConnector;