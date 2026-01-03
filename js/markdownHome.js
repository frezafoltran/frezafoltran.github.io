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

    // Render: One section per week
    container.innerHTML = Object.entries(groups)
      .map(([weekLabel, articles]) => {
        const articleCards = articles
          .map((item) => {
            const imgStyle = item.thumbnail
              ? `style="background-image:url('${item.thumbnail}')"`
              : "";
            const dateStr = formatToDayOfYear(item.date);

            return `
            <a class="article-card" href="article.html?post=${encodeURIComponent(
              item.slug
            )}">
              <div class="article-image" ${imgStyle}></div>
              <div class="article-content">
                <p class="article-date">${dateStr}</p>
                <p class="article-date">${item.num_words} words</p>
                <h2 class="article-title">${escapeHtml(
                  item.title || item.slug
                )}</h2>
              </div>
             
            </a>`;
          })
          .join("");

        // Each week gets its own row and its own internal grid
        return `
          <section class="week-row">
            <header class="week-sticky-header">
              <h3>${weekLabel}</h3>
            </header>
            <div class="week-grid">
              ${articleCards}
            </div>
          </section>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `<p>Error rendering index: ${err}</p>`;
  }
}

window.renderIndex = renderIndex;
