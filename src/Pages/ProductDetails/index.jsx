import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link, useParams } from "react-router-dom";
import { ProductZoom } from "../../components/ProductZoom";
import { ProductDetailsComponent } from "../../components/ProductDetails";
import ProductItem from "../../components/ProductItem";
import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { Reviews } from "./reviews";

export const ProductDetails = () => {

  const [activeTab, setActiveTab] = useState(0);
  const [productData, setProductData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [activeImages, setActiveImages] = useState([]);
  const [visibleSpecifications, setVisibleSpecifications] = useState(5);
  const [relatedProductsPage, setRelatedProductsPage] = useState(1);
  const [hasMoreRelatedProducts, setHasMoreRelatedProducts] = useState(false);
  const [isRelatedProductsLoading, setIsRelatedProductsLoading] = useState(false);

  const { id } = useParams();

  const reviewSec = useRef();

  useEffect(() => {
    fetchDataFromApi(`/api/user/getReviews?productId=${id}`).then((res) => {
      if (res?.error === false) {
        setReviewsCount(res.reviews.length)
      }
    })

  }, [reviewsCount])

  const loadRelatedProducts = async (subCatId, pageToLoad, shouldAppend = false) => {
    if (!subCatId) return;

    setIsRelatedProductsLoading(true);

    const res = await fetchDataFromApi(
      `/api/product/getAllProductsBySubCatId/${subCatId}?page=${pageToLoad}&perPage=10`,
    );

    if (res?.error === false) {
      const filteredData = (res?.products || []).filter((item) => item?._id !== id);

      setRelatedProductData((prev) => {
        if (!shouldAppend) return filteredData;

        const existingIds = new Set(prev.map((item) => item?._id));
        const uniqueNewItems = filteredData.filter((item) => !existingIds.has(item?._id));

        return [...prev, ...uniqueNewItems];
      });

      setHasMoreRelatedProducts((res?.products || []).length === 10);
      setRelatedProductsPage(pageToLoad);
    }

    setIsRelatedProductsLoading(false);
  };


  useEffect(() => {
    setIsLoading(true);
    setRelatedProductData([]);
    setRelatedProductsPage(1);
    setHasMoreRelatedProducts(false);

    fetchDataFromApi(`/api/product/${id}`).then(async (res) => {
      if (res?.error === false) {
        setProductData(res?.product);
        setActiveImages(res?.product?.images || []);
        setVisibleSpecifications(5);
        await loadRelatedProducts(res?.product?.subCatId, 1, false);

        setTimeout(() => {
          setIsLoading(false);
        }, 700);
      }
    });


    window.scrollTo(0, 0)
  }, [id])


  const gotoReviews = () => {
    window.scrollTo({
      top: reviewSec?.current.offsetTop - 170,
      behavior: 'smooth',
    })

    setActiveTab(1)

  }

  const breadcrumbItems = [
    productData?.catName && productData?.catId
      ? {
        label: productData?.catName,
        to: `/products?catId=${productData?.catId}`,
      }
      : null,
    productData?.subCat && productData?.subCatId
      ? {
        label: productData?.subCat,
        to: `/products?subCatId=${productData?.subCatId}`,
      }
      : null,
    productData?.thirdsubCat && productData?.thirdsubCatId
      ? {
        label: productData?.thirdsubCat,
        to: `/products?thirdLavelCatId=${productData?.thirdsubCatId}`,
      }
      : null,
  ].filter(Boolean);

  return (
    <>
      <div className="py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="container">
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<span className="text-slate-400">/</span>}
          >
            <Link
              to="/"
              className="link transition text-[13px] font-[500] text-slate-500 hover:text-primary"
            >
              Home
            </Link>
            {breadcrumbItems?.map((breadcrumb) => (
              <Link
                key={breadcrumb?.to}
                to={breadcrumb?.to}
                className="link transition text-[13px] font-[500] text-slate-500 hover:text-primary"
              >
                {breadcrumb?.label}
              </Link>
            ))}

            <span className="text-[13px] font-[600] text-slate-900 line-clamp-1 max-w-[220px] sm:max-w-[420px]">
              {productData?.name}
            </span>
          </Breadcrumbs>
        </div>
      </div>



      <section className="bg-white py-5">
        {
          isLoading === true ?
            <div className="flex items-center justify-center min-h-[300px]">
              <CircularProgress />
            </div>


            :


            <>
              <div className="container bg-gradient-to-br from-white via-[#f8fbff] to-[#f4f6ff] border border-[rgba(0,0,0,0.06)] rounded-2xl shadow-sm p-4 md:p-6 flex gap-6 flex-col lg:flex-row items-start">
                <div className="productZoomContainer w-full lg:w-[50%] bg-white rounded-xl overflow-hidden shadow-sm" style={{ minHeight: "480px" }}>
                  <ProductZoom images={activeImages?.length !== 0 ? activeImages : productData?.images} />
                </div>

                <div className="productContent w-full lg:w-[50%] py-2 pr-2 pl-2 lg:pr-6 lg:pl-4">
                  <ProductDetailsComponent
                    item={productData}
                    reviewsCount={reviewsCount}
                    gotoReviews={gotoReviews}
                    onColorChange={(images) => setActiveImages(images?.length !== 0 ? images : productData?.images || [])}
                  />
                </div>
              </div>

              <div className="container pt-10">
                {/* <div className="flex items-center gap-8 mb-5">
                  <span
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 0 && "text-primary"
                      }`}
                    onClick={() => setActiveTab(0)}
                  >
                    Specifications
                  </span>


                  <span
                    className={`link text-[17px] cursor-pointer font-[500] ${activeTab === 1 && "text-primary"
                      }`}
                    onClick={() => setActiveTab(1)}
                    ref={reviewSec}
                  >
                    Reviews ({reviewsCount})
                  </span>
                </div> */}




                {/* {activeTab === 1 && (
                  <div className="shadow-none lg:shadow-md w-full sm:w-[80%] py-0  lg:py-5 px-0 lg:px-8 rounded-md">
                    {
                      productData?.length !== 0 && <Reviews productId={productData?._id} setReviewsCount={setReviewsCount} />
                    }

                  </div>
                )} */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <h6 className="text-[20px] font-[700] mb-3 py-2">Product Details</h6>
                    <div className="shadow-md border border-[rgba(0,0,0,0.07)] w-full py-6 px-6 md:px-8 rounded-xl text-[14px] my-2 bg-white">
                      {/* <p>{productData?.description}</p> */}
                      {
                        productData?.specifications?.length !== 0 &&
                        <div className="pt-3">
                          <h3 className="text-[16px] font-[700] mb-3">Specifications</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {
                              productData?.specifications?.slice(0, visibleSpecifications)?.map((spec, index) => {
                                return (
                                  <div key={`${spec?.key}-${index}`} className="bg-[#f8f8f8] px-3 py-2 rounded-md border border-[rgba(0,0,0,0.06)]">
                                    <p className="text-[12px] text-[rgba(0,0,0,0.6)] uppercase">{spec?.key}</p>
                                    <p className="text-[14px] font-[500]">{spec?.value}</p>
                                  </div>
                                )
                              })
                            }
                          </div>
                          {
                            productData?.specifications?.length > visibleSpecifications &&
                            <button
                              type="button"
                              className="btn-org rounded-md mt-4 text-primary font-[500]"
                              onClick={() => setVisibleSpecifications((prev) => prev + 5)}
                            >
                              See More
                            </button>
                          }

                          {
                            visibleSpecifications > 5 && productData?.specifications?.length <= visibleSpecifications &&
                            <button
                              type="button"
                              className="btn-org rounded-md mt-4 text-primary font-[500]"
                              onClick={() => setVisibleSpecifications(5)}
                            >
                              See Less
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>
                  <div className="xl:col-span-1">
                    <div className="bg-gradient-to-br from-[#fff9f6] to-[#f4f8ff] border border-[rgba(0,0,0,0.07)] rounded-xl p-5 sticky top-24">
                      <h4 className="text-[17px] font-[700] mb-2">Why buy this product?</h4>
                      <ul className="text-[14px] space-y-2 text-[rgba(0,0,0,0.75)] list-disc pl-4">
                        <li>Fresh stock with dynamic pricing from live product database.</li>
                        <li>Fast delivery and secure checkout support.</li>
                        <li>Detailed specifications and verified customer reviews.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="xl:col-span-3 shadow-none lg:shadow-md w-full sm:w-[80%] py-0  lg:py-5 px-0 lg:px-8 rounded-md">
                    {
                      productData?.length !== 0 && <Reviews productId={productData?._id} setReviewsCount={setReviewsCount} />
                    }

                  </div>
                </div>
              </div>
              <div className="container pt-8 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="rp-section-head">
                    <h2>Related Products</h2>
                    <div className="rp-line" />

                  </div>
                </div>
                {
                  relatedProductData?.length !== 0 ?
                    <>
                      <div className="grid lg:grid-cols-5 grid-cols-2 sm:grid-cols-2 gap-4">
                        {
                          relatedProductData?.map((item) => (
                            <ProductItem key={item?._id} item={item} />
                          ))
                        }
                      </div>

                      {
                        hasMoreRelatedProducts &&
                        <div className="flex justify-center mt-6">
                          <button
                            type="button"
                            className="btn-org min-w-[160px] !rounded-full"
                            onClick={() => loadRelatedProducts(productData?.subCatId, relatedProductsPage + 1, true)}
                            disabled={isRelatedProductsLoading}
                          >
                            {isRelatedProductsLoading ? "Loading..." : "Load More"}
                          </button>
                        </div>
                      }
                    </>
                    :
                    !isRelatedProductsLoading &&
                    <div className="text-center text-[14px] text-[rgba(0,0,0,0.6)] py-8 border rounded-lg bg-[#fafafa]">No related products found.</div>
                }
              </div>
            </>

        }




      </section>
    </>
  );
};


