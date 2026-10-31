/* =====================================================================
   PATCH NOTES — shown once to every player the first time they open the game after you change VERSION.
   To announce an update: change VERSION (any new text, e.g. '2.1'), edit the text below, push.
   SECTIONS: [heading, [lines...]]            → a big heading with bullet points
             [heading, [lines...], 'sub']     → a smaller sub-heading (e.g. one shop item under a heading)
   Lines can use <b>bold</b>. INTRO / OUTRO are plain paragraphs (leave '' to hide). SHOW:false = no notice.
   ===================================================================== */
const PATCH_NOTES = {
  SHOW: true,
  VERSION: '2.1',
  TITLE: "🍜 Momo-ya Small Update — Version 2.1!",
  INTRO: "The Tinitomo Arcade app has an app icon now!? Time to move to the homescreen app version- OH! What about my saved data! 😨",
  SECTIONS: [
      ['🔧 NEW SAVE DATA TRANSFER FEATURE!', [
      'Press the "Transfer Save" button at the bottom right of the screen to get your saved data code for transferring!' ]],
/*    ['🍜 NEW GIMMICK: RUSH HOUR!', [
      'Double the customers, double the chaos! Starting from Day 7, Rush Hour kicks in with two customers arriving at once!',
      'Prepare two bowls side by side and keep both customers happy!',
      'As the days go by, Rush Hour happens more often. Can Momo keep up?!' ]],
    ['⏰ NEW GAMEPLAY: OPENING HOURS!', [
      "Momo's shop now opens from 11 AM to 9 PM!",
      'The clock is ticking, and customers keep coming! Serve as many as you can before closing time!',
      'Still preparing the last bowl? No worries! Momo can work a little overtime to finish it!' ]],
    ['⭐ NEW SYSTEM: REPUTATION!', [
      'Every bowl counts! Delicious ramen earns Momo a better reputation, while customers walking out will hurt it!',
      'The better your reputation, the bigger the tips! Keep those customers smiling! 💰',
      "Watch out for surprise daily events, spoiled ingredients and rising rent. Running a ramen shop isn't all sunshine and noodles!" ]],  */
    ['🛒 NEW SHOP ITEMS', []],
    ["🍜 Dr Mo's Prototype Tebo — An automatic Tebo!?", [
      'What sorcery! This prototype Tebo lifts up noodles by themselves the moment they reach the firmness the order asked for.',
      "But Momo says it is a prototype so it is only used for the second Tebo..." ], 'sub'],
     ["🍜 Dr Mo's Double Tebo!? — TWO automatic Tebo!?", [
      "She did it! You don't even need to watch your ramen cooker anymore! But of course, everything comes at a price.",
      "(Are you even needed in the shop Momo...?)" ], 'sub'],
    ["🛒 Here’s some extra! — More stocks given to you at each purchase.", [
      'Networking brings you a long way, thank Dr. Mo for her charms as the vendors gives her some extras when purchasing stocks!' ], 'sub'],
     ["🛒 Here’s some discount! — Chances for 1 stock item to go on sales.", [
      "Momo got the taste of how far networking can bring you and she charmed the vendor more! Get the stocks at a discounted price!" ], 'sub'],
     ["🛒 You’re THE Dr. Mo!? — Chances for 2 stock items to go on sales.", [
      'With the amount of stock Momo is buying and her charms, it was only in due course the vendor will find out her identity!' ], 'sub'],
     ["🍮 Nono's Pudding — A sweet treat not to be missed!", [
      "Nono sees that Momo's struggling with work and decided to chip in by serving some pudding for more earnings!" ], 'sub'],
  /*  ['🧸 SYSTEM UPDATE: NEW CUSTOMERS & A WHOLE NEW CUSTOMER BOOK!', [
      'New faces in town! Say hello to Kuma, Bun, Piyo & Gwoof!',
      'New customer appearance rates! Some familiar faces might show up more often, while others are harder to catch. Keep an eye out for Popo!',
      'Everyone has a favourite ramen order. Get it right for a special reaction!',
      'The Ramen Book is now the Customer Book! Discover customer profiles, favourite orders and ratings as you meet them. 📖' ]],
    ['⭐ SYSTEM UPDATE: NEW GRADING SCALE!', [
      'Getting an S just got harder! The new S / A / B / C / D grading system is much stricter!',
      "Customers have higher expectations! Anything C or below? Don't expect a happy face! 💢",
      "No noodles?! That's not ramen! 🍜 Even if everything else is perfect, a bowl without noodles gets a B at best!" ]], */
     ['🔧 OTHER GAME OPTIMISATION AND SOME TWEAKS!', [
      'Game was too easy! Changes were made to the stocks base amount, upgrades pricing, rent calculation and patience timer for the customers.',
      'Players will be prompted to purchase all of their upgrades again, think carefully before making your purchase!']]
  ],
  OUTRO: 'Phew! No worries for data loss anymore. <br>Time to move to the new Tinitomo Arcade homescreen app!',
  BUTTON: "Get cooking! ▶",
};
