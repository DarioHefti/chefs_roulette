/* ═══════════════════════════════════════════════════════════════
   ROULETTE MODULE - Random selection and animation logic
   ═══════════════════════════════════════════════════════════════ */

const Roulette = (function() {
    
    let isSpinning = false;
    let currentResult = null;
    let onResultCallback = null;
    
    /**
     * Check if currently spinning
     */
    function getIsSpinning() {
        return isSpinning;
    }
    
    /**
     * Get the current result
     */
    function getCurrentResult() {
        return currentResult;
    }
    
    /**
     * Set callback for when result is determined
     */
    function setOnResult(callback) {
        onResultCallback = callback;
    }
    
    /**
     * Get a random menu from the list using weighted selection
     * Recently selected menus have lower probability of being chosen
     * @param {Array} menus - Array of menu objects
     * @param {string} excludeId - Optional ID to exclude (for re-rolls)
     */
    function getRandomMenu(menus, excludeId = null) {
        let available = menus;
        
        if (excludeId && menus.length > 1) {
            available = menus.filter(m => m.id !== excludeId);
        }
        
        if (available.length === 0) return null;
        
        // Get weights from storage (based on recent history)
        const weights = Storage.getMenuWeights(available);
        
        // Calculate total weight
        let totalWeight = 0;
        available.forEach(menu => {
            totalWeight += weights[menu.id] || 1.0;
        });
        
        // Weighted random selection
        let random = Math.random() * totalWeight;
        for (const menu of available) {
            const weight = weights[menu.id] || 1.0;
            random -= weight;
            if (random <= 0) {
                return menu;
            }
        }
        
        // Fallback (shouldn't happen)
        return available[available.length - 1];
    }
    
    /**
     * Run the spin animation sequence
     * @param {HTMLElement} displayElement - The oracle display element
     * @param {Array} menus - Array of available menus
     * @param {string} excludeId - Optional ID to exclude
     * @param {function} callback - Called with result menu
     */
    function spin(displayElement, menus, excludeId = null, callback = null) {
        if (isSpinning) return;
        if (menus.length === 0) {
            displayElement.classList.remove('hidden');
            displayElement.innerHTML = `
                <div class="oracle-idle">
                    <span class="blink">!</span> No menus available to choose from...
                </div>
            `;
            return;
        }
        
        isSpinning = true;
        currentResult = null;
        
        // Show the display
        displayElement.classList.remove('hidden');
        
        // Phase 1: "Processing your hunger..."
        displayElement.innerHTML = `
            <div class="oracle-spinning">
                Processing your hunger<span class="blink">...</span>
            </div>
        `;
        
        setTimeout(() => {
            // Phase 2: Slot machine cycling
            // Pre-select the winner using weighted random selection
            const preselectedMenu = getRandomMenu(menus, excludeId);
            const menuNames = menus.map(m => m.name);
            const cycleElement = document.createElement('div');
            cycleElement.className = 'oracle-spinning';
            displayElement.innerHTML = '';
            displayElement.appendChild(cycleElement);
            
            Typewriter.slotMachine(cycleElement, menuNames, 2500, (selectedName) => {
                // Phase 3: Reveal the result (use preselected menu)
                const selectedMenu = preselectedMenu || menus.find(m => m.name === selectedName);
                
                if (!selectedMenu) {
                    displayElement.innerHTML = `
                        <div class="oracle-idle">
                            <span class="blink">?</span> The oracle is confused...
                        </div>
                    `;
                    isSpinning = false;
                    return;
                }
                
                currentResult = selectedMenu;
                
                // Dramatic pause before reveal
                setTimeout(() => {
                    Typewriter.wobble(displayElement);
                    showResult(displayElement, selectedMenu);
                    
                    isSpinning = false;
                    
                    if (onResultCallback) {
                        onResultCallback(selectedMenu);
                    }
                    
                    if (callback) {
                        callback(selectedMenu);
                    }
                }, 300);
            }, preselectedMenu ? preselectedMenu.name : null);
        }, 1000);
    }
    
    /**
     * Display the result in the oracle display
     * @param {HTMLElement} displayElement - The oracle display element
     * @param {Object} menu - The selected menu object
     * @param {boolean} isVetoed - Whether this result has been vetoed
     */
    function showResult(displayElement, menu, isVetoed = false) {
        const tagsHtml = menu.tags.length > 0 
            ? `<span class="decree-tags">${menu.tags.map(t => '#' + t).join(' ')}</span>`
            : '';
        
        // Check if notes are long enough to warrant an expand button
        const hasLongNotes = menu.notes && (menu.notes.length > 50 || menu.notes.includes('\n'));
        
        const notesHtml = menu.notes 
            ? `<div class="decree-notes-container">
                <span class="decree-notes">"${truncate(menu.notes, 60)}"</span>
                ${hasLongNotes ? `<button class="expand-notes-btn oracle-expand-notes">[+]</button>` : ''}
               </div>`
            : '';
        
        const vetoedClass = isVetoed ? 'oracle-vetoed' : '';
        
        displayElement.innerHTML = `
            <div class="oracle-result ${vetoedClass}">
                <span class="decree-label">THE ORACLE DECREES:</span>
                <span class="decree-name">${escapeHtml(menu.name)}</span>
                ${tagsHtml}
                ${notesHtml}
            </div>
        `;
    }
    
    /**
     * Show vetoed state (strikethrough)
     * @param {HTMLElement} displayElement - The oracle display element
     */
    function showVetoed(displayElement) {
        if (!currentResult) return;
        
        const nameElement = displayElement.querySelector('.decree-name');
        if (nameElement) {
            Typewriter.strikethrough(nameElement);
            displayElement.querySelector('.oracle-result').classList.add('oracle-vetoed');
        }
    }
    
    /**
     * Reset the oracle display to idle state
     * @param {HTMLElement} displayElement - The oracle display element
     */
    function reset(displayElement) {
        currentResult = null;
        displayElement.innerHTML = '';
        displayElement.classList.add('hidden');
    }
    
    /**
     * Show empty state message
     * @param {HTMLElement} displayElement - The oracle display element
     * @param {string} message - Custom message
     */
    function showMessage(displayElement, message) {
        displayElement.classList.remove('hidden');
        displayElement.innerHTML = `
            <div class="oracle-idle">
                ${escapeHtml(message)}
            </div>
        `;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Truncate text with ellipsis
     */
    function truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    // Public API
    return {
        getIsSpinning,
        getCurrentResult,
        setOnResult,
        getRandomMenu,
        spin,
        showResult,
        showVetoed,
        reset,
        showMessage
    };
})();

