const express = require("express");
const PaymentMethod = require("../models/PaymentMethod");
const router = express.Router();

/**
 * Get all payment methods for a user
 * GET /api/payment-methods/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, activeOnly } = req.query;

    const query = { userId };
    
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    
    if (type) {
      query.type = type;
    }

    const paymentMethods = await PaymentMethod.find(query)
      .sort({ isDefault: -1, addedAt: -1 });

    res.status(200).json({
      success: true,
      data: paymentMethods,
      count: paymentMethods.length
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods"
    });
  }
});

/**
 * Get a specific payment method
 * GET /api/payment-methods/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found"
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    console.error("Error fetching payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment method"
    });
  }
});

/**
 * Add a new payment method
 * POST /api/payment-methods
 */
router.post("/", async (req, res) => {
  try {
    const paymentMethodData = req.body;
    
    // If this is the first payment method for the user, make it default
    const existingMethods = await PaymentMethod.find({ 
      userId: paymentMethodData.userId, 
      isActive: true 
    });
    
    if (existingMethods.length === 0) {
      paymentMethodData.isDefault = true;
    }

    const paymentMethod = new PaymentMethod(paymentMethodData);
    await paymentMethod.save();

    res.status(201).json({
      success: true,
      message: "Payment method added successfully",
      data: paymentMethod
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add payment method"
    });
  }
});

/**
 * Update a payment method
 * PUT /api/payment-methods/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: paymentMethod
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment method"
    });
  }
});

/**
 * Delete a payment method (soft delete)
 * DELETE /api/payment-methods/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentMethod = await PaymentMethod.findById(id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found"
      });
    }

    // Soft delete by setting isActive to false
    paymentMethod.isActive = false;
    await paymentMethod.save();

    // If this was the default method, set another active method as default
    if (paymentMethod.isDefault) {
      const activeMethods = await PaymentMethod.find({ 
        userId: paymentMethod.userId, 
        isActive: true 
      }).sort({ addedAt: 1 });
      
      if (activeMethods.length > 0) {
        activeMethods[0].isDefault = true;
        await activeMethods[0].save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment method"
    });
  }
});

/**
 * Set a payment method as default
 * PUT /api/payment-methods/:id/set-default
 */
router.put("/:id/set-default", async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentMethod = await PaymentMethod.findById(id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found"
      });
    }

    // Set as default (this will automatically unset other defaults due to pre-save hook)
    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: "Payment method set as default successfully",
      data: paymentMethod
    });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set default payment method"
    });
  }
});

/**
 * Update last used timestamp for a payment method
 * PUT /api/payment-methods/:id/update-last-used
 */
router.put("/:id/update-last-used", async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { lastUsed: new Date() },
      { new: true }
    );
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment method last used timestamp updated"
    });
  } catch (error) {
    console.error("Error updating last used timestamp:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update last used timestamp"
    });
  }
});

module.exports = router;