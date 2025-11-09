import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  Star,
  StarOff,
  Smartphone,
  Building,
  Wallet,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";
import axios from "axios";
import { ThemedButton } from "@/components";

interface PaymentMethod {
  _id: string;
  type: "card" | "upi" | "netbanking" | "wallet";
  isDefault: boolean;
  isActive: boolean;
  nickname: string;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
  };
  upiDetails?: {
    upiId: string;
    name: string;
  };
  netBankingDetails?: {
    bankName: string;
    accountHolderName: string;
    ifscCode: string;
  };
  walletDetails?: {
    provider: string;
    phoneNumber: string;
    name: string;
  };
  addedAt: string;
  lastUsed?: string;
}

export default function PaymentMethods() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<"card" | "upi" | "netbanking" | "wallet">("card");

  // Form states
  const [cardForm, setCardForm] = useState({
    last4: "",
    brand: "visa",
    expiryMonth: "",
    expiryYear: "",
    cardholderName: "",
    nickname: "",
  });

  const [upiForm, setUpiForm] = useState({
    upiId: "",
    name: "",
    nickname: "",
  });

  const [netBankingForm, setNetBankingForm] = useState({
    bankName: "",
    accountHolderName: "",
    ifscCode: "",
    nickname: "",
  });

  const [walletForm, setWalletForm] = useState({
    provider: "paytm",
    phoneNumber: "",
    name: "",
    nickname: "",
  });

  const colors = Colors[theme];

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        '${API_BASE_URL}/payment-methods/user/${user?._id}?activeOnly=true'
      );
      setPaymentMethods(response.data.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    try {
      let paymentData: any = {
        userId: user?._id,
        type: formType,
        nickname: "",
      };

      switch (formType) {
        case "card":
          paymentData.cardDetails = cardForm;
          paymentData.nickname = cardForm.nickname || `${cardForm.brand.toUpperCase()} •••• ${cardForm.last4}`;
          break;
        case "upi":
          paymentData.upiDetails = upiForm;
          paymentData.nickname = upiForm.nickname || upiForm.upiId;
          break;
        case "netbanking":
          paymentData.netBankingDetails = netBankingForm;
          paymentData.nickname = netBankingForm.nickname || netBankingForm.bankName;
          break;
        case "wallet":
          paymentData.walletDetails = walletForm;
          paymentData.nickname = walletForm.nickname || `${walletForm.provider.toUpperCase()} •••• ${walletForm.phoneNumber.slice(-4)}`;
          break;
      }

      const response = await axios.post('${API_BASE_URL}/payment-methods', paymentData);
      
      if (response.data.success) {
        setShowAddForm(false);
        resetForms();
        fetchPaymentMethods();
        Alert.alert("Success", "Payment method added successfully");
      }
    } catch (error) {
      console.error("Error adding payment method:", error);
      Alert.alert("Error", "Failed to add payment method");
    }
  };

  const deletePaymentMethod = async (id: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete('${API_BASE_URL}/payment-methods/${id}');
              if (response.data.success) {
                fetchPaymentMethods();
                Alert.alert("Success", "Payment method deleted successfully");
              }
            } catch (error) {
              console.error("Error deleting payment method:", error);
              Alert.alert("Error", "Failed to delete payment method");
            }
          },
        },
      ]
    );
  };

  const setAsDefault = async (id: string) => {
    try {
      const response = await axios.put('${API_BASE_URL}/payment-methods/${id}/set-default');
      if (response.data.success) {
        fetchPaymentMethods();
        Alert.alert("Success", "Payment method set as default");
      }
    } catch (error) {
      console.error("Error setting default payment method:", error);
      Alert.alert("Error", "Failed to set default payment method");
    }
  };

  const resetForms = () => {
    setCardForm({ last4: "", brand: "visa", expiryMonth: "", expiryYear: "", cardholderName: "", nickname: "" });
    setUpiForm({ upiId: "", name: "", nickname: "" });
    setNetBankingForm({ bankName: "", accountHolderName: "", ifscCode: "", nickname: "" });
    setWalletForm({ provider: "paytm", phoneNumber: "", name: "", nickname: "" });
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard size={24} color={colors.text} />;
      case "upi":
        return <Smartphone size={24} color={colors.text} />;
      case "netbanking":
        return <Building size={24} color={colors.text} />;
      case "wallet":
        return <Wallet size={24} color={colors.text} />;
      default:
        return <CreditCard size={24} color={colors.text} />;
    }
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    switch (method.type) {
      case "card":
        return `${method.cardDetails?.brand.toUpperCase()} •••• ${method.cardDetails?.last4}`;
      case "upi":
        return method.upiDetails?.upiId;
      case "netbanking":
        return method.netBankingDetails?.bankName;
      case "wallet":
        return `${method.walletDetails?.provider.toUpperCase()} •••• ${method.walletDetails?.phoneNumber.slice(-4)}`;
      default:
        return method.nickname;
    }
  };

  if (showAddForm) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Container>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Add Payment Method</Text>
              <View style={{ width: 24 }} />
            </View>
          </Container>
        </View>

        <ScrollView style={styles.content}>
          <Container>
            {/* Payment Type Selection */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Type</Text>
              <View style={styles.typeSelector}>
                {["card", "upi", "netbanking", "wallet"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formType === type && { backgroundColor: colors.buttonPrimary },
                    ]}
                    onPress={() => setFormType(type as any)}
                  >
                    <Text style={[styles.typeButtonText, formType === type && { color: colors.buttonPrimaryText }]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dynamic Form */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
              {formType === "card" && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Card Details</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Last 4 digits"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={cardForm.last4}
                    onChangeText={(text) => setCardForm({ ...cardForm, last4: text })}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Cardholder Name"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={cardForm.cardholderName}
                    onChangeText={(text) => setCardForm({ ...cardForm, cardholderName: text })}
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="MM"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={cardForm.expiryMonth}
                      onChangeText={(text) => setCardForm({ ...cardForm, expiryMonth: text })}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                      placeholder="YY"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={cardForm.expiryYear}
                      onChangeText={(text) => setCardForm({ ...cardForm, expiryYear: text })}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Nickname (optional)"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={cardForm.nickname}
                    onChangeText={(text) => setCardForm({ ...cardForm, nickname: text })}
                  />
                </>
              )}

              {formType === "upi" && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>UPI Details</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="UPI ID (e.g., user@upi)"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={upiForm.upiId}
                    onChangeText={(text) => setUpiForm({ ...upiForm, upiId: text })}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Account Holder Name"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={upiForm.name}
                    onChangeText={(text) => setUpiForm({ ...upiForm, name: text })}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Nickname (optional)"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={upiForm.nickname}
                    onChangeText={(text) => setUpiForm({ ...upiForm, nickname: text })}
                  />
                </>
              )}

              {formType === "netbanking" && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Net Banking Details</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Bank Name"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={netBankingForm.bankName}
                    onChangeText={(text) => setNetBankingForm({ ...netBankingForm, bankName: text })}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Account Holder Name"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={netBankingForm.accountHolderName}
                    onChangeText={(text) => setNetBankingForm({ ...netBankingForm, accountHolderName: text })}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="IFSC Code"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={netBankingForm.ifscCode}
                    onChangeText={(text) => setNetBankingForm({ ...netBankingForm, ifscCode: text })}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Nickname (optional)"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={netBankingForm.nickname}
                    onChangeText={(text) => setNetBankingForm({ ...netBankingForm, nickname: text })}
                  />
                </>
              )}

              {formType === "wallet" && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Wallet Details</Text>
                  <View style={styles.pickerContainer}>
                    <TouchableOpacity
                      style={[styles.pickerButton, walletForm.provider === "paytm" && { backgroundColor: colors.buttonPrimary }]}
                      onPress={() => setWalletForm({ ...walletForm, provider: "paytm" })}
                    >
                      <Text style={[styles.pickerButtonText, walletForm.provider === "paytm" && { color: colors.buttonPrimaryText }]}>Paytm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pickerButton, walletForm.provider === "phonepe" && { backgroundColor: colors.buttonPrimary }]}
                      onPress={() => setWalletForm({ ...walletForm, provider: "phonepe" })}
                    >
                      <Text style={[styles.pickerButtonText, walletForm.provider === "phonepe" && { color: colors.buttonPrimaryText }]}>PhonePe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pickerButton, walletForm.provider === "gpay" && { backgroundColor: colors.buttonPrimary }]}
                      onPress={() => setWalletForm({ ...walletForm, provider: "gpay" })}
                    >
                      <Text style={[styles.pickerButtonText, walletForm.provider === "gpay" && { color: colors.buttonPrimaryText }]}>GPay</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Phone Number"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={walletForm.phoneNumber}
                    onChangeText={(text) => setWalletForm({ ...walletForm, phoneNumber: text })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Account Holder Name"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={walletForm.name}
                    onChangeText={(text) => setWalletForm({ ...walletForm, name: text })}
                  />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Nickname (optional)"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={walletForm.nickname}
                    onChangeText={(text) => setWalletForm({ ...walletForm, nickname: text })}
                  />
                </>
              )}
            </View>

            <ThemedButton
              title="Add Payment Method"
              onPress={addPaymentMethod}
              fullWidth
              style={{ marginTop: 20 }}
            />
          </Container>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Container>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Plus size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Container>
      </View>

      <ScrollView style={styles.content}>
        <Container>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.buttonPrimary} />
            </View>
          ) : paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No payment methods added</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Add a payment method to make checkout faster
              </Text>
              <ThemedButton
                title="Add Payment Method"
                onPress={() => setShowAddForm(true)}
                style={{ marginTop: 20 }}
              />
            </View>
          ) : (
            <View style={styles.paymentMethodsList}>
              {paymentMethods.map((method) => (
                <View
                  key={method._id}
                  style={[styles.paymentMethodCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
                >
                  <View style={styles.paymentMethodHeader}>
                    <View style={styles.paymentMethodInfo}>
                      {getPaymentIcon(method.type)}
                      <View style={styles.paymentMethodDetails}>
                        <Text style={[styles.paymentMethodName, { color: colors.text }]}>
                          {method.nickname}
                        </Text>
                        <Text style={[styles.paymentMethodDisplay, { color: colors.textSecondary }]}>
                          {getPaymentMethodDisplay(method)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentMethodActions}>
                      {method.isDefault ? (
                        <Star size={20} color={colors.buttonPrimary} fill={colors.buttonPrimary} />
                      ) : (
                        <TouchableOpacity onPress={() => setAsDefault(method._id)}>
                          <StarOff size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => deletePaymentMethod(method._id)}>
                        <Trash2 size={20} color={colors.error || "#ff3b30"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {method.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.buttonPrimary }]}>
                      <Text style={[styles.defaultBadgeText, { color: colors.buttonPrimaryText }]}>Default</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: Platform.OS === 'web' ? 15 : 50,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  paymentMethodsList: {
    paddingVertical: 16,
  },
  paymentMethodCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
  },
  paymentMethodDisplay: {
    fontSize: 14,
    marginTop: 2,
  },
  paymentMethodActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  defaultBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});