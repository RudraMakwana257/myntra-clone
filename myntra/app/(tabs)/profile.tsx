import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Receipt,
} from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import ThemeModePicker from "@/components/theme-mode-picker";
import { ThemedButton } from "@/components";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";

const menuItems = [
  { icon: Package, label: "Orders", route: "/orders" },
  { icon: Receipt, label: "My Transactions", route: "/transactions" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: CreditCard, label: "Payment Methods", route: "/payments" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const { isDesktop } = useResponsive();

  const handleLogout = () => {
    logout()
    router.replace("/");
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={[styles.header, { backgroundColor: Colors[theme].background, borderBottomColor: Colors[theme].border }]}>
          <Container>
            <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>Profile</Text>
          </Container>
        </View>
        <View style={styles.emptyState}>
          <User size={64} color={Colors[theme].buttonPrimary} />
          <Text style={[styles.emptyTitle, { color: Colors[theme].text }]}>
            Please login to view your profile
          </Text>
          <ThemedButton title="LOGIN" onPress={() => router.push("/login")} fullWidth style={{ marginTop: 8, maxWidth: 240 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].background, borderBottomColor: Colors[theme].border }]}>
        <Container>
          <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>Profile</Text>
        </Container>
      </View>

      <ScrollView style={styles.content}>
        <Container>
        <View style={[styles.userInfo, { backgroundColor: Colors[theme].background }]}>
          <View style={styles.avatar}>
            <User size={40} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: Colors[theme].text }]}>{user.name}</Text>
            <Text style={[styles.userEmail, { color: Colors[theme].textSecondary }]}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: Colors[theme].background, borderBottomColor: Colors[theme].border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={24} color={Colors[theme].icon} />
                <Text style={[styles.menuItemLabel, { color: Colors[theme].text }]}>{item.label}</Text>
              </View>
              <ChevronRight size={24} color={Colors[theme].icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* <View style={[styles.menuItem, { backgroundColor: Colors[theme].background, borderBottomColor: Colors[theme].border }]}>
          <View style={styles.menuItemLeft}>
            
            <Text style={[styles.menuItemSubtext, { color: Colors[theme].textSecondary }]}>
              {themeMode === 'system' ? 'System' : theme === 'dark' ? 'On' : 'Off'}
            </Text>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors[theme].borderSecondary, true: Colors[theme].buttonPrimary }}
            thumbColor={theme === "dark" ? Colors[theme].buttonPrimaryText : Colors[theme].background}
          />
        </View> */}

        <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
          <ThemeModePicker />
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: Colors[theme].background, borderColor: Colors[theme].buttonPrimary }]} onPress={handleLogout}>
          <LogOut size={24} color={Colors[theme].buttonPrimary} />
          <Text style={[styles.logoutText, { color: Colors[theme].buttonPrimary }]}>Logout</Text>
        </TouchableOpacity>
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    width: "60%",
    padding: 20,
  },
  rightColumn: {
    width: "40%",
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
  },
  webContent: {
    flexDirection: "row",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    paddingTop: Platform.OS === 'web' ? 15 : 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#3e3e3e",
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ff3f6c",
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  menuSection: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 16,
    color: "#3e3e3e",
    marginLeft: 15,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: "#666",
    marginLeft: 15,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff3f6c",
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#ff3f6c",
    fontWeight: "bold",
  },
});