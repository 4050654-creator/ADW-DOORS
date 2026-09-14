import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Package,
  User,
  Phone,
  MapPin,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  ShoppingBag,
  DollarSign,
  CreditCard,
  CalendarDays,
  ChevronDown,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  getAllOrders,
  updateOrderStatus,
} from "../../services/orderService";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

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

  const loadOrders = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAllOrders();

      const orderList =
        response?.orders ||
        response?.data?.orders ||
        [];

      setOrders(
        Array.isArray(orderList)
          ? orderList
          : []
      );
    } catch (err) {
      console.error(
        "Admin orders error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Orders load nahi ho sake."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingId(orderId);

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
        "Status update error:",
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

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName =
        order.address?.fullName ||
        "";

      const customerEmail =
        order.address?.email ||
        "";

      const customerPhone =
        order.address?.phone ||
        "";

      const orderNumber =
        order.orderNumber ||
        "";

      const orderId =
        order._id || "";

      const matchesSearch =
        !searchValue ||
        customerName
          .toLowerCase()
          .includes(searchValue) ||
        customerEmail
          .toLowerCase()
          .includes(searchValue) ||
        customerPhone
          .toLowerCase()
          .includes(searchValue) ||
        orderNumber
          .toLowerCase()
          .includes(searchValue) ||
        orderId
          .toString()
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order.orderStatus ===
        statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) =>
        order.orderStatus === "pending"
    ).length;

    const processing = orders.filter(
      (order) =>
        order.orderStatus ===
        "processing"
    ).length;

    const shipped = orders.filter(
      (order) =>
        order.orderStatus === "shipped"
    ).length;

    const delivered = orders.filter(
      (order) =>
        order.orderStatus ===
        "delivered"
    ).length;

    const cancelled = orders.filter(
      (order) =>
        order.orderStatus ===
        "cancelled"
    ).length;

    const revenue = orders
      .filter(
        (order) =>
          order.orderStatus !==
          "cancelled"
      )
      .reduce(
        (totalAmount, order) =>
          totalAmount +
          Number(
            order.totalAmount || 0
          ),
        0
      );

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue,
    };
  }, [orders]);

  const formatPrice = (price) => {
    return `Rs. ${Number(
      price || 0
    ).toLocaleString("en-PK")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getPaymentStyle = (
    paymentStatus
  ) => {
    switch (
    String(
      paymentStatus || ""
    ).toLowerCase()
    ) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "partially_paid":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  return (
    <section className="min-h-screen bg-[#f6f8fc] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1500px]">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-orange-600">
                <ShoppingBag size={14} />
                Admin Management
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Orders
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Manage customer orders, track
                delivery progress and update
                order statuses from one place.
              </p>
            </div>

            <button
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                : "Refresh Orders"}
            </button>

          </div>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

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
                  Waiting for action
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Clock3 size={22} />
              </div>

            </div>
          </motion.div>

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
                <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-black text-indigo-600">
                  {stats.processing +
                    stats.shipped}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Processing + shipped
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Truck size={22} />
              </div>

            </div>
          </motion.div>

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
                  Revenue
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-600">
                  {formatPrice(
                    stats.revenue
                  )}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Excluding cancelled orders
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <DollarSign size={22} />
              </div>

            </div>
          </motion.div>

        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-7 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={19}
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
                placeholder="Search order number, customer, email or phone..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

            </div>

            <div className="relative lg:w-56">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">
                  All Statuses
                </option>

                {statusOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

            </div>

          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <p className="text-xs font-bold text-slate-400">
              Showing{" "}
              <span className="font-black text-slate-700">
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-slate-700">
                {orders.length}
              </span>{" "}
              orders
            </p>

            {(search ||
              statusFilter !==
              "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="text-xs font-black text-orange-500 transition hover:text-orange-600"
                >
                  Clear Filters
                </button>
              )}

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
                Something went wrong
              </p>

              <p className="mt-1 text-sm font-semibold">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white py-24 text-center shadow-sm">

            <Loader2
              size={44}
              className="mx-auto animate-spin text-orange-500"
            />

            <h2 className="mt-5 text-xl font-black text-slate-900">
              Loading Orders
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-400">
              Please wait while we fetch the latest orders.
            </p>

          </div>
        ) : filteredOrders.length ===
          0 ? (

          /* EMPTY */
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-24 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-300">
              <Package size={38} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              No Orders Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-400">
              {orders.length === 0
                ? "Customer orders will appear here when someone places an order."
                : "Try changing your search or status filter."}
            </p>

          </div>
        ) : (

          /* ORDER LIST */
          <div className="space-y-5">

            {filteredOrders.map(
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

                const customerEmail =
                  order.address
                    ?.email ||
                  "No email";

                const customerAddress =
                  order.address
                    ?.address ||
                  "No address";

                const city =
                  order.address
                    ?.city ||
                  "";

                const paymentStatus =
                  order.paymentStatus ||
                  "pending";

                return (
                  <motion.div
                    key={order._id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        Math.min(
                          index * 0.03,
                          0.3
                        ),
                    }}
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg"
                  >

                    {/* ORDER TOP */}
                    <div className="border-b border-slate-100 p-5 sm:p-6">

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                        <div className="flex items-start gap-4">

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                            <Package
                              size={25}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Order Number
                            </p>

                            <h2 className="mt-1 break-all text-lg font-black text-slate-900">
                              #
                              {order.orderNumber ||
                                String(
                                  order._id
                                )
                                  .slice(
                                    -8
                                  )
                                  .toUpperCase()}
                            </h2>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays
                                  size={14}
                                />
                                {formatDate(
                                  order.createdAt
                                )}
                              </span>

                              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                              <span>
                                {formatDateTime(
                                  order.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                          <div
                            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black ${getStatusStyle(
                              order.orderStatus
                            )}`}
                          >
                            <StatusIcon
                              size={15}
                            />

                            {String(
                              order.orderStatus ||
                              "pending"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase() +
                              String(
                                order.orderStatus ||
                                "pending"
                              ).slice(
                                1
                              )}
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
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-48"
                            >
                              {statusOptions.map(
                                (
                                  option
                                ) => (
                                  <option
                                    key={
                                      option.value
                                    }
                                    value={
                                      option.value
                                    }
                                  >
                                    {option.label}
                                  </option>
                                )
                              )}
                            </select>

                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            {updatingId ===
                              order._id && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                                  <Loader2
                                    size={
                                      18
                                    }
                                    className="animate-spin text-orange-500"
                                  />
                                </div>
                              )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ORDER BODY */}
                    <div className="p-5 sm:p-6">

                      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr_1fr]">

                        {/* CUSTOMER */}
                        <div className="rounded-2xl bg-slate-50 p-5">

                          <div className="mb-4 flex items-center gap-2">
                            <User
                              size={17}
                              className="text-orange-500"
                            />

                            <h3 className="text-sm font-black text-slate-900">
                              Customer
                            </h3>
                          </div>

                          <p className="font-black text-slate-800">
                            {customerName}
                          </p>

                          <div className="mt-3 space-y-2">

                            <p className="flex items-start gap-2 text-xs font-bold text-slate-500">
                              <Phone
                                size={14}
                                className="mt-0.5 shrink-0"
                              />
                              <span className="break-all">
                                {
                                  customerPhone
                                }
                              </span>
                            </p>

                            <p className="flex items-start gap-2 text-xs font-bold text-slate-500">
                              <Mail
                                size={14}
                                className="mt-0.5 shrink-0"
                              />
                              <span className="break-all">
                                {
                                  customerEmail
                                }
                              </span>
                            </p>

                          </div>

                        </div>

                        {/* ADDRESS */}
                        <div className="rounded-2xl bg-slate-50 p-5">

                          <div className="mb-4 flex items-center gap-2">
                            <MapPin
                              size={17}
                              className="text-orange-500"
                            />

                            <h3 className="text-sm font-black text-slate-900">
                              Delivery Address
                            </h3>
                          </div>

                          <p className="text-sm font-bold leading-6 text-slate-600">
                            {customerAddress}
                          </p>

                          {city && (
                            <p className="mt-1 text-xs font-black text-slate-400">
                              {city}
                            </p>
                          )}

                        </div>

                        {/* PAYMENT */}
                        <div className="rounded-2xl bg-slate-50 p-5">

                          <div className="mb-4 flex items-center gap-2">
                            <CreditCard
                              size={17}
                              className="text-orange-500"
                            />

                            <h3 className="text-sm font-black text-slate-900">
                              Payment
                            </h3>
                          </div>

                          <p className="text-sm font-black capitalize text-slate-700">
                            {order.paymentMethod ||
                              "COD"}
                          </p>

                          <div
                            className={`mt-3 inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black capitalize ${getPaymentStyle(
                              paymentStatus
                            )}`}
                          >
                            {String(
                              paymentStatus
                            ).replace(
                              "_",
                              " "
                            )}
                          </div>

                        </div>

                      </div>

                      {/* BOTTOM SUMMARY */}
                      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

                          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                            <ShoppingBag
                              size={16}
                            />
                            {items.length}{" "}
                            {items.length ===
                              1
                              ? "Item"
                              : "Items"}
                          </div>

                          <div className="hidden h-4 w-px bg-slate-200 sm:block" />

                          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                            <DollarSign
                              size={16}
                            />
                            Total
                          </div>

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                          <p className="text-xl font-black text-orange-500">
                            {formatPrice(
                              order.totalAmount
                            )}
                          </p>

                          <Link
                            to={`/orders/${order._id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
                          >
                            <Eye size={16} />
                            View Order
                          </Link>

                        </div>

                      </div>

                    </div>

                  </motion.div>
                );
              }
            )}

          </div>
        )}

      </div>
    </section>
  );
}

export default AdminOrders;