// Boot, title screen, navigation, HUD, real-time clock and day rollover.
import { S, save, resetSave, rollDay, timeOfDay, trend, priceOf } from './state.js';
import { PRODUCTS } from './data.js';
import { P, coinArt } from './art.js';
import { $, $$, h, openSheet, bump, sfx } from './ui.js';
import * as shop from './scenes/shop.js';
import * as workshop from './scenes/workshop.js';
import * as garden from './scenes/garden.js';

const scenes = { shop, workshop, garden };
let current = null;
let ready = false;

const api = {
  go,
  refreshHud,
  refreshShop: () => shop.refresh(),
  refreshWorkshop: () => workshop.refresh(),
};

function go(name) {
  if (current === name) return;
  if (current) scenes[current].leave();
  current = name;
  $$('.scene').forEach(s => s.classList.toggle('active', s.dataset.scene === name));
  $$('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.go === name));
  $('.nav-toggle').innerHTML = $('.tab[data-go="' + name + '"] svg').outerHTML;
  setNav(false);
  scenes[name].enter();
  try { sessionStorage.setItem('gg-scene', name); } catch (_) { /* ignore */ }
}

let hudTimer = 0;
function setHud(open) {
  $('.float-hud').classList.toggle('open', open);
  $('.hud-toggle').setAttribute('aria-expanded', open);
  clearTimeout(hudTimer);
  if (open) hudTimer = setTimeout(() => setHud(false), 5000);
}
function setNav(open) {
  $('.float-nav').classList.toggle('open', open);
  $('.nav-toggle').setAttribute('aria-expanded', open);
  $('.nav-scrim').classList.toggle('on', open);
}

function refreshHud(pulse = false) {
  $('.hud-toggle b').textContent = S.coins;
  if (pulse) bump($('.hud-toggle'));
}

function tickClock() {
  const d = new Date();
  $('.hud-time').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  $('.hud-day').textContent = `Day ${S.day.number} · ${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`;
  const tod = timeOfDay(d);
  if (document.body.dataset.tod !== tod) document.body.dataset.tod = tod;
  if (ready && rollDay()) newDaySheet();
}

// ---------------------------------------------------------------------------
function newDaySheet() {
  const t = trend();
  const y = S.lastDay;
  const body = h(`<div class="newday">
    <img class="newday-guinny" src="assets/img/guinny-apron.webp" alt="">
    <p>${y ? `Yesterday Guinny served <b>${y.served}</b> guests and earned <b>${y.earned}</b> coins.` : 'A brand new day at the shop!'}</p>
    <div class="trend-card"><div class="row-ico">${P(t)}</div><div><small>Today’s trend</small><b>★ ${PRODUCTS[t].name}</b><small>sells for ${priceOf(t)} coins today</small></div></div>
    <p class="muted">Check your lineup and prep goods in the 作業場 before opening.</p>
    <button class="btn-primary">Let’s go ♪</button>
  </div>`);
  const s = openSheet({ title: `Good ${greet()}!`, sub: `Day ${S.day.number}`, body });
  $('.btn-primary', body).addEventListener('click', () => { sfx('chime'); s.close(); });
}
const greet = () => ({ dawn: 'morning', day: new Date().getHours() < 12 ? 'morning' : 'afternoon', dusk: 'evening', night: 'evening' })[timeOfDay()];

function settingsSheet() {
  const body = h(`<div class="list">
    <div class="row"><div class="row-main"><b>Sound</b><small>Soft chimes and pops</small></div>
      <button class="btn-toggle ${S.settings.sound ? 'on' : ''}" data-set="sound">${S.settings.sound ? 'On' : 'Off'}</button></div>
    <div class="row"><div class="row-main"><b>Speedy garden</b><small>Prototype helper: flowers grow 10× faster</small></div>
      <button class="btn-toggle ${S.settings.speedy ? 'on' : ''}" data-set="speedy">${S.settings.speedy ? 'On' : 'Off'}</button></div>
    <div class="row"><div class="row-main"><b>How to play</b><small>Garden → 作業場 → Shop</small></div>
      <button class="btn-toggle" data-help>Read</button></div>
    <div class="row"><div class="row-main"><b>Start over</b><small>Erase this save on this device</small></div>
      <button class="btn-toggle danger" data-reset>Reset</button></div>
  </div>`);
  const s = openSheet({ title: 'Settings', body });
  body.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.set) {
      const k = b.dataset.set;
      S.settings[k] = !S.settings[k];
      b.classList.toggle('on', S.settings[k]); b.textContent = S.settings[k] ? 'On' : 'Off';
      save(); sfx('tap'); garden.refresh();
    } else if ('help' in b.dataset) { s.close(); setTimeout(helpSheet, 230); }
    else if ('reset' in b.dataset) {
      if (b.dataset.confirm) { resetSave(); location.reload(); }
      else { b.dataset.confirm = 1; b.textContent = 'Tap again'; }
    }
  });
}

