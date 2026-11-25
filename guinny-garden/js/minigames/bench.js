// Workbench mini-games on the OpenArt desk art (assets/img/bench), Momo-style:
// the stations sit side by side and the view slides between them (swipe or ‹ ›).
// Steps follow the real process in order: each station opens once the one before is done.
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

// ---------------------------------------------------------------- shared stations
// Scoop from a canister onto the scale until each ingredient reaches its target weight.
function weigh(st, recipe, canister, extra = []) {
  const items = [...Object.entries(recipe.needs).map(([k, n]) => ({ name: ING(k).name.replace(/ Leaves$/, ''), k, target: n * 10 })), ...extra];
  const TOL = 1;
  return new Promise((resolve) => {
    let i = 0, w = 0, overs = 0; const scores = [];
    st.stage.innerHTML = `<div class="wb-pair">
        <button class="wb-tap wb-canister" aria-label="Scoop">${img(canister)}<span class="wb-tag">Tap to scoop</span></button>
        <div class="wb-scale">${img('p-scale')}<div class="wb-pile"></div><div class="wb-fly"></div></div>
      </div>
      <div class="wb-read"><b class="w-now">0</b> / <span class="w-target"></span> g<div class="wb-bar"><i class="wb-band"></i><i class="wb-fill"></i></div></div>
      <div class="wb-list"></div>
      <div class="wb-btns"><button class="btn-toggle wb-pinch">Pinch +1 g</button><button class="btn-toggle wb-out">Take out −1 g</button></div>`;
    const MAX = () => items[i].target * 1.6;
    const draw = () => {
      const it = items[i];
      $('.w-now', st.stage).textContent = w;
      $('.w-target', st.stage).textContent = it.target;
      const band = $('.wb-band', st.stage);
      band.style.left = `${((it.target - TOL) / MAX()) * 100}%`; band.style.width = `${((TOL * 2) / MAX()) * 100}%`;
      $('.wb-fill', st.stage).style.width = `${Math.min(100, (w / MAX()) * 100)}%`;
      $('.wb-pile', st.stage).style.transform = `translateX(-50%) scale(${Math.min(1, w / it.target)})`;
      $('.wb-pile', st.stage).innerHTML = it.k ? `${F(it.k)}${F(it.k)}${F(it.k)}` : '';
      $('.wb-list', st.stage).innerHTML = items.map((x, n) => `<span class="${n < i ? 'done' : n === i ? 'now' : ''}">${x.k ? `<i>${F(x.k)}</i>` : ''}${x.name} ${x.target} g${n < i ? ' ✓' : ''}</span>`).join('');
      $('.wb-out', st.stage).disabled = w <= 0;
    };
    const check = async () => {
      const it = items[i];
      if (Math.abs(w - it.target) <= TOL) {
        sfx('chime'); bump($('.wb-scale', st.stage));
        scores.push(Math.max(0.5, 1 - overs * 0.15)); i++; overs = 0;
        await wait(450);
        if (i >= items.length) { resolve(avg(scores)); return; }
        w = 0; draw(); st.hint(`Now scoop ${items[i].name.toLowerCase()} to ${items[i].target} g.`);
      } else if (w > it.target + TOL) { overs++; sfx('soft'); st.hint('A little too much — take some out.'); }
      else st.hint(`${it.target - w} g to go…`);
    };
    const add = (n) => { if (i >= items.length) return; w = Math.max(0, w + n); draw(); check(); };
    $('.wb-canister', st.stage).addEventListener('click', (e) => {
      sfx('pop'); bump(e.currentTarget);
      const fly = $('.wb-fly', st.stage); fly.classList.remove('go'); void fly.offsetWidth; fly.classList.add('go');
      add(4 + Math.floor(Math.random() * 3));
    });
    $('.wb-pinch', st.stage).addEventListener('click', () => { sfx('tap'); add(1); });
    $('.wb-out', st.stage).addEventListener('click', () => { sfx('tap'); add(-1); });
    st.hint(`Tap the canister to scoop ${items[0].name.toLowerCase()} onto the scale: ${items[0].target} g.`);
    draw();
  });
}

