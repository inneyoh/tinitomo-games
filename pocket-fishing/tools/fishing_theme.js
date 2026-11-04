/* ===== Theme overrides: match the 2.5D home screen.
   The host renders the sea, boat and character in 3D underneath this canvas;
   these redefinitions replace the original flat-art versions (later declarations win). ===== */
function drawSeaTop(t){ drawWaveArcs(ctx, t, 0, H * .64, .5); }
function drawShadowFish(c, x, y, len, ang, t, alpha = .45){
  c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha = alpha * .8; c.fillStyle = '#2f6f9c';
  const w = Math.sin(t * 10) * .25;
  ell(c, 0, 0, len*.5, len*.19); c.fill();
  c.beginPath(); c.moveTo(-len*.4, 0); c.lineTo(-len*.7, -len*.17 + w*len*.2); c.lineTo(-len*.7, len*.17 + w*len*.2); c.closePath(); c.fill();
  c.restore();
}
function drawBobber(x, y, sc, sink){
  const kind = save.bobber || 'red';
  ctx.save(); ctx.translate(x, y + Math.sin(T * 3) * 1.5*S);
  const a = 1 - sink * .85, r = 8.5*S * sc * (1 - sink * .4);
  ctx.globalAlpha = a * .22; ell(ctx, 2*S, r * .8, r * 1.15, r * .38); ctx.fillStyle = '#1d3b52'; ctx.fill();
  ctx.globalAlpha = a; ctx.lineWidth = 1.8*S; ctx.strokeStyle = OUT; ctx.lineJoin = 'round';
  if (kind === 'duck'){
    ell(ctx, 0, 0, r * 1.2, r * .85); ctx.fillStyle = '#ffe08e'; ctx.fill(); ctx.stroke();
    ell(ctx, r * .55, -r * .7, r * .55, r * .55); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 1.05, -r * .75); ctx.lineTo(r * 1.5, -r * .6); ctx.lineTo(r * 1.05, -r * .48); ctx.closePath(); ctx.fillStyle = '#ffb37a'; ctx.fill(); ctx.stroke();
    ell(ctx, r * .62, -r * .82, r * .1, r * .1); ctx.fillStyle = OUT; ctx.fill();
  } else if (kind === 'star'){
    ctx.beginPath(); for (let i = 0; i < 10; i++){ const ang = -Math.PI/2 + i * Math.PI/5, d = i % 2 ? r * .55 : r * 1.25; ctx.lineTo(Math.cos(ang)*d, Math.sin(ang)*d); } ctx.closePath();
    ctx.fillStyle = '#c8b8ff'; ctx.fill(); ctx.stroke();
  } else {
    ell(ctx, 0, 0, r, r); ctx.fillStyle = '#fffaf1'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = '#f48e85'; ctx.fill();
    ell(ctx, 0, 0, r, r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 6*S*sc); ctx.stroke();
  }
  ctx.globalAlpha = a * .7; ell(ctx, -r * .35, -r * .45, r * .28, r * .18, -.5); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
}
// the boat & character are 3D now; this only draws the rod from the character's hand to the tip
function drawBoat(t){
  const tip = rodTip(), h = HAND || { x: W * .6, y: H * .86 };
  const seg = (x0, y0, x1, y1, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  const at = k => ({ x: lerp(h.x, tip.x, k), y: lerp(h.y, tip.y, k) });
  ctx.save(); ctx.lineCap = 'round';
  ctx.globalAlpha = .16; seg(h.x + 7*S, h.y + 9*S, tip.x + 7*S, tip.y + 9*S, 6*S, '#1d3b52'); ctx.globalAlpha = 1;
  seg(h.x, h.y, tip.x, tip.y, 6.5*S, OUT); seg(h.x, h.y, tip.x, tip.y, 3.8*S, '#f3ead8');
  const g1 = at(.16); seg(h.x, h.y, g1.x, g1.y, 10*S, OUT); seg(h.x, h.y, g1.x, g1.y, 7*S, '#86c49a');
  const c0 = at(.16), c1 = at(.27); seg(c0.x, c0.y, c1.x, c1.y, 9*S, OUT); seg(c0.x, c0.y, c1.x, c1.y, 6*S, '#e6c9a0');
  for (const k of [.45, .62, .78, .9]){ const p = at(k); ell(ctx, p.x, p.y, 2.6*S, 2.6*S); ctx.lineWidth = 1.4*S; ctx.strokeStyle = '#8a8f99'; ctx.stroke(); }
  const r = at(.13), nx = (tip.y - h.y), ny = -(tip.x - h.x), nl = Math.hypot(nx, ny) || 1, rx = r.x + nx / nl * 9*S, ry = r.y + ny / nl * 9*S;
  ell(ctx, rx, ry, 8*S, 8*S); ctx.fillStyle = save.reelHex || '#c9cfd6'; ctx.fill(); ctx.lineWidth = 2*S; ctx.strokeStyle = OUT; ctx.stroke();
  ell(ctx, rx, ry, 3*S, 3*S); ctx.fillStyle = '#fffaf1'; ctx.fill(); ctx.stroke();
  ctx.restore();
  return tip;
}
// gauges: cream track, soft drop shadow, pastel fill with gloss
function bar(x, y, w, h, k, fill, label){
  rr(ctx, x, y + 3*S, w, h, h/2); ctx.fillStyle = 'rgba(91,61,46,.22)'; ctx.fill();
  rr(ctx, x, y, w, h, h/2); ctx.fillStyle = '#fffaf1'; ctx.fill();
  if (k > 0){ ctx.save(); rr(ctx, x, y, w, h, h/2); ctx.clip();
    ctx.globalAlpha = .85; ctx.fillStyle = fill; ctx.fillRect(x, y, w * clamp(k, 0, 1), h);
    ctx.globalAlpha = .4; ctx.fillStyle = '#fff'; ctx.fillRect(x, y + h*.12, w * clamp(k, 0, 1), h * .3); ctx.restore(); }
  rr(ctx, x, y, w, h, h/2); ctx.lineWidth = 2*S; ctx.strokeStyle = OUT; ctx.stroke();
  if (label){ ctx.font = `600 ${11*S}px ${FONT}`; const tw = ctx.measureText(label).width + 14*S;
    rr(ctx, x + 6*S, y - 17*S, tw, 15*S, 7.5*S); ctx.fillStyle = '#fffaf1'; ctx.fill(); ctx.lineWidth = 1.6*S; ctx.stroke();
    txt(ctx, label, x + 6*S + tw/2, y - 9.5*S, 11*S, OUT, null); }
}
// Bite / Reel / Tug / Pull: chunky home-screen pills
function drawPhasePills(){
  const names = ['Bite', 'Reel', 'Tug', 'Pull'], w = 72*S, h = 28*S, gap = 7*S, x0 = W/2 - (4*w + 3*gap)/2, y = 52*S;
  names.forEach((n, i) => {
    const done = i < C.idx, cur = i === C.idx && C.phase !== 'fail', x = x0 + i*(w + gap);
    rr(ctx, x, y + 3*S, w, h, h/2); ctx.fillStyle = 'rgba(91,61,46,.22)'; ctx.fill();
    rr(ctx, x, y, w, h, h/2); ctx.fillStyle = done ? '#9fe0b2' : cur ? '#ffe08e' : 'rgba(255,250,241,.8)'; ctx.fill();
    ctx.lineWidth = 2*S; ctx.strokeStyle = OUT; ctx.stroke();
    txt(ctx, (done ? '✓ ' : '') + n, x + w/2, y + h/2 + 1*S, 13*S, OUT, null);
  });
}

/* ---------- 2.5D fish: the host renders each fish as a lit, puffy model (see fishArt in index.html) ---------- */
let FISH_ART = null;
function drawFish(c, f, x, y, L, t = 0, opt = {}){
  const art = FISH_ART && FISH_ART(f, !!opt.sil);
  if (!art) return drawFishFlat(c, f, x, y, L, t, opt);
  const s = L / art.L, wob = Math.sin(t * 9) * .02;
  c.save(); c.translate(x, y); if (opt.rot) c.rotate(opt.rot); c.scale(1 + wob, 1 - wob);
  c.drawImage(art.canvas, -art.cx * s, -art.cy * s, art.canvas.width * s, art.canvas.height * s);
  c.restore();
}

/* ---------- juice: sparkles + pop-up words ---------- */
const SPARKS = [], POPS = [];
const SPARK_COLS = ['#ffe08e', '#ffffff', '#9fe0b2', '#f48e85', '#c8b8ff'];
function spark(x, y, n, cols){
  for (let i = 0; i < n; i++){ const a = rand(0, TAU), v = rand(60, 220) * S;
    SPARKS.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60*S, t: 0, life: rand(.45, .9), r: rand(2.5, 5.5) * S, col: (cols || SPARK_COLS)[i % (cols || SPARK_COLS).length], rot: rand(0, TAU) }); }
}
function pop(text, x, y, col = '#ffe08e', size = 26){ POPS.push({ text, x, y, col, size, t: 0 }); }
let fxT = null;
function fxTick(){ const dt = fxT === null ? 0 : clamp(T - fxT, 0, .05); fxT = T; 
  for (const p of SPARKS){ p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 380*S * dt; p.vx *= .985; p.rot += dt * 6; }
  for (let i = SPARKS.length - 1; i >= 0; i--) if (SPARKS[i].t > SPARKS[i].life) SPARKS.splice(i, 1);
  for (const p of POPS) p.t += dt;
  for (let i = POPS.length - 1; i >= 0; i--) if (POPS[i].t > .9) POPS.splice(i, 1);
  return dt;
}
function star4(c, x, y, r, rot){
  c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
  for (let i = 0; i < 8; i++){ const a = i * Math.PI / 4, d = i % 2 ? r * .38 : r; c.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
  c.closePath(); c.fill(); c.restore();
}
function drawJuice(){
  ctx.save();
  for (const p of SPARKS){ ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.col; star4(ctx, p.x, p.y, p.r, p.rot); }
  for (const p of POPS){ const k = p.t / .9, sc = backOut(Math.min(1, p.t * 5));
    ctx.globalAlpha = k > .6 ? (1 - k) / .4 : 1; ctx.save(); ctx.translate(p.x, p.y - k * 46*S); ctx.scale(sc, sc);
    txt(ctx, p.text, 0, 0, p.size*S, p.col, OUT, 6*S); ctx.restore(); }
  ctx.restore();
}

/* ---------- Reel: spin meter, combo, sparkles ---------- */
const REEL_WORDS = ['Nice!', 'Great!', 'Keep going!', 'Woohoo!', 'Super!', 'So fast!'];
function onReelTick(d){
  C.spin = Math.min(1, (C.spin || 0) + d * .22);
  C.turnAcc = (C.turnAcc || 0) + d;
  if (C.turnAcc >= TAU){
    C.turnAcc -= TAU; C.turns = (C.turns || 0) + 1;
    const cx = W/2, cy = H*.8;
    spark(cx + rand(-40, 40)*S, cy - 60*S, 10); spark(C.fx, C.fy, 8, ['#ffffff', '#cdeafb']); splash(C.fx, C.fy, 6, .8);
    pop(C.turns % 3 === 0 ? REEL_WORDS[(C.turns / 3 | 0) % REEL_WORDS.length] : `×${C.turns}`, cx + rand(-70, 70)*S, cy - 90*S, C.turns % 3 === 0 ? '#ffe08e' : '#ffffff', C.turns % 3 === 0 ? 28 : 22);
    hostSfx('reel', C.turns); vibrate(12);
  }
}
function drawReelUI(t){
  const spin = C.spin || 0, cx = W/2, cy = H*.8, r = 58*S;
  // timer pill
  const tl = Math.ceil(Math.max(0, C.time)), urgent = tl <= 5;
  rr(ctx, W - 74*S, 92*S, 60*S, 26*S, 13*S); ctx.fillStyle = urgent ? '#f48e85' : '#fffaf1'; ctx.fill(); ctx.lineWidth = 2*S; ctx.strokeStyle = OUT; ctx.stroke();
  txt(ctx, `⏱ ${tl}`, W - 44*S, 105.5*S, 14*S, urgent ? '#fff' : OUT, null);
  // closeness bar with a little fish riding the tip
  const k = clamp(1 - C.dist / 150, 0, 1), bx = W*.08, bw = W*.62;
  bar(bx, 96*S, bw, 18*S, k, C.dist > 110 ? '#ff8a8a' : '#7fd1f0', 'Reel it in');
  ctx.save(); ctx.translate(bx + bw * k, 105*S + Math.sin(t * 12) * 2*S); ctx.fillStyle = '#5aa7e8';
  ell(ctx, 0, 0, 9*S, 5.5*S); ctx.fill(); ctx.beginPath(); ctx.moveTo(-7*S, 0); ctx.lineTo(-14*S, -5*S); ctx.lineTo(-14*S, 5*S); ctx.closePath(); ctx.fill();
  ell(ctx, 4*S, -1.5*S, 1.4*S, 1.4*S); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  // finger trail: rainbow-ish glow
  if (C.trail.length > 1){ ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < C.trail.length; i++){ const p = C.trail[i], q = C.trail[i-1];
      ctx.globalAlpha = p.l * 1.6; ctx.strokeStyle = SPARK_COLS[i % 4]; ctx.lineWidth = 9*S * p.l * 2;
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y); ctx.stroke(); } ctx.restore(); }
  // glow + speed lines grow with spin
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, r * .5, cx, cy, r * 2.2); g.addColorStop(0, `rgba(255,224,142,${.25 + spin * .55})`); g.addColorStop(1, 'rgba(255,224,142,0)');
  ctx.fillStyle = g; ell(ctx, cx, cy, r * 2.2, r * 2.2); ctx.fill();
  if (spin > .15){ ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++){ const a = i / 14 * TAU + t * 3, r0 = r + 26*S, r1 = r0 + (14 + 30 * spin) * S;
      ctx.globalAlpha = spin * (.4 + .4 * Math.sin(t * 20 + i)); ctx.lineWidth = 3*S;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke(); } }
  ctx.globalAlpha = .55 + .25 * Math.sin(t * 3); ctx.setLineDash([10*S, 10*S]); ctx.lineDashOffset = -t * (40 + spin * 160) * S;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4*S; ell(ctx, cx, cy, r + 30*S, r + 30*S); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  // reel body (cream, soft shadow, mint ring)
  const bump = 1 + spin * .06 * Math.sin(t * 30);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(bump, bump);
  ell(ctx, 4*S, 7*S, r, r); ctx.fillStyle = 'rgba(29,59,82,.22)'; ctx.fill();
  ell(ctx, 0, 0, r, r); ctx.fillStyle = '#fffaf1'; ctx.fill(); ctx.lineWidth = 3.5*S; ctx.strokeStyle = OUT; ctx.stroke();
  ell(ctx, 0, 0, r * .74, r * .74); ctx.fillStyle = '#cfeedd'; ctx.fill(); ctx.lineWidth = 3*S; ctx.stroke();
  ctx.rotate(C.reelAng);
  ctx.strokeStyle = OUT; ctx.lineWidth = 3*S; for (let i = 0; i < 3; i++){ ctx.rotate(TAU/3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r*.7, 0); ctx.stroke(); }
  ctx.lineCap = 'round'; ctx.lineWidth = 10*S; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r*.95, 0); ctx.stroke();
  ctx.strokeStyle = '#c9cfd6'; ctx.lineWidth = 6*S; ctx.stroke();
  ell(ctx, r*.95, 0, 14*S, 14*S); ctx.fillStyle = '#f48e85'; ctx.fill(); ctx.lineWidth = 3*S; ctx.strokeStyle = OUT; ctx.stroke();
  ell(ctx, r*.95 - 4*S, -4*S, 4*S, 3*S); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
  ctx.restore();
  ell(ctx, cx, cy, 8*S, 8*S); ctx.fillStyle = '#ffe08e'; ctx.fill(); ctx.lineWidth = 2.5*S; ctx.strokeStyle = OUT; ctx.stroke();
  // curly arrow hint when idle
  if (spin < .1){ ctx.save(); ctx.globalAlpha = .6 + .3 * Math.sin(t * 5); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5*S; ctx.lineCap = 'round';
    const a0 = t * 2.5; ctx.beginPath(); ctx.arc(cx, cy, r + 50*S, a0, a0 + 1.6); ctx.stroke();
    const ax = cx + Math.cos(a0 + 1.6) * (r + 50*S), ay = cy + Math.sin(a0 + 1.6) * (r + 50*S), ta = a0 + 1.6 + Math.PI/2;
    ctx.beginPath(); ctx.moveTo(ax + Math.cos(ta - 2.5) * 12*S, ay + Math.sin(ta - 2.5) * 12*S); ctx.lineTo(ax, ay); ctx.lineTo(ax + Math.cos(ta + 2.5) * 12*S, ay + Math.sin(ta + 2.5) * 12*S); ctx.stroke(); ctx.restore(); }
  const msg = spin > .7 ? 'FASTER! FASTER!' : spin > .3 ? 'Keep spinning!' : 'Draw circles to reel!';
  ctx.save(); const ps = 1 + (spin > .7 ? .08 * Math.sin(t * 18) : 0); ctx.translate(W/2, H*.94); ctx.scale(ps, ps);
  txt(ctx, msg, 0, 0, 18*S, spin > .7 ? '#ffe08e' : '#fff', OUT, 5*S); ctx.restore();
}
function themeCatchOverlay(t){
  const dt = fxTick();
  if (C.phase === 'reel'){ C.spin = (C.spin || 0) * Math.exp(-dt * 2.2);
    if ((C.spin || 0) > .5 && Math.random() < dt * 8){ splash(C.fx, C.fy, 3, .7); spark(C.fx + rand(-20, 20)*S, C.fy, 2, ['#ffffff', '#cdeafb']); } }
  drawJuice();
}

