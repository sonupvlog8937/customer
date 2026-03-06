import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Sidebar } from "../../components/Sidebar";
import ProductItem from "../../components/ProductItem";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { useAppContext } from "../../hooks/useAppContext";
import { MdOutlineFilterAlt } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setGlobalLoading } from "../../store/appSlice";

const SORT_OPTIONS = [
  { value: "bestseller", label: "🏆 Best Seller" },
  { value: "latest",     label: "🆕 Latest"      },
  { value: "popular",    label: "⭐ Most Popular" },
  { value: "featured",   label: "🎖️ Featured"    },
  { value: "priceAsc",   label: "💰 Price: Low to High"  },
  { value: "priceDesc",  label: "💰 Price: High to Low"  },
  { value: "nameAsc",    label: "🔤 Name: A to Z"        },
  { value: "nameDesc",   label: "🔤 Name: Z to A"        },
];

const ProductListing = () => {
  const [anchorEl, setAnchorEl]                         = React.useState(null);
  const [productsData, setProductsData]                 = useState([]);
  const [isLoading, setIsLoading]                       = useState(false);
  const [totalPages, setTotalPages]                     = useState(1);
  const [selectedSortVal, setSelectedSortVal]           = useState("🏆 Best Seller");
  const [selectedSortType, setSelectedSortType]         = useState("bestseller");
  const [selectedBrands, setSelectedBrands]             = useState([]);
  const [selectedSizes, setSelectedSizes]               = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges]   = useState([]);
  const [selectedSaleOnly, setSelectedSaleOnly]         = useState(false);
  const [selectedStockStatus, setSelectedStockStatus]   = useState("all");
  const [selectedDiscountRanges, setSelectedDiscountRanges] = useState([]);
  const [selectedWeights, setSelectedWeights]           = useState([]);
  const [selectedRamOptions, setSelectedRamOptions]     = useState([]);
  const [selectedColors, setSelectedColors]             = useState([]);
  const [selectedRatingBands, setSelectedRatingBands]   = useState([]);

  const context  = useAppContext();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Page always derived from URL — no separate state, no infinite loops
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const page = useMemo(() => {
    const p = Number(queryParams.get("page") || 1);
    return Number.isNaN(p) || p < 1 ? 1 : p;
  }, [queryParams]);

  // ✅ Active filter count for badge
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

  // ✅ Central URL updater — always pass page explicitly
  const updateUrl = useCallback((overrides = {}) => {
    const params = new URLSearchParams(location.search);

    const newPage     = overrides.page         ?? 1;
    const brands      = overrides.brands       ?? selectedBrands;
    const sizes       = overrides.sizes        ?? selectedSizes;
    const types       = overrides.types        ?? selectedProductTypes;
    const weights     = overrides.weights      ?? selectedWeights;
    const ram         = overrides.ram          ?? selectedRamOptions;
    const priceRanges = overrides.priceRanges  ?? selectedPriceRanges;
    const colors      = overrides.colors       ?? selectedColors;
    const stock       = overrides.stock        ?? selectedStockStatus;
    const sale        = overrides.sale         ?? selectedSaleOnly;
    const discount    = overrides.discount     ?? selectedDiscountRanges;
    const rating      = overrides.rating       ?? selectedRatingBands;

    params.set("page", String(newPage));
    brands.length      ? params.set("brands",      brands.join(","))      : params.delete("brands");
    sizes.length       ? params.set("sizes",       sizes.join(","))       : params.delete("sizes");
    types.length       ? params.set("types",       types.join(","))       : params.delete("types");
    weights.length     ? params.set("weights",     weights.join(","))     : params.delete("weights");
    ram.length         ? params.set("ram",         ram.join(","))         : params.delete("ram");
    priceRanges.length ? params.set("priceRanges", priceRanges.join(",")) : params.delete("priceRanges");
    colors.length      ? params.set("colors",      colors.join(","))      : params.delete("colors");
    stock !== "all"    ? params.set("stock",       stock)                 : params.delete("stock");
    sale               ? params.set("sale",        "1")                  : params.delete("sale");
    discount.length    ? params.set("discount",    discount.join(","))    : params.delete("discount");
    rating.length      ? params.set("rating",      rating.join(","))      : params.delete("rating");

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [
    location, navigate,
    selectedBrands, selectedSizes, selectedProductTypes, selectedWeights,
    selectedRamOptions, selectedPriceRanges, selectedColors, selectedStockStatus,
    selectedSaleOnly, selectedDiscountRanges, selectedRatingBands,
  ]);

  // ✅ Filter change → reset to page 1 in URL
  useEffect(() => {
    updateUrl({ page: 1 });
  }, [
    selectedBrands, selectedSizes, selectedProductTypes, selectedWeights,
    selectedRamOptions, selectedPriceRanges, selectedColors, selectedStockStatus,
    selectedSaleOnly, selectedDiscountRanges, selectedRatingBands,
  ]);

  // ✅ Pagination — update URL, Sidebar re-fetches via page prop
  const handlePageChange = useCallback((_, value) => {
    dispatch(setGlobalLoading(true));
    window.scrollTo({ top: 0, behavior: "smooth" });
    updateUrl({ page: value });
  }, [updateUrl, dispatch]);

  // ✅ Sort handler
  const handleSortBy = useCallback((sortType, label) => {
    setSelectedSortType(sortType);
    setSelectedSortVal(label);
    setAnchorEl(null);
    const params = new URLSearchParams(location.search);
    params.set("page", "1");
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [location, navigate]);

  // ✅ Reset all filters
  const resetAllFilters = useCallback(() => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedProductTypes([]);
    setSelectedPriceRanges([]);
    setSelectedSaleOnly(false);
    setSelectedStockStatus("all");
    setSelectedDiscountRanges([]);
    setSelectedWeights([]);
    setSelectedRamOptions([]);
    setSelectedColors([]);
    setSelectedRatingBands([]);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    dispatch(setGlobalLoading(isLoading));
  }, [isLoading, dispatch]);

  const filteredProducts = productsData?.products || [];
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
              selectedPriceRanges={selectedPriceRanges}
              setSelectedPriceRanges={setSelectedPriceRanges}
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
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedRatingBands={selectedRatingBands}
              setSelectedRatingBands={setSelectedRatingBands}
              selectedSortType={selectedSortType}
              activeFiltersCount={activeFiltersCount}
              onResetAllFilters={resetAllFilters}
            />
          </div>

          {/* ── Mobile filter overlay ── */}
          {context?.windowWidth && context.windowWidth < 992 && (
            <div
              className={`filter_overlay w-full h-full bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 z-[101] ${context?.openFilter === true ? "block" : "hidden"}`}
              onClick={() => context?.setOpenFilter(false)}
            />
          )}

          {/* ── Main Content ── */}
          <div className="rightContent w-full lg:w-[80%] py-3">

            {/* ── Toolbar ── */}
            <div className="bg-[#f1f1f1] p-2 w-full mb-4 rounded-md flex items-center justify-between sticky top-[135px] z-[99]">
              <div className="col1 flex items-center gap-2">
                <Button
                  onClick={() => context?.setOpenFilter(true)}
                  className="!text-[12px] !capitalize !rounded-full !bg-[#ff5252] !text-white"
                >
                  <MdOutlineFilterAlt className="mr-1" size={20} />
                  <b className="text-[14px]">Filters</b>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 bg-white text-[#ff5252] rounded-full px-[6px] text-[11px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>

              <div className="col2 ml-auto flex items-center gap-3 pr-2">
                <span className="text-[13px] font-[500] text-[rgba(0,0,0,0.6)] hidden sm:inline">
                  Sort By
                </span>
                <Button
                  id="sort-button"
                  aria-controls={open ? "sort-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className="!bg-white !text-[12px] !text-[#000] !capitalize !border-2 !border-[#000] !rounded-md"
                >
                  {selectedSortVal}
                </Button>
                <Menu
                  id="sort-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  MenuListProps={{ "aria-labelledby": "sort-button" }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      selected={selectedSortType === option.value}
                      onClick={() => handleSortBy(option.value, option.label)}
                      className="!text-[13px] !text-[#000] !capitalize"
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {isLoading ? (
                <ProductLoadingGrid view="grid" />
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((item, index) => (
                  <ProductItem key={item?._id || item?.id || index} item={item} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-[18px] font-[600] text-[#333]">No Products Found</p>
                  <p className="text-[13px] text-[#888] mt-1">
                    Try different keywords or reset your filters
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={resetAllFilters}
                      className="!mt-4 !bg-[#ff5252] !text-white !capitalize !rounded-full !px-6 !text-[13px]"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-10 mb-4">
                <Pagination
                  showFirstButton
                  showLastButton
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductListing;