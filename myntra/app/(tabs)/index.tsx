import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { getRecentlyViewed, RecentlyViewedItem } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";
import { Product, Category, Deal } from "@/types";
import { ProductCard, CategoryCard, SectionHeader } from "@/components";
import { LAYOUT } from "@/constants/layout";
import { API_BASE_URL } from "@/constants/env";

const deals: Deal[] = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(
    []
  );
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isDesktop, isTablet } = useResponsive();
  const colors = Colors[theme];

  const handleProductPress = useCallback(
    (productId: string) => {
      if (!user) {
        router.push("/login");
      } else {
        router.push(`/product/${productId}`);
      }
    },
    [user, router]
  );

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      router.push(`/categories?category=${categoryId}`);
    },
    [router]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [categoriesResponse, productsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/category`),
        axios.get(`${API_BASE_URL}/product`),
      ]);
      setCategories(categoriesResponse.data || []);
      setProducts(productsResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const list = await getRecentlyViewed();
          if (isActive) setRecentlyViewed(list);
        } catch (e) {
          // Silently handle error
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const getProductCardWidth = () => {
    if (Platform.OS !== "web") return "48%";
    return isDesktop ? "23%" : isTablet ? "31%" : "48%";
  };

  const getCategoryCardWidth = () => {
    if (isDesktop) return LAYOUT.categoryCard.desktop;
    if (isTablet) return LAYOUT.categoryCard.tablet;
    return LAYOUT.categoryCard.mobile;
  };

  const getBannerHeight = () => {
    if (Platform.OS !== "web") return LAYOUT.bannerHeight.mobile;
    return isDesktop
      ? LAYOUT.bannerHeight.desktop
      : isTablet
      ? LAYOUT.bannerHeight.tablet
      : LAYOUT.bannerHeight.mobile;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Container style={styles.headerInner}>
          <Text style={[styles.logo, { color: colors.text }]}>MYNTRA</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push("/categories")}
            activeOpacity={0.7}
          >
            <Search size={24} color={colors.icon} />
          </TouchableOpacity>
        </Container>
      </View>

      {/* Banner */}
      <Container>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
          }}
          style={[styles.banner, { height: getBannerHeight() }]}
          resizeMode="cover"
        />
      </Container>

      {/* Categories Section */}
      <View style={styles.section}>
        <Container>
          <SectionHeader
            title="SHOP BY CATEGORY"
            onViewAllPress={() => router.push("/categories")}
          />
        </Container>
        <Container>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.buttonPrimary} />
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No categories available
                </Text>
              </View>
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onPress={handleCategoryPress}
                  width={getCategoryCardWidth()}
                />
              ))
            )}
          </ScrollView>
        </Container>
      </View>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <Container>
            <SectionHeader
              title="RECENTLY VIEWED"
              actionText="Clear"
              showChevron={false}
              onViewAllPress={() => setRecentlyViewed([])}
            />
          </Container>
          <Container>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {recentlyViewed.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    _id: item.id,
                    name: item.name,
                    brand: item.brand || "",
                    price: item.price || 0,
                    discount: item.discount,
                    image: item.image,
                  }}
                  onPress={handleProductPress}
                  width={Platform.OS === "web" ? 200 : 160}
                />
              ))}
            </ScrollView>
          </Container>
        </View>
      )}

      {/* Deals Section */}
      <View style={styles.section}>
        <Container>
          <SectionHeader title="DEALS OF THE DAY" />
        </Container>
        <Container>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.dealsContent}
          >
            {deals.map((deal) => (
              <TouchableOpacity
                key={deal.id}
                style={[
                  styles.dealCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.cardBorder,
                    width:
                      Platform.OS === "web"
                        ? LAYOUT.dealCard.width.web
                        : LAYOUT.dealCard.width.mobile,
                    height:
                      Platform.OS === "web"
                        ? LAYOUT.dealCard.height.web
                        : LAYOUT.dealCard.height.mobile,
                  },
                ]}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: deal.image }}
                  style={styles.dealImage}
                  resizeMode="cover"
                />
                <View style={styles.dealOverlay}>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>
      </View>

      {/* Products Section */}
      <View style={styles.section}>
        <Container>
          <SectionHeader title="TRENDING PRODUCTS" />
        </Container>
        <Container>
          <View
            style={[
              styles.productsGrid,
              {
                justifyContent:
                  Platform.OS === "web" && isDesktop
                    ? "flex-start"
                    : "space-between",
              },
            ]}
          >
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.buttonPrimary} />
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No products available
                </Text>
              </View>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onPress={handleProductPress}
                  width={getProductCardWidth()}
                />
              ))
            )}
          </View>
        </Container>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 15,
    paddingTop: Platform.OS === "web" ? 15 : 50,
    borderBottomWidth: 1,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  searchButton: {
    padding: 8,
  },
  banner: {
    width: "100%",
    height: 200,
  },
  section: {
    paddingVertical: 20,
  },
  horizontalScroll: {
    marginHorizontal: -16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
  dealsContent: {
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  dealCard: {
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
  },
  dealTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  loaderContainer: {
    width: "100%",
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
  },
});
