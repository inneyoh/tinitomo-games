# MoSo Farm

A cozy isometric farm-and-village game starring Momo and Soso.

Plain HTML/CSS/JavaScript with no build step. Open it through any static web server
(the art is loaded as separate files, so `file://` will not work in every browser):

```bash
cd moso-farm
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Files

```
index.html        page shell (HUD, tabs, store screen markup)
css/style.css     all styles
js/events.js      story events and missions for special villagers (edit this!)
js/game.js        the whole game: data, farm, plaza, store screen, pachinko, save/load
assets/*.webp     every image (art is never embedded in code)
```

Images load lazily the first time something draws them, so the farm does not download
plaza art until you visit the plaza.

## Screens

- **Farm**: swipe to plant, water and harvest. Buy 3×3 fields by tapping a locked patch.
  Tap a grey pen to build it. The Main Barn has Upgrades, Furniture, Storage and Seeds.
  Momo and Soso relax on furniture you place.
- **Plaza**: free-roaming villagers walk around, shop and chat with each other.
  The **Shops** button (bottom-right) jumps straight to any store.
- **Store screen**: the shopkeeper's portrait and speech bubble on the left, and a menu
  with **Line-up**, **Shop owner** and **Upgrades** tabs on the right.
- **Pachinko**: spend loyalty coins on balls and swap balls for prizes. The cabinet, parlor and
  controls are OpenArt art (`assets/pk_*`, prizes `assets/pz_*`).

Villagers walk only on the cobblestone. `assets/walkmask.png` is a 144×81 map of the plaza
(one pixel per 16px cell, white = walkable) and they path-find around the fountain, bushes,
lamps and shop lots. A few arrive up the street at a time, do 2–4 things, then go home.

## Shops and owners

| Shop | Can be run by |
|---|---|
| Produce Shop | Momo or Soso only |
| Juice Shop | Momo or Soso only |
| Clothing Shop | Momo, Soso, or **Bae** once unlocked |
| Bakery | Momo, Soso, or **Nono** once unlocked |
| Eatery | Momo, Soso, or **Popo** once unlocked |
| Cafe | Momo, Soso, or **Kew** once unlocked |
| Popcorn Shop | Momo, Soso, or **Rang** once unlocked |

Special owners are unlocked through a **partnership score** (0–100) earned from story events:

1. The villager walks into the plaza.
2. They go to their shop, or any shop Momo or Soso are working at, and stand with Momo or Soso.
3. A pink **!** bubble appears over their head. Tap it to play the event: dialogue, choices, and
   sometimes a **mission** (sell items, bring items from the barn, or open a shop).
4. When a mission is done the villager comes back with a green **✓** bubble to report it.
5. At 100 partnership they can be picked as shopkeeper in that shop's **Shop owner** tab,
   which also shows the current mission and its progress.

All the stories live in **`js/events.js`**, with instructions at the top of the file. The ones
there now are samples: replace the text, choices, points and missions with the real story.
Open the game with `?debug` in the URL to get `window.__moso` for testing.

Nono has no art yet and shows a placeholder portrait. Add `assets/pt_nono.webp` (portrait)
and `assets/cu_nono.webp` (walking sprite), add both names to `ASSET_KEYS` at the top of
`js/game.js`, and add `"nono"` to `FRIENDS` to let Nono roam the plaza.

## Art

Farm, plaza, shops, furniture, crops and item icons were generated with OpenArt in a style
matched to the TiniTomo art. Momo and Soso's front/back/side/three-quarter sprites
(`momo_*`, `soso_*`) are cut from their modular sprite sheets, and the furniture poses
(`oa_f_<furniture>_<momo|soso>`) were made from those sheets. Momo is drawn a little bigger
than Soso (about 27 cm to 25 cm; `TSIZE` in `js/game.js`). The villagers come from the other
TiniTomo games in this repo.

## Saves

Progress is saved in the browser (`localStorage`, key `momo-soso-farmtown-v7`). New versions
migrate old saves instead of resetting them.
