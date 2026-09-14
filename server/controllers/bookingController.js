const Booking = require("../models/Booking");
const Product = require("../models/Product");

// ==========================================
// HELPER
// ==========================================

const getProductImage = (product) => {
  const candidates = [
    product?.images?.[0]?.url,
    typeof product?.images?.[0] === "string"
      ? product.images[0]
      : "",
    product?.image?.url,
    typeof product?.image === "string"
      ? product.image
      : "",
  ];

  const image = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  return image ? image.trim() : "";
};

// ==========================================
// CREATE BOOKING
// POST /api/bookings
// ==========================================

const createBooking = async (req, res) => {
  try {
    const {
      productId,
      product,
      customer,
      requiredDate,
      requiredMonth,
      customerNote,
    } = req.body;

    // ==========================================
    // PRODUCT ID
    // ==========================================

    const finalProductId = productId || product;

    if (!finalProductId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    // ==========================================
    // CUSTOMER
    // ==========================================

    if (!customer) {
      return res.status(400).json({
        success: false,
        message:
          "Customer information is required.",
      });
    }

    if (!customer.name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (!customer.email?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Customer email is required.",
      });
    }

    if (!customer.phone?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Customer phone number is required.",
      });
    }

    // ==========================================
    // REQUIRED DATE / MONTH
    // ==========================================

    if (!requiredDate && !requiredMonth) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a required date or required month.",
      });
    }

    // ==========================================
    // FIND PRODUCT
    // ==========================================

    const productData = await Product.findById(
      finalProductId
    ).populate("category", "name");

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (!productData.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "This product is currently unavailable.",
      });
    }

    // ==========================================
    // BOOKING PRICE
    // ==========================================

    const bookingPrice = Number(
      productData.bookingPrice || 0
    );

    if (bookingPrice <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is not available for this product.",
      });
    }

    // ==========================================
    // DATE
    // ==========================================

    let parsedDate = null;

    if (requiredDate) {
      parsedDate = new Date(requiredDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking date.",
        });
      }
    }

    // ==========================================
    // MONTH
    // ==========================================

    let normalizedMonth =
      typeof requiredMonth === "string"
        ? requiredMonth.trim()
        : "";

    if (parsedDate && !normalizedMonth) {
      normalizedMonth = parsedDate
        .toISOString()
        .slice(0, 7);
    }

    // ==========================================
    // USER ID
    // ==========================================

    const userId =
      req.user?._id ||
      req.user?.id ||
      null;

    // ==========================================
    // CREATE BOOKING
    // ==========================================

    const booking = await Booking.create({
      customer: {
        user: userId,
        name: customer.name.trim(),
        email: customer.email
          .trim()
          .toLowerCase(),
        phone: customer.phone.trim(),
      },

      product: productData._id,

      productName: productData.name,

      productImage:
        getProductImage(productData),

      bookingPrice,

      requiredDate: parsedDate,

      requiredMonth: normalizedMonth,

      customerNote:
        typeof customerNote === "string"
          ? customerNote.trim()
          : "",

      // IMPORTANT:
      // Booking remains pending until payment
      // is successfully verified.
      status: "pending",
    });

    // ==========================================
    // POPULATE BOOKING
    // ==========================================

    const populatedBooking =
      await Booking.findById(booking._id)
        .populate(
          "product",
          "name slug images price bookingPrice"
        )
        .populate(
          "customer.user",
          "name email"
        );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Booking created successfully. Payment is required to confirm your booking.",

      booking: populatedBooking,

      paymentRequired: true,

      paymentAmount: bookingPrice,
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "CREATE BOOKING ERROR"
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
        "Booking create nahi ho saki.",
    });
  }
};

// ==========================================
// GET MY BOOKINGS
// GET /api/bookings/my
// ==========================================

const getMyBookings = async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    const bookings = await Booking.find({
      "customer.user": userId,
    })
      .populate(
        "product",
        "name slug images price bookingPrice"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get my bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Bookings load nahi ho sakin.",
    });
  }
};

// ==========================================
// GET ALL BOOKINGS
// ADMIN
// GET /api/bookings
// ==========================================

const getBookings = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const perPage = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const filter = {};

    // ==========================================
    // STATUS FILTER
    // ==========================================

    if (
      status &&
      [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
      ].includes(status)
    ) {
      filter.status = status;
    }

    // ==========================================
    // SEARCH
    // ==========================================

    if (search?.trim()) {
      const searchText =
        search.trim();

      filter.$or = [
        {
          "customer.name": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "customer.email": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "customer.phone": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          productName: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    // ==========================================
    // TOTAL
    // ==========================================

    const total =
      await Booking.countDocuments(
        filter
      );

    // ==========================================
    // BOOKINGS
    // ==========================================

    const bookings =
      await Booking.find(filter)
        .populate(
          "product",
          "name slug images price bookingPrice"
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

      bookings,

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
      "Get bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Bookings load nahi ho sakin.",
    });
  }
};

// ==========================================
// GET SINGLE BOOKING
// ADMIN
// GET /api/bookings/:id
// ==========================================

const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      )
        .populate(
          "product",
          "name slug images price bookingPrice"
        )
        .populate(
          "customer.user",
          "name email role"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Booking load nahi ho saki.",
    });
  }
};

// ==========================================
// UPDATE BOOKING STATUS
// ADMIN
// PATCH /api/bookings/:id/status
// ==========================================

const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      adminNote,
    } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status.",
      });
    }

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.status = status;

    if (
      typeof adminNote === "string"
    ) {
      booking.adminNote =
        adminNote.trim();
    }

    await booking.save();

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "product",
          "name slug images price bookingPrice"
        )
        .populate(
          "customer.user",
          "name email role"
        );

    return res.json({
      success: true,
      message:
        "Booking status updated successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Update booking status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Booking status update nahi ho saka.",
    });
  }
};

// ==========================================
// DELETE BOOKING
// ADMIN
// DELETE /api/bookings/:id
// ==========================================

const deleteBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    await Booking.findByIdAndDelete(
      req.params.id
    );

    return res.json({
      success: true,
      message:
        "Booking deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Booking delete nahi ho saki.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};