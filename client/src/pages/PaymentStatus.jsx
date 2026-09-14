import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  Loader2,
  RefreshCw,
  Smartphone,
  WalletCards,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getPaymentById } from "../services/paymentService";

const formatPrice = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusConfig = (status) => {
  switch (status) {
    case "paid":
      return {
        label: "Payment Successful",
        description:
          "Aapki payment successfully verify ho gayi hai.",
        icon: CheckCircle2,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        iconClass:
          "bg-emerald-100 text-emerald-600",
      };

    case "processing":
      return {
        label: "Payment Processing",
        description:
          "Aapki payment processing mein hai. Thora waqt lag sakta hai.",
        icon: RefreshCw,
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
        iconClass:
          "bg-blue-100 text-blue-600",
      };

    case "failed":
      return {
        label: "Payment Failed",
        description:
          "Payment complete nahi ho saki. Dobara try karein.",
        icon: XCircle,
        className:
          "border-red-200 bg-red-50 text-red-700",
        iconClass:
          "bg-red-100 text-red-600",
      };

    case "cancelled":
      return {
        label: "Payment Cancelled",
        description:
          "Ye payment request cancel kar di gayi hai.",
        icon: XCircle,
        className:
          "border-slate-200 bg-slate-100 text-slate-700",
        iconClass:
          "bg-slate-200 text-slate-600",
      };

    case "refunded":
      return {
        label: "Payment Refunded",
        description:
          "Is payment ka refund process ho chuka hai.",
        icon: WalletCards,
        className:
          "border-purple-200 bg-purple-50 text-purple-700",
        iconClass:
          "bg-purple-100 text-purple-600",
      };

    default:
      return {
        label: "Payment Pending",
        description:
          "Payment request create ho gayi hai lekin abhi payment verify nahi hui.",
        icon: Clock3,
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        iconClass:
          "bg-amber-100 text-amber-600",
      };
  }
};

const getMethodConfig = (method) => {
  if (method === "easypaisa") {
    return {
      label: "Easypaisa",
      icon: WalletCards,
    };
  }

  return {
    label: "JazzCash",
    icon: Smartphone,
  };
};

function PaymentStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPayment = useCallback(
    async (showLoader = true) => {
      if (!id) {
        setError("Payment ID missing hai.");
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await getPaymentById(id);

        const paymentData =
          response?.payment ||
          response?.data?.payment ||
          response?.data ||
          response;

        if (!paymentData) {
          throw new Error("Payment record nahi mila.");
        }

        setPayment(paymentData);
      } catch (err) {
        console.error(
          "Payment status error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Payment details load nahi ho sakin."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadPayment(true);
  }, [loadPayment]);

  useEffect(() => {
    if (
      !payment ||
      !["pending", "processing"].includes(
        payment.status
      )
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadPayment(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [payment, loadPayment]);

  if (loading) {
    return (
      <section className="min-h-[75vh] bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Payment Details Loading...
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please wait.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[75vh] bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
              Payment Details Nahi Milin
            </h1>

            <p className="mt-3 text-slate-500">
              {error}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => loadPayment(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const statusConfig = getStatusConfig(
    payment?.status
  );

  const StatusIcon = statusConfig.icon;

  const methodConfig = getMethodConfig(
    payment?.method
  );

  const MethodIcon = methodConfig.icon;

  const isPending = [
    "pending",
    "processing",
  ].includes(payment?.status);

  return (
    <section className="min-h-[75vh] bg-[#f8fbff] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-6 text-center md:p-10">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${statusConfig.iconClass}`}
            >
              <StatusIcon
                className={`h-10 w-10 ${
                  payment?.status ===
                  "processing"
                    ? "animate-spin"
                    : ""
                }`}
              />
            </div>

            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              {statusConfig.label}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
              {statusConfig.description}
            </p>

            {isPending && (
              <div className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                <Clock3 className="h-4 w-4 shrink-0" />
                Payment status automatically check ho raha hai.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 p-5 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment Amount
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {formatPrice(
                        payment?.amount
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <MethodIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment Method
                    </p>

                    <p className="mt-1 text-lg font-black capitalize text-slate-900">
                      {methodConfig.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="border-b border-slate-100 p-5 md:border-r">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment ID
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-bold text-slate-800">
                    {payment?._id || id}
                  </p>
                </div>

                <div className="border-b border-slate-100 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Transaction ID
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-bold text-slate-800">
                    {payment?.transactionId ||
                      "Not generated yet"}
                  </p>
                </div>

                <div className="border-b border-slate-100 p-5 md:border-b-0 md:border-r">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Created
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {formatDate(
                      payment?.createdAt
                    )}
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Paid At
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {payment?.paidAt
                      ? formatDate(
                          payment.paidAt
                        )
                      : "Not paid yet"}
                  </p>
                </div>
              </div>
            </div>

            {payment?.booking && (
              <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Related Booking
                </p>

                <p className="mt-2 break-all font-mono text-sm font-black text-slate-800">
                  {typeof payment.booking ===
                  "object"
                    ? payment.booking._id
                    : payment.booking}
                </p>
              </div>
            )}

            {payment?.failureReason && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Failure Reason
                </p>

                <p className="mt-2 text-sm font-semibold text-red-700">
                  {payment.failureReason}
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {isPending && (
                <button
                  type="button"
                  disabled={refreshing}
                  onClick={() =>
                    loadPayment(false)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Refresh Status
                </button>
              )}

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PaymentStatus;