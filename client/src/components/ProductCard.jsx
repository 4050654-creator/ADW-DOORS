import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  ShoppingCart,
  Star,
  Check,
} from "lucide-react";

import { useState } from "react";
import { useCart } from "../context/CartContext";

/*
 * Product image resolver
 * ----------------------
 * Ye different image formats ko safely handle karta hai:
 * 1. images: [{ url: "..." }]
 * 2. images: ["..."]
 * 3. image: { url: "..." }
 * 4. image: "..."
 * 5. base64 image
 * 6. missing/broken image
 */

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

function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { addToCart, getProductPrice } = useCart();

  const price = getProductPrice(product);

  const productImage = getProductImage(product);

  const hasSale =
    product.salePrice !== undefined &&
    product.salePrice !== null &&
    Number(product.salePrice) < Number(product.price);

  const hasValidImage =
    productImage && !imageError;

  const handleAddToCart = () => {
    const result = addToCart(product);

    if (result.success) {
      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1500);
    }
  };

  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* ================= IMAGE AREA ================= */}

      <Link
        to={`/product/${product._id}`}
        className="block"
      >
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-sky-100 via-blue-100 to-orange-100">

          {/* Decorative glow */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-300/30 blur-2xl" />

          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-300/30 blur-2xl" />

          {hasValidImage ? (
            <div className="relative z-10 flex h-full w-full items-center justify-center p-4">

              <img
                src={productImage}
                alt={product.name || "Product image"}
                className="
                  h-full
                  w-full
                  object-contain
                  transition
                  duration-500
                  ease-out
                  group-hover:scale-105
                "
                onError={() => {
                  setImageError(true);
                }}
              />

            </div>
          ) : (
            <div className="relative z-10 flex h-full items-center justify-center">
              <span className="text-8xl drop-shadow-xl transition duration-500 group-hover:scale-110">
                🪁
              </span>
            </div>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
            <div className="absolute left-4 top-4 z-20 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-lg">
              Featured
            </div>
          )}

          {/* Open product button */}
          <div className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur transition group-hover:bg-orange-500 group-hover:text-white">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </Link>

      {/* ================= PRODUCT INFO ================= */}

      <div className="p-5">

        {/* Category */}
        <p className="text-xs font-black uppercase tracking-wider text-orange-500">
          {product.category?.name || "Basant Collection"}
        </p>

        {/* Product name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="mt-2 line-clamp-2 text-lg font-black text-slate-900 transition hover:text-orange-500">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-1 text-sm">

          <Star
            size={15}
            className="fill-orange-400 text-orange-400"
          />

          <span className="font-bold text-slate-700">
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="text-slate-400">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end gap-2">

          <span className="text-2xl font-black text-slate-900">
            Rs. {price.toLocaleString()}
          </span>

          {hasSale && (
            <span className="pb-0.5 text-sm font-bold text-slate-400 line-through">
              Rs. {Number(product.price).toLocaleString()}
            </span>
          )}

        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={Number(product.stock || 0) <= 0}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-black text-white shadow-lg transition ${Number(product.stock || 0) <= 0
              ? "cursor-not-allowed bg-slate-400"
              : added
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:-translate-y-0.5 hover:shadow-xl"
            }`}
        >

          {Number(product.stock || 0) <= 0 ? (
            "Out of Stock"
          ) : added ? (
            <>
              <Check size={18} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}

        </button>
      </div>
    </article>
  );
}

export default ProductCard;

