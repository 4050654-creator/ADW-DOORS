const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

const router = express.Router();

// ==========================================
// CUSTOMER
// ==========================================

// Create booking
router.post("/", protect, createBooking);

// Customer's own bookings
router.get("/my", protect, getMyBookings);

// ==========================================
// ADMIN
// ==========================================

// Get all bookings
router.get(
  "/",
  protect,
  adminOnly,
  getBookings
);

// Get single booking
router.get(
  "/:id",
  protect,
  adminOnly,
  getBookingById
);

// Update booking status
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

// Delete booking
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteBooking
);

module.exports = router;