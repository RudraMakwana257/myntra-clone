

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const primaryColor = '#ff3f6c'; // Myntra brand color

export const Colors = {
  light: {
    // Text colors
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    
    // Background colors
    background: '#fff',
    backgroundSecondary: '#f5f5f5',
    backgroundTertiary: '#f0f0f0',
    
    // UI element colors
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Button colors
    buttonPrimary: primaryColor,
    buttonPrimaryText: '#fff',
    buttonSecondary: '#e0e0e0',
    buttonSecondaryText: '#11181C',
    buttonDisabled: '#d0d0d0',
    buttonDisabledText: '#9BA1A6',
    
    // Border colors
    border: '#e0e0e0',
    borderSecondary: '#d0d0d0',
    
    // Alert/Modal colors
    alertBackground: '#fff',
    alertText: '#11181C',
    alertBorder: '#e0e0e0',
    alertSuccess: '#4caf50',
    alertError: '#f44336',
    alertWarning: '#ff9800',
    alertInfo: '#2196f3',
    
    // Card colors
    cardBackground: '#fff',
    cardBorder: '#e0e0e0',
    
    // Input colors
    inputBackground: '#fff',
    inputBorder: '#e0e0e0',
    inputText: '#11181C',
    inputPlaceholder: '#9BA1A6',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Text colors
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#687076',
    
    // Background colors
    background: '#151718',
    backgroundSecondary: '#1f1f1f',
    backgroundTertiary: '#2a2a2a',
    
    // UI element colors
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    // Button colors
    buttonPrimary: primaryColor,
    buttonPrimaryText: '#fff',
    buttonSecondary: '#2a2a2a',
    buttonSecondaryText: '#ECEDEE',
    buttonDisabled: '#1f1f1f',
    buttonDisabledText: '#687076',
    
    // Border colors
    border: '#2a2a2a',
    borderSecondary: '#3a3a3a',
    
    // Alert/Modal colors
    alertBackground: '#1f1f1f',
    alertText: '#ECEDEE',
    alertBorder: '#2a2a2a',
    alertSuccess: '#4caf50',
    alertError: '#f44336',
    alertWarning: '#ff9800',
    alertInfo: '#2196f3',
    
    // Card colors
    cardBackground: '#1f1f1f',
    cardBorder: '#2a2a2a',
    
    // Input colors
    inputBackground: '#1f1f1f',
    inputBorder: '#2a2a2a',
    inputText: '#ECEDEE',
    inputPlaceholder: '#687076',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
