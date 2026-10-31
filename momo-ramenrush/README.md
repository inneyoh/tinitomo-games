# Momo's Ramen Shop (もも屋)

Portrait HTML ramen game starring Momo. Open `index.html` (GitHub Pages: `/momo-ramenrush/`).

- `js/patch-notes.js` — **the update notice** players see once after an update. Change `VERSION`, edit the text, push.
- `js/config.js` — **all the tuning**: kitchenware upgrades and prices (`UPGRADES`), night market (`MARKET`), rent / starting money / patience / tips (`ECON`), kitchen timing (`CFG`), customers (`CUSTOMERS`), volumes (`VOL`).
- `js/game.js` — the game code.
- `style.css` — the look.
- `js/save-transfer.js` — the Transfer Save button; `js/cloudflare-worker.js` — the Cloudflare Worker it talks to (deployed on Cloudflare, not loaded by the game).
- `index.html` — the page layout (scenes, buttons, panels).
- `assets/` — sprites (`assets/icons/` = app icons) · `audio/` — music and sound effects.
- `atlases/` — 900 Ramen Book sheets (1024×1024, 64 bowls each). Thumbnails fall back to drawn bowls if a sheet is missing.
- `manifest.webmanifest` for "Add to Home Screen".

Opening `index.html` straight from your computer (file://) may block the sounds; use GitHub Pages or a local server (`python3 -m http.server`).

After editing `style.css`, `js/config.js` or `js/game.js`, bump the `?v=` number on their tags in `index.html` (any new number) so phones load the new version straight away. Saves are kept in the browser (localStorage) and are not affected.
