/* Panel — split-pane resize + collapse */

import { saveSplit, loadSplit } from "./storage.js";

const workspace = document.getElementById("workspace");
const editorPane = document.getElementById("editor-pane");
const divider = document.getElementById("divider");
const codeToggle = document.getElementById("code-toggle");
const codeToggleLabel = codeToggle.querySelector("span");
const expandBtn = document.getElementById("expand-btn");

const DEFAULT_SPLIT = 45;
let splitPercent = DEFAULT_SPLIT;
let collapsed = false;

function applySplit() {
  workspace.style.setProperty("--split", `${splitPercent}%`);
}

function persistSplit() {
  saveSplit({ split: splitPercent });
}

/* Divider drag */
let isDragging = false;

divider.addEventListener("pointerdown", (e) => {
  if (collapsed) return;
  isDragging = true;
  divider.setPointerCapture(e.pointerId);
  divider.classList.add("active");
  editorPane.classList.add("no-transition");
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
  e.preventDefault();
});

divider.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const percent = (e.clientX / window.innerWidth) * 100;
  splitPercent = Math.max(15, Math.min(75, percent));
  applySplit();
});

divider.addEventListener("pointerup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  divider.releasePointerCapture(e.pointerId);
  divider.classList.remove("active");
  editorPane.classList.remove("no-transition");
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  persistSplit();
});

/* Toggle collapse */
function toggleCollapse() {
  collapsed = !collapsed;
  editorPane.classList.toggle("collapsed", collapsed);
  divider.classList.toggle("hidden", collapsed);
  expandBtn.classList.toggle("visible", collapsed);
  codeToggleLabel.textContent = collapsed ? "expand" : "collapse";
}

codeToggle.addEventListener("click", toggleCollapse);
expandBtn.addEventListener("click", toggleCollapse);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    toggleCollapse();
  }
});

/* Reset layout (called from main.js on reset) */
export function resetLayout() {
  collapsed = false;
  splitPercent = DEFAULT_SPLIT;
  editorPane.classList.remove("collapsed");
  divider.classList.remove("hidden");
  expandBtn.classList.remove("visible");
  codeToggleLabel.textContent = "collapse";
  applySplit();
  persistSplit();
}

/* Mobile tabs */
const mobileTabs = document.getElementById("mobile-tabs");
const mobileTabBtns = mobileTabs.querySelectorAll(".mobile-tab");

mobileTabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    mobileTabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    workspace.classList.remove("mobile-show-preview", "mobile-show-console");
    if (tab === "preview") workspace.classList.add("mobile-show-preview");
    if (tab === "console") workspace.classList.add("mobile-show-console");
  });
});

/* Restore saved split on load */
const saved = loadSplit();
if (saved && saved.split) {
  splitPercent = saved.split;
}
applySplit();
