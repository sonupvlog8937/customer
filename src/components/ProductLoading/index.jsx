import React from 'react';

/**
 * ProductLoading - Modern skeleton loader matching ProductItem card design
 * - Responsive grid support (2 cols mobile, 5 cols desktop)
 * - Smooth shimmer animation
 * - Matches actual product card dimensions
 */
const ProductLoading = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
};

const ProductSkeleton = () => {
  return (
    <div 
      className="relative bg-white rounded-[18px] overflow-hidden border border-gray-100"
      style={{ 
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    >
      {/* Image Area */}
      <div 
        className="relative w-full bg-gradient-to-br from-gray-100 to-gray-200"
        style={{ aspectRatio: '1 / 1' }}
      >
        {/* Discount Badge Skeleton */}
        <div 
          className="absolute top-2.5 right-2.5 w-12 h-6 rounded-md bg-gray-300"
          style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
        />
        
        {/* Shimmer Effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          style={{ 
            animation: 'shimmer 2s infinite',
            backgroundSize: '200% 100%'
          }}
        />
      </div>

      {/* Info Area */}
      <div className="p-3.5" style={{ paddingBottom: '16px' }}>
        {/* Tag Row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="h-3.5 w-14 rounded bg-gray-200" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-2.5">
          <div className="h-3.5 w-full rounded bg-gray-200" />
          <div className="h-3.5 w-4/5 rounded bg-gray-200" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="h-5 w-12 rounded-md bg-gradient-to-r from-amber-100 to-amber-200" />
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-sm bg-gray-200" />
            ))}
          </div>
          <div className="h-3 w-8 rounded bg-gray-200" />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-3" />

        {/* Price Row */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded bg-gradient-to-r from-gray-300 to-gray-200" />
          <div className="h-4 w-12 rounded bg-gray-200" />
        </div>
      </div>

      {/* Shimmer Animation Styles */}
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
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductLoading;