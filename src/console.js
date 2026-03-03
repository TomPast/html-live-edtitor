const preview = document.getElementById("preview");
const consolePanel = document.getElementById("console-panel");
const consoleOutput = document.getElementById("console-output");
const consoleToggle = document.getElementById("console-toggle");
const consoleClear = document.getElementById("console-clear");

const CONSOLE_SCRIPT = `<script>
(function() {
  ['log','warn','error','info'].forEach(function(m) {
    var orig = console[m];
    console[m] = function() {
      var args = Array.prototype.slice.call(arguments).map(function(a) {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a, null, 2); } catch(e) { return String(a); }
      });
      window.parent.postMessage({ type: 'console', method: m, args: args }, '*');
      orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e) {
    window.parent.postMessage({
      type: 'console', method: 'error',
      args: [e.message + (e.lineno ? ' (line ' + e.lineno + ')' : '')]
    }, '*');
  });
})();
<\/script>`;

const ICONS = { log: '▶', warn: '⚠', error: '✕', info: 'ℹ' };

function addConsoleEntry(method, args) {
  const entry = document.createElement('div');
  entry.className = `console-entry ${method}`;

  const icon = document.createElement('i');
  icon.className = 'console-icon';
  icon.textContent = ICONS[method] || '▶';

  const msg = document.createElement('span');
  msg.className = 'console-msg';
  msg.textContent = args.join(' ');

  const now = new Date();
  const time = document.createElement('span');
  time.className = 'console-time';
  time.textContent = now.toTimeString().slice(0, 8);

  entry.append(icon, msg, time);
  consoleOutput.appendChild(entry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function toggleConsole() {
  consolePanel.classList.toggle('hidden');
  consoleToggle.classList.toggle('active');
}

export function injectConsoleScript(html) {
  if (html.includes('<head>')) return html.replace('<head>', '<head>' + CONSOLE_SCRIPT);
  if (html.includes('<body>')) return html.replace('<body>', CONSOLE_SCRIPT + '<body>');
  return CONSOLE_SCRIPT + html;
}

export function clearConsole() {
  consoleOutput.innerHTML = '';
}

window.addEventListener('message', (e) => {
  if (e.source !== preview.contentWindow) return;
  if (e.data?.type === 'console') addConsoleEntry(e.data.method, e.data.args);
});

consoleToggle.addEventListener('click', toggleConsole);
consoleClear.addEventListener('click', clearConsole);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === '`') {
    e.preventDefault();
    toggleConsole();
  }
});
