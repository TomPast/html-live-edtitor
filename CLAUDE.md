# HTML Live Editor

## Stack

- Vite (build tool, dev server)
- CodeMirror 6 (npm packages)
- Vanilla JS/CSS, no framework

## Commands

- `npm run dev` — dev server at http://localhost:5173
- `npm run build` — production build in dist/

## Structure

- `index.html` — Vite entry point
- `src/main.js` — CodeMirror 6 setup + iframe preview logic
- `src/panel.js` — panel drag, resize, minimize/maximize
- `src/storage.js` — localStorage persistence (auto-save/restore editor content)
- `src/export.js` — export/download current code as .html file
- `src/style.css` — layout + glass morphism styling

## Conventions

- No decorative comment banners. Use plain `/* Title */` instead.
- Keep solutions minimal — no over-engineering.
- Vanilla JS only, no frameworks.

## Features

- LocalStorage persistence (auto-save on edit, restore on load)
- Export/download current code as .html file

## Planned Features

- Console output panel (capture console.log/warn/error from preview iframe)
- Template library (starter templates: blank, flexbox layout, animation, form, etc.)
- Multi-file tabs (separate HTML/CSS/JS editors combined into preview)
- Code sharing (URL encoding or external service)
- Real-time multiplayer editing via WebSocket
