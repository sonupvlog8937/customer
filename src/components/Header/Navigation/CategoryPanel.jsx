import React, { useContext, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { IoCloseSharp } from "react-icons/io5";
import {
  FiSearch,
  FiHome,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiPhone,
  FiMail,
  FiTag,
  FiTrendingUp,
  FiStar,
  FiGrid,
} from "react-icons/fi";
import { CategoryCollapse } from "../../CategoryCollapse";
import { Button } from "@mui/material";
import { useAppContext } from "../../../hooks/useAppContext";
import { Link, useNavigate } from "react-router-dom";
import { fetchDataFromApi } from "../../../utils/api";

/* ─────────────────────────────────────────────
   Inline styles (avoids extra CSS file dependency)
───────────────────────────────────────────── */
const styles = {
  /* Overlay */
  drawerPaper: {
    width: 320,
    background: "transparent",
    boxShadow: "none",
  },

  /* Panel root */
  panel: {
    width: 320,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(160deg, #0f0f0f 0%, #1a1a2e 60%, #16213e 100%)",
    color: "#f0f0f0",
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  /* Decorative glow blob */
  glowBlob: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    position: "relative",
    zIndex: 1,
  },

  logo: {
    maxHeight: 38,
    maxWidth: 140,
    objectFit: "contain",
    filter: "brightness(1.1)",
  },

  closeBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#ccc",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    fontSize: 18,
    transition: "all 0.2s",
  },

  /* Search bar */
  searchWrap: {
    padding: "12px 16px",
    position: "relative",
    zIndex: 1,
  },

  searchInput: {
    width: "100%",
    padding: "10px 38px 10px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#f0f0f0",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  },

  searchIcon: {
    position: "absolute",
    right: 28,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    fontSize: 15,
    pointerEvents: "none",
  },

  /* Quick nav pills */
  quickNav: {
    display: "flex",
    gap: 8,
    padding: "6px 16px 14px",
    flexWrap: "wrap",
    zIndex: 1,
    position: "relative",
  },

  pill: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#ccc",
    fontSize: 12,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },

  /* Section label */
  sectionLabel: {
    padding: "10px 16px 6px",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#ff6b35",
    zIndex: 1,
    position: "relative",
  },

  /* Scrollable category area */
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    zIndex: 1,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,107,53,0.3) transparent",
  },

  /* Trending tags */
  trendingWrap: {
    padding: "12px 16px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    zIndex: 1,
    position: "relative",
  },

  trendingTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 8,
  },

  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },

  tag: {
    padding: "4px 10px",
    borderRadius: 6,
    background: "rgba(255,107,53,0.12)",
    border: "1px solid rgba(255,107,53,0.25)",
    color: "#ff9a6c",
    fontSize: 11,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s",
  },

  /* User profile mini card */
  userCard: {
    margin: "0 16px 12px",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
    position: "relative",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff6b35, #f7931e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#fff",
    flexShrink: 0,
  },

  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f0f0f0",
    lineHeight: 1.2,
  },

  userSub: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

  /* Auth buttons */
  authWrap: {
    padding: "0 16px 14px",
    display: "flex",
    gap: 8,
    zIndex: 1,
    position: "relative",
  },

  btnPrimary: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #ff6b35, #f7931e)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    textDecoration: "none",
    transition: "opacity 0.2s, transform 0.15s",
  },

  btnOutline: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#ccc",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    textDecoration: "none",
    transition: "all 0.2s",
  },

  /* Footer contact strip */
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    position: "relative",
  },

  footerContact: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  footerLink: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#666",
    fontSize: 11,
    textDecoration: "none",
    cursor: "pointer",
  },

  badge: {
    background: "#ff6b35",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: 10,
    marginLeft: 4,
  },
};

/* ──────────────────────────────────────────── */

const QUICK_LINKS = [
  { label: "Home", icon: <FiHome size={12} />, to: "/" },
  { label: "Wishlist", icon: <FiHeart size={12} />, to: "/wishlist" },
  { label: "Cart", icon: <FiShoppingCart size={12} />, to: "/cart" },
  { label: "Orders", icon: <FiTag size={12} />, to: "/orders" },
];

const TRENDING_TAGS = [
  "Smartphones", "Laptops", "Footwear", "Skincare", "Kitchen", "Gaming", "Watches",
];

/* ──────────────────────────────────────────── */

