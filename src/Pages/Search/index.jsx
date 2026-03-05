import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ProductItem from "../../components/ProductItem";
import ProductItemListView from "../../components/ProductItemListView";
import Button from "@mui/material/Button";
import { IoGridSharp } from "react-icons/io5";
import { LuMenu } from "react-icons/lu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import ProductLoadingGrid from "../../components/ProductLoading/productLoadingGrid";
import { postData } from "../../utils/api";
import { useAppContext } from "../../hooks/useAppContext";
import { MdOutlineFilterAlt } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [itemView, setItemView] = useState("grid");
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [productsData, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [aiInsights, setAiInsights] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedSaleOnly, setSelectedSaleOnly] = useState(false);
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [selectedDiscountRanges, setSelectedDiscountRanges] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState([]);
  const [selectedRamOptions, setSelectedRamOptions] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  const [selectedSortVal, setSelectedSortVal] = useState("Name, A to Z");

  const context = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQuery = queryParams.get("query") || "";
  const pageLimit = 20;
  const activeFiltersCount = useMemo(() => (
    selectedBrands.length +
    selectedSizes.length +
    selectedProductTypes.length +
    selectedPriceRanges.length +
    (selectedSaleOnly ? 1 : 0) +
    (selectedStockStatus !== "all" ? 1 : 0) +
    selectedDiscountRanges.length +
    selectedWeights.length +
    selectedRamOptions.length
  ), [
    selectedBrands,
    selectedSizes,
    selectedProductTypes,
    selectedPriceRanges,
    selectedSaleOnly,
    selectedStockStatus,
    selectedDiscountRanges,
    selectedWeights,
    selectedRamOptions,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

   useEffect(() => {
    if (!searchQuery) return;
    setIsLoading(true);
    postData(`/api/product/search/get`, {
      page: 1,
      limit: 250,
      query: searchQuery,
    }).then((res) => {
      context?.setSearchData(res);
      setProductsData(res);
      setAiInsights(res?.aiInsights || null);
      setIsLoading(false);
    });
  }, [searchQuery]);

  useEffect(() => {
    setAiInsights(context?.searchData?.aiInsights || null);
  }, [context?.searchData]);

  const filteredProducts = useMemo(() => {
    const items = productsData?.products || [];

    return items.filter((product) => {
      if (selectedBrands.length && !selectedBrands.includes(product?.brand)) return false;
      if (selectedSizes.length && !(product?.size || []).some((size) => selectedSizes.includes(size))) return false;

      if (selectedProductTypes.length) {
        const productType = product?.productType || product?.thirdSubCatName || product?.subCatName || product?.catName;
        if (!selectedProductTypes.includes(productType)) return false;
      }

      if (selectedSaleOnly && Number(product?.discount || 0) <= 0) return false;
      if (selectedStockStatus === "inStock" && Number(product?.countInStock || 0) <= 0) return false;
      if (selectedStockStatus === "outOfStock" && Number(product?.countInStock || 0) > 0) return false;

      if (selectedDiscountRanges.length) {
        const discount = Number(product?.discount || 0);
        if (!selectedDiscountRanges.some((min) => discount >= min)) return false;
      }

      if (selectedWeights.length && !(product?.productWeight || []).some((item) => selectedWeights.includes(item))) return false;
      if (selectedRamOptions.length && !(product?.productRam || []).some((item) => selectedRamOptions.includes(item))) return false;

      if (selectedPriceRanges.length) {
        const productPrice = Number(product?.price || 0);
        const inRange = selectedPriceRanges.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return productPrice >= min && productPrice <= max;
        });
        if (!inRange) return false;
      }

      return true;
    });
  }, [productsData, selectedBrands, selectedSizes, selectedProductTypes, selectedSaleOnly, selectedStockStatus, selectedDiscountRanges, selectedWeights, selectedRamOptions, selectedPriceRanges]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageLimit;
    return filteredProducts.slice(start, start + pageLimit);
  }, [filteredProducts, page]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredProducts.length / pageLimit)));
  }, [filteredProducts]);

  useEffect(() => {
    const nextPage = Number(queryParams.get("page") || 1);
    setPage(Number.isNaN(nextPage) ? 1 : nextPage);
    setSelectedBrands((queryParams.get("brands") || "").split(",").filter(Boolean));
    setSelectedSizes((queryParams.get("sizes") || "").split(",").filter(Boolean));
    setSelectedProductTypes((queryParams.get("types") || "").split(",").filter(Boolean));
    setSelectedWeights((queryParams.get("weights") || "").split(",").filter(Boolean));
    setSelectedRamOptions((queryParams.get("ram") || "").split(",").filter(Boolean));
    setSelectedPriceRanges((queryParams.get("priceRanges") || "").split(",").filter(Boolean));
    setSelectedStockStatus(queryParams.get("stock") || "all");
    setSelectedSaleOnly(queryParams.get("sale") === "1");
    setSelectedDiscountRanges((queryParams.get("discount") || "")
      .split(",")
      .map((item) => Number(item))
      .filter(Boolean));
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(page));
    if (selectedBrands.length) params.set("brands", selectedBrands.join(",")); else params.delete("brands");
    if (selectedSizes.length) params.set("sizes", selectedSizes.join(",")); else params.delete("sizes");
    if (selectedProductTypes.length) params.set("types", selectedProductTypes.join(",")); else params.delete("types");
    if (selectedWeights.length) params.set("weights", selectedWeights.join(",")); else params.delete("weights");
    if (selectedRamOptions.length) params.set("ram", selectedRamOptions.join(",")); else params.delete("ram");
    if (selectedPriceRanges.length) params.set("priceRanges", selectedPriceRanges.join(",")); else params.delete("priceRanges");
    if (selectedStockStatus !== "all") params.set("stock", selectedStockStatus); else params.delete("stock");
    if (selectedSaleOnly) params.set("sale", "1"); else params.delete("sale");
    if (selectedDiscountRanges.length) params.set("discount", selectedDiscountRanges.join(",")); else params.delete("discount");
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [page, selectedBrands, selectedSizes, selectedProductTypes, selectedWeights, selectedRamOptions, selectedPriceRanges, selectedStockStatus, selectedSaleOnly, selectedDiscountRanges]);

  const handleResetAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedProductTypes([]);
    setSelectedSaleOnly(false);
    setSelectedStockStatus("all");
    setSelectedDiscountRanges([]);
    setSelectedWeights([]);
    setSelectedRamOptions([]);
    setSelectedPriceRanges([]);
    setPage(1);
  };

  const handleSortBy = (name, order, products, value) => {
    setSelectedSortVal(value);
    postData(`/api/product/sortBy`, {
      products: products,
      sortBy: name,
      order: order
    }).then((res) => {
      setProductsData(res);
      setAiInsights(res?.aiInsights || context?.searchData?.aiInsights || null);
      setAnchorEl(null);
    })
  }

  return (
    <section className=" pb-0">

      <div className="bg-white p-2">
        <div className="container flex gap-3">
          <div className={`sidebarWrapper fixed -bottom-[100%] left-0 w-fulllg:h-full lg:static lg:w-[20%] bg-white z-[102] lg:z-[100] p-3 lg:p-0  transition-all lg:opacity-100 opacity-0 ${context?.openFilter === true ? 'open' : ''}`}>
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
              activeFiltersCount={activeFiltersCount}
              onResetAllFilters={handleResetAllFilters}
            />
          </div>

          {
            context?.windowWidth < 992 &&
            <div className={`filter_overlay w-full h-full bg-[rgba(0,0,0,0.5)] fixed top-0 left-0 z-[101]  ${context?.openFilter === true ? 'block' : 'hidden'}`}
              onClick={()=>context?.setOpenFilter(false)}
            ></div>
          }


          <div className="rightContent w-full lg:w-[80%] py-3">
            <div className="bg-[#f1f1f1] p-2 w-full mb-4 rounded-md flex items-center justify-between sticky top-[135px] z-[99]">
              <div className="col1 flex items-center itemViewActions gap-2">
                <Button
                  onClick={() => context?.setOpenFilter(true)}
                  className="!text-[12px] !capitalize !rounded-full !bg-[#ff5252] !text-white !border-[#ff5252]"
                >
                 <MdOutlineFilterAlt className="mr-1" size={20} />
                 <b className="text-[14px]">Filters</b>
                 {activeFiltersCount > 0 && <span className="ml-1 text-[13px]">({activeFiltersCount})</span>}
                </Button>
                
              </div>

              <div className="col2 ml-auto flex items-center justify-end gap-3 pr-4">
                <span className="text-[14px] font-[500] pl-3 text-[rgba(0,0,0,0.7)]">
                  Sort By
                </span>

                <Button
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  className="!bg-white !text-[12px] !text-[#000] !capitalize !border-2 
                  !border-[#000]"
                >
                  {selectedSortVal}
                </Button>

                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem
                    onClick={() => handleSortBy('Best Seller', 'bestSeller')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                     Best Seller
                  </MenuItem>


                  <MenuItem
                    onClick={() => handleSortBy('Latest', 'latest')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Latest
                  </MenuItem>


                  <MenuItem
                   onClick={() => handleSortBy('Popular', 'popular')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Popular
                  </MenuItem>


                  <MenuItem
                   onClick={() => handleSortBy('Featured', 'featured')}
                    className="!text-[13px] !text-[#000] !capitalize"
                  >
                    Featured
                  </MenuItem>

                </Menu>
              </div>
            </div>
               
       


            <div
              
                 className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
               {
                isLoading === true ? <ProductLoadingGrid view="grid" />
                  :
                 filteredProducts?.length !== 0 && filteredProducts?.map((item, index) => {
                    return (
                      <ProductItem key={index} item={item} />
                    )
                  })

              }
            </div>

            {
              totalPages > 1 &&
              <div className="flex items-center justify-center mt-10">
                <Pagination
                  showFirstButton showLastButton
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                />
              </div>
            }


          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchPage;
