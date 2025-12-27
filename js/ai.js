/* ═══════════════════════════════════════════════════════════════
   AI MODULE - Azure OpenAI Integration for Chef's Roulette
   ═══════════════════════════════════════════════════════════════ */

const AI = (function() {
    'use strict';
    
    /**
     * Generate menu suggestions using Azure OpenAI
     * @param {Array} existingMenus - Array of existing menu names
     * @returns {Promise<Array>} Array of suggested menus with recipes
     */
    async function generateSuggestions(existingMenus) {
        const settings = Storage.getAISettings();
        
        if (!settings.apiUrl || !settings.apiKey || !settings.modelName) {
            throw new Error('AI is not configured. Please set up your Azure OpenAI settings.');
        }
        
        const existingMenuList = existingMenus.length > 0 
            ? existingMenus.join(', ')
            : 'No existing menus yet';
        
        const systemPrompt = `You are a creative chef assistant. Your task is to suggest new menu items based on the user's existing preferences.

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code blocks, just the raw JSON array.

The JSON format must be exactly:
[
  {
    "name": "Dish Name",
    "tags": ["tag1", "tag2"],
    "recipe": "Full recipe with ingredients and instructions"
  }
]

Provide exactly 3 menu suggestions. Each suggestion should:
1. Have a creative but clear dish name
2. Have 2-4 relevant tags (cuisine type, main ingredient, cooking style, etc.)
3. Have a complete recipe with ingredients list and step-by-step instructions`;

        const userPrompt = `Based on these existing menu items: ${existingMenuList}

Suggest 3 NEW dishes that would complement these preferences. If there are no existing menus, suggest 3 popular diverse dishes.

Make the recipes practical and detailed. Remember: respond with ONLY the JSON array, nothing else.`;

        const requestBody = {
            model: settings.modelName,
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.8,
            max_output_tokens: 2000
        };
        
        try {
            const response = await fetch(settings.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': settings.apiKey
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Handle Azure OpenAI Responses API format
            let content = '';
            if (data.output && Array.isArray(data.output)) {
                // Responses API format
                for (const item of data.output) {
                    if (item.type === 'message' && item.content) {
                        for (const contentItem of item.content) {
                            if (contentItem.type === 'output_text') {
                                content = contentItem.text;
                                break;
                            }
                        }
                    }
                }
            } else if (data.choices && data.choices[0]) {
                // Chat Completions API format (fallback)
                content = data.choices[0].message?.content || '';
            }
            
            if (!content) {
                throw new Error('No content in API response');
            }
            
            // Parse the JSON response
            const suggestions = parseAIResponse(content);
            return suggestions;
            
        } catch (error) {
            console.error('AI request error:', error);
            throw error;
        }
    }
    
    /**
     * Parse AI response and extract menu suggestions
     * @param {string} content - The AI response content
     * @returns {Array} Parsed menu suggestions
     */
    function parseAIResponse(content) {
        try {
            // Try to extract JSON from the response
            let jsonContent = content.trim();
            
            // Remove markdown code blocks if present
            if (jsonContent.startsWith('```')) {
                jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            
            // Find JSON array in the response
            const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                jsonContent = jsonMatch[0];
            }
            
            const suggestions = JSON.parse(jsonContent);
            
            if (!Array.isArray(suggestions)) {
                throw new Error('Response is not an array');
            }
            
            // Validate and normalize each suggestion
            return suggestions.map(s => ({
                name: s.name || 'Unnamed Dish',
                tags: Array.isArray(s.tags) ? s.tags : [],
                recipe: s.recipe || ''
            }));
            
        } catch (error) {
            console.error('Failed to parse AI response:', content);
            throw new Error('Failed to parse AI suggestions. Please try again.');
        }
    }
    
    // Public API
    return {
        generateSuggestions
    };
})();

