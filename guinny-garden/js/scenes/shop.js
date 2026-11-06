// Scene 1: Shop Front
// Guinny stands behind the counter. Customers walk in from the right.
//  - Packing area (wrapping paper + ribbon) opens the packing pop-up:
//      make bouquet (bouquet orders) → pack into bag → spray perfume on the bag
//  - iPad opens: Today's Menu (lineup, shown on the menu board) and Decor Shop
import { PRODUCTS, DECOR, CUSTOMERS, FLOWERS, GREETINGS, THANKS } from '../data.js';
import { S, save, add, charm, lineupSlots, trend, priceOf, timeOfDay, available } from '../state.js';
import { P, F, D, coinArt, bagArt, sprayArt, customerSrc } from '../art.js';
import { $, $$, h, openSheet, toast, floatText, bump, sfx } from '../ui.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const LAYERS = ['wall', 'floor', 'window', 'board'];
let root, view, canvas, game;
let cust = null;        // active customer
let nextAt = 0;
let active = false;
let orient = '';

export function mount(el, api) {
  game = api;
  root = el;
  root.classList.add('full');
  root.innerHTML = `
  <div class="view shop-view">
    <div class="canvas">
      ${LAYERS.map((k) => `<img class="layer" data-layer="${k}" alt="" draggable="false">`).join('')}
      <div class="decor-spot" data-spot="painting"></div>
      <div class="decor-spot" data-spot="windowbox"></div>
      <div class="decor-spot" data-spot="bunting"></div>
      <div class="decor-spot" data-spot="lantern"></div>
      <div class="menu-board" aria-label="Today's menu"></div>
      <img class="guinny" src="assets/img/guinny-apron.webp" alt="Guinny" draggable="false">
      <img class="layer" data-layer="counter" alt="" draggable="false">
      <div class="decor-spot" data-spot="plush"></div>
      <div class="decor-spot" data-spot="rug"></div>
      <button class="hot hot-pack" aria-label="Packing area"><span class="hot-tag">Wrap ✿</span></button>
      <button class="hot hot-ipad" aria-label="iPad: menu and shop"><span class="hot-tag">Menu &amp; Shop</span></button>
      <button class="bag hidden" aria-label="Hand over the bag">${bagArt(1)}</button>
      <button class="coin-drop hidden" aria-label="Collect coins">${coinArt()}<span></span></button>
      <button class="customer hidden" aria-label="Customer"><div class="bubble"></div><img class="cust-img" alt="" draggable="false"></button>
      <div class="decor-spot" data-spot="fern"></div>
    </div>
    <div class="shop-hint" role="status"></div>
  </div>`;
  view = $('.view', root);
  canvas = $('.canvas', view);

  $('.hot-pack', view).addEventListener('click', tapPack);
  $('.hot-ipad', view).addEventListener('click', () => { sfx('tap'); openIpad(); });
  $('.bag', view).addEventListener('click', handOver);
  $('.coin-drop', view).addEventListener('click', collect);
  $('.customer', view).addEventListener('click', tapCustomer);

  new ResizeObserver(layout).observe(view);
  layout();
  renderDecor();
  renderBoard();
  render();
}

// Pick the landscape or portrait background to fit the view.
function layout() {
  const r = view.getBoundingClientRect();
  const o = r.width >= r.height ? 'landscape' : 'portrait';
  if (o === orient) return;
  orient = o;
  canvas.dataset.o = o;
  $$('.layer', canvas).forEach((img) => { img.src = `assets/img/shop/${o}-${img.dataset.layer}.webp`; });
}

export function enter() { active = true; if (!cust) nextAt = Date.now() + 1500; renderBoard(); render(); }
export function leave() { active = false; }
export function tick(now) {
  if (!active) return;
  if (!cust && now >= nextAt && sellable().length) spawn();
}

// ---------------------------------------------------------------------------
const sellable = () => S.lineup.filter((k) => available(k) > 0);