const CategoryPanel = (props) => {
  const context = useAppContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(props?.data || []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);
  const searchRef = useRef(null);

  /* Auto-focus search when panel opens */
  useEffect(() => {
    if (props.isOpenCatPanel) {
      setTimeout(() => searchRef.current?.focus(), 300);
      setSearchQuery("");
      setFilteredData(props?.data || []);
    }
  }, [props.isOpenCatPanel, props?.data]);

  /* Filter categories on search */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(props?.data || []);
      return;
    }
    const lower = searchQuery.toLowerCase();
    const filtered = (props?.data || []).filter((cat) =>
      cat?.name?.toLowerCase().includes(lower) ||
      cat?.children?.some((sub) => sub?.name?.toLowerCase().includes(lower))
    );
    setFilteredData(filtered);
  }, [searchQuery, props?.data]);

  const closePanel = () => {
    props.setIsOpenCatPanel(false);
    props.propsSetIsOpenCatPanel(false);
  };

  const toggleDrawer = (open) => () => closePanel();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetchDataFromApi(
        `/api/user/logout?token=${localStorage.getItem("accessToken")}`,
        { withCredentials: true }
      );
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        context.setUserData(null);
        context?.setCartData([]);
        context?.setMyListData([]);
        closePanel();
        navigate("/");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isMobile = context?.windowWidth < 992;
  const isLoggedIn = context?.isLogin;
  const userData = context?.userData;
  const cartCount = context?.cartData?.length || 0;
  const wishlistCount = context?.myListData?.length || 0;

  return (
    <Drawer
      open={props.isOpenCatPanel}
      onClose={toggleDrawer(false)}
      PaperProps={{ style: styles.drawerPaper }}
    >
      <Box style={styles.panel}>
        {/* Decorative glow */}
        <div style={styles.glowBlob} />

        {/* ── Header ── */}
        <div style={styles.header}>
          <img
            src={localStorage.getItem("logo") || "/logo.png"}
            alt="Logo"
            style={styles.logo}
          />
          <button
            style={{
              ...styles.closeBtn,
              background: hoverClose ? "rgba(255,107,53,0.15)" : styles.closeBtn.background,
              borderColor: hoverClose ? "rgba(255,107,53,0.4)" : styles.closeBtn.borderColor,
              color: hoverClose ? "#ff6b35" : "#ccc",
            }}
            onClick={closePanel}
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => setHoverClose(false)}
            aria-label="Close menu"
          >
            <IoCloseSharp />
          </button>
        </div>

        {/* ── Search Bar ── */}
        <div style={styles.searchWrap}>
          <div style={{ position: "relative" }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <FiSearch style={styles.searchIcon} />
          </div>
        </div>

        {/* ── Quick Nav Pills ── */}
        <div style={styles.quickNav}>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              style={styles.pill}
              onClick={closePanel}
            >
              {link.icon}
              {link.label}
              {link.label === "Cart" && cartCount > 0 && (
                <span style={styles.badge}>{cartCount}</span>
              )}
              {link.label === "Wishlist" && wishlistCount > 0 && (
                <span style={styles.badge}>{wishlistCount}</span>
              )}
            </Link>
          ))}
        </div>

        {/* ── Category Section ── */}
        <div style={styles.sectionLabel}>
          <FiGrid size={10} style={{ marginRight: 5, verticalAlign: "middle" }} />
          Browse Categories
          {searchQuery && filteredData.length === 0 && (
            <span style={{ color: "#666", fontWeight: 400, marginLeft: 8 }}>
              — no results
            </span>
          )}
        </div>

        {/* ── Scrollable Category List ── */}
        <div style={styles.scrollArea}>
          {filteredData?.length > 0 ? (
            <CategoryCollapse data={filteredData} onItemClick={closePanel} />
          ) : (
            !searchQuery && (
              <div style={{ padding: "20px 16px", color: "#555", fontSize: 13 }}>
                No categories available.
              </div>
            )
          )}
        </div>

        {/* ── Trending Tags ── */}
        <div style={styles.trendingWrap}>
          <div style={styles.trendingTitle}>
            <FiTrendingUp size={11} />
            Trending
          </div>
          <div style={styles.tagList}>
            {TRENDING_TAGS.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                style={styles.tag}
                onClick={closePanel}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* ── User Card (logged in, mobile) ── */}
        {isMobile && isLoggedIn && userData && (
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {userData?.name?.charAt(0)?.toUpperCase() || <FiUser />}
            </div>
            <div>
              <div style={styles.userName}>{userData?.name || "User"}</div>
              <div style={styles.userSub}>{userData?.email || "Manage account"}</div>
            </div>
          </div>
        )}

        {/* ── Auth Buttons ── */}
        {isMobile && !isLoggedIn && (
          <div style={styles.authWrap}>
            <Link to="/login" style={styles.btnPrimary} onClick={closePanel}>
              <FiLogIn size={14} /> Login
            </Link>
            <Link to="/register" style={styles.btnOutline} onClick={closePanel}>
              <FiUser size={14} /> Register
            </Link>
          </div>
        )}

        {isMobile && isLoggedIn && (
          <div style={styles.authWrap}>
            <Link to="/account" style={styles.btnOutline} onClick={closePanel}>
              <FiUser size={14} /> My Account
            </Link>
            <button
              style={{ ...styles.btnPrimary, opacity: isLoggingOut ? 0.6 : 1 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <FiLogOut size={14} />
              {isLoggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        )}

        {/* ── Footer Strip ── */}
        <div style={styles.footer}>
          <div style={styles.footerContact}>
            <a href="tel:+911800000000" style={styles.footerLink}>
              <FiPhone size={11} /> Support
            </a>
            <a href="mailto:help@store.com" style={styles.footerLink}>
              <FiMail size={11} /> Email
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#555", fontSize: 10 }}>
            <FiStar size={10} color="#ff6b35" />
            Rated 4.9/5
          </div>
        </div>
      </Box>
    </Drawer>
  );
};

export default CategoryPanel;