// Scene 3: Garden — plant seeds, water, and harvest flowers in real time.
import { FLOWERS } from '../data.js';
import { S, save, add, plotStage, plotRemaining, fmtTime } from '../state.js';
import { F, SEED, plotArt, coinArt, canArt } from '../art.js';
import { $, $$, h, openSheet, toast, floatText, bump, sfx } from '../ui.js';

let root, view, panel, game;
let active = false;
const lastStage = [];

export function mount(el, api) {
  game = api;
  root = el;
  root.innerHTML = `
  <div class="view garden-view">
    <div class="sky"><div class="sun"></div><div class="cloud"></div><div class="cloud c2"></div></div>
    <div class="hill h1"></div><div class="hill h2"></div>
    <div class="fence"></div>
    <div class="grass"></div>
    <img class="guinny" src="assets/img/guinny-garden.webp" alt="Guinny" draggable="false">
    <div class="watering-can">${canArt()}</div>
    <div class="plots">${S.plots.map((_, i) => `
      <button class="plot" data-i="${i}" aria-label="Plot ${i + 1}">
        <div class="soil"></div><div class="plant"></div>
        <div class="plot-tag"></div>
      </button>`).join('')}</div>
  </div>
  <div class="panel garden-panel">
    <div class="card bag">
      <div class="bag-title">Seed bag <small>種</small></div>
      <div class="chips seeds"></div>
    </div>
    <div class="card bag">
      <div class="bag-title">Flower basket <small>花かご</small></div>
      <div class="chips flowers"></div>
    </div>
    <div class="tile-row">
      <button class="btn-tile water-all"><span class="tile-ico">${canArt()}</span><span>Water all<small>水やり</small></span></button>
      <button class="btn-tile seed-shop"><span class="tile-ico">${SEED('daisy')}</span><span>Seed shop<small>種屋さん</small></span></button>
    </div>
  </div>`;
  view = $('.view', root);
  panel = $('.panel', root);
  $('.plots', view).addEventListener('click', (e) => {
    const b = e.target.closest('.plot');
    if (b) tapPlot(+b.dataset.i, b);
  });
  $('.water-all', panel).addEventListener('click', waterAll);
  $('.seed-shop', panel).addEventListener('click', () => { sfx('tap'); openSeeds(); });
  render();
}

export function enter() { active = true; render(); }
export function leave() { active = false; }
export function tick() { if (active) render(); }

function tapPlot(i, el) {
  const p = S.plots[i];
  const stage = plotStage(p);
  if (stage === -1) { sfx('tap'); openSeeds(i); return; }
  if (stage === 0) { water(i, el); return; }
  if (stage === 3) {
    const f = FLOWERS[p.key];
    add(S.flowers, p.key, f.yield);
    floatText(el, `+${f.yield} ${f.name}`);
    S.plots[i] = { key: null, plantedAt: 0, watered: false };
    sfx('pop'); save(); bump(el); render(); game.refreshWorkshop();
    return;
  }
  sfx('soft');
  bump(el);
  floatText(el, `${fmtTime(plotRemaining(p))} to bloom`, 'small');
}

function water(i, el) {
  const p = S.plots[i];
  p.watered = true;
  p.plantedAt = Date.now();
  save();
  sfx('water');
  el.classList.add('splash');
  setTimeout(() => el.classList.remove('splash'), 700);
  const can = $('.watering-can', view);
  bump(can);
  floatText(el, 'Watered ✿', 'small');
  render();
}

function waterAll() {
  const dry = S.plots.map((p, i) => [p, i]).filter(([p]) => plotStage(p) === 0);
  if (!dry.length) { sfx('soft'); toast('Nothing needs water right now ♪'); return; }
  dry.forEach(([, i], n) => setTimeout(() => water(i, $(`.plot[data-i="${i}"]`, view)), n * 120));
}

function plant(i, key) {
  add(S.seeds, key, -1);
  S.plots[i] = { key, plantedAt: 0, watered: false };
  save(); sfx('pop'); render();
  toast(`Planted ${FLOWERS[key].name}. Give it some water!`);
}

// --- Seed sheet (plant / buy) ----------------------------------------------
function openSeeds(plotIndex = null) {
  const body = h('<div class="list"></div>');
  const sheet = openSheet({
    title: plotIndex === null ? 'Seed Shop' : 'Plant a Seed',
    sub: plotIndex === null ? 'Seeds grow in real time — check back later!' : 'Choose a seed for this plot',
    body,
  });
  const draw = () => {
    body.innerHTML = Object.entries(FLOWERS).map(([k, f]) => {
      const have = S.seeds[k] || 0;
      return `<div class="row">
        <div class="row-ico">${SEED(k)}</div>
        <div class="row-main"><b>${f.name}</b><small>Blooms in ~${f.growMin} min · ${f.yield} flowers · you have ${have}</small></div>
        <div class="row-btns">
          <button class="btn-buy" data-buy="${k}" ${S.coins < f.seedCost ? 'disabled' : ''}>${coinArt()} ${f.seedCost}</button>
          ${plotIndex !== null ? `<button class="btn-toggle on" data-plant="${k}" ${have ? '' : 'disabled'}>Plant</button>` : ''}
        </div>
      </div>`;
    }).join('');
  };
  body.addEventListener('click', (e) => {
    const buy = e.target.closest('[data-buy]');
    const pl = e.target.closest('[data-plant]');
    if (buy && !buy.disabled) {
      const k = buy.dataset.buy;
      S.coins -= FLOWERS[k].seedCost;
      add(S.seeds, k, 1);
      save(); sfx('coin'); game.refreshHud(); draw(); render();
    } else if (pl && !pl.disabled) {
      plant(plotIndex, pl.dataset.plant);
      sheet.close();
    }
  });
  draw();
}

// ---------------------------------------------------------------------------
function render() {
  if (!view) return;
  const now = Date.now();
  $$('.plot', view).forEach((el, i) => {
    const p = S.plots[i], st = plotStage(p, now);
    if (lastStage[i] !== st) {
      $('.plant', el).innerHTML = st >= 0 ? plotArt(p.key, st) : '';
      if (lastStage[i] !== undefined && st === 3) bump(el);
      lastStage[i] = st;
    }
    el.className = `plot s${st}${el.classList.contains('splash') ? ' splash' : ''}${el.classList.contains('bump') ? ' bump' : ''}`;
    const tag = $('.plot-tag', el);
    tag.innerHTML = st === -1 ? '＋ Plant' : st === 0 ? 'Water me' : st === 3 ? 'Harvest ✿' : fmtTime(plotRemaining(p, now));
  });
  const chips = (bag, artFn) => {
    const ks = Object.keys(FLOWERS).filter(k => bag[k]);
    return ks.length ? ks.map(k => `<span class="chip"><i>${artFn(k)}</i>${bag[k]}</span>`).join('') : '<span class="muted">empty</span>';
  };
  $('.seeds', panel).innerHTML = chips(S.seeds, SEED);
  $('.flowers', panel).innerHTML = chips(S.flowers, F);
}

export const refresh = () => { lastStage.length = 0; render(); };
