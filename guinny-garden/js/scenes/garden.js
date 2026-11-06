// Scene 3: Garden — cozy farming in real time.
//  - Tap empty soil/pot → choose a seed and how many to plant
//  - Drag the watering can from the work bench and hover it over plants to water
//  - Swipe across grown plants to harvest (a tap works too)
//  - Work bench iPad → buy seeds, plant encyclopedia, garden upgrades
// All art is placeholder; positions are % of the garden canvas (css: "Garden" section).
import { FLOWERS, PRODUCTS, PLOTS, UPGRADES } from '../data.js';
import { S, save, add, plotStage, plotRemaining, plotUnlocked, isWet, needsWater, updatePlot, wetMs, fmtTime } from '../state.js';
import { F, SEED, P, plotArt, coinArt, canArt, ipadArt, basketArt, shearsArt, dropArt } from '../art.js';
import { $, $$, h, openSheet, toast, floatText, bump, sfx } from '../ui.js';

let root, view, canvas, game;
let active = false;
let orient = '';
const lastKey = [];

export function mount(el, api) {
  game = api;
  root = el;
  root.classList.add('full');
  root.innerHTML = `
  <div class="view garden-view">
    <div class="canvas g-canvas">
      <div class="g-sky"><div class="sun"></div><div class="cloud"></div><div class="cloud c2"></div></div>
      <div class="g-hill h1"></div><div class="g-hill h2"></div>
      <div class="g-fence"></div>
      <div class="g-grass"></div>
      <div class="g-path"></div>
      ${PLOTS.map((p, i) => `
        <div class="plot ${p.type}" data-i="${i}" role="button" aria-label="${p.type === 'pot' ? 'Flower pot' : 'Soil bed'} ${i + 1}">
          <div class="plot-base"></div><div class="plant"></div><div class="plot-badge"></div><div class="plot-bar"><i></i></div>
        </div>`).join('')}
      <img class="guinny" src="assets/img/guinny-garden.webp" alt="Guinny" draggable="false">
      <div class="bench">
        <div class="bench-top"></div><div class="bench-legs"></div>
        <button class="tool tool-ipad" aria-label="Garden iPad">${ipadArt()}<span class="hot-tag">iPad</span></button>
        <button class="tool tool-basket" aria-label="Harvest basket">${basketArt(true)}</button>
        <div class="tool tool-shears" aria-hidden="true">${shearsArt()}</div>
        <button class="tool tool-can" aria-label="Watering can — drag over plants">${canArt()}<span class="hot-tag">Drag me</span></button>
      </div>
    </div>
    <div class="shop-hint g-hint" role="status"></div>
  </div>`;
  view = $('.view', root);
  canvas = $('.canvas', view);

  setupSwipe();
  setupCan();
  $('.tool-ipad', view).addEventListener('click', () => { sfx('tap'); openIpad(); });
  $('.tool-basket', view).addEventListener('click', () => { sfx('tap'); openBasket(); });

  new ResizeObserver(layout).observe(view);
  layout();
  render();
}

function layout() {
  const r = view.getBoundingClientRect();
  const o = r.width >= r.height ? 'landscape' : 'portrait';
  if (o !== orient) { orient = o; canvas.dataset.o = o; }
}

export function enter() { active = true; render(); }
export function leave() { active = false; }
export function tick() { if (active) render(); }

const plotEl = (i) => $(`.plot[data-i="${i}"]`, canvas);
const plotAt = (x, y) => document.elementsFromPoint(x, y).map((e) => e.closest && e.closest('.g-canvas .plot')).find(Boolean);

// --- Tap & swipe -------------------------------------------------------------
function setupSwipe() {
  let swipe = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tool, .bench')) return;
    swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, start: e.target.closest('.plot'), got: 0 };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    swipe.moved = Math.max(swipe.moved, Math.hypot(e.clientX - swipe.x, e.clientY - swipe.y));
    if (swipe.moved < 12) return;
    if (Math.random() < 0.35) trail(e.clientX, e.clientY);
    const el = plotAt(e.clientX, e.clientY);
    if (el && plotStage(+el.dataset.i) === 3) { harvest(+el.dataset.i); swipe.got++; }
  });
  const end = (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const s = swipe; swipe = null;
    if (s.moved < 12 && s.start) tapPlot(+s.start.dataset.i);
    else if (s.got > 1) sfx('chime');
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', () => { swipe = null; });
}

