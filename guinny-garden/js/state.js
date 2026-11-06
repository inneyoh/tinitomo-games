// Save/load, real-world clock, and shared helpers.
import { START, DECOR, PRODUCTS, FLOWERS } from './data.js';

const KEY = 'guinny-garden-v1';

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function fresh() {
  return {
    coins: START.coins,
    flowers: { ...START.flowers },
    seeds: { ...START.seeds },
    stock: { ...START.stock },
    lineup: [...START.lineup],
    decor: {},              // key -> { placed: bool }
    plots: Array.from({ length: START.plots }, () => ({ key: null, plantedAt: 0, watered: false })),
    day: { date: todayKey(), number: 1, earned: 0, served: 0 },
    lastDay: null,          // summary of previous day
    settings: { sound: true, speedy: false },
    started: false,
  };
}

export let S = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(fresh(), JSON.parse(raw));
  } catch (_) { /* storage unavailable */ }
  return fresh();
}

let saveTimer = 0;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_) { /* ignore */ }
  }, 150);
}

export function resetSave() {
  try { localStorage.removeItem(KEY); } catch (_) { /* ignore */ }
  S = fresh();
  return S;
}

// --- derived values ----------------------------------------------------
export const charm = () => Object.keys(S.decor).filter(k => S.decor[k].placed).reduce((n, k) => n + DECOR[k].charm, 0);
export const lineupSlots = () => 3 + Object.keys(S.decor).filter(k => S.decor[k].placed && DECOR[k].slots).reduce((n, k) => n + DECOR[k].slots, 0);

// Today's trending product: same for everyone on a given date.
export function trend(date = S.day.date) {
  const keys = Object.keys(PRODUCTS);
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return keys[h % keys.length];
}
// How many of a product can be sold right now (bouquets come straight from flowers)
export function available(key) {
  const p = PRODUCTS[key];
  if (!p.fresh) return S.stock[key] || 0;
  return Math.min(...Object.entries(p.needs).map(([f, n]) => Math.floor((S.flowers[f] || 0) / n)));
}
export const priceOf = (key) => Math.round(PRODUCTS[key].price * (trend() === key ? 1.3 : 1));

// --- garden time ---------------------------------------------------------
export function growMs(key) {
  return FLOWERS[key].growMin * 60_000 * (S.settings.speedy ? 0.1 : 1);
}
// 0 = seeded (needs water), 1 = sprout, 2 = bud, 3 = ready
export function plotStage(p, now = Date.now()) {
  if (!p.key) return -1;
  if (!p.watered) return 0;
  const t = (now - p.plantedAt) / growMs(p.key);
  return t >= 1 ? 3 : t >= 0.45 ? 2 : 1;
}
export function plotRemaining(p, now = Date.now()) {
  return Math.max(0, p.plantedAt + growMs(p.key) - now);
}

// --- real-world clock ------------------------------------------------------
export function timeOfDay(d = new Date()) {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 7.5) return 'dawn';
  if (h >= 7.5 && h < 17) return 'day';
  if (h >= 17 && h < 19.5) return 'dusk';
  return 'night';
}

// Returns true when the real date changed since the last session.
export function rollDay() {
  const k = todayKey();
  if (S.day.date === k) return false;
  S.lastDay = { ...S.day };
  S.day = { date: k, number: S.day.number + 1, earned: 0, served: 0 };
  save();
  return true;
}

export const add = (bag, key, n) => { bag[key] = (bag[key] || 0) + n; if (bag[key] <= 0) delete bag[key]; };
export const fmtTime = (ms) => {
  const s = Math.ceil(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`;
};
