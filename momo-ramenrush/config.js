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
  SCOOP_TIME:.85,                                      // ladle trip length (1 ≈ 0.66 s); .72 lets taps ~0.5 s apart count, faster taps are ignored
};

/* ---- customers: rate = how often they visit (1 normal · 0.5 rare · 0.2 ultra rare), size = how big they look (Soso = 1)
        pat = patience ×, tip = tip ×, perfect = bonus for an S bowl
        profile / likes = what the Customer Book says about them
        fav = their favourite: `order` is what they ask for more often, `row` is the score line that must be perfect
              (or `score` = minimum total), `line` is what they say when you nail it ---- */
const FAV_CHANCE=.5;   // extra chance that a customer orders their favourite
const CUSTOMERS = {
  soso:{name:'Soso', rate:1, size:1, pat:.7, tip:2.6, perfect:300, hi:"Soso's here~ ♡ You know my usual, right?",
    react:{S:"Soso love Momo Ramen! ♡",A:"Yummy~! Soso will come again!",B:"Hmm, not quite… Soso will still eat it!",C:"So…?"},
    profile:"Momo's twin sister. Cutesy, chaotic and very fluffy — loves strawberry milk and Momo.", likes:"Spice level 5",
    fav:{order:{spice:5}, row:'Spice', line:"Level 5 spice~!! Soso's favourite ♡"}},
  rang:{name:'Rang', rate:1, size:.87, pat:1, tip:1, perfect:700, hi:"Rangahahaha! I'm STARVING!",
    react:{S:"RANGAHAHAHA!! The best!!",A:"Haha! Tasty!",B:"Eh, close enough!",C:"Rang…?"},
    profile:"Loud, cheerful and free. Laughs at everything — rangahahaha!", likes:"Rich broth",
    fav:{order:{rich:3}, row:'Richness', line:"RANGAHAHA! That rich broth hits the spot!"}},
  kew:{name:'Kew', rate:1, size:.82, pat:1.5, tip:1, perfect:370, hi:"…One bowl, please.",
    react:{S:"…Perfect ramen, thank you.",A:"Mm. A bowl that calms the mind.",B:"This too is training.",C:"…Kew."},
    profile:"Quiet and polite. Treats every bowl like training. Patience is a virtue.", likes:"Seaweed",
    fav:{order:{nori:0}, row:'Seaweed', line:"…Seaweed. The ocean, in a bowl. Thank you."}},
  bae:{name:'Bae', rate:1, size:.87, pat:1.2, tip:1.5, perfect:300, hi:"Hello, one bowl of Ramen please!",
    react:{S:"Yum! Thank you for the great meal.",A:"Taste good, thank you...!",B:"Oh... not what I expected...",C:"Bae...!"},
    profile:"Gentle, graceful and polite, but worries a little too easily.", likes:"Soft noodles",
    fav:{order:{noodle:3}, row:'Noodles', line:"Soft noodles, just how I like them! Thank you!"}},
  popo:{name:'Popo', rate:0.5, size:1.1, pat:0.75, tip:2, perfect:500, hi:"How is the shop doing?",
    react:{S:"Not bad, quite well done actually.",A:"Not too shabby, can be better.",B:"Hmm… Read my recipe book again.",C:"Popo…"},
    profile:"The actual owner of the store and the (2nd) best cook in town. Loves her ribbons.", likes:"A perfect bowl",
    fav:{score:95, line:"A perfect bowl. I'm proud of you, Momo."}},
};