// Hold to heat; keep the temperature in the zone until the progress bar fills.
function heat(st, { prop, label, doneText, progressLabel, need = 5, lo = 0.45, hi = 0.72, vial = false }) {
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pair">
        <div class="wb-heat-prop">${img(prop)}<div class="wb-steam"></div>${vial ? '<div class="wb-vial"><i></i></div>' : ''}</div>
        <div class="thermo"><div class="thermo-zone" style="bottom:${lo * 100}%;height:${(hi - lo) * 100}%"></div><div class="thermo-fill"></div></div>
      </div>
      <div class="wb-meters"><label>${progressLabel}<div class="meter"><i class="m-ok"></i></div></label><label>Scorched<div class="meter burn"><i class="m-burn"></i></div></label></div>
      <button class="btn-primary wb-hold">${label}</button>`;
    let t = 0.15, ok = 0, burn = 0, held = false, done = false, last = performance.now();
    holdButton($('.wb-hold', st.stage), { onTick: () => { held = true; }, onRelease: () => { held = false; } });
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
      if (vial) $('.wb-vial i', st.stage).style.height = `${Math.min(1, ok) * 100}%`;
      st.stage.classList.toggle('too-hot', t > hi);
      if (ok >= 1) { done = true; sfx('chime'); st.hint(doneText); await wait(600); resolve(Math.max(0.4, 1 - burn * 1.2)); return; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

// Hold to pour into a container; let go between the two lines.
function pourInto(st, { prop, color, label, doneText, lo = 0.8, hi = 0.92 }) {
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pour">${img(prop)}<div class="wb-gauge"><i class="wb-gfill" style="background:${color}"></i>
        <i class="wb-line" style="bottom:${lo * 100}%"></i><i class="wb-line" style="bottom:${hi * 100}%"></i></div></div>
      <button class="btn-primary wb-hold">${label}</button><button class="btn-toggle wb-undo hidden">Tip some back</button>`;
    let f = 0, spills = 0;
    const btn = $('.wb-hold', st.stage), undo = $('.wb-undo', st.stage);
    const draw = () => { $('.wb-gfill', st.stage).style.height = `${Math.min(1, f) * 100}%`; };
    holdButton(btn, {
      onTick: (dt) => { f += dt * (0.18 + f * 0.25); st.stage.classList.add('pouring'); draw(); },
      onRelease: async () => {
        st.stage.classList.remove('pouring');
        if (f > hi) { spills++; sfx('soft'); st.hint('Too much! Tip some back and try again.'); btn.disabled = true; undo.classList.remove('hidden'); return; }
        if (f >= lo) { sfx('chime'); st.hint(doneText); await wait(600); resolve(Math.max(0.5, 1 - Math.abs(f - (lo + hi) / 2) * 3 - spills * 0.2)); }
        else st.hint('Not quite there… hold again.');
      },
    });
    undo.addEventListener('click', () => { f = 0.5; draw(); undo.classList.add('hidden'); btn.disabled = false; sfx('tap'); });
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
// Water separator: oil floats on the flower water. Hold the tap to drain the water,
// let go when the line between them reaches the tap.
function separate(st, recipe) {
  const k = Object.keys(recipe.needs)[0];
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pair">
        <div class="wb-sep">${img('p-separator')}<div class="wb-drip"></div></div>
        <div class="wb-gauge tall"><i class="wb-water"></i><i class="wb-oil" style="background:${ING(k).petal || '#F2D58A'}"></i><i class="wb-tapline"></i></div>
      </div>
      <button class="btn-primary wb-hold">Hold to open the tap</button>`;
    st.hint('The essential oil floats on the flower water. Drain the water, and close the tap just as the oil reaches it.');
    const OIL = 0.22; let water = 0.62, done = false;
    const draw = () => {
      $('.wb-water', st.stage).style.height = `${water * 100}%`;
      $('.wb-oil', st.stage).style.bottom = `${water * 100}%`;
      $('.wb-oil', st.stage).style.height = `${OIL * 100}%`;
    };
    holdButton($('.wb-hold', st.stage), {
      onTick: (dt) => { water = Math.max(-0.12, water - dt * 0.16); st.stage.classList.add('draining'); draw(); },
      onRelease: async () => {
        st.stage.classList.remove('draining');
        if (done) return;
        if (water < -0.04) { done = true; sfx('soft'); st.hint('Oops, a little oil went down the drain.'); await wait(700); resolve(0.55); return; }
        if (water <= 0.04) { done = true; sfx('chime'); st.hint('Pure essential oil ✿'); await wait(700); resolve(1 - Math.abs(water) * 6); return; }
        st.hint('Some water is still under the oil… keep draining.');
      },
    });
    draw();
  });
}

// Blend: drop the essential oil into the alcohol, then swirl so it can mature.
async function blend(st) {
  const target = 6 + Math.floor(Math.random() * 3);
  const dropScore = await new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-pair">
        <button class="wb-tap wb-dropper" aria-label="Add a drop">${img('p-oil')}<span class="wb-tag">Tap for a drop</span></button>
        <div class="wb-beaker">${img('p-beaker')}<div class="wb-liquid"></div><div class="wb-drops"></div></div>
      </div>
      <div class="wb-read"><b class="d-now">0</b> / ${target} drops</div>
      <button class="btn-toggle wb-done-drops" disabled>That’s enough</button>`;
    st.hint(`Add ${target} drops of essential oil to the alcohol.`);
    let n = 0;
    $('.wb-dropper', st.stage).addEventListener('click', (e) => {
      n++; sfx('water'); bump(e.currentTarget);
      $('.d-now', st.stage).textContent = n;
      const d = h('<i class="wb-drop"></i>'); $('.wb-drops', st.stage).append(d); setTimeout(() => d.remove(), 600);
      $('.wb-liquid', st.stage).style.opacity = Math.min(1, 0.25 + n / target * 0.75);
      $('.wb-done-drops', st.stage).disabled = n < 1;
      if (n === target) st.hint('Perfect amount — tap “That’s enough”.');
      if (n > target) st.hint('That’s a strong perfume…');
    });
    $('.wb-done-drops', st.stage).addEventListener('click', () => { sfx('tap'); resolve(Math.max(0.4, 1 - Math.abs(n - target) * 0.15)); });
  });
  await circles(st, { prop: 'p-beaker', inner: '<div class="wb-liquid swirl"></div>', turns: 3,
    text: 'Swirl the beaker in circles so the scent can blend and mature.', doneText: 'Blended and matured ✿',
    onProgress: (t, stage) => { $('.wb-liquid', stage).style.filter = `hue-rotate(${t * 40}deg) saturate(${1 + t})`; } });
  return (dropScore + 1) / 2;
}

