// js/player/lyrics/modal-manager.js
// Handles the lyrics modal

class ModalManager {
    constructor() {
        this.modal = document.getElementById('lyricsModal');
        this.modalLyricsContainer = document.getElementById('modalLyricsContainer');
        this.modalSongTitle = document.getElementById('modalSongTitle');
        this.modalSongArtist = document.getElementById('modalSongArtist');
        
        this.lyricsManager = null;
        this.currentSongId = null;
    }

    init(lyricsManager) {
        this.lyricsManager = lyricsManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.modal) return;
        
        const closeBtn = document.getElementById('closeLyricsModal');
        closeBtn?.addEventListener('click', () => this.close());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.modal?.classList.contains('show')) {
                this.close();
            }
        });
    }

    open(songTitle, songArtist, songId) {
        if (!songId) {
            database.utility?.showToast('No song loaded', 'warning');
            return;
        }
        
        this.currentSongId = songId;
        this.modalSongTitle.textContent = songTitle;
        this.modalSongArtist.textContent = songArtist;
        
        // Clone lyrics to modal
        this.cloneLyricsToModal();
        
        // Show modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Sync with highlighter
        if (this.lyricsManager) {
            this.lyricsManager.setModalContainer(this.modalLyricsContainer);
            this.lyricsManager.syncModal(this.modalLyricsContainer);
        }
    }

    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Clear modal reference from highlighter
        if (this.lyricsManager) {
            this.lyricsManager.setModalContainer(null);
        }
        
        setTimeout(() => {
            if (this.modalLyricsContainer) {
                this.modalLyricsContainer.innerHTML = '';
            }
        }, 300);
    }

    cloneLyricsToModal() {
        const mainLyrics = document.querySelectorAll('#lyrics .lyric-line');
        
        if (!mainLyrics?.length) {
            this.modalLyricsContainer.innerHTML = '<div class="no-lyrics">🎵 No lyrics available</div>';
            return;
        }
        
        // Simple clone without complex logic
        let html = '';
        mainLyrics.forEach((line, index) => {
            const className = line.className;
            const time = line.dataset.time;
            
            if (line.classList.contains('enhanced')) {
                const words = line.querySelectorAll('.word');
                let wordsHtml = '';
                words.forEach(word => {
                    wordsHtml += `<span class="${word.className}" 
                        data-line="${word.dataset.line}"
                        data-word="${word.dataset.word}"
                        data-start="${word.dataset.start}"
                        data-end="${word.dataset.end}">${word.textContent}</span> `;
                });
                html += `<div class="${className}" data-time="${time}" data-index="${index}">${wordsHtml}</div>`;
            } else {
                html += `<div class="${className}" data-time="${time}" data-index="${index}">${line.textContent}</div>`;
            }
        });
        
        this.modalLyricsContainer.innerHTML = html;
    }

    // Called from audio timeupdate
    syncHighlight() {
        // Handled by highlighter via syncModal
    }
}

window.ModalManager = ModalManager;