// Global Theme Configuration
// Change colors and fonts here to update the entire site

export const theme = {
  // Primary Color (Purple)
  colors: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Main purple
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: {
      pink: '#ec4899',
      blue: '#3b82f6',
      orange: '#f97316',
    },
    background: {
      dark: '#0a0a0a',
      darker: '#000000',
      card: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
      muted: '#9ca3af',
    },
  },
  
  // Font Family
  fonts: {
    primary: "'Poppins', system-ui, -apple-system, sans-serif",
    heading: "'Barlow Condensed', system-ui, -apple-system, sans-serif",
    // To change font, update these values:
    // Example: "'Poppins', sans-serif" or "'Roboto', sans-serif"
  },
  
  // Spacing
  spacing: {
    section: '6rem',
    container: '7xl',
  },
}

