import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ThemedButtonProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      return {
        ...baseStyle,
        backgroundColor: colors.buttonDisabled,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.buttonPrimary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.buttonSecondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.buttonPrimary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    if (disabled || loading) {
      return {
        ...baseStyle,
        color: colors.buttonDisabledText,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: colors.buttonPrimaryText,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.buttonSecondaryText,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: colors.buttonPrimary,
        };
      default:
        return {
          ...baseStyle,
          color: colors.buttonPrimaryText,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.buttonPrimaryText : colors.buttonPrimary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

