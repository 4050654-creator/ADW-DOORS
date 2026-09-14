import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  UserRound,
  Search,
  Menu,
  X,
  LogOut,
  UserCircle,
  Settings,
  Package,
} from "lucide-react";

import { useState } from "react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  const { cartCount } = useCart();

  const {
    user,
    logout,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  const handleLogout = () => {
    logout();

    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const navClass = ({ isActive }) =>
    `font-bold transition ${isActive
      ? "text-orange-500"
      : "text-slate-700 hover:text-orange-500"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/85 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* LOGO */}
        <Link
          to="/"
          onClick={() => {
            setMenuOpen(false);
            setProfileOpen(false);
          }}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 rotate-45 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-lg">
            <span className="-rotate-45 text-xl">
              🪁
            </span>
          </div>

          <div className="leading-none">
            <div className="text-xl font-black">
              <span className="text-orange-500">
                ADW
              </span>

              <span className="text-slate-900">
                -DOORS
              </span>
            </div>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[.3em] text-slate-400">
              Feel The Sky
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-9 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>

          <NavLink to="/about" className={navClass}>
            About
          </NavLink>

          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* SEARCH */}
          <button
            type="button"
            className="rounded-full p-2.5 transition hover:bg-orange-50 hover:text-orange-500"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* USER */}
          {isAuthenticated ? (
            <div className="relative">

              {/* PROFILE BUTTON */}
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="hidden items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 transition hover:bg-orange-50 sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-xs font-black text-white">
                  {user?.name
                    ? user.name
                      .charAt(0)
                      .toUpperCase()
                    : "U"}
                </div>

                <span className="max-w-[90px] truncate text-xs font-bold text-slate-800">
                  {user?.name || "User"}
                </span>
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">

                  {/* PROFILE HEADER */}
                  <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-5 text-white">
                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <UserCircle size={28} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black">
                          {user?.name || "User"}
                        </p>

                        <p className="truncate text-xs text-white/80">
                          {user?.email || ""}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* MENU */}
                  <div className="p-2">

                    {/* MY ACCOUNT */}
                    <Link
                      to="/account"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-500"
                    >
                      <UserRound size={18} />
                      My Account
                    </Link>

                    {/* MY ORDERS */}
                    <Link
                      to="/orders"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-500"
                    >
                      <Package size={18} />
                      My Orders
                    </Link>

                    {/* SETTINGS */}
                    <Link
                      to="/settings"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-500"
                    >
                      <Settings size={18} />
                      Settings
                    </Link>

                    {/* ADMIN */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-purple-600 transition hover:bg-purple-50"
                      >
                        <UserCircle size={18} />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="my-2 border-t border-slate-100" />

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>

                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full p-2.5 transition hover:bg-orange-50 hover:text-orange-500 sm:block"
              aria-label="Account"
            >
              <UserRound size={20} />
            </Link>
          )}

          {/* CART */}
          <Link
            to="/cart"
            className="relative rounded-full p-2.5 transition hover:bg-orange-50 hover:text-orange-500"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />

            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white shadow-md">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
            className="rounded-full p-2.5 hover:bg-orange-50 md:hidden"
            aria-label="Open menu"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="font-bold"
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className="font-bold"
            >
              Shop
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="font-bold"
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="font-bold"
            >
              Contact
            </Link>

            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="font-bold text-orange-500"
            >
              Cart ({cartCount})
            </Link>

            <div className="border-t border-slate-100 pt-4">

              {isAuthenticated ? (
                <div className="space-y-3">

                  {/* USER INFO */}
                  <Link
                    to="/account"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 font-black text-white">
                      {user?.name
                        ? user.name
                          .charAt(0)
                          .toUpperCase()
                        : "U"}
                    </div>

                    <div>
                      <p className="font-black text-slate-900">
                        {user?.name || "User"}
                      </p>

                      <p className="text-xs text-slate-400">
                        My Account
                      </p>
                    </div>
                  </Link>

                  {/* MY ACCOUNT */}
                  <Link
                    to="/account"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold"
                  >
                    <UserRound size={18} />
                    My Account
                  </Link>

                  {/* MY ORDERS */}
                  <Link
                    to="/orders"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold"
                  >
                    <Package size={18} />
                    My Orders
                  </Link>

                  {/* SETTINGS */}
                  <Link
                    to="/settings"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold"
                  >
                    <Settings size={18} />
                    Settings
                  </Link>

                  {/* ADMIN */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3 font-bold text-purple-600"
                    >
                      <UserCircle size={18} />
                      Admin Dashboard
                    </Link>
                  )}

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-500"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>

                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="flex items-center gap-3 font-bold text-orange-500"
                >
                  <UserRound size={20} />
                  Login / Account
                </Link>
              )}

            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