function chooseOrder() {
  const tod = timeOfDay(), hour = new Date().getHours();
  const weights = S.lineup.map((k) => {
    const p = PRODUCTS[k];
    let w = available(k) ? 5 : 0.6;
    if (p.cat === 'tea' && hour < 13) w *= 1.5;
    if (p.cat === 'bouquet' && (tod === 'dusk' || hour >= 15)) w *= 1.5;
    if (p.cat === 'perfume' && hour >= 11 && hour < 18) w *= 1.3;
    if (trend() === k) w *= 2;
    return w;
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return S.lineup[i]; }
  return S.lineup[0];
}

function spawn() {
  const who = pick(CUSTOMERS);
  cust = { who, want: chooseOrder(), stage: 'arriving', scent: 0 };
  const el = $('.customer', view);
  $('.cust-img', el).src = customerSrc(who);
  el.classList.remove('hidden', 'leaving');
  el.classList.add('arriving');
  sfx('chime');
  setTimeout(() => {
    if (!cust) return;
    el.classList.remove('arriving');
    showBubble(pick(GREETINGS));
    setTimeout(() => {
      if (!cust) return;
      cust.stage = 'waiting';
      if (!available(cust.want)) $('.cust-img', el).src = customerSrc(who, true);
      showBubble();
      render();
    }, 1000);
  }, 1100);
  render();
}

function showBubble(text) {
  const b = $('.bubble', view);
  if (text) b.innerHTML = `<span class="bubble-text">${text}</span>`;
  else {
    const out = !available(cust.want);
    b.innerHTML = `<span class="bubble-ico ${out ? 'soldout' : ''}">${P(cust.want)}</span>${trend() === cust.want ? '<span class="bubble-star">★</span>' : ''}`;
  }
  b.classList.add('show');
  bump(b);
}

function customerLeaves(msg) {
  const el = $('.customer', view);
  showBubble(msg);
  cust.stage = 'leaving';
  render();
  setTimeout(() => { el.classList.add('leaving'); $('.bubble', view).classList.remove('show'); }, 900);
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('leaving');
    cust = null;
    const interval = 11000 / (1 + charm() * 0.08);
    nextAt = Date.now() + interval * (0.6 + Math.random() * 0.8);
    render();
  }, 1900);
}

function tapCustomer() {
  if (!cust) return;
  if (cust.stage === 'waiting' && !available(cust.want)) { sfx('soft'); customerLeaves('Maybe tomorrow~'); return; }
  if (cust.stage === 'waiting') { tapPack(); return; }
  if (cust.stage === 'ready') { handOver(); return; }
  if (cust.stage === 'paying') { collect(); return; }
  bump($('.customer', view));
}

function tapPack() {
  sfx('tap');
  if (!cust || cust.stage !== 'waiting') {
    toast(cust ? 'One thing at a time ♪' : 'The packing table is ready for the next order');
    bump($('.hot-pack', view));
    return;
  }
  if (!available(cust.want)) { toast('Sold out… tap the customer to apologise'); return; }
  openPacking();
}

function handOver() {
  if (!cust || cust.stage !== 'ready') return;
  sfx('soft');
  const bag = $('.bag', view);
  bag.classList.add('sent');
  cust.stage = 'paying';
  const price = priceOf(cust.want);
  const tipChance = charm() * 0.02 + cust.scent * 0.1;
  const tip = Math.random() < tipChance ? Math.ceil(price * 0.15) : 0;
  cust.paid = price + tip;
  cust.tip = tip;
  setTimeout(() => {
    bag.classList.add('hidden'); bag.classList.remove('sent');
    showBubble(cust.scent >= 3 ? 'Smells lovely ♡' : '♡');
    const coin = $('.coin-drop', view);
    coin.classList.remove('hidden');
    $('span', coin).textContent = `+${cust.paid}`;
    bump(coin); sfx('coin'); render();
  }, 550);
  render();
}

