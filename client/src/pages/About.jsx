import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Sparkles,
  Users,
  ShoppingBag,
  Target,
  HeartHandshake,
} from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Quality Products",
    text: "We focus on providing quality products with clear details and a smooth shopping experience.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Service",
    text: "Our goal is to make every booking and order simple, transparent and reliable.",
  },
  {
    icon: Users,
    title: "Customer First",
    text: "Customers are at the heart of ADW-STORE. We work to provide quick and helpful support.",
  },
  {
    icon: Sparkles,
    title: "Simple Experience",
    text: "From browsing products to booking and order tracking, everything is designed to stay easy to use.",
  },
];

function About() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-orange-400">
              <Sparkles size={16} />
              Welcome to ADW-STORE
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              About{" "}
              <span className="text-orange-500">
                ADW-STORE
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              ADW-STORE is built to provide a modern, simple and
              reliable online shopping and booking experience.
              Our aim is to make it easy for customers to discover
              products, place bookings, manage orders and stay
              connected with our store.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Who We Are
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              A store built with customers in mind.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              ADW-STORE is a growing online store focused on
              providing customers with a smooth and convenient
              digital shopping experience.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              We believe an online store should be more than just
              a place to buy products. It should be easy to
              understand, simple to navigate and trustworthy from
              the first visit to the final order.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              That is why we are continuously improving ADW-STORE
              with better products, better service and better
              technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Target size={28} />
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-900">
              Our Mission
            </h3>

            <p className="mt-4 leading-8 text-slate-600">
              Our mission is to create a dependable online
              shopping platform where customers can easily find
              products, make bookings, place orders and receive
              helpful support whenever they need it.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <HeartHandshake className="text-orange-500" size={24} />

              <p className="text-sm font-semibold text-slate-700">
                Your trust and satisfaction are our priority.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Why ADW-STORE
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              What makes our store different?
            </h2>

            <p className="mt-4 leading-7 text-slate-500">
              We are working to build a store that is simple,
              useful and reliable for every customer.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center sm:px-12"
        >
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Thank you for choosing ADW-STORE.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            We appreciate your trust and look forward to serving
            you with better products and better service.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

export default About;