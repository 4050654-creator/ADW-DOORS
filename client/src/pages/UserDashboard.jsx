import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Package, LogOut, ArrowLeft, ShoppingBag } from "lucide-react";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user", err);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <section className="min-h-screen bg-[#f8fbff] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-500"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="rounded-[36px] border border-white bg-white p-8 shadow-xl md:p-10">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-orange-500 to-pink-500 text-3xl font-black text-white shadow-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="mt-4 md:mt-0">
              <h1 className="text-2xl font-black text-slate-900">
                Welcome, {user.name} 👋
              </h1>
              <p className="text-sm text-slate-500">{user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                Customer Account
              </span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-500 p-3 text-white">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">My Orders</h3>
                  <p className="text-xs text-slate-500">Track your past kite and gear orders</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-bold text-slate-400">No orders placed yet.</p>
                <Link
                  to="/shop"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black text-orange-500 hover:underline"
                >
                  <ShoppingBag size={14} /> Start Shopping
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-purple-600 p-3 text-white">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Account Details</h3>
                  <p className="text-xs text-slate-500">Manage your profile info</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <p className="font-bold text-slate-700">Name: <span className="font-normal text-slate-500">{user.name}</span></p>
                <p className="font-bold text-slate-700">Email: <span className="font-normal text-slate-500">{user.email}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserDashboard;