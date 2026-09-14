import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Account() {
  const { user, token } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.user) {
        const currentUser = response.data.user;

        setProfile({
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        });
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Profile load nahi ho saka.");
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!profile.name.trim()) {
      setError("Name required hai.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/users/profile",
        {
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.user) {
        setProfile({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
        });
      }

      setEditMode(false);
      setMessage("Profile successfully update ho gaya.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err?.response?.data?.message ||
        "Profile update nahi ho saka."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <section className="min-h-[70vh] bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-10 text-center shadow-xl">
          <UserRound
            size={50}
            className="mx-auto text-orange-500"
          />

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            My Account
          </h1>

          <p className="mt-3 text-slate-500">
            Please login to view your account.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] bg-[#f8fbff] px-4 py-10 sm:py-14">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[.2em] text-orange-500">
            Account Center
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900 sm:text-5xl">
            My Account
          </h1>

          <p className="mt-3 text-slate-500">
            Manage your ADW-STORE profile and account information.
          </p>
        </div>

        {/* PROFILE HERO */}
        <div className="overflow-hidden rounded-[32px] bg-white shadow-xl">

          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 py-10 sm:px-10">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/10" />

            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">

              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-4xl font-black text-white shadow-xl backdrop-blur">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div className="text-white">

                <h2 className="text-3xl font-black">
                  {profile.name || "User"}
                </h2>

                <p className="mt-1 text-white/80">
                  {profile.email}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">
                  <ShieldCheck size={15} />
                  {user.role === "admin"
                    ? "Administrator"
                    : "Verified Customer"}
                </div>

              </div>

            </div>
          </div>

          {/* PROFILE BODY */}
          <div className="p-6 sm:p-10">

            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Profile Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your personal account information.
                </p>
              </div>

              {!editMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(true);
                    setMessage("");
                    setError("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  <Edit3 size={17} />
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setMessage("");
                    setError("");

                    setProfile({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                >
                  <X size={17} />
                  Cancel
                </button>
              )}

            </div>

            {/* SUCCESS */}
            {message && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
                {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>

              <div className="grid gap-6 md:grid-cols-2">

                {/* NAME */}
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`w-full rounded-2xl border px-12 py-4 font-semibold outline-none transition ${editMode
                          ? "border-orange-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          : "border-slate-100 bg-slate-50 text-slate-600"
                        }`}
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 font-semibold text-slate-500 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Email address cannot be changed here.
                  </p>
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`w-full rounded-2xl border px-12 py-4 font-semibold outline-none transition ${editMode
                          ? "border-orange-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          : "border-slate-100 bg-slate-50 text-slate-600"
                        }`}
                      placeholder="03XX XXXXXXX"
                    />
                  </div>
                </div>

                {/* ROLE */}
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Account Type
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
                    <ShieldCheck
                      size={20}
                      className="text-green-500"
                    />

                    <span className="font-bold text-slate-700">
                      {user.role === "admin"
                        ? "Administrator"
                        : "Customer Account"}
                    </span>
                  </div>
                </div>

              </div>

              {/* SAVE */}
              {editMode && (
                <div className="mt-8 flex justify-end">

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-7 py-3.5 font-black text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>
              )}

            </form>
          </div>
        </div>

        {/* ACCOUNT DETAILS */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-[28px] bg-white p-7 shadow-lg">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <CalendarDays size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Account Created
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {user.createdAt
                    ? new Date(
                      user.createdAt
                    ).toLocaleDateString()
                    : "Available soon"}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-lg">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-500">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Account Status
                </p>

                <p className="mt-1 font-black text-green-600">
                  Active
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Account;

