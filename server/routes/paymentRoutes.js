const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createPayment,
  getMyPayments,
  getPaymentById,
  getPayments,
  updatePaymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

// ========================================
// CUSTOMER
// ========================================

// Create payment
router.post(
  "/",
  protect,
  createPayment
);

// My payments
router.get(
  "/my",
  protect,
  getMyPayments
);

// ========================================
// ADMIN
// ========================================

// Get all payments
router.get(
  "/",
  protect,
  adminOnly,
  getPayments
);

// Update payment status
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updatePaymentStatus
);

// ========================================
// PAYMENT DETAILS
// ========================================

router.get(
  "/:id",
  protect,
  getPaymentById
);

module.exports = router;