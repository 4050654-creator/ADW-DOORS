import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

// Main pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Settings from "./pages/Settings";
import OrderSuccess from "./pages/OrderSuccess";

// Information pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Payment pages
import PaymentStatus from "./pages/PaymentStatus";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";

// Shop pages
import TrackOrder from "./pages/shop/TrackOrder";
import Booking from "./pages/shop/Booking";

function NotFound() {
  return (
    <section className="min-h-[70vh] bg-[#f8fbff] px-4 py-16">
      <div className="mx-auto max-w-7xl text-center">
        <div className="text-7xl font-black text-orange-500">
          404
        </div>

        <h1 className="mt-4 text-3xl font-black text-slate-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-slate-500">
          The page you are looking for does not exist.
        </p>
      </div>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>

          {/* Main */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          {/* Booking */}
          <Route
            path="/booking/:id"
            element={<Booking />}
          />

          {/* Auth */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* User */}
          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />

          <Route
            path="/track-order/:id"
            element={<TrackOrder />}
          />

          <Route
            path="/order-success/:id"
            element={<OrderSuccess />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* Information */}
          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/faq"
            element={<FAQ />}
          />

          <Route
            path="/terms"
            element={<Terms />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          {/* Payment */}
          <Route
            path="/payment/:id"
            element={<PaymentStatus />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/bookings"
            element={<AdminBookings />}
          />

          <Route
            path="/admin/payments"
            element={<AdminPayments />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;