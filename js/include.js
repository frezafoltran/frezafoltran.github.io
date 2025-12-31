// include.js
async function includePartials() {
  const elements = document.querySelectorAll("[data-include]");
  for (const el of elements) {
    const file = el.getAttribute("data-include");
    try {
      const res = await fetch(file);
      if (!res.ok) {
        el.innerHTML = "";
        continue;
      }
      el.innerHTML = await res.text();
    } catch (err) {
      el.innerHTML = "";
      console.error("Include error:", err);
    }
  }
  initThemeToggle();
}

// Theme persistence: localStorage 'site-theme' ('dark' or 'light')
function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  if (!toggle) return;
  const stored =
    localStorage.getItem("site-theme") ||
    root.getAttribute("data-theme") ||
    "dark";
  root.setAttribute("data-theme", stored);
  toggle.checked = stored === "dark";
  toggle.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    localStorage.setItem("site-theme", theme);
  });
}

includePartials();
