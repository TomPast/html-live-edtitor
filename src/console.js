/* Console — capture iframe console output */

const preview = document.getElementById("preview");
const panel = document.getElementById("console-panel");
const output = document.getElementById("console-output");
const badge = document.getElementById("console-badge");
const clearBtn = document.getElementById("console-clear");
const runBtn = document.getElementById("console-run");
const consoleInput = document.getElementById("console-input");
const consoleBar = document.getElementById("console-bar");

const MAX_ENTRIES = 1000;
const VALID_TYPES = new Set(["log", "warn", "error", "info"]);

let entryCount = 0;
let collapsed = true;
let hasErrors = false;

/* Serialize values for display */
function serialize(val) {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    try { return JSON.stringify(val, null, 2); } catch { return String(val); }
  }
  return String(val);
}

/* Add a log entry */
function addEntry(type, args) {
  if (!VALID_TYPES.has(type)) type = "log";

  const row = document.createElement("div");
  row.className = `console-entry console-${type}`;

  const label = document.createElement("span");
  label.className = "console-label";
  label.textContent = type === "log" ? "›" : type === "warn" ? "⚠" : type === "error" ? "✕" : "ℹ";

  const msg = document.createElement("span");
  msg.className = "console-msg";
  msg.textContent = args.map(serialize).join(" ");

  row.appendChild(label);
  row.appendChild(msg);
  output.appendChild(row);
  entryCount++;

  /* Cap entries */
  while (output.children.length > MAX_ENTRIES) {
    output.firstChild.remove();
    entryCount--;
  }

  updateBadge();
  output.scrollTop = output.scrollHeight;

  /* Track errors and auto-expand */
  if (type === "error") {
    hasErrors = true;
    panel.classList.add("has-errors");
    if (collapsed) setCollapsed(false);
  }

  /* Pulse badge when collapsed */
  if (collapsed) {
    badge.classList.remove("pulse");
    void badge.offsetWidth;
    badge.classList.add("pulse");
  }
}

function updateBadge() {
  badge.textContent = entryCount > 0 ? entryCount : "";
  badge.classList.toggle("visible", entryCount > 0);
  badge.classList.toggle("has-errors", hasErrors);
}

/* Clear */
function clearConsole() {
  entryCount = 0;
  hasErrors = false;
  output.replaceChildren();
  panel.classList.remove("has-errors");
  updateBadge();
}

clearBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  clearConsole();
});

/* Toggle */
function setCollapsed(value) {
  collapsed = value;
  panel.classList.toggle("collapsed", collapsed);
}

consoleBar.addEventListener("click", () => {
  setCollapsed(!collapsed);
});

/* Run button — re-executes the preview */
let _rerunFn = null;
export function initConsole(rerunFn) {
  _rerunFn = rerunFn;
}

runBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (_rerunFn) _rerunFn();
});

/* Eval input — execute JS inside the iframe */
consoleInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const expr = consoleInput.value.trim();
  if (!expr) return;
  consoleInput.value = "";

  /* Show the expression as a user entry */
  addEntry("log", ["> " + expr]);

  /* Send to iframe for eval */
  try {
    preview.contentWindow.postMessage({ __eval: expr }, "*");
  } catch {
    addEntry("error", ["Cannot access iframe"]);
  }
});

/* Prevent bar toggle when clicking the input */
consoleInput.addEventListener("click", (e) => e.stopPropagation());

/* Listen for messages from iframe — validate source */
window.addEventListener("message", (e) => {
  if (e.source !== preview.contentWindow) return;
  if (e.data && e.data.__console) {
    addEntry(e.data.type, e.data.args);
  }
});

/* Script to inject into iframe srcdoc */
const CONSOLE_INTERCEPT = `
<script>
(function(){
  var _c = window.console;
  ['log','warn','error','info'].forEach(function(m){
    var orig = _c[m];
    _c[m] = function(){
      var args = [];
      for(var i=0;i<arguments.length;i++){
        try{
          args.push(typeof arguments[i]==='object'?JSON.parse(JSON.stringify(arguments[i])):arguments[i]);
        }catch(e){args.push(String(arguments[i]));}
      }
      parent.postMessage({__console:true,type:m,args:args},'*');
      orig.apply(_c,arguments);
    };
  });
  window.addEventListener('error',function(e){
    parent.postMessage({__console:true,type:'error',args:[e.message+' (line '+e.lineno+')']},'*');
  });
  window.addEventListener('unhandledrejection',function(e){
    parent.postMessage({__console:true,type:'error',args:['Unhandled Promise: '+e.reason]},'*');
  });
  window.addEventListener('message',function(e){
    if(e.data&&e.data.__eval){
      try{
        var r=eval(e.data.__eval);
        if(typeof r!=='undefined') _c.log(r);
      }catch(err){_c.error(err.message);}
    }
  });
})();
<\/script>
`;

export function injectConsole(srcdoc) {
  const headMatch = srcdoc.match(/<head[^>]*>/i);
  if (headMatch) {
    const idx = headMatch.index + headMatch[0].length;
    return srcdoc.slice(0, idx) + CONSOLE_INTERCEPT + srcdoc.slice(idx);
  }
  const htmlMatch = srcdoc.match(/<html[^>]*>/i);
  if (htmlMatch) {
    const idx = htmlMatch.index + htmlMatch[0].length;
    return srcdoc.slice(0, idx) + "<head>" + CONSOLE_INTERCEPT + "</head>" + srcdoc.slice(idx);
  }
  return CONSOLE_INTERCEPT + srcdoc;
}

export function clearOnRefresh() {
  clearConsole();
}
