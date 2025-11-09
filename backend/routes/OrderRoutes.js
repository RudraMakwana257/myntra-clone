const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const DeviceToken = require("../models/DeviceToken");
const notificationService = require("../services/notificationService");
const router = express.Router();
const mongoose = require("mongoose");

function genrateRandomTracking() {
  const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
  const statusOptions = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "In Transit",
  ];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
  const randomcarrier = carriers[Math.floor(Math.random() * carriers.length)];
  const randomstatusOptions =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const randomlocations =
    locations[Math.floor(Math.random() * locations.length)];

  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier: randomcarrier,
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentLocation: randomlocations,
    status: randomstatusOptions,
    timeline: [
      {
        status: "Order placed",
        location: "Warehouse",
        timestamp: new Date().toISOString(),
      },
      {
        status: randomstatusOptions,
        location: randomlocations,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
router.post("/create/:userId", async (req, res) => {
  try {
    const userid = req.params.userId;
    const bag = await Bag.find({ userId: userid }).populate("productId");
    if (bag.length === 0) {
      return res.status(400).json({ message: "No item in the bag" });
    }
    const orderitem = bag.map((item) => ({
      productId: item.productId._id,
      size: item.size,
      price: item.productId.price,
      quantity: item.quantity,
    }));
    const total = orderitem.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const newOrder = new Order({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: orderitem,
      total: total,
      shippingAddress: req.body.shippingAddress,
      paymentMethod:req.body.paymentMethod,
      tracking: genrateRandomTracking(),
    });
    await newOrder.save();
    
    // Create transaction record for the payment
    const paymentMethod = req.body.paymentMethod || "COD";
    const transactionType = paymentMethod === "COD" ? "COD" : "Online";
    const transactionStatus = paymentMethod === "COD" ? "Pending" : "Completed";
    
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    let receiptNumber = null;
    if (transactionStatus === "Completed") {
      receiptNumber = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
    
    const transaction = new Transaction({
      userId: userid,
      orderId: newOrder._id,
      transactionId,
      type: transactionType,
      amount: total,
      status: transactionStatus,
      paymentMethod: paymentMethod,
      description: `Payment for Order #${newOrder._id}`,
      receiptNumber,
    });
    
    await transaction.save();
    await Bag.deleteMany({ userId: userid });
    
    // Send order confirmation notification
    try {
      const deviceTokens = await DeviceToken.find({
        userId: userid,
        isActive: true,
        "preferences.orderUpdates": true,
      });
      
      if (deviceTokens.length > 0) {
        const tokens = deviceTokens.map((dt) => dt.token);
        await notificationService.sendOrderUpdateNotification(
          tokens,
          newOrder._id.toString(),
          "Processing"
        );
      }
    } catch (error) {
      console.error("Error sending order notification:", error);
      // Don't fail the order creation if notification fails
    }
    
    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
router.get("/user/:userid", async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.userid }).populate(
      "items.productId"
    );
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;