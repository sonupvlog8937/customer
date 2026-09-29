import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IoClose } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";

const font = "'Sora', sans-serif";

/* option string ho ya object ({name, code}) dono handle karta hai */
const normalize = (opt) => {
  if (opt && typeof opt === "object") {
    const label = opt.name || opt.label || opt.color || opt.value || "";
    return { label: String(label), value: String(opt.code || opt.hex || label) };
  }
  return { label: String(opt), value: String(opt) };
};

const isColorValue = (v) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) || /^(rgb|hsl)a?\(/i.test(v);

const GROUPS = [
  { key: "size", field: "size", title: "Size" },
  { key: "weight", field: "weight", title: "Weight" },
  { key: "ram", field: "RAM", title: "RAM" },
  { key: "color", field: "colorOptions", title: "Color" },
];

const ProductOptionsDialog = ({ open, onClose, product, onConfirm, loading }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selected, setSelected] = useState({});
  const [showError, setShowError] = useState(false);

  // sirf wahi groups jinke options product me hain
  const groups = GROUPS.map((g) => ({
    ...g,
    options: (Array.isArray(product?.[g.field]) ? product[g.field] : [])
      .filter((o) => o !== "" && o !== null && o !== undefined)
      .map(normalize),
  })).filter((g) => g.options.length > 0);

  useEffect(() => {
    if (open) {
      setSelected({});
      setShowError(false);
    }
  }, [open, product?._id]);

  const handleSelect = (key, value) => {
    setSelected((prev) => ({ ...prev, [key]: value }));
    setShowError(false);
  };

  const handleAdd = () => {
    const missing = groups.filter((g) => !selected[g.key]);
    if (missing.length > 0) {
      setShowError(true);
      return;
    }
    onConfirm(selected);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      scroll="paper"
      maxWidth={false}
      PaperProps={{
        sx: {
          fontFamily: font,
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          // mobile: poori width ki bottom sheet | desktop: 440px center dialog
          width: isMobile ? "100%" : 440,
          maxWidth: "100%",
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? "85vh" : "80vh",
          borderRadius: isMobile ? "20px 20px 0 0" : "18px",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "center",
        },
      }}
    >
      {/* Mobile drag handle */}
      {isMobile && <div style={styles.handle} />}

      {/* Header */}
      <div style={styles.header}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={styles.title}>Select Options</div>
          <div style={styles.subtitle}>{product?.name}</div>
        </div>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          <IoClose size={18} />
        </button>
      </div>

      {/* Options (scrollable) */}
      <div style={styles.body}>
        {groups.map((g) => {
          const hasError = showError && !selected[g.key];
          return (
            <div key={g.key} style={{ marginBottom: 18 }}>
              <div style={styles.groupTitle}>
                {g.title}
                {selected[g.key] && g.key !== "color" && (
                  <span style={styles.selectedText}>: {selected[g.key]}</span>
                )}
                {hasError && <span style={styles.errorText}> — please select</span>}
              </div>

              <div style={styles.chipWrap}>
                {g.options.map((opt) => {
                  const active = selected[g.key] === opt.value;
                  const colorSwatch = g.key === "color" && isColorValue(opt.value);

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(g.key, opt.value)}
                      style={{
                        ...styles.chip,
                        ...(active ? styles.chipActive : {}),
                        ...(hasError && !active ? styles.chipError : {}),
                      }}
                    >
                      {colorSwatch && (
                        <span style={{ ...styles.swatch, background: opt.value }} />
                      )}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — Add to Cart */}
      <div style={styles.footer}>
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          style={{
            ...styles.cartBtn,
            ...(loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
          }}
        >
          <FiShoppingCart size={17} />
          <span>{loading ? "Adding..." : "Add to Cart"}</span>
        </button>
      </div>
    </Dialog>
  );
};

const styles = {
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    background: "#d1d5db",
    margin: "8px auto 0",
    flexShrink: 0,
  },
  header: {
    boxSizing: "border-box",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px 12px",
    borderBottom: "1px solid #f3f4f6",
    fontFamily: font,
    flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 700, color: "#111827" },
  subtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  closeBtn: {
    width: 32,
    height: 32,
    minWidth: 32,
    flexShrink: 0,
    borderRadius: "50%",
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    boxSizing: "border-box",
    width: "100%",
    padding: "16px 18px 4px",
    overflowY: "auto",
    overflowX: "hidden",
    flex: 1,
    fontFamily: font,
  },
  groupTitle: { fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 8 },
  selectedText: { color: "#6b7280", fontWeight: 500 },
  errorText: { color: "#e84040", fontWeight: 500, fontSize: 12 },
  chipWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    minHeight: 40,
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: font,
    transition: "all 0.15s ease",
  },
  chipActive: { borderColor: "#e84040", background: "#fff0f0", color: "#e84040" },
  chipError: { borderColor: "#fecaca" },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "1px solid rgba(0,0,0,0.15)",
    display: "inline-block",
  },
  footer: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 18px calc(14px + env(safe-area-inset-bottom, 0px))",
    borderTop: "1px solid #f3f4f6",
    background: "#fff",
    flexShrink: 0,
  },
  cartBtn: {
    boxSizing: "border-box", // ← ye missing tha, isi se button bahar nikal raha tha
    width: "100%",
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "0 16px",
    border: "none",
    borderRadius: 12,
    background: "#e84040",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: font,
    whiteSpace: "nowrap",
  },
};

export default ProductOptionsDialog;