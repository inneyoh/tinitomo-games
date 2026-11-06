// Shared UI: sheets (menus), toasts, floating text, sounds.
import { S } from './state.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

// --- Sheet: bottom sheet in portrait, centered card in landscape ---------
let sheetClose = null;
export function openSheet({ title, sub = '', body, onClose, wide = false, cls = '' }) {
  closeSheet();
  const el = h(`<div class="sheet-wrap" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="sheet-backdrop"></div>
    <div class="sheet ${wide ? 'wide' : ''} ${cls}">
      <div class="sheet-head">
        <div><h2>${title}</h2><p class="sheet-sub">${sub}</p></div>
        <button class="btn-round close" aria-label="Close">✕</button>
      </div>
      <div class="sheet-body"></div>
    </div></div>`);
  const bodyEl = $('.sheet-body', el);
  if (typeof body === 'string') bodyEl.innerHTML = body; else bodyEl.append(body);
  const close = () => {
    el.classList.add('closing');
    setTimeout(() => el.remove(), 220);
    sheetClose = null;
    onClose && onClose();
  };
  $('.sheet-backdrop', el).addEventListener('click', close);
  $('.close', el).addEventListener('click', () => { sfx('tap'); close(); });
  document.body.append(el);
  sheetClose = close;
  return { el, body: bodyEl, close, setSub: (t) => { const s = $('.sheet-sub', el); if (s) s.textContent = t; } };
}
export const closeSheet = () => sheetClose && sheetClose();
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

// --- Toast ---------------------------------------------------------------
let toastTimer = 0;
export function toast(msg) {
  let el = $('#toast');
  if (!el) { el = h('<div id="toast" role="status" aria-live="polite"></div>'); document.body.append(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// Small text that floats up from an element ("+18", "Watered!")
export function floatText(anchor, text, cls = '') {
  const r = anchor.getBoundingClientRect();
  const el = h(`<div class="float-text ${cls}">${text}</div>`);
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top + r.height * 0.3}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1200);
}

export function bump(el) {
  if (!el) return;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  clearTimeout(el._bumpT);
  el._bumpT = setTimeout(() => el.classList.remove('bump'), 400);
}

// --- Gentle synth sounds (no audio files needed) -----------------------------
let ctx = null;
const NOTES = {
  tap:   [[660, 0.05]],
  pop:   [[880, 0.06], [1320, 0.06]],
  coin:  [[988, 0.07], [1319, 0.12]],
  chime: [[784, 0.1], [988, 0.1], [1175, 0.16]],
  water: [[520, 0.06], [440, 0.08]],
  soft:  [[392, 0.12]],
};
export function sfx(name) {
  if (!S.settings.sound) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    for (const [f, d] of NOTES[name] || NOTES.tap) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + d + 0.02);
      t += d * 0.8;
    }
  } catch (_) { /* audio unavailable */ }
}

// Hint bubble: shows when its text changes, then fades out after a few seconds.
export function hint(el, text) {
  if (!el || el.textContent === text) return;
  el.textContent = text;
  el.classList.remove('quiet');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('quiet'), 4500);
}

// Fit a fixed-ratio art canvas into a view: cover the view as much as possible
// while keeping `keep` = [x0, y0, x1, y1] (fractions of the canvas) on screen.
// alignY: where to put the canvas when it is shorter than the view (0 top ... 1 bottom).
export function fitCanvas(view, canvas, W, H, keep, alignY = 0.5) {
  const vw = view.clientWidth, vh = view.clientHeight;
  if (!vw || !vh) return;
  const [x0, y0, x1, y1] = keep;
  const s = Math.min(Math.max(vw / W, vh / H), vw / (W * (x1 - x0)), vh / (H * (y1 - y0)));
  const cw = W * s, ch = H * s;
  const fit = (v, c, a, b, al) => (c <= v ? (v - c) * al : Math.min(-a * c, Math.max(v - b * c, (v - c) / 2)));
  Object.assign(canvas.style, {
    width: cw + 'px', height: ch + 'px', transform: 'none',
    left: fit(vw, cw, x0, x1, 0.5) + 'px', top: fit(vh, ch, y0, y1, alignY) + 'px',
  });
}
