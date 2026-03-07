async function renderIndex(articlesJsonPath, container) {
  await ensureLibs();
  try {
    const res = await fetch(articlesJsonPath);
    if (!res.ok) {
      container.innerHTML = `<p>Failed to load articles.json</p>`;
      return;
    }
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = `<p>No articles yet.</p>`;
      return;
    }

    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const groups = list.reduce((acc, item) => {
      const counters = getDateCounters(item.date);
      const weekKey = counters
        ? `Week ${counters.weekOfYear}, ${counters.year}`
        : "Unknown Date";

      if (!acc[weekKey]) acc[weekKey] = [];
      acc[weekKey].push(item);
      return acc;
    }, {});

    container.innerHTML = Object.entries(groups)
      .map(([weekLabel, articles]) => {
        // Pick the thumbnail from the first article of the week
        const firstArticle = articles[0];
        const weekThumb = firstArticle.thumbnail
          ? `<img src="${firstArticle.thumbnail}" class="week-mini-thumb" alt="">`
          : "";

        const articleRows = articles
          .map((item) => {
            const dateStr = formatToDay(item.date);
            return `
            <a class="article-row no-thumb" href="article.html?post=${encodeURIComponent(item.slug)}">
              <div class="row-content">
                <h2 class="row-title">${escapeHtml(item.title || item.slug)}</h2>
                <span class="row-meta">${dateStr} • ${item.num_words} words</span>
              </div>
            </a>`;
          })
          .join("");

        return `
          <section class="week-section">
            <header class="week-sticky-header">
              <div class="header-flex">
                ${weekThumb}
                <h3>${weekLabel}</h3>
              </div>
            </header>
            <div class="week-list">
              ${articleRows}
            </div>
          </section>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `<p>Error rendering index: ${err}</p>`;
  }
}

window.renderIndex = renderIndex;
