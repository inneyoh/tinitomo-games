// Guinny's Flower Encyclopedia — the Notepad app on the garden iPad.
// Pages unlock as you play: planting a flower opens its page, harvesting fills in
// the flower language and trivia, and Guinny writes more notes at harvest milestones.
// Edit or add entries here; keys match FLOWERS in data.js.

export const MILESTONES = [
  { at: 1,  stamp: 'First bloom', mark: '✿' },
  { at: 10, stamp: 'Green thumb', mark: '✿✿' },
  { at: 30, stamp: 'Flower friend', mark: '✿✿✿' },
];

export const ENCYCLOPEDIA = {
  chamomile: {
    jp: 'カモミール', family: 'Daisy family', origin: 'Europe & western Asia', season: 'Spring – early summer',
    language: 'Strength in adversity (逆境に耐える)',
    care: 'Loves sun and doesn’t like wet feet. Pick the flowers when the petals start to fold back.',
    trivia: [
      'Its name comes from the Greek for “earth apple”, because the flowers smell a little like apples.',
      'In The Tale of Peter Rabbit, Peter’s mother gives him chamomile tea after his scary day in the garden.',
      'Gardeners once called it the “plant doctor”, believing sickly plants perked up when it grew nearby.',
    ],
    notes: [
      'The whole garden smells like apples today! I made a cup of tea before bed and slept like a log.',
      'Customers keep asking for chamomile on rainy days. I think it feels like a warm blanket in a tin.',
      'I can tell when it’s ready just by the smell now. Grandma would be proud.',
    ],
  },
  mint: {
    jp: 'ミント', family: 'Mint family', origin: 'Mediterranean & Eurasia', season: 'Summer',
    language: 'Virtue (美徳)',
    care: 'Spreads with underground runners, so a pot keeps it from taking over the whole garden.',
    trivia: [
      'Greek myth says mint was once a nymph named Minthe, turned into a plant by a jealous goddess.',
      'Menthol in the leaves tricks your skin and tongue into feeling cold, even though nothing is colder.',
      'A single mint plant can send runners a metre or more in one season.',
    ],
    notes: [
      'Brushed past the pot and now my apron smells minty. Not complaining!',
      'Mint tea with a little honey is my secret afternoon pick-me-up.',
      'This little pot has outgrown three bigger pots. Mint is very determined.',
    ],
  },
  daisy: {
    jp: 'デイジー', family: 'Daisy family', origin: 'Europe', season: 'Spring',
    language: 'Hope, peace (希望・平和)',
    care: 'Easy-going and happy almost anywhere sunny. Deadhead old flowers to keep new ones coming.',
    trivia: [
      'The name comes from “day’s eye”: daisies open at sunrise and close again in the evening.',
      'Each daisy is really lots of tiny flowers: the yellow middle is packed with them.',
      '“He loves me, he loves me not…” is traditionally played by pulling daisy petals.',
    ],
    notes: [
      'Daisies make everything look like a picnic. I tucked one behind my ear.',
      'Made a daisy chain on my break. The bunny customer wanted one too!',
      'A bouquet of daisies is small, but it always makes someone smile. Best value in the shop.',
    ],
  },
  lavender: {
    jp: 'ラベンダー', family: 'Mint family', origin: 'Mediterranean', season: 'Summer',
    language: 'Devotion; “I’m waiting for you” (あなたを待っています)',
    care: 'Plenty of sun and dry, well-drained soil. Trim after flowering to keep it bushy.',
    trivia: [
      'Its name may come from the Latin lavare, “to wash”: Romans scented their baths with it.',
      'Furano in Hokkaido is famous for rolling purple lavender fields every July.',
      'Bees adore it. A lavender patch in bloom can hum like a tiny engine.',
    ],
    notes: [
      'Hung a bunch upside down in the 作業場. The whole room feels calmer.',
      'The bees visited the lavender all morning. We have an agreement: I water, they hum.',
      'My lavender perfume sold out before lunch. Note to self: plant more!',
    ],
  },
  strawberry: {
    jp: 'いちご', family: 'Rose family', origin: 'Wild species across the Northern Hemisphere', season: 'Spring',
    language: 'Respect and love (尊重と愛情)',
    care: 'Pots keep the berries off the soil. Pick them when they’re red all the way to the stem.',
    trivia: [
      'Those little “seeds” on the outside are each actually a tiny fruit with a seed inside.',
      'Strawberries are in the rose family, cousins of apples, cherries and roses.',
      'In Japan strawberries are a winter and spring treat, grown in warm greenhouses.',
    ],
    notes: [
      'One for the basket, one for me. Quality control is very important.',
      'Strawberry tea smells like a summer afternoon even on a grey day.',
      'Learned to pick them early in the morning while they’re cool and sweet.',
    ],
  },
  rose: {
    jp: 'バラ', family: 'Rose family', origin: 'Mostly Asia', season: 'Late spring & autumn',
    language: 'Pink roses: gratitude, grace (感謝・しとやか)',
    care: 'Needs patience, sun and a deep drink of water at the roots. Snip spent flowers to get more.',
    trivia: [
      'It takes several tons of petals to distil just one kilogram of rose oil.',
      'Rose fossils have been found that are over 30 million years old.',
      'Rose hips, the fruit left after flowering, are full of vitamin C and make a tart tea.',
    ],
    notes: [
      'My first rose! I just sat and looked at it for a while.',
      'Pressing roses for perfume takes a mountain of petals. Worth every one.',
      'Roses taught me to be patient. And to wear gloves.',
    ],
  },
  hydrangea: {
    jp: 'アジサイ', family: 'Hydrangea family', origin: 'Japan & East Asia', season: 'Rainy season (June)',
    language: 'Family togetherness (家族団らん); also fickleness (移り気)',
    care: 'Likes morning sun, afternoon shade and lots of water, the perfect rainy-season flower.',
    trivia: [
      'Flower colour depends on the soil: acidic soil makes blue flowers, alkaline soil makes pink.',
      'The colourful “petals” are actually sepals; the true flowers are tiny dots in the middle.',
      'The bigleaf hydrangea grown in gardens all over the world originally comes from Japan.',
    ],
    notes: [
      'It rained all day and the hydrangeas looked happier than ever.',
      'Some of mine came out pink and some blue. Like they couldn’t decide!',
      'The hydrangea bouquet is the fanciest thing I sell. I wrap it extra carefully.',
    ],
  },
};
