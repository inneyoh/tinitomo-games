// Tea brewing at the tea urn: a packing puzzle on the user's urn art.
// Drag the ingredient pieces from the tray into the urn's 4×5 grid until every square is
// filled. Tap a piece in the tray to turn it; tap a placed piece to take it back out.
// Each recipe's `needs` (data.js) is a mix of pieces that is known to fill the grid.
// Portrait: tray along the bottom with ◀ ▶. Landscape: tray on the right with ▲ ▼.
import { ING } from '../data.js';
import { $, $$, h, sfx } from '../ui.js';
import { wait } from './shell.js';

const IMG = 'assets/img/brew/';
const COLS = 4, ROWS = 5;
// piece shapes as drawn in the art (cells, in columns × rows of the sprite)
export const PIECES = {
  chamomile:     { w: 2, h: 2, cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  mint:          { w: 2, h: 2, cells: [[0, 0], [0, 1], [1, 1]] },
  camellia:      { w: 2, h: 2, cells: [[0, 0], [1, 0], [0, 1]] },
  rose:          { w: 3, h: 2, cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  lavender:      { w: 1, h: 3, cells: [[0, 0], [0, 1], [0, 2]] },
  butterfly_pea: { w: 3, h: 1, cells: [[0, 0], [1, 0], [2, 0]] },
  earl_grey:     { w: 2, h: 1, cells: [[0, 0], [1, 0]] },
  darjeeling:    { w: 2, h: 1, cells: [[0, 0], [1, 0]] },
  lapsang:       { w: 2, h: 1, cells: [[0, 0], [1, 0]] },
  chai:          { w: 2, h: 1, cells: [[0, 0], [1, 0]] },
};
// Where the grid sits on each background (% of the image), measured from the art
const BG = {
  portrait:  { src: `${IMG}bg-portrait.webp`,  W: 1086, H: 1448, grid: [25.18, 14.54, 49.45, 46.82], keep: [0.08, 0, 0.92, 0.74] },
  landscape: { src: `${IMG}bg-landscape.webp`, W: 1672, H: 941,  grid: [13.99, 19.14, 27.47, 61.64], keep: [0, 0.01, 0.5, 0.93] },
};

// rotate a shape 90° clockwise (screen coordinates), keeping it in the top-left corner
const norm = (c) => { const mx = Math.min(...c.map((p) => p[0])), my = Math.min(...c.map((p) => p[1])); return c.map(([x, y]) => [x - mx, y - my]); };
const rotCells = (c, r) => { let o = c; for (let i = 0; i < r; i++) o = norm(o.map(([x, y]) => [-y, x])); return o; };
const dims = (k, r) => (r % 2 ? [PIECES[k].h, PIECES[k].w] : [PIECES[k].w, PIECES[k].h]);

export function brewPhase(g, recipe) {
  const counts = { ...recipe.needs };
  const rot = Object.fromEntries(Object.keys(counts).map((k) => [k, 0]));   // tray orientation per ingredient
  const placed = [];          // { k, r, x, y }
  const grid = Array(COLS * ROWS).fill(-1);
  const t0 = Date.now();
  let o = '', cell = 40;

  g.el.classList.add('mg-urn');
  return new Promise((resolve) => {
    g.hint('Fill every square of the urn. Tap a piece in the tray to turn it.');
    g.stage.innerHTML = `
      <div class="urn-scene">
        <div class="urn-canvas"><img class="urn-bg" alt="" draggable="false"><img class="urn-ext" alt="" draggable="false">
          <div class="urn-grid">${Array.from({ length: COLS * ROWS }, (_, i) => `<i data-c="${i}"></i>`).join('')}<div class="urn-pieces"></div><div class="urn-steam"></div></div>
        </div>
        <div class="urn-tray">
          <button class="tray-arrow prev" aria-label="Previous">◀</button>
          <div class="tray-track"></div>
          <button class="tray-arrow next" aria-label="Next">▶</button>
        </div>
      </div>`;
    const scene = $('.urn-scene', g.stage), canvas = $('.urn-canvas', scene), gridEl = $('.urn-grid', scene);
    const track = $('.tray-track', scene), tray = $('.urn-tray', scene);

    // ----- layout: urn fills the space beside / above the tray
    const layout = () => {
      const W = scene.clientWidth, H = scene.clientHeight;
      if (!W || !H) return;
      const no = W >= H * 1.15 ? 'landscape' : 'portrait';
      if (no !== o) { o = no; scene.dataset.o = o; $$('.urn-bg, .urn-ext', scene).forEach((im) => { im.src = BG[o].src; }); }
      const b = BG[o], tr = tray.getBoundingClientRect(), sr = scene.getBoundingClientRect();
      // free area for the urn (not covered by the tray)
      const area = o === 'portrait' ? { w: W, h: tr.top - sr.top } : { w: tr.left - sr.left, h: H };
      const [x0, y0, x1, y1] = b.keep;
      const s = Math.min(area.w / (b.W * (x1 - x0)), area.h / (b.H * (y1 - y0)), Math.max(W / b.W, H / b.H));
      const cw = b.W * s, ch = b.H * s;
      const left = o === 'portrait' ? (W - cw) / 2 : Math.min(0, area.w / 2 - ((x0 + x1) / 2) * cw);
      const top = Math.min(0, area.h / 2 - ((y0 + y1) / 2) * ch) + (o === 'portrait' ? Math.max(0, (area.h - (y1 - y0) * ch) / 2) : 0);
      Object.assign(canvas.style, { width: `${cw}px`, height: `${ch}px`, left: `${left}px`, top: `${top}px` });
      const [gl, gt, gw, gh] = b.grid;
      Object.assign(gridEl.style, { left: `${gl}%`, top: `${gt}%`, width: `${gw}%`, height: `${gh}%` });
      cell = (cw * gw) / 100 / COLS;
      scene.style.setProperty('--cell', `${cell}px`);
      sizeTray();
      arrows();
    };

    // ----- drawing
    const pieceHTML = (k, r, cls = '', extra = '') => {
      const P = PIECES[k], [w, hh] = dims(k, r);
      return `<div class="bp ${cls}" data-k="${k}" style="--w:${w};--h:${hh};--iw:${P.w};--ih:${P.h};--r:${r * 90}deg;${extra}">
        <img src="${IMG}piece-${k}.webp" alt="" draggable="false"></div>`;
    };
    const drawTray = () => {
      const keys = Object.keys(counts).filter((k) => counts[k] > 0);
      track.innerHTML = keys.map((k) => `<div class="tray-item" data-k="${k}">
          <div class="tray-piece">${pieceHTML(k, rot[k])}</div>
          <span class="tray-label">${ING(k).name.replace(/ Leaves$/, '').toLowerCase()}</span>
          ${counts[k] > 1 ? `<b class="tray-count">×${counts[k]}</b>` : ''}</div>`).join('')
        || '<p class="tray-empty">All in! ✿</p>';
      sizeTray();
      arrows();
    };
    // each tray piece as big as its slot allows (but never bigger than in the urn)
    const sizeTray = () => {
      $$('.tray-item', track).forEach((it) => {
        const box = $('.tray-piece', it), k = it.dataset.k, [w, hh] = dims(k, rot[k]);
        const c = Math.min((box.clientWidth * 0.9) / w, (box.clientHeight * 0.92) / hh, cell * 0.85);
        box.style.setProperty('--cell', Math.max(12, c) + 'px');
      });
    };
    const drawPlaced = () => {
      $('.urn-pieces', scene).innerHTML = placed.map((p, i) =>
        pieceHTML(p.k, p.r, 'placed', `left:calc(var(--cell) * ${p.x});top:calc(var(--cell) * ${p.y})`).replace('class="bp placed"', `class="bp placed" data-i="${i}"`)).join('');
    };
    const arrows = () => {
      const v = o === 'landscape';
      const max = v ? track.scrollHeight - track.clientHeight : track.scrollWidth - track.clientWidth;
      const pos = v ? track.scrollTop : track.scrollLeft;
      $('.prev', tray).classList.toggle('off', pos <= 2);
      $('.next', tray).classList.toggle('off', max < 8 || pos >= max - 4);
      $('.prev', tray).textContent = v ? '▲' : '◀';
      $('.next', tray).textContent = v ? '▼' : '▶';
    };
    const page = (d) => {
      const v = o === 'landscape';
      track.scrollBy(v ? { top: d * track.clientHeight * 0.9, behavior: 'smooth' } : { left: d * track.clientWidth * 0.9, behavior: 'smooth' });
      sfx('tap'); setTimeout(arrows, 350);
    };
    $('.prev', tray).addEventListener('click', () => page(-1));
    $('.next', tray).addEventListener('click', () => page(1));
    track.addEventListener('scroll', arrows);

    // ----- grid logic
    const fits = (k, r, ax, ay) => rotCells(PIECES[k].cells, r).every(([x, y]) => {
      const cx = ax + x, cy = ay + y;
      return cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS && grid[cy * COLS + cx] === -1;
    });
    const place = (k, r, ax, ay) => {
      placed.push({ k, r, x: ax, y: ay });
      rotCells(PIECES[k].cells, r).forEach(([x, y]) => { grid[(ay + y) * COLS + ax + x] = placed.length - 1; });
      counts[k]--;
    };
    const unplace = (i) => {
      const p = placed[i];
      placed.splice(i, 1);
      counts[p.k]++;
      grid.fill(-1);
      placed.forEach((q, n) => rotCells(PIECES[q.k].cells, q.r).forEach(([x, y]) => { grid[(q.y + y) * COLS + q.x + x] = n; }));
    };
    const preview = (k, r, ax, ay) => {
      $$('.urn-grid > i', scene).forEach((c) => c.classList.remove('ok', 'bad'));
      if (ax === null) return;
      const ok = fits(k, r, ax, ay);
      rotCells(PIECES[k].cells, r).forEach(([x, y]) => {
        const cx = ax + x, cy = ay + y;
        if (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) $(`.urn-grid > i[data-c="${cy * COLS + cx}"]`, scene).classList.add(ok ? 'ok' : 'bad');
      });
    };

    // ----- drag & drop (tap = turn in tray / take out of the urn)
    let drag = null;
    scene.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.bp');
      if (!el || e.target.closest('.tray-arrow')) return;
      e.preventDefault();
      const fromIdx = el.dataset.i !== undefined ? +el.dataset.i : null;
      const k = el.dataset.k, r = fromIdx !== null ? placed[fromIdx].r : rot[k];
      const rect = el.getBoundingClientRect();
      const [w, hh] = dims(k, r);
      // where on the piece it was grabbed, in cells
      drag = { k, r, fromIdx, el, x0: e.clientX, y0: e.clientY, moved: false,
        gx: ((e.clientX - rect.left) / rect.width) * w, gy: ((e.clientY - rect.top) / rect.height) * hh };
      scene.setPointerCapture(e.pointerId);
    });
    scene.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
      if (!drag.moved) {
        drag.moved = true;
        if (drag.fromIdx !== null) { unplace(drag.fromIdx); drawPlaced(); drawTray(); }
        drag.ghost = h(pieceHTML(drag.k, drag.r, 'ghost'));
        drag.ghost.style.setProperty('--cell', `${cell}px`);
        document.body.append(drag.ghost);
        const ti = $(`.tray-item[data-k="${drag.k}"] .bp`, track);
        if (ti && counts[drag.k] <= 1) ti.style.visibility = 'hidden';
        sfx('tap');
      }
      const gr = gridEl.getBoundingClientRect();
      const left = e.clientX - drag.gx * cell, top = e.clientY - drag.gy * cell;
      drag.ghost.style.left = `${left}px`; drag.ghost.style.top = `${top}px`;
      drag.target = [Math.round((left - gr.left) / cell), Math.round((top - gr.top) / cell)];
      preview(drag.k, drag.r, ...drag.target);
    });
    const end = () => {
      if (!drag) return;
      const d = drag; drag = null;
      preview(null, 0, null);
      if (!d.moved) {
        if (d.fromIdx !== null) { unplace(d.fromIdx); sfx('soft'); }
        else { rot[d.k] = (rot[d.k] + 1) % 4; sfx('tap'); }
        drawPlaced(); drawTray(); return;
      }
      d.ghost.remove();
      const [ax, ay] = d.target || [-9, -9];
      if (counts[d.k] > 0 && fits(d.k, d.r, ax, ay)) { place(d.k, d.r, ax, ay); rot[d.k] = d.r; sfx('pop'); }
      else sfx('soft');
      drawPlaced(); drawTray(); checkDone();
    };
    scene.addEventListener('pointerup', end);
    scene.addEventListener('pointercancel', () => { if (drag?.ghost) drag.ghost.remove(); drag = null; preview(null, 0, null); drawTray(); });

    let finished = false;
    async function checkDone() {
      if (finished || !grid.every((c) => c !== -1)) return;
      finished = true;
      g.hint('Brewing… ✿'); sfx('chime');
      scene.classList.add('brewing');
      $('.urn-steam', scene).innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.18}s"></i>`).join('');
      await wait(1700);
      const secs = (Date.now() - t0) / 1000;
      resolve(secs < 60 ? 1 : secs < 120 ? 0.8 : 0.65);
    }

    // testing shortcut, only with ?debug in the address: solve the urn
    if (location.search.includes('debug')) {
      window.__brewSolve = () => {
        while (placed.length) unplace(0);
        const sol = [];
        const rec = () => {
          const f = grid.indexOf(-1);
          if (f < 0) return true;
          const fx = f % COLS, fy = Math.floor(f / COLS);
          for (const k of Object.keys(counts)) {
            if (!counts[k]) continue;
            for (let r = 0; r < 4; r++) {
              const c = rotCells(PIECES[k].cells, r);
              const [ax, ay] = c.reduce((m, p) => (p[1] < m[1] || (p[1] === m[1] && p[0] < m[0]) ? p : m));
              if (fits(k, r, fx - ax, fy - ay)) {
                place(k, r, fx - ax, fy - ay); sol.push(1);
                if (rec()) return true;
                unplace(placed.length - 1); sol.pop();
              }
            }
          }
          return false;
        };
        const ok = rec(); drawPlaced(); drawTray(); checkDone();
        return ok;
      };
    }

    new ResizeObserver(layout).observe(scene);
    drawTray(); drawPlaced();
    requestAnimationFrame(layout);
  });
}
