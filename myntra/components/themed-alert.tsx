import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type ThemedAlertProps = {
  title?: string;
  message: string;
  type?: AlertType;
  onClose?: () => void;
  style?: ViewStyle;
  showIcon?: boolean;
};

const alertConfig = {
  success: {
    icon: CheckCircle,
    colorKey: 'alertSuccess' as const,
  },
  error: {
    icon: AlertCircle,
    colorKey: 'alertError' as const,
  },
  warning: {
    icon: AlertTriangle,
    colorKey: 'alertWarning' as const,
  },
  info: {
    icon: Info,
    colorKey: 'alertInfo' as const,
  },
};

export function ThemedAlert({
  title,
  message,
  type = 'info',
  onClose,
  style,
  showIcon = true,
}: ThemedAlertProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const config = alertConfig[type];
  const IconComponent = config.icon;
  const alertColor = colors[config.colorKey];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.alertBackground,
          borderColor: colors.alertBorder,
          borderLeftColor: alertColor,
          borderLeftWidth: 4,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <IconComponent
            size={24}
            color={alertColor}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                { color: colors.alertText },
              ]}
            >
              {title}
            </Text>
          )}
          <Text
            style={[
              styles.message,
              { color: colors.alertText },
            ]}
          >
            {message}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={colors.alertText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

