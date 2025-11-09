const mongoose = require("mongoose");

/**
 * Tracks user browsing history for personalized recommendations
 * Stores product views with timestamps to understand user preferences
 */
const BrowsingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for time-based queries
    },
    // Store additional context for better recommendations
    viewDuration: {
      type: Number, // in seconds, optional
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
BrowsingHistorySchema.index({ userId: 1, viewedAt: -1 });
BrowsingHistorySchema.index({ userId: 1, productId: 1 });

module.exports = mongoose.model("BrowsingHistory", BrowsingHistorySchema);

