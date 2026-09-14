import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Package,
  LogOut,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  Search,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  Eye,
  ChevronDown,
  CalendarDays,
  Phone,
  MapPin,
  Activity,
  Plus,
  CreditCard,
  WalletCards,
  CircleDollarSign,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";

import {
  getAllOrders,
  updateOrderStatus,
} from "../services/orderService";

import { getPayments } from "../services/paymentService";

import { getBookings } from "../services/bookingService";

function AdminDashboard() {
  const navigate = useNavigate();

  const { token, user, isAdmin, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "confirmed",
      label: "Confirmed",
    },
    {
      value: "processing",
      label: "Processing",
    },
    {
      value: "shipped",
      label: "Shipped",
    },
    {
      value: "delivered",
      label: "Delivered",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
  ];

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [token, isAdmin, navigate]);

  const loadDashboard = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const results = await Promise.allSettled([
        getAllOrders(),
        getPayments({
          page: 1,
          limit: 100,
        }),
        getBookings({
          page: 1,
          limit: 100,
        }),
      ]);

      const orderResult = results[0];
      const paymentResult = results[1];
      const bookingResult = results[2];

      let hasError = false;
      const errorMessages = [];

      if (orderResult.status === "fulfilled") {
        const response = orderResult.value;

        const orderList =
          response?.orders ||
          response?.data?.orders ||
          response?.data ||
          [];

        setOrders(
          Array.isArray(orderList)
            ? orderList
            : []
        );
      } else {
        console.error(
          "Load orders error:",
          orderResult.reason
        );

        hasError = true;

        errorMessages.push(
          orderResult.reason?.response?.data?.message ||
            "Orders load nahi ho sake."
        );
      }

      if (paymentResult.status === "fulfilled") {
        const response = paymentResult.value;

        const paymentList =
          response?.payments ||
          response?.data?.payments ||
          response?.data ||
          [];

        setPayments(
          Array.isArray(paymentList)
            ? paymentList
            : []
        );
      } else {
        console.error(
          "Load payments error:",
          paymentResult.reason
        );

        hasError = true;

        errorMessages.push(
          paymentResult.reason?.response?.data?.message ||
            "Payments load nahi ho sake."
        );
      }

      if (bookingResult.status === "fulfilled") {
        const response = bookingResult.value;

        const bookingList =
          response?.bookings ||
          response?.data?.bookings ||
          response?.data ||
          [];

        setBookings(
          Array.isArray(bookingList)
            ? bookingList
            : []
        );
      } else {
        console.error(
          "Load bookings error:",
          bookingResult.reason
        );

        hasError = true;

        errorMessages.push(
          bookingResult.reason?.response?.data?.message ||
            "Bookings load nahi ho sake."
        );
      }

      if (hasError) {
        setError(
          errorMessages.join(" ")
        );
      }
    } catch (err) {
      console.error(
        "Load dashboard error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Dashboard data load nahi ho saka."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const changeStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response =
        await updateOrderStatus(
          orderId,
          status
        );

      const updatedOrder =
        response?.order ||
        response?.data?.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (
            String(order._id) !==
            String(orderId)
          ) {
            return order;
          }

          return (
            updatedOrder || {
              ...order,
              orderStatus: status,
            }
          );
        })
      );
    } catch (err) {
      console.error(
        "Update order status error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Order status update nahi ho saka."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatPrice = (price) => {
    return `Rs. ${Number(
      price || 0
    ).toLocaleString("en-PK")}`;
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusStyle = (status) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "confirmed":
        return CheckCircle2;

      case "processing":
        return Package;

      case "shipped":
        return Truck;

      case "delivered":
        return CheckCircle2;

      case "cancelled":
        return XCircle;

      default:
        return Clock3;
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) =>
        String(order.orderStatus).toLowerCase() ===
        "pending"
    ).length;

    const confirmed = orders.filter(
      (order) =>
        String(order.orderStatus).toLowerCase() ===
        "confirmed"
    ).length;

    const processing = orders.filter(
      (order) =>
        String(order.orderStatus).toLowerCase() ===
        "processing"
    ).length;

    const shipped = orders.filter(
      (order) =>
        String(order.orderStatus).toLowerCase() ===
        "shipped"
    ).length;

    const delivered = orders.filter(
      (order) =>
        String(order.orderStatus).toLowerCase() ===
        "delivered"
    ).length;

    const cancelled = orders.filter(
      (order) =>
        String(order.orderStatus).toLowerCase() ===
        "cancelled"
    ).length;

    const revenue = orders
      .filter(
        (order) =>
          String(
            order.orderStatus
          ).toLowerCase() !== "cancelled"
      )
      .reduce(
        (totalAmount, order) =>
          totalAmount +
          Number(
            order.totalAmount || 0
          ),
        0
      );

    const totalItems = orders.reduce(
      (total, order) =>
        total +
        (order.items || []).reduce(
          (
            itemTotal,
            item
          ) =>
            itemTotal +
            Number(
              item.quantity || 0
            ),
          0
        ),
      0
    );

    return {
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue,
      totalItems,
    };
  }, [orders]);

  const paymentStats = useMemo(() => {
    const total = payments.length;

    const pending = payments.filter(
      (payment) => {
        const status = String(
          payment.status || ""
        ).toLowerCase();

        return (
          status === "pending" ||
          status === "processing"
        );
      }
    ).length;

    const paid = payments.filter(
      (payment) =>
        String(
          payment.status || ""
        ).toLowerCase() === "paid"
    ).length;

    const failed = payments.filter(
      (payment) =>
        String(
          payment.status || ""
        ).toLowerCase() === "failed"
    ).length;

    const cancelled = payments.filter(
      (payment) =>
        String(
          payment.status || ""
        ).toLowerCase() === "cancelled"
    ).length;

    const paidRevenue = payments
      .filter(
        (payment) =>
          String(
            payment.status || ""
          ).toLowerCase() === "paid"
      )
      .reduce(
        (totalAmount, payment) =>
          totalAmount +
          Number(
            payment.amount || 0
          ),
        0
      );

    const pendingAmount = payments
      .filter((payment) => {
        const status = String(
          payment.status || ""
        ).toLowerCase();

        return (
          status === "pending" ||
          status === "processing"
        );
      })
      .reduce(
        (totalAmount, payment) =>
          totalAmount +
          Number(
            payment.amount || 0
          ),
        0
      );

    return {
      total,
      pending,
      paid,
      failed,
      cancelled,
      paidRevenue,
      pendingAmount,
    };
  }, [payments]);

  const bookingStats = useMemo(() => {
    const total = bookings.length;

    const pending = bookings.filter(
      (booking) =>
        String(
          booking.status || ""
        ).toLowerCase() === "pending"
    ).length;

    const confirmed = bookings.filter(
      (booking) =>
        String(
          booking.status || ""
        ).toLowerCase() === "confirmed"
    ).length;

    const completed = bookings.filter(
      (booking) =>
        String(
          booking.status || ""
        ).toLowerCase() === "completed"
    ).length;

    const rejected = bookings.filter(
      (booking) =>
        String(
          booking.status || ""
        ).toLowerCase() === "rejected"
    ).length;

    const cancelled = bookings.filter(
      (booking) =>
        String(
          booking.status || ""
        ).toLowerCase() === "cancelled"
    ).length;

    return {
      total,
      pending,
      confirmed,
      completed,
      rejected,
      cancelled,
    };
  }, [bookings]);

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return orders;
    }

    return orders.filter((order) => {
      const orderNumber =
        String(
          order.orderNumber || ""
        ).toLowerCase();

      const orderId =
        String(
          order._id || ""
        ).toLowerCase();

      const customerName =
        String(
          order.address?.fullName ||
            ""
        ).toLowerCase();

      const customerPhone =
        String(
          order.address?.phone ||
            ""
        ).toLowerCase();

      const customerEmail =
        String(
          order.address?.email ||
            ""
        ).toLowerCase();

      return (
        orderNumber.includes(
          searchValue
        ) ||
        orderId.includes(
          searchValue
        ) ||
        customerName.includes(
          searchValue
        ) ||
        customerPhone.includes(
          searchValue
        ) ||
        customerEmail.includes(
          searchValue
        )
      );
    });
  }, [orders, search]);

  const recentOrders =
    filteredOrders.slice(0, 6);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 4);
  }, [payments]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 4);
  }, [bookings]);

  const getPaymentStatusStyle = (
    status
  ) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "cancelled":
        return "bg-slate-100 text-slate-600 border-slate-200";

      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const getBookingStatusStyle = (
    status
  ) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "cancelled":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="min-h-screen bg-[#f6f8fc] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1500px]">

        {/* TOP NAVIGATION */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-black text-slate-500 transition hover:text-orange-500"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
            >
              <Package size={17} />
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-500"
            >
              <ShoppingBag size={17} />
              All Orders
            </Link>

            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              <CreditCard size={17} />
              Payments
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-black text-red-500 transition hover:bg-red-100"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>

        {/* HERO HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-7 overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-xl sm:p-8"
        >
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-orange-400 ring-1 ring-white/10">
                <ShieldCheck size={31} />
              </div>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                  <Activity size={13} />
                  Admin Dashboard
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Welcome back,{" "}
                  {user?.name || "Admin"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                  Manage your store orders,
                  payments and bookings from
                  one professional dashboard.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>
          </div>
        </motion.div>

        {/* ORDER STATS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL ORDERS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Total Orders
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  All customer orders
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShoppingBag size={22} />
              </div>
            </div>
          </motion.div>

          {/* PENDING ORDERS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.05,
            }}
            className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-black text-orange-600">
                  {stats.pending}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Need your attention
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Clock3 size={22} />
              </div>
            </div>
          </motion.div>

          {/* IN PROGRESS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-indigo-400">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-black text-indigo-600">
                  {stats.confirmed +
                    stats.processing +
                    stats.shipped}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Active orders
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Truck size={22} />
              </div>
            </div>
          </motion.div>

          {/* ORDER REVENUE */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  Order Revenue
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-600">
                  {formatPrice(
                    stats.revenue
                  )}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Excluding cancelled
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <DollarSign size={22} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* PAYMENTS & BOOKINGS LIVE OVERVIEW */}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.18,
          }}
          className="mb-7"
        >
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Live Store Operations
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Payments & Bookings
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-400">
              Live data loaded directly from your database.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL PAYMENTS */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-500">
                    Total Payments
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {paymentStats.total}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    All payment records
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CreditCard size={22} />
                </div>
              </div>
            </div>

            {/* PENDING PAYMENTS */}
            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                    Pending Payments
                  </p>

                  <p className="mt-2 text-3xl font-black text-orange-600">
                    {paymentStats.pending}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Need verification
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Clock3 size={22} />
                </div>
              </div>
            </div>

            {/* PAID PAYMENTS */}
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                    Paid Payments
                  </p>

                  <p className="mt-2 text-3xl font-black text-blue-600">
                    {paymentStats.paid}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Verified successfully
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* PAYMENT REVENUE */}
            <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-purple-500">
                    Paid Revenue
                  </p>

                  <p className="mt-2 text-2xl font-black text-purple-600">
                    {formatPrice(
                      paymentStats.paidRevenue
                    )}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Actual paid payments
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <CircleDollarSign size={22} />
                </div>
              </div>
            </div>

            {/* TOTAL BOOKINGS */}
            <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                    Total Bookings
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {bookingStats.total}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    All product bookings
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <CalendarDays size={22} />
                </div>
              </div>
            </div>

            {/* PENDING BOOKINGS */}
            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                    Pending Bookings
                  </p>

                  <p className="mt-2 text-3xl font-black text-orange-600">
                    {bookingStats.pending}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Waiting for action
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Clock3 size={22} />
                </div>
              </div>
            </div>

            {/* CONFIRMED BOOKINGS */}
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                    Confirmed Bookings
                  </p>

                  <p className="mt-2 text-3xl font-black text-blue-600">
                    {bookingStats.confirmed}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Payment verified
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* COMPLETED BOOKINGS */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-500">
                    Completed Bookings
                  </p>

                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {bookingStats.completed}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Successfully completed
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PAYMENT MANAGEMENT FEATURE */}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="mb-7 overflow-hidden rounded-[30px] border border-emerald-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <WalletCards size={27} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    Payment Management
                  </h2>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    {paymentStats.pending} Pending
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
                  View customer payment requests,
                  check JazzCash / Easypaisa
                  payments and manually update
                  payment status after verification.
                </p>

                <p className="mt-2 text-xs font-black text-emerald-600">
                  Pending amount:{" "}
                  {formatPrice(
                    paymentStats.pendingAmount
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/admin/payments"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
            >
              <CreditCard size={18} />
              Manage Payments
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </motion.div>

        {/* BOOKING MANAGEMENT FEATURE */}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.23,
          }}
          className="mb-7 overflow-hidden rounded-[30px] border border-indigo-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <CalendarDays size={27} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    Booking Management
                  </h2>

                  <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-600">
                    {bookingStats.pending} Pending
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-400">
                  Review customer product bookings,
                  check required dates and manage
                  booking confirmation from the admin panel.
                </p>
              </div>
            </div>

            <Link
              to="/admin/bookings"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
            >
              <CalendarDays size={18} />
              Manage Bookings
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </motion.div>

        {/* SECONDARY ORDER OVERVIEW */}
        <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Confirmed
            </p>

            <p className="mt-2 text-2xl font-black text-blue-600">
              {stats.confirmed}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Processing
            </p>

            <p className="mt-2 text-2xl font-black text-purple-600">
              {stats.processing}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Shipped
            </p>

            <p className="mt-2 text-2xl font-black text-indigo-600">
              {stats.shipped}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Delivered
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-600">
              {stats.delivered}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Cancelled
            </p>

            <p className="mt-2 text-2xl font-black text-red-600">
              {stats.cancelled}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Items Sold
            </p>

            <p className="mt-2 text-2xl font-black text-slate-800">
              {stats.totalItems}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-black">
                Some dashboard data could not load
              </p>

              <p className="mt-1 text-sm font-semibold">
                {error}
              </p>

              <button
                onClick={() =>
                  loadDashboard(true)
                }
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white transition hover:bg-red-700"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid gap-7 xl:grid-cols-[1fr_340px]">

          {/* LEFT */}
          <div className="space-y-7">

            {/* RECENT ORDERS */}
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package
                        size={19}
                        className="text-orange-500"
                      />

                      <h2 className="text-xl font-black text-slate-900">
                        Recent Orders
                      </h2>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-400">
                      Latest customer activity
                    </p>
                  </div>

                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black text-white transition hover:bg-orange-500"
                  >
                    View All Orders
                    <ArrowUpRight size={15} />
                  </Link>
                </div>

                {/* SEARCH */}
                <div className="relative mt-5">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search order, customer, phone or email..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-24 text-center">
                  <Loader2
                    size={42}
                    className="mx-auto animate-spin text-orange-500"
                  />

                  <p className="mt-4 text-sm font-bold text-slate-500">
                    Loading dashboard...
                  </p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-300">
                    <Package size={38} />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    No Orders Found
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-400">
                    Customer orders will appear
                    here when available.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map(
                    (order, index) => {
                      const StatusIcon =
                        getStatusIcon(
                          order.orderStatus
                        );

                      const items =
                        order.items || [];

                      const customerName =
                        order.address
                          ?.fullName ||
                        "Customer";

                      const customerPhone =
                        order.address
                          ?.phone ||
                        "No phone";

                      return (
                        <motion.div
                          key={order._id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: Math.min(
                              index * 0.04,
                              0.25
                            ),
                          }}
                          className="p-5 transition hover:bg-slate-50 sm:p-6"
                        >
                          <div className="flex flex-col gap-5">

                            {/* ORDER TOP */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                  <Package size={21} />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                    Order
                                  </p>

                                  <h3 className="mt-1 break-all text-sm font-black text-slate-900">
                                    #
                                    {order.orderNumber ||
                                      String(
                                        order._id
                                      )
                                        .slice(-8)
                                        .toUpperCase()}
                                  </h3>

                                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                    <CalendarDays
                                      size={13}
                                    />

                                    {formatDateTime(
                                      order.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div
                                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${getStatusStyle(
                                    order.orderStatus
                                  )}`}
                                >
                                  <StatusIcon
                                    size={14}
                                  />

                                  {String(
                                    order.orderStatus ||
                                      "pending"
                                  )
                                    .charAt(0)
                                    .toUpperCase() +
                                    String(
                                      order.orderStatus ||
                                        "pending"
                                    ).slice(1)}
                                </div>

                                <div className="relative">
                                  <select
                                    value={
                                      order.orderStatus ||
                                      "pending"
                                    }
                                    disabled={
                                      updatingId ===
                                      order._id
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      changeStatus(
                                        order._id,
                                        event.target
                                          .value
                                      )
                                    }
                                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-xs font-black text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
                                  >
                                    {statusOptions.map(
                                      (option) => (
                                        <option
                                          key={
                                            option.value
                                          }
                                          value={
                                            option.value
                                          }
                                        >
                                          {
                                            option.label
                                          }
                                        </option>
                                      )
                                    )}
                                  </select>

                                  <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                  />

                                  {updatingId ===
                                    order._id && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                                      <Loader2
                                        size={16}
                                        className="animate-spin text-orange-500"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* ORDER DETAILS */}
                            <div className="grid gap-3 sm:grid-cols-3">

                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Users size={15} />

                                  <span className="text-[10px] font-black uppercase tracking-wider">
                                    Customer
                                  </span>
                                </div>

                                <p className="mt-2 truncate text-sm font-black text-slate-800">
                                  {customerName}
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-bold text-slate-400">
                                  <Phone size={12} />
                                  {customerPhone}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <ShoppingBag
                                    size={15}
                                  />

                                  <span className="text-[10px] font-black uppercase tracking-wider">
                                    Items
                                  </span>
                                </div>

                                <p className="mt-2 text-sm font-black text-slate-800">
                                  {items.length}{" "}
                                  {items.length === 1
                                    ? "Item"
                                    : "Items"}
                                </p>

                                <p className="mt-1 text-xs font-bold text-slate-400">
                                  {items.reduce(
                                    (
                                      total,
                                      item
                                    ) =>
                                      total +
                                      Number(
                                        item.quantity ||
                                          0
                                      ),
                                    0
                                  )}{" "}
                                  total quantity
                                </p>
                              </div>

                              <div className="rounded-2xl bg-orange-50 p-4">
                                <div className="flex items-center gap-2 text-orange-500">
                                  <DollarSign
                                    size={15}
                                  />

                                  <span className="text-[10px] font-black uppercase tracking-wider">
                                    Order Total
                                  </span>
                                </div>

                                <p className="mt-2 text-lg font-black text-orange-600">
                                  {formatPrice(
                                    order.totalAmount
                                  )}
                                </p>

                                <p className="mt-1 text-xs font-bold text-orange-400">
                                  {order.paymentMethod ||
                                    "COD"}
                                </p>
                              </div>
                            </div>

                            {/* BOTTOM */}
                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <MapPin size={14} />

                                <span className="truncate">
                                  {order.address
                                    ?.city ||
                                    "No city"}
                                </span>
                              </div>

                              <Link
                                to={`/orders/${order._id}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-500"
                              >
                                <Eye size={15} />
                                View Order
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* RECENT PAYMENTS + BOOKINGS */}
            <div className="grid gap-7 lg:grid-cols-2">

              {/* RECENT PAYMENTS */}
              <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={18}
                        className="text-emerald-600"
                      />

                      <h2 className="text-lg font-black text-slate-900">
                        Recent Payments
                      </h2>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Latest payment activity
                    </p>
                  </div>

                  <Link
                    to="/admin/payments"
                    className="text-xs font-black text-emerald-600 hover:text-emerald-700"
                  >
                    View All
                  </Link>
                </div>

                {recentPayments.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <CreditCard
                      size={32}
                      className="mx-auto text-slate-200"
                    />

                    <p className="mt-3 text-sm font-black text-slate-500">
                      No payments yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentPayments.map(
                      (payment) => (
                        <div
                          key={payment._id}
                          className="p-4 transition hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">
                                {payment.customer
                                  ?.name ||
                                  payment.customerName ||
                                  "Customer"}
                              </p>

                              <p className="mt-1 text-xs font-bold text-slate-400">
                                {String(
                                  payment.method ||
                                    "payment"
                                ).toUpperCase()}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">
                                {formatPrice(
                                  payment.amount
                                )}
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${getPaymentStatusStyle(
                                  payment.status
                                )}`}
                              >
                                {String(
                                  payment.status ||
                                    "pending"
                                )
                                  .charAt(0)
                                  .toUpperCase() +
                                  String(
                                    payment.status ||
                                      "pending"
                                  ).slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* RECENT BOOKINGS */}
              <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={18}
                        className="text-indigo-600"
                      />

                      <h2 className="text-lg font-black text-slate-900">
                        Recent Bookings
                      </h2>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Latest booking activity
                    </p>
                  </div>

                  <Link
                    to="/admin/bookings"
                    className="text-xs font-black text-indigo-600 hover:text-indigo-700"
                  >
                    View All
                  </Link>
                </div>

                {recentBookings.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <CalendarDays
                      size={32}
                      className="mx-auto text-slate-200"
                    />

                    <p className="mt-3 text-sm font-black text-slate-500">
                      No bookings yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentBookings.map(
                      (booking) => (
                        <div
                          key={booking._id}
                          className="p-4 transition hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-800">
                                {booking.customer
                                  ?.name ||
                                  "Customer"}
                              </p>

                              <p className="mt-1 truncate text-xs font-bold text-slate-400">
                                {booking.productName ||
                                  "Product Booking"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">
                                {formatPrice(
                                  booking.bookingPrice
                                )}
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-black ${getBookingStatusStyle(
                                  booking.status
                                )}`}
                              >
                                {String(
                                  booking.status ||
                                    "pending"
                                )
                                  .charAt(0)
                                  .toUpperCase() +
                                  String(
                                    booking.status ||
                                      "pending"
                                  ).slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-5">

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                  Quick Actions
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Manage Store
                </h2>
              </div>

              <div className="space-y-3">

                <Link
                  to="/admin/products"
                  className="group flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-4 transition hover:border-orange-300 hover:bg-orange-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                      <Package size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Manage Products
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        Add, edit & delete products
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-orange-400 transition group-hover:text-orange-600"
                  />
                </Link>

                <Link
                  to="/admin/products"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                      <Plus size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Add New Product
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        Create a new store product
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-300 transition group-hover:text-orange-500"
                  />
                </Link>

                <Link
                  to="/admin/orders"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                      <ShoppingBag size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Manage Orders
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        View all orders
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-300 transition group-hover:text-orange-500"
                  />
                </Link>

                <Link
                  to="/admin/payments"
                  className="group flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <CreditCard size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Manage Payments
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        {paymentStats.pending} pending verification
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-emerald-400 transition group-hover:text-emerald-600"
                  />
                </Link>

                <Link
                  to="/admin/bookings"
                  className="group flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm">
                      <CalendarDays size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Manage Bookings
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        {bookingStats.pending} pending bookings
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-indigo-400 transition group-hover:text-indigo-600"
                  />
                </Link>

                <Link
                  to="/"
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                      <ArrowLeft size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Storefront
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        Open customer website
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-300 transition group-hover:text-orange-500"
                  />
                </Link>
              </div>
            </div>

            {/* ORDER ACTIVITY */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                    Activity
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    Order Status
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <Activity size={19} />
                </div>
              </div>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />

                    <span className="text-sm font-bold text-slate-600">
                      Pending
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {stats.pending}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />

                    <span className="text-sm font-bold text-slate-600">
                      Processing
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {stats.processing}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />

                    <span className="text-sm font-bold text-slate-600">
                      Shipped
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {stats.shipped}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <span className="text-sm font-bold text-slate-600">
                      Delivered
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {stats.delivered}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                    <span className="text-sm font-bold text-slate-600">
                      Cancelled
                    </span>
                  </div>

                  <span className="text-sm font-black text-slate-900">
                    {stats.cancelled}
                  </span>
                </div>
              </div>
            </div>

            {/* PAYMENT QUICK CARD */}
            <Link
              to="/admin/payments"
              className="group block overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100">
                    Payments
                  </p>

                  <p className="mt-3 text-2xl font-black">
                    Payment Center
                  </p>

                  <p className="mt-2 text-xs font-bold leading-5 text-emerald-100">
                    {paymentStats.pending} pending payment
                    requests need verification.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <CreditCard size={26} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs font-black">
                Open Payments

                <ArrowUpRight
                  size={15}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </Link>

            {/* BOOKING QUICK CARD */}
            <Link
              to="/admin/bookings"
              className="group block overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-100">
                    Bookings
                  </p>

                  <p className="mt-3 text-2xl font-black">
                    Booking Center
                  </p>

                  <p className="mt-2 text-xs font-bold leading-5 text-indigo-100">
                    {bookingStats.pending} pending booking
                    requests need attention.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <CalendarDays size={26} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs font-black">
                Open Bookings

                <ArrowUpRight
                  size={15}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
            </Link>

            {/* REVENUE CARD */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-100">
                    Store Revenue
                  </p>

                  <p className="mt-3 text-3xl font-black">
                    {formatPrice(
                      stats.revenue
                    )}
                  </p>

                  <p className="mt-2 text-xs font-bold text-orange-100">
                    Based on current orders
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            {/* PAID REVENUE CARD */}
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg shadow-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-100">
                    Paid Revenue
                  </p>

                  <p className="mt-3 text-3xl font-black">
                    {formatPrice(
                      paymentStats.paidRevenue
                    )}
                  </p>

                  <p className="mt-2 text-xs font-bold text-purple-100">
                    Only verified payments
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <CircleDollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;