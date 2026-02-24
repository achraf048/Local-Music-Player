// js/lyrics/utils/lrc-utils.js
// Helper functions for lyrics handling

const LRCUtils = {
    escapeHTML(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    binarySearchLyrics(lyrics, currentTime) {
        let left = 0;
        let right = lyrics.length - 1;
        let result = -1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (lyrics[mid].time <= currentTime) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return result;
    },

    binarySearchWords(words, currentTime) {
        let left = 0;
        let right = words.length - 1;
        let result = -1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (words[mid].time <= currentTime) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return result;
    },

    fixWordEndTimes(lyricsArray) {
        if (!lyricsArray) return lyricsArray;
        
        for (let i = 0; i < lyricsArray.length; i++) {
            const line = lyricsArray[i];
            if (!line.words || line.words.length === 0) continue;
            
            const words = line.words;
            
            // Fix last word of each line
            const lastWord = words[words.length - 1];
            
            // If there's a next line, use its start time
            if (i < lyricsArray.length - 1) {
                const nextLine = lyricsArray[i + 1];
                lastWord.endTime = nextLine.time;
            } else {
                // Last line: add 3 seconds
                lastWord.endTime = lastWord.time + 3;
            }
            
            // Ensure all end times are greater than start times
            for (let j = 0; j < words.length - 1; j++) {
                if (words[j].endTime <= words[j].time) {
                    words[j].endTime = words[j + 1].time;
                }
            }
        }
        
        return lyricsArray;
    },

    // Clean filename for loading by title/artist
    cleanFileName(str) {
        return str.replace(/[<>:"/\\|?*]/g, '');
    },

    // Check if LRC is enhanced format
    isEnhancedLRC(lrcText) {
        return lrcText.includes('<') && 
               lrcText.includes('>') && 
               lrcText.match(/<(\d{2}:\d{2}\.\d{2,3})>/);
    },

    // Convert timestamp string to seconds
    timestampToSeconds(timestamp) {
        const [minutes, seconds] = timestamp.split(':');
        return parseInt(minutes) * 60 + parseFloat(seconds);
    },

    // Format seconds to timestamp
    secondsToTimestamp(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2).padStart(5, '0');
        return `${mins.toString().padStart(2, '0')}:${secs}`;
    }
};

window.LRCUtils = LRCUtils;