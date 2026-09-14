import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  Loader2,
  AlertCircle,
  Phone,
} from "lucide-react";

import { getOrderById } from "../../services/orderService";


// =====================================
// STATUS CONFIG
// =====================================

const statusSteps = [
  {
    key: "pending",
    label: "Order Placed",
    icon: Clock3,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    key: "processing",
    label: "Processing",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
  },
];


// =====================================
// HELPERS
// =====================================

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString()}`;
};


// =====================================
// TRACK ORDER
// =====================================

function TrackOrder() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===================================
  // LOAD ORDER
  // ===================================

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("Order ID is missing.");
          return;
        }

        const response = await getOrderById(id);

        if (response?.success === false) {
          setError(response.message || "Failed to load order.");
          return;
        }

        const loadedOrder = response?.order || response?.data || response;

        if (!loadedOrder || !loadedOrder._id) {
          setError("Order not found.");
          return;
        }

        setOrder(loadedOrder);
      } catch (err) {
        console.error("Track order error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load order. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);


  // ===================================
  // LOADING
  // ===================================

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-24">

          <div className="text-center">

            <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />

            <p className="mt-4 font-medium text-slate-500">
              Loading your order...
            </p>

          </div>

        </div>
      </section>
    );
  }


  // ===================================
  // ERROR
  // ===================================

  if (error || !order) {
    return (
      <section className="min-h-[70vh] bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">

            <AlertCircle className="mx-auto h-14 w-14 text-red-500" />

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Unable to Load Order
            </h1>

            <p className="mt-3 text-slate-500">
              {error || "Order not found."}
            </p>

            <Link
              to="/orders"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-orange-500"
            >
              <ArrowLeft size={18} />
              Back to Orders
            </Link>

          </div>

        </div>
      </section>
    );
  }


  // ===================================
  // ORDER DATA
  // ===================================

  const currentStatus = order.orderStatus || "pending";

  const currentIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus
  );

  const isCancelled = currentStatus === "cancelled";

  const address = order.address || {};

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const subtotal = Number(order.subtotal || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const totalAmount = Number(
    order.totalAmount || subtotal + shippingFee
  );


  // ===================================
  // PAGE
  // ===================================

  return (
    <section className="min-h-screen bg-[#f8fbff] px-4 py-8 sm:py-12">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            TOP
        ================================= */}

        <div className="mb-8">

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-500"
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                Track Order
              </p>

              <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                {order.orderNumber || "Order"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Placed on {formatDate(order.createdAt)}
                {order.createdAt && ` at ${formatTime(order.createdAt)}`}
              </p>

            </div>

            <div
              className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-black ${
                isCancelled
                  ? "bg-red-100 text-red-600"
                  : currentStatus === "delivered"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {isCancelled
                ? "Order Cancelled"
                : currentStatus.charAt(0).toUpperCase() +
                  currentStatus.slice(1)}
            </div>

          </div>

        </div>


        {/* =================================
            CANCELLED
        ================================= */}

        {isCancelled ? (
          <div className="mb-8 rounded-3xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>

              <div>

                <h2 className="text-xl font-black text-slate-900">
                  Order Cancelled
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This order has been cancelled. If you have any questions,
                  please contact our support team.
                </p>

              </div>

            </div>

          </div>
        ) : (
          /* =================================
             STATUS TRACKER
          ================================= */

          <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-8">

              <h2 className="text-xl font-black text-slate-900">
                Order Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Follow your order from placement to delivery.
              </p>

            </div>


            {/* Desktop / Tablet */}

            <div className="hidden md:block">

              <div className="relative">

                <div className="absolute left-[10%] right-[10%] top-6 h-1 rounded-full bg-slate-200" />

                <div
                  className="absolute left-[10%] top-6 h-1 rounded-full bg-orange-500 transition-all duration-500"
                  style={{
                    width:
                      currentIndex <= 0
                        ? "0%"
                        : `${Math.min(
                            currentIndex,
                            statusSteps.length - 1
                          ) * 20}%`,
                  }}
                />

                <div className="relative grid grid-cols-5 gap-2">

                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;

                    const completed =
                      currentIndex >= index;

                    const active =
                      currentIndex === index;

                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center text-center"
                      >

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                            completed
                              ? "bg-orange-500 text-white"
                              : "bg-slate-100 text-slate-400"
                          } ${
                            active
                              ? "ring-4 ring-orange-100"
                              : ""
                          }`}
                        >
                          <Icon size={21} />
                        </div>

                        <p
                          className={`mt-3 text-sm font-bold ${
                            completed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>

                      </div>
                    );
                  })}

                </div>

              </div>

            </div>


            {/* Mobile */}

            <div className="space-y-4 md:hidden">

              {statusSteps.map((step, index) => {
                const Icon = step.icon;

                const completed =
                  currentIndex >= index;

                const active =
                  currentIndex === index;

                return (
                  <div
                    key={step.key}
                    className="flex items-center gap-4"
                  >

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      } ${
                        active
                          ? "ring-4 ring-orange-100"
                          : ""
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div>

                      <p
                        className={`font-bold ${
                          completed
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>

                      {active && (
                        <p className="text-xs text-orange-500">
                          Current status
                        </p>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        )}


        {/* =================================
            MAIN GRID
        ================================= */}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">


          {/* =================================
              LEFT
          ================================= */}

          <div className="space-y-8">


            {/* ITEMS */}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>

                <div>

                  <h2 className="text-xl font-black text-slate-900">
                    Order Items
                  </h2>

                  <p className="text-sm text-slate-500">
                    {items.length}{" "}
                    {items.length === 1 ? "item" : "items"}
                  </p>

                </div>

              </div>


              <div className="divide-y divide-slate-100">

                {items.map((item, index) => (

                  <div
                    key={`${item.product?._id || item.product || index}`}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >

                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="text-slate-400" />
                        </div>
                      )}

                    </div>


                    <div className="min-w-0 flex-1">

                      <h3 className="font-black text-slate-900">
                        {item.name || "Product"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Quantity: {item.quantity || 1}
                      </p>

                      <p className="mt-2 font-bold text-orange-500">
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 1)
                        )}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* DELIVERY ADDRESS */}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>

                <div>

                  <h2 className="text-xl font-black text-slate-900">
                    Delivery Address
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your order will be delivered here.
                  </p>

                </div>

              </div>


              <div className="rounded-2xl bg-slate-50 p-5">

                <h3 className="font-black text-slate-900">
                  {address.fullName || "Customer"}
                </h3>

                {address.phone && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={15} />
                    {address.phone}
                  </p>
                )}

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {address.address || "Address not available"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {address.city || ""}
                  {address.postalCode
                    ? `, ${address.postalCode}`
                    : ""}
                </p>

                {address.instructions && (
                  <div className="mt-4 border-t border-slate-200 pt-4">

                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Delivery Instructions
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {address.instructions}
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>


          {/* =================================
              RIGHT
          ================================= */}

          <div className="space-y-8">


            {/* PAYMENT */}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>

                <div>

                  <h2 className="font-black text-slate-900">
                    Payment
                  </h2>

                  <p className="text-sm text-slate-500">
                    {order.paymentMethod === "online"
                      ? "Online Payment"
                      : "Cash on Delivery"}
                  </p>

                </div>

              </div>


              <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center justify-between gap-3">

                  <span className="text-sm text-slate-500">
                    Payment Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "refunded"
                        ? "bg-purple-100 text-purple-700"
                        : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {String(
                      order.paymentStatus || "pending"
                    )
                      .replace("_", " ")
                      .replace(/^./, (char) =>
                        char.toUpperCase()
                      )}
                  </span>

                </div>

              </div>

            </div>


            {/* ORDER SUMMARY */}

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-black text-slate-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between gap-4 text-sm">

                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-slate-900">
                    {formatPrice(subtotal)}
                  </span>

                </div>


                <div className="flex justify-between gap-4 text-sm">

                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span className="font-bold text-slate-900">
                    {shippingFee === 0
                      ? "Free"
                      : formatPrice(shippingFee)}
                  </span>

                </div>


                <div className="border-t border-slate-100 pt-4">

                  <div className="flex items-center justify-between gap-4">

                    <span className="font-black text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-black text-orange-500">
                      {formatPrice(totalAmount)}
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* BACK BUTTON */}

            <Link
              to="/orders"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 font-black text-white transition hover:bg-orange-500"
            >
              <ArrowLeft size={18} />
              Back to My Orders
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}

export default TrackOrder;

