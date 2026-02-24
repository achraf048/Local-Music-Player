// js/lyrics/render/renderer.js
// Renders lyrics to DOM

class LRCRenderer {
    constructor() {
        this.container = null;
        this.lyrics = [];
        this.isEnhanced = false;
        this._cachedLines = null;
    }

    render(container, lyrics, isEnhanced) {
        if (!container) return;
        
        this.container = container;
        this.lyrics = lyrics;
        this.isEnhanced = isEnhanced;
        this._cachedLines = null;
        
        if (this.lyrics.length === 0) {
            this.renderEmpty();
            return;
        }

        if (this.isEnhanced) {
            this.renderEnhanced();
        } else {
            this.renderStandard();
        }
        
        // Cache lines after rendering
        setTimeout(() => {
            this._cachedLines = container.querySelectorAll('.lyric-line');
        }, 0);
    }

    renderEmpty() {
        this.container.innerHTML = '<div class="no-lyrics">🎵 No synced lyrics available</div>';
    }

    renderStandard() {
        this.container.innerHTML = this.lyrics.map((line, index) => `
            <div class="lyric-line" 
                 data-time="${line.time}" 
                 data-index="${index}">
                ${LRCUtils.escapeHTML(line.text)}
            </div>
        `).join('');
    }

    renderEnhanced() {
        this.container.innerHTML = this.lyrics.map((line, lineIndex) => {
            if (line.words && line.words.length > 0) {
                return `
                    <div class="lyric-line enhanced" 
                         data-time="${line.time}" 
                         data-index="${lineIndex}">
                        ${line.words.map((word, wordIndex) => `
                            <span class="word" 
                                  data-line="${lineIndex}"
                                  data-word="${wordIndex}"
                                  data-start="${word.time}"
                                  data-end="${word.endTime}">
                                ${LRCUtils.escapeHTML(word.text)}
                            </span>
                        `).join(' ')}
                    </div>
                `;
            } else {
                return `
                    <div class="lyric-line" data-time="${line.time}" data-index="${lineIndex}">
                        ${LRCUtils.escapeHTML(line.text)}
                    </div>
                `;
            }
        }).join('');
    }

    getLines() {
        return this._cachedLines || this.container?.querySelectorAll('.lyric-line') || [];
    }

    getLine(index) {
        const lines = this.getLines();
        return lines[index] || null;
    }

    getWordsForLine(lineIndex) {
        const line = this.getLine(lineIndex);
        return line?.querySelectorAll('.word') || [];
    }

    clear() {
        this.container = null;
        this.lyrics = [];
        this._cachedLines = null;
    }
}

window.LRCRenderer = LRCRenderer;