// Teas brewed in the tea urn, and the rules that decide which tea a brew becomes.
// A brew is the number of pieces of each ingredient used to fill the urn (4×5 = 20 squares).
//
// How a brew is judged:
//  1. Special teas are checked first. A special matches if its classic recipe is met
//     (at least that many of each ingredient), or its "balanced" rule is met. The balanced
//     rules also need the special's ingredients to fill at least 8 squares, so a pinch of
//     something doesn't turn a whole urn into a special tea.
//     If several specials match, the one with more ingredients wins, then the one whose
//     ingredients fill more squares, then the earlier one in the list.
//  2. Otherwise it's a general tea: the ingredient used most (ties: the one filling more squares).
// Recipes are written into the recipe book the first time they're brewed.

export const BREW_INGREDIENTS = ['lavender', 'mint', 'chamomile', 'camellia', 'rose', 'butterfly_pea', 'earl_grey', 'darjeeling', 'lapsang', 'chai'];
export const LEAF = ['earl_grey', 'darjeeling', 'lapsang', 'chai'];
// squares each ingredient's piece fills in the urn
export const SQUARES = { lavender: 3, mint: 3, chamomile: 4, camellia: 3, rose: 4, butterfly_pea: 3, earl_grey: 2, darjeeling: 2, lapsang: 2, chai: 2 };

const n = (u, k) => u[k] || 0;
const has = (u, ks) => ks.every((k) => n(u, k) >= 1);
const spread = (u, ks) => { const v = ks.map((k) => n(u, k)); return Math.max(...v) - Math.min(...v); };
const atLeast = (u, r) => Object.entries(r).every(([k, c]) => n(u, k) >= c);
const leaves = (u) => LEAF.reduce((a, k) => a + n(u, k), 0);
const squares = (u, ks) => ks.reduce((a, k) => a + n(u, k) * SQUARES[k], 0);
const usedKeys = (u) => Object.keys(u).filter((k) => n(u, k) > 0);

// General teas: mostly one ingredient
export const GENERAL = {
  tea_lavender:      { name: 'Lavender Tea',      main: 'lavender',      price: 24, color: '#E9B566' },
  tea_mint:          { name: 'Mint Tea',          main: 'mint',          price: 22, color: '#B6C48B' },
  tea_chamomile:     { name: 'Chamomile Tea',     main: 'chamomile',     price: 22, color: '#EEB45E' },
  tea_camellia:      { name: 'Camellia Tea',      main: 'camellia',      price: 26, color: '#E6B57A' },
  tea_rose:          { name: 'Rose Tea',          main: 'rose',          price: 28, color: '#E2A3A3' },
  tea_butterfly_pea: { name: 'Butterfly Pea Tea', main: 'butterfly_pea', price: 26, color: '#8A8FC9' },
  tea_earl_grey:     { name: 'Earl Grey',         main: 'earl_grey',     price: 24, color: '#DE8C5B' },
  tea_darjeeling:    { name: 'Darjeeling',        main: 'darjeeling',    price: 26, color: '#E8A25B' },
  tea_lapsang:       { name: 'Lapsang Souchong',  main: 'lapsang',       price: 26, color: '#B3584E' },
  tea_chai:          { name: 'Chai',              main: 'chai',          price: 26, color: '#DDB487' },
};

