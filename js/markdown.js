// Uses: marked (marked.min.js), js-yaml (js-yaml.min.js), DOMPurify (purify.min.js)

async function ensureLibs() {
  const libs = [];
  if (typeof marked === "undefined") {
    libs.push(loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js"));
  }
  if (typeof jsyaml === "undefined") {
    libs.push(
      loadScript(
        "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"
      )
    );
  }
  if (typeof DOMPurify === "undefined") {
    libs.push(
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"
      )
    );
  }
  await Promise.all(libs);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function formatToDayOfYear(dateInput) {
  if (!dateInput) return "";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) return String(dateInput);

  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 0);
  const diff = date.getTime() - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;

  const dayOfYear = Math.floor(diff / oneDay);

  return `day ${dayOfYear} of ${year}`;
}

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

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

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

    container.innerHTML = list
      .map((item) => {
        const imgStyle = item.thumbnail
          ? `style="background-image:url('${item.thumbnail}')" `
          : "";

        // FIX 2: Apply ordinal formatting here
        const date = formatToDayOfYear(item.date);

        return `
        <a class="article-card" href="article.html?post=${encodeURIComponent(
          item.slug
        )}">
          <div class="article-image" ${imgStyle}></div>
          <div class="article-content">
            ${date ? `<p class="article-date">${date}</p>` : ""}
            <h2 class="article-title">${escapeHtml(
              item.title || item.slug
            )}</h2>
          </div>
        </a>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `<p>Error rendering index: ${err}</p>`;
  }
}

window.renderArticle = renderArticle;
window.renderIndex = renderIndex;
