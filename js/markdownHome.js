async function renderIndex(articlesJsonPath, container) {
  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const isLeapYear = (year) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  try {
    const res = await fetch(articlesJsonPath);
    const list = await res.json();
    if (!list || list.length === 0) {
      container.innerHTML = `<p>No articles found.</p>`;
      return;
    }

    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Grouping logic
    const yearGroups = {};
    const dayCounts = {};

    list.forEach((item) => {
      const d = new Date(item.date);
      const year = d.getFullYear();
      const dayIndex = getDayOfYear(d);
      const key = `${year}-${dayIndex}`;

      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(item);
      dayCounts[key] = (dayCounts[key] || 0) + 1;
    });

    const sortedYears = Object.keys(yearGroups).sort((a, b) => b - a);

    container.innerHTML = sortedYears
      .map((year) => {
        const articles = yearGroups[year];
        const totalDaysInYear = isLeapYear(parseInt(year)) ? 366 : 365;

        const articleRows = articles
          .map((item) => {
            const d = new Date(item.date);
            const currentDayIndex = getDayOfYear(d);
            const percentYear = (
              (currentDayIndex / totalDaysInYear) *
              100
            ).toFixed(1);
            const dateStr = d.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            let bricksHtml = "";
            for (let i = 1; i <= currentDayIndex; i++) {
              const count = dayCounts[`${year}-${i}`] || 0;
              let level = 0;
              if (count > 0) level = Math.min(count, 4);
              const isCurrent = i === currentDayIndex ? "current" : "";
              bricksHtml += `<div class="brick lvl-${level} ${isCurrent}"></div>`;
            }

            return `
        <div class="article-group">
          <div class="brick-wrapper">
            <div class="brick-container">${bricksHtml}</div>
            <span class="percent-label">${percentYear}%</span>
          </div>
          <a class="article-row no-thumb" href="article.html?post=${encodeURIComponent(item.slug)}">
            <h2 class="row-title">${item.title || item.slug}</h2>
            <span class="row-meta">${dateStr} • ${item.num_words || 0} words</span>
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
    container.innerHTML = `<p>Error: ${err}</p>`;
  }
}
window.renderIndex = renderIndex;
