// Guinny's tea recipe book (user art: assets/img/book). Opened from the book icon on the
// tea-brewing screen. Four pages: general teas (2 pages) and special teas (2 pages).
// Wide screens show a two-page spread; tall screens show one page at a time.
// A recipe is filled in once that tea has been brewed; until then it shows as "???".
import { S } from './state.js';
import { GENERAL, SPECIAL, recipeFor, teaSprite } from './teas.js';
import { $, $$, h, sfx } from './ui.js';

const ING_IMG = (k) => `assets/img/ingredients/${k}.webp`;
const PAGES = [
  { title: 'General Teas', ids: Object.keys(GENERAL).slice(0, 5) },
  { title: 'General Teas', ids: Object.keys(GENERAL).slice(5) },
  { title: 'Special Teas', ids: Object.keys(SPECIAL).reverse().slice(0, 5) },
  { title: 'Special Teas', ids: Object.keys(SPECIAL).reverse().slice(5) },
];
const NAMES = { ...GENERAL, ...SPECIAL };

function row(id) {
  const rec = S.recipes[id], t = NAMES[id], r = recipeFor(id);
  const parts = Object.entries(r.parts).map(([k, c]) =>
    `<span class="rb-ing"><img src="${ING_IMG(k)}" alt="">${rec ? `×${c}` : ''}</span>`).join('');
  return `<div class="rb-row ${rec ? '' : 'locked'}">
    <img class="rb-cup" src="${teaSprite(id)}" alt="">
    <div class="rb-info">
      <b>${rec ? t.name : '???'}</b>
      <div class="rb-ings">${parts}</div>
      <small>${rec ? `${r.line} · brewed ${rec.n}×` : 'Brew it to record this recipe'}</small>
    </div>
  </div>`;
}

export function openRecipeBook() {
  const wrap = h(`<div class="rb-wrap" role="dialog" aria-modal="true" aria-label="Recipe book">
    <div class="rb-backdrop"></div>
    <div class="rb-book">
      <img class="rb-bg" src="assets/img/book/open.webp" alt="" draggable="false">
      <div class="rb-page" data-side="0"></div><div class="rb-page" data-side="1"></div>
    </div>
    <div class="rb-nav">
      <button class="btn-round rb-prev" aria-label="Previous page">◀</button>
      <span class="rb-count"></span>
      <button class="btn-round rb-next" aria-label="Next page">▶</button>
    </div>
    <button class="btn-round rb-close" aria-label="Close">✕</button>
  </div>`);
  const book = $('.rb-book', wrap);
  let at = 0;   // first page shown
  const found = Object.keys(NAMES).filter((id) => S.recipes[id]).length;

  const draw = () => {
    const spread = innerWidth > innerHeight * 1.1;
    book.dataset.mode = spread ? 'spread' : 'single';
    const per = spread ? 2 : 1;
    at = Math.floor(at / per) * per;
    $$('.rb-page', book).forEach((el, i) => {
      const n = at + i, pg = PAGES[n];
      el.hidden = !pg || i >= per;
      if (!pg) return;
      el.innerHTML = `<h3>${pg.title}<small>${n === 0 ? `${found} / ${Object.keys(NAMES).length} recorded` : ''}</small></h3>${pg.ids.map(row).join('')}`;
    });
    // single page: show the matching half of the open-book art
    book.dataset.half = spread ? '' : at % 2 ? 'right' : 'left';
    $('.rb-count', wrap).textContent = spread ? `${at / 2 + 1} / ${PAGES.length / 2}` : `${at + 1} / ${PAGES.length}`;
    $('.rb-prev', wrap).disabled = at === 0;
    $('.rb-next', wrap).disabled = at + per >= PAGES.length;
  };
  const close = () => { document.body.classList.remove('rb-open'); removeEventListener('resize', draw); wrap.classList.add('closing'); setTimeout(() => wrap.remove(), 200); };
  $('.rb-prev', wrap).addEventListener('click', () => { at -= book.dataset.mode === 'spread' ? 2 : 1; sfx('tap'); draw(); });
  $('.rb-next', wrap).addEventListener('click', () => { at += book.dataset.mode === 'spread' ? 2 : 1; sfx('tap'); draw(); });
  $('.rb-close', wrap).addEventListener('click', () => { sfx('tap'); close(); });
  $('.rb-backdrop', wrap).addEventListener('click', close);
  addEventListener('resize', draw);
  document.body.append(wrap);
  document.body.classList.add('rb-open');
  draw();
}
