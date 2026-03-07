import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { RiMenu2Fill } from "react-icons/ri";
import { LiaAngleDownSolid } from "react-icons/lia";
import { Link, useLocation } from "react-router-dom";
import { GoRocket } from "react-icons/go";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdLocalOffer } from "react-icons/md";
import { IoFlashOutline } from "react-icons/io5";
import CategoryPanel from "./CategoryPanel";
import { useAppContext } from "../../../hooks/useAppContext";
import MobileNav from "./MobileNav";

/* ═══════════════════════════════════════════════
   STYLES — all scoped inside this component
═══════════════════════════════════════════════ */
const NAV_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700&display=swap');

  :root {
    --nav-h: 52px;
    --nav-bg: #ffffff;
    --nav-border: rgba(0,0,0,.07);
    --nav-text: #1a1a2e;
    --nav-muted: #64748b;
    --nav-accent: #2563eb;
    --nav-accent-2: #0ea5e9;
    --nav-hover-bg: rgba(37,99,235,.06);
    --nav-active-bar: #2563eb;
    --sub-bg: #ffffff;
    --sub-shadow: 0 8px 40px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06);
    --sub-border: rgba(0,0,0,.06);
    --radius-sm: 8px;
    --radius-md: 12px;
    --transition: cubic-bezier(.4,0,.2,1);
  }

  /* ── Nav shell ── */
  .nav-shell {
    background: var(--nav-bg);
    border-bottom: 1px solid var(--nav-border);
    position: sticky;
    top: 0;
    z-index: 800;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 1px 0 var(--nav-border), 0 2px 12px rgba(0,0,0,.04);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    height: var(--nav-h);
    gap: 4px;
  }

  /* ── Scroll indicator bar ── */
  .nav-progress {
    position: absolute;
    bottom: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, #2563eb, #0ea5e9, #38bdf8);
    transition: width .1s linear;
    border-radius: 0 2px 2px 0;
    pointer-events: none;
  }

  /* ── Categories button ── */
  .nav-cat-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border: 1.5px solid rgba(37,99,235,.2);
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, rgba(37,99,235,.05) 0%, rgba(14,165,233,.05) 100%);
    color: var(--nav-accent);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all .18s var(--transition);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .nav-cat-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(37,99,235,.1), rgba(14,165,233,.08));
    opacity: 0;
    transition: opacity .18s ease;
  }
  .nav-cat-btn:hover::before { opacity: 1; }
  .nav-cat-btn:hover {
    border-color: rgba(37,99,235,.45);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(37,99,235,.15);
  }
  .nav-cat-btn:active { transform: scale(.97); }
  .nav-cat-icon { font-size: 16px; flex-shrink: 0; }
  .nav-cat-chevron {
    font-size: 11px;
    margin-left: 2px;
    transition: transform .22s var(--transition);
  }
  .nav-cat-btn.open .nav-cat-chevron { transform: rotate(180deg); }

  /* ── Divider ── */
  .nav-divider {
    width: 1px;
    height: 22px;
    background: var(--nav-border);
    flex-shrink: 0;
    margin: 0 4px;
  }

  /* ── Nav list ── */
  .nav-list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0; padding: 0;
    gap: 0;
    flex: 1;
  }

  /* ── Nav item ── */
  .nav-item {
    position: relative;
  }

  .nav-link-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 13px;
    border-radius: var(--radius-sm);
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--nav-text);
    text-decoration: none;
    white-space: nowrap;
    transition: background .15s ease, color .15s ease;
    position: relative;
  }
  .nav-link-btn:hover {
    background: var(--nav-hover-bg);
    color: var(--nav-accent);
  }
  .nav-link-btn.active {
    color: var(--nav-accent);
    font-weight: 600;
  }

  /* active underline dot */
  .nav-link-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--nav-accent);
  }

  .nav-chevron {
    font-size: 10px;
    color: var(--nav-muted);
    transition: transform .2s var(--transition), color .15s ease;
    flex-shrink: 0;
  }
  .nav-item:hover .nav-chevron,
  .nav-item:focus-within .nav-chevron {
    transform: rotate(180deg);
    color: var(--nav-accent);
  }

  /* ── Badges ── */
  .nav-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 100px;
    letter-spacing: .04em;
    text-transform: uppercase;
    line-height: 1.4;
    flex-shrink: 0;
  }
  .nav-badge-new {
    background: linear-gradient(135deg, #2563eb, #0ea5e9);
    color: #fff;
  }
  .nav-badge-hot {
    background: linear-gradient(135deg, #f97316, #ef4444);
    color: #fff;
  }
  .nav-badge-sale {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
  }

  /* ── Submenu ── */
  .nav-submenu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 200px;
    background: var(--sub-bg);
    border: 1px solid var(--sub-border);
    border-radius: var(--radius-md);
    box-shadow: var(--sub-shadow);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px) scale(.98);
    transform-origin: top left;
    transition:
      opacity .2s var(--transition),
      transform .2s var(--transition),
      visibility .2s;
    z-index: 900;
    overflow: hidden;
  }
  .nav-item:hover .nav-submenu,
  .nav-item:focus-within .nav-submenu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  /* submenu header accent */
  .nav-submenu::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #0ea5e9);
    border-radius: 0;
  }

  .nav-sub-list {
    list-style: none;
    margin: 0;
    padding: 6px;
  }

  .nav-sub-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--nav-text);
    text-decoration: none;
    transition: background .14s ease, color .14s ease, padding-left .14s ease;
    position: relative;
  }
  .nav-sub-link:hover {
    background: var(--nav-hover-bg);
    color: var(--nav-accent);
    padding-left: 16px;
  }

  /* 3rd level */
  .nav-sub-item { position: relative; }
  .nav-sub-submenu {
    position: absolute;
    top: -6px;
    left: calc(100% + 6px);
    min-width: 180px;
    background: var(--sub-bg);
    border: 1px solid var(--sub-border);
    border-radius: var(--radius-md);
    box-shadow: var(--sub-shadow);
    opacity: 0;
    visibility: hidden;
    transform: translateX(-6px) scale(.98);
    transform-origin: top left;
    transition:
      opacity .18s var(--transition),
      transform .18s var(--transition),
      visibility .18s;
    z-index: 910;
    overflow: hidden;
  }
  .nav-sub-item:hover .nav-sub-submenu,
  .nav-sub-item:focus-within .nav-sub-submenu {
    opacity: 1;
    visibility: visible;
    transform: translateX(0) scale(1);
  }
  .nav-sub-submenu::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #0ea5e9, #38bdf8);
  }
  .nav-sub-arrow {
    font-size: 10px;
    color: var(--nav-muted);
  }

  /* ── Promo strip ── */
  .nav-promo {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg,rgba(37,99,235,.06),rgba(14,165,233,.04));
    border: 1px solid rgba(37,99,235,.1);
    white-space: nowrap;
    flex-shrink: 0;
    color: var(--nav-text);
    font-size: 12.5px;
    font-weight: 500;
    transition: all .18s ease;
  }
  .nav-promo:hover {
    border-color: rgba(37,99,235,.25);
    background: linear-gradient(135deg,rgba(37,99,235,.1),rgba(14,165,233,.07));
  }
  .nav-promo-icon {
    color: #f97316;
    font-size: 15px;
    flex-shrink: 0;
    animation: promo-bounce 2s ease-in-out infinite;
  }
  @keyframes promo-bounce {
    0%,100% { transform: translateY(0) }
    50%      { transform: translateY(-2px) }
  }
  .nav-promo-text strong { color: var(--nav-accent); }

  /* ── Flash sale ticker ── */
  .nav-ticker-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border: 1px solid rgba(251,191,36,.4);
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    color: #92400e;
    margin-left: 4px;
    cursor: pointer;
    transition: all .18s ease;
  }
  .nav-ticker-wrap:hover {
    background: linear-gradient(135deg, #fde68a, #fbbf24);
    border-color: rgba(251,191,36,.7);
  }
  .nav-ticker-icon { color: #d97706; font-size: 14px; }

  .nav-countdown {
    display: inline-flex;
    gap: 2px;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    font-weight: 700;
    background: rgba(0,0,0,.1);
    padding: 1px 5px;
    border-radius: 4px;
    letter-spacing: .03em;
  }
`;

/* ═══════════════════════════════════════════════
   COUNTDOWN HOOK
═══════════════════════════════════════════════ */
const useCountdown = (endTime) => {
  const calc = () => {
    const diff = Math.max(0, endTime - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endTime]);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`;
};

/* ═══════════════════════════════════════════════
   SCROLL PROGRESS HOOK
═══════════════════════════════════════════════ */
const useScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return pct;
};

