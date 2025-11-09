const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Wishlist = require("../models/Wishlist");
const BrowsingHistory = require("../models/BrowsingHistory");
const router = express.Router();

/**
 * Get product recommendations based on:
 * 1. Same category products
 * 2. User's browsing history
 * 3. User's wishlist items
 * 4. Similar products (same brand, similar price range)
 * 
 * The algorithm scores products and returns top recommendations
 */
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.query.userId; // Optional: userId for personalized recommendations
    const limit = parseInt(req.query.limit) || 10; // Number of recommendations to return

    // Find the current product
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find which category this product belongs to
    // Products are linked to categories through the Category model's productId array
    const category = await Category.findOne({ productId: productId });
    const categoryProductIds = category?.productId?.map((id) => id.toString()) || [];

    // Get all products except the current one
    const allProducts = await Product.find({
      _id: { $ne: productId },
    });

    // Score products based on multiple factors
    const scoredProducts = await Promise.all(
      allProducts.map(async (product) => {
        let score = 0;

        // Factor 1: Same category (highest weight: 40 points)
        const productIdStr = product._id.toString();
        if (categoryProductIds.includes(productIdStr)) {
          score += 40;
        }

        // Factor 2: Same brand (weight: 20 points)
        if (product.brand === currentProduct.brand) {
          score += 20;
        }

        // Factor 3: Similar price range (weight: 15 points)
        // Consider products within 30% price difference
        const priceDiff = Math.abs(product.price - currentProduct.price);
        const priceThreshold = currentProduct.price * 0.3;
        if (priceDiff <= priceThreshold) {
          score += 15;
        }

        // Factor 4: User-specific recommendations (if userId provided)
        if (userId) {
          // Check if product is in user's wishlist (weight: 15 points)
          const inWishlist = await Wishlist.findOne({
            userId: userId,
            productId: product._id,
          });
          if (inWishlist) {
            score += 15;
          }

          // Check browsing history (weight: 10 points)
          // If user has viewed similar products, boost this product
          const recentViews = await BrowsingHistory.find({
            userId: userId,
            viewedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          })
            .populate("productId")
            .limit(50);

          // Check if user has viewed products from same category
          const viewedCategoryProducts = recentViews.filter(
            (view) =>
              view.productId &&
              categoryProductIds.some(
                (id) => id.toString() === view.productId._id.toString()
              )
          );
          if (viewedCategoryProducts.length > 0) {
            score += 10;
          }

          // Check if user has viewed products from same brand
          const viewedBrandProducts = recentViews.filter(
            (view) =>
              view.productId && view.productId.brand === currentProduct.brand
          );
          if (viewedBrandProducts.length > 0) {
            score += 5;
          }
        }

        // Factor 5: Discount boost (weight: 5 points)
        if (product.discount) {
          const discountMatch = product.discount.match(/(\d+)%/);
          if (discountMatch && parseInt(discountMatch[1]) >= 30) {
            score += 5;
          }
        }

        return {
          product,
          score,
        };
      })
    );

    // Sort by score (highest first) and get top recommendations
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Track product view in browsing history
 * Called when a user views a product detail page
 */
router.post("/track-view", async (req, res) => {
  try {
    const { userId, productId, viewDuration } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    // Check if this view already exists (to avoid duplicates)
    const existingView = await BrowsingHistory.findOne({
      userId: userId,
      productId: productId,
      viewedAt: {
        $gte: new Date(Date.now() - 60 * 60 * 1000), // Within last hour
      },
    });

    if (!existingView) {
      // Create new browsing history entry
      const browsingHistory = new BrowsingHistory({
        userId: userId,
        productId: productId,
        viewDuration: viewDuration || 0,
      });
      await browsingHistory.save();

      // Keep only last 100 browsing history entries per user (to prevent database bloat)
      const userHistoryCount = await BrowsingHistory.countDocuments({ userId: userId });
      if (userHistoryCount > 100) {
        const oldestEntries = await BrowsingHistory.find({ userId: userId })
          .sort({ viewedAt: 1 })
          .limit(userHistoryCount - 100);
        await BrowsingHistory.deleteMany({
          _id: { $in: oldestEntries.map((e) => e._id) },
        });
      }
    }

    res.status(200).json({ message: "View tracked successfully" });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;

