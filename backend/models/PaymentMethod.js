const mongoose = require("mongoose");

/**
 * Payment Method model to store user's saved payment methods
 * Supports multiple payment types: Card, UPI, Net Banking, Wallet
 */
const PaymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["card", "upi", "netbanking", "wallet"],
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Card-specific fields
    cardDetails: {
      last4: {
        type: String,
        required: function() { return this.type === 'card'; }
      },
      brand: {
        type: String,
        enum: ["visa", "mastercard", "amex", "discover", "rupay"],
        required: function() { return this.type === 'card'; }
      },
      expiryMonth: {
        type: String,
        required: function() { return this.type === 'card'; }
      },
      expiryYear: {
        type: String,
        required: function() { return this.type === 'card'; }
      },
      cardholderName: {
        type: String,
        required: function() { return this.type === 'card'; }
      }
    },
    // UPI-specific fields
    upiDetails: {
      upiId: {
        type: String,
        required: function() { return this.type === 'upi'; }
      },
      name: {
        type: String,
        required: function() { return this.type === 'upi'; }
      }
    },
    // Net Banking-specific fields
    netBankingDetails: {
      bankName: {
        type: String,
        required: function() { return this.type === 'netbanking'; }
      },
      accountHolderName: {
        type: String,
        required: function() { return this.type === 'netbanking'; }
      },
      ifscCode: {
        type: String,
        required: function() { return this.type === 'netbanking'; }
      }
    },
    // Wallet-specific fields
    walletDetails: {
      provider: {
        type: String,
        enum: ["paytm", "phonepe", "gpay", "amazonpay"],
        required: function() { return this.type === 'wallet'; }
      },
      phoneNumber: {
        type: String,
        required: function() { return this.type === 'wallet'; }
      },
      name: {
        type: String,
        required: function() { return this.type === 'wallet'; }
      }
    },
    // Additional metadata
    nickname: {
      type: String,
      maxlength: 50,
      default: ""
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PaymentMethodSchema.index({ userId: 1, isActive: 1 });
PaymentMethodSchema.index({ userId: 1, type: 1 });
PaymentMethodSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one default payment method per user
PaymentMethodSchema.pre("save", async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);