// Special teas, in priority order. `recipe` is the classic recipe shown in the book;
// `keys` are the ingredients that make it special; `alt` is the balanced rule.
export const SPECIAL = {
  sp_guinny: { name: 'Guinny’s Special', price: 90, color: '#7FA8C9',
    // the suggested 3 butterfly pea + 1 mint + 2 camellia + 2 darjeeling needs 22 squares,
    // one more than the urn holds, so it uses 1 darjeeling (exactly 20 squares)
    recipe: { butterfly_pea: 3, mint: 1, camellia: 2, darjeeling: 1 }, alt: () => false },
  sp_flower: { name: 'Flower Tea', price: 58, color: '#E8A9AE',
    recipe: { lavender: 2, rose: 2, camellia: 2 },
    alt: (u) => leaves(u) >= 2 && has(u, ['lavender', 'rose', 'camellia']) && spread(u, ['lavender', 'rose', 'camellia']) <= 2 },
  sp_serenity: { name: 'Serenity Brew', price: 54, color: '#9AA3D6',
    recipe: { lavender: 1, butterfly_pea: 1, chamomile: 2 },
    alt: (u) => n(u, 'chai') >= 1 && has(u, ['lavender', 'butterfly_pea', 'chamomile']) && spread(u, usedKeys(u)) <= 1 },
  sp_butterfly_rose: { name: 'Butterfly Rose Tea', price: 50, color: '#9C7BC4',
    recipe: { butterfly_pea: 1, rose: 1, darjeeling: 1 },
    alt: (u) => n(u, 'darjeeling') >= 2 && has(u, ['butterfly_pea', 'rose']) && spread(u, ['butterfly_pea', 'rose']) <= 2 },
  sp_camellia_mint: { name: 'Camellia Mint Tea', price: 48, color: '#D5674F',
    recipe: { mint: 1, camellia: 1, lapsang: 1 },
    alt: (u) => n(u, 'lapsang') >= 2 && has(u, ['camellia', 'mint']) && spread(u, ['camellia', 'mint']) <= 2 },
  sp_lavender_earl_grey: { name: 'Lavender Earl Grey', price: 44, color: '#E7A54F',
    recipe: { lavender: 2, earl_grey: 2 }, alt: (u) => has(u, ['lavender', 'earl_grey']) && spread(u, ['lavender', 'earl_grey']) <= 2 },
  sp_chai_mint: { name: 'Chai Mint Tea', price: 44, color: '#E7C4A3',
    recipe: { mint: 2, chai: 2 }, alt: (u) => has(u, ['mint', 'chai']) && spread(u, ['mint', 'chai']) <= 2 },
  sp_rose_darjeeling: { name: 'Rose Darjeeling', price: 46, color: '#D56F5A',
    recipe: { rose: 2, darjeeling: 2 }, alt: (u) => has(u, ['rose', 'darjeeling']) && spread(u, ['rose', 'darjeeling']) <= 2 },
  sp_camellia_rose: { name: 'Camellia Rose Tea', price: 48, color: '#E9A0A8',
    recipe: { camellia: 2, rose: 2 }, alt: (u) => has(u, ['camellia', 'rose']) && spread(u, ['camellia', 'rose']) <= 2 },
  sp_healing: { name: 'Healing Brew', price: 42, color: '#BFC077',
    recipe: { mint: 2, chamomile: 2 },
    alt: (u) => leaves(u) >= 1 && has(u, ['mint', 'chamomile']) && spread(u, ['mint', 'chamomile']) <= 1 },
};
for (const s of Object.values(SPECIAL)) s.keys = Object.keys(s.recipe);

export const TEAS = { ...GENERAL, ...SPECIAL };
export const teaSprite = (id) => `assets/img/teas/${id}.webp`;

export function classify(used) {
  const order = Object.keys(SPECIAL);
  const hits = order.filter((id) => {
    const s = SPECIAL[id];
    if (atLeast(used, s.recipe)) return true;
    return squares(used, s.keys) >= 8 && s.alt(used);
  });
  if (hits.length) {
    hits.sort((a, b) => SPECIAL[b].keys.length - SPECIAL[a].keys.length
      || squares(used, SPECIAL[b].keys) - squares(used, SPECIAL[a].keys)
      || order.indexOf(a) - order.indexOf(b));
    return hits[0];
  }
  const main = BREW_INGREDIENTS.filter((k) => n(used, k) > 0)
    .sort((a, b) => n(used, b) - n(used, a) || n(used, b) * SQUARES[b] - n(used, a) * SQUARES[a] || BREW_INGREDIENTS.indexOf(a) - BREW_INGREDIENTS.indexOf(b))[0];
  return `tea_${main || 'chamomile'}`;
}

// What the recipe book shows for a tea: ingredient list + a short line
export function recipeFor(id) {
  if (GENERAL[id]) {
    const k = GENERAL[id].main;
    return { parts: { [k]: LEAF.includes(k) ? 1 : 2 }, line: 'Use more of it than anything else' };
  }
  const s = SPECIAL[id];
  const sq = squares(s.recipe, s.keys);
  return { parts: s.recipe, line: sq >= 20 ? 'Exactly this, nothing else' : 'Fill the rest with anything' };
}
