import React from 'react';
import './styles.css';

const FlashSaleSkeleton = () => {
  return (
    <section className="py-4 bg-white">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl px-6 py-5"
          style={{ 
            background: 'linear-gradient(135deg, #FFE5D9 0%, #FFD4C2 50%, #FFC9B3 100%)',
            minHeight: '120px'
          }}>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Left Content */}
            <div className="space-y-3">
              <div className="skeleton-badge" style={{ width: '100px', background: 'rgba(255,255,255,0.5)' }} />
              <div className="skeleton-text-lg" style={{ width: '250px', background: 'rgba(255,255,255,0.6)' }} />
              <div className="skeleton-text" style={{ width: '200px', background: 'rgba(255,255,255,0.4)' }} />
            </div>

            {/* Timer */}
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                  {i !== 1 && <div className="text-white/50 text-xl">:</div>}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-xl skeleton-shimmer"
                      style={{ background: 'rgba(255,255,255,0.8)' }} />
                    <div className="skeleton-text-sm" style={{ width: '30px', background: 'rgba(255,255,255,0.4)' }} />
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Button */}
            <div className="skeleton-button" 
              style={{ width: '140px', height: '46px', background: 'rgba(255,255,255,0.8)' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSkeleton;
