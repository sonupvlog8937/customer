import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/free-mode';

import { Navigation,FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";

// Har category tile ko alag colour milta hai (style: Pages/Home/style.css → .cat-tile)
const CAT_COLORS = ["#FF6B2B", "#7C3AED", "#0D9488", "#EC4899", "#2563EB", "#F59E0B", "#059669", "#EF4444"];

const HomeCatSlider = (props) => {

  const context = useAppContext();

  return (
    <div className="homeCatSlider pt-0 lg:pt-3 py-3 lg:py-5">
      <div className="container">
        <Swiper
          slidesPerView={8}
          spaceBetween={10}
          navigation={context?.windowWidth < 992 ? false : true}
          modules={[Navigation, FreeMode]}
          freeMode={true}
          breakpoints={{
            300: {
              slidesPerView: 4,
              spaceBetween: 6,
            },
            550: {
              slidesPerView: 5,
              spaceBetween: 8,
            },
            900: {
              slidesPerView: 5,
              spaceBetween: 8,
            },
            1100: {
              slidesPerView: 8,
              spaceBetween: 10,
            },
          }}
          className="mySwiper"
        >
          {
            props?.data?.map((cat, index) => {
              const color = CAT_COLORS[index % CAT_COLORS.length];
              return (
                <SwiperSlide key={cat?._id || index} style={{ padding: "6px 2px 10px" }}>
                  <Link to={`/products?catId=${cat?._id}`}>
                    <div
                      className="cat-tile py-3 lg:py-4 px-2 text-center flex items-center justify-center flex-col"
                      style={{ "--c": color, "--cs": `${color}1A`, "--cm": `${color}40` }}
                    >
                      <span className="cat-icon w-[46px] h-[46px] lg:w-[62px] lg:h-[62px]">
                        <img
                          src={cat?.images?.[0]}
                          alt={cat?.name || "category"}
                          loading="lazy"
                          className="w-[28px] lg:w-[40px] transition-all"
                        />
                      </span>
                      <h3 className="text-[11px] lg:text-[12.5px] font-[600] mt-2 mb-0">{cat?.name}</h3>
                    </div>
                  </Link>
                </SwiperSlide>
              )
            })
          }


        </Swiper>
      </div>
    </div>
  );
};

export default HomeCatSlider;
