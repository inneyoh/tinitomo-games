// Game data: flowers, products, decor, customers.
// Tweak numbers here to balance the game. Art keys map to js/art.js
// (or to real image files once final assets are added — see README).

// Garden crops. `where`: which plots they grow in (soil bed / flower pot).
export const FLOWERS = {
  chamomile: { name: 'Chamomile',  seedCost: 5,  growMin: 3,  yield: 2, where: ['soil', 'pot'], petal: '#FBF6EA', center: '#F2C94C', petals: 10,
    note: 'Little apple-scented daisies. Dried flowers make the gentlest bedtime tea.' },
  mint:      { name: 'Mint',       seedCost: 5,  growMin: 2,  yield: 2, where: ['pot', 'soil'], petal: '#B9D9B4', center: '#8DB88A', petals: 0, leaf: true,
    note: 'Grows so eagerly it is best kept in a pot. Fresh, cool and great in tea.' },
  daisy:     { name: 'Daisy',      seedCost: 6,  growMin: 4,  yield: 2, where: ['soil'], petal: '#F7D9DE', center: '#F2C94C', petals: 8,
    note: 'Cheerful and easy. A bundle of daisies is the shop’s favourite bouquet.' },
  lavender:  { name: 'Lavender',   seedCost: 10, growMin: 6,  yield: 2, where: ['soil', 'pot'], petal: '#C9BCE3', center: '#A897CF', petals: 0, spike: true,
    note: 'Loves sun and dry feet. Its calm scent goes into perfume and tea blends.' },
  strawberry:{ name: 'Strawberry', seedCost: 8,  growMin: 5,  yield: 3, where: ['pot', 'soil'], petal: '#F0A9A8', center: '#A9C79A', petals: 0, fruit: true,
    note: 'Sweet little berries that ripen in pots. Lovely in a fruity tea.' },
  rose:      { name: 'Rose',       seedCost: 12, growMin: 8,  yield: 2, where: ['soil'], petal: '#EBA9AE', center: '#D98A92', petals: 5, rose: true,
    note: 'Takes patience, but nothing smells sweeter. Pressed into Guinny’s best perfume.' },
  hydrangea: { name: 'Hydrangea',  seedCost: 15, growMin: 10, yield: 2, where: ['soil'], petal: '#B8CDE8', center: '#E9B7CF', petals: 0, cluster: true,
    note: 'Big soft clusters of blue and pink. The star of the fanciest bouquet.' },
};

// Garden plots: 8 wooden planters × 4 patches, plus 2 flower pots.
// Planters 0–1 are open from the start; the rest unlock with upgrades.
// Positions live in css/style.css ("Garden" section).
const PLANTER_UNLOCK = [null, null, 'beds', 'beds', 'beds2', 'beds2', 'beds3', 'beds3'];
export const PLANTERS = PLANTER_UNLOCK.map((unlock) => ({ unlock }));
export const PLOTS = [
  ...PLANTER_UNLOCK.flatMap((unlock, planter) => [0, 1, 2, 3].map((q) => ({ type: 'soil', planter, q, unlock }))),
  { type: 'pot', pot: 'big', unlock: null },
  { type: 'pot', pot: 'small', unlock: null },
];

// Garden upgrades, sold in the Shop on the garden iPad.
export const UPGRADES = {
  beds:      { name: 'Two More Planters',   cost: 120, desc: 'Build two more four-patch planters.' },
  beds2:     { name: 'Even More Planters',  cost: 260, desc: 'Two more planters.', requires: 'beds' },
  beds3:     { name: 'A Full Garden',       cost: 420, desc: 'The last two planters.', requires: 'beds2' },
  bigcan:    { name: 'Big Watering Can',    cost: 150, desc: 'One watering lasts until harvest.' },
  compost:   { name: 'Compost Bin',         cost: 200, desc: 'Everything grows 25% faster.' },
  basket:    { name: 'Woven Basket',        cost: 180, desc: '+1 harvest from every patch.' },
  sprinkler: { name: 'Little Sprinkler',    cost: 400, desc: 'Planters water themselves.' },
};

