import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  onViewAllPress?: () => void;
  actionText?: string;
  showChevron?: boolean;
}

export default function SectionHeader({
  title,
  onViewAllPress,
  actionText = 'View All',
  showChevron = true,
}: SectionHeaderProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onViewAllPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onViewAllPress} activeOpacity={0.7}>
          <Text style={[styles.actionText, { color: colors.buttonPrimary }]}>{actionText}</Text>
          {showChevron && <ChevronRight size={20} color={colors.buttonPrimary} />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginRight: 5,
    fontSize: 14,
    fontWeight: '600',
  },
});

