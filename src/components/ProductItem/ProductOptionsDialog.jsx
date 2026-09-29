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
  const [selectedProductOption, setSelectedProductOption] = useState({});

  // sirf wahi groups jinke options product me hain
  const groups = GROUPS.map((g) => ({
    ...g,
    options: (Array.isArray(product?.[g.field]) ? product[g.field] : [])
      .filter((o) => o !== "" && o !== null && o !== undefined)
      .map(normalize),
  })).filter((g) => g.options.length > 0);

  // Calculate active price based on selected product option
  const activePrice = React.useMemo(() => {
    if (Object.keys(selectedProductOption).length > 0) {
      const optionName = Object.keys(selectedProductOption)[0];
      const selectedValue = selectedProductOption[optionName];
      const option = product?.productOptions?.find(opt => opt.name === optionName);
      if (option) {
        const valueObj = option.values.find(v => v.value === selectedValue);
        if (valueObj?.price) {
          return Number(valueObj.price);
        }
      }
    }
    return Number(product?.price ?? 0);
  }, [selectedProductOption, product]);

  const activeOldPrice = React.useMemo(() => {
    if (Object.keys(selectedProductOption).length > 0) {
      const optionName = Object.keys(selectedProductOption)[0];
      const selectedValue = selectedProductOption[optionName];
      const option = product?.productOptions?.find(opt => opt.name === optionName);
      if (option) {
        const valueObj = option.values.find(v => v.value === selectedValue);
        if (valueObj?.mrp && Number(valueObj.mrp) > 0) {
          return Number(valueObj.mrp);
        }
      }
    }
    return Number(product?.oldPrice ?? 0);
  }, [selectedProductOption, product]);

  useEffect(() => {
    if (open) {
      setSelected({});
      setSelectedProductOption({});
      setShowError(false);
    }
  }, [open, product?._id]);

  const handleSelect = (key, value) => {
    setSelected((prev) => ({ ...prev, [key]: value }));
    setShowError(false);
  };

  const handleProductOptionSelect = (optionName, value) => {
    setSelectedProductOption({ [optionName]: value });
    setShowError(false);
  };

  const handleAdd = () => {
    const missing = groups.filter((g) => !selected[g.key]);
    const hasProductOptions = product?.productOptions?.length > 0;
    const productOptionMissing = hasProductOptions && Object.keys(selectedProductOption).length === 0;
    
    if (missing.length > 0 || productOptionMissing) {
      setShowError(true);
      return;
    }
    onConfirm({ ...selected, productOption: selectedProductOption });
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

      {/* Price Display */}
      <div style={styles.priceBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={styles.currentPrice}>₹{activePrice.toLocaleString("en-IN")}</span>
          {activeOldPrice > activePrice && (
            <>
              <span style={styles.oldPrice}>₹{activeOldPrice.toLocaleString("en-IN")}</span>
              <span style={styles.discountBadge}>
                {Math.round(((activeOldPrice - activePrice) / activeOldPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>

      {/* Options (scrollable) */}
      <div style={styles.body}>
        {console.log("[ProductOptionsDialog] Product:", product?.name, "ProductOptions:", product?.productOptions)}
        {/* Product Options with Price */}
        {product?.productOptions?.length > 0 && (
          <>
            {product.productOptions.map((option, optionIndex) => {
              const hasError = showError && Object.keys(selectedProductOption).length === 0;
              const optionName = option.name;
              const selectedValue = selectedProductOption[optionName];

              return (
                <div key={optionIndex} style={{ marginBottom: 18 }}>
                  <div style={styles.groupTitle}>
                    {optionName}
                    {selectedValue && (
                      <span style={styles.selectedText}>: {selectedValue}</span>
                    )}
                    {hasError && <span style={styles.errorText}> — please select</span>}
                  </div>

                  <div style={styles.chipWrap}>
                    {option.values.map((valueObj, valueIndex) => {
                      const active = selectedProductOption[optionName] === valueObj.value;
                      const hasDiscount = valueObj.mrp && valueObj.mrp > valueObj.price;
                      const discount = hasDiscount 
                        ? Math.round(((valueObj.mrp - valueObj.price) / valueObj.mrp) * 100) 
                        : 0;

                      return (
                        <button
                          key={valueIndex}
                          type="button"
                          onClick={() => handleProductOptionSelect(optionName, valueObj.value)}
                          style={{
                            ...styles.priceOptionChip,
                            ...(active ? styles.priceOptionChipActive : {}),
                            ...(hasError && !active ? styles.chipError : {}),
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{valueObj.value}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>₹{valueObj.price}</span>
                              {hasDiscount && (
                                <>
                                  <span style={{
                                    fontSize: 11,
                                    color: active ? "rgba(232,64,64,0.7)" : "rgba(0,0,0,0.4)",
                                    textDecoration: "line-through"
                                  }}>
                                    ₹{valueObj.mrp}
                                  </span>
                                  <span style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: active ? "#e84040" : "#16a34a",
                                    background: active ? "rgba(232,64,64,0.1)" : "#f0fdf4",
                                    padding: "2px 4px",
                                    borderRadius: 3,
                                    border: active ? "none" : "1px solid #bbf7d0"
                                  }}>
                                    {discount}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

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
  priceBar: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 18px",
    background: "linear-gradient(135deg, #fafafa 0%, #f3f3f3 100%)",
    borderBottom: "1px solid #f3f4f6",
    fontFamily: font,
    flexShrink: 0,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.5px",
  },
  oldPrice: {
    fontSize: 15,
    fontWeight: 400,
    color: "rgba(0,0,0,0.3)",
    textDecoration: "line-through",
  },
  discountBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    padding: "3px 8px",
    borderRadius: 5,
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
  priceOptionChip: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "flex-start",
    padding: "10px 12px",
    minWidth: 95,
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontFamily: font,
    transition: "all 0.15s ease",
  },
  priceOptionChipActive: { borderColor: "#e84040", background: "#fff0f0", color: "#e84040" },
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