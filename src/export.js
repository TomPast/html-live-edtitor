/* Export — download editor content as .html */

import { flashStatus } from "./storage.js";

export function initExport(getContent) {
  const btn = document.getElementById("export-btn");

  function doExport() {
    const content = getContent();
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
    flashStatus("exported");
  }

  btn.addEventListener("click", doExport);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      doExport();
    }
  });
}
