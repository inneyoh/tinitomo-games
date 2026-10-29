/* =====================================================================
   SOSO'S ICE CREAM STAND — game.js
   1. Canvas & scaling      6. Customers & orders
   2. Game state            7. Checking an order
   3. Sound (tiny synth)    8. Update loop
   4. Tap targets (a–n)     9. Render
   5. Input                10. Screens (title / pause / result) + debug
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. CANVAS & SCALING — stage is 1520×860, letterboxed + background
      extended so it fills any landscape screen (PC or phone)
   --------------------------------------------------------------------- */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const bgCache = document.createElement('canvas');
let VIEW = { s: 1, ox: 0, oy: 0, dpr: 1, xL: 0, xR: CONFIG.W };

function resize() {
  const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
  const SH = L.stageH, s = Math.min(w / CONFIG.W, h / SH);
  VIEW = { s, dpr, ox: (w - CONFIG.W * s) / 2, oy: (h - SH * s) / 2 };
  VIEW.xL = -VIEW.ox / s; VIEW.xR = CONFIG.W + VIEW.ox / s;
  bgCache.width = cv.width; bgCache.height = cv.height;
  const b = bgCache.getContext('2d');
  b.setTransform(dpr * s, 0, 0, dpr * s, dpr * VIEW.ox, dpr * VIEW.oy);
  b.fillStyle = '#c7a679'; b.fillRect(VIEW.xL, -VIEW.oy / s, VIEW.xR - VIEW.xL, SH + 2 * VIEW.oy / s);
  b.fillStyle = '#b9ddfb'; b.fillRect(VIEW.xL, -VIEW.oy / s, VIEW.xR - VIEW.xL, VIEW.oy / s + 1);
  drawBackground(b, VIEW.xL, VIEW.xR);
  document.documentElement.style.setProperty('--stage-s', s);
}
window.addEventListener('resize', resize);

/* customer sticker images */
const IMG = {};
CONFIG.CUSTOMERS.forEach(cu => { const i = new Image(); i.src = cu.img; IMG[cu.id] = i; });

/* ---------------------------------------------------------------------
   2. GAME STATE
   --------------------------------------------------------------------- */
let S;
function newItem(k) { return { k, waffle: null, scoops: [], smoothie: null, soda: {}, spill: false, spr: null, cap: false, ut: null }; }
function resetState() {
  S = {
    phase: 'title', t: 0, dayLeft: CONFIG.DAY_SECONDS, money: 0, served: 0, missed: 0,
    hand: null,                                    // what Soso is holding
    scoop: { fl: null, dirty: null }, scoopHome: true,
    mat: [null, null, null], dispSlots: [null, null, null], pressing: [false, false, false],
    blender: { scoops: [], blend: 0, knob: 0 }, jugInHand: false,
    cooker: { batter: null, cook: 0, lid: 0, lidTarget: 0, dinged: false },
    ladles: { orig: true, choco: true }, sprHome: { rainbow: true, metal: true, chip: true },
    customers: [null, null, null, null], book: { open: false, tab: 'chocomint' }, spawnT: CONFIG.FIRST_SPAWN, custCount: 0, lastCust: -1,
    fx: [], msg: null, washT: 0, binT: 0,
  };
}
resetState();
let pointer = { x: 760, y: 430, type: 'mouse', inside: false };
let highscore = 0; try { highscore = +localStorage.getItem('soso-icecream-hi') || 0; } catch (e) {}

/* ---------------------------------------------------------------------
   3. SOUND — tiny WebAudio blips (ON/OFF)
   --------------------------------------------------------------------- */
let AC = null, soundOn = true; try { soundOn = localStorage.getItem('soso-icecream-sound') !== 'off'; } catch (e) {}
const bgm = new Audio(CONFIG.BGM.file);
bgm.loop = true;
bgm.volume = CONFIG.BGM.volume ?? 0.45;
bgm.preload = 'auto';

let musicUnlocked = false;

function syncMusic() {
  const config = CONFIG.BGM;
  const allowed =
    S.phase === 'play' ||
    (S.phase === 'title' && config.onTitle) ||
    (S.phase === 'result' && config.onResult) ||
    (S.phase === 'pause' && config.duringPause);

  if (!musicUnlocked || !soundOn || document.hidden || !allowed) {
    bgm.pause();
    return;
  }

  if (bgm.paused) {
    bgm.play().catch(error => {
      console.warn('Music could not start:', error);
    });
  }
}

// Browsers require an interaction before audible music can start.
function unlockMusic() {
  musicUnlocked = true;
  syncMusic();
}

document.addEventListener('pointerdown', unlockMusic);
document.addEventListener('keydown', unlockMusic);
document.addEventListener('visibilitychange', syncMusic);
function beep(f = 600, d = .08, type = 'sine', v = .12, slide = 0) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, n); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), n + d);
    g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(.001, n + d);
    o.connect(g); g.connect(AC.destination); o.start(n); o.stop(n + d + .02);
  } catch (e) {}
}
const SFX = {
  pick: () => beep(660, .07, 'sine', .1, 200), drop: () => beep(440, .08, 'sine', .1, -120),
  scoop: () => beep(300, .12, 'triangle', .14, 300), wash: () => { beep(900, .06, 'sine', .06); setTimeout(() => beep(1200, .06, 'sine', .05), 60); },
  no: () => beep(220, .16, 'square', .05, -60), ding: () => { beep(1046, .12, 'sine', .12); setTimeout(() => beep(1568, .2, 'sine', .1), 110); },
  coin: () => { beep(988, .08, 'square', .06); setTimeout(() => beep(1319, .14, 'square', .06), 80); },
  bin: () => beep(180, .12, 'triangle', .12, -80), sprinkle: () => { for (let i = 0; i < 4; i++) setTimeout(() => beep(1400 + i * 120, .03, 'sine', .04), i * 35); },
  pour: () => beep(520, .2, 'sine', .07, -200), lid: () => beep(260, .08, 'triangle', .12, -40),
};

/* ---------------------------------------------------------------------
   4. TAP TARGETS — every station is a hit area with a tap handler.
      ok() = "this would do something with what Soso holds" (drives the glow)
   --------------------------------------------------------------------- */
const H = () => S.hand;
const holding = t => S.hand && S.hand.t === t;
function say(text, bad = true) { S.msg = { text, t: 1.8, bad }; if (bad) SFX.no(); }
function inRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
function inCirc(p, x, y, r) { return (p.x - x) ** 2 + (p.y - y) ** 2 <= r * r; }
/* the blender is drawn scaled around its base — map a stage point back into its own (unscaled) space */
function toBlender(p) { const [X, Y] = L.blenderPivot, [AX, AY] = L.blenderAt, k = L.blenderScale; return { x: X + (p.x - AX) / k, y: Y + (p.y - AY) / k }; }
const DY = () => L.dispShift[1];   // dispenser was moved down by this much
/* the work table may be moved up (phone layout): map a stage point into table coordinates */
const toTable = p => ({ x: p.x, y: p.y + L.band });
let touchMode = false;   // true after a finger / pen tap → bigger touch areas
/* distance from a point to a target's drawn shape (0 = inside) */
function distTo(tg, p) {
  let q = p, k = 1;
  if (tg.blender) { q = toBlender(p); k = L.blenderScale; }
  if (tg.circ) { const [x, y, r] = tg.circ; return Math.max(0, Math.hypot(q.x - x, q.y - y) - r) * k; }
  if (tg.rect) { const [x, y, w, h] = tg.rect, dx = Math.max(x - q.x, 0, q.x - x - w), dy = Math.max(y - q.y, 0, q.y - y - h); return Math.hypot(dx, dy) * k; }
  return Infinity;
}
/* find what a tap / drop lands on. Exact hit first; on touch, a tap that just misses goes to the nearest target */
function findTarget(p, onlyOk) {
  const T = targets(), P = tg => tg.top ? p : toTable(p);
  const exact = T.find(t => t.hit(P(t)) && (!onlyOk || t.ok()));
  if (exact || !touchMode) return { tg: exact, T };
  let best = null, bd = CONFIG.TOUCH_SNAP;
  T.forEach(t => { if (t.top || (onlyOk && !t.ok())) return; const d = distTo(t, P(t)); if (d < bd) { bd = d; best = t; } });
  return { tg: best, T };
}

