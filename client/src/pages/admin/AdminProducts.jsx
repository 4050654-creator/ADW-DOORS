import { useEffect, useMemo, useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Plus,
  Search,
  RefreshCw,
  Package,
  Pencil,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  Star,
  Power,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Boxes,
  Tag,
  DollarSign,
  Upload,
} from "lucide-react";

import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../../services/productService";

const initialForm = {
  name: "",
  description: "",
  shortDescription: "",
  category: "",
  price: "",
  salePrice: "",
  bookingPrice: "500",
  stock: "0",
  sku: "",
  image: "",
  isFeatured: false,
  isActive: true,
};

const statusOptions = [
  {
    value: "all",
    label: "All Products",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
];

const stockOptions = [
  {
    value: "all",
    label: "All Stock",
  },
  {
    value: "in-stock",
    label: "In Stock",
  },
  {
    value: "low-stock",
    label: "Low Stock",
  },
  {
    value: "out-of-stock",
    label: "Out of Stock",
  },
];

const getProductImage = (product) => {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    return product.images[0]?.url || "";
  }

  return "";
};

const formatPrice = (price) => {
  const number = Number(price || 0);
  return `Rs. ${number.toLocaleString("en-PK")}`;
};

const getDisplayPrice = (product) => {
  if (
    product?.salePrice !== null &&
    product?.salePrice !== undefined &&
    Number(product.salePrice) > 0 &&
    Number(product.salePrice) < Number(product.price)
  ) {
    return Number(product.salePrice);
  }

  return Number(product?.price || 0);
};

