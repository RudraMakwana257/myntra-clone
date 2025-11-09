const express = require("express");
const Bag = require("../models/Bag");
const DeviceToken = require("../models/DeviceToken");
const notificationService = require("../services/notificationService");
const router = express.Router();

/**
 * Check for cart abandonment and send reminders
 * This would typically be called by a cron job or scheduled task
 */
router.post("/check-abandonment", async (req, res) => {
  try {
    // Find all bags that haven't been updated in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const abandonedBags = await Bag.find({
      updatedAt: { $lt: oneDayAgo },
    }).populate("productId");

    const remindersSent = [];

    for (const bag of abandonedBags) {
      try {
        // Get user's active device tokens with cart reminders enabled
        const deviceTokens = await DeviceToken.find({
          userId: bag.userId,
          isActive: true,
          "preferences.cartReminders": true,
        });

        if (deviceTokens.length > 0) {
          const itemCount = bag.quantity || 1;
          const total = bag.productId ? bag.productId.price * itemCount : 0;

          const tokens = deviceTokens.map((dt) => dt.token);
          await notificationService.sendCartReminderNotification(
            tokens,
            itemCount,
            total
          );

          remindersSent.push({
            userId: bag.userId,
            itemCount,
            total,
          });
        }
      } catch (error) {
        console.error(`Error sending reminder for bag ${bag._id}:`, error);
      }
    }

    res.status(200).json({
      message: "Cart abandonment check completed",
      abandonedCarts: abandonedBags.length,
      remindersSent: remindersSent.length,
      details: remindersSent,
    });
  } catch (error) {
    console.error("Error checking cart abandonment:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Send cart reminder for a specific user
 */
router.post("/remind/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's bag items
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
      (sum, item) => sum + (item.productId ? item.productId.price * item.quantity : 0),
      0
    );

    const tokens = deviceTokens.map((dt) => dt.token);
    await notificationService.sendCartReminderNotification(
      tokens,
      itemCount,
      total
    );

    res.status(200).json({
      message: "Cart reminder sent successfully",
      itemCount,
      total,
    });
  } catch (error) {
    console.error("Error sending cart reminder:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;

