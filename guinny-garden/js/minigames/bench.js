// Workbench mini-games on the OpenArt desk art (assets/img/bench), Momo-style:
// the stations sit side by side and the view slides between them (swipe or ‹ ›).
// Steps follow the real process in order: each station opens once the one before is done.
// Everything is hands-on: you pick things up and pour, hold the flame, turn the tap…
// (no text buttons). The instructions are written on a paper note on the desk.
//
// Perfume (alchemy set), as real perfumers do it:
//   1 Weigh petals · 2 Distill (boil petals in the alchemy flask) · 3 Separate (water separator)
//   4 Blend (oil drops into alcohol, swirl to mature) · 5 Bottle
// Loose-leaf tea (tea leaf rack), as tea makers do it:
//   1 Weigh leaves · 2 Wither · 3 Roll · 4 Oxidise · 5 Dry (pan-fire) · 6 Pack
import { ING } from '../data.js';
import { $, $$, h, sfx, bump } from '../ui.js';
import { F } from '../art.js';
import { holdButton, wait } from './shell.js';

const IMG = 'assets/img/bench/';
const img = (f, cls = '') => `<img class="wb-prop ${cls}" src="${IMG}${f}.webp" alt="" draggable="false">`;
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

// ---------------------------------------------------------------- hands-on helpers
// Pick something up: a copy of it follows the finger, tick() runs every frame while it is
// held (for pouring), end() runs when it is put down. The copy then floats back home.
function grab(src, { ghost, start, tick, end }) {
  src.classList.add('wb-grab');
  src.addEventListener('pointerdown', (e) => {
    if (src.dataset.busy || (start && start() === false)) return;
    e.preventDefault(); e.stopPropagation();
    try { src.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    const g = h(`<div class="wb-ghost">${typeof ghost === 'function' ? ghost() : ghost}</div>`);
    document.body.append(g);
    const d = { x: e.clientX, y: e.clientY, g };
    src.dataset.busy = '1'; src.classList.add('lifted'); sfx('tap');
    const place = (ev) => { d.x = ev.clientX; d.y = ev.clientY; g.style.left = `${d.x}px`; g.style.top = `${d.y}px`; };
    place(e);
    let last = performance.now(), raf = 0;
    const loop = (t) => { tick && tick(d, Math.max(0, Math.min(0.05, (t - last) / 1000))); last = t; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const mv = (ev) => { if (ev.pointerId === e.pointerId) place(ev); };
    const up = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      cancelAnimationFrame(raf);
      src.removeEventListener('pointermove', mv); src.removeEventListener('pointerup', up); src.removeEventListener('pointercancel', up);
      delete src.dataset.busy; src.classList.remove('lifted');
      const r = src.getBoundingClientRect();
      g.classList.add('back'); g.style.left = `${r.left + r.width / 2}px`; g.style.top = `${r.top + r.height * 0.6}px`;
      setTimeout(() => g.remove(), 280);
      end && end(d);
    };
    src.addEventListener('pointermove', mv); src.addEventListener('pointerup', up); src.addEventListener('pointercancel', up);
  });
}
// is the held thing over this element? (pad: extra margin as a fraction of its size)
const over = (d, el, pad = 0.1, top = 0, bottom = 1) => {
  const r = el.getBoundingClientRect(), px = r.width * pad, py = r.height * pad;
  return d.x > r.left - px && d.x < r.right + px && d.y > r.top + r.height * top - py && d.y < r.top + r.height * bottom + py;
};
// a soft pulsing ring that shows where your finger goes (instead of a label)
const spot = (x, y) => `<i class="wb-spot" style="left:${x}%;top:${y}%"></i>`;
// little bits falling from a scoop / jug into a container
function fall(into, html, x = 50) {
  const b = h(`<i class="wb-bit" style="left:${x + (Math.random() * 16 - 8)}%">${html}</i>`);
  into.append(b); setTimeout(() => b.remove(), 520);
}

// ---------------------------------------------------------------- shared stations
// Pick up the scoop from the jar and hold it over the scale pan: it tips and pours.
// Put it down to check the weight; pinch extra off the pan if you poured too much.
function weigh(st, recipe, kind) {
  const items = Object.entries(recipe.needs).map(([k, n]) => ({ name: ING(k).name.replace(/ Leaves$/, ''), k, target: n * 10 }));
  const TOL = 1, CAP = 8;
  const jar = kind === 'tea' ? 't-canister' : 'p-jar', scoop = kind === 'tea' ? 't-scoop' : 'p-scoop';
  return new Promise((resolve) => {
    let i = 0, w = 0, overs = 0, load = 0, frac = 0, busy = false; const scores = [];
    st.stage.innerHTML = `<div class="wb-pair">
        <div class="wb-src wb-canister">${img(jar)}${spot(50, 45)}</div>
        <div class="wb-scale">${img('p-scale')}<div class="wb-pile"></div><div class="wb-falls"></div></div>
      </div>
      <div class="wb-read"><b class="w-now">0</b> / <span class="w-target"></span> g<div class="wb-bar"><i class="wb-band"></i><i class="wb-fill"></i></div></div>
      <div class="wb-list"></div>`;
    const scale = $('.wb-scale', st.stage), pile = $('.wb-pile', st.stage), falls = $('.wb-falls', st.stage);
    const MAX = () => items[i].target * 1.6;
    const draw = () => {
      const it = items[Math.min(i, items.length - 1)];
      $('.w-now', st.stage).textContent = w;
      $('.w-target', st.stage).textContent = it.target;
      const band = $('.wb-band', st.stage);
      band.style.left = `${((it.target - TOL) / MAX()) * 100}%`; band.style.width = `${((TOL * 2) / MAX()) * 100}%`;
      $('.wb-fill', st.stage).style.width = `${Math.min(100, (w / MAX()) * 100)}%`;
      pile.style.transform = `translateX(-50%) scale(${w ? 0.35 + 0.65 * Math.min(1, w / it.target) : 0})`;
      pile.innerHTML = `${F(it.k)}${F(it.k)}${F(it.k)}`;
      pile.classList.toggle('wb-grab', w > 0);
      $('.wb-list', st.stage).innerHTML = items.map((x, n) => `<span class="${n < i ? 'done' : n === i ? 'now' : ''}"><i>${F(x.k)}</i>${x.name} ${x.target} g${n < i ? ' ✓' : ''}</span>`).join('');
    };
    const check = async () => {
      const it = items[i];
      if (!it) return;
      if (Math.abs(w - it.target) <= TOL) {
        busy = true; sfx('chime'); bump(scale);
        scores.push(Math.max(0.5, 1 - overs * 0.15)); i++; overs = 0;
        await wait(500);
        if (i >= items.length) { resolve(avg(scores)); return; }
        w = 0; busy = false; draw(); st.hint(`Now scoop ${items[i].name.toLowerCase()} onto the scale: ${items[i].target} g.`);
      } else if (w > it.target + TOL) { overs++; sfx('soft'); st.hint('A little too much! Pick a pinch off the scale pan and drop it back in the jar.'); }
      else if (w > 0) st.hint(`${it.target - w} g to go… scoop a little more.`);
    };
    grab($('.wb-canister', st.stage), {
      start: () => !busy && i < items.length,
      ghost: () => { load = CAP; frac = 0; return `<div class="wb-scoop">${img(scoop)}<div class="wb-scoop-heap">${F(items[i].k)}${F(items[i].k)}</div></div>`; },
      tick: (d, dt) => {
        const on = over(d, scale, 0.15, 0, 0.5) && load > 0;
        d.g.classList.toggle('tilt', on);
        if (!on) return;
        const it = items[i];
        frac += dt * (it.target - w > 4 ? 7 : 2.6);   // pours slower as you get close
        while (frac >= 1 && load > 0) {
          frac--; load--; w++; draw(); fall(falls, F(it.k));
          if (w % 2 === 0) sfx('tap');
        }
        const heap = $('.wb-scoop-heap', d.g); if (heap) heap.style.transform = `scale(${load / CAP})`;
        if (!load) d.g.classList.add('empty');
      },
      end: () => { frac = 0; check(); },
    });
    grab(pile, {
      start: () => !busy && w > 0,
      ghost: () => `<div class="wb-pinch">${F(items[i].k)}</div>`,
      end: (d) => {
        if (over(d, scale, 0, 0, 0.5)) return;   // put back on the pan
        w = Math.max(0, w - 1); sfx('soft'); draw(); check();
      },
    });
    st.hint(`Pick up the scoop from the jar and hold it over the scale pan to pour. ${items[0].name}: ${items[0].target} g.`);
    draw();
  });
}

// Press and hold the flame to heat; keep the temperature in the zone until the bar fills.
function heat(st, { prop, flame, doneText, progressLabel, need = 5, lo = 0.45, hi = 0.72, vial = false }) {
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pair">
        <div class="wb-heat-prop">${img(prop)}<div class="wb-steam"></div>${vial ? '<div class="wb-vial"><i></i></div>' : ''}
          <i class="wb-flame" style="left:${flame[0]}%;top:${flame[1]}%"></i>${spot(...flame)}</div>
        <div class="thermo"><div class="thermo-zone" style="bottom:${lo * 100}%;height:${(hi - lo) * 100}%"></div><div class="thermo-fill"></div></div>
      </div>
      <div class="wb-meters"><label>${progressLabel}<div class="meter"><i class="m-ok"></i></div></label><label>Scorched<div class="meter burn"><i class="m-burn"></i></div></label></div>`;
    let t = 0.15, ok = 0, burn = 0, held = false, done = false, last = performance.now();
    const prop$ = $('.wb-heat-prop', st.stage);
    prop$.classList.add('wb-grab');
    holdButton(prop$, { onTick: () => { held = true; }, onRelease: () => { held = false; } });
    const loop = async (now) => {
      if (done || !st.alive) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      t = Math.max(0, Math.min(1, t + (held ? 0.55 : -0.32) * dt));
      if (t >= lo && t <= hi) ok += dt / need;
      if (t > hi) burn += dt / 6;
      $('.thermo-fill', st.stage).style.height = `${t * 100}%`;
      $('.m-ok', st.stage).style.width = `${Math.min(1, ok) * 100}%`;
      $('.m-burn', st.stage).style.width = `${Math.min(1, burn) * 100}%`;
      $('.wb-steam', st.stage).style.opacity = t > lo ? Math.min(1, (t - lo) * 3) : 0;
      $('.wb-flame', st.stage).style.setProperty('--f', (0.35 + t * 0.9).toFixed(2));
      if (vial) $('.wb-vial i', st.stage).style.height = `${Math.min(1, ok) * 100}%`;
      st.stage.classList.toggle('too-hot', t > hi);
      if (ok >= 1) { done = true; sfx('chime'); st.hint(doneText); await wait(600); resolve(Math.max(0.4, 1 - burn * 1.2)); return; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

// Pick up the jug (beaker / tray of leaves) and hold it over the container to pour.
// Put it down between the two lines.
function pourInto(st, { prop, src, srcInner = '', color, doneText, lo = 0.8, hi = 0.92, bit }) {
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pour">
        <div class="wb-src wb-jug">${img(src)}<div class="wb-jug-in">${srcInner}</div>${spot(50, 45)}</div>
        <div class="wb-target">${img(prop)}<div class="wb-falls"></div></div>
        <div class="wb-gauge"><i class="wb-gfill" style="background:${color}"></i>
          <i class="wb-line" style="bottom:${lo * 100}%"></i><i class="wb-line" style="bottom:${hi * 100}%"></i></div>
      </div>`;
    let f = 0, spills = 0, done = false, acc = 0;
    const target = $('.wb-target', st.stage), falls = $('.wb-falls', st.stage);
    const draw = () => { $('.wb-gfill', st.stage).style.height = `${Math.min(1, f) * 100}%`; };
    grab($('.wb-jug', st.stage), {
      start: () => !done,
      ghost: `<div class="wb-jug-ghost">${img(src)}<div class="wb-jug-in">${srcInner}</div></div>`,
      tick: (d, dt) => {
        const on = over(d, target, 0.2, -0.4, 0.6);
        d.g.classList.toggle('tilt', on);
        if (!on) return;
        f += dt * (0.16 + f * 0.22); draw();
        acc += dt; if (acc > 0.12) { acc = 0; fall(falls, bit || `<b style="background:${color}"></b>`); }
      },
      end: async () => {
        if (done || f === 0) return;
        if (f > hi) { spills++; sfx('soft'); f = lo * 0.55; draw(); st.hint('Too much, it spilled over! Guinny tipped some back. Pour again and stop between the lines.'); return; }
        if (f >= lo) { done = true; sfx('chime'); st.hint(doneText); await wait(600); resolve(Math.max(0.5, 1 - Math.abs(f - (lo + hi) / 2) * 3 - spills * 0.2)); }
        else st.hint('Not full yet… pour a little more.');
      },
    });
    draw();
  });
}

