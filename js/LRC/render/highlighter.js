// js/lyrics/render/highlighter.js
// Handles word and line highlighting with proper timing

class LRCHighlighter {
    constructor() {
        this.currentLine = -1;
        this.currentWord = -1;
        this.container = null;
        this.modalContainer = null;
        this.lyrics = [];
        this.isEnhanced = false;
        
        this._rafId = null;
        this._lastTime = 0;
    }

    init(container, lyrics, isEnhanced) {
        this.container = container;
        this.lyrics = lyrics;
        this.isEnhanced = isEnhanced;
        this.currentLine = -1;
        this.currentWord = -1;
        console.log('🎤 Highlighter initialized with', lyrics.length, 'lines');
        
        // Log first few lines for debugging
        if (lyrics.length > 0) {
            console.log('Sample timestamps:', lyrics.slice(0, 5).map(l => l.time));
        }
    }

    setModalContainer(modalContainer) {
        this.modalContainer = modalContainer;
        // If we have a current line, update modal immediately
        if (modalContainer && this.currentLine >= 0) {
            this.updateModalHighlight(this.currentLine);
        }
    }

    update(currentTime) {
        if (!this.container || !this.lyrics || this.lyrics.length === 0) {
            return;
        }
        
        // Throttle updates to 60fps
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }
        
        this._rafId = requestAnimationFrame(() => {
            this._performUpdate(currentTime);
            this._rafId = null;
        });
    }

    _performUpdate(currentTime) {
        // Find active line using binary search
        let activeIndex = this._findActiveLine(currentTime);
        
        if (activeIndex === -1) return;
        
        // Update line highlights if changed
        if (activeIndex !== this.currentLine) {
            // Add a small delay for smoother visual transition
            requestAnimationFrame(() => {
                this._updateLineHighlights(activeIndex);
                this.currentLine = activeIndex;
            });
        }
        
        // ALWAYS update modal if it exists
        if (this.modalContainer) {
            requestAnimationFrame(() => {
                this.updateModalHighlight(this.currentLine);
            });
        }
        
        // Update word highlights for enhanced lyrics
        if (this.isEnhanced && activeIndex >= 0) {
            this._updateWordHighlights(currentTime, activeIndex);
        }
    }

    _findActiveLine(currentTime) {
        // Binary search for the last line with time <= currentTime
        let left = 0;
        let right = this.lyrics.length - 1;
        let result = -1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (this.lyrics[mid].time <= currentTime) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return result;
    }

    _updateLineHighlights(activeIndex) {
        // Get ALL lyric lines
        const lines = this.container.querySelectorAll('.lyric-line');
        
        if (!lines || lines.length === 0) {
            console.warn('No lyric lines found in container');
            return;
        }
        
        // Update each line's classes
        lines.forEach((line, index) => {
            // Remove all existing classes
            line.classList.remove('active', 'past', 'future');
            
            // Add the appropriate class
            if (index === activeIndex) {
                line.classList.add('active');
            } else if (index < activeIndex) {
                line.classList.add('past');
            } else {
                line.classList.add('future');
            }
        });
        
        // Scroll to active line
        this._scrollToActive(this.container, activeIndex);
    }

    // Public method for modal highlighting
    updateModalHighlight(activeIndex) {
        if (!this.modalContainer) return;
        
        const modalLines = this.modalContainer.querySelectorAll('.lyric-line');
        if (!modalLines.length) return;
        
        modalLines.forEach((line, index) => {
            line.classList.remove('active', 'past', 'future');
            if (index === activeIndex) {
                line.classList.add('active');
            } else if (index < activeIndex) {
                line.classList.add('past');
            } else {
                line.classList.add('future');
            }
        });
        
        this._scrollToActive(this.modalContainer, activeIndex);
    }

    _updateWordHighlights(currentTime, lineIndex) {
        const activeLine = this.container.querySelector(`.lyric-line[data-index="${lineIndex}"]`);
        if (!activeLine) return;
        
        const words = activeLine.querySelectorAll('.word');
        if (!words.length) return;
        
        const lyricsWords = this.lyrics[lineIndex].words;
        if (!lyricsWords) return;
        
        // Find active word using binary search
        let activeWordIndex = -1;
        let left = 0;
        let right = lyricsWords.length - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (lyricsWords[mid].time <= currentTime) {
                activeWordIndex = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        words.forEach((word, index) => {
            word.classList.remove('highlighted');
            word.style.removeProperty('--progress');
            
            if (index < activeWordIndex) {
                word.classList.add('highlighted');
                word.style.setProperty('--progress', '100%');
            } else if (index === activeWordIndex) {
                word.classList.add('highlighted');
                
                const start = parseFloat(word.dataset.start);
                const end = parseFloat(word.dataset.end);
                
                if (end > start) {
                    const progress = Math.min(Math.max((currentTime - start) / (end - start), 0), 1);
                    word.style.setProperty('--progress', `${progress * 100}%`);
                } else {
                    word.style.setProperty('--progress', '100%');
                }
            }
        });
        
        // Update modal words if exists
        if (this.modalContainer) {
            this._updateModalWordHighlights(currentTime, lineIndex, activeWordIndex);
        }
    }

    _updateModalWordHighlights(currentTime, lineIndex, activeWordIndex) {
        const modalLine = this.modalContainer.querySelector(`.lyric-line[data-index="${lineIndex}"]`);
        if (!modalLine) return;
        
        const modalWords = modalLine.querySelectorAll('.word');
        if (!modalWords.length) return;
        
        modalWords.forEach((word, index) => {
            word.classList.remove('highlighted');
            word.style.removeProperty('--progress');
            
            if (index < activeWordIndex) {
                word.classList.add('highlighted');
                word.style.setProperty('--progress', '100%');
            } else if (index === activeWordIndex) {
                word.classList.add('highlighted');
                
                const start = parseFloat(word.dataset.start);
                const end = parseFloat(word.dataset.end);
                
                if (end > start) {
                    const progress = Math.min(Math.max((currentTime - start) / (end - start), 0), 1);
                    word.style.setProperty('--progress', `${progress * 100}%`);
                } else {
                    word.style.setProperty('--progress', '100%');
                }
            }
        });
    }

    _scrollToActive(container, activeIndex) {
        if (!container) return;
        
        const lines = container.querySelectorAll('.lyric-line');
        if (!lines.length || activeIndex < 0 || activeIndex >= lines.length) return;
        
        const activeLine = lines[activeIndex];
        
        // Always scroll to keep active line centered, not just when out of view
        const scrollTop = activeLine.offsetTop - (container.clientHeight / 2) + (activeLine.offsetHeight / 2);
        
        // Use smooth scrolling with a consistent behavior
        container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
        });
    }

    syncModal(modalContainer) {
        this.modalContainer = modalContainer;
        if (this.currentLine >= 0) {
            this.updateModalHighlight(this.currentLine); // Fixed: removed underscore
        }
    }

    clear() {
        this.currentLine = -1;
        this.currentWord = -1;
        this.container = null;
        this.modalContainer = null;
        
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }
}

window.LRCHighlighter = LRCHighlighter;