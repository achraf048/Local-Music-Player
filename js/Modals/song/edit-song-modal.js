// js/modals/song/edit-song-modal.js
// Edit song modal functionality with lyrics file upload

class EditSongModal extends BaseModal {
    constructor() {
        super();
        this.currentSongId = null;
        this.lyricsFile = null;
    }

    async show(songId) {
        this.currentSongId = songId;
        this.lyricsFile = null; // Reset lyrics file
        
        try {
            ModalUtils.showLoading('Loading...', 'Fetching song details');
            
            const song = await database.music.getById(songId);
            ModalUtils.closeLoading();

            if (!song) {
                ModalUtils.showError('Error', 'Song not found');
                return;
            }

            this.showEditForm(song);
            
        } catch (error) {
            this.handleError(error, 'Failed to load song');
        }
    }

    showEditForm(song) {
        this.swal.fire({
            title: '<i class="fas fa-edit"></i> Edit Song',
            html: this.getFormHTML(song),
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save"></i> Update',
            cancelButtonText: '<i class="fas fa-times"></i> Cancel',
            showLoaderOnConfirm: true,
            didOpen: () => this.setupLyricsHandler(),
            preConfirm: () => this.validateForm(song.id),
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.handleSubmit(result.value, song.title);
            }
        });
    }

    getFormHTML(song) {
        // Check if there's actual lyrics content in the database
        const hasLyricsContent = !!song.lrc_content; // This checks if lrc_content exists and is not null/undefined
        
        return `
            <div class="sweet-form">
                <!-- Basic Info Section -->
                <div class="form-group">
                    <label for="swal-edit-title"><i class="fas fa-music"></i> Song Title *</label>
                    <input type="text" id="swal-edit-title" class="swal-input" value="${ModalUtils.escapeHtml(song.title)}" required>
                </div>
                
                <div class="form-group">
                    <label for="swal-edit-artist"><i class="fas fa-user"></i> Artist *</label>
                    <input type="text" id="swal-edit-artist" class="swal-input" value="${ModalUtils.escapeHtml(song.artist || 'Unknown Artist')}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group half">
                        <label for="swal-edit-album"><i class="fas fa-compact-disc"></i> Album</label>
                        <input type="text" id="swal-edit-album" class="swal-input" value="${ModalUtils.escapeHtml(song.album || 'Unknown Album')}">
                    </div>
                    <div class="form-group half">
                        <label for="swal-edit-year"><i class="fas fa-calendar"></i> Year</label>
                        <input type="number" id="swal-edit-year" class="swal-input" value="${song.year || new Date().getFullYear()}" min="1900" max="2099">
                    </div>
                </div>

                <!-- File Paths Section (Music and LRC are read-only, Image is editable) -->
                <div class="file-upload-section">
                    <h4 class="section-title"><i class="fas fa-file-audio"></i> File Paths</h4>
                    
                    <div class="form-group">
                        <label><i class="fas fa-music"></i> Music File Path *</label>
                        <input type="text" id="swal-edit-src" class="swal-input" value="${ModalUtils.escapeHtml(song.src)}" required>
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-image"></i> Album Art Path</label>
                        <input type="text" id="swal-edit-image" class="swal-input" value="${ModalUtils.escapeHtml(song.image || 'img/default-album.jpg')}">
                    </div>
                    
                    ${song.synced_lyrics ? `
                    <div class="form-group">
                        <label><i class="fas fa-file-alt"></i> LRC File Path (Read-only)</label>
                        <input type="text" class="swal-input" value="${ModalUtils.escapeHtml(song.synced_lyrics)}" readonly disabled style="opacity: 0.7; background: var(--bg-card);">
                    </div>
                    ` : ''}
                </div>

                <!-- Lyrics File Upload Section -->
                <div class="file-upload-section" style="margin-top: 1.5rem;">
                    <h4 class="section-title">
                        <i class="fas fa-file-alt"></i> Update Lyrics File (Optional)
                        ${hasLyricsContent ? '<span style="color: var(--success-color); font-size: 0.8rem; margin-left: 0.5rem;"><i class="fas fa-check-circle"></i> Has lyrics</span>' : ''}
                    </h4>
                    
                    <!-- File Drop Area (same as before) -->
                    <div class="file-drop-area" id="lyrics-drop-area">
                        <input type="file" id="swal-edit-lyrics-file" class="file-input" accept=".lrc,.txt,text/plain,.lrc.txt" hidden>
                        
                        <!-- Default Message -->
                        <div class="file-drop-message" id="lyrics-drop-message">
                            <i class="fas fa-file-code"></i>
                            <div class="message-content">
                                <p>Drag & drop new LRC file here or <span class="browse-link">browse</span></p>
                                <small>Upload new file to update lyrics content (Max 1MB)</small>
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
                    
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                        <i class="fas fa-info-circle"></i> 
                        Uploading a new lyrics file will update the stored lyrics content. The file path will remain unchanged.
                    </p>
                </div>
            </div>
        `;
    }

    setupLyricsHandler() {
        const dropArea = document.getElementById('lyrics-drop-area');
        const fileInput = document.getElementById('swal-edit-lyrics-file');
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
                    <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                    <span>Synchronized lyrics (enhanced)</span>
                `;
                syncStatus.classList.add('has-sync');
            } else if (hasBasicSync) {
                syncStatus.innerHTML = `
                    <i class="fas fa-clock" style="color: var(--warning-color);"></i>
                    <span>Synchronized lyrics (basic)</span>
                `;
                syncStatus.classList.add('has-basic-sync');
            } else {
                syncStatus.innerHTML = `
                    <i class="fas fa-info-circle" style="color: var(--info-color);"></i>
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

    validateForm(songId) {
        const title = document.getElementById('swal-edit-title')?.value.trim();
        const artist = document.getElementById('swal-edit-artist')?.value.trim();
        const src = document.getElementById('swal-edit-src')?.value.trim();

        if (!this.validateRequired(title, 'Song title')) return false;
        if (!this.validateRequired(artist, 'Artist name')) return false;
        if (!this.validateRequired(src, 'Music file path')) return false;

        return {
            id: songId,
            title,
            artist,
            album: document.getElementById('swal-edit-album')?.value.trim() || 'Unknown Album',
            year: parseInt(document.getElementById('swal-edit-year')?.value) || new Date().getFullYear(),
            src: src, // Keep music file path editable
            image: document.getElementById('swal-edit-image')?.value.trim() || 'img/default-album.jpg', // Keep image editable
            lyricsFile: this.lyricsFile // Only include if a new file was uploaded
        };
    }

    async handleSubmit(songData, originalTitle) {
        try {
            ModalUtils.showLoading();
            
            // Prepare update object with all editable fields
            const updateData = {
                title: songData.title,
                artist: songData.artist,
                album: songData.album,
                year: songData.year,
                src: songData.src, // Save edited music path
                image: songData.image // Save edited image path
                // Note: synced_lyrics path remains unchanged
            };
            
            // If a new lyrics file was uploaded, read it and update lrc_content
            if (songData.lyricsFile) {
                const lrcContent = await this.readFileAsText(songData.lyricsFile);
                updateData.lrc_content = lrcContent;
                console.log(`📝 Updated LRC content from file: ${songData.lyricsFile.name} (${lrcContent.length} bytes)`);
            }
            
            const updatedSong = await database.music.update(songData.id, updateData);
            
            ModalUtils.closeLoading();
            
            ModalUtils.showSuccess(
                'Updated!',
                this.getSuccessHTML(originalTitle, updatedSong, !!songData.lyricsFile),
                () => {
                    if (window.libraryManager) libraryManager.refreshTable();
                    database.stats?.updateStatsDisplay();
                }
            );
            
        } catch (error) {
            this.handleError(error, 'Failed to update song');
        }
    }

    getSuccessHTML(originalTitle, updatedSong, lyricsUpdated) {
        const lyricsMessage = lyricsUpdated 
            ? '<span style="color: var(--success-color); margin-left: 10px;"><i class="fas fa-check-circle"></i> Lyrics updated</span>'
            : '<span style="color: var(--text-secondary); margin-left: 10px;"><i class="fas fa-minus-circle"></i> Lyrics unchanged</span>';
            
        return `
            <div class="success-card">
                <i class="fas fa-check-circle success-icon"></i>
                <h3>Song Updated Successfully</h3>
                <div class="word-preview">
                    <div><strong>Original:</strong> ${ModalUtils.escapeHtml(originalTitle)}</div>
                    <div><strong>New Title:</strong> ${ModalUtils.escapeHtml(updatedSong.title)}</div>
                    <div><strong>Artist:</strong> ${ModalUtils.escapeHtml(updatedSong.artist)}</div>
                    <div><strong>Album:</strong> ${ModalUtils.escapeHtml(updatedSong.album)}</div>
                    <div><strong>Year:</strong> ${updatedSong.year}</div>
                    <div style="margin-top: 10px;"><strong>Lyrics:</strong> ${lyricsMessage}</div>
                </div>
            </div>
        `;
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

window.EditSongModal = EditSongModal;