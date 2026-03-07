import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import "./App.css";
import "./responsive.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import { ProductDetails } from "./Pages/ProductDetails";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import CartPage from "./Pages/Cart";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import Checkout from "./Pages/Checkout";
import MyAccount from "./Pages/MyAccount";
import MyList from "./Pages/MyList";
import Orders from "./Pages/Orders";

import { Toaster } from "react-hot-toast";
import Address from "./Pages/MyAccount/address";
import { OrderSuccess } from "./Pages/Orders/success";
import { OrderFailed } from "./Pages/Orders/failed";
import SearchPage from "./Pages/Search";
import Blog from "./Pages/Blog";
import BlogDetails from "./Pages/BlogDetails";
import CategoriesPage from "./Pages/Categories";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchCartItems,
  fetchCategories,
  fetchMyListData,
  fetchUserDetails,
  setAddressMode,
  setGlobalLoading,
  setIsLogin,
  setWindowWidth,
} from "./store/appSlice";

/* ─────────────────────────────────────────
   GLOBAL LOADER
   Cinematic top-bar + centered logo pulse
───────────────────────────────────────── */
const GlobalLoader = () => {
  const isLoading = useSelector((state) => state.app.globalLoading);

  return (
    <>
      {/* Injected styles – no extra CSS file needed */}
      <style>{`
        /* ── Top progress bar ── */
        @keyframes gl-bar {
          0%   { transform: scaleX(0);   opacity: 1; }
          60%  { transform: scaleX(0.75);opacity: 1; }
          100% { transform: scaleX(1);   opacity: 0; }
        }

        /* ── Overlay fade ── */
        @keyframes gl-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gl-fade-out { from { opacity: 1 } to { opacity: 0; pointer-events:none } }

        /* ── Dot bounce ── */
        @keyframes gl-dot {
          0%, 80%, 100% { transform: translateY(0)   scale(1);   opacity:.4 }
          40%            { transform: translateY(-10px) scale(1.15); opacity:1 }
        }

        /* ── Shimmer sweep ── */
        @keyframes gl-shimmer {
          0%   { background-position: -400px 0 }
          100% { background-position:  400px 0 }
        }

        .gl-bar-wrap {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          z-index: 99999;
          pointer-events: none;
        }
        .gl-bar-inner {
          height: 100%;
          width: 100%;
          transform-origin: left center;
          background: linear-gradient(90deg,
            transparent 0%,
            #6366f1 20%,
            #8b5cf6 50%,
            #ec4899 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation:
            gl-bar      0.35s cubic-bezier(.4,0,.2,1) forwards,
            gl-shimmer  1.2s linear infinite;
          box-shadow: 0 0 12px 2px rgba(139,92,246,.55);
        }

        .gl-overlay {
          position: fixed;
          inset: 0;
          z-index: 99998;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(6px) saturate(1.4);
          -webkit-backdrop-filter: blur(6px) saturate(1.4);
          animation: gl-fade-in .18s ease forwards;
        }
        .gl-overlay.exiting {
          animation: gl-fade-out .25s ease forwards;
        }

        .gl-dots {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .gl-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #6366f1;
          animation: gl-dot 1.2s ease-in-out infinite;
        }
        .gl-dot:nth-child(1) { animation-delay: 0s;    background: #6366f1; }
        .gl-dot:nth-child(2) { animation-delay: .15s;  background: #8b5cf6; }
        .gl-dot:nth-child(3) { animation-delay: .30s;  background: #a855f7; }
        .gl-dot:nth-child(4) { animation-delay: .45s;  background: #ec4899; }

        .gl-label {
          font-family: 'Outfit', 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #7c3aed;
          opacity: .75;
          user-select: none;
        }

        /* ─── Back button ─────────────────────── */
        @keyframes bb-in {
          0%   { opacity:0; transform: translateX(-14px) scale(.88) }
          60%  { opacity:1; transform: translateX(3px)   scale(1.02) }
          100% { opacity:1; transform: translateX(0)     scale(1)    }
        }
        @keyframes bb-ripple {
          0%   { transform: scale(0);   opacity: .45 }
          100% { transform: scale(3.2); opacity: 0   }
        }
        @keyframes bb-glow-pulse {
          0%, 100% { opacity: .55 }
          50%       { opacity: .9  }
        }
        @keyframes bb-arrow-slide {
          0%   { transform: translateX(0) }
          40%  { transform: translateX(-3px) }
          100% { transform: translateX(0) }
        }

        /* Gradient pill — blue-to-indigo core */
        .gb-btn {
          position: fixed;
          bottom: 118px;
          left: 20px;
          z-index: 9000;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          overflow: hidden;
          animation: bb-in .38s cubic-bezier(.34,1.4,.64,1) both;
          user-select: none;
          /* layered shadow for depth */
          box-shadow:
            0 0 0 1px rgba(59,130,246,.28),
            0 2px 6px  rgba(37,99,235,.22),
            0 8px 24px rgba(37,99,235,.18),
            0 1px 0    rgba(255,255,255,.12) inset;
          transition:
            transform   .2s cubic-bezier(.34,1.56,.64,1),
            box-shadow  .2s ease;
        }

        /* gradient background layer */
        .gb-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            115deg,
            #1d4ed8 0%,
            #2563eb 30%,
            #3b82f6 58%,
            #6366f1 85%,
            #818cf8 100%
          );
          transition: opacity .2s ease;
          z-index: 0;
        }

        /* subtle top-edge highlight */
        .gb-btn::after {
          content: '';
          position: absolute;
          top: 0; left: 8%; right: 8%;
          height: 1px;
          border-radius: 100px;
          background: rgba(255,255,255,.35);
          z-index: 2;
          pointer-events: none;
        }

        .gb-btn:hover {
          transform: translateX(-2px) scale(1.045);
          box-shadow:
            0 0 0 1px rgba(59,130,246,.4),
            0 4px 12px  rgba(37,99,235,.32),
            0 14px 36px rgba(37,99,235,.26),
            0 1px 0     rgba(255,255,255,.18) inset;
        }
        .gb-btn:hover::before {
          background: linear-gradient(
            115deg,
            #1e40af 0%,
            #1d4ed8 30%,
            #2563eb 58%,
            #4f46e5 85%,
            #6366f1 100%
          );
        }
        .gb-btn:active {
          transform: scale(.95);
          box-shadow:
            0 0 0 1px rgba(59,130,246,.3),
            0 2px 8px rgba(37,99,235,.2);
        }
        .gb-btn:focus-visible {
          outline: 2.5px solid #93c5fd;
          outline-offset: 3px;
        }

        /* inner content wrapper — sits above ::before */
        .gb-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px 9px 11px;
        }

        /* circular icon container */
        .gb-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.22);
          flex-shrink: 0;
          transition: background .2s ease, transform .2s cubic-bezier(.34,1.56,.64,1);
        }
        .gb-btn:hover .gb-icon-wrap {
          background: rgba(255,255,255,.26);
          animation: bb-arrow-slide .4s ease forwards;
        }

        /* label */
        .gb-label {
          font-family: 'Outfit', 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 650;
          letter-spacing: .025em;
          color: #fff;
          white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,.18);
        }

        /* ambient glow under button */
        .gb-glow {
          position: fixed;
          top: 28px;
          left: 28px;
          width: 80px;
          height: 24px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(59,130,246,.5) 0%, transparent 70%);
          filter: blur(8px);
          z-index: 8999;
          pointer-events: none;
          animation: bb-glow-pulse 2.4s ease-in-out infinite;
          transform: translateY(14px);
        }

        /* ripple */
        .gb-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,.3);
          pointer-events: none;
          animation: bb-ripple .6s ease forwards;
        }
      `}</style>

      {/* Top progress bar – always rendered, only animates when loading */}
      {isLoading && (
        <div className="gl-bar-wrap" aria-hidden="true">
          <div className="gl-bar-inner" />
        </div>
      )}

      {/* Full overlay */}
      {isLoading && (
        <div
          className="gl-overlay"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <div className="gl-dots" aria-hidden="true">
            {[0,1,2,3].map(i => <span key={i} className="gl-dot" />)}
          </div>
          <span className="gl-label">Loading</span>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────
   GLOBAL BACK BUTTON
───────────────────────────────────────── */
const GlobalBackButton = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleGoBack = (e) => {
    /* Ripple effect */
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "gb-ripple";
    Object.assign(ripple.style, {
      width:  `${size}px`,
      height: `${size}px`,
      left:   `${x - size / 2}px`,
      top:    `${y - size / 2}px`,
    });
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());

    window.history.length > 1 ? navigate(-1) : navigate("/");
  };

  if (location.pathname === "/") return null;

  return (
    <>
      {/* ambient glow */}
      <div className="gb-glow" aria-hidden="true" />

      <button
        className="gb-btn"
        onClick={handleGoBack}
        aria-label="Go back to previous page"
        type="button"
      >
        <span className="gb-inner">
          <span className="gb-icon-wrap" aria-hidden="true">
            <IoArrowBack size={14} color="#fff" />
          </span>
          <span className="gb-label">Back</span>
        </span>
      </button>
    </>
  );
};


/* ─────────────────────────────────────────
   APP CONTENT
───────────────────────────────────────── */
const AppContent = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(setGlobalLoading(true));
    const timer = setTimeout(() => {
      dispatch(setGlobalLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [location.pathname, dispatch]);

  return (
    <>
      <GlobalLoader />
      <GlobalBackButton />
      <Header />
      <Routes>
        <Route path="/" exact={true} element={<Home />} />
        <Route path="/products" exact={true} element={<ProductListing />} />
        <Route path="/product/:id" exact={true} element={<ProductDetails />} />
        <Route path="/login" exact={true} element={<Login />} />
        <Route path="/register" exact={true} element={<Register />} />
        <Route path="/cart" exact={true} element={<CartPage />} />
        <Route path="/verify" exact={true} element={<Verify />} />
        <Route path="/forgot-password" exact={true} element={<ForgotPassword />} />
        <Route path="/checkout" exact={true} element={<Checkout />} />
        <Route path="/my-account" exact={true} element={<MyAccount />} />
        <Route path="/my-list" exact={true} element={<MyList />} />
        <Route path="/my-orders" exact={true} element={<Orders />} />
        <Route path="/order/success" exact={true} element={<OrderSuccess />} />
        <Route path="/order/failed" exact={true} element={<OrderFailed />} />
        <Route path="/address" exact={true} element={<Address />} />
        <Route path="/search" exact={true} element={<SearchPage />} />
        <Route path={"/blog"} exact={true} element={<Blog />} />
        <Route path={"/blog/:id"} exact={true} element={<BlogDetails />} />
        <Route path={"/categories"} exact={true} element={<CategoriesPage />} />
      </Routes>
      <Footer />
    </>
  );
};

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
function App() {
  const dispatch = useDispatch();
  const isLogin  = useSelector((state) => state.app.isLogin);

  useEffect(() => {
    localStorage.removeItem("userEmail");
    const token = localStorage.getItem("accessToken");
    if (token !== undefined && token !== null && token !== "") {
      dispatch(setIsLogin(true));
      dispatch(fetchCartItems());
      dispatch(fetchMyListData());
      dispatch(fetchUserDetails());
    } else {
      dispatch(setIsLogin(false));
    }
  }, [dispatch, isLogin]);

  useEffect(() => {
    dispatch(fetchCategories());

    const handleResize = () => {
      dispatch(setWindowWidth(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      dispatch(setAddressMode("add"));
    };
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            fontFamily: "'Outfit', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.01em",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            padding: "12px 16px",
            color: "#111",
            background: "#fff",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />
    </>
  );
}

export default App;