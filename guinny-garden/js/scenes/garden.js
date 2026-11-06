// Scene 3: Garden — cozy farming in real time.
//  - Tap an empty patch (planter quarter) or pot → choose a seed and how many to plant
//    Planted patches get a soil patch + dirt mound; the sprout grows behind the mound.
//  - Drag the watering can off the work bench and hover over a planter/pot to water it
//  - Swipe across grown plants to harvest (a tap works too)
//  - Work bench iPad → Shop (seeds + garden upgrades) and Guinny's Flower Encyclopedia
// Background + props are the user's art (assets/img/garden). Plants are placeholder SVG.
// Positions are % of the garden canvas (css: "Garden" section).
import { FLOWERS, PRODUCTS, PLOTS, PLANTERS, UPGRADES } from '../data.js';
import { S, save, add, plotStage, plotRemaining, plotUnlocked, isWet, needsWater, updatePlot, wetMs, fmtTime } from '../state.js';
import { F, SEED, P, plotArt, coinArt, dropArt } from '../art.js';
import { $, $$, h, openSheet, toast, floatText, bump, sfx, hint, fitCanvas } from '../ui.js';
import { openTablet } from '../tablet.js';

const IMG = 'assets/img/garden/';
const SIZE = { landscape: [1672, 941], portrait: [941, 1672] };
// Part of the canvas that must stay visible (fractions); the rest is lawn that may be cropped.
const KEEP = { landscape: [0.02, 0, 0.99, 0.88], portrait: [0.03, 0, 0.97, 0.92] };
let root, view, canvas, game;
let active = false;
let orient = '';
const lastKey = [];

const plotMarkup = (i) => `
  <div class="plot ${PLOTS[i].type} q${PLOTS[i].q ?? ''}" data-i="${i}" role="button" aria-label="Garden patch ${i + 1}">
    <img class="patch" src="${IMG}patch.webp" alt="" draggable="false">
    <div class="plant"></div>
    <img class="mound" src="${IMG}mound.webp" alt="" draggable="false">
    <div class="plot-badge"></div><div class="plot-bar"><i></i></div>
  </div>`;

