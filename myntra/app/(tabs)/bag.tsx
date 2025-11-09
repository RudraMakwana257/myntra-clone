import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2, Bookmark } from "lucide-react-native";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";

const bagItems = [
  {
    id: 1,
    name: "White Cotton T-Shirt",
    brand: "H&M",
    size: "L",
    price: 799,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Blue Denim Jacket",
    brand: "Levis",
    size: "M",
    price: 2999,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
  },
];

export default function Bag() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [bag, setbag] = useState<any>(null);
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { isDesktop, isTablet } = useResponsive();

  useFocusEffect(
    React.useCallback(() => {
      fetchproduct();
    }, [user])
  );

  const fetchproduct = async () => {
    if (!user) {
      setbag(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://myntra-clone-fdcv.onrender.com/bag/${user._id}`
      );
      setbag(response.data || []);
    } catch (error) {
      console.error('Error fetching bag:', error);
      setbag([]);
    } finally {
      setIsLoading(false);
    }
  };
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Container>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
          </Container>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={colors.buttonPrimary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Please login to view your bag</Text>
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
  if (!isLoading && (!bag || bag.length === 0)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Container>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
          </Container>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={colors.buttonPrimary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your bag is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add some products to your bag
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={() => router.push("/")}
          >
            <Text style={styles.loginButtonText}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
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
  const total = bag?.reduce(
    (sum: any, item: any) => {
      if (!item?.productId?.price || !item?.quantity) return sum;
      return sum + item.productId.price * item.quantity;
    },
    0
  ) || 0;
  const handledelete = async (itemid: any) => {
    try {
      if (!itemid) {
        console.error('Invalid item ID');
        return;
      }
      await axios.delete(
        `https://myntra-clone-fdcv.onrender.com/bag/${itemid}`
      );
      // Refresh bag items after deletion
      await fetchproduct();
    } catch (error) {
      console.error('Error deleting item:', error);
      // Refresh bag even on error to ensure UI is in sync
      await fetchproduct();
    }
  };
  const handleUpdateQty = async (itemid: any, newQty: number) => {
    try {
      if (newQty < 1) {
        // Remove item if quantity is less than 1
        await handledelete(itemid);
        return;
      }
      
      // Update quantity
      await axios.patch(
        `https://myntra-clone-fdcv.onrender.com/bag/${itemid}`,
        { quantity: newQty }
      );
      
      // Refresh bag items to get updated state
      await fetchproduct();
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Refresh bag even on error to ensure UI is in sync
      await fetchproduct();
    }
  };
  const handleSaveForLater = async (item: any) => {
    try {
      if (!item?.productId?._id || !user?._id) {
        console.error('Invalid item or user data');
        return;
      }
      // Add to wishlist as Save for Later
      await axios.post(`https://myntra-clone-fdcv.onrender.com/wishlist/`, {
        userId: user._id,
        productId: item.productId._id,
      });
      // Remove from bag
      await axios.delete(`https://myntra-clone-fdcv.onrender.com/bag/${item._id}`);
      fetchproduct();
    } catch (error) {
      console.error('Error saving item for later:', error);
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Container>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
        </Container>
      </View>

      <ScrollView style={styles.content}>
        <Container>
          <View style={[
            styles.gridContainer,
            {
              flexDirection: Platform.OS === 'web' && isDesktop ? 'column' : 'column',
            }
          ]}>
            {bag?.map((item: any) => {
              if (!item?.productId) return null;
              return (
                <View key={item._id} style={[styles.bagItem, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
                <Image
                  source={{ uri: item.productId?.images?.[0] || 'https://via.placeholder.com/150' }}
                  style={[
                    styles.itemImage,
                    Platform.OS === 'web' && isDesktop && {
                      width: 150,
                      height: 180,
                    }
                  ]}
                />
                <View style={styles.itemInfo}>
                  <Text style={[styles.brandName, { color: colors.textSecondary }]}>{item.productId?.brand || 'Unknown Brand'}</Text>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.productId?.name || 'Unknown Product'}</Text>
                  <Text style={[styles.itemSize, { color: colors.textSecondary }]}>Size: {item.size || 'M'}</Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.productId?.price || 0}</Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton, 
                        { 
                          backgroundColor: colors.backgroundSecondary,
                        }
                      ]}
                      onPress={() => {
                        const currentQty = item.quantity || 1;
                        if (currentQty > 1) {
                          // Decrement quantity
                          handleUpdateQty(item._id, currentQty - 1);
                        } else {
                          // If quantity is 1, remove the item
                          handleUpdateQty(item._id, 0);
                        }
                      }}
                    >
                      <Minus size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity || 1}</Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => {
                        const currentQty = item.quantity || 1;
                        handleUpdateQty(item._id, currentQty + 1);
                      }}
                    >
                      <Plus size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handledelete(item._id)}
                    >
                      <Trash2 size={20} color={colors.buttonPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSaveForLater(item)}
                    >
                      <Bookmark size={18} color={colors.text} />
                      <Text style={[styles.saveText, { color: colors.text }]}>Save for later</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
          </View>
        </Container>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Container>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>₹{total}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={() => router.push("/checkout")}
          >
            <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </Container>
      </View>
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
  gridContainer: {
    marginHorizontal: -8,
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
  bagItem: {
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
    marginBottom: 5,
    fontWeight: "600",
  },
  itemSize: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    marginLeft: "auto",
  },
  saveButton: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveText: {
    fontSize: 14,
    color: "#3e3e3e",
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
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
