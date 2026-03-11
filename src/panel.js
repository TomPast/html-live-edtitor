const panel = document.getElementById("editor-panel");
const toolbar = document.getElementById("editor-toolbar");
const resizeHandle = document.getElementById("resize-handle");
const btnClose = panel.querySelector(".tl-close");
const btnMinimize = panel.querySelector(".tl-minimize");
const btnMaximize = panel.querySelector(".tl-maximize");

/* Rect helpers */
function savePanelRect() {
  return {
    top: panel.style.top || panel.offsetTop + "px",
    left: panel.style.left || panel.offsetLeft + "px",
    width: panel.style.width || panel.offsetWidth + "px",
    height: panel.style.height || panel.offsetHeight + "px",
  };
}

function restorePanelRect(rect) {
  if (!rect) return;
  panel.style.top = rect.top;
  panel.style.left = rect.left;
  panel.style.width = rect.width;
  panel.style.height = rect.height;
}

function isConstrained() {
  return (
    panel.classList.contains("minimized") ||
    panel.classList.contains("maximized")
  );
}

/* Drag */
let isDragging = false;
let dragStartX, dragStartY, panelStartX, panelStartY, dragPanelW, dragPanelH;

toolbar.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".tl-btn") || isConstrained()) return;
  isDragging = true;
  toolbar.setPointerCapture(e.pointerId);
  toolbar.classList.add("dragging");
  document.body.style.userSelect = "none";
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  panelStartX = panel.offsetLeft;
  panelStartY = panel.offsetTop;
  dragPanelW = panel.offsetWidth;
  dragPanelH = panel.offsetHeight;
  e.preventDefault();
});

toolbar.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const maxX = window.innerWidth - dragPanelW;
  const maxY = Math.max(0, window.innerHeight - dragPanelH);
  const newX = Math.max(
    0,
    Math.min(panelStartX + (e.clientX - dragStartX), maxX)
  );
  const newY = Math.max(
    0,
    Math.min(panelStartY + (e.clientY - dragStartY), maxY)
  );
  panel.style.left = newX + "px";
  panel.style.top = newY + "px";
});

toolbar.addEventListener("pointerup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  toolbar.releasePointerCapture(e.pointerId);
  toolbar.classList.remove("dragging");
  document.body.style.userSelect = "";
});

/* Resize */
let isResizing = false;
let resizeStartX, resizeStartY, startWidth, startHeight;

resizeHandle.addEventListener("pointerdown", (e) => {
  if (isConstrained()) return;
  isResizing = true;
  resizeHandle.setPointerCapture(e.pointerId);
  document.body.style.userSelect = "none";
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  startWidth = panel.offsetWidth;
  startHeight = panel.offsetHeight;
  e.preventDefault();
  e.stopPropagation();
});

resizeHandle.addEventListener("pointermove", (e) => {
  if (!isResizing) return;
  panel.style.width =
    Math.max(320, startWidth + (e.clientX - resizeStartX)) + "px";
  panel.style.height =
    Math.max(200, startHeight + (e.clientY - resizeStartY)) + "px";
});

resizeHandle.addEventListener("pointerup", (e) => {
  if (!isResizing) return;
  isResizing = false;
  resizeHandle.releasePointerCapture(e.pointerId);
  document.body.style.userSelect = "";
});

/* Minimize / Maximize */
let savedRect = null;
let savedRectMax = null;

function toggleMinimize() {
  if (panel.classList.contains("minimized")) {
    panel.classList.remove("minimized");
    restorePanelRect(savedRect);
  } else {
    if (panel.classList.contains("maximized")) {
      panel.classList.remove("maximized");
      restorePanelRect(savedRectMax);
    }
    savedRect = savePanelRect();
    panel.classList.add("minimized");
  }
}

function toggleMaximize() {
  if (panel.classList.contains("minimized")) {
    panel.classList.remove("minimized");
    restorePanelRect(savedRect);
  }
  if (panel.classList.contains("maximized")) {
    panel.classList.remove("maximized");
    restorePanelRect(savedRectMax);
  } else {
    savedRectMax = savePanelRect();
    panel.classList.add("maximized");
  }
}

btnClose.addEventListener("click", toggleMinimize);
btnMinimize.addEventListener("click", toggleMinimize);
btnMaximize.addEventListener("click", toggleMaximize);

toolbar.addEventListener("dblclick", (e) => {
  if (e.target.closest(".tl-btn")) return;
  if (panel.classList.contains("minimized")) toggleMinimize();
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    toggleMinimize();
  }
});

/* Code toggle */
const codeToggle = document.getElementById("code-toggle");
const codeToggleLabel = codeToggle.querySelector("span");
let panelHidden = false;

function togglePanel() {
  panelHidden = !panelHidden;
  panel.classList.toggle("hidden", panelHidden);
  codeToggle.classList.toggle("active", !panelHidden);
  codeToggleLabel.textContent = panelHidden ? "Show Code" : "Hide Code";
}

codeToggle.classList.add("active");
codeToggle.addEventListener("click", togglePanel);
