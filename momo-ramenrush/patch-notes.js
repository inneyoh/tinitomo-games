/* =====================================================================
   PATCH NOTES — shown once to every player the first time they open the game after you change VERSION.
   To announce an update: change VERSION (any new text, e.g. '2.1'), edit the text below, push.
   SECTIONS: [heading, [lines...]]            → a big heading with bullet points
             [heading, [lines...], 'sub']     → a smaller sub-heading (e.g. one shop item under a heading)
   Lines can use <b>bold</b>. INTRO / OUTRO are plain paragraphs (leave '' to hide). SHOW:false = no notice.
   ===================================================================== */
const PATCH_NOTES = {
  SHOW: true,
  VERSION: '2.0',
  TITLE: "🍜 Momo-ya's FIRST Big Update — Version 2.0!",
  INTRO: "Momo's little ramen shop is getting BUSY! More customers, bigger rushes, and a whole lot more ramen chaos! 🍥",
  SECTIONS: [
    ['🍜 NEW GIMMICK: RUSH HOUR!', [
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
      "Watch out for surprise daily events, spoiled ingredients and rising rent. Running a ramen shop isn't all sunshine and noodles!" ]],
    ['🛒 NEW SHOP ITEMS: SECOND TEBO & SOFA SEATS!', []],
    ['🍜 Second Tebo — Double Noodle Cooker', [
      'Cook two servings of noodles at once! 🍜🍜',
      "Sounds convenient? There's a catch! Managing two servings takes a little practice, so get those noodle-cooking skills ready!" ], 'sub'],
    ['🛋️ Sofa Seats — Extra Patient Customers', [
      'A little comfort goes a long way! Customers can now wait twice as long before losing their patience!' ], 'sub'],
    ['🧸 SYSTEM UPDATE: NEW CUSTOMERS & A WHOLE NEW CUSTOMER BOOK!', [
      'New faces in town! Say hello to Kuma, Bun, Piyo & Gwoof!',
      'New customer appearance rates! Some familiar faces might show up more often, while others are harder to catch. Keep an eye out for Popo!',
      'Everyone has a favourite ramen order. Get it right for a special reaction!',
      'The Ramen Book is now the Customer Book! Discover customer profiles, favourite orders and ratings as you meet them. 📖' ]],
    ['⭐ SYSTEM UPDATE: NEW GRADING SCALE!', [
      'Getting an S just got harder! The new S / A / B / C / D grading system is much stricter!',
      "Customers have higher expectations! Anything C or below? Don't expect a happy face! 💢",
      "No noodles?! That's not ramen! 🍜 Even if everything else is perfect, a bowl without noodles gets a B at best!" ]],
    ['🔧 BUG FIXES & OPTIMISATION!', [
      'Various bug fixes and optimisations for a smoother gameplay experience! ✨' ]],
  ],
  OUTRO: '🍥 Can Momo survive the lunch rush AND pay her rent?<br>Only one way to find out. Get cooking! 🍜',
  BUTTON: "Get cooking! ▶",
};
