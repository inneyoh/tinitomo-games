// Notepad app on the garden iPad: Guinny's Flower Encyclopedia.
//  - Contents page: every flower, with how far each page is filled in
//  - Flower page: Guinny's records (planted / watered / harvested / sold, first dates),
//    flower language, field notes, trivia, uses, and Guinny's own notes, which she
//    writes as you reach harvest milestones
// Locked → planting a flower opens its page → harvesting fills in the rest.
import { FLOWERS, PRODUCTS } from './data.js';
import { S } from './state.js';
import { F, P } from './art.js';
import { ENCYCLOPEDIA, MILESTONES } from './encyclopedia.js';
import { sfx } from './ui.js';

const rec = (k) => {
  const j = S.journal[k] || { planted: 0, watered: 0, harvested: 0, first: {} };
  return { ...j, harvested: Math.max(j.harvested || 0, S.harvested[k] || 0), first: j.first || {} };
};
const seen = (k) => { const r = rec(k); return r.planted > 0 || r.harvested > 0; };
const rank = (n) => MILESTONES.filter((m) => n >= m.at).pop() || null;
const date = (t) => (t ? new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const where = (f) => f.where.map((w) => (w === 'pot' ? 'flower pot' : 'planter')).join(' or ');
// how much of the page is filled in: opened, harvested, + each milestone note
const filled = (k) => {
  const r = rec(k);
  if (!seen(k)) return 0;
  return Math.min(5, 1 + (r.harvested > 0 ? 1 : 0) + MILESTONES.filter((m) => r.harvested >= m.at).length);
};

export function notepadApp() {
  let page = null;   // null = contents, else flower key
  return {
    id: 'notepad', name: 'Notepad', icon: 'notepad',
    render(body, ctx) {
      const keys = Object.keys(FLOWERS);
      if (!page) {
        const pages = keys.filter(seen).length;
        const pct = Math.round((keys.reduce((a, k) => a + filled(k), 0) / (keys.length * 5)) * 100);
        ctx.sub('');
        body.innerHTML = `<div class="nb">
          <div class="nb-cover"><b>Guinny’s Flower Encyclopedia</b><small>${pages} / ${keys.length} pages · ${pct}% filled in</small>
            <div class="nb-progress"><i style="width:${pct}%"></i></div></div>
          <div class="nb-index">${keys.map((k) => {
            const f = FLOWERS[k], r = rec(k), on = seen(k), rk = rank(r.harvested);
            return `<button class="nb-tile ${on ? '' : 'locked'}" data-page="${k}" ${on ? '' : 'aria-disabled="true"'}>
              <i>${F(k)}</i><b>${on ? f.name : '???'}</b>
              <small>${on ? (rk ? rk.mark + ' ' + rk.stamp : 'Planted, not yet harvested') : 'Plant one to start this page'}</small>
              <span class="nb-dots">${'●'.repeat(filled(k))}${'○'.repeat(5 - filled(k))}</span></button>`;
          }).join('')}</div></div>`;
        body.onclick = (e) => {
          const t = e.target.closest('[data-page]');
          if (!t) return;
          if (t.classList.contains('locked')) { sfx('soft'); return; }
          sfx('tap'); page = t.dataset.page; ctx.redraw(); body.scrollTop = 0;
        };
        return;
      }

      const k = page, f = FLOWERS[k], e = ENCYCLOPEDIA[k] || {}, r = rec(k), rk = rank(r.harvested);
      const known = r.harvested > 0;
      const sold = Object.entries(PRODUCTS).filter(([pk, p]) => p.needs[k] && (!p.urn || S.recipes[pk])).map(([pk, p]) => ({ pk, p, n: S.sold[pk] || 0 }));
      const soldTotal = sold.reduce((a, s) => a + s.n, 0);
      const next = MILESTONES.find((m) => r.harvested < m.at);
      const locked = (text) => `<p class="nb-locked">${text}</p>`;
      ctx.sub('');
      body.innerHTML = `<div class="nb nb-page">
        <button class="nb-back">‹ Contents</button>
        <div class="nb-head">
          <i class="nb-art">${F(k)}</i>
          <div><h3>${f.name}</h3><small>${e.jp || ''} · ${e.family || ''}</small>
            ${rk ? `<span class="nb-stamp">${rk.mark} ${rk.stamp}</span>` : ''}</div>
        </div>

        <h4>Guinny’s records</h4>
        <div class="nb-stats">
          <div><b>${r.planted || 0}</b><small>times planted</small></div>
          <div><b>${r.watered || 0}</b><small>waterings</small></div>
          <div><b>${r.harvested}</b><small>harvested</small></div>
          <div><b>${soldTotal}</b><small>sold in goods</small></div>
        </div>
        <ul class="nb-list">
          <li>First planted: <b>${date(r.first.planted)}</b></li>
          <li>First harvest: <b>${date(r.first.harvest)}</b></li>
          <li>In the basket now: <b>${S.flowers[k] || 0}</b> · seeds in the bag: <b>${S.seeds[k] || 0}</b></li>
        </ul>

        <h4>Flower language 花言葉</h4>
        ${known ? `<p class="nb-quote">“${e.language}”</p>` : locked('Harvest one to find out what it means…')}

        <h4>Field notes</h4>
        <ul class="nb-list">
          <li>Home: <b>${e.origin || '—'}</b></li>
          <li>Season: <b>${e.season || '—'}</b></li>
          <li>Grows in a ${where(f)} · about ${f.growMin} min · ${f.yield} per harvest · seeds ${f.seedCost} coins</li>
          ${known && e.care ? `<li>Care tip: ${e.care}</li>` : ''}
        </ul>

        <h4>Trivia</h4>
        ${known ? `<ul class="nb-list nb-trivia">${(e.trivia || []).map((t) => `<li>${t}</li>`).join('')}</ul>` : locked('Harvest one to fill in some trivia…')}

        <h4>Used in</h4>
        <div class="nb-uses">${sold.length ? sold.map(({ pk, p, n }) => `<span><i>${P(pk)}</i>${p.name}<small>${n} sold</small></span>`).join('') : '<p class="nb-locked">Not used in any goods yet.</p>'}</div>

        <h4>Guinny’s notes</h4>
        <div class="nb-notes">${(e.notes || []).map((n, i) => (r.harvested >= MILESTONES[i].at
          ? `<p class="nb-note"><span>${i === 0 && r.first.harvest ? date(r.first.harvest) : MILESTONES[i].stamp}</span>${n}</p>`
          : locked(`Harvest ${MILESTONES[i].at} to write the next note${i === 0 ? '' : ` (${r.harvested}/${MILESTONES[i].at})`}…`))).join('')}</div>
        ${next ? '' : '<p class="nb-done">✿ Page complete! ✿</p>'}
      </div>`;
      body.onclick = (ev) => {
        if (ev.target.closest('.nb-back')) { sfx('tap'); page = null; ctx.redraw(); body.scrollTop = 0; }
      };
    },
  };
}
