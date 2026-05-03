import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import './style.css';

/**
 * FullWidthBanner - Flipkart-style full-width promotional banner
 * Perfect for major sales, events, or announcements
 */
const FullWidthBanner = ({ banner }) => {
  if (!banner) return null;

  return (
    <section className="full-width-banner-section py-5 bg-white">
      <div className="container">
        <Link 
          to={banner?.link || `/products`}
          className="full-width-banner group relative block overflow-hidden rounded-3xl"
          style={{ minHeight: '280px' }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={banner?.images?.[0] || banner?.image}
              alt={banner?.title || 'Banner'}
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80';
              }}
            />
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'white', transform: 'translate(30%, -30%)', filter: 'blur(80px)' }} />
          
          {/* Animated Dots Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-8 lg:px-16 py-10 lg:py-14">
            {/* Badge with Icon */}
            {banner?.badge && (
              <div className="inline-flex items-center gap-2 w-fit text-[11px] lg:text-[12px] uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-4 text-white font-[800] shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #FF6B2B 0%, #FF8C55 100%)',
                  boxShadow: '0 4px 20px rgba(255,107,43,0.4)'
                }}>
                <FaStar className="text-yellow-300" />
                {banner.badge}
              </div>
            )}

            {/* Title - Enhanced */}
            <h2 className="text-[32px] lg:text-[56px] font-[900] text-white leading-[1.1] mb-3 lg:mb-4 max-w-[700px]"
              style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
                letterSpacing: '-0.02em'
              }}>
              {banner?.title || 'Special Offer'}
            </h2>

            {/* Subtitle - Enhanced */}
            {banner?.subtitle && (
              <p className="text-[15px] lg:text-[18px] text-white/95 mb-6 lg:mb-8 max-w-[550px] font-[500] leading-relaxed"
                style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}>
                {banner.subtitle}
              </p>
            )}

            {/* CTA Button - Enhanced */}
            <button className="cta-orange group/btn inline-flex items-center gap-2.5 px-8 lg:px-10 py-4 lg:py-4.5 rounded-xl text-[14px] lg:text-[15px] font-[800] text-white w-fit transition-all hover:gap-4 hover:px-12 shadow-2xl"
              style={{
                boxShadow: '0 8px 30px rgba(255,107,43,0.4)',
              }}>
              {banner?.ctaText || 'Shop Now'}
              <MdArrowForward className="text-[18px] transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: 'shine-banner 3s infinite'
            }} />
        </Link>
      </div>
    </section>
  );
};

export default FullWidthBanner;