// ---------------------------------------------------------------- tea-only stations
// Wither: spread the leaves thinly on the tray so they soften evenly.
function wither(st, recipe) {
  const ks = Object.keys(recipe.needs);
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-tray">${img('t-tray')}<div class="wb-leaves">${Array.from({ length: 5 }, (_, i) =>
      `<button class="wb-heap" data-i="${i}" style="--x:${[30, 62, 46, 24, 68][i]}%;--y:${[34, 30, 52, 62, 62][i]}%">${F(ks[i % ks.length])}${F(ks[i % ks.length])}${F(ks[i % ks.length])}</button>`).join('')}</div></div>
      <div class="wb-meters"><label>Withered<div class="meter"><i class="m-ok"></i></div></label></div>`;
    st.hint('Tap each heap to spread the leaves thin. They soften as they rest.');
    const t0 = Date.now(); let spread = 0;
    st.stage.addEventListener('click', async (e) => {
      const b = e.target.closest('.wb-heap'); if (!b || b.classList.contains('spread')) return;
      b.classList.add('spread'); spread++; sfx('pop');
      if (spread < 5) return;
      st.hint('Now let them wither…');
      for (let p = 0; p <= 1.001; p += 0.05) { $('.m-ok', st.stage).style.width = `${p * 100}%`; $('.wb-leaves', st.stage).style.filter = `saturate(${1 - p * 0.35}) brightness(${1 - p * 0.08})`; await wait(90); }
      sfx('chime'); st.hint('Soft and limp — ready to roll ✿'); await wait(500);
      const secs = (Date.now() - t0) / 1000; resolve(secs < 12 ? 1 : secs < 25 ? 0.8 : 0.65);
    });
  });
}

// Oxidise: the leaves slowly turn from green to amber. Tap Stop when the colour is just right.
function oxidise(st) {
  return new Promise((resolve) => {
    st.stage.innerHTML = `<div class="wb-basket">${img('t-basket')}<div class="wb-ox"></div></div>
      <div class="wb-oxbar"><i class="wb-oxzone"></i><i class="wb-oxmark"></i></div>
      <button class="btn-primary wb-stop">Stop oxidising</button>`;
    st.hint('The leaves turn from green to amber as they rest. Stop when the marker is in the amber band.');
    const LO = 0.58, HI = 0.74; let t = 0, done = false, last = performance.now(), tries = 0;
    $('.wb-oxzone', st.stage).style.cssText = `left:${LO * 100}%;width:${(HI - LO) * 100}%`;
    const loop = (now) => {
      if (done || !st.alive) return;
      t += ((now - last) / 1000) / 7; last = now;
      if (t > 1) { t = 0; tries++; st.hint('Over-oxidised! A fresh batch — try again.'); }
      $('.wb-oxmark', st.stage).style.left = `${t * 100}%`;
      $('.wb-ox', st.stage).style.background = `hsl(${95 - t * 70} ${45 - t * 10}% ${48 - t * 18}%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    $('.wb-stop', st.stage).addEventListener('click', async () => {
      if (done) return;
      if (t >= LO && t <= HI) { done = true; sfx('chime'); st.hint('Lovely amber ✿'); await wait(600); resolve(Math.max(0.5, 1 - tries * 0.2)); }
      else { sfx('soft'); st.hint(t < LO ? 'Still too green — wait a little.' : 'Too dark!'); }
    });
  });
}

