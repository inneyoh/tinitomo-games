"""
Builds fishing_module.js from the original Pocket Fishing game
(tinitomo-games/pocket-fishing/index.html) so this 2.5D home screen plays the
same fishing game: tap-to-cast, nibble/bite, Reel (draw circles), Tug (joystick),
Final Pull, result card, 55 fish with trivia, the same balance and character skills.

Sections are copied verbatim by their "JS n." headers, then a few small patches
hook them into the host page (save data, exit to the dock, Bae's skill, line upgrade).

usage: python3 tools/build_fishing.py <original index.html> <out.js>
"""
import re, sys, json, os

src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding="utf-8").read().split("\n")

def header(n):
    for i, l in enumerate(lines):
        if re.match(rf"\s*JS {n}\.", l):
            return i - 1          # the "/* ====" line above the title
    raise SystemExit(f"JS {n}. not found")

def section(a, b):
    return "\n".join(lines[header(a):header(b)])

cfg = section(2, 4)                              # rod, attachments, habitats, FISH, BAL
# 20 new fish (tools/extra_fish.json); the first trivia goes on the fish, the rest live in fish_trivia.json
_extra = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "extra_fish.json"), encoding="utf-8"))
_extra = [dict({k: v for k, v in f.items() if k != "trivia"}, trivia=f["trivia"][0]) for f in _extra]
cfg = cfg.replace("const BAL = {", "FISH.push(..." + json.dumps(_extra, ensure_ascii=False) + ");\n\nconst BAL = {", 1)
helpers = section(5, 6)
helpers = helpers[helpers.index("const rand"):]  # skip canvas/resize setup (host owns it)
art = section(6, 7)                              # fish, shadows, characters, clouds
fishing = section(10, 13)                        # fishing scene, catch gimmicks, result
inp = section(13, 14)
inp = inp.replace("  if (scene === 'title' && !TZ) TZ = { t:0 };\n  else if (scene === 'fishing')", "  if (scene === 'fishing')")

PATCHES = [
    # host font
    (helpers, "const FONT = \"'M PLUS Rounded 1c',system-ui,sans-serif\";", "const FONT = \"'Fredoka','M PLUS Rounded 1c',system-ui,sans-serif\";"),
    # Bae: Final Pull gauge moves slower (10/15/20% for 1/2/3-star fish)
    (fishing, "C.speed = BAL.finalSpeed[si];", "C.speed = BAL.finalSpeed[si] * tr.finalSlow[si];"),
    # Bae: +30% coins, with a badge on the result card
    (fishing, "const coins = Math.round(BAL.coins[f.star - 1] * (.75 + .6 * ratio) * (perfect ? 1.2 : 1)) * qty;",
              "const coins = Math.round(BAL.coins[f.star - 1] * (.75 + .6 * ratio) * (perfect ? 1.2 : 1) * traits().coinMul) * qty;"),
    (fishing, "  if (save.char === 'soso') badges.push(",
              "  if (save.char === 'bae') badges.push('<span class=\"badge b2\" style=\"animation:none\">Bae bonus: +30% coins</span>');\n  if (save.char === 'soso') badges.push("),
    # Fishing Line upgrade: less tension build-up
    (fishing, "const strain = 18 * BAL.tugStrain[si] * tr.tugEase", "const strain = 18 * BAL.tugStrain[si] * tr.tugEase * (save.lineMul || 1)"),
    # catch close-up: the host's 3D sea shows through (soft depth tint instead of an opaque gradient)
    (fishing, "let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#6cc3e0'); g.addColorStop(.6, '#3d93c2'); g.addColorStop(1, '#2d73a3');",
              "let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(163,216,245,0)'); g.addColorStop(.6, 'rgba(110,175,220,.22)'); g.addColorStop(1, 'rgba(80,140,195,.4)');"),
]
patched = {"helpers": helpers, "fishing": fishing}
for blob, a, b in PATCHES:
    key = "helpers" if blob is helpers else "fishing"
    if a not in patched[key]:
        raise SystemExit("patch target missing: " + a[:60])
    patched[key] = patched[key].replace(a, b)

def must_replace(text, a, b, label):
    if a not in text:
        raise SystemExit("patch target missing (" + label + "): " + a[:70])
    return text.replace(a, b, 1)

