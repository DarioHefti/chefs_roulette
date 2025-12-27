/* ═══════════════════════════════════════════════════════════════
   STORAGE MODULE - localStorage wrapper for Chef's Roulette
   ═══════════════════════════════════════════════════════════════ */

const Storage = (function() {
    const STORAGE_KEY = 'chefs_roulette_data';
    
    // Default data structure
    const defaultData = {
        menus: [],
        history: [],
        settings: {}
    };
    
    /**
     * Generate a unique ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Get all data from localStorage
     */
    function getData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
            return { ...defaultData };
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return { ...defaultData };
        }
    }
    
    /**
     * Save all data to localStorage
     */
    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MENU OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Get all menus
     */
    function getMenus() {
        return getData().menus;
    }
    
    /**
     * Get a single menu by ID
     */
    function getMenuById(id) {
        const menus = getMenus();
        return menus.find(menu => menu.id === id);
    }
    
    /**
     * Add a new menu
     */
    function addMenu(name, tags = [], notes = '') {
        const data = getData();
        const newMenu = {
            id: generateId(),
            name: name.trim(),
            tags: tags.map(t => t.trim().toLowerCase()).filter(t => t),
            notes: notes.trim(),
            createdAt: new Date().toISOString()
        };
        
        data.menus.push(newMenu);
        saveData(data);
        return newMenu;
    }
    
    /**
     * Update an existing menu
     */
    function updateMenu(id, name, tags = [], notes = '') {
        const data = getData();
        const menuIndex = data.menus.findIndex(m => m.id === id);
        
        if (menuIndex === -1) {
            return null;
        }
        
        data.menus[menuIndex] = {
            ...data.menus[menuIndex],
            name: name.trim(),
            tags: tags.map(t => t.trim().toLowerCase()).filter(t => t),
            notes: notes.trim(),
            updatedAt: new Date().toISOString()
        };
        
        saveData(data);
        return data.menus[menuIndex];
    }
    
    /**
     * Delete a menu
     */
    function deleteMenu(id) {
        const data = getData();
        const initialLength = data.menus.length;
        data.menus = data.menus.filter(m => m.id !== id);
        
        if (data.menus.length !== initialLength) {
            saveData(data);
            return true;
        }
        return false;
    }
    
    /**
     * Get all unique tags from menus
     */
    function getAllTags() {
        const menus = getMenus();
        const tagSet = new Set();
        
        menus.forEach(menu => {
            menu.tags.forEach(tag => tagSet.add(tag));
        });
        
        return Array.from(tagSet).sort();
    }
    
    /**
     * Filter menus by tag
     */
    function getMenusByTag(tag) {
        const menus = getMenus();
        if (!tag) return menus;
        return menus.filter(menu => menu.tags.includes(tag.toLowerCase()));
    }
    
    /**
     * Search menus by name or tags
     */
    function searchMenus(query) {
        const menus = getMenus();
        const lowerQuery = query.toLowerCase().trim();
        
        if (!lowerQuery) return menus;
        
        return menus.filter(menu => 
            menu.name.toLowerCase().includes(lowerQuery) ||
            menu.tags.some(tag => tag.includes(lowerQuery)) ||
            menu.notes.toLowerCase().includes(lowerQuery)
        );
    }
    
    // ═══════════════════════════════════════════════════════════════
    // HISTORY OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    
    const MAX_HISTORY = 10;
    
    /**
     * Get suggestion history
     */
    function getHistory() {
        return getData().history;
    }
    
    /**
     * Add an entry to history
     */
    function addToHistory(menuId, menuName) {
        const data = getData();
        
        const historyEntry = {
            menuId,
            menuName,
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning of array
        data.history.unshift(historyEntry);
        
        // Keep only the last MAX_HISTORY entries
        if (data.history.length > MAX_HISTORY) {
            data.history = data.history.slice(0, MAX_HISTORY);
        }
        
        saveData(data);
        return historyEntry;
    }
    
    /**
     * Clear history
     */
    function clearHistory() {
        const data = getData();
        data.history = [];
        saveData(data);
    }
    
    /**
     * Calculate selection weights for menus based on recent history
     * Recently selected menus get lower weights, recovering to full weight after 7 days
     * @param {Array} menus - Array of menu objects
     * @returns {Object} Map of menuId -> weight (0.1 to 1.0)
     */
    function getMenuWeights(menus) {
        const history = getHistory();
        const weights = {};
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        const MIN_WEIGHT = 0.1; // Minimum weight for just-selected items
        const now = Date.now();
        
        // Initialize all menus with full weight
        menus.forEach(menu => {
            weights[menu.id] = 1.0;
        });
        
        // Reduce weight based on how recently each menu was selected
        history.forEach(entry => {
            if (!weights.hasOwnProperty(entry.menuId)) return;
            
            const selectedTime = new Date(entry.timestamp).getTime();
            const ageMs = now - selectedTime;
            
            if (ageMs >= ONE_WEEK_MS) {
                // Older than a week - no penalty
                return;
            }
            
            // Linear interpolation: 0 days = MIN_WEIGHT, 7 days = 1.0
            const recoveryProgress = ageMs / ONE_WEEK_MS;
            const penalty = MIN_WEIGHT + (1 - MIN_WEIGHT) * recoveryProgress;
            
            // Take the minimum weight if menu appears multiple times in history
            weights[entry.menuId] = Math.min(weights[entry.menuId], penalty);
        });
        
        return weights;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SETTINGS OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Get settings
     */
    function getSettings() {
        return getData().settings;
    }
    
    /**
     * Update a setting
     */
    function updateSetting(key, value) {
        const data = getData();
        data.settings[key] = value;
        saveData(data);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // EXPORT/IMPORT
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Export menus as formatted text
     */
    function exportMenusAsText() {
        const menus = getMenus();
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let text = `╔═══════════════════════════════════════════════════════════╗
║              CHEF'S ROULETTE - MENU REGISTRY              ║
║                     ${date.padStart(25).padEnd(30)}║
╚═══════════════════════════════════════════════════════════╝

`;
        
        if (menus.length === 0) {
            text += 'No menus in registry.\n';
        } else {
            menus.forEach((menu, index) => {
                text += `${(index + 1).toString().padStart(2)}. ${menu.name}\n`;
                if (menu.tags.length > 0) {
                    text += `    Tags: ${menu.tags.map(t => '#' + t).join(' ')}\n`;
                }
                if (menu.notes) {
                    text += `    Notes: ${menu.notes}\n`;
                }
                text += '\n';
            });
        }
        
        text += `════════════════════════════════════════════════════════════
Total: ${menus.length} menu(s)
`;
        
        return text;
    }
    
    /**
     * Download export as file
     */
    function downloadExport() {
        const text = exportMenusAsText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chefs-roulette-menus-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Generate shareable JSON data
     * @returns {string|null} JSON string of menus
     */
    function generateShareData() {
        const menus = getMenus();
        
        if (menus.length === 0) {
            return null;
        }
        
        // Export only necessary fields (no id, createdAt, etc.)
        const exportData = menus.map(menu => ({
            name: menu.name,
            tags: menu.tags,
            notes: menu.notes
        }));
        
        return JSON.stringify(exportData);
    }
    
    /**
     * Copy share data to clipboard
     * @returns {Promise<boolean>} Success status
     */
    async function copyToClipboard() {
        const data = generateShareData();
        
        if (!data) {
            return false;
        }
        
        try {
            await navigator.clipboard.writeText(data);
            return true;
        } catch (e) {
            console.error('Failed to copy to clipboard:', e);
            // Fallback for older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = data;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (e2) {
                console.error('Fallback copy failed:', e2);
                return false;
            }
        }
    }
    
    /**
     * Share menus via WhatsApp (JSON format)
     */
    function shareViaWhatsApp() {
        const data = generateShareData();
        
        if (!data) {
            return false;
        }
        
        const encodedText = encodeURIComponent(data);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
        return true;
    }
    
    /**
     * Parse shared JSON text and extract menus
     * @param {string} text - The JSON text to parse
     * @returns {Array} Array of menu objects (without ids)
     */
    function parseSharedText(text) {
        const trimmed = text.trim();
        
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map(item => ({
                    name: item.name || '',
                    tags: Array.isArray(item.tags) ? item.tags : [],
                    notes: item.notes || ''
                })).filter(m => m.name);
            }
            return [];
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return [];
        }
    }
    
    /**
     * Import menus from parsed data
     * @param {Array} parsedMenus - Array of menu objects from parseSharedText
     * @param {string} mode - Import mode: 'merge' (skip duplicates), 'update' (update existing), 'replace' (replace all)
     * @returns {Object} { imported: number, updated: number, replaced: boolean }
     */
    function importMenus(parsedMenus, mode = 'merge') {
        const result = { imported: 0, updated: 0, replaced: false };
        
        if (mode === 'replace') {
            // Replace all: clear existing menus and import all new ones
            const data = getData();
            data.menus = [];
            saveData(data);
            
            for (const menu of parsedMenus) {
                addMenu(menu.name, menu.tags, menu.notes);
                result.imported++;
            }
            result.replaced = true;
            return result;
        }
        
        const existingMenus = getMenus();
        const existingByName = {};
        existingMenus.forEach(m => {
            existingByName[m.name.toLowerCase()] = m;
        });
        
        for (const menu of parsedMenus) {
            const lowerName = menu.name.toLowerCase();
            const existing = existingByName[lowerName];
            
            if (existing) {
                if (mode === 'update') {
                    // Update existing menu with new data
                    updateMenu(existing.id, menu.name, menu.tags, menu.notes);
                    result.updated++;
                }
                // In 'merge' mode, skip duplicates (do nothing)
            } else {
                // Add new menu
                addMenu(menu.name, menu.tags, menu.notes);
                existingByName[lowerName] = { name: menu.name }; // Prevent duplicates within import
                result.imported++;
            }
        }
        
        return result;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // AI SETTINGS
    // ═══════════════════════════════════════════════════════════════
    
    const AI_SETTINGS_KEY = 'chefs_roulette_ai_settings';
    
    /**
     * Get AI settings from localStorage
     */
    function getAISettings() {
        try {
            const data = localStorage.getItem(AI_SETTINGS_KEY);
            if (data) {
                return JSON.parse(data);
            }
            return {
                apiUrl: '',
                apiKey: '',
                modelName: ''
            };
        } catch (e) {
            console.error('Error reading AI settings:', e);
            return {
                apiUrl: '',
                apiKey: '',
                modelName: ''
            };
        }
    }
    
    /**
     * Save AI settings to localStorage
     */
    function saveAISettings(settings) {
        try {
            localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error saving AI settings:', e);
            return false;
        }
    }
    
    /**
     * Check if AI is configured
     */
    function isAIConfigured() {
        const settings = getAISettings();
        return settings.apiUrl && settings.apiKey && settings.modelName;
    }
    
    // Public API
    return {
        // Menus
        getMenus,
        getMenuById,
        addMenu,
        updateMenu,
        deleteMenu,
        getAllTags,
        getMenusByTag,
        searchMenus,
        
        // History
        getHistory,
        addToHistory,
        clearHistory,
        getMenuWeights,
        
        // Settings
        getSettings,
        updateSetting,
        
        // AI Settings
        getAISettings,
        saveAISettings,
        isAIConfigured,
        
        // Export/Share/Import
        exportMenusAsText,
        downloadExport,
        generateShareData,
        copyToClipboard,
        shareViaWhatsApp,
        parseSharedText,
        importMenus
    };
})();

