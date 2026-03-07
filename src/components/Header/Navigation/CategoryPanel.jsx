import React, { useState, useEffect, useRef, useCallback } from "react";
import Drawer from "@mui/material/Drawer";
import { IoCloseSharp } from "react-icons/io5";
import {
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiX,
  FiGrid,
} from "react-icons/fi";
import { useAppContext } from "../../../hooks/useAppContext";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════
   INJECT GLOBAL STYLES
═══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .cat-panel-scroll::-webkit-scrollbar { width: 3px; }
  .cat-panel-scroll::-webkit-scrollbar-track { background: transparent; }
  .cat-panel-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 10px; }

  @keyframes slideInPanel {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeRowIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes subSlideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulseDot {
    0%,100% { transform: scale(1); opacity: 0.7; }
    50%      { transform: scale(1.5); opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .cat-row-item { animation: fadeRowIn 0.28s ease both; }
  .cat-row-item:hover .cat-row-label { color: #818cf8 !important; }
  .cat-row-item:hover .cat-row-icon-wrap {
    background: rgba(99,102,241,0.18) !important;
    border-color: rgba(99,102,241,0.4) !important;
  }
  .cat-row-item:hover .cat-row-chevron { transform: rotate(0deg) translateX(2px) !important; color: #818cf8 !important; }
  .cat-row-item.expanded-cat .cat-row-label { color: #a5b4fc !important; font-weight: 600 !important; }
  .cat-row-item.expanded-cat .cat-row-icon-wrap {
    background: rgba(99,102,241,0.22) !important;
    border-color: rgba(165,180,252,0.5) !important;
  }

  .sub-row:hover { background: rgba(99,102,241,0.08) !important; }
  .sub-row:hover .sub-label { color: #a5b4fc !important; }

  .subsub-row:hover { background: rgba(165,180,252,0.07) !important; }
  .subsub-row:hover .subsub-label { color: #c7d2fe !important; }

  .search-input-cat:focus {
    border-color: rgba(99,102,241,0.55) !important;
    background: rgba(99,102,241,0.06) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
  }
  .close-btn-cat:hover {
    background: rgba(99,102,241,0.15) !important;
    border-color: rgba(99,102,241,0.45) !important;
    color: #a5b4fc !important;
  }
  .view-all-link:hover { color: #a5b4fc !important; }

  .skeleton-line {
    background: linear-gradient(90deg,
      rgba(255,255,255,0.04) 25%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.04) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 6px;
  }
`;

function injectStyles(id, css) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

/* ═══════════════════════════════════════════
   FLATTEN for search
═══════════════════════════════════════════ */
function flattenCategories(cats, result = [], depth = 0, parent = null) {
  if (!Array.isArray(cats)) return result;
  cats.forEach((cat) => {
    result.push({ ...cat, _depth: depth, _parent: parent });
    if (cat.children?.length)
      flattenCategories(cat.children, result, depth + 1, cat.name);
  });
  return result;
}

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: "rgba(99,102,241,0.3)",
        color: "#c7d2fe",
        borderRadius: 3,
        padding: "0 2px",
      }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ═══════════════════════════════════════════
   SUB-SUB CATEGORY ROW
═══════════════════════════════════════════ */
const SubSubRow = ({ item, onClose, delay = 0 }) => (
  <Link
    to={`/category/${item?.slug || item?._id}`}
    onClick={onClose}
    className="subsub-row"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 14px 7px 54px",
      textDecoration: "none",
      borderRadius: 7,
      margin: "1px 8px",
      transition: "background 0.18s",
      animation: `subSlideIn 0.2s ease ${delay}ms both`,
    }}
  >
    <span style={{
      width: 5, height: 5,
      borderRadius: "50%",
      border: "1.5px solid rgba(148,163,184,0.35)",
      flexShrink: 0,
    }} />
    <span
      className="subsub-label"
      style={{
        fontSize: 12,
        color: "#64748b",
        fontFamily: "'DM Sans', sans-serif",
        transition: "color 0.18s",
        letterSpacing: "0.01em",
      }}
    >
      {item?.name}
    </span>
  </Link>
);

/* ═══════════════════════════════════════════
   SUB CATEGORY ROW
═══════════════════════════════════════════ */
const SubRow = ({ item, onClose, delay = 0 }) => {
  const [open, setOpen] = useState(false);
  const hasSubs = item?.children?.length > 0;

  return (
    <div style={{ animation: `subSlideIn 0.22s ease ${delay}ms both` }}>
      <div
        className="sub-row"
        onClick={() => hasSubs && setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px 8px 46px",
          borderRadius: 8,
          margin: "1px 8px",
          cursor: "pointer",
          transition: "background 0.18s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: open
              ? "rgba(99,102,241,0.6)"
              : "rgba(255,255,255,0.1)",
            flexShrink: 0,
            transition: "background 0.18s",
          }} />
          {hasSubs ? (
            <span
              className="sub-label"
              style={{
                fontSize: 13,
                color: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.18s",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item?.name}
            </span>
          ) : (
            <Link
              to={`/category/${item?.slug || item?._id}`}
              onClick={onClose}
              className="sub-label"
              style={{
                fontSize: 13,
                color: "#94a3b8",
                fontFamily: "'DM Sans', sans-serif",
                transition: "color 0.18s",
                flex: 1,
                textDecoration: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item?.name}
            </Link>
          )}
        </div>

        {hasSubs && (
          <FiChevronDown
            size={12}
            style={{
              color: "#475569",
              transition: "transform 0.22s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {hasSubs && open && (
        <div>
          {item.children.map((ssub, i) => (
            <SubSubRow
              key={ssub?._id || i}
              item={ssub}
              onClose={onClose}
              delay={i * 25}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   CATEGORY ROW (top-level)
═══════════════════════════════════════════ */
const CategoryRow = ({ item, index, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = item?.children?.length > 0;

  return (
    <div
      className={`cat-row-item ${expanded ? "expanded-cat" : ""}`}
      style={{ animationDelay: `${index * 40}ms`, marginBottom: 1 }}
    >
      <div
        onClick={() => hasSubs && setExpanded((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "9px 13px",
          cursor: "pointer",
          borderRadius: 10,
          margin: "0 8px",
          transition: "background 0.2s",
          background: expanded ? "rgba(99,102,241,0.07)" : "transparent",
          position: "relative",
        }}
      >
        {/* Accent bar when expanded */}
        {expanded && (
          <span style={{
            position: "absolute",
            left: 0, top: "50%",
            transform: "translateY(-50%)",
            width: 3, height: "55%",
            background: "linear-gradient(180deg, #6366f1, #818cf8)",
            borderRadius: "0 3px 3px 0",
          }} />
        )}

        {/* Icon */}
        <div
          className="cat-row-icon-wrap"
          style={{
            width: 34, height: 34,
            borderRadius: 9,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, flexShrink: 0,
            transition: "all 0.22s",
          }}
        >
          {item?.icon
            ? <span>{item.icon}</span>
            : <FiGrid size={13} style={{ color: "#475569" }} />
          }
        </div>

        {/* Label */}
        {hasSubs ? (
          <span
            className="cat-row-label"
            style={{
              flex: 1, fontSize: 14, fontWeight: 500,
              color: "#cbd5e1",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.2s",
              letterSpacing: "0.005em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item?.name}
          </span>
        ) : (
          <Link
            to={`/category/${item?.slug || item?._id}`}
            onClick={onClose}
            className="cat-row-label"
            style={{
              flex: 1, fontSize: 14, fontWeight: 500,
              color: "#cbd5e1",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.2s",
              letterSpacing: "0.005em",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item?.name}
          </Link>
        )}

        {/* Sub count + chevron */}
        {hasSubs && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: 10, color: "#334155",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, padding: "2px 6px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {item.children.length}
            </span>
            <FiChevronDown
              className="cat-row-chevron"
              size={14}
              style={{
                color: "#475569",
                transition: "transform 0.25s, color 0.2s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>

      {/* Sub-categories panel */}
      {hasSubs && expanded && (
        <div style={{
          borderLeft: "1px solid rgba(99,102,241,0.13)",
          marginLeft: 33,
          paddingBottom: 4,
        }}>
          {item.children.map((sub, i) => (
            <SubRow
              key={sub?._id || i}
              item={sub}
              onClose={onClose}
              delay={i * 30}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   SEARCH RESULTS LIST
═══════════════════════════════════════════ */
const SearchResults = ({ results, query, onClose }) => {
  if (!results.length) return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 30, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 13, color: "#334155", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
        No categories match<br />
        <strong style={{ color: "#6366f1" }}>"{query}"</strong>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "6px 0" }}>
      {results.map((item, i) => (
        <Link
          key={i}
          to={`/category/${item?.slug || item?._id}`}
          onClick={onClose}
          className="sub-row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 14px",
            textDecoration: "none",
            borderRadius: 9,
            margin: "2px 8px",
            transition: "background 0.18s",
            animation: `fadeRowIn 0.2s ease ${i * 28}ms both`,
          }}
        >
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: item._depth === 0
              ? "#6366f1"
              : item._depth === 1
              ? "rgba(99,102,241,0.5)"
              : "rgba(99,102,241,0.25)",
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sub-label" style={{
              fontSize: 13, color: "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.18s",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {highlight(item?.name, query)}
            </div>
            {item._parent && (
              <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>
                {item._depth === 1 ? "in " : "sub of "}
                {item._parent}
              </div>
            )}
          </div>
          <FiChevronRight size={12} style={{ color: "#334155", flexShrink: 0 }} />
        </Link>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════ */
const SkeletonLoader = () => (
  <div style={{ padding: "10px 16px" }}>
    {[100, 75, 88, 60, 82, 70, 90].map((w, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div className="skeleton-line" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
        <div className="skeleton-line" style={{ width: `${w * 0.65}%`, height: 13 }} />
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   MAIN — CategoryPanel
═══════════════════════════════════════════ */
const CategoryPanel = (props) => {
  injectStyles("cat-panel-v2-styles", GLOBAL_CSS);

  const context = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allFlat, setAllFlat] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  /* Flatten on data change */
  useEffect(() => {
    if (props?.data?.length) setAllFlat(flattenCategories(props.data));
  }, [props?.data]);

  /* Reset + auto-focus */
  useEffect(() => {
    if (props.isOpenCatPanel) {
      setSearchQuery("");
      setSearchResults([]);
      setSearching(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [props.isOpenCatPanel]);

  /* Debounced search */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearching(false);
      setSearchResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      setSearchResults(allFlat.filter((c) => c?.name?.toLowerCase().includes(q)));
      setSearching(false);
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, allFlat]);

  const closePanel = useCallback(() => {
    props.setIsOpenCatPanel(false);
    props.propsSetIsOpenCatPanel(false);
  }, [props]);

  const isLoading = !props?.data || props?.data?.length === 0;
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <Drawer
      open={props.isOpenCatPanel}
      onClose={closePanel}
      PaperProps={{
        style: {
          width: 308,
          background: "transparent",
          boxShadow: "none",
          border: "none",
        },
      }}
    >
      <div style={{
        width: 308, height: "100%",
        display: "flex", flexDirection: "column",
        background: "#0b0d12",
        fontFamily: "'DM Sans', sans-serif",
        animation: "slideInPanel 0.3s cubic-bezier(0.22,1,0.36,1) both",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background ambience */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background:
            "radial-gradient(ellipse 260px 180px at 105% -5%, rgba(99,102,241,0.10) 0%, transparent 65%)," +
            "radial-gradient(ellipse 180px 280px at -5% 105%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "radial-gradient(rgba(99,102,241,0.055) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }} />

        {/* ── HEADER ── */}
        <div style={{
          position: "relative", zIndex: 2,
          height: 58,
          padding: "0 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {localStorage.getItem("logo") ? (
              <img
                src={localStorage.getItem("logo")}
                alt="logo"
                style={{ maxHeight: 28, maxWidth: 100, objectFit: "contain" }}
              />
            ) : (
              <>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 16px rgba(99,102,241,0.35)",
                }}>
                  <FiGrid size={14} color="#fff" />
                </div>
                <span style={{
                  fontSize: 15, fontWeight: 800,
                  fontFamily: "'Syne', sans-serif",
                  color: "#e2e8f0", letterSpacing: "0.02em",
                }}>
                  Categories
                </span>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {!isLoading && (
              <span style={{
                fontSize: 10, color: "#334155",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 9, padding: "3px 8px",
              }}>
                {props.data.length} depts
              </span>
            )}
            <button
              className="close-btn-cat"
              onClick={closePanel}
              aria-label="Close menu"
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#475569", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.18s", padding: 0, fontSize: 17,
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div style={{
          position: "relative", zIndex: 2,
          padding: "11px 13px 7px",
          flexShrink: 0,
        }}>
          <div style={{ position: "relative" }}>
            <FiSearch style={{
              position: "absolute", left: 11, top: "50%",
              transform: "translateY(-50%)",
              color: "#334155", fontSize: 13,
              pointerEvents: "none",
            }} />
            <input
              ref={inputRef}
              type="text"
              className="search-input-cat"
              placeholder="Search categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "9px 32px 9px 32px",
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                color: "#e2e8f0", fontSize: 13,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute", right: 9, top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.07)",
                  border: "none", borderRadius: 5,
                  color: "#475569", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, padding: 0,
                }}
              >
                <FiX size={11} />
              </button>
            )}
          </div>

          {hasSearch && !searching && (
            <div style={{
              fontSize: 11, color: "#334155", marginTop: 7, paddingLeft: 2,
            }}>
              {searchResults.length > 0 ? (
                <><span style={{ color: "#6366f1" }}>{searchResults.length}</span> result{searchResults.length !== 1 ? "s" : ""}</>
              ) : "No matches"}
            </div>
          )}
        </div>

        {/* ── DIVIDER LABEL ── */}
        {!hasSearch && (
          <div style={{
            padding: "5px 20px 8px",
            display: "flex", alignItems: "center", gap: 8,
            flexShrink: 0, position: "relative", zIndex: 2,
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
            <span style={{
              fontSize: 9, fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: "#1e2535",
            }}>
              All Departments
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
          </div>
        )}

        {/* ── SCROLL AREA ── */}
        <div
          className="cat-panel-scroll"
          style={{
            flex: 1, overflowY: "auto", overflowX: "hidden",
            position: "relative", zIndex: 2,
            padding: "2px 0 16px",
          }}
        >
          {isLoading ? (
            <SkeletonLoader />
          ) : hasSearch ? (
            searching
              ? <SkeletonLoader />
              : <SearchResults results={searchResults} query={searchQuery} onClose={closePanel} />
          ) : (
            props.data.map((cat, i) => (
              <CategoryRow
                key={cat?._id || i}
                item={cat}
                index={i}
                onClose={closePanel}
              />
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "11px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, position: "relative", zIndex: 2,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              animation: "pulseDot 2.2s ease infinite",
              boxShadow: "0 0 6px rgba(34,197,94,0.5)",
            }} />
            <span style={{ fontSize: 11, color: "#1e2535", fontFamily: "'DM Sans', sans-serif" }}>
              All categories live
            </span>
          </div>

          <Link
            to="/categories"
            onClick={closePanel}
            className="view-all-link"
            style={{
              fontSize: 11, color: "#6366f1",
              textDecoration: "none", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 3,
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.18s",
            }}
          >
            View all <FiChevronRight size={12} />
          </Link>
        </div>
      </div>
    </Drawer>
  );
};

export default CategoryPanel;