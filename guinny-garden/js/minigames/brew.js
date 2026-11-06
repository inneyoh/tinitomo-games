// Tea brewing at the kitchen: a fitting puzzle.
// Drag the flower pieces into the brewing tank until every square is filled.
// Tap a piece in the tray to turn it. Tap a placed piece to take it back out.
// Puzzles are made by cutting a full tank into random pieces, so every one is solvable.
import { FLOWERS } from '../data.js';
import { $, $$, h, sfx, bump } from '../ui.js';
import { F } from '../art.js';
import { wait } from './shell.js';

const COLS = 5, ROWS = 4;

function makePuzzle() {
  for (let tries = 0; tries < 200; tries++) {
    const owner = Array(COLS * ROWS).fill(-1);
    const pieces = [];
    const order = [...owner.keys()].sort(() => Math.random() - 0.5);
    let ok = true;
    for (const start of order) {
      if (owner[start] !== -1) continue;
      const size = 2 + Math.floor(Math.random() * 3);   // 2–4 cells
      const cells = [start]; owner[start] = pieces.length;
      while (cells.length < size) {
        const nb = cells.flatMap((c) => [c - COLS, c + COLS, c % COLS ? c - 1 : -1, c % COLS < COLS - 1 ? c + 1 : -1])
          .filter((n) => n >= 0 && n < COLS * ROWS && owner[n] === -1);
        if (!nb.length) break;
        const n = nb[Math.floor(Math.random() * nb.length)];
        owner[n] = pieces.length; cells.push(n);
      }
      pieces.push(cells);
    }
    if (pieces.some((p) => p.length === 1)) ok = false;   // no single squares — they make it too easy
    if (ok && pieces.length >= 5 && pieces.length <= 8) {
      return pieces.map((cells) => {
        const xy = cells.map((c) => [c % COLS, Math.floor(c / COLS)]);
        return { cells: normalize(xy), anchor: [Math.min(...xy.map((c) => c[0])), Math.min(...xy.map((c) => c[1]))] };
      });
    }
  }
  return null;
}
const normalize = (cells) => {
  const mx = Math.min(...cells.map((c) => c[0])), my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]);
};
const rotate = (cells) => normalize(cells.map(([x, y]) => [-y, x]));
const size = (cells) => [Math.max(...cells.map((c) => c[0])) + 1, Math.max(...cells.map((c) => c[1])) + 1];

