import React from 'react';
import BannerLoading from './bannerLoading';
import ProductLoading from '../ProductLoading';

/**
 * HomePageSkeleton - Full home page loading state
 * Shows skeleton for entire home page structure while data loads
 */
const HomePageSkeleton = () => {
  return (
    <div className="w-full">
      {/* Hero Banner Skeleton */}
      <BannerLoading />

      {/* Categories Skeleton */}
      <section className="py-4 bg-white">
        <div className="container">
          <div className="flex items-center gap-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="flex flex-col items-center gap-2 animate-pulse"
                style={{ minWidth: '90px' }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="h-2.5 w-14 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-6 bg-white">
        <div className="container">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col gap-2">
              <div className="h-6 w-40 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-3 w-32 rounded-full bg-gray-100 animate-pulse" />
            </div>
            <div className="h-10 w-28 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200 animate-pulse" />
          </div>

          {/* Products Grid */}
          <ProductLoading count={10} />
        </div>
      </section>

      {/* Banner Promo Skeleton */}
      <section className="py-4 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="h-48 rounded-2xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse relative overflow-hidden"
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                  style={{ 
                    animation: 'shimmer 2s infinite',
                    backgroundSize: '200% 100%'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-6 bg-white">
        <div className="container">
          <div className="h-6 w-48 rounded-lg bg-gray-200 animate-pulse mb-5" />
          <ProductLoading count={5} />
        </div>
      </section>

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
      `}</style>
    </div>
  );
};

export default HomePageSkeleton;
