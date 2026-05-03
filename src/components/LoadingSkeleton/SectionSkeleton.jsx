import React from 'react';
import './styles.css';

const SectionSkeleton = ({ title = true, products = 8 }) => {
  return (
    <section className="py-6 bg-white">
      <div className="container">
        {/* Section Header */}
        {title && (
          <div className="flex items-center justify-between mb-5">
            <div className="skeleton-text-lg" style={{ width: '200px' }} />
            <div className="skeleton-button" style={{ width: '120px', height: '40px' }} />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: products }).map((_, index) => (
            <div key={index} className="skeleton-product-card">
              {/* Product Image */}
              <div className="skeleton-image aspect-square mb-3 relative">
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 skeleton-shimmer" />
                <div className="absolute top-2 left-2">
                  <div className="skeleton-badge" style={{ width: '50px', height: '20px' }} />
                </div>
              </div>

              {/* Brand */}
              <div className="skeleton-text-sm mb-2" style={{ width: '40%' }} />

              {/* Product Title */}
              <div className="space-y-2 mb-3">
                <div className="skeleton-text" style={{ width: '100%' }} />
                <div className="skeleton-text" style={{ width: '80%' }} />
              </div>

              {/* Rating */}
              <div className="skeleton-rating mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="skeleton-star" />
                ))}
              </div>

              {/* Price */}
              <div className="skeleton-price mb-3">
                <div className="skeleton-price-main" />
                <div className="skeleton-price-old" />
              </div>

              {/* Discount Badge */}
              <div className="skeleton-badge mb-3" style={{ width: '70px' }} />

              {/* Button */}
              <div className="skeleton-button" style={{ height: '36px' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionSkeleton;
