// js/modals/song/add-song-modal.js
// Enhanced Add song modal with better lyrics file management

class AddSongModal extends BaseModal {
    constructor() {
        super();
        this.setupTrigger();
        this.lyricsFile = null;
    }

    setupTrigger() {
        const addSongBtn = document.getElementById('addSongBtn');
        if (addSongBtn) {
            addSongBtn.addEventListener('click', () => this.show());
        }
    }

    show() {
        // Reset lyrics file
        this.lyricsFile = null;

        this.swal.fire({
            title: '<i class="fas fa-plus-circle"></i> Add New Song',
            html: this.getFormHTML(),
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save"></i> Add Song',
            cancelButtonText: '<i class="fas fa-times"></i> Cancel',
            showLoaderOnConfirm: true,
            didOpen: () => this.setupLyricsHandler(),
            preConfirm: () => this.validateForm(),
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.handleSubmit(result.value);
            }
        });
    }

    getFormHTML() {
        return `
            <div class="sweet-form">
                <!-- Basic Info Section -->
                <div class="form-group">
                    <label for="swal-title"><i class="fas fa-music"></i> Song Title *</label>
                    <input type="text" id="swal-title" class="swal-input" placeholder="Enter song title" autocomplete="off">
                </div>
                
                <div class="form-group">
                    <label for="swal-artist"><i class="fas fa-user"></i> Artist *</label>
                    <input type="text" id="swal-artist" class="swal-input" placeholder="Enter artist name" autocomplete="off">
                </div>
                
                <div class="form-row">
                    <div class="form-group half">
                        <label for="swal-album"><i class="fas fa-compact-disc"></i> Album</label>
                        <input type="text" id="swal-album" class="swal-input" placeholder="Album name">
                    </div>
                    <div class="form-group half">
                        <label for="swal-year"><i class="fas fa-calendar"></i> Year</label>
                        <input type="number" id="swal-year" class="swal-input" placeholder="Year" value="${new Date().getFullYear()}" min="1900" max="${new Date().getFullYear() + 1}">
                    </div>
                </div>

                <!-- Lyrics File Upload Section -->
                <div class="file-upload-section">
                    <h4 class="section-title">
                        <i class="fas fa-file-alt"></i> Lyrics File (Optional)
                    </h4>
                    
                    <!-- File Drop Area -->
                    <div class="file-drop-area" id="lyrics-drop-area">
                        <input type="file" id="swal-lyrics-file" class="file-input" accept=".lrc,.txt,text/plain,.lrc.txt" hidden>
                        
                        <!-- Default Message -->
                        <div class="file-drop-message" id="lyrics-drop-message">
                            <i class="fas fa-file-code"></i>
                            <div class="message-content">
                                <p>Drag & drop LRC file here or <span class="browse-link">browse</span></p>
                                <small>Supported: .lrc, .txt (Max 1MB)</small>
                            </div>
                        </div>
                        
                        <!-- File Preview -->
                        <div class="file-preview" id="lyrics-preview" style="display: none;">
                            <div class="preview-header">
                                <div class="file-info">
                                    <i class="fas fa-check-circle"></i>
                                    <span class="file-name"></span>
                                    <span class="file-size"></span>
                                </div>
                                <button type="button" class="file-remove-btn" id="remove-lyrics-btn" title="Remove lyrics file">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <!-- Lyrics Preview Content -->
                            <div class="preview-content">
                                <div class="preview-stats">
                                    <span><i class="fas fa-eye"></i> Preview (first 3 lines)</span>
                                    <span class="line-count"></span>
                                </div>
                                <div class="preview-lines" id="lyrics-preview-lines">
                                    <!-- Preview lines will be inserted here -->
                                </div>
                                <div class="sync-status" id="sync-status">
                                    <i class="fas fa-clock"></i>
                                    <span>Checking synchronization...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupLyricsHandler() {
        const dropArea = document.getElementById('lyrics-drop-area');
        const fileInput = document.getElementById('swal-lyrics-file');
        const removeBtn = document.getElementById('remove-lyrics-btn');

        if (!dropArea || !fileInput) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight drop area on drag
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('highlight');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('highlight');
            });
        });

        // Handle dropped files
        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) {
                this.handleLyricsFile(files[0], fileInput);
            }
        });

        // Handle browse click
        dropArea.addEventListener('click', (e) => {
            // Don't trigger if clicking remove button
            if (e.target.closest('.file-remove-btn')) return;
            fileInput.click();
        });

        // Handle file selection via input
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleLyricsFile(e.target.files[0], fileInput);
            }
        });

        // Handle remove button
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeLyricsFile(fileInput);
            });
        }
    }

    async handleLyricsFile(file, fileInput) {
        // Validate file type
        const validTypes = ['.lrc', '.txt', 'text/plain'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExt) && !file.type.match('text/plain')) {
            this.showFileError('Invalid file type. Please select an LRC or TXT file.');
            return;
        }

        // Validate file size (1MB max)
        const maxSize = 1 * 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            this.showFileError('File too large. Maximum size: 1MB');
            return;
        }

        // Read file content for preview
        try {
            const content = await this.readFileAsText(file);
            
            // Store the file
            this.lyricsFile = file;
            
            // Update file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            // Update UI
            this.updateLyricsPreview(file, content);
            
            // Add has-file class to drop area
            const dropArea = document.getElementById('lyrics-drop-area');
            if (dropArea) {
                dropArea.classList.add('has-file');
            }

        } catch (error) {
            console.error('Error reading file:', error);
            this.showFileError('Error reading file. Please try again.');
        }
    }

    updateLyricsPreview(file, content) {
        const dropMessage = document.getElementById('lyrics-drop-message');
        const preview = document.getElementById('lyrics-preview');
        const fileName = preview.querySelector('.file-name');
        const fileSize = preview.querySelector('.file-size');
        const lineCount = preview.querySelector('.line-count');
        const previewLines = document.getElementById('lyrics-preview-lines');
        const syncStatus = document.getElementById('sync-status');

        if (!preview || !dropMessage) return;

        // Hide drop message, show preview
        dropMessage.style.display = 'none';
        preview.style.display = 'block';

        // Set file info
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);

        // Split content into lines
        const lines = content.split('\n').filter(line => line.trim());
        
        // Count lines
        if (lineCount) {
            lineCount.textContent = `${lines.length} line${lines.length !== 1 ? 's' : ''}`;
        }

        // Show first 3 lines preview
        if (previewLines) {
            const previewLinesContent = lines.slice(0, 3).map(line => {
                // Check if line has timestamp (LRC format)
                const hasTimestamp = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(line) || /\[\d{2}:\d{2}\]/.test(line);
                const lineClass = hasTimestamp ? 'lrc-line' : 'text-line';
                
                // Escape HTML and highlight timestamp
                let displayLine = this.escapeHtml(line);
                if (hasTimestamp) {
                    displayLine = displayLine.replace(
                        /(\[\d{2}:\d{2}\.\d{2,3}\]|\[\d{2}:\d{2}\])/g, 
                        '<span class="timestamp">$1</span>'
                    );
                }
                
                return `<div class="preview-line ${lineClass}">${displayLine || '&nbsp;'}</div>`;
            }).join('');

            if (lines.length === 0) {
                previewLines.innerHTML = '<div class="preview-line empty">Empty file</div>';
            } else {
                previewLines.innerHTML = previewLinesContent;
                if (lines.length > 3) {
                    previewLines.innerHTML += '<div class="preview-line more">...</div>';
                }
            }
        }

        // Detect sync type and update status
        if (syncStatus) {
            const hasSync = lines.some(line => /\[\d{2}:\d{2}\.\d{2,3}\]/.test(line));
            const hasBasicSync = lines.some(line => /\[\d{2}:\d{2}\]/.test(line));
            
            syncStatus.classList.remove('has-sync', 'has-basic-sync', 'has-text');
            
            if (hasSync) {
                syncStatus.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Synchronized lyrics (enhanced)</span>
                `;
                syncStatus.classList.add('has-sync');
            } else if (hasBasicSync) {
                syncStatus.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span>Synchronized lyrics (basic)</span>
                `;
                syncStatus.classList.add('has-basic-sync');
            } else {
                syncStatus.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    <span>Plain text lyrics</span>
                `;
                syncStatus.classList.add('has-text');
            }
        }
    }

    removeLyricsFile(fileInput) {
        this.lyricsFile = null;
        fileInput.value = '';

        const dropMessage = document.getElementById('lyrics-drop-message');
        const preview = document.getElementById('lyrics-preview');
        const dropArea = document.getElementById('lyrics-drop-area');

        if (dropMessage) {
            dropMessage.style.display = 'flex';
        }
        if (preview) {
            preview.style.display = 'none';
        }
        if (dropArea) {
            dropArea.classList.remove('has-file', 'highlight');
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showFileError(message) {
        this.swal.fire({
            icon: 'error',
            title: 'Invalid File',
            text: message,
            timer: 3000,
            showConfirmButton: false
        });
    }

    validateForm() {
        const title = document.getElementById('swal-title').value.trim();
        const artist = document.getElementById('swal-artist').value.trim();

        if (!this.validateRequired(title, 'Song title')) return false;
        if (!this.validateRequired(artist, 'Artist name')) return false;

        return {
            title,
            artist,
            album: document.getElementById('swal-album').value.trim() || 'Unknown Album',
            year: parseInt(document.getElementById('swal-year').value) || new Date().getFullYear(),
            lyricsFile: this.lyricsFile
        };
    }

    async handleSubmit(songData) {
        try {
            ModalUtils.showLoading();
            
            // Get next available ID
            const nextId = await this.getNextSongId();
            
            // Read LRC file if provided
            let lrcContent = null;
            if (songData.lyricsFile) {
                lrcContent = await this.readFileAsText(songData.lyricsFile);
                console.log(`📝 Read LRC file: ${songData.lyricsFile.name} (${lrcContent.length} bytes)`);
            }

            // Add file paths based on next ID
            const songWithPaths = {
                title: songData.title,
                artist: songData.artist,
                album: songData.album,
                year: songData.year,
                src: `music/music-${nextId}.opus`,
                image: `images/cover-${nextId}.jpg`,
                synced_lyrics: songData.lyricsFile ? `lyrics/lyrics-${nextId}.lrc` : null,
                lrc_content: lrcContent,
                addedDate: new Date().toISOString()
            };
            
            const savedSong = await database.music.add(songWithPaths);
            
            ModalUtils.closeLoading();
            
            ModalUtils.showSuccess(
                'Success!',
                this.getSuccessHTML(savedSong, !!lrcContent),
                () => {
                    if (window.libraryManager) libraryManager.refreshTable();
                }
            );
            
        } catch (error) {
            this.handleError(error, 'Failed to add song');
        }
    }

    getSuccessHTML(song, hasLyrics) {
        let lyricsIndicator;
        if (hasLyrics) {
            lyricsIndicator = '<span style="color: #28a745; margin-left: 10px;"><i class="fas fa-check-circle"></i> Lyrics embedded</span>';
        } else {
            lyricsIndicator = '<span style="color: #6c757d; margin-left: 10px;"><i class="fas fa-times-circle"></i> No lyrics</span>';
        }
        
        return `
            <div class="success-card">
                <i class="fas fa-check-circle success-icon"></i>
                <h3>Song Added Successfully</h3>
                <div class="word-preview">
                    <div><strong>Title:</strong> ${ModalUtils.escapeHtml(song.title)}</div>
                    <div><strong>Artist:</strong> ${ModalUtils.escapeHtml(song.artist)}</div>
                    <div><strong>Album:</strong> ${ModalUtils.escapeHtml(song.album)}</div>
                    <div><strong>Year:</strong> ${song.year}</div>
                    <div style="margin-top: 10px;"><strong>Lyrics:</strong> ${lyricsIndicator}</div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                        <div><strong>Music File:</strong> <code>${ModalUtils.escapeHtml(song.src)}</code></div>
                        <div><strong>Album Art:</strong> <code>${ModalUtils.escapeHtml(song.image)}</code></div>
                        ${song.synced_lyrics ? `<div><strong>Lyrics Path:</strong> <code>${ModalUtils.escapeHtml(song.synced_lyrics)}</code></div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async getNextSongId() {
        try {
            const allSongs = await database.music.getAll();
            if (allSongs.length === 0) return 1;
            
            const maxId = Math.max(...allSongs.map(song => song.id || 0));
            return maxId + 1;
        } catch (error) {
            console.error('Error getting next song ID:', error);
            return Date.now();
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
}

window.AddSongModal = AddSongModal;