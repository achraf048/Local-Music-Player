// js/export-import/index.js
// Main ExportImportManager that orchestrates all sub-modules

class ExportImportManager {
    constructor() {
        this.exporter = new Exporter();
        this.importer = new Importer();
        this.exportUI = new ExportUI(this.exporter);
        this.importUI = new ImportUI(this.importer);
        
        this._initialized = false;
    }

    init() {
        if (this._initialized) {
            console.log('⚠️ ExportImportManager already initialized');
            return;
        }

        this.initExportButton();
        this.initImportButton();
        
        this._initialized = true;
    }

    initExportButton() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn && !exportBtn.dataset.listenerAdded) {
            exportBtn.addEventListener('click', () => this.handleExport());
            exportBtn.dataset.listenerAdded = 'true';
        }
    }

    initImportButton() {
        const importBtn = document.getElementById('importBtn');
        if (importBtn && !importBtn.dataset.listenerAdded) {
            importBtn.addEventListener('click', () => this.handleImport());
            importBtn.dataset.listenerAdded = 'true';
        }
    }

    async handleExport() {
        try {
            // Show export options
            const format = await this.exportUI.showExportOptions();
            if (!format) return;

            // Show loading
            this.exportUI.showLoading();

            // Export data
            const exportData = await this.exporter.exportAllMusic();
            const result = this.exporter.download(exportData);

            // Close loading
            this.exportUI.closeLoading();

            // Show success
            await this.exportUI.showExportSuccess(result);

        } catch (error) {
            this.exportUI.closeLoading();
            await this.exportUI.showError(error);
        }
    }

    async handleImport() {
        try {
            // Show import options
            const importType = await this.importUI.showImportOptions();
            if (!importType) return;

            // Show file picker
            const file = await this.importUI.showFilePicker();
            if (!file) return;

            // Show progress
            this.importUI.showImportProgress();

            let result;
            if (importType === 'music') {
                result = await this.importer.importMusicData(file);
            }

            // Close progress
            this.importUI.close();

            // Show success
            await this.importUI.showImportSuccess(result);

            // Refresh table if on library page
            if (window.libraryManager) {
                await libraryManager.refreshTable();
            }
            if (database.stats) {
                await database.stats.updateStatsDisplay();
            }

        } catch (error) {
            this.importUI.close();
            await this.importUI.showError(error);
        }
    }

    async exportPlaylist(playlistId) {
        try {
            // Show loading
            this.exportUI.showLoading();

            // Export playlist
            const exportData = await this.exporter.exportPlaylist(playlistId);
            const stats = ExportUtils.getExportStats(exportData.data.songs, exportData.data.playlist.name);
            const filename = ExportUtils.generateFilename(
                `playlist-${exportData.data.playlist.name.toLowerCase().replace(/\s+/g, '-')}`,
                'json'
            );
            
            const result = this.exporter.download(exportData, filename);
            result.songCount = stats.totalSongs;

            // Close loading
            this.exportUI.closeLoading();

            // Show success
            await this.exportUI.showExportSuccess(result);

        } catch (error) {
            this.exportUI.closeLoading();
            await this.exportUI.showError(error);
        }
    }

    // For backward compatibility with existing code
    async exportData(format, options = {}) {
        if (options.playlistId) {
            return this.exportPlaylist(options.playlistId);
        } else {
            const exportData = await this.exporter.exportAllMusic();
            return this.exporter.download(exportData);
        }
    }

    async importMusicData(file) {
        return this.importer.importMusicData(file);
    }
}

// Create global instance
console.log('Creating exportImportManager instance...');
const exportImportManager = new ExportImportManager();
window.exportImportManager = exportImportManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a page with export/import buttons
    if (document.getElementById('exportBtn') || document.getElementById('importBtn')) {
        
        // Wait for database to be ready
        const initWhenReady = () => {
            if (window.database?.db) {
                exportImportManager.init();
            } else {
                setTimeout(initWhenReady, 100);
            }
        };
        
        initWhenReady();
    }
});