function collect() {
  const coin = $('.coin-drop', view);
  if (!cust || cust.stage !== 'paying' || coin.classList.contains('hidden')) return;
  sfx('coin');
  S.coins += cust.paid;
  S.day.earned += cust.paid;
  S.day.served += 1;
  save();
  floatText(coin, `+${cust.paid}${cust.tip ? ' ♡ tip' : ''}`, 'coin');
  coin.classList.add('hidden');
  game.refreshHud(true);
  customerLeaves(pick(THANKS));
}

// --- Packing pop-up ---------------------------------------------------------
function openPacking() {
  const key = cust.want, p = PRODUCTS[key];
  const steps = [...(p.fresh ? ['bouquet'] : []), 'bag', 'spray'];
  const labels = { bouquet: 'Make bouquet', bag: 'Pack into bag', spray: 'Spray perfume' };
  let i = 0, done = false;
  const added = {};               // bouquet stems placed so far
  let scent = 0;
  cust.stage = 'packing';
  render();

  const body = h('<div class="pack"></div>');
  const sheet = openSheet({
    title: 'Packing Table', sub: `${cust.who.name}’s order: ${p.name}`, body, cls: 'pack-sheet',
    onClose: () => { if (!done && cust && cust.stage === 'packing') { cust.stage = 'waiting'; render(); } },
  });

  const draw = () => {
    const st = steps[i];
    const dots = steps.map((s, n) => `<span class="pdot ${n < i ? 'done' : n === i ? 'now' : ''}"><i>${n < i ? '✓' : n + 1}</i>${labels[s]}</span>`).join('');
    let stage = '', ctrl = '';
    if (st === 'bouquet') {
      const need = Object.entries(p.needs);
      const total = need.reduce((a, [, n]) => a + n, 0);
      const placed = Object.values(added).reduce((a, b) => a + b, 0);
      const stems = Object.entries(added).flatMap(([f, n]) => Array(n).fill(f));
      stage = `<div class="bouquet-stage">
        <div class="bq-stems">${stems.map((f, n) => `<span style="--a:${(n - (stems.length - 1) / 2) * 14}deg">${F(f)}</span>`).join('')}</div>
        <div class="bq-wrap"></div></div>`;
      ctrl = `<p class="pack-tip">Tap the flowers to arrange them (${placed}/${total})</p>
        <div class="pack-btns">${need.map(([f, n]) => `<button class="pick-flower" data-f="${f}" ${(added[f] || 0) >= n ? 'disabled' : ''}>
          <i>${F(f)}</i><span>${FLOWERS[f].name}<small>${added[f] || 0}/${n}</small></span></button>`).join('')}</div>`;
    } else if (st === 'bag') {
      stage = `<div class="bag-stage"><button class="pack-item" aria-label="Put ${p.name} in the bag">${P(key)}</button><div class="pack-bag">${bagArt(0)}</div></div>`;
      ctrl = `<p class="pack-tip">Tap the ${p.name} to pop it in the bag</p>`;
    } else {
      stage = `<div class="spray-stage"><div class="pack-bag closed">${bagArt(1)}<div class="mist"></div></div><button class="pack-spray" aria-label="Spray perfume">${sprayArt()}</button></div>`;
      ctrl = `<p class="pack-tip">${scent >= 3 ? 'Beautifully scented ♡' : 'Tap the bottle to spray (up to 3 for a happier customer)'}</p>
        <button class="btn-primary pack-finish" ${scent ? '' : 'disabled'}>Done ✿</button>`;
    }
    body.innerHTML = `<div class="pack-steps">${dots}</div>${stage}${ctrl}`;
  };

  body.addEventListener('click', (e) => {
    const st = steps[i];
    if (st === 'bouquet') {
      const b = e.target.closest('.pick-flower');
      if (!b || b.disabled) return;
      added[b.dataset.f] = (added[b.dataset.f] || 0) + 1;
      sfx('pop');
      const full = Object.entries(p.needs).every(([f, n]) => (added[f] || 0) >= n);
      draw();
      if (full) {
        sfx('chime');
        $('.bouquet-stage', body).classList.add('tied');
        setTimeout(() => { i++; draw(); }, 700);
      }
    } else if (st === 'bag') {
      const item = e.target.closest('.pack-item');
      if (!item || item.classList.contains('in')) return;
      sfx('pop');
      item.classList.add('in');
      setTimeout(() => { i++; draw(); }, 650);
    } else {
      if (e.target.closest('.pack-spray')) {
        if (scent >= 3) { bump($('.pack-spray', body)); return; }
        scent++;
        sfx('water');
        draw();
        const mist = $('.mist', body);
        mist.innerHTML = Array.from({ length: scent * 4 }, (_, n) =>
          `<i style="--x:${10 + (n * 37) % 80}%;--y:${10 + (n * 53) % 70}%;--d:${n * 40}ms">${n % 3 ? '·' : '♡'}</i>`).join('');
        bump($('.pack-spray', body));
      } else if (e.target.closest('.pack-finish') && scent) {
        done = true;
        finishPacking(key, scent);
        sheet.close();
      }
    }
  });
  draw();
}

