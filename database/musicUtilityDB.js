// database/MusicUtilityDB.js
// Utility functions for Music Player

class MusicUtilityDB {
    constructor(db, database) {
        this.db = db;
        this.database = database;
        this.durationCache = new Map();
        this.initToastContainer();
    }
    
    // Initialize toast container on construction
    initToastContainer() {
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }
    
    // Timestamp methods (synchronous)
    setLastUpdated() {
        const timestamp = new Date().toISOString();
        localStorage.setItem('music_player_last_updated', timestamp);
        this.updateLastUpdatedDisplay(timestamp);
    }
    
    getLastUpdated() {
        const timestamp = localStorage.getItem('music_player_last_updated');
        if (timestamp) {
            this.updateLastUpdatedDisplay(timestamp);
        }
        return timestamp;
    }
    
    updateLastUpdatedDisplay(timestamp) {
        const element = document.getElementById('lastUpdated');
        if (element && timestamp) {
            const date = new Date(timestamp);
            element.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
    }
    
    // File download
    downloadFile(data, filename, type) {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
    }
    
    // Duration utilities with cache
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    parseDuration(durationString) {
        if (!durationString || typeof durationString !== 'string') return 0;
        
        // Check cache
        if (this.durationCache.has(durationString)) {
            return this.durationCache.get(durationString);
        }
        
        const parts = durationString.split(':');
        let result = 0;
        
        try {
            if (parts.length === 2) {
                result = (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
            } else if (parts.length === 3) {
                result = (parseInt(parts[0]) || 0) * 3600 + 
                        (parseInt(parts[1]) || 0) * 60 + 
                        (parseInt(parts[2]) || 0);
            }
        } catch {
            result = 0;
        }
        
        // Cache the result
        this.durationCache.set(durationString, result);
        return result;
    }
    
    // Toast notifications (synchronous)
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icons[type] || 'info-circle'}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger reflow for animation
        toast.offsetHeight;
        
        // Auto remove
        const timeoutId = setTimeout(() => this.removeToast(toast), duration);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeoutId);
            this.removeToast(toast);
        });
    }
    
    removeToast(toast) {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }
    
    // XSS prevention
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make globally available
window.MusicUtilityDB = MusicUtilityDB;