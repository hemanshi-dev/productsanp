# Design System - ProductSnap AI

## Global Color & Font Configuration

All colors and fonts are defined globally for easy customization. To change the design, update the values in `src/style.css`.

### Primary Colors (Purple)

Located in `src/style.css` under `:root`:

```css
--color-primary: #a855f7;        /* Main purple */
--color-primary-light: #c084fc;  /* Light purple */
--color-primary-dark: #7e22ce;    /* Dark purple */
--color-primary-darker: #581c87;  /* Darker purple */
```

**To change primary color:**
1. Open `src/style.css`
2. Find `:root` section
3. Update `--color-primary` and related values
4. All components will automatically use the new color

### Font Family

Located in `src/style.css`:

```css
--font-primary: 'Inter', system-ui, -apple-system, sans-serif;
--font-heading: 'Inter', system-ui, -apple-system, sans-serif;
```

**To change font:**
1. Open `src/style.css`
2. Update `--font-primary` and `--font-heading`
3. Add Google Fonts import at the top if needed
4. Example: `'Poppins', sans-serif` or `'Roboto', sans-serif`

### Background Colors

```css
--color-bg-dark: #0a0a0a;      /* Dark background */
--color-bg-darker: #000000;     /* Darker background */
--color-bg-card: rgba(255, 255, 255, 0.05); /* Card background */
```

### Text Colors

```css
--color-text-primary: #ffffff;    /* Main text */
--color-text-secondary: #d1d5db; /* Secondary text */
--color-text-muted: #9ca3af;     /* Muted text */
```

### Utility Classes

- `.gradient-text` - Purple gradient text
- `.glass-effect` - Glassmorphism effect
- `.btn-primary` - Primary button style
- `.btn-outline` - Outline button style

## Quick Color Change Examples

### Change to Blue Theme:
```css
--color-primary: #3b82f6;
--color-primary-light: #60a5fa;
--color-primary-dark: #2563eb;
```

### Change to Green Theme:
```css
--color-primary: #10b981;
--color-primary-light: #34d399;
--color-primary-dark: #059669;
```

### Change Font to Poppins:
1. Add to top of `style.css`: `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`
2. Update: `--font-primary: 'Poppins', sans-serif;`

