// iPad pop-up (user art in assets/img/ipad). A tablet with a home screen of app icons;
// tapping an icon opens that app on the tablet screen. The bezel home button (or
// "‹ Home") goes back, and tapping outside the tablet closes it.
// Portrait screens show the tablet upright; landscape screens turn it sideways.
//
// openTablet({ theme: 'shop' | 'garden', apps: [{ id, name, icon, render(body, ctx) }], start, onClose })
//   render(body, ctx) draws the app into `body` (set body.onclick for its buttons);
//   ctx.sub(text) sets the line under the title, ctx.redraw() draws the app again.
import { $, $$, h, sfx } from './ui.js';

const IMG = 'assets/img/ipad/';
let current = null;

export function closeTablet() { if (current) current(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTablet(); });

export function openTablet({ theme, apps, start = null, onClose }) {
  closeTablet();
  const wrap = h(`<div class="tab-wrap" role="dialog" aria-modal="true" aria-label="iPad">
    <div class="tab-backdrop"></div>
    <div class="tablet">
      <img class="tablet-frame" alt="" draggable="false">
      <div class="tablet-screen" style="background-image:url(${IMG}wall-${theme}.webp)">
        <div class="t-home">
          <div class="t-status"><span class="t-clock"></span><span>Guinny’s iPad</span></div>
          <div class="t-apps">${apps.map((a) => `
            <button class="t-app" data-app="${a.id}"><img src="${IMG}icon-${a.icon}.webp" alt="" draggable="false"><span>${a.name}</span></button>`).join('')}</div>
        </div>
        <div class="t-appview">
          <div class="t-bar"><button class="t-back">‹ Home</button><b class="t-title"></b></div>
          <p class="t-sub"></p>
          <div class="t-body"></div>
        </div>
      </div>
      <button class="t-homebtn" aria-label="Home button"></button>
      <button class="btn-round t-close" aria-label="Close">✕</button>
    </div></div>`);
  const tablet = $('.tablet', wrap), body = $('.t-body', wrap), view = $('.t-appview', wrap);
  let app = null;

  const orient = () => {
    const o = innerWidth > innerHeight ? 'l' : 'p';
    tablet.dataset.o = o;
    $('.tablet-frame', wrap).src = `${IMG}frame-${theme}-${o}.webp`;
  };
  const clock = () => { $('.t-clock', wrap).textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  const ctx = { sub: (t) => { $('.t-sub', wrap).textContent = t; }, redraw: () => app && draw() };
  const draw = () => { const top = body.scrollTop; app.render(body, ctx); body.scrollTop = top; };
  const openApp = (id) => {
    app = apps.find((a) => a.id === id);
    $('.t-title', wrap).textContent = app.name;
    ctx.sub('');
    body.onclick = null;
    app.render(body, ctx);
    body.scrollTop = 0;
    tablet.classList.add('in-app');
  };
  const home = () => { app = null; tablet.classList.remove('in-app'); };
  const close = () => {
    if (current !== close) return;
    current = null;
    removeEventListener('resize', orient);
    clearInterval(timer);
    wrap.classList.add('closing');
    setTimeout(() => wrap.remove(), 220);
    onClose && onClose();
  };

  $$('.t-app', wrap).forEach((b) => b.addEventListener('click', () => { sfx('pop'); openApp(b.dataset.app); }));
  $('.t-back', wrap).addEventListener('click', () => { sfx('tap'); home(); });
  $('.t-homebtn', wrap).addEventListener('click', () => { sfx('tap'); if (app) home(); else close(); });
  $('.t-close', wrap).addEventListener('click', () => { sfx('tap'); close(); });
  $('.tab-backdrop', wrap).addEventListener('click', close);
  addEventListener('resize', orient);
  const timer = setInterval(clock, 15000);
  orient(); clock();
  document.body.append(wrap);
  current = close;
  if (start) openApp(start);
  return { close, redraw: ctx.redraw };
}
