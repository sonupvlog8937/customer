import React, { useEffect, useMemo, useState, useCallback, useRef, lazy, Suspense } from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { fetchDataFromApi } from "../../utils/api";
import { useAppContext } from "../../hooks/useAppContext";
import ProductLoading from "../../components/ProductLoading";
import BannerLoading from "../../components/LoadingSkeleton/bannerLoading";
import CategorySkeleton from "../../components/LoadingSkeleton/CategorySkeleton";
import FlashSaleSkeleton from "../../components/LoadingSkeleton/FlashSaleSkeleton";
import SectionSkeleton from "../../components/LoadingSkeleton/SectionSkeleton";
import { MdArrowRightAlt, MdArrowForward } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt, FaRegCopy, FaStar } from "react-icons/fa";
import "./style.css";

// ✅ FIX 1: Heavy components — lazy load karo
// Ye sab pehle initial bundle mein the. Ab sirf viewport mein aane pe load honge.
// Initial JS parse time kaafi kam ho jaayega.
const HomeSlider        = lazy(() => import("../../components/HomeSlider"));
const HomeCatSlider     = lazy(() => import("../../components/HomeCatSlider"));
const AdsBannerSlider   = lazy(() => import("../../components/AdsBannerSlider"));
const AdsBannerSliderV2 = lazy(() => import("../../components/AdsBannerSliderV2"));
const ProductItem       = lazy(() => import("../../components/ProductItem"));
const BlogItem          = lazy(() => import("../../components/BlogItem"));
const HomeBannerV2      = lazy(() => import("../../components/HomeSliderV2"));
const BannerBoxV2       = lazy(() => import("../../components/bannerBoxV2"));

// ⭐ NEW: Flipkart-style banner components
const FullWidthBanner   = lazy(() => import("../../components/FullWidthBanner"));
const DualBanner        = lazy(() => import("../../components/DualBanner"));
const BannerGrid        = lazy(() => import("../../components/BannerGrid"));
const CategoryBanner    = lazy(() => import("../../components/CategoryBanner"));
const DealOfTheDay      = lazy(() => import("../../components/DealOfTheDay"));

// ✅ FIX 2: Swiper — sirf modules import karo jo chahiye, poora swiper nahi
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { Navigation, FreeMode, Autoplay, Pagination } from "swiper/modules";
// EffectFade remove kiya — use nahi ho raha tha, extra KB load ho raha tha


const FAQS = [
  { q: "How fast is shipping?", a: "Metro cities: 1-2 days, others: 3-5 days with live tracking via SMS & email." },
  { q: "Do you offer cash on delivery?", a: "Yes, COD is available on most pin codes with a nominal handling fee." },
  { q: "Can I return a product?", a: "Yes, easy 7-day returns on eligible products. Start from My Orders page." },
  { q: "Are my payments secure?", a: "100%. We use industry-standard SSL encryption and trusted payment gateways." },
];

const TIMER_LABELS = ["HRS", "MIN", "SEC"];
const REVIEWS = [
  { text: "Amazing quality and super fast delivery. Will definitely order again!", author: "Priya S.", location: "Mumbai", avatar: "P", rating: 5 },
  { text: "Packaging was premium and product exactly as shown. No surprises at all!", author: "Rahul M.", location: "Delhi", avatar: "R", rating: 5 },
  { text: "Customer support resolved my issue in under 10 minutes. Absolutely 5 stars!", author: "Anita K.", location: "Bangalore", avatar: "A", rating: 5 },
];

// ─── All Products Section with Infinite Scroll ────────────────────────────────
const PRODUCTS_PER_PAGE = 10;

