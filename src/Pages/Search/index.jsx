import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { useAppContext } from "../../hooks/useAppContext";
import { MdOutlineFilterAlt } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setGlobalLoading } from "../../store/appSlice";

// ─── Sort Options ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "bestseller", label: "🏆 Best Seller" },
  { value: "latest",     label: "🆕 Latest"      },
  { value: "popular",    label: "⭐ Most Popular" },
  { value: "priceAsc",   label: "↑ Price: Low to High" },
  { value: "priceDesc",  label: "↓ Price: High to Low" },
  { value: "nameAsc",    label: "A → Z"           },
  { value: "nameDesc",   label: "Z → A"           },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toArray  = (val) => (val || "").split(",").filter(Boolean);
const toNumArr = (val) => (val || "").split(",").map(Number).filter(Boolean);

const SearchPage = () => {
  // ── View & Sort ────────────────────────────────────────────────────────────
  const [itemView,          setItemView]          = useState("grid");
  const [anchorEl,          setAnchorEl]          = useState(null);
  const [selectedSortType,  setSelectedSortType]  = useState("bestseller");
  const [selectedSortLabel, setSelectedSortLabel] = useState("🏆 Best Seller");

  // ── Data ───────────────────────────────────────────────────────────────────
  const [productsData, setProductsData] = useState([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [isLoading,    setIsLoading]    = useState(false);
  const [aiInsights,   setAiInsights]   = useState(null);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [selectedBrands,         setSelectedBrands]         = useState([]);
  const [selectedSizes,          setSelectedSizes]          = useState([]);
  const [selectedProductTypes,   setSelectedProductTypes]   = useState([]);
  const [selectedSaleOnly,       setSelectedSaleOnly]       = useState(false);
  const [selectedStockStatus,    setSelectedStockStatus]    = useState("all");
  const [selectedDiscountRanges, setSelectedDiscountRanges] = useState([]);
  const [selectedWeights,        setSelectedWeights]        = useState([]);
  const [selectedRamOptions,     setSelectedRamOptions]     = useState([]);
  const [selectedPriceRanges,    setSelectedPriceRanges]    = useState([]);
  const [selectedColors,         setSelectedColors]         = useState([]);
  const [selectedRatingBands,    setSelectedRatingBands]    = useState([]);

  const context  = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Page & Query — URL is single source of truth ──────────────────────────
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const searchQuery = queryParams.get("query") || "";

  const page = useMemo(() => {
    const p = Number(queryParams.get("page") || 1);
    return Number.isNaN(p) || p < 1 ? 1 : p;
  }, [queryParams]);

  // ── Sync filters from URL ──────────────────────────────────────────────────
  useEffect(() => {
    setSelectedBrands(toArray(queryParams.get("brands")));
    setSelectedSizes(toArray(queryParams.get("sizes")));
    setSelectedProductTypes(toArray(queryParams.get("types")));
    setSelectedWeights(toArray(queryParams.get("weights")));
    setSelectedRamOptions(toArray(queryParams.get("ram")));
    setSelectedPriceRanges(toArray(queryParams.get("priceRanges")));
    setSelectedColors(toArray(queryParams.get("colors")));
    setSelectedStockStatus(queryParams.get("stock") || "all");
    setSelectedSaleOnly(queryParams.get("sale") === "1");
    setSelectedDiscountRanges(toNumArr(queryParams.get("discount")));
    setSelectedRatingBands(toNumArr(queryParams.get("rating")));
  }, [location.search]);

  // ── Sync aiInsights ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery) {
      setProductsData([]);
      setTotalPages(1);
      setAiInsights(null);
      return;
    }
    setAiInsights(productsData?.aiInsights || null);
  }, [productsData, searchQuery]);

  // ── Scroll to top on page change ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // ── Global loading sync ───────────────────────────────────────────────────
  useEffect(() => {
    dispatch(setGlobalLoading(isLoading));
  }, [isLoading, dispatch]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFiltersCount = useMemo(() => (
    selectedBrands.length +
    selectedSizes.length +
    selectedProductTypes.length +
    selectedPriceRanges.length +
    (selectedSaleOnly ? 1 : 0) +
    (selectedStockStatus !== "all" ? 1 : 0) +
    selectedDiscountRanges.length +
    selectedWeights.length +
    selectedRamOptions.length +
    selectedColors.length +
    selectedRatingBands.length
  ), [
    selectedBrands, selectedSizes, selectedProductTypes, selectedPriceRanges,
    selectedSaleOnly, selectedStockStatus, selectedDiscountRanges,
    selectedWeights, selectedRamOptions, selectedColors, selectedRatingBands,
  ]);

  // ── Navigate to page (keeps all other params) ────────────────────────────
  const goToPage = (newPage) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(newPage));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // ── Reset all filters ─────────────────────────────────────────────────────
  const handleResetAllFilters = () => {
    const params = new URLSearchParams();
    params.set("query", searchQuery);
    params.set("page", "1");
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // ── Sort handler ──────────────────────────────────────────────────────────
  const handleSortBy = (sortType, label) => {
    setSelectedSortType(sortType);
    setSelectedSortLabel(label);
    setAnchorEl(null);
    goToPage(1);
  };

  const paginatedProducts = productsData?.products || [];
  const open = Boolean(anchorEl);

  return (
    <section className="pb-0">
      <div className="bg-white p-2">
        <div className="container flex gap-3">

          {/* ── Sidebar ── */}
          <div className={`sidebarWrapper fixed -bottom-[100%] left-0 w-full lg:h-full lg:static lg:w-[20%] bg-white z-[102] lg:z-[100] p-3 lg:p-0 transition-all lg:opacity-100 opacity-0 ${context?.openFilter === true ? "open" : ""}`}>
            <Sidebar
              productsData={productsData}
              setProductsData={setProductsData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              page={page}
              setTotalPages={setTotalPages}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedProductTypes={selectedProductTypes}
              setSelectedProductTypes={setSelectedProductTypes}
              selectedSaleOnly={selectedSaleOnly}
              setSelectedSaleOnly={setSelectedSaleOnly}
              selectedStockStatus={selectedStockStatus}
              setSelectedStockStatus={setSelectedStockStatus}
              selectedDiscountRanges={selectedDiscountRanges}
              setSelectedDiscountRanges={setSelectedDiscountRanges}
              selectedWeights={selectedWeights}
              setSelectedWeights={setSelectedWeights}
              selectedRamOptions={selectedRamOptions}
              setSelectedRamOptions={setSelectedRamOptions}
              selectedPriceRanges={selectedPriceRanges}
              setSelectedPriceRanges={setSelectedPriceRanges}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedRatingBands={selectedRatingBands}
              setSelectedRatingBands={setSelectedRatingBands}
              selectedSortType={selectedSortType}
              searchQuery={searchQuery}
              activeFiltersCount={activeFiltersCount}
              onResetAllFilters={handleResetAllFilters}
            />
          </div>

          {/* ── Mobile filter overlay ── */}
          {context?.windowWidth < 992 && (
            <div
              className={`filter_overlay w-full h-full bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 z-[101] ${context?.openFilter === true ? "block" : "hidden"}`}
              onClick={() => context?.setOpenFilter(false)}
            />
          )}

          {/* ── Main content ── */}
          <div className="rightContent w-full lg:w-[80%] py-3">

            {/* ── Toolbar ── */}
            <div className="bg-[#f1f1f1] p-2 w-full mb-4 rounded-md flex items-center justify-between sticky top-[135px] z-[99]">

              {/* Filter button */}
              <div className="col1 flex items-center gap-2">
                <Button
                  onClick={() => context?.setOpenFilter(true)}
                  className="!text-[12px] !capitalize !rounded-full !bg-[#ff5252] !text-white"
                >
                  <MdOutlineFilterAlt className="mr-1" size={20} />
                  <b className="text-[14px]">Filters</b>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 bg-white text-[#ff5252] rounded-full px-[6px] py-[1px] text-[12px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>

              {/* Right: view toggle + sort */}
              <div className="col2 ml-auto flex items-center gap-3">

                {/* Grid / List toggle */}
                <div className="flex items-center border-2 border-[#ddd] rounded-md overflow-hidden">
                  <button
                    onClick={() => setItemView("grid")}
                    title="Grid View"
                    className={`p-[6px] transition ${itemView === "grid" ? "bg-[#ff5252] text-white" : "bg-white text-[#555]"}`}
                  >
                    <IoGridSharp size={18} />
                  </button>
                  <button
                    onClick={() => setItemView("list")}
                    title="List View"
                    className={`p-[6px] transition ${itemView === "list" ? "bg-[#ff5252] text-white" : "bg-white text-[#555]"}`}
                  >
                    <LuMenu size={18} />
                  </button>
                </div>

                <span className="text-[13px] font-[500] text-[rgba(0,0,0,0.6)] hidden sm:block">
                  Sort By
                </span>

                <Button
                  id="sort-button"
                  aria-controls={open ? "sort-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className="!bg-white !text-[12px] !text-[#000] !capitalize !border-2 !border-[#000] !font-[600]"
                >
                  {selectedSortLabel}
                </Button>

                <Menu
                  id="sort-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  MenuListProps={{ "aria-labelledby": "sort-button" }}
                  PaperProps={{
                    style: {
                      minWidth: 210,
                      borderRadius: 10,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      selected={selectedSortType === opt.value}
                      onClick={() => handleSortBy(opt.value, opt.label)}
                      className="!text-[13px] !capitalize"
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "#fff3f3",
                          fontWeight: 700,
                          color: "#ff5252",
                        },
                        "&:hover": { backgroundColor: "#fff8f8" },
                      }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            </div>

            {/* ── Spell correction banner ── */}
            {context?.searchData?.correctedQuery && (
              <div className="bg-[#edf4ff] border border-[#c9dcff] rounded-md p-3 mb-4 text-[14px]">
                Showing results for{" "}
                <span className="font-[700] text-[#0d6efd]">
                  {context.searchData.correctedQuery}
                </span>
              </div>
            )}

            {/* ── AI Insights ── */}
            {aiInsights?.summary && (
              <div className="bg-[#101828] text-white rounded-md p-4 mb-4">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#9cc5ff] font-[700]">
                  {aiInsights?.title || "AI Search Assistant"}
                </p>
                <p className="text-[14px] mt-1">{aiInsights.summary}</p>
                {aiInsights?.highlights?.length > 0 && (
                  <ul className="list-disc pl-5 mt-2 text-[13px] text-[#d5e6ff] space-y-1">
                    {aiInsights.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── Empty state ── */}
            {!isLoading && paginatedProducts.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[18px] font-[600] text-[#333]">No products found</p>
                <p className="text-[14px] text-[#888] mt-1">
                  Try different keywords or reset your filters
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetAllFilters}
                    className="mt-4 px-5 py-2 bg-[#ff5252] text-white rounded-full text-[13px] font-[600]"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}

            {/* ── Product Grid / List ── */}
            <div className={`grid ${
              itemView === "grid"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1"
              } gap-4`}
            >
              {isLoading ? (
                <ProductLoadingGrid view={itemView} />
              ) : (
                itemView === "grid"
                  ? paginatedProducts.map((item, index) => (
                      <ProductItem key={item?._id || index} item={item} />
                    ))
                  : paginatedProducts.map((item, index) => (
                      <ProductItemListView key={item?._id || index} item={item} />
                    ))
              )}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center mt-10 gap-2">
                <Pagination
                  showFirstButton
                  showLastButton
                  count={totalPages}
                  page={page}
                  color="primary"
                  shape="rounded"
                  onChange={(_, value) => {
                    dispatch(setGlobalLoading(true));
                    goToPage(value);
                  }}
                  sx={{
                    "& .MuiPaginationItem-root": { fontWeight: 600 },
                    "& .Mui-selected": {
                      backgroundColor: "#ff5252 !important",
                      color: "#fff",
                    },
                  }}
                />
                <p className="text-[13px] text-[#888]">
                  Page {page} of {totalPages}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchPage;