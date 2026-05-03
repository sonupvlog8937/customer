import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

/**
 * BannerGrid - Flipkart-style 2x2 or 2x3 banner grid
 * Admin can manage multiple small banners in a grid layout
 */
const BannerGrid = ({ banners = [], columns = 3 }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="banner-grid-section py-5 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="mb-5">
          <h2 className="text-[22px] font-[800] text-gray-900 mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Shop by Category
          </h2>
          <p className="text-[13px] text-gray-500 mb-0">
            Explore our trending fashion collections
          </p>
        </div>

        <div 
          className={`banner-grid grid gap-4 lg:gap-5`}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          {banners.map((banner, index) => (
            <Link 
              key={banner?._id || index}
              to={banner?.link || `/products?catId=${banner?.catId}`}
              className="banner-grid-item group relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: '4/5',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              }}
            >
              {/* Image with better object-fit */}
              <img
                src={banner?.images?.[0] || banner?.image}
                alt={banner?.title || 'Banner'}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80';
                }}
              />
              
              {/* Gradient Overlay - Enhanced */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content - Enhanced */}
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white text-[16px] lg:text-[18px] font-[800] mb-1.5 drop-shadow-lg leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {banner.title}
                </h3>
                {banner?.subtitle && (
                  <p className="text-white/90 text-[12px] lg:text-[13px] mb-3 drop-shadow-md font-[500]">
                    {banner.subtitle}
                  </p>
                )}
                
                {/* CTA Button */}
                <div className="inline-flex items-center gap-1.5 text-[12px] font-[700] text-white px-4 py-2 rounded-lg transition-all group-hover:gap-2.5 group-hover:px-5"
                  style={{ background: 'rgba(255,107,43,0.9)', backdropFilter: 'blur(10px)' }}>
                  Explore Now →
                </div>
              </div>

              {/* Badge - Enhanced */}
              {banner?.badge && (
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] lg:text-[11px] font-[800] text-white uppercase tracking-wider shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8C55 100%)',
                    boxShadow: '0 4px 12px rgba(255,107,43,0.4)'
                  }}>
                  {banner.badge}
                </div>
              )}

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                  animation: 'shine 2s infinite'
                }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerGrid;
