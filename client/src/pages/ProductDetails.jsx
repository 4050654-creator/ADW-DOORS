import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  Zap,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from "lucide-react";

import { getProductById } from "../services/productService";

import { useCart } from "../context/CartContext";
import { useCheckout } from "../context/CheckoutContext";

// ========================================
// PRODUCT IMAGE
// ========================================

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

// ========================================
// COMPONENT
// ========================================

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    addToCart,
    isInCart,
    getProductPrice,
  } = useCart();

  const { startBuyNow } = useCheckout();

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [added, setAdded] = useState(false);

  const [imageError, setImageError] = useState(false);

  // ========================================
  // IMAGE VIEWER
  // ========================================

  const [isImageViewerOpen, setIsImageViewerOpen] =
    useState(false);

  const [imageZoom, setImageZoom] = useState(1);

  const [imagePosition, setImagePosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [isDragging, setIsDragging] =
    useState(false);

  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

  // ========================================
  // LOAD PRODUCT
  // ========================================

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Product ID missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setImageError(false);

        console.log(
          "PRODUCT DETAILS ID:",
          id
        );

        const response =
          await getProductById(id);

        console.log(
          "PRODUCT DETAILS RESPONSE:",
          response
        );

        let loadedProduct = null;

        if (
          response?.success &&
          response?.product
        ) {
          loadedProduct =
            response.product;
        } else if (
          response?.data?.product
        ) {
          loadedProduct =
            response.data.product;
        } else if (
          response?.data
        ) {
          loadedProduct =
            response.data;
        } else if (
          response?._id
        ) {
          loadedProduct =
            response;
        }

        if (
          loadedProduct?._id
        ) {
          setProduct(
            loadedProduct
          );
        } else {
          setError(
            "Product not found."
          );
        }
      } catch (err) {
        console.error(
          "Product details error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Product load nahi ho saka."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // ========================================
  // CART CHECK
  // ========================================

  useEffect(() => {
    if (
      product &&
      isInCart(product._id)
    ) {
      setAdded(true);
    }
  }, [
    product,
    isInCart,
  ]);

  // ========================================
  // IMAGE VIEWER
  // ========================================

  const openImageViewer = () => {
    if (!productImage) {
      return;
    }

    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0,
    });

    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);

    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0,
    });

    setIsDragging(false);
  };

  const zoomIn = () => {
    setImageZoom((current) =>
      Math.min(
        Number(
          (current + 0.25).toFixed(2)
        ),
        4
      )
    );
  };

  const zoomOut = () => {
    setImageZoom((current) => {
      const next = Math.max(
        Number(
          (current - 0.25).toFixed(2)
        ),
        1
      );

      if (next === 1) {
        setImagePosition({
          x: 0,
          y: 0,
        });
      }

      return next;
    });
  };

  const resetImage = () => {
    setImageZoom(1);

    setImagePosition({
      x: 0,
      y: 0,
    });
  };

  const handleImageWheel = (event) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  const handleMouseDown = (event) => {
    if (imageZoom <= 1) {
      return;
    }

    event.preventDefault();

    setIsDragging(true);

    setDragStart({
      x:
        event.clientX -
        imagePosition.x,

      y:
        event.clientY -
        imagePosition.y,
    });
  };

  const handleMouseMove = (event) => {
    if (
      !isDragging ||
      imageZoom <= 1
    ) {
      return;
    }

    setImagePosition({
      x:
        event.clientX -
        dragStart.x,

      y:
        event.clientY -
        dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ========================================
  // ESC KEY
  // ========================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        isImageViewerOpen
      ) {
        closeImageViewer();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isImageViewerOpen,
  ]);

  // ========================================
  // BODY SCROLL LOCK
  // ========================================

  useEffect(() => {
    if (isImageViewerOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    isImageViewerOpen,
  ]);

  // ========================================
  // QUANTITY
  // ========================================

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    const stock = Number(
      product.stock || 0
    );

    setQuantity((current) =>
      Math.min(
        current + 1,
        stock
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(
        current - 1,
        1
      )
    );
  };

  // ========================================
  // ADD TO CART
  // ========================================

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const result = addToCart(
      product,
      quantity
    );

    if (result?.success) {
      setAdded(true);
    }
  };

  // ========================================
  // BUY NOW
  // ========================================

  const handleBuyNow = () => {
    if (!product) {
      return;
    }

    const success =
      startBuyNow(
        product,
        quantity
      );

    if (success) {
      navigate("/checkout");
    }
  };

  // ========================================
  // BOOK NOW
  // ========================================

  const handleBookNow = () => {
    // IMPORTANT:
    // URL ka ID directly use hoga.
    // Is se product._id missing hone ki
    // wajah se Product ID error nahi ayega.

    if (!id) {
      console.error(
        "BOOKING ERROR: URL Product ID missing"
      );

      return;
    }

    if (!product) {
      console.error(
        "BOOKING ERROR: Product not loaded"
      );

      return;
    }

    const productId =
      product._id || id;

    if (!productId) {
      console.error(
        "BOOKING ERROR: Product ID missing"
      );

      return;
    }

    const bookingPrice = Number(
      product.bookingPrice || 0
    );

    if (bookingPrice <= 0) {
      return;
    }

    console.log(
      "BOOKING PRODUCT ID:",
      productId
    );

    navigate(
      `/booking/${productId}`
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f8fbff] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-[360px] animate-pulse rounded-[28px] bg-slate-200 sm:h-[430px]" />

            <div className="space-y-5">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

              <div className="h-12 w-3/4 animate-pulse rounded bg-slate-200" />

              <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />

              <div className="h-24 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !product) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-[#f8fbff] px-4">
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl">
          <div className="text-6xl">
            🪁
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Product Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "Ye product available nahi hai."}
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 py-3.5 font-black text-white shadow-lg"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>
      </section>
    );
  }

  // ========================================
  // PRODUCT DATA
  // ========================================

  const price =
    getProductPrice(product);

  const originalPrice =
    Number(
      product.price || 0
    );

  const hasSale =
    product.salePrice !==
      undefined &&
    product.salePrice !==
      null &&
    Number(
      product.salePrice
    ) < originalPrice;

  const stock =
    Number(
      product.stock || 0
    );

  const rating =
    Number(
      product.rating || 0
    );

  const reviewCount =
    Number(
      product.reviewCount ||
        0
    );

  const alreadyInCart =
    isInCart(
      product._id
    );

  const totalPrice =
    price * quantity;

  const productImage =
    getProductImage(
      product
    );

  const hasValidImage =
    Boolean(productImage) &&
    !imageError;

  const bookingPrice =
    Number(
      product.bookingPrice ||
        0
    );

  const bookingAvailable =
    bookingPrice > 0;

  // ========================================
  // RETURN
  // ========================================

  return (
    <>
      <section className="min-h-screen bg-[#f8fbff] px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-500"
          >
            <ArrowLeft size={17} />
            Back to Shop
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-8 lg:gap-10">
            {/* Product Image */}

            <div className="w-full">
              <div
                className={`relative overflow-hidden rounded-[26px] border border-white bg-gradient-to-br from-sky-100 via-blue-100 to-orange-100 shadow-lg sm:rounded-[30px] ${
                  hasValidImage
                    ? "cursor-zoom-in"
                    : ""
                }`}
                onClick={
                  hasValidImage
                    ? openImageViewer
                    : undefined
                }
              >
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-300/25 blur-3xl" />

                <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-purple-300/25 blur-3xl" />

                {hasValidImage ? (
                  <>
                    <img
                      src={productImage}
                      alt={
                        product.name ||
                        "Product image"
                      }
                      className="relative z-10 h-[330px] w-full object-cover transition duration-500 hover:scale-[1.02] sm:h-[420px] md:h-[430px] lg:h-[500px]"
                      onError={() => {
                        setImageError(
                          true
                        );
                      }}
                    />

                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-md">
                      <Maximize2 size={15} />
                      Click to zoom
                    </div>
                  </>
                ) : (
                  <div className="relative z-10 flex h-[330px] items-center justify-center sm:h-[420px] md:h-[430px] lg:h-[500px]">
                    <span className="text-[100px] drop-shadow-2xl sm:text-[130px]">
                      🪁
                    </span>
                  </div>
                )}

                {product.isFeatured && (
                  <div className="absolute left-4 top-4 z-20 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                    Featured
                  </div>
                )}

                {hasSale && (
                  <div className="absolute right-4 top-4 z-20 rounded-full bg-red-500 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                    SALE
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}

            <div className="min-w-0 py-1 md:py-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                {product.category?.name ||
                  "Basant Collection"}
              </p>

              <h1 className="mt-2 break-words text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <=
                          Math.round(
                            rating
                          )
                            ? "fill-orange-400 text-orange-400"
                            : "text-slate-300"
                        }
                      />
                    )
                  )}
                </div>

                <span className="text-sm font-black text-slate-700">
                  {rating.toFixed(1)}
                </span>

                <span className="text-sm text-slate-400">
                  ({reviewCount} reviews)
                </span>
              </div>

              {/* Price */}

              <div className="mt-5 flex flex-wrap items-end gap-2">
                <span className="text-3xl font-black text-slate-900 sm:text-4xl">
                  Rs.{" "}
                  {price.toLocaleString()}
                </span>

                {hasSale && (
                  <span className="pb-1 text-base font-bold text-slate-400 line-through">
                    Rs.{" "}
                    {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                {product.description ||
                  product.shortDescription ||
                  "Premium quality Basant product. Perfect for your Basant collection."}
              </p>

              {/* Stock */}

              <div className="mt-4">
                {stock > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {stock} items available
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-500">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity */}

              {stock > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
                    Quantity
                  </p>

                  <div className="flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <= 1
                      }
                      className="p-3 transition hover:bg-orange-50 hover:text-orange-500 disabled:opacity-30"
                    >
                      <Minus size={17} />
                    </button>

                    <span className="min-w-12 text-center text-sm font-black">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >= stock
                      }
                      className="p-3 transition hover:bg-orange-50 hover:text-orange-500 disabled:opacity-30"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* Total */}

              {stock > 0 && (
                <div className="mt-4 flex max-w-xl items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
                  <span className="text-sm font-bold text-slate-500">
                    Total
                  </span>

                  <span className="text-xl font-black text-slate-900">
                    Rs.{" "}
                    {totalPrice.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Action Buttons */}

              {stock > 0 && (
                <div className="mt-5 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {alreadyInCart ||
                  added ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/cart"
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-black text-white shadow-lg transition hover:bg-emerald-600"
                    >
                      <Check size={19} />
                      Go to Cart
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        handleAddToCart
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <ShoppingCart size={19} />
                      Add to Cart
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleBuyNow
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
                  >
                    <Zap
                      size={19}
                      className="fill-orange-400 text-orange-400"
                    />
                    Buy Now
                  </button>
                </div>
              )}

              {/* Booking */}

              {bookingAvailable && (
                <div className="mt-5 max-w-xl overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-pink-50">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
                        <CalendarDays size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-orange-600">
                          Booking Available
                        </p>

                        <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">
                          Product reserve karne ke liye
                          booking amount{" "}
                          <span className="font-black text-slate-900">
                            Rs.{" "}
                            {bookingPrice.toLocaleString()}
                          </span>{" "}
                          hai.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleBookNow
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <CalendarDays size={19} />
                      Book Now
                    </button>
                  </div>
                </div>
              )}

              {/* Trust */}

              <div className="mt-5 grid max-w-xl grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-slate-800">
                        Secure
                      </p>

                      <p className="hidden text-[11px] text-slate-400 sm:block">
                        Safe shopping
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Truck size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-slate-800">
                        Delivery
                      </p>

                      <p className="hidden text-[11px] text-slate-400 sm:block">
                        Across Pakistan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SKU */}

              {product.sku && (
                <p className="mt-4 text-xs font-bold text-slate-400">
                  SKU:{" "}
                  <span className="text-slate-500">
                    {product.sku}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FULLSCREEN IMAGE VIEWER */}

      {isImageViewerOpen &&
        hasValidImage && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-6"
            onMouseUp={
              handleMouseUp
            }
            onMouseLeave={
              handleMouseUp
            }
            onClick={
              closeImageViewer
            }
          >
            {/* Top Bar */}

            <div
              className="absolute left-3 right-3 top-3 z-[10001] flex items-center justify-between sm:left-6 sm:right-6 sm:top-5"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur-md">
                {Math.round(
                  imageZoom * 100
                )}
                %
              </div>

              <button
                type="button"
                onClick={
                  closeImageViewer
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-red-500"
                aria-label="Close image viewer"
              >
                <X size={23} />
              </button>
            </div>

            {/* Image Area */}

            <div
              className="flex h-full w-full items-center justify-center overflow-hidden"
              onClick={(event) =>
                event.stopPropagation()
              }
              onWheel={
                handleImageWheel
              }
              onMouseDown={
                handleMouseDown
              }
              onMouseMove={
                handleMouseMove
              }
              onMouseUp={
                handleMouseUp
              }
              onMouseLeave={
                handleMouseUp
              }
              style={{
                cursor:
                  imageZoom > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "zoom-in",
              }}
            >
              <img
                src={productImage}
                alt={
                  product.name ||
                  "Product image"
                }
                draggable={false}
                className="max-h-[88vh] max-w-[95vw] select-none rounded-xl object-contain shadow-2xl"
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageZoom})`,
                  transition:
                    isDragging
                      ? "none"
                      : "transform 0.2s ease-out",
                  transformOrigin:
                    "center center",
                }}
              />
            </div>

            {/* Bottom Controls */}

            <div
              className="absolute bottom-4 left-1/2 z-[10001] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-xl sm:bottom-6"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                onClick={zoomOut}
                disabled={
                  imageZoom <= 1
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>

              <button
                type="button"
                onClick={
                  resetImage
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Reset zoom"
              >
                <RotateCcw size={19} />
              </button>

              <button
                type="button"
                onClick={zoomIn}
                disabled={
                  imageZoom >= 4
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
            </div>

            <div className="absolute bottom-20 left-1/2 z-[10000] -translate-x-1/2 whitespace-nowrap text-center text-[11px] font-bold text-white/60 sm:bottom-24">
              Mouse wheel = Zoom •
              Drag = Move • ESC = Close
            </div>
          </div>
        )}
    </>
  );
}

export default ProductDetails;