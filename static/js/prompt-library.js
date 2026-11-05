(function () {
  "use strict";
  document.addEventListener("click", async function (event) {
    const button = event.target.closest(".x-prompt-copy");
    if (!button) return;
    const card = button.closest(".x-prompt-card");
    const body = card && card.querySelector(".x-prompt-body");
    if (!body) return;
    const text = (body.innerText || body.textContent || "").trim();
    if (!text) return;
    const original = "复制提示词";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.focus();
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("copy failed");
      }
      button.textContent = "已复制";
      button.classList.add("is-copied");
    } catch (error) {
      button.textContent = "复制失败，请手动选择";
    }
    window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove("is-copied");
    }, 2400);
  });
})();
