import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Smartphone,
  User,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import {
  getPayments,
  updatePaymentStatus,
} from "../../services/paymentService";

// ==========================================
// HELPERS
// ==========================================

const formatPrice = (value) => {
  return `Rs. ${Number(
    value || 0
  ).toLocaleString("en-PK")}`;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
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

const getStatusConfig = (status) => {
  const configs = {
    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    },

    processing: {
      label: "Processing",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
      icon: RefreshCw,
    },

    paid: {
      label: "Paid",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },

    failed: {
      label: "Failed",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
      icon: XCircle,
    },

    refunded: {
      label: "Refunded",
      className:
        "bg-purple-50 text-purple-700 border-purple-200",
      icon: RefreshCw,
    },
  };

  return (
    configs[status] ||
    configs.pending
  );
};

const getMethodConfig = (method) => {
  if (method === "jazzcash") {
    return {
      label: "JazzCash",
      icon: WalletCards,
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "Easypaisa",
    icon: Smartphone,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
};

// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// STATUS BADGE
// ==========================================

const StatusBadge = ({ status }) => {
  const config =
    getStatusConfig(status);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
};

// ==========================================
// METHOD BADGE
// ==========================================

const MethodBadge = ({ method }) => {
  const config =
    getMethodConfig(method);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
};

// ==========================================
// MAIN
// ==========================================

const AdminPayments = () => {
  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [methodFilter, setMethodFilter] =
    useState("all");

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [updatingId, setUpdatingId] =
    useState("");

  // ========================================
  // LOAD PAYMENTS
  // ========================================

  const loadPayments = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          limit: 100,
        };

        if (
          statusFilter !== "all"
        ) {
          params.status =
            statusFilter;
        }

        if (
          methodFilter !== "all"
        ) {
          params.method =
            methodFilter;
        }

        if (search.trim()) {
          params.search =
            search.trim();
        }

        const response =
          await getPayments(
            params
          );

        console.log(
          "ADMIN PAYMENTS RESPONSE:",
          response
        );

        const loadedPayments =
          response?.payments ||
          response?.data?.payments ||
          response?.data ||
          [];

        setPayments(
          Array.isArray(
            loadedPayments
          )
            ? loadedPayments
            : []
        );
      } catch (err) {
        console.error(
          "ADMIN PAYMENTS ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Payments load nahi ho sakin."
        );

        setPayments([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      search,
      statusFilter,
      methodFilter,
    ]
  );

  // ========================================
  // INITIAL / FILTER LOAD
  // ========================================

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // ========================================
  // STATS
  // ========================================

  const stats = useMemo(() => {
    const total =
      payments.length;

    const pending =
      payments.filter(
        (payment) =>
          payment.status ===
          "pending"
      ).length;

    const processing =
      payments.filter(
        (payment) =>
          payment.status ===
          "processing"
      ).length;

    const paid =
      payments.filter(
        (payment) =>
          payment.status ===
          "paid"
      ).length;

    const failed =
      payments.filter(
        (payment) =>
          payment.status ===
          "failed"
      ).length;

    const totalPaidAmount =
      payments
        .filter(
          (payment) =>
            payment.status ===
            "paid"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );

    const pendingAmount =
      payments
        .filter(
          (payment) =>
            payment.status ===
            "pending" ||
            payment.status ===
            "processing"
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );

    return {
      total,
      pending,
      processing,
      paid,
      failed,
      totalPaidAmount,
      pendingAmount,
    };
  }, [payments]);

  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusUpdate = async (
    payment,
    status
  ) => {
    if (!payment?._id) {
      return;
    }

    if (
      payment.status ===
      status
    ) {
      return;
    }

    let confirmed = true;

    if (status === "paid") {
      confirmed = window.confirm(
        "Kya aap confirm karna chahte hain ke payment verified hai?\n\nPayment PAID mark karne par related booking bhi CONFIRMED ho jayegi."
      );
    }

    if (status === "failed") {
      confirmed = window.confirm(
        "Payment ko FAILED mark karna hai?"
      );
    }

    if (status === "cancelled") {
      confirmed = window.confirm(
        "Payment ko CANCELLED mark karna hai? Related booking bhi cancel ho jayegi."
      );
    }

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(
        payment._id
      );

      setError("");

      const response =
        await updatePaymentStatus(
          payment._id,
          status
        );

      console.log(
        "PAYMENT STATUS RESPONSE:",
        response
      );

      const updatedPayment =
        response?.payment ||
        response?.data?.payment ||
        null;

      if (updatedPayment) {
        setPayments(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                  payment._id
                  ? updatedPayment
                  : item
            )
        );

        if (
          selectedPayment?._id ===
          payment._id
        ) {
          setSelectedPayment(
            updatedPayment
          );
        }
      } else {
        await loadPayments(
          true
        );
      }
    } catch (err) {
      console.error(
        "UPDATE PAYMENT ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Payment status update nahi ho saka."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // ========================================
  // FILTERED PAYMENTS
  // ========================================

  const filteredPayments =
    useMemo(() => {
      if (!search.trim()) {
        return payments;
      }

      const value =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          const transactionId =
            String(
              payment.transactionId ||
              ""
            ).toLowerCase();

          const gatewayReference =
            String(
              payment.gatewayReference ||
              ""
            ).toLowerCase();

          const customerName =
            String(
              payment.customer
                ?.name || ""
            ).toLowerCase();

          const customerEmail =
            String(
              payment.customer
                ?.email || ""
            ).toLowerCase();

          const customerPhone =
            String(
              payment.customer
                ?.phone || ""
            ).toLowerCase();

          const productName =
            String(
              payment.booking
                ?.productName ||
              ""
            ).toLowerCase();

          return (
            transactionId.includes(
              value
            ) ||
            gatewayReference.includes(
              value
            ) ||
            customerName.includes(
              value
            ) ||
            customerEmail.includes(
              value
            ) ||
            customerPhone.includes(
              value
            ) ||
            productName.includes(
              value
            )
          );
        }
      );
    }, [payments, search]);

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setMethodFilter("all");
  };

  // ========================================
  // LOADING
  // ========================================

  if (
    loading &&
    payments.length === 0
  ) {
    return (
      <section className="min-h-[75vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />

              Payments loading...
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <section className="min-h-[75vh] bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
              <CreditCard className="h-4 w-4" />

              Payment Management
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Payments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Customer payments,
              transaction records aur
              payment verification yahan
              manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadPayments(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing
                  ? "animate-spin"
                  : ""
                }`}
            />

            Refresh
          </button>
        </div>

        {/* ==================================
            ERROR
        ================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-bold">
                Payment Error
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ==================================
            STATS
        ================================== */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            title="Total Payments"
            value={stats.total}
            description="Loaded payment records"
            icon={CreditCard}
            iconClass="bg-slate-100 text-slate-700"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            description={formatPrice(
              stats.pendingAmount
            )}
            icon={Clock3}
            iconClass="bg-amber-100 text-amber-700"
          />

          <StatCard
            title="Processing"
            value={stats.processing}
            description="Gateway processing"
            icon={RefreshCw}
            iconClass="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Paid"
            value={stats.paid}
            description={formatPrice(
              stats.totalPaidAmount
            )}
            icon={CheckCircle2}
            iconClass="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            title="Failed"
            value={stats.failed}
            description="Failed payments"
            icon={XCircle}
            iconClass="bg-red-100 text-red-700"
          />

        </div>

        {/* ==================================
            FILTERS
        ================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search transaction, customer, phone, product..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="cancelled">
                Cancelled
              </option>

              <option value="refunded">
                Refunded
              </option>
            </select>

            <select
              value={
                methodFilter
              }
              onChange={(event) =>
                setMethodFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="all">
                All Methods
              </option>

              <option value="jazzcash">
                JazzCash
              </option>

              <option value="easypaisa">
                Easypaisa
              </option>
            </select>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>

          </div>
        </div>

        {/* ==================================
            TABLE
        ================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-black text-slate-900">
                Payment Records
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredPayments.length}{" "}
                payment
                {filteredPayments.length ===
                  1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            </div>

            <CreditCard className="h-5 w-5 text-slate-400" />
          </div>

          {filteredPayments.length ===
            0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <CreditCard className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="font-bold text-slate-800">
                No Payments Found
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Search ya filters change
                karke dobara check karein.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">

                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs font-black uppercase tracking-wider text-slate-500">

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Booking
                    </th>

                    <th className="px-5 py-4">
                      Method
                    </th>

                    <th className="px-5 py-4">
                      Amount
                    </th>

                    <th className="px-5 py-4">
                      Transaction
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredPayments.map(
                    (payment) => (
                      <tr
                        key={
                          payment._id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                              <User className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-800">
                                {payment
                                  .customer
                                  ?.name ||
                                  "Unknown Customer"}
                              </p>

                              <p className="truncate text-xs text-slate-400">
                                {payment
                                  .customer
                                  ?.phone ||
                                  payment
                                    .customer
                                    ?.email ||
                                  "—"}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* BOOKING */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="max-w-[190px] truncate font-semibold text-slate-800">
                              {payment
                                .booking
                                ?.productName ||
                                "Booking"}
                            </p>

                            <p className="mt-1 font-mono text-[11px] text-slate-400">
                              {payment
                                .booking
                                ?._id ||
                                payment
                                  .booking ||
                                "—"}
                            </p>
                          </div>
                        </td>

                        {/* METHOD */}

                        <td className="px-5 py-4">
                          <MethodBadge
                            method={
                              payment.method
                            }
                          />
                        </td>

                        {/* AMOUNT */}

                        <td className="px-5 py-4">
                          <span className="font-black text-slate-900">
                            {formatPrice(
                              payment.amount
                            )}
                          </span>
                        </td>

                        {/* TRANSACTION */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-mono text-xs font-semibold text-slate-700">
                              {payment.transactionId ||
                                "—"}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatDate(
                                payment.createdAt
                              )}
                            </p>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              payment.status
                            }
                          />
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPayment(
                                payment
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />

                            View
                          </button>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* ====================================
          DETAILS MODAL
      ==================================== */}

      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setSelectedPayment(
                  null
                )
              }
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >

              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Payment Details
                  </h2>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {selectedPayment._id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPayment(
                      null
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">

                {/* STATUS + AMOUNT */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment Status
                    </p>

                    <div className="mt-3">
                      <StatusBadge
                        status={
                          selectedPayment.status
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Amount
                    </p>

                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {formatPrice(
                        selectedPayment.amount
                      )}
                    </p>
                  </div>

                </div>

                {/* CUSTOMER */}

                <div className="rounded-2xl border border-slate-200 p-5">

                  <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900">
                    <User className="h-5 w-5 text-orange-500" />

                    Customer Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Name
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedPayment
                          .customer
                          ?.name ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedPayment
                          .customer
                          ?.phone ||
                          "—"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400">
                        Email
                      </p>

                      <p className="mt-1 break-all font-semibold text-slate-800">
                        {selectedPayment
                          .customer
                          ?.email ||
                          "—"}
                      </p>
                    </div>

                  </div>

                </div>

                {/* PAYMENT INFO */}

                <div className="rounded-2xl border border-slate-200 p-5">

                  <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900">
                    <CreditCard className="h-5 w-5 text-orange-500" />

                    Payment Information
                  </h3>

                  <div className="space-y-4">

                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Method
                      </span>

                      <MethodBadge
                        method={
                          selectedPayment.method
                        }
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Transaction ID
                      </span>

                      <span className="max-w-[260px] break-all text-right font-mono text-xs font-semibold text-slate-700">
                        {selectedPayment.transactionId ||
                          "—"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Gateway Reference
                      </span>

                      <span className="max-w-[260px] break-all text-right font-mono text-xs font-semibold text-slate-700">
                        {selectedPayment.gatewayReference ||
                          "Not available"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Created
                      </span>

                      <span className="text-right text-sm font-semibold text-slate-700">
                        {formatDateTime(
                          selectedPayment.createdAt
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Paid At
                      </span>

                      <span className="text-right text-sm font-semibold text-slate-700">
                        {selectedPayment.paidAt
                          ? formatDateTime(
                            selectedPayment.paidAt
                          )
                          : "Not paid"}
                      </span>
                    </div>

                  </div>
                </div>

                {/* BOOKING */}

                <div className="rounded-2xl border border-slate-200 p-5">

                  <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900">
                    <CalendarIcon />

                    Booking Information
                  </h3>

                  <div className="space-y-4">

                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Product
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedPayment
                          .booking
                          ?.productName ||
                          "—"}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Required Date
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {selectedPayment
                            .booking
                            ?.requiredDate
                            ? formatDate(
                              selectedPayment
                                .booking
                                .requiredDate
                            )
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Required Month
                        </p>

                        <p className="mt-1 font-semibold text-slate-800">
                          {selectedPayment
                            .booking
                            ?.requiredMonth ||
                            "—"}
                        </p>
                      </div>

                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Booking Status
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={
                            selectedPayment
                              .booking
                              ?.status ||
                            "pending"
                          }
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* FAILURE */}

                {selectedPayment
                  .failureReason && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                        <div>
                          <h3 className="font-bold text-red-700">
                            Failure Reason
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-red-600">
                            {
                              selectedPayment.failureReason
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ACTIONS */}

                <div className="border-t border-slate-200 pt-6">

                  <h3 className="mb-4 font-black text-slate-900">
                    Payment Actions
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-3">

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        selectedPayment._id
                      }
                      onClick={() =>
                        handleStatusUpdate(
                          selectedPayment,
                          "paid"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId ===
                        selectedPayment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}

                      Mark Paid
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        selectedPayment._id
                      }
                      onClick={() =>
                        handleStatusUpdate(
                          selectedPayment,
                          "failed"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId ===
                        selectedPayment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}

                      Mark Failed
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        selectedPayment._id
                      }
                      onClick={() =>
                        handleStatusUpdate(
                          selectedPayment,
                          "cancelled"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId ===
                        selectedPayment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}

                      Cancel
                    </button>

                  </div>

                  <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                    <strong>
                      Important:
                    </strong>{" "}
                    "Mark Paid" sirf tab
                    karein jab payment actually
                    verify ho chuki ho.
                  </p>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ==========================================
// SMALL CALENDAR ICON COMPONENT
// ==========================================

const CalendarIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-orange-500"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect
        width="18"
        height="18"
        x="3"
        y="4"
        rx="2"
      />
      <path d="M3 10h18" />
    </svg>
  );
};

export default AdminPayments;