/* Share — encode editor content into a shareable URL */

import LZString from "lz-string";
import { flashStatus } from "./storage.js";

const HASH_PREFIX = "code=";

/* Decode shared content from URL hash (call before localStorage load) */
export function getSharedContent() {
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith(HASH_PREFIX)) return null;

  const compressed = hash.slice(HASH_PREFIX.length);
  const content = LZString.decompressFromEncodedURIComponent(compressed);
  if (!content) return null;

  /* Clean hash so it doesn't persist across reloads */
  history.replaceState(null, "", window.location.pathname + window.location.search);
  return content;
}

/* Build share URL from content string */
function buildShareURL(content) {
  const compressed = LZString.compressToEncodedURIComponent(content);
  return window.location.origin + window.location.pathname + "#" + HASH_PREFIX + compressed;
}

/* Modal */
function showShareModal(url) {
  /* Prevent duplicate modals */
  const existing = document.getElementById("share-modal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "share-modal";
  overlay.innerHTML = `
    <div class="share-modal-card">
      <div class="share-modal-header">
        <span>Share URL</span>
        <button class="share-modal-close" title="Close">&times;</button>
      </div>
      <input class="share-modal-input" type="text" readonly value="${url.replace(/"/g, "&quot;")}" />
      <button class="share-modal-copy">Copy</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = overlay.querySelector(".share-modal-input");
  const copyBtn = overlay.querySelector(".share-modal-copy");
  const closeBtn = overlay.querySelector(".share-modal-close");

  input.addEventListener("click", () => input.select());

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(url).then(() => {
      copyBtn.textContent = "Copied!";
      flashStatus("link copied");
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
    });
  });

  function close() { overlay.remove(); }
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", function onEsc(e) {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", onEsc); }
  });
}

/* Init — wire up share button + keyboard shortcut */
export function initShare(getContent) {
  const btn = document.getElementById("share-btn");

  function doShare() {
    const content = getContent();
    const url = buildShareURL(content);
    showShareModal(url);
  }

  btn.addEventListener("click", doShare);
}
