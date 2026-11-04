/* =========================================================
   3D fish models (2.5D style), generated from each fish's data:
   type (body plan + special parts), h (body height), c1/c2 (back/belly colours),
   fin colour and mark (pattern painted into vertex colours).
   Every model faces +X (head), is 1 unit long, centred on the origin.
   ========================================================= */
const Fish3D = (() => {
  const TAU = Math.PI * 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const col = h => new THREE.Color(h);
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.48, metalness: 0.03 }, o));
  const vmat = (o = {}) => new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.42, metalness: 0.04 }, o));
  const SM = (s, a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return s ? t * t * (3 - 2 * t) : t; };
  const DOTS = [[.3, -.2], [-.1, -.28], [-.45, -.1], [.05, .05], [-.3, .18], [.45, -.05], [-.6, -.25], [.2, .22]];

  // ---------- pattern painter: (xn: tail -1 .. head +1, yn: belly -1 .. back +1) -> colour ----------
  function paint(f, xn, yn, base) {
    const c = base.clone(), dot = (dx, dy, r) => Math.hypot((xn - dx) * 2.2, (yn - dy) * 1.0) < r;
    const mix = (hex, k = 1) => c.lerp(col(hex), k);
    switch (f.mark) {
      case 'bands': for (const b of [.6, .05, -.55]) { const d = Math.abs(xn - b); if (d < .1) mix('#ffffff'); else if (d < .135) mix('#3a2a24'); } break;
      case 'idol': for (const b of [.45, -.15]) { const d = Math.abs(xn - b); if (d < .16) mix('#26222a'); } if (xn < -.55) mix('#ffd84a', .8); break;
      case 'stripe': if (Math.abs(yn + .05) < .2) mix('#ff8aa8', .55); for (const [dx, dy] of DOTS) if (dot(dx, -dy * 2, .07)) mix('#4a4a30', .5); break;
      case 'spots': for (const [dx, dy] of DOTS) if (dot(dx, -dy * 2.2 + .15, .1)) mix('#5a4128', .45); break;
      case 'whitespots': for (const [dx, dy] of DOTS) { if (dot(dx, -dy * 2, .08)) mix('#ffffff', .8); if (dot(dx * .8 + .12, -dy * 1.2 - .25, .06)) mix('#ffffff', .7); } break;
      case 'bluedots': for (const [dx, dy] of DOTS) if (dy < 0 && dot(dx, -dy * 2, .06)) mix('#5aaaff', .8); break;
      case 'lights': for (let i = 0; i < 7; i++) if (dot(-.7 + i * .2, -.55, .06)) mix('#c8fbff'); break;
      case 'scutes': if (Math.abs(yn - .05) < .05 && xn < .45 && Math.sin(xn * 60) > 0) mix('#46586e', .5); break;
      case 'yellow': if (dot(.25, .05, .17)) mix('#ffd65a', .85); break;
      case 'redscale': if (xn < -.25) mix('#e65046', .5 * SM(1, -.25, -.6, xn)); break;
      case 'oarspots': for (let i = 0; i < 12; i++) if (dot(-.8 + i * .13, i % 2 ? .2 : -.2, .05)) mix('#50596e', .5); break;
      case 'koi': if (dot(.42, .36, .26) || dot(-.15, .3, .26) || dot(-.62, .05, .16)) mix('#ff5a3c'); if (dot(-.4, -.1, .07)) mix('#282828', .7); break;
      case 'stripes': if (Math.sin(xn * 26) > .45) mix('#a03c28', .5); break;
      case 'bars': if (yn > -.1 && Math.sin(xn * 22) > .55) mix('#22304a', .35); break;
      case 'yline': if (Math.abs(yn) < .14) mix('#ffd63c', .9); break;
      case 'sardine': for (let i = 0; i < 6; i++) if (dot(.3 - i * .18, .1, .045)) mix('#1e283c', .6); break;
      case 'tang': if (yn > .05 && yn < .78 - Math.abs(xn + .15) * .55 && xn > -.85 && xn < .55) mix('#141e3c', .82); break;
      case 'hexdots': for (let i = -3; i <= 3; i++) for (let j = -1; j <= 1; j++) if (dot(i * .27 + (j % 2 ? .13 : 0), j * .55, .055)) mix('#281e14', .6); break;
      case 'parr': for (let i = 0; i < 7; i++) if (Math.hypot((xn - (.45 - i * .19)) * 3, (yn + .02) * 1.3) < .2) mix('#4a5a64', .45); for (const [dx, dy] of DOTS) if (dot(dx, -dy * 2 + .35, .045)) mix('#2a2a2a', .5); break;
      case 'archer': for (const b of [.35, .05, -.25, -.55]) if (yn > .15 && Math.hypot((xn - b) * 3.4, (yn - .55) * 1.2) < .42) mix('#2a2a2a', .85); break;
      case 'parrot': if (Math.sin(xn * 14 + yn * 3) > .6) mix('#ff9ac0', .5); if (Math.abs(yn - .1) < .08) mix('#ffe08a', .6); break;
      case 'mandarin': if (Math.sin(xn * 16 + Math.sin(yn * 6) * 1.5) > .25) mix('#ff8a3a', .9); if (Math.sin(yn * 18 + xn * 4) > .82) mix('#4ad8b0', .7); break;
    }
    if (f.mark === 'scale' && Math.sin(xn * 40) * Math.sin(yn * 18) > .55) c.offsetHSL(0, 0, .06);
    return c;
  }
  function tint(geo, f, L, R, opts = {}) {
    const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), c1 = col(opts.c1 || f.c1), c2 = col(opts.c2 || f.c2), cc = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const xn = pos.getX(i) / (L / 2), yn = pos.getY(i) / Math.max(R, 1e-4);
      cc.copy(c2).lerp(c1, SM(1, -.45, .5, yn));
      if (!opts.plain) cc.copy(paint(f, xn, yn, cc));
      cols[i * 3] = cc.r; cols[i * 3 + 1] = cc.g; cols[i * 3 + 2] = cc.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geo;
  }

  // ---------- body: a lathe along X; profile(u) 0 = tail, 1 = nose ----------
  function bodyGeo(L, R, thick, prof, seg = 44) {
    const pts = [];
    for (let i = 0; i <= seg; i++) { const u = i / seg; pts.push(new THREE.Vector2(Math.max(1e-4, R * prof(u)), -L / 2 + L * u)); }
    const g = new THREE.LatheGeometry(pts, 40);
    g.rotateZ(-Math.PI / 2); g.scale(1, 1, thick);
    g.computeVertexNormals();
    return g;
  }
  const PROFILES = {
    fish: (u, p = 1.36, q = .72) => Math.pow(Math.sin(Math.PI * Math.pow(Math.min(.999, Math.max(.001, u)), p)), q),
    blunt: u => Math.pow(Math.sin(Math.PI * Math.pow(Math.min(.999, u), .7)), .55),
    long: u => Math.pow(Math.sin(Math.PI * Math.min(.999, u)), .28) * (u < .12 ? u / .12 : 1),
    rattail: u => u < .55 ? Math.pow(u / .55, 1.6) * .75 : Math.pow(Math.sin(Math.PI * (.5 + (u - .55) / .9)), .6),
    mola: u => Math.pow(Math.sin(Math.PI * (.12 + u * .86)), .5),
    head: u => Math.pow(Math.sin(Math.PI * Math.pow(Math.min(.999, u), .62)), .6),
  };
  const radiusAt = (prof, R, L, x) => R * prof(Math.min(1, Math.max(0, (x + L / 2) / L)));

  // ---------- parts ----------
  function finShape(pts, closeSmooth = true) {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i += 2) {
      const a = pts[i], b = pts[i + 1] || pts[0];
      s.quadraticCurveTo(a[0], a[1], b[0], b[1]);
    }
    return s;
  }
  function fin(shape, color, depth = .012, o = {}) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * .6, bevelSize: depth * .5, bevelSegments: 2, curveSegments: 14 });
    g.translate(0, 0, -depth / 2); g.computeVertexNormals();
    return new THREE.Mesh(g, mat(color, Object.assign({ roughness: .5, side: THREE.DoubleSide }, o)));
  }
  // cute eye: a flat, glossy black oval with a single highlight (no bulgy eyeball)
  function eye(r, rim = false) {
    const g = new THREE.Group();
    if (rim) { const rr = new THREE.Mesh(new THREE.SphereGeometry(r * 1.1, 20, 14), mat('#f4ede4', { roughness: .4 })); rr.scale.set(.9, 1.12, .16); g.add(rr); }
    const p = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat('#1c1820', { roughness: .18 })); p.scale.set(.86, 1.08, .26); p.position.z = r * .06; g.add(p);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(r * .3, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.scale.z = .3; hl.position.set(-r * .25, r * .32, r * .3); g.add(hl);
    return g;
  }
  function blush(grp, x, y, z, r) {
    for (const s of [1, -1]) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10), mat('#ff9fb0', { transparent: true, opacity: .55, roughness: .6, depthWrite: false }));
      b.scale.set(1.25, .7, .16); b.position.set(x, y, s * z); grp.add(b);
    }
  }
  const isDark = h => { const c = col(h); return c.r * .3 + c.g * .59 + c.b * .11 < .32; };
  function eyes(grp, x, y, z, r, opts = {}) {
    for (const s of opts.oneSide ? [1] : [1, -1]) {
      const e = eye(r, opts.rim); e.position.set(x, y, s * z);
      if (s < 0) e.rotation.y = Math.PI;
      if (opts.tilt) e.rotation.x = opts.tilt * s;
      grp.add(e);
    }
  }
  function tube(points, r, color, o = {}) {
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, r, 8, false);
    return new THREE.Mesh(g, mat(color, o));
  }
  function mouthLine(grp, x, y, w, z, color = '#3a2a2a') {
    const m = new THREE.Mesh(new THREE.TorusGeometry(w, w * .22, 6, 14, Math.PI * .9), mat(color));
    m.rotation.set(0, Math.PI / 2, Math.PI * .55); m.position.set(x, y, 0); grp.add(m);
  }
  function tailFin(grp, f, L, R, kind, colr) {
    const x0 = -L / 2 + .04;
    let s;
    if (kind === 'fan') s = finShape([[0, 0], [-.14, R * 1.2], [-.34, R * 1.7], [-.42, 0], [-.34, -R * 1.7], [-.14, -R * 1.2]]);
    else if (kind === 'crescent') s = finShape([[0, R * .15], [-.08, R * 1.1], [-.2, R * 1.65], [-.1, 0], [-.2, -R * 1.65], [-.08, -R * 1.1], [0, -R * .15]]);
    else if (kind === 'shark') s = finShape([[.02, R * .25], [-.1, R * 1.1], [-.22, R * 1.6], [-.13, 0], [-.12, -R * .8], [-.04, -R * .55], [.02, -R * .2]]);
    else if (kind === 'round') s = finShape([[0, R * .2], [-.12, R * .9], [-.14, 0], [-.12, -R * .9], [0, -R * .2]]);
    else s = finShape([[0, R * .12], [-.08, R * .7], [-.17, R * 1.05], [-.11, 0], [-.17, -R * 1.05], [-.08, -R * .7], [0, -R * .12]]);
    const m = fin(s, colr || f.fin); m.position.x = x0; grp.add(m); return m;
  }
  function dorsal(grp, f, L, R, prof, o = {}) {
    const x0 = o.x0 ?? -.2, x1 = o.x1 ?? .14, ht = o.h ?? R * .85, base = radiusAt(prof, R, L, (x0 + x1) / 2) * .82;
    const s = o.shape || finShape([[x0, 0], [(x0 + x1) / 2 + (o.lean ?? -.03), ht * 1.25], [x1, 0]]);
    const m = fin(s, o.color || f.fin); m.position.y = base; grp.add(m); return m;
  }
  function anal(grp, f, L, R, prof, o = {}) {
    const x0 = o.x0 ?? -.22, x1 = o.x1 ?? -.04, ht = o.h ?? R * .55, base = radiusAt(prof, R, L, (x0 + x1) / 2) * .8;
    const s = finShape([[x0, 0], [(x0 + x1) / 2 - .02, -ht * 1.25], [x1, 0]]);
    const m = fin(s, o.color || f.fin); m.position.y = -base; grp.add(m); return m;
  }
  function pectorals(grp, f, L, R, z, o = {}) {
    for (const s of [1, -1]) {
      const sh = finShape([[0, 0], [-.05, -(o.h ?? R * .55)], [-(o.w ?? .14), -(o.h ?? R * .4) * .6]]);
      const m = fin(sh, o.color || f.fin, .008); m.position.set(o.x ?? .16, o.y ?? -R * .25, s * z);
      m.rotation.y = s * (o.spread ?? .7); m.rotation.x = s * .25; grp.add(m);
    }
  }

  // ---------- builders ----------
  function standard(f, o = {}) {
    const grp = new THREE.Group(), L = 1, h = f.h || .35, R = Math.min(.42, h * L / 2), thick = o.thick ?? .55;
    const prof = o.prof || (u => PROFILES.fish(u, o.p ?? 1.36, o.q ?? .72));
    const body = new THREE.Mesh(tint(bodyGeo(L, R, thick, prof), f, L, R), vmat(o.bodyMat || {}));
    grp.add(body);
    if (o.tail !== false) tailFin(grp, f, L, R, o.tail || (f.type === 'fan' ? 'fan' : 'fork'), f.type === 'redtail' ? '#e8574f' : null);
    if (o.dorsal !== false) dorsal(grp, f, L, R, prof, o.dorsal || {});
    if (o.anal !== false) anal(grp, f, L, R, prof, o.anal || {});
    const ex = o.eyeX ?? .32, ey = o.eyeY ?? R * .2, er = o.eyeR ?? Math.max(.03, Math.min(.05, R * .26));
    const ez = Math.sqrt(Math.max(0, radiusAt(prof, R, L, ex) ** 2 - ey ** 2)) * thick;
    if (o.eyes !== false) {
      eyes(grp, ex, ey, ez + er * .03, er, { rim: isDark(f.c1) });
      if (o.blush !== false) { const bx = ex + er * .2, by = ey - er * 1.7; blush(grp, bx, by, Math.sqrt(Math.max(0, radiusAt(prof, R, L, bx) ** 2 - by ** 2)) * thick + .004, er * .75); }
    }
    if (o.pect !== false) pectorals(grp, f, L, R, radiusAt(prof, R, L, .16) * thick * .9, o.pect || {});
    if (o.mouth !== false) mouthLine(grp, L / 2 - .015, -R * .12, Math.max(.018, R * .12), 0);
    return { grp, L, R, prof, thick };
  }
  function addWhiskers(grp, R, n = 2, len = .15) {
    for (const s of [1, -1]) for (let i = 0; i < n; i++) {
      const y0 = -R * .1 - i * .02, dz = s * (.03 + i * .02);
      grp.add(tube([V3(.49, y0, dz), V3(.5, y0 - .03, dz * 1.8), V3(.46 - len * .25, y0 - len * .32, dz * 2.6), V3(.44 - len * .6, y0 - len * .42, dz * 3)], .01, '#6a5644'));
    }
  }
  function addTeeth(grp, x, y, n, sz, z = 0.02) {
    for (let i = 0; i < n; i++) for (const up of [1, -1]) {
      const t = new THREE.Mesh(new THREE.ConeGeometry(sz * .4, sz, 6), mat('#fffaf0', { roughness: .3 }));
      t.position.set(x - i * sz * .7, y + up * sz * .2, (i % 2 ? 1 : -1) * z); t.rotation.z = up > 0 ? Math.PI : 0; grp.add(t);
    }
  }
  function shark(f) {
    const R = f.h * .5, isEel = f.id === 'frilledshark';
    const r = standard(f, { thick: .75, p: 1.15, q: .6, tail: 'shark', eyeX: .36, eyeR: .028, eyeY: R * .25,
      dorsal: { x0: -.08, x1: .12, h: R * 1.3, lean: -.06 }, anal: { x0: -.3, x1: -.22, h: R * .5 }, pect: { x: .18, h: R * 1.2, w: .22, spread: .9 } });
    const { grp } = r;
    // snout
    const sn = f.snout || (f.id === 'goblinshark' ? .2 : 0);
    if (sn) { const s = new THREE.Mesh(new THREE.ConeGeometry(R * .35, sn + .1, 16), mat(f.c1)); s.rotation.z = -Math.PI / 2; s.scale.set(1, 1, .5); s.position.set(.5 + sn * .4, R * .2, 0); grp.add(s); }
    // gill slits
    for (const s of [1, -1]) for (let i = 0; i < 5; i++) {
      const g = new THREE.Mesh(new THREE.BoxGeometry(.006, R * .7, .004), mat('#2a2a34', { transparent: true, opacity: .55 }));
      g.position.set(.24 - i * .03, -R * .05, s * R * .62); grp.add(g);
    }
    if (f.id === 'megamouth') { const m = new THREE.Mesh(new THREE.SphereGeometry(R * .9, 20, 12, 0, TAU, Math.PI * .45, Math.PI * .3), mat('#2a2030', { side: THREE.DoubleSide })); m.position.set(.4, -R * .1, 0); m.scale.set(.5, 1, .7); grp.add(m); }
    if (f.id === 'greatwhite' || f.id === 'goblinshark') addTeeth(grp, .46, -R * .32, 4, .025, .04);
    if (f.mark === 'lights' || f.id === 'whaleshark') for (let i = 0; i < 40; i++) {
      const x = -.4 + (i % 10) * .085, y = R * (-.1 + Math.floor(i / 10) * .25);
      const d = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), mat('#f4f8ff')); d.position.set(x, y, R * .7); grp.add(d);
    }
    return grp;
  }
  function hammer(f) {
    const r = standard(f, { thick: .75, p: 1.15, q: .6, tail: 'shark', eyes: false, dorsal: { x0: -.06, x1: .12, h: f.h * .7, lean: -.06 }, pect: { x: .16, h: f.h * .55, w: .22, spread: .9 } });
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.1, 24, 12), mat(f.c1)); hd.scale.set(.6, .32, 3.1); hd.position.set(.45, .01, 0); r.grp.add(hd);
    for (const s of [1, -1]) { const e = eye(.028, isDark(f.c1)); e.position.set(.46, .01, s * .3); e.rotation.y = s > 0 ? 0 : Math.PI; r.grp.add(e); }
    r.grp.rotation.x = .55;   // look down a little so the hammer reads
    return r.grp;
  }
  function eelLike(f, o = {}) {
    const grp = new THREE.Group(), L = 1, R = Math.max(.035, f.h * .5), prof = PROFILES.long;
    grp.add(new THREE.Mesh(tint(bodyGeo(L, R, o.thick ?? .8, prof, 60), f, L, R), vmat()));
    // ribbon fins along back and belly
    const top = finShape([[-.48, 0], [-.1, R * (o.crest ?? 1.4)], [.3, 0]]);
    const d = fin(top, o.crestColor || f.fin, .006); d.position.y = R * .75; grp.add(d);
    const bot = finShape([[-.48, 0], [-.2, -R * .9], [.05, 0]]); const a = fin(bot, f.fin, .006); a.position.y = -R * .75; grp.add(a);
    eyes(grp, .42, R * .3, R * .6, Math.max(.02, R * .35), { rim: isDark(f.c1) });
    mouthLine(grp, .495, -R * .1, R * .3, 0);
    if (o.extra) o.extra(grp, R);
    return grp;
  }
  function puffer(f) {
    const grp = new THREE.Group(), R = .34;
    const g = new THREE.SphereGeometry(R, 40, 28); grp.add(new THREE.Mesh(tint(g, f, .7, R), vmat()));
    const pos = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 37) {
      v.fromBufferAttribute(pos, i); const n = v.clone().normalize(); if (Math.abs(n.z) > .97) continue;
      const sp = new THREE.Mesh(new THREE.ConeGeometry(.018, .07, 6), mat('#e9dcb0')); sp.position.copy(n.clone().multiplyScalar(R + .02));
      sp.quaternion.setFromUnitVectors(V3(0, 1, 0), n); grp.add(sp);
    }
    tailFin(grp, f, .78, R * .5, 'round'); grp.children[grp.children.length - 1].position.x = -R - .02;
    eyes(grp, R * .55, R * .35, R * .62, .06); mouthLine(grp, R, -R * .1, .03, 0);
    pectorals(grp, f, .7, R * .5, R * .85, { x: R * .25, h: .12, w: .1 });
    return grp;
  }
  function box(f) {
    // a soft "squircle" cube: sphere vertices pushed out towards the corners
    const grp = new THREE.Group(), w = .6, h = .44, d = .36;
    const g = new THREE.SphereGeometry(1, 48, 32), pos = g.attributes.position, v = new THREE.Vector3(), e = .45;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const sx = Math.sign(v.x) * Math.pow(Math.abs(v.x), e), sy = Math.sign(v.y) * Math.pow(Math.abs(v.y), e), sz = Math.sign(v.z) * Math.pow(Math.abs(v.z), e);
      pos.setXYZ(i, sx * w / 2 * (1 - .12 * (sx > 0 ? sy * sy : 0)), sy * h / 2, sz * d / 2 * (1 - .1 * Math.max(0, sx)));
    }
    g.computeVertexNormals();
    grp.add(new THREE.Mesh(tint(g, f, w, h / 2, { plain: true }), vmat({ roughness: .35 })));
    // crisp polka dots on the sides and top (instead of painted ones)
    const dotM = mat('#3a2e22', { roughness: .4 });
    for (const sz of [1, -1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x = -.17 + i * .11 + (j % 2) * .05, y = .1 - j * .13;
      if (x > .1 && y > 0) continue;
      const dd = new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), dotM); dd.scale.z = .35; dd.position.set(x, y, sz * d / 2 * .985); grp.add(dd);
    }
    for (let i = 0; i < 3; i++) { const dd = new THREE.Mesh(new THREE.SphereGeometry(.016, 10, 8), dotM); dd.scale.y = .35; dd.position.set(-.16 + i * .12, h / 2 * .985, (i % 2 ? .06 : -.06)); grp.add(dd); }
    const tl = fin(finShape([[0, .06], [-.1, .14], [-.13, 0], [-.1, -.14], [0, -.06]]), f.fin); tl.position.x = -w / 2 + .01; grp.add(tl);
    eyes(grp, .17, .08, d / 2 * .94, .045); blush(grp, .2, -.04, d / 2 * .94 + .004, .035);
    const lips = new THREE.Mesh(new THREE.TorusGeometry(.022, .012, 8, 16), mat('#ff9c6a')); lips.rotation.y = Math.PI / 2; lips.position.set(w / 2 + .005, -.05, 0); grp.add(lips);
    for (const s of [1, -1]) { const pf = fin(finShape([[0, 0], [-.04, .07], [-.09, .02]]), f.fin, .008); pf.position.set(.05, -.06, s * d / 2 * .95); pf.rotation.y = s * .9; grp.add(pf); }
    const df = fin(finShape([[-.12, 0], [-.17, .07], [-.22, 0]]), f.fin, .008); df.position.y = h / 2 * .92; grp.add(df);
    return grp;
  }
  function flat(f) {
    const r = standard(f, { thick: .18, p: 1.1, q: .6, eyes: false, tail: 'round',
      dorsal: { shape: finShape([[-.42, 0], [-.05, f.h * .55], [.4, 0]]) }, anal: { x0: -.4, x1: .3, h: f.h * .35 }, pect: false });
    eyes(r.grp, .3, r.R * .45, r.R * .2, .04, { oneSide: true }); eyes(r.grp, .36, r.R * .62, r.R * .15, .036, { oneSide: true });
    return r.grp;
  }
  function lion(f) {
    const r = standard(f, { dorsal: false, pect: false });
    for (let i = 0; i < 9; i++) { const x = -.28 + i * .07, hgt = .32 + (i % 2) * .1; r.grp.add(tube([V3(x, r.R * .7, 0), V3(x - .04, r.R + hgt * .5, 0), V3(x - .08, r.R + hgt, 0)], .008, i % 2 ? '#fff3ea' : '#d9785a')); }
    for (const s of [1, -1]) for (let i = 0; i < 7; i++) { const a = -.5 - i * .17; r.grp.add(tube([V3(.12, -r.R * .2, s * .1), V3(.12 + Math.cos(a) * .2, -r.R * .2 + Math.sin(a) * .2, s * .22), V3(.12 + Math.cos(a) * .38, -r.R * .2 + Math.sin(a) * .38, s * .3)], .007, i % 2 ? '#fff3ea' : '#d9785a')); }
    return r.grp;
  }
  function seahorse(f) {
    const grp = new THREE.Group(), c = f.c1;
    const path = [V3(.0, .3, 0), V3(.05, .15, 0), V3(.04, -.02, 0), V3(-.02, -.16, 0), V3(.02, -.28, 0), V3(.1, -.3, 0), V3(.12, -.22, 0), V3(.07, -.2, 0)];
    const curve = new THREE.CatmullRomCurve3(path);
    for (let i = 0; i <= 28; i++) { const t = i / 28, p = curve.getPoint(t), r = .09 * (1 - t) + .015; const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(i % 3 ? c : f.c2)); s.position.copy(p); s.scale.z = .75; grp.add(s); }
    const head = new THREE.Mesh(new THREE.SphereGeometry(.08, 18, 12), mat(c)); head.position.set(.04, .36, 0); grp.add(head);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(.022, .03, .16, 12), mat(c)); snout.rotation.z = -Math.PI / 2 + .25; snout.position.set(.16, .33, 0); grp.add(snout);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(.03, .07, 8), mat(f.fin)); crown.position.set(.0, .45, 0); grp.add(crown);
    const df = fin(finShape([[0, 0], [-.08, .04], [-.1, -.08]]), f.fin); df.position.set(-.06, .08, 0); grp.add(df);
    eyes(grp, .08, .38, .05, .025);
    grp.scale.setScalar(1.25);
    return grp;
  }
  function star(f) {
    const grp = new THREE.Group(), s = new THREE.Shape(), R = .45, r = .2;
    for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; i ? s.lineTo(Math.cos(a) * d, Math.sin(a) * d) : s.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
    const g = new THREE.ExtrudeGeometry(s, { depth: .05, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 4 }); g.translate(0, 0, -.025);
    grp.add(new THREE.Mesh(g, mat(f.c1, { roughness: .6 })));
    for (let k = 0; k < 5; k++) for (let j = 1; j <= 3; j++) { const a = Math.PI / 2 + k * TAU / 5; const b = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 6), mat('#ffe2c8')); b.position.set(Math.cos(a) * R * j * .26, Math.sin(a) * R * j * .26, .07); grp.add(b); }
    grp.rotation.x = -.5;
    return grp;
  }
  function ray(f) {
    const grp = new THREE.Group(), s = new THREE.Shape();
    s.moveTo(.3, 0); s.quadraticCurveTo(.1, .2, -.08, .48); s.quadraticCurveTo(-.08, .2, -.28, 0); s.quadraticCurveTo(-.08, -.2, -.08, -.48); s.quadraticCurveTo(.1, -.2, .3, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: .04, bevelEnabled: true, bevelThickness: .04, bevelSize: .03, bevelSegments: 4 });
    g.rotateX(-Math.PI / 2); g.translate(0, .02, 0);
    const top = new THREE.Mesh(g, [mat(f.c1), mat(f.c1)]); grp.add(top);
    const belly = new THREE.Mesh(g, mat(f.c2)); belly.scale.y = -.4; grp.add(belly);
    for (const s2 of [1, -1]) { const cf = new THREE.Mesh(new THREE.CapsuleGeometry(.02, .07, 4, 8), mat(f.c1)); cf.rotation.z = Math.PI / 2; cf.position.set(.32, 0, s2 * .07); grp.add(cf); }
    grp.add(tube([V3(-.26, 0, 0), V3(-.4, .01, 0), V3(-.55, .03, 0)], .01, f.c1));
    for (const s2 of [1, -1]) { const e = eye(.018, true); e.position.set(.26, .03, s2 * .09); e.rotation.y = s2 > 0 ? 0 : Math.PI; grp.add(e); }
    grp.rotation.x = .85;
    return grp;
  }
  function clione(f) {
    const grp = new THREE.Group(), glass = { transparent: true, opacity: .55, roughness: .15 };
    const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push(new THREE.Vector2(.12 * Math.pow(Math.sin(Math.PI * u), .8) * (1 - u * .4) + 1e-4, -.36 + .72 * u)); }
    grp.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 30), mat(f.c1, glass)));
    const head = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 14), mat(f.c1, glass)); head.position.y = .42; grp.add(head);
    const gut = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), mat(f.c2)); gut.scale.y = 1.6; grp.add(gut);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 8), mat('#ffb07a')); hood.position.y = .45; grp.add(hood);
    for (const s of [1, -1]) { const w = fin(finShape([[0, 0], [s * .18, .15], [s * .22, -.02]]), f.fin, .01, glass); w.position.y = .22; grp.add(w); }
    return grp;
  }
  function squid(f) {
    const grp = new THREE.Group(), giant = f.id === 'giantsquid', L = 1;
    // mantle points +X, arms trail to -X
    const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push(new THREE.Vector2(.09 * Math.pow(Math.sin(Math.PI * Math.min(.98, .15 + u * .85)), .6) + 1e-4, -.05 + .55 * u)); }
    const mg = new THREE.LatheGeometry(pts, 28); mg.rotateZ(-Math.PI / 2); grp.add(new THREE.Mesh(tint(mg, f, .8, .1, { plain: true }), vmat()));
    for (const s of [1, -1]) { const fn = fin(finShape([[.38, 0], [.48, s * .14], [.52, 0]]), f.fin, .01); fn.rotation.x = Math.PI / 2; grp.add(fn); }
    const head = new THREE.Mesh(new THREE.SphereGeometry(.075, 18, 14), mat(f.c1)); head.position.x = -.08; head.scale.set(1.1, .9, .9); grp.add(head);
    eyes(grp, -.08, .02, .072, giant ? .04 : .03);
    const nArm = 8;
    for (let i = 0; i < nArm; i++) {
      const a = (i / nArm) * TAU, len = giant ? .5 : .28, y = Math.cos(a) * .04, z = Math.sin(a) * .04;
      grp.add(tube([V3(-.14, y, z), V3(-.14 - len * .4, y * 1.6, z * 1.6 + .01), V3(-.14 - len * .75, y * 2.2 + Math.sin(i) * .03, z * 2), V3(-.14 - len, y * 2.4, z * 2.4)], .012 * (giant ? 1.3 : 1), f.c2));
    }
    if (f.mark === 'lights') for (let i = 0; i < 26; i++) {
      const x = -.05 + (i % 13) * .035, ang = (i / 13 | 0) ? .6 : -.6;
      const d = new THREE.Mesh(new THREE.SphereGeometry(.011, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8fe8ff })); d.position.set(x, Math.sin(ang) * .07, Math.cos(ang) * .07); grp.add(d);
    }
    if (giant) grp.scale.setScalar(.95);
    return grp;
  }
  function vampire(f) {
    // upright and round: a dome mantle with two ear-like fins, and a webbed skirt of 8 arms
    const grp = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(.17, 32, 24), mat(f.c1, { roughness: .45 })); body.scale.set(1, 1.18, 1); body.position.y = .08; grp.add(body);
    for (const s of [1, -1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(.07, 18, 12), mat(f.fin)); ear.scale.set(.5, 1, 1.3); ear.position.set(0, .24, s * .15); ear.rotation.x = s * .7; grp.add(ear); }
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(.13, .3, .2, 8, 1, true), mat(f.c2, { side: THREE.DoubleSide, roughness: .55 })); skirt.position.y = -.13; grp.add(skirt);
    for (let i = 0; i < 8; i++) {
      const a = (i + .5) / 8 * TAU, c = Math.cos(a), sn = Math.sin(a);
      grp.add(tube([V3(c * .12, -.02, sn * .12), V3(c * .22, -.12, sn * .22), V3(c * .31, -.24, sn * .31), V3(c * .35, -.3, sn * .35)], .016, f.c1));
      const tip = new THREE.Mesh(new THREE.SphereGeometry(.02, 10, 8), mat('#f2e2e6')); tip.position.set(c * .35, -.3, sn * .35); grp.add(tip);
    }
    // face looks along +X (towards the viewer once posed)
    for (const s of [1, -1]) {
      const e = eye(.045, true); e.position.set(.15, .1, s * .07); e.rotation.y = Math.PI / 2 - s * .45; grp.add(e);
      const b = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 8), mat('#ff9fb0', { transparent: true, opacity: .55, depthWrite: false })); b.scale.set(.2, .7, 1.2); b.position.set(.165, .03, s * .1); b.rotation.y = -s * .45; grp.add(b);
    }
    const m = new THREE.Mesh(new THREE.TorusGeometry(.022, .006, 6, 12, Math.PI), mat('#3a1a22')); m.rotation.set(0, Math.PI / 2, Math.PI); m.position.set(.172, .04, 0); grp.add(m);
    grp.rotation.y = -.3;
    return grp;
  }
  function angler(f) {
    const r = standard(f, { prof: PROFILES.head, thick: .8, eyeX: .25, eyeY: .1, eyeR: .035, tail: 'round', dorsal: { x0: -.3, x1: -.15, h: .1 }, mouth: false });
    const { grp, R } = r;
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(R * .7, 24, 12, 0, TAU, Math.PI * .5, Math.PI * .35), mat('#2a1a2a', { side: THREE.DoubleSide })); jaw.position.set(.38, -R * .15, 0); jaw.scale.set(.6, .8, .9); grp.add(jaw);
    addTeeth(grp, .44, -R * .1, 5, .03, .05);
    grp.add(tube([V3(.1, R * .85, 0), V3(.22, R * 1.5, 0), V3(.45, R * 1.6, 0), V3(.56, R * 1.15, 0)], .008, f.fin));
    const lure = new THREE.Mesh(new THREE.SphereGeometry(.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6a8 })); lure.position.set(.57, R * 1.1, 0); grp.add(lure);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6a8, transparent: true, opacity: .35 })); glow.position.copy(lure.position); grp.add(glow);
    return grp;
  }
  function blob(f) {
    const r = standard(f, { prof: PROFILES.head, thick: .85, eyeX: .26, eyeY: .1, eyeR: .028, tail: 'round', dorsal: false, anal: false, mouth: false, bodyMat: { roughness: .7 } });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(.07, 18, 12), mat(f.c1, { roughness: .7 })); nose.scale.set(.9, 1.3, .9); nose.position.set(.47, -.04, 0); r.grp.add(nose);
    const m = new THREE.Mesh(new THREE.TorusGeometry(.06, .012, 6, 14, Math.PI), mat('#8a4a4a')); m.position.set(.4, -.13, 0); m.rotation.y = Math.PI / 2; r.grp.add(m);
    return r.grp;
  }
  function gulper(f) {
    const grp = eelLike(f, { crest: .5, extra: (g, R) => {
      const mouth = new THREE.Mesh(new THREE.SphereGeometry(.14, 24, 14), mat('#1a1622', { side: THREE.DoubleSide })); mouth.scale.set(1.1, .9, .7); mouth.position.set(.38, -.02, 0); g.add(mouth);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(.02, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff8ab0 })); tip.position.set(-.5, 0, 0); g.add(tip);
    } });
    return grp;
  }
  function oar(f) {
    return eelLike(f, { crest: 2.2, crestColor: '#ff5a5a', extra: (g, R) => {
      g.add(tube([V3(.4, R * .9, 0), V3(.43, R * 3, 0), V3(.36, R * 5.5, 0)], .01, '#ff5a5a'));
    } });
  }
  function swordLike(f, sail) {
    const r = standard(f, { thick: .65, p: 1.25, q: .6, tail: 'crescent', eyeX: .34, eyeR: .028,
      dorsal: sail ? { shape: finShape([[-.32, 0], [-.05, .5], [.3, 0]]) } : { x0: -.04, x1: .12, h: f.h * .8, lean: -.05 }, pect: { x: .22, h: .12, w: .16, spread: 1 } });
    const bill = new THREE.Mesh(new THREE.ConeGeometry(r.R * .22, .38, 12), mat(f.c1)); bill.rotation.z = -Math.PI / 2; bill.scale.z = .5; bill.position.set(.68, r.R * .05, 0); r.grp.add(bill);
    return r.grp;
  }
  function tuna(f) {
    const r = standard(f, { thick: .72, p: 1.2, q: .62, tail: 'crescent', eyeR: .035, dorsal: { x0: -.08, x1: .1, h: f.h * .45 } });
    for (let i = 0; i < 5; i++) for (const up of [1, -1]) { const t = fin(finShape([[0, 0], [-.01, up * .05], [-.03, 0]]), '#ffd84d', .006); t.position.set(-.15 - i * .055, up * radiusAt(r.prof, r.R, 1, -.15 - i * .055) * .85, 0); r.grp.add(t); }
    return r.grp;
  }
  function mola(f) {
    const r = standard(f, { prof: PROFILES.mola, thick: .4, tail: false, eyeX: .3, eyeR: .035, dorsal: { shape: finShape([[-.4, 0], [-.42, .55], [-.25, 0]]) }, anal: false, pect: { x: .2, h: .1, w: .07 } });
    const an = fin(finShape([[-.4, 0], [-.42, -.55], [-.25, 0]]), f.fin); an.position.y = -r.R * .7; r.grp.add(an);
    for (let i = 0; i < 9; i++) { const a = -.8 + i * .2; const b = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), mat(f.fin)); b.position.set(-.47 + Math.cos(a) * .02, Math.sin(a) * r.R * .9, 0); b.scale.z = .4; r.grp.add(b); }
    return r.grp;
  }
  function lobe(f) {
    const r = standard(f, { thick: .65, tail: 'round', pect: false, dorsal: { x0: -.1, x1: .08, h: f.h * .5 } });
    const lobeAt = (x, y, z, rot) => { const l = new THREE.Mesh(new THREE.CapsuleGeometry(.035, .07, 6, 10), mat(f.fin)); l.position.set(x, y, z); l.rotation.set(0, 0, rot); r.grp.add(l); };
    for (const s of [1, -1]) { lobeAt(.14, -r.R * .35, s * r.R * .55, 2.2); lobeAt(-.08, -r.R * .55, s * r.R * .4, 2.4); }
    lobeAt(-.2, r.R * .85, 0, .8); lobeAt(-.2, -r.R * .85, 0, -.8);
    return r.grp;
  }
  function wing(f) {
    const r = standard(f, { pect: false, eyeR: .04 });
    for (const s of [1, -1]) { const w = fin(finShape([[.15, 0], [-.05, .32], [-.35, .28], [-.1, .06], [.1, 0]]), f.fin, .008, { transparent: true, opacity: .85 }); w.position.set(0, r.R * .1, s * r.R * .55); w.rotation.x = s * -1.1; r.grp.add(w); }
    return r.grp;
  }
  function tripod(f) {
    const r = standard(f, { tail: 'fork' });
    r.grp.add(tube([V3(.05, -r.R * .8, .03), V3(.0, -.25, .05), V3(-.04, -.42, .06)], .006, f.fin));
    r.grp.add(tube([V3(.05, -r.R * .8, -.03), V3(.0, -.25, -.05), V3(-.04, -.42, -.06)], .006, f.fin));
    r.grp.add(tube([V3(-.5, -r.R * .2, 0), V3(-.56, -.25, 0), V3(-.6, -.42, 0)], .006, f.fin));
    return r.grp;
  }
  function barrel(f) {
    const r = standard(f, { eyes: false, thick: .65 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 16, 0, TAU, 0, Math.PI / 2), mat('#e8f6ff', { transparent: true, opacity: .32, roughness: .05 }));
    dome.position.set(.3, r.R * .55, 0); dome.scale.set(1.2, 1, .9); r.grp.add(dome);
    for (const s of [1, -1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, .1, 12), mat('#7fe08a', { emissive: 0x2a8a3a, emissiveIntensity: .4 })); e.position.set(.3, r.R * .65, s * .035); r.grp.add(e); }
    for (const s of [1, -1]) { const n = new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), mat('#2a2026')); n.position.set(.46, r.R * .25, s * .05); r.grp.add(n); }
    return r.grp;
  }
  function rattail(f) {
    return standard(f, { prof: PROFILES.rattail, thick: .7, tail: false, eyeX: .3, eyeR: .045, dorsal: { x0: .0, x1: .14, h: f.h * .9 }, anal: { x0: -.45, x1: .0, h: f.h * .25 } }).grp;
  }
  function skipper(f) {
    const r = standard(f, { eyes: false, pect: { x: .12, h: .1, w: .12, spread: 1.1 } });
    for (const s of [1, -1]) { const e = eye(.04); e.position.set(.34, r.R + .02, s * .035); e.rotation.x = s * -.6; r.grp.add(e); }
    return r.grp;
  }
  function gar(f) {
    const r = standard(f, { thick: .8, p: 1.1, q: .45, tail: 'round', eyeX: .3, eyeR: .028, dorsal: { x0: -.36, x1: -.26, h: f.h * .6 }, anal: { x0: -.36, x1: -.26 } });
    const jaw = new THREE.Mesh(new THREE.CylinderGeometry(.012, .035, .24, 12), mat(f.c1)); jaw.rotation.z = -Math.PI / 2; jaw.scale.z = .6; jaw.position.set(.6, -.005, 0); r.grp.add(jaw);
    addTeeth(r.grp, .68, -.02, 6, .018, .015);
    return r.grp;
  }
  function idol(f) {
    const r = standard(f, { thick: .35, p: 1.05, q: .6, eyeX: .28, eyeR: .035, dorsal: { shape: finShape([[-.2, 0], [-.05, .25], [.15, 0]]) }, anal: { x0: -.2, x1: .1, h: f.h * .4 } });
    r.grp.add(tube([V3(.05, r.R * 1.1, 0), V3(-.05, r.R * 1.6, 0), V3(-.35, r.R * 1.7, 0), V3(-.6, r.R * 1.3, 0)], .01, '#f6f4ea'));
    const sn = new THREE.Mesh(new THREE.CylinderGeometry(.02, .04, .1, 12), mat('#ffb04a')); sn.rotation.z = -Math.PI / 2; sn.position.set(.52, -r.R * .15, 0); r.grp.add(sn);
    return r.grp;
  }
  function parrot(f) {
    const r = standard(f, { thick: .62, p: 1.25, mouth: false, tail: 'round' });
    const beak = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 10), mat('#f6f2e4', { roughness: .3 })); beak.scale.set(1, .7, 1.1); beak.position.set(.49, -r.R * .15, 0); r.grp.add(beak);
    return r.grp;
  }
  function mahi(f) {
    return standard(f, { prof: PROFILES.blunt, thick: .5, tail: 'crescent', eyeX: .36, dorsal: { shape: finShape([[-.4, 0], [.0, .14], [.42, 0]]) }, anal: { x0: -.4, x1: .0, h: f.h * .35 } }).grp;
  }
  function swallower(f) {
    const r = standard(f, { thick: .7, eyeR: .03, tail: 'fork', dorsal: { x0: -.3, x1: -.05, h: f.h * .35 } });
    const belly = new THREE.Mesh(new THREE.SphereGeometry(.16, 24, 16), mat('#d8c8d0', { transparent: true, opacity: .92, roughness: .3 })); belly.scale.set(1.2, .9, .9); belly.position.set(-.02, -.12, 0); r.grp.add(belly);
    addTeeth(r.grp, .48, -r.R * .1, 4, .02, .03);
    return r.grp;
  }

  function build(f) {
    switch (f.type) {
      case 'shark': return shark(f);
      case 'hammer': return hammer(f);
      case 'eel': return f.id === 'frilledshark' ? eelLike(f, { thick: .9, crest: .6, extra: (g, R) => { for (let i = 0; i < 6; i++) { const fr = new THREE.Mesh(new THREE.TorusGeometry(R * .9, .008, 6, 16), mat('#d88a8a')); fr.rotation.y = Math.PI / 2; fr.position.x = .36 - i * .025; g.add(fr); } } }) : eelLike(f);
      case 'oar': return oar(f);
      case 'gulper': return gulper(f);
      case 'puffer': return puffer(f);
      case 'box': return box(f);
      case 'flat': return flat(f);
      case 'lion': return lion(f);
      case 'seahorse': return seahorse(f);
      case 'star': return star(f);
      case 'ray': return ray(f);
      case 'clione': return clione(f);
      case 'squid': return squid(f);
      case 'vampire': return vampire(f);
      case 'angler': return angler(f);
      case 'blob': return blob(f);
      case 'sword': return swordLike(f, false);
      case 'sail': return swordLike(f, true);
      case 'tuna': return tuna(f);
      case 'mola': return mola(f);
      case 'lobe': return lobe(f);
      case 'wing': return wing(f);
      case 'tripod': return tripod(f);
      case 'barrel': return barrel(f);
      case 'rattail': return rattail(f);
      case 'skipper': return skipper(f);
      case 'gar': return gar(f);
      case 'idol': return idol(f);
      case 'parrot': return parrot(f);
      case 'mahi': return mahi(f);
      case 'swallower': return swallower(f);
      default: {
        const r = standard(f, { tail: f.type === 'fan' ? 'fan' : 'fork' });
        if (f.type === 'whiskers') addWhiskers(r.grp, r.R, f.id === 'burbot' ? 1 : 2);
        if (f.type === 'fang') addTeeth(r.grp, .47, -r.R * .1, 3, .035, .03);
        return r.grp;
      }
    }
  }
  return { build };
})();
