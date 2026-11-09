// Scene 2: 作業場 (Workshop) — layered art laid out like the user's samples.
// Three workable stations, each highlighted with a glowing outline and a label:
//   Perfume alchemy set → perfume (Weigh → Sort → Mix)
//   Tea urn             → tea blends (fit the flowers into the brewing tank)
//   Tea leaf rack       → loose-leaf tea (Chop → Dry → Pour)
// Wall & ceiling, floor, rug, stool, flower basket and potted plant are customisable:
// styles are bought in the Furniture Shop app on the shop iPad (WORKSHOP_DECOR in data.js).
// Flowers are only used when a mini-game is finished; quitting costs nothing. 3 stars = 1 bonus.
import { PRODUCTS, WORKSHOP_DECOR } from '../data.js';
import { S, save, add, trend } from '../state.js';
import { P, F } from '../art.js';
import { $, $$, h, openSheet, toast, floatText, bump, sfx, hint, fitCanvas } from '../ui.js';
import { openGame, starsFor } from '../minigames/shell.js';
import { weighPhase, sortPhase, mixPhase } from '../minigames/perfume.js';
import { brewPhase } from '../minigames/brew.js';
import { chopPhase, dryPhase, pourPhase } from '../minigames/pack.js';

const IMG = 'assets/img/workshop/';
const SIZE = { landscape: [1671, 941], portrait: [941, 1671] };
// part of the canvas that must stay on screen (fractions); the rest may be cropped
const KEEP = { landscape: [0.06, 0.16, 0.97, 0.94], portrait: [0.03, 0.14, 0.97, 0.9] };
// [left %, top %, width %, height % (optional)] in canvas units, measured from the samples
const LAYOUT = {
  landscape: {
    frame: [90.2, 20.6, 8.2], bench: [13.8, 52, 77.9], alchemy: [19.8, 39.3, 21.2], urn: [46, 35.5, 22.6], rack: [73.3, 38.5, 13.7],
    plant: [-2.2, 50, 18.6], rug: [23, 80.5, 38.2, 16.5], stool: [62.5, 71, 10.4], basket: [88, 65.5, 10.8],
  },
  portrait: {
    frame: [87.6, 20.5, 10.4], bench: [0, 42, 100], alchemy: [3.5, 32, 34.5], urn: [41, 33, 21.8], rack: [69, 33.5, 26],
    plant: [-17, 63, 44], rug: [16, 73.5, 67], stool: [9.5, 59.5, 19.5], basket: [76.5, 62, 23.5],
  },
};
// which sprites differ between orientations
const PER_ORIENT = ['wall', 'floor', 'bench', 'alchemy', 'urn', 'rack'];

const STATIONS = {
  alchemy: { name: 'Perfume Alchemy Set', label: 'Perfume', sub: 'Weigh, sort and mix flower essences into perfume',
    keys: () => Object.keys(PRODUCTS).filter((k) => PRODUCTS[k].cat === 'perfume') },
  urn:     { name: 'Tea Urn', label: 'Tea Brewing', sub: 'Fit the flowers into the brewing tank to brew a blend',
    keys: () => Object.keys(PRODUCTS).filter((k) => PRODUCTS[k].cat === 'tea' && PRODUCTS[k].method === 'brew') },
  rack:    { name: 'Tea Leaf Rack', label: 'Tea Leaves', sub: 'Chop, dry and pack loose-leaf tea into tins',
    keys: () => Object.keys(PRODUCTS).filter((k) => PRODUCTS[k].cat === 'tea' && PRODUCTS[k].method !== 'brew') },
};
const PLANS = {
  perfume: { theme: 'alchemy', steps: ['Weigh', 'Sort', 'Mix'], phases: [weighPhase, sortPhase, mixPhase] },
  brew:    { theme: 'kitchen', steps: ['Fill the tank'], phases: [brewPhase] },
  pack:    { theme: 'kitchen', steps: ['Chop', 'Dry', 'Pour'], phases: [chopPhase, dryPhase, pourPhase] },
};
const planFor = (p) => PLANS[p.cat === 'perfume' ? 'perfume' : p.method || 'pack'];
const stationFor = (p) => (p.cat === 'perfume' ? 'alchemy' : p.method === 'brew' ? 'urn' : 'rack');
const canMake = (k) => Object.entries(PRODUCTS[k].needs).every(([f, n]) => (S.flowers[f] || 0) >= n);

let root, view, canvas, game, orient = '';
let busy = false;

export function mount(el, api) {
  game = api;
  root = el;
  root.classList.add('full');
  const img = (k, cls = '') => `<img class="w-item ${cls}" data-k="${k}" alt="" draggable="false">`;
  const station = (k) => `<button class="w-station" data-st="${k}" aria-label="${STATIONS[k].name}">
      <img class="glow-copy" data-k="${k}" alt="" draggable="false"><img data-k="${k}" alt="" draggable="false"><span class="w-label">${STATIONS[k].label}</span></button>`;
  root.innerHTML = `
  <div class="view work-view">
    <div class="canvas w-canvas">
      ${img('wall', 'layer w-wall')}
      ${img('floor', 'layer w-floor')}
      <div class="w-item w-art" data-k="frame"><img class="w-pic" src="${IMG}picture.webp" alt=""><img class="w-frame" src="${IMG}frame.webp" alt=""></div>
      ${img('bench')}
      ${station('alchemy')}${station('urn')}${station('rack')}
      ${img('rug')}${img('stool')}${img('plant')}${img('basket')}
    </div>
    <img class="w-below" data-k="floor" alt="" draggable="false">
    <div class="w-warm"></div>
    <div class="shop-hint w-hint" role="status"></div>
  </div>`;
  view = $('.view', root);
  canvas = $('.canvas', view);
  $$('.w-station', canvas).forEach((b) => b.addEventListener('click', () => { sfx('tap'); openStation(b.dataset.st); }));
  new ResizeObserver(layout).observe(view);
  layout();
  render();
}

