/* Storage — LocalStorage persistence */

const KEYS = {
  content: "hle:content",
  split: "hle:split",
};

/* Debounce helper */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* Save indicator */
let fadeTimer;
export function flashStatus(text = "saved") {
  const el = document.getElementById("save-status");
  if (!el) return;
  el.textContent = text;
  el.classList.add("visible");
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => el.classList.remove("visible"), 1500);
}

/* Content */
const _saveContentNow = (htmlString) => {
  try {
    localStorage.setItem(KEYS.content, htmlString);
    flashStatus();
  } catch { /* quota exceeded — silently fail */ }
};

export const saveContent = debounce(_saveContentNow, 1000);

export function loadContent() {
  return localStorage.getItem(KEYS.content);
}

export function clearContent() {
  localStorage.removeItem(KEYS.content);
}

/* Split position */
export function saveSplit(data) {
  try {
    localStorage.setItem(KEYS.split, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function loadSplit() {
  try {
    const raw = localStorage.getItem(KEYS.split);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* Reset all */
export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
