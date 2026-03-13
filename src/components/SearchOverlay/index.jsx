import React, { useState, useEffect, useRef, useCallback } from "react";
import { IoSearch } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { LuClock3, LuX, LuArrowUpRight, LuPackageSearch, LuFlame, LuTrendingUp } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";

const TRENDING_TERMS = ["shirt", "jeans", "t shirts", "bag", "watches", "trouser"];
const POPULAR_TERMS  = ["formal pant", "zara jeans", "formal shirt", "baggy jeans", "black shirt", "white shirt"];
const STORAGE_KEY    = "recent_searches_v2";
const MAX_RECENT     = 6;
const DEBOUNCE_MS    = 280;

const Highlight = ({ text = "", query = "" }) => {
  if (!query.trim()) return <span>{text}</span>;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "gi"));
  return (
    <span>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} style={{ background:"rgba(255,107,43,0.18)", color:"#FF6B2B", borderRadius:3, padding:"0 1px", fontStyle:"normal" }}>{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query,        setQuery]        = useState("");
  const [isFetching,   setIsFetching]   = useState(false);
  const [activeIdx,    setActiveIdx]    = useState(-1);
  const [suggestions,  setSuggestions]  = useState([]);
  const [products,     setProducts]     = useState([]);
  const [correction,   setCorrection]   = useState("");
  const [aiSummary,    setAiSummary]    = useState("");
  const [aiHighlights, setAiHighlights] = useState([]);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").slice(0, MAX_RECENT); }
    catch { return []; }
  });

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debRef   = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(""); setSuggestions([]); setProducts([]);
      setCorrection(""); setAiSummary(""); setAiHighlights([]);
      setActiveIdx(-1);
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const saveRecent = useCallback((term) => {
    if (!term?.trim()) return;
    setRecent(prev => {
      const next = [term, ...prev.filter(s => s !== term)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeRecent = useCallback((term, e) => {
    e.stopPropagation();
    setRecent(prev => {
      const next = prev.filter(s => s !== term);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    clearTimeout(debRef.current);
    abortRef.current?.abort();
    if (query.trim().length < 2) {
      setSuggestions([]); setProducts([]); setCorrection("");
      setAiSummary(""); setAiHighlights([]); setIsFetching(false);
      return;
    }
    setIsFetching(true);
    debRef.current = setTimeout(() => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      postData("/api/product/search/get", { page:1, limit:8, query:query.trim() })
        .then(res => {
          if (ctrl.signal.aborted) return;
          setSuggestions(res?.suggestions || []);
          setProducts(res?.suggestionProducts || res?.products || []);
          setCorrection(res?.correctedQuery || "");
          setAiSummary(res?.aiInsights?.summary || "");
          setAiHighlights((res?.aiInsights?.highlights || []).slice(0, 3));
          setIsFetching(false);
        })
        .catch(err => { if (err?.name !== "AbortError") setIsFetching(false); });
    }, DEBOUNCE_MS);
    return () => { clearTimeout(debRef.current); abortRef.current?.abort(); };
  }, [query]);

  const goSearch = useCallback((term) => {
    if (!term?.trim()) return;
    saveRecent(term);
    onClose();
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  }, [navigate, onClose, saveRecent]);

  const goProduct = useCallback((p) => {
    saveRecent(query || p.name);
    onClose();
    navigate(`/product/${p._id || p.slug}`);
  }, [navigate, onClose, saveRecent, query]);

  const navItems = [
    ...suggestions.slice(0, 5).map(s => ({ type:"s", value:s })),
    ...products.slice(0, 4).map(p => ({ type:"p", product:p }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i+1, navItems.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i-1, -1)); }
    if (e.key === "Enter") {
      const sel = navItems[activeIdx];
      if (sel?.type === "p") goProduct(sel.product);
      else if (sel?.type === "s") goSearch(sel.value);
      else goSearch(query);
    }
  };

  const showDefault = !query.trim();
  const hasLive     = suggestions.length > 0 || products.length > 0 || correction || aiSummary;

  if (!isOpen) return null;

  return (
    <>
      <style>{OVL_STYLES}</style>
      <div className="ovl-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="ovl-panel" role="dialog" aria-modal="true" aria-label="Search">

        {/* Bar */}
        <div className="ovl-bar">
          <div className={`ovl-shell ${query ? "ovl-shell--typed" : ""}`}>
            <div className="ovl-bar-icon">
              {isFetching ? <span className="ovl-spin" /> : <IoSearch size={19} />}
            </div>
            <input
              ref={inputRef} type="text" value={query}
              onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Search products, brands, categories…"
              className="ovl-input" autoComplete="off" spellCheck="false"
            />
            {query && (
              <button className="ovl-clear" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear">
                <IoClose size={17} />
              </button>
            )}
          </div>
          <button className="ovl-cancel" onClick={onClose}>Cancel</button>
        </div>

        {/* Body */}
        <div className="ovl-body">

          {showDefault && (
            <>
              {recent.length > 0 && (
                <div className="ovl-section">
                  <div className="ovl-section-head">
                    <span className="ovl-section-title"><LuClock3 size={11} /> Recent</span>
                    <button className="ovl-text-btn" onClick={() => { setRecent([]); localStorage.removeItem(STORAGE_KEY); }}>Clear all</button>
                  </div>
                  <div className="ovl-chips">
                    {recent.map(t => (
                      <span key={t} className="ovl-chip ovl-chip--recent">
                        <button onClick={() => goSearch(t)} className="ovl-chip-text">{t}</button>
                        <button onClick={e => removeRecent(t, e)} className="ovl-chip-x"><LuX size={9} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="ovl-section">
                <div className="ovl-section-head">
                  <span className="ovl-section-title"><LuFlame size={11} /> Trending</span>
                </div>
                <ul className="ovl-list">
                  {TRENDING_TERMS.map((t,i) => (
                    <li key={t}>
                      <button className="ovl-list-item" onClick={() => goSearch(t)} style={{ animationDelay:`${i*35}ms` }}>
                        <IoSearch size={14} className="ovl-list-icon" />
                        <span>{t}</span>
                        <LuArrowUpRight size={13} className="ovl-list-arrow" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ovl-section ovl-section--border">
                <div className="ovl-section-head">
                  <span className="ovl-section-title"><LuTrendingUp size={11} /> Popular</span>
                </div>
                <div className="ovl-chips">
                  {POPULAR_TERMS.map(t => (
                    <button key={t} className="ovl-chip ovl-chip--popular" onClick={() => goSearch(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!showDefault && (
            <>
              {correction && correction.toLowerCase() !== query.trim().toLowerCase() && (
                <button className="ovl-correction" onClick={() => { setQuery(correction); goSearch(correction); }}>
                  <IoSearch size={13} />
                  Did you mean&nbsp;<strong>{correction}</strong>?
                </button>
              )}
              {aiSummary && (
                <div className="ovl-ai-card">
                  <div className="ovl-ai-badge"><span className="ovl-ai-dot" /> AI Insight</div>
                  <p className="ovl-ai-text">{aiSummary}</p>
                  {aiHighlights.length > 0 && (
                    <ul className="ovl-ai-list">{aiHighlights.map((h,i) => <li key={i}>{h}</li>)}</ul>
                  )}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="ovl-section">
                  <ul className="ovl-list">
                    {suggestions.slice(0,6).map((s,i) => {
                      const idx = navItems.findIndex(n => n.type==="s" && n.value===s);
                      return (
                        <li key={s}>
                          <button
                            className={`ovl-list-item ${activeIdx===idx?"ovl-list-item--active":""}`}
                            onClick={() => goSearch(s)} onMouseEnter={() => setActiveIdx(idx)}
                            style={{ animationDelay:`${i*28}ms` }}
                          >
                            <IoSearch size={14} className="ovl-list-icon" />
                            <span><Highlight text={s} query={query} /></span>
                            <LuArrowUpRight size={13} className="ovl-list-arrow" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {products.length > 0 && (
                <div className="ovl-section ovl-section--border">
                  <div className="ovl-section-head">
                    <span className="ovl-section-title"><LuPackageSearch size={11} /> Products</span>
                    <span className="ovl-count">{products.length} found</span>
                  </div>
                  <ul className="ovl-products">
                    {products.slice(0,5).map((p,i) => {
                      const idx = navItems.findIndex(n => n.type==="p" && n.product?._id===p._id);
                      return (
                        <li key={p._id||i}>
                          <button
                            className={`ovl-product-item ${activeIdx===idx?"ovl-product-item--active":""}`}
                            onClick={() => goProduct(p)} onMouseEnter={() => setActiveIdx(idx)}
                            style={{ animationDelay:`${i*35}ms` }}
                          >
                            <div className="ovl-product-img">
                              {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <LuPackageSearch size={15} style={{ color:"#CBD5E1" }} />}
                              {p.discount && <span className="ovl-product-badge">-{p.discount}%</span>}
                            </div>
                            <div className="ovl-product-info">
                              <span className="ovl-product-name"><Highlight text={p.name} query={query} /></span>
                              <div className="ovl-product-meta">
                                {p.category && <span className="ovl-tag">{p.category}</span>}
                                {p.brand    && <span className="ovl-tag ovl-tag--brand">{p.brand}</span>}
                              </div>
                            </div>
                            <div className="ovl-product-right">
                              {p.price    && <span className="ovl-price-new">₹{Number(p.price).toLocaleString("en-IN")}</span>}
                              {p.oldPrice && <span className="ovl-price-old">₹{Number(p.oldPrice).toLocaleString("en-IN")}</span>}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <button className="ovl-view-all" onClick={() => goSearch(query)}>
                    <IoSearch size={13} />
                    View all results for "<strong>{query}</strong>"
                    <LuArrowUpRight size={13} style={{ marginLeft:"auto" }} />
                  </button>
                </div>
              )}
              {!isFetching && !hasLive && (
                <div className="ovl-empty">
                  <LuPackageSearch size={40} className="ovl-empty-icon" />
                  <p className="ovl-empty-title">No results for "<strong>{query}</strong>"</p>
                  <p className="ovl-empty-sub">Try different keywords or check spelling</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const OVL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ovl-backdrop { position:fixed; inset:0; z-index:1200; background:rgba(0,0,0,0.48); backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px); animation:ovlBdIn 0.2s ease; }
@keyframes ovlBdIn { from{opacity:0} to{opacity:1} }
.ovl-panel { position:fixed; top:0; left:50%; transform:translateX(-50%); width:min(700px,100%); max-height:90vh; background:#fff; border-radius:0 0 20px 20px; box-shadow:0 32px 80px rgba(0,0,0,0.18),0 4px 18px rgba(0,0,0,0.07); z-index:1201; display:flex; flex-direction:column; overflow:hidden; animation:ovlPanelIn 0.3s cubic-bezier(0.22,1,0.36,1); font-family:'DM Sans',sans-serif; }
@keyframes ovlPanelIn { from{opacity:0;transform:translateX(-50%) translateY(-22px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
.ovl-bar { display:flex; align-items:center; gap:10px; padding:13px 15px; border-bottom:1.5px solid #F3F4F6; flex-shrink:0; }
.ovl-shell { flex:1; display:flex; align-items:center; gap:10px; background:#F3F4F6; border:1.5px solid #E5E7EB; border-radius:12px; padding:0 13px; transition:border-color 0.18s,box-shadow 0.18s,background 0.18s; }
.ovl-shell:focus-within,.ovl-shell--typed { background:#fff; border-color:#FF6B2B; box-shadow:0 0 0 3.5px rgba(255,107,43,0.13); }
.ovl-bar-icon { color:#9CA3AF; display:flex; align-items:center; flex-shrink:0; }
.ovl-input { flex:1; height:48px; border:none; background:transparent; outline:none; font-size:15px; font-weight:500; color:#111827; font-family:'DM Sans',sans-serif; letter-spacing:-0.01em; }
.ovl-input::placeholder { color:#B0B7C3; font-weight:400; }
.ovl-clear { width:24px; height:24px; border-radius:50%; border:none; background:#E5E7EB; color:#6B7280; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:background 0.13s; }
.ovl-clear:hover { background:#D1D5DB; }
.ovl-cancel { background:none; border:none; font-size:14px; font-weight:600; color:#FF6B2B; cursor:pointer; padding:8px 4px; flex-shrink:0; font-family:'DM Sans',sans-serif; transition:opacity 0.13s; }
.ovl-cancel:hover { opacity:0.7; }
.ovl-spin { width:18px; height:18px; border-radius:50%; border:2.5px solid #F3F4F6; border-top-color:#FF6B2B; animation:ovlSpin 0.6s linear infinite; display:block; }
@keyframes ovlSpin { to{transform:rotate(360deg)} }
.ovl-body { overflow-y:auto; flex:1; padding:6px 0 20px; scrollbar-width:thin; scrollbar-color:#E5E7EB transparent; }
.ovl-body::-webkit-scrollbar { width:4px; }
.ovl-body::-webkit-scrollbar-thumb { background:#E5E7EB; border-radius:4px; }
.ovl-section { padding:10px 15px 6px; }
.ovl-section--border { border-top:1px solid #F3F4F6; }
.ovl-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.ovl-section-title { display:flex; align-items:center; gap:4px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.09em; color:#9CA3AF; }
.ovl-text-btn { background:none; border:none; font-size:11px; font-weight:600; color:#FF6B2B; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity 0.13s; }
.ovl-text-btn:hover { opacity:0.7; }
.ovl-count { font-size:10px; font-weight:600; color:#9CA3AF; background:#F3F4F6; padding:2px 8px; border-radius:20px; }
.ovl-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:1px; }
.ovl-list-item { display:flex; align-items:center; gap:9px; width:100%; padding:9px 10px; border:none; background:transparent; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; color:#374151; font-family:'DM Sans',sans-serif; text-align:left; transition:background 0.12s; animation:ovlItemIn 0.2s ease both; }
@keyframes ovlItemIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
.ovl-list-item:hover,.ovl-list-item--active { background:#FFF4EE; color:#FF6B2B; }
.ovl-list-icon { color:#D1D5DB; flex-shrink:0; }
.ovl-list-arrow { color:#D1D5DB; margin-left:auto; opacity:0; flex-shrink:0; transition:opacity 0.12s; }
.ovl-list-item:hover .ovl-list-arrow,.ovl-list-item--active .ovl-list-arrow { opacity:1; }
.ovl-chips { display:flex; flex-wrap:wrap; gap:6px; }
.ovl-chip { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.14s; animation:ovlChipIn 0.2s ease both; }
@keyframes ovlChipIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
.ovl-chip--recent { background:#F3F4F6; color:#374151; border:1.5px solid #E5E7EB; padding:4px 6px 4px 11px; }
.ovl-chip--recent:hover { border-color:#FF6B2B; background:rgba(255,107,43,0.07); }
.ovl-chip-text { background:none; border:none; font-size:12px; font-weight:500; color:#374151; cursor:pointer; padding:0 5px 0 0; font-family:'DM Sans',sans-serif; }
.ovl-chip-x { width:18px; height:18px; border-radius:50%; border:none; background:#E5E7EB; color:#9CA3AF; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.12s,color 0.12s; flex-shrink:0; }
.ovl-chip-x:hover { background:#FF6B2B; color:#fff; }
.ovl-chip--popular { background:#F3F4F6; color:#374151; border:1.5px dashed #D1D5DB; }
.ovl-chip--popular:hover { border-color:#FF6B2B; background:rgba(255,107,43,0.07); color:#FF6B2B; }
.ovl-correction { display:flex; align-items:center; gap:7px; width:100%; padding:10px 15px; background:#EFF6FF; border:none; border-bottom:1px solid #DBEAFE; font-size:13px; color:#1E40AF; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; text-align:left; transition:background 0.13s; }
.ovl-correction:hover { background:#DBEAFE; }
.ovl-correction strong { font-weight:700; }
.ovl-ai-card { margin:10px 15px 4px; background:linear-gradient(135deg,#0d0d12,#1a1a2e); border-radius:12px; padding:14px 16px; position:relative; overflow:hidden; animation:ovlItemIn 0.25s ease both; }
.ovl-ai-card::before { content:''; position:absolute; top:0; right:0; width:120px; height:120px; background:radial-gradient(circle,rgba(255,107,43,0.18) 0%,transparent 70%); pointer-events:none; }
.ovl-ai-badge { display:flex; align-items:center; gap:5px; font-size:9px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#93C5FD; margin-bottom:6px; }
.ovl-ai-dot { width:6px; height:6px; border-radius:50%; background:#93C5FD; animation:ovlPulse 1.4s ease infinite; }
@keyframes ovlPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.ovl-ai-text { font-size:12px; color:rgba(255,255,255,0.85); line-height:1.6; margin:0 0 6px; }
.ovl-ai-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px; }
.ovl-ai-list li { font-size:11px; color:rgba(255,255,255,0.5); display:flex; align-items:flex-start; gap:6px; }
.ovl-ai-list li::before { content:''; width:4px; height:4px; border-radius:50%; background:#FF6B2B; flex-shrink:0; margin-top:5px; }
.ovl-products { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:2px; }
.ovl-product-item { display:flex; align-items:center; gap:11px; width:100%; padding:9px 10px; border:none; background:transparent; border-radius:11px; cursor:pointer; text-align:left; transition:background 0.12s; animation:ovlItemIn 0.22s ease both; }
.ovl-product-item:hover,.ovl-product-item--active { background:#FFF4EE; }
.ovl-product-img { width:50px; height:50px; border-radius:9px; flex-shrink:0; border:1.5px solid #F3F4F6; background:#F8F9FA; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center; }
.ovl-product-img img { width:100%; height:100%; object-fit:cover; }
.ovl-product-badge { position:absolute; top:2px; right:2px; background:#FF6B2B; color:#fff; font-size:8px; font-weight:700; padding:1px 4px; border-radius:3px; }
.ovl-product-info { flex:1; min-width:0; }
.ovl-product-name { font-size:13px; font-weight:600; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; margin-bottom:3px; font-family:'DM Sans',sans-serif; }
.ovl-product-meta { display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
.ovl-tag { font-size:10px; font-weight:500; color:#9CA3AF; background:#F3F4F6; border:1px solid #E5E7EB; padding:1px 6px; border-radius:20px; }
.ovl-tag--brand { color:#FF6B2B; background:rgba(255,107,43,0.07); border-color:rgba(255,107,43,0.2); }
.ovl-product-right { display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0; gap:2px; }
.ovl-price-new { font-size:13px; font-weight:700; color:#FF6B2B; font-family:'DM Sans',sans-serif; }
.ovl-price-old { font-size:10px; font-weight:400; color:#D1D5DB; text-decoration:line-through; font-family:'DM Sans',sans-serif; }
.ovl-view-all { display:flex; align-items:center; gap:6px; width:100%; margin-top:8px; padding:11px 12px; border-radius:10px; border:1.5px dashed rgba(255,107,43,0.3); background:rgba(255,107,43,0.04); color:#FF6B2B; font-size:12px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; text-align:left; transition:background 0.14s,border-color 0.14s; }
.ovl-view-all:hover { background:rgba(255,107,43,0.10); border-color:#FF6B2B; }
.ovl-view-all strong { font-weight:700; }
.ovl-empty { display:flex; flex-direction:column; align-items:center; padding:40px 20px; gap:7px; text-align:center; }
.ovl-empty-icon { color:#E5E7EB; margin-bottom:4px; }
.ovl-empty-title { font-size:15px; font-weight:700; color:#111827; margin:0; font-family:'DM Sans',sans-serif; }
.ovl-empty-title strong { color:#FF6B2B; }
.ovl-empty-sub { font-size:12px; color:#9CA3AF; margin:0; }
@media(max-width:600px) { .ovl-panel{border-radius:0 0 16px 16px} .ovl-bar{padding:11px 12px} .ovl-section{padding:9px 12px 4px} .ovl-product-img{width:42px;height:42px} }
`;

export default SearchOverlay;