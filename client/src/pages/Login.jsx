import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/account";

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Email aur password required hain.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(email, password);

      const loggedUser =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        null;

      console.log("LOGIN SUCCESS:", response);
      console.log("LOGGED USER:", loggedUser);

      if (loggedUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err?.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            `Login failed (${err.response.status})`
        );
      } else if (err?.request) {
        setError(
          "Server se connection nahi ho raha. Backend check karo."
        );
      } else {
        setError(
          err?.message ||
            "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f8fbff] px-4 py-12 sm:py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-2">

        {/* LEFT */}
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
                  Welcome Back
                </p>

                <h2 className="mt-4 text-5xl font-black leading-tight">
                  Your Basant
                  <br />
                  Collection
                  <br />
                  Awaits.
                </h2>

                <p className="mt-6 max-w-md leading-7 text-white/50">
                  Login karke apne orders, bookings aur
                  account ko easily manage karein.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-white/50">
              <ShieldCheck
                size={18}
                className="text-emerald-400"
              />
              Secure account access
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-6 sm:p-10 lg:p-14">
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

            <div className="mt-10">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">
                Account
              </p>

              <h2 className="mt-2 text-4xl font-black text-slate-900">
                Login
              </h2>

              <p className="mt-3 text-slate-500">
                Welcome back to ADW-STORE.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* EMAIL */}
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* PASSWORD */}
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-12 outline-none transition focus:border-orange-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
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

              {/* LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-5 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-black text-orange-500 hover:text-orange-600"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;