// Draw circles on a prop (rolling leaves, swirling a beaker).
function circles(st, { prop, inner = '', turns = 3, text, doneText, onProgress }) {
  const NEED = Math.PI * 2 * turns;
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-circle">
        <svg class="mix-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,252,246,.7)" stroke-width="5"/>
          <circle class="mix-prog" cx="50" cy="50" r="46" fill="none" stroke="#AFC39B" stroke-width="5" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="289" transform="rotate(-90 50 50)"/></svg>
        ${img(prop)}<div class="wb-circle-inner">${inner}</div><div class="stir-dot"></div></div>`;
    st.hint(text);
    const wrap = $('.wb-circle', st.stage), prog = $('.mix-prog', st.stage), dot = $('.stir-dot', st.stage);
    let total = 0, lastA = null, done = false;
    const angleAt = (e) => { const r = wrap.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
    wrap.addEventListener('pointerdown', (e) => { e.stopPropagation(); wrap.setPointerCapture(e.pointerId); lastA = angleAt(e); });
    wrap.addEventListener('pointermove', async (e) => {
      if (lastA === null || done) return;
      const a = angleAt(e); let d = a - lastA;
      if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      total += Math.abs(d); lastA = a;
      const r = wrap.getBoundingClientRect();
      dot.style.left = `${e.clientX - r.left}px`; dot.style.top = `${e.clientY - r.top}px`;
      const t = Math.min(1, total / NEED);
      prog.setAttribute('stroke-dashoffset', 289 * (1 - t));
      onProgress && onProgress(t, st.stage);
      if (t >= 1 && !done) { done = true; sfx('chime'); st.hint(doneText); await wait(700); resolve(1); }
    });
    wrap.addEventListener('pointerup', () => { lastA = null; });
  });
}

// ---------------------------------------------------------------- perfume-only stations
// Water separator: oil floats on the flower water. Press and hold the tap to drain the
// water, let go when the line between them reaches the tap.
function separate(st, recipe) {
  const k = Object.keys(recipe.needs)[0];
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pair">
        <div class="wb-sep">${img('p-separator')}<div class="wb-drip"></div>${spot(58, 70)}</div>
        <div class="wb-gauge tall"><i class="wb-water"></i><i class="wb-oil" style="background:${ING(k).petal || '#F2D58A'}"></i><i class="wb-tapline"></i></div>
      </div>`;
    st.hint('The essential oil floats on the flower water. Press and hold the glass tap to drain the water, and let go just as the oil reaches it.');
    const OIL = 0.22; let water = 0.62, done = false;
    const draw = () => {
      $('.wb-water', st.stage).style.height = `${water * 100}%`;
      $('.wb-oil', st.stage).style.bottom = `${water * 100}%`;
      $('.wb-oil', st.stage).style.height = `${OIL * 100}%`;
    };
    const sep = $('.wb-sep', st.stage);
    sep.classList.add('wb-grab');
    holdButton(sep, {
      onTick: (dt) => { if (done) return; water = Math.max(-0.12, water - dt * 0.16); st.stage.classList.add('draining'); draw(); },
      onRelease: async () => {
        st.stage.classList.remove('draining');
        if (done) return;
        if (water < -0.04) { done = true; sfx('soft'); st.hint('Oops, a little oil went down the drain.'); await wait(700); resolve(0.55); return; }
        if (water <= 0.04) { done = true; sfx('chime'); st.hint('Pure essential oil ✿'); await wait(700); resolve(1 - Math.abs(water) * 6); return; }
        st.hint('Some water is still under the oil… hold the tap again.');
      },
    });
    draw();
  });
}

