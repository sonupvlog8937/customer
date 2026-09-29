import{u as v,P as j,r as u,j as s,S as k,Q as y,V as N,W as m,X as S}from"./index-BAOIkzaG.js";/* empty css                   */const C=()=>s.jsx("div",{className:"w-full h-[200px] sm:h-[320px] lg:h-[460px] bg-gray-200 animate-pulse rounded-2xl overflow-hidden relative",children:s.jsx("div",{className:"absolute inset-0 animate-shimmer"})}),P=t=>{var b;const d=v(),w=j(),[c,x]=u.useState(0),[f,h]=u.useState(!1),o=u.useRef(null),r=(b=t==null?void 0:t.data)!=null&&b.length?[...t.data].reverse():[],p=(d==null?void 0:d.windowWidth)<992,g=e=>{if(f)return;const l="/products";l.startsWith("http://")||l.startsWith("https://")?window.open(l,"_blank","noopener,noreferrer"):w(l)};return r.length?s.jsxs(s.Fragment,{children:[s.jsx("style",{children:`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 1.8s infinite;
        }
        .swiper-button-next,
        .swiper-button-prev { display: none !important; }
        .home-swiper .swiper-pagination-bullet {
          width: 8px; height: 8px;
          background: rgba(255,255,255,0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }
        .home-swiper .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #ffffff;
        }
        .home-swiper .swiper-pagination { bottom: 14px; }

        .slide-clickable img { transition: transform 0.5s ease; }
        .slide-clickable:hover img { transform: scale(1.02); }
      `}),s.jsx("section",{className:"homeSlider w-full py-3 lg:py-4",children:s.jsxs("div",{className:"w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6",children:[s.jsxs("div",{className:"relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl group",children:[s.jsx(k,{ref:o,loop:!0,spaceBetween:0,slidesPerView:1,modules:[y,N,m],autoplay:{delay:4e3,disableOnInteraction:!1},pagination:{clickable:!0},onSlideChange:e=>x(e.realIndex),onTouchStart:()=>h(!1),onTouchMove:()=>h(!0),onTouchEnd:()=>setTimeout(()=>h(!1),100),className:"home-swiper w-full",children:r.map((e,l)=>{var n;const a=!!(e!=null&&e.link||e!=null&&e.url||e!=null&&e.redirectUrl||e!=null&&e.href);return s.jsx(S,{children:s.jsxs("div",{onClick:()=>g(),onKeyDown:i=>i.key==="Enter"&&g(),role:a?"link":void 0,tabIndex:a?0:void 0,"aria-label":a?(e==null?void 0:e.title)||`Banner ${l+1}`:void 0,className:`
                        relative w-full h-[200px] sm:h-[320px] lg:h-[460px] overflow-hidden
                        ${a?"slide-clickable cursor-pointer":"cursor-default"}
                      `,children:[s.jsx("img",{src:(n=e==null?void 0:e.images)==null?void 0:n[0],alt:(e==null?void 0:e.title)||`Banner ${l+1}`,className:"w-full h-full object-cover",loading:l===0?"eager":"lazy"}),s.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none"}),a&&p&&s.jsx("div",{className:"absolute bottom-8 right-3 z-10 pointer-events-none",children:s.jsxs("span",{className:"flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full",children:["Tap to explore",s.jsx("svg",{className:"w-3 h-3",fill:"none",stroke:"currentColor",strokeWidth:"2",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 5l7 7-7 7"})})]})}),((e==null?void 0:e.title)||(e==null?void 0:e.subtitle)||(e==null?void 0:e.badge))&&s.jsxs("div",{className:"absolute bottom-10 left-5 sm:left-8 lg:left-12 max-w-xs sm:max-w-sm lg:max-w-md z-10 pointer-events-none",children:[(e==null?void 0:e.badge)&&s.jsx("span",{className:"inline-block mb-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-red-500 text-white shadow-lg",children:e.badge}),(e==null?void 0:e.title)&&s.jsx("h2",{className:"text-white text-lg sm:text-2xl lg:text-4xl font-bold leading-tight drop-shadow-md",children:e.title}),(e==null?void 0:e.subtitle)&&s.jsx("p",{className:"text-white/80 text-xs sm:text-sm mt-1 drop-shadow",children:e.subtitle}),a&&(e==null?void 0:e.cta)&&s.jsxs("span",{className:"inline-block mt-3 px-4 sm:px-5 py-2 bg-white text-gray-900 text-xs sm:text-sm font-bold rounded-full shadow-lg",children:[e.cta," →"]})]})]})},l)})}),!p&&s.jsxs(s.Fragment,{children:[s.jsx("button",{onClick:e=>{var l,a;e.stopPropagation(),(a=(l=o.current)==null?void 0:l.swiper)==null||a.slidePrev()},className:`absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 z-20\r
                    w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center\r
                    bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-xl\r
                    border border-white/50 opacity-0 group-hover:opacity-100\r
                    transition-all duration-300 hover:scale-110 active:scale-95`,"aria-label":"Previous slide",children:s.jsx("svg",{className:"w-4 h-4 lg:w-5 lg:h-5",fill:"none",stroke:"currentColor",strokeWidth:"2.5",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15 19l-7-7 7-7"})})}),s.jsx("button",{onClick:e=>{var l,a;e.stopPropagation(),(a=(l=o.current)==null?void 0:l.swiper)==null||a.slideNext()},className:`absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 z-20\r
                    w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center\r
                    bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-xl\r
                    border border-white/50 opacity-0 group-hover:opacity-100\r
                    transition-all duration-300 hover:scale-110 active:scale-95`,"aria-label":"Next slide",children:s.jsx("svg",{className:"w-4 h-4 lg:w-5 lg:h-5",fill:"none",stroke:"currentColor",strokeWidth:"2.5",viewBox:"0 0 24 24",children:s.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 5l7 7-7 7"})})})]}),s.jsxs("div",{className:"absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full pointer-events-none",children:[c+1," / ",r.length]})]}),!p&&r.length>=3&&s.jsx("div",{className:"hidden lg:flex gap-2 mt-3 justify-center",children:r.map((e,l)=>{var a;return s.jsxs("button",{onClick:()=>{var n,i;(i=(n=o.current)==null?void 0:n.swiper)==null||i.slideToLoop(l),x(l)},className:`
                    relative rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300
                    ${c===l?"w-20 h-12 ring-2 ring-blue-500 opacity-100 scale-105":"w-16 h-10 opacity-50 hover:opacity-80 hover:scale-105"}
                  `,children:[s.jsx("img",{src:(a=e==null?void 0:e.images)==null?void 0:a[0],alt:`Thumb ${l+1}`,className:"w-full h-full object-cover"}),c===l&&s.jsx("div",{className:"absolute inset-0 bg-blue-500/10"})]},l)})})]})})]}):s.jsx(C,{})};export{P as default};
