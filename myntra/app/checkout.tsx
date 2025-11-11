import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React from "react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";
import { Platform } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { API_BASE_URL } from "@/constants/env";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { isDesktop } = useResponsive();
  const handleplaceorder = async() => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/order/create/${user._id}`, {
        shippingAddress: "123 Main Street, Apt 4B, New York, NY, 10001",
        paymentMethod: "Card",
      });
      router.push("/orders");
    } catch (error) {
      console.log(error);
    }

    
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Container>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        </Container>
      </View>
      <ScrollView style={styles.content}>
        <Container>
          <View style={[styles.checkoutLayout, { flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 30 : 20 }]}>
            <View style={[styles.leftColumn, { flex: isDesktop ? 2 : undefined }]}>
              <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
                <View style={styles.sectionHeader}>
                  <MapPin size={24} color={colors.buttonPrimary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
                </View>
                <View style={styles.form}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Full Name"
                    placeholderTextColor={colors.inputPlaceholder}
                    defaultValue="John Doe"
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Address Line 1"
                    placeholderTextColor={colors.inputPlaceholder}
                    defaultValue="123 Main Street"
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Address Line 2"
                    placeholderTextColor={colors.inputPlaceholder}
                    defaultValue="Apt 4B"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="City"
                      placeholderTextColor={colors.inputPlaceholder}
                      defaultValue="New York"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="State"
                      placeholderTextColor={colors.inputPlaceholder}
                      defaultValue="NY"
                    />
                  </View>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="Postal Code"
                      placeholderTextColor={colors.inputPlaceholder}
                      defaultValue="10001"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="Country"
                      placeholderTextColor={colors.inputPlaceholder}
                      defaultValue="United States"
                    />
                  </View>
                </View>
              </View>
              {/* Payment Section */}
              <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
                <View style={styles.sectionHeader}>
                  <CreditCard size={24} color={colors.buttonPrimary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
                </View>
                <View style={styles.form}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Card Number"
                    placeholderTextColor={colors.inputPlaceholder}
                    defaultValue="**** **** **** 4242"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="Expiry Date"
                      placeholderTextColor={colors.inputPlaceholder}
                      defaultValue="12/25"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="CVV"
                      placeholderTextColor={colors.inputPlaceholder}
                      defaultValue="***"
                    />
                  </View>
                </View>
              </View>
            </View>
            {/* Order Summary */}
            <View style={[styles.rightColumn, { flex: isDesktop ? 1 : undefined }]}>
              <View style={[styles.section, styles.summarySection, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
                <View style={styles.sectionHeader}>
                  <Truck size={24} color={colors.buttonPrimary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
                </View>
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>₹3,798</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>₹99</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>₹190</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.total, { borderTopColor: colors.border }]}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                    <Text style={[styles.totalValue, { color: colors.buttonPrimary }]}>₹4,087</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Container>
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Container>
          <TouchableOpacity
            style={[styles.placeOrderButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleplaceorder}
          >
            <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
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
    paddingVertical: 20,
  },
  checkoutLayout: {
    alignItems: 'flex-start',
  },
  leftColumn: {
    width: '100%',
  },
  rightColumn: {
    width: '100%',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 20,
        alignSelf: 'flex-start',
      },
    }),
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  form: {
    gap: 12,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  summarySection: {
    ...Platform.select({
      web: {
        minWidth: 300,
        maxWidth: 400,
      },
    }),
  },
  summary: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  total: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
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
  placeOrderButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});