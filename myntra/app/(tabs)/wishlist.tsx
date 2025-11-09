import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter, useFocusEffect } from "expo-router";
import { Heart, Trash2, ShoppingCart } from "lucide-react-native";
import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";
import { Platform } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

// const wishlistItems = [
//   {
//     id: 1,
//     name: "Premium Cotton T-Shirt",
//     brand: "H&M",
//     price: "₹799",
//     discount: "40% OFF",
//     image:
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Slim Fit Denim Jacket",
//     brand: "Levis",
//     price: "₹2999",
//     discount: "30% OFF",
//     image:
//       "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
//   },
// ];
export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlist, setwishlist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { isDesktop, isTablet } = useResponsive();
  useFocusEffect(
    React.useCallback(() => {
      fetchproduct();
    }, [user])
  );
  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(
          `https://myntra-clone-fdcv.onrender.com/wishlist/${user._id}`
        );
        setwishlist(bag.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      if (!itemid) {
        console.error('Invalid item ID');
        return;
      }
      await axios.delete(
        `https://myntra-clone-fdcv.onrender.com/wishlist/${itemid}`
      );
      fetchproduct();
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };
  const handleMoveToBag = async (item: any) => {
    try {
      if (!item?.productId?._id) {
        console.error('Invalid product data');
        return;
      }
      const firstSize = item?.productId?.sizes?.[0] || 'M';
      await axios.post(`https://myntra-clone-fdcv.onrender.com/bag/`, {
        userId: user?._id,
        productId: item.productId._id,
        size: firstSize,
        quantity: 1,
      });
      await axios.delete(`https://myntra-clone-fdcv.onrender.com/wishlist/${item._id}`);
      fetchproduct();
    } catch (error) {
      console.error('Error moving item to bag:', error);
    }
  };
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Container>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
          </Container>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.buttonPrimary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Please login to view your wishlist
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (!isLoading && (!wishlist || wishlist.length === 0)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Container>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
          </Container>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.buttonPrimary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your wishlist is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add items you love to your wishlist
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Container>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
        </Container>
      </View>

      <ScrollView style={styles.content}>
        <Container>
          <View style={[
            styles.gridContainer,
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: Platform.OS === 'web' && isDesktop ? 'flex-start' : 'space-between',
            }
          ]}>
            {wishlist?.map((item: any) => {
              if (!item?.productId) return null;
              const cardWidth = Platform.OS === 'web' 
                ? (isDesktop ? '48%' : isTablet ? '48%' : '100%')
                : '100%';
              return (
                <View 
                  key={item._id} 
                  style={[
                    styles.wishlistItem, 
                    { 
                      backgroundColor: colors.cardBackground, 
                      borderColor: colors.cardBorder, 
                      shadowColor: colors.shadow,
                      width: cardWidth,
                      marginHorizontal: Platform.OS === 'web' && isDesktop ? '1%' : 0,
                    }
                  ]}
                >
                  <Image
                    source={{ uri: item.productId?.images?.[0] || 'https://via.placeholder.com/150' }}
                    style={[
                      styles.itemImage,
                      { width: Platform.OS === 'web' && isDesktop ? 150 : 100 }
                    ]}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.brandName, { color: colors.textSecondary }]}>{item.productId?.brand || 'Unknown Brand'}</Text>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.productId?.name || 'Unknown Product'}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.price, { color: colors.text }]}>₹{item.productId?.price || 0}</Text>
                      {item.productId?.discount && (
                        <Text style={[styles.discount, { color: colors.buttonPrimary }]}>{item.productId.discount}</Text>
                      )}
                    </View>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={[styles.moveButton, { backgroundColor: colors.buttonPrimary }]} onPress={() => handleMoveToBag(item)}>
                        <ShoppingCart size={18} color="#fff" />
                        <Text style={styles.moveText}>Move to bag</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handledelete(item._id)}
                      >
                        <Trash2 size={20} color={colors.buttonPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 15,
    paddingTop: Platform.OS === 'web' ? 15 : 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  loginButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  gridContainer: {
    marginHorizontal: -8,
  },
  wishlistItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 1,
  },
  itemImage: {
    width: 100,
    height: 120,
    resizeMode: "cover",
  },
  itemInfo: {
    flex: 1,
    padding: 15,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  moveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  discount: {
    fontSize: 14,
  },
  removeButton: {
    padding: 15,
    justifyContent: "center",
  },
});
