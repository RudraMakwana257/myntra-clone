const mongoose = require("mongoose");

/**
 * Transaction model to track all payment-related activities
 * Includes orders, refunds, and other payment transactions
 */
const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // Optional for refunds that might not have an order
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Online", "COD", "Refund"],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Completed", "Pending", "Failed", "Refunded"],
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentDetails: {
      // Store additional payment information
      cardLast4: String,
      cardType: String,
      bankName: String,
      upiId: String,
      transactionReference: String,
    },
    description: {
      type: String,
      default: "",
    },
    // Store receipt/invoice data
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);