function finishPacking(key, scent) {
  const p = PRODUCTS[key];
  if (p.fresh) for (const [f, n] of Object.entries(p.needs)) add(S.flowers, f, -n);
  else add(S.stock, key, -1);
  save();
  cust.stage = 'ready';
  cust.scent = scent;
  const bag = $('.bag', view);
  bag.classList.remove('hidden', 'sent');
  bump(bag); sfx('chime');
  renderBoard(); render();
  game.refreshWorkshop();
}

// ---------------------------------------------------------------------------
function render() {
  const hint = $('.shop-hint', view);
  const pack = $('.hot-pack', view), bag = $('.bag', view);
  pack.classList.toggle('attn', !!cust && cust.stage === 'waiting' && available(cust.want) > 0);
  bag.classList.toggle('attn', !!cust && cust.stage === 'ready');
  $('.hot-ipad', view).classList.toggle('attn', !S.lineup.length || (!cust && !sellable().length));
  let t;
  if (!cust) {
    t = !S.lineup.length ? 'Tap the iPad to choose today’s menu'
      : !sellable().length ? 'Menu is sold out — make goods in the 作業場, or change the menu on the iPad'
      : 'Humming a tune… waiting for customers ♪';
  } else {
    const who = cust.who.name, name = PRODUCTS[cust.want].name;
    t = {
      arriving: `${who} is coming in…`,
      waiting: available(cust.want) ? `${who} would like ${name} — tap the wrapping table` : `${name} is sold out — tap ${who} to apologise`,
      packing: `Packing ${name}…`,
      ready: 'All packed! Tap the bag to hand it over',
      paying: `${who} paid — tap the coins`,
      leaving: `${who} is heading home`,
    }[cust.stage];
  }
  hint.textContent = t;
}

function renderBoard() {
  const board = $('.menu-board', view);
  const items = S.lineup.map((k) => {
    const n = available(k);
    return `<div class="mb-item ${n ? '' : 'out'}"><i>${P(k)}</i><span>${priceOf(k)}${trend() === k ? '★' : ''}<small>${n ? `×${n}` : 'sold out'}</small></span></div>`;
  }).join('');
  board.innerHTML = `<div class="mb-title">Today’s Menu</div><div class="mb-items n${S.lineup.length}">${items || '<p class="mb-empty">use the iPad to pick today’s goods</p>'}</div>`;
}

function renderDecor() {
  $$('.decor-spot', view).forEach((spot) => {
    const k = spot.dataset.spot;
    const on = S.decor[k]?.placed;
    spot.innerHTML = on ? D(k) : '';
    spot.classList.toggle('on', !!on);
  });
}

