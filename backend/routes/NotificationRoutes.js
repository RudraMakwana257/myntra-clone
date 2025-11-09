const express = require("express");
const DeviceToken = require("../models/DeviceToken");
const Order = require("../models/Order");
const Bag = require("../models/Bag");
const router = express.Router();

/**
 * Register a device token for push notifications
 */
router.post("/register", async (req, res) => {
  try {
    const { userId, token, platform, deviceId, deviceName, preferences } =
      req.body;

    if (!userId || !token || !platform) {
      return res
        .status(400)
        .json({ message: "userId, token, and platform are required" });
    }

    // Check if token already exists
    let deviceToken = await DeviceToken.findOne({ token });

    if (deviceToken) {
      // Update existing token
      deviceToken.userId = userId;
      deviceToken.platform = platform;
      deviceToken.deviceId = deviceId || deviceToken.deviceId;
      deviceToken.deviceName = deviceName || deviceToken.deviceName;
      deviceToken.isActive = true;
      deviceToken.lastUsed = new Date();
      if (preferences) {
        deviceToken.preferences = { ...deviceToken.preferences, ...preferences };
      }
      await deviceToken.save();
    } else {
      // Create new token
      deviceToken = new DeviceToken({
        userId,
        token,
        platform,
        deviceId,
        deviceName,
        preferences: preferences || {
          offers: true,
          orderUpdates: true,
          cartReminders: true,
        },
      });
      await deviceToken.save();
    }

    res.status(200).json({
      message: "Device token registered successfully",
      deviceToken,
    });
  } catch (error) {
    console.error("Error registering device token:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Unregister a device token
 */
router.post("/unregister", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "token is required" });
    }

    const deviceToken = await DeviceToken.findOne({ token });
    if (deviceToken) {
      deviceToken.isActive = false;
      await deviceToken.save();
    }

    res.status(200).json({ message: "Device token unregistered successfully" });
  } catch (error) {
    console.error("Error unregistering device token:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Update notification preferences for a user
 */
router.patch("/preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ message: "preferences are required" });
    }

    // Update preferences for all active tokens of the user
    await DeviceToken.updateMany(
      { userId, isActive: true },
      {
        $set: {
          preferences: {
            offers: preferences.offers !== undefined ? preferences.offers : true,
            orderUpdates:
              preferences.orderUpdates !== undefined
                ? preferences.orderUpdates
                : true,
            cartReminders:
              preferences.cartReminders !== undefined
                ? preferences.cartReminders
                : true,
          },
        },
      }
    );

    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Get all active device tokens for a user
 */
router.get("/tokens/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tokens = await DeviceToken.find({ userId, isActive: true });
    res.status(200).json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Send notification to a user (internal endpoint)
 * This would typically be called by other services
 */
router.post("/send", async (req, res) => {
  try {
    const {
      userId,
      title,
      body,
      data,
      type = "general", // 'offer', 'order', 'cart', 'general'
      scheduledFor = null, // ISO date string for scheduled notifications
    } = req.body;

    if (!userId || !title || !body) {
      return res
        .status(400)
        .json({ message: "userId, title, and body are required" });
    }

    // Get all active device tokens for the user
    const deviceTokens = await DeviceToken.find({
      userId,
      isActive: true,
    });

    if (deviceTokens.length === 0) {
      return res
        .status(404)
        .json({ message: "No active device tokens found for user" });
    }

    // Check notification preferences based on type
    const filteredTokens = deviceTokens.filter((token) => {
      switch (type) {
        case "offer":
          return token.preferences.offers;
        case "order":
          return token.preferences.orderUpdates;
        case "cart":
          return token.preferences.cartReminders;
        default:
          return true;
      }
    });

    if (filteredTokens.length === 0) {
      return res
        .status(200)
        .json({ message: "User has disabled notifications for this type" });
    }

    // In a real implementation, you would send notifications via Expo Push API
    // For now, we'll return the tokens that should receive notifications
    // The actual sending would be done by a notification service

    res.status(200).json({
      message: "Notification queued for sending",
      tokens: filteredTokens.map((t) => t.token),
      scheduledFor,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Send order status update notification
 */
router.post("/order-update", async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: "orderId and status are required" });
    }

    // Get order details
    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = order.userId._id || order.userId;

    // Get active device tokens
    const deviceTokens = await DeviceToken.find({
      userId,
      isActive: true,
      "preferences.orderUpdates": true,
    });

    if (deviceTokens.length === 0) {
      return res
        .status(200)
        .json({ message: "No active tokens with order updates enabled" });
    }

    const title = "Order Status Update";
    const body = `Your order #${orderId} is now ${status}`;

    res.status(200).json({
      message: "Order update notification queued",
      tokens: deviceTokens.map((t) => t.token),
      notification: {
        title,
        body,
        data: {
          type: "order",
          orderId: orderId.toString(),
          status,
        },
      },
    });
  } catch (error) {
    console.error("Error sending order update:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Send cart abandonment reminder
 */
router.post("/cart-reminder", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Check if user has items in cart
    const bagItems = await Bag.find({ userId }).populate("productId");
    if (bagItems.length === 0) {
      return res.status(200).json({ message: "Cart is empty" });
    }

    // Get active device tokens with cart reminders enabled
    const deviceTokens = await DeviceToken.find({
      userId,
      isActive: true,
      "preferences.cartReminders": true,
    });

    if (deviceTokens.length === 0) {
      return res
        .status(200)
        .json({ message: "No active tokens with cart reminders enabled" });
    }

    const itemCount = bagItems.length;
    const total = bagItems.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    const title = "Don't forget your items!";
    const body = `You have ${itemCount} item${itemCount > 1 ? "s" : ""} worth ₹${total.toFixed(2)} in your cart`;

    res.status(200).json({
      message: "Cart reminder notification queued",
      tokens: deviceTokens.map((t) => t.token),
      notification: {
        title,
        body,
        data: {
          type: "cart",
          itemCount,
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error sending cart reminder:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Send offer notification
 */
router.post("/offer", async (req, res) => {
  try {
    const { userId, title, body, offerData } = req.body;

    if (!userId || !title || !body) {
      return res
        .status(400)
        .json({ message: "userId, title, and body are required" });
    }

    // Get active device tokens with offers enabled
    const deviceTokens = await DeviceToken.find({
      userId,
      isActive: true,
      "preferences.offers": true,
    });

    if (deviceTokens.length === 0) {
      return res
        .status(200)
        .json({ message: "No active tokens with offers enabled" });
    }

    res.status(200).json({
      message: "Offer notification queued",
      tokens: deviceTokens.map((t) => t.token),
      notification: {
        title,
        body,
        data: {
          type: "offer",
          ...offerData,
        },
      },
    });
  } catch (error) {
    console.error("Error sending offer notification:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;