# 2.5D fish: keep the original painter as drawFishFlat; fishing_theme.js defines drawFish on top of it
art = must_replace(art, "function drawFish(c, f, x, y, L, t = 0, opt = {}){", "function drawFishFlat(c, f, x, y, L, t = 0, opt = {}){", "flat fish")
fx = patched["fishing"]
# reel feedback (spin meter, combo pops, sparkles, clicks)
fx = must_replace(fx, "C.dist -= Math.abs(d) / TAU * power; C.reelAng += Math.abs(d) * 1.5;",
                      "C.dist -= Math.abs(d) / TAU * power; C.reelAng += Math.abs(d) * 1.5; onReelTick(Math.abs(d));", "reel tick")
# bite: remember the window so the countdown ring can show it, and ring the bell
fx = must_replace(fx, "  F.biteT = .62 * traits().biteMul * BAL.biteStar[F.fish.star - 1];",
                      "  F.biteT = .62 * traits().biteMul * BAL.biteStar[F.fish.star - 1]; F.biteMax = F.biteT; F.burstDone = false; hostSfx('bite');", "bite")
# hooked: the bigger "!" burst
i = fx.index("  // BIG exclamation when hooked"); j = fx.index("  if (F.state === 'zoom'){ ctx.fillStyle", i)
fx = fx[:i] + "  if (F.state === 'hooked' || F.state === 'zoom') drawHookedBurst(F.state === 'hooked' ? F.hookT : 1, t);\n" + fx[j:]
# bite / nibble call-outs on the sea
fx = must_replace(fx, "  // message pill\n", "  drawBiteAlert(t);\n  // message pill\n", "bite alert")
# catch overlay (sparkles, pops) drawn over the phase UIs
fx = must_replace(fx, "  if (C.phase === 'final') drawFinalUI(t);\n", "  if (C.phase === 'final') drawFinalUI(t);\n  themeCatchOverlay(t);\n", "catch overlay")
fx = must_replace(fx, "C.hitMsg = C.perfect ? 'PERFECT!' : 'GREAT!'; C.hitT = 1.2;",
                      "C.hitMsg = C.perfect ? 'PERFECT!' : 'GREAT!'; C.hitT = 1.2; spark(C.fx, C.fy, 40); hostSfx('land');", "landed")
# result card: show the newest trivia this fish has unlocked (1 / 5 / 15 catches)
fx = must_replace(fx, "  document.getElementById('rTrivia').textContent = f.trivia;", "  resultTrivia(f, qty);", "result trivia")
patched["fishing"] = fx
# economy: every fish pays twice the original coins (coins x2)
cfg = must_replace(cfg, "coins       : [12, 40, 130],", "coins       : [24, 80, 260],", "coins x2")

