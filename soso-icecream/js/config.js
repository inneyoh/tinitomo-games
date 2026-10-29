/* =====================================================================
   SOSO'S ICE CREAM STAND — config.js
   All the numbers / names you may want to tweak live here.
   ===================================================================== */

const CONFIG = {

  /* ---------- 1. STAGE (logical size, matches the concept mockup) ---------- */
  W: 1520,
  H: 860,

  /* ---------- 2. DAY / CUSTOMERS ---------- */
  DAY_SECONDS: 180,          // length of one shift
  FIRST_SPAWN: 1.2,          // seconds before the first customer
  SPAWN_MIN: 7,              // gap between customers (random between min/max)
  SPAWN_MAX: 13,
  PATIENCE_BASE: 75,         // seconds a customer waits…
  PATIENCE_PER_STEP: 7,      // …plus this per step in their order
  WRONG_PENALTY: 10,         // seconds of patience lost when served a wrong order
  TUTORIAL_ORDERS: ['cup', 'waffle', 'smoothie', 'soda'],  // first customers, in this order

  /* ---------- 3. PRICES ($) ---------- */
  PRICES: { cup: 4, waffle: 6, smoothie: 6, soda: 5, extraScoop: 1, sprinkles: 1, tipMax: 3 },
  STAR_MONEY: [25, 60, 100], // $ needed for 1 / 2 / 3 stars at the end of the day

  /* ---------- 4. MACHINES ---------- */
  WAFFLE_COOK_TIME: 5,       // seconds with the lid closed until golden
  WAFFLE_BURN_AT: 11,        // seconds with the lid closed until burnt
  BLEND_SPEED: 0.7,          // blend points per second while the blender is ON (knob is ON/OFF only since v0.2)
  BLEND_SHORT: 1.0,          // blend points where "Short" (chunky) starts
  BLEND_LONG: 2.2,           // …where "Long" (smooth) starts
  BLEND_OVER: 3.6,           // …where it turns watery (wrong)
  SODA_RATE: 0.38,           // cup fill per second while a dispenser is pouring (tap a button to start, tap again to stop)
  SODA_MIN: 0.8,             // a soda counts as full from this level (1.0 = brim, above = spill)

  /* ---------- 5. MENU INGREDIENTS ---------- */
  FLAVORS: {
    chocomint:  { name: 'Choco Mint',      base: '#a9e7d6', light: '#dcfaf1', shade: '#6cc3ad', fx: 'chips' },
    vanilla:    { name: 'Vanilla',         base: '#fff4d2', light: '#fffdf4', shade: '#ecd59a', fx: 'beans' },
    strawberry: { name: 'Strawberry Milk', base: '#ffc9da', light: '#ffeef4', shade: '#f19ab6', fx: 'swirl' },
    lemon:      { name: 'Lemon Sorbet',    base: '#fff184', light: '#fffbd6', shade: '#efcf3e', fx: 'zest' },
    chocolate:  { name: 'Chocolate',       base: '#9c6a49', light: '#c99573', shade: '#6d452f', fx: 'shine' },
    special:    { name: 'Soso Special',    base: '#fbeaff', light: '#ffffff', shade: '#dcc4ee', fx: 'blobs' },
  },
  SCOOP_DETAILS: true,       // true = draw flavour textures on scoops (chips, swirls, blobs); false = base colour only
  TRAY_ORDER: ['chocomint', 'vanilla', 'strawberry', 'lemon', 'chocolate', 'special'],
  MESS: { name: 'Mixed-up', base: '#bba590', light: '#d8c6b4', shade: '#8f7a68', fx: 'mess' },

  BATTERS: {
    orig:  { name: 'Original', raw: '#fbeab0', ok: '#ecb96a', okDark: '#c98b3e', burnt: '#5b3b29' },
    choco: { name: 'Chocolate', raw: '#b9876a', ok: '#8e5a3c', okDark: '#6a3f27', burnt: '#3a261c' },
  },

  SPRINKLE_SIZE: 1.82,       // size of sprinkles drawn on ice cream (1 = original v0 size; 1.3 × 1.4)
  SPRINKLE_COUNT: 7,         // how many sprinkles are drawn on one scoop
  SPRINKLE_ART_SCALE: 1.4,   // each sprinkle in the sprinkle pictures is drawn this much bigger (1 = as drawn)
  SCOOP_RETURN_TIME: 0.3,    // seconds the scoop takes to fly back to the washing bowl
  SMOOTHIE_SPRINKLE_W: 60,   // width of the sprinkle picture laid on top of a smoothie
  SHELF_STACK_H: 118,        // height of the cup / cap stack pictures on the shelf
  SPRINKLES: {
    // spread: how far apart they sit on a scoop (1 = full spread) · lift: how far they move up toward the top (fraction of scoop radius)
    // artScale: size of each sprinkle in the sprinkle picture (overrides SPRINKLE_ART_SCALE) · vibrance: colour boost (1 = as drawn)
    rainbow: { name: 'Rainbow',       spread: 0.60, lift: 0.22, artScale: 1.68, vibrance: 1.8 },
    metal:   { name: 'Silver pearls', spread: 0.80, lift: 0.16 },
    chip:    { name: 'Choco chips',   spread: 0.85, lift: 0.12 },
  },

  SODAS: {
    cola:  { name: 'cola',  color: '#b8664a', light: '#d98a6c', btn: '#f08a86' },
    melon: { name: 'melon', color: '#8fdc86', light: '#c2f2b7', btn: '#8fe59a' },
    soda:  { name: 'soda',  color: '#9fe3f3', light: '#dbf8ff', btn: '#8fe6f0' },
  },
  SODA_ORDER: ['cola', 'melon', 'soda'],

  /* ---------- 6. CUSTOMERS (TiniTomo Toys default series stickers) ---------- */
  CUSTOMERS: [
    { id: 'momo', name: 'Momo', img: 'assets/customers/momo.png' },
    { id: 'soso', name: 'Soso', img: 'assets/customers/soso.png' },
    { id: 'kew',  name: 'Kew',  img: 'assets/customers/kew.png' },
    { id: 'rang', name: 'Rang', img: 'assets/customers/rang.png' },
    { id: 'bae',  name: 'Bae',  img: 'assets/customers/bae.png' },
  ],

  // the same character never appears twice at once; only these may come back right after their last visit
  BACK_TO_BACK: ['momo'],

  /* ---------- 7. TOUCH (phones / tablets) ---------- */
  TOUCH_SNAP: 34,            // a tap that misses by up to this many stage units goes to the nearest station
  TOUCH_KNOB_PAD: 34,        // extra grab radius around the blender knob
  TOUCH_BTN_PAD: 22,         // extra height around the soda buttons


/* ---------- 8. AUDIO ---------- */
   BGM: {
  file: 'assets/audio/ice-cream-please.mp3',   // swap the file here to change the song
  volume: 0.45,                                // 0 = silent … 1 = full volume
  onTitle: true,                               // also play on the title screen (after the first tap)
  onResult: false,                             // keep playing on the "Closing time!" screen
  duringPause: false,                          // keep playing while paused
},
   
   /* ---------- 9. DEBUG ---------- */
  // Alt+1 = end the day now · Alt+2 = spawn a customer · Alt+3 = +$20
  DEBUG: true,
};
