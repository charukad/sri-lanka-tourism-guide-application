// Primary colors
const primary = {
  main: '#007AFF', // iOS blue
  light: '#4DA3FF',
  dark: '#0055B3',
  contrast: '#FFFFFF',
};

// Secondary colors
const secondary = {
  main: '#FF9500', // Orange
  light: '#FFB44D',
  dark: '#CC7700',
  contrast: '#FFFFFF',
};

// Accent colors
const accent = {
  success: '#34C759', // Green
  warning: '#FFCC00', // Yellow
  error: '#FF3B30', // Red
  info: '#5856D6', // Purple
};

// Neutral colors
const neutral = {
  black: '#000000',
  white: '#FFFFFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#787880',
    disabled: '#C7C7CC',
  },
  border: {
    light: '#E5E5EA',
    medium: '#C7C7CC',
    dark: '#8E8E93',
  },
  gray: '#8E8E93',       // Added for noProfilePic
  lightGray: '#E5E5EA',  // Added for borders and inputs
};

// Semantic colors
const semantic = {
  link: primary.main,
  success: accent.success,
  warning: accent.warning,
  error: accent.error,
  info: accent.info,
};

// Category colors (for destination categories, etc.)
const categories = {
  heritage: '#FF6B6B', // Red
  nature: '#4CAF50',   // Green
  religious: '#9C27B0', // Purple
  scenic: '#FF9800',    // Orange
  beach: '#00BCD4',     // Light Blue
};

// Social media colors
const social = {
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  google: '#DB4437',
};

// Status colors
const status = {
  online: '#34C759',
  offline: '#FF3B30',
  away: '#FFCC00',
  busy: '#FF9500',
};

// Transparency colors
const transparency = {
  light: 'rgba(255, 255, 255, 0.8)',
  dark: 'rgba(0, 0, 0, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBackground: 'rgba(0, 0, 0, 0.4)',
};

// Gradient colors
const gradients = {
  primary: ['#007AFF', '#4DA3FF'],
  secondary: ['#FF9500', '#FFB44D'],
  success: ['#34C759', '#63D983'],
  error: ['#FF3B30', '#FF6961'],
};

export default {
  primary: primary.main,  // Changed to export the main color directly
  secondary: secondary.main,
  accent,
  neutral,
  semantic,
  categories,
  social,
  status,
  transparency,
  gradients,
  
  // Common color aliases for quick access
  background: neutral.background,
  card: neutral.card,
  text: neutral.text.primary,
  textSecondary: neutral.text.secondary,
  border: neutral.border.light,
  
  // Additional color aliases used in components
  lightGray: neutral.lightGray,
  gray: neutral.gray,
  textDark: neutral.text.primary,  // Added for text headers
  
  // Theme colors (can be used for light/dark mode)
  light: {
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    border: '#38383A',
  },
}; 