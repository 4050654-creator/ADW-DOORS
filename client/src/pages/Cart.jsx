import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getProductPrice,
  } = useCart();

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[36px] bg-white px-6 py-20 text-center shadow-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
              <ShoppingBag
                size={44}
                className="text-orange-500"
              />
            </div>

            <h1 className="mt-7 text-4xl font-black text-slate-900">
              Your Cart Is Empty
            </h1>

            <p className="mx-auto mt-4 max-w-md leading-7 text-slate-500">
              Abhi cart mein koi product nahi hai. Chalo kuch amazing
              Basant products add karte hain. 🪁
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-7 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <ShoppingBag size={19} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8fbff] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-500"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-black uppercase tracking-[0.25em] text-orange-500">
                Your Collection
              </p>

              <h1 className="mt-2 text-5xl font-black text-slate-900">
                Shopping Cart
              </h1>

              <p className="mt-3 text-slate-500">
                Review your selected Basant products before checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 md:self-auto"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cartItems.map((item) => {
              const price = getProductPrice(item);

              return (
                <div
                  key={item._id}
                  className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-lg sm:p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 to-orange-100 sm:w-28">
                      {item.images?.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">
                          🪁
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                        {item.category?.name || "Basant Collection"}
                      </p>

                      <Link
                        to={`/product/${item._id}`}
                        className="mt-1 block text-xl font-black text-slate-900 hover:text-orange-500"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        Rs. {price.toLocaleString()} each
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item._id)}
                            className="p-2.5 transition hover:bg-orange-50 hover:text-orange-500"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-10 text-center text-sm font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item._id)}
                            disabled={item.quantity >= item.stock}
                            className="p-2.5 transition hover:bg-orange-50 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-black text-slate-900">
                        Rs. {(price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-[30px] bg-slate-900 p-6 text-white shadow-2xl lg:sticky lg:top-28">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">
              Order Summary
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Ready to fly?
            </h2>

            <div className="my-7 space-y-4 border-y border-white/10 py-6">
              <div className="flex items-center justify-between">
                <span className="text-white/60">
                  Subtotal
                </span>

                <span className="font-black">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">
                  Shipping
                </span>

                <span className="font-bold text-orange-300">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="font-bold text-white/60">
                Estimated Total
              </span>

              <span className="text-3xl font-black">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
            >
              Checkout — Next Step
              <ArrowRight size={19} />
            </button>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/5 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <p className="text-xs leading-5 text-white/60">
                Your cart is saved on this device. Continue to
                checkout to enter your delivery details and place
                your order.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Cart;

