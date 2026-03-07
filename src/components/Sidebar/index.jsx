import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import "../Sidebar/style.css";
import { Collapse } from "react-collapse";
import { FaAngleDown, FaAngleRight, FaAngleUp } from "react-icons/fa6";
import RangeSlider from "react-range-slider-input";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import "react-range-slider-input/dist/style.css";
import Rating from "@mui/material/Rating";
import { useAppContext } from "../../hooks/useAppContext";
import { useLocation } from "react-router-dom";
import { postData } from "../../utils/api";
import { MdOutlineFilterAlt, MdClose, MdTune, MdRefresh } from "react-icons/md";

/* ═══════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  .sb-root { font-family:'DM Sans',sans-serif; }
  .sb-root * { box-sizing:border-box; font-family:'DM Sans',sans-serif; }

  .sb-box { border-bottom:1px solid #f0f0f5; padding:14px 0; }
  .sb-box:last-child { border-bottom:none; }

  .sb-head { display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding:0 4px 0 0; gap:8px; -webkit-tap-highlight-color:transparent; user-select:none; }
  .sb-head-title { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#374151; }
  .sb-head-arrow { width:24px; height:24px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9ca3af; flex-shrink:0; transition:all 0.2s ease; background:#f8f8fb; }
  .sb-head:hover .sb-head-arrow { background:#f0f0f5; color:#374151; }

  .sb-root .MuiFormControlLabel-root { margin:0 !important; width:100%; }
  .sb-root .MuiFormControlLabel-label { font-size:13px !important; font-weight:500 !important; color:#374151 !important; font-family:'DM Sans',sans-serif !important; line-height:1.4 !important; }
  .sb-root .MuiCheckbox-root { padding:5px 8px 5px 4px !important; color:#d1d5db !important; }
  .sb-root .MuiCheckbox-root.Mui-checked { color:#0d0d12 !important; }
  .sb-root .MuiFormControlLabel-root:hover .MuiFormControlLabel-label { color:#0d0d12 !important; }

  .sb-cat-row { display:flex; align-items:center; gap:2px; border-radius:8px; transition:background 0.15s; padding:1px 2px; }
  .sb-cat-row:hover { background:#f7f7fb; }
  .sb-cat-btn { text-align:left; font-size:13px; font-weight:500; color:#6b7280; background:none; border:none; cursor:pointer; padding:5px 2px; line-height:1.4; font-family:'DM Sans',sans-serif; transition:color 0.15s ease; flex:1; -webkit-tap-highlight-color:transparent; }
  .sb-cat-btn:hover { color:#0d0d12; }
  .sb-cat-btn.active { color:#0d0d12; font-weight:700; }
  .sb-cat-expand { width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#9ca3af; flex-shrink:0; transition:all 0.18s ease; -webkit-tap-highlight-color:transparent; }
  .sb-cat-expand:hover { background:#e8e8f0; color:#374151; }
  .sb-cat-expand.open { color:#0d0d12; background:#ebebf5; }
  .sb-subcat-wrap { border-left:2px solid #f0f0f5; margin-left:10px; padding-left:8px; margin-top:2px; overflow:hidden; }
  .sb-selected-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#E8362A; margin-left:6px; vertical-align:middle; }

  .sb-color-option { display:flex; align-items:center; gap:8px; padding:2px 0; }
  .sb-color-swatch { width:16px; height:16px; border-radius:50%; border:1.5px solid rgba(0,0,0,0.12); flex-shrink:0; }

  .sb-price-values { display:flex; align-items:center; justify-content:space-between; margin-top:14px; }
  .sb-price-val { background:#f8f8fb; border:1px solid #e8e8f0; border-radius:8px; padding:4px 10px; font-size:12px; font-weight:700; color:#0d0d12; }
  .sb-price-divider { font-size:11px; color:#9ca3af; }

  .sb-root .range-slider { height:4px !important; }
  .sb-root .range-slider .range-slider__thumb { width:18px !important; height:18px !important; background:#0d0d12 !important; border:2px solid #fff !important; box-shadow:0 2px 8px rgba(0,0,0,0.2) !important; }
  .sb-root .range-slider .range-slider__range { background:#0d0d12 !important; }

  .sb-rating-row { display:flex; align-items:center; gap:4px; padding:2px 0; cursor:pointer; }

  .sb-more-btn { display:inline-flex; align-items:center; gap:4px; margin-top:4px; padding:3px 0; font-size:12px; font-weight:600; color:#2563eb; background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:color 0.15s ease; -webkit-tap-highlight-color:transparent; }
  .sb-more-btn:hover { color:#1d4ed8; }

  .sb-actions { display:flex; gap:8px; padding:14px 0 8px; border-top:1px solid #f0f0f5; margin-top:4px; }

  .sb-apply-btn { flex:1; height:40px; border-radius:10px; background:#0d0d12; color:#fff; border:none; cursor:pointer; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.18s ease; -webkit-tap-highlight-color:transparent; }
  .sb-apply-btn:hover { background:#1d1d28; transform:translateY(-1px); box-shadow:0 4px 14px rgba(13,13,18,0.2); }
  .sb-apply-btn .sb-count { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; padding:0 5px; background:rgba(255,255,255,0.2); border-radius:20px; font-size:11px; font-weight:800; }

  .sb-reset-btn { height:40px; padding:0 14px; border-radius:10px; background:#fff; color:#374151; border:1.5px solid #e8e8f0; cursor:pointer; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; display:flex; align-items:center; gap:5px; transition:all 0.18s ease; -webkit-tap-highlight-color:transparent; }
  .sb-reset-btn:hover { border-color:#E8362A; color:#E8362A; }

  .sb-cancel-btn { width:100%; height:38px; border-radius:10px; background:#f8f8fb; color:#374151; border:1.5px solid #e8e8f0; cursor:pointer; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:5px; margin-top:6px; transition:all 0.18s ease; -webkit-tap-highlight-color:transparent; }
  .sb-cancel-btn:hover { background:#f0f0f5; }

  .sb-total-badge { display:flex; align-items:center; gap:8px; padding:10px 12px; background:linear-gradient(135deg,#0d0d12,#1a1a2e); border-radius:12px; margin-bottom:16px; }
  .sb-total-num { font-size:22px; font-weight:800; color:#fff; font-family:'Syne',sans-serif; line-height:1; }
  .sb-total-label { font-size:11px; color:rgba(255,255,255,0.5); font-weight:500; line-height:1.3; }
  .sb-total-dot { width:8px; height:8px; border-radius:50%; background:#E8362A; flex-shrink:0; margin-left:auto; animation:sb-pulse 1.4s ease infinite; }
  @keyframes sb-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

  .sb-dialog .MuiDialog-paper { border-radius:16px !important; }
  .sb-dialog .MuiDialogTitle-root { font-family:'Syne',sans-serif !important; font-size:17px !important; font-weight:800 !important; padding:20px 24px 12px !important; color:#0d0d12 !important; }
  .sb-dialog-apply { height:40px; padding:0 24px; border-radius:10px; background:#0d0d12; color:#fff; border:none; cursor:pointer; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; transition:all 0.17s ease; }
  .sb-dialog-apply:hover { background:#1d1d28; }
  .sb-dialog-cancel { height:40px; padding:0 16px; border-radius:10px; background:#f8f8fb; color:#374151; border:1.5px solid #e8e8f0; cursor:pointer; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; transition:all 0.17s ease; }
  .sb-dialog-cancel:hover { border-color:#374151; }
`;

/* ── Collapsible Section ── */
const Section = ({ title, open, onToggle, children }) => (
  <div className="sb-box">
    <div className="sb-head" onClick={onToggle} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onToggle()}>
      <span className="sb-head-title">{title}</span>
      <span className="sb-head-arrow">{open ? <FaAngleUp size={11} /> : <FaAngleDown size={11} />}</span>
    </div>
    <Collapse isOpened={open}>
      <div style={{ paddingTop: 10 }}>{children}</div>
    </Collapse>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR COMPONENT
