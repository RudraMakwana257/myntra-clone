import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { addRecentlyViewed } from "@/utils/storage";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";
import { Platform } from "react-native";
import ProductRecommendationCarousel from "@/components/ProductRecommendationCarousel";
import { API_BASE_URL } from "@/constants/env";

// Mock product data - in a real app, this would come from an API
// const products = {
//   "1": {
//     id: 1,
//     name: "Casual White T-Shirt",
//     brand: "Roadster",
//     price: 499,
//     discount: "60% OFF",
//     description:
//       "Classic white t-shirt made from premium cotton. Perfect for everyday wear with a comfortable regular fit.",
//     sizes: ["S", "M", "L", "XL"],
//     images: [
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop",
//     ],
//   },
//   "2": {
//     id: 2,
//     name: "Denim Jacket",
//     brand: "Levis",
//     price: 2499,
//     discount: "40% OFF",
//     description:
//       "Classic denim jacket with a modern twist. Features premium quality denim and comfortable fit.",
//     sizes: ["S", "M", "L", "XL"],
//     images: [
//       "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=500&auto=format&fit=crop",
//     ],
//   },
//   "3": {
//     id: 3,
//     name: "Summer Dress",
//     brand: "ONLY",
//     price: 1299,
//     discount: "50% OFF",
//     description:
//       "Flowy summer dress perfect for warm weather. Made from lightweight fabric with a flattering cut.",
//     sizes: ["XS", "S", "M", "L"],
//     images: [
//       "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop",
//     ],
//   },
//   "4": {
//     id: 4,
//     name: "Classic Sneakers",
//     brand: "Nike",
//     price: 3499,
//     discount: "30% OFF",
//     description:
//       "Versatile sneakers that combine style and comfort. Perfect for both casual wear and light exercise.",
//     sizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
//     images: [
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop",
//     ],
//   },
// };

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<number | null>(null);
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isWishlist, setIsWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { isDesktop, isTablet } = useResponsive();

  // Fetch product details when component mounts or id changes
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/product/${encodeURIComponent(String(id))}`
        );
        setProduct(response.data);
        setFetchError(null);
      } catch (error) {
        // Distinguish 404 from other errors
        const status = (error as any)?.response?.status;
        if (status === 404) {
          setProduct(null);
          setFetchError('not_found');
        } else {
          setFetchError('error');
        }
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Check if product is in wishlist only once when component mounts
  // Don't auto-update - only update when user clicks the icon
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !id) {
        setIsWishlist(false);
        setWishlistItemId(null);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/wishlist/check/${user._id}/${id}`
        );
        setIsWishlist(response.data.isInWishlist);
        setWishlistItemId(response.data.wishlistItemId);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
        setIsWishlist(false);
        setWishlistItemId(null);
      }
    };

    // Only check once when component mounts or when id changes
    // Don't check on every product/user change to avoid auto-updates
    checkWishlistStatus();
  }, [id]); // Only depend on id, not user or product

  // Record recently viewed when product loads (client-side storage)
  useEffect(() => {
    if (product && id) {
      addRecentlyViewed({
        id: String(id),
        name: product.name,
        brand: product.brand,
        price: product.price,
        discount: product.discount,
        image: Array.isArray(product.images) ? product.images[0] : undefined,
      }).catch(() => {});
    }
  }, [product, id]);

  // Track product view in server-side browsing history for recommendations
  useEffect(() => {
    const trackProductView = async () => {
      if (product && id && user) {
        try {
          // Track the view asynchronously (don't wait for it)
          axios.post(`${API_BASE_URL}/recommendation/track-view`, {
            userId: user._id,
            productId: id,
            viewDuration: 0, // Could be enhanced to track actual view duration
          }).catch(() => {
            // Silently fail - recommendations still work without tracking
          });
        } catch (error) {
          // Silently fail - don't interrupt user experience
        }
      }
    };

    trackProductView();
  }, [product, id, user]);

  useEffect(() => {
    // Start auto-scroll
    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, []);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      if (product && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000);
  };

  if (!isLoading && fetchError === 'not_found') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Container>
          <Text style={{ color: colors.text }}>Product not found</Text>
        </Container>
      </View>
    );
  }

  if (!isLoading && fetchError === 'error') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Container>
          <Text style={{ color: colors.text }}>Failed to load product. Please try again.</Text>
        </Container>
      </View>
    );
  }
  // Toggle product in wishlist (add/remove) - only when user clicks
  const handleToggleWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Optimistic UI update - immediately update the icon for instant feedback
    const previousState = isWishlist;
    const previousItemId = wishlistItemId;
    const newState = !isWishlist;
    setIsWishlist(newState);
    setWishlistItemId(newState ? 'temp' : null);

    try {
      // Call API to toggle wishlist
      const response = await axios.post(`${API_BASE_URL}/wishlist`, {
        userId: user._id,
        productId: id,
      });
      
      // Update wishlist status based on actual API response
      if (response.data && typeof response.data.isInWishlist === 'boolean') {
        setIsWishlist(response.data.isInWishlist);
        setWishlistItemId(response.data.wishlistItemId || null);
      } else {
        // Fallback: verify state by checking wishlist
        try {
          const verifyResponse = await axios.get(
            `${API_BASE_URL}/wishlist/check/${user._id}/${id}`
          );
          setIsWishlist(verifyResponse.data.isInWishlist);
          setWishlistItemId(verifyResponse.data.wishlistItemId || null);
        } catch (verifyError) {
          // If verification fails, revert to previous state
          console.error('Failed to verify wishlist status:', verifyError);
          setIsWishlist(previousState);
          setWishlistItemId(previousItemId);
        }
      }
    } catch (error: any) {
      // Revert optimistic update on error
      console.error('Error toggling wishlist:', error);
      setIsWishlist(previousState);
      setWishlistItemId(previousItemId);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || "Failed to update wishlist. Please try again.";
      alert(errorMessage);
    }
  };
  // Add product to shopping bag
  const handleAddToBag = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/bag`, {
        userId: user._id,
        productId: id,
        size: selectedSize,
        quantity: 1,
      });
      
      // Show success feedback (optional - you can add a toast notification here)
      // Optionally navigate to bag, or show a success message
      // router.push("/bag");
    } catch (error) {
      console.error('Error adding to bag:', error);
      alert("Failed to add item to bag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);

    // Reset auto-scroll timer when user manually scrolls
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
      </View>
    );
  }

  const imageWidth = isDesktop ? 600 : width;
  const productLayout = isDesktop ? styles.productLayoutDesktop : styles.productLayoutMobile;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Container>
          <View style={productLayout}>
            {/* Image Gallery */}
            <View style={[styles.imageSection, { flex: isDesktop ? 1 : undefined }]}>
              <View style={styles.carouselContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  {product.images.map((image: any, index: any) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={[styles.productImage, { width: imageWidth, height: isDesktop ? 600 : 400 }]}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
                <View style={styles.pagination}>
                  {product.images.map((_: any, index: any) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        { backgroundColor: currentImageIndex === index ? colors.buttonPrimary : 'rgba(255, 255, 255, 0.5)' },
                        currentImageIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Product Info */}
            <View style={[styles.content, { flex: isDesktop ? 1 : undefined }]}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.brand, { color: colors.textSecondary }]}>{product.brand}</Text>
                  <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.wishlistButton, 
                    { 
                      backgroundColor: colors.backgroundSecondary,
                    }
                  ]}
                  onPress={handleToggleWishlist}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={24}
                    color={isWishlist ? colors.buttonPrimary : colors.icon}
                    fill={isWishlist ? colors.buttonPrimary : "none"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.text }]}>₹{product.price}</Text>
                {product.discount && (
                  <View style={[styles.discountBadge, { backgroundColor: colors.buttonPrimary }]}>
                    <Text style={styles.discountBadgeText}>{product.discount}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.description, { color: colors.textSecondary }]}>{product.description}</Text>

              <View style={styles.sizeSection}>
                <Text style={[styles.sizeTitle, { color: colors.text }]}>Select Size</Text>
                <View style={styles.sizeGrid}>
                  {product.sizes.map((size: any) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        { 
                          borderColor: selectedSize === size ? colors.buttonPrimary : colors.border,
                          backgroundColor: selectedSize === size ? colors.backgroundSecondary : colors.background,
                        },
                        selectedSize === size && styles.selectedSize,
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          { color: selectedSize === size ? colors.buttonPrimary : colors.text },
                          selectedSize === size && styles.selectedSizeText,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Container>

        {/* Product Recommendations Carousel */}
        {product && (
          <ProductRecommendationCarousel
            productId={String(id)}
            userId={user?._id}
            title="You May Also Like"
          />
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Container>
          <TouchableOpacity
            style={[styles.addToBagButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleAddToBag}
            disabled={loading || !selectedSize}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ShoppingBag size={20} color="#fff" />
                <Text style={styles.addToBagText}>ADD TO BAG</Text>
              </>
            )}
          </TouchableOpacity>
        </Container>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productLayoutMobile: {
    flexDirection: "column",
  },
  productLayoutDesktop: {
    flexDirection: "row",
    gap: 40,
    alignItems: "flex-start",
    paddingVertical: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  carouselContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  productImage: {
    resizeMode: "cover",
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: Platform.OS === 'web' ? 0 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  brand: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  name: {
    fontSize: Platform.OS === 'web' ? 28 : 20,
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: Platform.OS === 'web' ? 36 : 28,
  },
  wishlistButton: {
    padding: 12,
    borderRadius: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 12,
  },
  price: {
    fontSize: Platform.OS === 'web' ? 28 : 20,
    fontWeight: "bold",
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sizeSection: {
    marginBottom: 20,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sizeButton: {
    width: Platform.OS === 'web' ? 70 : 60,
    height: Platform.OS === 'web' ? 70 : 60,
    borderRadius: Platform.OS === 'web' ? 35 : 30,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedSize: {
    borderWidth: 2,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectedSizeText: {
    fontWeight: "700",
  },
  footer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    ...Platform.select({
      web: {
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
      },
    }),
  },
  addToBagButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    gap: 10,
    opacity: 1,
  },
  addToBagText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});