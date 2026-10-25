// Scroll-reveal: sections / cards ko smoothly fade-up karta hai.
// Header me ek baar call hota hai; dobara call karna safe hai.
let started = false;

const SELECTOR = [
  "main section",
  ".benefit-card",
  ".review-card",
  ".promo-banner-card",
  ".section-heading",
  ".card",
].join(",");

export function initUIEnhance() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("ue-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  const scan = () => {
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (el.dataset.ue || el.classList.contains("scroll-reveal")) return;
      el.dataset.ue = "1";
      el.classList.add("ue-reveal");
      io.observe(el);
    });
  };

  scan();
  // route change / lazy load hone par naye elements bhi pakdo
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 120); })
    .observe(document.body, { childList: true, subtree: true });
}
