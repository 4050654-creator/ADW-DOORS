const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ========================================
    // Related Booking
    // ========================================

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // ========================================
    // Related Order
    // ========================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    // ========================================
    // Customer
    // ========================================

    customer: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      name: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ========================================
    // Payment Amount
    // ========================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ========================================
    // Payment Method
    // ========================================

    method: {
      type: String,
      enum: ["jazzcash", "easypaisa"],
      required: true,
    },

    // ========================================
    // Transaction Information
    // ========================================

    transactionId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    gatewayReference: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================
    // Payment Status
    // ========================================

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    // ========================================
    // Gateway Response
    // ========================================

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ========================================
    // Payment Date
    // ========================================

    paidAt: {
      type: Date,
      default: null,
    },

    // ========================================
    // Failure Reason
    // ========================================

    failureReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// Indexes
// ========================================

paymentSchema.index({
  booking: 1,
});

paymentSchema.index({
  order: 1,
});

paymentSchema.index({
  status: 1,
});

paymentSchema.index({
  method: 1,
});

paymentSchema.index({
  createdAt: -1,
});

// ========================================
// Model
// ========================================

module.exports = mongoose.model("Payment", paymentSchema);