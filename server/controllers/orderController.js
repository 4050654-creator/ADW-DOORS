const Order = require("../models/Order");
const Product = require("../models/Product");

// ===============================
// GENERATE ORDER NUMBER
// ===============================

const generateOrderNumber = () => {
  const time = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ADW-${time}-${random}`;
};

// ===============================
// CREATE ORDER
// ===============================

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      items,

      orderType = "full",

      shippingAddress,
      address,

      paymentMethod = "cod",
      paymentDetails = null,

      customerName,
      customerEmail,

      phone,
      customerPhone,

      shippingFee,
      deliveryFee,

      notes = "",

      bookingDetails = null,
    } = req.body;

    // ===============================
    // DEBUG REQUEST
    // ===============================

    console.log("================================");
    console.log("CREATE ORDER REQUEST");
    console.log("================================");

    console.log(
      "BODY:",
      JSON.stringify(req.body, null, 2)
    );

    console.log(
      "USER:",
      req.user
        ? {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
          }
        : null
    );

    // ===============================
    // ORDER TYPE
    // ===============================

    const finalOrderType =
      orderType === "booking"
        ? "booking"
        : "full";

    // ===============================
    // BOOKING DETAILS
    // ===============================

    let finalBookingDetails = null;

    if (finalOrderType === "booking") {
      const incomingBookingDetails =
        bookingDetails || {};

      const requiredDate =
        incomingBookingDetails.requiredDate || "";

      const requiredMonth =
        incomingBookingDetails.requiredMonth || "";

      const customerNote =
        incomingBookingDetails.customerNote ||
        incomingBookingDetails.note ||
        "";

      if (!requiredDate && !requiredMonth) {
        return res.status(400).json({
          success: false,
          message:
            "Booking ke liye required date ya required month select karna zaroori hai.",
        });
      }

      let parsedDate = null;

      if (requiredDate) {
        parsedDate = new Date(requiredDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message:
              "Booking date valid nahi hai.",
          });
        }
      }

      let finalMonth =
        typeof requiredMonth === "string"
          ? requiredMonth.trim()
          : "";

      if (parsedDate && !finalMonth) {
        finalMonth = parsedDate.toLocaleString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        );
      }

      finalBookingDetails = {
        requiredDate: parsedDate,
        requiredMonth: finalMonth,
        customerNote:
          typeof customerNote === "string"
            ? customerNote.trim()
            : "",
      };
    }

    // ===============================
    // ORDER ITEMS
    // ===============================

    const finalItems = items || orderItems;

    if (
      !finalItems ||
      !Array.isArray(finalItems) ||
      finalItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order must contain at least one product.",
      });
    }

    // ===============================
    // ADDRESS
    // ===============================

    const incomingAddress =
      address ||
      shippingAddress ||
      {};

    console.log(
      "INCOMING ADDRESS:",
      JSON.stringify(
        incomingAddress,
        null,
        2
      )
    );

    // Accept multiple possible frontend field names
    const finalAddress = {
      fullName: String(
        incomingAddress.fullName ||
          incomingAddress.name ||
          incomingAddress.customerName ||
          customerName ||
          req.user?.name ||
          req.user?.fullName ||
          ""
      ).trim(),

      phone: String(
        incomingAddress.phone ||
          incomingAddress.phoneNumber ||
          incomingAddress.customerPhone ||
          phone ||
          customerPhone ||
          req.user?.phone ||
          req.user?.phoneNumber ||
          ""
      ).trim(),

      email: String(
        incomingAddress.email ||
          incomingAddress.emailAddress ||
          customerEmail ||
          req.user?.email ||
          ""
      ).trim(),

      address: String(
        incomingAddress.address ||
          incomingAddress.completeAddress ||
          incomingAddress.deliveryAddress ||
          incomingAddress.streetAddress ||
          ""
      ).trim(),

      city: String(
        incomingAddress.city ||
          incomingAddress.deliveryCity ||
          ""
      ).trim(),

      postalCode: String(
        incomingAddress.postalCode ||
          incomingAddress.zipCode ||
          incomingAddress.zip ||
          ""
      ).trim(),

      instructions: String(
        incomingAddress.instructions ||
          incomingAddress.notes ||
          notes ||
          ""
      ).trim(),
    };

    console.log(
      "FINAL ADDRESS:",
      JSON.stringify(
        finalAddress,
        null,
        2
      )
    );

    // ===============================
    // ADDRESS VALIDATION
    // ===============================

    const missingFields = [];

    if (!finalAddress.fullName) {
      missingFields.push("full name");
    }

    if (!finalAddress.phone) {
      missingFields.push("phone");
    }

    if (!finalAddress.address) {
      missingFields.push("address");
    }

    if (!finalAddress.city) {
      missingFields.push("city");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Required fields missing: ${missingFields.join(", ")}.`,
        missingFields,
      });
    }

    // ===============================
    // PAYMENT METHOD
    // ===============================

    let formattedPaymentMethod = "cod";

    if (
      paymentMethod === "online" ||
      paymentMethod === "Online Payment" ||
      paymentMethod === "jazzcash" ||
      paymentMethod === "easypaisa"
    ) {
      formattedPaymentMethod = "online";
    }

    // ===============================
    // FIND PRODUCTS
    // ===============================

    const productIds = finalItems.map(
      (item) => item.product
    );

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
      isActive: true,
    });

    if (
      products.length !== finalItems.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more products are unavailable.",
      });
    }

    // ===============================
    // FORMAT ITEMS
    // ===============================

    const formattedOrderItems = [];

    let calculatedSubtotal = 0;
    let bookingAmount = 0;

    for (const item of finalItems) {
      const product = products.find(
        (productItem) =>
          productItem._id.toString() ===
          item.product.toString()
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      // ===============================
      // QUANTITY
      // ===============================

      const quantity = Number(
        item.quantity || 1
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${product.name}.`,
        });
      }

      // ===============================
      // STOCK CHECK
      // ===============================

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} does not have enough stock.`,
        });
      }

      // ===============================
      // PRODUCT PRICE
      // ===============================

      const currentPrice =
        product.salePrice !== null &&
        product.salePrice !== undefined &&
        Number(product.salePrice) <
          Number(product.price)
          ? Number(product.salePrice)
          : Number(product.price);

      const itemTotal =
        currentPrice * quantity;

      calculatedSubtotal += itemTotal;

      // ===============================
      // BOOKING PRICE
      // ===============================

      if (finalOrderType === "booking") {
        const productBookingPrice =
          Number(product.bookingPrice || 0);

        if (productBookingPrice <= 0) {
          return res.status(400).json({
            success: false,
            message:
              `${product.name} is not available for booking.`,
          });
        }

        bookingAmount +=
          productBookingPrice * quantity;
      }

      // ===============================
      // PRODUCT IMAGE
      // ===============================

      let productImage = "";

      if (
        product.images &&
        product.images.length > 0
      ) {
        const firstImage =
          product.images[0];

        if (
          typeof firstImage === "string"
        ) {
          productImage = firstImage;
        } else if (
          firstImage &&
          typeof firstImage.url === "string"
        ) {
          productImage = firstImage.url;
        }
      }

      if (!productImage && item.image) {
        productImage =
          typeof item.image === "string"
            ? item.image
            : item.image?.url || "";
      }

      // ===============================
      // FINAL ORDER ITEM
      // ===============================

      formattedOrderItems.push({
        product: product._id,
        name: product.name,
        price: currentPrice,
        quantity,
        image: productImage,
      });
    }

    // ===============================
    // TOTALS
    // ===============================

    const finalSubtotal =
      calculatedSubtotal;

    // Frontend se delivery/shipping fee lo
    const requestedShippingFee = Number(
      shippingFee ??
        deliveryFee ??
        0
    );

    const finalShippingFee =
      Number.isFinite(requestedShippingFee) &&
      requestedShippingFee >= 0
        ? requestedShippingFee
        : 0;

    const totalAmount =
      finalSubtotal +
      finalShippingFee;

    const finalBookingAmount =
      finalOrderType === "booking"
        ? Math.min(
            bookingAmount,
            totalAmount
          )
        : 0;

    const remainingAmount =
      finalOrderType === "booking"
        ? Math.max(
            totalAmount -
              finalBookingAmount,
            0
          )
        : 0;

    // ===============================
    // CREATE ORDER
    // ===============================

    const order =
      await Order.create({
        orderNumber:
          generateOrderNumber(),

        user:
          req.user?._id || null,

        items:
          formattedOrderItems,

        orderType:
          finalOrderType,

        bookingDetails:
          finalOrderType === "booking"
            ? finalBookingDetails
            : null,

        subtotal:
          finalSubtotal,

        shippingFee:
          finalShippingFee,

        totalAmount,

        bookingAmount:
          finalBookingAmount,

        remainingAmount,

        address:
          finalAddress,

        paymentMethod:
          formattedPaymentMethod,

        paymentDetails:
          formattedPaymentMethod === "online"
            ? paymentDetails || null
            : null,

        paymentStatus:
          "pending",

        orderStatus:
          "pending",

        notes:
          typeof notes === "string"
            ? notes.trim()
            : "",
      });

    // ===============================
    // REDUCE STOCK
    // ===============================

    for (const item of formattedOrderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // ===============================
    // SUCCESS
    // ===============================

    console.log(
      "================================"
    );

    console.log(
      "ORDER CREATED SUCCESSFULLY"
    );

    console.log(
      "ORDER NUMBER:",
      order.orderNumber
    );

    console.log(
      "TOTAL:",
      order.totalAmount
    );

    console.log(
      "================================"
    );

    return res.status(201).json({
      success: true,

      message:
        finalOrderType === "booking"
          ? "Booking created successfully."
          : "Order created successfully.",

      order,
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "CREATE ORDER ERROR:"
    );

    console.error(error);

    console.error(
      "================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create order.",
    });
  }
};

