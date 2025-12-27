/* ═══════════════════════════════════════════════════════════════
   SCRAPER MODULE - Fooby.ch Recipe Scraper for Chef's Roulette
   ═══════════════════════════════════════════════════════════════ */

const Scraper = (function() {
    'use strict';
    
    // CORS proxy to bypass browser restrictions
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    
    // Supported domains
    const SUPPORTED_DOMAINS = ['fooby.ch'];
    
    /**
     * Validate that the URL is a supported recipe URL
     * @param {string} url - The URL to validate
     * @returns {Object} { valid: boolean, error: string|null }
     */
    function validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'Please enter a URL' };
        }
        
        url = url.trim();
        
        // Check if it's a valid URL format
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (e) {
            return { valid: false, error: 'Invalid URL format' };
        }
        
        // Check if it's HTTPS
        if (parsedUrl.protocol !== 'https:') {
            return { valid: false, error: 'URL must use HTTPS' };
        }
        
        // Check if it's from a supported domain
        const domain = parsedUrl.hostname.replace('www.', '');
        if (!SUPPORTED_DOMAINS.some(d => domain.includes(d))) {
            return { valid: false, error: 'Only fooby.ch recipes are supported' };
        }
        
        // Check if it looks like a recipe URL
        if (!parsedUrl.pathname.includes('/recipes/')) {
            return { valid: false, error: 'URL does not appear to be a recipe page' };
        }
        
        return { valid: true, error: null };
    }
    
    /**
     * Fetch recipe page HTML via CORS proxy
     * @param {string} url - The recipe URL
     * @returns {Promise<string>} The HTML content
     */
    async function fetchPage(url) {
        const proxyUrl = CORS_PROXY + encodeURIComponent(url);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch recipe: ${response.status}`);
        }
        
        return await response.text();
    }
    
    /**
     * Parse fooby.ch recipe HTML and extract data
     * @param {string} html - The HTML content
     * @returns {Object} { name, tags, notes }
     */
    function parseFoobyRecipe(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract recipe name from h1 or title
        let name = '';
        const h1 = doc.querySelector('h1');
        if (h1) {
            name = h1.textContent.trim();
        } else {
            // Fallback to page title
            const title = doc.querySelector('title');
            if (title) {
                name = title.textContent.split('-')[0].trim();
            }
        }
        
        if (!name) {
            throw new Error('Could not extract recipe name');
        }
        
        // Extract tags (dietary info, meal type, season)
        const tags = [];
        
        // Look for category/tag links near the title
        // Fooby uses links with classes or specific patterns
        const tagSelectors = [
            '.recipe-category a',
            '.recipe-tags a',
            '.recipe-meta a',
            '[class*="tag"] a',
            '[class*="category"] a',
            // Generic approach - links in the header area
            'header a[href*="/recipes/"]'
        ];
        
        for (const selector of tagSelectors) {
            const tagElements = doc.querySelectorAll(selector);
            tagElements.forEach(el => {
                const text = el.textContent.trim().toLowerCase();
                if (text && text.length < 30 && !tags.includes(text)) {
                    tags.push(text);
                }
            });
            if (tags.length > 0) break;
        }
        
        // Also look for specific dietary indicators in the page text
        const pageText = doc.body ? doc.body.textContent.toLowerCase() : '';
        const dietaryTerms = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto'];
        dietaryTerms.forEach(term => {
            if (pageText.includes(term) && !tags.includes(term)) {
                // Verify it's actually marked as such (not just mentioned)
                const termRegex = new RegExp(`\\b${term}\\b`, 'i');
                const metaArea = doc.querySelector('.recipe-meta, .recipe-info, header');
                if (metaArea && termRegex.test(metaArea.textContent)) {
                    tags.push(term);
                }
            }
        });
        
        // Extract ingredients
        let ingredients = [];
        const ingredientSelectors = [
            '.ingredients li',
            '.ingredient-list li',
            '[class*="ingredient"] li',
            'ul[class*="ingredient"] li',
            // Fooby specific
            '.recipe-ingredients li',
            '[data-ingredient]'
        ];
        
        for (const selector of ingredientSelectors) {
            const ingredientElements = doc.querySelectorAll(selector);
            if (ingredientElements.length > 0) {
                ingredientElements.forEach(el => {
                    const text = el.textContent.trim().replace(/\s+/g, ' ');
                    if (text) {
                        ingredients.push(text);
                    }
                });
                break;
            }
        }
        
        // Alternative: look for structured ingredient data
        if (ingredients.length === 0) {
            // Try to find ingredient sections by text patterns
            const allLists = doc.querySelectorAll('ul, ol');
            for (const list of allLists) {
                const items = list.querySelectorAll('li');
                const texts = Array.from(items).map(li => li.textContent.trim());
                // Check if this looks like an ingredient list (numbers/measurements)
                const looksLikeIngredients = texts.some(t => 
                    /^\d/.test(t) || /\d+\s*(g|kg|ml|l|tbsp|tsp|cup)/i.test(t)
                );
                if (looksLikeIngredients && texts.length >= 3) {
                    ingredients = texts.filter(t => t.length > 0);
                    break;
                }
            }
        }
        
        // Extract instructions/steps
        let instructions = [];
        const instructionSelectors = [
            '.instructions li',
            '.recipe-steps li',
            '.method li',
            '[class*="step"] p',
            '.recipe-instructions p',
            // Numbered steps
            '[class*="instruction"] > div',
            '[class*="step"] > div'
        ];
        
        for (const selector of instructionSelectors) {
            const instructionElements = doc.querySelectorAll(selector);
            if (instructionElements.length > 0) {
                instructionElements.forEach((el, i) => {
                    const text = el.textContent.trim().replace(/\s+/g, ' ');
                    if (text && text.length > 10) {
                        instructions.push(text);
                    }
                });
                break;
            }
        }
        
        // Alternative: look for numbered/bulleted sections
        if (instructions.length === 0) {
            // Find paragraphs that look like steps
            const paragraphs = doc.querySelectorAll('p');
            const stepTexts = [];
            paragraphs.forEach(p => {
                const text = p.textContent.trim();
                // Look for step-like paragraphs (longer, instructional)
                if (text.length > 30 && text.length < 500 && 
                    (text.includes('.') || /^\d/.test(text))) {
                    stepTexts.push(text);
                }
            });
            if (stepTexts.length >= 2) {
                instructions = stepTexts.slice(0, 10); // Limit to 10 steps
            }
        }
        
        // Build notes string with ingredients and instructions
        let notes = '';
        
        if (ingredients.length > 0) {
            notes += '═══ INGREDIENTS ═══\n';
            ingredients.forEach(ing => {
                notes += `• ${ing}\n`;
            });
        }
        
        if (instructions.length > 0) {
            if (notes) notes += '\n';
            notes += '═══ INSTRUCTIONS ═══\n';
            instructions.forEach((step, i) => {
                notes += `${i + 1}. ${step}\n`;
            });
        }
        
        // Add source URL to notes
        notes += '\n═══════════════════\nImported from fooby.ch';
        
        return {
            name,
            tags: tags.slice(0, 5), // Limit to 5 tags
            notes: notes.trim()
        };
    }
    
    /**
     * Main function to fetch and parse a recipe
     * @param {string} url - The recipe URL
     * @returns {Promise<Object>} { name, tags, notes }
     */
    async function fetchRecipe(url) {
        // Validate URL first
        const validation = validateUrl(url);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        // Fetch the page
        const html = await fetchPage(url);
        
        // Parse the recipe
        const recipe = parseFoobyRecipe(html);
        
        // Store the source URL in notes if not already there
        if (!recipe.notes.includes(url)) {
            recipe.notes = recipe.notes.replace(
                'Imported from fooby.ch',
                `Source: ${url}`
            );
        }
        
        return recipe;
    }
    
    // Public API
    return {
        validateUrl,
        fetchRecipe
    };
})();

