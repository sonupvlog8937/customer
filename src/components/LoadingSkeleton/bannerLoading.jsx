import React from 'react';
import './styles.css';

const BannerLoading = () => {
  return (
    <div className="homeSlider pb-2 pt-3 lg:pb-5 lg:pt-5 w-full">
      <div className="container">
        <div className="skeleton-banner relative w-full" style={{ 
          height: '280px',
          boxShadow: '0 20px 60px rgba(255,107,43,0.08)'
        }}>
          {/* Decorative Elements */}
          <div className="absolute top-6 left-6 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'rgba(255,107,43,0.3)' }} />
          <div className="absolute bottom-6 right-6 w-24 h-24 rounded-full opacity-10"
            style={{ background: 'rgba(255,107,43,0.2)' }} />
          
          {/* Content Skeleton */}
          <div className="absolute inset-0 flex items-center px-8 lg:px-14">
            <div className="w-full max-w-md space-y-4">
              {/* Badge */}
              <div className="skeleton-badge" style={{ width: '100px' }} />
              
              {/* Title Lines */}
              <div className="space-y-3">
                <div className="skeleton-text-lg" style={{ width: '90%' }} />
                <div className="skeleton-text-lg" style={{ width: '70%' }} />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <div className="skeleton-text" style={{ width: '85%' }} />
                <div className="skeleton-text" style={{ width: '60%' }} />
              </div>
              
              {/* Button */}
              <div className="skeleton-button" style={{ width: '140px', marginTop: '24px' }} />
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/30" 
                style={{ animation: `pulse-soft ${1.5 + i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerLoading;