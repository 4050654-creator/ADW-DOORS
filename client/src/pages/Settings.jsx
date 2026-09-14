import {
  Moon,
  Sun,
  Monitor,
  ShieldCheck,
  Mail,
  UserRound,
  ChevronRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <section className="min-h-[80vh] bg-[#f8fbff] px-4 py-10 transition-colors duration-300 sm:py-14">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">
            Account Center
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900 sm:text-5xl">
            Account Settings
          </h1>

          <p className="mt-3 text-slate-500">
            Manage your account preferences and website appearance.
          </p>
        </div>

        <div className="grid gap-6">

          {/* ACCOUNT */}
          <div className="rounded-[28px] bg-white p-6 shadow-lg sm:p-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <UserRound size={26} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Account
                </h2>

                <p className="text-sm text-slate-500">
                  Your basic account information
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Name
                </p>

                <p className="mt-2 font-black text-slate-800">
                  {user?.name || "User"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Email
                </p>

                <p className="mt-2 break-all font-black text-slate-800">
                  {user?.email || "—"}
                </p>
              </div>

            </div>

            <Link
              to="/account"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
            >
              Edit Account
              <ChevronRight size={17} />
            </Link>
          </div>

          {/* APPEARANCE */}
          <div className="rounded-[28px] bg-white p-6 shadow-lg sm:p-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                {theme === "dark" ? (
                  <Moon size={26} />
                ) : (
                  <Sun size={26} />
                )}
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Appearance
                </h2>

                <p className="text-sm text-slate-500">
                  Choose how ADW-STORE looks for you
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* LIGHT MODE */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  theme === "light"
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-100 bg-slate-50 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                      <Sun size={22} />
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        Light Mode
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Bright & clean
                      </p>
                    </div>

                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      theme === "light"
                        ? "border-orange-500 bg-orange-500"
                        : "border-slate-300"
                    }`}
                  />
                </div>
              </button>

              {/* DARK MODE */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  theme === "dark"
                    ? "border-orange-500 bg-slate-900"
                    : "border-slate-100 bg-slate-50 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-orange-400">
                      <Moon size={22} />
                    </div>

                    <div>

                      <p
                        className={`font-black ${
                          theme === "dark"
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        Dark Mode
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Easy on the eyes
                      </p>

                    </div>

                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      theme === "dark"
                        ? "border-orange-500 bg-orange-500"
                        : "border-slate-300"
                    }`}
                  />

                </div>
              </button>

            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-blue-700">
              <Monitor size={19} className="mt-0.5 shrink-0" />

              <p className="text-sm font-semibold">
                Theme setting sirf website ki appearance change karti hai.
                Shopping, orders, account aur website functionality par
                iska koi effect nahi hoga.
              </p>
            </div>
          </div>

          {/* SECURITY */}
          <div className="rounded-[28px] bg-white p-6 shadow-lg sm:p-8">

            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <ShieldCheck size={26} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Account Security
                </h2>

                <p className="text-sm text-slate-500">
                  Your account protection information
                </p>
              </div>

            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-500 shadow-sm">
                <Mail size={20} />
              </div>

              <div>
                <p className="font-black text-slate-800">
                  Email Account
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email || "Your email is protected"}
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Settings;