export function brewPhase(g, recipe) {
  const flowers = Object.keys(recipe.needs);
  const pieces = makePuzzle().map((sol, n) => {
    let c = sol.cells; for (let r = 1 + Math.floor(Math.random() * 3); r > 0; r--) c = rotate(c);
    const k = flowers[n % flowers.length];
    return { id: n, cells: c, sol, flower: k, color: FLOWERS[k].petal, at: null };
  });
  const grid = Array(COLS * ROWS).fill(-1);
  const t0 = Date.now();

  return new Promise((resolve) => {
    g.stage.classList.add('mg-brew');
    g.hint('Fit every flower into the brewing tank. Tap a piece in the tray to turn it.');
    g.stage.innerHTML = `
      <div class="tank-wrap">
        <div class="tank" style="--cols:${COLS};--rows:${ROWS}">
          ${Array.from({ length: COLS * ROWS }, (_, i) => `<div class="tank-cell" data-c="${i}"></div>`).join('')}
          <div class="tank-pieces"></div>
          <div class="tank-bubbles"></div>
        </div>
        <div class="tank-base"></div>
      </div>
      <div class="tray"></div>`;
    const tank = $('.tank', g.stage), tray = $('.tray', g.stage), placedLayer = $('.tank-pieces', g.stage);
    // cell size follows the tank's real size so pieces line up with the squares
    const setCell = () => {
      const c = tank.clientWidth / COLS;   // inside the border
      g.stage.style.setProperty('--cell', `${c}px`);
      g.stage.style.setProperty('--tcell', `${c * 0.55}px`);
    };
    new ResizeObserver(setCell).observe(tank); setCell();

    const pieceHTML = (p) => {
      const [w, hh] = size(p.cells);
      return `<div class="piece" data-p="${p.id}" style="--w:${w};--h:${hh};--pc:${p.color}">
        ${p.cells.map(([x, y]) => `<i style="grid-column:${x + 1};grid-row:${y + 1}">${F(p.flower)}</i>`).join('')}</div>`;
    };
    const draw = () => {
      tray.innerHTML = pieces.filter((p) => !p.at).map(pieceHTML).join('');
      placedLayer.innerHTML = pieces.filter((p) => p.at).map((p) => pieceHTML(p).replace('class="piece"',
        `class="piece placed" style="left:calc(var(--cell) * ${p.at[0]});top:calc(var(--cell) * ${p.at[1]});--w:${size(p.cells)[0]};--h:${size(p.cells)[1]};--pc:${p.color}"`)).join('');
    };
    const fits = (p, ax, ay) => p.cells.every(([x, y]) => {
      const cx = ax + x, cy = ay + y;
      return cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS && grid[cy * COLS + cx] === -1;
    });
    const place = (p, ax, ay) => { p.at = [ax, ay]; p.cells.forEach(([x, y]) => { grid[(ay + y) * COLS + ax + x] = p.id; }); };
    const unplace = (p) => { p.cells.forEach(([x, y]) => { grid[(p.at[1] + y) * COLS + p.at[0] + x] = -1; }); p.at = null; };
    const preview = (p, ax, ay) => {
      $$('.tank-cell', tank).forEach((c) => c.classList.remove('ok', 'bad'));
      if (ax === null) return;
      const ok = fits(p, ax, ay);
      p.cells.forEach(([x, y]) => {
        const cx = ax + x, cy = ay + y;
        if (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) $(`.tank-cell[data-c="${cy * COLS + cx}"]`, tank).classList.add(ok ? 'ok' : 'bad');
      });
    };

    // drag & drop (tap = rotate in tray / remove from tank)
    let drag = null;
    g.stage.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.piece'); if (!el) return;
      e.preventDefault();
      const p = pieces[+el.dataset.p];
      const r = el.getBoundingClientRect();
      const cell = tank.clientWidth / COLS;
      const scale = r.width / (size(p.cells)[0] * cell);   // tray pieces are drawn smaller
      drag = { p, el, x0: e.clientX, y0: e.clientY, moved: false, from: p.at ? [...p.at] : null,
        gx: (e.clientX - r.left) / scale / cell, gy: (e.clientY - r.top) / scale / cell, ghost: null };
      g.stage.setPointerCapture(e.pointerId);
    });
    g.stage.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
      const tb = tank.getBoundingClientRect(), cell = tank.clientWidth / COLS;
      const tr = { left: tb.left + tank.clientLeft, top: tb.top + tank.clientTop };
      if (!drag.moved) {
        drag.moved = true;
        if (drag.p.at) { unplace(drag.p); draw(); }
        drag.ghost = h(pieceHTML(drag.p).replace('class="piece"', 'class="piece ghost"'));
        drag.ghost.style.setProperty('--cell', `${cell}px`);
        document.body.append(drag.ghost);
        const left = tray.querySelector(`[data-p="${drag.p.id}"]`); if (left) left.style.visibility = 'hidden';
        sfx('tap');
      }
      drag.ghost.style.left = `${e.clientX - drag.gx * cell}px`;
      drag.ghost.style.top = `${e.clientY - drag.gy * cell}px`;
      const ax = Math.round((e.clientX - drag.gx * cell - tr.left) / cell), ay = Math.round((e.clientY - drag.gy * cell - tr.top) / cell);
      drag.target = [ax, ay];
      preview(drag.p, ax, ay);
    });
    g.stage.addEventListener('pointerup', async () => {
      if (!drag) return;
      const d = drag; drag = null;
      preview(d.p, null);
      if (!d.moved) {   // tap
        if (d.p.at) { unplace(d.p); sfx('soft'); }
        else { d.p.cells = rotate(d.p.cells); sfx('tap'); }
        draw(); return;
      }
      d.ghost.remove();
      const [ax, ay] = d.target || [-9, -9];
      if (fits(d.p, ax, ay)) { place(d.p, ax, ay); sfx('pop'); }
      else sfx('soft');
      draw();
      checkDone();
    });
    let finished = false;
    async function checkDone() {
      if (finished || !grid.every((c) => c !== -1)) return;
      finished = true;
      g.hint('Brewing… ✿'); sfx('chime');
      tank.classList.add('brewing');
      $('.tank-bubbles', g.stage).innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.18}s"></i>`).join('');
      await wait(1600);
      const secs = (Date.now() - t0) / 1000;
      resolve(secs < 45 ? 1 : secs < 90 ? 0.8 : 0.65);
    }
    // testing shortcut, only with ?debug in the address
    if (location.search.includes('debug')) {
      window.__brewSolve = () => { pieces.forEach((p) => { if (p.at) unplace(p); p.cells = p.sol.cells; place(p, ...p.sol.anchor); }); draw(); checkDone(); };
    }
    g.stage.addEventListener('pointercancel', () => { if (drag?.ghost) drag.ghost.remove(); drag = null; draw(); });
    draw();
  });
}
