import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import ProductCard from './ProductCard';
import Container from './Container';
import { Product } from '@/types';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';

interface ProductRecommendationCarouselProps {
  productId: string;
  userId?: string;
  title?: string;
}

/**
 * A carousel component that displays product recommendations
 * based on the current product, user's browsing history, and wishlist
 */
export default function ProductRecommendationCarousel({
  productId,
  userId,
  title = 'You May Also Like',
}: ProductRecommendationCarouselProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { isDesktop, isTablet } = useResponsive();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendations when productId or userId changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Build query string with optional userId
        const queryParams = new URLSearchParams();
        if (userId) {
          queryParams.append('userId', userId);
        }
        queryParams.append('limit', '10');

        const response = await axios.get(
          `${API_BASE_URL}/recommendation/${productId}?${queryParams.toString()}`
        );

        setRecommendations(response.data || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, userId]);

  // Handle product card press - navigate to product detail page
  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  // Calculate card width based on device type
  const getCardWidth = () => {
    if (Platform.OS !== 'web') return '48%';
    return isDesktop ? '23%' : isTablet ? '31%' : '48%';
  };

  // Don't render if loading and no recommendations yet, or if there's an error with no fallback
  if (isLoading && recommendations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Container>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={colors.buttonPrimary} />
          </View>
        </Container>
      </View>
    );
  }

  // Don't render if there are no recommendations
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Container>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={colors.buttonPrimary} />
          </View>
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error}
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {recommendations.map((product) => (
              <View key={product._id} style={styles.cardWrapper}>
                <ProductCard
                  product={product}
                  onPress={handleProductPress}
                  width={getCardWidth()}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginTop: 20,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 28 : 22,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
  },
  scrollView: {
    marginHorizontal: Platform.OS === 'web' ? 0 : -15,
  },
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
    paddingRight: Platform.OS === 'web' ? 0 : 15,
  },
  cardWrapper: {
    marginRight: 10,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
});

