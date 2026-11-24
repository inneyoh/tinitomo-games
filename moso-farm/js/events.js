// =====================================================================
//  MoSo Farm: special villager stories (partnership events & missions)
// =====================================================================
//
//  How it plays:
//    1. The villager walks into the plaza.
//    2. They go to their shop (or any shop Momo/Soso are working at) and stand with Momo/Soso.
//    3. A pink "!" bubble pops up over their head. Tap it to play the next event.
//    4. Some events start a MISSION. When it is done, the villager comes back with a "!" again
//       to report it, and the next event unlocks.
//    5. At 100 partnership the villager can be picked as shopkeeper in that shop's
//       Shop owner tab.
//
//  Each villager has a list of STEPS, played in order. Partnership points from all steps
//  should add up to 100. A step looks like:
//
//    { pts: 15,                       // partnership points given when the step is finished
//      wait: 20,                      // seconds before this step can appear (after the last one)
//      talk: [ [who, text], ... ],    // lines; who = "bae", "momo", "soso", "me" (Momo/Soso on shift)
//      choices: [                     // optional: the player picks one; bonus adds to pts
//        { text: "...", reply: "...", bonus: 5 },
//      ],
//      mission: { type: "sell", item: "scarf", count: 20, shop: "clothing" },   // optional
//      done:    [ [who, text], ... ], // lines shown when the player reports the mission
//    }
//
//  Mission types:
//    sell  - sell `count` of `item` (anywhere, or at `shop` if given) after the mission starts
//    give  - hand over `count` of `item` from the barn when the villager visits
//    open  - have `shop` open for business
//
//  Text can use {me} for whoever is on shift (Momo or Soso).
//  The samples below are placeholders: replace them with the real story.
// =====================================================================

