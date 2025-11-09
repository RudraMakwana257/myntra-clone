/**
 * A hook that helps you get the right color based on the current theme.
 * 
 * You can pass in custom colors for light and dark themes, or it will
 * automatically use the default theme colors if you don't specify any.
 * 
 * @example
 * // Use custom colors
 * const backgroundColor = useThemeColor(
 *   { light: '#ffffff', dark: '#000000' },
 *   'background'
 * );
 * 
 * // Use default theme colors
 * const textColor = useThemeColor({}, 'text');
 */

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme();
  
  // If a custom color is provided for the current theme, use it
  const customColor = props[theme];
  if (customColor) {
    return customColor;
  }
  
  // Otherwise, use the default color from the theme
  return Colors[theme][colorName];
}
