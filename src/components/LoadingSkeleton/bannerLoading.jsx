import React from 'react';

/**
 * BannerLoading - Modern banner skeleton loader with shimmer effect
 * - Responsive height (mobile & desktop)
 * - Smooth shimmer animation
 * - No placeholder image needed
 */
const BannerLoading = () => {
  return (
    <div className="homeSlider pb-2 pt-3 lg:pb-5 lg:pt-5 w-full">
      <div className="container">
        <div 
          className="relative w-full rounded-xl lg:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100"
          style={{ 
            height: '180px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          {/* Shimmer Effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
            style={{ 
              animation: 'shimmer 2s infinite',
              backgroundSize: '200% 100%'
            }}
          />
          
          {/* Icon in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300" 
              fill="currentColor" 
              viewBox="0 0 20 18"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-32 h-4 bg-white/20 rounded-full" />
          <div className="absolute bottom-4 left-4 w-24 h-3 bg-white/20 rounded-full" />
          <div className="absolute top-4 right-4 w-20 h-6 bg-white/30 rounded-lg" />
        </div>

        {/* Animation Styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          
          @media (min-width: 1024px) {
            .homeSlider .container > div {
              height: 320px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BannerLoading;