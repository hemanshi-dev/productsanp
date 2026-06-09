# Assets Images Folder

This folder contains images that are imported and processed by Vite during build.

**Usage:**
```typescript
import logo from '../assets/images/logo.png'

<img src={logo} alt="Logo" />
```

**Benefits:**
- Images are optimized during build
- Filenames are hashed for cache busting
- Missing images cause build errors (better debugging)
- Can be used with CSS imports

**Best for:**
- Component-specific images
- Images that need optimization
- Icons and small graphics

