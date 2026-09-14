const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    walletType: {
      type: String,
      default: "",
    },

    senderAccount: {
      type: String,
      default: "",
    },

    transactionId: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const bookingDetailsSchema = new mongoose.Schema(
  {
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
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one product.",
      },
    },

    // full = normal purchase
    // booking = advance booking
    orderType: {
      type: String,
      enum: ["full", "booking"],
      default: "full",
    },

    // Booking information
    bookingDetails: {
      type: bookingDetailsSchema,
      default: null,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Amount customer pays/reserves at booking time
    bookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Remaining amount after booking payment
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    address: {
      type: addressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentDetails: {
      type: paymentDetailsSchema,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "partially_paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);

