# Guinny's Garden Shop

A slow-life garden shop game (prototype). Guinny grows flowers, turns them into
tea, perfume and bouquets in her 作業場, and sells them at her little shop.

Plain HTML/CSS/JS with no build step. It works in portrait and landscape, and
can be added to the home screen as an app (PWA).

## Run it

ES modules need a web server (opening the file directly won't work):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static host works (GitHub Pages, Netlify…).

## The loop

| Scene | What happens |
|---|---|
| **Shop** (お店) | Layered shop-front background (separate art for portrait and landscape). Guinny stands behind the counter and customers walk in from the right. **Wrapping table** (paper + ribbon) opens the packing pop-up: arrange the bouquet (bouquet orders only, straight from the flower basket), put the item in a bag, spray perfume on the bag (up to 3 sprays, more sprays mean a better tip chance). Then tap the bag to hand it over and tap the coins. The **iPad** opens Today's Menu (the lineup, shown on the chalk menu board) and the Decor Shop. |
| **作業場** (Workshop) | Turn flowers into tea and perfume. Each recipe has 3 tap steps. |
| **Garden** (お庭) | Lawn background with 8 four-patch planters, 2 flower pots and a work bench (watering can, trowel, iPad). Planters 1–2 start open; the rest unlock with upgrades. **Tap** an empty patch or pot to choose a seed and how many to plant (that planter fills first). A planted patch gets the soil patch and dirt mound, and the sprout grows behind the mound. **Drag the watering can** over a planter (all 4 patches) or a pot. Crops only grow while wet, and one watering lasts half the grow time. **Swipe** across ripe plants to harvest (tap works too). The bench **iPad** has a **Shop** (seeds ×1/×5, garden upgrades) and **Guinny's Flower Encyclopedia** (a page fills in on first harvest). |

Real-life time:
- The HUD clock and the sky/lighting follow the device clock (dawn, day, dusk, night).
- At each new real date you get a new **Day**, a summary of yesterday, and a new **★ trend** item that sells for 30% more and is asked for more often. Everyone sees the same trend on the same date.
- Customer demand shifts by hour: tea in the morning, bouquets later in the day.

Settings (gear icon) has a **Speedy garden** toggle (10× growth) for playtesting, plus sound and reset.

## Files

```
index.html            app shell + title screen
css/style.css         all styles (portrait + landscape layouts)
js/main.js            boot, navigation, HUD clock, day rollover, settings
js/state.js           save/load (localStorage), real-time helpers
js/data.js            flowers, products, decor, customers, start values ← balance here
js/art.js             placeholder SVG art + ASSET_OVERRIDES ← swap in real art here
js/ui.js              sheets, toasts, sounds
js/scenes/*.js        shop, workshop, garden
assets/img/           Guinny sprites, logo
assets/icons/         app icon sizes
sw.js                 offline cache (bump VERSION after changes)
```

## Swapping in real assets

Guinny, the logo, the icon, the shop-front background and the pop-up frame are real art. The customers are borrowed from Momo's Ramen Shop as placeholders. Everything else is placeholder SVG. To use a real
image, drop it in `assets/img/` and map it in `ASSET_OVERRIDES` in `js/art.js`:

```js
export const ASSET_OVERRIDES = {
  'product:rose_perfume': 'assets/img/rose-perfume.webp',
  'flower:rose':          'assets/img/rose.webp',
  'seed:rose':            'assets/img/rose-seeds.webp',
  'customer:bunny':       'assets/img/bunny.webp',
  'decor:fern':           'assets/img/fern.webp',
};
```

Keys are `type:id`, and the ids come from `js/data.js`. Transparent square-ish
WebP/PNG works best (customers are about 100×140). Backgrounds (walls, counter,
garden) are CSS in `css/style.css` under each scene's section.

### Garden layout

`assets/img/garden/` holds the user's garden sprites (lawn for each orientation, planter, soil patch, dirt mound, pots, bench, can, trowel, iPad). They are placed to match the sample layouts, in % of a 1672×941 / 941×1672 canvas. The positions are in the "Garden" section at the end of `css/style.css`. `garden.js` sizes the canvas to cover the screen while keeping the play area visible (`KEEP`). Plants are still placeholder SVG (`plotArt` in `js/art.js`). Guinny appears in landscape only, since the portrait layout has no free spot.

### Shop-front layout

The shop layers are drawn on a canvas with the art's own aspect ratio (1672×941 or 941×1672) that covers the view. Guinny, the customers, the menu board text, the tap areas (wrapping table, iPad), the bag/coins and the decor are all placed in **% of that canvas**, in the "Shop front" section at the end of `css/style.css` (`[data-o="landscape"]` / `[data-o="portrait"]`). If new background art moves the counter or iPad, update those numbers. The draw order is wall → floor → window → board → Guinny → counter → customers.
