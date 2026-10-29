/* =====================================================================
   Momo's Ramen Shop — TUNING
   Every number you might want to change lives here. Edit, save, reload.
   (Loaded before game.js, so the game reads these values at start-up.)
   ===================================================================== */

/* ---- kitchen: soup, noodles, draining, bowl price ---- */
const CFG = {
  SOUP_TARGET:0.80, SOUP_TOL:0.06, SOUP_RATE:0.30,     // bowl fill ratio, per second while the tap is held
  BOIL_MAX:22.4, FIRM_CENTERS:[5.6,8.8,12,15.2,18.4], FIRM_TOL:1.6, // seconds in the water for each texture (20% faster than v1)
  FLICK_KEEP:0.55, WATER_OK:0.15,                       // each flick keeps 55% of the water; ≤15% is a clean drain
  PRICE:980,
};

/* ---- customers: pat = patience ×, tip = tip ×, perfect = bonus at 95+, size = how big they look (Soso = 1) ---- */
const CUSTOMERS = {
  soso:{name:'Soso', size:1, pat:.7, tip:2.6, perfect:300, hi:"Soso's here~ ♡ You know my usual, right?",
    react:{S:"Soso love Momo Ramen! ♡",A:"Yummy~! Soso will come again!",B:"Hmm, not quite… Soso will still eat it!",C:"So…?"}},
  rang:{name:'Rang', size:.87, pat:1, tip:1, perfect:700, hi:"Rangahahaha! I'm STARVING!",
    react:{S:"RANGAHAHAHA!! The best!!",A:"Haha! Tasty!",B:"Eh, close enough!",C:"Rang…?"}},
  kew:{name:'Kew', size:.82, pat:1.5, tip:1, perfect:400, hi:"…One bowl, please.",
    react:{S:"…Perfect ramen, thank you.",A:"Mm. A bowl that calms the mind.",B:"This too is training.",C:"…Kew."}},
  bae:{name:'Bae', size:.87, pat:1.2, tip:1.2, perfect:300, hi:"Hello, one bowl of Ramen please!",
    react:{S:"Yum! Thank you for the great meal.",A:"Taste good, thank you...!",B:"Oh... not what I expected...",C:"Bae...!"}},
  popo:{name:'Popo', size:1.2, pat:0.7, tip:2, perfect:500, hi:"How is the shop doing?",
    react:{S:"Not bad, quite well done actually.",A:"Not too shabby, can be better.",B:"Hmm… Read my recipe book again.",C:"Popo…"}},
};

/* ---- audio volumes (0–1) ---- */
const VOL={ titleMusic:.13, titleShop:.36, dayMusic:.25, nightMusic:.27, sfx:.95 };   // music ×0.6 (v8 feedback)

/* ---- night market: price per pack, base = portions from a perfect prep ---- */
const MARKET={   // a pack bought at night → Momo preps it → up to `base` portions (fewer if the prep is messy)
  chashu:{name:'Chashu',      pack:'Pork belly roll',    price:800, base:6, img:'assets/pk_chashu.webp',      unit:'portions'},
  green: {name:'Green onion', pack:'Naganegi stalks',  price:250, base:6, img:'assets/pk_green_onion.webp', unit:'portions'},
  white: {name:'White onion', pack:'Bag of tamanegi',    price:300, base:6, img:'assets/pk_white_onion.webp', unit:'portions'},
  nori:  {name:'Seaweed',     pack:'Raw nori sheets',    price:350, base:6, img:'assets/pk_seaweed.webp',     unit:'portions'},
  noodle:{name:'Noodles',     pack:'Fresh noodle dough', price:500, base:8, img:'assets/pk_noodles.webp',     unit:'bundles'},
};

/* Kitchenware sold on Momo's iPad. Effect fields (the best one you own counts, bowl bonuses add up):
   soup  = soup pours × faster        flick = water kept per flick × (lower = better)   oneFlick = a single flick drains it all
   pat   = customers wait × longer    bonus = + share of every bowl's price            boil  = boil time × (lower = faster)
   maxBuy = packs of one ingredient you can buy a night (default 3)   types = kinds of ingredients delivered a night (default 3)
   req   = id of the upgrade you must own first      minDay = shows up from that night on (e.g. 4 = after Day 4)
   cat   = iPad filter: 'kitchen' (Kitchen Equipment) · 'prep' (Prep) · 'store' (Storefront) */
