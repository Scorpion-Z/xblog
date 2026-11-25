(() => {
  const filters = document.getElementById("journal-filters");
  const options = [...filters.querySelectorAll("input")];
  const articles = [...document.querySelectorAll("#journal-catalog > li")];
  const count = document.getElementById("journal-catalog-count");

  function render() {
    const section = new URL(location.href).searchParams.get("section");
    const active = options.find(option => option.value === section) || options[0];
    active.checked = true;

    let visible = 0;
    for (const article of articles) {
      article.hidden = active.value !== "" && article.dataset.section !== active.value;
      if (!article.hidden) visible += 1;
    }
    count.textContent = `${visible} 篇`;
  }

  filters.addEventListener("change", event => {
    const url = new URL(location.href);
    if (event.target.value) url.searchParams.set("section", event.target.value);
    else url.searchParams.delete("section");
    history.pushState(null, "", url);
    render();
  });
  window.addEventListener("popstate", render);
  render();
  filters.hidden = false;
})();
