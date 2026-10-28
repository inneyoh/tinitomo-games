/* =====================================================================
   SOSO'S ICE CREAM STAND — art.js
   Every picture in the game is drawn here with canvas (no image files
   except the customer stickers). Pastel, soft-3D, brown outline —
   same family as Momo Pudding Panic / Soso Stock Shuffle / Turtle Playtime.

   1. Helpers           5. Stations (a–n)
   2. Background        6. Held tools
   3. Ice cream scoops  7. HUD bits
   4. Cups & orders
   ===================================================================== */

const OUT = '#5b3a2e';           // outline brown used everywhere
const FONT = '"Fredoka", ui-rounded, "Hiragino Maru Gothic ProN", "Nunito", system-ui, sans-serif';

/* ---------------------------------------------------------------------
   0. ART FILES — PNGs in assets/art/ replace the code-drawn versions.
      BOX = where each picture sits, in game units (x, y, width, height).
      If a file is missing or still loading, the code-drawn version is used.
   --------------------------------------------------------------------- */
const ART_DIR = 'assets/art/';
const SPRINKLE_ART = { rainbow: 'sprinkles/rainbow-sprinkle', metal: 'sprinkles/metalic-sprinkle', chip: 'sprinkles/chocochip' };
const SCOOP_ART = f => f === 'mess' ? 'ice-cream/scoop-mixed-up-dirty' : 'ice-cream/scoop-' + f;
const BOX = {
  // relative to the item's bottom-centre (cups) / the scoop's centre for a radius-40 scoop
  'cups/ice-cream-cup': [-53, -72, 106, 82],
  'cups/drink-cup':     [-42.67, -126.67, 85.33, 136.67],
  'cups/cup-cap':       [-47.67, -153, 95.33, 37.67],
  'tools/ice-cream-scoop': [-29, -13, 58, 100],
  'tools/ice-cream-scoop-dirty': [-29, -13, 58, 100],
  scoop40:              [-43, -43, 86, 70],
  // stage positions (classic layout)
  'ice-cream-tray/tray-full': [193, 440, 420, 294],
  'stations/sprinkle-tray':   [459, 765, 316, 94],
};
const ART = {}, ART_SPLIT = {}, ART_TRIM = {}, ART_BLOBS = {}, ART_TUNED = {};
/* per-sprinkle tuning from CONFIG.SPRINKLES (artScale, vibrance) */
function sprinkleTune(n) { const k = Object.keys(SPRINKLE_ART).find(t => SPRINKLE_ART[t] === n); return (k && CONFIG.SPRINKLES[k]) || {}; }
function loadArt() {
  const names = ['cups/ice-cream-cup', 'cups/drink-cup', 'cups/cup-cap', 'tools/ice-cream-scoop', 'tools/ice-cream-scoop-dirty',
    'ice-cream-tray/tray-full', 'stations/sprinkle-tray', 'shelf/ice-cream-cup-stack', 'shelf/drink-cup-stack', 'shelf/cup-cap-stack',
    ...Object.values(SPRINKLE_ART), SCOOP_ART('mess'),
    ...CONFIG.TRAY_ORDER.map(SCOOP_ART), ...CONFIG.TRAY_ORDER.map(f => 'ice-cream-tray/tub-' + f),
    ...Object.keys(CONFIG.SPRINKLES).map(k => 'stations/sprinkle-pot-' + k)];
  names.forEach(n => { const im = new Image(); im.onload = () => prepArt(n, im); im.src = ART_DIR + n + '.png'; ART[n] = im; });
}
/* draw a sprinkle picture whose full canvas maps onto box b — every sprinkle scaled up around its own centre */
function drawSprinkleArt(c, n, b) {
  const src = art(n); if (!src) return false;
  const im = ART_TUNED[n] || src, iw = src.naturalWidth, ih = src.naturalHeight;
  const blobs = ART_BLOBS[n], k = sprinkleTune(n).artScale || CONFIG.SPRINKLE_ART_SCALE || 1, sx = b[2] / iw, sy = b[3] / ih;
  if (!blobs || k === 1) { c.drawImage(im, b[0], b[1], b[2], b[3]); return true; }
  blobs.forEach(([x, y, w, h]) => {
    const cx = b[0] + (x + w / 2) * sx, cy = b[1] + (y + h / 2) * sy, dw = w * sx * k, dh = h * sy * k;
    c.drawImage(im, x, y, w, h, cx - dw / 2, cy - dh / 2, dw, dh);
  });
  return true;
}
function art(n) { const i = ART[n]; return i && i.complete && i.naturalWidth ? i : null; }
function drawArt(c, n, b) { const i = art(n); if (!i) return false; c.drawImage(i, b[0], b[1], b[2], b[3]); return true; }
/* after loading: split the drink cup into a back layer (the faint glass) and a front layer (outline + shine),
   so drinks sit inside the glass instead of being washed out by it; and find the sprinkle clusters */
function prepArt(n, im) {
  if (n === 'cups/drink-cup') {
    const w = im.naturalWidth, h = im.naturalHeight, mk = () => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
    const src = mk(), sc = src.getContext('2d'); sc.drawImage(im, 0, 0);
    let d; try { d = sc.getImageData(0, 0, w, h); } catch (e) { return; }   // blocked when opened as a local file
    const back = mk(), front = mk(), bd = new ImageData(w, h), fd = new ImageData(w, h);
    for (let i = 0; i < d.data.length; i += 4) { const a = d.data[i + 3], tgt = a > 120 ? fd : bd; for (let k = 0; k < 4; k++) tgt.data[i + k] = d.data[i + k]; }
    back.getContext('2d').putImageData(bd, 0, 0); front.getContext('2d').putImageData(fd, 0, 0);
    ART_SPLIT[n] = { back, front };
  }
  if (n.startsWith('sprinkles/')) {
    const w = im.naturalWidth, h = im.naturalHeight, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cc = cv.getContext('2d'); cc.drawImage(im, 0, 0); let img; try { img = cc.getImageData(0, 0, w, h); } catch (e) { return; }
    const d = img.data, T = sprinkleTune(n);
    if (T.vibrance && T.vibrance !== 1) {   // boost colour: push each colourful pixel away from grey, a touch deeper
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 10) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mx - mn < 25) continue;                      // leave outlines / white highlights alone
        const avg = (r + g + b) / 3, k = T.vibrance, dk = 1 - (k - 1) * .12;
        d[i] = Math.max(0, Math.min(255, (avg + (r - avg) * k) * dk));
        d[i + 1] = Math.max(0, Math.min(255, (avg + (g - avg) * k) * dk));
        d[i + 2] = Math.max(0, Math.min(255, (avg + (b - avg) * k) * dk));
      }
      cc.putImageData(img, 0, 0); ART_TUNED[n] = cv;
    }
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 > 0) ART_TRIM[n] = [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
    // find each separate sprinkle so it can be drawn bigger in place (CONFIG.SPRINKLE_ART_SCALE)
    const seen = new Uint8Array(w * h), blobs = [], on = i => d[i * 4 + 3] > 10;
    for (let i = 0; i < w * h; i++) {
      if (seen[i] || !on(i)) continue;
      let bx0 = w, by0 = h, bx1 = -1, by1 = -1; const st = [i]; seen[i] = 1;
      while (st.length) { const j = st.pop(), x = j % w, y = (j / w) | 0;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
        for (const k of [j - 1, j + 1, j - w, j + w]) if (k >= 0 && k < w * h && !seen[k] && on(k) && Math.abs((k % w) - x) <= 1) { seen[k] = 1; st.push(k); } }
      if ((bx1 - bx0) * (by1 - by0) > 4) blobs.push([bx0 - 1, by0 - 1, bx1 - bx0 + 3, by1 - by0 + 3]);
    }
    ART_BLOBS[n] = blobs;
  }
}
loadArt();

