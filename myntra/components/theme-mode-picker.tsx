import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function ThemeModePicker() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const colors = Colors[theme];

  const Option = ({ label, value }: { label: string; value: 'light' | 'dark' | 'system' }) => {
    const selected = themeMode === value;
    return (
      <TouchableOpacity
        onPress={() => setThemeMode(value)}
        style={[
          styles.option,
          {
            backgroundColor: selected ? colors.buttonPrimary : colors.background,
            borderColor: selected ? colors.buttonPrimary : colors.border,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.optionText,
            { color: selected ? colors.buttonPrimaryText : colors.text },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Option label="System" value="system" />
      <Option label="Light" value="light" />
      <Option label="Dark" value="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