/* ---- ice cream scoop: auto-return ----
   Things the scoop is used with: tubs, washing bowl, blender jug, bin and any cup.
   Letting go of the scoop anywhere else (or tapping something unrelated) sends it back to the
   washing bowl, where it is cleaned automatically. Switching flavours while still holding it
   still needs a rinse (or the flavours mix). */
function scoopRelated(tg) { return !!tg && (tg.scoopRel || (tg.spot && !!tg.spot[0][tg.spot[1]])); }
function returnScoop(from) {
  if (!holding('scoop')) return;
  S.hand = null; S.scoop = { fl: null, dirty: null }; S.scoopHome = false;
  S.scoopFly = { x: from.x, y: from.y, t: 0 };            // flies back to the bowl, see update()
}
/* actions that apply a held tool to a cup sitting somewhere */
function applyToCup(it) {
  const h = H();
  if (!h) return false;
  if (h.t === 'scoop') {
    if (!S.scoop.fl) { say('Scoop some ice cream first'); return true; }
    if (it.ut && it.waffle) { say('On waffle cups the spoon goes in last'); return true; }
    if (it.spr || it.cap) { say('Ice cream goes in before toppings'); return true; }
    if (it.smoothie) { say('That cup already has a smoothie'); return true; }
    if (it.k === 'H' && it.scoops.length >= 2) { say('Two scoops max!'); return true; }
    if (it.k === 'I' && it.scoops.length >= 1) { say('Ice cream soda takes one scoop'); return true; }
    it.scoops.push(S.scoop.fl); S.scoop.dirty = S.scoop.fl; S.scoop.fl = null; SFX.drop(); return true;
  }
  if (h.t === 'spr') {
    if (it.ut && it.waffle) { say('On waffle cups the spoon goes in last'); return true; }
    if (it.cap) { say('Sprinkles go on before the cup cap'); return true; }
    if (it.spr) { say('Already sprinkled'); return true; }
    if (!it.scoops.length && !it.smoothie) { say('Add ice cream first'); return true; }
    it.spr = h.k; S.sprHome[h.k] = true; S.hand = null; SFX.sprinkle(); return true;
  }
  if (h.t === 'spoon' || h.t === 'straw') {
    if (it.ut) { say('It already has one'); return true; }
    // spoons / straw-spoons can go in at any time (waffle cups: must be last — the other steps check that)
    it.ut = h.t; S.hand = null; SFX.drop(); return true;
  }
  if (h.t === 'jug') {
    if (it.k !== 'I') { say('Smoothies go in a drink cup'); return true; }
    if (it.scoops.length || it.smoothie || sodaTotal(it) > 0 || it.cap) { say('Use an empty drink cup'); return true; }
    const b = S.blender;
    it.smoothie = { scoops: b.scoops.slice(), blend: blendLevelName(b.blend) };
    b.scoops = []; b.blend = 0; S.jugInHand = false; S.hand = null; SFX.pour(); return true;
  }
  if (h.t === 'cap') {
    if (it.k !== 'I') { say('Cup caps only fit drink cups'); return true; }
    if (it.cap) { say('It already has a cap'); return true; }
    if (!it.smoothie && !it.scoops.length && sodaTotal(it) <= 0) { say('Make the drink first'); return true; }
    it.cap = true; S.hand = null; SFX.drop(); return true;
  }
  if (h.t === 'waffle') {
    if (it.k !== 'H') { say('Waffles go in an ice cream cup'); return true; }
    if (it.waffle || it.scoops.length) { say('Use an empty ice cream cup'); return true; }
    if (it.ut) { say('On waffle cups the spoon goes in last'); return true; }
    it.waffle = h.w; S.hand = null; SFX.drop(); return true;
  }
  return false;
}
function canApply(it) {
  const h = H(); if (!h) return true;
  const spoonLast = it.ut && it.waffle;   // waffle cup with its spoon already in: finished
  if (h.t === 'scoop') return !!S.scoop.fl && !it.spr && !spoonLast && !it.cap && !it.smoothie && it.scoops.length < (it.k === 'H' ? 2 : 1);
  if (h.t === 'spr') return !spoonLast && !it.cap && !it.spr && (it.scoops.length || it.smoothie);
  if (h.t === 'cap') return it.k === 'I' && !it.cap && (it.scoops.length || it.smoothie || sodaTotal(it) > 0);
  if (h.t === 'spoon' || h.t === 'straw') return !it.ut;
  if (h.t === 'jug') return it.k === 'I' && !it.scoops.length && !it.smoothie && !it.cap && sodaTotal(it) <= 0;
  if (h.t === 'waffle') return it.k === 'H' && !it.waffle && !it.scoops.length && !it.ut;
  return false;
}

/* a spot that can hold one cup (mat slot or dispenser slot) */
function cupSpot(arr, i, isDisp) {
  return {
    tap() {
      const it = arr[i], h = H();
      if (!h) { if (it) { S.hand = { t: 'cup', item: it }; arr[i] = null; SFX.pick(); } return; }
      if (h.t === 'cup') {
        if (it) { say('That spot is taken'); return; }
        if (isDisp && h.item.k !== 'I') { say('Only drink cups go under the dispenser'); return; }
        if (isDisp && h.item.smoothie) { say('That one is a smoothie'); return; }
        arr[i] = h.item; S.hand = null; SFX.drop(); return;
      }
      if (it) applyToCup(it); else say(isDisp ? 'Put a drink cup here first' : 'Put a cup on the mat first');
    },
    ok() { const it = arr[i], h = H(); if (!h) return false; if (h.t === 'cup') return !it && (!isDisp || (h.item.k === 'I' && !h.item.smoothie)); return it && canApply(it); },
  };
}

