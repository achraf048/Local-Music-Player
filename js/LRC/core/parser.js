// js/lyrics/core/parser.js
// Parses standard and enhanced LRC formats

class LRCParser {
    constructor() {
        this.isEnhanced = false;
    }

    parse(lrcText) {
        if (!lrcText) return [];
        
        this.isEnhanced = LRCUtils.isEnhancedLRC(lrcText);
        
        let lyrics = this.isEnhanced 
            ? this.parseEnhancedLRC(lrcText)
            : this.parseStandardLRC(lrcText);
        
        // Fix word end times for enhanced lyrics
        if (this.isEnhanced && lyrics.length > 0) {
            lyrics = LRCUtils.fixWordEndTimes(lyrics);
        }
        
        return lyrics;
    }

    parseStandardLRC(lrcText) {
        if (!lrcText) return [];
        
        const lines = lrcText.split('\n');
        const lyrics = [];
        const metadata = {};
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Metadata tags
            const metaMatch = line.match(/^\[(ar|ti|al|by|offset|re|ve|length|au|la):\s*(.*)\]$/i);
            if (metaMatch) {
                metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
                return;
            }
            
            // Skip non-timestamp lines [Verse], [Chorus], etc.
            if (line.match(/^\[[a-zA-Z0-9\s]+\]$/)) {
                return;
            }
            
            // Parse timestamp and lyrics
            const timestampRegex = /\[(\d{2}):(\d{2}\.\d{2,3})\]/g;
            let match;
            
            while ((match = timestampRegex.exec(line)) !== null) {
                const minutes = parseInt(match[1]);
                const seconds = parseFloat(match[2]);
                const time = minutes * 60 + seconds;
                
                // Get text after this timestamp
                const text = line.substring(timestampRegex.lastIndex).trim();
                
                if (text) {
                    lyrics.push({
                        time,
                        text,
                        metadata: { ...metadata },
                        words: []
                    });
                }
            }
        });
        
        return lyrics.sort((a, b) => a.time - b.time);
    }

    parseEnhancedLRC(lrcText) {
        if (!lrcText) return [];
        
        const lines = lrcText.split('\n');
        const lyrics = [];
        const metadata = {};
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Metadata tags
            const metaMatch = line.match(/^\[(ar|ti|al|by|offset|re|ve|length|au|la):\s*(.*)\]$/i);
            if (metaMatch) {
                metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
                return;
            }
            
            // Skip non-timestamp lines
            if (line.match(/^\[[a-zA-Z0-9\s]+\]$/)) {
                return;
            }
            
            // Get line timestamp
            const lineTimeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2,3})\]/);
            if (!lineTimeMatch) return;
            
            const minutes = parseInt(lineTimeMatch[1]);
            const seconds = parseFloat(lineTimeMatch[2]);
            const lineTime = minutes * 60 + seconds;
            
            // Extract all word timestamps
            const wordRegex = /<(\d{2}:\d{2}\.\d{2,3})>([^<]+)/g;
            const words = [];
            let wordMatch;
            
            while ((wordMatch = wordRegex.exec(line)) !== null) {
                const wordTime = LRCUtils.timestampToSeconds(wordMatch[1]);
                const wordText = wordMatch[2].trim();
                
                if (wordText) {
                    words.push({
                        time: wordTime,
                        text: wordText,
                        endTime: 0
                    });
                }
            }
            
            // Calculate end times for words
            for (let i = 0; i < words.length; i++) {
                if (i < words.length - 1) {
                    words[i].endTime = words[i + 1].time;
                } else {
                    words[i].endTime = words[i].time + 2;
                }
            }
            
            // Get full line text (without timestamps)
            let fullText = line
                .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/, '')
                .replace(/<\d{2}:\d{2}\.\d{2,3}>/g, '')
                .trim();
            
            if (words.length > 0) {
                lyrics.push({
                    time: lineTime,
                    text: fullText,
                    words: words,
                    isEnhanced: true,
                    metadata: { ...metadata }
                });
            }
        });
        
        return lyrics.sort((a, b) => a.time - b.time);
    }

    getDuration(lyrics) {
        return lyrics.length > 0 ? lyrics[lyrics.length - 1].time : 0;
    }

    isEnhancedFormat() {
        return this.isEnhanced;
    }
}

window.LRCParser = LRCParser;