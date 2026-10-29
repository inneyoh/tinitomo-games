/* Tuning (CFG, CUSTOMERS, VOL, MARKET, UPGRADES, ECON) lives in config.js */

/* =====================================================================
   2. ASSETS — sprites are embedded; swap for file paths on GitHub Pages
   ===================================================================== */
const ASSET_SRC = {
  bowl:'assets/pk_bowl.webp', noodles:'assets/pk_noodles.webp', chashu:'assets/pk_chashu.webp', seaweed:'assets/pk_seaweed.webp',
  garlic:'assets/pk_garlic.webp', green_onion:'assets/pk_green_onion.webp', white_onion:'assets/pk_white_onion.webp', rice:'assets/pk_rice.webp',
  momo_body:'assets/momo_body.webp', momo_handL:'assets/momo_handL.webp', momo_handR:'assets/momo_handR.webp',
  momo_front:'assets/momo_front.webp', lemon_water:'assets/lemon_water.webp', momo_happy:'assets/momo_happy.webp', momo_confused:'assets/momo_confused.webp', momo_smug:'assets/momo_smug.webp',
  // night prep sprites
  pp_chashu_roll:'assets/pp_chashu_roll.webp', pp_chashu_slice:'assets/pp_chashu_slice.webp', pp_green_whole:'assets/pp_green_whole.webp', pp_green_diced:'assets/pp_green_diced.webp',
  pp_white_whole:'assets/pp_white_whole.webp', pp_white_diced:'assets/pp_white_diced.webp', pp_nori_plain:'assets/pp_nori_plain.webp', pp_nori_oiled:'assets/pp_nori_oiled.webp', pp_noodles_raw:'assets/pp_noodles_raw.webp',
};
const IMG = {};
Object.keys(ASSET_SRC).forEach(k=>{ const i=new Image(); i.onload=()=>{ BASE_CACHE.clear(); K.dirty=true; redrawShopBowl(); if(typeof HOME!=='undefined'&&HOME.built) HOME.seats.forEach(st=>drawRamen(st.cv,st.bowl)); }; i.src=ASSET_SRC[k]; IMG[k]=i; });
const ok = im => im && im.complete && im.naturalWidth;

/* =====================================================================
   3. ORDER SLIP DEFINITION
   pos = index of the circled option; x.5 = circle between two options;
   pos === opts.length = circle after the last option.
   ===================================================================== */
const SHEET = [
  {key:'dashi',  en:'Dashi',    opts:['Light','Medium','Heavy']},
  {key:'rich',   en:'Richness', opts:['None','Smooth','Normal','Rich','Extra Rich']},
  {key:'garlic', en:'Garlic',   opts:['None','Little','Less','Normal','1 clove','2 clove'], trail:true},
  {key:'spice',  en:'Spice',    opts:['0','1','2','3','4','5']},
  {key:'noodle', en:'Noodles',  opts:['Extra Firm','Firm','Normal','Soft','Extra Soft']},
  // ---- toppings (盛り付け) last ----
  {key:'onion',  en:'Onion',    opts:['Green Onion','White Onion','No onion']},
  {key:'chashu', en:'Chashu',   opts:['Yes','No']},
  {key:'nori',   en:'Seaweed',  opts:['Yes','No']},
  {key:'rice',   en:'Rice',     opts:['Yes','No']},
];
const GARLIC_STEPS=[0,1,2,3,4,4.5,5,6];                 // slip positions, in scoop order
const GARLIC_LIST=['None','Little','Less','Normal','1 clove','1.5 cloves','2 cloves','3 cloves']; // = scoops 0..7
const RICH_NAME=['None','Smooth','Normal','Rich','Extra Rich'];
const DASHI_NAME=['Light','Medium','Heavy'];
const FIRM_NAME=['Extra Firm','Firm','Normal','Soft','Extra Soft'];
const ONION_NAME={green:'Green Onion',white:'White Onion',both:'Green + White',none:'No onion'};

/* =====================================================================
   4. CUSTOMERS — sprites from Soso's Ice Cream Stand
   ===================================================================== */
const MOMO_LINE={S:'As calculated.',A:'Acceptable.',B:'…Room for improvement.',C:'…Recollecting data.'};
/* Momo's face when she turns round: 0–40 confused · 41–85 normal · 86–100 smug */
const MOMO_FACE=[ {max:40, img:'assets/momo_confused.webp', line:'…Wait. Where did that go wrong?'},
                  {max:85, img:'assets/momo_front.webp',    line:'Not bad. Next one.'},
                  {max:100,img:'assets/momo_smug.webp',     line:'Hmph. As calculated.'} ];
const faceFor = total => MOMO_FACE.find(f=>total<=f.max);
const CUST_IMG={soso:'assets/cu_soso.webp', kew:'assets/cu_kew.webp', rang:'assets/cu_rang.webp', bae:'assets/cu_bae.webp'};
/* angry Soso · upset Kew · confused Rang · worried Bae — a bowl under 40 points, or patience under 20% */
const CUST_UPSET={soso:'assets/cu_soso_upset.webp', kew:'assets/cu_kew_upset.webp', rang:'assets/cu_rang_upset.webp', bae:'assets/cu_bae_upset.webp'};
const UPSET_SCORE=40, UPSET_PATIENCE=20;
Object.values(CUST_UPSET).forEach(src=>{ new Image().src=src; });   // preload so the swap is instant
const CUST_H={soso:394, kew:408, rang:416, bae:457};
function custHTML(id, mood, upset){
  const fx = mood==='happy' ? '<img class="cfx" src="assets/ui_heart.webp" alt="" style="left:262px;top:-14px"><img class="cfx" src="assets/ui_heart.webp" alt="" style="left:14px;top:30px;width:60px;animation-delay:.25s">'
           : mood==='sad' ? '<img class="cfx" src="assets/ui_anger_mark.webp" alt="" style="left:258px;top:10px">' : '';
  return `<img class="csprite" src="${upset?CUST_UPSET[id]:CUST_IMG[id]}" data-upset="${upset?1:0}" alt="${CUSTOMERS[id].name}">${fx}`;
}
function placeCustomer(id){ const el=$('#cust'), h=CUST_H[id]; el.style.top=(752 - h*0.62)+'px'; el.style.height=h+'px'; }

/* =====================================================================
   5. GAME STATE
   ===================================================================== */
const G = { ticketNo:11, order:null, bowl:null, custQueue:[], firstOrder:true, result:null, scene:'shop', mode:'home', view:false, waiting:false, pat:100, patServe:100 };
function newBowl(){ return {
  tare:0, soup:0, fat:0, garlic:0, spice:0,              // scoops / shakes / fill ratio
  green:false, white:false, chashu:false, nori:false, rice:false,
  nood:{state:'none', start:0, time:null, water:1, flicks:0}, // none → boiling → lifted → bowl
  noodlesBeforeSoup:false, eaten:false }; }
G.bowl = newBowl();

const pick=a=>a[Math.floor(Math.random()*a.length)];
function genOrder(){
  if(G.firstOrder){ G.firstOrder=false; // = the reference sprite: medium · rich · 1 clove · green · chashu · spice 2 · firm · no rice · seaweed
    return {dashi:1,rich:3,garlic:4,onion:0,chashu:0,spice:2,noodle:1,rice:1,nori:0}; }
  const r=Math.random;
  return { dashi:pick([0,1,2]), rich:pick([0,1,2,2,3,4]),
    garlic: r()<.18 ? pick([4.5,6]) : pick([0,1,2,3,3,4,5]),
    onion: r()<.2 ? 0.5 : pick([0,0,1,2]), chashu:r()<.75?0:1, spice:pick([0,0,1,2,3,4,5]),
    noodle:pick([0,1,1,2,2,3,4]), rice:r()<.35?0:1, nori:r()<.7?0:1 };
}
function want(p){ return { dashi:p.dashi, rich:p.rich, garlic:GARLIC_STEPS.indexOf(p.garlic),
  onion:{0:'green',1:'white',2:'none',0.5:'both'}[p.onion], chashu:p.chashu===0, spice:p.spice,
  noodle:p.noodle, rice:p.rice===0, nori:p.nori===0 }; }
function orderText(key){ const w=want(G.order.pos);
  return {dashi:DASHI_NAME[w.dashi], rich:RICH_NAME[w.rich], garlic:GARLIC_LIST[w.garlic], onion:ONION_NAME[w.onion], chashu:w.chashu?'Yes':'No',
    spice:String(w.spice), noodle:FIRM_NAME[w.noodle], rice:w.rice?'Yes':'No', nori:w.nori?'Yes':'No'}[key]; }

/* =====================================================================
   6. ORDER SLIP RENDERER (red-pen circles + step highlighter)
   ===================================================================== */