function targets() {
  const T = [];
  // customers (serve) — the column above the desk
  L.custX.forEach((x, i) => T.push({
    top: true,   // lives in the customer area (not moved with the work table)
    hit: p => p.x > x - L.custHalf && p.x < x + L.custHalf && p.y < L.desk.y + L.desk.h + (touchMode ? 20 : 0),
    rect: [x - L.custHalf + 10, L.desk.y + 6, L.custHalf * 2 - 20, L.desk.h - 12, 14],
    tap() { const cu = S.customers[i]; if (holding('cup') && cu && cu.state === 'wait') serve(i); else if (holding('cup')) say('Nobody is waiting there'); },
    ok() { const cu = S.customers[i]; return holding('cup') && cu && cu.state === 'wait'; },
  }));
  // a. tubs
  CONFIG.TRAY_ORDER.forEach((f, i) => {
    const [x, y] = L.tubs[i];
    T.push({
      scoopRel: true,
      hit: p => inRect(p, { x: x - L.tubW / 2, y: y - L.tubH / 2, w: L.tubW, h: L.tubH }), rect: [x - L.tubW / 2, y - L.tubH / 2, L.tubW, L.tubH, 18],
      tap() {
        if (!holding('scoop')) { say(H() ? 'Your hands are full' : 'Pick up the scoop from the bowl first'); return; }
        if (S.scoop.fl) { say('The scoop is already full'); return; }
        S.scoop.fl = S.scoop.dirty && S.scoop.dirty !== f && S.scoop.dirty !== 'mess' ? 'mess' : (S.scoop.dirty === 'mess' ? 'mess' : f);
        if (S.scoop.fl === 'mess') say('Dirty scoop — the flavours mixed! Rinse first');
        SFX.scoop();
      },
      ok: () => holding('scoop') && !S.scoop.fl,
    });
  });
  // b. washing bowl
  T.push({
    scoopRel: true, bowl: true,
    hit: p => inCirc(p, L.bowl.cx, L.bowl.cy, L.bowl.r + 6), circ: [L.bowl.cx, L.bowl.cy, L.bowl.r],
    tap() {
      if (!H()) { if (S.scoopHome && !S.scoopFly) { S.scoopHome = false; S.hand = { t: 'scoop' }; SFX.pick(); } return; }
      if (!holding('scoop')) { say('Your hands are full'); return; }
      if (S.scoop.fl || S.scoop.dirty) { S.scoop.fl = null; S.scoop.dirty = null; S.washT = 1; SFX.wash(); burst(L.bowl.cx, L.bowl.cy, 'bubble', 8); return; }
      S.scoopHome = true; S.hand = null; SFX.drop();
    },
    ok: () => (!H() && S.scoopHome) || holding('scoop'),
  });
  // c. blender knob (tap cycles; drag handled in input)
  T.push({
    hit: p => inCirc(toBlender(p), L.knob.cx, L.knob.cy, L.knob.r + (touchMode ? CONFIG.TOUCH_KNOB_PAD : 16)), circ: [L.knob.cx, L.knob.cy, L.knob.r], knob: true, blender: true,
    tap() { if (S.jugInHand) { say('Put the jug back first'); return; } S.blender.knob = S.blender.knob ? 0 : 1; SFX.lid(); },
    ok: () => false,
  });
  // c. blender jug
  T.push({
    scoopRel: true,
    hit: p => inRect(toBlender(p), { x: 466, y: 240, w: 124, h: 214 }), rect: [468, 246, 120, 206, 16], blender: true,
    tap() {
      const b = S.blender, h = H();
      if (holding('jug')) { S.jugInHand = false; S.hand = null; SFX.drop(); return; }
      if (holding('scoop')) {
        if (!S.scoop.fl) { say('Scoop some ice cream first'); return; }
        if (S.jugInHand) return;
        if (b.scoops.length >= 2) { say('Two scoops max in the blender'); return; }
        if (b.blend > .3) { say('Already blending — pour it first'); return; }
        b.scoops.push(S.scoop.fl); S.scoop.dirty = S.scoop.fl; S.scoop.fl = null; SFX.drop(); return;
      }
      if (!h) {
        if (!b.scoops.length) { say('Blender is empty — add ice cream'); return; }
        if (b.knob > 0) { say('Turn the blender off first'); return; }
        S.jugInHand = true; S.hand = { t: 'jug' }; SFX.pick(); return;
      }
      say('Your hands are full');
    },
    ok: () => holding('jug') || (holding('scoop') && S.scoop.fl && S.blender.scoops.length < 2 && S.blender.blend <= .3),
  });
  // d. dispenser slots (buttons handled in input as hold)
  L.nozzles.forEach((x, i) => {
    const sp = cupSpot(S.dispSlots, i, true);
    T.push({ hit: p => inRect(p, { x: x - 38, y: 372 + DY(), w: 76, h: 128 }), rect: [x - 36, 376 + DY(), 72, 120, 12], tap: sp.tap, ok: sp.ok, spot: [S.dispSlots, i] });
  });
  // e. waffle cooker — lid (top area) + plate
  const E = L.cooker;
  T.push({
    hit: p => inRect(p, { x: E.x, y: E.y, w: E.w, h: E.hinge - E.y }) && S.cooker.lid < .5, rect: [E.x, E.y, E.w, E.hinge - E.y, 20], lid: true,
    tap() { toggleLid(); }, ok: () => false,
  });
  T.push({
    hit: p => inRect(p, { x: E.x, y: E.hinge, w: E.w, h: 170 }), rect: [E.x, E.hinge, E.w, 168, 20], lid: true,
    tap() {
      const ck = S.cooker, h = H();
      if (ck.lid > .5) { if (!h || true) toggleLid(); return; }
      if (holding('ladle')) {
        if (!h.full) { say('Ladle is empty — put it back in its tub'); return; }
        if (ck.batter) { say('There is already a waffle in there'); return; }
        ck.batter = h.b; ck.cook = 0; ck.dinged = false; h.full = false; SFX.pour(); return;
      }
      if (ck.batter && (!h || (holding('cup') && h.item.k === 'H'))) {
        const w = { b: ck.batter, d: ck.cook >= CONFIG.WAFFLE_BURN_AT ? 'burnt' : ck.cook >= CONFIG.WAFFLE_COOK_TIME ? 'ok' : 'raw' };
        if (!h) { S.hand = { t: 'waffle', w }; ck.batter = null; ck.cook = 0; SFX.pick(); return; }
        const it = h.item; if (it.waffle || it.scoops.length) { say('Use an empty ice cream cup'); return; }
        it.waffle = w; ck.batter = null; ck.cook = 0; SFX.drop(); return;
      }
      if (!ck.batter) say(h ? 'Pour batter in with a ladle' : 'Pour batter in with a ladle');
    },
    ok() { const ck = S.cooker, h = H(); if (ck.lid > .5) return false; if (holding('ladle')) return h.full && !ck.batter; if (holding('cup')) return ck.batter && h.item.k === 'H' && !h.item.waffle && !h.item.scoops.length; return false; },
  });
  // f. batter tubs
  ['orig', 'choco'].forEach(b => {
    const [x, y] = L.batter[b];
    T.push({
      hit: p => inCirc(p, x, y, L.batter.r + 6), circ: [x, y, L.batter.r],
      tap() {
        if (!H()) { if (S.ladles[b]) { S.ladles[b] = false; S.hand = { t: 'ladle', b, full: true }; SFX.pick(); } return; }
        if (holding('ladle')) { if (H().b !== b) { say('That ladle belongs in the other tub'); return; } S.ladles[b] = true; S.hand = null; SFX.drop(); return; }
        say('Your hands are full');
      },
      ok: () => holding('ladle') && H().b === b,
    });
  });
  // g. sprinkles
  Object.keys(L.sprPots).forEach(k => {
    const x = L.sprPots[k];
    T.push({
      hit: p => inRect(p, { x: x - L.sprPotW / 2 - 6, y: L.sprY - L.sprPotH / 2 - 14, w: L.sprPotW + 12, h: L.sprPotH + 22 }), rect: [x - L.sprPotW / 2, L.sprY - L.sprPotH / 2, L.sprPotW, L.sprPotH, 18],
      tap() {
        if (!H()) { S.sprHome[k] = false; S.hand = { t: 'spr', k }; SFX.pick(); return; }
        if (holding('spr')) { S.sprHome[H().k] = true; S.hand = null; SFX.drop(); return; }
        say('Your hands are full');
      },
      ok: () => holding('spr') && H().k === k,
    });
  });
  // m. mat slots
  L.matSlots.forEach((x, i) => {
    const sp = cupSpot(S.mat, i, false);
    T.push({ hit: p => inRect(p, { x: x - 51, y: L.mat.y, w: 102, h: L.mat.h }), rect: [x - 48, L.mat.y + 8, 96, L.mat.h - 16, 18], tap: sp.tap, ok: sp.ok, spot: [S.mat, i] });
  });
  // h/i. cup stacks, j/k. utensil holders
  const source = (r, kind, label) => T.push({
    hit: p => inRect(p, r), rect: [r.x, r.y, r.w, r.h, 14],
    tap() {
      const h = H();
      if (!h) { S.hand = kind === 'H' || kind === 'I' ? { t: 'cup', item: newItem(kind) } : { t: kind }; SFX.pick(); return; }
      if (kind === 'H' || kind === 'I') { if (holding('cup') && h.item.k === kind && isEmpty(h.item)) { S.hand = null; SFX.drop(); return; } }
      else if (holding(kind)) { S.hand = null; SFX.drop(); return; }
      say('Your hands are full');
    },
    ok() { const h = H(); if (!h) return false; return kind === 'H' || kind === 'I' ? holding('cup') && h.item.k === kind && isEmpty(h.item) : holding(kind); },
  });
  source(L.cupsH, 'H'); source(L.cupsI, 'I'); source(L.caps, 'cap'); source(L.straws, 'straw'); source(L.spoons, 'spoon');
  // p. recipe book — opens over the stand
  T.push({ hit: p => inRect(p, { x: L.book.x, y: L.book.y - 14, w: L.book.w, h: L.book.h + 14 }), rect: [L.book.x, L.book.y, L.book.w, L.book.h, 14], book: true,
    tap() { S.book.open = true; SFX.pick(); }, ok: () => false });
  // L. bin
  T.push({
    scoopRel: true,
    hit: p => inRect(p, L.bin), rect: [L.bin.x, L.bin.y, L.bin.w, L.bin.h, 16],
    tap() {
      const h = H(); if (!h) return;
      if (h.t === 'cup' || h.t === 'waffle' || h.t === 'spoon' || h.t === 'straw' || h.t === 'cap') S.hand = null;
      else if (h.t === 'scoop') { if (!S.scoop.fl) { say('Nothing to throw away'); return; } S.scoop.fl = null; }
      else if (h.t === 'jug') { S.blender.scoops = []; S.blender.blend = 0; S.jugInHand = false; S.hand = null; }
      else if (h.t === 'ladle') { if (!h.full) { say('Nothing to throw away'); return; } h.full = false; }
      else if (h.t === 'spr') { S.sprHome[h.k] = true; S.hand = null; }
      S.binT = 1; SFX.bin();
    },
    ok() { const h = H(); return !!h && !(h.t === 'scoop' && !S.scoop.fl) && !(h.t === 'ladle' && !h.full); },
  });
  return T;
}
function isEmpty(it) { return !it.waffle && !it.scoops.length && !it.smoothie && sodaTotal(it) <= 0 && !it.spr && !it.cap && !it.ut; }
function toggleLid() {
  const ck = S.cooker; ck.lidTarget = ck.lidTarget > .5 ? 0 : 1; SFX.lid();
}

