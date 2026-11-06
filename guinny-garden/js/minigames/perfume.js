// Perfume making at the alchemy table:
//   1. Weigh — hold a jar to pour onto the scale; stop inside the green band
//   2. Sort  — water-sort puzzle: separate the essences so each vial holds one colour
//   3. Mix   — stir the flask in circles until the perfume turns one colour
import { FLOWERS } from '../data.js';
import { $, $$, h, sfx, bump } from '../ui.js';
import { F, dropArt } from '../art.js';
import { holdButton, wait } from './shell.js';

// ---------------------------------------------------------------- 1. Weigh
export function weighPhase(g, recipe) {
  const items = [
    ...Object.entries(recipe.needs).map(([k, n]) => ({ name: `${FLOWERS[k].name} petals`, icon: F(k), color: FLOWERS[k].petal, target: n * 10 })),
    { name: 'Spring water', icon: dropArt(), color: '#BFD9EA', target: 25 },
  ];
  const MAX = 60, TOL = 2.5;
  return new Promise((resolve) => {
    let i = 0, w = 0, scores = [], spills = 0;
    g.stage.classList.add('mg-weigh');
    g.stage.innerHTML = `
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
      <div class="weigh-side">
        <div class="weigh-list"></div>
        <button class="btn-primary pour-btn">Hold to pour</button>
        <button class="btn-toggle scoop-btn hidden">Scoop it out</button>
      </div>`;
    const needle = $('.needle', g.stage), zone = $('.dial-zone', g.stage), pile = $('.pan-pile', g.stage);
    const pour = $('.pour-btn', g.stage), scoop = $('.scoop-btn', g.stage);
    const ang = (v) => -90 + (Math.min(v, MAX) / MAX) * 180;
    const arc = (a0, a1) => {
      const p = (a) => [100 + 80 * Math.cos(((a - 90) * Math.PI) / 180), 110 + 80 * Math.sin(((a - 90) * Math.PI) / 180)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${x0} ${y0} A80 80 0 0 1 ${x1} ${y1}`;
    };
    const drawList = () => {
      $('.weigh-list', g.stage).innerHTML = items.map((it, n) => `<div class="weigh-item ${n < i ? 'done' : n === i ? 'now' : ''}">
        <i>${it.icon}</i><span>${it.name}<small>${it.target} g</small></span>${n < i ? '✓' : ''}</div>`).join('');
    };
    const setUp = () => {
      const it = items[i];
      w = 0;
      $('.w-target', g.stage).textContent = it.target;
      zone.setAttribute('d', arc(ang(it.target - TOL) + 90, ang(it.target + TOL) + 90));
      pile.style.background = it.color;
      g.hint(`Hold the button to pour ${it.name.toLowerCase()} — let go inside the green band.`);
      draw(); drawList();
    };
    const draw = () => {
      needle.setAttribute('transform', `rotate(${ang(w)} 100 110)`);
      $('.w-now', g.stage).textContent = Math.round(w);
      pile.style.height = `${Math.min(100, (w / MAX) * 100)}%`;
    };
    holdButton(pour, {
      onTick: (dt) => { w += dt * (6 + w * 0.35); draw(); },
      onRelease: async () => {
        const it = items[i];
        if (w > it.target + TOL) {
          sfx('soft'); g.hint('Oops, too much! Scoop it out and try again.');
          pour.disabled = true; scoop.classList.remove('hidden'); spills++;
          return;
        }
        if (w >= it.target - TOL) {
          sfx('pop'); bump($('.scale', g.stage));
          scores.push(Math.max(0.5, 1 - Math.abs(w - it.target) / (TOL * 3) - spills * 0.2));
          spills = 0; i++;
          await wait(450);
          if (i >= items.length) { resolve(scores.reduce((a, b) => a + b, 0) / scores.length); return; }
          setUp();
        } else g.hint('A little more… hold again.');
      },
    });
    scoop.addEventListener('click', () => { w = 0; draw(); scoop.classList.add('hidden'); pour.disabled = false; sfx('tap'); g.hint('Try again — gently this time.'); });
    setUp();
  });
}

// ---------------------------------------------------------------- 2. Sort (water sort)
export function sortPhase(g, recipe) {
  const flowers = Object.keys(recipe.needs);
  const palette = [...new Set([...flowers.map((k) => FLOWERS[k].petal), '#BFD9EA', '#F4E3A6', '#C8E0C0'])].slice(0, 3);
  const CAP = 4;
  const solved = (vs) => vs.every((v) => v.length === 0 || (v.length === CAP && v.every((c) => c === v[0])));
  let vials;
  do {
    const units = palette.flatMap((c) => Array(CAP).fill(c)).sort(() => Math.random() - 0.5);
    vials = palette.map((_, n) => units.slice(n * CAP, n * CAP + CAP));
    vials.push([], []);
  } while (solved(vials));
  const start = vials.map((v) => [...v]);
  let sel = null, moves = 0;
  return new Promise((resolve) => {
    g.stage.classList.add('mg-sort');
    g.hint('Separate the essences: tap a vial, then tap where to pour. Each vial should end up one colour.');
    const draw = () => {
      g.stage.innerHTML = `<div class="vials">${vials.map((v, n) => `
        <button class="vial ${sel === n ? 'sel' : ''}" data-v="${n}" aria-label="Vial ${n + 1}">
          <div class="vial-glass">${v.map((c) => `<i style="background:${c}"></i>`).join('')}</div></button>`).join('')}</div>
        <div class="sort-bar"><span>Moves: ${moves}</span><button class="btn-toggle sort-reset">Start over</button></div>`;
    };
    g.stage.addEventListener('click', async (e) => {
      if (e.target.closest('.sort-reset')) { vials = start.map((v) => [...v]); sel = null; moves = 0; sfx('tap'); draw(); return; }
      const b = e.target.closest('.vial'); if (!b) return;
      const n = +b.dataset.v;
      if (sel === null) { if (vials[n].length) { sel = n; sfx('tap'); } draw(); return; }
      if (sel === n) { sel = null; draw(); return; }
      const from = vials[sel], to = vials[n], top = from[from.length - 1];
      if (to.length < CAP && (!to.length || to[to.length - 1] === top)) {
        while (from.length && from[from.length - 1] === top && to.length < CAP) to.push(from.pop());
        moves++; sfx('water');
      } else sfx('soft');
      sel = null; draw();
      if (solved(vials)) {
        g.hint('All sorted! ✿'); sfx('chime');
        await wait(600);
        resolve(moves <= 8 ? 1 : moves <= 12 ? 0.8 : 0.6);
      }
    });
    draw();
  });
}

// ---------------------------------------------------------------- 3. Mix (stir in circles)
export function mixPhase(g, recipe) {
  const colors = Object.keys(recipe.needs).map((k) => FLOWERS[k].petal);
  const NEED = Math.PI * 2 * 3;   // three full turns
  return new Promise((resolve) => {
    g.stage.classList.add('mg-mix');
    g.hint('Stir! Draw circles around the flask to mix the perfume.');
    g.stage.innerHTML = `<div class="flask-wrap">
        <svg class="mix-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#E9DCC5" stroke-width="5"/>
          <circle class="mix-prog" cx="50" cy="50" r="46" fill="none" stroke="#E3A7A8" stroke-width="5" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="289" transform="rotate(-90 50 50)"/></svg>
        <div class="flask"><div class="flask-liquid"><i style="background:${colors[0]}"></i><i style="background:#BFD9EA"></i></div><div class="flask-neck"></div></div>
        <div class="stir-dot"></div>
      </div>`;
    const wrap = $('.flask-wrap', g.stage), prog = $('.mix-prog', g.stage), dot = $('.stir-dot', g.stage);
    let total = 0, lastA = null, done = false;
    const angleAt = (e) => { const r = wrap.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
    wrap.addEventListener('pointerdown', (e) => { wrap.setPointerCapture(e.pointerId); lastA = angleAt(e); });
    wrap.addEventListener('pointermove', async (e) => {
      if (lastA === null || done) return;
      const a = angleAt(e); let d = a - lastA;
      if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      total += Math.abs(d); lastA = a;
      const r = wrap.getBoundingClientRect();
      dot.style.left = `${e.clientX - r.left}px`; dot.style.top = `${e.clientY - r.top}px`;
      const t = Math.min(1, total / NEED);
      prog.setAttribute('stroke-dashoffset', 289 * (1 - t));
      $$('.flask-liquid i', g.stage).forEach((el, n) => { el.style.opacity = n === 0 ? 1 : 1 - t; });
      $('.flask', g.stage).style.transform = `rotate(${Math.sin(total * 2) * 3}deg)`;
      if (t >= 1 && !done) {
        done = true; sfx('chime'); g.hint('Beautifully mixed ✿');
        await wait(700); resolve(1);
      }
    });
    wrap.addEventListener('pointerup', () => { lastA = null; });
  });
}
