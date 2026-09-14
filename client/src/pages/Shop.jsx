import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { getProducts } from "../services/api";

function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data = await getProducts();

        const list = Array.isArray(data)
          ? data
          : data.products ||
            data.data ||
            [];

        setProducts(list);
      } catch (err) {
        console.error(err);
        setError("Products load nahi ho sake.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const name =
      product.name ||
      product.title ||
      "";

    return name
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // ==============================
  // PRODUCT IMAGE RESOLVER
  // ==============================

  const getProductImage = (product) => {
    const candidates = [
      // New product structure
      product?.images?.[0]?.url,

      // If images array contains direct strings
      typeof product?.images?.[0] === "string"
        ? product.images[0]
        : "",

      // Old/single image structure
      product?.image?.url,

      typeof product?.image === "string"
        ? product.image
        : "",

      // Other possible image field
      product?.imageUrl,
    ];

    const image = candidates.find(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0
    );

    return (
      image?.trim() ||
      "https://via.placeholder.com/600x600?text=ADW-STORE"
    );
  };

  return (
    <section className="min-h-screen bg-[#f8fbff] px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ==============================
            HEADER
        ============================== */}

        <div className="mb-10">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-500">
            ADW-STORE
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">
                Shop
              </h1>

              <p className="mt-3 text-slate-500">
                Apni favourite Basant products explore karein.
              </p>

            </div>

            {/* Search */}

            <div className="relative w-full md:w-80">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />

            </div>

          </div>

        </div>

        {/* ==============================
            LOADING
        ============================== */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 font-bold text-slate-600">

              <Loader2
                className="animate-spin"
                size={22}
              />

              Loading products...

            </div>

          </div>
        )}

        {/* ==============================
            ERROR
        ============================== */}

        {error && (
          <div className="rounded-2xl bg-red-50 p-5 text-center font-bold text-red-600">

            {error}

          </div>
        )}

        {/* ==============================
            NO PRODUCTS
        ============================== */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div className="rounded-[30px] bg-white p-16 text-center shadow-sm">

              <div className="text-6xl">
                🪁
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-900">
                No Products Found
              </h2>

              <p className="mt-2 text-slate-500">
                Abhi products available nahi hain.
              </p>

            </div>
          )}

        {/* ==============================
            PRODUCTS
        ============================== */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product) => {

                const id =
                  product._id ||
                  product.id;

                const name =
                  product.name ||
                  product.title ||
                  "Product";

                const price =
                  product.price || 0;

                // FIXED IMAGE
                const image =
                  getProductImage(product);

                return (

                  <Link
                    key={id}
                    to={`/product/${id}`}
                    className="group overflow-hidden rounded-[28px] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >

                    {/* ==============================
                        IMAGE
                    ============================== */}

                    <div className="relative aspect-square overflow-hidden bg-slate-100">

                      <img
                        src={image}
                        alt={name}
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://via.placeholder.com/600x600?text=ADW-STORE";
                        }}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* Cart icon */}

                      <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur">

                        <ShoppingCart
                          size={19}
                          className="text-slate-700"
                        />

                      </div>

                    </div>

                    {/* ==============================
                        PRODUCT INFO
                    ============================== */}

                    <div className="p-5">

                      <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                        ADW-STORE
                      </p>

                      <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-900">
                        {name}
                      </h2>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-xl font-black text-slate-900">
                          Rs.{" "}
                          {Number(price).toLocaleString()}
                        </span>

                        <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white transition group-hover:bg-orange-500">
                          View
                        </span>

                      </div>

                    </div>

                  </Link>

                );
              })}

            </div>

          )}

      </div>

    </section>
  );
}

export default Shop;