export function mount(el, api) {
  game = api;
  root = el;
  root.classList.add('full');
  root.innerHTML = `
  <div class="view garden-view">
    <div class="canvas g-canvas">
      <img class="layer g-lawn" alt="" draggable="false">
      <img class="layer g-lawn layer-ext" alt="" draggable="false">
      <img class="g-pot big" src="${IMG}pot-big.webp" alt="" draggable="false">
      <img class="g-pot small" src="${IMG}pot-small.webp" alt="" draggable="false">
      ${PLOTS.map((p, i) => (p.type === 'pot' ? plotMarkup(i).replace('class="plot pot', `class="plot pot ${p.pot}`) : '')).join('')}
      <img class="g-bench" src="${IMG}bench.webp" alt="" draggable="false">
      <img class="g-trowel" src="${IMG}trowel.webp" alt="" draggable="false">
      <button class="tool tool-ipad" aria-label="Garden iPad"><img src="${IMG}ipad.webp" alt="" draggable="false"><span class="hot-tag">Buy seeds</span></button>
      <button class="tool tool-can" aria-label="Watering can — drag over plants"><img src="${IMG}can.webp" alt="" draggable="false"></button>
      ${PLANTERS.map((_, n) => `
        <div class="planter" data-p="${n}">
          <img class="planter-img" src="${IMG}planter.webp" alt="" draggable="false">
          ${PLOTS.map((p, i) => (p.planter === n ? plotMarkup(i) : '')).join('')}
          <div class="planter-lock"><span class="lock">Upgrade</span></div>
          <div class="planter-drop b-drop">${dropArt()}</div>
        </div>`).join('')}
    </div>
    <div class="shop-hint g-hint" role="status"></div>
  </div>`;
  view = $('.view', root);
  canvas = $('.canvas', view);

  setupSwipe();
  setupCan();
  $('.tool-ipad', view).addEventListener('click', () => { sfx('tap'); openIpad(); });

  new ResizeObserver(layout).observe(view);
  layout();
  render();
}

function layout() {
  const vw = view.clientWidth, vh = view.clientHeight;
  if (!vw || !vh) return;
  const o = vw >= vh ? 'landscape' : 'portrait';
  if (o !== orient) { orient = o; canvas.dataset.o = o; $$('.g-lawn', canvas).forEach((img) => { img.src = `${IMG}lawn-${o}.webp`; }); }
  // fence at the top edge; any spare height below continues as lawn
  fitCanvas(view, canvas, ...SIZE[o], KEEP[o], 0);
}

export function enter() { active = true; layout(); render(); }
export function leave() { active = false; }
export function tick() { if (active) render(); }

const plotEl = (i) => $(`.plot[data-i="${i}"]`, canvas);
const plotAt = (x, y) => document.elementsFromPoint(x, y).map((e) => e.closest && e.closest('.g-canvas .plot')).find(Boolean);
const planterAt = (x, y) => document.elementsFromPoint(x, y).map((e) => e.closest && e.closest('.g-canvas .planter, .g-canvas .plot.pot')).find(Boolean);
// watering a planter waters all four patches; a pot is its own plot
const plotsUnder = (el) => (el.classList.contains('planter')
  ? PLOTS.map((p, i) => i).filter((i) => PLOTS[i].planter === +el.dataset.p)
  : [+el.dataset.i]);

// --- Tap & swipe -------------------------------------------------------------
function setupSwipe() {
  let swipe = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tool')) return;
    swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, start: e.target.closest('.plot, .planter'), got: 0 };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    swipe.moved = Math.max(swipe.moved, Math.hypot(e.clientX - swipe.x, e.clientY - swipe.y));
    if (swipe.moved < 12) return;
    if (Math.random() < 0.35) trail(e.clientX, e.clientY);
    const el = plotAt(e.clientX, e.clientY);
    if (el && plotUnlocked(+el.dataset.i) && plotStage(+el.dataset.i) === 3) { harvest(+el.dataset.i); swipe.got++; }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!swipe || e.pointerId !== swipe.id) return;
    const s = swipe; swipe = null;
    if (s.moved < 12 && s.start) {
      if (s.start.classList.contains('plot')) tapPlot(+s.start.dataset.i);
      else if (!plotUnlocked(PLOTS.findIndex((p) => p.planter === +s.start.dataset.p))) { sfx('soft'); openIpad('florist'); }
    } else if (s.got > 1) sfx('chime');
  });
  canvas.addEventListener('pointercancel', () => { swipe = null; });
}

function trail(x, y) {
  const t = h('<i class="swipe-spark">✦</i>');
  t.style.left = `${x}px`; t.style.top = `${y}px`;
  document.body.append(t);
  setTimeout(() => t.remove(), 600);
}

function tapPlot(i) {
  if (!plotUnlocked(i)) { sfx('soft'); openIpad('florist'); return; }
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
  flyUp(el, p.key);
  floatText(el, `+${n} ${f.name}`);
  S.garden[i] = { key: null };
  sfx('pop'); save(); render(); game.refreshWorkshop(); game.refreshShop();
  if (first) setTimeout(() => toast(`New page: ${f.name} added to the Flower Encyclopedia ✿`), 500);
}

function flyUp(from, key) {
  const a = from.getBoundingClientRect();
  const fly = h(`<div class="fly-item">${F(key)}</div>`);
  fly.style.left = `${a.left + a.width / 2 - 22}px`; fly.style.top = `${a.top}px`;
  document.body.append(fly);
  requestAnimationFrame(() => { fly.style.transform = 'translateY(-70px) scale(.6)'; fly.style.opacity = '0'; });
  setTimeout(() => fly.remove(), 650);
}

// --- Watering can (drag) -----------------------------------------------------------
function setupCan() {
  const can = $('.tool-can', view);
  let drag = null;
  can.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    can.setPointerCapture(e.pointerId);
    const ghost = h(`<div class="can-ghost"><img src="${IMG}can-pour.webp" alt=""><div class="pour"></div></div>`);
    document.body.append(ghost);
    drag = { id: e.pointerId, ghost, over: null, since: 0, done: new Set() };
    can.classList.add('lifted');
    move(e);
    sfx('tap');
  });
  const move = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.ghost.style.left = `${e.clientX}px`;
    drag.ghost.style.top = `${e.clientY}px`;
    const el = planterAt(e.clientX - 34, e.clientY + 6) || planterAt(e.clientX, e.clientY);
    const ids = el ? plotsUnder(el).filter((i) => plotUnlocked(i) && S.garden[i].key && plotStage(i) < 3) : [];
    const key = el ? (el.dataset.p ?? `pot${el.dataset.i}`) : null;
    drag.ghost.classList.toggle('pouring', ids.length > 0);
    if (!ids.length) { drag.over = null; return; }
    if (drag.over !== key) { drag.over = key; drag.since = performance.now(); }
    if (performance.now() - drag.since > 200 && !drag.done.has(key)) {
      drag.done.add(key);   // water each planter/pot once per drag
      water(ids);
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

function water(ids) {
  const now = Date.now();
  ids.forEach((i) => {
    const p = updatePlot(i, now);
    p.wetUntil = now + wetMs(p.key);
    const el = plotEl(i);
    el.classList.remove('splash'); void el.offsetWidth; el.classList.add('splash');
    setTimeout(() => el.classList.remove('splash'), 800);
  });
  save();
  sfx('water');
  render();
}

// --- Planting -----------------------------------------------------------------------
function openPlant(i) {
  const type = PLOTS[i].type;
  const near = (n) => (PLOTS[n].planter === PLOTS[i].planter ? 0 : 1);   // same planter first
  const empties = () => PLOTS.map((p, n) => n)
    .filter((n) => PLOTS[n].type === type && plotUnlocked(n) && !S.garden[n].key)
    .sort((a, b) => near(a) - near(b) || a - b);
  const fits = Object.keys(FLOWERS).filter((k) => FLOWERS[k].where.includes(type));
  let pick = fits.find((k) => S.seeds[k]) || null;
  let qty = 1;
  const body = h('<div class="plant-pop"></div>');
  const sheet = openSheet({ title: type === 'pot' ? 'Plant in a pot' : 'Plant seeds', body });
  const draw = () => {
    const free = empties().length;
    const max = pick ? Math.min(S.seeds[pick] || 0, free) : 0;
    qty = Math.max(1, Math.min(qty, max || 1));
    sheet.setSub(type === 'pot' ? 'Pots suit herbs and berries' : `${free} empty patch${free === 1 ? '' : 'es'} · this planter fills first`);
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
      : `<p class="pack-tip">No seeds for ${type === 'pot' ? 'pots' : 'planters'} yet.</p>`}
      <button class="btn-toggle buy-more">Buy seeds on the iPad</button>`;
  };
  body.addEventListener('click', (e) => {
    const opt = e.target.closest('.seed-opt');
    const d = e.target.closest('.qty-btn');
    if (opt && !opt.disabled) { pick = opt.dataset.k; qty = 1; sfx('tap'); draw(); }
    else if (d && !d.disabled) { qty += +d.dataset.d; sfx('tap'); draw(); }
    else if (e.target.closest('.qty-max')) { qty = 99; sfx('tap'); draw(); }
    else if (e.target.closest('.buy-more')) { sheet.close(); setTimeout(() => openIpad('florist'), 230); }
    else if (e.target.closest('.plant-go') && pick) {
      const spots = [i, ...empties().filter((n) => n !== i)].slice(0, qty);
      spots.forEach((n, k) => {
        add(S.seeds, pick, -1);
        S.garden[n] = { key: pick, grown: 0, t: Date.now(), wetUntil: 0 };
        setTimeout(() => bump(plotEl(n)), k * 70);
      });
      save(); sfx('pop'); sheet.close(); render();
      toast(`Planted ${spots.length} ${FLOWERS[pick].name}. Time to water!`);
    }
  });
  draw();
}

