# Momo's Ramen Shop (もも屋)

Portrait HTML ramen game starring Momo. Open `index.html` (GitHub Pages: `/momo-ramenrush/`).

- `config.js` — **all the tuning**: kitchenware upgrades and prices (`UPGRADES`), night market (`MARKET`), rent / starting money / patience / tips (`ECON`), kitchen timing (`CFG`), customers (`CUSTOMERS`), volumes (`VOL`).
- `game.js` — the game code.
- `style.css` — the look.
- `index.html` — the page layout (scenes, buttons, panels).
- `assets/` — sprites (`assets/icons/` = app icons) · `audio/` — music and sound effects.
- `atlases/` — 900 Ramen Book sheets (1024×1024, 64 bowls each). Thumbnails fall back to drawn bowls if a sheet is missing.
- `manifest.webmanifest` for "Add to Home Screen".

Opening `index.html` straight from your computer (file://) may block the sounds; use GitHub Pages or a local server (`python3 -m http.server`).

After editing `style.css`, `config.js` or `game.js`, bump the `?v=` number on their tags in `index.html` (any new number) so phones load the new version straight away. Saves are kept in the browser (localStorage) and are not affected.
