function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function loadStyle(href) {
  return new Promise((resolve, reject) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.onload = resolve;
    l.onerror = reject;
    document.head.appendChild(l);
  });
}

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

  // --- KaTeX CSS (must load even if JS already exists) ---
  if (!document.querySelector('link[href*="katex.min.css"]')) {
    libs.push(
      loadStyle("https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css")
    );
  }

  // --- KaTeX core ---
  if (typeof katex === "undefined") {
    libs.push(
      loadScript("https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js")
    );
  }

  // --- KaTeX auto-render ---
  if (typeof renderMathInElement === "undefined") {
    libs.push(
      loadScript(
        "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
      )
    );
  }

  await Promise.all(libs);
}

function getDateCounters(dateInput) {
  if (!dateInput) return null;

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  // Reuse existing logic as the authority for day-of-year
  const year = date.getUTCFullYear();

  const startOfYear = Date.UTC(year, 0, 1);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / oneDay) + 1;

  const weekOfYear = Math.ceil(dayOfYear / 7);

  return { dayOfYear, weekOfYear, year };
}

function formatToDayOfYear(dateInput) {
  const { dayOfYear, year } = getDateCounters(dateInput);

  return `day ${dayOfYear} of ${year}`;
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
