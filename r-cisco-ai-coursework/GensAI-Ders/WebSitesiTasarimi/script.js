const storageKey = "yakup-theme";
const root = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");
const label = toggle?.querySelector(".theme-toggle__label");
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  root.dataset.theme = theme;

  if (!toggle || !label) {
    return;
  }

  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  label.textContent = isDark ? "Koyu tema" : "Açık tema";
}

const savedTheme = localStorage.getItem(storageKey);
applyTheme(savedTheme || (mediaQuery.matches ? "dark" : "light"));

toggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(storageKey, nextTheme);
  applyTheme(nextTheme);
});

mediaQuery.addEventListener("change", (event) => {
  if (!localStorage.getItem(storageKey)) {
    applyTheme(event.matches ? "dark" : "light");
  }
});
