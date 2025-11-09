import { Link } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Chrome, Heart, Search, ShoppingBag, User } from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";

export default function Header() {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: Colors[theme].background, borderBottomColor: Colors[theme].border }]}> 
      <Container style={styles.inner}>
        <View style={styles.left}>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity>
              <Text style={[styles.logo, { color: Colors[theme].text }]}>Myntra</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View style={styles.right}>
          <Link href="/(tabs)/categories" asChild>
            <TouchableOpacity style={styles.link}>
              <Search size={20} color={Colors[theme].icon} />
              {Platform.OS === 'web' && (
                <Text style={[styles.linkText, { color: Colors[theme].text }]}>Categories</Text>
              )}
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/wishlist" asChild>
            <TouchableOpacity style={styles.link}>
              <Heart size={20} color={Colors[theme].icon} />
              {Platform.OS === 'web' && (
                <Text style={[styles.linkText, { color: Colors[theme].text }]}>Wishlist</Text>
              )}
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/bag" asChild>
            <TouchableOpacity style={styles.link}>
              <ShoppingBag size={20} color={Colors[theme].icon} />
              {Platform.OS === 'web' && (
                <Text style={[styles.linkText, { color: Colors[theme].text }]}>Bag</Text>
              )}
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/profile" asChild>
            <TouchableOpacity style={styles.link}>
              <User size={20} color={Colors[theme].icon} />
              {Platform.OS === 'web' && (
                <Text style={[styles.linkText, { color: Colors[theme].text }]}>Profile</Text>
              )}
            </TouchableOpacity>
          </Link>
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {},
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  linkText: {
    fontSize: 16,
  },
});