// --- Garden iPad: Shop (seeds + upgrades) · Flower Encyclopedia -------------------------
// Garden iPad (tablet pop-up): Florist Shop (seeds + upgrades) and Notepad (flower encyclopedia).
// start: null = home screen, 'florist' or 'notepad' = open that app directly.
function openIpad(start = null) {
  const where = (f) => f.where.map((w) => (w === 'pot' ? 'pot' : 'planter')).join(' · ');
  const florist = {
    id: 'florist', name: 'Florist Shop', icon: 'florist',
    render(body, ctx) {
      ctx.sub('Seeds grow in real time, even while you’re away');
      const ups = Object.entries(UPGRADES).filter(([, u]) => !u.requires || S.upgrades[u.requires]);
      body.innerHTML = `<h3 class="ipad-h">Seeds</h3><div class="list">${Object.entries(FLOWERS).map(([k, f]) => `
        <div class="row">
          <div class="row-ico">${SEED(k)}</div>
          <div class="row-main"><b>${f.name}</b><small>${where(f)} · ~${f.growMin} min · ${f.yield} per patch · have ${S.seeds[k] || 0}</small></div>
          <div class="row-btns">
            <button class="btn-buy" data-buy="${k}" data-n="1" ${S.coins < f.seedCost ? 'disabled' : ''}>${coinArt()} ${f.seedCost}</button>
            <button class="btn-buy" data-buy="${k}" data-n="5" ${S.coins < f.seedCost * 5 ? 'disabled' : ''}>×5 · ${f.seedCost * 5}</button>
          </div>
        </div>`).join('')}</div>
        <h3 class="ipad-h">Garden upgrades</h3><div class="grid">${ups.map(([k, u]) => `
        <div class="card decor-card ${S.upgrades[k] ? 'selected' : ''}">
          <b>${u.name}</b><small>${u.desc}</small>
          ${S.upgrades[k] ? '<button class="btn-toggle on" disabled>Owned ✓</button>'
            : `<button class="btn-buy" data-up="${k}" ${S.coins < u.cost ? 'disabled' : ''}>${coinArt()} ${u.cost}</button>`}
        </div>`).join('')}</div>`;
      body.onclick = (e) => {
        const buy = e.target.closest('[data-buy]');
        const up = e.target.closest('[data-up]');
        if (buy && !buy.disabled) {
          const k = buy.dataset.buy, n = +buy.dataset.n, cost = FLOWERS[k].seedCost * n;
          if (S.coins < cost) return;
          S.coins -= cost; add(S.seeds, k, n);
          save(); sfx('coin'); game.refreshHud(); ctx.redraw();
        } else if (up && !up.disabled) {
          const k = up.dataset.up, u = UPGRADES[k];
          if (S.coins < u.cost) return;
          S.coins -= u.cost; S.upgrades[k] = true;
          save(); sfx('chime'); game.refreshHud(); ctx.redraw(); render();
          toast(`${u.name} — done ✿`);
        }
      };
    },
  };
  const notepad = {
    id: 'notepad', name: 'Notepad', icon: 'notepad',
    render(body, ctx) {
      const known = Object.keys(FLOWERS).filter((k) => S.harvested[k]).length;
      ctx.sub(`Guinny’s Flower Encyclopedia · ${known} / ${Object.keys(FLOWERS).length} pages filled`);
      body.innerHTML = `<div class="grid book">${Object.entries(FLOWERS).map(([k, f]) => {
        const n = S.harvested[k] || 0;
        const uses = Object.entries(PRODUCTS).filter(([, p]) => p.needs[k]).map(([pk]) => `<i title="${PRODUCTS[pk].name}">${P(pk)}</i>`).join('');
        return n ? `<div class="card book-card">
            <div class="decor-ico">${F(k)}</div><b>${f.name}</b><small>${f.note}</small>
            <small class="charm">${where(f)} · ~${f.growMin} min · harvested ${n} · in basket ${S.flowers[k] || 0}</small>
            <div class="book-uses">${uses}</div></div>`
          : `<div class="card book-card unknown"><div class="decor-ico">${F(k)}</div><b>???</b><small>Harvest one to fill in this page.</small></div>`;
      }).join('')}</div>`;
    },
  };
  openTablet({ theme: 'garden', apps: [florist, notepad], start, onClose: render });
}

