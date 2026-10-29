/* =====================================================================
   SOSO'S ICE CREAM STAND — dialogue.js
   Everything the customers SAY, and how their speech bubble LOOKS.

   1. SPEECH  — speech bubble style (colours, size, how long it stays)
   2. DIALOGUE — the lines, per character

   How lines work
   - Each line can be one text  →  happy: 'Thank you!'
     or a list to pick from at random  →  happy: ['Thank you!', 'Yay!']
   - `default` is used for anything a character doesn't set themselves,
     so you only need to write the lines you want to change.
   - Keep lines short: a long line wraps onto a 2nd line automatically.
   ===================================================================== */

/* ---------- 1. SPEECH BUBBLE STYLE ---------- */
const SPEECH = {
  fontSize: 17,          // text size
  fontWeight: 700,
  maxWidth: 250,         // bubble wraps to 2 lines past this width
  padX: 14,              // space left/right of the text
  lineHeight: 20,
  radius: 17,            // corner roundness
  borderWidth: 3.5,
  border: '#5b3a2e',     // outline colour
  // bubble fill + text colour for each mood
  happy:  { fill: '#fff3f7', text: '#ef7fa3' },   // served correctly
  normal: { fill: '#ffffff', text: '#5b3a2e' },   // arriving
  angry:  { fill: '#fff4f2', text: '#d65a5a' },   // wrong order / left angry
  tail: true,            // little pointer under the bubble towards the customer
  // seconds each kind of line stays on screen
  time: { arrive: 2.0, happy: 1.6, thanks: 1.6, wrong: 2.2, slow: 1.8 },
  showArrive: true,      // say a greeting when arriving (false = only speak when served / leaving)
};

/* ---------- 2. LINES ---------- */
const DIALOGUE = {

  /* used for every character unless they have their own line below */
  default: {
    arrive: ['Hello!', 'One please!', 'Hi there!'],
    happy:  ['Yummy! Thank you!', 'Perfect!'],     // served quickly (good tip)
    thanks: ['Thanks!'],                           // served, but they waited a while
    slow:   ['Hmph! Too slow!'],                   // ran out of patience
    wrong: {                                       // served the wrong thing — one line per mistake
      wantIceCreamCup: 'I wanted an ice cream cup!',
      wantDrinkCup:    'That should be a drink cup!',
      noWaffle:        'No waffle for me!',
      needWaffle:      'Where is my waffle?',
      rawWaffle:       'The waffle is still raw!',
      burntWaffle:     'The waffle is burnt!',
      wrongBatter:     'Wrong waffle batter!',
      needSmoothie:    'I ordered a smoothie!',
      tooMuchIceCream: 'Too much ice cream!',
      mixedUp:         'Eww, the flavours got mixed up!',
      wrongFlavour:    'Wrong flavour!',
      notBlended:      'It is not blended!',
      watery:          'It is all watery!',
      wantShort:       'I wanted a short blend!',
      wantLong:        'I wanted a long blend!',
      needSoda:        'I ordered a soda!',
      notFull:         'It is not full!',
      spilled:         'It spilled everywhere!',
      wrongSoda:       'Wrong soda!',
      moreScoops:      'More scoops please!',
      tooManyScoops:   'Too many scoops!',
      wrongSprinkles:  'Wrong sprinkles!',
      wantSprinkles:   'I wanted sprinkles!',
      noSprinkles:     'No sprinkles for me!',
      needCap:         'Where is the cup cap?',
      noCap:           'This one does not need a cap!',
      needSpoon:       'I need a spoon!',
      needStraw:       'I need a straw-spoon!',
      spoonNotStraw:   'That needs a spoon, not a straw!',
      strawNotSpoon:   'That needs a straw-spoon!',
    },
  },

  /* Momo — calm, a little ジト目, says exactly what she thinks */
  momo: {
    arrive: ['Ice cream, ice cream!', 'Mo!', 'I want to order.'],
    happy:  ['Thanks bro.', 'Momo!'],
    thanks: ['Momo.'],
    slow:   ['I have research to do. Bye.'],
    wrong:  { wrongFlavour: 'That is not what I ordered.', mixedUp: 'Wash the scoop next time.', needSpoon: 'Spoon please?' },
  },

  /* Soso — cutesy and chaotic, quick to get mad */
  soso: {
    arrive: ['Soso ♪', 'So!', 'Sosososo!!!'],
    happy:  ['So! ♡', 'Sososo!'],
    thanks: ['Soso~'],
    slow:   ['SOSOSO!!!'],
    wrong:  { wrongFlavour: 'Soso......', wantSprinkles: 'Sososo!!!!' },
  },

  /* Kew — grumpy grey cat (edit to match Kew's personality) */
  kew: {
    arrive: ['Kew.', 'Order please.'],
    happy:  ['Kew...!', 'Thank you.'],
    slow:   ['Maybe next time', 'Kew...'],
  },

  /* Rang — cheerful yellow bear (edit to match Rang's personality) */
  rang: {
    arrive: ['Raaaang!', 'Ice cream, ice cream, ice cream'],
    happy:  ['Ranghahaha', 'Thanks~'],
    slow:   ['Rang...', 'No time for this, kthxbye'],
  },

  bae: {
    arrive: 'Hello...! Ice cream please.',
    happy: 'Thank you!',
    thanks: 'Thank you!',
    slow: 'Oh no...',
    wrong: "I didn't order this...",
  },
};