SHIM_TOP = r"""
/* ==== Pocket Fishing gameplay module (generated by tools/build_fishing.py from the original game) ==== */
window.PFFishing = (function(){
'use strict';
const TAU = Math.PI * 2;
const cv = document.getElementById('fishcv'), ctx = cv.getContext('2d');
const fadeEl = document.getElementById('fishfade');
let W = 360, H = 640, S = 1, DPR = 1, T = 0, scene = 'off', active = false, host = null;
const OUT = '#5b3d2e';             // home-screen ink
let HAND = null;                      // rod hand position in px, sent by the host each frame
const hostSfx = (n, v) => { if (host && host.sfx) host.sfx(n, v); };
// ---- characters: sprites + skills (same numbers as the original; Bae is new) ----
const SPR = {};
const CHARACTERS = [
  { id:'momo', skin:'#fff1e1', shell:'#b5cf7a', shellD:'#8cab4e', head:'round', mouth:'u', extra:null },
  { id:'soso', skin:'#fff1e1', shell:'#b5cf7a', shellD:'#8cab4e', head:'oval', mouth:'w', extra:'fade' },
  { id:'kew',  skin:'#c9c4c4', shell:'#c9c4c4', shellD:'#9a9494', head:'round', mouth:'u', extra:null },
  { id:'rang', skin:'#ffe58a', shell:'#ffe58a', shellD:'#f0c24a', head:'round', mouth:'u', extra:null },
  { id:'bae',  skin:'#f4e2cf', shell:'#f4e2cf', shellD:'#d7ae87', head:'round', mouth:'u', extra:null },
];
const hasSprite = ch => { const im = SPR[ch.id]; return !!(im && im.complete && im.naturalWidth); };
function drawSprite(c, ch, cx, by, hgt, t = 0){
  const im = SPR[ch.id], w = hgt * im.naturalWidth / im.naturalHeight, sq = Math.sin(t * 2.6) * .025;
  c.save(); c.translate(cx, by); c.scale(1 - sq, 1 + sq); c.drawImage(im, -w/2, -hgt, w, hgt); c.restore();
}
let save = { char:'momo', rod:{ reel:0, rare:0 }, equip:'none', col:{}, coins:0, sosoBonus:0, lineMul:1 };
function traits(){
  const id = save.char;
  return {
    bait     : id === 'momo',
    allPerfect: id === 'momo',
    double   : id === 'soso' ? .2 + (save.sosoBonus || 0) : 0,
    biteMul  : id === 'kew' ? 1.7 : 1,
    tugEase  : id === 'kew' ? .7 : 1,
    zoneMul  : id === 'kew' ? 1.3 : 1,
    tugGain  : id === 'rang' ? 1.2 : 1,
    hearts   : id === 'rang' ? 4 : 2,
    coinMul  : id === 'bae' ? 1.3 : 1,                      // Bae: +30% coins
    finalSlow: id === 'bae' ? [.9, .85, .8] : [1, 1, 1],     // Bae: Final Pull gauge 10/15/20% slower for 1/2/3-star fish
  };
}
const curChar = () => CHARACTERS.find(c => c.id === save.char) || CHARACTERS[0];
function writeSave(){ if (host) host.onSave({ coins:save.coins, col:save.col, sosoBonus:save.sosoBonus }); }
function showLayer(id){ document.getElementById(id).hidden = false; }
function hideLayer(id){ document.getElementById(id).hidden = true; }
function hideAll(){ ['fishHUD', 'result'].forEach(hideLayer); }
function refreshCoins(){ document.querySelectorAll('.fishCoinTxt').forEach(el => el.textContent = save.coins.toLocaleString()); }
let fading = false;
function fadeTo(cb){
  if (fading) return; fading = true; fadeEl.style.opacity = 1;
  setTimeout(() => { cb(); fadeEl.style.opacity = 0; setTimeout(() => fading = false, 300); }, 320);
}
function enterHut(){ if (host) host.exit(); }
"""

THEME = open(__import__("os").path.join(__import__("os").path.dirname(__file__), "fishing_theme.js"), encoding="utf-8").read()

SHIM_BOTTOM = r"""
/* ---- host plumbing ---- */
function resize(w, h){
  W = w; H = h; S = W / 360; DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); buildWaves();
}
function update(dt){ if (scene === 'fishing') updFishing(dt); else if (scene === 'catch') updCatch(dt); }
function draw(){ ctx.clearRect(0, 0, W, H); if (scene === 'fishing') drawFishing(T); else if (scene === 'catch') drawCatch(T); }
let last = 0;
function loop(now){
  if (!active) return;
  const dt = Math.min(window.__pfDtCap || .033, (now - last) / 1000); last = now; T += dt;
  update(dt); draw(); requestAnimationFrame(loop);
}
function fishImage(f, sil, w = 240, h = 132){
  const el = document.createElement('canvas'); el.width = w * 2; el.height = h * 2;
  const c = el.getContext('2d'); c.scale(2, 2);
  const L = f.type === 'oar' ? w * .92 : Math.min(w * .78, h * .62 / f.h);
  drawFish(c, f, w * .5, h * .5, L, 0, { sil });
  return el.toDataURL();
}
buildWaves();
return {
  FISH, HAB, BAL, fishImage, stars, fmtSize,
  setSprites(map){ for (const k in map){ const im = new Image(); im.src = map[k]; SPR[k] = im; } },
  start(h, state){
    host = h; Object.assign(save, state); fishCount = 0;
    cv.hidden = false; active = true; last = performance.now();
    initFishing(); refreshCoins(); requestAnimationFrame(loop);
  },
  stop(){ active = false; scene = 'off'; cv.hidden = true; hideAll(); },
  resize,
  setHand(x, y){ HAND = { x, y }; },
  setFishArt(fn){ FISH_ART = fn; },
  flatFish(c, f, x, y, L, opt){ drawFishFlat(c, f, x, y, L, 0, opt || {}); },
  get scene(){ return scene; },
  get phase(){ return scene === 'catch' ? C.phase : F.state; }
};
})();
"""

body = "\n".join([SHIM_TOP, cfg, patched["helpers"], art, patched["fishing"], inp, THEME, SHIM_BOTTOM])
open(out, "w", encoding="utf-8").write(body)
print("wrote", out, len(body), "chars")
