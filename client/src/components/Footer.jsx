import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      {/* Decorative Kites */}
      <div className="pointer-events-none absolute right-[8%] top-10 h-16 w-16 rotate-45 rounded-xl bg-orange-500/10" />

      <div className="pointer-events-none absolute bottom-20 left-[6%] h-12 w-12 rotate-45 rounded-lg bg-purple-500/10" />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 rotate-45 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-lg">
                <span className="-rotate-45 text-xl">
                  🪁
                </span>
              </div>

              <div className="leading-none">
                <div className="text-xl font-black">
                  <span className="text-orange-500">
                    BASANT
                  </span>
                  <span className="text-white">
                    -STORE
                  </span>
                </div>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Feel The Sky
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm leading-7 text-slate-400">
              Premium Basant products made for the people who
              love the sky, colours and the Basant spirit. 🪁
            </p>

            {/* Social Buttons */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black transition hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-500"
              >
                f
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black transition hover:-translate-y-1 hover:border-pink-500 hover:bg-pink-500"
              >
                ig
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black transition hover:-translate-y-1 hover:border-red-500 hover:bg-red-500"
              >
                ▶
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-black">
              Explore
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link
                to="/"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                Home
              </Link>

              <Link
                to="/shop"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                Shop
              </Link>

              <Link
                to="/about"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-black">
              Support
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link
                to="/faq"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                FAQ
              </Link>

              <Link
                to="/terms"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/privacy"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                Privacy Policy
              </Link>

              <Link
                to="/cart"
                className="text-slate-400 transition hover:translate-x-1 hover:text-orange-400"
              >
                Shopping Cart
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-black">
              Get In Touch
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-orange-400">
                  <MapPin size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Location
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Lahore, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-orange-400">
                  <Phone size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Contact us for support
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-orange-400">
                  <Mail size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-400">
                    support@ADW STORE.com
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/contact"
              className="mt-7 inline-flex items-center gap-2 font-black text-orange-400 transition hover:text-orange-300"
            >
              Contact Support
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t border-white/10 pt-7">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
            <p>
              © {new Date().getFullYear()} ADW STORE. All
              rights reserved.
            </p>

            <p className="font-medium">
            WEBSITE Founder AHMAD YASIR BHATTI 🪁
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;