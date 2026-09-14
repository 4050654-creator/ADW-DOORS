import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  deleteBooking,
  getBookings,
  updateBookingStatus,
} from "../../services/bookingService";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "rejected",
  "completed",
  "cancelled",
];

const statusStyles = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: XCircle,
  },
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) => {
  const amount = Number(price || 0);

  return `Rs. ${amount.toLocaleString("en-PK")}`;
};

const getProductImage = (booking) => {
  if (
    typeof booking?.productImage === "string" &&
    booking.productImage.trim()
  ) {
    return booking.productImage.trim();
  }

  if (
    typeof booking?.product?.images?.[0]?.url === "string" &&
    booking.product.images[0].url.trim()
  ) {
    return booking.product.images[0].url.trim();
  }

  if (
    typeof booking?.product?.images?.[0] === "string" &&
    booking.product.images[0].trim()
  ) {
    return booking.product.images[0].trim();
  }

  return "";
};

const getCustomerName = (booking) => {
  return (
    booking?.customer?.name ||
    booking?.user?.name ||
    "Unknown Customer"
  );
};

const getCustomerEmail = (booking) => {
  return (
    booking?.customer?.email ||
    booking?.user?.email ||
    "No email"
  );
};

const getCustomerPhone = (booking) => {
  return booking?.customer?.phone || "No phone";
};

const getBookingDate = (booking) => {
  if (booking?.requiredDate) {
    return formatDate(booking.requiredDate);
  }

  if (booking?.requiredMonth) {
    return booking.requiredMonth;
  }

  return "Not specified";
};

const getBookingRequirement = (booking) => {
  if (booking?.requiredDate) {
    return `Date: ${formatDate(booking.requiredDate)}`;
  }

  if (booking?.requiredMonth) {
    return `Month: ${booking.requiredMonth}`;
  }

  return "No date/month";
};

const getBookingId = (booking) => {
  if (!booking?._id) return "—";

  return String(booking._id).slice(-8).toUpperCase();
};

