/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER MODULE - Text animations
   ═══════════════════════════════════════════════════════════════ */

const Typewriter = (function() {
    
    /**
     * Type text character by character into an element
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text to type
     * @param {number} speed - Milliseconds per character
     * @param {function} callback - Called when complete
     */
    function typeText(element, text, speed = 50, callback = null) {
        let index = 0;
        element.textContent = '';
        
        function typeChar() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, speed + Math.random() * 30);
            } else if (callback) {
                callback();
            }
        }
        
        typeChar();
    }
    
    /**
     * Type text with HTML support (for elements with inner HTML)
     * @param {HTMLElement} element - Target element  
     * @param {string} html - HTML to type (tags appear instantly, text types)
     * @param {number} speed - Milliseconds per character
     * @param {function} callback - Called when complete
     */
    function typeHTML(element, html, speed = 50, callback = null) {
        element.innerHTML = '';
        let charIndex = 0;
        let tagBuffer = '';
        let inTag = false;
        
        function processChar() {
            if (charIndex >= html.length) {
                if (callback) callback();
                return;
            }
            
            const char = html[charIndex];
            
            if (char === '<') {
                inTag = true;
                tagBuffer = '<';
            } else if (char === '>' && inTag) {
                tagBuffer += '>';
                element.innerHTML += tagBuffer;
                tagBuffer = '';
                inTag = false;
            } else if (inTag) {
                tagBuffer += char;
            } else {
                element.innerHTML += char;
            }
            
            charIndex++;
            
            if (inTag) {
                processChar(); // Process tags instantly
            } else {
                setTimeout(processChar, speed + Math.random() * 20);
            }
        }
        
        processChar();
    }
    
    /**
     * Slot machine text cycling effect
     * @param {HTMLElement} element - Target element
     * @param {string[]} options - Array of strings to cycle through
     * @param {number} duration - Total duration in ms
     * @param {function} callback - Called with final selected option
     * @param {string} preselectedOption - Optional pre-selected winner (for weighted selection)
     */
    function slotMachine(element, options, duration = 2000, callback = null, preselectedOption = null) {
        if (options.length === 0) {
            if (callback) callback(null);
            return;
        }
        
        const startTime = Date.now();
        let currentIndex = 0;
        let interval = 50;
        
        function cycle() {
            const elapsed = Date.now() - startTime;
            
            if (elapsed >= duration) {
                // Final selection - use preselected if provided, otherwise random
                const finalOption = preselectedOption || options[Math.floor(Math.random() * options.length)];
                element.textContent = finalOption;
                element.classList.remove('slot-cycling');
                if (callback) callback(finalOption);
                return;
            }
            
            // Slow down as we approach the end
            const progress = elapsed / duration;
            interval = 50 + (progress * progress * 200);
            
            currentIndex = (currentIndex + 1) % options.length;
            element.textContent = options[currentIndex];
            element.classList.add('slot-cycling');
            
            setTimeout(cycle, interval);
        }
        
        cycle();
    }
    
    /**
     * Scramble/unscramble text effect
     * @param {HTMLElement} element - Target element
     * @param {string} finalText - The final text to reveal
     * @param {number} duration - Duration in ms
     * @param {function} callback - Called when complete
     */
    function scrambleReveal(element, finalText, duration = 1000, callback = null) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
        const startTime = Date.now();
        const revealOrder = [];
        
        // Create random order to reveal characters
        for (let i = 0; i < finalText.length; i++) {
            revealOrder.push(i);
        }
        // Shuffle
        for (let i = revealOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [revealOrder[i], revealOrder[j]] = [revealOrder[j], revealOrder[i]];
        }
        
        const revealed = new Set();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Reveal more characters as time progresses
            const charsToReveal = Math.floor(progress * finalText.length);
            for (let i = 0; i < charsToReveal; i++) {
                revealed.add(revealOrder[i]);
            }
            
            // Build display string
            let display = '';
            for (let i = 0; i < finalText.length; i++) {
                if (revealed.has(i) || finalText[i] === ' ') {
                    display += finalText[i];
                } else {
                    display += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            element.textContent = display;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = finalText;
                if (callback) callback();
            }
        }
        
        update();
    }
    
    /**
     * Add wobble effect to element
     * @param {HTMLElement} element - Target element
     */
    function wobble(element) {
        element.classList.add('wobble');
        setTimeout(() => element.classList.remove('wobble'), 100);
    }
    
    /**
     * Strikethrough animation
     * @param {HTMLElement} element - Target element
     */
    function strikethrough(element) {
        element.classList.add('strike-anim');
    }
    
    /**
     * Format timestamp in typewriter style
     * @param {string} isoString - ISO date string
     * @returns {string} Formatted date
     */
    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        const options = {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        return date.toLocaleDateString('en-US', options).toUpperCase();
    }
    
    // Public API
    return {
        typeText,
        typeHTML,
        slotMachine,
        scrambleReveal,
        wobble,
        strikethrough,
        formatTimestamp
    };
})();

