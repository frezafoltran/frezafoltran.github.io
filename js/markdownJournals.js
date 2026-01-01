// Uses: marked (marked.min.js), js-yaml (js-yaml.min.js), DOMPurify (purify.min.js)

function parseFrontMatter(text) {
  if (text.startsWith("---")) {
    const idx = text.indexOf("---", 3);
    if (idx !== -1) {
      const fmRaw = text.slice(3, idx).trim();
      const md = text.slice(idx + 3).trim();
      try {
        const fm = jsyaml.load(fmRaw) || {};
        return { fm, md };
      } catch (e) {
        console.warn("Front matter parse error", e);
      }
    }
  }
  return { fm: {}, md: text };
}

async function renderArticle(mdPath, container) {
  await ensureLibs();
  try {
    const res = await fetch(mdPath);
    if (!res.ok) {
      container.innerHTML = `<p>Article not found: <code>${mdPath}</code></p>`;
      return;
    }
    const raw = await res.text();
    const { fm, md } = parseFrontMatter(raw);

    const html = marked.parse(md);
    const title = fm.title || fm.title === "" ? fm.title : "Untitled";

    // FIX 1: Apply ordinal formatting here
    const date = formatToDayOfYear(fm.date);

    const img = fm.image
      ? `<div class="featured-img"><img src="${fm.image}" alt="${
          fm.image_alt || title
        }" loading="lazy"/></div>`
      : "";

    const profileLinks = fm.is_about_page
      ? `
         <div class="profile-links">
          <a href="docs/resume.pdf" aria-label="Resume" title="Resume"><img src="/assets/profile.svg" alt="Resume" /></a>
          <a href="https://www.linkedin.com/in/joao-foltran/" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i></a>
          <a href="https://github.com/frezafoltran" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i></a>
        </div>`
      : "";

    const articleHtml = `
    <div class="article-page">
      ${date ? `<div class="article-date">${date}</div>` : ""}
      <h1>${escapeHtml(title)}</h1>
      ${img}
      <div class="article-body">${DOMPurify.sanitize(html)}</div>
      ${profileLinks}
    </div>`;

    container.innerHTML = articleHtml;
    document.title =
      (title ? title + " • " : "") + (document.title || "My Portfolio");
  } catch (err) {
    container.innerHTML = `<p>Failed to load article. ${err}</p>`;
  }
}

window.renderArticle = renderArticle;
