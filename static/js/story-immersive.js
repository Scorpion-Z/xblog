/*
 * RFC 1149 chapter player.
 * Desktop mouse/trackpad: one deliberate gesture -> one complete scene.
 * Touch, reduced motion, short windows and user-selected free mode: native scrolling.
 * No scroll position or visual content depends on JavaScript for basic reading.
 */
(function () {
  "use strict";

  function start() {
    var root = document.querySelector("[data-vx-story]");
    if (!root || root.dataset.vxMounted) return;

    var hero = root.querySelector(".vx-hero");
    var outro = root.querySelector(".vx-outro");
    var journey = root.querySelector(".vx-journey");
    var chapters = Array.prototype.slice.call(root.querySelectorAll("[data-vx-chapter]"));
    var visuals = Array.prototype.slice.call(root.querySelectorAll("[data-vx-visual]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-vx-dot]"));
    var counter = root.querySelector("[data-vx-current]");
    var giant = root.querySelector("[data-vx-giant]");
    var progress = root.querySelector("[data-vx-progress]");
    var stageProgress = root.querySelector("[data-vx-stage-progress]");
    var previousButton = root.querySelector("[data-vx-prev]");
    var nextButton = root.querySelector("[data-vx-next]");
    var modeButton = root.querySelector("[data-vx-mode]");
    var hint = root.querySelector("[data-vx-hint]");
    if (!hero || !outro || !journey || !chapters.length || chapters.length !== visuals.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var desktop = window.matchMedia("(min-width: 761px) and (pointer: fine)");
    var snap = false;
    var current = -1;
    var ticking = false;
    var lock = false;
    var lockedUntil = 0;
    var lastWheelAt = 0;
    var accumulated = 0;
    var lastGestureAt = 0;
    var releaseTimer = null;
    var transitionTimer = null;
    var targetStop = null;
    var stops = [hero].concat(chapters).concat([outro]);
    var supports = function () { return desktop.matches && !reduced.matches && window.innerHeight >= 640; };

    root.dataset.vxMounted = "true";
    root.classList.add("vx-enhanced");

    function clamp(n) { return Math.min(1, Math.max(0, n)); }
    function topOf(element) { return element.getBoundingClientRect().top + window.scrollY; }
    function pageY() { return window.scrollY || document.documentElement.scrollTop || 0; }
    function inRange() {
      var y = pageY();
      return y >= topOf(hero) - 30 && y <= topOf(outro) + window.innerHeight * 0.20;
    }
    function nearestStop() {
      var position = pageY();
      var best = 0;
      var distance = Infinity;
      for (var i = 0; i < stops.length; i++) {
        var d = Math.abs(position - topOf(stops[i]));
        if (d < distance) { distance = d; best = i; }
      }
      return best;
    }
    function updateMode() {
      if (snap && !supports()) snap = false;
      if (modeButton) {
        modeButton.setAttribute("aria-pressed", String(snap));
        modeButton.disabled = !supports();
        modeButton.textContent = snap ? "整幕切换：开" : "自由滚动";
      }
      if (hint) hint.textContent = snap ? "滚轮 / ↑ ↓ 一次切换一幕" : "自由滚动模式";
      root.classList.toggle("vx-snap-mode", snap);
      accumulated = 0;
    }
    function release() {
      var wait = Math.max(lockedUntil - Date.now(), 260 - (Date.now() - lastWheelAt));
      if (wait > 0) {
        releaseTimer = window.setTimeout(release, Math.max(24, wait));
      } else {
        lock = false;
        targetStop = null;
        accumulated = 0;
        releaseTimer = null;
      }
    }
    function moveTo(index, fromWheel) {
      index = Math.max(0, Math.min(stops.length - 1, index));
      if (fromWheel) {
        lock = true;
        targetStop = index;
        lastWheelAt = Date.now();
        lockedUntil = lastWheelAt + 850;
        if (releaseTimer !== null) window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(release, 900);
      } else if (lock) {
        // A click/key command intentionally replaces the current transition.
        lock = false;
        targetStop = null;
        if (releaseTimer !== null) window.clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      window.scrollTo({ top: Math.round(topOf(stops[index])), behavior: reduced.matches ? "instant" : "smooth" });
      window.requestAnimationFrame(update);
    }
    function step(direction, fromWheel) {
      var nearest = lock && targetStop !== null ? targetStop : nearestStop();
      var destination = nearest + direction;
      if (destination < 0 || destination >= stops.length) return false;
      moveTo(destination, fromWheel);
      return true;
    }
    function activate(index) {
      if (index === current) return;
      var isNewScene = current >= 0;
      current = index;
      root.dataset.active = String(index);
      var numeral = String(index + 1).padStart(2, "0");
      if (counter) counter.textContent = numeral;
      if (giant) giant.textContent = numeral;
      visuals.forEach(function (v, i) { v.classList.toggle("is-current", i === index); });
      chapters.forEach(function (c, i) { c.classList.toggle("is-reading", i === index); });
      dots.forEach(function (d, i) {
        if (i === index) d.setAttribute("aria-current", "step");
        else d.removeAttribute("aria-current");
      });
      if (stageProgress) stageProgress.style.transform = "scaleX(" + ((index + 1) / chapters.length).toFixed(5) + ")";
      if (isNewScene && !reduced.matches) {
        root.classList.remove("vx-turning");
        // Restart a small light-sweep transition on every scene change.
        void root.offsetWidth;
        root.classList.add("vx-turning");
        if (transitionTimer) window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(function () { root.classList.remove("vx-turning"); }, 750);
      }
    }
    function update() {
      ticking = false;
      var middle = window.innerHeight * 0.50;
      var chosen = 0;
      chapters.forEach(function (c, i) {
        if (c.getBoundingClientRect().top <= middle) chosen = i;
      });
      activate(chosen);
      var rect = journey.getBoundingClientRect();
      var visible = rect.top < window.innerHeight * .65 && rect.bottom > window.innerHeight * .35;
      root.classList.toggle("vx-in-journey", visible);
      if (previousButton) previousButton.disabled = !visible;
      if (nextButton) nextButton.disabled = !visible;
      if (visible && (previousButton || nextButton)) {
        var atLast = nearestStop() >= stops.length - 1;
        if (nextButton) nextButton.disabled = atLast;
      }
      var total = Math.max(1, rect.height - window.innerHeight);
      var fraction = clamp(-rect.top / total);
      if (progress) progress.style.transform = "scaleX(" + fraction.toFixed(5) + ")";
      var chapterRect = chapters[chosen].getBoundingClientRect();
      var local = clamp((middle - chapterRect.top) / Math.max(chapterRect.height, 1));
      root.style.setProperty("--vx-local-progress", local.toFixed(4));
      if (!reduced.matches) root.style.setProperty("--vx-shift", (local * 44).toFixed(1) + "px");
    }
    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    function handleWheel(event) {
      if (!snap || event.ctrlKey || event.metaKey || event.altKey || !inRange()) return;
      // Let nested scrolling controls, if added later, keep their natural behavior.
      if (event.target && event.target.closest && event.target.closest("[data-vx-free-scroll], textarea, select, input")) return;
      var multiplier = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
      var delta = event.deltaY * multiplier;
      if (Math.abs(delta) < .02) return;
      var direction = delta > 0 ? 1 : -1;
      var anchor = lock && targetStop !== null ? targetStop : nearestStop();
      if ((!lock && anchor === 0 && direction < 0) || (!lock && anchor === stops.length - 1 && direction > 0)) {
        accumulated = 0;
        return;
      }
      event.preventDefault();
      var now = Date.now();
      lastWheelAt = now;
      if (lock) return; // Ignore trackpad momentum while the current chapter lands.
      if (now - lastGestureAt > 230 || (accumulated !== 0 && Math.sign(accumulated) !== direction)) accumulated = 0;
      lastGestureAt = now;
      accumulated += delta;
      if (Math.abs(accumulated) >= 65) {
        accumulated = 0;
        step(direction, true);
      }
    }
    function handleKey(event) {
      if (!snap || !inRange() || event.altKey || event.ctrlKey || event.metaKey) return;
      var tag = event.target && event.target.tagName;
      if (tag && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tag)) return;
      var direction = 0;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") direction = event.shiftKey && event.key === " " ? -1 : 1;
      if (event.key === "ArrowUp" || event.key === "PageUp") direction = -1;
      if (event.key === "Escape") {
        snap = false;
        updateMode();
        return;
      }
      if (!direction) return;
      if (nearestStop() === 0 && direction < 0) return;
      if (nearestStop() === stops.length - 1 && direction > 0) return;
      event.preventDefault();
      step(direction, false);
    }

    if (modeButton) modeButton.addEventListener("click", function () { snap = !snap && supports(); updateMode(); });
    if (previousButton) previousButton.addEventListener("click", function () { step(-1, false); });
    if (nextButton) nextButton.addEventListener("click", function () { step(1, false); });
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function (event) {
        if (!snap) return;
        event.preventDefault();
        moveTo(index + 1, false);
      });
    });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { updateMode(); schedule(); });
    window.addEventListener("pageshow", schedule);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) schedule(); });
    if (reduced.addEventListener) reduced.addEventListener("change", function () { snap = false; updateMode(); schedule(); });
    if (desktop.addEventListener) desktop.addEventListener("change", function () { updateMode(); schedule(); });
    snap = supports();
    updateMode();
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();