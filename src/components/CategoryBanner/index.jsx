import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';

/**
 * CategoryBanner - Horizontal scrolling category banners (Flipkart-style)
 * Shows multiple categories with images in a slider
 */
const CategoryBanner = ({ categories = [], title = "Shop by Category" }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="category-banner-section py-5 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] lg:text-[22px] font-[800] text-gray-900 mb-0"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {title}
          </h2>
        </div>

        {/* Category Slider */}
        <Swiper
          slidesPerView={2}
          spaceBetween={12}
          freeMode={true}
          navigation={true}
          modules={[Navigation, FreeMode]}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 14 },
            768: { slidesPerView: 4, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 16 },
            1280: { slidesPerView: 6, spaceBetween: 18 },
          }}
          className="category-banner-slider"
        >
          {categories.map((category, index) => (
            <SwiperSlide key={category?._id || index}>
              <Link 
                to={category?.link || `/products?catId=${category?._id || category?.catId}`}
                className="category-banner-item group block"
              >
                {/* Image Container */}
                <div className="category-banner-image relative overflow-hidden rounded-xl lg:rounded-2xl mb-2.5"
                  style={{ 
                    aspectRatio: '1/1',
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
                  }}>
                  <img
                    src={category?.images?.[0] || category?.image}
                    alt={category?.name || category?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  
                  {/* Badge */}
                  {category?.badge && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-[700] text-white"
                      style={{ background: 'rgba(255,107,43,0.95)' }}>
                      {category.badge}
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <h3 className="text-[13px] lg:text-[14px] font-[700] text-gray-800 text-center mb-0.5 group-hover:text-orange-600 transition-colors">
                  {category?.name || category?.title}
                </h3>

                {/* Subtitle */}
                {category?.subtitle && (
                  <p className="text-[11px] lg:text-[12px] text-gray-500 text-center mb-0">
                    {category.subtitle}
                  </p>
                )}
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CategoryBanner;
