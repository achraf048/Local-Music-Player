// js/library/core/search-manager.js
// Manages search functionality

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.debounceTimeout = null;
        
        this.onSearch = null;
        this.onClear = null;
    }

    init() {
        this.setupSearch();
        this.setupClearSearch();
    }

    setupSearch() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimeout);
            
            this.debounceTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                this.onSearch?.(query);
            }, 300);
        });
    }

    setupClearSearch() {
        this.clearSearchBtn?.addEventListener('click', () => {
            if (this.searchInput) {
                this.searchInput.value = '';
                this.searchInput.focus();
                this.onClear?.();
            }
        });
    }

    getCurrentQuery() {
        return this.searchInput?.value.trim() || '';
    }

    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }

    focus() {
        this.searchInput?.focus();
    }
}

window.SearchManager = SearchManager;