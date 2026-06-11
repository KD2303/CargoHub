// ============================================================================
// CargoHub Driver App — Design System Theme
// Derived from website's globals.css tokens
// ============================================================================

// ============================================================================
// CargoHub Driver App — Design System Theme
// Derived from website's globals.css tokens & Stitch design spec
// ============================================================================

export const colors = {
  // Brand Colors
  brand: {
    primary: '#378ADD', // Blue primary
    primaryLight: '#5CA6F0',
    primaryDark: '#0C447C',
    secondary: '#38BDF8', // Light blue active
    accent: '#378ADD',
    success: '#38BDF8',
    danger: '#E53935', // Red
    warning: '#F5A623', // Amber
  },

  // Gradient Stops
  gradient: {
    start: '#378ADD',
    mid: '#38BDF8',
    end: '#5CA6F0',
    coralStart: '#D85A30',
    coralEnd: '#B03D1A',
  },

  // Background Layers (Premium Dark Navy)
  background: {
    primary: '#0D0F1A',
    secondary: '#11131E',
    tertiary: '#191B26',
    card: '#161824',
    mesh: '#0D0F1A',
    blueTint: '#E6F1FB', // Blue tint bg
  },

  // Text Colors
  text: {
    primary: '#F0F0F0', // Near white
    secondary: '#C5C7D0', // Soft grey
    muted: '#6B7280', // Grey
    accent: '#378ADD',
    inverse: '#0D0F1A',
    blueTint: '#0C447C', // Deep blue
  },

  // Borders
  border: {
    subtle: '#2A2D3E',
    hover: '#3A3E54',
    active: '#378ADD',
    card: '#2A2D3E',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  xxl: 36,
  full: 9999,
};

export const shadows = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  glow: {
    shadowColor: '#378ADD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  glowBlue: {
    shadowColor: '#378ADD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const typography = {
  display: {
    fontFamily: undefined,
  },
  displayExtrabold: {
    fontFamily: undefined,
  },
  body: {
    fontFamily: undefined,
  },
  bodyMedium: {
    fontFamily: undefined,
  },
  bodySemibold: {
    fontFamily: undefined,
    fontWeight: '600' as const,
  },
  mono: {
    fontFamily: undefined,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  typography,
};