const UPGRADE_CATS=[['all','All'],['kitchen','Kitchen Equipment'],['prep','Prep'],['store','Storefront']];
const UPGRADES=[
  {id:'tap',    name:'Soup tap',          price:3000,  soup:1.4,  desc:'Soup pours 1.4× faster.', cat:'kitchen'},
  {id:'tap2',   name:'Super tap',         price:5000,  soup:2,    desc:'Soup pours 2× faster.', cat:'kitchen'},
  {id:'tebo',   name:'Tebo strainer',     price:1000,  flick:.8,  desc:'Each flick drains 20% better.', cat:'kitchen'},
  {id:'tebo2',  name:'Tebo Plus',         price:3500,  flick:.5,  desc:'Each flick drains 50% better.', req:'tebo', cat:'kitchen'},
  {id:'tebo3',  name:'Ultra Tebo',        price:8000,  oneFlick:true, desc:'One flick drains it all.', req:'tebo2', cat:'kitchen'},
  {id:'bell',   name:'Timer bell',        price:1500,             desc:'Dings when the noodles reach the ordered texture.', cat:'kitchen'},
  {id:'restore',name:'Restoranator',      price:67600,            desc:"Dr Mo's time machine! “Toss noodles” becomes “Restore noodles”: boiled noodles go back in the box raw.", cat:'kitchen'},
  {id:'knife',  name:'Chashu knife',      price:2000,             desc:'Wider timing when slicing chashu at night.', cat:'prep'},
  {id:'mold',   name:'Ramen mold',        price:2000,             desc:'When bundling noodles at night, the scale slows down 80% near 140 g.', cat:'prep'},
  {id:'stock1', name:'More Stocks!',        price:4000,  maxBuy:4,  desc:'Buy up to 4 packs of each ingredient a night.', cat:'prep'},
  {id:'stock2', name:'More More Stocks!',   price:8000,  maxBuy:7,  desc:'Buy up to 8 packs of each ingredient a night.', req:'stock1', minDay:6, cat:'prep'},
  {id:'stock3', name:'Momomomore Stocks!',  price:15000, maxBuy:15, desc:'Buy up to 16 packs of each ingredient a night.', req:'stock2', minDay:12, cat:'prep'},
  {id:'inv',    name:'Inventory Up!',       price:6000,  types:4,   desc:'4 kinds of ingredients delivered each night instead of 3.', cat:'prep'},
  {id:'plush',  name:'Plush cushion',     price:3000,  pat:1.2,   desc:'Customers wait 1.2× longer.', cat:'store'},
  {id:'fluffy', name:'Fluffy cushion',    price:7000,  pat:1.7,   desc:'Customers wait 1.7× longer.', req:'plush', cat:'store'},
  {id:'lemon',  name:"Soso's lemon water",price:2000,  bonus:.03, desc:'+3% on every bowl.', cat:'store'},
  {id:'noren',  name:'Noren curtain',     price:5000,  bonus:.07, desc:'+7% on every bowl.', cat:'store'},
  {id:'doll',   name:'Momo doll',         price:8000,  bonus:.12, desc:'+12% on every bowl.', cat:'store'},
  {id:'boil1',  name:'Strong burner',     price:2500,  boil:.9,   desc:'Noodles boil 10% faster.', cat:'kitchen'},
  {id:'boil2',  name:'Ultra burner',      price:8000,  boil:.7,   desc:'Noodles boil 30% faster.', req:'boil1', cat:'kitchen'},
  {id:'boil3',  name:'Turbo burner',      price:15000, boil:.5,   desc:'Noodles boil 50% faster.', req:'boil2', cat:'kitchen'},
];

/* ---- story economy ---- */
const ECON={
  START_MONEY:2000,
  START_STOCK:{chashu:4,green:4,white:3,nori:4,noodle:6},
  rent:d=>1200+400*(d-1),                 // paid every night
  customers:d=>Math.min(8,3+d),           // customers per day
  patience:d=>Math.max(55,110-(d-1)*8),   // seconds a customer waits from order to tray
  TIP_HIGH:200, TIP_MID:100,              // tips (score ≥ 55); each customer multiplies these
  PREP_YIELD:1/3,                         // minigame restock is ⅓ of a pack's base (2/3 less than v5)
  PATIENCE_SLOWER:.85,                    // patience drains 15% slower for everyone
};

const ATLAS_DIR='atlases/';               // folder of the 1024px ramen sheets (Ramen Book thumbnails)
