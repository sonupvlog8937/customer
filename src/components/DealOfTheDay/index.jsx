import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBolt, FaFire } from 'react-icons/fa';
import { MdArrowForward } from 'react-icons/md';
import './style.css';

/**
 * DealOfTheDay - Flipkart-style deal banner with countdown
 * Shows a special deal with timer and product showcase
 */
const DealOfTheDay = ({ deal }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calculate time until end of day or custom end time
    const calculateTimeLeft = () => {
      const endTime = deal?.endTime ? new Date(deal.endTime) : new Date();
      if (!deal?.endTime) {
        endTime.setHours(23, 59, 59, 999);
      }

      const diff = endTime - new Date();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deal?.endTime]);

  if (!deal) return null;

  return (
    <section className="deal-of-day-section py-4 bg-white">
      <div className="container">
        <div className="deal-of-day-card relative overflow-hidden rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            minHeight: '380px',
          }}>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
          </div>

          {/* Animated Glow */}
          <div className="deal-glow absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle, #FF6B2B 0%, transparent 70%)',
              filter: 'blur(60px)',
            }} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-8">
            {/* Left: Content */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <FaBolt className="text-yellow-400 text-[16px] animate-pulse" />
                <span className="text-[11px] uppercase tracking-[0.15em] text-yellow-400 font-[700]">
                  {deal?.badge || 'Deal of the Day'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[28px] lg:text-[36px] font-[900] text-white leading-tight mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {deal?.title || 'Special Deal'}
              </h2>

              {/* Subtitle */}
              {deal?.subtitle && (
                <p className="text-[14px] lg:text-[15px] text-white/80 mb-4 max-w-[400px]">
                  {deal.subtitle}
                </p>
              )}

              {/* Discount */}
              {deal?.discount && (
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-[42px] lg:text-[52px] font-[900] text-orange-500 leading-none">
                    {deal.discount}%
                  </span>
                  <span className="text-[16px] text-white/70 font-[600]">OFF</span>
                </div>
              )}

              {/* Timer */}
              <div className="flex items-center gap-3 mb-5">
                <FaFire className="text-orange-500 text-[18px]" />
                <span className="text-[12px] text-white/60 uppercase tracking-wider">Ends in</span>
                <div className="flex items-center gap-2">
                  {[
                    { val: timeLeft.hours, label: 'HRS' },
                    { val: timeLeft.minutes, label: 'MIN' },
                    { val: timeLeft.seconds, label: 'SEC' }
                  ].map((t, idx) => (
                    <React.Fragment key={idx}>
                      {idx !== 0 && <span className="text-white/30 text-[16px]">:</span>}
                      <div className="flex flex-col items-center">
                        <div className="deal-timer-digit w-12 h-12 rounded-lg flex items-center justify-center text-[18px] font-[800] text-white"
                          style={{ background: 'rgba(255,107,43,0.2)', border: '1px solid rgba(255,107,43,0.3)' }}>
                          {String(t.val).padStart(2, '0')}
                        </div>
                        <span className="text-[8px] uppercase tracking-widest text-white/40 mt-1">{t.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link to={deal?.link || '/products'}>
                <button className="cta-orange inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-[700] text-white transition-all hover:gap-3">
                  {deal?.ctaText || 'Grab Deal Now'}
                  <MdArrowForward className="text-[16px]" />
                </button>
              </Link>
            </div>

            {/* Right: Product Image */}
            {deal?.image && (
              <div className="flex items-center justify-center">
                <div className="deal-product-image relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-contain max-h-[450px] drop-shadow-2xl"
                    loading="lazy"
                  />
                  {/* Glow Effect */}
                  <div className="absolute inset-0 -z-10 blur-3xl opacity-30"
                    style={{ background: 'radial-gradient(circle, #FF6B2B 0%, transparent 70%)' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;
