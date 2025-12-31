// markdown.js
// Uses: marked (marked.min.js), js-yaml (js-yaml.min.js), DOMPurify (purify.min.js)
// We'll load the CDNs dynamically if not already present.

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

function parseFrontMatter(text) {
  // front matter between leading --- and next --- ; rest is markdown
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

    // Convert markdown to HTML
    const html = marked.parse(md);

    // Build article shell
    const title = fm.title || fm.title === "" ? fm.title : "Untitled";
    const date = fm.date
      ? new Date(fm.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
    const img = fm.image
      ? `<div class="featured-img"><img src="${fm.image}" alt="${
          fm.image_alt || title
        }" loading="lazy"/></div>`
      : "";

    const articleHtml = `
    <div class="article-page">
      ${date ? `<div class="article-date">${date}</div>` : ""}
      <h1>${escapeHtml(title)}</h1>
      ${img}
      <div class="article-body">${DOMPurify.sanitize(html)}</div>
    </div>
    `;
    container.innerHTML = articleHtml;
    // Update document title
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

// Renders index cards from a JSON index.
// articlesJsonPath: path to articles.json
// container: DOM element to populate
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
    // Build cards (sorted by date desc)
    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    container.innerHTML = list
      .map((item) => {
        const imgStyle = item.image
          ? `style="background-image:url('${item.image}')" `
          : "";
        const date = item.date
          ? new Date(item.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "";
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
        </a>
      `;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `<p>Error rendering index: ${err}</p>`;
  }
}

// export functions for inline usage
window.renderArticle = renderArticle;
window.renderIndex = renderIndex;