// Blend: pick up the dropper and hold it over the beaker (one drop at a time),
// then swirl so the scent can mature.
async function blend(st) {
  const target = 6 + Math.floor(Math.random() * 3);
  const dropScore = await new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pair">
        <div class="wb-src wb-dropper">${img('p-oilbottle')}${img('p-dropper', 'wb-dropper-rest')}${spot(50, 30)}</div>
        <div class="wb-beaker">${img('p-beaker')}<div class="wb-liquid"></div><div class="wb-drops"></div></div>
      </div>
      <div class="wb-read"><b class="d-now">0</b> / ${target} drops</div>`;
    st.hint(`Pick up the dropper and hold it over the beaker of alcohol. Lift it away after ${target} drops.`);
    let n = 0, acc = 0, done = false;
    const beaker = $('.wb-beaker', st.stage);
    grab($('.wb-dropper', st.stage), {
      start: () => !done,
      ghost: `<div class="wb-dropper-ghost">${img('p-dropper')}</div>`,
      tick: (d, dt) => {
        const on = over(d, beaker, 0.1, -0.5, 0.5);
        d.g.classList.toggle('tilt', on);
        if (!on) { acc = 0; return; }
        acc += dt;
        if (acc < 0.55) return;
        acc = 0; n++; sfx('water'); bump(beaker);
        $('.d-now', st.stage).textContent = n;
        const dr = h('<i class="wb-drop"></i>'); $('.wb-drops', st.stage).append(dr); setTimeout(() => dr.remove(), 600);
        $('.wb-liquid', st.stage).style.opacity = Math.min(1, 0.25 + (n / target) * 0.75);
      },
      end: async () => {
        if (done || !n) return;
        if (n < target) { st.hint(`${target - n} more drop${target - n === 1 ? '' : 's'}… hold the dropper over the beaker again.`); return; }
        done = true; sfx(n === target ? 'chime' : 'soft');
        st.hint(n === target ? 'Perfect amount ✿' : 'That’s a strong perfume…');
        await wait(700); resolve(Math.max(0.4, 1 - Math.abs(n - target) * 0.15));
      },
    });
  });
  await circles(st, { prop: 'p-beaker', inner: '<div class="wb-liquid swirl"></div>', turns: 3,
    text: 'Swirl the beaker in circles so the scent can blend and mature.', doneText: 'Blended and matured ✿',
    onProgress: (t, stage) => { $('.wb-liquid', stage).style.filter = `hue-rotate(${t * 40}deg) saturate(${1 + t})`; } });
  return (dropScore + 1) / 2;
}

// ---------------------------------------------------------------- tea-only stations
// Wither: brush your finger across the heaps to spread the leaves thin.
function wither(st, recipe) {
  const ks = Object.keys(recipe.needs);
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-tray">${img('t-tray')}<div class="wb-leaves">${Array.from({ length: 5 }, (_, i) =>
      `<div class="wb-heap" data-i="${i}" style="--x:${[30, 62, 46, 24, 68][i]}%;--y:${[34, 30, 52, 62, 62][i]}%">${F(ks[i % ks.length])}${F(ks[i % ks.length])}${F(ks[i % ks.length])}</div>`).join('')}</div></div>
      <div class="wb-meters"><label>Withered<div class="meter"><i class="m-ok"></i></div></label></div>`;
    st.hint('Brush your finger across each heap to spread the leaves thin. They soften as they rest.');
    const t0 = Date.now(); let spread = 0, down = false;
    const tray = $('.wb-tray', st.stage);
    tray.classList.add('wb-grab');
    const brush = async (x, y) => {
      const b = document.elementsFromPoint(x, y).map((e) => e.closest && e.closest('.wb-heap')).find(Boolean);
      if (!b || b.classList.contains('spread') || !tray.contains(b)) return;
      b.classList.add('spread'); spread++; sfx('pop');
      if (spread < 5) return;
      st.hint('Now let them wither…');
      for (let p = 0; p <= 1.001; p += 0.05) { $('.m-ok', st.stage).style.width = `${p * 100}%`; $('.wb-leaves', st.stage).style.filter = `saturate(${1 - p * 0.35}) brightness(${1 - p * 0.08})`; await wait(90); }
      sfx('chime'); st.hint('Soft and limp — ready to roll ✿'); await wait(500);
      const secs = (Date.now() - t0) / 1000; resolve(secs < 12 ? 1 : secs < 25 ? 0.8 : 0.65);
    };
    tray.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); down = true; try { tray.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } brush(e.clientX, e.clientY); });
    tray.addEventListener('pointermove', (e) => { if (down) brush(e.clientX, e.clientY); });
    tray.addEventListener('pointerup', () => { down = false; });
    tray.addEventListener('pointercancel', () => { down = false; });
  });
}

