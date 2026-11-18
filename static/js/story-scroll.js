/* Progressive enhancement for the stories section. All chapters remain readable without JavaScript. */
(function () {
  "use strict";
  var root = document.querySelector("[data-story-root]");
  if (!root) return;
  var chapters = Array.prototype.slice.call(root.querySelectorAll("[data-story-chapter]"));
  var figures = Array.prototype.slice.call(root.querySelectorAll("[data-story-figure]"));
  var current = root.querySelector("[data-story-current]");
  var stageProgress = root.querySelector("[data-story-stage-progress]");
  var pageProgress = root.querySelector("[data-story-progress]");
  var story = root.querySelector(".story-experience");
  if (!chapters.length || !story) return;
  var last = -1;
  var scheduled = false;

  function clamp(n) { return Math.min(1, Math.max(0, n)); }

  function update() {
    scheduled = false;
    var center = window.innerHeight * 0.53;
    var best = 0;
    var minDistance = Infinity;
    for (var i = 0; i < chapters.length; i++) {
      var rect = chapters[i].getBoundingClientRect();
      var distance = rect.top > center ? rect.top - center : rect.bottom < center ? center - rect.bottom : 0;
      if (distance < minDistance) {
        minDistance = distance;
        best = i;
      }
    }
    if (best !== last) {
      for (var j = 0; j < chapters.length; j++) {
        chapters[j].classList.toggle("is-active", j === best);
        if (figures[j]) figures[j].classList.toggle("is-active", j === best);
      }
      if (current) current.textContent = String(best + 1).padStart(2, "0");
      if (stageProgress) stageProgress.style.transform = "scaleX(" + ((best + 1) / chapters.length).toFixed(4) + ")";
      last = best;
    }
    var bounds = story.getBoundingClientRect();
    var total = Math.max(1, bounds.height - window.innerHeight * 0.25);
    var progress = clamp((window.innerHeight * 0.65 - bounds.top) / total);
    if (pageProgress) pageProgress.style.transform = "scaleX(" + progress.toFixed(4) + ")";
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("pageshow", schedule);
  update();
})();
