import React from 'react';
import '../LoadingSkeleton/styles.css';

const ProductLoading = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
        <div key={item} className="skeleton-product-card">
          {/* Product Image */}
          <div className="skeleton-image aspect-square mb-3 relative">
            {/* Wishlist Icon Skeleton */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 skeleton-shimmer" />
            
            {/* Badge Skeleton */}
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

          {/* Price Section */}
          <div className="skeleton-price mb-3">
            <div className="skeleton-price-main" />
            <div className="skeleton-price-old" />
          </div>

          {/* Discount Badge */}
          <div className="skeleton-badge mb-3" style={{ width: '70px' }} />

          {/* Add to Cart Button */}
          <div className="skeleton-button" style={{ height: '36px' }} />
        </div>
      ))}
    </div>
  );
};

export default ProductLoading;