/* ---- GRADING: how a bowl is scored and what each score leads to ---- */
const GRADING={
  // grade letters: the first one whose minimum the total reaches
  GRADES:[[95,'S'],[85,'A'],[70,'B'],[51,'C'],[0,'D']],
  // most points each part of the bowl can give (they add up to 100). No noodles = Noodles + Draining are 0.
  POINTS:{ 'Dashi':10, 'Soup level':7, 'Richness':10, 'Garlic':9, 'Spice':9, 'Noodles':25, 'Draining':10,
           'Onion':6, 'Chashu':5, 'Seaweed':5, 'Rice':4 },
  NO_NOODLE_CAP:70,       // a bowl without noodles can never score more than this
  ORDER_PENALTY:8,        // noodles went in before the soup
  MOMO_SMUG:85,           // Momo turns round smug at this score or more…
  MOMO_CONFUSED:69,       // …and confused at this score or less (C and below); normal in between
  UPSET:69,               // customer pulls their upset face at this score or less (C and below)
  GLOOM:69,               // purple gloom over the bowl at this score or less (C and below)
  SHINE:95,               // golden shine at this score or more (S)
  TIP_FROM:71,            // tips are only paid from this score
  PERFECT_FROM:95,        // the customer's perfect bonus is paid from this score
  UPSET_PATIENCE:20,      // customer looks upset when patience drops below this %
};

/* ---- Customer Book ratings: a customer gets the first label whose minimum they reach ---- */
const BOOK_RATINGS={
  pat:   [[1.5,'Very good'],[1.15,'Good'],[1,'Normal'],[.75,'Bad'],[0,'Very bad']],
  tip:   [[2.3,'Very good'],[1.5,'Good'],[1,'Normal'],[.7,'Bad'],[0,'Very bad']],
  perfect:[[700,'Very good'],[365,'Good'],[0,'Normal']],
};

/* ---- STORY DAY: the shop is open on a clock; customers keep coming until closing time ---- */
const DAY={
  OPEN:11*60, CLOSE:21*60,     // shop hours (minutes after midnight): 11:00 → 21:00
  SECONDS:420,                 // real seconds (7 min) the clock takes to go from OPEN to CLOSE (only ticks while serving, not while paused)
  GAP:8,                       // seconds before the next customer walks in (shorter with good reputation or a busy event)
};

/* ---- DEMAND: tomorrow's event is rolled at night (shown on the iPad) so you can stock up for it ----
   weight = how often it happens · crowd = customers come ×more often · price = bowl price × · chashu / onion = chance an order wants it */
const EVENTS=[
  {id:'normal',   weight:4, name:'Ordinary day',   desc:'Business as usual.'},
  {id:'chashu',   weight:1, name:'Chashu craze',   desc:'A food show praised chashu — nearly everyone orders it.', chashu:.97},
  {id:'onion',    weight:1, name:'Onion lovers',   desc:'Onions are in season — lots of green, white and both.', onion:.95},
  {id:'festival', weight:1, name:'Market festival',desc:'Ramen is 30% off: more customers, less money per bowl.', price:.7, crowd:1.3},
];

/* ---- REPUTATION (0–100, shown as ★ out of 5): good bowls bring more customers ---- */
const REPUTATION={
  START:50,
  CHANGE:{S:4, A:2, B:1, C:-2, D:-4, walkout:-5},   // per bowl (story mode)
  CROWD_MIN:.6, CROWD_MAX:1.4,                       // customers come ×0.6 as often at 0 ★, ×1.4 at 5 ★ (×1 at 2.5 ★)
};

/* ---- SHELF LIFE: days a fresh batch stays usable (random in [min, max]); seaweed keeps ---- */
const SHELF={ green:[3,4], white:[3,4], chashu:[2,3], noodle:[4,5] };

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
  rent:d=>Math.min(3500, 800+100*(d-1)),  // paid every night: ¥800 on day 1, +¥100 a day, never more than ¥3,500
  patience:d=>Math.max(85,120-(d-1)*4),   // seconds a customer waits from order to tray (120 s on day 1, −4 s a day, at least 85 s)
  TIP_HIGH:200, TIP_MID:100,              // tips (score ≥ GRADING.TIP_FROM); each customer multiplies these
  PREP_YIELD:2/3,                         // a perfect prep turns a pack into ⅔ of its base portions (was ⅓ — too costly once stock spoils)
  PATIENCE_SLOWER:.85,                    // patience drains 15% slower for everyone
};

const ATLAS_DIR='atlases/';               // folder of the 1024px ramen sheets (old Ramen Book thumbnails, no longer shown)