const STORY = {
  bae: [
    { pts: 15, wait: 0,
      talk: [["bae","Ooh! This place smells like fresh wool~"],["me","Hi Bae! Are you looking for something?"],["bae","I'm always looking for cute knits. Do you think this town could have a clothing shop someday?"]],
      choices: [
        { text: "We'd love to open one!", reply: "Really?! I'd visit every single day!", bonus: 5 },
        { text: "Maybe… it's a lot of work.", reply: "Hehe, true. Still, a girl can dream~", bonus: 0 },
      ] },
    { pts: 10, wait: 20,
      talk: [["bae","Hey {me}! Can I see some of your wool?"],["me","Sure, it's from our sheep!"],["bae","So soft… If I had 6 balls of wool I could knit a sample scarf!"]],
      mission: { type: "give", item: "wool", count: 6 },
      done: [["bae","Wahh, thank you!! I'll knit something super cute with it~"]] },
    { pts: 20, wait: 20,
      talk: [["bae","Look, I knitted a scarf with your wool!"],["me","It's adorable!"],["bae","If the Clothing Shop sells 20 scarves, I'll know the town really loves knits!"]],
      mission: { type: "sell", item: "scarf", count: 20, shop: "clothing" },
      done: [["bae","Twenty scarves! Everyone in town is so cosy now~"],["me","All thanks to your pattern, Bae!"]] },
    { pts: 15, wait: 30,
      talk: [["bae","{me}… can I tell you a secret?"],["bae","I've always wanted my own little shop."]],
      choices: [
        { text: "You'd be the best shopkeeper!", reply: "You really think so? *blushes*", bonus: 10 },
        { text: "Let's work on it together.", reply: "Together! I like the sound of that~", bonus: 10 },
      ] },
    { pts: 20, wait: 30,
      talk: [["bae","One last thing! Let's sell 10 cosy sweaters before winter."],["me","Challenge accepted!"]],
      mission: { type: "sell", item: "sweater", count: 10, shop: "clothing" },
      done: [["bae","We did it!! Hey {me}… may I help run the Clothing Shop?"],["me","We'd love that, Bae! 💕"]] },
  ],

  popo: [
    { pts: 15, wait: 0,
      talk: [["popo","Hello, dear! My tummy brought me here."],["me","Hi Popo! Hungry already?"],["popo","Always! I used to cook for my whole family, you know."]],
      choices: [
        { text: "You should cook for the town!", reply: "Oh my! What a lovely idea~", bonus: 5 },
        { text: "Want a snack?", reply: "Hohoho, you know me too well.", bonus: 3 },
      ] },
    { pts: 15, wait: 20,
      talk: [["popo","For my famous stew I need good tomatoes. Could you spare 8?"]],
      mission: { type: "give", item: "tomato", count: 8 },
      done: [["popo","Plump and juicy! You grow them with love, I can tell."]] },
    { pts: 20, wait: 20,
      talk: [["popo","Let's see if the town likes home cooking! Sell 15 omelettes at the Eatery."]],
      mission: { type: "sell", item: "omelette", count: 15, shop: "eatery" },
      done: [["popo","Fifteen happy tummies! Now that's what I call a good day."]] },
    { pts: 25, wait: 30,
      talk: [["popo","{me}, dear… I'd love to cook here every day."]],
      choices: [{ text: "The Eatery is yours, Popo!", reply: "Then let's fill this town with good food!", bonus: 25 }] },
  ],

  kew: [
    { pts: 15, wait: 0,
      talk: [["kew","…Hm."],["me","Hi Kew! Looking for something?"],["kew","Coffee. Good coffee. This town has none."]],
      choices: [
        { text: "We could open a cafe!", reply: "…Fine. That would be acceptable.", bonus: 5 },
        { text: "Have some milk instead?", reply: "…No.", bonus: 0 },
      ] },
    { pts: 20, wait: 20,
      talk: [["kew","A real latte needs fresh milk. Bring me 6 bottles."]],
      mission: { type: "give", item: "milk", count: 6 },
      done: [["kew","…This milk is good. Thank you."],["me","Was that a smile?!"],["kew","No."]] },
    { pts: 20, wait: 20,
      talk: [["kew","Sell 12 lattes at the Cafe. Then I'll believe this town has taste."]],
      mission: { type: "sell", item: "latte", count: 12, shop: "cafe" },
      done: [["kew","…Twelve. Not bad."]] },
    { pts: 25, wait: 30,
      talk: [["kew","{me}. I've decided."],["kew","I'll run the Cafe. Someone has to do it properly."]],
      choices: [{ text: "Welcome aboard, Kew!", reply: "…Hmph. *tail wag*", bonus: 20 }] },
  ],

  rang: [
    { pts: 15, wait: 0,
      talk: [["rang","Hey hey hey! What's poppin'?"],["me","Hi Rang! So much energy today!"],["rang","I'm craving popcorn SO bad. Does anyone grow corn around here?"]],
      choices: [
        { text: "We can grow corn!", reply: "YESSS! Best day ever!", bonus: 5 },
        { text: "Corn? Hmm…", reply: "C'mon, it's the best crop!", bonus: 0 },
      ] },
    { pts: 15, wait: 20,
      talk: [["rang","Bring me 10 corn and I'll show you my secret popping trick!"]],
      mission: { type: "give", item: "corn", count: 10 },
      done: [["rang","*pop pop pop* Ta-da! Perfect fluffy popcorn!"]] },
    { pts: 25, wait: 20,
      talk: [["rang","Popcorn party time! Let's sell 20 butter popcorn!"]],
      mission: { type: "sell", item: "butterpop", count: 20, shop: "popcorn" },
      done: [["rang","TWENTY! The whole plaza smells like butter now~"]] },
    { pts: 20, wait: 30,
      talk: [["rang","{me}! {me}! Can I run the Popcorn Shop? Pleeease?"]],
      choices: [{ text: "Of course, Rang!", reply: "WOOHOO! You won't regret it!", bonus: 25 }] },
  ],

  // Nono has no art yet, so Nono does not walk into the plaza. Add cu_nono / pt_nono
  // and "nono" to FRIENDS in game.js and this story starts working.
  nono: [
    { pts: 50, wait: 0,
      talk: [["nono","Pudding time~ Do you like sweets, {me}?"]],
      choices: [{ text: "I love sweets!", reply: "Then let's bake together!", bonus: 0 }] },
    { pts: 50, wait: 20,
      talk: [["nono","Sell 20 bread at the Bakery and I'll share my pudding recipe!"]],
      mission: { type: "sell", item: "bread", count: 20, shop: "bakery" },
      done: [["nono","Hooray! May I help at the Bakery?"]] },
  ],
};
