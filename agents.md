# Chef's Roulette - Development Guidelines

## Overview

Chef's Roulette is a meal decision helper with a vintage terminal/typewriter aesthetic. This document outlines the design principles and technical constraints for development.

---

## Deployment Environment

### GitHub Pages (github.io)

This website is deployed as a **static site** on GitHub Pages. This imposes several restrictions:

#### Constraints

- **No server-side code** - Only HTML, CSS, and JavaScript
- **No build process** - Files are served as-is (no bundlers, transpilers, or preprocessors)
- **External libraries via CDN only** - All third-party JavaScript must be loaded from CDNs
- **No backend/database** - Data persistence uses `localStorage` only
- **Static assets only** - Images, fonts, and other assets must be committed to the repo or loaded from external URLs

#### Best Practices

- Keep the codebase simple and vanilla (no frameworks requiring compilation)
- Use Google Fonts for typography (loaded via CDN)
- If external JS libraries are needed, use reliable CDNs (e.g., cdnjs, unpkg, jsdelivr)
- Test locally by opening `index.html` directly in a browser

---

## Design System

### Aesthetic: "Warm Terminal Typewriter"

The design blends a vintage typewriter feel with a warm CRT terminal aesthetic.

### Core Visual Elements

1. **ASCII Art Headers**
   - Large titles rendered in Unicode box-drawing characters and block elements
   - Example: `═══ SECTION TITLE ═══`
   - Use decorative dividers: `╔═══╗`, `║`, `╚═══╝`, `◆`

2. **CRT/Paper Effects**
   - Subtle scanline overlay effect (CSS repeating gradient)
   - Paper texture noise overlay for depth
   - Slight text shadows to simulate glow

3. **Box-Drawing Borders**
   - Use Unicode box characters for borders and frames
   - Dashed borders (`- - -`) for subtle separations
   - ASCII art for empty states and decorative elements

### Color Palette

```css
--bg-dark: #0d0b09;       /* Main background - near black with warmth */
--bg-medium: #1a1814;     /* Secondary background - dark brown */
--bg-light: #2a2620;      /* Hover/active states - lighter brown */
--text-amber: #d4a574;    /* Primary text - warm amber */
--text-cream: #f5e6d3;    /* Headings/emphasis - warm cream */
--text-dim: #8b7355;      /* Muted text - dim brown */
--accent-red: #c45c3e;    /* Danger/veto actions - terracotta red */
--accent-green: #7d9c6b;  /* Success/positive - muted sage green */
--border-color: #4a3f32;  /* Borders - warm brown */
```

### Typography

- **Primary Font**: `Special Elite` (Google Fonts) - typewriter aesthetic
- **Fallback**: `Courier New`, `monospace`
- All text should feel hand-typed and vintage
- Use letter-spacing (`0.1em` - `0.3em`) for labels and titles

### UI Components Style

#### Buttons
- Text-based with bracket notation: `[+] ADD`, `[X] CLOSE`, `[SAVE]`
- Transparent background with border
- Hover: border color change, subtle background
- No rounded corners (sharp, mechanical feel)

#### Inputs
- Dark background matching the theme
- 1px solid border
- No border-radius
- Typewriter font for consistency

#### Cards/Panels
- Bordered boxes using `border: 1px/2px solid`
- Dashed separators between items
- Corner decorations with `◆` character where appropriate

### Animation Guidelines

- **Typewriter effect** for text reveals
- **Subtle screen wobble** on interactions
- **Blink cursor** animation for active states
- **Fade and scale** for modal reveals
- Keep animations short (0.1s - 0.3s) to feel snappy

---

## Code Structure

```
chefs_roulette/
├── index.html          # Single page application
├── css/
│   └── style.css       # All styles (mobile-first)
├── js/
│   ├── app.js          # Main application logic
│   ├── storage.js      # localStorage operations
│   ├── typewriter.js   # Typewriter text effects
│   ├── roulette.js     # Spin/random selection logic
│   └── ai.js           # AI suggestion integration
└── README.md           # Project documentation
```

### JavaScript Guidelines

- Vanilla JavaScript only (no frameworks)
- ES6+ features are acceptable (modern browsers)
- Modular file organization (but no module bundling)
- Load scripts at end of `<body>` in dependency order
- Use `localStorage` for all data persistence

### CSS Guidelines

- Mobile-first responsive design
- CSS custom properties (variables) for theming
- BEM-like naming for classes
- Section comments using `═══` style dividers
- Breakpoints: 600px (tablet), 768px (desktop), 900px (wide)

---

## Content Guidelines

### Tone & Voice

- Playful, slightly mysterious ("The Oracle", "Prophecies")
- Vintage/nostalgic references
- Food and cooking metaphors
- Short, punchy labels

### Text Examples

- "SPIN THE WHEEL" (not "Random Select")
- "The pantry echoes with emptiness..." (empty state)
- "═══ MENU REGISTRY ═══" (section titles)
- "✗ VETO & RE-ROLL" (action buttons)

---

## Testing

Since this is a static site:

1. Open `index.html` directly in browser, do NOT run it with a python server
2. Test on multiple screen sizes (mobile-first)
3. Verify localStorage persistence
4. Test with browser DevTools network throttling
5. Ensure external CDN resources load correctly

---

## Deployment Checklist

- [ ] All assets committed to repo
- [ ] External resources use HTTPS CDN URLs
- [ ] No hardcoded localhost/development URLs
- [ ] localStorage keys are namespaced to avoid conflicts
- [ ] Responsive design works on mobile
- [ ] ASCII art displays correctly (monospace preserved)

