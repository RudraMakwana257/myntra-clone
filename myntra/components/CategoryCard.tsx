import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onPress?: (categoryId: string) => void;
  width?: number;
}

export default function CategoryCard({
  category,
  onPress,
  width = 100,
}: CategoryCardProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          width,
        },
      ]}
      onPress={() => onPress?.(category._id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: category.image }}
        style={[styles.image, { width: width - 16, height: width - 16 }]}
        resizeMode="cover"
      />
      <Text
        style={[styles.name, { color: colors.text }]}
        numberOfLines={2}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  image: {
    borderRadius: 50,
  },
  name: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

