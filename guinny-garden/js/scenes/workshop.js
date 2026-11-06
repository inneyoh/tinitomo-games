// Scene 2: 作業場 (Workshop) — turn garden flowers into tea and perfume.
// Full-screen scene: tap the workbench to open the recipe pop-up, then tap
// through the steps. The finished goods pop up on the bench.
import { PRODUCTS, FLOWERS, CATEGORIES } from '../data.js';
import { S, save, add, trend } from '../state.js';
import { P, F } from '../art.js';
import { $, h, openSheet, toast, floatText, bump, sfx, hint } from '../ui.js';

let root, view, game;
let crafting = false;

const canMake = (k) => Object.entries(PRODUCTS[k].needs).every(([f, n]) => (S.flowers[f] || 0) >= n);
const recipes = () => Object.keys(PRODUCTS).filter((k) => !PRODUCTS[k].fresh);

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
    <div class="bench"><div class="bench-top"></div><div class="bench-front"></div></div>
    <button class="hot hot-bench" aria-label="Workbench — make tea and perfume"><span class="hot-tag">Make something ✿</span></button>
    <div class="craft-spot hidden"><div class="craft-art"></div><div class="sparkles"></div></div>
    <div class="shop-hint w-hint" role="status"></div>
  </div>`;
  view = $('.view', root);
  $('.hot-bench', view).addEventListener('click', () => { sfx('tap'); openRecipes(); });
  render();
}

export function enter() { render(); }
export function leave() {}
export function tick() {}

// --- Recipe + crafting pop-up --------------------------------------------------
function openRecipes() {
  const body = h('<div class="work-pop"></div>');
  const sheet = openSheet({ title: 'Workbench', sub: 'Bouquets are arranged fresh at the shop counter', body, onClose: () => { crafting = false; render(); } });
  let craft = null;   // { key, step }

  const drawList = () => {
    const keys = recipes().sort((a, b) => (S.lineup.includes(b) - S.lineup.includes(a)) || (canMake(b) - canMake(a)));
    body.innerHTML = `<div class="list recipes">${keys.map((k) => {
      const p = PRODUCTS[k], ok = canMake(k);
      const needs = Object.entries(p.needs).map(([f, n]) => {
        const have = S.flowers[f] || 0;
        return `<span class="need ${have >= n ? '' : 'short'}"><i>${F(f)}</i>${have}/${n}</span>`;
      }).join('');
      const tags = (S.lineup.includes(k) ? '<span class="pill">On menu</span>' : '') + (trend() === k ? '<span class="pill star">★</span>' : '');
      return `<div class="row ${ok ? '' : 'dim'}">
        <div class="row-ico">${P(k)}</div>
        <div class="row-main"><b>${p.name} ${tags}</b><small>In stock: ${S.stock[k] || 0}</small><div class="needs">${needs}</div></div>
        <button class="btn-toggle on" data-make="${k}" ${ok ? '' : 'disabled'}>${ok ? `Make ×${p.makes}` : 'Need flowers'}</button>
      </div>`;
    }).join('')}</div>`;
  };
  const drawCraft = () => {
    const p = PRODUCTS[craft.key], steps = CATEGORIES[p.cat].steps;
    body.innerHTML = `<div class="craft-pop">
      <div class="craft-stage ${craft.step ? `s${craft.step}` : ''}">${craft.step < steps.length - 1 ? Object.keys(p.needs).map((f) => `<span>${F(f)}</span>`).join('') : P(craft.key)}</div>
      <div class="steps">${steps.map((s, i) => `<div class="step ${i < craft.step ? 'done' : i === craft.step ? 'now' : ''}"><i>${i < craft.step ? '✓' : i + 1}</i>${s}</div>`).join('')}</div>
      <button class="btn-primary craft-btn">${steps[craft.step]}${craft.step === steps.length - 1 ? ' ✿' : ''}</button></div>`;
  };

  body.addEventListener('click', (e) => {
    const make = e.target.closest('[data-make]');
    if (make && !make.disabled) {
      const k = make.dataset.make;
      for (const [f, n] of Object.entries(PRODUCTS[k].needs)) add(S.flowers, f, -n);
      save();
      craft = { key: k, step: 0 };
      crafting = true;
      sheet.setSub(`${PRODUCTS[k].name} · makes ${PRODUCTS[k].makes}`);
      sfx('pop'); drawCraft(); render(); bump($('.guinny', view));
      return;
    }
    if (craft && e.target.closest('.craft-btn')) {
      const p = PRODUCTS[craft.key], steps = CATEGORIES[p.cat].steps;
      craft.step++;
      if (craft.step < steps.length) { sfx('tap'); drawCraft(); bump($('.craft-stage', body)); return; }
      sfx('chime');
      add(S.stock, craft.key, p.makes);
      save();
      const made = craft.key;
      craft = null; crafting = false;
      sheet.close();
      showMade(made);
      if (!S.lineup.includes(made)) setTimeout(() => toast(`Tip: add ${PRODUCTS[made].name} to the menu on the shop iPad`), 900);
      game.refreshShop();
    }
  });
  drawList();
}

function showMade(k) {
  const spot = $('.craft-spot', view);
  $('.craft-art', spot).innerHTML = P(k);
  spot.classList.remove('hidden');
  bump(spot);
  floatText(spot, `+${PRODUCTS[k].makes} ${PRODUCTS[k].name}`);
  clearTimeout(spot._t);
  spot._t = setTimeout(() => spot.classList.add('hidden'), 1800);
  render();
}

function render() {
  if (!view) return;
  // jars show flower inventory
  $('.jars', view).innerHTML = Object.keys(FLOWERS).map((f) =>
    `<div class="jar ${S.flowers[f] ? '' : 'empty'}"><div class="jar-ico">${F(f)}</div><span>${S.flowers[f] || 0}</span></div>`).join('');
  $('.guinny', view).classList.toggle('busy', crafting);
  const any = recipes().some(canMake);
  $('.hot-bench', view).classList.toggle('attn', any && !crafting);
  hint($('.w-hint', view), any ? 'Tap the workbench to make tea or perfume' : 'Not enough flowers — grow more in the garden');
}

export const refresh = () => { if (root && !crafting) render(); };
