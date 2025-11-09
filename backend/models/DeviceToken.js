const mongoose = require("mongoose");

/**
 * DeviceToken model to store user device tokens for push notifications
 * Supports multiple devices per user and different platforms
 */
const DeviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["ios", "android", "web"],
      index: true,
    },
    deviceId: {
      type: String,
      required: false, // Optional device identifier
    },
    deviceName: {
      type: String,
      required: false, // Optional device name for user reference
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
    // Notification preferences
    preferences: {
      offers: {
        type: Boolean,
        default: true,
      },
      orderUpdates: {
        type: Boolean,
        default: true,
      },
      cartReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
DeviceTokenSchema.index({ userId: 1, isActive: 1 });
DeviceTokenSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.model("DeviceToken", DeviceTokenSchema);

