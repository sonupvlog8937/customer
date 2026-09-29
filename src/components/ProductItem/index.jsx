import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { FaRegHeart } from "react-icons/fa";
import { IoGitCompareOutline } from "react-icons/io5";
import { MdZoomOutMap } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { IoMdHeart } from "react-icons/io";
import { useAppContext } from "../../hooks/useAppContext";
import { postData } from "../../utils/api";
import ProductOptionsDialog from "./ProductOptionsDialog";

/* Image ratio ek jagah se change karo (RN card jaisa chahiye to yahi badlo) */
const IMAGE_RATIO = "1 / 1";

/* ─────────────────────────────────────────────
   Tag / badge logic — image ke niche-left me dikhta hai
───────────────────────────────────────────── */
const getProductTag = (product) => {
  const stock = Number(product?.countInStock || 0);
  const sold = Number(
    product?.soldCount || product?.totalSales || product?.sales || product?.sold || 0,
  );
  const reviews = Number(product?.numReviews || 0);
  const rating = Number(product?.rating || 0);
  const discount = Number(product?.discount || 0);

  if (stock <= 0) return { label: "Out of Stock", key: "oos" };
  if (stock <= 5) return { label: `Only ${stock} Left`, key: "low" };
  if (stock <= 10) return { label: `${stock} Available`, key: "avail" };
  if (sold >= 10) return { label: "Best Seller", key: "best" };
  if (reviews > 0 && rating >= 4.2) return { label: "Top Rated", key: "top" };
  if (discount >= 25) return { label: "Trending", key: "trend" };
  return { label: "Featured", key: "feat" };
};

const inr = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

/* ─────────────────────────────────────────────
   Styles (CSS classes — hover/focus/touch/reduced-motion sab handle)
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

.pi { --brand:#e84040; --brand-2:#ff7a45; --ink:#111827; --muted:#6b7280; --line:#eef0f4;
  font-family:'Sora',sans-serif; position:relative; display:flex; background:#fff;
  border:1px solid var(--line); border-radius:18px; overflow:hidden;
  box-shadow:0 1px 3px rgba(17,24,39,.05),0 6px 20px rgba(17,24,39,.06);
  transition:box-shadow .25s ease, transform .25s ease, border-color .25s ease; }
.pi:hover { transform:translateY(-4px); border-color:#fde1e1;
  box-shadow:0 12px 36px rgba(232,64,64,.14),0 2px 8px rgba(17,24,39,.06); }
.pi--grid { flex-direction:column; }
.pi--list { flex-direction:row; }

/* image */
.pi__media { position:relative; overflow:hidden; background:linear-gradient(135deg,#f6f7fb,#eef0f6); flex-shrink:0; }
.pi--grid .pi__media { width:100%; aspect-ratio:${IMAGE_RATIO}; }
.pi--list .pi__media { width:190px; min-width:190px; }
.pi__link { display:block; width:100%; height:100%; }
.pi__img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s ease; }
.pi__img--alt { position:absolute; inset:0; opacity:0; transition:opacity .4s ease, transform .5s ease; }
.pi:hover .pi__img { transform:scale(1.06); }
.pi:hover .pi__img--alt { opacity:1; }

/* badge — image ke bottom-left (transparent / glass) */
.pi__badges { position:absolute; left:10px; bottom:10px; z-index:5; display:flex; gap:6px; max-width:calc(100% - 20px); }
.pi__badge { display:inline-flex; align-items:center; gap:5px; color:#fff; font-size:10.5px; font-weight:700;
  letter-spacing:.03em; padding:5px 10px; border-radius:999px; white-space:nowrap;
  background:rgba(0,0,0,.28); border:1px solid rgba(255,255,255,.45);
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
  text-shadow:0 1px 2px rgba(0,0,0,.35); }
.pi__badge::before { content:""; width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.9); }

/* out of stock */
.pi--oos .pi__img { filter:grayscale(.85); opacity:.75; }

/* hover actions */
.pi__actions { position:absolute; top:10px; right:10px; z-index:6; display:flex; flex-direction:column; gap:6px;
  opacity:0; transform:translateX(8px); transition:opacity .22s ease, transform .22s ease; }
.pi:hover .pi__actions, .pi:focus-within .pi__actions { opacity:1; transform:none; }
@media (hover:none) { .pi__actions { opacity:1; transform:none; } }
.pi__action { width:34px; height:34px; border-radius:50%; border:none; cursor:pointer; background:rgba(255,255,255,.95);
  color:#222; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,.14);
  transition:background .18s, color .18s, transform .15s; }
