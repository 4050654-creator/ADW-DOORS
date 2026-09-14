import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();

  const { register, login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password kam az kam 6 characters ka hona chahiye."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords match nahi kar rahe.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      await login(
        form.email,
        form.password
      );

      navigate("/");
    } catch (err) {
      console.error("Register error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f8fbff] px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-2">

        <div className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:block">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 rotate-45 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-xl">
                  <span className="-rotate-45 text-2xl">
                    🪁
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl font-black">
                    <span className="text-orange-400">
                      ADW
                    </span>
                    -STORE
                  </h1>

                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                    Feel The Sky
                  </p>
                </div>
              </div>

              <div className="mt-24">
                <p className="font-black uppercase tracking-[0.25em] text-orange-400">
                  Join ADW-STORE
                </p>

                <h2 className="mt-4 text-5xl font-black leading-tight">
                  Create Your
                  <br />
                  Account.
                </h2>

                <p className="mt-6 max-w-md leading-7 text-white/50">
                  Apna account banayein aur orders,
                  bookings aur future purchases ko easily
                  manage karein.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-white/50">
              <ShieldCheck size={18} className="text-emerald-400" />
              Your account stays protected
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 rotate-45 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600">
                  <span className="-rotate-45 text-xl">
                    🪁
                  </span>
                </div>

                <h1 className="text-xl font-black">
                  <span className="text-orange-500">
                    ADW
                  </span>
                  -STORE
                </h1>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">
                New Account
              </p>

              <h2 className="mt-2 text-4xl font-black text-slate-900">
                Register
              </h2>

              <p className="mt-3 text-slate-500">
                Create your ADW-STORE account.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoComplete="name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Phone
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="03XXXXXXXXX"
                    autoComplete="tel"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 outline-none transition focus:border-orange-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 outline-none transition focus:border-orange-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-black text-orange-500 hover:text-orange-600"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;