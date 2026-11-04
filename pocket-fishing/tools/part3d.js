/* =========================================================
   3D icons for the rod upgrades (same clay look as the fish).
   PartArt.build(slot, id) -> THREE.Group roughly 1 unit across, centred.
   ========================================================= */
const PartArt = (() => {
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .42, metalness: .04 }, o));
  const metal = (c, o = {}) => mat(c, Object.assign({ roughness: .22, metalness: .55 }, o));
  const tube = (pts, r, m, closed = false) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), 64, r, 10, closed), m);
  const add = (g, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); g.add(m); return m; };
  const cyl = (rt, rb, h, m, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const sph = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), m);
  const glowBall = (r, color, o = .3) => new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o, depthWrite: false }));

  function reel(color, size, gold) {
    const g = new THREE.Group(), m = gold ? metal(color) : mat(color, { roughness: .35, metalness: .2 }), r = .3 * size;
    const body = add(g, cyl(r, r, .2, m)); body.rotation.x = Math.PI / 2;
    const face = add(g, cyl(r * .78, r * .78, .21, mat('#fffaf1'))); face.rotation.x = Math.PI / 2;
    const hub = add(g, cyl(r * .3, r * .3, .23, gold ? metal('#c9952e') : mat('#55585e'))); hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) { const sp = add(g, new THREE.Mesh(new THREE.BoxGeometry(r * .7, .03, .02), mat('#55585e'))); sp.position.z = .11; sp.rotation.z = i * Math.PI * 2 / 3; sp.position.x = Math.cos(i * Math.PI * 2 / 3) * r * .35; sp.position.y = Math.sin(i * Math.PI * 2 / 3) * r * .35; }
    const arm = add(g, new THREE.Mesh(new THREE.BoxGeometry(r * 1.1, .05, .04), gold ? metal('#c9952e') : mat('#55585e')), r * .5, 0, .14);
    add(g, cyl(.05, .05, .12, mat('#f48e85')), r * 1.05, 0, .2).rotation.x = Math.PI / 2;
    add(g, new THREE.Mesh(new THREE.BoxGeometry(.08, .32, .08), mat('#8a6a55')), 0, -r - .12, -.05);
    if (gold) for (let i = 0; i < 5; i++) { const s = add(g, sparkle(.06), (Math.random() - .5) * .9, (Math.random() - .3) * .7, .2); }
    if (size > 1.05 && !gold) for (let i = 0; i < 3; i++) add(g, tube([V3(-.62, .18 - i * .16, 0), V3(-.42, .18 - i * .16, 0)], .018, mat('#cfe7fb')));   // speed lines
    return g;
  }
  function sparkle(s) {
    const sh = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, d = i % 2 ? s * .35 : s; i ? sh.lineTo(Math.cos(a) * d, Math.sin(a) * d) : sh.moveTo(d, 0); }
    return new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .01, bevelEnabled: false }), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
  }
  function spool(color, glow, braided) {
    const g = new THREE.Group();
    const core = add(g, cyl(.3, .3, .5, mat('#e9d6b8'))); core.rotation.z = Math.PI / 2;
    for (const x of [-.27, .27]) { const fl = add(g, cyl(.36, .36, .05, mat('#f48e85')), x); fl.rotation.z = Math.PI / 2; }
    const lm = glow ? new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .6, roughness: .3 }) : mat(color, { roughness: .6 });
    for (let i = 0; i < 9; i++) { const t = add(g, new THREE.Mesh(new THREE.TorusGeometry(.31, braided ? .03 : .022, 8, 40), lm), -.2 + i * .05); t.rotation.y = Math.PI / 2; if (braided) t.rotation.x = (i % 2 ? .08 : -.08); }
    add(g, tube([V3(.05, -.31, .05), V3(.25, -.45, .2), V3(.5, -.38, .1), V3(.6, -.5, -.05)], .014, lm));
    if (glow) add(g, glowBall(.5, 0x8ff6ff, .18));
    return g;
  }
  function hookMesh(m, s = 1) {
    return tube([V3(0, .45 * s, 0), V3(0, -.1 * s, 0), V3(.02, -.28 * s, 0), V3(.18 * s, -.34 * s, 0), V3(.28 * s, -.18 * s, 0), V3(.26 * s, -.04 * s, 0)], .028 * s, m);
  }
  function hook(id) {
    const g = new THREE.Group(), steel = metal('#9aa3ad');
    const h = add(g, hookMesh(steel)); add(g, new THREE.Mesh(new THREE.TorusGeometry(.05, .016, 8, 16), steel), 0, .5, 0);
    if (id === 'worm') { h.position.x = -.12;
      add(g, tube([V3(-.1, .2, .02), V3(.05, .05, .05), V3(-.08, -.12, .04), V3(.1, -.25, .05), V3(.22, -.12, .04), V3(.34, .02, .02)], .055, mat('#f2a0a0', { roughness: .55 })));
      const head = add(g, sph(.06, mat('#f2a0a0')), .34, .02, .02); }
    if (id === 'spoon') { h.position.set(.12, -.25, 0); h.scale.setScalar(.7);
      const sp = add(g, sph(.26, metal('#b9c6d4', { roughness: .18, metalness: .45 })), -.08, .14, 0); sp.scale.set(.62, 1, .22); sp.rotation.z = .35;
      add(g, sph(.06, mat('#f48e85')), -.12, .28, .05).scale.z = .3; }
    if (id === 'glowsinker') { h.position.set(.06, -.28, 0); h.scale.setScalar(.65);
      const sk = add(g, sph(.2, new THREE.MeshStandardMaterial({ color: '#a98cff', emissive: '#6a48d8', emissiveIntensity: .55, roughness: .25 })), 0, .2, 0); sk.scale.set(.85, 1.25, .85);
      add(g, glowBall(.42, 0xc8b8ff, .22), 0, .2, 0); }
    g.rotation.z = -.15;
    return g;
  }
  function bobber(id) {
    const g = new THREE.Group();
    if (id === 'duck') {
      add(g, sph(.3, mat('#ffe08e')), 0, -.05, 0).scale.set(1.2, .85, 1);
      add(g, sph(.19, mat('#ffe08e')), .2, .28, 0);
      const beak = add(g, new THREE.Mesh(new THREE.ConeGeometry(.07, .16, 12), mat('#ffb37a')), .43, .26, 0); beak.rotation.z = -Math.PI / 2;
      for (const s of [1, -1]) { const e = add(g, sph(.03, mat('#1c1820', { roughness: .2 })), .3, .34, s * .12); e.scale.z = .4; }
      add(g, sph(.1, mat('#ffe08e')), -.32, .05, 0).scale.set(1, .6, .6);
    } else if (id === 'star') {
      const sh = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? .18 : .42; i ? sh.lineTo(Math.cos(a) * d, Math.sin(a) * d) : sh.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
      const st = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .08, bevelEnabled: true, bevelThickness: .06, bevelSize: .05, bevelSegments: 4 }), new THREE.MeshStandardMaterial({ color: '#a98cff', emissive: '#6a48d8', emissiveIntensity: .35, roughness: .3 }));
      st.geometry.translate(0, 0, -.04); g.add(st); add(g, glowBall(.5, 0xd8ccff, .18));
      for (let i = 0; i < 4; i++) add(g, sparkle(.05), Math.cos(i * 1.6) * .5, Math.sin(i * 1.6) * .45, .1);
    } else {
      const top = add(g, new THREE.Mesh(new THREE.SphereGeometry(.3, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#f48e85')));
      const bot = add(g, new THREE.Mesh(new THREE.SphereGeometry(.3, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('#fffaf1')));
      add(g, cyl(.025, .025, .25, mat('#5b3d2e')), 0, .42, 0);
      add(g, cyl(.31, .31, .03, mat('#5b3d2e')));
    }
    return g;
  }
  function charm(id) {
    const g = new THREE.Group();
    if (id === 'shell') {
      for (let i = 0; i < 7; i++) { const a = -1.15 + i * .38; const rib = add(g, new THREE.Mesh(new THREE.CapsuleGeometry(.07, .42, 6, 12), mat(i % 2 ? '#ffc2b6' : '#ffb3a7', { roughness: .5 }))); rib.position.set(Math.sin(a) * .22, Math.cos(a) * .22 - .1, 0); rib.rotation.z = -a; rib.scale.z = .55; }
      add(g, sph(.1, mat('#ffb3a7')), 0, -.35, 0).scale.set(1.4, .7, .6);
      add(g, new THREE.Mesh(new THREE.TorusGeometry(.06, .015, 8, 16), metal('#f2c14e')), 0, .38, 0);
    } else if (id === 'clover') {
      for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2;
        for (const s of [-1, 1]) { const lf = add(g, sph(.13, mat('#6fc884', { roughness: .45 })), Math.cos(a) * .2 + Math.cos(a + s * Math.PI / 2) * .06, Math.sin(a) * .2 + Math.sin(a + s * Math.PI / 2) * .06, 0); lf.scale.z = .35; } }
      add(g, sph(.06, mat('#4fa86a')), 0, 0, .02).scale.z = .5;
      add(g, tube([V3(0, -.05, 0), V3(.06, -.25, 0), V3(.16, -.42, 0)], .025, mat('#4fa86a')));
      add(g, new THREE.Mesh(new THREE.TorusGeometry(.06, .015, 8, 16), metal('#f2c14e')), 0, .44, 0);
    } else {
      const ring = add(g, new THREE.Mesh(new THREE.TorusGeometry(.3, .03, 10, 48), mat('#d8c8b0', { transparent: true, opacity: .8 })));
      for (let i = 0; i < 12; i++) { if (i % 2) continue; const a = i / 12 * Math.PI * 2; add(g, sph(.035, mat('#d8c8b0')), Math.cos(a) * .3, Math.sin(a) * .3, .02); }
    }
    return g;
  }
  function build(slot, opt) {
    let g;
    if (slot === 'reel') g = reel(opt.hex, opt.id === 'golden' ? 1.15 : opt.id === 'swift' ? 1.08 : 1, opt.id === 'golden');
    else if (slot === 'line') g = spool(opt.hex, opt.id === 'glow', opt.id === 'braid');
    else if (slot === 'hook') g = hook(opt.id);
    else if (slot === 'bobber') g = bobber(opt.id);
    else g = charm(opt.id);
    const pose = new THREE.Group(); pose.add(g); pose.rotation.set(.25, -.4, 0);
    return pose;
  }
  return { build };
})();