function trail(x, y) {
  const t = h('<i class="swipe-spark">✦</i>');
  t.style.left = `${x}px`; t.style.top = `${y}px`;
  document.body.append(t);
  setTimeout(() => t.remove(), 600);
}

function tapPlot(i) {
  if (!plotUnlocked(i)) { sfx('soft'); openIpad('upgrades'); return; }
  const st = plotStage(i);
  const el = plotEl(i);
  if (st === -1) { sfx('tap'); openPlant(i); return; }
  if (st === 3) { harvest(i); return; }
  sfx('soft'); bump(el);
  const name = FLOWERS[S.garden[i].key].name;
  if (needsWater(i)) floatText(el, `${name} is thirsty — drag the can here`, 'small');
  else floatText(el, `${name}: ${fmtTime(plotRemaining(i))} to go`, 'small');
}

function harvest(i) {
  const p = S.garden[i];
  const f = FLOWERS[p.key];
  const n = f.yield + (S.upgrades.basket ? 1 : 0);
  add(S.flowers, p.key, n);
  S.harvested[p.key] = (S.harvested[p.key] || 0) + n;
  const first = S.harvested[p.key] === n;
  const el = plotEl(i);
  flyToBasket(el, p.key);
  floatText(el, `+${n} ${f.name}`);
  S.garden[i] = { key: null };
  sfx('pop'); save(); render(); game.refreshWorkshop(); game.refreshShop();
  if (first) setTimeout(() => toast(`New note: ${f.name} added to the encyclopedia ✿`), 500);
}

