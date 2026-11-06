// Scene 2: 作業場 (Workshop) — turn garden flowers into tea, perfume and bouquets.
import { PRODUCTS, FLOWERS, CATEGORIES } from '../data.js';
import { S, save, add, trend } from '../state.js';
import { P, F } from '../art.js';
import { $, h, toast, floatText, bump, sfx } from '../ui.js';

let root, view, panel, game;
let craft = null; // { key, step }

const canMake = (k) => Object.entries(PRODUCTS[k].needs).every(([f, n]) => (S.flowers[f] || 0) >= n);

export function mount(el, api) {
  game = api;
  root = el;
  root.innerHTML = `
  <div class="view work-view">
    <div class="wall wood"></div>
    <div class="work-window"><div class="sky"><div class="sun"></div></div></div>
    <div class="jar-shelf"><div class="jars"></div><div class="shelf-board"></div></div>
    <div class="hanging-herbs">${['lavender', 'mint', 'chamomile', 'rose'].map(k => `<div class="herb">${F(k)}</div>`).join('')}</div>
    <div class="floor wood-floor"></div>
    <img class="guinny" src="assets/img/guinny-apron.webp" alt="Guinny" draggable="false">
    <div class="bench"><div class="bench-top"></div><div class="bench-front"></div></div>
    <button class="craft-spot hidden" aria-label="Craft"><div class="craft-art"></div><div class="sparkles"></div></button>
  </div>
  <div class="panel work-panel">
    <div class="craft-mode hidden card">
      <div class="craft-head"><div class="row-ico craft-ico"></div><div><b class="craft-name"></b><small class="craft-sub"></small></div></div>
      <div class="steps"></div>
      <button class="btn-primary craft-btn">Next</button>
    </div>
    <div class="recipe-mode">
      <p class="hint">Make tea and perfume here. Bouquets are arranged fresh at the shop counter.</p>
      <div class="list recipes"></div>
    </div>
  </div>`;
  view = $('.view', root);
  panel = $('.panel', root);
  $('.recipes', panel).addEventListener('click', (e) => {
    const b = e.target.closest('[data-make]');
    if (b && !b.disabled) start(b.dataset.make);
  });
  $('.craft-btn', panel).addEventListener('click', step);
  $('.craft-spot', view).addEventListener('click', step);
  render();
}

export function enter() { render(); }
export function leave() {}
export function tick() {}

function start(k) {
  const p = PRODUCTS[k];
  for (const [f, n] of Object.entries(p.needs)) add(S.flowers, f, -n);
  save();
  craft = { key: k, step: 0 };
  sfx('pop');
  const spot = $('.craft-spot', view);
  spot.classList.remove('hidden', 'done');
  $('.craft-art', spot).innerHTML = Object.keys(p.needs).map(f => `<span>${F(f)}</span>`).join('');
  $('.guinny', view).classList.add('busy');
  render();
}

function step() {
  if (!craft) return;
  const p = PRODUCTS[craft.key];
  const steps = CATEGORIES[p.cat].steps;
  const spot = $('.craft-spot', view);
  craft.step++;
  bump(spot);
  bump($('.guinny', view));
  if (craft.step < steps.length) {
    sfx('tap');
    spot.dataset.step = craft.step;
    render();
    return;
  }
  // done!
  sfx('chime');
  add(S.stock, craft.key, p.makes);
  save();
  $('.craft-art', spot).innerHTML = P(craft.key);
  spot.classList.add('done');
  floatText(spot, `+${p.makes} ${p.name}`);
  $('.guinny', view).classList.remove('busy');
  const made = craft.key;
  craft = null;
  setTimeout(() => { if (!craft) spot.classList.add('hidden'); }, 1400);
  if (!S.lineup.includes(made)) toast(`Tip: add ${PRODUCTS[made].name} to the lineup in the shop`);
  render();
  game.refreshShop();
}

function render() {
  if (!panel) return;
  // jars show flower inventory
  $('.jars', view).innerHTML = Object.keys(FLOWERS).map(f =>
    `<div class="jar ${S.flowers[f] ? '' : 'empty'}"><div class="jar-ico">${F(f)}</div><span>${S.flowers[f] || 0}</span></div>`).join('');

  const cm = $('.craft-mode', panel), rm = $('.recipe-mode', panel);
  cm.classList.toggle('hidden', !craft);
  rm.classList.toggle('hidden', !!craft);
  if (craft) {
    const p = PRODUCTS[craft.key], steps = CATEGORIES[p.cat].steps;
    $('.craft-ico', cm).innerHTML = P(craft.key);
    $('.craft-name', cm).textContent = p.name;
    $('.craft-sub', cm).textContent = `Makes ${p.makes} · tap the button or the workbench`;
    $('.steps', cm).innerHTML = steps.map((s, i) =>
      `<div class="step ${i < craft.step ? 'done' : i === craft.step ? 'now' : ''}"><i>${i < craft.step ? '✓' : i + 1}</i>${s}</div>`).join('');
    $('.craft-btn', cm).textContent = steps[craft.step] + (craft.step === steps.length - 1 ? ' ✿' : '');
    return;
  }
  const keys = Object.keys(PRODUCTS).filter(k => !PRODUCTS[k].fresh).sort((a, b) =>
    (S.lineup.includes(b) - S.lineup.includes(a)) || (canMake(b) - canMake(a)));
  $('.recipes', panel).innerHTML = keys.map(k => {
    const p = PRODUCTS[k], ok = canMake(k);
    const needs = Object.entries(p.needs).map(([f, n]) => {
      const have = S.flowers[f] || 0;
      return `<span class="need ${have >= n ? '' : 'short'}"><i>${F(f)}</i>${have}/${n}</span>`;
    }).join('');
    const tags = (S.lineup.includes(k) ? '<span class="pill">On shelf</span>' : '') + (trend() === k ? '<span class="pill star">★</span>' : '');
    return `<div class="row ${ok ? '' : 'dim'}">
      <div class="row-ico">${P(k)}</div>
      <div class="row-main"><b>${p.name} ${tags}</b><small>In stock: ${S.stock[k] || 0}</small><div class="needs">${needs}</div></div>
      <button class="btn-toggle on" data-make="${k}" ${ok ? '' : 'disabled'}>${ok ? `Make ×${p.makes}` : 'Need flowers'}</button>
    </div>`;
  }).join('');
}

export const refresh = () => { if (root && !craft) render(); };