/* ---------- Hooked: bigger "!" moment ---------- */
function drawHookedBurst(k, t){
  const dt = fxTick();
  if (!F.burstDone){ F.burstDone = true; spark(W/2, H*.34, 46); hostSfx('hook'); vibrate([40, 30, 60]); }
  const cx = W/2, cy = H*.34, sc = backOut(Math.min(1, k * 3.2)) * (1 + .05 * Math.sin(t * 16));
  ctx.save();
  if (k < .3){ ctx.fillStyle = `rgba(255,250,241,${(.3 - k) * 2.2})`; ctx.fillRect(0, 0, W, H); }
  // rotating sunburst
  ctx.translate(cx, cy); ctx.rotate(t * .8); ctx.globalAlpha = Math.min(1, k * 4) * .75;
  for (let i = 0; i < 16; i++){ ctx.fillStyle = i % 2 ? 'rgba(255,224,142,.85)' : 'rgba(255,250,241,.55)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, Math.max(W, H), i / 16 * TAU, (i + .5) / 16 * TAU); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // speed lines from the screen edge
  ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
  for (let i = 0; i < 22; i++){ const a = i / 22 * TAU + Math.sin(i * 7) * .1, r1 = Math.max(W, H) * .75, r0 = r1 * (.55 + .12 * Math.sin(t * 25 + i));
    ctx.globalAlpha = .7; ctx.lineWidth = (2 + (i % 3)) * S; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
  // burst badge with the "!"
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(Math.sin(t * 22) * .06);
  ctx.beginPath(); for (let i = 0; i < 28; i++){ const a = i / 28 * TAU, rr2 = (i % 2 ? 76 : 104) * S; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath();
  ctx.fillStyle = 'rgba(91,61,46,.25)'; ctx.save(); ctx.translate(5*S, 8*S); ctx.fill(); ctx.restore();
  const bg = ctx.createRadialGradient(-20*S, -25*S, 10*S, 0, 0, 104*S); bg.addColorStop(0, '#fff3c4'); bg.addColorStop(.6, '#ffe08e'); bg.addColorStop(1, '#ffb86b');
  ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 5*S; ctx.strokeStyle = OUT; ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 20; i++){ const a = i / 20 * TAU + .1, rr2 = (i % 2 ? 50 : 66) * S; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath();
  ctx.fillStyle = '#f48e85'; ctx.fill(); ctx.lineWidth = 3.5*S; ctx.stroke();
  txt(ctx, '!', 0, 8*S, 112*S, '#fffaf1', OUT, 12*S);
  ctx.restore();
  // HOOKED! ribbon
  const rk = backOut(Math.min(1, Math.max(0, k - .12) * 4));
  if (rk > 0){ ctx.save(); ctx.translate(cx, cy + 128*S); ctx.scale(rk, rk); ctx.rotate(-.05);
    rr(ctx, -92*S, -24*S + 4*S, 184*S, 48*S, 24*S); ctx.fillStyle = 'rgba(91,61,46,.25)'; ctx.fill();
    rr(ctx, -92*S, -24*S, 184*S, 48*S, 24*S); ctx.fillStyle = '#f48e85'; ctx.fill(); ctx.lineWidth = 4*S; ctx.strokeStyle = OUT; ctx.stroke();
    txt(ctx, 'HOOKED!', 0, 1*S, 30*S, '#fffaf1', OUT, 6*S); ctx.restore(); }
  drawJuice();
}

/* ---------- Bite: impossible to miss ---------- */
function drawBiteAlert(t){
  if (F.state === 'hooked' || F.state === 'zoom') return;   // the hooked burst takes over
  fxTick();
  if (!F.bob) { drawJuice(); return; }
  const bx = F.bob.x, by = F.bob.y;
  if (F.state === 'nibble'){
    // gentle "wait…" bubble so players know not to tap yet
    const a = .75 + .25 * Math.sin(t * 6);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(bx, by - 40*S);
    rr(ctx, -34*S, -14*S, 68*S, 28*S, 14*S); ctx.fillStyle = '#fffaf1'; ctx.fill(); ctx.lineWidth = 2*S; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6*S, 14*S); ctx.lineTo(0, 22*S); ctx.lineTo(6*S, 14*S); ctx.fillStyle = '#fffaf1'; ctx.fill();
    txt(ctx, 'wait' + '.'.repeat(1 + (t * 3 | 0) % 3), 0, 1*S, 13*S, OUT, null); ctx.restore();
  }
  if (F.state === 'bite'){
    const left = F.biteMax ? clamp(F.biteT / F.biteMax, 0, 1) : 1, pulse = .5 + .5 * Math.sin(t * 22);
    ctx.save();
    // screen-edge flash
    ctx.lineWidth = 16*S; ctx.strokeStyle = `rgba(244,142,133,${.35 + .35 * pulse})`; rr(ctx, 8*S, 8*S, W - 16*S, H - 16*S, 28*S); ctx.stroke();
    // expanding alarm rings
    for (let i = 0; i < 3; i++){ const p = ((t * 2.2) + i / 3) % 1; ctx.globalAlpha = 1 - p; ctx.lineWidth = (5 - p * 3) * S; ctx.strokeStyle = i % 2 ? '#fff' : '#f48e85';
      ell(ctx, bx, by, (16 + p * 70) * S, (12 + p * 52) * S); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // countdown ring: how long the bite lasts
    ctx.lineCap = 'round'; ctx.lineWidth = 6*S; ctx.strokeStyle = 'rgba(255,250,241,.7)'; ell(ctx, bx, by, 30*S, 30*S); ctx.stroke();
    ctx.strokeStyle = left > .35 ? '#9fe0b2' : '#f48e85'; ctx.beginPath(); ctx.arc(bx, by, 30*S, -Math.PI/2, -Math.PI/2 + TAU * left); ctx.stroke();
    // TAP NOW! bubble bouncing over the bobber
    const bounce = Math.abs(Math.sin(t * 12)) * 8*S, sc = 1 + .08 * pulse;
    ctx.translate(clamp(bx, 80*S, W - 80*S), by - 70*S - bounce); ctx.scale(sc, sc);
    rr(ctx, -70*S, -24*S + 4*S, 140*S, 48*S, 24*S); ctx.fillStyle = 'rgba(91,61,46,.25)'; ctx.fill();
    rr(ctx, -70*S, -24*S, 140*S, 48*S, 24*S); ctx.fillStyle = '#f48e85'; ctx.fill(); ctx.lineWidth = 4*S; ctx.strokeStyle = OUT; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10*S, 23*S); ctx.lineTo(0, 36*S); ctx.lineTo(10*S, 23*S); ctx.closePath(); ctx.fillStyle = '#f48e85'; ctx.fill(); ctx.stroke();
    txt(ctx, 'TAP NOW!', 0, 1*S, 26*S, '#fffaf1', OUT, 6*S);
    ctx.restore();
    if (Math.random() < .25) spark(bx + rand(-10, 10)*S, by, 1, ['#ffffff', '#ffe08e']);
  }
  drawJuice();
}

/* ---------- Result card: newest unlocked trivia (1 / 5 / 15 catches of this fish) ---------- */
const TRIVIA_AT = [1, 5, 15];
function resultTrivia(f, qty){
  const n = (save.col[f.id] || { count: qty }).count, prev = n - qty;
  const list = host && host.trivia ? host.trivia(f) : [f.trivia];
  let idx = 0; for (let i = 0; i < 3; i++) if (n >= TRIVIA_AT[i] && list[i]) idx = i;
  document.getElementById('rTrivia').textContent = list[idx];
  const nx = document.getElementById('rNext');
  if (nx) nx.textContent = idx < 2 && list[idx + 1] ? `Catch ${TRIVIA_AT[idx + 1] - n} more to unlock trivia ${idx + 2} of 3` : 'All 3 trivia unlocked!';
  const newly = TRIVIA_AT.findIndex((th, i) => i > 0 && prev < th && n >= th && list[i]);
  if (newly > 0) document.getElementById('rBadges').insertAdjacentHTML('beforeend', `<span class="badge b3">Trivia ${newly + 1} unlocked!</span>`);
}
