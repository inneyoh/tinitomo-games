/* =====================================================================
   SOSO'S ICE CREAM STAND — layout.js
   Where every station sits, in stage units (1520 × 860).
   Letters match the concept sheet.

   v0.2 layout: full-length counter with 4 customers; blender + washing
   bowl moved to the far left; ice cream tray + mat shifted right;
   dispenser moved down onto the table; sprinkles moved to the shelf;
   recipe book beside the bin.
   ===================================================================== */

const L = {
  /* n. work desk (counter) — full length, 30% lower than v0.1; customers stand behind it */
  desk:      { x: 8, y: 330, w: 1504, h: 78 },
  custX:     [300, 560, 820, 1080],   // 4 customer spots (centre x) — clear of the blender (left) and waffle cooker (right)
  custHalf:  130,                     // half-width of each customer's serving area
  custBottom: 395,                    // bottom of the customer sticker (hidden behind the desk)
  custH:     220,                     // customer sticker height
  bubble:    { w: 156, h: 162, y: 8 },// order bubble above each customer

  /* c. blender — drawn in its own local coordinates (below), then moved + scaled onto the stage */
  blenderScale: 1.1,                  // 10% bigger (v0 feedback)
  blenderPivot: [530, 526],           // local bottom-centre of the blender base …
  blenderAt:    [88, 592],            // … placed here on the stage (far-left corner, overlapping the counter like the waffle cooker)
  knob:      { cx: 530, cy: 490, r: 22 },          // local
  gauge:     { x: 596, y: 329, w: 13, h: 117 },    // local — 20% smaller than v0.1 (v0.2 feedback)

  /* b. scoop washing bowl — below the blender */
  bowl:      { cx: 92, cy: 664, r: 44 },

  /* a. ice cream tray (6 tubs, 3 × 2) */
  tray:      { x: 196, y: 443, w: 414, h: 280 },
  tubs:      [[266, 522], [400, 522], [531, 522], [266, 652], [400, 652], [531, 652]],
  tubW: 92, tubH: 112,

  /* m. work mat — 3 order slots */
  mat:       { x: 648, y: 463, w: 290, h: 250 },
  matSlots:  [696, 793, 890],
  matBase:   692,

  /* d. soft drink dispenser — drawn in local coordinates, shifted down onto the table */
  dispShift:    [20, 152],            // raised so its top just overlaps the counter front (customers stay visible)
  nozzlesLocal: [1017, 1099, 1176],
  nozzles:      [1037, 1119, 1196],   // = nozzlesLocal + dispShift[0]
  dispBase:     494,                  // local cup base line (stage y = 646)

  /* e. waffle cooker + f. batter tubs (unchanged) */
  cooker:    { x: 1290, y: 243, w: 185, h: 337, hinge: 410 },
  batter:    { orig: [1344, 678], choco: [1456, 678], r: 46 },   // nudged right so the lowered dispenser fits

  /* bottom shelf ------------------------------------------------------- */
  shelfTop:  754,
  // left: h. ice cream cups · i. drink cups · o. cup caps · j. straw-spoons · k. spoons
  cupsH:     { x: 10,  y: 760, w: 104, h: 98 },
  cupsI:     { x: 118, y: 760, w: 66,  h: 98 },
  caps:      { x: 190, y: 760, w: 80,  h: 98 },
  straws:    { x: 276, y: 760, w: 60,  h: 98 },
  spoons:    { x: 346, y: 760, w: 60,  h: 98 },
  // middle: g. sprinkles + sign
  sprTray:   { x: 462, y: 768, w: 310, h: 82 },
  sprPots:   { rainbow: 519, metal: 617, chip: 715 },
  sprY: 809, sprPotW: 84, sprPotH: 62,
  sign:      { x: 798, y: 776, w: 272, h: 66 },
  // right: L. bin + recipe book
  bin:       { x: 1106, y: 762, w: 128, h: 94 },
  book:      { x: 1254, y: 770, w: 176, h: 82 },

  /* open recipe book (overlay) */
  bookUI:    { x: 200, y: 156, w: 1120, h: 600, tabY: 104, tabW: 168, tabH: 58, close: [1312, 162, 28] },

  /* HUD + hint */
  hud:       { clock: [1240, 10, 124, 48], money: [1372, 10, 138, 48], pause: [1446, 92, 25], sound: [1494, 92, 25] },
  hint:      { cx: 640, y: 369 },
  talkY:     192,                     // customer speech line
  stageH:    860,                     // stage height
  band:      0,                       // how far the whole work table (everything below the counter) is moved up
};

/* ---------------------------------------------------------------------
   PHONE LAYOUT — used automatically on phones (touch + short screen).
   The customer area is made more compact and the whole work table slides
   up by `band`, so the stage is shorter and everything is drawn bigger
   on a landscape phone. Force a layout with ?layout=phone or ?layout=classic
   (or the Layout button in the pause menu).
   --------------------------------------------------------------------- */
const LAYOUT_PHONE = {
  stageH: 762, band: 98,
  desk: { x: 8, y: 262, w: 1504, h: 50 },
  custBottom: 330, custH: 180,
  bubble: { w: 156, h: 162, y: 4 },
  hint: { cx: 640, y: 287 }, talkY: 168,
  dispShift: [20, 172],   // dispenser 20 lower than classic so it stays below the 4th customer's face
  bookUI: { x: 200, y: 124, w: 1120, h: 600, tabY: 72, tabW: 168, tabH: 58, close: [1312, 130, 28] },
};
const L_CLASSIC = JSON.parse(JSON.stringify(L));
let LAYOUT_NAME = 'classic';
function useLayout(name) {
  Object.keys(L).forEach(k => delete L[k]);
  Object.assign(L, JSON.parse(JSON.stringify(L_CLASSIC)), name === 'phone' ? JSON.parse(JSON.stringify(LAYOUT_PHONE)) : {});
  LAYOUT_NAME = name;
}
function autoLayout() {
  let q = null; try { q = new URLSearchParams(location.search).get('layout'); } catch (e) {}
  if (q === 'phone' || q === 'classic') return q;
  const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  return coarse && Math.min(screen.width, screen.height) < 600 ? 'phone' : 'classic';
}
useLayout(autoLayout());
