# Pocket Fishing

A 2.5D fishing game: a dock and hut by a seaside town, five TiniTomo characters
(Momo, Soso, Kew, Rang, Bae), and the original Pocket Fishing catch gameplay
(cast, bite, Reel, Tug, Final Pull) with 75 fish to collect.

Open `index.html` in a browser. It is self-contained apart from three.js (jsDelivr) and Google Fonts.

## Folders

| Path | What it is |
|---|---|
| `index.html` | The game. Character art, logo and icons are embedded. |
| `art/` | Source PNGs for the character sprites (front and back) and the title logo. |
| `icons/` | App icon at 32–1024 px. |
| `tools/` | Sources for the generated parts of `index.html` (see below). |

## Rebuilding after editing `tools/`

```bash
python3 tools/build_page.py
```

This regenerates these blocks inside `index.html`:

- **Fishing gameplay**: built by `tools/build_fishing.py` from `tools/original_game.html` (the previous flat-art version), restyled by `tools/fishing_theme.js`, plus the 20 fish in `tools/extra_fish.json`.
- **3D fish models**: `tools/fish3d.js`.
- **Rod upgrade icons**: `tools/part3d.js`.
- **Trivia 2 and 3 for every fish**: `tools/fish_trivia.json` (trivia 1 lives on each fish).

Saves are stored in the browser under `pocket-fishing-v2`.
