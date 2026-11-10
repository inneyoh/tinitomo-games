// Perfume making as one scrolling alchemy bench, like the kitchen in Momo's Ramen Shop:
// three stations sit side by side and the view slides between them. Swipe on the bench
// (or tap ‹ ›) to move; stations can be done in any order. When all three are done, the
// perfume is finished.
//   1. Scoop & weigh  — tap the jar to scoop petals onto the scale until it reads the target
//   2. Separate       — water-sort the extracted essences (sortPhase)
//   3. Grind & mix    — circle the pestle to grind, then stir the flask (mixPhase)
import { FLOWERS } from '../data.js';
import { $, $$, h, sfx, bump } from '../ui.js';
import { F, dropArt } from '../art.js';
import { wait } from './shell.js';
import { sortPhase, mixPhase } from './perfume.js';

export const BENCH_STEPS = ['Scoop & weigh', 'Separate', 'Grind & mix'];
const TITLES = ['Scoop & weigh the petals', 'Separate the essences', 'Grind & mix'];

// mark the step chips in the mini-game header without replacing the stage
function markSteps(g, done, at) {
  $$('.mg-steps span', g.el).forEach((s) => {
    const n = +s.dataset.s;
    s.className = done[n] ? 'done' : n === at ? 'now' : '';
    s.querySelector('i').textContent = done[n] ? '✓' : n + 1;
  });
}

