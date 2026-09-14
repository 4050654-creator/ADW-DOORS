import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

function OrderSuccess() {
  const location = useLocation();

  const order = location.state?.order;

  const orderNumber =
    order?.orderNumber || "ADW-ORDER";

  const totalAmount =
    Number(order?.totalAmount || 0);

  return (
    <section className="min-h-[80vh] bg-[#f8fbff] px-4 py-16">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-[32px] bg-white p-7 text-center shadow-2xl sm:p-12">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              size={52}
              className="text-emerald-500"
            />
          </div>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-emerald-500">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-900 sm:text-5xl">
            Thank You! 🎉
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-500">
            Your order has been successfully placed.
            We will process your order and keep you
            updated.
          </p>

          <div className="mt-8 rounded-3xl bg-slate-50 p-6 text-left">

            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Order Number
                </p>

                <p className="mt-1 font-black text-slate-900">
                  {orderNumber}
                </p>
              </div>

              <Package
                size={25}
                className="text-orange-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-slate-500">
                Total Amount
              </span>

              <span className="text-2xl font-black text-orange-500">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-bold text-slate-500">
                Payment
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase text-orange-600">
                {order?.paymentMethod === "online"
                  ? "Online"
                  : "Cash on Delivery"}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-bold text-slate-500">
                Status
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase text-amber-600">
                {order?.orderStatus || "Pending"}
              </span>
            </div>

          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">

            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-5 py-4 font-black text-slate-700 transition hover:border-orange-300 hover:text-orange-500"
            >
              <ShoppingBag size={19} />
              Continue Shopping
            </Link>

            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              My Orders
              <ArrowRight size={19} />
            </Link>

          </div>

          <p className="mt-7 text-xs font-bold text-slate-400">
            Thank you for choosing ADW-STORE 🪁
          </p>

        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;