// Oxidise: the leaves slowly turn from green to amber. Lift them out of the basket
// (drag them out) when the colour is just right.
function oxidise(st) {
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-basket">${img('t-basket')}<div class="wb-ox"></div>${spot(45, 45)}</div>
      <div class="wb-oxbar"><i class="wb-oxzone"></i><i class="wb-oxmark"></i></div>`;
    st.hint('The leaves turn from green to amber as they rest. When the marker is in the amber band, lift the leaves out of the basket.');
    const LO = 0.58, HI = 0.74; let t = 0, done = false, last = performance.now(), tries = 0;
    $('.wb-oxzone', st.stage).style.cssText = `left:${LO * 100}%;width:${(HI - LO) * 100}%`;
    const colour = () => `hsl(${95 - t * 70} ${45 - t * 10}% ${48 - t * 18}%)`;
    const loop = (now) => {
      if (done || !st.alive) return;
      t += ((now - last) / 1000) / 7; last = now;
      if (t > 1) { t = 0; tries++; st.hint('Over-oxidised! A fresh batch — try again.'); }
      $('.wb-oxmark', st.stage).style.left = `${t * 100}%`;
      $('.wb-ox', st.stage).style.background = colour();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    const basket = $('.wb-basket', st.stage);
    grab(basket, {
      start: () => !done,
      ghost: () => `<div class="wb-handful" style="background:${colour()}"></div>`,
      end: async (d) => {
        if (done || over(d, basket, -0.1)) return;   // still in the basket
        if (t >= LO && t <= HI) { done = true; sfx('chime'); st.hint('Lovely amber ✿'); await wait(600); resolve(Math.max(0.5, 1 - tries * 0.2)); }
        else { sfx('soft'); st.hint(t < LO ? 'Still too green — put them back and wait a little.' : 'Too dark!'); }
      },
    });
  });
}

// ---------------------------------------------------------------- the scrolling bench
export const PERFUME_STEPS = ['Weigh', 'Distill', 'Separate', 'Blend', 'Bottle'];
export const TEA_STEPS = ['Weigh', 'Wither', 'Roll', 'Oxidise', 'Dry', 'Pack'];

const PERFUME = [
  { title: 'Weigh the petals', run: (st, r) => weigh(st, r, 'perfume') },
  { title: 'Distill the essence', run: (st) => heat(st, { prop: 'p-still', flame: [25, 82], vial: true, progressLabel: 'Essence collected',
      doneText: 'The vial is full of fragrant distillate ✿', need: 6 }).then((s) => { st.hint(''); return s; }), intro: 'Press and hold the little flame to boil the petals gently. Keep the heat in the green zone so the steam carries the essence into the vial.' },
  { title: 'Separate oil & water', run: (st, r) => separate(st, r) },
  { title: 'Blend & mature', run: (st) => blend(st) },
  { title: 'Bottle the perfume', run: (st, r) => pourInto(st, { prop: 'p-bottle', src: 'p-beaker', srcInner: `<i class="wb-jug-liquid" style="background:${r.color}"></i>`, color: r.color, doneText: 'Bottled ✿' }),
    intro: 'Pick up the beaker and hold it over the bottle to pour. Put it down when the perfume is between the two lines.' },
];
const TEA = [
  { title: 'Weigh the leaves', run: (st, r) => weigh(st, r, 'tea') },
  { title: 'Wither', run: (st, r) => wither(st, r) },
  { title: 'Roll', run: (st, r) => circles(st, { prop: 't-mat', turns: 3, inner: Object.keys(r.needs).map((k) => F(k)).join(''),
      text: 'Draw circles to roll the leaves: it bruises them so their flavour comes out.', doneText: 'Tightly rolled ✿',
      onProgress: (t, stage) => { $('.wb-circle-inner', stage).style.transform = `rotate(${t * 540}deg) scale(${1 - t * 0.45})`; } }) },
  { title: 'Oxidise', run: (st) => oxidise(st) },
  { title: 'Pan-fire dry', run: (st) => heat(st, { prop: 't-pan', flame: [47, 82], progressLabel: 'Dried', doneText: 'Crisp and fragrant ✿', need: 5 }),
    intro: 'Press and hold the fire under the pan. Keep it in the green zone to dry the leaves without scorching them.' },
  { title: 'Pack the tin', run: (st, r) => pourInto(st, { prop: 't-tin', src: 't-tray', srcInner: Object.keys(r.needs).map((k) => F(k) + F(k)).join(''), bit: F(Object.keys(r.needs)[0]), color: r.color, doneText: 'Packed ✿' }),
    intro: 'Pick up the tray of dried tea and hold it over the tin to pour. Put it down when the tin is filled between the two lines.' },
];

export function workbench(g, recipe, kind) {
  const STATIONS = kind === 'tea' ? TEA : PERFUME;
  const N = STATIONS.length;
  g.el.classList.add('mg-bench', 'mg-wb');
  let at = 0;
  const done = Array(N).fill(false), started = Array(N).fill(false), scores = [], hints = Array(N).fill('');
  return new Promise((resolve) => {
    g.stage.innerHTML = `
      <div class="wb-view" data-kind="${kind}">
        <div class="pb-strip">${STATIONS.map((s, i) => `
          <section class="pb-station wb-station" data-i="${i}">
            <div class="pb-plaque">STEP ${i + 1}/${N} · ${s.title}</div>
            <div class="wb-note" role="status"></div>
            <div class="pb-work wb-work"></div>
            <div class="wb-locked">Finish step ${i} first</div>
            <div class="pb-done">✓ Done</div>
          </section>`).join('')}</div>
        <button class="btn-round pb-prev" aria-label="Previous step">‹</button>
        <button class="btn-round pb-next" aria-label="Next step">›</button>
        <div class="pb-dots">${STATIONS.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>
      </div>`;
    const view = $('.wb-view', g.stage), strip = $('.pb-strip', g.stage), stations = $$('.pb-station', strip);
    const markSteps = () => $$('.mg-steps span', g.el).forEach((s) => {
      const n = +s.dataset.s; s.className = done[n] ? 'done' : n === at ? 'now' : '';
      s.querySelector('i').textContent = done[n] ? '✓' : n + 1;
    });
    const sub = (i) => ({ el: g.el, get alive() { return g.alive; }, stage: $('.wb-work', stations[i]),
      hint: (t) => { hints[i] = t; note(i); } });
    // instructions are written on a little paper note on the desk, under each station's sign
    const note = (i) => {
      const el = $('.wb-note', stations[i]);
      const t = done[i] ? (i < N - 1 ? 'Done! Swipe or tap › for the next step.' : (kind === 'tea' ? 'The tea is ready ✿' : 'The perfume is ready ✿'))
        : started[i] ? hints[i] : `Finish step ${i} first.`;
      el.textContent = t; el.hidden = !t;
    };
    const start = (i) => {
      if (started[i] || i >= N) return;
      started[i] = true; stations[i].classList.add('open');
      const st = sub(i);
      if (STATIONS[i].intro) st.hint(STATIONS[i].intro);
      STATIONS[i].run(st, recipe).then((s) => finish(i, s));
    };
    const show = () => {
      strip.style.transition = 'transform .35s cubic-bezier(.25, 1.1, .4, 1)';
      strip.style.transform = `translateX(${-at * 100}%)`;
      $('.pb-prev', view).disabled = at === 0;
      $('.pb-next', view).disabled = at === N - 1;
      $('.pb-next', view).classList.toggle('pulse', done[at] && at < N - 1);
      $$('.pb-dots i', view).forEach((d, i) => { d.className = `${i === at ? 'on' : ''} ${done[i] ? 'ok' : ''}`; });
      markSteps();
      stations.forEach((_, i) => note(i));
    };
    const go = (i) => { i = Math.max(0, Math.min(N - 1, i)); if (i !== at) { at = i; sfx('tap'); } show(); };
    $('.pb-prev', view).addEventListener('click', () => go(at - 1));
    $('.pb-next', view).addEventListener('click', () => go(at + 1));
    view.addEventListener('scroll', () => { view.scrollLeft = 0; view.scrollTop = 0; });
    stations.forEach((el) => el.addEventListener('scroll', () => { el.scrollLeft = 0; el.scrollTop = 0; }));
    let pan = null;
    view.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, .wb-circle, .wb-grab')) return;
      pan = { x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, id: e.pointerId };
    });
    view.addEventListener('pointermove', (e) => {
      if (!pan || e.pointerId !== pan.id) return;
      const dx = e.clientX - pan.x0;
      if (!pan.moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - pan.y0)) { pan.moved = true; view.setPointerCapture(e.pointerId); }
      if (!pan.moved) return;
      const off = (at === 0 && dx > 0) || (at === N - 1 && dx < 0) ? dx * 0.35 : dx;
      strip.style.transition = 'none'; strip.style.transform = `translateX(calc(${-at * 100}% + ${off}px))`;
    });
    view.addEventListener('pointerup', (e) => {
      if (!pan) return; const p = pan; pan = null; if (!p.moved) return;
      const dx = e.clientX - p.x0, v = dx / Math.max(1, performance.now() - p.t0), w = view.clientWidth;
      go(dx < -w * 0.18 || v < -0.45 ? at + 1 : dx > w * 0.18 || v > 0.45 ? at - 1 : at);
    });
    view.addEventListener('pointercancel', () => { pan = null; show(); });

    const finish = async (i, s) => {
      done[i] = true; scores[i] = s; stations[i].classList.add('is-done'); sfx('chime');
      start(i + 1);
      show();
      if (done.every(Boolean)) { await wait(900); resolve(avg(scores)); }
    };
    start(0);
    show();
  });
}
