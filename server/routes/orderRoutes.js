const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

router.put(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

router.get(
  "/:id",
  protect,
  getOrderById
);

module.exports = router;