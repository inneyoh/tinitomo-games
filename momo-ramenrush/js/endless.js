/* =====================================================================
   ENDLESS MODE — loaded after game.js
   Up to 3 customers wait at a bare counter, each with an empty bowl holding their order slip.
   Tap up to 2 bowls → To the kitchen → cook → serve. Patience runs from the moment they walk up.
   A run has its own money and upgrades (ENDLESS / ENDLESS_UPGRADES in config.js);
   6 customers walking out in a row ends the run.
   ===================================================================== */
const LANE_X=[165,450,735], LANE_SC=.8;   // where the 3 counter spots are, and how big customers look there
const LINE=Object.fromEntries(ENDLESS_UPGRADES.map(l=>[l.line,l]));
const LV_OF={}; ENDLESS_UPGRADES.forEach(l=>l.levels.forEach((u,k)=>LV_OF[u.id]=[l.line,k+1]));   // upgrade id → [line, level]

var EQ={   // var (not const): game.js checks for it before this file has run
  lanes:[null,null,null], built:false,

  /* ---------- upgrades (this run only) ---------- */
  lv:line=>E.up[line]||0,
  has(id){ const L=LV_OF[id]; return !!L && EQ.lv(L[0])>=L[1]; },                 // owning Lv 3 also counts as owning Lv 1 and 2
  owned(k){ const out=[]; ENDLESS_UPGRADES.forEach(l=>{ const v=EQ.lv(l.line); if(v){ const u=l.levels[v-1]; if(u[k]!==undefined) out.push(u[k]); } }); return out; },   // only the current level's effect counts
  eff:k=>EQ.owned(k).reduce((a,b)=>a+b,0),
  price:(l,lv)=> l.prices ? l.prices[lv-1] : ENDLESS.PRICES[l.kind][lv-1],
  rarity:(l,lv)=> l.rarity ? l.rarity[lv-1] : lv-1,
  reqOk:u=>(u.req||[]).every(r=>{ const [ln,n]=r.split(':'); return EQ.lv(ln)>=+n; }),
  nextOf(l){ const lv=EQ.lv(l.line)+1, u=l.levels[lv-1]; if(!u || !EQ.reqOk(u)) return null;
    return {l, lv, u, price:EQ.price(l,lv), rar:EQ.rarity(l,lv)}; },

  /* ---------- the run ---------- */
  start(){
    EQ.build(); EQ.clear(); endRush();
    Object.assign(E,{served:0, money:0, fails:0, t:0, clock:0, up:{}, arriveIn:.6, nextUp:ENDLESS.UPGRADE_EVERY, sel:[], solo:null, hold:false, panel:false, over:false, newBest:false, cap:1, ending:false});
    G.play='endless'; G.tut=false; G.firstOrder=false; G.rush=null; G.order=null; G.serving=false;
    Object.assign(D,{n:Infinity,done:0,sales:0,tips:0,walk:0});
    G.mode='service'; $('#modeSheet').classList.remove('on'); $('#shop').classList.remove('home'); $('#shop').classList.add('endless');
    $('#cust').classList.add('away'); $('#patBar').classList.add('hide'); hush();
    ['#shopBowl','#shopRice'].forEach(q=>$(q).classList.add('hidden-o'));
    drawShopBack(); drawShopFront(); resetMomoBack(); EQ.sheet(); updateHud(); layoutStage(false); music('day',true);
  },
  leave(){ if(G.play!=='endless' && !EQ.built) return; EQ.clear(); $('#shop').classList.remove('endless'); ['#eUp','#eOver'].forEach(q=>{ const e=$(q); if(e) e.hidden=true; });
    if(G.play==='endless'){ G.play=null; G.order=null; } },
  clear(){ EQ.lanes.forEach((e,i)=>{ if(e) EQ.dropLane(i,true); }); E.sel=[]; E.solo=null; $('#orderSheet').classList.remove('on'); const h=$('#eHint'); if(h) h.hidden=true; },
  entries:()=>EQ.lanes.filter(Boolean),
  laneX:i=>LANE_X[i],
  capNow(){ let c=1; ENDLESS.LANES.forEach(([n,k])=>{ if(E.served>=n) c=k; }); return c; },
  patSec:()=>Math.max(ENDLESS.PAT_END, ENDLESS.PAT_START-ENDLESS.PAT_DROP*E.t/60)*(1+EQ.eff('epat')),

  /* ---------- DOM: customers behind the counter, bowls / bars / bubbles on top ---------- */
  build(){ if(EQ.built) return; EQ.built=true;
    const sc=$('#scene'), front=$('#shopFront');
    const back=document.createElement('div'); back.id='eBack'; front.before(back);
    const fr=document.createElement('div'); fr.id='eFront'; front.after(fr);
    EQ.dom=[0,1,2].map(i=>{ const el=document.createElement('div'); el.className='ecust away'; back.appendChild(el);
      const bw=document.createElement('div'); bw.className='eBowl off'; bw.innerHTML='<canvas width="512" height="512"></canvas><b class="eNum"></b>'; bw.style.left=(LANE_X[i]-105)+'px';
      const bar=document.createElement('div'); bar.className='ePat hide'; bar.innerHTML='<i></i>';
      const bub=document.createElement('div'); bub.className='bubble eBub off';
      const hit=document.createElement('div'); hit.className='eHit'; hit.style.left=(LANE_X[i]-140)+'px'; hit.onclick=()=>EQ.tap(i);
      fr.append(bw,bar,bub,hit); return {el,bw,bar,bub,hit}; });
    const hint=document.createElement('div'); hint.id='eHint'; hint.hidden=true; hint.textContent='Tap a bowl to take the order'; $('#shop').appendChild(hint);
    $('#app').insertAdjacentHTML('beforeend',`
      <div id="eUp" hidden><div class="panel"><span class="pv">UPGRADE TIME</span><h2 id="euTitle">Pick an upgrade</h2><div class="sub" id="euSub"></div>
        <div id="euCards"></div><div class="row"><button class="btn tiny" id="btnEuRoll">↻ Refresh</button><button class="btn" id="btnEuSkip">Skip ▶</button></div></div></div>
      <div id="eOver" hidden><div class="panel"><h2>Endless over!</h2><img class="momoNight" src="assets/momo_confused.webp" alt="Momo looking worried">
        <div class="sub" id="eoSub"></div><div class="ledger" id="eoLedger"></div>
        <div class="row"><button class="btn" id="btnEoHome">Home</button><button class="btn red" id="btnEoAgain">Play again ▶</button></div></div></div>`);
    $('#btnEuSkip').onclick=()=>{ blip(500,.05); EQ.closeUp(); };
    $('#btnEuRoll').onclick=()=>{ if(E.rolls<=0) return; E.rolls--; blip(760,.06); EQ.deal(); };
    $('#btnEoHome').onclick=()=>{ $('#eOver').hidden=true; goHome(); };
    $('#btnEoAgain').onclick=()=>{ $('#eOver').hidden=true; EQ.start(); };
  },

  /* ---------- customers walk up ---------- */
  freeLane(){ const pref=E.cap===1?[1,0,2]:E.cap===2?[0,2,1]:[1,0,2]; return pref.find(i=>!EQ.lanes[i]); },
  arrive(){ const lane=EQ.freeLane(); if(lane==null) return;
    const here=EQ.entries().map(e=>e.cust), pool=Object.keys(CUSTOMERS).filter(id=>!here.includes(id));
    const id=pickCustomer(G.lastCust,pool); G.lastCust=id; G.ticketNo++;
    const d=EQ.dom[lane], e={lane, cust:id, order:{cust:id,no:G.ticketNo,pos:genOrder(id)}, bowl:newBowl(), pat:100, patSec:EQ.patSec(), state:'wait',
      el:d.el, bar:d.bar, bub:d.bub, bw:d.bw, cv:mkCv()};
    EQ.lanes[lane]=e;
    const x=LANE_X[lane], h=CUST_H[id], sc=csize(id)*LANE_SC, bottom=752+h*sc*.38, head=bottom-h*sc;
    Object.assign(d.el.style,{left:(x-180)+'px', top:(bottom-h)+'px', height:h+'px'});
    d.el.innerHTML=`<div class="eSc">${custHTML(id,'idle')}</div>`; d.el.classList.remove('eat','impatient');
    d.bub.style.left=(x-130)+'px'; d.bub.style.top=(head-150)+'px';
    d.bar.style.left=(x-90)+'px'; d.bar.style.top=(head-44)+'px'; d.bar.className='ePat'; d.bar.firstElementChild.style.width='100%';
    d.hit.style.top=(head-20)+'px'; d.hit.style.height=(990-head)+'px';
    EQ.drawSlipBowl(e); d.bw.classList.remove('sel','off');
    requestAnimationFrame(()=>d.el.classList.remove('away')); blip(620,.06);
    later(()=>{ if(EQ.lanes[lane]===e && e.state==='wait') EQ.say(e,CUSTOMERS[id].hi); },500);
    later(()=>{ if(EQ.lanes[lane]===e) e.bub.classList.add('off'); },3800);
    EQ.sheet(); },
  /* the customer's empty bowl, with their order slip lying in it */
  drawSlipBowl(e){ const cv=e.bw.querySelector('canvas'); drawRamen(cv,newBowl()); const c=cv.getContext('2d');
    c.save(); c.beginPath(); c.ellipse(CX,CY,RX,RY,0,0,6.29); c.clip(); c.translate(CX,CY+8); c.rotate(-.1);
    c.shadowColor='rgba(60,30,10,.25)'; c.shadowBlur=10; c.shadowOffsetY=5; rr(c,-130,-62,260,124,8); c.fillStyle='#fffaf0'; c.fill(); c.shadowColor='transparent';
    c.lineWidth=3; c.strokeStyle='#d8c6a6'; c.stroke();
    for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(-108,-2+k*20); c.lineTo(108,-2+k*20); c.lineWidth=2; c.strokeStyle='rgba(91,58,46,.18)'; c.stroke(); }
    txt(c,'ORDER',-62,-34,24,OUT,700); txt(c,'No.'+String(e.order.no).padStart(4,'0'),64,-34,20,'#8a6a55',600);
    txt(c,CUSTOMERS[e.cust].name,0,22,46,'#c0392b',400,'center',0,'#fff',BRUSH); c.restore(); },
  say(e,t){ if(e.bub.textContent!==t) e.bub.textContent=t; e.bub.classList.remove('off'); },

  /* ---------- picking bowls at the counter ---------- */
  tap(i){ const e=EQ.lanes[i]; if(!e || e.state!=='wait' || G.scene!=='shop' || E.hold || E.over || E.panel) return;
    const k=E.sel.indexOf(e);
    if(k>=0) E.sel.splice(k,1);
    else { if(E.sel.length>=ENDLESS.MAX_PICK){ toast(`Up to ${ENDLESS.MAX_PICK} bowls at a time`); blip(220,.12); return; } E.sel.push(e); E.tab=e; }
    blip(k>=0?420:640,.05); EQ.sheet(); },
  ordered:()=>E.sel.slice().sort((a,b)=>a.lane-b.lane),   // left bowl = ① in the kitchen
  sheet(){ if(G.play!=='endless') return;
    const S=EQ.ordered(); EQ.dom.forEach(d=>{ d.bw.classList.remove('sel'); d.bw.querySelector('.eNum').className='eNum'; });
    S.forEach((e,k)=>{ e.bw.classList.add('sel'); const n=e.bw.querySelector('.eNum'); n.className='eNum on n'+(k+1); n.textContent=S.length>1?k+1:'✓'; });
    const sh=$('#orderSheet'), atCounter=G.scene==='shop' && !E.hold && !E.over;
    $('#eHint').hidden=!(atCounter && !S.length && EQ.entries().some(e=>e.state==='wait'));
    if(!atCounter) return;
    if(!S.length){ sh.classList.remove('on'); $('#rushTabs').hidden=true; layoutStage(false); return; }
    if(!S.includes(E.tab)) E.tab=S[0];
    $('#orderSheet h3').textContent= S.length>1 ? `Endless · ${S.length} orders` : 'Endless · new order';
    const T=$('#rushTabs'); T.hidden=S.length<2;
    T.innerHTML=S.map((e,k)=>`<button data-k="${k}" class="${e===E.tab?'on':''}"><b class="n${k+1}">${k+1}</b>${CUSTOMERS[e.cust].name}<i><u style="width:${e.pat}%"></u></i></button>`).join('');
    T.querySelectorAll('button').forEach(b=>b.onclick=()=>{ E.tab=S[+b.dataset.k]; EQ.sheet(); });
    G.pat=E.tab.pat; renderTicket($('#shopTicket'),E.tab.order);
    sh.classList.add('on'); requestAnimationFrame(()=>layoutStage('eq')); later(redrawAllCircles,60); },

  /* ---------- to the kitchen with 1 or 2 bowls ---------- */
  toKitchen(){ const S=EQ.ordered(); if(!S.length){ toast('Tap a bowl first'); return; }
    S.forEach(e=>{ e.state='cook'; e.bw.classList.add('off'); e.bub.classList.add('off'); });
    E.sel=[]; $('#eHint').hidden=true; $('#rushTabs').hidden=true;
    if(S.length===1){ const e=S[0]; E.solo=e; endRush(); G.order=e.order; G.bowl=e.bowl; G.pat=e.pat; G.result=null; setGeom(105); }
    else { E.solo=null; endRush();
      G.rush={eq:true, name:'Endless', active:0, cur:null, timed:false, slots:S.map((e,k)=>Object.assign(e,{i:k, gone:false, served:false, waiting:true}))};
      setSlot(0); G.result=null; G.serveQ=[]; G.serving=false; }
    toKitchen(); },
  enterKitchen(){ E.hold=false; EQ.freeDone(); },

  /* ---------- after a serve: back to the counter ---------- */
  resume(){ E.hold=false; G.serving=false; endRush(); E.solo=null; G.order=null;
    $('#btnNextCust').hidden=true; $('#coinPop').classList.remove('on'); $('#momoBubble').classList.add('off'); clearTrayFx(); resetMomoBack(); ['#shopBowl','#shopRice'].forEach(q=>$(q).classList.add('hidden-o'));
    EQ.entries().forEach(e=>{ if(e.state==='cook' && !e.served && !e.gone){ e.state='wait'; e.bw.classList.remove('off'); } });   // (safety) anything not served goes back on the counter
    EQ.freeDone(); showScene('shop'); EQ.sheet(); updateHud();
    if(E.served>=E.nextUp){ while(E.nextUp<=E.served) E.nextUp+=ENDLESS.UPGRADE_EVERY; EQ.showUp(); } },
  /* served and walked-out customers leave their spot */
  freeDone(){ EQ.lanes.forEach((e,i)=>{ if(e && (e.state==='served'||e.served||e.gone||e.state==='gone')) EQ.dropLane(i); }); },
  dropLane(i,now){ const e=EQ.lanes[i]; if(!e) return; EQ.lanes[i]=null; const d=EQ.dom[i];
    d.bub.classList.add('off'); d.bar.classList.add('hide'); d.bw.classList.add('off'); d.bw.classList.remove('sel'); d.el.classList.add('away'); d.el.classList.remove('impatient','eat');
    if(now) d.el.innerHTML=''; E.sel=E.sel.filter(s=>s!==e); },
  paid(e,amount){ E.money+=amount; E.served++; E.fails=0; e.served=true; e.state='served';
    if(E.served>(P.endlessBest||0)){ if(P.endlessBest && !E.newBest){ E.newBest=true; later(()=>toast(`New best: ${E.served} bowls!`),1400); } P.endlessBest=E.served; saveGame(); }
    const cap=EQ.capNow(); if(cap>E.cap){ E.cap=cap; later(()=>toast(`It's getting busy!<br><small>Up to ${cap} customers at the counter now</small>`),1800); } },

  /* ---------- every frame ---------- */
  tick(dt){ if(E.over || E.ending || E.panel || G.mode!=='service') return;
    E.clock+=dt; if(E.hold) return;
    E.t+=dt;
    const busy=EQ.entries().length;
    if(busy<E.cap){ E.arriveIn-=dt; if(E.arriveIn<=0){ E.arriveIn=ENDLESS.GAP; EQ.arrive(); } } else E.arriveIn=Math.max(E.arriveIn,ENDLESS.GAP*.4);
    EQ.entries().forEach(e=>{ if(e.gone || e.served || !(e.state==='wait'||e.state==='cook')) return;
      e.pat=Math.max(0,e.pat-dt*100/e.patSec);
      const cls=e.pat<30?'low':e.pat<60?'mid':'', pw=(Math.round(e.pat*2)/2)+'%', key=cls+pw;
      if(key!==e.key){ e.key=key; e.bar.classList.toggle('mid',cls==='mid'); e.bar.classList.toggle('low',cls==='low'); e.bar.firstElementChild.style.width=pw;
        const kt = e.state==='cook' ? (G.rush ? $(e.i?'#kTicket2':'#kTicket') : $('#kTicket')) : null, kp=kt&&kt.querySelector('.tk-pat'); if(kp){ kp.className='tk-pat '+cls; kp.firstElementChild.style.width=pw; }
        if(e.state==='wait'){ const k=EQ.ordered().indexOf(e); if(k>=0){ const u=$(`#rushTabs button[data-k="${k}"] u`); if(u) u.style.width=pw; if(E.tab===e){ const sk=$('#shopTicket .tk-pat'); if(sk){ sk.className='tk-pat '+cls; sk.firstElementChild.style.width=pw; } } } } }
      e.el.classList.toggle('impatient',e.pat<20);
      const up=e.pat<UPSET_PATIENCE, im=e.el.querySelector('.csprite'); if(im && im.dataset.upset!==(up?'1':'0')){ im.src=up?CUST_UPSET[e.cust]:CUST_IMG[e.cust]; im.dataset.upset=up?'1':'0'; }
      if(e.state==='cook'){ if(G.rush && G.rush.slots[G.rush.active]===e) G.pat=e.pat; else if(!G.rush) G.pat=e.pat; }
      if(e.pat<=0) EQ.walkout(e); });
    EQ.lanes.forEach((e,i)=>{ if(e && e.freeAt && E.clock>=e.freeAt && !(G.rush && G.rush.slots.includes(e) && G.serving)) EQ.dropLane(i); }); },

  /* ---------- walk-outs ---------- */
  walkout(e){ const name=CUSTOMERS[e.cust].name;
    E.fails++; updateHud(); const tag=`<br><small>${E.fails}/${ENDLESS.FAILS} walk-outs in a row</small>`;
    if(e.state==='cook' && G.rush){ const i=G.rush.slots.indexOf(e); rushWalkout(i); e.state='gone'; e.freeAt=E.clock+2.6; if(G.scene==='kitchen') toast(`${name} got tired of waiting and left!${tag}`); }
    else if(e.state==='cook'){ e.state='gone'; e.gone=true; E.solo=null; G.order=null; K.hand=null; K.M=null; K.pour=false;
      showScene('shop'); EQ.sadLeave(e); later(()=>{ if(!E.over) EQ.resume(); },2600); }
    else { e.state='gone'; e.gone=true; E.sel=E.sel.filter(s=>s!==e); EQ.sadLeave(e); e.freeAt=E.clock+2.6;
      if(G.scene==='kitchen') toast(`${name} left the counter!${tag}`); else EQ.sheet(); }
    blip(200,.35,'sawtooth',.05);
    if(E.fails>=ENDLESS.FAILS){ E.ending=true; later(EQ.end,1600); } },
  sadLeave(e){ e.bar.classList.add('hide'); e.bw.classList.add('off'); e.el.classList.remove('impatient'); e.el.innerHTML=`<div class="eSc">${custHTML(e.cust,'sad',true)}</div>`; EQ.say(e,WALK_LINE[e.cust]);
    later(()=>{ e.bub.classList.add('off'); e.el.classList.add('away'); },1800); },
  end(){ if(E.over) return; E.over=true; G.mode='over'; endRush(); G.order=null; E.solo=null; K.hand=null; K.M=null; K.pour=false;
    showScene('shop'); $('#orderSheet').classList.remove('on'); $('#eHint').hidden=true; $('#btnNextCust').hidden=true; ['#eUp'].forEach(q=>$(q).hidden=true);
    $('#eoSub').textContent=`${ENDLESS.FAILS} customers walked out in a row.`;
    const best=P.endlessBest||0;
    $('#eoLedger').innerHTML=`<span>Bowls served</span><b>${E.served}</b><span>Money earned</span><b>${yen(E.money)}</b><span>Time played</span><b>${Math.floor(E.t/60)}:${String(Math.floor(E.t%60)).padStart(2,'0')}</b><span>Best run</span><b>${best} bowl${best===1?'':'s'}${E.newBest?' · new!':''}</b>`;
    $('#eOver').hidden=false; sfx('bad'); },

  /* ---------- upgrade pick: every ENDLESS.UPGRADE_EVERY bowls ---------- */
  showUp(){ E.panel=true; E.rolls=Math.max(0,...EQ.owned('reroll')); EQ.deal(); $('#eUp').hidden=false; blip(880,.1); later(()=>blip(1180,.12),120); },
  closeUp(){ $('#eUp').hidden=true; E.panel=false; EQ.sheet(); updateHud(); },
  odds(){ const O=ENDLESS.ODDS, rest=O[1]+O[2]+O[3], luck=Math.min(O[0],EQ.eff('luck')*100), k=(rest+luck)/rest;
    return [O[0]-luck, O[1]*k, O[2]*k, O[3]*k]; },
  deal(){ const n=ENDLESS.CHOICES+EQ.eff('choices'), pool=ENDLESS_UPGRADES.map(EQ.nextOf).filter(Boolean), odds=EQ.odds(), pick=[];
    for(let k=0;k<n && pool.length;k++){ let x=Math.random()*100, want=3; for(let r=0;r<4;r++){ x-=odds[r]; if(x<0){ want=r; break; } }
      const order=[want,...[3,2,1,0].filter(r=>r<want),...[0,1,2,3].filter(r=>r>want)];   // none of that rarity: the next lower, then higher
      for(const r of order){ const of=pool.filter(c=>c.rar===r); if(of.length){ const c=of[Math.floor(Math.random()*of.length)]; pick.push(c); pool.splice(pool.indexOf(c),1); break; } } }
    E.cards=pick; EQ.renderUp(); },
  renderUp(){ $('#euTitle').textContent=`${E.served} bowls! Pick an upgrade`; $('#euSub').innerHTML=`You have <b>${yen(E.money)}</b>`;
    $('#euCards').style.gridTemplateColumns=`repeat(${Math.max(1,Math.min(3,E.cards.length))},1fr)`;
    $('#euCards').innerHTML = E.cards.length ? E.cards.map((c,k)=>{ const poor=E.money<c.price, need=(c.u.req||[]).map(r=>{ const [ln,lv]=r.split(':'); return LINE[ln].levels[lv-1].name; });
      return `<div class="euCard r${c.rar}"><div class="euTop"><span class="euRar">${RARITY[c.rar]}</span><span class="euLv">Lv ${c.lv}${c.l.levels.length>1?`/${c.l.levels.length}`:''}</span></div>
        <b class="euName">${c.u.name}</b><div class="euDesc">${c.u.desc}</div>${need.length?`<div class="euNeed">Needs ${need.join(' + ')} ✓</div>`:''}
        <button class="btn ${poor?'':'red'} euBuy" data-k="${k}" ${poor?'disabled':''}>${yen(c.price)}</button></div>`; }).join('')
      : '<div class="sub">Everything is maxed out!</div>';
    $('#euCards').querySelectorAll('.euBuy').forEach(b=>b.onclick=()=>EQ.buy(E.cards[+b.dataset.k]));
    const rb=$('#btnEuRoll'); rb.hidden=!EQ.lv('refresh'); rb.disabled=E.rolls<=0; rb.textContent=`↻ Refresh (${E.rolls})`; },
  buy(c){ if(E.money<c.price) return; E.money-=c.price; E.up[c.l.line]=c.lv; sfx('pay'); toast(`${c.u.name}${c.l.levels.length>1?' · Lv '+c.lv:''}!`); EQ.closeUp(); },
};
