import React from 'react';
import './styles.css';

const CategorySkeleton = () => {
  return (
    <div className="py-4" style={{ background: '#FAFAFA', borderTop: '1.5px solid #F1F3F5', borderBottom: '1.5px solid #F1F3F5' }}>
      <div className="container">
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="skeleton-category flex-shrink-0">
              {/* Category Icon */}
              <div className="skeleton-category-icon" />
              
              {/* Category Name */}
              <div className="skeleton-text" style={{ width: '60px', height: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySkeleton;
