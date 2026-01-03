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

// Extend marked with custom "definition" block
function addDefinitionSupport() {
  const tokenizer = {
    name: "definition",
    level: "block",
    start(src) {
      return src.indexOf(":::definition");
    },
    tokenizer(src, tokens) {
      const rule = /^:::definition\s*\n([\s\S]+?)\n:::/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: "definition",
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return `<div class="definition">${marked.parse(token.text)}</div>`;
    },
  };

  marked.use({ extensions: [tokenizer] });
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

    // Convert markdown -> html
    addDefinitionSupport();
    const html = marked.parse(md);

    // Sanitize the HTML BEFORE math rendering (keeps $...$ text nodes intact)
    const sanitizedHtml = DOMPurify.sanitize(html);

    const title = fm.title || fm.title === "" ? fm.title : "Untitled";
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
        <div class="article-body">${sanitizedHtml}</div>
        ${profileLinks}
      </div>`;

    // Insert sanitized HTML
    container.innerHTML = articleHtml;
    document.title =
      (title ? title + " • " : "") + (document.title || "My Portfolio");

    // --- Math rendering: KaTeX auto-render ---
    // target the article body (safer than running on whole document)
    const bodyEl = container.querySelector(".article-body");
    if (window.renderMathInElement && bodyEl) {
      renderMathInElement(bodyEl, {
        // delimiters: display and inline
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false, // don't throw on bad TeX
        // ignoreTags already defaults to ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      });
    }

    // Optionally: if you want to run a final sanitize pass on the resulting DOM:
    // DOMPurify.sanitize(container, { WHOLE_DOCUMENT: false });
    // (Test carefully — it may strip KaTeX classes; usually unnecessary.)
  } catch (err) {
    container.innerHTML = `<p>Failed to load article. ${err}</p>`;
  }
}
