// Tea leaf packing at the kitchen:
//   1. Chop — swipe across the leaves on the cutting board to chop them
//   2. Dry  — hold to warm the drying rack; keep the heat in the cosy zone until dry
//   3. Pour — hold to pour the dried tea into the tin; stop at the line
import { FLOWERS } from '../data.js';
import { $, $$, sfx, bump } from '../ui.js';
import { F } from '../art.js';
import { holdButton, wait } from './shell.js';

// ---------------------------------------------------------------- 1. Chop
export function chopPhase(g, recipe) {
  const flowers = Object.keys(recipe.needs);
  const N = 6, CUTS = 2;
  const leaves = Array.from({ length: N }, (_, i) => ({ k: flowers[i % flowers.length], cuts: 0 }));
  const t0 = Date.now();
  return new Promise((resolve) => {
    g.stage.classList.add('mg-chop');
    g.hint('Swipe across the leaves to chop them. Each needs a couple of cuts.');
    g.stage.innerHTML = `<div class="board">${leaves.map((l, i) => `<div class="leaf" data-l="${i}" style="--r:${(i * 47) % 60 - 30}deg">${F(l.k)}</div>`).join('')}</div>
      <div class="chop-meter"><i></i></div>`;
    const board = $('.board', g.stage);
    let last = null, done = false;
    const meter = () => {
      const t = leaves.reduce((a, l) => a + Math.min(l.cuts, CUTS), 0) / (N * CUTS);
      $('.chop-meter i', g.stage).style.width = `${t * 100}%`;
      return t;
    };
    board.addEventListener('pointerdown', (e) => { board.setPointerCapture(e.pointerId); last = [e.clientX, e.clientY]; });
    board.addEventListener('pointermove', async (e) => {
      if (!last || done) return;
      const cur = [e.clientX, e.clientY];
      if (Math.hypot(cur[0] - last[0], cur[1] - last[1]) < 6) return;
      const trail = document.createElement('i'); trail.className = 'knife-trail';
      const br = board.getBoundingClientRect();
      trail.style.left = `${cur[0] - br.left}px`; trail.style.top = `${cur[1] - br.top}px`;
      board.append(trail); setTimeout(() => trail.remove(), 300);
      // a leaf is cut when the swipe passes from outside to inside or across it fast
      $$('.leaf', board).forEach((el) => {
        const r = el.getBoundingClientRect(), l = leaves[+el.dataset.l];
        const inNow = cur[0] > r.left && cur[0] < r.right && cur[1] > r.top && cur[1] < r.bottom;
        const inBefore = last[0] > r.left && last[0] < r.right && last[1] > r.top && last[1] < r.bottom;
        if (inNow && !inBefore && l.cuts < CUTS) {
          l.cuts++; sfx('pop'); bump(el);
          el.dataset.cuts = l.cuts;
        }
      });
      last = cur;
      if (meter() >= 1 && !done) {
        done = true; sfx('chime'); g.hint('All chopped ✿');
        await wait(600);
        const secs = (Date.now() - t0) / 1000;
        resolve(secs < 12 ? 1 : secs < 25 ? 0.8 : 0.65);
      }
    });
    board.addEventListener('pointerup', () => { last = null; });
    meter();
  });
}

