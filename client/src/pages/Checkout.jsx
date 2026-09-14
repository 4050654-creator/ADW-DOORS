import React, { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  WalletCards,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCheckout } from "../context/CheckoutContext";

import { createOrder } from "../services/api";

// ============================================
// Product Image Helper
// ============================================

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

// ============================================
// Price Formatter
// ============================================

const formatPrice = (value) => {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
};

// ============================================
// Checkout Component
// ============================================

const Checkout = () => {
  const navigate = useNavigate();

  const auth = useAuth();

  const { user, token } = auth || {};

  const { cartItems, clearCart } = useCart();

  const {
    checkoutItems,
    buyNowItem,
    clearBuyNow,
  } = useCheckout();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // ============================================
  // Form
  // ============================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Lahore",
    postalCode: "",
    notes: "",
  });

  // ============================================
  // Load Logged-in User Information
  // ============================================

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      name:
        previous.name.trim() ||
        user?.name ||
        user?.fullName ||
        "",

      email:
        previous.email.trim() ||
        user?.email ||
        "",

      phone:
        previous.phone.trim() ||
        user?.phone ||
        user?.phoneNumber ||
        "",
    }));
  }, [user]);

  // ============================================
  // Checkout Items
  // ============================================

  const items = useMemo(() => {
    if (
      Array.isArray(checkoutItems) &&
      checkoutItems.length > 0
    ) {
      return checkoutItems;
    }

    if (buyNowItem) {
      return [buyNowItem];
    }

    return Array.isArray(cartItems)
      ? cartItems
      : [];
  }, [
    checkoutItems,
    buyNowItem,
    cartItems,
  ]);

  // ============================================
  // Subtotal
  // ============================================

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = item?.product || item;

      const price =
        Number(item?.salePrice) > 0
          ? Number(item.salePrice)
          : Number(
              item?.price ||
                product?.salePrice ||
                product?.price ||
                0
            );

      const quantity = Math.max(
        1,
        Number(item?.quantity || 1)
      );

      return total + price * quantity;
    }, 0);
  }, [items]);

  // ============================================
  // Delivery Fee
  // ============================================

  const deliveryFee =
    subtotal >= 5000 || subtotal === 0
      ? 0
      : 250;

  // ============================================
  // Final Total
  // ============================================

  const total = subtotal + deliveryFee;

  // ============================================
  // Input Change
  // ============================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ============================================
  // Place Order
  // ============================================

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------
    // Authentication
    // --------------------------------------------

    if (!user || !token) {
      setError(
        "Please login first before placing your order."
      );

      return;
    }

    // --------------------------------------------
    // Cart Check
    // --------------------------------------------

    if (!items.length) {
      setError("Your cart is empty.");

      return;
    }

    // --------------------------------------------
    // Normalize Form Values
    // --------------------------------------------

    const customerName = String(
      form.name || ""
    ).trim();

    const customerEmail = String(
      form.email || ""
    ).trim();

    const customerPhone = String(
      form.phone || ""
    ).trim();

    const deliveryAddress = String(
      form.address || ""
    ).trim();

    const deliveryCity = String(
      form.city || ""
    ).trim();

    const postalCode = String(
      form.postalCode || ""
    ).trim();

    const customerNote = String(
      form.notes || ""
    ).trim();

    // --------------------------------------------
    // Validation
    // --------------------------------------------

    if (!customerName) {
      setError("Please enter your full name.");
      return;
    }

    if (!customerEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!customerPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!deliveryAddress) {
      setError(
        "Please enter your complete delivery address."
      );

      return;
    }

    if (!deliveryCity) {
      setError("Please enter your city.");
      return;
    }

    // --------------------------------------------
    // Create Order Items
    // --------------------------------------------

    const orderItems = items.map((item) => {
      const product = item?.product || item;

      const price =
        Number(item?.salePrice) > 0
          ? Number(item.salePrice)
          : Number(
              item?.price ||
                product?.salePrice ||
                product?.price ||
                0
            );

      const productId =
        item?.product?._id ||
        item?.product?.id ||
        item?.product ||
        item?._id ||
        item?.id;

      return {
        product: productId,

        name:
          item?.name ||
          product?.name ||
          "Product",

        image: getProductImage(product),

        quantity: Math.max(
          1,
          Number(item?.quantity || 1)
        ),

        price,
      };
    });

    // --------------------------------------------
    // Validate Product IDs
    // --------------------------------------------

    const invalidItem = orderItems.find(
      (item) => !item.product
    );

    if (invalidItem) {
      setError(
        "Product information is incomplete. Please remove the item and add it again."
      );

      return;
    }

    // ============================================
    // FINAL ORDER PAYLOAD
    // ============================================
    //
    // IMPORTANT:
    // Backend phone ko shippingAddress.phone
    // se read kar raha hai.
    //
    // Isliye phone yahan zaroor bhejna hai.
    // ============================================

    const orderData = {
      // Order Type
      orderType: "full",

      // Products
      items: orderItems,
      orderItems: orderItems,

      // Customer Information
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },

      // Extra customer fields
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      phone: customerPhone,

      // ==========================================
      // Shipping Address
      // ==========================================
      //
      // IMPORTANT:
      // Backend finalAddress.phone ko yahan se
      // read karega.
      // ==========================================

      shippingAddress: {
        fullName: customerName,
        name: customerName,

        phone: customerPhone,

        email: customerEmail,

        address: deliveryAddress,

        city: deliveryCity,

        postalCode: postalCode,

        instructions: customerNote,
      },

      // ==========================================
      // Address Compatibility
      // ==========================================

      address: {
        fullName: customerName,

        name: customerName,

        phone: customerPhone,

        email: customerEmail,

        address: deliveryAddress,

        city: deliveryCity,

        postalCode: postalCode,

        instructions: customerNote,
      },

      // ==========================================
      // Payment
      // ==========================================

      paymentMethod: paymentMethod,

      paymentDetails: null,

      // ==========================================
      // Notes
      // ==========================================

      notes: customerNote,

      customerNote: customerNote,

      // ==========================================
      // Amounts
      // ==========================================

      subtotal: Number(subtotal),

      shippingFee: Number(deliveryFee),

      deliveryFee: Number(deliveryFee),

      shippingCost: Number(deliveryFee),

      totalAmount: Number(total),
    };

    // ============================================
    // Debug Order Data
    // ============================================

    console.log(
      "================================"
    );

    console.log("ADW STORE ORDER DATA");

    console.log(
      "================================"
    );

    console.log(orderData);

    console.log(
      "PHONE:",
      orderData.shippingAddress.phone
    );

    console.log(
      "SHIPPING ADDRESS:",
      orderData.shippingAddress
    );

    console.log(
      "================================"
    );

    // ============================================
    // Create Order
    // ============================================

    try {
      setLoading(true);

      const response =
        await createOrder(orderData);

      // ==========================================
      // Debug Response
      // ==========================================

      console.log(
        "================================"
      );

      console.log("ORDER RESPONSE");

      console.log(
        "================================"
      );

      console.log(response);

      console.log(
        "================================"
      );

      // ==========================================
      // Get Created Order
      // ==========================================

      const createdOrder =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        response;

      // ==========================================
      // Get Order ID
      // ==========================================

      const orderId =
        createdOrder?._id ||
        createdOrder?.id;

      if (!orderId) {
        throw new Error(
          "Order create ho gaya lagta hai lekin Order ID nahi mili."
        );
      }

      // ==========================================
      // Clear Cart
      // ==========================================
      //
      // Sirf successful order ke baad cart clear
      // hoga.
      // ==========================================

      clearCart();

      clearBuyNow();

      // ==========================================
      // Go To Success Page
      // ==========================================

      navigate(
        `/order-success/${orderId}`,
        {
          state: {
            order: createdOrder,
          },

          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "================================"
      );

      console.error("CHECKOUT ERROR");

      console.error(
        "================================"
      );

      console.error(err);

      console.error(
        "================================"
      );

      // ==========================================
      // Backend Error
      // ==========================================

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          err?.message ||
          "Order place nahi ho saka. Please dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Login Required
  // ============================================

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <User size={30} />
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              Login Required
            </h1>

            <p className="mt-2 text-slate-500">
              Checkout complete karne ke liye
              pehle login karein.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 font-bold text-white transition hover:bg-slate-800"
            >
              Login Now

              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // Empty Cart
  // ============================================

  if (!items.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShoppingBag size={30} />
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              Your Cart is Empty
            </h1>

            <p className="mt-2 text-slate-500">
              Checkout karne ke liye pehle koi
              product add karein.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 font-bold text-white transition hover:bg-slate-800"
            >
              Continue Shopping

              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // Checkout UI
  // ============================================

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Top Header */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={17} />

                Back
              </button>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Checkout
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Complete your order securely and
                quickly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Secure Checkout
                </p>

                <p className="text-xs text-slate-500">
                  Your information is protected
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}

          <div className="mt-7 flex items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                <Check size={16} />
              </div>

              <span className="hidden text-sm font-bold text-slate-900 sm:block">
                Cart
              </span>
            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-5" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                2
              </div>

              <span className="hidden text-sm font-bold text-slate-900 sm:block">
                Details
              </span>
            </div>

            <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-5" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-bold text-slate-400">
                3
              </div>

              <span className="hidden text-sm font-medium text-slate-400 sm:block">
                Confirmation
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Error */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
            >
              {error}
            </motion.div>
          )}

          <div className="grid gap-7 lg:grid-cols-[1fr_410px]">
            {/* ================================= */}
            {/* LEFT */}
            {/* ================================= */}

            <div className="space-y-6">
              {/* Customer Information */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <User size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Customer Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tell us where we can reach you.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="Enter your full name"
                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                      />
                    </div>
                  </div>

                  {/* Phone */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        placeholder="03XX XXXXXXX"
                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                      />
                    </div>
                  </div>

                  {/* Email */}

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="your@email.com"
                      className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    />
                  </div>
                </div>
              </motion.section>

              {/* Delivery */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.08,
                }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Delivery Address
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Where should we deliver your
                      order?
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Address */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Complete Address
                    </label>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={4}
                      autoComplete="street-address"
                      placeholder="House / Flat / Street / Area"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* City */}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                        placeholder="Lahore"
                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                      />
                    </div>

                    {/* Postal Code */}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Postal Code
                      </label>

                      <input
                        type="text"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        autoComplete="postal-code"
                        placeholder="54000"
                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                      />
                    </div>
                  </div>

                  {/* Note */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Order Note{" "}
                      <span className="font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any special instructions?"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                    />
                  </div>
                </div>
              </motion.section>

              {/* Payment */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.16,
                }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                    <CreditCard size={21} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Payment Method
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose your preferred payment
                      option.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* COD */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("cod")
                    }
                    className={`relative rounded-2xl border-2 p-5 text-left transition ${
                      paymentMethod === "cod"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
                        <Check size={14} />
                      </span>
                    )}

                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Truck size={20} />
                    </div>

                    <p className="font-black text-slate-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Pay when your order arrives.
                    </p>
                  </button>

                  {/* Online */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("online")
                    }
                    className={`relative rounded-2xl border-2 p-5 text-left transition ${
                      paymentMethod === "online"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {paymentMethod === "online" && (
                      <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
                        <Check size={14} />
                      </span>
                    )}

                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                      <WalletCards size={20} />
                    </div>

                    <p className="font-black text-slate-900">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Online payment option.
                    </p>
                  </button>
                </div>
              </motion.section>
            </div>

            {/* ================================= */}
            {/* RIGHT */}
            {/* ================================= */}

            <div className="lg:sticky lg:top-6 lg:self-start">
              <motion.div
                initial={{
                  opacity: 0,
                  x: 15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
              >
                {/* Summary Header */}

                <div className="bg-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
                        Your Order
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        Order Summary
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                      <Package size={21} />
                    </div>
                  </div>
                </div>

                {/* Products */}

                <div className="max-h-[390px] space-y-4 overflow-y-auto p-5">
                  {items.map((item, index) => {
                    const product =
                      item?.product || item;

                    const image =
                      getProductImage(product);

                    const price =
                      Number(item?.salePrice) > 0
                        ? Number(item.salePrice)
                        : Number(
                            item?.price ||
                              product?.salePrice ||
                              product?.price ||
                              0
                          );

                    const quantity = Math.max(
                      1,
                      Number(item?.quantity || 1)
                    );

                    return (
                      <div
                        key={
                          item?._id ||
                          product?._id ||
                          index
                        }
                        className="flex gap-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                item?.name ||
                                product?.name ||
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ShoppingBag size={25} />
                            </div>
                          )}

                          <span className="absolute bottom-1 right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-bold text-white">
                            {quantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                            {item?.name ||
                              product?.name ||
                              "Product"}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Qty: {quantity}
                          </p>

                          <p className="mt-2 text-sm font-black text-slate-900">
                            {formatPrice(
                              price * quantity
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price */}

                <div className="border-t border-slate-100 px-5 py-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>

                      <span className="font-semibold text-slate-900">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Delivery</span>

                      <span
                        className={`font-semibold ${
                          deliveryFee === 0
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}
                      >
                        {deliveryFee === 0
                          ? "FREE"
                          : formatPrice(
                              deliveryFee
                            )}
                      </span>
                    </div>

                    {deliveryFee > 0 && (
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        Add Rs.{" "}
                        {(
                          5000 - subtotal
                        ).toLocaleString(
                          "en-PK"
                        )}{" "}
                        more for FREE delivery.
                      </p>
                    )}
                  </div>

                  <div className="my-5 h-px bg-slate-100" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-3xl font-black text-slate-900">
                        {formatPrice(total)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                      PKR
                    </div>
                  </div>
                </div>

                {/* Place Order */}

                <div className="border-t border-slate-100 bg-slate-50 p-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-base font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order

                        <ArrowRight
                          size={19}
                          className="transition group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                    <ShieldCheck
                      size={15}
                      className="text-emerald-600"
                    />

                    Secure & protected checkout
                  </div>
                </div>
              </motion.div>

              {/* Trust Cards */}

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <Truck
                    className="mx-auto text-slate-700"
                    size={19}
                  />

                  <p className="mt-2 text-[10px] font-bold text-slate-600">
                    Fast Delivery
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <ShieldCheck
                    className="mx-auto text-slate-700"
                    size={19}
                  />

                  <p className="mt-2 text-[10px] font-bold text-slate-600">
                    Secure Order
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <CreditCard
                    className="mx-auto text-slate-700"
                    size={19}
                  />

                  <p className="mt-2 text-[10px] font-bold text-slate-600">
                    Easy Payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;