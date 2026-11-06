// Shared full-screen mini-game shell.
//   const g = openGame({ title, steps: ['Weigh', 'Sort', 'Mix'], theme });
//   g.step(i, hint)            highlight step i and show a hint line
//   g.stage                    element each phase draws into (cleared per phase)
//   await g.result({ product, stars, made })   result card; resolves when closed
//   g.closed                   promise that resolves (false) if the player quits early
// Phases are plain async functions that draw into g.stage and resolve with a 0–1 score.
import { $, h, sfx } from '../ui.js';
import { P } from '../art.js';

export function openGame({ title, steps, theme = 'kitchen' }) {
  const el = h(`<div class="mg mg-${theme}" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="mg-top">
      <div class="mg-title"><b>${title}</b><div class="mg-steps">${steps.map((s, i) => `<span data-s="${i}"><i>${i + 1}</i>${s}</span>`).join('')}</div></div>
      <button class="btn-round mg-close" aria-label="Quit">✕</button>
    </div>
    <p class="mg-hint"></p>
    <div class="mg-stage"></div>
  </div>`);
  document.body.append(el);
  let quit;
  const closed = new Promise((r) => { quit = r; });
  const close = () => { el.classList.add('closing'); setTimeout(() => el.remove(), 220); };
  $('.mg-close', el).addEventListener('click', () => { sfx('tap'); close(); quit(false); });

  return {
    el,
    stage: $('.mg-stage', el),   // replaced with a fresh element every step, so old listeners go away
    closed,
    get alive() { return document.body.contains(el) && !el.classList.contains('closing'); },
    hint(t) { $('.mg-hint', el).textContent = t; },
    step(i, hintText = '') {
      el.querySelectorAll('.mg-steps span').forEach((s) => {
        const n = +s.dataset.s;
        s.className = n < i ? 'done' : n === i ? 'now' : '';
        s.querySelector('i').textContent = n < i ? '✓' : n + 1;
      });
      const fresh = document.createElement('div');
      fresh.className = 'mg-stage';
      this.stage.replaceWith(fresh);
      this.stage = fresh;
      this.hint(hintText);
    },
    result({ product, stars, made, bonus }) {
      this.step(steps.length, '');
      this.stage.innerHTML = `<div class="mg-result">
        <div class="mg-result-art">${P(product)}</div>
        <div class="mg-stars">${[1, 2, 3].map((n) => `<span class="${n <= stars ? 'on' : ''}" style="--d:${n * 150}ms">★</span>`).join('')}</div>
        <b>${['', 'Not bad!', 'Lovely work!', 'Perfect!'][stars]}</b>
        <p>+${made} made${bonus ? ' (a bonus one for 3 stars!)' : ''}</p>
        <button class="btn-primary mg-done">Done ✿</button></div>`;
      sfx('chime');
      return new Promise((res) => {
        $('.mg-done', this.stage).addEventListener('click', () => { sfx('tap'); close(); res(true); });
      });
    },
  };
}

// 0–1 scores → 1–3 stars
export const starsFor = (scores) => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg >= 0.85 ? 3 : avg >= 0.6 ? 2 : 1;
};

// "Hold to …" helper: calls onTick(dtSeconds) every frame while held; onRelease when let go.
export function holdButton(btn, { onTick, onRelease }) {
  let raf = 0, last = 0, held = false;
  const loop = (t) => { if (!held) return; onTick((t - last) / 1000); last = t; raf = requestAnimationFrame(loop); };
  const down = (e) => { e.preventDefault(); if (btn.disabled || held) return; held = true; btn.classList.add('held'); last = performance.now(); raf = requestAnimationFrame(loop); };
  const up = () => { if (!held) return; held = false; btn.classList.remove('held'); cancelAnimationFrame(raf); onRelease && onRelease(); };
  btn.addEventListener('pointerdown', down);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointerleave', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
