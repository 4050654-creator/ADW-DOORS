import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  CalendarDays,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";

function Orders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getMyOrders(token);

        setOrders(
          response?.orders ||
          response?.data?.orders ||
          []
        );
      } catch (err) {
        console.error("Orders error:", err);

        setError(
          err?.response?.data?.message ||
          "Orders load nahi ho sake."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "delivered" ||
      value === "completed"
    ) {
      return "bg-green-50 text-green-600 border-green-200";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "bg-red-50 text-red-600 border-red-200";
    }

    if (
      value === "shipped" ||
      value === "processing"
    ) {
      return "bg-blue-50 text-blue-600 border-blue-200";
    }

    return "bg-orange-50 text-orange-600 border-orange-200";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-[#f8fbff]">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-orange-500"
          />

          <p className="mt-4 font-bold text-slate-500">
            Loading your orders...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] bg-[#f8fbff] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">
            Account Center
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900 sm:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 text-slate-500">
            Track and manage all your ADW-STORE orders.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
            <AlertCircle size={22} />

            <span className="font-bold">
              {error}
            </span>
          </div>
        )}

        {/* EMPTY */}
        {!error && orders.length === 0 && (
          <div className="rounded-[32px] bg-white px-6 py-20 text-center shadow-xl">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <ShoppingBag size={42} />
            </div>

            <h2 className="mt-7 text-3xl font-black text-slate-900">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              You haven't placed any orders yet.
              Start shopping and your orders will appear here.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
            >
              Start Shopping
              <ChevronRight size={18} />
            </Link>

          </div>
        )}

        {/* ORDERS */}
        {orders.length > 0 && (
          <div className="space-y-5">

            {orders.map((order) => {

              const orderId =
                order._id ||
                order.id;

              const items =
                order.items ||
                order.orderItems ||
                [];

              const total =
                order.totalAmount ??
                order.total ??
                order.grandTotal ??
                0;

              const status =
                order.orderStatus ||
                order.status ||
                "Pending";

              return (
                <div
                  key={orderId}
                  className="overflow-hidden rounded-[28px] bg-white shadow-lg transition hover:shadow-xl"
                >

                  {/* TOP */}
                  <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                        <Package size={26} />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Order
                        </p>

                        <h2 className="mt-1 font-black text-slate-900">
                          #{String(orderId).slice(-8).toUpperCase()}
                        </h2>
                      </div>

                    </div>

                    <div
                      className={`w-fit rounded-full border px-4 py-2 text-xs font-black ${getStatusStyle(
                        status
                      )}`}
                    >
                      {String(status)
                        .charAt(0)
                        .toUpperCase() +
                        String(status).slice(1)}
                    </div>

                  </div>

                  {/* BODY */}
                  <div className="p-6">

                    <div className="grid gap-5 sm:grid-cols-3">

                      {/* DATE */}
                      <div className="flex items-center gap-3">
                        <CalendarDays
                          size={20}
                          className="text-slate-400"
                        />

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            Order Date
                          </p>

                          <p className="mt-1 font-black text-slate-700">
                            {formatDate(
                              order.createdAt ||
                              order.orderDate
                            )}
                          </p>
                        </div>
                      </div>

                      {/* ITEMS */}
                      <div className="flex items-center gap-3">
                        <ShoppingBag
                          size={20}
                          className="text-slate-400"
                        />

                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            Items
                          </p>

                          <p className="mt-1 font-black text-slate-700">
                            {items.length}{" "}
                            {items.length === 1
                              ? "Item"
                              : "Items"}
                          </p>
                        </div>
                      </div>

                      {/* TOTAL */}
                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Total Amount
                        </p>

                        <p className="mt-1 text-xl font-black text-orange-500">
                          {formatPrice(total)}
                        </p>
                      </div>

                    </div>

                    {/* PRODUCTS PREVIEW */}
                    {items.length > 0 && (
                      <div className="mt-6 border-t border-slate-100 pt-5">

                        <div className="space-y-3">

                          {items
                            .slice(0, 3)
                            .map((item, index) => {

                              const product =
                                item.product ||
                                item;

                              const name =
                                product.name ||
                                item.productName ||
                                "Product";

                              const quantity =
                                item.quantity || 1;

                              return (
                                <div
                                  key={
                                    item._id ||
                                    item.id ||
                                    index
                                  }
                                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                                >
                                  <span className="font-bold text-slate-700">
                                    {name}
                                  </span>

                                  <span className="text-sm font-black text-slate-400">
                                    × {quantity}
                                  </span>
                                </div>
                              );
                            })}

                        </div>

                      </div>
                    )}

                    {/* VIEW */}
                    <div className="mt-6 flex justify-end">

                      <Link
                        to={`/orders/${orderId}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
                      >
                        View Order
                        <ChevronRight size={17} />
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}

export default Orders;