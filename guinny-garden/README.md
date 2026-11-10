# Guinny's Garden Shop

A slow-life garden shop game (prototype). Guinny grows flowers, turns them into
tea, perfume and bouquets in her 作業場, and sells them at her little shop.

Plain HTML/CSS/JS with no build step. It works in portrait and landscape, and
can be added to the home screen as an app (PWA).

Every area is full screen. The only on-screen controls are two small floating buttons:
the **coin pill** (top-left; tap to show the clock, day and settings) and the **area button**
(bottom-right; tap to open Shop / 作業場 / Garden). Hint bubbles fade out after a few seconds.

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
| **作業場** (Workshop) | Layered art (`assets/img/workshop/`) laid out like the user's samples, with three workable stations that are always outlined and labelled (and glow when you have the flowers): **Perfume alchemy set** → perfume (*Weigh*, *Sort*, *Mix*); **Tea urn** → tea blends: drag ingredient pieces (the user's art, `assets/img/brew/`) from the tray into the urn's 4×5 grid until it's full; tap a tray piece to turn it, tap a placed piece to take it out. The tray uses the shop pop-up frame: along the bottom with ◀ ▶ in portrait, on the right with ▲ ▼ in landscape. Each brewed tea's `needs` in `js/data.js` is a piece mix that fills the grid exactly; **Tea leaf rack** → loose-leaf tea (*Chop*, *Dry*, *Pour*). Each mini-game scores 1–3 stars, and 3 stars gives a bonus item. Flowers are only used when you finish. **Customisable furniture:** wall & ceiling, floor, rug, stool, flower basket and potted plant. Styles are bought in the Furniture Shop app on the shop iPad (作業場 tab) and defined in `WORKSHOP_DECOR` in `js/data.js`. Until real art exists, styles are recolours of the default sprite; give a style `src` to use real art. Positions are `LAYOUT` in `js/scenes/workshop.js`. |
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
js/ui.js              sheets, toasts, sounds, hint bubbles, canvas fitting
js/tablet.js          iPad pop-up: home screen with app icons, apps open on the tablet screen
js/notepad.js         Notepad app: Guinny's Flower Encyclopedia
js/encyclopedia.js    encyclopedia content: flower language, trivia, Guinny's notes, milestones
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

`assets/img/garden/` holds the user's garden sprites (lawn for each orientation, planter, soil patch, dirt mound, pots, bench, can, trowel, iPad). They are placed to match the sample layouts, in % of a 1672×941 / 941×1672 canvas. The positions are in the "Garden" section at the end of `css/style.css`. `garden.js` sizes the canvas to cover the screen while keeping the play area visible (`KEEP`). Plants are still placeholder SVG (`plotArt` in `js/art.js`).

### Shop-front layout

The shop layers are drawn on a canvas with the art's own aspect ratio (1672×941 or 941×1672) that covers the view. Guinny, the customers, the menu board text, the tap areas (wrapping table, iPad), the bag/coins and the decor are all placed in **% of that canvas**, in the "Shop front" section at the end of `css/style.css` (`[data-o="landscape"]` / `[data-o="portrait"]`). If new background art moves the counter or iPad, update those numbers. The draw order is wall → floor → window → board → Guinny → counter → counter props (`prop-ipad`, `prop-paper`, `prop-ribbon`) → customers. The original roll and spool were painted out of the `*-counter.webp` layers so the new props sit on a clean counter. Props that need attention glow along their outline (`.prop.glow`).

### iPad pop-up

Tapping an iPad opens `js/tablet.js`: a tablet (the user's art) with a home screen of app icons. Tapping an icon opens that app on the tablet's screen. The bezel home button or "‹ Home" goes back, and ✕ or a tap outside closes it. On landscape screens the tablet turns sideways and the wallpaper stays upright.

- **Shop iPad:** background 3 (sage), with the apps **Furniture Shop** (decor) and **Guinny Line Up** (today's menu).
- **Garden iPad:** background 1 (carnation), with the apps **Florist Shop** (seeds + garden upgrades) and **Notepad** (Guinny's Flower Encyclopedia).

### Guinny's Flower Encyclopedia (Notepad app)

`js/notepad.js` draws it; the content lives in `js/encyclopedia.js`.
- **Contents page:** every flower with a fill-in meter (●●●○○) and overall completion.
- **Flower page:** Guinny's records (times planted, waterings, harvested, sold in goods, first planted, first harvest, what's in the basket and seed bag), flower language (花言葉), field notes (home, season, where it grows, grow time, yield, seed price, care tip), trivia, which goods use it (with sales), and Guinny's own notes.
- **Unlocking:** planting a flower opens its page. The first harvest fills in the flower language, care tip and trivia. Guinny writes her notes at 1, 10 and 30 harvests (`MILESTONES`), which also earn stamps (First bloom, Green thumb, Flower friend).
- The save keeps `journal` (per-flower records) and `sold` (per-product sales) for these pages.

To add an app, add `{ id, name, icon, render(body, ctx) }` to the `apps` list in `openIpad()` (shop.js or garden.js) and put its icon at `assets/img/ipad/icon-<icon>.webp`.

### Ingredients

- **Flowers** (grown in the garden): chamomile, mint, daisy, lavender, strawberry, rose, camellia, butterfly pea, hydrangea.
- **Tea leaves** (bought in the Florist Shop, `LEAVES` in `js/data.js`): Earl Grey, Darjeeling, Lapsang, Chai.
- New games start with 5 of each. Ingredient icons are cut from the brewing-piece art (`assets/img/ingredients/`).
- **Brewed teas:** Garden Blend, Earl Grey Lavender, Darjeeling Rose, Smoky Camellia, Rose Chai, Blue Butterfly Tea, Camellia Blossom Tea. **Packed teas:** Chamomile, Mint, Strawberry.

### Tea urn brewing & recipe book

- Tapping the tea urn opens the brewing game straight away. The tray holds every brewing ingredient you own. Put any mix in the urn's 4×5 grid and tap **Brew**: 2 filled squares are enough. 2–7 squares make 1 cup, 8–13 make 2 and 14–20 make 3, plus a bonus cup for 3 stars with a full urn (`MIN_FILL` and `cupsFor` in `js/minigames/brew.js`). Ingredients are only used when you brew.
- The mix decides the tea (`js/teas.js`, rules explained at the top of the file):
  - **Special teas** come first, in priority order: Guinny's Special, Flower Tea, Serenity Brew, Butterfly Rose, Camellia Mint, Lavender Earl Grey, Chai Mint, Rose Darjeeling, Camellia Rose, Healing Brew.
  - Otherwise you get the **general tea** of the ingredient used most.
- Every one of the 20 teas can be brewed. Guinny's Special needs at least 2 butterfly pea, 1 mint, 2 camellia and 1 darjeeling (17 squares).
- The result shows in the shop pop-up frame with the cup sprite (`assets/img/teas/`) and its name. A tea is recorded in the **recipe book** (`js/recipebook.js`, art in `assets/img/book/`) the first time it's brewed. Only recorded teas appear on the shop menu.
- A tutorial (`js/brewtutorial.js`) shows the first time and from the "?" button.
