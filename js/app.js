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
        
        // Import Modal
        importModal: document.getElementById('import-modal'),
        closeImportModal: document.getElementById('close-import-modal'),
        importText: document.getElementById('import-text'),
        importModeRadios: document.querySelectorAll('input[name="import-mode"]'),
        importPreview: document.getElementById('import-preview'),
        importPreviewList: document.getElementById('import-preview-list'),
        cancelImportBtn: document.getElementById('cancel-import-btn'),
        confirmImportBtn: document.getElementById('confirm-import-btn'),
        
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
        
        // Import Modal
        elements.closeImportModal.addEventListener('click', closeImportModal);
        elements.cancelImportBtn.addEventListener('click', closeImportModal);
        elements.confirmImportBtn.addEventListener('click', handleImport);
        elements.importModal.addEventListener('click', handleImportModalBackdropClick);
        elements.importText.addEventListener('input', debounce(updateImportPreview, 300));
        elements.importModeRadios.forEach(radio => {
            radio.addEventListener('change', updateImportPreview);
        });
        
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
        
        const notesHtml = menu.notes
            ? `<div class="menu-item-notes">${escapeHtml(menu.notes)}</div>`
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
        elements.menuModal.classList.remove('hidden');
        elements.menuName.focus();
    }
    
    function closeModal() {
        elements.menuModal.classList.add('hidden');
        elements.menuForm.reset();
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
        
        if (!Storage.shareViaWhatsApp()) {
            alert('Failed to open WhatsApp. Try adding some menus first!');
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
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════
    
    function handleKeyboard(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            if (!elements.menuModal.classList.contains('hidden')) {
                closeModal();
                return;
            }
            if (!elements.importModal.classList.contains('hidden')) {
                closeImportModal();
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

