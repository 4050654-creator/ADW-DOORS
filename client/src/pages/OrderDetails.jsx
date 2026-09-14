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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getOrderById(id, token);

        setOrder(
          response?.order ||
          response?.data?.order ||
          null
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
          "Order load nahi ho saka."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, token]);

  const getStatus = () => {
    return String(
      order?.orderStatus || "pending"
    ).toLowerCase();
  };

  const status = getStatus();

  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock3,
      className:
        "bg-orange-50 text-orange-600 border-orange-200",
    },
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle2,
      className:
        "bg-blue-50 text-blue-600 border-blue-200",
    },
    processing: {
      label: "Processing",
      icon: Package,
      className:
        "bg-purple-50 text-purple-600 border-purple-200",
    },
    shipped: {
      label: "Shipped",
      icon: Truck,
      className:
        "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    delivered: {
      label: "Delivered",
      icon: CheckCircle2,
      className:
        "bg-green-50 text-green-600 border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className:
        "bg-red-50 text-red-600 border-red-200",
    },
  };

  const currentStatus =
    statusConfig[status] ||
    statusConfig.pending;

  const StatusIcon = currentStatus.icon;

  const formatPrice = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <section className="flex min-h-[80vh] items-center justify-center bg-[#f8fbff]">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-orange-500"
          />
          <p className="mt-4 font-bold text-slate-500">
            Loading order...
          </p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="min-h-[80vh] bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[32px] bg-white p-10 text-center shadow-xl">
            <AlertCircle
              size={55}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-5 text-3xl font-black text-slate-900">
              Order Not Found
            </h1>

            <p className="mt-3 text-slate-500">
              {error || "This order could not be found."}
            </p>

            <Link
              to="/orders"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-black text-white transition hover:bg-orange-500"
            >
              <ArrowLeft size={18} />
              Back to Orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const items =
    order.items ||
    order.orderItems ||
    [];

  const address =
    order.address ||
    order.shippingAddress ||
    {};

  return (
    <section className="min-h-[80vh] bg-[#f8fbff] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/orders"
          className="mb-7 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-orange-500"
        >
          <ArrowLeft size={18} />
          Back to My Orders
        </Link>

        <div className="mb-7 flex flex-col gap-5 rounded-[28px] bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
              Order Details
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              #{order.orderNumber || String(order._id).slice(-8).toUpperCase()}
            </h1>

            <p className="mt-2 text-sm font-bold text-slate-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-5 py-3 text-sm font-black ${currentStatus.className}`}
          >
            <StatusIcon size={18} />
            {currentStatus.label}
          </div>

        </div>

        <div className="mb-7 rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

          <h2 className="text-xl font-black text-slate-900">
            Order Status
          </h2>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-6">

            {[
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ].map((itemStatus) => {

              const config =
                statusConfig[itemStatus];

              const Icon = config.icon;

              const isCurrent =
                status === itemStatus;

              return (
                <div
                  key={itemStatus}
                  className={`rounded-2xl border p-4 text-center transition ${
                    isCurrent
                      ? config.className
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                >
                  <Icon
                    size={21}
                    className="mx-auto"
                  />

                  <p className="mt-2 text-[11px] font-black">
                    {config.label}
                  </p>
                </div>
              );
            })}

          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">

          <div className="rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
                <Package size={22} />
              </div>

              <h2 className="text-xl font-black text-slate-900">
                Ordered Items
              </h2>
            </div>

            <div className="mt-7 space-y-4">

              {items.map((item, index) => {

                const product =
                  item.product || {};

                const name =
                  item.name ||
                  product.name ||
                  "Product";

                const price =
                  item.price ||
                  product.salePrice ||
                  product.price ||
                  0;

                const quantity =
                  Number(item.quantity || 1);

                const image =
                  item.image ||
                  product.image ||
                  "";

                return (
                  <div
                    key={
                      item._id ||
                      item.id ||
                      index
                    }
                    className="flex gap-4 rounded-2xl bg-slate-50 p-4"
                  >

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          size={28}
                          className="text-slate-300"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-slate-800">
                        {name}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-slate-400">
                        Quantity × {quantity}
                      </p>

                      <p className="mt-2 font-black text-orange-500">
                        {formatPrice(price * quantity)}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          <div className="space-y-7">

            <div className="rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-500">
                  <MapPin size={22} />
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  Delivery Address
                </h2>
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <p className="font-black text-slate-800">
                  {address.fullName || "—"}
                </p>

                <p className="font-bold text-slate-500">
                  {address.phone || "—"}
                </p>

                {address.email && (
                  <p className="font-bold text-slate-500">
                    {address.email}
                  </p>
                )}

                <p className="pt-2 font-bold leading-6 text-slate-500">
                  {address.address || "—"}
                  <br />
                  {address.city || "—"}
                  {address.postalCode
                    ? ` - ${address.postalCode}`
                    : ""}
                </p>

              </div>

            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-purple-50 p-3 text-purple-500">
                  <CreditCard size={22} />
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  Payment
                </h2>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="font-bold text-slate-500">
                  Method
                </span>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase text-orange-600">
                  {order.paymentMethod === "online"
                    ? "Online"
                    : "Cash on Delivery"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-bold text-slate-500">
                  Total
                </span>

                <span className="text-2xl font-black text-orange-500">
                  {formatPrice(
                    order.totalAmount
                  )}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default OrderDetails;