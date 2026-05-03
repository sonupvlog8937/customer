import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';
import './style.css';

/**
 * DualBanner - Two side-by-side banners (Flipkart-style)
 * Perfect for showcasing two different categories or offers
 */
const DualBanner = ({ leftBanner, rightBanner }) => {
  if (!leftBanner && !rightBanner) return null;

  const BannerCard = ({ banner, position }) => {
    if (!banner) return null;

    return (
      <Link 
        to={banner?.link || `/products?catId=${banner?.catId}`}
        className="dual-banner-card group relative overflow-hidden rounded-2xl lg:rounded-3xl"
        style={{ minHeight: '320px' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={banner?.images?.[0] || banner?.image}
            alt={banner?.title || 'Banner'}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-115 group-hover:brightness-110"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';
            }}
          />
          {/* Enhanced Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-${position === 'left' ? 'r' : 'l'} from-black/80 via-black/40 to-transparent`} />
          
          {/* Hover Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-${position === 'left' ? 'r' : 'l'} from-orange-600/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
        </div>

        {/* Decorative Circle */}
        <div className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none blur-3xl`}
          style={{ background: 'white', transform: `translate(${position === 'left' ? '-30%' : '30%'}, -50%)` }} />

        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-end h-full p-6 lg:p-8 ${position === 'left' ? 'items-start' : 'items-end text-right'}`}>
          {/* Badge with Enhanced Style */}
          {banner?.badge && (
            <span className="inline-block text-[11px] lg:text-[12px] uppercase tracking-wider px-4 py-1.5 rounded-full mb-3 text-white font-[800] shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8C55 100%)',
                boxShadow: '0 4px 16px rgba(255,107,43,0.4)'
              }}>
              {banner.badge}
            </span>
          )}

          {/* Title - Enhanced */}
          <h3 className="text-[24px] lg:text-[32px] font-[900] text-white leading-tight mb-2.5"
            style={{ 
              fontFamily: "'Plus Jakarta Sans', sans-serif", 
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              letterSpacing: '-0.01em'
            }}>
            {banner?.title || 'Special Offer'}
          </h3>

          {/* Subtitle - Enhanced */}
          {banner?.subtitle && (
            <p className="text-[13px] lg:text-[15px] text-white/95 mb-4 max-w-[320px] font-[500] leading-relaxed"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              {banner.subtitle}
            </p>
          )}

          {/* CTA Button - Enhanced */}
          <button className="inline-flex items-center gap-2 text-[13px] lg:text-[14px] font-[800] text-white px-6 py-3 rounded-xl transition-all group-hover:gap-3 group-hover:px-7 shadow-xl"
            style={{ 
              background: 'rgba(255,107,43,0.95)', 
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(255,107,43,0.3)'
            }}>
            {banner?.ctaText || 'Explore'}
            <MdArrowForward className="text-[16px]" />
          </button>
        </div>

        {/* Border Glow on Hover */}
        <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-2xl lg:rounded-3xl transition-all duration-500 pointer-events-none" />
        
        {/* Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
            animation: 'shine-dual 2s infinite'
          }} />
      </Link>
    );
  };

  return (
    <section className="dual-banner-section py-5 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <BannerCard banner={leftBanner} position="left" />
          <BannerCard banner={rightBanner} position="right" />
        </div>
      </div>
    </section>
  );
};

export default DualBanner;