// --- Render -----------------------------------------------------------------------------
function render() {
  if (!canvas) return;
  const now = Date.now();
  let dry = 0, ready = 0, empty = 0;
  $$('.planter', canvas).forEach((el) => {
    const u = PLANTERS[+el.dataset.p].unlock;
    el.classList.toggle('locked', !!u && !S.upgrades[u]);
    // only the next planters you can buy get a label; the rest stay quietly faded
    el.classList.toggle('next', !!u && !S.upgrades[u] && (!UPGRADES[u].requires || !!S.upgrades[UPGRADES[u].requires]));
  });
  PLOTS.forEach((_, i) => {
    const el = plotEl(i);
    if (!plotUnlocked(i)) return;
    const st = plotStage(i, now), p = S.garden[i];
    const key = `${p.key}:${st}`;
    if (lastKey[i] !== key) {
      $('.plant', el).innerHTML = st >= 1 ? plotArt(p.key, st) : '';
      if (lastKey[i] !== undefined && st === 3) bump(el);
      lastKey[i] = key;
    }
    const wet = st >= 0 && isWet(i, now);
    const thirsty = st >= 0 && st < 3 && !wet;
    el.classList.toggle('planted', st >= 0);
    el.classList.toggle('wet', wet);
    el.classList.toggle('ready', st === 3);
    el.classList.toggle('empty', st === -1);
    el.classList.toggle('thirsty', thirsty);
    $('.plot-badge', el).innerHTML = thirsty && PLOTS[i].type === 'pot' ? `<span class="b-drop">${dropArt()}</span>` : '';
    const bar = $('.plot-bar', el);
    bar.style.display = st >= 0 && st < 3 ? '' : 'none';
    if (st >= 0 && st < 3) $('i', bar).style.width = `${Math.round((p.grown / (p.grown + plotRemaining(i))) * 100)}%`;
    if (thirsty) dry++; if (st === 3) ready++; if (st === -1) empty++;
  });
  // one water-drop bubble per thirsty planter (not per patch)
  $$('.planter', canvas).forEach((pl) => pl.classList.toggle('thirsty', !!$('.plot.thirsty', pl)));
  $('.tool-can', view).classList.toggle('attn', dry > 0);
  $('.tool-ipad', view).classList.toggle('attn', !Object.values(S.seeds).some(Boolean) && empty > 0);
  hint($('.g-hint', view),
    ready ? `Swipe across the ripe ${ready > 1 ? `plants (${ready})` : 'plant'} to harvest ✿`
    : dry ? 'Drag the watering can over the thirsty planters'
    : empty ? 'Tap an empty patch or pot to plant seeds'
    : 'Everything is growing nicely ♪');
}

export const refresh = () => { lastKey.length = 0; render(); };