export const CATEGORIES = {
  tea:     { name: 'Tea',     steps: ['Pick petals', 'Dry & blend', 'Fill the tin'] },
  perfume: { name: 'Perfume', steps: ['Press petals', 'Distill', 'Bottle it'] },
  bouquet: { name: 'Bouquet', steps: ['Gather stems', 'Arrange', 'Tie a ribbon'] },
};

export const PRODUCTS = {
  chamomile_tea:     { name: 'Chamomile Tea',     cat: 'tea',     price: 18, makes: 2, method: 'pack', needs: { chamomile: 2 }, color: '#F4E3A6' },
  mint_tea:          { name: 'Mint Tea',          cat: 'tea',     price: 16, makes: 2, method: 'pack', needs: { mint: 2 },      color: '#C4E0C0' },
  garden_blend:      { name: 'Garden Blend Tea',  cat: 'tea',     price: 28, makes: 2, method: 'brew', needs: { chamomile: 1, mint: 1, lavender: 1 }, color: '#D9CFEA' },
  lavender_perfume:  { name: 'Lavender Perfume',  cat: 'perfume', price: 48, makes: 1, needs: { lavender: 3 }, color: '#CFC3EA' },
  strawberry_tea:    { name: 'Strawberry Tea',    cat: 'tea',     price: 26, makes: 2, method: 'brew', needs: { strawberry: 2, chamomile: 1 }, color: '#F4CFCB' },
  rose_perfume:      { name: 'Rose Perfume',      cat: 'perfume', price: 60, makes: 1, needs: { rose: 3 },     color: '#F2BFC4' },
  daisy_bouquet:     { name: 'Daisy Bouquet',     cat: 'bouquet', price: 30, makes: 1, fresh: true, needs: { daisy: 4 },    color: '#F7D9DE', flowers: ['daisy', 'chamomile', 'daisy'] },
  hydrangea_bouquet: { name: 'Hydrangea Bouquet', cat: 'bouquet', price: 72, makes: 1, fresh: true, needs: { hydrangea: 2, daisy: 2 }, color: '#B8CDE8', flowers: ['hydrangea', 'daisy', 'hydrangea'] },
};

// Bouquets are `fresh`: arranged to order at the packing counter, straight from the flower basket.

// Decor: each item has its own spot in the shop scene.
export const DECOR = {
  bunting:   { name: 'Petal Bunting',    cost: 40,  charm: 2, desc: 'Little flags across the ceiling.' },
  fern:      { name: 'Potted Fern',      cost: 30,  charm: 1, desc: 'A leafy friend by the door.' },
  rug:       { name: 'Cozy Rug',         cost: 60,  charm: 2, desc: 'Soft steps for every guest.' },
  painting:  { name: 'Flower Painting',  cost: 80,  charm: 3, desc: 'A watercolor of the garden.' },
  lantern:   { name: 'Paper Lantern',    cost: 70,  charm: 2, desc: 'A warm glow, day and night.' },
  windowbox: { name: 'Window Box',       cost: 90,  charm: 3, desc: 'Blooms on the windowsill.' },
  shelf:     { name: 'Extra Shelf',      cost: 150, charm: 1, desc: 'Sell one more item each day (+1 lineup slot).', slots: 1 },
  plush:     { name: 'Sleepy Cat Plush', cost: 120, charm: 4, desc: 'Naps on the counter. Very popular.' },
};

// Placeholder customers borrowed from Momo's Ramen Shop (assets/img/customers/)
export const CUSTOMERS = ['bae', 'bun', 'gwoof', 'kew', 'kuma', 'piyo', 'popo', 'rang', 'soso']
  .map((id) => ({ id, name: id[0].toUpperCase() + id.slice(1) }));

export const GREETINGS = ['Hello~', 'Good day!', 'Smells lovely in here', 'Hi Guinny!', 'What a cozy shop'];
export const THANKS = ['Thank you!', 'Lovely~', 'See you tomorrow!', 'Perfect ♡', 'Yay!'];

export const START = {
  coins: 120,
  flowers: { chamomile: 4, mint: 2, daisy: 8 },
  seeds: { chamomile: 3, daisy: 3, mint: 2 },
  stock: { chamomile_tea: 3, mint_tea: 2 },
  lineup: ['chamomile_tea', 'daisy_bouquet', 'mint_tea'],
  baseSlots: 3,
};
