const express = require("express");
const Product = require("../models/Product");
const mongoose = require('mongoose');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Product.find();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  const productid = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(productid)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productid);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;
