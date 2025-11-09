import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Download,
  FileText,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import Container from "@/components/Container";
import { useResponsive } from "@/hooks/use-responsive";
import axios from "axios";

interface Transaction {
  _id: string;
  transactionId: string;
  type: "Online" | "COD" | "Refund";
  amount: number;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  paymentMethod: string;
  description: string;
  receiptNumber?: string;
  createdAt: string;
  orderId?: any;
}

type FilterType = "All" | "Online" | "COD" | "Refund";
type FilterStatus = "All" | "Completed" | "Pending" | "Failed" | "Refunded";

export default function Transactions() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { isDesktop } = useResponsive();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "All") params.append("type", filterType);
      if (filterStatus !== "All") params.append("status", filterStatus);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await axios.get(
        `https://myntra-clone-fdcv.onrender.com/transaction/user/${user._id}?${params.toString()}`
      );
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, filterType, filterStatus, sortBy, sortOrder]);

  // Download receipt for a transaction
  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const response = await axios.get(
        `https://myntra-clone-fdcv.onrender.com/transaction/${transactionId}/receipt`,
        {
          responseType: "blob",
        }
      );

      // Create a blob URL and trigger download
      if (Platform.OS === "web") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `receipt_${transactionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // For mobile, you might need to use a library like expo-file-system
        Alert.alert("Receipt", "Receipt download started");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      Alert.alert("Error", "Failed to download receipt");
    }
  };

  // Export transactions as CSV
  const handleExportCSV = async () => {
    if (!user) return;

    try {
      const params = new URLSearchParams();
      if (filterType !== "All") params.append("type", filterType);
      if (filterStatus !== "All") params.append("status", filterStatus);

      const response = await axios.get(
        `https://myntra-clone-fdcv.onrender.com/transaction/user/${user._id}/export/csv?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      if (Platform.OS === "web") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `transactions_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        Alert.alert("Success", "CSV exported successfully");
      } else {
        Alert.alert("Export", "CSV export started");
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      Alert.alert("Error", "Failed to export CSV");
    }
  };

  // Export transactions as PDF
  const handleExportPDF = async () => {
    if (!user) return;

    try {
      const params = new URLSearchParams();
      if (filterType !== "All") params.append("type", filterType);
      if (filterStatus !== "All") params.append("status", filterStatus);

      const response = await axios.get(
        `https://myntra-clone-fdcv.onrender.com/transaction/user/${user._id}/export/pdf?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      if (Platform.OS === "web") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `transactions_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        Alert.alert("Success", "PDF exported successfully");
      } else {
        Alert.alert("Export", "PDF export started");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Alert.alert("Error", "Failed to export PDF");
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Completed":
        return { icon: CheckCircle, color: "#00b852" };
      case "Pending":
        return { icon: Clock, color: "#ffa500" };
      case "Failed":
        return { icon: XCircle, color: "#ff3f6c" };
      case "Refunded":
        return { icon: RefreshCw, color: "#6c757d" };
      default:
        return { icon: Clock, color: colors.textSecondary };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Container>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              My Transactions
            </Text>
          </Container>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Please login to view your transactions
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Container>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              My Transactions
            </Text>
          </View>
        </Container>
      </View>

      {/* Filters and Export Buttons */}
      <View
        style={[
          styles.actionsBar,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Container>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: showFilters
                    ? colors.buttonPrimary
                    : colors.backgroundSecondary,
                },
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} color={showFilters ? "#fff" : colors.text} />
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: showFilters ? "#fff" : colors.text,
                    marginLeft: 5,
                  },
                ]}
              >
                Filter
              </Text>
            </TouchableOpacity>

            <View style={styles.exportButtons}>
              <TouchableOpacity
                style={[styles.exportButton, { borderColor: colors.border }]}
                onPress={handleExportCSV}
              >
                <FileText size={18} color={colors.text} />
                <Text style={[styles.exportButtonText, { color: colors.text }]}>
                  CSV
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exportButton, { borderColor: colors.border }]}
                onPress={handleExportPDF}
              >
                <Download size={18} color={colors.text} />
                <Text style={[styles.exportButtonText, { color: colors.text }]}>
                  PDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Options */}
          {showFilters && (
            <View style={[styles.filtersContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  Type:
                </Text>
                <View style={styles.filterOptions}>
                  {(["All", "Online", "COD", "Refund"] as FilterType[]).map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterOption,
                          {
                            backgroundColor:
                              filterType === type
                                ? colors.buttonPrimary
                                : colors.backgroundSecondary,
                          },
                        ]}
                        onPress={() => setFilterType(type)}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            {
                              color:
                                filterType === type ? "#fff" : colors.text,
                            },
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  Status:
                </Text>
                <View style={styles.filterOptions}>
                  {([
                    "All",
                    "Completed",
                    "Pending",
                    "Failed",
                    "Refunded",
                  ] as FilterStatus[]).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor:
                            filterStatus === status
                              ? colors.buttonPrimary
                              : colors.backgroundSecondary,
                        },
                      ]}
                      onPress={() => setFilterStatus(status)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color:
                              filterStatus === status ? "#fff" : colors.text,
                          },
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>
                  Sort By:
                </Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor:
                          sortBy === "date"
                            ? colors.buttonPrimary
                            : colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => setSortBy("date")}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        {
                          color: sortBy === "date" ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      Date
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor:
                          sortBy === "amount"
                            ? colors.buttonPrimary
                            : colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => setSortBy("amount")}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        {
                          color: sortBy === "amount" ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      Amount
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    <Text style={[styles.sortOrderText, { color: colors.text }]}>
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Container>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.content}>
        <Container>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.buttonPrimary} />
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No transactions found
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => {
              const StatusIcon = getStatusInfo(transaction.status).icon;
              const statusColor = getStatusInfo(transaction.status).color;

              return (
                <View
                  key={transaction._id}
                  style={[
                    styles.transactionCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.cardBorder,
                      shadowColor: colors.shadow,
                    },
                  ]}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionHeaderLeft}>
                      <StatusIcon size={20} color={statusColor} />
                      <View style={styles.transactionInfo}>
                        <Text
                          style={[styles.transactionId, { color: colors.text }]}
                        >
                          {transaction.transactionId}
                        </Text>
                        <Text
                          style={[
                            styles.transactionDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatDate(transaction.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text
                        style={[
                          styles.amount,
                          {
                            color:
                              transaction.type === "Refund"
                                ? "#ff3f6c"
                                : colors.text,
                          },
                        ]}
                      >
                        {transaction.type === "Refund" ? "-" : "+"}₹
                        {transaction.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionDetails}>
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Type:
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {transaction.type}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Status:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          { color: statusColor, fontWeight: "600" },
                        ]}
                      >
                        {transaction.status}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Payment:
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {transaction.paymentMethod}
                      </Text>
                    </View>
                    {transaction.description && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Description:
                        </Text>
                        <Text
                          style={[styles.detailValue, { color: colors.text }]}
                        >
                          {transaction.description}
                        </Text>
                      </View>
                    )}
                  </View>

                  {transaction.status === "Completed" &&
                    transaction.receiptNumber && (
                      <TouchableOpacity
                        style={[
                          styles.receiptButton,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => handleDownloadReceipt(transaction._id)}
                      >
                        <Download size={16} color={colors.buttonPrimary} />
                        <Text
                          style={[
                            styles.receiptButtonText,
                            { color: colors.buttonPrimary },
                          ]}
                        >
                          Download Receipt
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              );
            })
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
    paddingTop: Platform.OS === "web" ? 15 : 50,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actionsBar: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  exportButtons: {
    flexDirection: "row",
    gap: 10,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filtersContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sortOrderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  sortOrderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
  transactionCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  transactionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 10,
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    width: 90,
  },
  detailValue: {
    fontSize: 13,
    flex: 1,
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