// ---------------------------------------------------------------- 2. Dry
export function dryPhase(g, recipe) {
  const k = Object.keys(recipe.needs)[0];
  const LO = 0.45, HI = 0.72, NEED = 5;   // seconds in the zone
  return new Promise((resolve) => {
    g.stage.classList.add('mg-dry');
    g.hint('Hold to warm the drying rack. Keep the heat in the cosy green zone until the leaves are dry.');
    g.stage.innerHTML = `
      <div class="dry-scene">
        <div class="rack">${Array.from({ length: 8 }, (_, i) => `<i style="--r:${i * 40}deg">${F(k)}</i>`).join('')}</div>
        <div class="heater"><div class="glow"></div></div>
      </div>
      <div class="dry-side">
        <div class="thermo"><div class="thermo-zone" style="bottom:${LO * 100}%;height:${(HI - LO) * 100}%"></div><div class="thermo-fill"></div></div>
        <div class="dry-meters"><label>Dry<div class="meter"><i class="m-dry"></i></div></label><label>Scorched<div class="meter burn"><i class="m-burn"></i></div></label></div>
        <button class="btn-primary heat-btn">Hold to warm</button>
      </div>`;
    let heat = 0.2, dry = 0, burn = 0, held = false, done = false, last = performance.now();
    const btn = $('.heat-btn', g.stage);
    holdButton(btn, { onTick: () => { held = true; }, onRelease: () => { held = false; } });
    const loop = async (t) => {
      if (done || !g.alive) return;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      heat += (held ? 0.55 : -0.32) * dt;
      heat = Math.max(0, Math.min(1, heat));
      if (heat >= LO && heat <= HI) dry += dt / NEED;
      if (heat > HI) burn += dt / 6;
      $('.thermo-fill', g.stage).style.height = `${heat * 100}%`;
      $('.m-dry', g.stage).style.width = `${Math.min(1, dry) * 100}%`;
      $('.m-burn', g.stage).style.width = `${Math.min(1, burn) * 100}%`;
      $('.glow', g.stage).style.opacity = 0.2 + heat * 0.8;
      $('.rack', g.stage).style.filter = `saturate(${1 - dry * 0.35}) brightness(${1 - burn * 0.4})`;
      g.stage.classList.toggle('too-hot', heat > HI);
      if (dry >= 1) {
        done = true; sfx('chime'); g.hint('Crisp and fragrant ✿');
        await wait(600);
        resolve(Math.max(0.4, 1 - burn * 1.2));
        return;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

// ---------------------------------------------------------------- 3. Pour
export function pourPhase(g, recipe) {
  const LO = 0.82, HI = 0.94;
  return new Promise((resolve) => {
    g.stage.classList.add('mg-pour');
    g.hint('Hold to pour the tea into the tin. Let go between the two lines.');
    g.stage.innerHTML = `
      <div class="pour-scene">
        <div class="scoop"></div>
        <div class="stream"></div>
        <div class="tin"><div class="tin-fill" style="background:${recipe.color}"></div>
          <div class="tin-line" style="bottom:${LO * 100}%"></div><div class="tin-line" style="bottom:${HI * 100}%"></div></div>
      </div>
      <div class="pour-side"><button class="btn-primary pour-btn">Hold to pour</button><button class="btn-toggle tip-btn hidden">Tip some back</button></div>`;
    let f = 0, spills = 0;
    const btn = $('.pour-btn', g.stage), tip = $('.tip-btn', g.stage), scene = $('.pour-scene', g.stage);
    const draw = () => { $('.tin-fill', g.stage).style.height = `${Math.min(1, f) * 100}%`; };
    holdButton(btn, {
      onTick: (dt) => { f += dt * (0.18 + f * 0.25); scene.classList.add('pouring'); draw(); },
      onRelease: async () => {
        scene.classList.remove('pouring');
        if (f > HI) { spills++; sfx('soft'); g.hint('Too full! Tip some back and try again.'); btn.disabled = true; tip.classList.remove('hidden'); return; }
        if (f >= LO) {
          sfx('chime'); bump($('.tin', g.stage)); g.hint('Perfectly packed ✿');
          await wait(600);
          const mid = (LO + HI) / 2;
          resolve(Math.max(0.5, 1 - Math.abs(f - mid) * 3 - spills * 0.2));
        } else g.hint('Not quite full… hold again.');
      },
    });
    tip.addEventListener('click', () => { f = 0.5; draw(); tip.classList.add('hidden'); btn.disabled = false; sfx('tap'); g.hint('Gently now — stop between the lines.'); });
    draw();
  });
}
