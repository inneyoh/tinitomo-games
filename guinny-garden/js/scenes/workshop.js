// Scene 2: 作業場 (Workshop) — two stations, each launching mini-games:
//   Alchemy table → perfume (Weigh → Sort → Mix)
//   Kitchen       → tea: blends are brewed (fit the flowers into the brewing tank),
//                   single-flower teas are packed (Chop → Dry → Pour)
// Flowers are only used when a mini-game is finished; quitting costs nothing.
// 3 stars = one bonus item.
import { PRODUCTS, FLOWERS } from '../data.js';
import { S, save, add, trend } from '../state.js';
import { P, F, alchemyArt, kitchenArt } from '../art.js';
import { $, h, openSheet, toast, floatText, bump, sfx, hint } from '../ui.js';
import { openGame, starsFor } from '../minigames/shell.js';
import { weighPhase, sortPhase, mixPhase } from '../minigames/perfume.js';
import { brewPhase } from '../minigames/brew.js';
import { chopPhase, dryPhase, pourPhase } from '../minigames/pack.js';

let root, view, game;
let busy = false;

const canMake = (k) => Object.entries(PRODUCTS[k].needs).every(([f, n]) => (S.flowers[f] || 0) >= n);
const STATIONS = {
  alchemy: { name: 'Alchemy Table', sub: 'Weigh, sort and mix flower essences into perfume', keys: () => Object.keys(PRODUCTS).filter((k) => PRODUCTS[k].cat === 'perfume') },
  kitchen: { name: 'Kitchen', sub: 'Brew tea blends in the tank, or chop, dry and pack loose-leaf tea', keys: () => Object.keys(PRODUCTS).filter((k) => PRODUCTS[k].cat === 'tea') },
};
const PLANS = {
  perfume: { theme: 'alchemy', steps: ['Weigh', 'Sort', 'Mix'], phases: [weighPhase, sortPhase, mixPhase] },
  brew:    { theme: 'kitchen', steps: ['Fill the tank'], phases: [brewPhase] },
  pack:    { theme: 'kitchen', steps: ['Chop', 'Dry', 'Pour'], phases: [chopPhase, dryPhase, pourPhase] },
};
const planFor = (p) => PLANS[p.cat === 'perfume' ? 'perfume' : p.method || 'pack'];

export function mount(el, api) {
  game = api;
  root = el;
  root.innerHTML = `
  <div class="view work-view">
    <div class="wall wood"></div>
    <div class="work-window"><div class="sky"><div class="sun"></div></div></div>
    <div class="jar-shelf"><div class="jars"></div><div class="shelf-board"></div></div>
    <div class="hanging-herbs">${['lavender', 'mint', 'chamomile', 'rose'].map((k) => `<div class="herb">${F(k)}</div>`).join('')}</div>
    <div class="floor wood-floor"></div>
    <img class="guinny" src="assets/img/guinny-apron.webp" alt="Guinny" draggable="false">
    <button class="station st-alchemy" data-st="alchemy" aria-label="Alchemy table — perfume">${alchemyArt()}<span class="hot-tag">Perfume</span></button>
    <button class="station st-kitchen" data-st="kitchen" aria-label="Kitchen — tea">${kitchenArt()}<span class="hot-tag">Tea</span></button>
    <div class="shop-hint w-hint" role="status"></div>
  </div>`;
  view = $('.view', root);
  view.querySelectorAll('.station').forEach((b) => b.addEventListener('click', () => { sfx('tap'); openStation(b.dataset.st); }));
  render();
}

export function enter() { render(); }
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
  const st = $(p.cat === 'perfume' ? '.st-alchemy' : '.st-kitchen', view);
  bump(st); floatText(st, `+${p.makes + bonus} ${p.name}`);
  game.refreshShop();
  if (!S.lineup.includes(k)) setTimeout(() => { if (!document.querySelector('.mg')) toast(`Tip: add ${p.name} to the menu on the shop iPad`); }, 900);
}

function render() {
  if (!view) return;
  $('.jars', view).innerHTML = Object.keys(FLOWERS).map((f) =>
    `<div class="jar ${S.flowers[f] ? '' : 'empty'}"><div class="jar-ico">${F(f)}</div><span>${S.flowers[f] || 0}</span></div>`).join('');
  const can = (st) => STATIONS[st].keys().some(canMake);
  $('.st-alchemy', view).classList.toggle('attn', can('alchemy') && !busy);
  $('.st-kitchen', view).classList.toggle('attn', can('kitchen') && !busy);
  hint($('.w-hint', view), can('alchemy') || can('kitchen')
    ? 'Tap the alchemy table for perfume, or the kitchen for tea'
    : 'Not enough flowers — grow more in the garden');
}

export const refresh = () => { if (root && !busy) render(); };
