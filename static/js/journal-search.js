(() => {
  const form = document.getElementById("journal-search");
  const input = form.elements.q;
  const status = document.getElementById("journal-search-status");
  const results = document.getElementById("searchResults");
  let entries;
  let loading;

  const clean = (text = "") => text.replace(/\s+/g, " ").trim();
  const fold = text => clean(text).normalize("NFKC");
  function pattern(term) {
    const literal = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(/^[a-z0-9]+$/i.test(term) ? `\\b${literal}\\b` : literal, "iu");
  }

  function find(query) {
    const phrase = pattern(query);
    const terms = query.split(" ").map(pattern);

    return entries.flatMap(entry => {
      const strong = [entry.title, entry.companion?.title, ...(entry.tags ?? [])].filter(Boolean).map(fold);
      const fields = [...strong, ...(entry.categories ?? []), entry.summary, entry.content].map(fold);
      if (!terms.every(term => fields.some(field => term.test(field)))) return [];

      let rank = 3;
      if (strong.some(field => field.toLowerCase() === query.toLowerCase())) rank = 0;
      else if (strong.some(field => phrase.test(field))) rank = 1;
      else if (terms.every(term => strong.some(field => term.test(field)))) rank = 2;

      return [{entry, rank}];
    }).sort((a, b) => a.rank - b.rank || a.entry.order - b.entry.order);
  }

  function snippet(entry, query) {
    const probes = [pattern(query), ...query.split(" ").map(pattern)];
    const summary = clean(entry.summary);
    const content = clean(entry.content);
    const match = probes.map(probe => probe.exec(fold(content))).find(Boolean);
    if (!match || probes.some(probe => probe.test(fold(summary)))) {
      return summary.length > 128 ? summary.slice(0, 128) + "…" : summary;
    }
    const start = Math.max(0, match.index - 28);
    const end = Math.min(content.length, match.index + match[0].length + 72);
    return (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
  }

  function output(entry, query) {
    const item = document.createElement("li");
    const a = document.createElement("a");
    a.className = "journal-result-title";
    a.href = entry.permalink;
    a.textContent = entry.title;
    item.append(a);

    const excerpt = document.createElement("p");
    const text = snippet(entry, query);
    excerpt.textContent = text ? `${entry.type} · ${text}` : entry.type;
    item.append(excerpt);

    if (entry.companion) {
      const version = document.createElement("a");
      version.className = "journal-story-version";
      version.href = entry.companion.permalink;
      version.textContent = "互动版";
      version.setAttribute("aria-label", `互动版：${entry.companion.title}`);
      item.append(version);
    }
    return item;
  }

  async function render() {
    const query = fold(input.value);
    results.replaceChildren();
    if (!query) {
      status.textContent = "输入关键词开始搜索。";
      return;
    }

    if (!entries) {
      status.textContent = "正在加载搜索索引…";
      loading ??= fetch(form.dataset.index)
        .then(response => {
          if (!response.ok) throw new Error("Search index unavailable");
          return response.json();
        })
        .then(data => data.map((entry, order) => ({...entry, order})));
      try {
        entries = await loading;
      } catch {
        loading = undefined;
        if (fold(input.value) === query) status.textContent = "暂时无法搜索。请重新输入关键词或刷新页面重试。";
        return;
      }
      if (fold(input.value) !== query) return;
    }

    const hits = find(query);
    status.textContent = hits.length
      ? `找到 ${hits.length} 条结果`
      : `没有找到“${clean(input.value)}”。试试更短的关键词，例如“显存”“信鸽”或“储能”。`;
    results.replaceChildren(...hits.map(({entry}) => output(entry, query)));
  }

  function update() {
    const url = new URL(location.href);
    const query = input.value.trim();
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    if (url.href !== location.href) history.replaceState(history.state, "", url);
    render();
  }

  function restore() {
    input.value = (new URL(location.href).searchParams.get("q") || "").slice(0, input.maxLength);
    render();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    update();
  });
  input.addEventListener("input", event => {
    if (!event.isComposing) update();
  });
  input.addEventListener("compositionend", update);
  form.addEventListener("keydown", event => {
    if (event.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      input.value = "";
      input.focus();
      update();
      return;
    }
    if (event.key === "ArrowRight" && results.contains(event.target)) {
      event.preventDefault();
      event.target.click();
      return;
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const controls = [input, ...results.querySelectorAll("a")];
    const offset = event.key === "ArrowDown" ? 1 : -1;
    const next = controls[controls.indexOf(document.activeElement) + offset];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  });
  window.addEventListener("popstate", restore);
  window.addEventListener("pageshow", event => {
    if (event.persisted) restore();
  });
  restore();
})();
