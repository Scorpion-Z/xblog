/* Visual storytelling: page-specific entrypoint; no dependency on cached theme footer. */
(function () {
  "use strict";
  function mount() {
    var root = document.querySelector("[data-vx-story]");
    if (!root || root.dataset.vxMounted === "yes") return;
    root.dataset.vxMounted = "yes";
    var chapters = Array.prototype.slice.call(root.querySelectorAll("[data-vx-chapter]"));
    var visuals = Array.prototype.slice.call(root.querySelectorAll("[data-vx-visual]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-vx-dot]"));
    var counter = root.querySelector("[data-vx-current]");
    var giant = root.querySelector("[data-vx-giant]");
    var progress = root.querySelector("[data-vx-progress]");
    var stageProgress = root.querySelector("[data-vx-stage-progress]");
    var journey = root.querySelector(".vx-journey");
    if (!chapters.length || chapters.length !== visuals.length || !journey) return;

    root.classList.add("vx-enhanced");
    var active = -1;
    var ticking = false;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function clamp(x) { return Math.max(0, Math.min(1, x)); }
    function activate(index) {
      if (index === active) return;
      active = index;
      root.setAttribute("data-active", String(index));
      var num = String(index + 1).padStart(2, "0");
      if (counter) counter.textContent = num;
      if (giant) giant.textContent = num;
      visuals.forEach(function (visual, i) { visual.classList.toggle("is-current", i === index); });
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute("aria-current", "step");
        else dot.removeAttribute("aria-current");
      });
      if (stageProgress) stageProgress.style.transform = "scaleX(" + ((index + 1) / chapters.length).toFixed(5) + ")";
    }
    function update() {
      ticking = false;
      var middle = window.innerHeight * 0.50;
      var chosen = 0;
      // Each chapter occupies its own reading interval; last top crossing the viewport middle wins.
      chapters.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        if (r.top <= middle) chosen = i;
      });
      activate(chosen);
      var box = journey.getBoundingClientRect();
      var total = Math.max(1, box.height - window.innerHeight);
      var fraction = clamp(-box.top / total);
      if (progress) progress.style.transform = "scaleX(" + fraction.toFixed(5) + ")";
      var rect = chapters[chosen].getBoundingClientRect();
      var within = clamp((middle - rect.top) / Math.max(rect.height, 1));
      root.style.setProperty("--vx-local-progress", within.toFixed(4));
      if (!reducedMotion.matches) {
        root.style.setProperty("--vx-shift", (within * 38).toFixed(1) + "px");
      }
    }
    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) schedule(); });
    update();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();