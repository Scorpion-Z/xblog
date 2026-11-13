(function () {
  "use strict";
  function setup() {
    const article = document.querySelector(".post-content");
    const bar = document.querySelector(".x-reading-progress-bar");
    if (!article || !bar) return;

    // On narrow screens, the existing table of contents stays available, collapsed.
    const toc = document.querySelector("details.toc");
    if (toc && window.matchMedia("(max-width: 768px)").matches) {
      toc.open = false;
    }

    let ticking = false;
    function update() {
      ticking = false;
      const articleTop = window.scrollY + article.getBoundingClientRect().top;
      const articleBottom = articleTop + article.offsetHeight - window.innerHeight;
      const denominator = Math.max(1, articleBottom - articleTop);
      const fraction = Math.max(0, Math.min(1, (window.scrollY - articleTop) / denominator));
      bar.style.transform = "scaleX(" + fraction.toFixed(4) + ")";
    }
    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
