const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// ==========================================
// HELPERS
// ==========================================

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    null
  );
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// CREATE PAYMENT
// POST /api/payments
// ==========================================

const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      method,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    const userId = getUserId(req);

    // ========================================
    // AUTH
    // ========================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    // ========================================
    // BOOKING ID
    // ========================================

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });
    }

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID.",
      });
    }

    // ========================================
    // PAYMENT METHOD
    // ========================================

    const normalizedMethod =
      typeof method === "string"
        ? method.trim().toLowerCase()
        : "";

    if (
      !["jazzcash", "easypaisa"].includes(
        normalizedMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method. JazzCash or Easypaisa required.",
      });
    }

    // ========================================
    // AMOUNT
    // ========================================

    const paymentAmount = Number(
      amount
    );

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid payment amount is required.",
      });
    }

    // ========================================
    // FIND BOOKING
    // ========================================

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }

    // ========================================
    // BOOKING OWNERSHIP
    // ========================================

    const bookingUserId =
      booking.customer?.user
        ? booking.customer.user.toString()
        : null;

    if (
      bookingUserId &&
      bookingUserId !==
        userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to pay for this booking.",
      });
    }

    // ========================================
    // BOOKING STATUS
    // ========================================

    if (
      booking.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled booking cannot be paid.",
      });
    }

    if (
      booking.status ===
      "rejected"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejected booking cannot be paid.",
      });
    }

    if (
      booking.status ===
      "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed booking does not require payment.",
      });
    }

    // ========================================
    // CHECK AMOUNT
    // ========================================

    const bookingAmount = Number(
      booking.bookingPrice || 0
    );

    if (
      bookingAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking payment amount is invalid.",
      });
    }

    if (
      paymentAmount !==
      bookingAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Payment amount must be ${bookingAmount}.`,
      });
    }

    // ========================================
    // CHECK EXISTING PAYMENT
    // ========================================

    const existingPaidPayment =
      await Payment.findOne({
        booking: booking._id,
        status: "paid",
      });

    if (existingPaidPayment) {
      return res.status(400).json({
        success: false,
        message:
          "Payment for this booking has already been completed.",
        payment:
          existingPaidPayment,
      });
    }

    // ========================================
    // EXISTING PENDING PAYMENT
    // ========================================

    const existingPayment =
      await Payment.findOne({
        booking: booking._id,

        status: {
          $in: [
            "pending",
            "processing",
          ],
        },
      }).sort({
        createdAt: -1,
      });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message:
          "Existing payment request found.",
        payment:
          existingPayment,
        paymentRequired: true,
      });
    }

    // ========================================
    // CUSTOMER DATA
    // ========================================

    const finalName =
      customerName?.trim() ||
      booking.customer?.name ||
      "";

    const finalEmail =
      customerEmail
        ?.trim()
        .toLowerCase() ||
      booking.customer?.email ||
      "";

    const finalPhone =
      customerPhone?.trim() ||
      booking.customer?.phone ||
      "";

    // ========================================
    // TRANSACTION ID
    // ========================================

    const transactionId =
      `ADW-${Date.now()}-${Math.floor(
        Math.random() * 1000000
      )}`;

    // ========================================
    // CREATE PAYMENT
    // ========================================

    const payment =
      await Payment.create({
        booking: booking._id,

        order: null,

        customer: {
          user: userId,

          name: finalName,

          email: finalEmail,

          phone: finalPhone,
        },

        amount:
          bookingAmount,

        method:
          normalizedMethod,

        transactionId,

        gatewayReference: "",

        status: "pending",

        gatewayResponse: null,

        paidAt: null,

        failureReason: "",
      });

    // ========================================
    // MAKE SURE BOOKING IS PENDING
    // ========================================

    if (
      booking.status !==
      "pending"
    ) {
      booking.status =
        "pending";

      await booking.save();
    }

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Payment request created successfully.",

      payment,

      paymentRequired: true,

      paymentAmount:
        bookingAmount,

      gatewayReady: false,

      gatewayMessage:
        "Official payment gateway integration is pending.",
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "CREATE PAYMENT ERROR"
    );

    console.error(
      "================================"
    );

    console.error(error);

    console.error(
      "================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payment request create nahi ho saki.",
    });
  }
};

// ==========================================
// GET MY PAYMENTS
// GET /api/payments/my
// ==========================================

const getMyPayments = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    const payments =
      await Payment.find({
        "customer.user":
          userId,
      })
        .populate(
          "booking",
          "productName bookingPrice requiredDate requiredMonth status"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,

      payments,
    });
  } catch (error) {
    console.error(
      "Get my payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payments load nahi ho sakin.",
    });
  }
};

// ==========================================
// GET PAYMENT BY ID
// GET /api/payments/:id
// ==========================================

const getPaymentById = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    const paymentId =
      req.params.id;

    if (
      !isValidObjectId(
        paymentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment ID.",
      });
    }

    const payment =
      await Payment.findById(
        paymentId
      )
        .populate(
          "booking",
          "productName bookingPrice requiredDate requiredMonth status"
        )
        .populate(
          "customer.user",
          "name email role"
        );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found.",
      });
    }

    // ========================================
    // ADMIN CAN VIEW
    // ========================================

    if (
      req.user?.role ===
      "admin"
    ) {
      return res.json({
        success: true,
        payment,
      });
    }

    // ========================================
    // CUSTOMER OWNERSHIP
    // ========================================

    const paymentUserId =
      payment.customer?.user
        ? payment.customer.user.toString()
        : null;

    if (
      !paymentUserId ||
      paymentUserId !==
        userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this payment.",
      });
    }

    return res.json({
      success: true,

      payment,
    });
  } catch (error) {
    console.error(
      "Get payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payment load nahi ho saki.",
    });
  }
};

// ==========================================
// GET ALL PAYMENTS
// ADMIN
// GET /api/payments
// ==========================================

const getPayments = async (
  req,
  res
) => {
  try {
    const {
      status,
      method,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage =
      Math.max(
        Number(page) || 1,
        1
      );

    const perPage =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      );

    const filter = {};

    // ========================================
    // STATUS
    // ========================================

    const allowedStatuses = [
      "pending",
      "processing",
      "paid",
      "failed",
      "cancelled",
      "refunded",
    ];

    if (
      status &&
      allowedStatuses.includes(
        status
      )
    ) {
      filter.status =
        status;
    }

    // ========================================
    // METHOD
    // ========================================

    if (
      method &&
      ["jazzcash", "easypaisa"].includes(
        method
      )
    ) {
      filter.method =
        method;
    }

    // ========================================
    // SEARCH
    // ========================================

    if (search?.trim()) {
      const searchText =
        search.trim();

      filter.$or = [
        {
          transactionId: {
            $regex:
              searchText,
            $options: "i",
          },
        },

        {
          gatewayReference: {
            $regex:
              searchText,
            $options: "i",
          },
        },

        {
          "customer.name": {
            $regex:
              searchText,
            $options: "i",
          },
        },

        {
          "customer.email": {
            $regex:
              searchText,
            $options: "i",
          },
        },

        {
          "customer.phone": {
            $regex:
              searchText,
            $options: "i",
          },
        },
      ];
    }

    // ========================================
    // TOTAL
    // ========================================

    const total =
      await Payment.countDocuments(
        filter
      );

    // ========================================
    // PAYMENTS
    // ========================================

    const payments =
      await Payment.find(filter)
        .populate(
          "booking",
          "productName bookingPrice requiredDate requiredMonth status"
        )
        .populate(
          "customer.user",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (currentPage - 1) *
            perPage
        )
        .limit(perPage);

    return res.json({
      success: true,

      payments,

      pagination: {
        page: currentPage,

        limit: perPage,

        total,

        pages: Math.ceil(
          total / perPage
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payments load nahi ho sakin.",
    });
  }
};

// ==========================================
// UPDATE PAYMENT STATUS
// ADMIN
// PATCH /api/payments/:id/status
// ==========================================

const updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      gatewayReference,
      failureReason,
    } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "paid",
      "failed",
      "cancelled",
      "refunded",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status.",
      });
    }

    const payment =
      await Payment.findById(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found.",
      });
    }

    // ========================================
    // UPDATE PAYMENT
    // ========================================

    payment.status =
      status;

    if (
      typeof gatewayReference ===
      "string"
    ) {
      payment.gatewayReference =
        gatewayReference.trim();
    }

    if (
      typeof failureReason ===
      "string"
    ) {
      payment.failureReason =
        failureReason.trim();
    }

    // ========================================
    // PAID
    // ========================================

    if (
      status === "paid"
    ) {
      payment.paidAt =
        new Date();

      payment.failureReason =
        "";

      // ======================================
      // CONFIRM BOOKING
      // ======================================

      if (
        payment.booking
      ) {
        const booking =
          await Booking.findById(
            payment.booking
          );

        if (booking) {
          booking.status =
            "confirmed";

          await booking.save();
        }
      }
    }

    // ========================================
    // FAILED
    // ========================================

    if (
      status === "failed"
    ) {
      payment.paidAt =
        null;

      if (
        payment.booking
      ) {
        const booking =
          await Booking.findById(
            payment.booking
          );

        if (booking) {
          booking.status =
            "pending";

          await booking.save();
        }
      }
    }

    // ========================================
    // CANCELLED
    // ========================================

    if (
      status === "cancelled"
    ) {
      payment.paidAt =
        null;

      if (
        payment.booking
      ) {
        const booking =
          await Booking.findById(
            payment.booking
          );

        if (booking) {
          booking.status =
            "cancelled";

          await booking.save();
        }
      }
    }

    // ========================================
    // PROCESSING
    // ========================================

    if (
      status ===
      "processing"
    ) {
      if (
        payment.booking
      ) {
        const booking =
          await Booking.findById(
            payment.booking
          );

        if (booking) {
          booking.status =
            "pending";

          await booking.save();
        }
      }
    }

    // ========================================
    // REFUNDED
    // ========================================

    if (
      status === "refunded"
    ) {
      payment.paidAt =
        payment.paidAt ||
        new Date();

      if (
        payment.booking
      ) {
        const booking =
          await Booking.findById(
            payment.booking
          );

        if (booking) {
          booking.status =
            "cancelled";

          await booking.save();
        }
      }
    }

    await payment.save();

    // ========================================
    // POPULATE
    // ========================================

    const updatedPayment =
      await Payment.findById(
        payment._id
      )
        .populate(
          "booking",
          "productName bookingPrice requiredDate requiredMonth status"
        )
        .populate(
          "customer.user",
          "name email role"
        );

    // ========================================
    // RESPONSE
    // ========================================

    return res.json({
      success: true,

      message:
        "Payment status updated successfully.",

      payment:
        updatedPayment,
    });
  } catch (error) {
    console.error(
      "Update payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payment status update nahi ho saka.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentById,
  getPayments,
  updatePaymentStatus,
};