function AdminProducts() {
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [productToDelete, setProductToDelete] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState("");

  const [imageUploading, setImageUploading] =
    useState(false);

  const loadCategories = async () => {
    try {
      const response = await getCategories(true);

      setCategories(response?.categories || []);
    } catch (err) {
      console.error("Category loading error:", err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProducts({
        page,
        limit: 12,
        search: search.trim() || undefined,
        category:
          categoryFilter !== "all"
            ? categoryFilter
            : undefined,
      });

      setProducts(response?.products || []);

      setPagination(
        response?.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Product loading error:", err);

      setError(
        err?.response?.data?.message ||
        "Products load nahi ho sake."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, categoryFilter]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (statusFilter === "active") {
      result = result.filter(
        (product) => product.isActive === true
      );
    }

    if (statusFilter === "inactive") {
      result = result.filter(
        (product) => product.isActive === false
      );
    }

    if (stockFilter === "in-stock") {
      result = result.filter(
        (product) => Number(product.stock) > 5
      );
    }

    if (stockFilter === "low-stock") {
      result = result.filter(
        (product) =>
          Number(product.stock) > 0 &&
          Number(product.stock) <= 5
      );
    }

    if (stockFilter === "out-of-stock") {
      result = result.filter(
        (product) => Number(product.stock) <= 0
      );
    }

    if (featuredFilter === "featured") {
      result = result.filter(
        (product) => product.isFeatured === true
      );
    }

    if (featuredFilter === "not-featured") {
      result = result.filter(
        (product) => product.isFeatured !== true
      );
    }

    return result;
  }, [
    products,
    statusFilter,
    stockFilter,
    featuredFilter,
  ]);

  const stats = useMemo(() => {
    const total = products.length;

    const active = products.filter(
      (product) => product.isActive
    ).length;

    const inactive = products.filter(
      (product) => !product.isActive
    ).length;

    const featured = products.filter(
      (product) => product.isFeatured
    ).length;

    const lowStock = products.filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.stock) <= 5
    ).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock) <= 0
    ).length;

    return {
      total,
      active,
      inactive,
      featured,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setPreviewImage("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    const image = getProductImage(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      shortDescription:
        product.shortDescription || "",
      category:
        product.category?._id ||
        product.category ||
        "",
      price: product.price ?? "",
      salePrice:
        product.salePrice !== null &&
          product.salePrice !== undefined
          ? product.salePrice
          : "",
      bookingPrice:
        product.bookingPrice ?? "500",
      stock: product.stock ?? "0",
      sku: product.sku || "",
      image,
      isFeatured: Boolean(product.isFeatured),
      isActive:
        product.isActive === undefined
          ? true
          : Boolean(product.isActive),
    });

    setPreviewImage(image);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingProduct(null);
    setForm(initialForm);
    setPreviewImage("");
    setImageUploading(false);
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    const nextValue =
      type === "checkbox" ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    if (name === "image") {
      setPreviewImage(value);
    }
  };

  /*
   * ==========================================
   * IMAGE PICKER
   * ==========================================
   *
   * Mobile:
   * Gallery / Photos open hogi.
   *
   * Desktop:
   * File Explorer open hoga.
   *
   * Selected image ko data URL mein convert
   * karke form.image mein save karte hain.
   */

  const openImagePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Sirf image file select karo."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image 5MB se zyada nahi honi chahiye."
      );

      event.target.value = "";
      return;
    }

    setImageUploading(true);

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setForm((current) => ({
        ...current,
        image: imageData,
      }));

      setPreviewImage(imageData);

      setImageUploading(false);
    };

    reader.onerror = () => {
      setError(
        "Image read nahi ho saki. Dobara try karo."
      );

      setImageUploading(false);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removeSelectedImage = () => {
    setForm((current) => ({
      ...current,
      image: "",
    }));

    setPreviewImage("");
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name required hai.");
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Product description required hai."
      );
      return;
    }

    if (!form.category) {
      setError("Category select karo.");
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError(
        "Valid regular price enter karo."
      );
      return;
    }

    if (
      form.salePrice !== "" &&
      Number(form.salePrice) >
      Number(form.price)
    ) {
      setError(
        "Sale price regular price se zyada nahi ho sakti."
      );
      return;
    }

    if (Number(form.stock) < 0) {
      setError(
        "Stock negative nahi ho sakta."
      );
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name.trim(),

        description:
          form.description.trim(),

        shortDescription:
          form.shortDescription.trim(),

        category: form.category,

        price: Number(form.price),

        salePrice:
          form.salePrice === ""
            ? null
            : Number(form.salePrice),

        bookingPrice:
          form.bookingPrice === ""
            ? 500
            : Number(form.bookingPrice),

        stock:
          form.stock === ""
            ? 0
            : Number(form.stock),

        sku:
          form.sku.trim() || undefined,

        images: form.image.trim()
          ? [
            {
              url: form.image.trim(),
              alt: form.name.trim(),
            },
          ]
          : [],

        variants: [],

        tags: [],

        isFeatured:
          Boolean(form.isFeatured),

        isActive:
          Boolean(form.isActive),
      };

      if (editingProduct) {
        await updateProduct(
          editingProduct._id,
          productData
        );

        setSuccess(
          "Product successfully update ho gaya."
        );
      } else {
        await createProduct(productData);

        setSuccess(
          "Product successfully create ho gaya."
        );
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm(initialForm);
      setPreviewImage("");

      await loadProducts();
    } catch (err) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Product save nahi ho saka."
      );
    } finally {
      setSaving(false);
    }
  };

  const askDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    if (deletingId) {
      return;
    }

    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!productToDelete?._id) {
      return;
    }

    try {
      setDeletingId(
        productToDelete._id
      );

      setError("");
      setSuccess("");

      await deleteProduct(
        productToDelete._id
      );

      setSuccess(
        "Product successfully delete ho gaya."
      );

      setProductToDelete(null);
      setShowDeleteModal(false);

      await loadProducts();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Product delete nahi ho saka."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (product) => {
    try {
      setError("");

      await updateProduct(
        product._id,
        {
          isActive: !product.isActive,
        }
      );

      setProducts((current) =>
        current.map((item) =>
          item._id === product._id
            ? {
              ...item,
              isActive:
                !item.isActive,
            }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Toggle active error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Product status update nahi ho saka."
      );
    }
  };

  const toggleFeatured = async (product) => {
    try {
      setError("");

      await updateProduct(
        product._id,
        {
          isFeatured:
            !product.isFeatured,
        }
      );

      setProducts((current) =>
        current.map((item) =>
          item._id === product._id
            ? {
              ...item,
              isFeatured:
                !item.isFeatured,
            }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Toggle featured error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Featured status update nahi ho saka."
      );
    }
  };

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      setPage(1);
      loadProducts();
    }
  };

  const handleRefresh = async () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
    setFeaturedFilter("all");
    setPage(1);

    await Promise.all([
      loadCategories(),
      loadProducts(),
    ]);
  };

  const getStockInfo = (stock) => {
    const value = Number(stock || 0);

    if (value <= 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (value <= 5) {
      return {
        label: `Low Stock · ${value}`,
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      label: `${value} in stock`,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  return (
    <section className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="relative px-6 py-8 sm:px-8">

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-orange-400">
                  <Package size={18} />
                  STORE MANAGEMENT
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Products
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                  Apne store ke products,
                  prices, stock, categories aur
                  visibility ko manage karo.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* ALERTS */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 text-sm font-semibold">
                {error}
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700"
            >
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 text-sm font-semibold">
                {success}
              </div>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="rounded-lg p-1 hover:bg-emerald-100"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Package,
              iconClass:
                "bg-blue-50 text-blue-600",
            },
            {
              label: "Active",
              value: stats.active,
              icon: Power,
              iconClass:
                "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Inactive",
              value: stats.inactive,
              icon: Power,
              iconClass:
                "bg-slate-100 text-slate-600",
            },
            {
              label: "Featured",
              value: stats.featured,
              icon: Star,
              iconClass:
                "bg-amber-50 text-amber-600",
            },
            {
              label: "Low Stock",
              value: stats.lowStock,
              icon: Boxes,
              iconClass:
                "bg-orange-50 text-orange-600",
            },
            {
              label: "Out of Stock",
              value: stats.outOfStock,
              icon: Boxes,
              iconClass:
                "bg-red-50 text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClass}`}
                >
                  <Icon size={19} />
                </div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>

                <p className="mt-1 text-2xl font-black text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  onKeyDown={handleSearch}
                  placeholder="Search products... Press Enter"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  loadProducts();
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Search size={18} />
                Search
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(
                    event.target.value
                  );

                  setPage(1);
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
              >
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

              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
              >
                {stockOptions.map(
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

              <select
                value={featuredFilter}
                onChange={(event) =>
                  setFeaturedFilter(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400"
              >
                <option value="all">
                  All Featured
                </option>

                <option value="featured">
                  Featured Only
                </option>

                <option value="not-featured">
                  Not Featured
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCT LIST */}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[390px] animate-pulse rounded-3xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package size={30} />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
              No products found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Is filter ke according koi
              product nahi mila. Naya
              product add kar sakte ho.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
            >
              <Plus size={18} />
              Add First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            <AnimatePresence mode="popLayout">
              {filteredProducts.map(
                (product) => {
                  const image =
                    getProductImage(
                      product
                    );

                  const stockInfo =
                    getStockInfo(
                      product.stock
                    );

                  const displayPrice =
                    getDisplayPrice(
                      product
                    );

                  return (
                    <motion.article
                      layout
                      key={product._id}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                      }}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* IMAGE */}

                      <div className="relative h-56 overflow-hidden bg-slate-100">

                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <ImageIcon size={48} />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${product.isActive
                                ? "border-emerald-200 bg-white/95 text-emerald-700"
                                : "border-red-200 bg-white/95 text-red-700"
                              }`}
                          >
                            {product.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>

                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white/95 px-2.5 py-1 text-[11px] font-black text-amber-700">
                              <Star
                                size={12}
                                fill="currentColor"
                              />
                              FEATURED
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 right-3">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${stockInfo.className}`}
                          >
                            {stockInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        <div className="mb-2 flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h2 className="truncate text-lg font-black text-slate-900">
                              {product.name}
                            </h2>

                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
                              <Tag size={13} />

                              {product.category
                                ?.name ||
                                "No Category"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                            {product.sku ||
                              "NO SKU"}
                          </span>
                        </div>

                        <p className="mb-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                          {product.shortDescription ||
                            product.description ||
                            "No description available."}
                        </p>

                        <div className="mb-4 flex items-end justify-between gap-3">

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Price
                            </p>

                            <div className="mt-1 flex items-center gap-2">

                              <span className="text-xl font-black text-slate-900">
                                {formatPrice(
                                  displayPrice
                                )}
                              </span>

                              {product.salePrice &&
                                Number(
                                  product.salePrice
                                ) <
                                Number(
                                  product.price
                                ) && (
                                  <span className="text-xs font-bold text-slate-400 line-through">
                                    {formatPrice(
                                      product.price
                                    )}
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="text-right">

                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Booking
                            </p>

                            <p className="mt-1 text-sm font-black text-orange-600">
                              {formatPrice(
                                product.bookingPrice
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mb-5 grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              toggleActive(
                                product
                              )
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition ${product.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                          >
                            <Power size={15} />

                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleFeatured(
                                product
                              )
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition ${product.isFeatured
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                          >
                            <Star
                              size={15}
                              fill={
                                product.isFeatured
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                            {product.isFeatured
                              ? "Featured"
                              : "Feature"}
                          </button>
                        </div>

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              askDeleteProduct(
                                product
                              )
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Delete product"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                }
              )}
            </AnimatePresence>
          </div>
        )}

        {/* PAGINATION */}

        {!loading &&
          pagination.totalPages > 1 && (
            <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">

              <p className="text-sm font-semibold text-slate-500">
                Page{" "}
                <span className="font-black text-slate-900">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-black text-slate-900">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        current - 1,
                        1
                      )
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        pagination.totalPages
                      )
                    )
                  }
                  className="inline-flex h-10 items-center gap-1 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}

        {/* ADD / EDIT MODAL */}

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: 15,
                }}
                className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
              >

                {/* MODAL HEADER */}

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {editingProduct
                        ? "Edit Product"
                        : "Add New Product"}
                    </h2>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Product ki complete
                      information enter karo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={handleSaveProduct}
                  className="p-5 sm:p-7"
                >

                  {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                    {/* LEFT / MAIN */}

                    <div className="space-y-5 lg:col-span-2">

                      <div>
                        <label className="mb-2 block text-sm font-black text-slate-700">
                          Product Name *
                        </label>

                        <input
                          name="name"
                          value={form.name}
                          onChange={
                            handleFormChange
                          }
                          placeholder="e.g. Premium Pakistani Patang"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-black text-slate-700">
                          Short Description
                        </label>

                        <input
                          name="shortDescription"
                          value={
                            form.shortDescription
                          }
                          onChange={
                            handleFormChange
                          }
                          placeholder="Short product description..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-black text-slate-700">
                          Full Description *
                        </label>

                        <textarea
                          name="description"
                          value={
                            form.description
                          }
                          onChange={
                            handleFormChange
                          }
                          rows={6}
                          placeholder="Product ki complete description..."
                          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                          <label className="mb-2 block text-sm font-black text-slate-700">
                            Regular Price *
                          </label>

                          <div className="relative">

                            <DollarSign
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              name="price"
                              type="number"
                              min="0"
                              value={form.price}
                              onChange={
                                handleFormChange
                              }
                              placeholder="2500"
                              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-slate-700">
                            Sale Price
                          </label>

                          <div className="relative">

                            <DollarSign
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              name="salePrice"
                              type="number"
                              min="0"
                              value={
                                form.salePrice
                              }
                              onChange={
                                handleFormChange
                              }
                              placeholder="Optional"
                              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-slate-700">
                            Booking Price
                          </label>

                          <div className="relative">

                            <DollarSign
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              name="bookingPrice"
                              type="number"
                              min="0"
                              value={
                                form.bookingPrice
                              }
                              onChange={
                                handleFormChange
                              }
                              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-slate-700">
                            Stock *
                          </label>

                          <input
                            name="stock"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={
                              handleFormChange
                            }
                            placeholder="100"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                          <label className="mb-2 block text-sm font-black text-slate-700">
                            Category *
                          </label>

                          <select
                            name="category"
                            value={
                              form.category
                            }
                            onChange={
                              handleFormChange
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                          >
                            <option value="">
                              Select Category
                            </option>

                            {categories
                              .filter(
                                (
                                  category
                                ) =>
                                  category.isActive
                              )
                              .map(
                                (
                                  category
                                ) => (
                                  <option
                                    key={
                                      category._id
                                    }
                                    value={
                                      category._id
                                    }
                                  >
                                    {
                                      category.name
                                    }
                                  </option>
                                )
                              )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black text-slate-700">
                            SKU
                          </label>

                          <input
                            name="sku"
                            value={form.sku}
                            onChange={
                              handleFormChange
                            }
                            placeholder="ADW-001"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                          />
                        </div>
                      </div>

                      {/* IMAGE UPLOAD */}

                      <div>
                        <label className="mb-2 block text-sm font-black text-slate-700">
                          Product Image
                        </label>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={
                            handleImageSelect
                          }
                          className="hidden"
                        />

                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-orange-300 hover:bg-orange-50/30">

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                            <button
                              type="button"
                              onClick={
                                openImagePicker
                              }
                              disabled={
                                imageUploading
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {imageUploading ? (
                                <RefreshCw
                                  size={18}
                                  className="animate-spin"
                                />
                              ) : (
                                <Upload
                                  size={18}
                                />
                              )}

                              {imageUploading
                                ? "Reading Image..."
                                : "Choose Image"}
                            </button>

                            <div className="flex-1">

                              <p className="text-sm font-bold text-slate-700">
                                Gallery se product
                                image select karo
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                JPG, PNG, WEBP ·
                                Maximum 5MB
                              </p>
                            </div>

                            {form.image && (
                              <button
                                type="button"
                                onClick={
                                  removeSelectedImage
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100"
                              >
                                <X size={16} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* URL OPTION */}

                        <div className="mt-3">

                          <p className="mb-2 text-xs font-bold text-slate-400">
                            Ya image URL use karo
                          </p>

                          <input
                            name="image"
                            value={
                              form.image.startsWith(
                                "data:"
                              )
                                ? ""
                                : form.image
                            }
                            onChange={
                              handleFormChange
                            }
                            placeholder="https://example.com/product.jpg"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="space-y-5">

                      {/* IMAGE PREVIEW */}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-sm font-black text-slate-800">
                            Image Preview
                          </p>

                          {previewImage && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                              READY
                            </span>
                          )}
                        </div>

                        <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">

                          {previewImage ? (
                            <img
                              src={
                                previewImage
                              }
                              alt="Product preview"
                              className="h-full w-full object-cover"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center text-slate-300">
                              <ImageIcon
                                size={42}
                              />

                              <span className="mt-2 text-xs font-bold">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* VISIBILITY */}

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">

                        <p className="mb-4 text-sm font-black text-slate-800">
                          Product Visibility
                        </p>

                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">

                          <div>
                            <p className="text-sm font-black text-slate-800">
                              Active Product
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Customers ko
                              product show
                              hoga.
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            name="isActive"
                            checked={
                              form.isActive
                            }
                            onChange={
                              handleFormChange
                            }
                            className="h-5 w-5 accent-orange-500"
                          />
                        </label>

                        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">

                          <div>
                            <p className="flex items-center gap-1 text-sm font-black text-slate-800">
                              <Star
                                size={15}
                                className="text-amber-500"
                              />

                              Featured
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Featured
                              section mein
                              show hoga.
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            name="isFeatured"
                            checked={
                              form.isFeatured
                            }
                            onChange={
                              handleFormChange
                            }
                            className="h-5 w-5 accent-orange-500"
                          />
                        </label>
                      </div>

                      {/* BOOKING */}

                      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                            <Tag size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-black text-orange-900">
                              Booking System
                            </p>

                            <p className="mt-1 text-xs leading-5 text-orange-700">
                              Booking price
                              customer se
                              initial
                              reservation
                              amount ke liye
                              use hoga.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FORM BUTTONS */}

                  <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        imageUploading
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={17} />

                          {editingProduct
                            ? "Update Product"
                            : "Create Product"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE MODAL */}

        <AnimatePresence>
          {showDeleteModal &&
            productToDelete && (
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
                className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                >

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Trash2 size={25} />
                  </div>

                  <h2 className="mt-5 text-center text-xl font-black text-slate-900">
                    Delete Product?
                  </h2>

                  <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                    Kya aap waqai{" "}
                    <span className="font-black text-slate-800">
                      {productToDelete.name}
                    </span>{" "}
                    ko delete karna
                    chahte ho? Ye action
                    undo nahi hoga.
                  </p>

                  <div className="mt-6 flex gap-3">

                    <button
                      type="button"
                      onClick={cancelDelete}
                      disabled={
                        Boolean(deletingId)
                      }
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        confirmDelete
                      }
                      disabled={
                        Boolean(deletingId)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId ? (
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      {deletingId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default AdminProducts;