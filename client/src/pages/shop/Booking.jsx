import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getProductById,
} from "../../services/productService";

import {
  createBooking,
} from "../../services/bookingService";

import {
  createPayment,
} from "../../services/paymentService";

// ========================================
// PRODUCT IMAGE
// ========================================

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

// ========================================
// PRICE
// ========================================

const formatPrice = (value) => {
  return `Rs. ${Number(
    value || 0
  ).toLocaleString("en-PK")}`;
};

// ========================================
// BOOKING PAGE
// ========================================

const Booking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // ========================================
  // STATE
  // ========================================

  const [product, setProduct] =
    useState(null);

  const [loadingProduct, setLoadingProduct] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [paymentCreating, setPaymentCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  // ========================================
  // FORM
  // ========================================

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone:
      user?.phone ||
      user?.phoneNumber ||
      "",
    requiredDate: "",
    requiredMonth: "",
    customerNote: "",
  });

  // ========================================
  // LOAD PRODUCT
  // ========================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        setError("");

        if (!id) {
          setError(
            "Product ID is required."
          );
          return;
        }

        console.log(
          "================================"
        );

        console.log(
          "BOOKING URL PRODUCT ID:",
          id
        );

        const response =
          await getProductById(id);

        console.log(
          "BOOKING PRODUCT RESPONSE:",
          response
        );

        const loadedProduct =
          response?.product ||
          response?.data?.product ||
          response?.data ||
          response;

        console.log(
          "BOOKING LOADED PRODUCT:",
          loadedProduct
        );

        if (
          !loadedProduct ||
          !loadedProduct._id
        ) {
          setProduct(null);

          setError(
            "Product data load nahi ho saka."
          );

          return;
        }

        setProduct(
          loadedProduct
        );
      } catch (err) {
        console.error(
          "BOOKING PRODUCT ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Product load nahi ho saka."
        );
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id]);

  // ========================================
  // USER DATA
  // ========================================

  useEffect(() => {
    setForm((previous) => ({
      ...previous,

      name:
        previous.name ||
        user?.name ||
        user?.fullName ||
        "",

      email:
        previous.email ||
        user?.email ||
        "",

      phone:
        previous.phone ||
        user?.phone ||
        user?.phoneNumber ||
        "",
    }));
  }, [user]);

  // ========================================
  // PRODUCT ID
  // ========================================

  const productId = useMemo(() => {
    return (
      product?._id ||
      id ||
      ""
    );
  }, [product, id]);

  // ========================================
  // BOOKING PRICE
  // ========================================

  const bookingPrice = useMemo(() => {
    return Number(
      product?.bookingPrice || 0
    );
  }, [product]);

  // ========================================
  // PRODUCT IMAGE
  // ========================================

  const productImage = useMemo(() => {
    return getProductImage(product);
  }, [product]);

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setPaymentError("");
  };

  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = () => {
    if (!productId) {
      return "Product ID is required.";
    }

    if (!form.name.trim()) {
      return "Full Name required hai.";
    }

    if (!form.email.trim()) {
      return "Email required hai.";
    }

    if (!form.phone.trim()) {
      return "Phone Number required hai.";
    }

    if (
      !form.requiredDate &&
      !form.requiredMonth
    ) {
      return (
        "Kam az kam Required Date ya Required Month select karein."
      );
    }

    if (!paymentMethod) {
      return "Payment method select karein.";
    }

    if (bookingPrice <= 0) {
      return "Booking price valid nahi hai.";
    }

    return "";
  };

  // ========================================
  // SUBMIT BOOKING + PAYMENT
  // ========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setPaymentError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!productId) {
      setError(
        "Product ID missing hai. Product page se dobara booking open karein."
      );
      return;
    }

    setSubmitting(true);

    try {
      // ======================================
      // STEP 1
      // CREATE BOOKING
      // ======================================

      const bookingData = {
        productId: productId,

        product: productId,

        customer: {
          name: form.name.trim(),

          email: form.email
            .trim()
            .toLowerCase(),

          phone: form.phone.trim(),
        },

        requiredDate:
          form.requiredDate || null,

        requiredMonth:
          form.requiredMonth.trim(),

        customerNote:
          form.customerNote.trim(),
      };

      console.log(
        "================================"
      );

      console.log(
        "CREATING BOOKING..."
      );

      console.log(
        "PRODUCT ID:",
        productId
      );

      console.log(
        "BOOKING DATA:",
        bookingData
      );

      console.log(
        "================================"
      );

      const bookingResponse =
        await createBooking(
          bookingData
        );

      console.log(
        "BOOKING RESPONSE:",
        bookingResponse
      );

      const booking =
        bookingResponse?.booking ||
        bookingResponse?.data?.booking ||
        null;

      if (
        !booking ||
        !booking._id
      ) {
        throw new Error(
          "Booking create hui lekin Booking ID nahi mili."
        );
      }

      // ======================================
      // STEP 2
      // CREATE PAYMENT RECORD
      // ======================================

      setPaymentCreating(true);

      console.log(
        "================================"
      );

      console.log(
        "CREATING PAYMENT..."
      );

      console.log(
        "BOOKING ID:",
        booking._id
      );

      console.log(
        "AMOUNT:",
        bookingPrice
      );

      console.log(
        "METHOD:",
        paymentMethod
      );

      console.log(
        "================================"
      );

      const paymentResponse =
        await createPayment({
          bookingId:
            booking._id,

          amount:
            bookingPrice,

          method:
            paymentMethod,

          customerName:
            form.name.trim(),

          customerEmail:
            form.email
              .trim()
              .toLowerCase(),

          customerPhone:
            form.phone.trim(),
        });

      console.log(
        "PAYMENT RESPONSE:",
        paymentResponse
      );

      const payment =
        paymentResponse?.payment ||
        paymentResponse?.data?.payment ||
        null;

      if (
        !payment ||
        !payment._id
      ) {
        throw new Error(
          "Payment record create nahi ho saka."
        );
      }

      // ======================================
      // STEP 3
      // GO TO PAYMENT STATUS PAGE
      // ======================================

      console.log(
        "PAYMENT CREATED SUCCESSFULLY"
      );

      console.log(
        "PAYMENT ID:",
        payment._id
      );

      console.log(
        "REDIRECTING TO PAYMENT STATUS..."
      );

      navigate(
        `/payment/${payment._id}`,
        {
          replace: true,
        }
      );

    } catch (err) {
      console.error(
        "BOOKING/PAYMENT ERROR:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Booking submit nahi ho saki.";

      setError(message);
    } finally {
      setSubmitting(false);
      setPaymentCreating(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin" />

          Product loading...
        </div>
      </div>
    );
  }

  // ========================================
  // PRODUCT ERROR
  // ========================================

  if (error && !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Product Load Error
          </h2>

          <p className="text-red-300 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-slate-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />

            Back to Product
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 sm:px-6 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition mb-7"
        >
          <ArrowLeft className="w-5 h-5" />

          Back to Product
        </button>

        {/* HEADER */}

        <div className="mb-9">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-400 font-semibold mb-3">
            Product Booking
          </p>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Reserve Your Product
          </h1>

          <p className="text-slate-400 mt-4 max-w-2xl leading-7">
            Neeche apni details,
            required date/month aur
            payment method enter karein.
            Booking create hone ke baad
            payment status page open
            hogi.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-7">

          {/* PRODUCT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden h-fit lg:sticky lg:top-6"
          >
            {productImage ? (
              <div className="aspect-[4/3] bg-slate-950 overflow-hidden">
                <img
                  src={productImage}
                  alt={
                    product?.name ||
                    "Product"
                  }
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center">
                <MapPin className="w-14 h-14 text-slate-700" />
              </div>
            )}

            <div className="p-6 md:p-7">

              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 text-amber-300 px-3 py-1.5 text-xs font-semibold mb-4">
                <CalendarDays className="w-4 h-4" />

                Booking Available
              </div>

              <h2 className="text-2xl font-bold">
                {product?.name}
              </h2>

              <p className="text-slate-400 mt-2 leading-6">
                {product?.shortDescription ||
                  product?.description ||
                  "Premium quality product"}
              </p>

              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="text-sm text-slate-400 mb-1">
                  Booking Price
                </div>

                <div className="text-3xl font-black text-amber-400">
                  {formatPrice(
                    bookingPrice
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-300">

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />

                  Required date/month reservation
                </div>

                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />

                  Secure payment authorization
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />

                  Admin confirmation
                </div>

              </div>
            </div>
          </motion.div>

          {/* FORM */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7 md:p-9"
          >

            <div className="mb-7">
              <h2 className="text-2xl font-bold">
                Booking Details
              </h2>

              <p className="text-slate-400 mt-2">
                Apni information enter karein
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            {paymentError && (
              <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-amber-300 text-sm">
                {paymentError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* CUSTOMER */}

              <section>
                <h3 className="font-bold text-lg mb-4">
                  Customer Information
                </h3>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Name *
                    </label>

                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email *
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Phone Number *
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={
                          handleChange
                        }
                        placeholder="03XX XXXXXXX"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                </div>
              </section>

              {/* DATE */}

              <section className="pt-6 border-t border-slate-800">

                <h3 className="font-bold text-lg mb-2">
                  Required Date / Month
                </h3>

                <p className="text-sm text-slate-400 mb-4">
                  Kam az kam date ya month
                  select karna zaroori hai.
                </p>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Required Date
                    </label>

                    <input
                      type="date"
                      name="requiredDate"
                      value={
                        form.requiredDate
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 px-4 outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Required Month
                    </label>

                    <input
                      type="month"
                      name="requiredMonth"
                      value={
                        form.requiredMonth
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 px-4 outline-none focus:border-amber-400 transition"
                    />
                  </div>

                </div>
              </section>

              {/* PAYMENT */}

              <section className="pt-6 border-t border-slate-800">

                <div className="flex items-center justify-between gap-4 mb-2">

                  <div>
                    <h3 className="font-bold text-lg">
                      Payment Method
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Apna payment method select
                      karein.
                    </p>
                  </div>

                  <LockKeyhole className="w-6 h-6 text-emerald-400" />

                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-5">

                  {/* JAZZCASH */}

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod(
                        "jazzcash"
                      );

                      setPaymentError("");
                    }}
                    className={`relative rounded-2xl border p-5 text-left transition ${
                      paymentMethod ===
                      "jazzcash"
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-slate-700 bg-slate-950 hover:border-slate-500"
                    }`}
                  >
                    {paymentMethod ===
                      "jazzcash" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      </div>
                    )}

                    <WalletCards className="w-8 h-8 text-amber-400 mb-4" />

                    <div className="font-bold text-lg">
                      JazzCash
                    </div>

                    <div className="text-sm text-slate-400 mt-1">
                      Secure payment
                    </div>
                  </button>

                  {/* EASYPAISA */}

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod(
                        "easypaisa"
                      );

                      setPaymentError("");
                    }}
                    className={`relative rounded-2xl border p-5 text-left transition ${
                      paymentMethod ===
                      "easypaisa"
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-slate-700 bg-slate-950 hover:border-slate-500"
                    }`}
                  >
                    {paymentMethod ===
                      "easypaisa" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}

                    <CreditCard className="w-8 h-8 text-emerald-400 mb-4" />

                    <div className="font-bold text-lg">
                      Easypaisa
                    </div>

                    <div className="text-sm text-slate-400 mt-1">
                      Secure payment
                    </div>
                  </button>

                </div>

                {paymentMethod && (
                  <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-5">

                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-slate-200" />
                      </div>

                      <div>
                        <h4 className="font-bold">
                          {paymentMethod ===
                          "jazzcash"
                            ? "JazzCash Payment"
                            : "Easypaisa Payment"}
                        </h4>

                        <p className="text-sm text-slate-400 mt-1 leading-6">
                          Payment request create
                          hone ke baad payment
                          status page open hogi.
                          Official gateway
                          integration ke baad
                          isi flow mein secure
                          payment authorization
                          hogi.
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />

                      Secure payment authorization
                    </div>

                  </div>
                )}

              </section>

              {/* NOTE */}

              <section className="pt-6 border-t border-slate-800">

                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Note
                </label>

                <textarea
                  name="customerNote"
                  value={
                    form.customerNote
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={1000}
                  rows={4}
                  placeholder="Agar koi special requirement hai to yahan likhein..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 px-4 outline-none focus:border-amber-400 transition resize-none"
                />

                <div className="text-right text-xs text-slate-500 mt-2">
                  {form.customerNote.length}
                  /1000
                </div>

              </section>

              {/* SUMMARY */}

              <section className="pt-6 border-t border-slate-800">

                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5">

                  <div className="flex justify-between items-center gap-4">

                    <span className="text-slate-400">
                      Booking Price
                    </span>

                    <span className="text-2xl font-black text-amber-400">
                      {formatPrice(
                        bookingPrice
                      )}
                    </span>

                  </div>

                  {paymentMethod && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center gap-4 text-sm">

                      <span className="text-slate-400">
                        Payment Method
                      </span>

                      <span className="font-semibold capitalize">
                        {paymentMethod}
                      </span>

                    </div>
                  )}

                </div>

              </section>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  paymentCreating
                }
                className="w-full rounded-2xl bg-amber-400 text-slate-950 py-4 font-black text-lg hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-3"
              >

                {submitting ||
                paymentCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />

                    {paymentCreating
                      ? "Creating Payment..."
                      : "Creating Booking..."}
                  </>
                ) : (
                  <>
                    <LockKeyhole className="w-5 h-5" />

                    Continue to Payment
                  </>
                )}

              </button>

              <p className="text-center text-xs text-slate-500 leading-5">
                Payment ko automatically
                paid mark nahi kiya jayega.
                Confirmation sirf verified
                payment ke baad hogi.
              </p>

            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Booking;