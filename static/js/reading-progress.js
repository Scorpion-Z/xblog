(function () {
  "use strict";
  function setup() {
    const article = document.querySelector(".post-content");
    const bar = document.querySelector(".x-reading-progress-bar");
    if (!article || !bar) return;

    const toc = document.querySelector("details.toc");
    const compact = window.matchMedia("(max-width: 1179px)");
    let returnToToc;
    if (toc) {
      const summary = toc.querySelector("summary");
      const nav = toc.querySelector("#TableOfContents");
      const wideOpen = toc.open;
      const syncLayout = () => {
        toc.open = !compact.matches && wideOpen;
        schedule();
      };
      toc.classList.add("x-reading-toc");

      if (nav?.querySelector("li > ul, li > ol")) {
        const showSubsections = document.createElement("button");
        showSubsections.type = "button";
        showSubsections.className = "x-toc-subsections";
        showSubsections.textContent = "显示小节";
        showSubsections.setAttribute("aria-expanded", "false");
        showSubsections.setAttribute("aria-controls", nav.id);
        showSubsections.addEventListener("click", () => {
          const expanded = toc.classList.toggle("x-toc-expanded");
          showSubsections.textContent = expanded ? "收起小节" : "显示小节";
          showSubsections.setAttribute("aria-expanded", String(expanded));
        });
        nav.before(showSubsections);
      }

      toc.id = "article-contents";
      returnToToc = document.createElement("button");
      returnToToc.type = "button";
      returnToToc.className = "x-return-to-toc";
      returnToToc.textContent = "回到目录";
      returnToToc.hidden = true;
      returnToToc.setAttribute("aria-controls", toc.id);
      toc.after(returnToToc);
      returnToToc.addEventListener("click", () => {
        toc.open = true;
        toc.scrollIntoView({ block: "start" });
        summary.focus({ preventScroll: true });
      });

      toc.addEventListener("click", event => {
        const link = event.target.closest("a[href^='#']");
        if (!compact.matches || !link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (!heading) return;
        toc.open = false;
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }, true);

      toc.open = !compact.matches && wideOpen;
      compact.addEventListener("change", syncLayout);
    }

    const tables = [...article.querySelectorAll("table")].filter(table => !table.closest(".highlight, .highlighttable, .gist"));
    const tableHints = tables.map((table, index) => {
      const hint = document.createElement("p");
      hint.className = "x-wide-table-hint";
      hint.id = `wide-table-help-${index + 1}`;
      hint.hidden = true;
      hint.textContent = "横向滑动可查看完整表格";
      table.before(hint);
      return {table, hint, description: table.getAttribute("aria-describedby"), tabIndex: table.getAttribute("tabindex")};
    });

    function checkTables() {
      for (const {table, hint, description, tabIndex} of tableHints) {
        const overflow = table.scrollWidth > table.clientWidth + 1;
        hint.hidden = !overflow;
        if (overflow) {
          table.setAttribute("aria-describedby", [description, hint.id].filter(Boolean).join(" "));
          table.tabIndex = 0;
        } else {
          if (description === null) table.removeAttribute("aria-describedby");
          else table.setAttribute("aria-describedby", description);
          if (tabIndex === null) table.removeAttribute("tabindex");
          else table.setAttribute("tabindex", tabIndex);
        }
      }
    }

    let ticking = false;
    function update() {
      ticking = false;
      const bounds = article.getBoundingClientRect();
      const denominator = Math.max(1, bounds.height - window.innerHeight);
      const fraction = Math.max(0, Math.min(1, -bounds.top / denominator));
      bar.style.transform = "scaleX(" + fraction.toFixed(4) + ")";

      if (returnToToc) {
        returnToToc.hidden = !compact.matches || toc.getBoundingClientRect().bottom > 0 || bounds.bottom <= 0;
      }
    }
    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", () => {
      checkTables();
      schedule();
    });
    checkTables();
    document.fonts?.ready.then(checkTables);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
