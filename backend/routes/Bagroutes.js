const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, productId, size, quantity = 1 } = req.body;

    if (!userId || !productId || !size) {
      return res.status(400).json({ message: "userId, productId, and size are required" });
    }

    // Check if the same product with same size already exists in bag
    const existingItem = await Bag.findOne({ 
      userId, 
      productId, 
      size 
    });

    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = (existingItem.quantity || 1) + (quantity || 1);
      const updated = await Bag.findByIdAndUpdate(
        existingItem._id,
        { $set: { quantity: newQuantity } },
        { new: true }
      ).populate("productId");
      
      return res.status(200).json({
        ...updated.toObject(),
        updated: true
      });
    }

    // Create new bag item if it doesn't exist
    const bagItem = new Bag({ userId, productId, size, quantity });
    const savedItem = await bagItem.save();
    const populatedItem = await Bag.findById(savedItem._id).populate("productId");
    
    res.status(200).json({
      ...populatedItem.toObject(),
      added: true
    });
  } catch (error) {
    // Handle duplicate key error (unique index violation)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      // If duplicate, update quantity instead
      const existingItem = await Bag.findOne({ userId, productId, size });
      if (existingItem) {
        const newQuantity = (existingItem.quantity || 1) + (quantity || 1);
        const updated = await Bag.findByIdAndUpdate(
          existingItem._id,
          { $set: { quantity: newQuantity } },
          { new: true }
        ).populate("productId");
        
        return res.status(200).json({
          ...updated.toObject(),
          updated: true
        });
      }
    }
    console.error("Error managing bag:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:userid", async (req, res) => {
  try {
    const bag = await Bag.find({ userId: req.params.userid }).populate(
      "productId"
    );
    res.status(200).json(bag);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from bag" });
  }
});

// Update quantity for a bag item
router.patch("/:itemid", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== "number") {
      return res.status(400).json({ message: "Quantity must be a number" });
    }

    // If quantity less than 1, remove the item from bag
    if (quantity < 1) {
      await Bag.findByIdAndDelete(req.params.itemid);
      return res.status(200).json({ message: "Item removed from bag" });
    }

    const updated = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { $set: { quantity } },
      { new: true }
    ).populate("productId");

    if (!updated) {
      return res.status(404).json({ message: "Bag item not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating item quantity" });
  }
});
module.exports = router;