═══════════════════════════════════════════════════════════════ */
export const Sidebar = (props) => {
  /* ── Section toggles ── */
  const [openSections, setOpenSections] = useState({
    category: true, brand: true, size: true, type: true,
    price: true, sale: false, color: true, stock: false,
    discount: false, weight: false, ram: false, rating: true,
  });
  const toggleSection = (k) => setOpenSections(p => ({ ...p, [k]: !p[k] }));

  /* ── Stable filter options (populated once on first load) ── */
  const [stableOptions,   setStableOptions]   = useState({ brands: [], sizes: [], productTypes: [], weights: [], ramOptions: [] });
  const [availableColors, setAvailableColors] = useState([]);
  const [expandedCatIds,  setExpandedCatIds]  = useState([]);

  /* ── Internal state only for: catId, subCatId, thirdsubCatId, rating, colors, price ──
     These are NOT in the parent's URL-driven filter state, so Sidebar owns them.
     All other filters (brand, size, etc.) come from props and go to URL via setters. */
  const [internalCat, setInternalCat] = useState({ catId: [], subCatId: [], thirdsubCatId: [] });
  const [internalRating, setInternalRating] = useState([]);
  const [internalColors, setInternalColors] = useState([]);
  const [price, setPrice] = useState([0, 60000]);

  const [activeMoreFilter,     setActiveMoreFilter]     = useState(null);
  const [moreFilterSelections, setMoreFilterSelections] = useState([]);

  const context  = useAppContext();
  const location = useLocation();

  /* ═══════════════════════════════════════════════════════════
     FETCH — uses a ref so it NEVER has a stale closure.
     Every time ANY dependency changes, the ref is updated
     before the debounced fetch reads it.
  ═══════════════════════════════════════════════════════════ */
  const timerRef    = useRef(null);
  const latestRef   = useRef({});

  /* Update ref every render — no deps needed */
  latestRef.current = {
    props,
    internalCat,
    internalRating,
    internalColors,
    price,
  };

  const fetchProducts = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const { props: p, internalCat: cat, internalRating: rat, internalColors: col, price: pr } = latestRef.current;

      p.setIsLoading(true);

      const payload = {
        /* Category filters — managed internally */
        catId:          cat.catId,
        subCatId:       cat.subCatId,
        thirdsubCatId:  cat.thirdsubCatId,
        rating:         rat,
        colors:         col,
        minPrice:       pr[0],
        maxPrice:       pr[1],

        /* All other filters — come from props (URL-driven) */
        brands:         p.selectedBrands        || [],
        sizes:          p.selectedSizes          || [],
        productTypes:   p.selectedProductTypes   || [],
        priceRanges:    p.selectedPriceRanges    || [],
        saleOnly:       p.selectedSaleOnly       || false,
        stockStatus:    p.selectedStockStatus    || "all",
        discountRanges: p.selectedDiscountRanges || [],
        weights:        p.selectedWeights        || [],
        ramOptions:     p.selectedRamOptions     || [],
        ratingBands:    p.selectedRatingBands    || [],
        sortType:       p.selectedSortType       || "bestseller",
        query:          p.searchQuery            || "",

        /* ✅ Page — always fresh from props (URL-driven) */
        page:  p.page ?? 1,
        limit: 25,
      };

      const apiUrl = p.searchQuery ? `/api/product/search/get` : `/api/product/filters`;

      postData(apiUrl, payload)
        .then((res) => {
          p.setProductsData(res);
          p.setIsLoading(false);
          p.setTotalPages(res?.totalPages || 1);
          if (p.setTotalProducts) {
            p.setTotalProducts(res?.totalProducts || res?.total || 0);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(() => p.setIsLoading(false));
    }, 150);
  }, []); // ✅ empty deps — reads from ref, NEVER stale

  /* ═══════════════════════════════════════════════════════════
     TRIGGER — fire fetch whenever anything changes.
     
     KEY INSIGHT:
     - props.page changes   → goToPage() was called → URL changed →
       SearchPage re-renders → new page prop → this effect fires →
       fetchProducts() reads fresh page from ref ✅
     
     - filter changes       → setSelectedX() → URL changes →
       SearchPage re-renders → new filter props → this effect fires →
       fetchProducts() reads fresh filters from ref ✅
     
     - reset button clicked → handleResetAllFilters() → URL cleared →
       all filter props become [] → this effect fires → fetch with
       empty filters ✅
  ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    fetchProducts();
  }, [
    /* Page — most critical. Must be here so next page fetch works */
    props.page,

    /* All URL-driven external filters */
    props.selectedBrands,
    props.selectedSizes,
    props.selectedProductTypes,
    props.selectedPriceRanges,
    props.selectedSaleOnly,
    props.selectedStockStatus,
    props.selectedDiscountRanges,
    props.selectedWeights,
    props.selectedRamOptions,
    props.selectedRatingBands,
    props.selectedSortType,
    props.searchQuery,

    /* Internal sidebar state */
    internalCat,
    internalRating,
    internalColors,
    price,

    fetchProducts, // stable ref
  ]);

  /* ── Sync catId from URL on location change ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url    = location.search;

    setInternalCat(() => {
      if (url.includes("catId"))           return { catId: [params.get("catId")].filter(Boolean), subCatId: [], thirdsubCatId: [] };
      if (url.includes("subCatId"))        return { catId: [], subCatId: [params.get("subCatId")].filter(Boolean), thirdsubCatId: [] };
      if (url.includes("thirdLavelCatId")) return { catId: [], subCatId: [], thirdsubCatId: [params.get("thirdLavelCatId")].filter(Boolean) };
      return prev => prev;
    });

    context?.setSearchData?.([]);
  }, [location.search]);

  /* ── Populate stable filter options once on first load ── */
  useEffect(() => {
    const products      = props?.productsData?.products     || [];
    const filterOptions = props?.productsData?.filterOptions || {};
    if (products.length === 0 && Object.keys(filterOptions).length === 0) return;

    setStableOptions(prev => {
      if (prev.brands.length > 0 || prev.sizes.length > 0) return prev; // already populated

      const brands = Array.isArray(filterOptions.brands) && filterOptions.brands.length > 0
        ? filterOptions.brands
        : [...new Set(products.map(p => p?.brand?.trim()).filter(Boolean))];

      const sizeSet = new Set();
      (filterOptions.sizes?.length ? filterOptions.sizes : [])
        .forEach(s => sizeSet.add(s));
      products.forEach(p => (p?.size || []).forEach(s => s && sizeSet.add(s)));

      const typeSet = new Set();
      (filterOptions.productTypes?.length ? filterOptions.productTypes : [])
        .forEach(t => typeSet.add(t));
      products.forEach(p => { const t = p?.productType || p?.thirdSubCatName || p?.subCatName || p?.catName; if (t) typeSet.add(t); });

      const weightSet = new Set();
      (filterOptions.weights?.length ? filterOptions.weights : [])
        .forEach(w => weightSet.add(w));
      products.forEach(p => (p?.productWeight || []).forEach(w => w && weightSet.add(w)));

      const ramSet = new Set();
      (filterOptions.ramOptions?.length ? filterOptions.ramOptions : [])
        .forEach(r => ramSet.add(r));
      products.forEach(p => (p?.productRam || []).forEach(r => r && ramSet.add(r)));

      const colorMap = new Map();
      if (filterOptions.colors?.length) {
        filterOptions.colors.forEach(name => colorMap.set(name, ""));
      } else {
        products.forEach(p => (p?.colorOptions || []).forEach(c => { if (c?.name && !colorMap.has(c.name)) colorMap.set(c.name, c.code || ""); }));
      }
      const colors = Array.from(colorMap, ([name, code]) => ({ name, code }));
      setAvailableColors(colors);

      return { brands, sizes: Array.from(sizeSet), productTypes: Array.from(typeSet), weights: Array.from(weightSet), ramOptions: Array.from(ramSet) };
    });
  }, [props?.productsData]);

  /* ═══════════════════════════════════════════════════════════
     HANDLERS
  ═══════════════════════════════════════════════════════════ */
  const totalProducts = props?.productsData?.totalProducts || props?.productsData?.total || 0;

  const discountBands = useMemo(() => [
    { label: "10% & above", min: 10 },
    { label: "25% & above", min: 25 },
    { label: "40% & above", min: 40 },
    { label: "60% & above", min: 60 },
  ], []);

  const handleMultiSelect = useCallback((selectedValues, setFn, value) => {
    if (typeof setFn !== "function") return;
    const updated = selectedValues.includes(value)
      ? selectedValues.filter(x => x !== value)
      : [...selectedValues, value];
    setFn(updated);
  }, []);

  const handleCategorySelect = useCallback(({ level, categoryId }) => {
    if (!categoryId) return;
    context?.setSearchData?.([]);
    if (level === 0) setInternalCat({ catId: [categoryId], subCatId: [], thirdsubCatId: [] });
    else if (level === 1) setInternalCat({ catId: [], subCatId: [categoryId], thirdsubCatId: [] });
    else setInternalCat({ catId: [], subCatId: [], thirdsubCatId: [categoryId] });
  }, [context]);

  const toggleCatExpand = useCallback((id) => {
    if (!id) return;
    setExpandedCatIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }, []);

  /* ── Reset: clears both URL-driven (via parent callback) and internal state ── */
  const handleResetFilters = useCallback(() => {
    /* Reset internal state */
    setInternalCat({ catId: [], subCatId: [], thirdsubCatId: [] });
    setInternalRating([]);
    setInternalColors([]);
    setPrice([0, 60000]);
    /* Reset URL-driven filters via parent */
    props?.onResetAllFilters?.();
    context?.setOpenFilter?.(false);
  }, [props, context]);

  const handleApplyFilters = useCallback(() => {
    context?.setOpenFilter?.(false);
  }, [context]);

  /* More filter modal */
  const openMore  = (cfg) => { setActiveMoreFilter(cfg); setMoreFilterSelections(cfg?.selectedValues || []); };
  const closeMore = ()    => { setActiveMoreFilter(null); setMoreFilterSelections([]); };
  const toggleMoreSel = (k) => setMoreFilterSelections(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  const applyMoreSel  = ()  => { activeMoreFilter?.onApplySelection?.(moreFilterSelections); closeMore(); context?.setOpenFilter?.(false); };

  /* ── Render category tree with collapse ── */
  const renderCategoryTree = (categories = [], level = 0) => {
    if (!Array.isArray(categories) || categories.length === 0) return null;
    return categories.map(cat => {
      const hasChildren = (cat?.children || []).length > 0;
      const isExpanded  = expandedCatIds.includes(cat?._id);
      const isSelected  =
        (level === 0 && internalCat.catId?.includes(cat?._id)) ||
        (level === 1 && internalCat.subCatId?.includes(cat?._id)) ||
        (level >= 2 && internalCat.thirdsubCatId?.includes(cat?._id));

      return (
        <div key={cat?._id} style={{ paddingLeft: level > 0 ? 0 : 0 }}>
          <div className={`sb-cat-row${isSelected ? " selected" : ""}`}>
            {/* Checkbox select */}
            <Checkbox
              size="small"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  if (level === 0) setInternalCat(p => ({ ...p, catId: [] }));
                  else if (level === 1) setInternalCat(p => ({ ...p, subCatId: [] }));
                  else setInternalCat(p => ({ ...p, thirdsubCatId: [] }));
                } else {
                  handleCategorySelect({ level, categoryId: cat?._id });
                  if (hasChildren && !isExpanded) toggleCatExpand(cat?._id);
                }
              }}
              style={{ padding: "3px 5px 3px 0", color: isSelected ? "#0d0d12" : "#d1d5db", flexShrink: 0 }}
            />

            {/* Category name */}
            <button
              className={`sb-cat-btn${isSelected ? " active" : ""}`}
              onClick={() => {
                if (isSelected) {
                  if (level === 0) setInternalCat(p => ({ ...p, catId: [] }));
                  else if (level === 1) setInternalCat(p => ({ ...p, subCatId: [] }));
                  else setInternalCat(p => ({ ...p, thirdsubCatId: [] }));
                } else {
                  handleCategorySelect({ level, categoryId: cat?._id });
                  if (hasChildren && !isExpanded) toggleCatExpand(cat?._id);
                }
              }}
            >
              {cat?.name}
              {isSelected && <span className="sb-selected-dot" />}
            </button>

            {/* Expand/collapse toggle — right side */}
            {hasChildren ? (
              <button
                className={`sb-cat-expand${isExpanded ? " open" : ""}`}
                onClick={() => toggleCatExpand(cat?._id)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <FaAngleDown size={10} /> : <FaAngleRight size={10} />}
              </button>
            ) : (
              <span style={{ width: 22, flexShrink: 0 }} />
            )}
          </div>

          {/* Children — collapsible */}
          {hasChildren && (
            <Collapse isOpened={isExpanded}>
              <div className="sb-subcat-wrap">
                {renderCategoryTree(cat?.children, level + 1)}
              </div>
            </Collapse>
          )}
        </div>
      );
    });
  };

  /* ── Render limited options with "more" button ── */
  const renderOptions = ({ title, options = [], selectedValues = [], onToggle, onApplySelection, getOptionKey, getOptionLabel, limit = 6 }) => {
    const visible = options.slice(0, limit);
    const hasMore = options.length > limit;
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {visible.map(opt => {
            const key = getOptionKey(opt);
            return (
              <FormControlLabel
                key={key}
                control={<Checkbox size="small" />}
                checked={selectedValues.includes(key)}
                onChange={() => onToggle(opt)}
                label={getOptionLabel(opt)}
              />
            );
          })}
        </div>
        {hasMore && (
          <button className="sb-more-btn"
            onClick={() => openMore({ title, options, selectedValues, onApplySelection, getOptionKey, getOptionLabel })}>
            +{options.length - limit} more
          </button>
        )}
      </>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <aside className="sb-root sidebar py-3 lg:py-5 static lg:sticky top-[130px] z-[50] pr-0 lg:pr-4">
      <style>{CSS}</style>

      {/* Total products badge */}
      {totalProducts > 0 && (
        <div className="sb-total-badge">
          <div>
            <div className="sb-total-num">{totalProducts.toLocaleString("en-IN")}</div>
            <div className="sb-total-label">Total Products<br />across all pages</div>
          </div>
          <div className="sb-total-dot" />
        </div>
      )}

      <div className="sidebarFiltersScroll max-h-[60vh] lg:max-h-[calc(100vh-220px)] overflow-y-auto overflow-x-hidden w-full pr-1">

        {/* Category */}
        <Section title="Category" open={openSections.category} onToggle={() => toggleSection("category")}>
          <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
            {renderCategoryTree(context?.catData || [])}
          </div>
        </Section>

        {/* Brand */}
        {stableOptions.brands.length > 0 && (
          <Section title="Brand" open={openSections.brand} onToggle={() => toggleSection("brand")}>
            {renderOptions({
              title: "Brand", options: stableOptions.brands,
              selectedValues: props.selectedBrands || [],
              onToggle: b => handleMultiSelect(props.selectedBrands, props.setSelectedBrands, b),
              onApplySelection: v => props.setSelectedBrands?.(v),
              getOptionKey: b => b, getOptionLabel: b => b,
            })}
          </Section>
        )}

        {/* Size */}
        {stableOptions.sizes.length > 0 && (
          <Section title="Size" open={openSections.size} onToggle={() => toggleSection("size")}>
            {renderOptions({
              title: "Size", options: stableOptions.sizes,
              selectedValues: props.selectedSizes || [],
              onToggle: s => handleMultiSelect(props.selectedSizes, props.setSelectedSizes, s),
              onApplySelection: v => props.setSelectedSizes?.(v),
              getOptionKey: s => s, getOptionLabel: s => s,
            })}
          </Section>
        )}

        {/* Product Type */}
        {stableOptions.productTypes.length > 0 && (
          <Section title="Product Type" open={openSections.type} onToggle={() => toggleSection("type")}>
            {renderOptions({
              title: "Product Type", options: stableOptions.productTypes,
              selectedValues: props.selectedProductTypes || [],
              onToggle: t => handleMultiSelect(props.selectedProductTypes, props.setSelectedProductTypes, t),
              onApplySelection: v => props.setSelectedProductTypes?.(v),
              getOptionKey: t => t, getOptionLabel: t => t,
            })}
          </Section>
        )}

        {/* Price Slider */}
        <Section title="Price Range" open={openSections.price} onToggle={() => toggleSection("price")}>
          <RangeSlider value={price} onInput={setPrice} min={0} max={60000} step={100} />
          <div className="sb-price-values">
            <span className="sb-price-val">₹{price[0].toLocaleString("en-IN")}</span>
            <span className="sb-price-divider">–</span>
            <span className="sb-price-val">₹{price[1].toLocaleString("en-IN")}</span>
          </div>
        </Section>

        {/* Sale */}
        <Section title="Sale" open={openSections.sale} onToggle={() => toggleSection("sale")}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            checked={!!props.selectedSaleOnly}
            onChange={() => props.setSelectedSaleOnly?.(!props.selectedSaleOnly)}
            label="On Sale"
          />
        </Section>

        {/* Color */}
        {availableColors.length > 0 && (
          <Section title="Colour" open={openSections.color} onToggle={() => toggleSection("color")}>
            {renderOptions({
              title: "Colour", options: availableColors,
              selectedValues: internalColors,
              onToggle: c => setInternalColors(p => p.includes(c?.name) ? p.filter(x => x !== c.name) : [...p, c.name]),
              onApplySelection: v => setInternalColors(v),
              getOptionKey: c => c?.name,
              getOptionLabel: c => (
                <span className="sb-color-option">
                  {c?.code && <span className="sb-color-swatch" style={{ background: c.code }} />}
                  <span>{c?.name}</span>
                </span>
              ),
            })}
          </Section>
        )}

        {/* Stock */}
        <Section title="Availability" open={openSections.stock} onToggle={() => toggleSection("stock")}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            checked={props.selectedStockStatus === "inStock"}
            onChange={() => props.setSelectedStockStatus?.(props.selectedStockStatus === "inStock" ? "all" : "inStock")}
            label="In Stock"
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            checked={props.selectedStockStatus === "outOfStock"}
            onChange={() => props.setSelectedStockStatus?.(props.selectedStockStatus === "outOfStock" ? "all" : "outOfStock")}
            label="Out of Stock"
          />
        </Section>

        {/* Discount */}
        <Section title="Discount" open={openSections.discount} onToggle={() => toggleSection("discount")}>
          {renderOptions({
            title: "Discount", options: discountBands,
            selectedValues: props.selectedDiscountRanges || [],
            onToggle: b => handleMultiSelect(props.selectedDiscountRanges, props.setSelectedDiscountRanges, b.min),
            onApplySelection: v => props.setSelectedDiscountRanges?.(v),
            getOptionKey: b => b.min, getOptionLabel: b => b.label,
          })}
        </Section>

        {/* Weight */}
        {stableOptions.weights.length > 0 && (
          <Section title="Weight" open={openSections.weight} onToggle={() => toggleSection("weight")}>
            {renderOptions({
              title: "Weight", options: stableOptions.weights,
              selectedValues: props.selectedWeights || [],
              onToggle: w => handleMultiSelect(props.selectedWeights, props.setSelectedWeights, w),
              onApplySelection: v => props.setSelectedWeights?.(v),
              getOptionKey: w => w, getOptionLabel: w => w,
            })}
          </Section>
        )}

        {/* RAM */}
        {stableOptions.ramOptions.length > 0 && (
          <Section title="RAM" open={openSections.ram} onToggle={() => toggleSection("ram")}>
            {renderOptions({
              title: "RAM", options: stableOptions.ramOptions,
              selectedValues: props.selectedRamOptions || [],
              onToggle: r => handleMultiSelect(props.selectedRamOptions, props.setSelectedRamOptions, r),
              onApplySelection: v => props.setSelectedRamOptions?.(v),
              getOptionKey: r => r, getOptionLabel: r => r,
            })}
          </Section>
        )}

        {/* Rating */}
        <Section title="Rating" open={openSections.rating} onToggle={() => toggleSection("rating")}>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="sb-rating-row"
              onClick={() => setInternalRating(p => p.includes(star) ? p.filter(x => x !== star) : [...p, star])}>
              <Checkbox
                size="small"
                checked={internalRating.includes(star)}
                onChange={() => {}}
                style={{ padding: "4px 8px 4px 4px", color: internalRating.includes(star) ? "#0d0d12" : "#d1d5db" }}
              />
              <Rating value={star} size="small" readOnly />
              <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4, fontWeight: 500 }}>& up</span>
            </div>
          ))}
        </Section>

      </div>

      {/* Action buttons */}
      <div className="sb-actions">
        <button className="sb-apply-btn" onClick={handleApplyFilters}>
          Apply
          {props.activeFiltersCount > 0 && <span className="sb-count">{props.activeFiltersCount}</span>}
        </button>
        <button className="sb-reset-btn" onClick={handleResetFilters}>
          <MdRefresh size={15} /> Reset
        </button>
      </div>

      {/* Mobile cancel */}
      <button className="sb-cancel-btn lg:!hidden" onClick={() => context?.setOpenFilter?.(false)}>
        <MdOutlineFilterAlt size={16} /> Close Filters
      </button>

      {/* More filter modal */}
      <Dialog open={Boolean(activeMoreFilter)} onClose={closeMore} className="sb-dialog" fullWidth maxWidth="sm">
        <DialogTitle>{activeMoreFilter?.title}</DialogTitle>
        <DialogContent>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>Select and apply filters.</p>
          <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 4, paddingLeft: 4 }}>
            {(activeMoreFilter?.options || []).map(opt => {
              const key = activeMoreFilter?.getOptionKey?.(opt);
              return (
                <FormControlLabel
                  key={key}
                  control={<Checkbox size="small" />}
                  checked={moreFilterSelections.includes(key)}
                  onChange={() => toggleMoreSel(key)}
                  label={activeMoreFilter?.getOptionLabel?.(opt)}
                  style={{ width: "100%" }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16 }}>
            <button className="sb-dialog-cancel" onClick={closeMore}>Cancel</button>
            <button className="sb-dialog-apply" onClick={applyMoreSel}>Apply Filters</button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};