function helpSheet() {
  openSheet({ title: 'How to play', body: `<div class="help">
    <div class="help-step"><b>1 · Garden</b><p>Tap an empty patch in a planter (or a pot) to plant seeds. Drag the watering can from the work bench over a planter to water it, and swipe across ripe plants to harvest. Plants grow in real time, even while you’re away. The bench iPad sells seeds and upgrades and holds Guinny’s Flower Encyclopedia.</p></div>
    <div class="help-step"><b>2 · 作業場</b><p>Turn flowers into tea and perfume at the workbench.</p></div>
    <div class="help-step"><b>3 · Shop</b><p>Tap the <b>iPad</b> to choose today’s menu (it shows on the board) or buy decor. When a customer orders, tap the <b>wrapping table</b>: arrange the bouquet, pack the bag, spray some perfume. Then hand over the bag and collect the coins.</p></div>
    <div class="help-step"><b>★ Trend</b><p>One item is popular each real day and sells for more. Decor adds charm ✿ for more visitors and tips.</p></div></div>` });
}

// ---------------------------------------------------------------------------
function boot() {
  $('.hud-toggle i').innerHTML = coinArt();
  $('.hud-toggle').addEventListener('click', () => { sfx('tap'); setHud(!$('.float-hud').classList.contains('open')); });
  $('.nav-toggle').addEventListener('click', () => { sfx('tap'); setNav(!$('.float-nav').classList.contains('open')); });
  $('.nav-scrim').addEventListener('click', () => setNav(false));
  for (const [name, mod] of Object.entries(scenes)) mod.mount($(`.scene[data-scene="${name}"]`), api);
  $$('.tab').forEach(t => t.addEventListener('click', () => { sfx('tap'); if (current === t.dataset.go) setNav(false); go(t.dataset.go); }));
  $('.hud-settings').addEventListener('click', () => { sfx('tap'); setHud(false); settingsSheet(); });

  refreshHud();
  tickClock();
  setInterval(tickClock, 1000 * 15);
  setInterval(() => { const now = Date.now(); for (const m of Object.values(scenes)) m.tick(now); }, 500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tickClock(); garden.refresh(); } });

  let last = 'shop';
  try { last = sessionStorage.getItem('gg-scene') || 'shop'; } catch (_) { /* ignore */ }

  const title = $('#title');
  const start = () => {
    sfx('chime');
    title.classList.add('gone');
    setTimeout(() => title.remove(), 600);
    $('#app').removeAttribute('inert');
    go(last in scenes ? last : 'shop');
    ready = true;
    if (rollDay()) { tickClock(); setTimeout(newDaySheet, 500); }
    else if (!S.started) {
      S.started = true; save();
      setTimeout(helpSheet, 500);
    }
  };
  $('.title-start', title).addEventListener('click', start);
}

boot();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