/* ---------------------------------------------------------------------
   5. INPUT — tap = act; drag = pick up on press, drop where released.
      Special drags: blender knob (rotate), waffle lid (pull down / up),
      dispenser buttons (press & hold to fill).
   --------------------------------------------------------------------- */
let drag = null;
function toStage(e) { return { x: (e.clientX - VIEW.ox) / VIEW.s, y: (e.clientY - VIEW.oy) / VIEW.s }; }
cv.addEventListener('pointerdown', e => {
  if (S.phase !== 'play') return;
  e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  const p = toStage(e); pointer = { ...p, type: e.pointerType, inside: true };
  touchMode = e.pointerType !== 'mouse';
  if (S.book.open) { bookTap(p); drag = null; return; }
  // dispenser buttons — tap to start pouring, tap again to stop (bigger on touch)
  const pt = toTable(p), bp = touchMode ? CONFIG.TOUCH_BTN_PAD : 0;
  for (let i = 0; i < 3; i++) if (inRect(pt, { x: L.nozzles[i] - 30 - Math.min(bp, 11), y: 258 + DY() - bp, w: 60 + 2 * Math.min(bp, 11), h: 74 + bp * 1.4 })) {
    returnScoop(p); S.pressing[i] = !S.pressing[i]; SFX.lid(); drag = null; return;
  }
  const { tg, T } = findTarget(p);
  // holding the scoop and tapping something it isn't used with → the scoop goes back to the bowl first
  if (holding('scoop') && !scoopRelated(tg)) { returnScoop(p); if (!tg) { drag = null; return; } }
  if (tg && tg.book) { tg.tap(); drag = null; return; }
  if (tg && tg.knob) { drag = { kind: 'knob', sx: p.x, sy: p.y, moved: false, tg }; return; }
  if (tg && tg.lid && (S.cooker.lid > .5 || tg.tap === T.find(t => t.lid).tap)) {
    // lid area: start a lid drag (plate actions still happen on tap)
    drag = { kind: 'lid', sx: p.x, sy: p.y, moved: false, tg }; return;
  }
  const hadHand = !!S.hand;
  if (tg) tg.tap();
  const picked = !hadHand && !!S.hand;
  drag = { kind: 'item', sx: p.x, sy: p.y, moved: false, picked, tg, from: picked && tg && tg.spot && holding('cup') ? { spot: tg.spot, item: S.hand.item } : null };
});
cv.addEventListener('pointermove', e => {
  const p = toStage(e); pointer = { ...p, type: e.pointerType, inside: true };
  if (!drag) return;
  const d = Math.hypot(p.x - drag.sx, p.y - drag.sy); if (d > 18) drag.moved = true;
  if (drag.kind === 'knob' && drag.moved && !S.jugInHand) {
    const q = toBlender(toTable(p)), a = Math.atan2(q.x - L.knob.cx, -(q.y - L.knob.cy)), lvl = a < 0 ? 0 : 1;   // drag left = OFF, right = ON
    if (lvl !== S.blender.knob) { S.blender.knob = lvl; SFX.lid(); }
  }
  if (drag.kind === 'lid' && drag.moved) {
    const ck = S.cooker, dy = p.y - drag.sy;
    if (ck.lidTarget < .5 && dy > 45) { ck.lidTarget = 1; SFX.lid(); drag.done = true; }
    if (ck.lidTarget > .5 && dy < -45) { ck.lidTarget = 0; SFX.lid(); drag.done = true; }
  }
  if (drag.kind === 'btn' && !inRect(toTable(p), { x: L.nozzles[drag.i] - 46, y: 220 + DY(), w: 92, h: 150 })) { S.pressing[drag.i] = false; }
});
/* recipe book: tap a tab to switch flavour, × or outside the book to close */
function bookTap(p) {
  const U = L.bookUI, [cx, cy, cr] = U.close;
  for (let i = 0; i < CONFIG.TRAY_ORDER.length; i++) {
    const x = U.x + 40 + i * (U.tabW + 8);
    if (inRect(p, { x, y: U.tabY, w: U.tabW, h: U.tabH })) { S.book.tab = CONFIG.TRAY_ORDER[i]; SFX.pick(); return; }
  }
  if (inCirc(p, cx, cy, cr + 8) || !inRect(p, { x: U.x - 14, y: U.tabY, w: U.w + 28, h: U.y + U.h + 14 - U.tabY })) { S.book.open = false; SFX.drop(); }
}
function endPointer(e) {
  if (!drag) return;
  const p = toStage(e);
  if (drag.kind === 'btn') S.pressing[drag.i] = false;
  if (drag.kind === 'knob' && !drag.moved) drag.tg.tap();
  if (drag.kind === 'lid' && !drag.moved) drag.tg.tap();
  if (drag.kind === 'item' && drag.moved && holding('scoop')) {
    // let go of the scoop: use it on what's under the finger, otherwise it goes back to the bowl
    const P = t => t.top ? p : toTable(p), exact = targets().find(t => t.hit(P(t)));
    if (exact && exact.bowl) returnScoop(p);
    else if (scoopRelated(exact)) { if (exact !== drag.tg && exact.ok()) exact.tap(); }
    else { const { tg } = findTarget(p, true); if (scoopRelated(tg) && tg !== drag.tg) tg.tap(); else returnScoop(p); }
  } else if (drag.kind === 'item' && drag.moved && drag.picked && S.hand) {
    // drag & drop: release over a target = tap it
    const { tg } = findTarget(p, true); if (tg) tg.tap();
    // dragged a cup off the mat / dispenser and let go somewhere it can't stay (or the customer refused it): slide it back
    const f = drag.from;
    if (f && holding('cup') && S.hand.item === f.item && !f.spot[0][f.spot[1]]) { f.spot[0][f.spot[1]] = f.item; S.hand = null; }
  }
  drag = null;
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', endPointer);
cv.addEventListener('pointerleave', () => { pointer.inside = pointer.type !== 'mouse' ? pointer.inside : false; });

/* ---------------------------------------------------------------------
   6. CUSTOMERS & ORDERS
   --------------------------------------------------------------------- */
const pick = a => a[Math.floor(Math.random() * a.length)];
function randomScoops(n) { return Array.from({ length: n }, () => pick(CONFIG.TRAY_ORDER)); }
function makeOrder(type) {
  const o = { type, scoops: [], spr: Math.random() < .5 ? pick(Object.keys(CONFIG.SPRINKLES)) : null };
  if (type === 'cup') o.scoops = randomScoops(Math.random() < .5 ? 1 : 2);
  if (type === 'waffle') { o.scoops = randomScoops(Math.random() < .5 ? 1 : 2); o.batter = pick(['orig', 'choco']); }
  if (type === 'smoothie') { o.scoops = randomScoops(Math.random() < .5 ? 1 : 2); o.blend = pick(['short', 'long']); }
  if (type === 'soda') { o.scoops = randomScoops(1); o.soda = Math.random() < .25 ? shuffle(CONFIG.SODA_ORDER.slice()).slice(0, 2) : [pick(CONFIG.SODA_ORDER)]; }
  // tutorial-friendly first orders
  if (S.custCount === 0) { o.scoops = ['vanilla']; o.spr = null; }
  return o;
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function orderSteps(o) { return 2 + o.scoops.length + (o.spr ? 1 : 0) + (o.type === 'waffle' ? 3 : o.type === 'smoothie' ? 4 : o.type === 'soda' ? 2 : 0) + (o.soda && o.soda.length > 1 ? 1 : 0); }
function orderPrice(o) { return CONFIG.PRICES[o.type] + (o.scoops.length - 1) * CONFIG.PRICES.extraScoop + (o.spr ? CONFIG.PRICES.sprinkles : 0); }
function spawnCustomer() {
  const free = [0, 1, 2, 3].filter(i => !S.customers[i]); if (!free.length) return;
  const slot = pick(free);
  // never the same character twice at the stand: only pick characters who aren't already there (leaving ones count until they're gone)
  const here = S.customers.filter(Boolean).map(cu => cu.who.id);
  let pool = CONFIG.CUSTOMERS.map((cu, i) => i).filter(i => !here.includes(CONFIG.CUSTOMERS[i].id));
  if (!pool.length) return;                                   // everyone is already here — try again later
  // nobody comes back-to-back right after their last visit — except characters listed in CONFIG.BACK_TO_BACK (Momo)
  const last = CONFIG.CUSTOMERS[S.lastCust];
  if (pool.length > 1 && last && !CONFIG.BACK_TO_BACK.includes(last.id)) pool = pool.filter(i => i !== S.lastCust);
  const ci = pick(pool);
  S.lastCust = ci;
  const type = S.custCount < CONFIG.TUTORIAL_ORDERS.length ? CONFIG.TUTORIAL_ORDERS[S.custCount] : pick(['cup', 'cup', 'waffle', 'smoothie', 'soda']);
  const order = makeOrder(type), maxP = CONFIG.PATIENCE_BASE + orderSteps(order) * CONFIG.PATIENCE_PER_STEP;
  S.customers[slot] = { who: CONFIG.CUSTOMERS[ci], order, item: orderToItem(order), p: maxP, maxP, state: 'enter', t: 0, talk: null };
  if (SPEECH.showArrive) speak(S.customers[slot], 'arrive');
  S.custCount++; beep(880, .06, 'sine', .07);
}

/* ---------------------------------------------------------------------
   7. CHECKING AN ORDER
   --------------------------------------------------------------------- */
const sameSet = (a, b) => a.length === b.length && a.slice().sort().join() === b.slice().sort().join();
/* returns null when the order is right, otherwise a mistake key — its line lives in dialogue.js (wrong: { … }) */
function check(it, o) {
  const H_ = it.k === 'H', want = o.type;
  if ((want === 'cup' || want === 'waffle') && !H_) return 'wantIceCreamCup';
  if ((want === 'smoothie' || want === 'soda') && H_) return 'wantDrinkCup';
  if (want === 'cup' && it.waffle) return 'noWaffle';
  if (want === 'waffle') {
    if (!it.waffle) return 'needWaffle';
    if (it.waffle.d === 'raw') return 'rawWaffle';
    if (it.waffle.d === 'burnt') return 'burntWaffle';
    if (it.waffle.b !== o.batter) return 'wrongBatter';
  }
  if (want === 'smoothie') {
    if (!it.smoothie) return 'needSmoothie';
    if (it.scoops.length) return 'tooMuchIceCream';
    if (it.smoothie.scoops.includes('mess')) return 'mixedUp';
    if (!sameSet(it.smoothie.scoops, o.scoops)) return 'wrongFlavour';
    if (it.smoothie.blend === 'raw') return 'notBlended';
    if (it.smoothie.blend === 'over') return 'watery';
    if (it.smoothie.blend !== o.blend) return o.blend === 'short' ? 'wantShort' : 'wantLong';
  }
  if (want === 'soda') {
    if (it.smoothie) return 'needSoda';
    const tot = sodaTotal(it);
    if (tot < CONFIG.SODA_MIN) return 'notFull';
    if (it.spill) return 'spilled';
    const got = CONFIG.SODA_ORDER.filter(k => (it.soda[k] || 0) / tot > .2);
    if (!sameSet(got, o.soda)) return 'wrongSoda';
  }
  if (want !== 'smoothie') {
    if (it.scoops.includes('mess')) return 'mixedUp';
    if (!sameSet(it.scoops, o.scoops)) return it.scoops.length !== o.scoops.length ? (it.scoops.length < o.scoops.length ? 'moreScoops' : 'tooManyScoops') : 'wrongFlavour';
  }
  if ((it.spr || null) !== (o.spr || null)) return o.spr ? (it.spr ? 'wrongSprinkles' : 'wantSprinkles') : 'noSprinkles';
  if (want === 'smoothie' && !it.cap) return 'needCap';
  if (want !== 'smoothie' && it.cap) return 'noCap';
  const ut = H_ ? 'spoon' : 'straw';
  if (!it.ut) return H_ ? 'needSpoon' : 'needStraw';
  if (it.ut !== ut) return H_ ? 'spoonNotStraw' : 'strawNotSpoon';
  return null;
}
/* pick a line for a customer: their own line if they have one, else the default (a list = random pick) */
function line(cu, kind, key) {
  const id = cu.who.id, own = DIALOGUE[id] || {}, def = DIALOGUE.default;
  let v = key ? (typeof own[kind] === 'string' ? own[kind] : ((own[kind] || {})[key] ?? (def[kind] || {})[key])) : (own[kind] ?? def[kind]);
  if (Array.isArray(v)) v = v[Math.floor(Math.random() * v.length)];
  return v || '';
}
function speak(cu, kind, key, mood) {
  const text = line(cu, kind, key); if (!text) return;
  cu.talk = { text, t: SPEECH.time[kind] || 2, mood: mood || (kind === 'happy' || kind === 'thanks' ? 'happy' : kind === 'arrive' ? 'normal' : 'angry') };
}
function serve(i) {
  const cu = S.customers[i], it = S.hand.item, bad = check(it, cu.order);
  if (bad) {
    speak(cu, 'wrong', bad); cu.p = Math.max(1, cu.p - CONFIG.WRONG_PENALTY); cu.shake = .5; SFX.no();
    return;
  }
  const price = orderPrice(cu.order), tip = Math.round(CONFIG.PRICES.tipMax * cu.p / cu.maxP);
  S.money += price + tip; S.served++; S.hand = null;
  cu.state = 'happy'; cu.t = 0; speak(cu, tip >= 2 ? 'happy' : 'thanks');
  floatText(L.custX[i], L.desk.y - 30, '+$' + (price + tip), '#e9a21b');
  for (let k = 0; k < 6; k++) S.fx.push({ k: 'heart', x: L.custX[i] + (Math.random() - .5) * 100, y: L.custBottom - 165, vx: (Math.random() - .5) * 40, vy: -80 - Math.random() * 60, life: 1.2 });
  SFX.coin();
}
function floatText(x, y, text, color) { S.fx.push({ k: 'text', x, y, vx: 0, vy: -50, life: 1.4, text, color }); }
function burst(x, y, k, n) { y -= L.band; for (let i = 0; i < n; i++) S.fx.push({ k, x: x + (Math.random() - .5) * 40, y: y + (Math.random() - .5) * 20, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 60, life: .8 + Math.random() * .4 }); }

/* ---------------------------------------------------------------------
   8. UPDATE LOOP
   --------------------------------------------------------------------- */
function update(dt) {
  S.t += dt;
  if (S.msg) { S.msg.t -= dt; if (S.msg.t <= 0) S.msg = null; }
  S.washT = Math.max(0, S.washT - dt * 2); S.binT = Math.max(0, S.binT - dt * 1.5);
  // waffle lid animation + cooking
  const ck = S.cooker; ck.lid += (ck.lidTarget - ck.lid) * Math.min(1, dt * 12);
  if (S.phase !== 'play') return;
  if (ck.batter && ck.lid > .9) {
    ck.cook += dt;
    if (!ck.dinged && ck.cook >= CONFIG.WAFFLE_COOK_TIME) { ck.dinged = true; SFX.ding(); }
  }
  // scoop flying back to the washing bowl (auto-clean)
  if (S.scoopFly) { S.scoopFly.t += dt / CONFIG.SCOOP_RETURN_TIME; if (S.scoopFly.t >= 1) { S.scoopFly = null; S.scoopHome = true; SFX.wash(); burst(L.bowl.cx, L.bowl.cy, 'bubble', 6); } }
  // blender
  const b = S.blender; if (b.knob > 0 && b.scoops.length && !S.jugInHand) b.blend += CONFIG.BLEND_SPEED * dt;
  // dispenser
  S.pressing.forEach((on, i) => {
    if (!on) return; const cup = S.dispSlots[i]; if (!cup || cup.smoothie || cup.cap) return;
    const k = CONFIG.SODA_ORDER[i]; cup.soda[k] = (cup.soda[k] || 0) + CONFIG.SODA_RATE * dt;
    if (sodaTotal(cup) > 1.02) { cup.spill = true; const over = sodaTotal(cup) - 1.06; if (over > 0) cup.soda[k] -= over; }
  });
  // day timer + spawning
  S.dayLeft -= dt;
  S.spawnT -= dt;
  if (S.spawnT <= 0 && S.dayLeft > 12) { spawnCustomer(); S.spawnT = CONFIG.SPAWN_MIN + Math.random() * (CONFIG.SPAWN_MAX - CONFIG.SPAWN_MIN); if (S.customers.every(c => !c)) S.spawnT = 1; }
  if (S.customers.every(c => !c) && S.spawnT > 2 && S.dayLeft > 12) S.spawnT = 2;
  // customers
  S.customers.forEach((cu, i) => {
    if (!cu) return; cu.t += dt;
    if (cu.talk) { cu.talk.t -= dt; if (cu.talk.t <= 0) cu.talk = null; }
    if (cu.shake) cu.shake = Math.max(0, cu.shake - dt);
    if (cu.state === 'enter' && cu.t > .6) { cu.state = 'wait'; cu.t = 0; }
    if (cu.state === 'wait') {
      cu.p -= dt;
      if (cu.p <= 0) { cu.state = 'angry'; cu.t = 0; speak(cu, 'slow'); S.missed++; SFX.no(); }
    }
    if ((cu.state === 'happy' && cu.t > 1.4) || (cu.state === 'angry' && cu.t > 1.6)) { cu.state = 'leave'; cu.t = 0; }
    if (cu.state === 'leave' && cu.t > .5) S.customers[i] = null;
  });
  // particles
  S.fx.forEach(f => { f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; if (f.k === 'bubble') f.vy -= 10 * dt; });
  S.fx = S.fx.filter(f => f.life > 0);
  if (S.dayLeft <= 0) endDay();
}

/* ---------------------------------------------------------------------
   9. RENDER
   --------------------------------------------------------------------- */
function hintText() {
  const h = H();
  if (!h) {
    if (S.mat.every(m => !m) && S.dispSlots.every(m => !m)) return 'Tap a cup on the shelf to start an order';
    return 'Pick up a tool — or drag a finished cup to a customer';
  }
  if (h.t === 'cup') {
    if (isEmpty(h.item)) return h.item.k === 'H' ? 'Put the cup on the mat — or tap a cooked waffle to scoop it in' : 'Put it on the mat — or under the soda dispenser';
    return 'Drag (or tap) it to the customer to serve — or put it down / bin it';
  }
  if (h.t === 'scoop') return S.scoop.fl ? 'Drop the scoop into a cup or the blender — let go elsewhere to put it back' : S.scoop.dirty ? 'New flavour? Rinse the scoop in the bowl first!' : 'Tap a flavour to scoop';
  if (h.t === 'ladle') return h.full ? 'Pour the batter into the open waffle cooker' : 'Put the ladle back in its batter tub';
  if (h.t === 'spr') return 'Tap a cup to add sprinkles';
  if (h.t === 'spoon') return 'Spoons go into ice cream cups (last on waffle cups)';
  if (h.t === 'straw') return 'Straw-spoons go into drink cups — any time';
  if (h.t === 'jug') return 'Pour into an empty drink cup';
  if (h.t === 'waffle') return 'Put the waffle into an empty ice cream cup';
  if (h.t === 'cap') return 'Cap a finished smoothie (after sprinkles, before the straw-spoon)';
  return '';
}
function drawCustomers(c, t) {
  S.customers.forEach((cu, i) => {
    if (!cu) return;
    const x = L.custX[i], im = IMG[cu.who.id];
    let dy = 0, k = 1;
    if (cu.state === 'enter') { const q = Math.min(1, cu.t / .6); dy = (1 - easeBack(q)) * L.custH; }
    if (cu.state === 'leave') dy = Math.min(1, cu.t / .5) * (L.custH + 20);
    if (cu.state === 'happy') dy = -Math.abs(Math.sin(cu.t * 9)) * 22 * Math.max(0, 1 - cu.t / 1.4);
    const sx = cu.shake ? Math.sin(cu.t * 60) * 6 : cu.state === 'angry' ? Math.sin(cu.t * 50) * 4 : 0;
    const bob = cu.state === 'wait' ? Math.sin(t * 2.4 + i) * 2.5 : 0;
    c.save(); c.beginPath(); c.rect(x - L.custHalf, -20, L.custHalf * 2, L.desk.y + 30); c.clip();
    if (im.complete && im.naturalWidth) {
      const h = L.custH, w = h * im.naturalWidth / im.naturalHeight;
      c.save(); c.translate(x + sx, L.custBottom + dy + bob);
      if (cu.state === 'wait') c.scale(1 + Math.sin(t * 2.4 + i) * .012, 1 - Math.sin(t * 2.4 + i) * .012);
      c.drawImage(im, -w / 2, -h, w, h); c.restore();
    }
    c.restore();
    if (cu.state === 'angry' || (cu.state === 'wait' && cu.p / cu.maxP < .25)) drawAnger(c, x + L.custH * .3, L.custBottom - L.custH * .8 + dy, 1.2);
    // order bubble
    if (cu.state === 'wait' || cu.state === 'enter') {
      const a = cu.state === 'enter' ? Math.min(1, cu.t / .5) : 1;
      const B = L.bubble, bx = x - B.w / 2, by = B.y, bb = by + B.h;
      c.save(); c.globalAlpha = a; c.translate(x, by + B.h / 2); c.scale(.85 + .15 * a, .85 + .15 * a); c.translate(-x, -(by + B.h / 2));
      rr(c, bx, by, B.w, B.h, 22); fs(c, '#fffdf8', 4);
      c.beginPath(); c.moveTo(x - 12, bb - 2); c.lineTo(x + 2, bb + 16); c.lineTo(x + 14, bb - 2); c.closePath(); fs(c, '#fffdf8', 0);
      c.beginPath(); c.moveTo(x - 12, bb); c.lineTo(x + 2, bb + 16); c.lineTo(x + 14, bb); fs(c, null, 4);
      const isDrink = cu.item.k === 'I';
      drawItem(c, cu.item, x, bb - 26, isDrink ? .7 : .76, t);
      const pill = (label, col) => { rr(c, bx + 6, by + 6, 56, 22, 11); fs(c, col, 2.5); txt(c, label, bx + 34, by + 17.5, 13, OUT, 700); };
      if (cu.order.type === 'smoothie') pill(cu.order.blend, cu.order.blend === 'short' ? '#ffe7a3' : '#bfeac9');
      if (cu.order.type === 'waffle') pill(cu.order.batter === 'orig' ? 'plain' : 'choco', cu.order.batter === 'orig' ? '#fff0c9' : '#e0c2ae');
      // patience bar
      const k2 = Math.max(0, cu.p / cu.maxP);
      rr(c, x - 58, bb - 20, 116, 13, 6.5); fs(c, '#efe7e0', 2.5);
      rr(c, x - 56, bb - 18, 112 * k2, 9, 4.5); c.fillStyle = k2 > .5 ? '#8fdcae' : k2 > .25 ? '#ffd166' : '#ff8f8f'; c.fill();
      c.restore();
    }
    if (cu.talk) drawSpeech(c, cu, x);
  });
}
/* speech bubble — style comes from SPEECH in dialogue.js */
function wrapLines(c, text, maxW) {
  if (c.measureText(text).width <= maxW) return [text];
  const words = text.split(' '); let a = '', i = 0;
  for (; i < words.length; i++) { const t = a ? a + ' ' + words[i] : words[i]; if (c.measureText(t).width > maxW && a) break; a = t; }
  return [a, words.slice(i).join(' ')];
}
function drawSpeech(c, cu, x) {
  const P = SPEECH, M = P[cu.talk.mood] || P.normal;
  c.save(); c.globalAlpha = Math.min(1, cu.talk.t * 3);
  c.font = `${P.fontWeight} ${P.fontSize}px ${FONT}`;
  const lines = wrapLines(c, cu.talk.text, P.maxWidth - P.padX * 2);
  const w = Math.max(...lines.map(l => c.measureText(l).width)) + P.padX * 2, h = P.lineHeight * lines.length + 14;
  const bx = Math.max(10, Math.min(x - w / 2, 1280 - w)), by = L.talkY + 17 - h / 2;
  rr(c, bx, by, w, h, Math.min(P.radius, h / 2)); fs(c, M.fill, P.borderWidth, P.border);
  if (P.tail) { const tx = Math.max(bx + 18, Math.min(x, bx + w - 18)), ty = by + h;
    c.beginPath(); c.moveTo(tx - 9, ty - 2); c.lineTo(tx, ty + 10); c.lineTo(tx + 9, ty - 2); c.closePath(); fs(c, M.fill, 0);
    c.beginPath(); c.moveTo(tx - 9, ty); c.lineTo(tx, ty + 10); c.lineTo(tx + 9, ty); fs(c, null, P.borderWidth, P.border); }
  lines.forEach((l, i) => txt(c, l, bx + w / 2, by + 7 + P.lineHeight * (i + .5) + 1, P.fontSize, M.text, P.fontWeight));
  c.restore();
}
const easeBack = q => 1 + 2.2 * Math.pow(q - 1, 3) + 1.2 * Math.pow(q - 1, 2);

function drawHUD(c, t) {
  const U = L.hud, [mx, my, mw, mh] = U.money, [kx, ky, kw, kh] = U.clock, [px, py, pr] = U.pause, [sx, sy, sr] = U.sound;
  // money
  drawPill(c, mx, my, mw, mh); drawCoin(c, mx + 26, my + mh / 2, 16); txt(c, '$' + S.money, mx + mw / 2 + 14, my + mh / 2 + 1, 25, OUT, 700);
  // clock
  drawPill(c, kx, ky, kw, kh); drawClock(c, kx + 26, ky + kh / 2, 16, Math.max(0, S.dayLeft / CONFIG.DAY_SECONDS));
  const s = Math.max(0, Math.ceil(S.dayLeft)); txt(c, Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'), kx + kw / 2 + 14, ky + kh / 2 + 1, 25, s <= 15 ? '#e05a5a' : OUT, 700);
  // pause button
  ell(c, px, py, pr, pr, vg(c, py - pr, py + pr, '#ffffff', '#ffe9f0'), 4);
  rr(c, px - 10, py - 11, 7, 22, 3); c.fillStyle = OUT; c.fill(); rr(c, px + 3, py - 11, 7, 22, 3); c.fill();
  // sound button
  ell(c, sx, sy, sr, sr, vg(c, sy - sr, sy + sr, '#ffffff', '#e5f6ff'), 4);
  txt(c, soundOn ? '♪' : '×', sx, sy + 1, soundOn ? 27 : 25, soundOn ? OUT : '#c97a7a', 700);
  // hint / message
  const m = S.msg, text = m ? m.text : hintText();
  if (text) {
    let fsz = 24; c.font = `600 ${fsz}px ${FONT}`; const tw = c.measureText(text).width; if (tw > 600) fsz = Math.floor(fsz * 600 / tw);
    c.font = `600 ${fsz}px ${FONT}`; const w = c.measureText(text).width + 44, x = L.hint.cx - w / 2, y = L.hint.y;
    c.save(); if (m) c.translate(Math.sin(S.t * 50) * (m.t > 1.6 ? 3 : 0), 0);
    rr(c, x, y - 23, w, 46, 23); fs(c, m && m.bad ? '#fff0f0' : 'rgba(255,253,248,.92)', 3.5, m && m.bad ? '#d97a7a' : OUT);
    txt(c, text, L.hint.cx, y + 1, fsz, m && m.bad ? '#c44f4f' : OUT, 600);
    c.restore();
  }
}
function drawGlows(c, t) {
  if (!S.hand) return;
  targets().forEach(tg => { if (tg.ok && tg.ok()) {
    c.save(); if (!tg.top) c.translate(0, -L.band);
    if (tg.blender) { const [X, Y] = L.blenderPivot, [AX, AY] = L.blenderAt, k = L.blenderScale; c.translate(AX, AY); c.scale(k, k); c.translate(-X, -Y); }
    if (tg.rect) glowRect(c, ...tg.rect.slice(0, 4), tg.rect[4], t); else if (tg.circ) glowCircle(c, ...tg.circ, t);
    c.restore(); } });
}
function drawFx(c) {
  S.fx.forEach(f => {
    const a = Math.min(1, f.life * 2); c.save(); c.globalAlpha = a;
    if (f.k === 'heart') drawHeart(c, f.x, f.y, 1.1);
    if (f.k === 'bubble') ell(c, f.x, f.y, 6, 6, 'rgba(255,255,255,.7)', 2, '#8fcbe6');
    if (f.k === 'text') txt(c, f.text, f.x, f.y, 34, f.color, 700, 'center', 7, '#fff');
    c.restore();
  });
}
function render() {
  const t = S.t, d = VIEW.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bgCache, 0, 0);
  ctx.setTransform(d * VIEW.s, 0, 0, d * VIEW.s, d * VIEW.ox, d * VIEW.oy);
  drawCustomers(ctx, t);
  drawDesk(ctx);
  // work table band (moved up by L.band in the phone layout)
  ctx.save(); ctx.translate(0, -L.band);
  drawTray(ctx, S, t); drawBowl(ctx, S, t); drawBlender(ctx, S, t); drawMat(ctx, S, t);
  drawDispenser(ctx, S, t); drawCooker(ctx, S, t); drawBatter(ctx, S, t);
  drawShelf(ctx, S, t); drawSprinklePots(ctx, S, t);
  ctx.restore();
  if (S.phase === 'play' && !S.book.open) { drawGlows(ctx, t); drawHUD(ctx, t); }
  if (S.scoopFly) {   // scoop flying back to the bowl
    const f = S.scoopFly, q = 1 - Math.pow(1 - Math.min(1, f.t), 3), bx = L.bowl.cx + 4, by = L.bowl.cy + 2 - L.band;
    drawScoopTool(ctx, f.x + (bx - f.x) * q, f.y + (by - f.y) * q - Math.sin(q * Math.PI) * 40, 1.05 - .15 * q, { fl: null, dirty: null }, -.45 - .15 * q);
  }
  drawFx(ctx);
  if (S.phase === 'play' && S.book.open) { drawRecipeBook(ctx, S, t); return; }
  if (S.phase === 'play' && S.hand) {
    const off = pointer.type === 'mouse' ? 0 : -46;
    const px = pointer.inside || pointer.type !== 'mouse' ? pointer.x : 778, py = pointer.inside || pointer.type !== 'mouse' ? pointer.y + off : 300;
    drawHeld(ctx, S, px, py, t);
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (S.phase !== 'pause') update(dt);
  render(); requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------------
   10. SCREENS + DEBUG
   --------------------------------------------------------------------- */
const $ = s => document.querySelector(s);
function show(id) {
  document.querySelectorAll('.screen').forEach(e => {
    e.hidden = e.id !== id;
  });
  syncMusic();
}
function startDay() {
  if (touchCapable() && !standalone) goFullscreen();   // phones: go full screen when the shift starts (where allowed)
  const keep = soundOn; resetState(); soundOn = keep; S.phase = 'play'; show(null); beep(784, .1); setTimeout(() => beep(1046, .14), 100);
}
function endDay() {
  S.phase = 'result'; S.hand = null; S.pressing = [false, false, false];
  const stars = CONFIG.STAR_MONEY.filter(m => S.money >= m).length;
  if (S.money > highscore) { highscore = S.money; try { localStorage.setItem('soso-icecream-hi', highscore); } catch (e) {} }
  $('#r-money').textContent = '$' + S.money; $('#r-served').textContent = S.served; $('#r-missed').textContent = S.missed;
  $('#r-best').textContent = '$' + highscore;
  $('#r-stars').innerHTML = [0, 1, 2].map(i => `<span class="${i < stars ? 'on' : ''}">★</span>`).join('');
  $('#r-line').textContent = stars >= 3 ? 'Soso is the ice cream queen!' : stars === 2 ? 'Sweet shift, nicely done!' : stars === 1 ? 'Not bad — the freezer is still cold!' : 'Hmph… tomorrow will be better!';
  show('result'); SFX.ding();
}
function setPaused(p) { if (S.phase !== 'play' && S.phase !== 'pause') return; S.phase = p ? 'pause' : 'play'; show(p ? 'pause' : null); }
function setSound(on) { soundOn = on; try { localStorage.setItem('soso-icecream-sound', on ? 'on' : 'off'); } catch (e) {} document.querySelectorAll('.btn-sound').forEach(b => b.textContent = 'Sound: ' + (on ? 'ON' : 'OFF')); syncMusic();}

// HUD buttons on the canvas
cv.addEventListener('pointerdown', e => {
  if (S.phase !== 'play') return; const p = toStage(e);
  if (S.book.open) return;
  if (inCirc(p, L.hud.pause[0], L.hud.pause[1], L.hud.pause[2] + 5)) { drag = null; setPaused(true); }
  if (inCirc(p, L.hud.sound[0], L.hud.sound[1], L.hud.sound[2] + 5)) { drag = null; setSound(!soundOn); }
}, true);

$('#btn-start').onclick = startDay;
$('#btn-how').onclick = () => show('how');
$('#btn-how-back').onclick = () => show('title');
$('#btn-resume').onclick = () => setPaused(false);
$('#btn-restart').onclick = startDay;
$('#btn-again').onclick = startDay;
$('#btn-title').onclick = () => { resetState(); show('title'); };
document.querySelectorAll('.btn-sound').forEach(b => b.onclick = () => setSound(!soundOn));
/* layout switch (pause menu) */
function setLayout(name) { useLayout(name); resize(); document.querySelectorAll('.btn-layout').forEach(b => b.textContent = 'Layout: ' + (name === 'phone' ? 'Phone' : 'Classic')); }
document.querySelectorAll('.btn-layout').forEach(b => b.onclick = () => setLayout(LAYOUT_NAME === 'phone' ? 'classic' : 'phone'));
setLayout(LAYOUT_NAME);
/* full screen: real fullscreen where the browser allows it (Android / PC); on iPhone use Add to Home Screen */
const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const canFS = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
function goFullscreen() {
  const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!rq || document.fullscreenElement) return;
  try { const pr = rq.call(el); if (pr && pr.then) pr.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {}); } catch (e) {}
}
document.querySelectorAll('.btn-fs').forEach(b => { b.hidden = !canFS || standalone; b.onclick = goFullscreen; });
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const tipEl = $('#t-tip'); if (tipEl) tipEl.hidden = standalone || !(isIOS && touchCapable());
function touchCapable() { return window.matchMedia && matchMedia('(pointer: coarse)').matches; }
setSound(soundOn);
$('#t-best').textContent = highscore ? 'Best: $' + highscore : '';

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' || e.key === 'p') setPaused(S.phase === 'play');
  if (!CONFIG.DEBUG || !e.altKey || S.phase !== 'play') return;
  if (e.code === 'Digit1') { e.preventDefault(); endDay(); }
  if (e.code === 'Digit2') { e.preventDefault(); spawnCustomer(); }
  if (e.code === 'Digit3') { e.preventDefault(); S.money += 20; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && S.phase === 'play') setPaused(true); });

resize(); show('title'); requestAnimationFrame(frame);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
