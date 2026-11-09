// How-to-brew tutorial, shown the first time the tea urn is opened and from the "?" button.
// Uses the shop pop-up frame (openSheet) with illustrated steps built from the game's own art.
import { S, save } from './state.js';
import { teaSprite } from './teas.js';
import { $, $$, h, openSheet, sfx } from './ui.js';

const P = (k) => `assets/img/brew/piece-${k}.webp`;
const I = (k) => `assets/img/ingredients/${k}.webp`;
const grid = (fill = '') => `<div class="tut-urn">${Array.from({ length: 20 }, () => '<i></i>').join('')}${fill}</div>`;

const STEPS = [
  { title: 'Fill the urn',
    text: 'Drag ingredients from the tray into the urn. Use any ingredients you like!',
    art: () => `<div class="tut-row">${grid(`<img class="tut-piece" style="left:0;top:0;width:50%;height:40%" src="${P('chamomile')}">`)}
      <span class="tut-arrow">⟵</span><img class="tut-tray" src="${P('lavender')}" style="height:70px"></div>` },
  { title: 'Turn and fit',
    text: 'Tap a piece in the tray to turn it. Tap a piece in the urn to take it out. Fill every square.',
    art: () => `<div class="tut-row"><img src="${P('mint')}" style="height:64px"><span class="tut-arrow">↻</span>
      <img src="${P('mint')}" style="height:64px;transform:rotate(90deg)"></div>` },
  { title: 'Brew!',
    text: 'When the urn is full, tap Brew. The mix you used decides which tea you get.',
    art: () => `<div class="tut-row">${grid(`<img class="tut-piece" style="left:0;top:0;width:50%;height:40%" src="${P('chamomile')}">
      <img class="tut-piece" style="left:50%;top:0;width:50%;height:40%" src="${P('chamomile')}">
      <img class="tut-piece" style="left:0;top:40%;width:100%;height:20%;object-fit:fill" src="${P('earl_grey')}">`)}
      <span class="tut-btn">Brew ✿</span></div>` },
  { title: 'Classic teas',
    text: 'Use more of one ingredient than anything else to brew its classic tea.',
    art: () => `<div class="tut-row"><span class="tut-ings"><img src="${I('lavender')}">×3 <img src="${I('mint')}">×1</span>
      <span class="tut-arrow">→</span><img class="tut-cup" src="${teaSprite('tea_lavender')}"></div>` },
  { title: 'Special teas',
    text: 'Some ingredients go beautifully together. Use them evenly to discover special teas!',
    art: () => `<div class="tut-row"><span class="tut-ings"><img src="${I('rose')}">×2 <img src="${I('darjeeling')}">×2</span>
      <span class="tut-arrow">→</span><img class="tut-cup" src="${teaSprite('sp_rose_darjeeling')}"></div>` },
  { title: 'Your recipe book',
    text: 'Every new tea is recorded in the recipe book. Tap the book at the top to see your recipes.',
    art: () => `<div class="tut-row"><img src="assets/img/book/icon.webp" style="height:90px"><span class="tut-arrow">→</span>
      <img src="assets/img/book/open.webp" style="height:80px"></div>` },
];

export function showBrewTutorial(force = false) {
  if (!force && S.tutorials.brew) return null;
  S.tutorials.brew = true; save();
  let i = 0;
  const body = h('<div class="tut"></div>');
  const sheet = openSheet({ title: 'How to brew tea', body });
  const draw = () => {
    const st = STEPS[i];
    sheet.setSub(`${i + 1} / ${STEPS.length}`);
    body.innerHTML = `<div class="tut-art">${st.art()}</div><b class="tut-title">${st.title}</b><p class="tut-text">${st.text}</p>
      <div class="tut-dots">${STEPS.map((_, n) => `<i class="${n === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="tut-btns">${i ? '<button class="btn-toggle tut-back">Back</button>' : ''}
        <button class="btn-primary tut-next">${i === STEPS.length - 1 ? 'Let’s brew! ✿' : 'Next'}</button></div>`;
  };
  body.addEventListener('click', (e) => {
    if (e.target.closest('.tut-next')) { sfx('tap'); if (i === STEPS.length - 1) sheet.close(); else { i++; draw(); } }
    if (e.target.closest('.tut-back')) { sfx('tap'); i--; draw(); }
  });
  draw();
  return sheet;
}
