async function renderIndex(articlesJsonPath, container) {
  // Helpers for date calculations
  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

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

    // Sort descending
    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Group by Year and create a Map of "Active Days" per year
    const yearGroups = {};
    const activeDaysPerYear = {};

    list.forEach((item) => {
      const d = new Date(item.date);
      const year = d.getFullYear();
      const dayIndex = getDayOfYear(d);

      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(item);

      if (!activeDaysPerYear[year]) activeDaysPerYear[year] = new Set();
      activeDaysPerYear[year].add(dayIndex);
    });

    const sortedYears = Object.keys(yearGroups).sort((a, b) => b - a);

    container.innerHTML = sortedYears
      .map((year) => {
        const articles = yearGroups[year];
        const activeSet = activeDaysPerYear[year];

        const articleRows = articles
          .map((item) => {
            const d = new Date(item.date);
            const currentDayIndex = getDayOfYear(d);
            const dateStr = d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            // Generate bricks for days elapsed up to THIS article
            let bricksHtml = "";
            for (let i = 1; i <= currentDayIndex; i++) {
              // If this day has an article in the master list, color it
              const isActive = activeSet.has(i) ? "active" : "";
              // Highlight the specific day of THIS row
              const isCurrent = i === currentDayIndex ? "current" : "";
              bricksHtml += `<div class="brick ${isActive} ${isCurrent}"></div>`;
            }

            return `
            <div class="article-group">
              <div class="brick-wrapper">
                <div class="brick-container">${bricksHtml}</div>
              </div>
              <a class="article-row no-thumb" href="article.html?post=${encodeURIComponent(item.slug)}">
                <div class="row-content">
                  <h2 class="row-title">${item.title || item.slug}</h2>
                  <span class="row-meta">${dateStr} • ${item.num_words || 0} words</span>
                </div>
              </a>
            </div>`;
          })
          .join("");

        return `
          <section class="year-section">
            <header class="year-sticky-header">
              <h2>${year}</h2>
            </header>
            <div class="year-list">
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