function layout() {
  const vw = view.clientWidth, vh = view.clientHeight;
  if (!vw || !vh) return;
  const o = vw >= vh ? 'landscape' : 'portrait';
  if (o !== orient) {
    orient = o;
    canvas.dataset.o = o;
    for (const [k, [l, t, w, hh]] of Object.entries(LAYOUT[o])) {
      $$(`[data-k="${k}"]`, canvas).forEach((el) => {
        const box = el.closest('.w-station') || el;
        Object.assign(box.style, { left: `${l}%`, top: `${t}%`, width: `${w}%`, height: hh ? `${hh}%` : '' });
      });
    }
    $$('.w-wall', canvas).forEach((el) => { el.classList.toggle('w-wall-fit', o === 'portrait'); });
    renderDecor();
  }
  fitCanvas(view, canvas, ...SIZE[o], KEEP[o], 0);
  // on screens taller than the art, continue the floor below it (mirrored, so the planks line up)
  const below = $('.w-below', view);
  Object.assign(below.style, { left: canvas.style.left, width: canvas.style.width,
    top: (parseFloat(canvas.style.top) + parseFloat(canvas.style.height)) + 'px', height: canvas.style.height });
}

// Apply the placed furniture styles (and the per-orientation sprites)
function renderDecor() {
  if (!orient) return;   // not laid out yet (scene hidden)
  $$('img[data-k]', view).forEach((el) => {
    const k = el.dataset.k;
    const slot = WORKSHOP_DECOR[k];
    const base = `${IMG}${PER_ORIENT.includes(k) ? `${orient}-` : ''}${k}.webp`;
    if (!slot) { if (!el.src.endsWith(base)) el.src = base; return; }
    const id = S.workshop.placed[k] || 'default';
    const style = slot.styles[id] || slot.styles.default;
    const src = style.src || base;
    if (!el.src.endsWith(src)) el.src = src;
    el.style.filter = style.src ? '' : style.filter || '';
    el.hidden = id === 'none';
  });
}

export function enter() { layout(); render(); }
export function leave() {}
export function tick() {}

function openStation(st) {
  const S_ = STATIONS[st];
  const body = h('<div class="work-pop"></div>');
  const sheet = openSheet({ title: S_.name, sub: S_.sub, body });
  const keys = S_.keys().sort((a, b) => (S.lineup.includes(b) - S.lineup.includes(a)) || (canMake(b) - canMake(a)));
  body.innerHTML = `<div class="list recipes">${keys.map((k) => {
    const p = PRODUCTS[k], ok = canMake(k), plan = planFor(p);
    const needs = Object.entries(p.needs).map(([f, n]) => {
      const have = S.flowers[f] || 0;
      return `<span class="need ${have >= n ? '' : 'short'}"><i>${F(f)}</i>${have}/${n}</span>`;
    }).join('');
    const tags = (S.lineup.includes(k) ? '<span class="pill">On menu</span>' : '') + (trend() === k ? '<span class="pill star">★</span>' : '');
    return `<div class="row ${ok ? '' : 'dim'}">
      <div class="row-ico">${P(k)}</div>
      <div class="row-main"><b>${p.name} ${tags}</b><small>${plan.steps.join(' → ')} · in stock: ${S.stock[k] || 0}</small><div class="needs">${needs}</div></div>
      <button class="btn-toggle on" data-make="${k}" ${ok ? '' : 'disabled'}>${ok ? 'Make' : 'Need flowers'}</button>
    </div>`;
  }).join('')}</div>`;
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-make]');
    if (!b || b.disabled) return;
    sheet.close();
    setTimeout(() => play(b.dataset.make), 230);
  });
}

async function play(k) {
  if (busy) return;
  const p = PRODUCTS[k], plan = planFor(p);
  busy = true; render();
  const g = openGame({ title: p.name, steps: plan.steps, theme: plan.theme });
  const scores = [];
  for (let i = 0; i < plan.phases.length; i++) {
    g.step(i);
    const r = await Promise.race([plan.phases[i](g, p), g.closed]);
    if (r === false) { busy = false; render(); return; }   // quit: nothing used up
    scores.push(r);
  }
  if (!canMake(k)) { toast('Some flowers went missing…'); busy = false; render(); return; }
  for (const [f, n] of Object.entries(p.needs)) add(S.flowers, f, -n);
  const stars = starsFor(scores);
  const bonus = stars === 3 ? 1 : 0;
  add(S.stock, k, p.makes + bonus);
  save();
  await g.result({ product: k, stars, made: p.makes + bonus, bonus });
  busy = false;
  render();
  const st = $(`.w-station[data-st="${stationFor(p)}"]`, canvas);
  bump(st); floatText(st, `+${p.makes + bonus} ${p.name}`);
  game.refreshShop();
  if (!S.lineup.includes(k)) setTimeout(() => { if (!document.querySelector('.mg')) toast(`Tip: add ${p.name} to the menu on the shop iPad`); }, 900);
}

function render() {
  if (!view) return;
  renderDecor();
  let any = false;
  $$('.w-station', canvas).forEach((b) => {
    const ok = STATIONS[b.dataset.st].keys().some(canMake) && !busy;
    b.classList.toggle('attn', ok);
    any = any || ok;
  });
  hint($('.w-hint', view), any
    ? 'Tap a glowing station to start making something'
    : 'Not enough flowers — grow more in the garden');
}

export const refresh = () => { if (root && !busy) render(); };