function flyToBasket(from, key) {
  const a = from.getBoundingClientRect(), b = $('.tool-basket', view).getBoundingClientRect();
  const fly = h(`<div class="fly-item">${F(key)}</div>`);
  fly.style.left = `${a.left + a.width / 2 - 22}px`; fly.style.top = `${a.top + a.height * 0.2}px`;
  document.body.append(fly);
  requestAnimationFrame(() => {
    fly.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top - a.top - a.height * 0.2}px) scale(.5)`;
    fly.style.opacity = '.3';
  });
  setTimeout(() => { fly.remove(); bump($('.tool-basket', view)); }, 650);
}

// --- Watering can (drag) -----------------------------------------------------------
function setupCan() {
  const can = $('.tool-can', view);
  let drag = null;
  can.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    can.setPointerCapture(e.pointerId);
    const ghost = h(`<div class="can-ghost">${canArt()}<div class="pour"></div></div>`);
    document.body.append(ghost);
    drag = { id: e.pointerId, ghost, over: null, since: 0 };
    can.classList.add('lifted');
    move(e);
    sfx('tap');
  });
  const move = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.ghost.style.left = `${e.clientX}px`;
    drag.ghost.style.top = `${e.clientY}px`;
    // hover point: just below the spout, a little left of the finger
    const el = plotAt(e.clientX - 34, e.clientY + 6) || plotAt(e.clientX, e.clientY);
    const i = el ? +el.dataset.i : null;
    const thirsty = i !== null && plotUnlocked(i) && S.garden[i].key && plotStage(i) < 3;
    drag.ghost.classList.toggle('pouring', !!thirsty);
    if (thirsty && drag.over !== i) { drag.over = i; drag.since = performance.now(); }
    if (!thirsty) drag.over = null;
    if (thirsty && performance.now() - drag.since > 220 && !drag.ghost.dataset[`w${i}`]) {
      drag.ghost.dataset[`w${i}`] = 1;   // water each plot once per drag
      water(i);
    }
  };
  can.addEventListener('pointermove', move);
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const g = drag.ghost, r = can.getBoundingClientRect();
    drag = null;
    g.classList.remove('pouring');
    g.classList.add('returning');
    g.style.left = `${r.left + r.width / 2}px`; g.style.top = `${r.top + r.height / 2}px`;
    setTimeout(() => { g.remove(); can.classList.remove('lifted'); }, 300);
  };
  can.addEventListener('pointerup', end);
  can.addEventListener('pointercancel', end);
}

function water(i) {
  const p = updatePlot(i);
  p.wetUntil = Date.now() + wetMs(p.key);
  save();
  sfx('water');
  const el = plotEl(i);
  el.classList.remove('splash'); void el.offsetWidth; el.classList.add('splash');
  setTimeout(() => el.classList.remove('splash'), 800);
  render();
}

// --- Planting -----------------------------------------------------------------------
function openPlant(i) {
  const type = PLOTS[i].type;
  const empties = () => PLOTS.map((p, n) => n).filter((n) => PLOTS[n].type === type && plotUnlocked(n) && !S.garden[n].key);
  const fits = Object.keys(FLOWERS).filter((k) => FLOWERS[k].where.includes(type));
  let pick = fits.find((k) => S.seeds[k]) || null;
  let qty = 1;
  const body = h('<div class="plant-pop"></div>');
  const sheet = openSheet({ title: type === 'pot' ? 'Plant in pots' : 'Plant in soil beds', body });
  const draw = () => {
    const free = empties().length;
    const max = pick ? Math.min(S.seeds[pick] || 0, free) : 0;
    qty = Math.max(1, Math.min(qty, max || 1));
    sheet.setSub(`${free} empty ${type === 'pot' ? 'pot' : 'bed'}${free === 1 ? '' : 's'} · ${type === 'pot' ? 'pots suit herbs and berries' : 'beds suit flowers'}`);
    body.innerHTML = `
      <div class="seed-pick">${fits.map((k) => `
        <button class="seed-opt ${pick === k ? 'on' : ''}" data-k="${k}" ${S.seeds[k] ? '' : 'disabled'}>
          <i>${SEED(k)}</i><b>${FLOWERS[k].name}</b><small>${S.seeds[k] || 0} seeds</small></button>`).join('')}</div>
      ${pick ? `<div class="qty">
          <button class="btn-round qty-btn" data-d="-1" aria-label="Fewer" ${qty <= 1 ? 'disabled' : ''}>−</button>
          <div class="qty-n"><b>${qty}</b><small>to plant</small></div>
          <button class="btn-round qty-btn" data-d="1" aria-label="More" ${qty >= max ? 'disabled' : ''}>＋</button>
          <button class="btn-toggle qty-max" ${qty >= max ? 'disabled' : ''}>Max ${max}</button>
        </div>
        <button class="btn-primary plant-go" ${max ? '' : 'disabled'}>Plant ${qty} ${FLOWERS[pick].name}</button>`
      : `<p class="pack-tip">No seeds for ${type === 'pot' ? 'pots' : 'soil beds'} yet.</p>`}
      <button class="btn-toggle buy-more">Buy seeds on the iPad</button>`;
  };
  body.addEventListener('click', (e) => {
    const opt = e.target.closest('.seed-opt');
    const d = e.target.closest('.qty-btn');
    if (opt && !opt.disabled) { pick = opt.dataset.k; qty = 1; sfx('tap'); draw(); }
    else if (d && !d.disabled) { qty += +d.dataset.d; sfx('tap'); draw(); }
    else if (e.target.closest('.qty-max')) { qty = 99; sfx('tap'); draw(); }
    else if (e.target.closest('.buy-more')) { sheet.close(); setTimeout(() => openIpad('seeds'), 230); }
    else if (e.target.closest('.plant-go') && pick) {
      // the tapped plot first, then the other empty plots of the same kind
      const spots = [i, ...empties().filter((n) => n !== i)].slice(0, qty);
      spots.forEach((n, k) => {
        add(S.seeds, pick, -1);
        S.garden[n] = { key: pick, grown: 0, t: Date.now(), wetUntil: 0 };
        setTimeout(() => bump(plotEl(n)), k * 90);
      });
      save(); sfx('pop'); sheet.close(); render();
      toast(`Planted ${spots.length} ${FLOWERS[pick].name}. Time to water!`);
    }
  });
  draw();
}

function openBasket() {
  const ks = Object.keys(FLOWERS);
  const chip = (bag, fn) => ks.filter((k) => bag[k]).map((k) => `<span class="chip"><i>${fn(k)}</i>${bag[k]}</span>`).join('') || '<span class="muted">empty</span>';
  openSheet({ title: 'Basket & Seed Bag', body: `<div class="list">
    <div class="card bag"><div class="bag-title">Harvest basket <small>花かご</small></div><div class="chips">${chip(S.flowers, F)}</div></div>
    <div class="card bag"><div class="bag-title">Seed bag <small>種</small></div><div class="chips">${chip(S.seeds, SEED)}</div></div>
    <p class="pack-tip">Flowers go to the 作業場 for tea and perfume, and to the shop counter for bouquets.</p></div>` });
}

// --- Garden iPad: Seeds · Encyclopedia · Upgrades -----------------------------------
function openIpad(tab = 'seeds') {
  const body = h(`<div class="ipad">
    <div class="seg" role="tablist">
      <button class="seg-btn" data-tab="seeds">Seeds</button>
      <button class="seg-btn" data-tab="book">Plant Notes</button>
      <button class="seg-btn" data-tab="upgrades">Upgrades</button>
    </div><div class="ipad-body"></div></div>`);
  const sheet = openSheet({ title: 'Garden iPad', body, cls: 'wide', onClose: render });
  const inner = $('.ipad-body', body);
  const where = (f) => f.where.map((w) => (w === 'pot' ? 'pot' : 'soil')).join(' · ');

  const drawSeeds = () => {
    sheet.setSub('Seeds grow in real time, even while you’re away');
    inner.innerHTML = `<div class="list">${Object.entries(FLOWERS).map(([k, f]) => `
      <div class="row">
        <div class="row-ico">${SEED(k)}</div>
        <div class="row-main"><b>${f.name}</b><small>${where(f)} · ~${f.growMin} min · ${f.yield} per plot · have ${S.seeds[k] || 0}</small></div>
        <div class="row-btns">
          <button class="btn-buy" data-buy="${k}" data-n="1" ${S.coins < f.seedCost ? 'disabled' : ''}>${coinArt()} ${f.seedCost}</button>
          <button class="btn-buy" data-buy="${k}" data-n="5" ${S.coins < f.seedCost * 5 ? 'disabled' : ''}>×5 · ${f.seedCost * 5}</button>
        </div>
      </div>`).join('')}</div>`;
  };
  const drawBook = () => {
    const known = Object.keys(FLOWERS).filter((k) => S.harvested[k]).length;
    sheet.setSub(`${known} / ${Object.keys(FLOWERS).length} plants noted`);
    inner.innerHTML = `<div class="grid book">${Object.entries(FLOWERS).map(([k, f]) => {
      const n = S.harvested[k] || 0;
      const uses = Object.entries(PRODUCTS).filter(([, p]) => p.needs[k]).map(([pk]) => `<i title="${PRODUCTS[pk].name}">${P(pk)}</i>`).join('');
      return n ? `<div class="card book-card">
          <div class="decor-ico">${F(k)}</div><b>${f.name}</b><small>${f.note}</small>
          <small class="charm">${where(f)} · ~${f.growMin} min · harvested ${n}</small>
          <div class="book-uses">${uses}</div></div>`
        : `<div class="card book-card unknown"><div class="decor-ico">${F(k)}</div><b>???</b><small>Harvest one to fill in this page.</small></div>`;
    }).join('')}</div>`;
  };
  const drawUp = () => {
    sheet.setSub('Make the garden a little cozier');
    inner.innerHTML = `<div class="grid">${Object.entries(UPGRADES).map(([k, u]) => `
      <div class="card decor-card ${S.upgrades[k] ? 'selected' : ''}">
        <b>${u.name}</b><small>${u.desc}</small>
        ${S.upgrades[k] ? '<button class="btn-toggle on" disabled>Owned ✓</button>'
          : `<button class="btn-buy" data-up="${k}" ${S.coins < u.cost ? 'disabled' : ''}>${coinArt()} ${u.cost}</button>`}
      </div>`).join('')}</div>`;
  };
  const draws = { seeds: drawSeeds, book: drawBook, upgrades: drawUp };
  const show = (t) => {
    tab = t;
    $$('.seg-btn', body).forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === t));
    draws[t](); inner.scrollTop = 0;
  };
  body.addEventListener('click', (e) => {
    const seg = e.target.closest('.seg-btn');
    const buy = e.target.closest('[data-buy]');
    const up = e.target.closest('[data-up]');
    if (seg) { sfx('tap'); show(seg.dataset.tab); }
    else if (buy && !buy.disabled) {
      const k = buy.dataset.buy, n = +buy.dataset.n, cost = FLOWERS[k].seedCost * n;
      if (S.coins < cost) return;
      S.coins -= cost; add(S.seeds, k, n);
      save(); sfx('coin'); game.refreshHud(); drawSeeds();
    } else if (up && !up.disabled) {
      const k = up.dataset.up, u = UPGRADES[k];
      if (S.coins < u.cost) return;
      S.coins -= u.cost; S.upgrades[k] = true;
      save(); sfx('chime'); game.refreshHud(); drawUp(); render();
      toast(`${u.name} — done ✿`);
    }
  });
  show(tab);
}

// --- Render -----------------------------------------------------------------------------
function render() {
  if (!canvas) return;
  const now = Date.now();
  let dry = 0, ready = 0, empty = 0;
  PLOTS.forEach((_, i) => {
    const el = plotEl(i);
    const open = plotUnlocked(i);
    el.classList.toggle('locked', !open);
    if (!open) { $('.plot-bar', el).style.display = 'none'; lastKey[i] = 'locked'; $('.plant', el).innerHTML = ''; $('.plot-badge', el).innerHTML = UPGRADES[PLOTS[i].unlock] ? '<span class="lock">Upgrade</span>' : ''; return; }
    const st = plotStage(i, now), p = S.garden[i];
    const key = `${p.key}:${st}`;
    if (lastKey[i] !== key) {
      $('.plant', el).innerHTML = st >= 0 ? plotArt(p.key, st).repeat(PLOTS[i].type === 'soil' ? 3 : 1) : '';
      if (lastKey[i] !== undefined && st === 3) bump(el);
      lastKey[i] = key;
    }
    const wet = st >= 0 && isWet(i, now);
    const thirsty = st >= 0 && st < 3 && !wet;
    el.classList.toggle('wet', wet);
    el.classList.toggle('ready', st === 3);
    el.classList.toggle('empty', st === -1);
    $('.plot-badge', el).innerHTML = thirsty ? `<span class="b-drop">${dropArt()}</span>` : st === 3 ? '<span class="b-ready">✿</span>' : '';
    const bar = $('.plot-bar', el);
    bar.style.display = st >= 0 && st < 3 ? '' : 'none';
    if (st >= 0 && st < 3) $('i', bar).style.width = `${Math.round((p.grown / (p.grown + plotRemaining(i))) * 100)}%`;
    if (thirsty) dry++; if (st === 3) ready++; if (st === -1) empty++;
  });
  $('.g-hint', view).textContent =
    ready ? `Swipe across the ${ready > 1 ? `${ready} ripe plants` : 'ripe plant'} to harvest ✿`
    : dry ? 'Drag the watering can over the thirsty plants'
    : empty ? 'Tap an empty bed or pot to plant seeds'
    : 'Everything is growing nicely ♪';
}

export const refresh = () => { lastKey.length = 0; render(); };
