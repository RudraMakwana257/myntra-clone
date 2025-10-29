const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const Bags = new Bag(req.body);
    const saveitem = await Bags.save();
    res.status(200).json(saveitem);
  } catch (error) {
    console.log(error);
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
