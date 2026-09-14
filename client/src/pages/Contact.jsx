import React, { useState } from "react";

import { motion } from "framer-motion";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock3,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { sendContactMessage } from "../services/contactService";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // ===============================
  // HANDLE INPUT
  // ===============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (submitted) {
      setSubmitted(false);
    }
  };

  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  // ===============================
  // SUBMIT FORM
  // ===============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      const response = await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to send your message."
        );
      }

      setSubmitted(true);

      resetForm();
    } catch (err) {
      console.error(
        "CONTACT FORM ERROR:",
        err
      );

      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";

      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ===============================
          HERO
      =============================== */}

      <section className="relative overflow-hidden bg-slate-950">

        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >

            <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-orange-400">

              <MessageCircle size={16} />

              We are here to help

            </div>

            <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">

              Contact{" "}

              <span className="text-orange-500">
                Us
              </span>

            </h1>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-300">

              Have a question about a product,
              booking or order?

              Send us a message and our team
              will get back to you.

            </p>

          </motion.div>

        </div>

      </section>

      {/* ===============================
          CONTACT CONTENT
      =============================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-5">

          {/* ===============================
              CONTACT INFORMATION
          =============================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="lg:col-span-2"
          >

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Get In Touch
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900">
              We'd love to hear from you.
            </h2>

            <p className="mt-4 leading-7 text-slate-600">

              Whether you need help with an
              order, want to ask about a product
              or have a general question, feel
              free to contact us.

            </p>

            <div className="mt-8 space-y-4">

              {/* PHONE */}

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

                  <Phone size={21} />

                </div>

                <div>

                  <p className="text-sm font-bold text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    +92 322 4050653
                  </p>

                </div>

              </div>

              {/* EMAIL */}

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

                  <Mail size={21} />

                </div>

                <div>

                  <p className="text-sm font-bold text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    4050654@gmail.com
                  </p>

                </div>

              </div>

              {/* LOCATION */}

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

                  <MapPin size={21} />

                </div>

                <div>

                  <p className="text-sm font-bold text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    Lahore, Pakistan
                  </p>

                </div>

              </div>

              {/* SUPPORT HOURS */}

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

                  <Clock3 size={21} />

                </div>

                <div>

                  <p className="text-sm font-bold text-slate-500">
                    Support Hours
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    Monday - Saturday
                  </p>

                  <p className="text-sm text-slate-500">
                    11:00 AM - 10:00 PM
                  </p>

                </div>

              </div>

            </div>

          </motion.div>

          {/* ===============================
              CONTACT FORM
          =============================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="lg:col-span-3"
          >

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">

              <div className="mb-7">

                <h3 className="text-2xl font-black text-slate-900">
                  Send us a message
                </h3>

                <p className="mt-2 text-sm text-slate-500">

                  Fill out the form below and
                  we'll get back to you as soon
                  as possible.

                </p>

              </div>

              {/* ===============================
                  SUCCESS MESSAGE
              =============================== */}

              {submitted && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
                >

                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-green-600"
                    size={20}
                  />

                  <div>

                    <p className="font-bold text-green-800">
                      Message sent successfully!
                    </p>

                    <p className="mt-1 text-sm text-green-700">

                      Thank you for contacting
                      ADW-STORE. We'll get back
                      to you soon.

                    </p>

                  </div>

                </motion.div>

              )}

              {/* ===============================
                  ERROR MESSAGE
              =============================== */}

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
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
                >

                  <AlertCircle
                    className="mt-0.5 shrink-0 text-red-600"
                    size={20}
                  />

                  <div>

                    <p className="font-bold text-red-800">
                      Message could not be sent
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>

                  </div>

                </motion.div>

              )}

              {/* ===============================
                  FORM
              =============================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME + EMAIL */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Your Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      disabled={submitting}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      disabled={submitting}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+92 3XX XXXXXXX"
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                {/* MESSAGE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={6}
                    required
                    disabled={submitting}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                {/* SUBMIT BUTTON */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />

                      Send Message
                    </>
                  )}

                </button>

              </form>

            </div>

          </motion.div>

        </div>

      </section>

    </main>
  );
}

export default Contact;