// ===============================
// GET MY ORDERS
// ===============================

const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "items.product",
          "name images"
        );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load orders.",
    });
  }
};

// ===============================
// GET SINGLE ORDER
// ===============================

const getOrderById = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      )
        .populate(
          "items.product",
          "name images"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    if (
      req.user.role !== "admin" &&
      (
        !order.user ||
        order.user.toString() !==
          req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load order.",
    });
  }
};

// ===============================
// GET ALL ORDERS - ADMIN
// ===============================

const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({})
        .populate(
          "user",
          "name email phone role"
        )
        .populate(
          "items.product",
          "name image images price salePrice"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get all orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load orders.",
    });
  }
};

// ===============================
// UPDATE ORDER STATUS - ADMIN
// ===============================

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { orderStatus } =
      req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(
        orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    order.orderStatus =
      orderStatus;

    // ===============================
    // COD PAID AFTER DELIVERY
    // ===============================

    if (
      orderStatus === "delivered" &&
      order.paymentMethod === "cod"
    ) {
      order.paymentStatus =
        "paid";
    }

    // ===============================
    // PAID ORDER REFUNDED ON CANCEL
    // ===============================

    if (
      orderStatus === "cancelled" &&
      order.paymentStatus === "paid"
    ) {
      order.paymentStatus =
        "refunded";
    }

    await order.save();

    const updatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "user",
          "name email phone role"
        )
        .populate(
          "items.product",
          "name image images price salePrice"
        );

    return res.status(200).json({
      success: true,
      message:
        "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update order status.",
    });
  }
};

// ===============================
// EXPORTS
// ===============================

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};