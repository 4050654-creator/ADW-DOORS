import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts({
          featured: true,
          limit: 8,
        });

        setProducts(data.products || []);
      } catch (error) {
        console.error("Products loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="overflow-hidden">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="basant-hero relative min-h-[760px]">

        {/* SUN */}
        <div className="absolute right-[13%] top-[9%] h-36 w-36 rounded-full bg-yellow-200 shadow-[0_0_100px_rgba(254,240,138,.85)]" />

        {/* CLOUDS */}
        <div className="basant-cloud left-[5%] top-[20%] opacity-60" />

        <div className="basant-cloud right-[30%] top-[27%] scale-75 opacity-40" />

        <div className="basant-cloud bottom-[25%] left-[25%] scale-50 opacity-30" />

        {/* DISTANT KITES */}

        <div className="kite-shape kite-purple kite-motion-2 right-[7%] top-[12%] scale-50 opacity-60" />

        <div className="kite-shape kite-yellow kite-motion-1 left-[8%] top-[17%] scale-75 opacity-90" />

        <div className="kite-shape kite-green kite-motion-3 right-[29%] top-[8%] scale-35 opacity-60" />

        <div className="kite-shape kite-blue kite-motion-2 left-[30%] bottom-[25%] scale-35 opacity-50" />

        <div className="kite-shape kite-pink kite-motion-3 right-[5%] bottom-[27%] scale-45 opacity-70" />

        {/* CONTENT */}

        <div className="relative z-20 mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1fr_.9fr]">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="max-w-2xl"
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-5 py-2.5 text-sm font-black text-white shadow-xl backdrop-blur-md">
              <Sparkles size={16} />
              THE BASANT COLLECTION
            </div>

            <h1 className="mt-7 text-6xl font-black leading-[.98] tracking-tight text-white drop-shadow-xl sm:text-7xl lg:text-[92px]">
              Feel
              <span className="block text-yellow-200">
                The Sky.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-white/90 md:text-xl">
              Premium Basant products, simple online booking and a shopping
              experience made for the season you love.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">

              <Link
                to="/shop"
                className="group flex items-center gap-3 rounded-2xl bg-white px-7 py-4 font-black text-orange-600 shadow-2xl transition hover:-translate-y-1 hover:bg-yellow-50"
              >
                Explore Collection

                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/shop"
                className="rounded-2xl border border-white/50 bg-white/15 px-7 py-4 font-black text-white backdrop-blur-md transition hover:bg-white/25"
              >
                Shop Now
              </Link>

            </div>

            {/* STATS */}

            <div className="mt-11 flex flex-wrap gap-7 text-white">

              <div>
                <p className="text-2xl font-black">
                  Premium
                </p>

                <p className="text-xs font-semibold text-white/70">
                  Collection
                </p>
              </div>

              <div className="h-10 w-px bg-white/30" />

              <div>
                <p className="text-2xl font-black">
                  Easy
                </p>

                <p className="text-xs font-semibold text-white/70">
                  Booking
                </p>
              </div>

              <div className="h-10 w-px bg-white/30" />

              <div>
                <p className="text-2xl font-black">
                  Secure
                </p>

                <p className="text-xs font-semibold text-white/70">
                  Ordering
                </p>
              </div>

            </div>

          </motion.div>

          {/* BIG KITE */}

          <motion.div
            initial={{
              opacity: 0,
              scale: .75,
              rotate: -8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 1,
            }}
            className="relative hidden h-[500px] items-center justify-center lg:flex"
          >

            <div className="absolute h-[430px] w-[430px] rounded-full bg-white/15 blur-3xl" />

            <div className="relative">

              <div className="hero-kite" />

              {/* KITE CENTER */}

              <div className="absolute left-1/2 top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 shadow-xl" />

              {/* TAIL */}

              <div className="absolute -bottom-[230px] left-1/2 flex -translate-x-1/2 rotate-[-45deg] flex-col items-center gap-5">

                <span className="text-4xl">🎀</span>

                <span className="ml-8 text-4xl">🎀</span>

                <span className="mr-8 text-4xl">🎀</span>

                <span className="ml-12 text-4xl">🎀</span>

              </div>

            </div>

          </motion.div>

        </div>

        {/* ROOFTOPS */}

        <div className="rooftops" />

        {/* BOTTOM FADE */}

        <div className="absolute bottom-0 left-0 z-10 h-32 w-full bg-gradient-to-t from-[#f8fbff] to-transparent" />

      </section>


      {/* =========================================
          FEATURES
      ========================================= */}

      <section className="relative bg-[#f8fbff] px-4 py-12">

        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">

          <Feature
            icon={<ShieldCheck />}
            title="Premium Quality"
            text="Products managed carefully for a better Basant experience."
          />

          <Feature
            icon={<Truck />}
            title="Easy Ordering"
            text="Simple booking and ordering without unnecessary complications."
          />

          <Feature
            icon={<Headphones />}
            title="Customer Support"
            text="Get help whenever you need assistance with your order."
          />

        </div>

      </section>


      {/* =========================================
          COLLECTION
      ========================================= */}

      <section className="mx-auto max-w-7xl px-4 py-20">

        <div className="mb-10 flex items-end justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />

              <p className="text-xs font-black uppercase tracking-[.28em] text-orange-500">
                Made For Basant
              </p>

            </div>

            <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Featured Collection
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              Pick your favourites and get ready for the sky.
            </p>

          </div>

          <Link
            to="/shop"
            className="hidden items-center gap-2 font-black text-orange-500 sm:flex"
          >
            View All
            <ArrowRight size={18} />
          </Link>

        </div>

        {loading ? (

          <div className="rounded-3xl bg-white p-20 text-center shadow-sm">
            Loading collection...
          </div>

        ) : products.length === 0 ? (

          <div className="rounded-3xl bg-white p-14 text-center shadow-sm">

            <div className="text-7xl">
              🪁
            </div>

            <h3 className="mt-5 text-2xl font-black">
              Collection Coming Soon
            </h3>

          </div>

        ) : (

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}

          </div>

        )}

      </section>


      {/* =========================================
          FINAL CTA
      ========================================= */}

      <section className="px-4 pb-20">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[38px] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-7 py-16 shadow-2xl md:px-14">

          <div className="kite-shape kite-yellow kite-motion-1 right-[9%] top-[15%] scale-50 opacity-30" />

          <div className="kite-shape kite-blue kite-motion-2 left-[12%] bottom-[0%] scale-40 opacity-30" />

          <div className="relative z-10 max-w-2xl">

            <p className="font-black uppercase tracking-[.3em] text-white/70">
              Ready To Fly?
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
              Your Basant.
              <span className="block text-yellow-200">
                Your Sky.
              </span>
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-white/80">
              Explore the collection and get ready for an unforgettable
              Basant experience.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 font-black text-orange-600 shadow-xl transition hover:-translate-y-1"
            >
              Start Shopping
              <ArrowRight size={20} />
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}


function Feature({ icon, title, text }) {
  return (
    <div className="basant-glass flex gap-4 rounded-3xl p-6 shadow-lg shadow-slate-200/40">

      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg">
        {icon}
      </div>

      <div>

        <h3 className="font-black text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}

export default Home;