// ------------------------------------------------------------ 1. Scoop & weigh
function scoopPhase(st, recipe) {
  const items = [
    ...Object.entries(recipe.needs).map(([k, n]) => ({ name: `${FLOWERS[k].name} petals`, icon: F(k), color: FLOWERS[k].petal, target: n * 10 })),
    { name: 'Spring water', icon: dropArt(), color: '#BFD9EA', target: 25 },
  ];
  const MAX = 60, TOL = 1;
  return new Promise((resolve) => {
    let i = 0, w = 0, overs = 0, scores = [];
    st.stage.innerHTML = `
      <div class="pb-weigh">
        <div class="scale">
          <svg class="dial" viewBox="0 0 200 120" aria-hidden="true">
            <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="#E9DCC5" stroke-width="18" stroke-linecap="round"/>
            <path class="dial-zone" fill="none" stroke="#AFC39B" stroke-width="18"/>
            <line class="needle" x1="100" y1="110" x2="100" y2="40" stroke="#6B4A36" stroke-width="5" stroke-linecap="round"/>
            <circle cx="100" cy="110" r="9" fill="#6B4A36"/>
          </svg>
          <div class="scale-read"><b class="w-now">0</b> / <span class="w-target"></span> g</div>
          <div class="scale-pan"><div class="pan-pile"></div></div>
        </div>
        <div class="pb-side">
          <div class="weigh-list"></div>
          <button class="pb-jar" aria-label="Scoop"><i class="pb-jar-ico"></i><span>Tap to scoop<small>about 5 g</small></span></button>
          <div class="pb-fine">
            <button class="btn-toggle pb-pinch">Pinch +1 g</button>
            <button class="btn-toggle pb-out">Take out −1 g</button>
          </div>
        </div>
      </div>`;
    const needle = $('.needle', st.stage), zone = $('.dial-zone', st.stage), pile = $('.pan-pile', st.stage);
    const ang = (v) => -90 + (Math.min(v, MAX) / MAX) * 180;
    const arc = (a0, a1) => {
      const p = (a) => [100 + 80 * Math.cos(((a - 90) * Math.PI) / 180), 110 + 80 * Math.sin(((a - 90) * Math.PI) / 180)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${x0} ${y0} A80 80 0 0 1 ${x1} ${y1}`;
    };
    const drawList = () => {
      $('.weigh-list', st.stage).innerHTML = items.map((it, n) => `<div class="weigh-item ${n < i ? 'done' : n === i ? 'now' : ''}">
        <i>${it.icon}</i><span>${it.name}<small>${it.target} g</small></span>${n < i ? '✓' : ''}</div>`).join('');
    };
    const draw = () => {
      needle.style.transition = 'transform .25s cubic-bezier(.3, 1.6, .5, 1)';
      needle.setAttribute('transform', `rotate(${ang(w)} 100 110)`);
      $('.w-now', st.stage).textContent = w;
      pile.style.height = `${Math.min(100, (w / MAX) * 100)}%`;
      $('.pb-out', st.stage).disabled = w <= 0;
    };
    const setUp = () => {
      const it = items[i];
      w = 0; overs = 0;
      $('.w-target', st.stage).textContent = it.target;
      zone.setAttribute('d', arc(ang(it.target - TOL) + 90, ang(it.target + TOL) + 90));
      pile.style.background = it.color;
      $('.pb-jar-ico', st.stage).innerHTML = it.icon;
      st.hint(`Scoop ${it.name.toLowerCase()} until the scale reads ${it.target} g.`);
      draw(); drawList();
    };
    const check = async () => {
      const it = items[i];
      if (Math.abs(w - it.target) <= TOL) {
        sfx('chime'); bump($('.scale', st.stage));
        scores.push(Math.max(0.5, 1 - overs * 0.15));
        i++;
        await wait(450);
        if (i >= items.length) { resolve(scores.reduce((a, b) => a + b, 0) / scores.length); return; }
        setUp();
      } else if (w > it.target + TOL) { overs++; sfx('soft'); st.hint('A little too much — take some out.'); }
      else st.hint(`${it.target - w} g to go…`);
    };
    const add = (n) => { if (i >= items.length) return; w = Math.max(0, w + n); draw(); check(); };
    $('.pb-jar', st.stage).addEventListener('click', (e) => { sfx('pop'); bump(e.currentTarget); add(4 + Math.floor(Math.random() * 3)); });
    $('.pb-pinch', st.stage).addEventListener('click', () => { sfx('tap'); add(1); });
    $('.pb-out', st.stage).addEventListener('click', () => { sfx('tap'); add(-1); });
    setUp();
  });
}

// ------------------------------------------------------------ 3a. Grind
function grindPhase(st, recipe) {
  const ks = Object.keys(recipe.needs);
  const NEED = Math.PI * 2 * 3;   // three turns of the pestle
  return new Promise((resolve) => {
    st.hint('Grind! Draw circles in the mortar to crush the petals.');
    st.stage.innerHTML = `<div class="pb-grind">
        <div class="mortar-wrap">
          <svg class="mix-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#E9DCC5" stroke-width="5"/>
            <circle class="mix-prog" cx="50" cy="50" r="46" fill="none" stroke="#AFC39B" stroke-width="5" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="289" transform="rotate(-90 50 50)"/></svg>
          <div class="mortar"><div class="mortar-bowl"><div class="mortar-petals">${ks.concat(ks).map((k, n) => `<i style="--r:${n * 67}deg">${F(k)}</i>`).join('')}</div>
            <div class="mortar-powder" style="background:${FLOWERS[ks[0]].petal}"></div></div></div>
          <div class="pestle"></div>
        </div></div>`;
    const wrap = $('.mortar-wrap', st.stage), prog = $('.mix-prog', st.stage), pestle = $('.pestle', st.stage);
    let total = 0, lastA = null, done = false;
    const angleAt = (e) => { const r = wrap.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
    wrap.addEventListener('pointerdown', (e) => { e.stopPropagation(); wrap.setPointerCapture(e.pointerId); lastA = angleAt(e); });
    wrap.addEventListener('pointermove', async (e) => {
      if (lastA === null || done) return;
      const a = angleAt(e); let d = a - lastA;
      if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      total += Math.abs(d); lastA = a;
      const r = wrap.getBoundingClientRect();
      pestle.style.left = `${e.clientX - r.left}px`; pestle.style.top = `${e.clientY - r.top}px`;
      const t = Math.min(1, total / NEED);
      prog.setAttribute('stroke-dashoffset', 289 * (1 - t));
      $('.mortar-petals', st.stage).style.opacity = 1 - t;
      $('.mortar-petals', st.stage).style.transform = `rotate(${total * 20}deg) scale(${1 - t * 0.4})`;
      $('.mortar-powder', st.stage).style.opacity = t;
      if (t >= 1 && !done) { done = true; sfx('chime'); st.hint('Finely ground ✿'); await wait(700); resolve(1); }
    });
    wrap.addEventListener('pointerup', () => { lastA = null; });
  });
}

// ------------------------------------------------------------ the scrolling bench
export function perfumeBench(g, recipe) {
  g.el.classList.add('mg-bench');
  const N = 3;
  let at = 0, cur = 0;
  const done = [false, false, false], scores = [];
  return new Promise((resolve) => {
    g.stage.innerHTML = `
      <div class="pb-view">
        <div class="pb-strip">${TITLES.map((t, i) => `
          <section class="pb-station" data-i="${i}">
            <div class="pb-plaque">STEP ${i + 1}/${N} · ${t}</div>
            <div class="pb-work"></div>
            <div class="pb-done">✓ Done</div>
          </section>`).join('')}</div>
        <button class="btn-round pb-prev" aria-label="Previous step">‹</button>
        <button class="btn-round pb-next" aria-label="Next step">›</button>
        <div class="pb-dots">${TITLES.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>
      </div>`;
    const view = $('.pb-view', g.stage), strip = $('.pb-strip', g.stage);
    const stations = $$('.pb-station', strip);
    // each station gets its own little "game" object so the phase functions draw into it
    const hints = ['', '', ''];
    const sub = (i) => ({
      el: g.el, get alive() { return g.alive; },
      stage: $('.pb-work', stations[i]),
      hint: (t) => { hints[i] = t; if (i === at) g.hint(t); },
    });
    const show = () => {
      strip.style.transition = 'transform .35s cubic-bezier(.25, 1.1, .4, 1)';
      strip.style.transform = `translateX(${-at * 100}%)`;
      $('.pb-prev', view).disabled = at === 0;
      $('.pb-next', view).disabled = at === N - 1;
      $$('.pb-dots i', view).forEach((d, i) => { d.className = `${i === at ? 'on' : ''} ${done[i] ? 'ok' : ''}`; });
      const nextOpen = done.findIndex((d, i) => !d && i !== at);
      $('.pb-next', view).classList.toggle('pulse', done[at] && at < N - 1);
      $('.pb-prev', view).classList.toggle('pulse', done[at] && nextOpen >= 0 && nextOpen < at);
      markSteps(g, done, at);
      g.hint(done[at] ? (done.every(Boolean) ? '' : 'Done! Swipe or tap › to the next step.') : hints[at]);
    };
    const go = (i) => { i = Math.max(0, Math.min(N - 1, i)); if (i !== at) { at = i; sfx('tap'); } show(); };
    $('.pb-prev', view).addEventListener('click', () => go(at - 1));
    $('.pb-next', view).addEventListener('click', () => go(at + 1));

    // swipe on the bench (not on the tools) to slide between stations
    let pan = null;
    view.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, .vial, .flask-wrap, .mortar-wrap')) return;
      pan = { x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, id: e.pointerId };
    });
    view.addEventListener('pointermove', (e) => {
      if (!pan || e.pointerId !== pan.id) return;
      const dx = e.clientX - pan.x0;
      if (!pan.moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - pan.y0)) { pan.moved = true; view.setPointerCapture(e.pointerId); }
      if (!pan.moved) return;
      let off = dx;
      if ((at === 0 && dx > 0) || (at === N - 1 && dx < 0)) off *= 0.35;   // rubber band at the ends
      strip.style.transition = 'none';
      strip.style.transform = `translateX(calc(${-at * 100}% + ${off}px))`;
    });
    const endPan = (e) => {
      if (!pan) return;
      const p = pan; pan = null;
      if (!p.moved) return;
      const dx = e.clientX - p.x0, v = dx / Math.max(1, performance.now() - p.t0);
      const w = view.clientWidth;
      go(dx < -w * 0.18 || v < -0.45 ? at + 1 : dx > w * 0.18 || v > 0.45 ? at - 1 : at);
    };
    view.addEventListener('pointerup', endPan);
    view.addEventListener('pointercancel', () => { pan = null; show(); });

    const finish = async (i, score) => {
      done[i] = true; scores[i] = score;
      stations[i].classList.add('is-done');
      sfx('chime');
      show();
      if (done.every(Boolean)) {
        g.hint('The perfume is ready ✿');
        await wait(900);
        resolve(scores.reduce((a, b) => a + b, 0) / N);
      }
    };
    // start all three stations; they can be worked in any order
    scoopPhase(sub(0), recipe).then((s) => finish(0, s));
    sortPhase(sub(1), recipe).then((s) => finish(1, s));
    (async () => {
      const st = sub(2);
      const a = await grindPhase(st, recipe);
      const b = await mixPhase(st, recipe);
      finish(2, (a + b) / 2);
    })();
    show();
  });
}
