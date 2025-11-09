const express = require("express");
const Wishlist = require("../models/Wishlist");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ 
        message: "userId and productId are required",
        isInWishlist: false 
      });
    }

    // First, clean up any duplicates for this user and product
    // This ensures only one item exists per product
    const allDuplicates = await Wishlist.find({ 
      userId: userId, 
      productId: productId 
    });
    
    if (allDuplicates.length > 1) {
      // Keep the first one, delete the rest
      const keepId = allDuplicates[0]._id;
      const deleteIds = allDuplicates.slice(1).map(item => item._id);
      await Wishlist.deleteMany({ _id: { $in: deleteIds } });
      console.log(`Cleaned up ${deleteIds.length} duplicate wishlist items for user ${userId}, product ${productId}`);
    }

    // Check if product already exists in wishlist
    const existingItem = await Wishlist.findOne({ 
      userId: userId, 
      productId: productId 
    });

    if (existingItem) {
      // Remove from wishlist if it already exists (toggle behavior)
      await Wishlist.findByIdAndDelete(existingItem._id);
      return res.status(200).json({ 
        message: "Item removed from wishlist",
        isInWishlist: false,
        removed: true,
        wishlistItemId: null
      });
    }

    // Add to wishlist if it doesn't exist
    // Double-check to prevent race conditions
    let wishlistItem = await Wishlist.findOne({ userId, productId });
    
    if (wishlistItem) {
      // Item was added between checks (race condition)
      // Return as if it was just added
      return res.status(200).json({
        message: "Item already in wishlist",
        isInWishlist: true,
        added: false,
        wishlistItemId: wishlistItem._id.toString()
      });
    }
    
    // Create new wishlist item
    wishlistItem = new Wishlist({ userId, productId });
    await wishlistItem.save();
    
    res.status(200).json({
      message: "Item added to wishlist",
      isInWishlist: true,
      added: true,
      wishlistItemId: wishlistItem._id.toString()
    });
  } catch (error) {
    // Handle duplicate key error (unique index violation)
    if (error.code === 11000 || error.name === 'MongoServerError') {
      // If duplicate detected, clean up and try again
      try {
        const { userId, productId } = req.body;
        // Delete all duplicates and keep only one
        const duplicates = await Wishlist.find({ userId, productId });
        if (duplicates.length > 0) {
          // Keep the first one, delete the rest
          const keepId = duplicates[0]._id;
          const deleteIds = duplicates.slice(1).map(item => item._id);
          if (deleteIds.length > 0) {
            await Wishlist.deleteMany({ _id: { $in: deleteIds } });
          }
          // Return the kept item
          const keptItem = await Wishlist.findById(keepId);
          return res.status(200).json({
            message: "Item already in wishlist (duplicate cleaned)",
            isInWishlist: true,
            added: false,
            wishlistItemId: keptItem._id.toString()
          });
        }
      } catch (removeError) {
        console.error("Error removing duplicate:", removeError);
      }
    }
    console.error("Error managing wishlist:", error);
    return res.status(500).json({ 
      message: "Something went wrong",
      isInWishlist: false 
    });
  }
});

router.get("/:userid", async (req, res) => {
  try {
    // First, clean up any duplicates for this user
    // Group by productId and keep only the first occurrence
    const allItems = await Wishlist.find({ userId: req.params.userid });
    
    // Find duplicates by productId
    const seenProducts = new Map();
    const duplicatesToDelete = [];
    
    allItems.forEach((item) => {
      const productIdStr = item.productId.toString();
      if (seenProducts.has(productIdStr)) {
        // This is a duplicate - mark for deletion
        duplicatesToDelete.push(item._id);
      } else {
        // First occurrence - keep it
        seenProducts.set(productIdStr, item._id);
      }
    });
    
    // Delete duplicates
    if (duplicatesToDelete.length > 0) {
      await Wishlist.deleteMany({ _id: { $in: duplicatesToDelete } });
      console.log(`Cleaned up ${duplicatesToDelete.length} duplicate wishlist items for user ${req.params.userid}`);
    }
    
    // Now fetch the cleaned wishlist
    const wishlist = await Wishlist.find({ userId: req.params.userid }).populate(
      "productId"
    );
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Check if a product is in user's wishlist
router.get("/check/:userid/:productid", async (req, res) => {
  try {
    const { userid, productid } = req.params;
    const wishlistItem = await Wishlist.findOne({ 
      userId: userid, 
      productId: productid 
    });
    
    res.status(200).json({ 
      isInWishlist: !!wishlistItem,
      wishlistItemId: wishlistItem?._id || null
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.delete("/:itemid", async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from Wishlist" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from Wishlist" });
  }
});
module.exports = router;
