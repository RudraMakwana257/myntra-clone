import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: (productId: string) => void;
  width?: string | number;
}

export default function ProductCard({ product, onPress, width }: ProductCardProps) {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const colors = Colors[theme];

  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
  const discountStr = product.discount || '';
  const match = /([0-9]{1,2})%/i.exec(discountStr);
  const discountPct = match ? parseInt(match[1], 10) : 0;
  const originalPrice = discountPct > 0 ? Math.round(price / (1 - discountPct / 100)) : 0;
  const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/300';

  const cardWidth = width || (Platform.OS === 'web' 
    ? (isDesktop ? '23%' : '31%')
    : '48%');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: colors.shadow,
          borderColor: colors.cardBorder,
          width: cardWidth,
        },
      ]}
      onPress={() => onPress(product._id)}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            { height: Platform.OS === 'web' && isDesktop ? 280 : 200 },
          ]}
          resizeMode="cover"
        />
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.brand, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {product.brand}
        </Text>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>₹{price}</Text>
          {originalPrice > 0 && (
            <Text
              style={[styles.originalPrice, { color: colors.textTertiary }]}
            >
              ₹{originalPrice}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: '1%',
    marginBottom: 15,
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff3f6c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    padding: 10,
  },
  brand: {
    fontSize: 13,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
});