const getBookingProductName = (booking) => {
  return (
    booking?.productName ||
    booking?.product?.name ||
    "Unknown Product"
  );
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page: 1,
        limit: 100,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await getBookings(params);

      const list =
        response?.bookings ||
        response?.data?.bookings ||
        response?.data ||
        [];

      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load bookings:", err);

      setError(
        err?.response?.data?.message ||
        "Bookings load nahi ho sakin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const values = [
        getCustomerName(booking),
        getCustomerEmail(booking),
        getCustomerPhone(booking),
        getBookingProductName(booking),
        booking?.requiredMonth || "",
        booking?.customerNote || "",
        booking?._id || "",
      ];

      return values.some((value) =>
        String(value).toLowerCase().includes(keyword)
      );
    });
  }, [bookings, search]);

  const statistics = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (booking) => booking.status === "pending"
      ).length,
      confirmed: bookings.filter(
        (booking) => booking.status === "confirmed"
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "completed"
      ).length,
    };
  }, [bookings]);

  const handleRefresh = async () => {
    await loadBookings(true);
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setAdminNote(booking?.adminNote || "");
    setError("");
    setSuccess("");
  };

  const handleCloseDetails = () => {
    if (updatingId) return;

    setSelectedBooking(null);
    setAdminNote("");
  };

  const handleStatusChange = async (booking, newStatus) => {
    if (!booking?._id) return;

    try {
      setUpdatingId(booking._id);
      setError("");
      setSuccess("");

      const response = await updateBookingStatus(
        booking._id,
        newStatus,
        adminNote
      );

      const updatedBooking =
        response?.booking ||
        response?.data?.booking ||
        response?.data;

      setBookings((current) =>
        current.map((item) => {
          if (item._id !== booking._id) {
            return item;
          }

          return {
            ...item,
            ...(updatedBooking || {}),
            status: newStatus,
            adminNote,
          };
        })
      );

      if (selectedBooking?._id === booking._id) {
        setSelectedBooking((current) => ({
          ...current,
          ...(updatedBooking || {}),
          status: newStatus,
          adminNote,
        }));
      }

      setSuccess(`Booking ${newStatus} kar di gayi.`);
    } catch (err) {
      console.error("Failed to update booking:", err);

      setError(
        err?.response?.data?.message ||
        "Booking status update nahi ho saka."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (booking) => {
    if (!booking?._id) return;

    const customerName = getCustomerName(booking);
    const productName = getBookingProductName(booking);

    const confirmed = window.confirm(
      `Kya aap ${customerName} ki "${productName}" booking delete karna chahte hain?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(booking._id);
      setError("");
      setSuccess("");

      await deleteBooking(booking._id);

      setBookings((current) =>
        current.filter((item) => item._id !== booking._id)
      );

      if (selectedBooking?._id === booking._id) {
        setSelectedBooking(null);
      }

      setSuccess("Booking successfully delete ho gayi.");
    } catch (err) {
      console.error("Failed to delete booking:", err);

      setError(
        err?.response?.data?.message ||
        "Booking delete nahi ho saki."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusConfig = (status) => {
    return (
      statusStyles[status] || {
        label: status || "Unknown",
        className:
          "bg-slate-100 text-slate-600 border-slate-200",
        icon: Clock3,
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <CalendarDays size={14} />
              Booking Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Bookings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Customer bookings dekhein aur unka status manage karein.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <CalendarDays size={20} />
              </div>
            </div>

            <p className="text-sm text-slate-500">Total Bookings</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statistics.total}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock3 size={20} />
              </div>
            </div>

            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statistics.pending}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <p className="text-sm text-slate-500">Confirmed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statistics.confirmed}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {statistics.completed}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Customer, email, phone ya product search karein..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 lg:w-52"
            >
              <option value="all">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusStyles[status].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2
                  size={32}
                  className="animate-spin text-blue-600"
                />
                <span className="text-sm font-medium">
                  Bookings load ho rahi hain...
                </span>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <CalendarDays size={34} />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No bookings found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Abhi koi booking nahi mili ya current search/filter
                ke mutabiq koi result nahi hai.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Required Date / Month
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const statusConfig = getStatusConfig(
                      booking.status
                    );

                    const StatusIcon = statusConfig.icon;
                    const image = getProductImage(booking);

                    return (
                      <tr
                        key={booking._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-800">
                              #{getBookingId(booking)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDateTime(booking.createdAt)}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <User size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">
                                {getCustomerName(booking)}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {getCustomerPhone(booking)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                              {image ? (
                                <img
                                  src={image}
                                  alt={getBookingProductName(
                                    booking
                                  )}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <Package size={18} />
                                </div>
                              )}
                            </div>

                            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                              {getBookingProductName(booking)}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CalendarDays
                              size={16}
                              className="text-blue-500"
                            />
                            {getBookingDate(booking)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-800">
                            {formatPrice(
                              booking.bookingPrice
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusConfig.className}`}
                          >
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenDetails(booking)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(booking)
                              }
                              disabled={
                                deletingId === booking._id
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete booking"
                            >
                              {deletingId === booking._id ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-700">
            {filteredBookings.length}
          </span>{" "}
          booking
          {filteredBookings.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Booking Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  #{getBookingId(selectedBooking)}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                disabled={Boolean(updatingId)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Product */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {getProductImage(selectedBooking) ? (
                    <img
                      src={getProductImage(selectedBooking)}
                      alt={getBookingProductName(
                        selectedBooking
                      )}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Package size={28} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Product
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {getBookingProductName(selectedBooking)}
                  </h3>

                  <p className="mt-1 font-bold text-blue-600">
                    {formatPrice(
                      selectedBooking.bookingPrice
                    )}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <User size={16} />
                  Customer Information
                </h3>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {getCustomerName(selectedBooking)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Mail size={13} />
                      Email
                    </p>

                    <p className="mt-1 break-all font-semibold text-slate-800">
                      {getCustomerEmail(selectedBooking)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Phone size={13} />
                      Phone
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {getCustomerPhone(selectedBooking)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirement */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <CalendarDays size={16} />
                  Booking Requirement
                </h3>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-medium text-blue-700">
                    {getBookingRequirement(selectedBooking)}
                  </p>

                  <p className="mt-2 text-xs text-blue-600/80">
                    Booking created:{" "}
                    {formatDateTime(
                      selectedBooking.createdAt
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Note */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <FileText size={16} />
                  Customer Note
                </h3>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {selectedBooking.customerNote ? (
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedBooking.customerNote}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      Customer ne koi note nahi diya.
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <FileText size={16} />
                  Admin Note
                </label>

                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(event.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="Admin note likhein..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {adminNote.length}/1000
                </p>
              </div>

              {/* Status */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Update Booking Status
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {STATUS_OPTIONS.map((status) => {
                    const config = statusStyles[status];
                    const Icon = config.icon;
                    const isActive =
                      selectedBooking.status === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            selectedBooking,
                            status
                          )
                        }
                        disabled={
                          Boolean(updatingId) ||
                          isActive
                        }
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${isActive
                            ? config.className
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {updatingId === selectedBooking._id &&
                          isActive ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Icon size={14} />
                        )}

                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(selectedBooking)
                  }
                  disabled={
                    deletingId === selectedBooking._id ||
                    Boolean(updatingId)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === selectedBooking._id ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={17} />
                  )}

                  Delete Booking
                </button>

                <button
                  type="button"
                  onClick={handleCloseDetails}
                  disabled={Boolean(updatingId)}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}