function renderTicket(el, order, mini){
  el.classList.toggle('mini',!!mini);
  el.innerHTML = `<div class="tk-hd"><b>ORDER</b><span class="who">${CUSTOMERS[order.cust].name}</span><span class="tk-pat"><i style="width:${G.pat}%"></i></span><span class="no">No.${String(order.no).padStart(4,'0')}</span></div>`
    + `<div class="tk-hl" hidden></div>`
    + SHEET.map(s=>`<div class="tk-row" data-k="${s.key}"><div class="lb">${s.en}</div><div class="tk-opts ${s.trail?'trail':''}">${s.opts.map(o=>`<span>${o}</span>`).join('')}</div></div>`).join('')
    + `<div class="tk-now"></div><div class="tk-foot">circle between two = half / both · circle after the last = 3</div><svg class="tk-ink"></svg>`;
  el._order=order;
  requestAnimationFrame(()=>{ drawCircles(el, order); if(el.id==='kTicket') updateHighlight(); });
  // fonts arriving late (common on phones) or any re-layout move the words: redraw the circles when that happens
  if(!el._ro && window.ResizeObserver){ el._ro=new ResizeObserver(()=>{ if(el._order) drawCircles(el,el._order); }); el._ro.observe(el); el.querySelectorAll && 0; }
}
function redrawAllCircles(){ document.querySelectorAll('.ticket').forEach(t=>{ if(t._order){ drawCircles(t,t._order); if(t.id==='kTicket') updateHighlight(); } }); }
if(document.fonts){ document.fonts.ready.then(redrawAllCircles); document.fonts.addEventListener && document.fonts.addEventListener('loadingdone',()=>setTimeout(redrawAllCircles,30)); }
function handEllipse(cx,cy,rx,ry,seed){
  const rnd=mulberry(seed); const pts=[]; const n=14, start=rnd()*6.28;
  for(let i=0;i<=n+2;i++){ const a=start+i/n*6.28; const j=1+(rnd()-.5)*.12; pts.push([cx+Math.cos(a)*rx*j, cy+Math.sin(a)*ry*j]); }
  let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for(let i=1;i<pts.length;i++){ const p=pts[i-1],q=pts[i]; d+=` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0]+q[0])/2).toFixed(1)} ${((p[1]+q[1])/2).toFixed(1)}`; }
  return d;
}
function drawCircles(el, order){
  const svg=el.querySelector('.tk-ink'); if(!svg) return; const box=el.getBoundingClientRect(); if(!box.width) return;
  const sc=box.width/el.offsetWidth; let out='';   // sc ≠ 1 inside the scaled kitchen stage
  SHEET.forEach((s,ri)=>{
    const row=el.querySelector(`.tk-row[data-k="${s.key}"]`); const spans=[...row.querySelectorAll('.tk-opts span')];
    const pos=order.pos[s.key]; const r=i=>spans[i].getBoundingClientRect(); let cx,cy,rx,ry=8.5*sc;
    if(Number.isInteger(pos) && pos<spans.length){ const b=r(pos); cx=b.left+b.width/2; cy=b.top+b.height/2; rx=b.width/2+6*sc; }
    else if(pos>=spans.length){ const b=r(spans.length-1); cx=b.right+14*sc; cy=b.top+b.height/2; rx=9*sc; }
    else { const a=r(Math.floor(pos)), b=r(Math.ceil(pos)); cx=(a.right+b.left)/2; cy=a.top+a.height/2; rx=8*sc; }
    out+=`<path d="${handEllipse(cx-box.left, cy-box.top, rx, ry, order.no*31+ri)}" fill="none" stroke="#d2322d" stroke-width="${1.7*sc}" stroke-linecap="round" opacity=".9"/>`;
  });
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`); svg.innerHTML=out;
}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* =====================================================================
   7. RAMEN RENDERER — port of the pack's render.py (512x512 canvas)
   ===================================================================== */
const CX=256, CY=270, RX=208, RY=113;   // broth ellipse used by render.py
const SPICE_DOTS=[[359,336,4],[319,328,2],[343,328,2],[343,336,2],[342,336,2],[364,349,3],[334,331,4],[339,321,3],[321,332,4],[342,350,2],[359,348,3],[375,350,2],[320,327,4],[336,324,2],[383,331,3],[320,328,3],[344,332,2],[326,323,2],[330,329,2],[371,335,3],[363,329,2],[344,329,4],[345,325,4],[374,335,4],[359,328,2],[351,342,4],[321,321,2],[346,335,3],[382,346,4],[357,350,2],[352,347,2],[324,335,4],[377,327,2],[329,326,4],[374,328,3],[372,347,3],[357,332,4],[358,339,3],[381,320,3],[345,334,3],[382,341,3],[319,321,3],[372,322,3],[349,330,4],[337,349,3]];
const GARLIC_PORTION=[0,.18,.35,.6,1,1.5,2,3];
function firmIdx(t){ let best=0; CFG.FIRM_CENTERS.forEach((c,i)=>{ if(Math.abs(t-c)<Math.abs(t-CFG.FIRM_CENTERS[best])) best=i; }); return best; }
function firmLabel(t){ if(t<CFG.FIRM_CENTERS[0]-CFG.FIRM_TOL) return 'Raw'; if(t>CFG.FIRM_CENTERS[4]+CFG.FIRM_TOL) return 'Mushy'; return FIRM_NAME[firmIdx(t)]; }
/* the bowl as pack indices (also matches the pack's lookup.js / atlases) */
function packOrder(b){ return { dashi:Math.max(0,Math.min(2,b.tare-1)), richness:Math.min(4,b.fat), garlic:Math.min(7,b.garlic),
  onion: b.green&&b.white?3 : b.green?0 : b.white?1 : 2, chashu:b.chashu?1:0, spice:Math.min(5,b.spice),
  texture: b.nood.time==null?1:firmIdx(b.nood.time), seaweed:b.nori?1:0 }; }

const BASE_CACHE=new Map();
function baseBowl(d,r){
  const key=d+'-'+r; if(BASE_CACHE.has(key)) return BASE_CACHE.get(key);
  const cv=document.createElement('canvas'); cv.width=cv.height=512; const c=cv.getContext('2d');
  if(!ok(IMG.bowl)) return cv;
  c.drawImage(IMG.bowl,0,0,512,512);
  try{
    const im=c.getImageData(0,0,512,512), p=im.data, blend=.08+r*.065;
    const T=[238-d*14+r*2, 191-d*18+r*3, 105-d*11+r*10];
    for(let y=0;y<512;y++) for(let x=0;x<512;x++){
      const i=(y*512+x)*4, R=p[i],G_=p[i+1],B=p[i+2],A=p[i+3];
      if(((x-CX)/RX)**2+((y-CY)/RY)**2<1 && R>G_ && G_>B*1.25 && A>128){
        p[i]=R*(1-blend)+T[0]*blend; p[i+1]=G_*(1-blend)+T[1]*blend; p[i+2]=B*(1-blend)+T[2]*blend; } }
    c.putImageData(im,0,0);
  }catch(e){}
  BASE_CACHE.set(key,cv); return cv;
}
function placedImg(c,img,x,y,w,h,angle){   // render.py placed(): PIL angle (counter-clockwise), expanded box
  if(!angle){ c.drawImage(img,x,y,w,h); return; }
  const a=angle*Math.PI/180, ew=Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a)), eh=Math.abs(w*Math.sin(a))+Math.abs(h*Math.cos(a));
  c.save(); c.translate(x+ew/2,y+eh/2); c.rotate(-a); c.drawImage(img,-w/2,-h/2,w,h); c.restore(); }
function fatSpecks(c,b,cx,cy,rx,ry){
  if(!b.fat) return; const R=mulberry(11);
  for(let i=0;i<Math.min(5,b.fat)*16;i++){ const a=R()*6.28, r=Math.sqrt(R())*.92; const x=cx+Math.cos(a)*rx*r, y=cy+Math.sin(a)*ry*r;
    c.beginPath(); c.arc(x,y,1.6+R()*2.4,0,6.29); c.fillStyle='rgba(255,252,240,.92)'; c.fill(); c.lineWidth=.8; c.strokeStyle='rgba(170,120,60,.45)'; c.stroke(); }
}
function drawRamen(cv, b){
  const c=cv.getContext('2d'); c.clearRect(0,0,512,512); if(!ok(IMG.bowl)) return;
  const o=packOrder(b), soupLv=b.eaten?0.2:b.soup, nd=b.nood;
  const full = soupLv >= CFG.SOUP_TARGET-CFG.SOUP_TOL && !b.eaten && !(nd.state==='bowl' && nd.water>0.3);
  if(full){ c.drawImage(baseBowl(o.dashi,o.richness),0,0); c.save(); c.beginPath(); c.ellipse(CX,CY,RX,RY,0,0,6.29); c.clip(); fatSpecks(c,b,CX,CY,RX,RY); c.restore(); }
  else {
    c.drawImage(IMG.bowl,0,0,512,512);
    c.save(); c.beginPath(); c.ellipse(CX,CY,RX+3,RY+3,0,0,Math.PI*2);
    const g=c.createLinearGradient(0,CY-RY,0,CY+RY); g.addColorStop(0,'#e8d6ba'); g.addColorStop(.55,'#f8efdf'); g.addColorStop(1,'#fcf6ec');
    c.fillStyle=g; c.fill(); c.beginPath(); c.ellipse(CX,CY+30,100,40,0,0,Math.PI*2); c.fillStyle='rgba(205,180,140,.22)'; c.fill(); c.restore();
    if(b.tare>0 && soupLv<0.05){ const k=Math.sqrt(Math.min(b.tare,5)/2); c.beginPath(); c.ellipse(CX,CY+32,64*k,26*k,0,0,Math.PI*2); c.fillStyle='rgba(80,34,12,.9)'; c.fill();
      c.beginPath(); c.ellipse(CX-18*k,CY+25,18*k,5*k,0,0,Math.PI*2); c.fillStyle='rgba(255,255,255,.35)'; c.fill(); }
    if(soupLv>0.01){
      const L=Math.min(soupLv/CFG.SOUP_TARGET,1), k=.45+.55*L, sy=CY+(1-L)*50;
      c.save(); c.beginPath(); c.ellipse(CX,sy,RX*k,RY*k,0,0,Math.PI*2); c.clip();
      c.drawImage(baseBowl(o.dashi,o.richness),0,sy-CY);
      if(nd.state==='bowl' && nd.water>0.3){ c.globalAlpha=Math.min(.6,(nd.water-.3)*.7); c.fillStyle='#fbf6e8'; c.fillRect(0,0,512,512); c.globalAlpha=1; }
      fatSpecks(c,b,CX,sy,RX*k,RY*k); c.restore(); }
  }
  if(b.eaten){ for(const [x,y,r] of SPICE_DOTS.slice(0,b.spice*3)){ c.beginPath(); c.arc(x,y+10,r,0,6.29); c.fillStyle='rgba(186,60,15,.85)'; c.fill(); } return; }
  // layer order from render.py: seaweed → noodles → chashu → onion → garlic → spice
  if(b.nori){ placedImg(c,IMG.seaweed,318,111,86,165,-8); placedImg(c,IMG.seaweed,381,141,80,156,-17); }
  if(nd.state==='bowl'){ const t=o.texture; c.save();
    if(nd.time<CFG.FIRM_CENTERS[0]-CFG.FIRM_TOL) c.filter='saturate(.7) brightness(.96)';
    if(nd.time>CFG.FIRM_CENTERS[4]+CFG.FIRM_TOL) c.filter='saturate(.55) brightness(1.08)';
    c.drawImage(IMG.noodles,91,244-t*2,330,125+t*4); c.restore(); }
  if(b.chashu) for(const [x,y,w,h] of [[168,222,116,86],[127,250,118,88],[89,279,120,90]]) c.drawImage(IMG.chashu,x,y,w,h);
  if(o.onion===0||o.onion===3) c.drawImage(IMG.green_onion,244,266,89,61);
  if(o.onion===1||o.onion===3) c.drawImage(IMG.white_onion, o.onion===3?276:244, o.onion===3?288:266, 89,61);
  const v=GARLIC_PORTION[o.garlic]; if(v){ const w=Math.round(55*Math.sqrt(v)), h=Math.round(36*Math.sqrt(v)); c.drawImage(IMG.garlic,243-Math.floor(w/2),326-Math.floor(h/2),w,h); }
  SPICE_DOTS.slice(0,o.spice*9).forEach(([x,y,r],i)=>{ c.beginPath(); c.arc(x,y,r,0,6.29); c.fillStyle=`rgba(186,${40+i%35},15,.9)`; c.fill(); });
}
function redrawShopBowl(){ if(G.scene==='shop' && G.bowl) drawRamen($('#shopBowl'),G.bowl); }

/* =====================================================================
   8. SOUND — tiny synth blips (start after the first tap)
   ===================================================================== */
/* music + SFX files (embedded). Music: HTML audio routed through Web Audio so volume works on iPhone.
   SFX: decoded once into buffers for instant playback. Audio starts after the first tap (browser rule). */
const SND_SRC={ rush:'audio/rush.mp3', shop:'audio/shop.mp3', night:'audio/night.mp3',
  golden:'audio/golden.mp3', bad:'audio/bad.mp3', bowl:'audio/bowl.mp3', pay:'audio/pay.mp3', eod:'audio/eod.mp3',
  green:'audio/green.mp3', white:'audio/white.mp3', seaweed:'audio/seaweed.mp3', meat:'audio/meat.mp3' };
const SND={buf:{},music:{},master:null,scene:null,want:'title',muted:false};
try{ SND.muted=localStorage.getItem('momo-ramen-shop.muted')==='1'; }catch(e){}
function b64buf(uri){ const s=atob(uri.slice(uri.indexOf(',')+1)), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u.buffer; }
function loadBuf(src){ return src.startsWith('data:') ? Promise.resolve(b64buf(src)) : fetch(src).then(r=>r.arrayBuffer()); }
function audioInit(){
  try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){ return; }
  if(SND.master) return;
  SND.master=AC.createGain(); SND.master.gain.value=SND.muted?0:1; SND.master.connect(AC.destination);
  ['golden','bad','bowl','pay','eod','green','white','seaweed','meat'].forEach(k=>{ try{ loadBuf(SND_SRC[k]).then(ab=>AC.decodeAudioData(ab,b=>SND.buf[k]=b,()=>{})).catch(()=>{}); }catch(e){} });
  ['rush','shop','night'].forEach(k=>{ try{ const el=new Audio(SND_SRC[k]); el.loop=true; el.preload='auto'; const g=AC.createGain(); g.gain.value=0;
    AC.createMediaElementSource(el).connect(g).connect(SND.master); SND.music[k]={el,g}; }catch(e){} });
  music(SND.want,true);
}
function music(scene,force){
  SND.want=scene; if(!SND.master) return; if(scene===SND.scene && !force) return;
  const prev=SND.scene; SND.scene=scene;
  const set=(k,v,restart)=>{ const m=SND.music[k]; if(!m) return;
    if(v>0){ if(restart) m.el.currentTime=0; if(m.el.paused) m.el.play().catch(()=>{}); }
    m.g.gain.cancelScheduledValues(AC.currentTime); m.g.gain.setTargetAtTime(v,AC.currentTime,.35);
    if(v===0) setTimeout(()=>{ if(m.g.gain.value<.03 && !m.el.paused) m.el.pause(); },1800); };
  if(scene==='title'){ set('rush',VOL.titleMusic); set('shop',VOL.titleShop); set('night',0); }
  else if(scene==='day'){ set('rush',VOL.dayMusic,prev!=='day'); set('shop',0); set('night',0); }
  else if(scene==='night'){ set('rush',0); set('shop',0); set('night',VOL.nightMusic,prev!=='night'); }
}
function sfx(k,o={}){ const b=SND.buf[k]; if(!b||!SND.master) return null;
  const s=AC.createBufferSource(), g=AC.createGain(); s.buffer=b; s.loop=!!o.loop; s.playbackRate.value=o.rate||1; g.gain.value=(o.vol??1)*VOL.sfx;
  s.connect(g).connect(SND.master); s.start(0); return {s,g}; }
function sfxStop(h,fade=.15){ if(!h) return; try{ h.g.gain.setTargetAtTime(0,AC.currentTime,fade/3); h.s.stop(AC.currentTime+fade); }catch(e){} }
function setMuted(m){ SND.muted=m; try{ localStorage.setItem('momo-ramen-shop.muted',m?'1':'0'); }catch(e){} if(SND.master) SND.master.gain.setTargetAtTime(m?0:1,AC.currentTime,.05);
  const b=document.getElementById('btnMute'); if(b){ b.textContent=m?'♪̸':'♪'; b.setAttribute('aria-label',m?'Turn sound on':'Turn sound off'); b.classList.toggle('off',m); } }
document.addEventListener('pointerdown',audioInit,{capture:true});
document.addEventListener('visibilitychange',()=>{ if(!SND.master) return; Object.values(SND.music).forEach(m=>{ if(document.hidden) m.el.pause(); else if(m.g.gain.value>.03) m.el.play().catch(()=>{}); }); });
let AC=null; function blip(f=600,d=.07,type='triangle',v=.05){ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); const o=AC.createOscillator(),g=AC.createGain(); o.type=type; o.frequency.value=f; g.gain.value=v; g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d); o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime+d);}catch(e){} }

/* =====================================================================
   9. DRAWING HELPERS — same family as Soso's Ice Cream Stand art.js
   ===================================================================== */
const OUT='#5b3a2e', FONT='"Fredoka", ui-rounded, "Hiragino Maru Gothic ProN", system-ui, sans-serif', BRUSH='"Yuji Syuku","Hiragino Mincho ProN",serif';
function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function fs(c,fill,lw=3,stroke=OUT){ if(fill){c.fillStyle=fill;c.fill();} if(lw){c.lineWidth=lw;c.strokeStyle=stroke;c.lineJoin='round';c.lineCap='round';c.stroke();} }
function vg(c,y0,y1,a,b,m){ const g=c.createLinearGradient(0,y0,0,y1); g.addColorStop(0,a); if(m) g.addColorStop(.5,m); g.addColorStop(1,b); return g; }
function hg(c,x0,x1,a,b,m){ const g=c.createLinearGradient(x0,0,x1,0); g.addColorStop(0,a); if(m) g.addColorStop(.5,m); g.addColorStop(1,b); return g; }
function ell(c,x,y,rx,ry,fill,lw=0,stroke=OUT){ c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); fs(c,fill,lw,stroke); }
function shine(c,x,y,w,h,r,a=.55){ c.save(); c.globalAlpha=a; rr(c,x,y,w,h,r); c.fillStyle='#fff'; c.fill(); c.restore(); }
function shadow(c,x,y,rx,ry,a=.18){ c.save(); c.globalAlpha=a; ell(c,x,y,rx,ry,'#3a2013'); c.restore(); }
function txt(c,s,x,y,size,color=OUT,weight=600,align='center',outline=0,oc='#fff',font=FONT){
  c.font=`${weight} ${size}px ${font}`; c.textAlign=align; c.textBaseline='middle';
  if(outline){ c.lineWidth=outline; c.strokeStyle=oc; c.lineJoin='round'; c.strokeText(s,x,y); } c.fillStyle=color; c.fillText(s,x,y); }
const steel=(c,x0,x1)=>{ const g=c.createLinearGradient(x0,0,x1,0); g.addColorStop(0,'#9ca5ad'); g.addColorStop(.28,'#eef2f5'); g.addColorStop(.55,'#c8cfd5'); g.addColorStop(1,'#8f989f'); return g; };
function glow(c,x,y,w,h,r,t){ c.save(); c.globalAlpha=.45+.35*Math.sin(t*6); c.shadowColor='#fff6a8'; c.shadowBlur=16; rr(c,x-4,y-4,w+8,h+8,r+4); c.lineWidth=4; c.strokeStyle='#ffe96a'; c.stroke(); c.restore(); }
function stockBadge(c,x,y,n){ rr(c,x-17,y-10,34,20,10); fs(c,n>0?'#fffaf0':'#f6d2c9',2); txt(c,n===Infinity?'∞':'×'+n,x,y,n===Infinity?14:11,n>0?OUT:'#c0392b',700); }
function note(c,x,y,w,h,lines,title,rot=-.02){   // pinned paper card on the wall
  c.save(); c.translate(x+w/2,y+h/2); c.rotate(rot); c.translate(-w/2,-h/2);
  shadow(c,w/2+3,h+2,w*.45,4,.12); rr(c,0,0,w,h,6); fs(c,vg(c,0,h,'#fffdf4','#f4ead2'),2.5);
  ell(c,w/2,7,5,5,'#e8584a',2);
  txt(c,title,w/2,24,12,'#c0392b',700);
  lines.forEach((l,i)=>txt(c,l,w/2,42+i*16,11.5,OUT,600));
  c.restore(); }
function miniBowl(c,cx,by,w){ const h=w*.5; c.beginPath(); c.moveTo(cx-w/2,by-h); c.lineTo(cx+w/2,by-h); c.quadraticCurveTo(cx+w/2-4,by,cx+w*.18,by); c.lineTo(cx-w*.18,by); c.quadraticCurveTo(cx-w/2+4,by,cx-w/2,by-h); c.closePath();
  fs(c,vg(c,by-h,by,'#fffaf2','#efe2cf'),2.5); c.save(); c.clip(); c.fillStyle='#e0574a'; c.fillRect(cx-w/2,by-h*.55,w,h*.16); c.restore(); ell(c,cx,by-h,w/2,h*.16,'#f7efe2',2.5); }

/* =====================================================================
   10. SHOP ART — drawn once (900x1280): back layer + counter layer
   ===================================================================== */
function drawShopBack(){
  const c=$('#shopBack').getContext('2d'); c.clearRect(0,0,900,1280);
  // plaster wall
  c.fillStyle=vg(c,0,760,'#f6ead6','#e9d6b9'); c.fillRect(0,0,900,770);
  const R=mulberry(4); c.fillStyle='rgba(120,80,40,.05)'; for(let i=0;i<900;i++){ c.fillRect(R()*900,R()*770,2,2); }
  // shoji panels at the sides
  [[0,330,150,420],[750,330,150,420]].forEach(([x,y,w,h])=>{ rr(c,x+10,y,w-20,h,4); fs(c,'#fbf6ea',4,'#7a5232');
    c.strokeStyle='#9a6c45'; c.lineWidth=3; for(let gx=x+10+(w-20)/3; gx<x+w-12; gx+=(w-20)/3){ c.beginPath(); c.moveTo(gx,y); c.lineTo(gx,y+h); c.stroke(); }
    for(let gy=y+h/5; gy<y+h-4; gy+=h/5){ c.beginPath(); c.moveTo(x+10,gy); c.lineTo(x+w-10,gy); c.stroke(); } });
  // warm light pool
  const rg=c.createRadialGradient(450,520,40,450,520,520); rg.addColorStop(0,'rgba(255,228,170,.55)'); rg.addColorStop(1,'rgba(255,228,170,0)'); c.fillStyle=rg; c.fillRect(0,0,900,770);
  // menu rail + plaques
  rr(c,150,330,600,12,4); fs(c,vg(c,330,342,'#a8743f','#7a4f2a'),3);
  const MENU=[['Shoyu','¥980'],['Chashu','+250'],['Rice','¥150'],['Nori','+100'],['Garlic','free'],['Spicy','free']];
  MENU.forEach(([a,p],i)=>{ const x=176+i*94, y=346;
    c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(x+20,342); c.lineTo(x+20,y+4); c.moveTo(x+56,342); c.lineTo(x+56,y+4); c.stroke();
    shadow(c,x+40,y+108,32,4,.12); rr(c,x,y,78,100,6); fs(c,vg(c,y,y+100,'#f3d6a6','#ddb47a'),3);
    c.save(); c.globalAlpha=.18; c.strokeStyle='#7a4f2a'; c.lineWidth=1.5; for(let gy=y+12; gy<y+96; gy+=13){ c.beginPath(); c.moveTo(x+6,gy); c.quadraticCurveTo(x+39,gy+(i%2?4:-4),x+72,gy); c.stroke(); } c.restore();
    txt(c,a,x+39,y+38,19,'#3a2013',700); txt(c,p,x+39,y+70,16,'#b0302a',700); });
  // ceiling beam + noren
  c.fillStyle=vg(c,0,40,'#5a3a22','#3a2416'); c.fillRect(0,0,900,40);
  c.save(); c.globalAlpha=.25; c.strokeStyle='#22140b'; c.lineWidth=2; for(let y=8;y<40;y+=9){ c.beginPath(); c.moveTo(0,y); for(let x=0;x<900;x+=90) c.quadraticCurveTo(x+45,y+((x/90)%2?3:-3),x+90,y); c.stroke(); } c.restore();
  shadow(c,450,318,470,22,.18);
  for(let i=0;i<5;i++){ const x=8+i*178, w=172;
    c.beginPath(); c.moveTo(x,32); c.lineTo(x+w,32); c.lineTo(x+w,292); c.quadraticCurveTo(x+w*.75,300,x+w/2,296); c.quadraticCurveTo(x+w*.25,300,x,292); c.closePath();
    c.fillStyle=vg(c,32,300,'#55893f','#3b6a2c'); c.fill();
    c.save(); c.clip(); c.fillStyle=hg(c,x,x+w,'rgba(0,0,0,.16)','rgba(0,0,0,.14)','rgba(255,255,255,.07)'); c.fillRect(x,32,w,270);
      c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(x,32,w,26);
      const F=mulberry(20+i); c.fillStyle='rgba(255,255,255,.05)'; for(let k=0;k<260;k++) c.fillRect(x+F()*w,32+F()*270,1.5,4); c.restore();
    c.lineWidth=3; c.strokeStyle='#28461d'; c.stroke(); }
  // rod with brass caps
  rr(c,0,22,900,16,8); fs(c,vg(c,22,38,'#8a5a32','#5a3a1e'),3);
  [6,894].forEach(x=>ell(c,x,30,12,12,vg(c,18,42,'#f4d27a','#b9862e'),3));
  // noren lettering + peach crests (もも = peach)
  c.save(); c.shadowColor='rgba(0,0,0,.25)'; c.shadowOffsetY=3; ['も','も','屋'].forEach((ch,i)=>txt(c,ch,8+(i+1)*178+86,178,112,'#fffaf0',400,'center',0,'#fff',BRUSH)); c.restore();
  [8+86,8+4*178+86].forEach(x=>{ ell(c,x,170,40,40,null,4,'#fffaf0'); c.beginPath(); c.moveTo(x,140); c.bezierCurveTo(x+34,150,x+30,196,x,200); c.bezierCurveTo(x-30,196,x-34,150,x,140); fs(c,'rgba(255,250,240,.9)',0); c.beginPath(); c.moveTo(x,142); c.lineTo(x,198); c.lineWidth=3; c.strokeStyle='#3d6b30'; c.stroke(); });
  // paper lanterns
  [95,805].forEach(x=>{ const y=430;
    const gl=c.createRadialGradient(x,y,10,x,y,150); gl.addColorStop(0,'rgba(255,170,90,.45)'); gl.addColorStop(1,'rgba(255,170,90,0)'); c.fillStyle=gl; c.fillRect(x-160,y-160,320,320);
    c.strokeStyle=OUT; c.lineWidth=3; c.beginPath(); c.moveTo(x,300); c.lineTo(x,352); c.stroke();
    rr(c,x-28,350,56,16,4); fs(c,'#2b1a10',3);
    ell(c,x,y,58,74,null); const lg=c.createRadialGradient(x-14,y-18,8,x,y,80); lg.addColorStop(0,'#ff8c5a'); lg.addColorStop(.6,'#e5392b'); lg.addColorStop(1,'#a81e17'); c.fillStyle=lg; c.fill();
    c.save(); c.clip(); c.strokeStyle='rgba(90,20,10,.35)'; c.lineWidth=2; for(let k=-60;k<=60;k+=12){ c.beginPath(); c.ellipse(x,y+k,58,7,0,0,Math.PI); c.stroke(); } c.restore();
    ell(c,x,y,58,74,null,3); rr(c,x-28,y+68,56,16,4); fs(c,'#2b1a10',3);
    ['も','も','屋'].forEach((ch,k)=>txt(c,ch,x,y-36+k*36,32,'#2b1a10',400,'center',0,'#fff',BRUSH));
    shine(c,x-40,y-40,10,60,5,.25); });
}
/* Momo's side of the counter: near lip, open storage underneath, then the floor she walks on */
function drawUnderCounter(c){
  const LIP=1004, FACE=1030, KICK=1176, FLOOR=1188, BASE=KICK-12;
  // floor — warm wooden boards with a little perspective
  c.fillStyle=vg(c,FLOOR,1450,'#8a5a34','#a87446'); c.fillRect(0,FLOOR,900,1450-FLOOR);
  const ys=[FLOOR,1212,1244,1286,1340,1410,1450];
  c.strokeStyle='rgba(60,32,14,.35)'; c.lineWidth=2;
  ys.slice(1,-1).forEach(y=>{ c.beginPath(); c.moveTo(0,y); c.lineTo(900,y); c.stroke(); });
  const R=mulberry(31); for(let row=0;row<ys.length-1;row++){ const y0=ys[row], y1=ys[row+1];
    for(let x=(row%2)*90; x<900; x+=180+R()*40){ c.beginPath(); c.moveTo(x,y0); c.lineTo(x+(x-450)*.04*(row+1),y1); c.stroke(); } }
  c.save(); c.globalAlpha=.12; c.fillStyle='#fff'; c.beginPath(); c.moveTo(60,1450); c.lineTo(240,FLOOR); c.lineTo(330,FLOOR); c.lineTo(190,1450); c.fill(); c.restore();
  c.fillStyle=vg(c,FLOOR,FLOOR+40,'rgba(30,12,4,.45)','rgba(30,12,4,0)'); c.fillRect(0,FLOOR,900,40);
  // counter front: dark wood frame with three shallow open bays
  c.fillStyle=vg(c,FACE,KICK,'#5e3c22','#43291a'); c.fillRect(0,FACE,900,KICK-FACE);
  const bays=[[24,280],[316,268],[608,268]];
  bays.forEach(([x,w])=>{ rr(c,x,FACE+14,w,KICK-FACE-22,8); fs(c,vg(c,FACE,KICK,'#2c1a0f','#3a2416'),3,'#1e1209');
    c.fillStyle=vg(c,FACE+14,FACE+50,'rgba(0,0,0,.35)','rgba(0,0,0,0)'); c.fillRect(x+3,FACE+17,w-6,34); });
  [0,300,592,884].forEach(x=>{ c.fillStyle=hg(c,x,x+16,'#6b4628','#4a2e1c'); c.fillRect(x,FACE,16,KICK-FACE); });
  // ---- bay 1: stacks of bowls + a short crate of soda bottles
  for(let k=0;k<2;k++) for(let h=0;h<4;h++) miniBowl(c,70+k*78,BASE-h*18,70);
  const crate=(x,y,w,col,dark,cap,n)=>{ for(let k=0;k<n;k++){ const bx=x+18+k*(w-36)/(n-1); rr(c,bx-9,y-74,18,44,6); fs(c,'rgba(170,220,230,.85)',2,'#1e3a40'); rr(c,bx-5,y-86,10,14,3); fs(c,'rgba(170,220,230,.85)',2,'#1e3a40'); ell(c,bx,y-88,6,3,cap,1.5,'#1e1209'); }
    rr(c,x,y-50,w,50,6); fs(c,vg(c,y-50,y,col,dark),3,'#1e1209');
    for(let k=1;k<n;k++){ rr(c,x+k*w/n-10,y-40,20,12,5); fs(c,'rgba(0,0,0,.35)',0); } };
  crate(196,BASE,96,'#f2c14e','#c9962a','#e0463a',2);
  // ---- bay 2: noodle box + rice sack
  rr(c,330,BASE-80,130,80,6); fs(c,vg(c,BASE-80,BASE,'#d9a86c','#b07a43'),3,'#1e1209'); c.strokeStyle='rgba(60,32,14,.5)'; c.lineWidth=2; c.beginPath(); c.moveTo(330,BASE-60); c.lineTo(460,BASE-60); c.stroke();
  txt(c,'NOODLES',395,BASE-34,15,'#4a2412',700); txt(c,'fresh daily',395,BASE-16,10,'#6b4423',600);
  const sx=476; c.beginPath(); c.moveTo(sx,BASE); c.quadraticCurveTo(sx-10,BASE-58,sx+10,BASE-92); c.lineTo(sx+70,BASE-96); c.quadraticCurveTo(sx+94,BASE-58,sx+84,BASE); c.closePath(); fs(c,vg(c,BASE-96,BASE,'#f6efd9','#ddd0b2'),3,'#1e1209');
  rr(c,sx+8,BASE-100,60,12,5); fs(c,'#c9a56e',2,'#1e1209'); txt(c,'米',sx+42,BASE-50,26,'#b0302a',400,'center',0,'#fff',BRUSH); txt(c,'RICE',sx+42,BASE-22,10,'#6b4423',700);
  // ---- bay 3: juice cartons, soy bottle and the tare jug
  const carton=(x,y,col,lab)=>{ c.beginPath(); c.moveTo(x-22,y); c.lineTo(x-22,y-66); c.lineTo(x-12,y-84); c.lineTo(x+12,y-84); c.lineTo(x+22,y-66); c.lineTo(x+22,y); c.closePath(); fs(c,vg(c,y-84,y,'#fffaf0','#ece2cf'),2.5,'#1e1209');
    rr(c,x-18,y-58,36,34,4); fs(c,col,0); txt(c,lab,x,y-41,10,'#fff',700); c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(x+8,y-66,14,66); };
  carton(644,BASE,'#e8873a','ORANGE'); carton(694,BASE,'#6aa84f','OOLONG'); carton(744,BASE,'#c8553d','PEACH');
  rr(c,776,BASE-74,92,74,14); fs(c,vg(c,BASE-74,BASE,'#f4e3c4','#d9bd93'),3,'#1e1209'); rr(c,848,BASE-60,26,30,10); fs(c,null,4,'#1e1209'); rr(c,788,BASE-86,40,14,4); fs(c,'#7b4b2a',2.5,'#1e1209'); txt(c,'TARE',820,BASE-38,13,OUT,700);
  // kick plate + shadow cast by the lip
  c.fillStyle='#2a180d'; c.fillRect(0,KICK,900,FLOOR-KICK);
  c.fillStyle=vg(c,FACE,FACE+30,'rgba(0,0,0,.45)','rgba(0,0,0,0)'); c.fillRect(0,FACE,900,30);
  // near lip of the counter (wood), between the red top and the storage
  c.fillStyle=vg(c,LIP,FACE,'#e7c28f','#a8743f'); c.fillRect(0,LIP,900,FACE-LIP);
  c.strokeStyle='#24140a'; c.lineWidth=3; c.beginPath(); c.moveTo(0,LIP); c.lineTo(900,LIP); c.moveTo(0,FACE); c.lineTo(900,FACE); c.stroke();
  shine(c,0,LIP+3,900,4,2,.45);
}
function drawShopFront(){
  const c=$('#shopFront').getContext('2d'); c.clearRect(0,0,900,1450);
  drawUnderCounter(c);
  // far edge (wood rim) + red lacquer counter surface (ends at the near lip, y≈1004)
  c.fillStyle=vg(c,756,1004,'#951410','#640303','#7b0000'); c.fillRect(0,756,900,248);
  c.save(); c.globalAlpha=.10; c.fillStyle='#fff'; c.beginPath(); c.moveTo(0,820); c.lineTo(900,780); c.lineTo(900,830); c.lineTo(0,880); c.fill(); c.restore();
  [95,805].forEach(x=>{ const g=c.createRadialGradient(x,800,6,x,800,120); g.addColorStop(0,'rgba(255,150,90,.30)'); g.addColorStop(1,'rgba(255,150,90,0)'); c.fillStyle=g; c.fillRect(x-130,760,260,160); });
  c.fillStyle='rgba(245,200,110,.55)'; c.fillRect(0,770,900,2.5);
  rr(c,-10,738,920,22,6); fs(c,vg(c,738,760,'#f0cf9c','#c99a62'),3,'#4a2412');
  shine(c,10,741,880,4,2,.5);
  // chopstick holder (left)
  shadow(c,108,808,72,14,.35);
  [[-14,'#d9b27c'],[-4,'#c8945a'],[6,'#e3c08b'],[16,'#b98249'],[-22,'#ecd2a6']].forEach(([dx,col],k)=>{ c.save(); c.translate(108+dx,620); c.rotate((dx)*.012); rr(c,-4,-112-k*4,8,124,3); fs(c,col,2.5); c.restore(); });
  rr(c,52,612,112,192,16); fs(c,hg(c,52,164,'#e9645f','#c84540','#ff8f86'),3.5);
  ell(c,108,614,56,13,vg(c,600,628,'#ffb0a6','#e46a62'),3.5); ell(c,108,614,46,9,'#5a1e17',0);
  shine(c,64,630,10,150,5,.35);
  ell(c,108,710,26,26,'rgba(255,240,230,.85)',0); c.beginPath(); c.moveTo(108,690); c.bezierCurveTo(130,696,128,728,108,732); c.bezierCurveTo(88,728,86,696,108,690); fs(c,'#f6a49b',0);
  // soy sauce bottle
  shadow(c,200,804,26,7,.3);
  c.beginPath(); c.moveTo(186,800); c.lineTo(186,740); c.quadraticCurveTo(186,722,196,716); c.lineTo(196,700); c.lineTo(206,700); c.lineTo(206,716); c.quadraticCurveTo(216,722,216,740); c.lineTo(216,800); c.closePath(); fs(c,vg(c,700,800,'#6b3a1e','#2c140a'),3);
  rr(c,193,690,16,14,4); fs(c,'#e3483c',2.5); shine(c,190,744,4,48,2,.35);
  // black lacquer tray
  shadow(c,437,984,230,22,.45);
  rr(c,232,772,410,206,18); fs(c,vg(c,772,978,'#3a3532','#0f0d0c'),4,'#000');
  rr(c,250,788,374,174,12); fs(c,vg(c,788,962,'#1a1716','#262220'),2,'rgba(255,255,255,.08)');
  c.save(); c.globalAlpha=.16; c.fillStyle='#fff'; c.beginPath(); c.moveTo(270,792); c.lineTo(420,792); c.lineTo(330,958); c.lineTo(255,958); c.closePath(); c.fill(); c.restore();
  shine(c,246,776,380,4,2,.25);
  // water glass on a coaster
  ell(c,743,812,70,17,vg(c,795,829,'#f8eedc','#e2d0b2'),2.5); shadow(c,743,812,48,10,.25);
  c.beginPath(); c.moveTo(688,692); c.lineTo(798,692); c.lineTo(784,808); c.lineTo(702,808); c.closePath();
  c.fillStyle='rgba(255,255,255,.22)'; c.fill();
  c.save(); c.clip(); c.fillStyle='rgba(205,95,90,.55)'; c.fillRect(680,742,130,80);
    rr(c,712,736,34,30,7); fs(c,'rgba(255,255,255,.55)',2,'rgba(255,255,255,.8)'); rr(c,744,752,30,28,7); fs(c,'rgba(255,255,255,.45)',2,'rgba(255,255,255,.75)');
    c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(694,700,6,104); c.fillRect(776,700,4,100);
    const D=mulberry(9); c.fillStyle='rgba(255,255,255,.7)'; for(let k=0;k<26;k++){ c.beginPath(); c.arc(694+D()*96,700+D()*100,1+D()*1.6,0,6.29); c.fill(); } c.restore();
  ell(c,743,742,48,8,'rgba(255,255,255,.35)',2,'rgba(255,255,255,.7)');
  c.beginPath(); c.moveTo(688,692); c.lineTo(798,692); c.lineTo(784,808); c.lineTo(702,808); c.closePath(); c.lineWidth=4; c.strokeStyle='#2a1a12'; c.stroke();
  ell(c,743,692,55,9,'rgba(255,255,255,.3)',4,'#2a1a12');
}

/* =====================================================================
   11. KITCHEN
   11a. layout — every number is in stage units (400 x 820)
   ===================================================================== */
const KW=400, KH=820;
const STATIONS=[   // same order as the slip, top to bottom
  {name:'Dashi Tare',      rows:['dashi'],          hint:'Scoop tare into the bowl'},
  {name:'Soup & Richness', rows:['rich'],           hint:'Hold the tap to the line · shake back fat'},
  {name:'Garlic',          rows:['garlic'],         hint:'Scoop grated garlic'},
  {name:'Chili Oil',       rows:['spice'],          hint:'Scoop chili oil'},
  {name:'Noodles',         rows:['noodle'],         hint:'Drop a bundle · lift on time · flick to drain'},
  {name:'Onion & Chashu',  rows:['onion','chashu'], hint:'Toppings: drag into the bowl'},
  {name:'Seaweed & Rice',  rows:['nori','rice'],    hint:'Toppings: drag to the bowl'},
];
const NOODLE_STEP=4;
const OBJS=[   // tap/drag targets per step, in that step's own coordinates
  [ {id:'tare', kind:'scoop', box:[64,318,196,156], home:[176,394], col:'#4a1c08'} ],
  [ {id:'disp', kind:'pour',  box:[16,296,228,198]}, {id:'fat', kind:'fat', box:[272,356,122,118], home:[334,406]} ],
  [ {id:'garlic', kind:'scoop', box:[96,330,140,144], home:[166,392], col:'#f1dc9c'} ],
  [ {id:'chili', kind:'scoop', box:[136,322,130,152], home:[200,388], col:'#c8301a'} ],
  [ {id:'bundle', kind:'bundle', box:[10,362,160,112], home:[90,410]}, {id:'tebo', kind:'tebo', box:[222,292,132,150]} ],
  [ {id:'green', kind:'top', box:[20,372,112,100], home:[76,420]}, {id:'white',kind:'top',box:[144,372,112,100],home:[200,420]}, {id:'chashu',kind:'top',box:[268,372,114,100],home:[324,420]} ],
  [ {id:'nori', kind:'nori', box:[32,350,142,124], home:[102,400]}, {id:'rice', kind:'rice', box:[222,336,156,138], home:[300,388]} ],
];
const BOWL={x:105,y:412,s:190};                 // where the 512px ramen canvas sits
const BK=BOWL.s/512, BROTH={x:BOWL.x+CX*BK, y:BOWL.y+CY*BK};
const BOWL_HIT={x:100,y:436,w:200,h:166};
const POUR_AT={x:200,y:BROTH.y-36};             // where a tool hovers to pour
const BOILER={x:186,y:340,w:200,h:134}, TEBO_IN=[286,404], TEBO_UP=[286,338], TEBO_RACK=[352,372];
const K={ s:1, ox:0, oy:0, cam:0, camT:0, stn:0, hand:null, M:null, pour:false, parts:[], fx:[], hop:0, t:0, idle:0, dirty:true,
  pan:null, work:0, queue:0, lastTap:null, teboKick:0, remakeArm:0 };
const bowlCv=document.createElement('canvas'); bowlCv.width=bowlCv.height=512;
let tilePat=null;
function tilePattern(c){ if(tilePat) return tilePat; const t=document.createElement('canvas'); t.width=48; t.height=48; const x=t.getContext('2d');
  x.fillStyle='#f7f6f2'; x.fillRect(0,0,48,48); x.fillStyle='rgba(255,255,255,.7)'; x.fillRect(2,2,44,4); x.fillRect(26,26,20,4); x.fillRect(0,26,22,4);
  x.fillStyle='#d8d9d3'; x.fillRect(0,0,48,1.5); x.fillRect(0,24,48,1.5); x.fillRect(0,0,1.5,24); x.fillRect(24,24,1.5,24);
  return tilePat=c.createPattern(t,'repeat'); }

/* ---------------------------------------------------------------------
   11b. kitchen art — background, then one draw function per step
   --------------------------------------------------------------------- */
function drawKitchenBG(c,wx0,wx1){   // world coordinates (camera already applied)
  c.fillStyle=tilePattern(c); c.fillRect(wx0,0,wx1-wx0,470);
  c.fillStyle=vg(c,0,320,'rgba(70,50,30,.14)','rgba(70,50,30,0)'); c.fillRect(wx0,0,wx1-wx0,320);
  c.fillStyle=vg(c,430,470,'rgba(70,50,30,0)','rgba(70,50,30,.12)'); c.fillRect(wx0,430,wx1-wx0,40);
  // back counter
  c.fillStyle=vg(c,464,478,'#f7f9fa','#c9cfd5'); c.fillRect(wx0,464,wx1-wx0,14);
  c.fillStyle=vg(c,478,502,'#cfd5da','#a1a9b0'); c.fillRect(wx0,478,wx1-wx0,24);
  c.strokeStyle=OUT; c.lineWidth=3; c.beginPath(); c.moveTo(wx0,464); c.lineTo(wx1,464); c.moveTo(wx0,478); c.lineTo(wx1,478); c.stroke();
  c.lineWidth=1.5; c.strokeStyle='rgba(91,58,46,.4)'; for(let x=Math.floor(wx0/200)*200; x<wx1; x+=200){ c.beginPath(); c.moveTo(x,478); c.lineTo(x,502); c.stroke(); }
  // front worktop (the pass) — brushed steel with soft reflections
  c.fillStyle=vg(c,502,706,'#dfe4e8','#b9c1c7','#eef1f3'); c.fillRect(wx0,502,wx1-wx0,204);
  c.fillStyle=vg(c,502,520,'rgba(40,30,20,.22)','rgba(40,30,20,0)'); c.fillRect(wx0,502,wx1-wx0,18);
  c.save(); c.globalAlpha=.35; c.fillStyle='#fff'; for(let x=Math.floor(wx0/260)*260; x<wx1; x+=260){ c.beginPath(); c.moveTo(x+40,520); c.lineTo(x+90,520); c.lineTo(x+40,700); c.lineTo(x-10,700); c.closePath(); c.fill(); } c.restore();
  c.fillStyle=vg(c,706,724,'#f3f5f7','#8e979e'); c.fillRect(wx0,706,wx1-wx0,18);
  c.strokeStyle=OUT; c.lineWidth=3; c.beginPath(); c.moveTo(wx0,502); c.lineTo(wx1,502); c.moveTo(wx0,706); c.lineTo(wx1,706); c.moveTo(wx0,724); c.lineTo(wx1,724); c.stroke();
  c.fillStyle=vg(c,724,820,'#6c747b','#4a5056'); c.fillRect(wx0,724,wx1-wx0,96);
}
function drawShelf(c,i){   // upper wall decor, mostly behind the slip
  rr(c,14,196,372,14,5); fs(c,vg(c,196,210,'#d39d63','#a8743f'),3);
  [70,330].forEach(x=>{ c.beginPath(); c.moveTo(x,210); c.lineTo(x,230); c.lineTo(x+16,210); c.closePath(); fs(c,'#a8743f',2.5); });
  const R=mulberry(i*7+3);
  for(let k=0;k<3;k++){ const x=50+k*130+R()*30;
    const kind=(i+k)%3;
    if(kind===0){ miniBowl(c,x,196,52); miniBowl(c,x,184,52); miniBowl(c,x,172,52); }
    else if(kind===1){ rr(c,x-20,140,40,56,10); fs(c,vg(c,140,196,'#f4e3c4','#dcc19a'),3); rr(c,x-14,132,28,12,4); fs(c,'#7b4b2a',2.5); txt(c,['MISO','SALT','KOMBU'][(i+k)%3],x,170,9,OUT,700); }
    else { c.beginPath(); c.moveTo(x-10,196); c.lineTo(x-10,150); c.quadraticCurveTo(x-10,138,x-3,134); c.lineTo(x-3,120); c.lineTo(x+3,120); c.lineTo(x+3,134); c.quadraticCurveTo(x+10,138,x+10,150); c.lineTo(x+10,196); c.closePath(); fs(c,vg(c,120,196,'#7a3b1d','#3c1a0b'),2.5); rr(c,x-8,156,16,20,3); fs(c,'#f3e7d0',1.5); }
  }
}
function drawPlaque(c,i){
  c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(130,236); c.lineTo(140,248); c.moveTo(270,236); c.lineTo(260,248); c.stroke();
  shadow(c,200,296,110,5,.12); rr(c,70,246,260,46,9); fs(c,vg(c,246,292,'#f3d6a6','#d9ad72'),3);
  txt(c,`STEP ${i+1}/7 · ${STATIONS[i].name.toUpperCase()}`,200,262,14,'#3a2013',700);
  txt(c,STATIONS[i].hint,200,280,10.5,'#7a4f2a',600);
}
/* --- held tools (x,y = where the contents come out) --- */
function drawCupTool(c,x,y,ang,full,col,big){
  const r=big?17:11, len=big?64:44; c.save(); c.translate(x,y); c.rotate(ang||0);
  c.lineCap='round'; c.beginPath(); c.moveTo(r*.55,-3); c.lineTo(r*.55+len*.55,-len); c.strokeStyle=OUT; c.lineWidth=big?9:7.5; c.stroke(); c.strokeStyle=big?'#d5dbe0':'#f2ead9'; c.lineWidth=big?5:4; c.stroke();
  c.beginPath(); c.ellipse(0,0,r,r*.95,0,0,Math.PI); c.closePath(); fs(c,steel(c,-r,r),3);
  ell(c,0,0,r,r*.36,full?col:'#7d868e',2.5);
  if(full){ c.save(); c.globalAlpha=.4; ell(c,-r*.3,-r*.08,r*.35,r*.1,'#fff'); c.restore(); }
  c.restore(); }
function drawStrainer(c,x,y,ang,t){ c.save(); c.translate(x,y); c.rotate(ang||0);
  c.lineCap='round'; c.beginPath(); c.moveTo(20,-4); c.lineTo(58,-26); c.strokeStyle=OUT; c.lineWidth=8; c.stroke(); c.strokeStyle='#a0703f'; c.lineWidth=4.5; c.stroke();
  c.beginPath(); c.ellipse(0,0,22,20,0,0,Math.PI); c.closePath(); fs(c,'#f4f1ea',3);
  c.save(); c.clip(); c.strokeStyle='rgba(91,58,46,.45)'; c.lineWidth=1; for(let k=-24;k<24;k+=5){ c.beginPath(); c.moveTo(k,0); c.lineTo(k+14,22); c.moveTo(k,0); c.lineTo(k-14,22); c.stroke(); } c.restore();
  ell(c,0,0,22,7,'#fffaf0',3); const R=mulberry(5); for(let k=0;k<9;k++) ell(c,-14+R()*28,-2+R()*4,3+R()*2,2.4,'#fff',1,'rgba(150,110,60,.6)');
  c.restore(); }
function drawTebo(c,x,y,full,ang){ c.save(); c.translate(x,y); c.rotate(ang||0);
  c.lineCap='round'; c.beginPath(); c.moveTo(22,-20); c.lineTo(58,-74); c.strokeStyle=OUT; c.lineWidth=9; c.stroke(); c.strokeStyle='#9a6a3c'; c.lineWidth=5; c.stroke();
  c.beginPath(); c.moveTo(-28,-22); c.lineTo(28,-22); c.lineTo(22,18); c.quadraticCurveTo(0,30,-22,18); c.closePath(); fs(c,'#e9edf0',3);
  c.save(); c.clip(); c.strokeStyle='rgba(91,58,46,.5)'; c.lineWidth=1.1; for(let k=-40;k<40;k+=6){ c.beginPath(); c.moveTo(k,-24); c.lineTo(k+30,30); c.moveTo(k,-24); c.lineTo(k-30,30); c.stroke(); }
    if(full && ok(IMG.noodles)) c.drawImage(IMG.noodles,-30,-36,60,37); c.restore();
  ell(c,0,-22,28,6,null,3); c.restore(); }
function drawBundle(c,x,y,w=72){ if(!ok(IMG.noodles)) return; const h=w*IMG.noodles.height/IMG.noodles.width; c.drawImage(IMG.noodles,x-w/2,y-h/2,w,h);
  rr(c,x-7,y-h/2+2,14,h-4,3); fs(c,'#fffaf0',2); c.fillStyle='#d9483b'; c.fillRect(x-7,y-3,14,5); }
function drawSprite(c,im,x,y,w,ang){ if(!ok(im)) return; const h=w*im.height/im.width; c.save(); c.translate(x,y); c.rotate(ang||0); c.drawImage(im,-w/2,-h/2,w,h); c.restore(); }
function drawTool(c,t,x,y,ang,full){
  switch(t){
    case 'tare': return drawCupTool(c,x,y,ang,full,'#4a1c08',true);
    case 'garlic': return drawCupTool(c,x,y,ang,full,'#f1dc9c',false);
    case 'chili': return drawCupTool(c,x,y,ang,full,'#c8301a',false);
    case 'fat': return drawStrainer(c,x,y,ang);
    case 'bundle': return drawBundle(c,x,y);
    case 'tebo': return drawTebo(c,x,y,true,ang);
    case 'green': return drawSprite(c,IMG.green_onion,x,y,66,ang);
    case 'white': return drawSprite(c,IMG.white_onion,x,y,66,ang);
    case 'chashu': return drawSprite(c,IMG.chashu,x,y,74,ang);
    case 'nori': return drawSprite(c,IMG.seaweed,x,y,46,ang);
    case 'rice': return drawSprite(c,IMG.rice,x,y,86,ang);
  }
}
const toolBusy = id => (K.hand && K.hand.t===id) || (K.M && K.M.t===id);

/* --- one function per step; c is translated to the step's left edge --- */
const STATION_ART=[
  function tare(c,t){
    miniBowl(c,32,464,46); miniBowl(c,32,452,46); miniBowl(c,32,440,46);
    shadow(c,160,468,82,7);
    rr(c,86,380,148,86,14); fs(c,steel(c,86,234),3);
    rr(c,120,414,80,26,5); fs(c,'#fffaf0',2.5); txt(c,'TARE',160,428,13,'#3a2013',700);
    ell(c,160,382,76,15,steel(c,84,236),3); ell(c,160,384,66,11,vg(c,374,396,'#6a2c10','#2e1004'),2);
    c.save(); c.globalAlpha=.35; ell(c,140,381,24,3,'#fff'); c.restore();
    if(!toolBusy('tare')) drawCupTool(c,176,394,0,false,'',true);
    note(c,270,306,116,96,['Light · 1','Medium · 2','Heavy · 3'],'SCOOPS',.03);
  },
  function soup(c,t){
    const b=G.bowl;
    // dispenser
    shadow(c,82,468,66,6);
    rr(c,22,452,120,14,6); fs(c,vg(c,452,466,'#cfd5da','#949ca3'),3);
    rr(c,28,306,108,150,22); fs(c,steel(c,28,136),3);
    ell(c,82,308,54,10,vg(c,298,318,'#f7f9fa','#bfc6cc'),3);
    rr(c,106,330,16,104,7); fs(c,'rgba(255,255,255,.6)',2.5); rr(c,108,360,12,72,5); fs(c,vg(c,360,432,'#f1c063','#c98a2c'),0);
    rr(c,40,356,56,24,5); fs(c,'#fffaf0',2.5); txt(c,'STOCK',68,369,11.5,'#3a2013',700);
    shine(c,36,318,7,120,4,.45);
    rr(c,132,400,80,16,8); fs(c,steel(c,132,212),3);
    rr(c,190,404,20,40,6); fs(c,steel(c,190,210),3);
    c.beginPath(); c.moveTo(193,444); c.lineTo(207,444); c.lineTo(204,478); c.lineTo(196,478); c.closePath(); fs(c,'#b9c1c7',3);
    const la=K.pour?-1.05:-.45; c.save(); c.translate(200,404); c.rotate(la); rr(c,-4,-44,8,44,4); fs(c,'#5d646b',2.5); ell(c,0,-46,9,9,vg(c,-55,-37,'#ff7a6a','#c7392c'),3); c.restore();
    // back fat pot + strainer
    shadow(c,332,468,52,5);
    rr(c,288,424,90,42,10); fs(c,steel(c,288,378),3);
    ell(c,333,426,45,9,'#fffaf0',3); const R=mulberry(3); for(let k=0;k<12;k++) ell(c,300+R()*66,424+R()*4,3+R()*3,2.2,'#fff',1,'rgba(150,110,60,.5)');
    txt(c,'BACK FAT',333,447,10,'#3a2013',700);
    if(!toolBusy('fat')) drawStrainer(c,334,406,-.15);
    // richness card with live pips
    c.save(); c.translate(268,300); rr(c,0,0,118,72,6); fs(c,vg(c,0,72,'#fffdf4','#f4ead2'),2.5); ell(c,59,7,5,5,'#e8584a',2);
    txt(c,'SHAKES',59,22,11.5,'#c0392b',700); txt(c,'Smooth 1 · Normal 2',59,38,10,OUT,600); txt(c,'Rich 3 · Extra 4',59,52,10,OUT,600);
    for(let k=0;k<4;k++) ell(c,36+k*15,64,4.5,4.5,k<b.fat?'#f2c14e':'#efe5cf',1.5); c.restore();
  },
  function garlic(c,t){
    [[48,452],[76,458],[30,460]].forEach(([x,y],k)=>{ shadow(c,x,y+8,16,3,.12); c.beginPath(); c.moveTo(x,y-20); c.bezierCurveTo(x+22,y-12,x+20,y+8,x,y+8); c.bezierCurveTo(x-20,y+8,x-22,y-12,x,y-20); fs(c,vg(c,y-20,y+8,'#fffaf2','#eadfcc'),2.5);
      c.strokeStyle='rgba(150,120,90,.5)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x,y-18); c.lineTo(x,y+6); c.moveTo(x-8,y-12); c.quadraticCurveTo(x-10,y,x-6,y+6); c.moveTo(x+8,y-12); c.quadraticCurveTo(x+10,y,x+6,y+6); c.stroke(); });
    shadow(c,162,468,58,6);
    rr(c,112,384,100,82,24); fs(c,vg(c,384,466,'#fdf7ec','#e6d8c0'),3);
    c.fillStyle='#3d6aa8'; c.fillRect(114,428,96,6); c.fillRect(114,440,96,2.5);
    ell(c,162,388,44,10,'#fdf7ec',3); ell(c,162,389,37,7,vg(c,382,396,'#f6e6ad','#d9bf6f'),1.5);
    shine(c,120,396,7,52,4,.5);
    if(!toolBusy('garlic')) drawCupTool(c,166,392,0,false,'',false);
    note(c,240,302,148,150,['Little 1 · Less 2','Normal 3','1 clove 4','1.5 cloves 5','2 cloves 6','3 cloves 7'],'GARLIC SCOOPS',-.025);
  },
  function chili(c,t){
    c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(56,300); c.lineTo(56,446); c.stroke();
    for(let k=0;k<7;k++){ const y=316+k*19, d=k%2?1:-1; c.save(); c.translate(56,y); c.rotate(d*.9); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(24,-6,34,6); c.quadraticCurveTo(18,6,0,4); c.closePath(); fs(c,vg(c,-6,6,'#ef4a33','#a8200f'),2); rr(c,-4,-3,6,6,2); fs(c,'#4f7b2f',1.5); c.restore(); }
    shadow(c,200,468,58,6);
    rr(c,150,374,100,92,20); fs(c,'rgba(255,255,255,.28)',3);
    c.save(); rr(c,150,374,100,92,20); c.clip(); c.fillStyle=vg(c,392,466,'#e44d27','#9a1d0c'); c.fillRect(150,392,100,80);
      const R=mulberry(8); for(let k=0;k<40;k++){ c.fillStyle=R()<.5?'#6a0f06':'#f2a24a'; c.fillRect(156+R()*88,398+R()*64,2.5,2.5); } c.restore();
    rr(c,150,374,100,92,20); fs(c,null,3); shine(c,158,384,7,70,4,.55);
    ell(c,200,375,50,10,'rgba(255,255,255,.35)',3);
    rr(c,170,420,60,20,4); fs(c,'#fffaf0',2); txt(c,'LA-YU',200,430,10.5,'#a8200f',700);
    if(!toolBusy('chili')) drawCupTool(c,200,388,0,false,'',false);
    note(c,272,312,116,82,['1 scoop = 1 level','0 – 5'],'CHILI OIL',.03);
  },
  function noodles(c,t){
    const nd=G.bowl.nood;
    // range hood (visible when the slip is folded)
    c.beginPath(); c.moveTo(180,60); c.lineTo(392,60); c.lineTo(400,150); c.lineTo(172,150); c.closePath(); fs(c,steel(c,172,400),3);
    // firmness gauge
    const gx=30,gw=340, span=CFG.BOIL_MAX; rr(c,gx,302,gw,16,8); fs(c,'#f2ead9',2.5);
    CFG.FIRM_CENTERS.forEach((cc,i)=>{ const l=gx+(cc-CFG.FIRM_TOL)/span*gw, w=CFG.FIRM_TOL*2/span*gw;
      c.fillStyle=`hsl(${48-i*7},${78-i*8}%,${66+i*5}%)`; c.fillRect(l,303.5,w,13);
      txt(c,['X-Firm','Firm','Normal','Soft','X-Soft'][i],gx+cc/span*gw,327,9,OUT,700); });
    rr(c,gx,302,gw,16,8); fs(c,null,2.5);
    const tt = nd.state==='boiling' ? boilT(nd) : nd.time;
    if(tt!=null){ const nx=gx+Math.min(1,tt/span)*gw; rr(c,nx-2.5,296,5,28,2); fs(c,'#d2322d',1.5,'#fff'); txt(c,tt.toFixed(1)+'s',nx,288,10,'#d2322d',700,'center',3); }
    // noodle box with paper-wrapped bundles
    shadow(c,90,470,76,6);
    for(let k=0;k<Math.min(4,stockOf('noodle'));k++) drawBundle(c,44+k*30,402+(k%2)*4,58);
    rr(c,16,404,148,62,8); fs(c,vg(c,404,466,'#d9a86c','#b07a43'),3);
    c.save(); c.globalAlpha=.2; c.strokeStyle='#6a4020'; c.lineWidth=1.5; for(let y=414;y<462;y+=10){ c.beginPath(); c.moveTo(20,y); c.quadraticCurveTo(90,y+3,160,y); c.stroke(); } c.restore();
    txt(c,'NOODLES',90,436,14,'#4a2412',700); stockBadge(c,146,452,stockOf('noodle'));
    // boiler
    shadow(c,286,470,104,6);
    rr(c,188,384,196,82,12); fs(c,steel(c,188,384),3);
    ell(c,286,388,90,12,vg(c,376,400,'#cfe9f1','#9fcbd9'),3);
    const boiling = nd.state==='boiling';
    for(let k=0;k<(boiling?10:5);k++){ const ph=(t*1.6+k*.37)%1; ell(c,206+((k*53)%160),388-ph*3,2+ph*3,1.2+ph*2,'rgba(255,255,255,.75)',0); }
    rr(c,206,420,60,22,4); fs(c,'#fffaf0',2); txt(c,'BOILER',236,431,10.5,'#3a2013',700);
    // steam
    c.save(); for(let k=0;k<4;k++){ const ph=(t*.5+k*.25)%1; c.globalAlpha=(1-ph)*.45; ell(c,220+k*44+Math.sin(t+k)*6,370-ph*80,14+ph*16,10+ph*12,'#fff'); } c.restore();
    // tebo
    if(!toolBusy('tebo')){
      if(boiling){ const wob=Math.sin(t*14)*1.5; drawTebo(c,TEBO_IN[0]+wob,TEBO_IN[1],true,0); c.save(); c.beginPath(); c.ellipse(286,392,90,10,0,0,Math.PI); c.rect(196,392,180,30); c.restore(); ell(c,286,386,30,5,'rgba(190,225,235,.85)',0); }
      else if(nd.state==='lifted'){ const kick=K.teboKick*10; drawTebo(c,TEBO_UP[0],TEBO_UP[1]+kick,true,0);
        if(Math.random()<.25+nd.water*.6) K.parts.push({x:K.px0+TEBO_UP[0]-16+Math.random()*32,y:TEBO_UP[1]+22,vx:0,vy:40,r:2.5,col:'#9fd3e6',life:.6,g:900,stopY:388});
        rr(c,326,340,62,30,8); fs(c,'#fffaf0',2.5); txt(c,'Water',357,349,9,OUT,600); txt(c,Math.round(nd.water*100)+'%',357,362,12,nd.water<=CFG.WATER_OK?'#3e8e3a':'#d2322d',700); }
      else drawTebo(c,TEBO_RACK[0],TEBO_RACK[1],false,.12);
    }
  },
  function toppings(c,t){
    const b=G.bowl;
    rr(c,12,450,376,16,6); fs(c,vg(c,450,466,'#e8c18c','#c99a62'),3);
    [['green',76,'Green',IMG.green_onion,80],['white',200,'White',IMG.white_onion,80],['chashu',324,'Chashu',IMG.chashu,74]].forEach(([id,x,label,im,w])=>{
      shadow(c,x,452,54,5,.15);
      rr(c,x-52,410,104,42,8); fs(c,steel(c,x-52,x+52),3);
      rr(c,x-46,410,92,10,4); fs(c,'rgba(60,40,30,.25)',0);
      if(stockOf(id)>0){ if(id==='chashu'){ if(ok(im)){ drawSprite(c,im,x-14,408,62,-.2); drawSprite(c,im,x+2,404,62,0); drawSprite(c,im,x+18,410,62,.2); } }
      else { drawSprite(c,im,x-8,404,w,0); drawSprite(c,im,x+12,408,w*.9,0); } } else txt(c,'empty',x,422,11,'#a0938a',700);
      stockBadge(c,x-34,402,stockOf(id));
      rr(c,x-30,434,60,15,4); fs(c,'#fffaf0',2); txt(c,label,x,442,10,'#3a2013',700);
      if(b[id]){ ell(c,x+44,404,11,11,'#3e8e3a',2.5); c.strokeStyle='#fff'; c.lineWidth=3; c.beginPath(); c.moveTo(x+39,404); c.lineTo(x+43,408); c.lineTo(x+50,399); c.stroke(); }
    });
  },
  function sides(c,t){
    const b=G.bowl;
    // rice cooker (right)
    c.save(); c.translate(200,0);
    shadow(c,100,470,74,6);
    rr(c,30,384,140,82,32); fs(c,vg(c,384,466,'#fff6ea','#efd6bf'),3);
    c.beginPath(); c.ellipse(100,390,70,28,0,Math.PI,0); c.closePath(); fs(c,vg(c,362,392,'#ffd3d6','#f3a7ae'),3);
    rr(c,86,356,28,10,5); fs(c,'#e6838e',2.5);
    rr(c,66,418,68,26,8); fs(c,'#5f7c7a',2.5); txt(c,'RICE',100,431,12,'#e9fff5',700);
    shine(c,42,398,8,48,4,.5);
    c.save(); for(let k=0;k<2;k++){ const ph=(t*.6+k*.5)%1; c.globalAlpha=(1-ph)*.5; ell(c,100+Math.sin(t*2+k)*5,350-ph*50,8+ph*8,6+ph*6,'#fff'); } c.restore();
    if(b.rice){ ell(c,160,382,11,11,'#3e8e3a',2.5); c.strokeStyle='#fff'; c.lineWidth=3; c.beginPath(); c.moveTo(155,382); c.lineTo(159,386); c.lineTo(166,377); c.stroke(); }
    c.restore();
    // nori tin (left)
    c.save(); c.translate(-210,0);
    shadow(c,312,470,66,6);
    if(!toolBusy('nori') && stockOf('nori')>0){ drawSprite(c,IMG.seaweed,292,392,40,-.18); drawSprite(c,IMG.seaweed,316,388,40,.05); drawSprite(c,IMG.seaweed,338,394,40,.22); }
    rr(c,252,414,122,52,10); fs(c,vg(c,414,466,'#3f6a4a','#284a33'),3);
    rr(c,272,426,82,24,5); fs(c,'#f6efd9',2); txt(c,'NORI',313,438,12,'#284a33',700); stockBadge(c,262,410,stockOf('nori'));
    if(b.nori){ ell(c,372,410,11,11,'#3e8e3a',2.5); c.strokeStyle='#fff'; c.lineWidth=3; c.beginPath(); c.moveTo(367,410); c.lineTo(371,414); c.lineTo(378,405); c.stroke(); }
    c.restore();
  },
];

/* ---------------------------------------------------------------------
   11c. Momo (seen from behind) — hops while she works, hands stay close
   --------------------------------------------------------------------- */
const MOMO_W=314;                                   // 20% bigger than v2
const ARM={ px:[.19,.95], py:.42, rest:40, swing:70 }; // shoulder pivots (fraction of sprite), angles in degrees
function momoPose(){
  const im=IMG.momo_body, H=ok(im)? MOMO_W*im.height/im.width : 339;
  const hopK = K.hop>0 ? Math.abs(Math.sin((1-K.hop/0.6)*Math.PI*2))*18*(K.hop/0.6) : 0;
  const bob = Math.abs(Math.sin(K.t*4.4))*6;                       // little steps on the spot
  const top = 542 - bob - hopK, sq = 1 + Math.cos(K.t*8.8)*0.015;
  return {top,H,sq, left:200-0.57*MOMO_W};
}
function drawMomo(c,dt){
  const im=IMG.momo_body; if(!ok(im)) return; const P=momoPose();
  // arms: on her torso when idle (like the home screen); lifted up and swinging 70° while a task is going on
  const working = !!(K.hand || K.M || K.pour);
  K.work += ((working?1:0)-K.work)*Math.min(1,dt*8);
  drawArmsBack(c,P.left,P.top,MOMO_W,P.H,K.work,K.t);
  c.save(); c.translate(200,P.top+P.H); c.scale(1/P.sq,P.sq); c.drawImage(im,P.left-200,-P.H,MOMO_W,P.H); c.restore();
}

function drawArmsBack(c,left,top,w,H,work,t){
  const raised=work>.25, A=raised?ARM:ARM_TORSO, hw=w*(A.size||.19);
  const deg = raised ? ARM.rest+ARM.swing*(0.5-0.5*Math.cos(t*10)) : 26+Math.sin(t*3)*5;
  [[IMG.momo_handL,0,1],[IMG.momo_handR,1,-1]].forEach(([h,i,side])=>{ if(!ok(h)) return; const hh=hw*h.height/h.width;
    c.save(); c.translate(left+A.px[i]*w, top+A.py*H); c.rotate(side*deg*Math.PI/180); c.drawImage(h,-hw/2,hh*.15,hw,hh); c.restore(); });
}
/* ---------------------------------------------------------------------
   11d. input — tap or drag tools onto the bowl, swipe empty space to move
   --------------------------------------------------------------------- */
const kc=document.getElementById('kCanvas'), kx=kc.getContext('2d');
function toStage(e){ const r=kc.getBoundingClientRect(); return {x:(e.clientX-r.left)*KW/r.width, y:(e.clientY-r.top)*KH/r.height}; }
const inBox=(p,b)=>p.x>=b[0]&&p.x<=b[0]+b[2]&&p.y>=b[1]&&p.y<=b[1]+b[3];
const overBowl=p=>p.x>=BOWL_HIT.x&&p.x<=BOWL_HIT.x+BOWL_HIT.w&&p.y>=BOWL_HIT.y&&p.y<=BOWL_HIT.y+BOWL_HIT.h;
const overBoiler=p=>{ const q={x:p.x-K.px0,y:p.y}; return q.x>=BOILER.x&&q.x<=BOILER.x+BOILER.w&&q.y>=BOILER.y&&q.y<=BOILER.y+BOILER.h; };
function settled(){ return Math.abs(K.cam-K.stn*KW)<6 && !K.pan; }
function hitObject(p){
  if(!settled()) return null; const q={x:p.x-K.px0,y:p.y}, nd=G.bowl.nood;
  if(K.stn===NOODLE_STEP && nd.state==='lifted' && overBowl(p)) return {kind:'bowlTebo'};
  for(const o of OBJS[K.stn]){ if(o.kind==='tebo' && !(nd.state==='boiling'||nd.state==='lifted')) continue; if(inBox(q,o.box)) return o; }
  return null;
}
function homeOf(o){ return {x:K.px0+(o.home?o.home[0]:0), y:o.home?o.home[1]:0}; }
kc.addEventListener('pointerdown',e=>{
  const p=toStage(e); K.idle=0; kc.setPointerCapture(e.pointerId);
  if(K.M){ const o=hitObject(p); if(o && K.M.src && o.id===K.M.src && K.queue<5) K.queue++; return; }
  const o=hitObject(p);
  if(!o){ K.pan={x0:p.x,cam0:K.cam,lastX:p.x,lastT:performance.now(),v:0,moved:false,momo:p.y>596&&p.x>64&&p.x<336}; return; }
  const b=G.bowl, nd=b.nood;
  if(o.kind==='pour'){ K.pour=true; K.dirty=true; return; }
  if(o.kind==='bowlTebo'){ K.M={t:'tebo',x:K.px0+TEBO_UP[0],y:TEBO_UP[1],from:{x:K.px0+TEBO_UP[0],y:TEBO_UP[1]},to:POUR_AT,stage:'go',T:0,apply:teboToBowl,keep:false}; return; }
  if(o.kind==='bundle' && nd.state!=='none'){ toast(nd.state==='bowl'?'The noodles are already in the bowl':'One bundle per bowl'); return; }
  if(o.kind==='tebo' && nd.state==='boiling'){ nd.state='lifted'; nd.time=boilT(nd); nd.water=1; blip(880,.12); floatTxt(firmLabel(nd.time)+' · '+nd.time.toFixed(1)+'s',K.px0+250,372); }
  const SK={green:'green',white:'white',chashu:'chashu',nori:'nori',bundle:'noodle'}[o.id];
  if(SK && stockOf(SK)<=0 && !(o.kind!=='bundle' && b[o.id])){ toast(`Out of ${MARKET[SK].name.toLowerCase()}!<br><small>Buy more at night</small>`); return; }
  const home = o.kind==='tebo' ? {x:K.px0+TEBO_UP[0],y:TEBO_UP[1]} : homeOf(o);
  K.hand={t:o.kind==='tebo'?'tebo':(o.kind==='scoop'?o.id:(o.kind==='fat'?'fat':(o.kind==='bundle'?'bundle':o.id))), kind:o.kind, o, home, x:home.x, y:home.y, sx:p.x, sy:p.y, gx:p.x-home.x, gy:p.y-home.y,
    moved:false, full:o.kind==='scoop', lastX:p.x, lastY:p.y, dir:0, travel:0, down:0};
  if(o.kind==='scoop') blip(320,.1,'triangle',.1); else blip(520,.05);
});
kc.addEventListener('pointermove',e=>{
  const p=toStage(e);
  if(K.pan){ const dx=p.x-K.pan.x0; if(Math.abs(dx)>6) K.pan.moved=true; let cam=K.pan.cam0-dx; if(cam<0) cam*=.35; if(cam>6*KW) cam=6*KW+(cam-6*KW)*.35; K.cam=cam;
    const now=performance.now(), dtt=Math.max(1,now-K.pan.lastT); K.pan.v=(p.x-K.pan.lastX)/dtt; K.pan.lastX=p.x; K.pan.lastT=now; return; }
  const h=K.hand; if(!h) return;
  if(Math.hypot(p.x-h.sx,p.y-h.sy)>8) h.moved=true;
  if(h.moved){ h.x=p.x-h.gx*.4; h.y=p.y-h.gy*.4-10; }
  if(h.t==='fat') fatShake(h,p);
  if(h.t==='tebo'){ const dy=p.y-h.lastY; if(dy>0) h.down+=dy; else if(dy<-2 && h.down>26){ flick(); h.down=0; } }
  h.lastX=p.x; h.lastY=p.y;
});
function endPointer(e){
  if(K.pour){ K.pour=false; return; }
  if(K.pan){ const moved=K.pan.moved, v=K.pan.v, dx=K.cam-K.pan.cam0, from=Math.round(K.pan.cam0/KW), momo=K.pan.momo; K.pan=null;
    if(!moved && momo){ K.cam=K.camT; K.hop=.6; serve(); return; }
    let target = (dx>60||v<-.45) ? from+1 : (dx<-60||v>.45) ? from-1 : from; goStation(target); if(!moved) K.idle=3; return; }
  const h=K.hand; if(!h) return; K.hand=null; const b=G.bowl;
  const p={x:h.x,y:h.y};
  if(!h.moved){   // tap = Momo does the whole motion for you
    if(h.kind==='top'||h.kind==='rice'||h.kind==='nori'){ const id=h.t; if(b[id]){ b[id]=false; giveStock(id); K.dirty=true; floatTxt('Removed',BROTH.x,BROTH.y-60); blip(300); return; } }
    if(h.kind==='tebo'){ flick(); return; }
    autoAct(h); return;
  }
  if(h.kind==='bundle'){ if(overBoiler(p)){ K.M={t:'bundle',x:p.x,y:p.y,from:p,to:{x:K.px0+TEBO_IN[0],y:TEBO_IN[1]-20},stage:'go',T:0,apply:dropBundle,keep:false}; } else K.M={t:'bundle',x:p.x,y:p.y,from:p,to:h.home,stage:'back',T:0,keep:false}; return; }
  if(h.kind==='tebo'){ if(overBowl(p)) K.M={t:'tebo',x:p.x,y:p.y,from:p,to:p,stage:'act',T:0,apply:teboToBowl,keep:false}; return; }
  if(h.kind==='fat'){ K.M={t:'fat',x:p.x,y:p.y,from:p,to:h.home,stage:'back',T:0,keep:true}; return; }
  if(overBowl({x:p.x,y:p.y+24})) K.M={t:h.t,x:p.x,y:p.y,from:p,to:p,stage:'act',T:0,apply:applyFor(h),keep:keepsTool(h),home:h.home,full:h.full};
  else K.M={t:h.t,x:p.x,y:p.y,from:p,to:h.home,stage:'back',T:0,keep:true,home:h.home};
}
kc.addEventListener('pointerup',endPointer); kc.addEventListener('pointercancel',endPointer);
const keepsTool=h=>h.kind==='scoop'||h.kind==='fat';
function autoAct(h){   // Momo carries the tool to the bowl (or the bundle to the boiler) by herself
  if(h.kind==='bundle'){ K.M={t:'bundle',x:h.home.x,y:h.home.y,from:h.home,to:{x:K.px0+TEBO_IN[0],y:TEBO_IN[1]-20},stage:'go',T:0,apply:dropBundle,keep:false}; return; }
  K.M={t:h.t,x:h.home.x,y:h.home.y,from:h.home,to:POUR_AT,stage:'go',T:0,apply:applyFor(h),keep:keepsTool(h),home:h.home,full:h.full,src:h.o.id};
  K.lastTap={t:h.t,kind:h.kind,o:h.o,home:h.home,full:h.full};
}

/* ---------------------------------------------------------------------
   11e. what each action does to the bowl
   --------------------------------------------------------------------- */
function applyFor(h){
  const b=G.bowl;
  if(h.kind==='scoop') return ()=>{
    const cap={tare:6,garlic:7,chili:5}[h.t], key={tare:'tare',garlic:'garlic',chili:'spice'}[h.t];
    if(b[key]>=cap){ toast('That is as much as the bowl can take'); return; }
    b[key]++; spray(h.t); blip(260+b[key]*40,.09,'sine');
    floatTxt(h.t==='tare'? `Tare × ${b.tare}` : h.t==='garlic'? `Garlic: ${GARLIC_LIST[b.garlic]}` : `Chili × ${b.spice}`, BROTH.x+70, BROTH.y-70);
  };
  if(h.kind==='fat') return ()=>shakeFat(POUR_AT.x,POUR_AT.y);
  return ()=>{ const id=h.t; if(b[id]){ toast('Already in the bowl'); return; } b[id]=true; takeStock(id); blip(760,.08);
    floatTxt({green:'Green onion',white:'White onion',chashu:'Chashu',nori:'Seaweed',rice:'Rice'}[id], BROTH.x+70, BROTH.y-70); };
}
/* back-fat shake: once over the bowl, every change of direction after a stroke of ≥ 20 units = one shake */
const FAT_STROKE=20, FAT_GAP=90;
function fatShake(h,p){
  const near = p.x>BOWL_HIT.x-50 && p.x<BOWL_HIT.x+BOWL_HIT.w+50 && h.y>BOWL_HIT.y-110 && h.y<BOWL_HIT.y+BOWL_HIT.h;
  if(!near){ h.ext=null; h.dir=0; return; }
  if(h.ext==null){ h.ext=p.x; h.dir=0; return; }
  const now=performance.now(), ready=!h.lastShake || now-h.lastShake>FAT_GAP;
  if(h.dir===0){ if(p.x!==h.ext){ h.dir=Math.sign(p.x-h.ext); h.ext=p.x; } return; }   // arriving over the bowl only sets the direction
  if((h.dir>0 && p.x>h.ext) || (h.dir<0 && p.x<h.ext)) h.ext=p.x;            // still going the same way: remember the far point
  else if(Math.abs(p.x-h.ext)>=FAT_STROKE && ready){ h.dir=-h.dir; h.ext=p.x; h.lastShake=now; shakeFat(h.x,h.y); }
}
function shakeFat(x,y){ const b=G.bowl; if(b.fat>=4){ floatTxt('Max richness',BROTH.x+70,BROTH.y-70); return; }
  b.fat++; K.dirty=true; blip(700,.05,'square',.04); for(let k=0;k<12;k++) K.parts.push({x:x-14+Math.random()*28,y:y+8,vx:(Math.random()-.5)*40,vy:20+Math.random()*40,r:2+Math.random()*2,col:'#fffaf0',life:.9,g:700,stopY:BROTH.y+Math.random()*20});
  floatTxt(RICH_NAME[b.fat],BROTH.x+70,BROTH.y-70); }
function flick(){ const nd=G.bowl.nood; if(nd.state!=='lifted') return; nd.flicks++; nd.water = UP.oneFlick() ? Math.min(nd.water,.04) : nd.water*CFG.FLICK_KEEP*UP.flick(); K.teboKick=1; blip(240+nd.flicks*40,.08,'sine');
  for(let k=0;k<8;k++) K.parts.push({x:K.px0+TEBO_UP[0]-20+Math.random()*40,y:TEBO_UP[1]+20,vx:(Math.random()-.5)*120,vy:60+Math.random()*80,r:2.5+Math.random()*1.5,col:'#9fd3e6',life:.7,g:900,stopY:390});
  if(nd.water<=CFG.WATER_OK && nd.flicks>=1) floatTxt('Nicely drained!',K.px0+250,372); }
function dropBundle(){ const nd=G.bowl.nood; takeStock('noodle'); nd.state='boiling'; nd.start=performance.now(); nd.time=null; blip(300,.2,'sine');
  for(let k=0;k<10;k++) K.parts.push({x:K.px0+286-30+Math.random()*60,y:388,vx:(Math.random()-.5)*80,vy:-80-Math.random()*60,r:2.5,col:'#cfe9f1',life:.5,g:600,stopY:400}); }
function teboToBowl(){ const b=G.bowl, nd=b.nood; nd.state='bowl'; K.dirty=true; if(b.soup<0.05){ b.noodlesBeforeSoup=true; toast('Noodles went in before the soup!'); } else blip(660,.1); }
function spray(t){ const col={tare:'#4a1c08',garlic:'#f1dc9c',chili:'#c8301a'}[t], n=t==='tare'?14:9;
  for(let k=0;k<n;k++) K.parts.push({x:POUR_AT.x-8+Math.random()*10,y:POUR_AT.y+4,vx:(Math.random()-.5)*30,vy:40+Math.random()*60,r:t==='garlic'?3.5:2.5,col,life:.8,g:900,stopY:BROTH.y+Math.random()*16}); }
function floatTxt(s,x,y){ K.fx.push({s,x,y,t:0}); }

/* ---------------------------------------------------------------------
   11f. moving between steps
   --------------------------------------------------------------------- */
function goStation(i){ i=Math.max(0,Math.min(6,i)); K.camT=i*KW; K.queue=0; if(i!==K.stn){ K.stn=i; K.hop=.6; blip(420+i*30,.06); updateHighlight(); } }
function updateHighlight(){
  const el=$('#kTicket'), hl=el.querySelector('.tk-hl'); if(!hl||!G.order) return;
  const rows=STATIONS[K.stn].rows.map(k=>el.querySelector(`.tk-row[data-k="${k}"]`));
  const top=rows[0].offsetTop-2, bot=rows[rows.length-1].offsetTop+rows[rows.length-1].offsetHeight+1;
  hl.hidden=false; hl.style.top=top+'px'; hl.style.height=(bot-top)+'px'; hl.dataset.step='STEP '+(K.stn+1);
  const now=el.querySelector('.tk-now'); if(now) now.innerHTML=`Step ${K.stn+1} · `+STATIONS[K.stn].rows.map(k=>`${SHEET.find(s=>s.key===k).en}: <b>${orderText(k)}</b>`).join(' · ');
}
let ticketMini=false;

/* ---------------------------------------------------------------------
   11g. frame — update + draw
   --------------------------------------------------------------------- */
function kitchenFrame(dt){
  K.t+=dt; K.idle+=dt; if(K.hop>0) K.hop=Math.max(0,K.hop-dt); if(K.teboKick>0) K.teboKick=Math.max(0,K.teboKick-dt*5);
  if(!K.pan){ K.cam+=(K.camT-K.cam)*Math.min(1,dt*9); if(Math.abs(K.camT-K.cam)<.3) K.cam=K.camT; }
  else { const i=Math.max(0,Math.min(6,Math.round(K.cam/KW))); if(i!==K.stn){ K.stn=i; K.hop=.6; updateHighlight(); } }
  K.px0=K.stn*KW-K.cam;
  const b=G.bowl, nd=b.nood;
  if(K.pour){ b.soup=Math.min(1.15,b.soup+dt*CFG.SOUP_RATE*UP.soup()); K.dirty=true; if(Math.random()<dt*8) blip(180+Math.random()*40,.05,'sine',.03); }
  // tool motion (tap = automatic; drag-release = pour where you let go)
  const M=K.M; if(M){ M.T+=dt;
    if(M.stage==='go'){ const k=Math.min(1,M.T/.24), e=k*k*(3-2*k); M.x=M.from.x+(M.to.x-M.from.x)*e; M.y=M.from.y+(M.to.y-M.from.y)*e-Math.sin(k*Math.PI)*40; if(k>=1){ M.stage='act'; M.T=0; } }
    else if(M.stage==='act'){ M.ang = M.t==='fat' ? 0 : -Math.min(1,M.T/.14)*1.1; if(M.t==='fat') M.x=M.to.x+Math.sin(M.T*40)*10;
      if(M.T>=.2){ if(M.apply){ M.apply(); M.apply=null; K.dirty=true; } if(M.keep){ M.stage='back'; M.T=0; M.from={x:M.x,y:M.y}; M.to=M.home||M.from; M.full=false; } else K.M=null; } }
    else if(M.stage==='back'){ const k=Math.min(1,M.T/.22), e=k*k*(3-2*k); M.ang=(1-e)*(M.ang||0); M.x=M.from.x+(M.to.x-M.from.x)*e; M.y=M.from.y+(M.to.y-M.from.y)*e-Math.sin(k*Math.PI)*24; if(k>=1) K.M=null; }
    if(!K.M && K.queue>0 && K.lastTap){ K.queue--; autoAct({...K.lastTap}); }
  }
  if(!K.M && !K.lastTap) K.queue=0;
  // boil chip when the noodles are cooking out of sight
  const chip=$('#boilChip');
  if(nd.state==='boiling' && has('bell') && G.order){ const t=boilT(nd), w=want(G.order.pos).noodle;
    if(!nd.rang && Math.abs(t-CFG.FIRM_CENTERS[w])<=CFG.FIRM_TOL*.6){ nd.rang=true; blip(1320,.25,'sine',.12); setTimeout(()=>blip(1760,.3,'sine',.1),120); floatTxt('Ding! '+FIRM_NAME[w],K.stn===NOODLE_STEP?K.px0+250:BROTH.x,K.stn===NOODLE_STEP?372:BROTH.y-90); } }
  if(nd.state==='boiling' && K.stn!==NOODLE_STEP){ const t=boilT(nd); chip.hidden=false; $('#boilTxt').textContent=`${t.toFixed(1)}s · ${firmLabel(t)} ›`; } else chip.hidden=true;

  $('#btnToss').hidden = !(K.stn===NOODLE_STEP && ['boiling','lifted','bowl'].includes(nd.state));
  const tl=has('restore')?'⟲ Restore noodles':'Toss noodles'; if($('#btnToss').textContent!==tl) $('#btnToss').textContent=tl;
  if(G.tut) tutKitchen();
  // ---- draw ----
  const c=kx, dpr=Math.min(2.5,window.devicePixelRatio||1), S=K.s*dpr;
  if(kc.width!==Math.round(KW*S)){ kc.width=Math.round(KW*S); kc.height=Math.round(KH*S); }
  c.setTransform(S,0,0,S,0,0); c.clearRect(0,0,KW,KH);
  c.save(); c.translate(-K.cam,0);
  const i0=Math.max(0,Math.floor(K.cam/KW)), i1=Math.min(6,Math.floor((K.cam+KW-1)/KW));
  drawKitchenBG(c,K.cam-2,K.cam+KW+2);
  for(let i=i0;i<=i1;i++){ c.save(); c.translate(i*KW,0); drawShelf(c,i); drawPlaque(c,i); STATION_ART[i](c,K.t); c.restore(); }
  c.restore();
  // hint glow on the current step's tools after a moment of no input
  if(settled() && !K.hand && !K.M && (K.idle>2.5 || (G.tut && !tutStepDone()))) OBJS[K.stn].forEach(o=>{ if(o.kind==='tebo' && !(nd.state==='boiling'||nd.state==='lifted')) return; glow(c,K.px0+o.box[0]+8,o.box[1]+8,o.box[2]-16,o.box[3]-16,14,K.t); });
  // bowl on the pass
  shadow(c,BROTH.x,BOWL.y+478*BK,86,10,.25);
  if(K.dirty){ drawRamen(bowlCv,b); K.dirty=false; }
  c.drawImage(bowlCv,BOWL.x,BOWL.y,BOWL.s,BOWL.s);
  if(b.rice && !(K.M&&K.M.t==='rice')) drawSprite(c,IMG.rice,340,512,74,0);
  if(K.stn===1){ c.save(); c.setLineDash([5,5]); c.lineWidth=2; c.strokeStyle='rgba(210,50,45,.8)'; c.beginPath(); c.ellipse(BROTH.x,BROTH.y,RX*BK,RY*BK,0,0,6.29); c.stroke(); c.restore();
    rr(c,302,474,58,24,8); fs(c,'#fffaf0',2.5); txt(c,Math.round(b.soup*100)+'%',331,486,12,Math.abs(b.soup-CFG.SOUP_TARGET)<=CFG.SOUP_TOL?'#3e8e3a':OUT,700);
    txt(c,'fill line',BROTH.x+RX*BK-6,BROTH.y-RY*BK-6,9,'#d2322d',700,'right',3); }
  if(K.pour){ const L=Math.min(b.soup/CFG.SOUP_TARGET,1), sy=BOWL.y+(CY+(1-L)*50)*BK; c.fillStyle='rgba(222,170,80,.92)'; rr(c,K.px0+196+Math.sin(K.t*40)*.6,478,8,Math.max(4,sy-478),4); c.fill(); ell(c,BROTH.x,sy,14+Math.sin(K.t*30)*2,4,'rgba(255,240,200,.8)'); }
  if(b.soup>0.3){ c.save(); for(let k=0;k<3;k++){ const ph=(K.t*.45+k*.33)%1; c.globalAlpha=(1-ph)*.35; ell(c,BROTH.x-40+k*40+Math.sin(K.t+k)*6,BROTH.y-20-ph*70,12+ph*14,9+ph*10,'#fff'); } c.restore(); }
  // particles (fall into the bowl / boiler)
  K.parts=K.parts.filter(q=>{ q.life-=dt; q.vy+=q.g*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; if(q.y>q.stopY) return false; ell(c,q.x,q.y,q.r,q.r,q.col,1,'rgba(91,58,46,.35)'); return q.life>0; });
  drawMomo(c,dt);
  // held / moving tool on top
  const tool=K.hand||K.M; if(tool) drawTool(c,tool.t,tool.x,tool.y,tool.ang||0, K.hand? K.hand.full : tool.full!==false);
  K.fx=K.fx.filter(f=>{ f.t+=dt; c.save(); c.globalAlpha=Math.max(0,1-f.t/1.2); txt(c,f.s,f.x,f.y-f.t*30,15,OUT,700,'center',5,'#fff'); c.restore(); return f.t<1.2; });
}

/* =====================================================================
   12. SCORING
   ===================================================================== */
function score(order,b){
  const w=want(order.pos), rows=[]; const add=(label,wnt,got,pts,max)=>rows.push({label,wnt,got,pts:Math.max(0,Math.round(pts)),max});
  const near=(a,bb,full,half)=>a===bb?full:Math.abs(a-bb)===1?half:0, nd=b.nood;
  add('Dashi', `${DASHI_NAME[w.dashi]} · ${w.dashi+1} scoop${w.dashi?'s':''}`, `${b.tare} scoop${b.tare===1?'':'s'}`, near(b.tare,w.dashi+1,12,5), 12);
  add('Soup level','To the line', Math.round(b.soup*100)+'%', b.soup<.05||b.soup>1.02?0:(()=>{const d=Math.abs(b.soup-CFG.SOUP_TARGET); return d<=CFG.SOUP_TOL?8:8-(d-CFG.SOUP_TOL)*50;})(), 8);
  add('Richness', RICH_NAME[w.rich], RICH_NAME[Math.min(4,b.fat)], near(Math.min(4,b.fat),w.rich,12,6), 12);
  add('Garlic', GARLIC_LIST[w.garlic], GARLIC_LIST[Math.min(7,b.garlic)], near(b.garlic,w.garlic,10,5), 10);
  add('Spice', String(w.spice), String(b.spice), near(b.spice,w.spice,10,5), 10);
  const inBowl=nd.state==='bowl';
  add('Noodles', FIRM_NAME[w.noodle], inBowl? `${firmLabel(nd.time)} ${nd.time.toFixed(1)}s`:'—', inBowl?(()=>{const d=Math.abs(nd.time-CFG.FIRM_CENTERS[w.noodle]); return d<=CFG.FIRM_TOL?20:20-(d-CFG.FIRM_TOL)*5;})():0, 20);
  add('Draining','≤ 15% water', inBowl? Math.round(nd.water*100)+'%':'—', inBowl?(nd.water<=CFG.WATER_OK?10:10*(1-(nd.water-CFG.WATER_OK)/.6)):0, 10);
  const onion=b.green&&b.white?'both':b.green?'green':b.white?'white':'none';
  add('Onion', ONION_NAME[w.onion], ONION_NAME[onion], onion===w.onion?6:(w.onion==='both'&&onion!=='none')||(onion==='both'&&w.onion!=='none')?2:0, 6);
  add('Chashu', w.chashu?'Yes':'No', b.chashu?'Yes':'No', b.chashu===w.chashu?4:0, 4);
  add('Seaweed', w.nori?'Yes':'No', b.nori?'Yes':'No', b.nori===w.nori?4:0, 4);
  add('Rice', w.rice?'Yes':'No', b.rice?'Yes':'No', b.rice===w.rice?4:0, 4);
  let total=rows.reduce((s,r)=>s+r.pts,0);
  if(b.noodlesBeforeSoup){ rows.push({label:'Order',wnt:'Soup → noodles',got:'Noodles first',pts:-8,max:0}); total-=8; }
  total=Math.max(0,Math.min(100,total));
  return {rows,total,grade: total>=90?'S': total>=75?'A': total>=55?'B':'C'};
}

/* =====================================================================
   13. SAVE + ECONOMY — tweak prices, rent and difficulty here
   ===================================================================== */
const $=s=>document.querySelector(s);
const SAVE_KEY='momo-ramen-shop.v1';
const STOCK_KEYS=['chashu','green','white','nori','noodle'];
const freshSave=(book,tut,seen)=>({day:1,money:ECON.START_MONEY,stock:{...ECON.START_STOCK},upgrades:{},book:book||{},served:0,firstDone:false,tutorialDone:!!tut,seen:seen||{}});
function loadSave(){ try{ const s=localStorage.getItem(SAVE_KEY); if(!s) return null; const o=JSON.parse(s), f=freshSave(); return {...f,...o,stock:{...f.stock,...(o.stock||{})}}; }catch(e){ return null; } }
function saveGame(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(P)); }catch(e){} }
let P=loadSave()||freshSave();
const has=id=>!!P.upgrades[id];
const owned=k=>UPGRADES.filter(u=>has(u.id) && u[k]!==undefined).map(u=>u[k]);
const UP={ soup:()=>Math.max(1,...owned('soup')), flick:()=>Math.min(1,...owned('flick')), oneFlick:()=>owned('oneFlick').length>0,
  pat:()=>Math.max(1,...owned('pat')), maxBuy:()=>Math.max(3,...owned('maxBuy')), types:()=>Math.min(STOCK_KEYS.length,Math.max(3,...owned('types'))), bonus:()=>owned('bonus').reduce((a,b)=>a+b,0), boil:()=>Math.min(1,...owned('boil')) };
/* noodle cooking speed: default is 15% faster than v8, burners make it 10% / 30% faster again */
const boilSpeed=()=>(1/0.85)/UP.boil();
const boilT=nd=>(performance.now()-nd.start)/1000*boilSpeed();
const yen=n=>'¥'+Math.round(n).toLocaleString();
const D={n:0,done:0,sales:0,tips:0,walk:0};   // today
const E={served:0,money:0};                   // endless session
const useStock=()=>G.play==='story';           // endless + tutorial replay have unlimited ingredients
const stockOf=k=>useStock()?P.stock[k]:Infinity;
function takeStock(k){ if(useStock() && k in P.stock) P.stock[k]=Math.max(0,P.stock[k]-1); }
function giveStock(k){ if(useStock() && k in P.stock) P.stock[k]++; }

/* =====================================================================
   14. UI HELPERS + SCENES
   ===================================================================== */
function toast(msg){ const t=$('#toast'); t.innerHTML=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),1600); }
document.addEventListener('scroll',e=>{ const t=e.target; if(t&&t.classList&&t.classList.contains('scene')&&t.id!=='book'){ t.scrollTop=0; t.scrollLeft=0; } },true);
function showScene(id){ ['shop','kitchen','night','prep','book','over'].forEach(s=>$('#'+s).classList.toggle('off',s!==id)); G.scene=id; layoutAll(); }
function fitStage(sec,stage,w,h){ const W=sec.clientWidth,H=sec.clientHeight; if(!W||!H) return 0; const s=Math.min(W/w,H/h); stage.style.transform=`translate(${(W-w*s)/2}px,${H-h*s}px) scale(${s})`; return s; }
function layoutAll(){
  const ks=fitStage($('#kitchen'),$('#kStage'),KW,KH); if(ks) K.s=ks;
  const ps=fitStage($('#prep'),$('#pStage'),400,820); if(ps) PR.s=ps;
  if(G.scene==='shop') layoutStage();
}
const TOP_H=500, BOT_H=170;   // upper section above the scene · counter that continues below it
// view: false = whole shop · 'cust' = closer on the customer while ordering · 'tray' = zoom on the served bowl
function layoutStage(view){
  if(view!==undefined) G.view=view; view=G.view;
  const sh=$('#shop'), W=sh.clientWidth, H=sh.clientHeight; if(!W) return; sh.scrollTop=0; sh.scrollLeft=0; let s=W/900; if((1280+BOT_H)*s>H) s=H/(1280+BOT_H);
  const left=(W-900*s)/2, top=H-(TOP_H+1280+BOT_H)*s;                 // pinned to the bottom; taller phones see more of the top section
  const focus=(z,fx,fy,sx,sy)=>$('#stage').style.transform=`translate(${W*sx-fx*z}px,${H*sy-(fy+TOP_H)*z}px) scale(${z})`;
  if(view==='tray') focus(s*1.75,437,850,.5,.25);
  else if(view==='cust') focus(s*1.12,520,520,.5,.3);
  else $('#stage').style.transform=`translate(${left}px,${top}px) scale(${s})`;
  $('#boardHud').style.top = sh.classList.contains('home') ? (top+(TOP_H+922)*s)+'px' : '';   // on the tray at home, top of the screen in service
}
/* Pudding Panic flip: hop + stretch, squash through scaleX 0 (swap the picture there), land with a squish */
function ppFlip(el, mid, dur=650){
  return new Promise(res=>{ const t0=performance.now(); let swapped=false; blip(520,.08);
    (function f(now){ const k=Math.min(1,(now-t0)/dur);
      const hop=Math.sin(Math.min(1,k/.85)*Math.PI)*46, sx=Math.max(.03,Math.abs(Math.cos(k*Math.PI)));
      const sq = k<.12 ? 1+.28*(k/.12) : k<.85 ? 1.28-.28*((k-.12)/.73) : 1-.22*Math.sin((k-.85)/.15*Math.PI);
      if(k>=.5 && !swapped){ swapped=true; mid&&mid(); }
      el.style.transform=`translateY(${-hop}px) scale(${(sx/sq).toFixed(3)},${sq.toFixed(3)})`;
      if(k<1) requestAnimationFrame(f); else { el.style.transform=''; res(); } })(t0); });
}
/* arms behind the body: pivot at the shoulder, rest angle, swing up when working */
function placeArms(root,w,h,A=ARM){ const hw=w*(A.size||.19), hh=hw*1.054;
  root.querySelectorAll('.hand').forEach(el=>{ const i=el.classList.contains('hL')?0:1; el.style.width=hw+'px';
    el.style.left=(w*A.px[i]-hw/2)+'px'; el.style.top=(h*A.py+hh*.15)+'px'; }); }
const ARM_TORSO={ px:[.37,.74], py:.66, size:.15 };   // arms on her torso (home screen, idle / walking)
function setArms(root,deg){ root.querySelector('.hL').style.transform=`rotate(${deg}deg)`; root.querySelector('.hR').style.transform=`rotate(${-deg}deg)`; }

/* =====================================================================
   15. HOME SCREEN — customers at the counter, Momo serving on a loop
   ===================================================================== */
const SEAT_X=[205,450,695], SEAT_CUST=['soso','kew','rang'];
const HOME={built:false, seats:[], m:{x:1080,state:'kitchen',t:.6,target:0,turnCD:2.5,carry:false,ph:0}};
function bowlFromPack(o){ return {tare:o.dashi+1, soup:CFG.SOUP_TARGET, fat:o.richness, garlic:o.garlic, spice:o.spice,
  green:o.onion===0||o.onion===3, white:o.onion===1||o.onion===3, chashu:!!o.chashu, nori:!!o.seaweed, rice:false,
  nood:{state:'bowl',time:CFG.FIRM_CENTERS[o.texture],water:0}, noodlesBeforeSoup:false, eaten:false}; }
function randomBowl(){ const r=a=>a[Math.floor(Math.random()*a.length)];
  return bowlFromPack({dashi:r([0,1,2]),richness:r([0,1,2,3,4]),garlic:r([0,2,3,4]),onion:r([0,0,1,3]),chashu:r([1,1,0]),spice:r([0,1,2,3]),texture:r([1,2]),seaweed:r([1,1,0])}); }
function buildHome(){
  if(HOME.built) return; HOME.built=true; const box=$('#seats');
  SEAT_X.forEach((x,i)=>{ const id=SEAT_CUST[i], h=CUST_H[id]*250/360, top=752-h*.6;
    const el=document.createElement('div'); el.className='seat'; el.style.left=(x-125)+'px'; el.style.top=top+'px';
    el.innerHTML=`<img class="csprite" src="${CUST_IMG[id]}" alt="${CUSTOMERS[id].name}"><canvas width="512" height="512"></canvas>`;
    const cv=el.querySelector('canvas'); cv.style.left='45px'; cv.style.top=(800-152-top)+'px';
    box.appendChild(el); const b=randomBowl(); b.eaten=i!==1;
    HOME.seats.push({el,cv,bowl:b,state:i===1?'eating':'done',t:6}); });
  HOME.seats.forEach(s=>drawRamen(s.cv,s.bowl));
  const hm=$('#homeMomo'); placeArms(hm,340,367,ARM_TORSO); HOME.m.arms='torso'; setArms(hm,28);
  domArms($('#shopMomo'),440,475,'torso',26);
}
function homeFrame(dt){
  HOME.seats.forEach((s,i)=>{ if(s.state!=='eating') return; s.t-=dt; s.el.classList.add('eat');
    if(Math.random()<dt*.35) slurpText(SEAT_X[i]-60+Math.random()*60,560);
    if(s.t<=0){ s.state='done'; s.el.classList.remove('eat'); s.bowl.eaten=true; drawRamen(s.cv,s.bowl); } });
  const m=HOME.m, el=$('#homeMomo'), W=340, speed=230; m.t-=dt; m.turnCD-=dt; m.ph+=dt;
  if(m.state==='kitchen' && m.t<=0){
    const free=HOME.seats.map((s,i)=>s.state==='done'?i:-1).filter(i=>i>=0);
    if(free.length){ m.target=free[Math.floor(Math.random()*free.length)]; m.carry=true; m.bowl=randomBowl(); drawRamen(el.querySelector('.carry'),m.bowl); m.state='walkIn'; m.x=1080; }
    else m.t=1; }
  else if(m.state==='walkIn'){ m.x-=speed*dt; if(m.x<=SEAT_X[m.target]){ m.x=SEAT_X[m.target]; m.state='place'; m.t=.8; } }
  else if(m.state==='place'){ if(m.t<=.4 && m.carry){ m.carry=false; const s=HOME.seats[m.target]; s.bowl=m.bowl; s.state='eating'; s.t=7+Math.random()*4; drawRamen(s.cv,s.bowl); blip(700,.06); }
    if(m.t<=0){ if(m.turnCD<=0 && Math.random()<.5) homeTurn('walkOut'); else m.state='walkOut'; } }
  else if(m.state==='walkOut'){ m.x+=speed*dt; if(m.turnCD<=0 && m.x>200 && m.x<760 && Math.random()<dt*.5) homeTurn('walkOut');
    if(m.x>=1080){ m.state='kitchen'; m.t=.8+Math.random()*.8; } }
  const walking = m.state==='walkIn'||m.state==='walkOut';
  const bob = walking ? Math.abs(Math.sin(m.ph*9))*12 : Math.abs(Math.sin(m.ph*4.4))*5;
  el.style.left=(m.x-W*.57)+'px'; el.style.transform=`translateY(${-bob}px) rotate(${walking?Math.sin(m.ph*9)*2.5:0}deg)`;
  el.querySelector('.carry').style.opacity = m.carry && m.state!=='turn' ? 1 : 0;
  if(m.state!=='turn'){ const serving = m.carry || m.state==='place', want = serving?'head':'torso';
    if(m.arms!==want){ m.arms=want; placeArms(el,340,367,serving?ARM:ARM_TORSO); }
    setArms(el, m.carry ? 150 : m.state==='place' ? 120 : 26+(walking?Math.sin(m.ph*9)*14:Math.sin(m.ph*3)*4)); }
}
function homeTurn(after){ const m=HOME.m, hm=$('#homeMomo'), fl=hm.querySelector('.flip'); m.state='turn'; m.turnCD=6+Math.random()*4;
  ppFlip(fl,()=>{ hm.classList.add('front'); hm.querySelector('.body').src=ASSET_SRC.momo_happy; })
   .then(()=>new Promise(r=>setTimeout(r,1300)))
   .then(()=>ppFlip(fl,()=>{ hm.classList.remove('front'); hm.querySelector('.body').src=ASSET_SRC.momo_body; }))
   .then(()=>{ if(G.mode==='home') m.state=after; }); }
function slurpText(x,y){ const s=document.createElement('div'); s.className='slurp'; s.style.fontSize='34px'; s.textContent=['Slurp!','Zuzu…','Mmm!'][Math.floor(Math.random()*3)]; s.style.left=x+'px'; s.style.top=y+'px'; $('#scene').appendChild(s); setTimeout(()=>s.remove(),1200); }
function refreshHome(){ const endless=P.lastMode==='endless';   // the tray shows whichever mode was played last
  $('#hotTray .hm:not(.hmEnd)').hidden=endless; $('#hotTray .hmEnd').hidden=!endless; $('#hmBest').textContent=(P.endlessBest||0).toLocaleString();
  $('#btnEndless').innerHTML=`Endless${P.endlessBest?` · Best ${P.endlessBest} bowl${P.endlessBest===1?'':'s'}`:''} ▶<small>Just make ramen. No rent, no stock, no rush.</small>`;
  $('#hmDay').textContent=P.day; $('#hmMoney').textContent=P.money.toLocaleString(); $('#hmRent').textContent=ECON.rent(P.day).toLocaleString(); $('#btnDay').innerHTML= P.resume&&P.resume.day===P.day ? `Continue Day ${P.day} · ${Math.min(P.resume.D.done+1,P.resume.D.n)}/${P.resume.D.n} ▶<small>Pick up where you saved</small>` : `Story · Day ${P.day} ▶<small>Rent, stock, patience and night prep</small>`; $('#hotDrink').classList.toggle('locked',!P.tutorialDone); }
function goHome(){ G.sess=(G.sess||0)+1; G.paused=false; $('#pause').hidden=true; G.mode='home'; G.waiting=false; G.tut=false; $('#shop').classList.add('home'); $('#btnNextCust').hidden=true; ['orderSheet','scoreSheet','modeSheet'].forEach(i=>$('#'+i).classList.remove('on'));
  $('#coinPop').classList.remove('on'); $('#momoBubble').classList.add('off'); hush(); showScene('shop'); layoutStage(false); buildHome(); refreshHome(); music('title'); }

/* =====================================================================
   16. A BUSINESS DAY — customers, patience, serving, paying
   ===================================================================== */
const WALK_LINE={soso:'Hmph! Soso is leaving!', rang:"Haha… I'll eat somewhere else!", kew:'…My patience has limits.', bae:'Bae… I have to go…'};
/* three ways to play: story (rent/stock/patience), endless (just ramen), tutorial replay (one guided bowl) */
/* delayed steps of a day only run if the player is still in that same session (not after Home / Restart) */
function later(f,ms){ const ss=G.sess; return setTimeout(()=>{ if(ss===G.sess) f(); },ms); }
function enterService(){ $('#modeSheet').classList.remove('on'); G.mode='service'; $('#shop').classList.remove('home'); G.custQueue=[];
  resetMomoBack(); updateHud(); layoutStage(false); music('day',true); later(nextCustomer,400); }
function startDay(){ P.lastMode='story'; G.play='story'; G.tut=!P.tutorialDone; G.firstOrder=!P.firstDone||G.tut;
  Object.assign(D,{n:ECON.customers(P.day),done:0,sales:0,tips:0,walk:0});
  if(P.resume && P.resume.day===P.day) Object.assign(D,P.resume.D);                          // continue a saved day
  else P.dayStart={day:P.day,money:P.money,stock:{...P.stock},served:P.served};              // for "Restart the day"
  P.resume=null; saveGame(); enterService(); }
function startEndless(){ P.lastMode='endless'; E.newBest=false; saveGame(); G.play='endless'; G.tut=false; G.firstOrder=false; Object.assign(E,{served:0,money:0}); Object.assign(D,{n:Infinity,done:0,sales:0,tips:0,walk:0}); enterService(); }
function startTutorial(){ if(!P.tutorialDone){ toast('The tutorial starts with your first story day'); return; }
  G.play='tutorial'; G.tut=true; G.firstOrder=true; Object.assign(D,{n:1,done:0,sales:0,tips:0,walk:0}); enterService(); }
function updateHud(){
  if(G.play==='endless'){ $('#hudDay').textContent=`Endless · bowl ${E.served+1}`; $('#hudCoins').textContent=yen(E.money); }
  else if(G.play==='tutorial'){ $('#hudDay').textContent='Tutorial'; $('#hudCoins').textContent=''; }
  else { $('#hudDay').textContent=`Day ${P.day} · ${Math.min(D.done+1,D.n)}/${D.n}${G.tut?' · tutorial':''}`; $('#hudCoins').textContent=yen(P.money); } }
function domArms(root,w,h,mode,deg){ if(root._arms!==mode){ root._arms=mode; placeArms(root,w,h,mode==='head'?ARM:ARM_TORSO); } setArms(root,deg); }
function resetMomoBack(){ const m=$('#shopMomo'); m.classList.remove('front'); m.querySelector('.body').src=ASSET_SRC.momo_body; domArms(m,440,475,'torso',26); }
function clearTrayFx(){ $('#stage').classList.remove('zoomed','shineOn','gloomOn'); $('#sparkles').innerHTML=''; }
function nextCustomer(){
  $('#btnNextCust').hidden=true; $('#coinPop').classList.remove('on'); $('#momoBubble').classList.add('off'); hush(); clearTrayFx(); resetMomoBack();
  if(G.play==='tutorial' && D.done>=1){ toast('Tutorial complete!'); goHome(); return; }
  if(G.play==='story' && D.done>=D.n){ closeShop(); return; }
  updateHud();
  if(!G.custQueue.length) G.custQueue=Object.keys(CUSTOMERS).sort(()=>Math.random()-.5);
  if(G.firstOrder) G.custQueue=['soso',...G.custQueue.filter(c=>c!=='soso')];
  const id=G.custQueue.shift(); G.ticketNo++;
  G.order={cust:id,no:G.ticketNo,pos:genOrder()}; G.bowl=newBowl(); G.result=null; K.dirty=true; G.pat=100;
  $('#shopBowl').classList.add('hidden-o'); $('#shopRice').classList.add('hidden-o');
  const c=$('#cust'); c.classList.add('away'); c.classList.remove('impatient');
  later(()=>{ placeCustomer(id); c.innerHTML=custHTML(id,'idle'); c.classList.remove('away','eat');
    later(()=>{ say(CUSTOMERS[id].hi); renderTicket($('#shopTicket'),G.order); $('#orderSheet').classList.add('on'); layoutStage('cust');
      const timed = G.play==='story' && !G.tut; G.waiting=timed; $('#patBar').classList.toggle('hide',!timed); $('#app').classList.toggle('notimed',!timed);
      $('#orderCoach').hidden=!G.tut; $('#scoreCoach').hidden=!G.tut; later(redrawAllCircles,60); later(redrawAllCircles,520); },650); },350);
}
function patienceTick(dt){
  if(!G.waiting || G.play!=='story' || G.tut) return;
  G.pat=Math.max(0,G.pat-dt*100*ECON.PATIENCE_SLOWER/(ECON.patience(P.day)*UP.pat()*(CUSTOMERS[G.order.cust].pat||1)));
  const cls=G.pat<30?'low':G.pat<60?'mid':'';
  const bar=$('#patBar'); bar.classList.toggle('mid',cls==='mid'); bar.classList.toggle('low',cls==='low'); bar.firstElementChild.style.width=G.pat+'%';
  document.querySelectorAll('.tk-pat').forEach(el=>{ el.className='tk-pat '+cls; el.firstElementChild.style.width=G.pat+'%'; });
  $('#cust').classList.toggle('impatient',G.pat<20);
  const up=G.pat<UPSET_PATIENCE, im=$('#cust .csprite');
  if(im && im.dataset.upset!==(up?'1':'0')){ im.src=up?CUST_UPSET[G.order.cust]:CUST_IMG[G.order.cust]; im.dataset.upset=up?'1':'0'; }
  if(G.pat<=0) walkout();
}
function walkout(){
  G.waiting=false; D.walk++; const id=G.order.cust;
  if(G.scene!=='shop') showScene('shop');
  $('#orderSheet').classList.remove('on'); $('#patBar').classList.add('hide'); layoutStage(false);
  const c=$('#cust'); c.classList.remove('impatient'); c.innerHTML=custHTML(id,'sad',true); say(WALK_LINE[id]); blip(200,.35,'sawtooth',.05);
  later(()=>{ hush(); c.classList.add('away'); },1800);
  later(()=>{ D.done++; saveGame(); nextCustomer(); },2600);
}
function say(t){ const b=$('#custBubble'); b.textContent=t; b.classList.remove('off'); }
function hush(){ $('#custBubble').classList.add('off'); }
function toKitchen(){
  $('#orderSheet').classList.remove('on'); hush();
  showScene('kitchen'); K.cam=K.camT=0; K.stn=0; K.hop=.6; K.hand=null; K.M=null; K.queue=0; K.lastTap=null; K.parts=[]; K.fx=[]; K.idle=0; K.dirty=true;
  ticketMini=!!G.tut; tutKey=''; $('#coach').hidden=!G.tut; $('#btnNext').classList.remove('pulse'); $('#serveHint').classList.remove('pulse');
  requestAnimationFrame(()=>renderTicket($('#kTicket'),G.order,ticketMini));
}
function bookRecord(b,total,cust){
  const o=packOrder(b), idx=(((((o.garlic*4+o.onion)*2+o.chashu)*6+o.spice)*5+o.texture)*2+o.seaweed), id=o.dashi*19200+o.richness*3840+idx;
  const e=P.book[id]||{o,n:0,best:0}; e.n++; e.best=Math.max(e.best,total); e.at=Date.now(); e.cust=cust; e.o=o; P.book[id]=e;
}
function serve(){
  const b=G.bowl;
  if(b.tare===0 && b.soup<0.05 && b.nood.state!=='bowl'){ toast('The bowl is still empty!'); return; }
  if(b.nood.state==='boiling'||b.nood.state==='lifted'){ toast('The noodles are still in the boiler!'); return; }
  G.tutWas=G.tut; G.waiting=false; G.patServe=G.pat; $('#patBar').classList.add('hide'); $('#coach').hidden=true;
  G.result=score(G.order,b); P.firstDone=true; bookRecord(b,G.result.total,G.order.cust); saveGame();
  showScene('shop'); layoutStage(false);
  drawRamen($('#shopBowl'),b);
  const sb=$('#shopBowl'), sr=$('#shopRice'), m=$('#shopMomo');
  sb.style.transition='none'; sr.style.transition='none';
  sb.style.transform='translate(300px,360px) scale(.5)'; sr.style.transform='translate(120px,280px) scale(.5)';
  sb.classList.remove('hidden-o'); sr.classList.toggle('hidden-o',!b.rice);
  domArms(m,440,475,'head',120);
  later(()=>sfx('bowl'),650);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ sb.style.transition=''; sr.style.transition=''; sb.style.transform=''; sr.style.transform=''; }));
  blip(520,.1); later(()=>blip(780,.12),250);
  later(()=>{ domArms(m,440,475,'torso',26); layoutStage('tray'); const st=$('#stage'), t=G.result.total; st.classList.add('zoomed');
    if(t>95){ st.classList.add('shineOn'); $('#sparkles').innerHTML=[[300,700],[580,690],[250,880],[640,900],[440,640],[700,800]].map(([x,y],i)=>`<span class="spark" style="left:${x}px;top:${y}px;animation-delay:${i*.22}s">✦</span>`).join(''); later(()=>sfx('golden'),200); }
    else if(t<20){ st.classList.add('gloomOn'); later(()=>sfx('bad'),200); } },1000);
  later(showScore,1900);
}
function showScore(){
  const r=G.result;
  $('#scStamp').textContent=r.grade; $('#scStamp').style.animation='none'; void $('#scStamp').offsetWidth; $('#scStamp').style.animation='';
  $('#scTotal').innerHTML=`${r.total}<small> / 100</small>`;
  $('#scMomo').textContent= G.play==='story'&&!G.tutWas ? `Grade ${r.grade} · patience left ${Math.round(G.patServe)}%` : `Grade ${r.grade}`;
  $('#scoreList').innerHTML=`<div class="r hd"><span>Item</span><span>Ordered</span><span>Made</span><span class="p">Pts</span></div>`+
    r.rows.map(x=>{ const cls= x.max===0?'ng': x.pts===x.max?'ok': x.pts>0?'mid':'ng';
      return `<div class="r"><span>${x.label}</span><span>${x.wnt}</span><span class="${cls}">${x.got}</span><span class="p ${cls}">${x.max?x.pts+'/'+x.max:x.pts}</span></div>`; }).join('');
  $('#scoreSheet').classList.add('on'); blip(r.total>=75?990:440,.25,'sine');
}
function eat(){
  $('#scoreSheet').classList.remove('on'); clearTrayFx(); layoutStage(false);
  const id=G.order.cust, r=G.result, c=$('#cust');
  later(()=>{ c.classList.add('eat');
    ['Slurp!','Slurrrp…','Fuu fuu'].forEach((w,i)=>later(()=>{ slurpText(260+i*130,420); blip(300+i*60,.1,'sine',.05); },i*500));
  },800);
  later(()=>{ G.bowl.eaten=true; drawRamen($('#shopBowl'),G.bowl); $('#shopRice').classList.add('hidden-o'); },2200);
  later(()=>{ c.classList.remove('eat'); c.innerHTML=custHTML(id, r.grade==='C'?'sad':'happy', r.total<UPSET_SCORE); say(CUSTOMERS[id].react[r.grade]);
    const base=Math.round(CFG.PRICE*r.total/100*(1+UP.bonus()));
    const C=CUSTOMERS[id], tip = r.total>=55 ? Math.round((G.patServe>66?ECON.TIP_HIGH:G.patServe>33?ECON.TIP_MID:0)*C.tip) : 0, bonus = r.total>=95?C.perfect:0;
    if(G.play==='story'){ P.money+=base+tip+bonus; D.sales+=base; D.tips+=tip+bonus; P.served++; }
    else if(G.play==='endless'){ E.money+=base+tip+bonus; E.served++;
      if(E.served>(P.endlessBest||0)){ if(P.endlessBest && !E.newBest){ E.newBest=true; later(()=>toast(`New best: ${E.served} bowls!`),1400); } P.endlessBest=E.served; saveGame(); } }
    D.done++;
    if(G.tut){ G.tut=false; P.tutorialDone=true; later(()=>toast(G.play==='story'?'Tutorial complete! The rest of Day 1 is up to you.':'Tutorial complete!'),2200); }
    saveGame(); updateHud();
    momoReveal(base+tip+bonus, tip+bonus, r.total);
  },3300);
}
/* the real Momo at the counter turns round: face by score, money collected, her comment */
function momoReveal(pay, extra, total){
  const f=faceFor(total), m=$('#shopMomo');
  later(()=>ppFlip(m.querySelector('.flip'),()=>{ m.classList.add('front'); m.querySelector('.body').src=f.img; }).then(()=>{
    $('#cpAmt').textContent='+'+yen(pay); $('#cpTip').textContent= extra? `incl. ${yen(extra)} tip`:''; $('#coinPop').classList.add('on'); sfx('pay');
    later(()=>{ const b=$('#momoBubble'); b.textContent=f.line; b.classList.remove('off'); },350);
    later(()=>{ const bt=$('#btnNextCust'); bt.textContent = G.play==='tutorial' ? 'Back home ▶' : G.play==='story' && D.done>=D.n ? 'Close the shop ▶':'Next customer ▶'; bt.hidden=false; },800);
  }),600);
}
function closeShop(){ G.waiting=false; P.resume=null; saveGame(); toast('Closing time! もも屋 is closed for today'); later(showNight,1500); }

/* =====================================================================
   17. NIGHT — report, iPad (market + kitchenware), prep, sleep
   ===================================================================== */
const N={market:[],qty:{},tab:'market',cat:'all',queue:[],results:[]};
function shuffled(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function showNight(){
  const rent=ECON.rent(P.day), after=P.money-rent;
  showScene('night'); music('night'); sfx('eod'); $('#report').hidden=false; $('#ipad').hidden=true; $('#sleep').hidden=true;
  $('#rpTitle').textContent=`Day ${P.day} closed`;
  $('#rpSub').textContent=`${D.n-D.walk} served · ${D.walk} walked out`;
  $('#rpLedger').innerHTML=`<span>Sales</span><span class="pos">+${yen(D.sales)}</span><span>Tips</span><span class="pos">+${yen(D.tips)}</span><span>Rent</span><span class="neg">−${yen(rent)}</span><span class="tot">Money left</span><span class="tot ${after<0?'neg':''}">${yen(after)}</span>`;
  const bt=$('#btnIpad');
  if(after<0){ bt.textContent="Can't pay rent…"; bt.onclick=gameOver; }
  else { bt.textContent='Pay rent & open iPad ▶'; bt.onclick=()=>{ P.money=after; N.market=shuffled(STOCK_KEYS).slice(0,UP.types()); saveGame(); openIpad(); }; }
}
function openIpad(){ $('#report').hidden=true; $('#ipad').hidden=false; N.qty={}; N.market.forEach(k=>N.qty[k]=1); N.tab='market'; renderIpad(); }
const marketCost=()=>N.market.reduce((s,k)=>s+(N.qty[k]||0)*MARKET[k].price,0);
function renderIpad(){
  $('#ipDay').textContent=P.day; $('#ipMoney').textContent=yen(P.money);
  $('#tabMarket').classList.toggle('on',N.tab==='market'); $('#tabWare').classList.toggle('on',N.tab==='ware');
  P.seen=P.seen||{}; const tk=N.tab==='market'?'ipad_market':'ipad_ware';
  $('#ipCoach').hidden=!!P.seen[tk];
  $('#ipCoachTxt').innerHTML = N.tab==='market'
    ? `Each night 3 ingredients are delivered (marked <b>TONIGHT</b>). Use <b>− / +</b> to buy packs, then <b>Buy &amp; prep</b>: you prep each one in a quick minigame, and neat prep keeps more portions. The 2 you can't buy get topped up by the average of tonight's prep.`
    : `Kitchenware upgrades are one-off buys that make the day easier: faster soup, better draining, a noodle bell, a sharper knife, more patient customers or higher prices.`;
  $('#btnIpCoach').onclick=()=>{ P.seen[tk]=true; saveGame(); renderIpad(); };
  const L=$('#ipList');
  if(N.tab==='market'){
    L.innerHTML=`<div style="font-size:12px;opacity:.8;line-height:1.4">Tonight's delivery: <b>${N.market.map(k=>MARKET[k].name).join(', ')}</b>. Everything you buy, Momo preps tonight — neat prep keeps every portion.</div>`+
      STOCK_KEYS.map(k=>{ const m=MARKET[k], on=N.market.includes(k), q=N.qty[k]||0;
        return `<div class="ipItem ${on?'tonight':'off'}"><div class="ic"><img src="${m.img}" alt=""></div>
          <div><h4>${m.name}${on?'<span class="tag">TONIGHT</span>':''}</h4><p>In stock: <b>${P.stock[k]}</b> ${m.unit}<br>${on?`${m.pack} · ${yen(m.price)} → up to +${Math.round(m.base*ECON.PREP_YIELD)}`:'No delivery tonight'}</p></div>
          ${on?`<div class="step"><button data-k="${k}" data-d="-1" aria-label="Fewer">−</button><span>${q}</span><button data-k="${k}" data-d="1" aria-label="More">+</button></div>`:'<span></span>'}</div>`; }).join('');
    L.querySelectorAll('.step button').forEach(b=>b.onclick=()=>{ const k=b.dataset.k; N.qty[k]=Math.max(0,Math.min(UP.maxBuy(),(N.qty[k]||0)+ +b.dataset.d)); blip(600,.04); renderIpad(); });
  } else {
    const why=u=> u.req&&!has(u.req) ? `Needs ${UPGRADES.find(x=>x.id===u.req).name} first` : u.minDay&&P.day<u.minDay ? `Unlocks after Day ${u.minDay}` : '';
    const list=UPGRADES.filter(u=>N.cat==='all'||u.cat===N.cat);
    L.innerHTML=`<div class="ipCats">${UPGRADE_CATS.map(([k,t])=>`<button data-c="${k}" class="${N.cat===k?'on':''}">${t}</button>`).join('')}</div>`+
      list.map(u=>{ const own=has(u.id), lock=own?'':why(u);
      return `<div class="ipItem${lock?' off':''}"><div class="ic"><canvas width="104" height="104" data-icon="${u.id}" style="width:52px;height:52px"></canvas></div><div><h4>${u.name}</h4><p>${u.desc}${lock?`<br><b>${lock}</b>`:''}</p></div>
        <button class="buy" data-u="${u.id}" ${own||lock||P.money<u.price?'disabled':''}>${own?'Owned':yen(u.price)}</button></div>`; }).join('');
    L.querySelectorAll('.ipCats button').forEach(b=>b.onclick=()=>{ N.cat=b.dataset.c; blip(600,.04); renderIpad(); $('#ipList').scrollTop=0; });
    L.querySelectorAll('canvas[data-icon]').forEach(cv=>drawIcon(cv));
    L.querySelectorAll('.buy').forEach(b=>b.onclick=()=>{ const u=UPGRADES.find(x=>x.id===b.dataset.u); if(has(u.id)||P.money<u.price||why(u)) return;
      P.money-=u.price; P.upgrades[u.id]=true;
      if(u.types){ const extra=shuffled(STOCK_KEYS.filter(k=>!N.market.includes(k))).slice(0,Math.max(0,UP.types()-N.market.length)); extra.forEach(k=>{ N.market.push(k); N.qty[k]=N.qty[k]||0; }); }   // tonight's delivery grows right away
      saveGame(); sfx('pay'); toast(`${u.name} installed!`); renderIpad(); });
  }
  const cost=marketCost(); $('#ipSum').innerHTML=`Ingredients <b>${yen(cost)}</b>${cost>P.money?' <span style="color:var(--marker)">· not enough money</span>':''}`;
  $('#btnPrep').disabled=cost>P.money; $('#btnPrep').innerHTML=cost>0?'Buy &amp; prep ▶':'Skip to sleep ▶';
}
function drawIcon(cv){ const c=cv.getContext('2d'); c.scale(2,2); const id=cv.dataset.icon;
  if(id==='tap'){ rr(c,8,8,22,36,6); fs(c,steel(c,8,30),2); rr(c,26,20,16,7,3); fs(c,'#c9cfd5',2); c.fillStyle='#e8a33a'; rr(c,35,28,4,16,2); c.fill(); }
  else if(id==='tebo'){ drawTebo(c,24,34,true,0); }
  else if(id==='bell'){ c.beginPath(); c.moveTo(12,36); c.quadraticCurveTo(12,12,26,12); c.quadraticCurveTo(40,12,40,36); c.closePath(); fs(c,vg(c,12,36,'#ffe58a','#e0a800'),2); ell(c,26,40,4,4,'#b07a10',2); }
  else if(id==='knife'){ c.beginPath(); c.moveTo(8,30); c.lineTo(40,14); c.lineTo(42,22); c.lineTo(14,34); c.closePath(); fs(c,steel(c,8,42),2); rr(c,2,30,14,7,3); fs(c,'#8b5a33',2); }
  else if(id==='doll'){ const im=new Image(); im.onload=()=>c.drawImage(im,4,4,44,46); im.src=ASSET_SRC.momo_happy; }
  else if(id==='lemon'){ const im=new Image(); im.onload=()=>c.drawImage(im,7,2,40,48); im.src=ASSET_SRC.lemon_water; }
  else if(id==='plush'||id==='fluffy'){ const f=id==='fluffy'; rr(c,5,f?16:20,42,f?28:22,f?14:9); fs(c,vg(c,16,44,f?'#ffd3e6':'#f6c08a',f?'#f29bc2':'#d98f4e'),2);
    [[6,f?17:21],[46,f?17:21],[6,f?43:41],[46,f?43:41]].forEach(([x,y])=>ell(c,x,y,3,3,f?'#e67fae':'#b8743a',1.5)); c.strokeStyle='rgba(91,58,46,.35)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(14,f?30:31); c.quadraticCurveTo(26,f?24:27,38,f?30:31); c.stroke();
    if(f){ c.fillStyle='rgba(255,255,255,.7)'; [[14,12],[38,10],[26,8]].forEach(([x,y])=>{ c.beginPath(); c.arc(x,y,2.4,0,7); c.fill(); }); } }
  else if(id==='tap2'){ rr(c,6,6,24,38,6); fs(c,vg(c,6,44,'#ffe58a','#d4a017'),2); rr(c,26,18,18,8,3); fs(c,'#ffd257',2); c.fillStyle='#e8a33a'; rr(c,36,27,5,18,2); c.fill(); txt(c,'2×',18,26,10,OUT,700); }
  else if(id==='tebo2'||id==='tebo3'){ drawTebo(c,22,34,true,0); txt(c,id==='tebo2'?'+':'★',42,14,id==='tebo2'?18:14,id==='tebo2'?'#3e8e3a':'#e0a800',700); }
  else if(id==='restore'){ ell(c,26,26,19,19,vg(c,7,45,'#d9c6ff','#8e63c4'),2); ell(c,26,26,13,13,'#fffaf0',2);
    c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.moveTo(26,26); c.lineTo(26,17); c.moveTo(26,26); c.lineTo(20,29); c.stroke();
    c.strokeStyle='#7fe3ff'; c.lineWidth=2.5; c.beginPath(); c.arc(26,26,23,3.6,5.6); c.stroke(); c.beginPath(); c.moveTo(43,8); c.lineTo(46,15); c.lineTo(39,15); c.closePath(); c.fillStyle='#7fe3ff'; c.fill(); }
  else if(id==='stock1'||id==='stock2'||id==='stock3'){ const n=id==='stock1'?1:id==='stock2'?2:3;
    for(let k=0;k<n;k++){ const y=38-k*11, x=10+k*3; rr(c,x,y,32,12,2); fs(c,vg(c,y,y+12,'#e2b27a','#b98249'),1.8); c.strokeStyle='rgba(91,58,46,.45)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(x+16,y); c.lineTo(x+16,y+12); c.stroke(); }
    txt(c,['4','8','16'][n-1],40,12,11,'#d2322d',700,'center',3,'#fff'); }
  else if(id==='inv'){ [['#e9645f',8],['#6aa84f',20],['#4f86c6',32],['#e0a800',44]].forEach(([col,x],k)=>{ rr(c,x-5,14+(k%2)*4,10,26,4); fs(c,col,1.8); }); rr(c,3,40,46,6,2); fs(c,'#8b5a33',1.5); txt(c,'+1',44,10,10,'#3e8e3a',700,'center',3,'#fff'); }
  else if(id==='mold'){ c.beginPath(); c.moveTo(8,20); c.lineTo(44,20); c.lineTo(38,42); c.lineTo(14,42); c.closePath(); fs(c,steel(c,8,44),2); ell(c,26,20,18,4,'#2d3a2b',2); txt(c,'140g',26,32,9,OUT,700); }
  else if(id==='boil1'||id==='boil2'||id==='boil3'){ rr(c,6,34,40,10,3); fs(c,'#5d646b',2); const n=id==='boil3'?4:id==='boil2'?3:2;
    for(let k=0;k<n;k++){ const x=26+(k-(n-1)/2)*12; c.beginPath(); c.moveTo(x-6,34); c.quadraticCurveTo(x-6,20,x,10); c.quadraticCurveTo(x+6,20,x+6,34); c.closePath(); fs(c,vg(c,10,34,'#ffd257','#e8582a'),1.5); } }
  else if(id==='noren'){ [0,1,2].forEach(i=>{ rr(c,6+i*14,8,12,34,3); fs(c,vg(c,8,42,'#c9a7e8','#8e63c4'),2); }); rr(c,3,6,46,5,2); fs(c,'#8b5a33',1.5); }
}
$('#tabMarket').onclick=()=>{ N.tab='market'; renderIpad(); };
$('#tabWare').onclick=()=>{ N.tab='ware'; renderIpad(); };
$('#btnPrep').onclick=()=>{ const cost=marketCost(); if(cost>P.money) return; P.money-=cost; saveGame(); if(cost>0) sfx('pay');
  N.queue=N.market.filter(k=>(N.qty[k]||0)>0); N.results=[]; if(!N.queue.length) endPrep(); else startPrep(N.queue.shift()); };
/* ingredients with no minigame tonight get the average of tonight's prep results */
function endPrep(){ const done=N.results, avg=done.length?Math.round(done.reduce((s,r)=>s+r.gain,0)/done.length):0; N.bonus={};
  STOCK_KEYS.filter(k=>!done.some(r=>r.key===k)).forEach(k=>{ if(avg>0){ P.stock[k]+=avg; N.bonus[k]=avg; } }); saveGame(); showSleep(); }
function showSleep(){
  showScene('night'); $('#report').hidden=true; $('#ipad').hidden=true; $('#sleep').hidden=false;
  $('#slLedger').innerHTML=STOCK_KEYS.map(k=>{ const r=N.results.find(x=>x.key===k), bn=(N.bonus||{})[k]; return `<span>${MARKET[k].name}</span><span>${P.stock[k]} ${MARKET[k].unit}${r?` <b class="pos">(+${r.gain})</b>`:bn?` <b class="pos">(+${bn} avg)</b>`:''}</span>`; }).join('')
    +`<span class="tot">Money</span><span class="tot">${yen(P.money)}</span>`;
  $('#btnSleep').textContent=`Sleep · start Day ${P.day+1} ▶`;
  $('#slNote').textContent=Object.keys(N.bonus||{}).length?`Ingredients you didn't prep tonight got the average of tonight's prep (+${Object.values(N.bonus)[0]}).`:'';
}
$('#btnSleep').onclick=()=>{ P.day++; saveGame(); goHome(); startDay(); };
$('#btnSleepHome').onclick=()=>{ P.day++; saveGame(); goHome(); };
function gameOver(){
  showScene('over');
  $('#ovSub').textContent=`もも屋 ran for ${P.day} day${P.day>1?'s':''}. Popo says rent comes first!`;
  $('#ovLedger').innerHTML=`<span>Bowls served</span><span>${P.served}</span><span>Ramen Book</span><span>${Object.keys(P.book).length} bowls</span>`;
}
$('#btnRestart').onclick=()=>{ P={...freshSave(P.book,P.tutorialDone,P.seen),endlessBest:P.endlessBest||0}; saveGame(); goHome(); };

/* =====================================================================
   18. PREP MINIGAMES (placeholder art — swap in sprites later)
   ===================================================================== */
const PR={s:1,key:null,g:null,t:0,work:0,ending:false};
const pcv=document.getElementById('pCanvas'), pctx=pcv.getContext('2d');
function pStage(e){ const r=pcv.getBoundingClientRect(); return {x:(e.clientX-r.left)*400/r.width, y:(e.clientY-r.top)*820/r.height}; }
function pflash(s,bad){ const f=$('#pFlash'); f.textContent=s; f.className='on'+(bad?' bad':''); clearTimeout(pflash.t); pflash.t=setTimeout(()=>f.className='',420); }
function board(c){ shadow(c,200,540,176,10,.3); rr(c,24,330,352,206,18); fs(c,vg(c,330,536,'#ecc690','#c99a62'),3);
  c.save(); c.globalAlpha=.18; c.strokeStyle='#7a4f2a'; c.lineWidth=1.5; for(let y=346;y<526;y+=16){ c.beginPath(); c.moveTo(34,y); c.quadraticCurveTo(200,y+((y/16)%2?5:-5),366,y); c.stroke(); } c.restore(); }
const PREP={
  chashu:{ title:'Slice the chashu', hint:'Tap when the knife meets a dotted line. Even slices = more portions.',
    init:()=>({x:226,v:58,len:340,guides:[...Array(12)].map((_,i)=>({o:(i+1)*26,cut:0})),chop:0,done:false}),
    update(g,dt){ g.x-=g.v*dt; g.chop=Math.max(0,g.chop-dt*6);
      g.guides.forEach(q=>{ if(!q.cut && g.x+q.o<182){ q.cut=3; pflash('Missed!',true); blip(200,.1); } });
      if(g.guides.every(q=>q.cut)) g.done=true; },
    down(g){ g.chop=1; const tol=has('knife')?1.6:1; let best=null,bd=1e9;
      g.guides.forEach(q=>{ if(q.cut) return; const d=Math.abs(g.x+q.o-200); if(d<bd){bd=d;best=q;} });
      if(!best||bd>30) { blip(240,.05); return; }
      sfx('meat',{rate:.95+Math.random()*.1});
      if(bd<=6*tol){ best.cut=1; pflash('Perfect!'); blip(880,.08); } else if(bd<=13*tol){ best.cut=2; pflash('Good'); blip(660,.08); } else { best.cut=3; pflash('Uneven',true); blip(300,.1); } },
    progress:g=>g.guides.filter(q=>q.cut).length/12, stat:g=>`Slices ${g.guides.filter(q=>q.cut).length}/12 · perfect ${g.guides.filter(q=>q.cut===1).length}`,
    score:g=>g.guides.reduce((a,q)=>a+(q.cut===1?1:q.cut===2?.6:0),0)/12,
    draw(c,g,t){ board(c); const R=IMG.pp_chashu_roll, SL=IMG.pp_chashu_slice; if(!ok(R)) return;
      const h=g.len*R.height/R.width, y=432-h/2, bounds=[0,...g.guides.map(q=>q.o),g.len];
      // slices already cut fall onto a pile on the left of the board
      const cut=g.guides.filter(q=>q.cut&&q.cut<3).length, bad=g.guides.filter(q=>q.cut===3).length;
      for(let k=0;k<cut;k++) drawSprite(c,SL,70+(k%4)*18,488-Math.floor(k/4)*10,58,-.3+(k%3)*.2);
      for(let k=0;k<bad;k++){ c.save(); c.globalAlpha=.75; drawSprite(c,SL,330-(k%3)*16,498,40,.6); c.restore(); }
      // the roll that is still whole
      let first=bounds.length-2; for(let i=0;i<bounds.length-1;i++){ const q=g.guides[i]; if(!q||!q.cut){ first=i; break; } }
      const sx0=bounds[first]/g.len*R.width, x0=g.x+bounds[first];
      c.drawImage(R,sx0,0,R.width-sx0,R.height,x0,y,g.len-bounds[first],h);
      if(first>0 && ok(SL)) c.drawImage(SL,x0-12,y+2,26,h-4);
      g.guides.forEach(q=>{ if(q.cut) return; const x=g.x+q.o; c.save(); c.setLineDash([5,5]); c.strokeStyle='rgba(255,255,255,.95)'; c.lineWidth=2.5; c.beginPath(); c.moveTo(x,y-8); c.lineTo(x,y+h+8); c.stroke(); c.restore(); });
      const ky=g.chop*40; rr(c,192,258+ky,16,120,3); fs(c,steel(c,192,208),2.5); rr(c,188,226+ky,24,40,6); fs(c,vg(c,226,266,'#a0703f','#6b4423'),2.5);
      c.save(); c.globalAlpha=.25; c.fillStyle='#fff'; c.fillRect(197,262+ky,3,110); c.restore(); } },

  green:{ title:'Dice the green onion', hint:'Tap as fast as you can before time runs out!',
    init:()=>({chops:0,goal:36,time:7,t:0,chop:0,done:false,rings:[]}),
    update(g,dt){ g.t+=dt; g.chop=Math.max(0,g.chop-dt*9); if(g.t>=g.time||g.chops>=g.goal) g.done=true; },
    down(g){ if(g.done) return; g.chops++; g.chop=1; sfx('green',{rate:.92+Math.random()*.16,vol:.85});
      g.rings.push({x:250+Math.random()*90,y:440+Math.random()*70,r:5+Math.random()*3}); },
    progress:g=>Math.min(1,g.chops/g.goal), stat:g=>`Chops ${g.chops}/${g.goal} · ${Math.max(0,g.time-g.t).toFixed(1)}s`,
    score:g=>Math.min(1,g.chops/g.goal),
    draw(c,g,t){ board(c); const W_=IMG.pp_green_whole, Dd=IMG.pp_green_diced, k=Math.min(1,g.chops/g.goal);
      const full=250, len=full*(1-k), x1=40+len, h=ok(W_)?full*W_.height/W_.width:60;
      if(ok(W_) && len>2) c.drawImage(W_,0,0,W_.width*(1-k),W_.height,40,430-h/2,len,h);
      if(ok(Dd) && g.chops>0){ const w=60+110*Math.sqrt(k); drawSprite(c,Dd,308,452,w,0); }
      g.rings.slice(-6).forEach(r=>{ r.y+=1.2; ell(c,r.x-40,r.y-30,r.r,r.r*.8,'#6cc24a',1.5,'#2f6e22'); });
      const ky=g.chop*30; rr(c,x1+2,330+ky,14,100,3); fs(c,steel(c,x1+2,x1+16),2.5); rr(c,x1-2,296+ky,22,40,6); fs(c,vg(c,296,336,'#a0703f','#6b4423'),2.5); } },

  white:{ title:'Dice the white onion', hint:'Swipe straight across the onion: 3 cuts down, 3 cuts across.',
    init:()=>({v:0,h:0,messy:0,time:11,t:0,cuts:[],start:null,cur:null,done:false}),
    update(g,dt){ g.t+=dt; if(g.t>=g.time||(g.v>=3&&g.h>=3)) g.done=true; },
    down(g,p){ g.start=p; g.cur=p; }, move(g,p){ if(g.start) g.cur=p; },
    up(g,p){ const s=g.start; g.start=null; if(!s) return; const dx=p.x-s.x, dy=p.y-s.y;
      const vert=Math.abs(dy)>Math.abs(dx);
      const okV=vert && Math.min(s.y,p.y)<356 && Math.max(s.y,p.y)>504 && Math.abs(dx)<46 && g.v<3;
      const okH=!vert && Math.min(s.x,p.x)<96 && Math.max(s.x,p.x)>304 && Math.abs(dy)<40 && g.h<3;
      if(okV||okH){ okV?g.v++:g.h++; g.cuts.push({a:s,b:p}); pflash('Clean cut!'); sfx('white'); }
      else if(Math.hypot(dx,dy)>40){ g.messy++; g.cuts.push({a:s,b:p,bad:1}); pflash('Messy…',true); sfx('white',{rate:.85}); } },
    progress:g=>(g.v+g.h)/6, stat:g=>`Down ${g.v}/3 · Across ${g.h}/3 · ${Math.max(0,g.time-g.t).toFixed(1)}s`,
    score:g=>Math.max(0,(g.v+g.h)/6-g.messy*.08),
    draw(c,g,t){ board(c); const W_=IMG.pp_white_whole, Dd=IMG.pp_white_diced, k=(g.v+g.h)/6;
      c.save(); c.globalAlpha=1-k*.85; drawSprite(c,W_,200,430,250,0); c.restore();
      c.save(); c.beginPath(); c.ellipse(200,430,104,80,0,0,6.29); c.clip();
      g.cuts.forEach(q=>{ c.strokeStyle=q.bad?'rgba(210,50,45,.6)':'rgba(120,95,60,.85)'; c.lineWidth=q.bad?3:2.5; c.beginPath(); c.moveTo(q.a.x,q.a.y); c.lineTo(q.b.x,q.b.y); c.stroke(); }); c.restore();
      if(k>0){ c.save(); c.globalAlpha=k; drawSprite(c,Dd,200,436,90+130*k,0); c.restore(); }
      [150,200,250].forEach(x=>{ c.fillStyle='rgba(210,50,45,.75)'; c.beginPath(); c.moveTo(x-6,336); c.lineTo(x+6,336); c.lineTo(x,346); c.fill(); });
      [400,430,460].forEach(y=>{ c.fillStyle='rgba(210,50,45,.75)'; c.beginPath(); c.moveTo(62,y-6); c.lineTo(62,y+6); c.lineTo(72,y); c.fill(); });
      if(g.start&&g.cur){ c.save(); c.setLineDash([6,6]); c.strokeStyle='#d2322d'; c.lineWidth=3; c.beginPath(); c.moveTo(g.start.x,g.start.y); c.lineTo(g.cur.x,g.cur.y); c.stroke(); c.restore(); } } },

  nori:{ title:'Toast the seaweed', hint:'Hold to toast · let go when the gauge is in the crisp zone.',
    init:()=>({n:4,res:[],toast:0,hold:false,wait:0,done:false}),
    update(g,dt){ if(g.wait>0){ g.wait-=dt; if(g.wait<=0){ g.toast=0; if(g.res.length>=g.n) g.done=true; } return; }
      if(g.hold){ g.toast+=dt*.55; if(g.toast>=1.05) this.release(g); } },
    down(g){ if(g.wait<=0 && g.res.length<g.n){ g.hold=true; sfxStop(g.fry); g.fry=sfx('seaweed',{loop:true,vol:.8}); } }, up(g){ if(g.hold) this.release(g); },
    release(g){ g.hold=false; sfxStop(g.fry,.25); g.fry=null; const t=g.toast, q=(t>=.62&&t<=.82)?1:(t>=.5&&t<=.92)?.6:0; g.res.push(q); g.wait=.7;
      pflash(q===1?'Crisp!':q?'Okay':t<.5?'Still raw':'Burnt!',!q); blip(q===1?990:q?660:220,.12); },
    progress:g=>g.res.length/g.n, stat:g=>`Sheet ${Math.min(g.n,g.res.length+1)}/${g.n}`,
    score:g=>g.res.reduce((a,b)=>a+b,0)/g.n,
    draw(c,g,t){ const tt=Math.min(1.05,g.toast);
      rr(c,40,470,320,40,8); fs(c,vg(c,470,510,'#4a4f56','#2b2f34'),3);
      if(g.hold) for(let k=0;k<7;k++){ const x=90+k*36, f=Math.sin(t*20+k)*4; c.beginPath(); c.moveTo(x-8,470); c.quadraticCurveTo(x,440-f,x+8,470); fs(c,k%2?'#5aa9ff':'#ffb347',0); }
      ell(c,200,440,128,50,vg(c,390,490,'#4b4b50','#1f1f22'),3); ell(c,200,436,110,40,'#2b2b2f',2);
      rr(c,322,428,78,16,8); fs(c,'#6b4423',3);
      c.save(); c.translate(200,434); c.scale(1,.42); c.rotate(-.06);
      drawSprite(c,IMG.pp_nori_plain,0,0,150,0); c.globalAlpha=Math.min(1,tt/.72); drawSprite(c,IMG.pp_nori_oiled,0,0,150,0);
      if(tt>.82){ c.globalAlpha=Math.min(.85,(tt-.82)/.23); rr(c,-75,-64,150,128,4); c.fillStyle='#1a120a'; c.fill(); } c.restore();
      if(g.hold){ c.save(); for(let k=0;k<3;k++){ const ph=(t*.8+k*.33)%1; c.globalAlpha=(1-ph)*.4; ell(c,170+k*30,410-ph*60,10+ph*10,7+ph*7,'#fff'); } c.restore(); }
      const gx=50,gw=300,gy=560; rr(c,gx,gy,gw,18,9); fs(c,'#fff',2.5);
      c.fillStyle='#ffe27a'; c.fillRect(gx+gw*.5/1.05,gy+2,gw*.42/1.05,14); c.fillStyle='#8fd06a'; c.fillRect(gx+gw*.62/1.05,gy+2,gw*.2/1.05,14);
      rr(c,gx,gy,gw,18,9); fs(c,null,2.5); const nx=gx+gw*tt/1.05; rr(c,nx-3,gy-6,6,30,3); fs(c,'#d2322d',1.5,'#fff');
      txt(c,'raw',gx+16,gy+32,10,'#fff',600); txt(c,'crisp',gx+gw*.72/1.05,gy+32,10,'#c9f3b0',700); txt(c,'burnt',gx+gw-20,gy+32,10,'#fff',600);
      g.res.forEach((q,i)=>{ rr(c,40+i*30,300,24,18,3); fs(c,q===1?'#2f6a3a':q?'#4f6a3a':'#1a130c',2); }); } },

  noodle:{ title:'Bundle the noodles', hint:'Hold to gather noodles on the scale · let go at 140 g.',
    init:()=>({n:8,res:[],grams:0,hold:false,wait:0,done:false}),
    update(g,dt){ if(g.wait>0){ g.wait-=dt; if(g.wait<=0){ g.grams=0; if(g.res.length>=g.n) g.done=true; } return; }
      if(g.hold){ g.grams+=dt*(55+g.grams*.6)*(has('mold')&&g.grams>110&&g.grams<150?.2:1); if(g.grams>260) this.release(g); } },
    down(g){ if(g.wait<=0 && g.res.length<g.n) g.hold=true; }, up(g){ if(g.hold) this.release(g); },
    release(g){ g.hold=false; const d=Math.abs(g.grams-140), q=d<=6?1:d<=15?.6:0; g.res.push(q); g.wait=.45; pflash(q===1?`${Math.round(g.grams)} g · Perfect!`:q?`${Math.round(g.grams)} g · Close`:`${Math.round(g.grams)} g · Way off`,!q); blip(q===1?990:q?660:220,.1); },
    progress:g=>g.res.length/g.n, stat:g=>`Bundles ${g.res.length}/${g.n}`,
    score:g=>g.res.reduce((a,b)=>a+b,0)/g.n,
    draw(c,g,t){ board(c);
      drawSprite(c,IMG.pp_noodles_raw,110,440,160,0); drawSprite(c,IMG.pp_noodles_raw,100,416,130,.1);
      rr(c,232,470,124,46,8); fs(c,vg(c,470,516,'#eef1f3','#b5bcc2'),3); rr(c,258,482,72,24,4); fs(c,'#2d3a2b',2);
      txt(c,Math.round(g.grams)+' g',294,494,14,Math.abs(g.grams-140)<=6?'#b6f28e':'#e9f5d0',700);
      ell(c,294,466,60,14,vg(c,452,480,'#fff','#d9dde0'),3);
      if(g.grams>0){ const w=30+g.grams*.45; drawSprite(c,IMG.pp_noodles_raw,294,458-w*.12,w,0); }
      rr(c,262,350,64,24,6); fs(c,'#fff36b',2); txt(c,'140 g',294,362,12,OUT,700);
      g.res.forEach((q,i)=>{ drawBundle(c,40+i*42,300,38); if(!q){ c.strokeStyle='#d2322d'; c.lineWidth=3; c.beginPath(); c.moveTo(28+i*42,290); c.lineTo(52+i*42,310); c.stroke(); } }); } },
};
function mixC(a,b,k){ k=Math.max(0,Math.min(1,k)); const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const A=p(a),B=p(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join(''); }
const PREP_INTRO={   // shown the first time each prep minigame comes up
  chashu:{img:'pp_chashu_roll', text:'The chashu roll slides under the knife. <b>Tap when the knife lines up with a white dotted line.</b> Perfect cuts keep every slice; uneven or missed cuts waste meat.'},
  green:{img:'pp_green_whole', text:'Dice the whole stalk before the timer runs out. <b>Tap as fast as you can</b> — every tap is one chop.'},
  white:{img:'pp_white_whole', text:'<b>Swipe straight across the onion</b>, starting and ending outside it: 3 cuts top-to-bottom (follow the red arrows) and 3 cuts side-to-side. Wobbly swipes count as messy.'},
  nori:{img:'pp_nori_oiled', text:'<b>Hold anywhere to toast the nori</b> and let go when the needle is in the green crisp zone. Too early is raw, too late is burnt. 4 sheets.'},
  noodle:{img:'pp_noodles_raw', text:'<b>Hold to gather noodles onto the scale</b> and let go at 140 g. It speeds up as it gets heavier! 8 bundles.'},
};
function startPrep(key){ showScene('prep'); PR.key=key; PR.g=PREP[key].init(); PR.t=0; PR.work=0; PR.ending=false; $('#pDone').hidden=true;
  P.seen=P.seen||{}; PR.paused=!P.seen['prep_'+key]; $('#pIntro').hidden=!PR.paused;
  if(PR.paused){ $('#piImg').src=ASSET_SRC[PREP_INTRO[key].img]; $('#piTitle').textContent=PREP[key].title; $('#piText').innerHTML=PREP_INTRO[key].text; }
  $('#pTitle').textContent=PREP[key].title; $('#pHint').textContent=PREP[key].hint; $('#pCount').textContent=`Prep ${N.results.length+1}/${N.results.length+1+N.queue.length}`; }
function prepFrame(dt){
  const g=PR.g, M_=PREP[PR.key]; PR.t+=dt; PR.work=Math.max(0,PR.work-dt*2);
  if(g.hold) PR.work=1;
  if(PR.paused){} else if(!g.done) M_.update(g,dt); else if(!PR.ending){ PR.ending=true; setTimeout(finishPrep,700); }
  $('#pBar').style.width=(M_.progress(g)*100)+'%'; $('#pStat').textContent=M_.stat(g);
  const c=pctx, dpr=Math.min(2.5,window.devicePixelRatio||1), S=PR.s*dpr;
  if(pcv.width!==Math.round(400*S)){ pcv.width=Math.round(400*S); pcv.height=Math.round(820*S); }
  c.setTransform(S,0,0,S,0,0); c.clearRect(0,0,400,820);
  // night kitchen
  // the same kitchen after closing, lights on, night outside the window
  drawKitchenBG(c,0,400); drawShelf(c,3);
  rr(c,272,166,104,82,8); fs(c,vg(c,166,248,'#28306b','#4a4f93'),3); ell(c,344,190,12,12,'#fff6d6',0); [[292,180],[318,224],[358,228],[300,210]].forEach(([x,y])=>ell(c,x,y,1.6,1.6,'#fff',0));
  c.beginPath(); c.moveTo(266,160); c.quadraticCurveTo(298,196,284,254); c.lineTo(266,254); c.closePath(); fs(c,vg(c,160,254,'#f6dcae','#e3bb82'),2.5);
  c.beginPath(); c.moveTo(382,160); c.quadraticCurveTo(350,196,364,254); c.lineTo(382,254); c.closePath(); fs(c,vg(c,160,254,'#f6dcae','#e3bb82'),2.5);
  rr(c,262,154,124,10,4); fs(c,'#a8743f',2.5);
  const lg=c.createRadialGradient(200,190,20,200,330,360); lg.addColorStop(0,'rgba(255,224,160,.5)'); lg.addColorStop(1,'rgba(255,224,160,0)'); c.fillStyle=lg; c.fillRect(0,120,400,560);
  M_.draw(c,g,PR.t);
  drawMomoAt(c,{cx:200,top:566-Math.abs(Math.sin(PR.t*4.4))*5,w:300,t:PR.t,work:PR.work});
}
function finishPrep(){
  const key=PR.key, p=Math.max(0,Math.min(1,PREP[key].score(PR.g))), q=N.qty[key], gain=Math.round(MARKET[key].base*q*(0.5+0.5*p)*ECON.PREP_YIELD);
  P.stock[key]+=gain; N.results.push({key,gain,p}); saveGame();
  $('#pdTitle').textContent=`+${gain} ${MARKET[key].name.toLowerCase()} ${MARKET[key].unit}`;
  $('#pdSub').textContent= p>=.9?'Perfect prep, nothing wasted.': p>=.6?'Nice work. A little went to waste.':'Messy… quite a bit went to waste.';
  $('#pDone').hidden=false; $('#btnPrepNext').textContent=N.queue.length?'Next prep ▶':'Done ▶';
}
$('#btnPrepGo').onclick=()=>{ P.seen['prep_'+PR.key]=true; saveGame(); $('#pIntro').hidden=true; PR.paused=false; blip(800,.08); };
$('#btnPrepNext').onclick=()=>{ if(N.queue.length) startPrep(N.queue.shift()); else endPrep(); };
pcv.addEventListener('pointerdown',e=>{ if(!PR.g||PR.g.done||PR.paused) return; try{pcv.setPointerCapture(e.pointerId)}catch(_){} PR.work=1; const M_=PREP[PR.key]; M_.down&&M_.down(PR.g,pStage(e)); });
pcv.addEventListener('pointermove',e=>{ if(!PR.g) return; const M_=PREP[PR.key]; M_.move&&M_.move(PR.g,pStage(e)); });
['pointerup','pointercancel'].forEach(ev=>pcv.addEventListener(ev,e=>{ if(!PR.g) return; const M_=PREP[PR.key]; M_.up&&M_.up(PR.g,pStage(e)); }));
/* Momo from behind for the prep scene (same arms as the kitchen) */
function drawMomoAt(c,{cx,top,w,t,work}){ const im=IMG.momo_body; if(!ok(im)) return; const H=w*im.height/im.width, left=cx-.57*w;
  drawArmsBack(c,left,top,w,H,work,t);
  c.drawImage(im,left,top,w,H); }

/* =====================================================================
   19. RAMEN BOOK — uses the 1024px atlas sheets when they sit next to the game
   ===================================================================== */
const OPTN={dashi:['light','medium','heavy'],rich:['none','smooth','normal','rich','extra-rich']};
const ATLAS={}, thumbCv=document.createElement('canvas'); thumbCv.width=thumbCv.height=512;
function atlas(path){ if(!ATLAS[path]){ const A={im:new Image(),ok:null,wait:[]}; ATLAS[path]=A;
  A.im.onload=()=>{ A.ok=true; A.wait.splice(0).forEach(f=>f(true)); }; A.im.onerror=()=>{ A.ok=false; A.wait.splice(0).forEach(f=>f(false)); }; A.im.src=path; } return ATLAS[path]; }
function drawThumb(cv,id,o){
  const idx=id%3840, page=String(Math.floor(idx/64)).padStart(2,'0'), local=idx%64;
  const A=atlas(`${ATLAS_DIR}ramen-${OPTN.dashi[o.dashi]}-${OPTN.rich[o.richness]}-${page}.png`);
  const go=okk=>{ const c=cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height);
    if(okk) c.drawImage(A.im,(local%8)*128,Math.floor(local/8)*128,128,128,0,0,cv.width,cv.height);
    else { drawRamen(thumbCv,bowlFromPack(o)); c.drawImage(thumbCv,0,0,cv.width,cv.height); } };
  if(A.ok===null) A.wait.push(go); else go(A.ok);
}
function openBook(){
  showScene('book'); const ent=Object.entries(P.book).sort((a,b)=>(b[1].at||0)-(a[1].at||0));
  $('#bookCount').textContent=`${ent.length} / 57,600 bowls`;
  const grid=$('#bookGrid');
  if(!ent.length){ grid.innerHTML='<div id="bookEmpty">No bowls yet. Every different bowl you serve gets a page here.</div>'; return; }
  grid.innerHTML=ent.map(([id,e])=>{ const o=e.o; const gl=GARLIC_LIST[o.garlic], on=['Green','White','No onion','Both onions'][o.onion];
    return `<div class="bk"><canvas width="184" height="184" data-id="${id}"></canvas><div class="l1">${DASHI_NAME[o.dashi]} · ${RICH_NAME[o.richness]}</div>
      <div class="l2">${FIRM_NAME[o.texture]} · spice ${o.spice}<br>${gl} garlic · ${on}${o.chashu?' · chashu':''}${o.seaweed?' · nori':''}</div><div class="best">Best ${e.best} · ×${e.n}</div></div>`; }).join('');
  grid.querySelectorAll('canvas[data-id]').forEach(cv=>{ const id=+cv.dataset.id; drawThumb(cv,id,P.book[id].o); });
}


/* =====================================================================
   20. TOSS NOODLES + TUTORIAL
   ===================================================================== */
function tossNoodles(){ const b=G.bowl, nd=b.nood; if(!['boiling','lifted','bowl'].includes(nd.state)) return;
  const wasBowl=nd.state==='bowl'; b.nood={state:'none',start:0,time:null,water:1,flicks:0}; K.dirty=true; K.hand=null; if(K.M&&K.M.t==='tebo') K.M=null;
  if(has('restore')){   // Dr Mo's time machine: the bundle is raw again and goes back in the box
    giveStock('noodle'); for(let k=0;k<18;k++){ const a=k/18*6.283; K.parts.push({x:(wasBowl?BROTH.x:K.px0+286)+Math.cos(a)*40,y:(wasBowl?BROTH.y:340)+Math.sin(a)*40,vx:-Math.sin(a)*120,vy:Math.cos(a)*120-60,r:3.5,col:k%2?'#b58cff':'#7fe3ff',life:.7,g:0,stopY:820}); }
    blip(880,.12,'sine'); setTimeout(()=>blip(440,.14,'sine'),90); toast("Dr Mo's time machine! The noodles are raw again."); return; }
  for(let k=0;k<12;k++) K.parts.push({x:(wasBowl?BROTH.x:K.px0+286)-30+Math.random()*60,y:(wasBowl?BROTH.y:340),vx:(Math.random()-.5)*160,vy:-120-Math.random()*80,r:3,col:'#f1d27a',life:.8,g:900,stopY:820});
  blip(220,.15,'sawtooth',.05); toast(stockOf('noodle')>0?'Noodles tossed. Drop in a fresh bundle!':'Noodles tossed… and no bundles left!'); }
const TUT=[
  {t:"Dashi “Medium” means 2 scoops of tare. Tap the tare pot twice, or drag the ladle into the bowl.", done:b=>b.tare===2},
  {t:"Hold the stock tap until the soup reaches the dashed line. Then shake the back fat over the bowl 3 times for “Rich”.", done:b=>Math.abs(b.soup-CFG.SOUP_TARGET)<=CFG.SOUP_TOL && b.fat===3},
  {t:"Garlic “1 clove” is 4 scoops. The card on the wall lists every amount.", done:b=>b.garlic===4},
  {t:"Spice 2 = 2 scoops of chili oil.", done:b=>b.spice===2},
  {t:"Drop a bundle into the boiler. Lift the basket when the needle is in “Firm”, flick it down to drain, then drag it to the bowl. Messed up? Toss the noodles and try again.", done:b=>b.nood.state==='bowl'},
  {t:"Toppings: green onion and chashu into the bowl.", done:b=>b.green&&!b.white&&b.chashu},
  {t:"Seaweed yes, rice no. Then tap Momo to serve!", done:b=>b.nori&&!b.rice},
];
const tutStepDone=()=>G.tut && TUT[K.stn] ? TUT[K.stn].done(G.bowl) : false;
let tutKey='';
function tutKitchen(){
  const step=TUT[K.stn], done=step.done(G.bowl), allDone=TUT.every(s=>s.done(G.bowl)), key=K.stn+'|'+done+'|'+allDone;
  $('#coach').hidden=false;
  $('#btnNext').classList.toggle('pulse', done && K.stn<6);
  $('#serveHint').classList.toggle('pulse', allDone || (K.stn===6 && done));
  if(key===tutKey) return; tutKey=key;
  $('#coachStep').textContent=`TUTORIAL · STEP ${K.stn+1}/7`;
  $('#coachTxt').innerHTML = step.t + (done ? (K.stn<6 ? ' <b class="ok">Done! Tap › or swipe to the next step.</b>' : ' <b class="ok">Done!</b>') : '');
  if(done) blip(990,.1,'sine');
}

/* =====================================================================
   20b. PAUSE — continue, restart the day, or save and go home
   ===================================================================== */
function pauseGame(){ if(G.paused) return; G.paused=true; G.pausedAt=performance.now(); K.pour=false; K.hand=null; K.pan=null;
  const story=G.play==='story';
  $('#psSub').textContent = story ? `Day ${P.day} · customer ${Math.min(D.done+1,D.n)}/${D.n} · ${yen(P.money)}` : G.play==='endless' ? `Endless · ${E.served} bowls · ${yen(E.money)}` : 'Tutorial';
  $('#btnRestartDay').textContent = story ? `Restart Day ${P.day}` : G.play==='endless' ? 'Restart endless' : 'Restart tutorial';
  $('#btnSaveHome').innerHTML = story ? 'Save &amp; go home' : 'Go home';
  $('#pause').hidden=false; blip(500,.06); }
function resumeGame(){ if(!G.paused) return; const away=performance.now()-G.pausedAt, nd=G.bowl&&G.bowl.nood;
  if(nd && nd.state==='boiling') nd.start+=away;                     // the noodles did not cook while paused
  G.paused=false; $('#pause').hidden=true; last=performance.now(); blip(700,.06); }
$('#btnPause').onclick=pauseGame;
$('#btnResume').onclick=resumeGame;
$('#btnRestartDay').onclick=()=>{ const mode=G.play;
  if(mode==='story' && P.dayStart && P.dayStart.day===P.day){ P.money=P.dayStart.money; P.stock={...P.dayStart.stock}; P.served=P.dayStart.served; }
  P.resume=null; saveGame(); goHome();
  if(mode==='story') startDay(); else if(mode==='endless') startEndless(); else startTutorial(); };
$('#btnSaveHome').onclick=()=>{ if(G.play==='story'){ P.resume={day:P.day,D:{...D}}; saveGame(); toast(`Saved · Day ${P.day}, customer ${Math.min(D.done+1,D.n)}/${D.n}`); } goHome(); };
document.addEventListener('visibilitychange',()=>{ if(document.hidden && G.mode==='service' && (G.scene==='shop'||G.scene==='kitchen')) pauseGame(); });

/* =====================================================================
   21. BOOT
   ===================================================================== */
$('#btnDay').onclick=startDay;
$('#btnEndless').onclick=startEndless;
$('#hotTray').onclick=()=>{ blip(620,.06); refreshHome(); $('#modeSheet').classList.add('on'); };
$('#hotChop').onclick=()=>{ blip(620,.06); openBook(); };
$('#hotDrink').onclick=()=>{ blip(620,.06); startTutorial(); };
$('#btnModeClose').onclick=()=>$('#modeSheet').classList.remove('on');
$('#btnToss').onclick=tossNoodles;
// app icon (home screen / tab) — for GitHub Pages you can also link the icon PNGs in <head>
(function(){ const add=(rel,href,sizes)=>{ const l=document.createElement('link'); l.rel=rel; l.href=href; if(sizes) l.sizes=sizes; document.head.appendChild(l); };
  add('icon','assets/app_icon.webp'); add('apple-touch-icon','assets/app_icon180.png','180x180');
  const m=document.createElement('meta'); m.name='apple-mobile-web-app-title'; m.content='Momo-ya'; document.head.appendChild(m); })();
$('#btnBookBack').onclick=goHome;
$('#btnReset').onclick=()=>{ const b=$('#btnReset');
  if(b.dataset.arm==='1'){ P={...freshSave(P.book,P.tutorialDone,P.seen),endlessBest:P.endlessBest||0}; saveGame(); refreshHome(); b.dataset.arm=''; b.textContent='Start a new story'; toast('New game started (your Ramen Book is kept)'); return; }
  b.dataset.arm='1'; b.textContent='Tap again to reset money, stock and upgrades'; setTimeout(()=>{ b.dataset.arm=''; b.textContent='Start a new story'; },2500); };
$('#btnToKitchen').onclick=toKitchen;
$('#btnEat').onclick=eat;
$('#btnNextCust').onclick=nextCustomer;
$('#btnPrev').onclick=()=>goStation(K.stn-1);
$('#btnNext').onclick=()=>goStation(K.stn+1);
$('#boilChip').onclick=()=>goStation(NOODLE_STEP);
$('#btnRemake').onclick=()=>{ const bt=$('#btnRemake');
  if(K.remakeArm>performance.now()){ G.bowl=newBowl(); K.dirty=true; K.M=null; K.hand=null; bt.textContent='Remake'; toast('Fresh bowl (used toppings are gone)'); return; }
  K.remakeArm=performance.now()+2200; bt.textContent='Tap again'; setTimeout(()=>{ bt.textContent='Remake'; },2200); };
$('#kTicket').addEventListener('click',()=>{ ticketMini=!ticketMini; renderTicket($('#kTicket'),G.order,ticketMini); });
addEventListener('resize',()=>{ layoutAll(); if(G.order&&G.scene==='kitchen') renderTicket($('#kTicket'),G.order,ticketMini); });
function shade(hex,k){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255; const t=k<0?0:255,p=Math.abs(k);
  r=Math.round(r+(t-r)*p); g=Math.round(g+(t-g)*p); b=Math.round(b+(t-b)*p); return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
const LOGO_IMG=new Image(); LOGO_IMG.onload=()=>drawShopTop(); LOGO_IMG.src='assets/logo.webp';
function drawShopTop(){
  const c=$('#shopTop').getContext('2d'), HT=TOP_H; c.clearRect(0,0,900,HT);
  // plaster wall continuing up from the scene below
  c.fillStyle=vg(c,0,HT,'#e4cfae','#f6ead6'); c.fillRect(0,0,900,HT);
  const R=mulberry(14); c.fillStyle='rgba(120,80,40,.05)'; for(let i=0;i<520;i++) c.fillRect(R()*900,R()*HT,2,2);
  const rg=c.createRadialGradient(450,330,30,450,330,460); rg.addColorStop(0,'rgba(255,226,170,.45)'); rg.addColorStop(1,'rgba(255,226,170,0)'); c.fillStyle=rg; c.fillRect(0,0,900,HT);
  // ceiling + beam + posts
  c.fillStyle=vg(c,0,70,'#2e1b10','#4a2e1c'); c.fillRect(0,0,900,70);
  c.save(); c.globalAlpha=.22; c.strokeStyle='#120a05'; c.lineWidth=2; for(let y=12;y<66;y+=13){ c.beginPath(); c.moveTo(0,y); for(let x=0;x<900;x+=90) c.quadraticCurveTo(x+45,y+((x/90)%2?3:-3),x+90,y); c.stroke(); } c.restore();
  rr(c,-10,62,920,26,6); fs(c,vg(c,62,88,'#7a4f2a','#563519'),3,'#24140a');
  [0,860].forEach(x=>{ c.fillStyle=hg(c,x,x+40,'#5a3a22','#3e2716','#6b4628'); c.fillRect(x,88,40,HT-88); c.strokeStyle='#24140a'; c.lineWidth=3; c.strokeRect(x+1.5,88,37,HT-88); });
  // round paper lamps
  [150,750].forEach(x=>{ const cy=172; c.strokeStyle='#24140a'; c.lineWidth=3; c.beginPath(); c.moveTo(x,88); c.lineTo(x,118); c.stroke();
    const gl=c.createRadialGradient(x,cy,10,x,cy,150); gl.addColorStop(0,'rgba(255,214,140,.55)'); gl.addColorStop(1,'rgba(255,214,140,0)'); c.fillStyle=gl; c.fillRect(x-160,40,320,300);
    rr(c,x-18,114,36,11,4); fs(c,'#2b1a10',3);
    ell(c,x,cy,52,52,null); const lg=c.createRadialGradient(x-12,cy-14,8,x,cy,60); lg.addColorStop(0,'#fffaf0'); lg.addColorStop(.7,'#ffe3b0'); lg.addColorStop(1,'#f0c27a'); c.fillStyle=lg; c.fill();
    c.save(); c.clip(); c.strokeStyle='rgba(160,110,50,.35)'; c.lineWidth=2; for(let k=-42;k<=42;k+=11){ c.beginPath(); c.ellipse(x,cy+k,52,5,0,0,Math.PI); c.stroke(); } c.restore();
    ell(c,x,cy,52,52,null,3,'#5b3a2e'); rr(c,x-18,220,36,11,4); fs(c,'#2b1a10',3); });
  // one shelf each side: bowls, sake bottles, jars
  const shelf=(x0,y)=>{ shadow(c,x0+100,y+26,100,6,.12); rr(c,x0,y,200,16,5); fs(c,vg(c,y,y+16,'#d39d63','#a8743f'),3);
    [x0+24,x0+176].forEach(x=>{ c.beginPath(); c.moveTo(x,y+16); c.lineTo(x,y+40); c.lineTo(x+18,y+16); c.closePath(); fs(c,'#a8743f',2.5); }); };
  const sake=(x,y,col)=>{ c.beginPath(); c.moveTo(x-16,y); c.lineTo(x-16,y-62); c.quadraticCurveTo(x-16,y-78,x-6,y-84); c.lineTo(x-6,y-104); c.lineTo(x+6,y-104); c.lineTo(x+6,y-84); c.quadraticCurveTo(x+16,y-78,x+16,y-62); c.lineTo(x+16,y); c.closePath(); fs(c,vg(c,y-104,y,shade(col,.25),col),3); rr(c,x-12,y-58,24,30,3); fs(c,'#f6efd9',2); txt(c,'酒',x,y-43,16,'#3a2013',400,'center',0,'#fff',BRUSH); shine(c,x-12,y-70,4,56,2,.3); };
  const jar=(x,y,lab)=>{ rr(c,x-26,y-54,52,54,12); fs(c,vg(c,y-54,y,'#f4e3c4','#dcc19a'),3); rr(c,x-18,y-63,36,13,5); fs(c,'#7b4b2a',2.5); txt(c,lab,x,y-26,11,OUT,700); };
  shelf(50,400); miniBowl(c,84,400,56); miniBowl(c,84,385,56); jar(144,400,'MISO'); sake(200,400,'#3f6f8f');
  shelf(650,400); sake(700,400,'#4f7b4a'); jar(756,400,'TARE'); miniBowl(c,816,400,56); miniBowl(c,816,385,56);
  // wooden signboard with the logo, hung from the beam
  c.strokeStyle='#24140a'; c.lineWidth=4; c.beginPath(); c.moveTo(330,88); c.lineTo(336,132); c.moveTo(570,88); c.lineTo(564,132); c.stroke();
  shadow(c,450,478,190,9,.2);
  rr(c,262,126,376,340,22); fs(c,vg(c,126,466,'#8a5a32','#5a3a1e'),4,'#24140a');
  rr(c,278,142,344,308,14); fs(c,vg(c,142,450,'#f3d6a6','#dcb37a'),3,'#6b4423');
  c.save(); c.globalAlpha=.16; c.strokeStyle='#7a4f2a'; c.lineWidth=2; for(let y=156;y<444;y+=16){ c.beginPath(); c.moveTo(286,y); c.quadraticCurveTo(450,y+((y/16)%2?6:-6),614,y); c.stroke(); } c.restore();
  [[274,138],[626,138],[274,454],[626,454]].forEach(([x,y])=>ell(c,x,y,7,7,vg(c,y-7,y+7,'#f4d27a','#b9862e'),2,'#24140a'));
  if(ok(LOGO_IMG)){ const h=240, w=h*LOGO_IMG.width/LOGO_IMG.height; c.drawImage(LOGO_IMG,450-w/2,152,w,h); }
}
function drawShop(){ drawShopTop(); drawShopBack(); drawShopFront(); }
drawShop(); (document.fonts&&document.fonts.ready||Promise.resolve()).then(()=>{ drawShop(); });
['Yuji Syuku','Fredoka'].forEach(f=>{ try{ document.fonts.load(`40px "${f}"`,'もも屋 Ramen').then(drawShop); }catch(e){} });
let last=performance.now();
function loop(now){ const dt=Math.min(.05,(now-last)/1000); last=now;
  $('#btnPause').hidden = !(G.mode==='service' && (G.scene==='shop'||G.scene==='kitchen'));
  if(G.paused){ requestAnimationFrame(loop); return; }
  if(G.scene==='kitchen'&&G.order) kitchenFrame(dt);
  if(G.scene==='shop'&&G.mode==='home') homeFrame(dt);
  if(G.scene==='prep'&&PR.g) prepFrame(dt);
  patienceTick(dt);
  requestAnimationFrame(loop); }
$('#btnMute').onclick=e=>{ e.stopPropagation(); audioInit(); setMuted(!SND.muted); };
setMuted(SND.muted);
goHome(); requestAnimationFrame(loop);
