// js/modals/index.js
// Main ModalHandler that orchestrates all modal modules

class ModalHandler {
    constructor() {
        // Initialize all modal modules
        this.addSong = new AddSongModal();
        this.editSong = new EditSongModal();
        this.deleteSong = new DeleteSongModal();
        this.createPlaylist = new CreatePlaylistModal();
        this.addToPlaylist = new AddToPlaylistModal();
        
        // Set up global event listeners for table buttons
        this.setupTableButtonListeners();
    }

    setupTableButtonListeners() {
        // Use event delegation for dynamic table content
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            // Edit button
            if (target.classList.contains('edit-btn')) {
                const songId = parseInt(target.dataset.songId);
                if (!isNaN(songId)) {
                    this.showEditModal(songId);
                }
            }
            
            // Delete button
            if (target.classList.contains('delete-btn')) {
                const songId = parseInt(target.dataset.songId);
                if (!isNaN(songId)) {
                    this.showDeleteModal(songId);
                }
            }
            
            // Add to playlist button
            if (target.classList.contains('playlist-btn')) {
                const songId = parseInt(target.dataset.songId);
                if (!isNaN(songId)) {
                    this.showAddToPlaylistModal(songId);
                }
            }
        });
    }

    // Public methods that delegate to specific modals
    showAddSongModal() {
        this.addSong.show();
    }

    showEditModal(songId) {
        this.editSong.show(songId);
    }

    showDeleteModal(songId) {
        this.deleteSong.show(songId);
    }

    showCreatePlaylistModal() {
        this.createPlaylist.show();
    }

    showAddToPlaylistModal(songId) {
        this.addToPlaylist.show(songId);
    }

    // Initialize all modals (kept for backward compatibility)
    initAllModals() {
        // Modals are already initialized in constructor
        // This method exists for compatibility
        console.log('✅ All modals initialized');
    }
}

// Create global instance
const modalHandler = new ModalHandler();
window.modalHandler = modalHandler;