const AllProductsSection = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [page, setPage]               = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  
  // Intersection Observer ref
  const observerTarget = useRef(null);

  // ✅ Initial load - Page 1
  useEffect(() => {
    fetchDataFromApi(`/api/product/getAllProducts?page=1&limit=${PRODUCTS_PER_PAGE}`)
      .then(res => {
        const products = res?.products || [];
        const total = res?.totalProducts ?? res?.total ?? 0;
        
        setAllProducts(products);
        setTotalProducts(total);
        setHasMore(products.length < total);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setLoading(false);
      });
  }, []);

  // ✅ Load more products
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    
    fetchDataFromApi(`/api/product/getAllProducts?page=${nextPage}&limit=${PRODUCTS_PER_PAGE}`)
      .then(res => {
        const newProducts = res?.products || [];
        const total = res?.totalProducts ?? res?.total ?? totalProducts;
        
        setAllProducts(prev => [...prev, ...newProducts]);
        setTotalProducts(total);
        setPage(nextPage);
        
        // Check if there are more products
        const updatedTotal = allProducts.length + newProducts.length;
        setHasMore(updatedTotal < total);
        setLoadingMore(false);
      })
      .catch(error => {
        console.error('Error loading more products:', error);
        setLoadingMore(false);
      });
  }, [page, loadingMore, hasMore, allProducts.length, totalProducts]);

  // ✅ Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible, load more
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          console.log('🔄 Loading more products...', { hasMore, loadingMore, page });
          loadMoreProducts();
        }
      },
      {
        root: null, // viewport
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadMoreProducts]);

  return (
    <section className="py-6 bg-white" style={{ borderTop: "1.5px solid #F1F3F5" }}>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-heading text-[22px] font-[800] text-gray-900 mb-0"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All Products</h2>
            {!loading && (
              <p className="text-[13px] text-gray-400 mt-0.5 mb-0">
                Showing {allProducts.length} of {totalProducts} products
              </p>
            )}
          </div>
          <Link to="/products">
            <button className="cta-orange group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-[700] text-white">
              View All <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}><MdArrowRightAlt size={15} /></span>
            </button>
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductLoading />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {allProducts.map((item, index) => (
                <Suspense key={item?._id || index} fallback={null}>
                  <ProductItem item={item} />
                </Suspense>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 border-2 border-orange-200 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-[13px] font-[600] text-orange-700">Loading more products...</span>
                </div>
              </div>
            )}

            {/* Intersection Observer Sentinel */}
            {hasMore && !loadingMore && (
              <div 
                ref={observerTarget} 
                className="h-10 flex items-center justify-center mt-6"
                style={{ minHeight: '40px' }}
              >
                <div className="text-[12px] text-gray-300">↓ Scroll for more</div>
              </div>
            )}

            {/* End of Products Message */}
            {!hasMore && totalProducts > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100">
                  <div className="text-[32px]">🎉</div>
                  <div>
                    <p className="text-[15px] font-[700] text-gray-800 mb-1">You've seen all products!</p>
                    <p className="text-[13px] text-gray-500 mb-3">Explore more in our categories</p>
                    <Link to="/products">
                      <button className="cta-orange px-6 py-2 rounded-xl text-[13px] font-[700] text-white inline-flex items-center gap-2">
                        Browse Categories <MdArrowRightAlt size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  const [value, setValue]                       = useState(0);
  const [homeSlidesData, setHomeSlidesData]     = useState([]);
  const [popularProductsData, setPopularProductsData] = useState([]);
  const [productsData, setAllProductsData]      = useState([]);
  const [productsBanners, setProductsBanners]   = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bannerV1Data, setBannerV1Data]         = useState([]);
  const [bannerList2Data, setBannerList2Data]   = useState([]);
  const [blogData, setBlogData]                 = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail]   = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [couponMessage, setCouponMessage]       = useState("");
  const [activeFaq, setActiveFaq]               = useState(0);
  const [timeLeft, setTimeLeft]                 = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [activeSlide, setActiveSlide]           = useState(0);
  
  // ✅ Loading States
  const [isLoadingHome, setIsLoadingHome]       = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);

  // ⭐ NEW: Sample data for new banner types (Replace with API calls)
  const [fullWidthBannerData, setFullWidthBannerData] = useState(null);
  const [dualBannerData, setDualBannerData]     = useState(null);
  const [bannerGridData, setBannerGridData]     = useState([]);
  const [categoryBannerData, setCategoryBannerData] = useState([]);
  const [dealOfDayData, setDealOfDayData]       = useState(null);

  const context  = useAppContext();
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Countdown timer
  useEffect(() => {
    const nextMidnight = new Date();
    nextMidnight.setHours(23, 59, 59, 999);
    const timer = setInterval(() => {
      const diff = nextMidnight - new Date();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); clearInterval(timer); return; }
      setTimeLeft({
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".scroll-reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ✅ OPTIMIZATION: Homepage data - sirf zaroori data fetch karo with caching
  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);
    
    // Check cache first
    const cachedHomeData = sessionStorage.getItem('home_data_cache');
    const cacheTime = sessionStorage.getItem('home_data_cache_time');
    const now = Date.now();
    
    // 2 minute cache for homepage data
    if (cachedHomeData && cacheTime && (now - parseInt(cacheTime)) < 120000) {
      try {
        const cached = JSON.parse(cachedHomeData);
        setHomeSlidesData(cached.slides || []);
        setAllProductsData(cached.products || []);
        setProductsBanners(cached.products || []); // Same data reuse
        setFeaturedProducts(cached.featured || []);
        setBannerV1Data(cached.bannerV1 || []);
        setBannerList2Data(cached.bannerList2 || []);
        setBlogData(cached.blogs || []);
        setIsLoadingHome(false);
        
        // ⭐ Load sample banner data (Replace with API calls later)
        loadSampleBannerData();
        return;
      } catch (error) {
        console.error('Cache parse error:', error);
        // If cache is corrupted, fetch fresh data
      }
    }
    
    // Fetch fresh data - parallel requests
    setIsLoadingHome(true);
    Promise.all([
      fetchDataFromApi("/api/homeSlides"),
      fetchDataFromApi("/api/product/getAllProducts?page=1&limit=12"),
      fetchDataFromApi("/api/product/getAllFeaturedProducts"),
      fetchDataFromApi("/api/bannerV1"),
      fetchDataFromApi("/api/bannerList2"),
      fetchDataFromApi("/api/blog"),
    ]).then(([slides, products, featured, bannerV1, bannerList2, blogs]) => {
      if (!isMounted) return;
      
      const homeData = {
        slides: slides?.data || [],
        products: products?.products || [],
        featured: featured?.products || [],
        bannerV1: bannerV1?.data || [],
        bannerList2: bannerList2?.data || [],
        blogs: blogs?.blogs || [],
      };
      
      setHomeSlidesData(homeData.slides);
      setAllProductsData(homeData.products);
      setProductsBanners(homeData.products); // Same data reuse
      setFeaturedProducts(homeData.featured);
      setBannerV1Data(homeData.bannerV1);
      setBannerList2Data(homeData.bannerList2);
      setBlogData(homeData.blogs);
      
      // Cache the data
      sessionStorage.setItem('home_data_cache', JSON.stringify(homeData));
      sessionStorage.setItem('home_data_cache_time', now.toString());
      
      setIsLoadingHome(false);
      
      // ⭐ Load sample banner data (Replace with API calls later)
      loadSampleBannerData();
    }).catch((error) => {
      console.error('Data fetch error:', error);
      if (isMounted) setIsLoadingHome(false);
    });
    
    return () => { isMounted = false; };
  }, []);

  // ⭐ NEW: Load sample banner data (Replace with actual API calls)
  const loadSampleBannerData = () => {
    // Full-Width Banner - Fashion Sale
    setFullWidthBannerData({
      title: "Mega Fashion Sale",
      subtitle: "Up to 70% off on trending styles - Shirts, Jeans, Kurtas & More",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
      badge: "FASHION SALE",
      ctaText: "Shop Now",
      link: "/products"
    });

    // Dual Banner - Men's & Women's Fashion
    setDualBannerData({
      leftBanner: {
        title: "Men's Collection",
        subtitle: "Shirts, Jeans, T-Shirts & Formal Wear",
        image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80",
        badge: "NEW ARRIVALS",
        ctaText: "Shop Men's",
        link: "/products?cat=mens"
      },
      rightBanner: {
        title: "Women's Fashion",
        subtitle: "Kurtis, Sarees, Lehengas & Casual Wear",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
        badge: "TRENDING",
        ctaText: "Shop Women's",
        link: "/products?cat=womens"
      }
    });

    // Banner Grid - Fashion Categories
    setBannerGridData([
      {
        _id: "grid1",
        title: "Shirts & T-Shirts",
        subtitle: "Casual & Formal",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
        badge: "30% OFF",
        link: "/products?cat=shirts"
      },
      {
        _id: "grid2",
        title: "Jeans & Pants",
        subtitle: "Trending styles",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
        badge: "SALE",
        link: "/products?cat=jeans"
      },
      {
        _id: "grid3",
        title: "Kurtas & Kurtis",
        subtitle: "Ethnic collection",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
        badge: "NEW",
        link: "/products?cat=kurtas"
      },
      {
        _id: "grid4",
        title: "Sarees & Lehengas",
        subtitle: "Traditional wear",
        image: "data:image/webp;base64,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",
        badge: "HOT",
        link: "/products?cat=ethnic"
      },
      {
        _id: "grid5",
        title: "Formal Wear",
        subtitle: "Office & Events",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
        badge: "TRENDING",
        link: "/products?cat=formal"
      },
      {
        _id: "grid6",
        title: "Casual Style",
        subtitle: "Everyday comfort",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
        badge: "NEW",
        link: "/products?cat=casual"
      }
    ]);

    // Deal of the Day - Fashion Item
    setDealOfDayData({
      title: "Designer Kurta Set",
      subtitle: "Premium cotton fabric with intricate embroidery",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
      badge: "Deal of the Day",
      discount: 50,
      endTime: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      ctaText: "Grab Deal Now",
      link: "/products"
    });
  };

  // Login popup
  useEffect(() => {
    if (context?.isLogin === false) {
      const t = setTimeout(() => setShowLoginPopup(true), 900);
      return () => clearTimeout(t);
    }
    setShowLoginPopup(false);
  }, [context?.isLogin]);

  // ✅ OPTIMIZATION: Popular products + Random category products - efficient loading
  useEffect(() => {
    if (!context?.catData?.length) return;
    
    // Check cache
    const cachedCatProducts = sessionStorage.getItem('cat_products_cache');
    const cacheTime = sessionStorage.getItem('cat_products_cache_time');
    const now = Date.now();
    
    // 3 minute cache
    if (cachedCatProducts && cacheTime && (now - parseInt(cacheTime)) < 180000) {
      try {
        const cached = JSON.parse(cachedCatProducts);
        setPopularProductsData(cached.popular || []);
        setRandomCatProducts(cached.random || []);
        setIsLoadingPopular(false);
        return;
      } catch (error) {
        console.error('Cache parse error:', error);
      }
    }
    
    // Fetch popular products (first category)
    setIsLoadingPopular(true);
    fetchDataFromApi(`/api/product/getAllProductsByCatId/${context.catData[0]?._id}`)
      .then((res) => { 
        if (res?.error === false) {
          setPopularProductsData(res?.products);
          setIsLoadingPopular(false);
          
          // Cache popular products
          sessionStorage.setItem('cat_products_cache', JSON.stringify({
            popular: res?.products,
            random: []
          }));
          sessionStorage.setItem('cat_products_cache_time', now.toString());
        }
      })
      .catch(() => {
        setIsLoadingPopular(false);
      });

    // ✅ OPTIMIZATION: Random category products - limit to 2 categories instead of 4
    // Reduce API calls from 4 to 2
    const catIds = context.catData
      .map((_, i) => i).filter(i => i !== 0)
      .sort(() => Math.random() - 0.5).slice(0, 2); // Changed from 4 to 2

    Promise.all(
      catIds.map(i =>
        fetchDataFromApi(`/api/product/getAllProductsByCatId/${context.catData[i]?._id}`)
          .then(res => ({ catName: context.catData[i]?.name, data: res?.products || [] }))
      )
    ).then(results => {
      const filtered = results.filter(r => r.data.length > 0);
      setRandomCatProducts(filtered);
      
      // Update cache with random products
      const existingCache = JSON.parse(sessionStorage.getItem('cat_products_cache') || '{}');
      sessionStorage.setItem('cat_products_cache', JSON.stringify({
        ...existingCache,
        random: filtered
      }));
    }).catch((error) => {
      console.error('Random products fetch error:', error);
    });
  }, [context?.catData]);

  const handleChange = useCallback((_, newValue) => setValue(newValue), []);

  const filterByCatId = useCallback((id) => {
    setPopularProductsData([]);
    fetchDataFromApi(`/api/product/getAllProductsByCatId/${id}`)
      .then((res) => { if (res?.error === false) setPopularProductsData(res?.products); });
  }, []);

  // ✅ FIX 6: searchTerm — remove kiya, pehle filteredProducts bana raha tha
  // lekin koi search input is component mein nahi tha — dead code tha
  const filteredProducts = useMemo(() => productsData, [productsData]);


  const copyCouponCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("SAVE20");
      setCouponMessage("✓ Copied: SAVE20");
      setTimeout(() => setCouponMessage(""), 2500);
    } catch {
      setCouponMessage("Copy manually: SAVE20");
    }
  }, []);

  const subscribeNewsletter = useCallback((e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      setNewsletterMessage("Please enter a valid email address."); return;
    }
    setNewsletterMessage("🎉 You're subscribed! Check your inbox for exclusive deals.");
    setNewsletterEmail("");
  }, [newsletterEmail]);

  return (
    <div className="home-root" style={{ background: "#ffffff" }}>

      {/* ─── Login Popup ─────────────────────────────────────────────────── */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
          <div className="popup-card w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative overflow-hidden p-7" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #FF9A5C 100%)" }}>
              <div className="float-1 absolute top-3 right-6 w-20 h-20 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.4)" }} />
              <div className="float-2 absolute bottom-2 right-16 w-10 h-10 rounded-full opacity-15" style={{ background: "rgba(255,255,255,0.3)" }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: "white" }} />
              <span className="inline-block text-[11px] uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4 text-white font-[600]" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>Welcome</span>
              <h3 className="text-[26px] font-[800] text-white leading-tight mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Exclusive access<br/>awaits you ✨</h3>
              <p className="text-[14px] mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>Login for faster checkout, wishlist sync, premium offers & smart order tracking.</p>
            </div>
            <div className="p-6 bg-white">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                <button className="h-[46px] rounded-xl font-[700] text-[14px] text-white transition-all cta-orange"
                  onClick={() => { setShowLoginPopup(false); navigate("/login"); }}>Login Now</button>
                <button className="h-[46px] rounded-xl font-[700] text-[14px] transition-all cta-outline"
                  onClick={() => { setShowLoginPopup(false); navigate("/register"); }}>Register</button>
              </div>
              <button className="w-full text-[13px] py-1 transition-colors text-gray-400 hover:text-gray-600"
                onClick={() => setShowLoginPopup(false)}>Canel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF8F4 0%, #FFF4EE 100%)" }}>
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center py-2 lg:py-4">

            {/* Right: Slider — ✅ FIX 7: first image eager load, baaki lazy */}
            <div className="lg:col-span-12 anim-slide-right">
              {isLoadingHome ? (
                <BannerLoading />
              ) : (
                homeSlidesData?.length !== 0 ? (
                  <Swiper loop spaceBetween={0} modules={[Autoplay, Pagination]}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }} className="hero-swiper"
                    style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(255,107,43,0.15)" }}
                    onSlideChange={(s) => setActiveSlide(s.realIndex)}>
                    <HomeSlider data={homeSlidesData} />
                  </Swiper>
                ) : (
                  <div className="text-center py-10 text-gray-400">No banners available</div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category Slider ─────────────────────────────────────────────── */}
      {!context?.catData || context?.catData?.length === 0 ? (
        <CategorySkeleton />
      ) : (
        <div style={{ background: "#FAFAFA", borderTop: "1.5px solid #F1F3F5", borderBottom: "1.5px solid #F1F3F5" }}>
          <Suspense fallback={<CategorySkeleton />}>
            <HomeCatSlider data={context?.catData} />
          </Suspense>
        </div>
      )}

      {/* ⭐ NEW: Full-Width Banner - Major Promotion */}
      {/* {fullWidthBannerData && (
        <Suspense fallback={null}>
          <FullWidthBanner banner={fullWidthBannerData} />
        </Suspense>
      )} */}

      {/* ─── Popular Products ────────────────────────────────────────────── */}
      {!context?.catData || context?.catData?.length === 0 || isLoadingPopular ? (
        <SectionSkeleton title={true} products={8} />
      ) : (
        <section className="bg-white py-6">
          <div className="container">
            <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
              <h2 className="section-heading text-[22px] font-[800] text-gray-900 flex-shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Popular Products</h2>
              <Link to="/products" className="flex-shrink-0">
                <button className="cta-orange group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-[700] text-white">
                  View All <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}><MdArrowRightAlt size={15} /></span>
                </button>
              </Link>
              {/* ✅ FIX 8: Tabs — MUI Tabs import hata diya, native buttons use karo
                  MUI Tabs bohot heavy hain sirf category filter ke liye */}
              <div className="w-full flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {context?.catData?.map((cat, index) => (
                  <button key={index}
                    onClick={() => { setValue(index); filterByCatId(cat?._id); }}
                    className="flex-shrink-0 text-[13px] px-4 py-1.5 rounded-full transition-all font-[500]"
                    style={{
                      background: value === index ? "#FF6B2B" : "#F5F5F5",
                      color:      value === index ? "#fff"    : "#374151",
                      fontWeight: value === index ? 700       : 500,
                      border: "none", cursor: "pointer",
                    }}>
                    {cat?.name}
                  </button>
                ))}
              </div>
            </div>
            {popularProductsData?.length === 0
              ? <ProductLoading />
              : (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {popularProductsData.slice(0, 8).map((item, index) => (
                    <Suspense key={item?._id || index} fallback={null}>
                      <ProductItem item={item} />
                    </Suspense>
                  ))}
                </div>
              )
            }
          </div>
        </section>
      )}

      {/* ─── Flash Sale Banner ───────────────────────────────────────────── */}
      {isLoadingHome ? (
        <FlashSaleSkeleton />
      ) : (
        <section className="py-5 bg-white">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 flex-wrap"
              style={{ 
                background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
                border: "2px solid rgba(255,107,43,0.2)"
              }}>
              
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
                style={{ 
                  background: 'radial-gradient(circle, #FF6B2B 0%, transparent 70%)',
                  filter: 'blur(80px)',
                  animation: 'pulse 4s ease-in-out infinite'
                }} />
              
              {/* Left: Content */}
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: 'rgba(255,107,43,0.2)' }}>
                    <FaBolt className="text-orange-500 text-[14px] animate-pulse" />
                  </div>
                  <span className="text-[12px] uppercase tracking-[0.15em] text-orange-400 font-[800]">
                    Flash Sale
                  </span>
                </div>
                
                <h3 className="text-[28px] lg:text-[36px] font-[900] text-white mb-2 leading-tight"
                  style={{ 
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    letterSpacing: '-0.02em'
                  }}>
                  Ends Tonight! 🔥
                </h3>
                
                <p className="text-[14px] lg:text-[15px] text-white/80 mb-0 font-[500]">
                  Hurry up — prices reset at midnight!
                </p>
              </div>

              {/* Center: Timer */}
              <div className="relative z-10 flex items-center gap-3 lg:gap-4">
                {[
                  { val: timeLeft.hours, label: 'HRS' },
                  { val: timeLeft.minutes, label: 'MIN' },
                  { val: timeLeft.seconds, label: 'SEC' }
                ].map((t, idx) => (
                  <React.Fragment key={idx}>
                    {idx !== 0 && (
                      <span className="text-orange-500/40 text-[24px] font-light mb-4">:</span>
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="timer-digit-enhanced w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-[24px] lg:text-[28px] font-[900] text-white relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(255,107,43,0.15) 0%, rgba(255,107,43,0.05) 100%)',
                          border: '2px solid rgba(255,107,43,0.3)',
                          boxShadow: '0 8px 24px rgba(255,107,43,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                        }}>
                        {String(t.val).padStart(2, "0")}
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-30"
                          style={{
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                            backgroundSize: '200% 200%',
                            animation: 'shine-timer 3s infinite'
                          }} />
                      </div>
                      <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.15em] text-orange-400/70 font-[700]">
                        {t.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Right: CTA */}
              <div className="relative z-10 flex flex-col items-start sm:items-end gap-3">
                <button 
                  onClick={copyCouponCode}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-[800] text-[14px] lg:text-[15px] transition-all hover:scale-105 active:scale-95 group"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8C55 100%)',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(255,107,43,0.4)'
                  }}>
                  <FaRegCopy className="text-[14px] group-hover:rotate-12 transition-transform" />
                  Copy SAVE20
                </button>
                
                {couponMessage && (
                  <p className="text-[12px] text-green-400 mb-0 font-[700] flex items-center gap-1.5 animate-fade-in">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    {couponMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ⭐ NEW: Dual Banner - Two Offers Side by Side */}
      {dualBannerData && (
        <Suspense fallback={null}>
          <DualBanner 
            leftBanner={dualBannerData.leftBanner} 
            rightBanner={dualBannerData.rightBanner} 
          />
        </Suspense>
      )}

      {/* ⭐ NEW: Banner Grid - Multiple Categories */}
      {bannerGridData.length > 0 && (
        <Suspense fallback={null}>
          <BannerGrid banners={bannerGridData} columns={3} />
        </Suspense>
      )}

      {/* ─── Product Banner V2 + Side Banners ───────────────────────────── */}
      <section className="py-4 pt-0 bg-white">
        <div className="container flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-[70%]">
            {productsBanners?.length > 0 && (
              <Suspense fallback={null}><HomeBannerV2 data={productsBanners} /></Suspense>
            )}
          </div>
          <div className="w-full lg:w-[30%] flex items-center gap-4 justify-between flex-row lg:flex-col">
            {bannerV1Data?.length > 1 ? (
              <Suspense fallback={null}>
                <BannerBoxV2 image={bannerV1Data[bannerV1Data.length - 1]?.images[0]} item={bannerV1Data[bannerV1Data.length - 1]} />
                <BannerBoxV2 image={bannerV1Data[bannerV1Data.length - 2]?.images[0]} item={bannerV1Data[bannerV1Data.length - 2]} />
              </Suspense>
            ) : <BannerLoading />}
          </div>
        </div>
      </section>

     

      {/* ⭐ NEW: Delivery Promise / Benefits Section ─────────────────────── */}
      <section className="py-6 bg-gradient-to-b from-white to-orange-50/30">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {/* Benefit 1: Free Shipping */}
            <div className="benefit-card-enhanced group relative overflow-hidden rounded-2xl p-5 lg:p-6 bg-white border-2 border-orange-100 transition-all duration-300 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2">
              {/* Icon Circle */}
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.05) 100%)',
                  border: '2px solid rgba(255,107,43,0.2)'
                }}>
                <LiaShippingFastSolid className="text-[28px] text-orange-600" />
              </div>
              
              {/* Content */}
              <h3 className="text-[15px] lg:text-[16px] font-[800] text-gray-900 mb-1.5 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Free Shipping
              </h3>
              <p className="text-[12px] lg:text-[13px] text-gray-600 mb-0 leading-relaxed">
                On orders above ₹200
              </p>

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,107,43,0.05) 0%, transparent 70%)'
                }} />
            </div>

            {/* Benefit 2: Easy Returns */}
            <div className="benefit-card-enhanced group relative overflow-hidden rounded-2xl p-5 lg:p-6 bg-white border-2 border-orange-100 transition-all duration-300 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.05) 100%)',
                  border: '2px solid rgba(255,107,43,0.2)'
                }}>
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              
              <h3 className="text-[15px] lg:text-[16px] font-[800] text-gray-900 mb-1.5 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Easy Returns
              </h3>
              <p className="text-[12px] lg:text-[13px] text-gray-600 mb-0 leading-relaxed">
                7-day return policy
              </p>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,107,43,0.05) 0%, transparent 70%)'
                }} />
            </div>

            {/* Benefit 3: Secure Payment */}
            <div className="benefit-card-enhanced group relative overflow-hidden rounded-2xl p-5 lg:p-6 bg-white border-2 border-orange-100 transition-all duration-300 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.05) 100%)',
                  border: '2px solid rgba(255,107,43,0.2)'
                }}>
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h3 className="text-[15px] lg:text-[16px] font-[800] text-gray-900 mb-1.5 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Secure Payment
              </h3>
              <p className="text-[12px] lg:text-[13px] text-gray-600 mb-0 leading-relaxed">
                100% safe & secure
              </p>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,107,43,0.05) 0%, transparent 70%)'
                }} />
            </div>

            {/* Benefit 4: 24/7 Support */}
            <div className="benefit-card-enhanced group relative overflow-hidden rounded-2xl p-5 lg:p-6 bg-white border-2 border-orange-100 transition-all duration-300 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2">
              <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.05) 100%)',
                  border: '2px solid rgba(255,107,43,0.2)'
                }}>
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              
              <h3 className="text-[15px] lg:text-[16px] font-[800] text-gray-900 mb-1.5 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                24/7 Support
              </h3>
              <p className="text-[12px] lg:text-[13px] text-gray-600 mb-0 leading-relaxed">
                Always here to help
              </p>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,107,43,0.05) 0%, transparent 70%)'
                }} />
            </div>
          </div>
        </div>
      </section>

      {/* Banner Slider Below */}
          {bannerV1Data?.length !== 0 && (
            <div className="mt-5">
              <Suspense fallback={null}><AdsBannerSliderV2 items={4} data={bannerV1Data} /></Suspense>
            </div>
          )}

      {/* ─── Latest Products ─────────────────────────────────────────────── */}
      {isLoadingHome ? (
        <SectionSkeleton title={true} products={8} />
      ) : (
        <section className="py-5 pt-0 bg-white">
          <div className="container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading text-[22px] font-[800] text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Latest Products</h2>
              <Link to="/products">
                <button className="flex items-center gap-1.5 text-[13px] font-[600] px-4 py-2.5 rounded-xl transition-all"
                  style={{ color: "#FF6B2B", border: "1.5px solid rgba(255,107,43,0.2)", background: "rgba(255,107,43,0.04)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,107,43,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,107,43,0.04)"; }}>
                  View All <MdArrowRightAlt size={18} />
                </button>
              </Link>
            </div>
            {filteredProducts?.length === 0
              ? <ProductLoading />
              : (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {filteredProducts.slice(0, 8).map((item, index) => (
                    <Suspense key={item?._id || index} fallback={null}>
                      <ProductItem item={item} />
                    </Suspense>
                  ))}
                </div>
              )
            }
          </div>
        </section>
      )}

      {/* ─── Featured Products ───────────────────────────────────────────── */}
      {isLoadingHome ? (
        <SectionSkeleton title={true} products={8} />
      ) : (
        <section className="py-2 pb-5 bg-white">
          <div className="container">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <h2 className="section-heading text-[22px] font-[800] text-gray-900 flex-shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Featured Products</h2>
              <Link to="/products" className="flex-shrink-0">
                <button className="cta-orange group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-[700] text-white">
                  View All <span className="inline-flex items-center justify-center w-5 h-5 rounded-full group-hover:translate-x-0.5 transition-transform" style={{ background: "rgba(255,255,255,0.2)" }}><MdArrowRightAlt size={15} /></span>
                </button>
              </Link>
            </div>
            {featuredProducts?.length === 0
              ? <ProductLoading />
              : (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {featuredProducts.slice(0, 8).map((item, index) => (
                    <Suspense key={item?._id || index} fallback={null}>
                      <ProductItem item={item} />
                    </Suspense>
                  ))}
                </div>
              )
            }
            {bannerList2Data?.length !== 0 && (
              <div className="mt-5">
                <Suspense fallback={null}><AdsBannerSlider items={4} data={bannerList2Data} /></Suspense>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ⭐ NEW: Deal of the Day - Special Offer with Timer */}
      {dealOfDayData && (
        <Suspense fallback={null}>
          <DealOfTheDay deal={dealOfDayData} />
        </Suspense>
      )}

      {/* ─── Random Category Products ────────────────────────────────────── */}
      {randomCatProducts?.map((productRow, index) => {
        if (!productRow?.catName || !productRow?.data?.length) return null;
        return (
          <section className="py-3 pt-0 bg-white" key={index}>
            <div className="container">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-heading text-[20px] font-[800] text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{productRow.catName}</h2>
                {productRow.data.length > 6 && (
                  <Link to={`products?catId=${productRow.data[0]?.catId}`}>
                    <button className="flex items-center gap-1.5 text-[13px] font-[600] px-4 py-2 rounded-xl transition-all"
                      style={{ color: "#FF6B2B", border: "1.5px solid rgba(255,107,43,0.2)", background: "rgba(255,107,43,0.04)" }}>
                      View All <MdArrowRightAlt size={18} />
                    </button>
                  </Link>
                )}
              </div>
              <Suspense fallback={<ProductLoading />}>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {productRow.data.slice(0, 8).map((item, idx) => (
                    <Suspense key={item?._id || idx} fallback={null}>
                      <ProductItem item={item} />
                    </Suspense>
                  ))}
                </div>
              </Suspense>
            </div>
          </section>
        );
      })}

      {/* ─── All Products ────────────────────────────────────────────────── */}
      <AllProductsSection />

      {/* ─── Reviews ─────────────────────────────────────────────────────── */}
      <section className="py-6 bg-white scroll-reveal">
        <div className="container">
          <div className="rounded-2xl p-6 lg:p-8" style={{ background: "linear-gradient(135deg, #FFF8F4 0%, #FFF4EE 100%)", border: "1.5px solid rgba(255,107,43,0.12)" }}>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="section-heading text-[22px] font-[800] text-gray-900 mb-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>What Our Customers Say</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {REVIEWS.map((review, index) => (
                <div key={index} className="review-card bg-white rounded-2xl p-5" style={{ border: "1.5px solid rgba(255,107,43,0.1)", boxShadow: "0 4px 16px rgba(255,107,43,0.06)" }}>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-[13px]" style={{ color: "#f59e0b" }} />)}
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed mb-4">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-[800] text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #FF6B2B, #FF9A5C)" }}>{review.avatar}</div>
                    <div>
                      <span className="text-[13px] font-[700] text-gray-800 block">{review.author}</span>
                      <span className="text-[11px] text-gray-400">{review.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Newsletter ──────────────────────────────────────────────────── */}
      <section className="py-4 bg-white">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl p-6 lg:p-10" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #FF9A5C 60%, #FFB347 100%)", boxShadow: "0 16px 48px rgba(255,107,43,0.3)" }}>
            <div className="float-1 absolute top-0 right-10 w-56 h-56 rounded-full opacity-15 pointer-events-none" style={{ background: "white", filter: "blur(30px)" }} />
            <div className="dot-pattern absolute inset-0 opacity-20 pointer-events-none rounded-2xl" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <span className="inline-block text-[10px] uppercase tracking-[0.22em] mb-3 px-3 py-1 rounded-full text-white font-[600]"
                  style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>Stay updated</span>
                <h3 className="text-[24px] lg:text-[28px] font-[800] text-white mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Exclusive deals, just for you 🎁</h3>
                <p className="text-[14px] mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>Join our newsletter and never miss a flash sale or drop.</p>
              </div>
              <div className="w-full lg:w-[440px]">
                <form onSubmit={subscribeNewsletter} className="flex gap-2">
                  <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address" className="newsletter-input flex-1 rounded-xl px-4 py-3 text-[14px] text-gray-800 bg-white"
                    style={{ border: "2px solid rgba(255,255,255,0.5)", outline: "none" }} />
                  <button type="submit" className="px-5 py-3 rounded-xl font-[700] text-[14px] flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: "white", color: "#FF6B2B", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>Subscribe</button>
                </form>
                {newsletterMessage && <p className="text-[12px] mt-2 mb-0 text-white font-[600]">{newsletterMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-6 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-7">
              <h3 className="text-[24px] font-[800] text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Frequently Asked Questions</h3>
              <p className="text-[14px] text-gray-500 mt-1">Everything you need to know about shopping with us.</p>
            </div>
            <div className="space-y-3">
              {FAQS.map((item, index) => (
                <div key={index} className="rounded-2xl overflow-hidden transition-all"
                  style={{ border: `1.5px solid ${activeFaq === index ? "rgba(255,107,43,0.3)" : "#F1F3F5"}`, background: activeFaq === index ? "rgba(255,107,43,0.02)" : "#FAFAFA", boxShadow: activeFaq === index ? "0 4px 20px rgba(255,107,43,0.08)" : "none" }}>
                  <button onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                    className="w-full text-left font-[700] text-[14px] text-gray-800 flex justify-between items-center px-5 py-4 transition-all"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.q}
                    <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[18px] font-[400] transition-all"
                      style={{ background: activeFaq === index ? "#FF6B2B" : "#F1F3F5", color: activeFaq === index ? "white" : "#9CA3AF", transform: activeFaq === index ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                  </button>
                  <div className={`faq-answer ${activeFaq === index ? "open" : ""}`}>
                    <p className="text-[14px] text-gray-500 px-5 pb-5 mb-0 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Blog ────────────────────────────────────────────────────────── */}
      {blogData?.length !== 0 && (
        <section className="py-6 pb-10 bg-white blogSection" style={{ borderTop: "1.5px solid #F1F3F5" }}>
          <div className="container">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-heading text-[22px] font-[800] text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>From The Blog</h2>
            </div>
            <Swiper slidesPerView={4} spaceBetween={20} navigation={context?.windowWidth < 992 ? false : true}
              modules={[Navigation, FreeMode]} freeMode
              breakpoints={{ 250: { slidesPerView: 1, spaceBetween: 12 }, 500: { slidesPerView: 2, spaceBetween: 16 }, 700: { slidesPerView: 3, spaceBetween: 18 }, 1100: { slidesPerView: 4, spaceBetween: 20 } }}
              className="blogSlider">
              {blogData.slice().reverse().map((item, index) => (
                <SwiperSlide key={index}>
                  <Suspense fallback={null}><BlogItem item={item} /></Suspense>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;