/* ═══════════════════════════════════════════════
   MAIN NAVIGATION COMPONENT
═══════════════════════════════════════════════ */
const Navigation = (props) => {
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [catData, setCatData] = useState([]);
  const context = useAppContext();
  const location = useLocation();
  const scrollPct = useScrollProgress();

  // Flash sale ends in ~4 hrs from now
  const saleEnd = useRef(Date.now() + 4 * 3600 * 1000 + 23 * 60 * 1000);
  const countdown = useCountdown(saleEnd.current);

  useEffect(() => { setCatData(context?.catData); }, [context?.catData]);
  useEffect(() => { setIsOpenCatPanel(props.isOpenCatPanel); }, [props.isOpenCatPanel]);

  const isActive = (path) => location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  // Badge config per category (demo — extend as needed)
  const catBadges = { sale: "sale", new: "new", featured: "hot" };
  const getBadge = (name = "") => {
    const key = name.toLowerCase();
    if (catBadges[key]) return catBadges[key];
    return null;
  };

  return (
    <>
      <style>{NAV_STYLES}</style>

      <nav className="nav-shell" role="navigation" aria-label="Main navigation">
        {/* Scroll progress bar */}
        <div
          className="nav-progress"
          style={{ width: `${scrollPct}%` }}
          aria-hidden="true"
        />

        <div className="nav-inner">
          {/* ── Categories button ── */}
          {context?.windowWidth > 992 && (
            <button
              className={`nav-cat-btn ${isOpenCatPanel ? "open" : ""}`}
              onClick={() => setIsOpenCatPanel(true)}
              aria-expanded={isOpenCatPanel}
              aria-haspopup="true"
            >
              <RiMenu2Fill className="nav-cat-icon" />
              Shop By Categories
              <LiaAngleDownSolid className="nav-cat-chevron" />
            </button>
          )}

          {context?.windowWidth > 992 && <div className="nav-divider" aria-hidden="true" />}

          {/* ── Main nav links ── */}
          <ul className="nav-list" role="list">
            <li className="nav-item">
              <Link
                to="/categories"
                className={`nav-link-btn ${isActive("/categories") ? "active" : ""}`}
              >
                <HiOutlineSparkles style={{ fontSize: 14, color: "#2563eb" }} />
                Categories
              </Link>
            </li>

            {catData?.map((cat, index) => (
              <li className="nav-item" key={index}>
                <Link
                  to={`/products?catId=${cat?._id}`}
                  className={`nav-link-btn ${isActive(`/products?catId=${cat?._id}`) ? "active" : ""}`}
                >
                  {cat?.name}
                  {getBadge(cat?.name) && (
                    <span className={`nav-badge nav-badge-${getBadge(cat.name)}`}>
                      {getBadge(cat.name)}
                    </span>
                  )}
                  {cat?.children?.length > 0 && (
                    <LiaAngleDownSolid className="nav-chevron" aria-hidden="true" />
                  )}
                </Link>

                {/* ── L2 Submenu ── */}
                {cat?.children?.length > 0 && (
                  <div className="nav-submenu" role="menu">
                    <ul className="nav-sub-list">
                      {cat.children.map((subCat, i) => (
                        <li className="nav-sub-item" key={i} role="none">
                          <Link
                            to={`/products?subCatId=${subCat?._id}`}
                            className="nav-sub-link"
                            role="menuitem"
                          >
                            {subCat?.name}
                            {subCat?.children?.length > 0 && (
                              <LiaAngleDownSolid
                                className="nav-sub-arrow"
                                style={{ transform: "rotate(-90deg)" }}
                                aria-hidden="true"
                              />
                            )}
                          </Link>

                          {/* ── L3 Submenu ── */}
                          {subCat?.children?.length > 0 && (
                            <div className="nav-sub-submenu" role="menu">
                              <ul className="nav-sub-list">
                                {subCat.children.map((lvl3, j) => (
                                  <li key={j} role="none">
                                    <Link
                                      to={`/products?thirdLavelCatId=${lvl3?._id}`}
                                      className="nav-sub-link"
                                      role="menuitem"
                                    >
                                      {lvl3?.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* ── Flash sale countdown ── NEW FEATURE ── */}
          {context?.windowWidth > 1100 && (
            <Link to="/products?sale=true" style={{ textDecoration: "none" }}>
              <div className="nav-ticker-wrap" title="Flash Sale ends soon!">
                <IoFlashOutline className="nav-ticker-icon" />
                Flash Sale
                <span className="nav-countdown">{countdown}</span>
              </div>
            </Link>
          )}

          {/* ── Free delivery promo ── */}
          {context?.windowWidth > 992 && (
            <div className="nav-promo" title="Free international delivery on all orders">
              <GoRocket className="nav-promo-icon" />
              <span className="nav-promo-text">
                Free <strong>Delivery</strong>
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Category panel */}
      {catData?.length > 0 && (
        <CategoryPanel
          isOpenCatPanel={isOpenCatPanel}
          setIsOpenCatPanel={setIsOpenCatPanel}
          propsSetIsOpenCatPanel={props.setIsOpenCatPanel}
          data={catData}
        />
      )}

      {context?.windowWidth < 992 && <MobileNav />}
    </>
  );
};

export default Navigation;