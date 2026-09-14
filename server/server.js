const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ===============================
// CORS
// ===============================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ===============================
// BODY PARSER
// ===============================

app.use(
  express.json({
    limit: "15mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "15mb",
  })
);

// ===============================
// ROOT API
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "ADW Store API is running 🚀",
  });
});

// ===============================
// API ROUTES
// ===============================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "GLOBAL ERROR:",
      error
    );

    res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error.",
      ...(process.env.NODE_ENV ===
        "development" && {
        stack: error.stack,
      }),
    });
  }
);

// ===============================
// SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `ADW Store Server running on port ${PORT}`
    );

    console.log(
      "Auth API: /api/auth"
    );

    console.log(
      "Users API: /api/users"
    );

    console.log(
      "Products API: /api/products"
    );

    console.log(
      "Categories API: /api/categories"
    );

    console.log(
      "Orders API: /api/orders"
    );

    console.log(
      "Bookings API: /api/bookings"
    );

    console.log(
      "Payment API: /api/payments"
    );

    console.log(
      "Contact API: /api/contact"
    );
  }
);