// ---------------------------------------------------------------- the scrolling bench
export const PERFUME_STEPS = ['Weigh', 'Distill', 'Separate', 'Blend', 'Bottle'];
export const TEA_STEPS = ['Weigh', 'Wither', 'Roll', 'Oxidise', 'Dry', 'Pack'];

const PERFUME = [
  { title: 'Weigh the petals', run: (st, r) => weigh(st, r, 'p-canister') },
  { title: 'Distill the essence', run: (st) => heat(st, { prop: 'p-still', vial: true, label: 'Hold to heat the flask', progressLabel: 'Essence collected',
      doneText: 'The vial is full of fragrant distillate ✿', need: 6 }).then((s) => { st.hint(''); return s; }), intro: 'Boil the petals gently: keep the heat in the green zone so the steam carries the essence into the vial.' },
  { title: 'Separate oil & water', run: (st, r) => separate(st, r) },
  { title: 'Blend & mature', run: (st) => blend(st) },
  { title: 'Bottle the perfume', run: (st, r) => pourInto(st, { prop: 'p-bottle', color: r.color, label: 'Hold to pour', doneText: 'Bottled ✿' }),
    intro: 'Hold to pour the perfume through the funnel. Stop between the two lines.' },
];
const TEA = [
  { title: 'Weigh the leaves', run: (st, r) => weigh(st, r, 't-canister') },
  { title: 'Wither', run: (st, r) => wither(st, r) },
  { title: 'Roll', run: (st, r) => circles(st, { prop: 't-mat', turns: 3, inner: Object.keys(r.needs).map((k) => F(k)).join(''),
      text: 'Draw circles to roll the leaves: it bruises them so their flavour comes out.', doneText: 'Tightly rolled ✿',
      onProgress: (t, stage) => { $('.wb-circle-inner', stage).style.transform = `rotate(${t * 540}deg) scale(${1 - t * 0.45})`; } }) },
  { title: 'Oxidise', run: (st) => oxidise(st) },
  { title: 'Pan-fire dry', run: (st) => heat(st, { prop: 't-pan', label: 'Hold to heat the pan', progressLabel: 'Dried', doneText: 'Crisp and fragrant ✿', need: 5 }),
    intro: 'Keep the pan in the green zone to dry the leaves without scorching them.' },
  { title: 'Pack the tin', run: (st, r) => pourInto(st, { prop: 't-tin', color: r.color, label: 'Hold to pour', doneText: 'Packed ✿' }),
    intro: 'Pour the tea into the tin. Stop between the two lines.' },
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
      hint: (t) => { hints[i] = t; if (i === at) g.hint(t); } });
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
      g.hint(done[at] ? (at < N - 1 ? 'Done! Swipe or tap › for the next step.' : '') : started[at] ? hints[at] : `Finish step ${at} first.`);
    };
    const go = (i) => { i = Math.max(0, Math.min(N - 1, i)); if (i !== at) { at = i; sfx('tap'); } show(); };
    $('.pb-prev', view).addEventListener('click', () => go(at - 1));
    $('.pb-next', view).addEventListener('click', () => go(at + 1));
    view.addEventListener('scroll', () => { view.scrollLeft = 0; view.scrollTop = 0; });
    stations.forEach((el) => el.addEventListener('scroll', () => { el.scrollLeft = 0; el.scrollTop = 0; }));
    let pan = null;
    view.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, .wb-circle')) return;
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
      if (done.every(Boolean)) { g.hint(kind === 'tea' ? 'The tea is ready ✿' : 'The perfume is ready ✿'); await wait(900); resolve(avg(scores)); }
    };
    start(0);
    show();
  });
}
