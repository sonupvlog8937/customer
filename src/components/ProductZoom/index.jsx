import React, { useEffect, useRef, useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useAppContext } from "../../hooks/useAppContext";
import CircularProgress from "@mui/material/CircularProgress";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Outfit:wght@300;400;500&display=swap');

  .zoom-wrapper {
    font-family: 'Outfit', sans-serif;
    --accent: #c9a96e;
    --bg-deep: #0d0d0d;
    --bg-card: #141414;
    --bg-thumb: #1a1a1a;
    --border: rgba(255,255,255,0.07);
    --text-muted: rgba(255,255,255,0.35);
    background: var(--bg-deep);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .zoom-inner {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  @media (min-width: 992px) {
    .zoom-inner {
      flex-direction: row;
      gap: 16px;
      align-items: flex-start;
    }
  }

  /* ── THUMBNAIL RAIL ── */
  .thumb-rail {
    width: 100%;
    order: 2;
  }

  @media (min-width: 992px) {
    .thumb-rail {
      width: 88px;
      order: 1;
      flex-shrink: 0;
    }
  }

  .thumb-rail .swiper {
    height: auto !important;
  }

  @media (min-width: 992px) {
    .thumb-rail .swiper {
      height: 560px !important;
    }
    .thumb-rail .swiper-wrapper {
      flex-direction: column !important;
    }
  }

  .thumb-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    background: var(--bg-thumb);
    border: 1.5px solid var(--border);
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumb-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9px;
    border: 1.5px solid transparent;
    transition: border-color 0.3s ease;
  }

  .thumb-item:hover {
    border-color: rgba(201,169,110,0.4);
    transform: translateX(2px);
  }

  .thumb-item.active {
    border-color: var(--accent);
  }

  .thumb-item.active::after {
    border-color: rgba(201,169,110,0.2);
  }

  .thumb-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease, opacity 0.3s ease;
  }

  .thumb-item:not(.active) img {
    opacity: 0.45;
    filter: grayscale(30%);
  }

  .thumb-item:hover img {
    opacity: 0.75;
    transform: scale(1.05);
  }

  .thumb-item.active img {
    opacity: 1;
  }

  /* Active indicator dot */
  .thumb-item.active .dot {
    display: block;
  }

  .thumb-dot {
    display: none;
    position: absolute;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 22px;
    background: var(--accent);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(201,169,110,0.7);
  }

  @media (min-width: 992px) {
    .thumb-item.active .thumb-dot { display: block; }
  }

  /* ── MAIN IMAGE AREA ── */
  .main-stage {
    position: relative;
    flex: 1;
    order: 1;
    background: var(--bg-card);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    min-height: 320px;
  }

  @media (min-width: 992px) {
    .main-stage {
      order: 2;
      height: 560px;
    }
  }

  /* Corner accents */
  .main-stage::before,
  .main-stage::after {
    content: '';
    position: absolute;
    width: 28px;
    height: 28px;
    z-index: 10;
    pointer-events: none;
  }
  .main-stage::before {
    top: 12px; left: 12px;
    border-top: 1.5px solid var(--accent);
    border-left: 1.5px solid var(--accent);
    border-radius: 4px 0 0 0;
  }
  .main-stage::after {
    bottom: 12px; right: 12px;
    border-bottom: 1.5px solid var(--accent);
    border-right: 1.5px solid var(--accent);
    border-radius: 0 0 4px 0;
  }

  /* Zoom hint badge */
  .zoom-badge {
    position: absolute;
    bottom: 16px;
    left: 16px;
    z-index: 10;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 5px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    transition: opacity 0.3s ease;
  }

  .zoom-badge svg {
    opacity: 0.6;
  }

  /* Counter badge */
  .image-counter {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 300;
    color: var(--text-muted);
    letter-spacing: 0.05em;
  }

  .image-counter span {
    color: rgba(255,255,255,0.7);
    font-size: 15px;
  }

  /* Loading overlay */
  .loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: rgba(13,13,13,0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .loading-spinner {
    width: 36px;
    height: 36px;
    border: 1.5px solid rgba(255,255,255,0.1);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* InnerImageZoom override */
  .zoom-wrapper .iiz {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }

  .zoom-wrapper .iiz__img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    display: block !important;
  }

  /* Swiper navigation arrows */
  .zoom-wrapper .swiper-button-next,
  .zoom-wrapper .swiper-button-prev {
    color: var(--accent) !important;
    background: rgba(0,0,0,0.5);
    width: 28px !important;
    height: 28px !important;
    border-radius: 50%;
    border: 1px solid rgba(201,169,110,0.3);
    backdrop-filter: blur(6px);
  }

  .zoom-wrapper .swiper-button-next::after,
  .zoom-wrapper .swiper-button-prev::after {
    font-size: 10px !important;
    font-weight: 700;
  }

  /* Fade-in slide */
  .fade-slide {
    animation: fadeSlide 0.4s ease forwards;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: scale(0.99); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* Subtle gradient overlay bottom of main image */
  .main-stage .stage-gradient {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 80px;
    background: linear-gradient(to top, rgba(13,13,13,0.5), transparent);
    z-index: 5;
    pointer-events: none;
  }
`;

export const ProductZoom = (props) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const zoomSliderBig = useRef();
  const zoomSliderSml = useRef();
  const context = useAppContext();

  const handleImageChange = (index) => {
    if (slideIndex === index) return;
    setIsImageLoading(true);
    setSlideIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsImageLoading(false), 600);
  };

  const goto = (index) => {
    if (slideIndex === index) return;
    zoomSliderSml.current?.swiper?.slideTo(index);
    zoomSliderBig.current?.swiper?.slideTo(index);
    handleImageChange(index);
  };

  useEffect(() => {
    setSlideIndex(0);
    zoomSliderSml?.current?.swiper?.slideTo(0);
    zoomSliderBig?.current?.swiper?.slideTo(0);
  }, [props?.images]);

  const total = props?.images?.length || 0;

  return (
    <>
      <style>{styles}</style>

      <div className="zoom-wrapper">
        <div className="zoom-inner">

          {/* ── Thumbnail Rail ── */}
          <div className="thumb-rail">
            <Swiper
              ref={zoomSliderSml}
              direction={context?.windowWidth < 992 ? "horizontal" : "vertical"}
              slidesPerView={context?.windowWidth < 992 ? 5 : 5}
              spaceBetween={8}
              navigation={context?.windowWidth >= 992 && total > 5}
              modules={[Navigation]}
              className="zoomProductSliderThumbs"
            >
              {props?.images?.map((item, index) => (
                <SwiperSlide key={index}>
                  <div
                    className={`thumb-item ${slideIndex === index ? "active" : ""}`}
                    onClick={() => goto(index)}
                  >
                    <span className="thumb-dot" />
                    <img src={item} alt={`Product view ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* ── Main Stage ── */}
          <div className="main-stage">

            {/* Image counter */}
            {total > 1 && (
              <div className="image-counter">
                <span>{String(slideIndex + 1).padStart(2, "0")}</span>
                {" / "}
                {String(total).padStart(2, "0")}
              </div>
            )}

            {/* Loading overlay */}
            {isImageLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner" />
              </div>
            )}

            {/* Bottom gradient */}
            <div className="stage-gradient" />

            {/* Zoom hint */}
            <div className="zoom-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Hover to zoom
            </div>

            {/* Main Swiper */}
            <Swiper
              ref={zoomSliderBig}
              slidesPerView={1}
              spaceBetween={0}
              navigation={false}
              onSlideChange={(swiper) => {
                handleImageChange(swiper.activeIndex);
                zoomSliderSml.current?.swiper?.slideTo(swiper.activeIndex);
              }}
              style={{ height: "100%" }}
            >
              {props?.images?.map((item, index) => (
                <SwiperSlide
                  key={index}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <div className={slideIndex === index ? "fade-slide" : ""} style={{ width: "100%", height: "100%" }}>
                    <InnerImageZoom
                      zoomType="hover"
                      zoomScale={1.5}
                      src={item}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

          </div>
        </div>
      </div>
    </>
  );
};