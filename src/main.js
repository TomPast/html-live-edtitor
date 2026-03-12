import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { saveContent, loadContent, clearAll } from "./storage.js";
import { initExport } from "./export.js";
import { initShare, getSharedContent } from "./share.js";
import { resetLayout } from "./panel.js";

const DEFAULT_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      background: linear-gradient(
        135deg,
        #1a1a2e 0%,
        #16213e 25%,
        #0f3460 50%,
        #533483 75%,
        #e94560 100%
      );
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #fff;
      gap: 1.5rem;
      overflow: hidden;
    }

    h1 {
      font-size: clamp(2rem, 6vw, 4rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      text-shadow: 0 0 60px rgba(233, 69, 96, 0.7);
    }

    p {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      opacity: 0.75;
      text-align: center;
      max-width: 50ch;
      line-height: 1.7;
    }

    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.55;
      animation: drift 9s ease-in-out infinite alternate;
    }
    .orb-1 { width: 600px; height: 600px; background: #e94560; top: -150px; left: -150px; }
    .orb-2 { width: 500px; height: 500px; background: #533483; bottom: -150px; right: -150px; animation-delay: -4s; }
    .orb-3 { width: 350px; height: 350px; background: #0f3460; top: 35%; left: 45%; animation-delay: -7s; }

    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(50px, 35px) scale(1.08); }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <h1>HTML Live Editor</h1>
  <p>Edit the code on the left and watch your changes appear here instantly.</p>
</body>
</html>`;

const preview = document.getElementById("preview");
const editorMount = document.getElementById("editor-mount");

function updatePreview(content) {
  preview.srcdoc = content;
}

const initialDoc = getSharedContent() || loadContent() || DEFAULT_HTML;

const state = EditorState.create({
  doc: initialDoc,
  extensions: [
    basicSetup,
    html(),
    oneDark,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.state.doc.toString();
        updatePreview(doc);
        saveContent(doc);
      }
    }),
    EditorView.theme({
      "&": { height: "100%" },
      ".cm-scroller": { overflow: "auto" },
    }),
  ],
});

const view = new EditorView({ state, parent: editorMount });

updatePreview(initialDoc);

initExport(() => view.state.doc.toString());
initShare(() => view.state.doc.toString());

/* Reset button */
document.getElementById("reset-btn").addEventListener("click", () => {
  if (!confirm("Reset to default? Your current code will be lost.")) return;
  clearAll();
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: DEFAULT_HTML },
  });
  updatePreview(DEFAULT_HTML);
  resetLayout();
});
