// js/export-import/utils/export-utils.js
// Helper functions for export/import functionality

const ExportUtils = {
    // Format file name with timestamp
    generateFilename(prefix = 'music-library', extension = 'json') {
        const date = new Date();
        const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        return `${prefix}-${timestamp}.${extension}`;
    },

    // Download file
    downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Read file as text
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    // Validate JSON structure - UPDATED to match your export format
    validateMusicData(data) {
        
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: not an object');
        }
        
        // Check for your specific export format (version, music array)
        if (data.version && Array.isArray(data.music)) {
            return true;
        }
        
        // Check if it's a direct array of songs
        if (Array.isArray(data)) {
            if (data.length === 0) return true;
            // Check first item to see if it has required fields
            const firstSong = data[0];
            if (firstSong && firstSong.title && firstSong.artist && firstSong.src) {
                return true;
            }
        }
        
        // Check for wrapped format with data property (older format)
        if (data.version && data.data && Array.isArray(data.data)) {
            console.log('✅ Detected wrapped format with data array');
            return true;
        }
        
        console.error('❌ Validation failed. Data structure:', Object.keys(data));
        throw new Error('Invalid music data structure. Expected format with "music" array or "data" array.');
    },

    validatePlaylistData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        
        // Check for playlist format
        if (data.type === 'playlist' && data.data && data.data.playlist && data.data.songs) {
            return true;
        }
        
        // Check for older format
        if (data.playlist && data.songs) {
            return true;
        }
        
        throw new Error('Invalid playlist data structure');
    },

    // Helper to normalize different import formats
    normalizeImportData(data) {
        // If it's your specific export format with music array
        if (data.version && Array.isArray(data.music)) {
            console.log('Normalizing: converting music array to data array');
            return {
                version: data.version,
                exportDate: data.exportDate,
                type: 'music-library',
                data: data.music
            };
        }
        
        // If it's a direct array, wrap it
        if (Array.isArray(data)) {
            return {
                version: '1.0',
                exportDate: new Date().toISOString(),
                type: 'music-library',
                data: data
            };
        }
        
        // If it's wrapped but using data property, keep as is
        if (data.version && data.data && Array.isArray(data.data)) {
            return data;
        }
        
        return data;
    },

    // Format bytes to human readable
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Escape HTML for safe display
    escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // Get export statistics
    getExportStats(songs, playlistName = null) {
        return {
            totalSongs: songs.length,
            totalArtists: new Set(songs.map(s => s.artist)).size,
            totalAlbums: new Set(songs.map(s => s.album)).size,
            totalGenres: new Set(songs.map(s => s.genre)).size,
            playlistName
        };
    }
};

window.ExportUtils = ExportUtils;