.pi__action:hover { background:#fff0f0; color:var(--brand); transform:scale(1.1); }
.pi__action--on { background:#fff0f0; color:var(--brand); }

/* body */
.pi__body { display:flex; flex-direction:column; gap:6px; padding:13px 14px 15px; flex:1; min-width:0; }
.pi--list .pi__body { padding:18px 20px; justify-content:space-between; }
.pi__brand { font-size:10.5px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.07em;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* title — sirf 1 line, phir ... */
.pi__title { display:block; max-width:100%; font-size:13.5px; font-weight:600; color:var(--ink); line-height:1.45;
  text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:color .18s; }
.pi__title:hover { color:var(--brand); }
.pi--list .pi__title { font-size:15px; }
.pi__desc { margin:0; font-size:13px; color:var(--muted); line-height:1.55; display:-webkit-box;
  -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

/* rating */
.pi__rating { display:flex; align-items:center; gap:5px; min-height:20px; }
.pi__rating-chip { background:linear-gradient(135deg,#22c55e,#15803d); color:#fff; font-size:11px; font-weight:700;
  border-radius:6px; padding:2px 7px; line-height:1.3; }
.pi__rating-count { font-size:11px; color:#9ca3af; font-weight:500; }

/* price */
.pi__foot { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:auto;
  padding-top:10px; border-top:1px dashed var(--line); }
.pi__prices { display:flex; align-items:baseline; gap:7px; flex-wrap:wrap; min-width:0; }
.pi__price { font-size:16px; font-weight:700; color:var(--brand); }
.pi__old { font-size:12px; color:#b6bcc8; text-decoration:line-through; font-weight:500; }
.pi__save { font-size:10.5px; font-weight:700; color:#15803d; background:#dcfce7; padding:2px 7px; border-radius:999px; white-space:nowrap; }

/* add button */
.pi__add { display:flex; align-items:center; justify-content:center; gap:5px; border:none; cursor:pointer;
  color:#fff; font:700 12px 'Sora',sans-serif; padding:9px 14px; border-radius:10px;
  background:linear-gradient(135deg,var(--brand),var(--brand-2)); box-shadow:0 4px 12px rgba(232,64,64,.28);
  transition:transform .18s, box-shadow .18s, filter .18s; }
.pi--grid .pi__add { width:100%; margin-top:8px; }
.pi__add:hover:not(:disabled) { transform:translateY(-1px); filter:brightness(1.05); box-shadow:0 8px 18px rgba(232,64,64,.35); }
.pi__add:disabled { background:#d1d5db; box-shadow:none; cursor:not-allowed; opacity:.7; }

.pi__link:focus-visible, .pi__title:focus-visible, .pi__action:focus-visible, .pi__add:focus-visible {
  outline:2px solid var(--brand); outline-offset:2px; }

@media (max-width:520px) {
  .pi--list { flex-direction:column; }
  .pi--list .pi__media { width:100%; min-width:0; aspect-ratio:${IMAGE_RATIO}; }
}
@media (prefers-reduced-motion:reduce) {
  .pi, .pi *, .pi__img { transition:none !important; }
  .pi:hover { transform:none; }
}
`;

/* ─────────────────────────────────────────────
   Shared logic (grid + list dono use karte hain)
───────────────────────────────────────────── */
const OPTION_KEYS = ["size", "weight", "RAM", "colorOptions", "productOptions"];

const useProductCard = (item) => {
  const context = useAppContext();
  const location = useLocation();
  const [inWishlist, setInWishlist] = useState(false);
  const [adding, setAdding] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const tag = useMemo(() => getProductTag(item), [item]);
  const isOutOfStock = tag.key === "oos";
  const hasOptions = OPTION_KEYS.some((k) => {
    if (k === "productOptions") {
      return Array.isArray(item?.productOptions) && item.productOptions.length > 0;
    }
    return Array.isArray(item?.[k]) && item[k].length > 0;
  });

  const url = `/product/${item?._id}${location.pathname === "/search" ? location.search : ""}`;

  useEffect(() => {
    const found = context?.myListData?.some((x) => String(x.productId).includes(item?._id));
    setInWishlist(!!found);
  }, [context?.myListData, item?._id]);

  const toggleWishlist = useCallback(() => {
    if (!context?.userData) {
      context?.alertBox("error", "Please login to add items to your wishlist");
      return;
    }
    postData("/api/myList/add", {
      productId: item?._id,
      userId: context?.userData?._id,
      productTitle: item?.name,
      image: item?.images?.[0],
      rating: item?.rating,
      price: item?.price,
      oldPrice: item?.oldPrice,
      brand: item?.brand,
      discount: item?.discount,
    }).then((res) => {
      if (res?.error === false) {
        context?.alertBox("success", res?.message);
        setInWishlist(true);
        context?.getMyListData();
      } else {
        context?.alertBox("error", res?.message);
      }
    });
  }, [context, item]);

  const addToCart = useCallback(
    async (selected = {}) => {
      setAdding(true);
      
      // Calculate price based on selected product option
      let finalPrice = item?.price || 0;
      let finalOldPrice = item?.oldPrice || 0;
      
      if (selected.productOption && Object.keys(selected.productOption).length > 0) {
        const optionName = Object.keys(selected.productOption)[0];
        const selectedValue = selected.productOption[optionName];
        const option = item?.productOptions?.find(opt => opt.name === optionName);
        if (option) {
          const valueObj = option.values.find(v => v.value === selectedValue);
          if (valueObj?.price) {
            finalPrice = Number(valueObj.price);
            finalOldPrice = valueObj.mrp && Number(valueObj.mrp) > 0 ? Number(valueObj.mrp) : finalPrice;
          }
        }
      }
      
      try {
        // Get selected product option details
        let selectedOptionData = null;
        if (selected.productOption && Object.keys(selected.productOption).length > 0) {
          const optionName = Object.keys(selected.productOption)[0];
          const selectedValue = selected.productOption[optionName];
          selectedOptionData = {
            optionName,
            optionValue: selectedValue
          };
        }

        const res = await postData("/api/cart/add", {
          productId: item?._id,
          productTitle: item?.name,
          image: item?.images?.[0],
          rating: item?.rating,
          price: finalPrice,
          oldPrice: finalOldPrice,
          quantity: 1,
          subTotal: Math.round(finalPrice),
          countInStock: item?.countInStock,
          brand: item?.brand,
          discount: item?.discount,
          // backend field names apne schema ke hisab se adjust karo
          size: selected.size || "",
          weight: selected.weight || "",
          ram: selected.ram || "",
          color: selected.color || "",
          productOption: selectedOptionData || undefined
        });
        if (res?.error === false) {
          context?.alertBox("success", "Added to cart");
          context?.getCartItems();
          setOptionsOpen(false);
        } else {
          context?.alertBox("error", res?.message || "Failed to add to cart");
        }
      } catch {
        context?.alertBox("error", "Failed to add to cart");
      } finally {
        setAdding(false);
      }
    },
    [context, item],
  );

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return context?.alertBox("error", "Product is out of stock");
    if (!context?.userData) return context?.alertBox("error", "Please login to add items to cart");
    if (hasOptions) return setOptionsOpen(true);
    addToCart();
  };

  return {
    context, url, tag, isOutOfStock, inWishlist, adding,
    optionsOpen, setOptionsOpen, toggleWishlist, addToCart, handleAdd,
  };
};

/* ─────────────────────────────────────────────
   Small building blocks
───────────────────────────────────────────── */
const Media = ({ item, url, tag, isOutOfStock, inWishlist, onWishlist, onQuickView }) => (
  <div className="pi__media">
    <Link to={url} state={{ product: item }} className="pi__link" aria-label={item?.name}>
      <img className="pi__img" src={item?.images?.[0]} alt={item?.name || "Product"} loading="lazy" />
      {item?.images?.length > 1 && (
        <img className="pi__img pi__img--alt" src={item.images[1]} alt="" loading="lazy" />
      )}
    </Link>

    {/* <div className="pi__actions">
      <button type="button" className="pi__action" title="Quick View" aria-label="Quick view" onClick={onQuickView}>
        <MdZoomOutMap size={15} />
      </button>
      <button type="button" className="pi__action" title="Compare" aria-label="Compare">
        <IoGitCompareOutline size={15} />
      </button>
      <button
        type="button"
        className={`pi__action ${inWishlist ? "pi__action--on" : ""}`}
        title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
        aria-label={inWishlist ? "In wishlist" : "Add to wishlist"}
        aria-pressed={inWishlist}
        onClick={onWishlist}
      >
        {inWishlist ? <IoMdHeart size={15} /> : <FaRegHeart size={13} />}
      </button>
    </div> */}

    {/* Badge: image ke niche-left (transparent) */}
    <div className="pi__badges">
      <span className={`pi__badge pi__badge--${tag.key}`}>{tag.label}</span>
    </div>
  </div>
);

const RatingRow = ({ item }) => {
  const reviews = Number(item?.numReviews || 0);
  const value = Number(item?.rating || 0);
  if (reviews <= 0 || value <= 0) {
    return <div className="pi__rating"><span className="pi__rating-count">No ratings yet</span></div>;
  }
  return (
    <div className="pi__rating">
      <span className="pi__rating-chip">{Number.isInteger(value) ? value : value.toFixed(1)} ★</span>
      <Rating value={value} size="small" precision={0.1} readOnly sx={{ fontSize: "13px" }} />
      <span className="pi__rating-count">({reviews})</span>
    </div>
  );
};

/* Selling price + MRP + discount (right side) */
const Prices = ({ item }) => (
  <div className="pi__prices">
    <span className="pi__price">{inr(item?.price)}</span>
    {item?.oldPrice > item?.price && <span className="pi__old">{inr(item.oldPrice)}</span>}
    {item?.discount > 0 && <span className="pi__save">{item.discount}% OFF</span>}
  </div>
);

/* ─────────────────────────────────────────────
   GRID CARD — default export
───────────────────────────────────────────── */
const ProductItem = ({ item }) => {
  const p = useProductCard(item);

  return (
    <>
      <style>{CSS}</style>

      <article className={`pi pi--grid ${p.isOutOfStock ? "pi--oos" : ""}`}>
        <Media
          item={item}
          url={p.url}
          tag={p.tag}
          isOutOfStock={p.isOutOfStock}
          inWishlist={p.inWishlist}
          onWishlist={p.toggleWishlist}
          onQuickView={() => p.context?.handleOpenProductDetailsModal(true, item)}
        />

        <div className="pi__body">
          {item?.brand && <span className="pi__brand">{item.brand}</span>}

          <Link to={p.url} state={{ product: item }} className="pi__title" title={item?.name}>
            {item?.name}
          </Link>

          <RatingRow item={item} />
          <Prices item={item} />

          <button
            type="button"
            className="pi__add"
            onClick={p.handleAdd}
            disabled={p.isOutOfStock || p.adding}
          >
            {p.adding && !p.optionsOpen ? "Adding..." : (<><FiPlus size={14} /><span>Add</span></>)}
          </button>
        </div>
      </article>

      <ProductOptionsDialog
        open={p.optionsOpen}
        onClose={() => p.setOptionsOpen(false)}
        product={item}
        loading={p.adding}
        onConfirm={(selected) => p.addToCart(selected)}
      />
    </>
  );
};

export default ProductItem;

/* ─────────────────────────────────────────────
   LIST VIEW — ProductItemList
───────────────────────────────────────────── */
export const ProductItemList = ({ item }) => {
  const p = useProductCard(item);

  return (
    <>
      <style>{CSS}</style>

      <article className={`pi pi--list ${p.isOutOfStock ? "pi--oos" : ""}`}>
        <Media
          item={item}
          url={p.url}
          tag={p.tag}
          isOutOfStock={p.isOutOfStock}
          inWishlist={p.inWishlist}
          onWishlist={p.toggleWishlist}
          onQuickView={() => p.context?.handleOpenProductDetailsModal(true, item)}
        />

        <div className="pi__body">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            {item?.brand && <span className="pi__brand">{item.brand}</span>}
            <Link to={p.url} state={{ product: item }} className="pi__title" title={item?.name}>
              {item?.name}
            </Link>
            {item?.description && <p className="pi__desc">{item.description}</p>}
            <RatingRow item={item} />
          </div>

          <div className="pi__foot">
            <Prices item={item} />
            <button
              type="button"
              className="pi__add"
              onClick={p.handleAdd}
              disabled={p.isOutOfStock || p.adding}
            >
              {p.adding && !p.optionsOpen ? "Adding..." : (<><FiPlus size={14} /><span>Add</span></>)}
            </button>
          </div>
        </div>
      </article>

      <ProductOptionsDialog
        open={p.optionsOpen}
        onClose={() => p.setOptionsOpen(false)}
        product={item}
        loading={p.adding}
        onConfirm={(selected) => p.addToCart(selected)}
      />
    </>
  );
};