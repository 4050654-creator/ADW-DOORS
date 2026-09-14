const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productImage: {
      type: String,
      default: "",
      trim: true,
    },

    bookingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    requiredDate: {
      type: Date,
      default: null,
    },

    requiredMonth: {
      type: String,
      trim: true,
      default: "",
    },

    customerNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ status: 1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ product: 1 });
bookingSchema.index({ requiredDate: 1 });
bookingSchema.index({ requiredMonth: 1 });

module.exports = mongoose.model("Booking", bookingSchema);