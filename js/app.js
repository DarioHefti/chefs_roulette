/* ═══════════════════════════════════════════════════════════════
   CHEF'S ROULETTE - Main Application
   ═══════════════════════════════════════════════════════════════ */

(function() {
    'use strict';
    
    // ═══════════════════════════════════════════════════════════════
    // DOM ELEMENTS
    // ═══════════════════════════════════════════════════════════════
    
    const elements = {
        // Header
        tagline: document.getElementById('tagline'),
        
        // Oracle
        oracleDisplay: document.getElementById('oracle-display'),
        tagFilter: document.getElementById('tag-filter'),
        spinButton: document.getElementById('spin-button'),
        vetoButton: document.getElementById('veto-button'),
        
        // Menu Registry
        addMenuBtn: document.getElementById('add-menu-btn'),
        searchInput: document.getElementById('search-input'),
        shareBtn: document.getElementById('share-btn'),
        importBtn: document.getElementById('import-btn'),
        menuList: document.getElementById('menu-list'),
        emptyState: document.getElementById('empty-state'),
        
        // Modal
        menuModal: document.getElementById('menu-modal'),
        modalTitle: document.getElementById('modal-title'),
        closeModal: document.getElementById('close-modal'),
        menuForm: document.getElementById('menu-form'),
        menuId: document.getElementById('menu-id'),
        menuName: document.getElementById('menu-name'),
        menuTags: document.getElementById('menu-tags'),
        menuNotes: document.getElementById('menu-notes'),
        cancelBtn: document.getElementById('cancel-btn'),
        
        // Share Modal
        shareModal: document.getElementById('share-modal'),
        closeShareModal: document.getElementById('close-share-modal'),
        sharePreview: document.getElementById('share-preview'),
        copyClipboardBtn: document.getElementById('copy-clipboard-btn'),
        shareWhatsappBtn: document.getElementById('share-whatsapp-btn'),
        shareStatus: document.getElementById('share-status'),
        
        // Import Modal
        importModal: document.getElementById('import-modal'),
        closeImportModal: document.getElementById('close-import-modal'),
        importText: document.getElementById('import-text'),
        importModeRadios: document.querySelectorAll('input[name="import-mode"]'),
        importPreview: document.getElementById('import-preview'),
        importPreviewList: document.getElementById('import-preview-list'),
        cancelImportBtn: document.getElementById('cancel-import-btn'),
        confirmImportBtn: document.getElementById('confirm-import-btn'),
        
        // AI Settings Modal
        aiSettingsBtn: document.getElementById('ai-settings-btn'),
        aiSettingsModal: document.getElementById('ai-settings-modal'),
        closeAiSettingsModal: document.getElementById('close-ai-settings-modal'),
        aiSettingsForm: document.getElementById('ai-settings-form'),
        aiApiUrl: document.getElementById('ai-api-url'),
        aiApiKey: document.getElementById('ai-api-key'),
        aiModelName: document.getElementById('ai-model-name'),
        aiSettingsStatus: document.getElementById('ai-settings-status'),
        cancelAiSettingsBtn: document.getElementById('cancel-ai-settings-btn'),
        
        // AI Suggestions
        aiSuggestBtn: document.getElementById('ai-suggest-btn'),
        aiSuggestionsModal: document.getElementById('ai-suggestions-modal'),
        closeAiSuggestionsModal: document.getElementById('close-ai-suggestions-modal'),
        aiLoading: document.getElementById('ai-loading'),
        aiError: document.getElementById('ai-error'),
        aiErrorMessage: document.getElementById('ai-error-message'),
        aiRetryBtn: document.getElementById('ai-retry-btn'),
        aiSuggestionsList: document.getElementById('ai-suggestions-list'),
        
        // URL Import
        urlImportSection: document.getElementById('url-import-section'),
        recipeUrl: document.getElementById('recipe-url'),
        fetchRecipeBtn: document.getElementById('fetch-recipe-btn'),
        urlImportStatus: document.getElementById('url-import-status'),
        
        // Notes Modal
        notesModal: document.getElementById('notes-modal'),
        notesModalTitle: document.getElementById('notes-modal-title'),
        notesModalBody: document.getElementById('notes-modal-body'),
        closeNotesModal: document.getElementById('close-notes-modal'),
        
        // History
        historyList: document.getElementById('history-list')
    };
    
    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    
    function init() {
        // Load initial data
        renderMenuList();
        renderHistory();
        updateTagFilter();
        
        // Update AI settings status
        updateAiSettingsStatus();
        
        // Play intro typewriter effect
        playIntroAnimation();
        
        // Bind events
        bindEvents();
    }
    
    function playIntroAnimation() {
        const tagline = "When hunger strikes, let fate decide";
        Typewriter.typeText(elements.tagline, tagline, 60);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // EVENT BINDINGS
    // ═══════════════════════════════════════════════════════════════
    
    function bindEvents() {
        // Oracle controls
        elements.spinButton.addEventListener('click', handleSpin);
        elements.vetoButton.addEventListener('click', handleVeto);
        elements.tagFilter.addEventListener('change', handleTagFilterChange);
        
        // Menu registry
        elements.addMenuBtn.addEventListener('click', openAddModal);
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
        elements.shareBtn.addEventListener('click', handleShare);
        elements.importBtn.addEventListener('click', openImportModal);
        
        // Menu Modal
        elements.closeModal.addEventListener('click', closeModal);
        elements.cancelBtn.addEventListener('click', closeModal);
        elements.menuForm.addEventListener('submit', handleFormSubmit);
        elements.menuModal.addEventListener('click', handleModalBackdropClick);
        
        // Share Modal
        elements.closeShareModal.addEventListener('click', closeShareModal);
        elements.shareModal.addEventListener('click', handleShareModalBackdropClick);
        elements.copyClipboardBtn.addEventListener('click', handleCopyToClipboard);
        elements.shareWhatsappBtn.addEventListener('click', handleShareWhatsApp);
        
        // Import Modal
        elements.closeImportModal.addEventListener('click', closeImportModal);
        elements.cancelImportBtn.addEventListener('click', closeImportModal);
        elements.confirmImportBtn.addEventListener('click', handleImport);
        elements.importModal.addEventListener('click', handleImportModalBackdropClick);
        elements.importText.addEventListener('input', debounce(updateImportPreview, 300));
        elements.importModeRadios.forEach(radio => {
            radio.addEventListener('change', updateImportPreview);
        });
        
        // AI Settings Modal
        elements.aiSettingsBtn.addEventListener('click', openAiSettingsModal);
        elements.closeAiSettingsModal.addEventListener('click', closeAiSettingsModal);
        elements.cancelAiSettingsBtn.addEventListener('click', closeAiSettingsModal);
        elements.aiSettingsForm.addEventListener('submit', handleAiSettingsSave);
        elements.aiSettingsModal.addEventListener('click', handleAiSettingsBackdropClick);
        
        // AI Suggestions
        elements.aiSuggestBtn.addEventListener('click', handleAiSuggest);
        elements.closeAiSuggestionsModal.addEventListener('click', closeAiSuggestionsModal);
        elements.aiSuggestionsModal.addEventListener('click', handleAiSuggestionsBackdropClick);
        elements.aiRetryBtn.addEventListener('click', fetchAiSuggestions);
        
        // URL Import
        elements.fetchRecipeBtn.addEventListener('click', handleFetchRecipe);
        elements.recipeUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFetchRecipe();
            }
        });
        
        // Notes Modal
        elements.closeNotesModal.addEventListener('click', closeNotesModal);
        elements.notesModal.addEventListener('click', handleNotesModalBackdropClick);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
        
        // Set callback for roulette results
        Roulette.setOnResult(handleRouletteResult);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ORACLE / ROULETTE HANDLERS
    // ═══════════════════════════════════════════════════════════════
    
    function handleSpin() {
        if (Roulette.getIsSpinning()) return;
        
        const selectedTag = elements.tagFilter.value;
        const menus = selectedTag 
            ? Storage.getMenusByTag(selectedTag)
            : Storage.getMenus();
        
        if (menus.length === 0) {
            Roulette.showMessage(elements.oracleDisplay, 
                selectedTag 
                    ? `No menus with tag #${selectedTag}...`
                    : 'Add some menus first!'
            );
            return;
        }
        
        elements.spinButton.disabled = true;
        elements.vetoButton.classList.add('hidden');
        
        Roulette.spin(elements.oracleDisplay, menus, null, () => {
            elements.spinButton.disabled = false;
            elements.vetoButton.classList.remove('hidden');
        });
    }
    
    function handleVeto() {
        const currentResult = Roulette.getCurrentResult();
        if (!currentResult || Roulette.getIsSpinning()) return;
        
        const selectedTag = elements.tagFilter.value;
        const menus = selectedTag 
            ? Storage.getMenusByTag(selectedTag)
            : Storage.getMenus();
        
        if (menus.length <= 1) {
            Roulette.showMessage(elements.oracleDisplay, 
                'No alternatives available...'
            );
            elements.vetoButton.classList.add('hidden');
            return;
        }
        
        // Show strikethrough effect
        Roulette.showVetoed(elements.oracleDisplay);
        
        // Wait for effect, then re-spin
        setTimeout(() => {
            elements.spinButton.disabled = true;
            elements.vetoButton.classList.add('hidden');
            
            Roulette.spin(elements.oracleDisplay, menus, currentResult.id, () => {
                elements.spinButton.disabled = false;
                elements.vetoButton.classList.remove('hidden');
            });
        }, 500);
    }
    
    function handleRouletteResult(menu) {
        // Add to history
        Storage.addToHistory(menu.id, menu.name);
        renderHistory();
    }
    
    function handleTagFilterChange() {
        // Reset oracle when filter changes
        Roulette.reset(elements.oracleDisplay);
        elements.vetoButton.classList.add('hidden');
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MENU LIST RENDERING
    // ═══════════════════════════════════════════════════════════════
    
    function renderMenuList(menus = null) {
        const menuData = menus || Storage.getMenus();
        
        // Clear current list (except empty state)
        const items = elements.menuList.querySelectorAll('.menu-item');
        items.forEach(item => item.remove());
        
        if (menuData.length === 0) {
            elements.emptyState.classList.remove('hidden');
            return;
        }
        
        elements.emptyState.classList.add('hidden');
        
        menuData.forEach(menu => {
            const menuItem = createMenuItemElement(menu);
            elements.menuList.appendChild(menuItem);
        });
    }
    
    function createMenuItemElement(menu) {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.dataset.id = menu.id;
        
        const tagsHtml = menu.tags.length > 0
            ? `<div class="menu-item-tags">${menu.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
            : '';
        
        // Show expand button if notes are longer than 100 chars or have multiple lines
        const hasLongNotes = menu.notes && (menu.notes.length > 100 || menu.notes.includes('\n'));
        const notesHtml = menu.notes
            ? `<div class="menu-item-notes">
                <span class="menu-item-notes-text">${linkify(menu.notes)}</span>
                ${hasLongNotes ? `<button class="expand-notes-btn" data-id="${menu.id}">[+]</button>` : ''}
               </div>`
            : '';
        
        div.innerHTML = `
            <div class="menu-item-content">
                <div class="menu-item-name">${escapeHtml(menu.name)}</div>
                ${tagsHtml}
                ${notesHtml}
            </div>
            <div class="menu-item-actions">
                <button class="edit-btn" data-id="${menu.id}">[EDIT]</button>
                <button class="delete-btn" data-id="${menu.id}">[DEL]</button>
            </div>
        `;
        
        // Bind action buttons
        div.querySelector('.edit-btn').addEventListener('click', () => openEditModal(menu.id));
        div.querySelector('.delete-btn').addEventListener('click', () => handleDelete(menu.id));
        
        // Bind expand notes button if present
        const expandBtn = div.querySelector('.expand-notes-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => openNotesModal(menu.id));
        }
        
        return div;
    }
    
    function updateTagFilter() {
        const tags = Storage.getAllTags();
        const currentValue = elements.tagFilter.value;
        
        // Clear options except the first "All menus"
        while (elements.tagFilter.options.length > 1) {
            elements.tagFilter.remove(1);
        }
        
        // Add tag options
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = `#${tag}`;
            elements.tagFilter.appendChild(option);
        });
        
        // Restore selection if still valid
        if (tags.includes(currentValue)) {
            elements.tagFilter.value = currentValue;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════════════
    
    function handleSearch() {
        const query = elements.searchInput.value.trim();
        
        if (!query) {
            renderMenuList();
            return;
        }
        
        const results = Storage.searchMenus(query);
        renderMenuList(results);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MODAL HANDLING
    // ═══════════════════════════════════════════════════════════════
    
    function openAddModal() {
        elements.modalTitle.textContent = '═══ NEW MENU ENTRY ═══';
        elements.menuForm.reset();
        elements.menuId.value = '';
        elements.aiSuggestBtn.classList.remove('hidden');
        elements.urlImportSection.classList.remove('hidden');
        resetUrlImportSection();
        updateAiSettingsStatus();
        elements.menuModal.classList.remove('hidden');
        elements.menuName.focus();
    }
    
    function openEditModal(id) {
        const menu = Storage.getMenuById(id);
        if (!menu) return;
        
        elements.modalTitle.textContent = '═══ EDIT MENU ENTRY ═══';
        elements.menuId.value = menu.id;
        elements.menuName.value = menu.name;
        elements.menuTags.value = menu.tags.join(', ');
        elements.menuNotes.value = menu.notes;
        elements.aiSuggestBtn.classList.add('hidden');
        elements.urlImportSection.classList.add('hidden');
        elements.menuModal.classList.remove('hidden');
        elements.menuName.focus();
    }
    
    function closeModal() {
        elements.menuModal.classList.add('hidden');
        elements.menuForm.reset();
        resetUrlImportSection();
    }
    
    function handleModalBackdropClick(e) {
        if (e.target === elements.menuModal) {
            closeModal();
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const id = elements.menuId.value;
        const name = elements.menuName.value.trim();
        const tags = elements.menuTags.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        const notes = elements.menuNotes.value.trim();
        
        if (!name) {
            elements.menuName.focus();
            return;
        }
        
        if (id) {
            // Update existing
            Storage.updateMenu(id, name, tags, notes);
        } else {
            // Add new
            Storage.addMenu(name, tags, notes);
        }
        
        closeModal();
        renderMenuList();
        updateTagFilter();
        
        // Reset search
        elements.searchInput.value = '';
    }
    
    // ═══════════════════════════════════════════════════════════════
    // DELETE HANDLING
    // ═══════════════════════════════════════════════════════════════
    
    function handleDelete(id) {
        const menu = Storage.getMenuById(id);
        if (!menu) return;
        
        // Simple confirmation using a custom approach (no native confirm for better UX)
        if (confirm(`Delete "${menu.name}"?\n\nThis action cannot be undone.`)) {
            Storage.deleteMenu(id);
            renderMenuList();
            updateTagFilter();
            
            // If current result was deleted, reset oracle
            const currentResult = Roulette.getCurrentResult();
            if (currentResult && currentResult.id === id) {
                Roulette.reset(elements.oracleDisplay);
                elements.vetoButton.classList.add('hidden');
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // HISTORY
    // ═══════════════════════════════════════════════════════════════
    
    function renderHistory() {
        const history = Storage.getHistory();
        
        if (history.length === 0) {
            elements.historyList.innerHTML = '<div class="history-empty">No prophecies yet...</div>';
            return;
        }
        
        elements.historyList.innerHTML = history.map(entry => `
            <div class="history-item">
                <span class="history-item-name">${escapeHtml(entry.menuName)}</span>
                <span class="history-item-time">${Typewriter.formatTimestamp(entry.timestamp)}</span>
            </div>
        `).join('');
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SHARE & IMPORT
    // ═══════════════════════════════════════════════════════════════
    
    function handleShare() {
        const menus = Storage.getMenus();
        
        if (menus.length === 0) {
            alert('Add some menus first before sharing!');
            return;
        }
        
        openShareModal();
    }
    
    function openShareModal() {
        // Generate preview text
        const previewText = Storage.generateWhatsAppText();
        elements.sharePreview.textContent = previewText;
        elements.shareStatus.classList.add('hidden');
        elements.shareModal.classList.remove('hidden');
    }
    
    function closeShareModal() {
        elements.shareModal.classList.add('hidden');
        elements.shareStatus.classList.add('hidden');
    }
    
    function handleShareModalBackdropClick(e) {
        if (e.target === elements.shareModal) {
            closeShareModal();
        }
    }
    
    async function handleCopyToClipboard() {
        const success = await Storage.copyToClipboard();
        
        if (success) {
            elements.shareStatus.textContent = '✓ Copied to clipboard! Paste in the Import dialog.';
            elements.shareStatus.classList.remove('hidden');
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                elements.shareStatus.classList.add('hidden');
            }, 3000);
        } else {
            alert('Failed to copy to clipboard. Please try again.');
        }
    }
    
    function handleShareWhatsApp() {
        if (!Storage.shareViaWhatsApp()) {
            alert('Failed to open WhatsApp.');
        } else {
            closeShareModal();
        }
    }
    
    function openImportModal() {
        elements.importText.value = '';
        elements.importPreview.classList.add('hidden');
        elements.importPreviewList.innerHTML = '';
        // Reset to default mode
        document.getElementById('import-merge').checked = true;
        elements.importModal.classList.remove('hidden');
        elements.importText.focus();
    }
    
    function getSelectedImportMode() {
        const selected = document.querySelector('input[name="import-mode"]:checked');
        return selected ? selected.value : 'merge';
    }
    
    function closeImportModal() {
        elements.importModal.classList.add('hidden');
        elements.importText.value = '';
        elements.importPreview.classList.add('hidden');
    }
    
    function handleImportModalBackdropClick(e) {
        if (e.target === elements.importModal) {
            closeImportModal();
        }
    }
    
    function updateImportPreview() {
        const text = elements.importText.value.trim();
        const mode = getSelectedImportMode();
        
        if (!text) {
            elements.importPreview.classList.add('hidden');
            return;
        }
        
        const parsedMenus = Storage.parseSharedText(text);
        
        if (parsedMenus.length === 0) {
            elements.importPreview.classList.add('hidden');
            return;
        }
        
        // Check which menus already exist
        const existingMenus = Storage.getMenus();
        const existingNames = new Set(existingMenus.map(m => m.name.toLowerCase()));
        
        elements.importPreviewList.innerHTML = parsedMenus.map(menu => {
            const exists = existingNames.has(menu.name.toLowerCase());
            let statusClass, statusText;
            
            if (mode === 'replace') {
                // In replace mode, all items will be added
                statusClass = 'import-new';
                statusText = '(will add)';
            } else if (mode === 'update') {
                // In update mode, existing items will be updated
                statusClass = exists ? 'import-update' : 'import-new';
                statusText = exists ? '(will update)' : '(new)';
            } else {
                // In merge mode, existing items will be skipped
                statusClass = exists ? 'import-exists' : 'import-new';
                statusText = exists ? '(skip - exists)' : '(new)';
            }
            
            return `<div class="import-preview-item ${statusClass}">
                <span class="import-item-name">${escapeHtml(menu.name)}</span>
                <span class="import-item-status">${statusText}</span>
            </div>`;
        }).join('');
        
        elements.importPreview.classList.remove('hidden');
    }
    
    function handleImport() {
        const text = elements.importText.value.trim();
        const mode = getSelectedImportMode();
        
        if (!text) {
            alert('Please paste a shared menu list first!');
            return;
        }
        
        const parsedMenus = Storage.parseSharedText(text);
        
        if (parsedMenus.length === 0) {
            alert('Could not find any menus in the pasted text.');
            return;
        }
        
        // Confirm replace action
        if (mode === 'replace') {
            const existingCount = Storage.getMenus().length;
            if (existingCount > 0 && !confirm(`This will replace all ${existingCount} existing menu(s) with ${parsedMenus.length} imported menu(s). Continue?`)) {
                return;
            }
        }
        
        const result = Storage.importMenus(parsedMenus, mode);
        
        closeImportModal();
        renderMenuList();
        updateTagFilter();
        
        // Build result message
        const messages = [];
        if (result.replaced) {
            messages.push(`Replaced all menus with ${result.imported} imported menu(s)`);
        } else {
            if (result.imported > 0) {
                messages.push(`${result.imported} new menu(s) added`);
            }
            if (result.updated > 0) {
                messages.push(`${result.updated} existing menu(s) updated`);
            }
            if (messages.length === 0) {
                messages.push('No changes made - all menus already exist');
            }
        }
        
        alert(messages.join('\n'));
    }
    
    // ═══════════════════════════════════════════════════════════════
    // AI SETTINGS
    // ═══════════════════════════════════════════════════════════════
    
    function openAiSettingsModal() {
        const settings = Storage.getAISettings();
        elements.aiApiUrl.value = settings.apiUrl || '';
        elements.aiApiKey.value = settings.apiKey || '';
        elements.aiModelName.value = settings.modelName || '';
        updateAiSettingsStatus();
        elements.aiSettingsModal.classList.remove('hidden');
        elements.aiApiUrl.focus();
    }
    
    function closeAiSettingsModal() {
        elements.aiSettingsModal.classList.add('hidden');
    }
    
    function handleAiSettingsBackdropClick(e) {
        if (e.target === elements.aiSettingsModal) {
            closeAiSettingsModal();
        }
    }
    
    function handleAiSettingsSave(e) {
        e.preventDefault();
        
        const settings = {
            apiUrl: elements.aiApiUrl.value.trim(),
            apiKey: elements.aiApiKey.value.trim(),
            modelName: elements.aiModelName.value.trim()
        };
        
        if (!settings.apiUrl || !settings.apiKey || !settings.modelName) {
            alert('Please fill in all fields.');
            return;
        }
        
        Storage.saveAISettings(settings);
        updateAiSettingsStatus();
        closeAiSettingsModal();
    }
    
    function updateAiSettingsStatus() {
        const isConfigured = Storage.isAIConfigured();
        if (isConfigured) {
            elements.aiSettingsStatus.innerHTML = '<span class="status-ok">✓ AI is configured and ready</span>';
            elements.aiSuggestBtn.classList.remove('disabled');
        } else {
            elements.aiSettingsStatus.innerHTML = '<span class="status-warning">⚠ AI is not configured</span>';
            elements.aiSuggestBtn.classList.add('disabled');
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // AI SUGGESTIONS
    // ═══════════════════════════════════════════════════════════════
    
    function handleAiSuggest() {
        if (!Storage.isAIConfigured()) {
            alert('Please configure AI settings first by clicking the gear icon in the header.');
            openAiSettingsModal();
            return;
        }
        
        // Close the add menu modal
        closeModal();
        
        // Open AI suggestions modal
        openAiSuggestionsModal();
        
        // Fetch suggestions
        fetchAiSuggestions();
    }
    
    function openAiSuggestionsModal() {
        elements.aiSuggestionsModal.classList.remove('hidden');
        showAiLoading();
    }
    
    function closeAiSuggestionsModal() {
        elements.aiSuggestionsModal.classList.add('hidden');
        elements.aiSuggestionsList.innerHTML = '';
    }
    
    function handleAiSuggestionsBackdropClick(e) {
        if (e.target === elements.aiSuggestionsModal) {
            closeAiSuggestionsModal();
        }
    }
    
    function showAiLoading() {
        elements.aiLoading.classList.remove('hidden');
        elements.aiError.classList.add('hidden');
        elements.aiSuggestionsList.classList.add('hidden');
    }
    
    function showAiError(message) {
        elements.aiLoading.classList.add('hidden');
        elements.aiError.classList.remove('hidden');
        elements.aiSuggestionsList.classList.add('hidden');
        elements.aiErrorMessage.textContent = message;
    }
    
    function showAiSuggestions(suggestions) {
        elements.aiLoading.classList.add('hidden');
        elements.aiError.classList.add('hidden');
        elements.aiSuggestionsList.classList.remove('hidden');
        
        elements.aiSuggestionsList.innerHTML = suggestions.map((suggestion, index) => `
            <div class="ai-suggestion-card" data-index="${index}">
                <div class="ai-suggestion-header">
                    <h4 class="ai-suggestion-name">${escapeHtml(suggestion.name)}</h4>
                    <button type="button" class="ai-add-btn" data-index="${index}">[+] ADD</button>
                </div>
                ${suggestion.tags.length > 0 ? `
                    <div class="ai-suggestion-tags">
                        ${suggestion.tags.map(t => `<span>#${escapeHtml(t)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="ai-suggestion-recipe">
                    <div class="recipe-toggle" data-index="${index}">
                        <span class="toggle-icon">▶</span> Show Recipe
                    </div>
                    <div class="recipe-content hidden" id="recipe-content-${index}">
                        ${escapeHtml(suggestion.recipe).replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Store suggestions for later use
        elements.aiSuggestionsList.dataset.suggestions = JSON.stringify(suggestions);
        
        // Bind add buttons
        elements.aiSuggestionsList.querySelectorAll('.ai-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                addAiSuggestion(index);
            });
        });
        
        // Bind recipe toggles
        elements.aiSuggestionsList.querySelectorAll('.recipe-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const content = document.getElementById(`recipe-content-${index}`);
                const icon = e.currentTarget.querySelector('.toggle-icon');
                
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    icon.textContent = '▼';
                    e.currentTarget.childNodes[2].textContent = ' Hide Recipe';
                } else {
                    content.classList.add('hidden');
                    icon.textContent = '▶';
                    e.currentTarget.childNodes[2].textContent = ' Show Recipe';
                }
            });
        });
    }
    
    async function fetchAiSuggestions() {
        showAiLoading();
        
        try {
            const existingMenus = Storage.getMenus().map(m => m.name);
            const suggestions = await AI.generateSuggestions(existingMenus);
            showAiSuggestions(suggestions);
        } catch (error) {
            showAiError(error.message || 'Failed to fetch AI suggestions. Please try again.');
        }
    }
    
    function addAiSuggestion(index) {
        const suggestions = JSON.parse(elements.aiSuggestionsList.dataset.suggestions || '[]');
        const suggestion = suggestions[index];
        
        if (!suggestion) return;
        
        // Add the menu with recipe in notes
        Storage.addMenu(suggestion.name, suggestion.tags, suggestion.recipe);
        
        // Update UI
        renderMenuList();
        updateTagFilter();
        
        // Mark as added
        const card = elements.aiSuggestionsList.querySelector(`.ai-suggestion-card[data-index="${index}"]`);
        if (card) {
            const btn = card.querySelector('.ai-add-btn');
            btn.textContent = '✓ ADDED';
            btn.disabled = true;
            btn.classList.add('added');
            card.classList.add('added');
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // URL IMPORT (Recipe Scraping)
    // ═══════════════════════════════════════════════════════════════
    
    function showUrlImportStatus(message, type) {
        elements.urlImportStatus.textContent = message;
        elements.urlImportStatus.className = 'url-import-status ' + type;
        elements.urlImportStatus.classList.remove('hidden');
    }
    
    function hideUrlImportStatus() {
        elements.urlImportStatus.classList.add('hidden');
        elements.urlImportStatus.className = 'url-import-status hidden';
    }
    
    function resetUrlImportSection() {
        elements.recipeUrl.value = '';
        hideUrlImportStatus();
    }
    
    async function handleFetchRecipe() {
        const url = elements.recipeUrl.value.trim();
        
        if (!url) {
            showUrlImportStatus('Please enter a URL', 'error');
            return;
        }
        
        // Validate URL before fetching
        const validation = Scraper.validateUrl(url);
        if (!validation.valid) {
            showUrlImportStatus(validation.error, 'error');
            return;
        }
        
        // Show loading state
        showUrlImportStatus('Fetching recipe...', 'loading');
        elements.fetchRecipeBtn.disabled = true;
        
        try {
            const recipe = await Scraper.fetchRecipe(url);
            
            // Prefill the form
            elements.menuName.value = recipe.name;
            elements.menuTags.value = recipe.tags.join(', ');
            elements.menuNotes.value = recipe.notes;
            
            // Show success and clear URL input
            showUrlImportStatus('Recipe imported successfully!', 'success');
            elements.recipeUrl.value = '';
            
            // Focus the name field so user can review/edit
            elements.menuName.focus();
            elements.menuName.select();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                hideUrlImportStatus();
            }, 3000);
            
        } catch (error) {
            showUrlImportStatus(error.message || 'Failed to fetch recipe', 'error');
        } finally {
            elements.fetchRecipeBtn.disabled = false;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // NOTES MODAL
    // ═══════════════════════════════════════════════════════════════
    
    function openNotesModal(menuId) {
        const menu = Storage.getMenuById(menuId);
        if (!menu || !menu.notes) return;
        
        // Set the title with dish name
        elements.notesModalTitle.textContent = `═══ ${menu.name.toUpperCase()} ═══`;
        
        // Format the notes content - linkify URLs and preserve newlines
        elements.notesModalBody.innerHTML = linkify(menu.notes);
        
        elements.notesModal.classList.remove('hidden');
    }
    
    function closeNotesModal() {
        elements.notesModal.classList.add('hidden');
        elements.notesModalBody.innerHTML = '';
    }
    
    function handleNotesModalBackdropClick(e) {
        if (e.target === elements.notesModal) {
            closeNotesModal();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════
    
    function handleKeyboard(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            if (!elements.menuModal.classList.contains('hidden')) {
                closeModal();
                return;
            }
            if (!elements.shareModal.classList.contains('hidden')) {
                closeShareModal();
                return;
            }
            if (!elements.importModal.classList.contains('hidden')) {
                closeImportModal();
                return;
            }
            if (!elements.aiSettingsModal.classList.contains('hidden')) {
                closeAiSettingsModal();
                return;
            }
            if (!elements.aiSuggestionsModal.classList.contains('hidden')) {
                closeAiSuggestionsModal();
                return;
            }
            if (!elements.notesModal.classList.contains('hidden')) {
                closeNotesModal();
                return;
            }
        }
        
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Space to spin
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleSpin();
            return;
        }
        
        // 'n' for new menu
        if (e.key === 'n' || e.key === 'N') {
            openAddModal();
            return;
        }
        
        // 'v' for veto
        if (e.key === 'v' || e.key === 'V') {
            if (!elements.vetoButton.classList.contains('hidden')) {
                handleVeto();
            }
            return;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Convert URLs in text to clickable links
     * @param {string} text - Text that may contain URLs
     * @returns {string} HTML with URLs converted to anchor tags
     */
    function linkify(text) {
        // First escape HTML to prevent XSS
        const escaped = escapeHtml(text);
        
        // URL regex pattern - matches http, https, and www URLs
        const urlPattern = /(\b(https?:\/\/|www\.)[^\s<>"\)]+)/gi;
        
        return escaped.replace(urlPattern, (match) => {
            // Add protocol if missing (for www. URLs)
            const href = match.startsWith('www.') ? 'https://' + match : match;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="notes-link">${match}</a>`;
        });
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ═══════════════════════════════════════════════════════════════
    // START THE APP
    // ═══════════════════════════════════════════════════════════════
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

