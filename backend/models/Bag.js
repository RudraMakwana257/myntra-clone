const mongoose = require("mongoose");

const BagItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

// Create unique compound index to prevent duplicate products with same size in bag
// Same product with different sizes is allowed
BagItemSchema.index({ userId: 1, productId: 1, size: 1 }, { unique: true });

module.exports = mongoose.model("Bag", BagItemSchema);