/* ---------------------------------------------------------------------
   1. HELPERS
   --------------------------------------------------------------------- */
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function fs(c, fill, lw = 4, stroke = OUT) {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
}
function vg(c, y0, y1, a, b, m) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, a); if (m) g.addColorStop(.5, m); g.addColorStop(1, b); return g;
}
function hg(c, x0, x1, a, b, m) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, a); if (m) g.addColorStop(.5, m); g.addColorStop(1, b); return g;
}
function ell(c, x, y, rx, ry, fill, lw = 0, stroke = OUT) {
  c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, Math.PI * 2); fs(c, fill, lw, stroke);
}
/* glossy white highlight strip on the upper-left of a box */
function shine(c, x, y, w, h, r, a = .55) {
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, r); c.fillStyle = '#fff'; c.fill(); c.restore();
}
function shadow(c, x, y, rx, ry, a = .16) {
  c.save(); c.globalAlpha = a; ell(c, x, y, rx, ry, '#5b3a2e'); c.restore();
}
function txt(c, s, x, y, size, color = OUT, weight = 600, align = 'center', outline = 0, oc = '#fff') {
  c.font = `${weight} ${size}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle';
  if (outline) { c.lineWidth = outline; c.strokeStyle = oc; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = color; c.fillText(s, x, y);
}
function shade(hex, k) {               // k<0 darker, k>0 lighter
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = k < 0 ? 0 : 255, p = Math.abs(k);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function mix(list) {                   // average of hex colours
  let r = 0, g = 0, b = 0; list.forEach(h => { const n = parseInt(h.slice(1), 16); r += n >> 16; g += (n >> 8) & 255; b += n & 255; });
  const k = list.length || 1; return '#' + ((1 << 24) + (Math.round(r / k) << 16) + (Math.round(g / k) << 8) + Math.round(b / k)).toString(16).slice(1);
}
function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
const flav = f => CONFIG.FLAVORS[f] || CONFIG.MESS;

/* soft glow ring used to show "you can tap here" */
function glowRect(c, x, y, w, h, r, t) {
  c.save(); c.globalAlpha = .55 + .35 * Math.sin(t * 6);
  c.shadowColor = '#fff6a8'; c.shadowBlur = 18; rr(c, x - 4, y - 4, w + 8, h + 8, r + 4);
  c.lineWidth = 5; c.strokeStyle = '#fff3a0'; c.stroke(); c.restore();
}
function glowCircle(c, x, y, r, t) {
  c.save(); c.globalAlpha = .55 + .35 * Math.sin(t * 6); c.shadowColor = '#fff6a8'; c.shadowBlur = 18;
  c.beginPath(); c.arc(x, y, r + 5, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = '#fff3a0'; c.stroke(); c.restore();
}

/* ---------------------------------------------------------------------
   2. BACKGROUND  (sky, awning, counter, shelf) — cached once per resize
   --------------------------------------------------------------------- */
function drawBackground(c, xL, xR) {
  const W = CONFIG.W;
  // sky
  c.fillStyle = vg(c, 0, 430, '#b9ddfb', '#e9f6ff'); c.fillRect(xL, 0, xR - xL, 440);
  // watercolour clouds
  const R = rng(7);
  for (let i = 0; i < 9; i++) {
    const x = xL + R() * (xR - xL), y = 150 + R() * 220, s = 40 + R() * 50;
    c.save(); c.globalAlpha = .55;
    [[0, 0, 1], [-.9, .25, .7], [.9, .3, .75], [.35, -.35, .7]].forEach(([dx, dy, k]) => ell(c, x + dx * s, y + dy * s, s * k, s * k * .62, '#fff'));
    c.restore();
  }
  // soft shadow from the awning
  c.fillStyle = vg(c, 120, 200, 'rgba(90,120,160,.20)', 'rgba(90,120,160,0)'); c.fillRect(xL, 120, xR - xL, 80);

  // awning — alternating mint / beige fabric flaps
  const fw = 141.5, start = Math.floor((xL - 6) / fw) - 1;
  for (let i = start; i * fw + 6 < xR + fw; i++) {
    const x = i * fw + 6, mint = ((i % 2) + 2) % 2 === 0;
    const base = mint ? '#93d3ae' : '#d8be98', dark = mint ? '#71b991' : '#bea078';
    c.beginPath(); c.moveTo(x, -10); c.lineTo(x + fw, -10); c.lineTo(x + fw, 70);
    c.bezierCurveTo(x + fw, 150, x, 150, x, 70); c.closePath();
    c.fillStyle = vg(c, 0, 140, shade(base, .12), dark, base); c.fill();
    c.lineWidth = 3; c.strokeStyle = shade(dark, -.18); c.stroke();
    // stitches
    c.save(); c.setLineDash([7, 7]); c.lineWidth = 2.2; c.strokeStyle = 'rgba(255,255,255,.75)';
    c.beginPath(); c.moveTo(x + 9, 0); c.lineTo(x + 9, 70); c.bezierCurveTo(x + 9, 136, x + fw - 9, 136, x + fw - 9, 70); c.lineTo(x + fw - 9, 0); c.stroke();
    c.restore();
    // fabric shine
    c.save(); c.globalAlpha = .22; rr(c, x + 18, 8, 16, 80, 8); c.fillStyle = '#fff'; c.fill(); c.restore();
  }
  // awning bar
  c.fillStyle = vg(c, 0, 14, '#f7efe6', '#e2d5c6'); c.fillRect(xL, 0, xR - xL, 12);

  // counter + cabinet move up with the work table (phone layout)
  c.save(); c.translate(0, -L.band);
  // counter top
  rr(c, xL - 30, 410, (xR - xL) + 60, 344, 24);
  c.fillStyle = vg(c, 410, 754, '#f6efe6', '#e8dccd'); c.fill(); c.lineWidth = 4; c.strokeStyle = OUT; c.stroke();
  c.save(); c.globalAlpha = .6; c.fillStyle = '#fff'; c.fillRect(xL, 416, xR - xL, 5); c.restore();
  c.fillStyle = 'rgba(160,130,100,.18)'; c.fillRect(xL, 730, xR - xL, 22);

  // lower cabinet / shelf
  c.fillStyle = vg(c, 754, 860, '#d9bd93', '#c7a679'); c.fillRect(xL, 754, xR - xL, 110);
  c.fillStyle = 'rgba(91,58,46,.18)'; c.fillRect(xL, 754, xR - xL, 8);
  c.lineWidth = 4; c.strokeStyle = OUT; c.beginPath(); c.moveTo(xL, 754); c.lineTo(xR, 754); c.stroke();
  [443, 1088].forEach(x => { c.beginPath(); c.moveTo(x, 754); c.lineTo(x, 870); c.stroke(); });
  // wood grain
  c.save(); c.globalAlpha = .13; c.strokeStyle = '#7a5332'; c.lineWidth = 2;
  for (let y = 776; y < 860; y += 22) { c.beginPath(); c.moveTo(xL, y); for (let x = xL; x < xR; x += 60) c.quadraticCurveTo(x + 30, y + (((x / 60) | 0) % 2 ? 4 : -4), x + 60, y); c.stroke(); }
  c.restore();

  // stand sign on the cabinet
  const s = L.sign;
  shadow(c, s.x + s.w / 2, s.y + s.h + 4, s.w * .45, 6, .12);
  rr(c, s.x, s.y, s.w, s.h, 22); fs(c, vg(c, s.y, s.y + s.h, '#fff6ec', '#f4dfcf'));
  rr(c, s.x + 8, s.y + 8, s.w - 16, s.h - 16, 16); c.save(); c.setLineDash([6, 6]); fs(c, null, 2.2, '#e7a9b9'); c.restore();
  txt(c, "Soso's Ice Cream", s.x + s.w / 2 + 24, s.y + s.h / 2 + 1, 27, '#ef7fa3', 700, 'center', 6, '#fff');
  drawScoopBall(c, s.x + 34, s.y + 30, 15, 'strawberry', 3);
  c.beginPath(); c.moveTo(s.x + 21, s.y + 38); c.lineTo(s.x + 47, s.y + 38); c.lineTo(s.x + 34, s.y + 60); c.closePath(); fs(c, '#efc07f', 3);
  c.restore();
}

/* ---------------------------------------------------------------------
   3. ICE CREAM SCOOPS
   --------------------------------------------------------------------- */
function scoopPath(c, x, y, r) {
  c.beginPath();
  c.arc(x, y, r, Math.PI * .86, Math.PI * 2.14);
  const ex = x + r * Math.cos(Math.PI * .14), ey = y + r * Math.sin(Math.PI * .14), sx = x - (ex - x);
  const n = 4, span = ex - sx;
  for (let i = 1; i <= n; i++) {
    const px = ex - span * i / n, cx = ex - span * (i - .5) / n;
    c.quadraticCurveTo(cx, ey + r * (i % 2 ? .34 : .22), px, ey);
  }
  c.closePath();
}
function drawScoopBall(c, x, y, r, f, seed = 1, spr = null, sk = 1) {
  const img = art(SCOOP_ART(f));
  if (img) {
    const k = r / 40, [bx, by, bw, bh] = BOX.scoop40, b = [x + bx * k, y + by * k, bw * k, bh * k];
    c.drawImage(img, b[0], b[1], b[2], b[3]);
    if (spr && art(SPRINKLE_ART[spr])) drawSprinkleArt(c, SPRINKLE_ART[spr], b);   // sprinkles: same canvas as the scoop
    else if (spr) drawSprinklesOn(c, x, y, r, spr, seed, sk);
    return;
  }
  const F = flav(f), R = rng(seed + (f || 'x').length * 13);
  c.save();
  scoopPath(c, x, y, r);
  const g = c.createRadialGradient(x - r * .38, y - r * .45, r * .1, x, y, r * 1.15);
  g.addColorStop(0, F.light); g.addColorStop(.55, F.base); g.addColorStop(1, F.shade);
  c.fillStyle = g; c.fill();
  c.save(); scoopPath(c, x, y, r); c.clip();
  if (CONFIG.SCOOP_DETAILS) {   // flavour textures (chips, swirls, blobs…) — off: scoops show only their base colour
  if (F.fx === 'chips') for (let i = 0; i < 7; i++) { c.save(); c.translate(x + (R() - .5) * r * 1.6, y + (R() - .6) * r * 1.4); c.rotate(R() * 3); rr(c, -r * .09, -r * .05, r * .18, r * .1, 2); c.fillStyle = '#1e1a1c'; c.fill(); c.restore(); }
  if (F.fx === 'beans') for (let i = 0; i < 9; i++) ell(c, x + (R() - .5) * r * 1.5, y + (R() - .6) * r * 1.3, r * .035, r * .035, '#b88d55');
  if (F.fx === 'swirl') { c.lineWidth = r * .14; c.strokeStyle = '#ff92b5'; c.beginPath(); c.arc(x + r * .1, y + r * .05, r * .45, Math.PI * 1.1, Math.PI * 2.3); c.stroke(); }
  if (F.fx === 'zest') for (let i = 0; i < 7; i++) ell(c, x + (R() - .5) * r * 1.5, y + (R() - .6) * r * 1.3, r * .05, r * .05, '#fffbe0');
  if (F.fx === 'shine') { c.lineWidth = r * .12; c.strokeStyle = 'rgba(255,220,190,.45)'; c.beginPath(); c.arc(x + r * .1, y + r * .1, r * .5, Math.PI * 1.15, Math.PI * 1.9); c.stroke(); }
  if (F.fx === 'blobs') ['#ffb3cf', '#a9d8ff', '#cdb5ff', '#fff09a', '#b6f0d0'].forEach((col, i) => ell(c, x + (R() - .5) * r * 1.4, y + (R() - .55) * r * 1.2, r * (.22 + R() * .12), r * (.18 + R() * .1), col));
  if (F.fx === 'mess') { ['#9c6a49', '#ffc9da', '#a9e7d6', '#fff184'].forEach((col, i) => { c.lineWidth = r * .16; c.strokeStyle = col; c.globalAlpha = .55; c.beginPath(); c.arc(x + (R() - .5) * r * .6, y + (R() - .5) * r * .5, r * (.3 + R() * .35), R() * 6, R() * 6 + 2.5); c.stroke(); }); c.globalAlpha = 1; }
  }
  c.restore();
  scoopPath(c, x, y, r); fs(c, null, Math.max(2, r * .1));
  ell(c, x - r * .38, y - r * .48, r * .24, r * .14, 'rgba(255,255,255,.75)');
  if (spr) drawSprinklesOn(c, x, y, r, spr, seed, sk);
  c.restore();
}
/* cookie-style chocolate chip: rounded triangle, milk-chocolate brown (lighter than the black chips in choco mint) */
function drawChocoChip(c, x, y, s, rot = 0, ow = 1.5) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(0, -s * 1.05);
  c.quadraticCurveTo(s * .18, -s * .55, s * .95, s * .45);
  c.quadraticCurveTo(s * 1.05, s * .72, s * .7, s * .72);
  c.lineTo(-s * .7, s * .72);
  c.quadraticCurveTo(-s * 1.05, s * .72, -s * .95, s * .45);
  c.quadraticCurveTo(-s * .18, -s * .55, 0, -s * 1.05); c.closePath();
  c.fillStyle = '#8a4b26'; c.fill();
  c.lineWidth = Math.max(1, ow); c.strokeStyle = '#1a1210'; c.lineJoin = 'round'; c.stroke();   // black outline
  c.beginPath(); c.ellipse(-s * .22, -s * .1, s * .14, s * .3, -.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,215,180,.6)'; c.fill();
  c.restore();
}
function drawSprinklesOn(c, x, y, r, type, seed = 1, k = 1) {   // k = sprinkle size multiplier
  const R = rng(seed * 7 + 3), cols = ['#ff7aa8', '#7fc8ff', '#ffd55c', '#8fe39a', '#c9a0ff', '#ff9d5c'];
  c.save(); scoopPath(c, x, y, r); c.clip();
  k *= CONFIG.SPRINKLE_SIZE;                       // bigger sprinkles…
  // spots spread evenly over the scoop (x, y as a fraction of the radius), lightly jittered
  const SPOTS = [[-.5, -.42], [.08, -.66], [.56, -.3], [-.12, -.08], [.36, .14], [-.56, .16], [.02, .36]];
  const n = type === 'chip' ? Math.min(5, CONFIG.SPRINKLE_COUNT) : Math.round(CONFIG.SPRINKLE_COUNT); // chips are big → fewer
  // choco chips are the biggest sprinkle, so they get their own, wider-apart spots
  const CHIP_SPOTS = [[-.66, -.3], [.04, -.72], [.66, -.28], [-.3, .24], [.4, .26]];
  for (let i = 0; i < n; i++) {
    const sp = type === 'chip' ? CHIP_SPOTS[i % CHIP_SPOTS.length] : SPOTS[i % SPOTS.length];
    const jit = type === 'chip' ? .05 : .12, T = CONFIG.SPRINKLES[type] || {}, sprd = T.spread ?? 1, lift = T.lift ?? 0;
    const px = x + (sp[0] + (R() - .5) * jit) * sprd * r, py = y + ((sp[1] + (R() - .5) * jit) * sprd - lift) * r;
    const q = r * k;
    c.lineWidth = Math.max(1, r * .035); c.strokeStyle = 'rgba(255,255,255,.9)';
    if (type === 'rainbow') { c.save(); c.translate(px, py); c.rotate(R() * 3); rr(c, -q * .1, -q * .035, q * .2, q * .07, q * .035); c.fillStyle = cols[i % 6]; c.fill(); c.strokeStyle = 'rgba(91,58,46,.45)'; c.stroke(); c.restore(); }
    if (type === 'metal') { ell(c, px, py, q * .06, q * .06, '#c9ccd6', Math.max(1, r * .03), '#7d8190'); ell(c, px - q * .02, py - q * .02, q * .022, q * .022, '#fff'); }
    if (type === 'chip') drawChocoChip(c, px, py, q * .1, (R() - .5) * .7, Math.max(1.5, r * .05));
  }
  c.restore();
}

/* ---------------------------------------------------------------------
   4. CUPS & ORDERS
   item = { k:'H'|'I', waffle, scoops[], smoothie, soda{}, spill, spr, ut }
   drawn with (x, y) = bottom-centre of the cup
   --------------------------------------------------------------------- */
function drawItem(c, it, x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!art(it.k === 'H' ? 'cups/ice-cream-cup' : 'cups/drink-cup')) shadow(c, 0, 2, it.k === 'H' ? 40 : 34, 7);   // PNGs have their own shadow
  if (it.k === 'H') drawCupH(c, it, t); else drawCupI(c, it, t);
  c.restore();
}

/* h. ice cream cup (paper) */
function cupHPath(c, top = -62) { c.beginPath(); c.moveTo(-46, top); c.lineTo(46, top); c.lineTo(31, 0); c.lineTo(-31, 0); c.closePath(); }
function drawCupH(c, it, t) {
  const top = -62;
  if (it.waffle) drawWaffleBowl(c, 0, top + 10, it.waffle, 1);
  const base = top + (it.waffle ? -14 : 4);
  const sc = it.scoops || [];
  const pos = sc.length > 1 ? [[0, base - 18, 30], [0, base - 56, 26]] : [[0, base - 20, 31]];
  // spoon behind the top scoop
  if (it.ut) drawUtensil(c, it.ut, 22, base - 10, .55);
  sc.forEach((f, i) => drawScoopBall(c, pos[i][0], pos[i][1], pos[i][2], f, i + 2, it.spr && i === sc.length - 1 ? it.spr : null, it.sprK || 1));
  // cup body
  if (drawArt(c, 'cups/ice-cream-cup', BOX['cups/ice-cream-cup'])) return;
  cupHPath(c, top);
  c.fillStyle = hg(c, -46, 46, '#9fdcc4', '#8fd1b9', '#c8f3e2'); c.fill();
  c.save(); cupHPath(c, top); c.clip();
  c.fillStyle = '#ffc0d3';
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 22 - 5, top); c.lineTo(i * 22 + 5, top); c.lineTo(i * 15 + 4, 0); c.lineTo(i * 15 - 4, 0); c.closePath(); c.fill(); }
  shine(c, -34, top + 10, 9, 44, 5, .45);
  c.restore();
  cupHPath(c, top); fs(c, null, 4);
  rr(c, -50, top - 7, 100, 14, 7); fs(c, vg(c, top - 7, top + 7, '#fffaf1', '#f2e2cd'), 3.5);
  if (!it.ut && it.waffle && !sc.length) {} // nothing extra
}
function drawWaffleBowl(c, x, y, w, s = 1) {
  const B = CONFIG.BATTERS[w.b], col = w.d === 'raw' ? B.raw : w.d === 'burnt' ? B.burnt : B.ok;
  const dark = w.d === 'raw' ? shade(B.raw, -.15) : w.d === 'burnt' ? '#2a1a12' : B.okDark;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-50, 6); c.lineTo(-56, -22);
  const pts = 6; for (let i = 0; i < pts; i++) { const x0 = -56 + 112 * i / pts, x1 = -56 + 112 * (i + 1) / pts; c.quadraticCurveTo((x0 + x1) / 2, -40, x1, -22); }
  c.lineTo(50, 6); c.closePath();
  c.fillStyle = vg(c, -40, 6, shade(col, .18), col); c.fill();
  c.save(); c.clip(); c.strokeStyle = dark; c.lineWidth = 3; c.globalAlpha = .55;
  for (let i = -70; i < 70; i += 14) { c.beginPath(); c.moveTo(i, -45); c.lineTo(i + 30, 10); c.stroke(); c.beginPath(); c.moveTo(i + 30, -45); c.lineTo(i, 10); c.stroke(); }
  c.restore();
  c.beginPath(); c.moveTo(-50, 6); c.lineTo(-56, -22);
  for (let i = 0; i < pts; i++) { const x0 = -56 + 112 * i / pts, x1 = -56 + 112 * (i + 1) / pts; c.quadraticCurveTo((x0 + x1) / 2, -40, x1, -22); }
  c.lineTo(50, 6); fs(c, null, 3.5);
  if (w.d === 'burnt') { c.globalAlpha = .5; ell(c, -10, -24, 8, 4, '#888'); c.globalAlpha = 1; }
  c.restore();
}

/* i. drink cup (clear plastic) */
function cupIPath(c) { c.beginPath(); c.moveTo(-37, -120); c.lineTo(37, -120); c.lineTo(27, 0); c.lineTo(-27, 0); c.closePath(); }
function sodaTotal(it) { return it.soda ? CONFIG.SODA_ORDER.reduce((a, k) => a + (it.soda[k] || 0), 0) : 0; }
/* smoothie: 1 scoop = half cup, 2 scoops = full cup */
function smoothieLevel(sm) { return sm.scoops.length > 1 ? .86 : .56; }
/* Each flavour keeps its own colour in the drink so a mix can be read (and matched with the recipe book):
   short = chunky bits of each flavour · long = smooth two-tone swirl · over = pale and watery */
function drawSmoothieFill(c, sm, level) {
  const fl = sm.scoops.slice().sort(), A = flav(fl[0]), B = flav(fl[1] || fl[0]), col = mix([A.base, B.base]);
  const R = rng(5 + fl.join('').length);
  if (sm.blend === 'over') {
    c.fillStyle = vg(c, -level, 0, shade(col, .6), shade(col, .2)); c.fillRect(-40, -level, 80, level);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-40, -level, 80, 16);
    for (let i = 0; i < 4; i++) ell(c, (R() - .5) * 50, -R() * level * .8 - 8, 5, 2.5, 'rgba(255,255,255,.6)');
  } else {
    c.fillStyle = vg(c, -level, 0, shade(col, .2), shade(col, -.06)); c.fillRect(-40, -level, 80, level);
    if (sm.blend === 'long') {
      // smooth swirl ribbons of each flavour
      [A, B, A, B].forEach((F, i) => {
        const yy = -level * (.18 + i * .22);
        c.lineWidth = level * .14; c.strokeStyle = F.base; c.globalAlpha = .85; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-44, yy + 6); c.bezierCurveTo(-18, yy - 10, 10, yy + 14, 44, yy - 4); c.stroke();
        c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(-40, yy + 1); c.bezierCurveTo(-16, yy - 14, 10, yy + 9, 40, yy - 9); c.stroke();
      });
      c.globalAlpha = 1;
    } else {
      // chunky bits of each flavour (big lumps when not blended at all)
      const raw = sm.blend === 'raw';
      fl.forEach((f, j) => { const F = flav(f); for (let i = 0; i < (raw ? 3 : 7); i++) ell(c, (R() - .5) * 56, -R() * level * .85 - 7, raw ? 12 : 6.5, raw ? 10 : 5, F.base, 1.6, F.shade); });
    }
    if (fl.includes('special')) ['#ffb3cf', '#a9d8ff', '#cdb5ff', '#fff09a'].forEach(cc => ell(c, (R() - .5) * 54, -R() * level * .85 - 6, 3.5, 3, cc));
  }
  ell(c, 0, -level, 40, 5, shade(col, .35));
}
/* o. cup cap — clear dome lid for smoothies */
function drawCapShape(c, alpha = .5) {
  c.beginPath(); c.moveTo(-43, -122); c.bezierCurveTo(-42, -156, 42, -156, 43, -122); c.closePath();
  c.fillStyle = `rgba(255,255,255,${alpha})`; c.fill(); c.lineWidth = 3.5; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke();
  c.save(); c.globalAlpha = .8; c.lineWidth = 4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(-14, -128, 18, Math.PI * 1.15, Math.PI * 1.5); c.stroke(); c.restore();
  ell(c, 0, -147, 9, 3.5, 'rgba(255,255,255,.9)', 2.5);
  rr(c, -45, -127, 90, 9, 4.5); fs(c, 'rgba(255,255,255,.95)', 3);
}
function drawCupI(c, it, t) {
  const inner = 112;
  // back glass
  const glass = ART_SPLIT['cups/drink-cup'], gb = BOX['cups/drink-cup'];
  if (glass) c.drawImage(glass.back, gb[0], gb[1], gb[2], gb[3]);
  else { cupIPath(c); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); }
  c.save(); cupIPath(c); c.clip();
  // contents
  const tot = sodaTotal(it);
  let level = 0;
  if (it.smoothie) {
    level = smoothieLevel(it.smoothie) * inner;
    drawSmoothieFill(c, it.smoothie, level);
  } else if (tot > 0) {
    level = Math.min(tot, 1.04) * inner;
    let yb = 0;
    CONFIG.SODA_ORDER.forEach(k => {
      const v = (it.soda[k] || 0) / tot * level; if (v <= 0) return;
      const S = CONFIG.SODAS[k];
      c.fillStyle = vg(c, yb - v, yb, S.light, S.color); c.fillRect(-40, yb - v, 80, v + .5); yb -= v;
    });
    // bubbles
    c.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 7; i++) { const by = -((t * 30 + i * 17) % Math.max(10, level)); ell(c, ((i * 23) % 44) - 22, by, 2.6, 2.6, 'rgba(255,255,255,.8)'); }
    ell(c, 0, -level, 40, 4, 'rgba(255,255,255,.65)');
  }
  c.restore();
  // straw-spoon inside
  if (it.ut) drawUtensil(c, it.ut, 8, -36, .62, true);
  // scoop sitting at the bottom (before the soda is poured) — the soda float is drawn on top of the rim below
  const floatScoop = it.scoops && it.scoops.length && level > 30;
  if (it.scoops && it.scoops.length && !floatScoop) {
    drawScoopBall(c, 0, -26, 27, it.scoops[0], 4, it.spr, it.sprK || 1);
  } else if (it.spr && it.smoothie && art(SPRINKLE_ART[it.spr]) && ART_TRIM[SPRINKLE_ART[it.spr]]) {
    // sprinkles on top of the smoothie — the sprinkle PNG, trimmed to its cluster, laid on the drink's surface
    const n = SPRINKLE_ART[it.spr], im = art(n), [sx, sy, sw, sh] = ART_TRIM[n], w = CONFIG.SMOOTHIE_SPRINKLE_W, k = w / sw, h = sh * k;
    // map the whole sprinkle canvas so its cluster lands on the drink surface, then draw each sprinkle bigger
    drawSprinkleArt(c, n, [-w / 2 - sx * k, -level - h * .62 - sy * k, im.naturalWidth * k, im.naturalHeight * k]);
  } else if (it.spr && it.smoothie) {
    // sprinkles on top of the smoothie
    const R = rng(9), cols = ['#ff7aa8', '#7fc8ff', '#ffd55c', '#8fe39a', '#c9a0ff'], q = (it.sprK || 1) * CONFIG.SPRINKLE_SIZE;
    for (let i = 0; i < 9; i++) {
      const px = (R() - .5) * 60, py = -level + (R() - .5) * 6;
      if (it.spr === 'rainbow') { rr(c, px - 4 * q, py - 1.5 * q, 8 * q, 3 * q, 1.5 * q); c.fillStyle = cols[i % 5]; c.fill(); }
      else if (it.spr === 'metal') ell(c, px, py, 2.6 * q, 2.6 * q, '#c9ccd6', 1, '#8b8f9c');
      else drawChocoChip(c, px, py, 3.4 * q, (R() - .5) * .7, 1.2);
    }
  }
  // front glass
  if (glass) c.drawImage(glass.front, gb[0], gb[1], gb[2], gb[3]);
  else if (!drawArt(c, 'cups/drink-cup', gb)) {
    c.save(); cupIPath(c); c.clip(); shine(c, -28, -112, 8, 96, 4, .5); shine(c, 18, -108, 4, 70, 2, .3); c.restore();
    cupIPath(c); fs(c, null, 3.5);
    rr(c, -40, -124, 80, 9, 4.5); fs(c, 'rgba(255,255,255,.85)', 3);
  }
  if (it.cap && !drawArt(c, 'cups/cup-cap', BOX['cups/cup-cap'])) drawCapShape(c);
  // soda float: the scoop sits on the rim, in front of the glass, so it and its sprinkles stay fully visible
  if (floatScoop) drawScoopBall(c, 0, -142, 31, it.scoops[0], 4, it.spr, it.sprK || 1);
  if (it.spill) {
    const S = CONFIG.SODAS[CONFIG.SODA_ORDER.find(k => it.soda[k] > 0) || 'soda'];
    c.fillStyle = S.color; c.globalAlpha = .8;
    rr(c, 26, -112, 9, 50, 4.5); c.fill(); rr(c, -36, -112, 8, 34, 4); c.fill();
    ell(c, 0, 2, 50, 7, S.color); c.globalAlpha = 1;
  }
}

/* j/k. utensils */
function drawUtensil(c, type, x, y, s = 1, tilted) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(tilted ? .28 : .35);
  if (type === 'spoon') {
    rr(c, -6, -100, 12, 96, 6); fs(c, vg(c, -100, 0, '#ffd2df', '#ff9fbd'), 4);
    ell(c, 0, -104, 15, 19, '#ffc1d3', 4); ell(c, -4, -110, 4, 7, 'rgba(255,255,255,.7)');
  } else {
    c.save(); rr(c, -7, -170, 14, 170, 7); c.clip();
    c.fillStyle = '#e4d6ff'; c.fillRect(-8, -172, 16, 174);
    c.fillStyle = '#b79cf2'; for (let yy = -170; yy < 0; yy += 22) { c.beginPath(); c.moveTo(-8, yy); c.lineTo(8, yy - 10); c.lineTo(8, yy); c.lineTo(-8, yy + 10); c.fill(); }
    c.restore(); rr(c, -7, -170, 14, 170, 7); fs(c, null, 4);
    // little spoon end (only visible when held, otherwise it is inside the cup)
    ell(c, 0, 4, 12, 9, '#e4d6ff', 3.5);
  }
  c.restore();
}

/* order → item, used to draw the speech bubble with the same renderer */
function orderToItem(o) {
  // sprK: sprinkles drawn 15% bigger in the order bubble so they are easy to read (v0 feedback)
  const it = { k: o.type === 'cup' || o.type === 'waffle' ? 'H' : 'I', scoops: [], spr: o.spr, sprK: 1.15, ut: null, waffle: null, smoothie: null, soda: {} };
  if (it.k === 'H') { it.scoops = o.scoops.slice(); it.ut = 'spoon'; if (o.type === 'waffle') it.waffle = { b: o.batter, d: 'ok' }; }
  if (o.type === 'smoothie') { it.smoothie = { scoops: o.scoops.slice(), blend: o.blend }; it.cap = true; it.ut = 'straw'; }
  if (o.type === 'soda') { it.scoops = o.scoops.slice(); o.soda.forEach(k => it.soda[k] = .92 / o.soda.length); it.ut = 'straw'; }
  return it;
}

/* ---------------------------------------------------------------------
   5. STATIONS
   --------------------------------------------------------------------- */

/* n. work desk */
function drawDesk(c) {
  const d = L.desk;
  shadow(c, d.x + d.w / 2, d.y + d.h + 2, d.w * .48, 8, .12);
  rr(c, d.x, d.y, d.w, d.h, 18); fs(c, vg(c, d.y, d.y + d.h, '#d9f1e3', '#b9dcc8'));
  rr(c, d.x + 6, d.y + 6, d.w - 12, 16, 8); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  c.save(); c.globalAlpha = .25; c.strokeStyle = '#6aa889'; c.lineWidth = 2; c.setLineDash([8, 8]);
  rr(c, d.x + 14, d.y + 30, d.w - 28, d.h - 40, 10); c.stroke(); c.restore();
}

/* a. ice cream tray */
function drawTray(c, st, t) {
  if (drawArt(c, 'ice-cream-tray/tray-full', BOX['ice-cream-tray/tray-full'])) {
    CONFIG.TRAY_ORDER.forEach((f, i) => { const [x, y] = L.tubs[i]; drawArt(c, 'ice-cream-tray/tub-' + f, [x - 47, y - 57, 94, 114]); });
    return;
  }
  const T = L.tray;
  shadow(c, T.x + T.w / 2, T.y + T.h + 2, T.w * .48, 8, .12);
  rr(c, T.x, T.y, T.w, T.h, 26); fs(c, vg(c, T.y, T.y + T.h, '#eceaf3', '#d3d1de'));
  rr(c, T.x + 10, T.y + 10, T.w - 20, 12, 6); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  CONFIG.TRAY_ORDER.forEach((f, i) => {
    const [cx, cy] = L.tubs[i], w = L.tubW, h = L.tubH, F = CONFIG.FLAVORS[f];
    rr(c, cx - w / 2, cy - h / 2, w, h, 18); fs(c, vg(c, cy - h / 2, cy + h / 2, '#c7c6d3', '#9897aa'));
    rr(c, cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16, 13);
    const g = c.createRadialGradient(cx - 12, cy - 22, 4, cx, cy, h * .6); g.addColorStop(0, F.light); g.addColorStop(.6, F.base); g.addColorStop(1, F.shade);
    fs(c, g, 3);
    // texture + scoop marks
    c.save(); rr(c, cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16, 13); c.clip();
    const R = rng(i + 3);
    if (F.fx === 'chips') for (let k = 0; k < 10; k++) { rr(c, cx - 30 + R() * 56, cy - 44 + R() * 86, 7, 4, 2); c.fillStyle = '#1e1a1c'; c.fill(); }
    if (F.fx === 'beans') for (let k = 0; k < 14; k++) ell(c, cx - 30 + R() * 60, cy - 44 + R() * 86, 1.6, 1.6, '#b88d55');
    if (F.fx === 'swirl' || F.fx === 'shine' || F.fx === 'zest') { c.lineWidth = 7; c.strokeStyle = F.fx === 'swirl' ? '#ff97b9' : 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(cx - 10, cy + 30); c.bezierCurveTo(cx + 28, cy + 16, cx + 20, cy - 24, cx - 4, cy - 14); c.bezierCurveTo(cx - 22, cy - 6, cx - 12, cy - 36, cx + 8, cy - 38); c.stroke(); }
    if (F.fx === 'blobs') ['#ffb3cf', '#a9d8ff', '#cdb5ff', '#fff09a', '#b6f0d0', '#ffb3cf', '#a9d8ff'].forEach((col) => ell(c, cx - 26 + R() * 52, cy - 36 + R() * 72, 12 + R() * 6, 9 + R() * 5, col));
    c.globalAlpha = .35; c.strokeStyle = '#fff'; c.lineWidth = 4;
    c.beginPath(); c.arc(cx + 8, cy + 12, 16, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    c.restore();
    ell(c, cx - 22, cy - 34, 9, 5, 'rgba(255,255,255,.6)');
  });
}

/* b. washing bowl (scoop rests here) */
function drawBowl(c, st, t) {
  const B = L.bowl;
  shadow(c, B.cx, B.cy + B.r - 2, B.r * .9, 8);
  ell(c, B.cx, B.cy, B.r, B.r * .96, vg(c, B.cy - B.r, B.cy + B.r, '#e3edf7', '#a9bccf'), 4);
  ell(c, B.cx, B.cy - 2, B.r - 9, B.r * .96 - 10, vg(c, B.cy - B.r, B.cy + B.r, '#d7f3ff', '#9fd8f2'), 3);
  // ripples
  c.save(); c.globalAlpha = .7; c.strokeStyle = '#fff'; c.lineWidth = 2.5;
  const w = st.washT > 0 ? st.washT : 0;
  for (let i = 0; i < 2; i++) { const rr_ = 10 + ((t * 14 + i * 12) % 24) + w * 10; c.beginPath(); c.ellipse(B.cx + 6, B.cy + 4, rr_, rr_ * .7, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  if (st.scoopHome) drawScoopTool(c, B.cx + 4, B.cy + 2, .9, { fl: null, dirty: null }, -0.6);
}

/* c. blender */
function blendLevelName(b) {
  if (b < CONFIG.BLEND_SHORT) return 'raw';
  if (b < CONFIG.BLEND_LONG) return 'short';
  if (b < CONFIG.BLEND_OVER) return 'long';
  return 'over';
}
function drawJug(c, x, y, s, bl, t, running) {
  // x,y = bottom centre of the jug
  c.save(); c.translate(x, y); c.scale(s, s);
  if (running) c.translate(Math.sin(t * 70) * 1.6, 0);
  const jug = () => { c.beginPath(); c.moveTo(-58, -150); c.lineTo(58, -150); c.lineTo(30, 0); c.lineTo(-30, 0); c.closePath(); };
  jug(); c.fillStyle = 'rgba(235,248,255,.65)'; c.fill();
  c.save(); jug(); c.clip();
  if (bl.scoops.length) {
    const k = Math.min(1, bl.blend / CONFIG.BLEND_LONG), col = mix(bl.scoops.map(f => flav(f).base));
    const lvl = bl.scoops.length === 1 ? 62 : 100;
    if (k > .05) { c.globalAlpha = Math.min(1, k * 1.3); c.fillStyle = vg(c, -lvl, 0, shade(col, .25), shade(col, -.05)); c.fillRect(-60, -lvl, 120, lvl); c.globalAlpha = 1; }
    if (k < .9) bl.scoops.forEach((f, i) => {
      c.globalAlpha = 1 - k;
      drawScoopBall(c, i ? 12 : -10, -24 - i * 40 + (running ? Math.sin(t * 30 + i) * 6 : 0), 24, f, i + 7);
      c.globalAlpha = 1;
    });
    if (bl.blend >= CONFIG.BLEND_OVER) { c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(-60, -lvl, 120, 26); }
    if (running) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, -lvl * .5, 14 + i * 12, t * 20 + i, t * 20 + i + 2); c.stroke(); } }
  }
  c.restore();
  // blade
  c.strokeStyle = '#9aa3b2'; c.lineWidth = 4; c.beginPath(); c.moveTo(-14, -10); c.lineTo(14, -10); c.stroke();
  c.save(); jug(); c.clip(); shine(c, -46, -146, 10, 120, 5, .55); c.restore();
  jug(); fs(c, null, 4);
  // measuring marks
  c.strokeStyle = 'rgba(91,58,46,.35)'; c.lineWidth = 2; [-40, -75, -110].forEach(yy => { c.beginPath(); c.moveTo(20, yy); c.lineTo(34, yy); c.stroke(); });
  // lid + cap
  rr(c, -62, -168, 124, 20, 9); fs(c, vg(c, -168, -148, '#d7f1e2', '#a9d8bf'), 4);
  rr(c, -13, -204, 26, 38, 8); fs(c, vg(c, -204, -166, '#ffe9d8', '#ffcdb2'), 4);
  c.restore();
}
function drawBlender(c, st, t) {
  const [PX, PY] = L.blenderPivot, [AX, AY] = L.blenderAt, k = L.blenderScale;
  c.save(); c.translate(AX, AY); c.scale(k, k); c.translate(-PX, -PY);
  drawBlenderInner(c, st, t);
  c.restore();
}
function drawBlenderInner(c, st, t) {
  const b = st.blender, B = L.blender, K = L.knob, running = b.knob > 0;
  // jug (when not in hand)
  if (!st.jugInHand) drawJug(c, 530, 452, 1, b, t, running);
  // base
  shadow(c, 530, 530, 60, 8);
  c.beginPath(); c.moveTo(488, 448); c.lineTo(572, 448); c.lineTo(588, 526); c.lineTo(472, 526); c.closePath();
  fs(c, vg(c, 448, 526, '#d6f0df', '#a5d3b8'));
  shine(c, 492, 454, 76, 7, 3, .6);
  // knob: OFF / ON only (v0.2)
  const ang = b.knob ? .95 : -.95;
  txt(c, 'OFF', K.cx - 36, K.cy + 1, 11, b.knob ? '#8fb3a0' : '#3f7a5c', 700); txt(c, 'ON', K.cx + 34, K.cy + 1, 11, b.knob ? '#e2577f' : '#8fb3a0', 700);
  if (b.knob) { ell(c, K.cx + 34, K.cy + 16, 4, 4, '#ff7fa3', 1.5, '#fff'); }
  ell(c, K.cx, K.cy + 2, K.r + 1, K.r, 'rgba(0,0,0,.12)');
  ell(c, K.cx, K.cy, K.r, K.r, vg(c, K.cy - K.r, K.cy + K.r, '#fff0e4', '#ffc9a8'), 4);
  c.save(); c.translate(K.cx, K.cy); c.rotate(ang); rr(c, -3.5, -K.r + 3, 7, 15, 3.5); c.fillStyle = OUT; c.fill(); c.restore();
  ell(c, K.cx - 7, K.cy - 8, 5, 3, 'rgba(255,255,255,.8)');
  // gauge
  const G = L.gauge, total = CONFIG.BLEND_OVER * 1.15;
  rr(c, G.x, G.y, G.w, G.h, 6.5); fs(c, '#fff', 2.5);
  const zone = (a, bb, col) => { const y0 = G.y + G.h - G.h * bb / total, y1 = G.y + G.h - G.h * a / total; c.fillStyle = col; c.fillRect(G.x + 3, y0, G.w - 6, y1 - y0); };
  c.save(); rr(c, G.x + 2, G.y + 2, G.w - 4, G.h - 4, 6); c.clip();
  zone(CONFIG.BLEND_SHORT, CONFIG.BLEND_LONG, '#ffe7a3'); zone(CONFIG.BLEND_LONG, CONFIG.BLEND_OVER, '#bfeac9'); zone(CONFIG.BLEND_OVER, total, '#ffc3c3');
  c.restore();
  if (b.scoops.length) { const y = G.y + G.h - G.h * Math.min(b.blend, total) / total; rr(c, G.x - 4, y - 2.5, G.w + 8, 5, 2.5); fs(c, '#ff7fa3', 2); }
  txt(c, 'S', G.x + G.w / 2, G.y + G.h - G.h * (CONFIG.BLEND_SHORT + CONFIG.BLEND_LONG) / 2 / total, 9, '#b58a1d', 700);
  txt(c, 'L', G.x + G.w / 2, G.y + G.h - G.h * (CONFIG.BLEND_LONG + CONFIG.BLEND_OVER) / 2 / total, 9, '#3f9461', 700);
}

/* d. soft drink dispenser */
function drawDispenser(c, st, t) {
  c.save(); c.translate(L.dispShift[0], L.dispShift[1]);
  drawDispenserLocal(c, st, t);
  c.restore();
}
function drawDispenserLocal(c, st, t) {
  shadow(c, 1097, 502, 137, 8);
  // drip tray
  rr(c, 958, 424, 280, 78, 18); fs(c, vg(c, 424, 502, '#f9d4d8', '#e9b2b9'));
  rr(c, 970, 434, 256, 56, 12); fs(c, '#5a5566', 3);
  c.strokeStyle = '#6e6980'; c.lineWidth = 3; for (let x = 984; x < 1220; x += 16) { c.beginPath(); c.moveTo(x, 438); c.lineTo(x, 486); c.stroke(); }
  // neck
  rr(c, 976, 352, 244, 80, 10); fs(c, vg(c, 352, 432, '#fbd8dc', '#efbcc3'));
  // body
  rr(c, 955, 222, 285, 146, 24); fs(c, vg(c, 222, 368, '#fde0e3', '#f1bcc4'));
  shine(c, 970, 232, 12, 110, 6, .5);
  // top cap
  rr(c, 955, 198, 285, 50, 24); fs(c, vg(c, 198, 248, '#e4fdff', '#b4eef4'));
  shine(c, 975, 205, 240, 8, 4, .7);
  CONFIG.SODA_ORDER.forEach((k, i) => {
    const nx = L.nozzlesLocal[i], S = CONFIG.SODAS[k], down = st.pressing[i] ? 3 : 0;
    // button
    rr(c, nx - 28, 262 + down, 56, 66, 12); fs(c, vg(c, 262, 328, shade(S.btn, .25), S.btn));
    rr(c, nx - 22, 268 + down, 44, 8, 4); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
    txt(c, S.name, nx, 287 + down, 17, OUT, 700);
    c.beginPath(); c.moveTo(nx - 11, 300 + down); c.lineTo(nx + 11, 300 + down); c.lineTo(nx + 7, 320 + down); c.lineTo(nx - 7, 320 + down); c.closePath(); fs(c, 'rgba(255,255,255,.6)', 3);
    // slot + nozzle
    rr(c, nx - 20, 340, 40, 14, 5); fs(c, '#5a5566', 3);
    rr(c, nx - 8, 368, 16, 20, 4); fs(c, vg(c, 368, 388, '#d7dbe5', '#a3a9b8'), 3);
    // cup under nozzle
    const cup = st.dispSlots[i];
    if (cup) drawItem(c, cup, nx, L.dispBase, .82, t);
    // stream
    if (st.pressing[i]) {
      const bottom = cup ? L.dispBase - Math.min(sodaTotal(cup), 1) * 92 - 4 : 486;
      c.fillStyle = S.color; c.globalAlpha = .9; rr(c, nx - 4 + Math.sin(t * 40) * .8, 388, 8, bottom - 388, 4); c.fill(); c.globalAlpha = 1;
    }
  });
}

/* e. waffle cooker (lid hinges at L.cooker.hinge) */
function drawWafflePlate(c, cx, cy, w, h, grid = '#3f3e47') {
  rr(c, cx - w / 2, cy - h / 2, w, h, 14); fs(c, '#4a4953', 3);
  c.save(); rr(c, cx - w / 2, cy - h / 2, w, h, 14); c.clip(); c.fillStyle = grid;
  for (let x = cx - w / 2 + 8; x < cx + w / 2; x += 22) for (let y = cy - h / 2 + 8; y < cy + h / 2; y += 22) { rr(c, x, y, 16, 16, 4); c.fill(); }
  c.restore();
}
function drawCooker(c, st, t) {
  const E = L.cooker, ck = st.cooker, H = E.hinge, cx = E.x + E.w / 2;
  shadow(c, cx, 580, E.w * .48, 8);
  // base
  rr(c, E.x, H - 6, E.w, 176, 22); fs(c, vg(c, H, H + 170, '#d0eedb', '#a7d4ba'));
  drawWafflePlate(c, cx, H + 82, 146, 128);
  // batter / waffle on plate
  if (ck.batter) {
    const B = CONFIG.BATTERS[ck.batter], d = ck.cook >= CONFIG.WAFFLE_BURN_AT ? 'burnt' : ck.cook >= CONFIG.WAFFLE_COOK_TIME ? 'ok' : 'raw';
    const k = Math.min(1, ck.cook / CONFIG.WAFFLE_COOK_TIME);
    const col = d === 'burnt' ? B.burnt : d === 'ok' ? B.ok : mixHex(B.raw, B.ok, k * .7);
    rr(c, cx - 62, H + 28, 124, 108, 16); fs(c, col, 3);
    c.save(); rr(c, cx - 62, H + 28, 124, 108, 16); c.clip(); c.fillStyle = d === 'raw' && k < .2 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.16)';
    for (let x = cx - 56; x < cx + 60; x += 22) for (let y = H + 34; y < H + 136; y += 22) { rr(c, x, y, 15, 15, 4); c.fill(); }
    c.restore();
    shine(c, cx - 52, H + 34, 40, 8, 4, .35);
  }
  // lid: angle 0 = upright (open) … PI = lying on the plate (closed)
  const th = ck.lid * Math.PI, len = 166, yTop = H - len * Math.cos(th);
  const y0 = Math.min(H, yTop), y1 = Math.max(H, yTop), hh = Math.max(4, y1 - y0);
  if (ck.lid < .5) {          // inner face visible
    rr(c, E.x + 2, y0, E.w - 4, hh, 20); fs(c, vg(c, y0, y1, '#c4e6d0', '#a9d6bb'));
    if (hh > 40) drawWafflePlateSquash(c, cx, y0 + hh / 2, 146, hh - 36);
  } else {                    // outer face
    rr(c, E.x - 2, y0 - 4, E.w + 4, hh + 8, 22); fs(c, vg(c, y0, y1, '#dff5e7', '#b4dcc4'));
    shine(c, E.x + 14, y0 + 6, E.w - 28, 8, 4, .7);
    if (hh > 60) {
      // emblem + handle
      ell(c, cx, y0 + hh * .45, 34, 26 * hh / 170, '#fff3e4', 3);
      c.save(); c.translate(cx, y0 + hh * .45); c.scale(1, hh / 170); txt(c, 'waffle', 0, 0, 16, '#d08a4c', 700); c.restore();
      rr(c, cx - 32, y1 - 20, 64, 22, 10); fs(c, vg(c, y1 - 20, y1 + 2, '#ffe9d8', '#ffc6a5'), 3.5);
    }
  }
  // handle on upright lid
  if (ck.lid < .5 && hh > 60) { rr(c, cx - 32, y0 - 12, 64, 22, 10); fs(c, vg(c, y0 - 12, y0 + 10, '#ffe9d8', '#ffc6a5'), 3.5); }
  // steam + timer when closed with batter
  if (ck.batter && ck.lid > .9) {
    const k = ck.cook / CONFIG.WAFFLE_COOK_TIME, burnK = (ck.cook - CONFIG.WAFFLE_COOK_TIME) / (CONFIG.WAFFLE_BURN_AT - CONFIG.WAFFLE_COOK_TIME);
    for (let i = 0; i < 3; i++) { const p = (t * .6 + i / 3) % 1; c.save(); c.globalAlpha = (1 - p) * .6; ell(c, cx - 40 + i * 40 + Math.sin(p * 6 + i) * 6, H - 6 - p * 60, 10 + p * 10, 8 + p * 6, ck.cook >= CONFIG.WAFFLE_BURN_AT ? '#8a8a8a' : '#fff'); c.restore(); }
    const R_ = 26, X = cx, Y = 326;
    ell(c, X, Y, R_ + 6, R_ + 6, '#fff', 3.5);
    c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, R_, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, k)); c.closePath(); c.fillStyle = '#ffd27a'; c.fill();
    if (k >= 1) { c.beginPath(); c.moveTo(X, Y); c.arc(X, Y, R_, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, burnK)); c.closePath(); c.fillStyle = '#ff8f8f'; c.fill(); }
    txt(c, ck.cook >= CONFIG.WAFFLE_BURN_AT ? '!!' : k >= 1 ? '✓' : '', X, Y + 1, 22, OUT, 700);
  }
}
function drawWafflePlateSquash(c, cx, cy, w, h) { c.save(); c.translate(cx, cy); c.scale(1, h / 128); drawWafflePlate(c, 0, 0, w, 128); c.restore(); }
function mixHex(a, b, k) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), f = (x, y) => Math.round(x + (y - x) * k);
  return '#' + ((1 << 24) + (f(A >> 16, B >> 16) << 16) + (f((A >> 8) & 255, (B >> 8) & 255) << 8) + f(A & 255, B & 255)).toString(16).slice(1);
}

/* f. waffle batter tubs */
function drawBatter(c, st, t) {
  ['orig', 'choco'].forEach(b => {
    const [x, y] = L.batter[b], r = L.batter.r, B = CONFIG.BATTERS[b];
    shadow(c, x, y + r - 4, r * .9, 7);
    ell(c, x, y, r, r * .94, vg(c, y - r, y + r, '#ffd3d9', '#ef9fab'), 4);
    ell(c, x, y - 2, r - 10, r * .94 - 11, vg(c, y - r, y + r, shade(B.raw, .2), B.raw), 3);
    c.save(); c.globalAlpha = .45; c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r * .45, t * .5, t * .5 + 3.6); c.stroke(); c.restore();
    if (st.ladles[b]) drawLadle(c, x + 6, y - 4, .8, { b, full: false }, -.75, true);
  });
}

/* g. sprinkles */
function drawSprinklePots(c, st, t) {
  if (art('stations/sprinkle-tray')) {
    drawArt(c, 'stations/sprinkle-tray', BOX['stations/sprinkle-tray']);
    Object.keys(L.sprPots).forEach(k => drawArt(c, 'stations/sprinkle-pot-' + k, [L.sprPots[k] - 43, L.sprY - 44, 86, 76]));
    return;
  }
  const T = L.sprTray;
  shadow(c, T.x + T.w / 2, T.y + T.h + 2, T.w * .46, 6);
  rr(c, T.x, T.y, T.w, T.h, 22); fs(c, vg(c, T.y, T.y + T.h, '#eceaf3', '#d3d1de'));
  const pw = L.sprPotW, ph = L.sprPotH;
  Object.keys(L.sprPots).forEach(k => {
    const x = L.sprPots[k], y = L.sprY;
    rr(c, x - pw / 2, y - ph / 2, pw, ph, 18); fs(c, vg(c, y - ph / 2, y + ph / 2, '#c7c6d3', '#9897aa'), 3.5);
    rr(c, x - pw / 2 + 7, y - ph / 2 + 7, pw - 14, ph - 14, 12); fs(c, '#fffaf4', 2.5);
    c.save(); rr(c, x - pw / 2 + 7, y - ph / 2 + 7, pw - 14, ph - 14, 12); c.clip();
    drawSprinkleHeap(c, x, y, k, 30); c.restore();
    if (st.sprHome[k] !== false) { rr(c, x + 10, y - ph / 2 - 10, 9, 34, 4.5); fs(c, '#ffd1df', 2.5); }
  });
}
function drawSprinkleHeap(c, x, y, k, r) {
  const R = rng(k.length * 31), cols = ['#ff7aa8', '#7fc8ff', '#ffd55c', '#8fe39a', '#c9a0ff', '#ff9d5c'];
  for (let i = 0; i < 46; i++) {
    const px = x + (R() - .5) * r * 2.2, py = y + (R() - .5) * r * 1.6;
    if (k === 'rainbow') { c.save(); c.translate(px, py); c.rotate(R() * 3); rr(c, -4, -1.6, 8, 3.2, 1.6); c.fillStyle = cols[i % 6]; c.fill(); c.restore(); }
    if (k === 'metal') { ell(c, px, py, 2.8, 2.8, '#c9ccd6', 1, '#8b8f9c'); ell(c, px - 1, py - 1, 1, 1, '#fff'); }
    if (k === 'chip') drawChocoChip(c, px, py, 3.6, (R() - .5) * .8, 1);
  }
}

/* m. work mat */
function drawMat(c, st, t) {
  const M = L.mat;
  shadow(c, M.x + M.w / 2, M.y + M.h + 2, M.w * .48, 8, .12);
  rr(c, M.x, M.y, M.w, M.h, 26); fs(c, vg(c, M.y, M.y + M.h, '#e1f1f4', '#c9e2e7'));
  c.save(); c.setLineDash([9, 8]); rr(c, M.x + 12, M.y + 12, M.w - 24, M.h - 24, 18); fs(c, null, 2.5, 'rgba(110,160,170,.55)'); c.restore();
  L.matSlots.forEach((x, i) => {
    ell(c, x, L.matBase, 42, 11, 'rgba(110,160,170,.22)');
    if (st.mat[i]) drawItem(c, st.mat[i], x, L.matBase, 1, t);
  });
}

/* h/i/j/k/L. bottom shelf */
/* cup stack PNGs: bottom-aligned on the shelf, scaled to SHELF_STACK_H tall, centred on their shelf spot */
function drawStackArt(c, n, cx, bottom, maxW) {
  const i = art(n); if (!i) return false;
  const k = Math.min(CONFIG.SHELF_STACK_H / i.naturalHeight, maxW / i.naturalWidth), w = i.naturalWidth * k, h = i.naturalHeight * k;
  c.drawImage(i, cx - w / 2, bottom - h, w, h); return true;
}
function drawShelf(c, st, t) {
  // h. ice cream cups (nested stack)
  if (!drawStackArt(c, 'shelf/ice-cream-cup-stack', L.cupsH.x + L.cupsH.w / 2, 855, L.cupsH.w))
  for (let i = 0; i < 4; i++) {
    c.save(); c.translate(L.cupsH.x + L.cupsH.w / 2, 852 - i * 13); c.scale(.92, .92);
    cupHPath(c, -62); c.fillStyle = hg(c, -46, 46, '#9fdcc4', '#8fd1b9', '#c8f3e2'); c.fill();
    c.save(); cupHPath(c, -62); c.clip(); c.fillStyle = '#ffc0d3';
    for (let j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(j * 22 - 5, -62); c.lineTo(j * 22 + 5, -62); c.lineTo(j * 15 + 4, 0); c.lineTo(j * 15 - 4, 0); c.closePath(); c.fill(); }
    c.restore(); cupHPath(c, -62); fs(c, null, 3.5);
    rr(c, -50, -69, 100, 13, 6.5); fs(c, '#fff6ea', 3);
    c.restore();
  }
  // i. drink cups
  if (!drawStackArt(c, 'shelf/drink-cup-stack', L.cupsI.x + L.cupsI.w / 2, 858, L.cupsI.w + 4))
  for (let i = 0; i < 4; i++) {
    c.save(); c.translate(L.cupsI.x + L.cupsI.w / 2, 856 - i * 10); c.scale(.62, .62);
    cupIPath(c); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); fs(c, null, 4.5);
    rr(c, -40, -124, 80, 9, 4.5); fs(c, 'rgba(255,255,255,.9)', 4); c.restore();
  }
  // o. cup caps (stack of domes)
  if (!drawStackArt(c, 'shelf/cup-cap-stack', L.caps.x + L.caps.w / 2, 856, L.caps.w))
  for (let i = 0; i < 4; i++) { c.save(); c.translate(L.caps.x + L.caps.w / 2, 952 - i * 11); c.scale(.82, .82); drawCapShape(c, .65); c.restore(); }
  // j. straw-spoons holder (lilac)
  holder(c, L.straws, '#e2d6ff', '#bba6f2', () => { for (let i = 0; i < 3; i++) { c.save(); c.translate(L.straws.x + 16 + i * 12, L.straws.y + 44); c.rotate(-.12 + i * .12); rr(c, -4, -46, 8, 50, 4); fs(c, '#e4d6ff', 2.5); c.fillStyle = '#b79cf2'; for (let yy = -42; yy < 0; yy += 12) c.fillRect(-3, yy, 6, 4); c.restore(); } });
  // k. spoons holder (mint)
  holder(c, L.spoons, '#d4f2e2', '#a6d9bd', () => { for (let i = 0; i < 3; i++) { c.save(); c.translate(L.spoons.x + 16 + i * 12, L.spoons.y + 44); c.rotate(-.14 + i * .14); rr(c, -3, -36, 6, 40, 3); fs(c, '#ffc1d3', 2.5); ell(c, 0, -40, 7, 9, '#ffc1d3', 2.5); c.restore(); } });
  // L. bin
  const B = L.bin;
  shadow(c, B.x + B.w / 2, B.y + B.h, B.w * .45, 5);
  rr(c, B.x + 6, B.y + 14, B.w - 12, B.h - 14, 16); fs(c, vg(c, B.y, B.y + B.h, '#7a7690', '#55526a'));
  rr(c, B.x, B.y, B.w, 22, 11); fs(c, vg(c, B.y, B.y + 22, '#9894ad', '#6f6b86'));
  rr(c, B.x + 48, B.y - 7, 32, 10, 5); fs(c, '#9894ad', 3);
  // trash icon
  c.strokeStyle = '#fff'; c.lineWidth = 4; c.lineJoin = 'round'; c.lineCap = 'round';
  const ix = B.x + B.w / 2, iy = B.y + 58;
  c.beginPath(); c.moveTo(ix - 16, iy - 14); c.lineTo(ix + 16, iy - 14); c.stroke();
  c.beginPath(); c.moveTo(ix - 12, iy - 10); c.lineTo(ix - 9, iy + 16); c.lineTo(ix + 9, iy + 16); c.lineTo(ix + 12, iy - 10); c.stroke();
  c.beginPath(); c.moveTo(ix, iy - 5); c.lineTo(ix, iy + 10); c.stroke();
  if (st.binT > 0) { c.save(); c.globalAlpha = st.binT; txt(c, 'bye!', ix, B.y - 24, 20, '#8a86a3', 700, 'center', 5); c.restore(); }
  drawBookClosed(c, st, t);
}

/* p. recipe book (closed, on the shelf beside the bin) */
function drawBookClosed(c, st, t) {
  const b = L.book, fl = CONFIG.TRAY_ORDER;
  shadow(c, b.x + b.w / 2, b.y + b.h + 2, b.w * .46, 5);
  // flavour tabs peeking out of the top
  fl.forEach((f, i) => { const x = b.x + 26 + i * 22; rr(c, x, b.y - 12, 18, 22, 5); fs(c, CONFIG.FLAVORS[f].base, 2.5); });
  // pages + cover
  rr(c, b.x + 6, b.y + 6, b.w - 6, b.h - 6, 12); fs(c, '#fffaf2', 3);
  rr(c, b.x, b.y, b.w - 8, b.h - 8, 14); fs(c, vg(c, b.y, b.y + b.h, '#ffd6e3', '#f7a9c2'));
  rr(c, b.x, b.y, 18, b.h - 8, 9); fs(c, '#ef8fae', 3);
  shine(c, b.x + 26, b.y + 6, b.w - 50, 6, 3, .6);
  // smoothie icon + label
  c.save(); c.translate(b.x + 46, b.y + 66); c.scale(.42, .42);
  drawCupI(c, { k: 'I', scoops: [], soda: {}, smoothie: { scoops: ['strawberry', 'chocomint'], blend: 'long' }, cap: true }, t); c.restore();
  txt(c, 'Recipes', b.x + 104, b.y + 30, 20, OUT, 700, 'center', 5, '#fff');
  txt(c, 'smoothie', b.x + 104, b.y + 52, 14, '#c25b81', 700);
}

/* open recipe book: one tab per flavour; each page shows that flavour blended alone and with every other flavour */
function drawRecipeBook(c, st, t) {
  const U = L.bookUI, fl = CONFIG.TRAY_ORDER, tab = st.book.tab;
  c.save(); c.fillStyle = 'rgba(70,45,35,.38)'; c.fillRect(-600, -200, 2800, 1300); c.restore();
  // tabs
  fl.forEach((f, i) => {
    const x = U.x + 40 + i * (U.tabW + 8), on = f === tab, F = CONFIG.FLAVORS[f];
    rr(c, x, U.tabY + (on ? 0 : 10), U.tabW, U.tabH + 20, 16); fs(c, vg(c, U.tabY, U.tabY + U.tabH, shade(F.base, .25), F.base), 4);
    txt(c, F.name, x + U.tabW / 2, U.tabY + (on ? 24 : 32), 17, F.fx === 'shine' ? '#fff' : OUT, 700);
  });
  // book body
  shadow(c, U.x + U.w / 2, U.y + U.h + 8, U.w * .48, 12, .25);
  rr(c, U.x - 14, U.y - 8, U.w + 28, U.h + 22, 30); fs(c, vg(c, U.y, U.y + U.h, '#f9b8cd', '#e98aab'));
  rr(c, U.x, U.y, U.w / 2, U.h, 22); fs(c, vg(c, U.y, U.y + U.h, '#fffdf8', '#fbf1e6'), 3.5);
  rr(c, U.x + U.w / 2, U.y, U.w / 2, U.h, 22); fs(c, vg(c, U.y, U.y + U.h, '#fffdf8', '#fbf1e6'), 3.5);
  c.fillStyle = 'rgba(91,58,46,.12)'; c.fillRect(U.x + U.w / 2 - 10, U.y + 4, 20, U.h - 8);
  // close button
  const [cx, cy, cr] = U.close;
  ell(c, cx, cy, cr, cr, vg(c, cy - cr, cy + cr, '#ffffff', '#ffe1ea'), 4);
  c.strokeStyle = OUT; c.lineWidth = 4.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx - 9, cy - 9); c.lineTo(cx + 9, cy + 9); c.moveTo(cx + 9, cy - 9); c.lineTo(cx - 9, cy + 9); c.stroke();
  // cards: legend + 7 recipes
  const others = fl.filter(f => f !== tab);
  const recipes = [[tab], [tab, tab], ...others.map(o => [tab, o])];
  const cw = 248, ch = 272, cols = [U.x + 22, U.x + 290, U.x + U.w / 2 + 22, U.x + U.w / 2 + 290], rows = [U.y + 20, U.y + 308];
  const slots = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [3, 0], [2, 1], [3, 1]];
  slots.forEach(([ci, ri], i) => {
    const x = cols[ci], y = rows[ri];
    if (i === 0) { drawBookLegend(c, x, y, cw, ch, tab); return; }
    const sc = recipes[i - 1];
    rr(c, x, y, cw, ch, 20); fs(c, '#fff', 3, 'rgba(91,58,46,.35)');
    // flavour icons + name
    if (sc.length === 1) { drawScoopBall(c, x + cw / 2, y + 40, 18, sc[0], 3); txt(c, '1 scoop', x + cw / 2, y + 76, 15, '#9a7a6a', 700); }
    else {
      drawScoopBall(c, x + cw / 2 - 34, y + 40, 18, sc[0], 3); txt(c, '+', x + cw / 2, y + 42, 24, OUT, 700); drawScoopBall(c, x + cw / 2 + 34, y + 40, 18, sc[1], 5);
      txt(c, sc[0] === sc[1] ? CONFIG.FLAVORS[sc[0]].name + ' ×2' : '+ ' + CONFIG.FLAVORS[sc[1]].name, x + cw / 2, y + 76, 15, '#9a7a6a', 700);
    }
    ['short', 'long'].forEach((bl, j) => {
      const px = x + cw / 2 + (j ? 56 : -56), base = y + ch - 42;
      drawItem(c, { k: 'I', scoops: [], soda: {}, smoothie: { scoops: sc.slice(), blend: bl }, cap: true }, px, base, .82, t);
      rr(c, px - 30, base + 10, 60, 22, 11); fs(c, bl === 'short' ? '#ffe7a3' : '#bfeac9', 2.5); txt(c, bl, px, base + 21.5, 13, OUT, 700);
    });
  });
}
function drawBookLegend(c, x, y, w, h, tab) {
  const F = CONFIG.FLAVORS[tab];
  rr(c, x, y, w, h, 20); fs(c, vg(c, y, y + h, shade(F.base, .55), shade(F.base, .25)), 3, 'rgba(91,58,46,.35)');
  txt(c, 'Smoothie', x + w / 2, y + 34, 30, '#ef7fa3', 700, 'center', 6, '#fff');
  txt(c, 'Recipes', x + w / 2, y + 66, 30, '#ef7fa3', 700, 'center', 6, '#fff');
  drawScoopBall(c, x + w / 2, y + 116, 26, tab, 2);
  txt(c, F.name, x + w / 2, y + 156, 20, OUT, 700);
  [['1 scoop = half cup', 186], ['2 scoops = full cup', 208], ['short = chunky bits', 232], ['long = smooth swirl', 254]]
    .forEach(([s, yy]) => txt(c, s, x + w / 2, y + yy, 15, '#7d5b4b', 600));
}
function holder(c, r, a, b, inner) {
  inner();
  rr(c, r.x, r.y + 40, r.w, r.h - 42, 12); fs(c, vg(c, r.y + 40, r.y + r.h, a, b), 3.5);
  shine(c, r.x + 8, r.y + 46, 7, 36, 3.5, .55);
}

/* ---------------------------------------------------------------------
   6. HELD TOOLS
   --------------------------------------------------------------------- */
function drawScoopTool(c, x, y, s, sc, rot = -.5) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(rot);
  const toolArt = sc.dirty && !sc.fl ? 'tools/ice-cream-scoop-dirty' : 'tools/ice-cream-scoop';
  if (drawArt(c, toolArt, BOX[toolArt])) {           // scoop tool PNG …
    if (sc.fl) drawScoopBall(c, 0, -18, 24, sc.fl, 11);  // … + the ice cream PNG sitting in its bowl
    c.restore(); return;
  }
  // handle
  rr(c, -9, 6, 18, 78, 9); fs(c, vg(c, 6, 84, '#ffc6d6', '#ff9fbc'), 4);
  rr(c, -5, 14, 5, 50, 2.5); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill();
  // bowl
  c.beginPath(); c.arc(0, -10, 26, 0, Math.PI); c.closePath(); fs(c, vg(c, -10, 18, '#eef1f6', '#b3b9c7'), 4);
  if (sc.fl) drawScoopBall(c, 0, -18, 24, sc.fl, 11);
  else if (sc.dirty) { const F = flav(sc.dirty); c.globalAlpha = .9; ell(c, -8, 2, 7, 4, F.base, 2, F.shade); ell(c, 9, 5, 5, 3, F.base, 2, F.shade); c.globalAlpha = 1; }
  c.restore();
}
function drawLadle(c, x, y, s, ld, rot = -.4, home) {
  const B = CONFIG.BATTERS[ld.b];
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(rot);
  rr(c, -6, -96, 12, 92, 6); fs(c, vg(c, -96, 0, '#ffe2c4', '#f2b98a'), 4);
  if (!home) {
    c.beginPath(); c.arc(0, 0, 24, 0, Math.PI); c.closePath(); fs(c, vg(c, 0, 24, '#eef1f6', '#b3b9c7'), 4);
    if (ld.full) ell(c, 0, 2, 22, 7, B.raw, 3);
  }
  c.restore();
}
function drawSprScoop(c, x, y, s, k) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rr(c, 14, -10, 44, 12, 6); fs(c, '#ffd1df', 3.5);
  rr(c, -24, -26, 42, 34, 10); fs(c, vg(c, -26, 8, '#eef1f6', '#b3b9c7'), 4);
  c.save(); rr(c, -20, -24, 34, 18, 8); c.clip(); drawSprinkleHeap(c, -3, -18, k, 14); c.restore();
  c.restore();
}
function drawHeld(c, st, x, y, t) {
  const h = st.hand; if (!h) return;
  c.save(); c.shadowColor = 'rgba(91,58,46,.25)'; c.shadowBlur = 14; c.shadowOffsetY = 8;
  if (h.t === 'cup') drawItem(c, h.item, x, y + 40, 1.05, t);
  if (h.t === 'scoop') drawScoopTool(c, x, y, 1.05, st.scoop, -.45);
  if (h.t === 'ladle') drawLadle(c, x, y, 1.05, h, -.45);
  if (h.t === 'spr') drawSprScoop(c, x, y, 1.1, h.k);
  if (h.t === 'spoon' || h.t === 'straw') drawUtensil(c, h.t, x, y + 60, .8);
  if (h.t === 'jug') drawJug(c, x, y + 80, .8, st.blender, t, false);
  if (h.t === 'waffle') drawWaffleBowl(c, x, y + 10, h.w, 1.05);
  if (h.t === 'cap') { c.save(); c.translate(x, y + 140); drawCapShape(c, .6); c.restore(); }
  c.restore();
}

/* ---------------------------------------------------------------------
   7. HUD BITS
   --------------------------------------------------------------------- */
function drawPill(c, x, y, w, h, fill = '#fffaf3') { rr(c, x, y, w, h, h / 2); fs(c, vg(c, y, y + h, '#ffffff', fill), 4); shine(c, x + h / 2, y + 5, w - h, 6, 3, .8); }
function drawCoin(c, x, y, r) {
  ell(c, x, y, r, r, vg(c, y - r, y + r, '#ffe58a', '#f4b93b'), 3.5);
  ell(c, x, y, r * .62, r * .62, null, 2.5, '#c98a1d');
  txt(c, '$', x, y + 1, r * 1.05, '#b07514', 700);
}
function drawClock(c, x, y, r, k) {
  ell(c, x, y, r, r, '#fff', 3.5);
  c.beginPath(); c.moveTo(x, y); c.arc(x, y, r - 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.closePath(); c.fillStyle = k > .25 ? '#9fe0bf' : '#ffb1b1'; c.fill();
  c.strokeStyle = OUT; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - r * .55); c.stroke();
}
function drawAnger(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#ff5c6c'; c.lineWidth = 5; c.lineCap = 'round';
  [[0, 0], [Math.PI / 2, 1], [Math.PI, 2], [Math.PI * 1.5, 3]].forEach(([a]) => { c.save(); c.rotate(a); c.beginPath(); c.moveTo(4, -12); c.quadraticCurveTo(4, -4, 12, -4); c.stroke(); c.restore(); });
  c.restore();
}
function drawHeart(c, x, y, s, col = '#ff7fa3') {
  c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 6);
  c.bezierCurveTo(-14, -4, -8, -16, 0, -8); c.bezierCurveTo(8, -16, 14, -4, 0, 6); fs(c, col, 2.5, '#fff'); c.restore();
}