// --- iPad: Today's Menu + Decor Shop ------------------------------------------
function openIpad(tab = 'menu') {
  const body = h(`<div class="ipad">
    <div class="seg" role="tablist">
      <button class="seg-btn" data-tab="menu">Today’s Menu</button>
      <button class="seg-btn" data-tab="decor">Decor Shop</button>
    </div>
    <div class="ipad-body"></div></div>`);
  const sheet = openSheet({ title: 'Guinny’s iPad', body, cls: 'wide', onClose: () => { renderBoard(); render(); } });
  const inner = $('.ipad-body', body);

  const drawMenu = () => {
    const slots = lineupSlots();
    sheet.setSub(`${S.lineup.length} / ${slots} spots on the menu board · ★ trend sells for more today`);
    const keys = Object.keys(PRODUCTS).sort((a, b) => available(b) - available(a));
    inner.innerHTML = `<div class="list">${keys.map((k) => {
      const p = PRODUCTS[k], on = S.lineup.includes(k), n = available(k);
      const full = !on && S.lineup.length >= slots;
      return `<div class="row ${on ? 'selected' : ''}">
        <div class="row-ico">${P(k)}</div>
        <div class="row-main"><b>${p.name}${trend() === k ? ' <span class="pill star">★ Trend</span>' : ''}</b>
          <small>${priceOf(k)} coins · ${n ? `${n} ${p.fresh ? 'can be arranged' : 'in stock'}` : `<span class="muted">${p.fresh ? 'needs flowers' : 'none made yet'}</span>`}</small></div>
        <button class="btn-toggle ${on ? 'on' : ''}" data-k="${k}" ${full ? 'disabled' : ''}>${on ? 'On menu ✓' : full ? 'Board full' : 'Add'}</button>
      </div>`;
    }).join('')}</div>`;
  };
  const drawDecor = () => {
    sheet.setSub(`Charm ✿ ${charm()} — more charm brings more visitors & tips`);
    inner.innerHTML = `<div class="grid">${Object.entries(DECOR).map(([k, d]) => {
      const own = S.decor[k];
      const btn = !own
        ? `<button class="btn-buy" data-buy="${k}" ${S.coins < d.cost ? 'disabled' : ''}>${coinArt()} ${d.cost}</button>`
        : `<button class="btn-toggle ${own.placed ? 'on' : ''}" data-place="${k}">${own.placed ? 'Placed ✓' : 'Place'}</button>`;
      return `<div class="card decor-card ${own?.placed ? 'selected' : ''}">
        <div class="decor-ico">${D(k)}</div>
        <b>${d.name}</b><small>${d.desc}</small><small class="charm">✿ +${d.charm} charm</small>${btn}</div>`;
    }).join('')}</div>`;
  };
  const show = (t) => {
    tab = t;
    $$('.seg-btn', body).forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === t));
    (t === 'menu' ? drawMenu : drawDecor)();
    inner.scrollTop = 0;
  };

  body.addEventListener('click', (e) => {
    const seg = e.target.closest('.seg-btn');
    if (seg) { sfx('tap'); show(seg.dataset.tab); return; }
    const k = e.target.closest('[data-k]');
    const buy = e.target.closest('[data-buy]');
    const place = e.target.closest('[data-place]');
    if (k && !k.disabled) {
      const key = k.dataset.k;
      if (S.lineup.includes(key)) S.lineup = S.lineup.filter((x) => x !== key);
      else S.lineup.push(key);
      sfx('pop'); save(); drawMenu(); renderBoard(); render();
    } else if (buy && !buy.disabled) {
      const key = buy.dataset.buy, d = DECOR[key];
      if (S.coins < d.cost) return;
      S.coins -= d.cost;
      S.decor[key] = { placed: true };
      sfx('chime'); toast(`${d.name} placed in the shop ♡`);
      game.refreshHud();
      save(); drawDecor(); renderDecor();
    } else if (place) {
      const key = place.dataset.place;
      S.decor[key].placed = !S.decor[key].placed;
      while (S.lineup.length > lineupSlots()) S.lineup.pop();
      sfx('pop'); save(); drawDecor(); renderDecor(); renderBoard();
    }
  });
  show(tab);
}

export const refresh = () => { if (root) { renderBoard(); render(); } };
