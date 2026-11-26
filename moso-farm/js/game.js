const ASSET_KEYS=["can", "canpour", "cu_bae", "cu_bae_upset", "cu_bun", "cu_bun_upset", "cu_gwoof", "cu_gwoof_upset", "cu_kew", "cu_kew_upset", "cu_kuma", "cu_kuma_upset", "cu_piyo", "cu_piyo_upset", "cu_popo", "cu_popo_upset", "cu_rang", "cu_rang_upset", "dr_road", "dr_truck", "farmbg", "heart", "ic_beanie", "ic_bread", "ic_butterpop", "ic_caramelpop", "ic_carrot", "ic_carrotcake", "ic_carrotjuice", "ic_corn", "ic_egg", "ic_honey", "ic_honeytea", "ic_honeytoast", "ic_latte", "ic_melon", "ic_melonsoda", "ic_milk", "ic_mittens", "ic_muffin", "ic_omelette", "ic_parfait", "ic_popcornbucket", "ic_pumpkin", "ic_pumpkinpie", "ic_pumpkinsoup", "ic_quiche", "ic_scarf", "ic_shell", "ic_shortcake", "ic_smoothie", "ic_strawberry", "ic_strawmilk", "ic_strawpop", "ic_sweater", "ic_tomato", "ic_tomatojuice", "ic_tote", "ic_truffle", "ic_trufflepasta", "ic_truffletoast", "ic_veggiestew", "ic_wheat", "ic_wool", "momo_back", "momo_explore", "momo_front", "momo_side", "momo_three", "oa_barn", "oa_chick", "oa_chicken", "oa_cow", "oa_cow_a", "oa_f_bench", "oa_f_bench_momo", "oa_f_bench_soso", "oa_f_hammock", "oa_f_hammock_momo", "oa_f_hammock_soso", "oa_f_picnic", "oa_f_picnic_momo", "oa_f_picnic_soso", "oa_f_swing", "oa_f_swing_momo", "oa_f_swing_soso", "oa_hen", "oa_locked", "oa_pig", "oa_pig_a", "oa_r_carrot", "oa_r_corn", "oa_r_melon", "oa_r_pumpkin", "oa_r_strawberry", "oa_r_tomato", "oa_r_wheat", "oa_s_bakery", "oa_s_cafe", "oa_s_clothing", "oa_s_eatery", "oa_s_juice", "oa_s_popcorn", "oa_s_veggie", "oa_seedmound", "oa_sheep", "oa_sheep_a", "oa_soil", "oa_soilwet", "oa_sprout", "oa_truck", "oa_village", "oa_young", "pk2_ball", "pk2_bumper_heart", "pk2_bumper_star", "pk2_button", "pk2_catcher", "pk2_coin", "pk2_frame", "pk2_pin", "pk2_post", "pk2_screen", "pk2_slot", "pk2_slotq", "pk2_spark", "pk_bell", "pk_heart", "pk_tray", "ps_momo_basket", "ps_momo_cheer", "ps_momo_sleepy", "ps_momo_surprised", "ps_momo_water", "ps_momo_wave", "ps_soso_cheer", "ps_soso_seeds", "ps_soso_shy", "ps_soso_tea", "ps_soso_thumbsup", "ps_soso_wave", "pt_bae", "pt_bun", "pt_gwoof", "pt_kew", "pt_kuma", "pt_momo", "pt_piyo", "pt_popo", "pt_rang", "pt_soso", "pz_boost", "pz_flowerbed", "pz_fountain", "pz_hat", "pz_melon", "pz_pouch", "pz_ribbon", "pz_sprinkler", "soso_back", "soso_explore", "soso_front", "soso_side", "soso_three", "ui_basket", "ui_can", "ui_coin", "ui_seed", "ui_shop", "ui_sickle"];
const IMG=Object.fromEntries(ASSET_KEYS.map(k=>[k,"assets/"+k+".webp"]));
(function(){
"use strict";
const OL="#5E3B22";
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
// Images load lazily the first time something draws them, so each screen only downloads its own art.
const IM=new Proxy({},{get(t,k){if(typeof k!=="string")return undefined;if(!(k in t)){if(!IMG[k])return undefined;const i=new Image();i.decoding="async";i.src=IMG[k];t[k]=i;}return t[k];}});

// ================= DATA =================
const ITEMS={
  wheat:{n:"Wheat",v:6}, carrot:{n:"Carrot",v:9}, strawberry:{n:"Strawberry",v:16}, tomato:{n:"Tomato",v:20},
  pumpkin:{n:"Pumpkin",v:34}, melon:{n:"Golden Melon",v:95}, egg:{n:"Egg",v:12}, milk:{n:"Milk",v:18},
  shell:{n:"Seashell",v:24}, berry:{n:"Wild Berry",v:12}, mushroom:{n:"Mushroom",v:20}, honey:{n:"Honey",v:32}, starbit:{n:"Star Shard",v:85}, feather:{n:"Bluebird Feather",v:45}, wool:{n:"Wool",v:30}, truffle:{n:"Truffle",v:70}, truffletoast:{n:"Truffle Toast",v:190},
  honeytoast:{n:"Honey Toast",v:95}, quiche:{n:"Mushroom Quiche",v:135}, smoothie:{n:"Berry Smoothie",v:88},
  bread:{n:"Bread",v:30}, carrotcake:{n:"Carrot Cake",v:72}, shortcake:{n:"Strawberry Shortcake",v:115}, pumpkinpie:{n:"Pumpkin Pie",v:150},
  carrotjuice:{n:"Carrot Juice",v:40}, strawmilk:{n:"Strawberry Milk",v:66}, tomatojuice:{n:"Tomato Juice",v:84}, melonsoda:{n:"Melon Cream Soda",v:280},
  corn:{n:"Corn",v:14}, scarf:{n:"Knit Scarf",v:90}, beanie:{n:"Pom Beanie",v:110}, mittens:{n:"Mittens",v:80}, sweater:{n:"Cosy Sweater",v:200}, tote:{n:"Knit Tote",v:70},
  veggiestew:{n:"Veggie Stew",v:120}, omelette:{n:"Omelette",v:80}, pumpkinsoup:{n:"Pumpkin Soup",v:140}, trufflepasta:{n:"Truffle Pasta",v:220},
  latte:{n:"Latte",v:70}, honeytea:{n:"Honey Tea",v:95}, parfait:{n:"Strawberry Parfait",v:160}, muffin:{n:"Berry Muffin",v:85},
  butterpop:{n:"Butter Popcorn",v:60}, caramelpop:{n:"Caramel Popcorn",v:85}, strawpop:{n:"Strawberry Popcorn",v:80},
};
const RAW=["wheat","carrot","strawberry","tomato","pumpkin","corn","melon","egg","milk","wool","truffle","berry","mushroom","honey","shell","feather","starbit"];
const CROPS={
  wheat:{seed:3,time:25,yield:3,lvl:1,xp:1}, carrot:{seed:5,time:40,yield:2,lvl:1,xp:2},
  strawberry:{seed:10,time:70,yield:2,lvl:2,xp:3}, corn:{seed:9,time:80,yield:2,lvl:2,xp:4}, tomato:{seed:14,time:90,yield:2,lvl:3,xp:4},
  pumpkin:{seed:22,time:140,yield:1,lvl:4,xp:6}, melon:{seed:0,time:120,yield:1,lvl:1,xp:10,prize:true},
};
const SHOPS={
  produce:{n:"Produce Shop",ic:"carrot",rent:0,lvl:1,blurb:"Fresh goods straight from the barn."},
  bakery:{n:"Bakery",ic:"bread",rent:150,lvl:1,special:"nono",blurb:"Bakes wheat, eggs and fruit into treats.",
    rec:{bread:{need:{wheat:3},t:30},carrotcake:{need:{wheat:2,carrot:2,egg:1},t:60},shortcake:{need:{wheat:2,strawberry:2,egg:1,milk:1},t:90},pumpkinpie:{need:{wheat:2,pumpkin:1,egg:1},t:120},honeytoast:{need:{wheat:2,honey:1},t:50},quiche:{need:{wheat:2,egg:1,mushroom:2},t:80},truffletoast:{need:{wheat:2,truffle:1,milk:1},t:100}}},
  juice:{n:"Juice Shop",ic:"carrotjuice",rent:250,lvl:1,blurb:"Blends fruit and milk into drinks.",
    rec:{carrotjuice:{need:{carrot:3},t:35},strawmilk:{need:{strawberry:2,milk:1},t:50},tomatojuice:{need:{tomato:3},t:70},melonsoda:{need:{melon:1,milk:1},t:90},smoothie:{need:{berry:3,milk:1},t:45}}},
  clothing:{n:"Clothing Shop",ic:"scarf",rent:350,lvl:2,special:"bae",blurb:"Knits cosy clothes from wool.",
    rec:{scarf:{need:{wool:2},t:60},mittens:{need:{wool:2},t:50},beanie:{need:{wool:2,berry:1},t:70},tote:{need:{wool:1,wheat:2},t:45},sweater:{need:{wool:4},t:120}}},
  eatery:{n:"Eatery",ic:"veggiestew",rent:400,lvl:2,special:"popo",blurb:"Hearty home-cooked meals.",
    rec:{omelette:{need:{egg:2,milk:1},t:45},veggiestew:{need:{carrot:2,tomato:2},t:60},pumpkinsoup:{need:{pumpkin:1,milk:1},t:70},trufflepasta:{need:{wheat:2,truffle:1},t:110}}},
  cafe:{n:"Cafe",ic:"latte",rent:450,lvl:3,special:"kew",blurb:"Coffee, tea and little sweets.",
    rec:{latte:{need:{milk:2},t:40},honeytea:{need:{honey:1,milk:1},t:50},muffin:{need:{wheat:1,berry:2,egg:1},t:60},parfait:{need:{strawberry:2,milk:1,honey:1},t:80}}},
  popcorn:{n:"Popcorn Shop",ic:"butterpop",rent:400,lvl:3,special:"rang",blurb:"Freshly popped corn in three flavours.",
    rec:{butterpop:{need:{corn:2,milk:1},t:40},caramelpop:{need:{corn:2,honey:1},t:55},strawpop:{need:{corn:2,strawberry:1},t:55}}},
};
const FRIENDS=["bae","bun","gwoof","kew","kuma","piyo","popo","rang"];
const FNAME={bae:"Bae",bun:"Bun",gwoof:"Gwoof",kew:"Kew",kuma:"Kuma",piyo:"Piyo",popo:"Popo",rang:"Rang",nono:"Nono",momo:"Momo",soso:"Soso"};
const xpFor=l=>Math.round(20*Math.pow(l,1.5));
const PRIZES=[
  {id:"pouch",n:"Coin pouch",d:"150 coins for the town fund.",cost:50},
  {id:"boost",n:"Grow tonic",d:"Every planted crop jumps halfway to ripe.",cost:40},
  {id:"melon",n:"Golden Melon seeds ×2",d:"A rare crop. Sells for 95, or 280 as a cream soda.",cost:80},
  {id:"sprinkler",n:"Sprinkler (10 min)",d:"Waters the whole farm for you.",cost:60},
  {id:"flowerbed",n:"Plaza flower bed",d:"Prettier plaza: every shop gets +1 appeal. Up to 3.",cost:120,max:3},
  {id:"hat",n:"Straw hat for Momo",d:"Momo walks 15% faster on the farm.",cost:150,once:true},
  {id:"ribbon",n:"Ribbon for Soso",d:"Customers tip Soso's shop a little extra.",cost:150,once:true},
  {id:"fountain",n:"Lucky fountain",d:"Turns the plaza fountain gold. More customers visit.",cost:300,once:true},
];

// ================= STATE =================
const KEY="momo-soso-farmtown-v7";
function freshShop(open){return{open,shelfLv:1,kitchenLv:1,decor:0,shelf:{},reg:0,q:[],repeat:null,sell:["wheat","carrot","egg"],sales:0};}
function fresh(){
  const plots=[];for(let i=0;i<99;i++)plots.push({c:null,p:0,w:false});
  return{coins:120,lc:3,lvl:1,xp:0,upg:{},furn:{},blocks:Array.from({length:11},(_,i)=>i<2),exp:{momo:null,soso:null},barnCap:40,inv:{egg:2},seeds:{wheat:8,carrot:4},sel:"wheat",plots,
    bld:{chicken:{own:false,n:0,t:Date.now()},cow:{own:false,n:0,t:Date.now()},sheep:{own:false,n:0,t:Date.now()},pig:{own:false,n:0,t:Date.now()}},
    shops:Object.fromEntries(Object.keys(SHOPS).map(k=>[k,freshShop(k==="produce")])),partner:{},
    staff:{momo:null,soso:null},balls:0,prize:{flowerbed:0},sprinklerUntil:0,lcProg:0,sales:0,savedAt:Date.now()};
}
let S;
function save(){S.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function load(){const hd=window.claude?.hot?.data;if(hd&&hd.S)return hd.S;try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r);}catch(e){}return null;}
window.claude?.hot?.snapshot?.(()=>{if(S)S.savedAt=Date.now();return{S};});

const onShift=(w,id)=>S.staff[w]===id&&!S.exp[w];
const invTotal=()=>RAW.reduce((a,k)=>a+(S.inv[k]||0),0);
const has=need=>Object.entries(need).every(([k,n])=>(S.inv[k]||0)>=n);
const take=need=>{for(const[k,n]of Object.entries(need))S.inv[k]-=n;};
function addInv(k,n){S.inv[k]=(S.inv[k]||0)+n;}
const shelfCap=sh=>6+4*(sh.shelfLv-1);
const shelfCount=sh=>Object.values(sh.shelf).reduce((a,b)=>a+b,0);

// ================= ICONS =================
let SH=null;
function P(ctx,fill,lw){ctx.fillStyle=fill;ctx.fill();
  if(SH&&lw>0){ctx.save();ctx.clip();const g=ctx.createLinearGradient(0,SH.y-SH.s*.5,0,SH.y+SH.s*.5);g.addColorStop(0,"rgba(255,255,255,.34)");g.addColorStop(.45,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(94,59,34,.2)");ctx.fillStyle=g;ctx.fillRect(SH.x-SH.s*2,SH.y-SH.s*2,SH.s*4,SH.s*4);ctx.restore();}
  if(lw>0){ctx.strokeStyle=OL;ctx.lineWidth=lw;ctx.stroke();}}
function E(ctx,x,y,rx,ry,fill,lw,rot){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,7);P(ctx,fill,lw);}
function starP(ctx,x,y,r,n){ctx.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,rr=i%2?r*.5:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}
function glass(ctx,x,y,s,lw,col,top){
  ctx.beginPath();ctx.moveTo(x-s*.24,y-s*.28);ctx.lineTo(x+s*.24,y-s*.28);ctx.lineTo(x+s*.19,y+s*.4);ctx.lineTo(x-s*.19,y+s*.4);ctx.closePath();P(ctx,"#EAF6F8",lw);
  ctx.beginPath();ctx.moveTo(x-s*.22,y-s*.1);ctx.lineTo(x+s*.22,y-s*.1);ctx.lineTo(x+s*.19,y+s*.38);ctx.lineTo(x-s*.19,y+s*.38);ctx.closePath();ctx.fillStyle=col;ctx.fill();
  ctx.strokeStyle=OL;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x+s*.06,y-s*.05);ctx.lineTo(x+s*.2,y-s*.48);ctx.stroke();
  ctx.strokeStyle="#fff";ctx.lineWidth=lw*1.2;ctx.beginPath();ctx.moveTo(x+s*.065,y-s*.08);ctx.lineTo(x+s*.19,y-s*.45);ctx.stroke();
  if(top)top();
}
function drawIcon(ctx,k,x,y,s){
  const gi=IM["ic_"+k];if(gi&&gi.complete&&gi.width){const w=s*1.05,h=w*gi.height/gi.width;ctx.drawImage(gi,x-w/2,y-h/2,w,h);return;}
  const lw=Math.max(1.2,s*.06);const _sh=SH;SH={x,y,s};ctx.save();ctx.lineJoin="round";ctx.lineCap="round";
  const G="#7DBA55";
  switch(k){
  case"wheat":
    for(const[ox,a]of[[-.14,-.25],[0,0],[.14,.25]]){ctx.save();ctx.translate(x+ox*s,y+s*.42);ctx.rotate(a*.6);
      ctx.strokeStyle=OL;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-s*.55);ctx.stroke();
      for(let i=0;i<4;i++){E(ctx,-s*.06,-s*.42-i*s*.11+s*.15,s*.05,s*.08,"#F2C14E",lw*.7,-.5);E(ctx,s*.06,-s*.42-i*s*.11+s*.15,s*.05,s*.08,"#F2C14E",lw*.7,.5);}
      E(ctx,0,-s*.78+s*.12,s*.045,s*.08,"#F2C14E",lw*.7);ctx.restore();}break;
  case"carrot":
    for(const a of[-.45,0,.45]){ctx.save();ctx.translate(x,y-s*.18);ctx.rotate(a);E(ctx,0,-s*.14,s*.07,s*.16,G,lw);ctx.restore();}
    ctx.beginPath();ctx.moveTo(x-s*.2,y-s*.16);ctx.quadraticCurveTo(x,y-s*.28,x+s*.2,y-s*.16);ctx.quadraticCurveTo(x+s*.1,y+s*.2,x,y+s*.44);ctx.quadraticCurveTo(x-s*.1,y+s*.2,x-s*.2,y-s*.16);P(ctx,"#F4954A",lw);
    ctx.strokeStyle=OL;ctx.lineWidth=lw*.7;ctx.beginPath();ctx.moveTo(x-s*.1,y);ctx.lineTo(x-s*.02,y);ctx.moveTo(x+s*.02,y+s*.14);ctx.lineTo(x+s*.08,y+s*.14);ctx.stroke();break;
  case"strawberry":
    ctx.beginPath();ctx.moveTo(x-s*.3,y-s*.1);ctx.quadraticCurveTo(x,y-s*.26,x+s*.3,y-s*.1);ctx.quadraticCurveTo(x+s*.26,y+s*.26,x,y+s*.4);ctx.quadraticCurveTo(x-s*.26,y+s*.26,x-s*.3,y-s*.1);P(ctx,"#EF5B6B",lw);
    for(const[a,b]of[[-.13,.02],[.1,.03],[0,.16],[-.08,.26],[.09,.24],[.0,-.06]]){ctx.fillStyle="#FFE7A0";ctx.beginPath();ctx.ellipse(x+a*s,y+b*s,s*.025,s*.035,0,0,7);ctx.fill();}
    starP(ctx,x,y-s*.17,s*.16,5);P(ctx,G,lw);break;
  case"tomato":
    E(ctx,x,y+s*.06,s*.34,s*.3,"#EB5A46",lw);E(ctx,x-s*.12,y-s*.03,s*.07,s*.045,"#F7988A",0);starP(ctx,x,y-s*.2,s*.15,5);P(ctx,G,lw);break;
  case"pumpkin":
    E(ctx,x-s*.18,y+s*.08,s*.2,s*.28,"#EE9038",lw);E(ctx,x+s*.18,y+s*.08,s*.2,s*.28,"#EE9038",lw);E(ctx,x,y+s*.08,s*.18,s*.3,"#F6A44C",lw);
    ctx.beginPath();ctx.roundRect(x-s*.04,y-s*.34,s*.08,s*.14,s*.02);P(ctx,"#8C6239",lw);break;
  case"melon":
    E(ctx,x,y+s*.04,s*.36,s*.34,"#F6D35B",lw);ctx.strokeStyle="#D7A93A";ctx.lineWidth=lw*.7;
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(x+i*s*.11,y+s*.04,s*.06,s*.32,0,0,7);ctx.stroke();}
    ctx.beginPath();ctx.roundRect(x-s*.03,y-s*.4,s*.06,s*.1,s*.02);P(ctx,"#8C6239",lw);
    ctx.fillStyle="#fff";starP(ctx,x+s*.24,y-s*.24,s*.08,4);ctx.fill();break;
  case"egg":E(ctx,x,y+s*.04,s*.27,s*.35,"#FFF4E0",lw);E(ctx,x-s*.09,y-s*.08,s*.05,s*.08,"#fff",0);break;
  case"milk":
    ctx.beginPath();ctx.moveTo(x-s*.12,y-s*.36);ctx.lineTo(x+s*.12,y-s*.36);ctx.lineTo(x+s*.12,y-s*.22);ctx.quadraticCurveTo(x+s*.26,y-s*.14,x+s*.26,y);ctx.lineTo(x+s*.26,y+s*.4);ctx.lineTo(x-s*.26,y+s*.4);ctx.lineTo(x-s*.26,y);ctx.quadraticCurveTo(x-s*.26,y-s*.14,x-s*.12,y-s*.22);ctx.closePath();P(ctx,"#FFFFFF",lw);
    ctx.beginPath();ctx.roundRect(x-s*.14,y-s*.44,s*.28,s*.1,s*.03);P(ctx,"#7FB6E0",lw);
    ctx.beginPath();ctx.roundRect(x-s*.2,y+s*.04,s*.4,s*.2,s*.05);P(ctx,"#BFE3EA",lw*.7);break;
  case"bread":
    ctx.beginPath();ctx.moveTo(x-s*.4,y+s*.28);ctx.quadraticCurveTo(x-s*.44,y-s*.24,x,y-s*.26);ctx.quadraticCurveTo(x+s*.44,y-s*.24,x+s*.4,y+s*.28);ctx.closePath();P(ctx,"#E5A35A",lw);
    ctx.strokeStyle=OL;ctx.lineWidth=lw*.8;for(const o of[-.16,0,.16]){ctx.beginPath();ctx.moveTo(x+o*s-s*.06,y-s*.04);ctx.lineTo(x+o*s+s*.06,y-s*.16);ctx.stroke();}break;
  case"carrotcake":case"shortcake":case"pumpkinpie":{
    const pie=k==="pumpkinpie";
    ctx.beginPath();ctx.moveTo(x-s*.4,y+s*.3);ctx.lineTo(x+s*.38,y+s*.3);ctx.lineTo(x+s*.38,y-s*.04);ctx.lineTo(x-s*.4,y+s*(pie?.12:-.06));ctx.closePath();
    P(ctx,pie?"#F1A04B":k==="shortcake"?"#FFF8EC":"#D79A5E",lw);
    if(pie){ctx.beginPath();ctx.moveTo(x-s*.4,y+s*.3);ctx.lineTo(x+s*.38,y+s*.3);ctx.lineTo(x+s*.38,y+s*.2);ctx.lineTo(x-s*.4,y+s*.22);ctx.closePath();P(ctx,"#E3BB7E",lw);
      E(ctx,x+s*.12,y-s*.06,s*.1,s*.06,"#FFF8EC",lw*.8);}
    else{ctx.fillStyle=k==="shortcake"?"#F37B8C":"#FFF8EC";ctx.fillRect(x-s*.38,y+s*.1,s*.75,s*.06);
      ctx.beginPath();ctx.moveTo(x-s*.4,y-s*.06);ctx.lineTo(x+s*.38,y-s*.04);ctx.lineTo(x+s*.38,y-s*.14);ctx.lineTo(x-s*.4,y-s*.14);ctx.closePath();P(ctx,"#FFF8EC",lw);
      if(k==="shortcake"){ctx.beginPath();ctx.moveTo(x+s*.06,y-s*.15);ctx.quadraticCurveTo(x+s*.18,y-s*.48,x+s*.3,y-s*.15);ctx.closePath();P(ctx,"#EF5B6B",lw);}
      else{ctx.beginPath();ctx.moveTo(x+s*.06,y-s*.2);ctx.lineTo(x+s*.3,y-s*.24);ctx.lineTo(x+s*.08,y-s*.12);ctx.closePath();P(ctx,"#F4954A",lw*.8);}}
    break;}
  case"carrotjuice":glass(ctx,x,y,s,lw,"#F7A253");break;
  case"strawmilk":glass(ctx,x,y,s,lw,"#F8B8C4",()=>E(ctx,x-s*.1,y-s*.3,s*.1,s*.08,"#EF5B6B",lw*.8));break;
  case"tomatojuice":glass(ctx,x,y,s,lw,"#E8584A");break;
  case"melonsoda":glass(ctx,x,y,s,lw,"#9BD98A",()=>{E(ctx,x,y-s*.3,s*.2,s*.13,"#FFF8EC",lw);E(ctx,x+s*.08,y-s*.45,s*.06,s*.06,"#EF5B6B",lw*.8);});break;
  case"smoothie":glass(ctx,x,y,s,lw,"#B98AD9",()=>{E(ctx,x-s*.1,y-s*.3,s*.08,s*.08,"#7A5AC0",lw*.8);E(ctx,x+s*.0,y-s*.34,s*.07,s*.07,"#7A5AC0",lw*.8);});break;
  case"shell":ctx.beginPath();ctx.moveTo(x,y+s*.36);ctx.lineTo(x-s*.36,y-s*.02);ctx.quadraticCurveTo(x-s*.3,y-s*.38,x,y-s*.38);ctx.quadraticCurveTo(x+s*.3,y-s*.38,x+s*.36,y-s*.02);ctx.closePath();P(ctx,"#FBC9C0",lw);
    ctx.strokeStyle=OL;ctx.lineWidth=lw*.7;for(const o of[-.2,-.1,0,.1,.2]){ctx.beginPath();ctx.moveTo(x,y+s*.32);ctx.lineTo(x+o*s*1.4,y-s*.3+Math.abs(o)*s*.5);ctx.stroke();}
    ctx.beginPath();ctx.roundRect(x-s*.12,y+s*.28,s*.24,s*.12,s*.04);P(ctx,"#F7A99C",lw);break;
  case"berry":for(const[a,b]of[[-.16,.08],[.16,.08],[0,-.12],[0,.22]])E(ctx,x+a*s,y+b*s,s*.17,s*.17,"#7A6AD8",lw);for(const[a,b]of[[-.2,.03],[.12,.03],[-.04,-.17]])E(ctx,x+a*s,y+b*s,s*.04,s*.03,"#fff",0);
    ctx.save();ctx.translate(x+s*.1,y-s*.3);ctx.rotate(.5);E(ctx,0,0,s*.08,s*.15,"#7DBA55",lw);ctx.restore();break;
  case"mushroom":ctx.beginPath();ctx.roundRect(x-s*.12,y-s*.02,s*.24,s*.4,s*.08);P(ctx,"#FFF4E0",lw);
    ctx.beginPath();ctx.moveTo(x-s*.42,y+s*.04);ctx.quadraticCurveTo(x-s*.4,y-s*.42,x,y-s*.42);ctx.quadraticCurveTo(x+s*.4,y-s*.42,x+s*.42,y+s*.04);ctx.closePath();P(ctx,"#E9735E",lw);
    for(const[a,b,r]of[[-.18,-.15,.07],[.12,-.26,.06],[.2,-.06,.05]])E(ctx,x+a*s,y+b*s,r*s,r*s*.85,"#FFF4E0",lw*.6);break;
  case"honey":ctx.beginPath();ctx.roundRect(x-s*.28,y-s*.18,s*.56,s*.56,s*.14);P(ctx,"#F6B940",lw);ctx.beginPath();ctx.roundRect(x-s*.31,y-s*.34,s*.62,s*.18,s*.06);P(ctx,"#F2A7B5",lw);
    ctx.beginPath();ctx.moveTo(x-s*.28,y-s*.08);for(let k=0;k<=4;k++)ctx.quadraticCurveTo(x-s*.28+k*s*.14-s*.07,y+s*.06,x-s*.28+k*s*.14,y-s*.08);ctx.fillStyle="#FFD877";ctx.fill();
    ctx.beginPath();ctx.roundRect(x-s*.14,y+s*.06,s*.28,s*.18,s*.05);P(ctx,"#FFF6E6",lw*.7);break;
  case"starbit":starP(ctx,x,y+s*.03,s*.42,5);P(ctx,"#C9B6F2",lw);starP(ctx,x,y+s*.03,s*.2,5);ctx.fillStyle="#EFE6FF";ctx.fill();ctx.fillStyle="#fff";starP(ctx,x+s*.28,y-s*.3,s*.08,4);ctx.fill();break;
  case"feather":ctx.save();ctx.translate(x,y);ctx.rotate(-.5);ctx.beginPath();ctx.moveTo(0,-s*.45);ctx.quadraticCurveTo(s*.24,-s*.1,0,s*.32);ctx.quadraticCurveTo(-s*.24,-s*.1,0,-s*.45);P(ctx,"#8EC3E6",lw);
    ctx.strokeStyle=OL;ctx.lineWidth=lw*.8;ctx.beginPath();ctx.moveTo(0,-s*.35);ctx.lineTo(0,s*.45);ctx.stroke();ctx.restore();break;
  case"honeytoast":ctx.beginPath();ctx.roundRect(x-s*.36,y-s*.3,s*.72,s*.64,s*.16);P(ctx,"#E5A35A",lw);ctx.beginPath();ctx.roundRect(x-s*.28,y-s*.22,s*.56,s*.48,s*.1);P(ctx,"#F7D68A",lw*.7);
    ctx.beginPath();ctx.moveTo(x-s*.2,y-s*.12);ctx.quadraticCurveTo(x,y+s*.05,x+s*.2,y-s*.1);ctx.quadraticCurveTo(x+s*.05,y+s*.22,x-s*.2,y-s*.12);ctx.fillStyle="#F6B940";ctx.fill();break;
  case"wool":for(const[a,b]of[[-.14,.08],[.14,.08],[0,-.12]])E(ctx,x+a*s,y+b*s,s*.2,s*.2,"#FFF8EE",lw);ctx.strokeStyle="rgba(94,59,34,.4)";ctx.lineWidth=lw*.7;for(const[a,b]of[[-.14,.08],[.14,.08],[0,-.12]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,s*.1,0,4);ctx.stroke();}break;
  case"truffle":E(ctx,x,y+s*.06,s*.32,s*.28,"#5A3B2A",lw);for(const[a,b]of[[-.12,-.04],[.1,.02],[0,.16],[.14,-.12]])E(ctx,x+a*s,y+b*s,s*.035,s*.03,"#8A6448",0);ctx.save();ctx.translate(x+s*.2,y-s*.22);ctx.rotate(.6);E(ctx,0,0,s*.06,s*.12,"#7DBA55",lw*.8);ctx.restore();break;
  case"truffletoast":ctx.beginPath();ctx.roundRect(x-s*.36,y-s*.3,s*.72,s*.64,s*.16);P(ctx,"#E5A35A",lw);ctx.beginPath();ctx.roundRect(x-s*.28,y-s*.22,s*.56,s*.48,s*.1);P(ctx,"#FFF1D6",lw*.7);for(const[a,b]of[[-.1,-.06],[.08,.02],[-.02,.12]])E(ctx,x+a*s,y+b*s,s*.07,s*.06,"#5A3B2A",lw*.6);break;
  case"quiche":E(ctx,x,y+s*.1,s*.42,s*.24,"#E3BB7E",lw);E(ctx,x,y+s*.04,s*.34,s*.17,"#FBE29A",lw*.8);for(const[a,b]of[[-.14,0],[.12,.06],[.02,-.04]]){ctx.beginPath();ctx.arc(x+a*s,y+b*s,s*.07,Math.PI,0);P(ctx,"#E9735E",lw*.6);}break;
  }
  ctx.restore();SH=_sh;
}
const ICON={};
function icon(k){if(IMG["ic_"+k])return IMG["ic_"+k];if(ICON[k])return ICON[k];const c=document.createElement("canvas");c.width=c.height=96;drawIcon(c.getContext("2d"),k,48,50,80);return ICON[k]=c.toDataURL();}
const img=(k,cls)=>`<img src="${icon(k)}" alt="" class="${cls||""}">`;
function needHTML(need,mul){return `<div class="need">${Object.entries(need).map(([k,n])=>{const h=S.inv[k]||0;return `<span class="${h<n?"no":""}" title="${ITEMS[k].n}">${img(k)}${h}/${n}</span>`;}).join("")}</div>`;}

// ================= TURTLES =================
function drawTurtle(ctx,who,view,x,y,h,flip,bob,sq){
  const im=IM[who+"_"+view]; if(!im||!im.complete)return;
  const w=h*im.width/im.height;
  ctx.save();ctx.fillStyle="rgba(70,50,30,.18)";ctx.beginPath();ctx.ellipse(x,y,w*.38,h*.06,0,0,7);ctx.fill();
  ctx.translate(x,y-(bob||0));sq=sq||1;ctx.scale((flip?-1:1)*(2-sq),sq);
  ctx.drawImage(im,-w/2,-h,w,h);
  if(who==="momo"&&S.prize.hat){ // straw hat
    const hy=-h*.93,lw=Math.max(1.5,h*.018);ctx.lineJoin="round";
    E(ctx,0,hy+h*.05,w*.5,h*.06,"#F2D27A",lw);ctx.beginPath();ctx.moveTo(-w*.25,hy+h*.05);ctx.quadraticCurveTo(-w*.25,hy-h*.12,0,hy-h*.12);ctx.quadraticCurveTo(w*.25,hy-h*.12,w*.25,hy+h*.05);ctx.closePath();P(ctx,"#F2D27A",lw);
    ctx.fillStyle="#EF5B6B";ctx.fillRect(-w*.24,hy-h*.01,w*.48,h*.04);}
  if(who==="soso"&&S.prize.ribbon){const lw=Math.max(1.5,h*.018),rx=w*.26,ry=-h*.86;
    ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-w*.14,ry-h*.07);ctx.lineTo(rx-w*.13,ry+h*.06);ctx.closePath();P(ctx,"#F2A7B5",lw);
    ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+w*.14,ry-h*.07);ctx.lineTo(rx+w*.13,ry+h*.06);ctx.closePath();P(ctx,"#F2A7B5",lw);E(ctx,rx,ry,w*.04,h*.03,"#EE8FA2",lw);}
  ctx.restore();
}
// ================= CANVAS =================
const cv=$("cv"),ctx=cv.getContext("2d");let CW=400,CH=600,DPR=1;
function resize(){const r=cv.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);CW=r.width;CH=r.height;cv.width=Math.round(CW*DPR);cv.height=Math.round(CH*DPR);}
new ResizeObserver(resize).observe($("stage"));
let grass=null;
function grassPattern(){const c=document.createElement("canvas");c.width=c.height=120;const g=c.getContext("2d");g.fillStyle="#A8C86A";g.fillRect(0,0,120,120);
  for(let i=0;i<70;i++){g.fillStyle=i%3?"rgba(120,160,70,.35)":"rgba(220,235,160,.35)";const x=Math.random()*120,y=Math.random()*120;g.fillRect(x,y,2,4);}
  return ctx.createPattern(c,"repeat");}
let stone=null;
function stonePattern(){const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d");g.fillStyle="#EED9B6";g.fillRect(0,0,64,64);
  g.strokeStyle="rgba(150,110,70,.28)";g.lineWidth=2;for(let r=0;r<4;r++)for(let q=0;q<2;q++){g.beginPath();g.roundRect(q*32+(r%2)*16+2,r*16+2,28,12,5);g.stroke();}
  return ctx.createPattern(c,"repeat");}

// floats & toast
const floats=[];
function float(x,y,txt,col,scene){floats.push({x,y,txt,col:col||"#fff",t:1.5,scene:scene||area});}
let toastT;function toast(m){const el=$("toast");el.textContent=m;el.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>el.style.opacity=0,2600);}
function drawFloats(dt){ctx.textAlign="center";ctx.font="700 16px Fredoka, sans-serif";
  for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.t-=dt;f.y-=dt*28;if(f.t<=0){floats.splice(i,1);continue;}if(f.scene!==area)continue;
    ctx.globalAlpha=Math.min(1,f.t*1.5);ctx.lineWidth=4;ctx.strokeStyle=OL;ctx.lineJoin="round";ctx.strokeText(f.txt,f.x,f.y);ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,f.y);}
  ctx.globalAlpha=1;ctx.textAlign="left";}
function bubble(x,y,w,h){ctx.beginPath();ctx.roundRect(x-w/2,y-h,w,h,h/2);ctx.moveTo(x-6,y);ctx.lineTo(x,y+7);ctx.lineTo(x+6,y);P(ctx,"#FFF6E6",2.5);}

// ================= PROGRESSION =================
function gainXP(n){S.xp+=n;while(S.xp>=xpFor(S.lvl)){S.xp-=xpFor(S.lvl);S.lvl++;S.lc+=3;
  const nc=Object.keys(CROPS).filter(k=>CROPS[k].lvl===S.lvl&&!CROPS[k].prize).map(k=>ITEMS[k].n);
  toast(`Town level ${S.lvl}! +3 loyalty coins.`+(nc.length?` New seeds: ${nc.join(", ")}.`:"")+(S.lvl===2?" The Cow Barn and Juice Bar can now be built.":""));}
  dirtyUI=true;}
function giveLC(n,x,y){S.lc+=n;if(x!=null)float(x,y,`+${n} ♥`,"#F7B6C4");dirtyUI=true;}
function spend(c){if(S.coins<c){toast(`You need ${c-S.coins} more coins.`);return false;}S.coins-=c;dirtyUI=true;return true;}

// ================= FARM (isometric island) =================
// World space = pixels of the 2304×1296 island art.
const WW0=2304,WH0=1296,TW=130,TH=71.5,OX=850,OY=270;
const BLOCKS=[[8,0],[8,3],[4,0],[4,3],[4,6],[0,0],[0,3],[8,6],[12,0],[12,3],[12,6]];
const NB=BLOCKS.length,NP=NB*9;
const pcr=i=>{const b=BLOCKS[Math.floor(i/9)],k=i%9;return[b[0]+Math.floor(k/3),b[1]+k%3];};
let tool="seed";
const V={k:.5,cx:1180,cy:660,sx:0,sy:0,availH:500,z:null};
const iso=(c,r)=>({x:OX+(c-r)*TW/2,y:OY+(c+r)*TH/2});
const tileC=i=>{const[c,r]=pcr(i);const p=iso(c,r);return{x:p.x,y:p.y+TH/2};};
const blockOf=i=>Math.floor(i/9);
const owned=i=>!!S.blocks[blockOf(i)];
const landCost=()=>{const n=S.blocks.filter(Boolean).length;return Math.round(80*Math.pow(1.28,n-2)/10)*10;};
function blockCorners(b){const[c0,r0]=BLOCKS[b];return[iso(c0,r0),iso(c0+3,r0),iso(c0+3,r0+3),iso(c0,r0+3)];}
function plotIndex(c,r){for(let b=0;b<NB;b++){const[c0,r0]=BLOCKS[b];if(c>=c0&&c<c0+3&&r>=r0&&r<r0+3)return b*9+(c-c0)*3+(r-r0);}return -1;}
const BLD={
  barn:{n:"Main Barn",x:470,y:478,w:420,flip:true},
  pig:{n:"Pig Barn",x:340,y:705,w:290,cost:650,lvl:4,prod:"truffle",every:150,cap:2,d:"Truffles"},
  chicken:{n:"Chicken Pen",x:1225,y:392,w:470,cost:120,lvl:1,prod:"egg",every:45,cap:4,d:"Eggs"},
  cow:{n:"Cow Barn",x:1870,y:462,w:440,cost:300,lvl:2,prod:"milk",every:70,cap:3,d:"Milk"},
  sheep:{n:"Sheep Barn",x:1960,y:828,w:430,cost:450,lvl:3,prod:"wool",every:90,cap:3,d:"Wool"},
  truck:{n:"Expedition Truck",x:430,y:960,w:330},
};
const DECOR=[];
const UPG={spd:{n:"Faster",ic:"⚡",max:3,cost:[150,400,900]},cap:{n:"Bigger",ic:"📦",max:2,cost:[120,350]},auto:{n:"Auto-collect",ic:"🧺",max:1,cost:[500]}};
const PEN_MUL={chicken:1,cow:1.6,sheep:2.2,pig:3};
const SOIL_COST=[250,600,1200];
const penEvery=id=>BLD[id].every*Math.pow(.8,(S.upg[id]||{}).spd||0);
const penCap=id=>BLD[id].cap+2*((S.upg[id]||{}).cap||0);
const upgCost=(id,k)=>Math.round(UPG[k].cost[(S.upg[id]||{})[k]||0]*PEN_MUL[id]/10)*10;
const FURN={
  bench:{n:"Garden Bench",x:1430,y:470,w:170,cost:300,act:"sit",lines:["Ahh, nice view.","Comfy~"]},
  swing:{n:"Swing",x:1600,y:400,w:190,cost:500,act:"swing",lines:["Wheee!","Higher!"]},
  hammock:{n:"Hammock",x:1740,y:560,w:220,cost:800,act:"nap",lines:["Zzz…","Five more minutes…"]},
  picnic:{n:"Picnic Set",x:1545,y:585,w:200,cost:400,act:"eat",lines:["Yum!","Sandwich time!"]},
};
const furnUser={};
const BOUNDS=[0.34,0.67,1];
const isWet=pl=>pl.w||Date.now()<S.sprinklerUntil;
function advance(pl,dt){if(!pl.c)return;const T=CROPS[pl.c].time;const boost=1+.15*((S.upg&&S.upg.soil)||0);
  while(dt>0&&pl.p<1){const rate=(isWet(pl)?1:.35)*boost/T;const nb=BOUNDS.find(b=>b>pl.p+1e-9);const need=(nb-pl.p)/rate;
    if(need<=dt){pl.p=nb;dt-=need;pl.w=false;}else{pl.p+=rate*dt;dt=0;}}}
const stage=pl=>pl.p<.34?0:pl.p<.67?1:pl.p<1?2:3;
const spr=k=>IM["oa_"+k];
function drawSpr(k,x,y,w,ax,ay,alpha){const im=spr(k);if(!im||!im.complete||!im.width)return;const h=w*im.height/im.width;if(alpha!=null)ctx.globalAlpha=alpha;ctx.drawImage(im,x-w*(ax??.5),y-h*(ay??1),w,h);ctx.globalAlpha=1;}
let GHOST={};
function ghost(k){if(GHOST[k])return GHOST[k];const im=spr(k);if(!im.complete||!im.width)return null;const c=document.createElement("canvas");c.width=im.width;c.height=im.height;const g=c.getContext("2d");g.drawImage(im,0,0);
  const d=g.getImageData(0,0,c.width,c.height),a=d.data;for(let j=0;j<a.length;j+=4){const l=a[j]*.3+a[j+1]*.59+a[j+2]*.11;a[j]=a[j+1]=a[j+2]=l*.55+120;}g.putImageData(d,0,0);return GHOST[k]=c;}

// ---- view ----
function viewLayout(){const port=CW/CH<1;V.availH=CH-64-150;
  if(V.z==null)V.z=port?1.2:1.25;const cover=Math.max(CW/WW0,CH/WH0);V.k=cover*V.z;
  const hw=CW/2/V.k,hh=CH/2/V.k;V.cx=Math.max(hw,Math.min(WW0-hw,V.cx));V.cy=Math.max(hh,Math.min(WH0-hh,V.cy));
  V.ox=CW/2-V.cx*V.k;V.oy=CH/2-V.cy*V.k;}
const toW=(mx,my)=>({x:(mx-V.ox)/V.k,y:(my-V.oy)/V.k});
const toS=(x,y)=>({x:x*V.k+V.ox,y:y*V.k+V.oy});

// ---- particles, flyers, pops (world space) ----
const parts=[],flyers=[],pops={};
function burst(kind,x,y,n,opt){for(let k=0;k<n;k++){const a=rnd(0,Math.PI*2),sp=rnd(60,200)*(opt&&opt.sp||1);
  parts.push({kind,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rnd(80,200),life:rnd(.5,.9),t:0,rot:rnd(0,6),vr:rnd(-6,6),s:rnd(.7,1.3),col:opt&&opt.col});}}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue;}p.vy+=(p.kind==="sparkle"||p.kind==="heart"?-60:600)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;}
  for(let i=flyers.length-1;i>=0;i--){const f=flyers[i];f.t+=dt/.8;if(f.t>=1){flyers.splice(i,1);V.barnBounce=1;}}
  for(const k in pops){pops[k]-=dt*3;if(pops[k]<=0)delete pops[k];}if(V.barnBounce>0)V.barnBounce-=dt*3;}
function drawParts(){for(const p of parts){const a=1-p.t/p.life;ctx.save();ctx.globalAlpha=Math.min(1,a*1.6);ctx.translate(p.x,p.y);ctx.rotate(p.rot);const s=11*p.s;
    if(p.kind==="drop"){ctx.rotate(-p.rot);ctx.beginPath();ctx.moveTo(0,-s*1.3);ctx.quadraticCurveTo(s,0,0,s);ctx.quadraticCurveTo(-s,0,0,-s*1.3);ctx.fillStyle="#7EC4EE";ctx.fill();ctx.strokeStyle="#4C93C4";ctx.lineWidth=2;ctx.stroke();}
    else if(p.kind==="dirt"){ctx.beginPath();ctx.arc(0,0,s*.7,0,7);ctx.fillStyle="#8A5A36";ctx.fill();}
    else if(p.kind==="leaf"){ctx.beginPath();ctx.ellipse(0,0,s*.5,s*1.1,0,0,7);ctx.fillStyle=p.col||"#8FCB64";ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();}
    else if(p.kind==="sparkle"){ctx.fillStyle=p.col||"#FFF3B0";starP(ctx,0,0,s*1.4,4);ctx.fill();}
    else if(p.kind==="heart"){const im=IM.heart;if(im.complete)ctx.drawImage(im,-s*1.6,-s*1.6,s*3.2,s*3.2);}
    ctx.restore();}
  for(const f of flyers){const t=f.t,e=t*t*(3-2*t);const x=f.x0+(f.x1-f.x0)*e,y=f.y0+(f.y1-f.y0)*e-Math.sin(t*Math.PI)*220;
    ctx.save();ctx.globalAlpha=t>.85?(1-t)/.15:1;drawIcon(ctx,f.k,x,y,70-25*t);ctx.restore();}}
function flyToBarn(k,x,y,n){const b=BLD.barn;for(let j=0;j<Math.min(n,3);j++)setTimeout(()=>flyers.push({k,x0:x,y0:y,x1:b.x,y1:b.y-260,t:0}),j*90);}

// ---- turtles (grid coords) ----
const TURTLES=[
  {who:"momo",name:"Momo",c:7.5,r:2,tc:null,tr:null,state:"idle",idleT:1,view:"front",flip:false,say:null,sayT:0},
  {who:"soso",name:"Soso",c:11.5,r:6,tc:null,tr:null,state:"idle",idleT:2,view:"front",flip:false,say:null,sayT:0},
];
const LINES={momo:["Let's go!","Yay, sprouts!","Hehe~","Mmm, carrots…","Swish swish!"],soso:["Slow and steady.","The soil smells nice.","Okay…","Grow big, little seeds.","What a nice island."]};
function cheer(i){const[c,r]=pcr(i);let best=null,bd=1e9;for(const tu of TURTLES){if(S.exp[tu.who]||tu.state==="use")continue;const d=Math.hypot(tu.c-c,tu.r-r);if(d<bd){bd=d;best=tu;}}
  if(!best)return;if(true){const gaps=[-.5,3.5,7.5,11.5,15.5];const gc=gaps.reduce((a,g)=>Math.abs(g-c-.5)<Math.abs(a-c-.5)?g:a);best.tc=gc;best.tr=Math.max(-.5,Math.min(9.4,r+.5));best.state="walk";}
  if(Math.random()<.06){best.say=pick(LINES[best.who]);best.sayT=2;}}
function updateTurtlesFarm(dt){for(const tu of TURTLES){tu.sayT-=dt;if(S.exp[tu.who])continue;
  if(tu.state==="walk"||tu.state==="wander"||tu.state==="goto"){const dc=tu.tc-tu.c,dr=tu.tr-tu.r,d=Math.hypot(dc,dr);const sp=tu.state==="walk"?(tu.who==="momo"?3.4*(S.prize.hat?1.15:1):2.8):.8;
    const sx=dc-dr,sy=dc+dr;if(Math.abs(sy)>Math.abs(sx)*.6){tu.view=sy>0?(Math.abs(sx)>.3?"three":"front"):"back";tu.flip=sy>0&&sx<0;}else{tu.view="side";tu.flip=sx<0;}
    if(d<sp*dt&&tu.state==="goto"){if(furnUser[tu.furn]){tu.state="idle";tu.idleT=1;tu.furn=null;}else{furnUser[tu.furn]=tu.who;tu.state="use";tu.useT=rnd(9,16);tu.say=pick(FURN[tu.furn].lines);tu.sayT=2.5;}}
    else if(d<sp*dt){tu.c=tu.tc;tu.r=tu.tr;tu.idleT=tu.state==="walk"?1.5:rnd(2,5);tu.state="idle";tu.view=Math.random()<.5?"three":"front";tu.flip=Math.random()<.5;}else{tu.c+=dc/d*sp*dt;tu.r+=dr/d*sp*dt;}}
  else if(tu.state==="use"){tu.useT-=dt;if(tu.useT<=0||!S.furn[tu.furn]){furnUser[tu.furn]=null;const F2=FURN[tu.furn];const g=w2g(F2.x+F2.w*.45,F2.y+10);tu.c=g.c;tu.r=g.r;tu.state="idle";tu.idleT=2;tu.view="front";tu.furn=null;}}
  else{tu.idleT-=dt;if(tu.idleT<=0){const free=Object.keys(FURN).filter(k=>S.furn[k]&&!furnUser[k]&&!TURTLES.some(t=>t.furn===k));
      if(free.length&&Math.random()<.45){const k=pick(free),F2=FURN[k];const g=w2g(F2.x,F2.y+6);tu.furn=k;tu.tc=g.c;tu.tr=g.r;tu.state="goto";}
      else{tu.state="wander";tu.tc=pick([3.5,7.5,11.5]);tu.tr=rnd(0,9);}}}}}
function w2g(x,y){const dx=(x-OX)/(TW/2),dy=(y-TH/2-OY)/(TH/2);return{c:(dx+dy)/2,r:(dy-dx)/2};}
function turtlePos(tu){const p=iso(tu.c,tu.r);return{x:p.x,y:p.y+TH/2};}

// ---- animals ----
const ANIMALS=[{k:"hen",b:"chicken",x:1240,y:285,w:46},{k:"hen",b:"chicken",x:1300,y:300,w:42},{k:"chick",b:"chicken",x:1270,y:318,w:28},{k:"cow_a",b:"cow",x:1985,y:372,w:96},{k:"sheep_a",b:"sheep",x:2040,y:735,w:74},{k:"sheep_a",b:"sheep",x:2095,y:752,w:68},{k:"pig_a",b:"pig",x:392,y:652,w:56}].map(a=>({...a,hx:a.x,hy:a.y,tx:a.x,ty:a.y,t:rnd(0,3),flip:false}));
function updAnimals(dt){for(const a of ANIMALS){a.t-=dt;if(a.t<=0){a.t=rnd(2,5);const R=a.k==="cow_a"?22:a.k==="hen"||a.k==="chick"?26:16;a.tx=a.hx+rnd(-R,R);a.ty=a.hy+rnd(-R*.5,R*.5);}
  const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);if(d>2){const sp=a.k==="cow_a"?16:a.k==="sheep_a"?20:a.k==="pig_a"?22:38;a.x+=dx/d*Math.min(d,sp*dt);a.y+=dy/d*Math.min(d,sp*dt);a.flip=dx>0;a.mv=1;}else a.mv=0;}}

// ---- actions ----
let stroke=null;
function plotAtW(x,y){const dx=(x-OX)/(TW/2),dy=(y-OY)/(TH/2);const c=Math.floor((dx+dy)/2),r=Math.floor((dy-dx)/2);return plotIndex(c,r);}
function apply(i){if(i<0||!owned(i)||stroke.done.has(i))return;stroke.done.add(i);const pl=S.plots[i],p=tileC(i);
  if(tool==="seed"){if(pl.c)return;if((S.seeds[S.sel]||0)<=0){if(!stroke.warned){stroke.warned=1;toast(`No ${ITEMS[S.sel].n} seeds left. Pick another seed or buy more in the Main Barn.`);}return;}
    S.seeds[S.sel]--;pl.c=S.sel;pl.p=0;pl.w=false;pops[i]=1;burst("dirt",p.x,p.y,7,{sp:.6});cheer(i);dirtyUI=true;}
  else if(tool==="water"){if(!pl.c||pl.p>=1||isWet(pl))return;pl.w=true;pops[i]=1;burst("drop",p.x,p.y-20,8,{sp:.7});cheer(i);}
  else{if(!pl.c||pl.p<1)return;const C=CROPS[pl.c];const n=C.yield;
    if(invTotal()+n>S.barnCap){if(!stroke.warned){stroke.warned=1;toast("The barn is full. Stock the shops or upgrade storage in the Main Barn.");}return;}
    addInv(pl.c,n);gainXP(C.xp);flyToBarn(pl.c,p.x,p.y-40,n);const s=toS(p.x,p.y-60);float(s.x,s.y,`+${n}`,"#fff");burst("leaf",p.x,p.y-20,7);burst("sparkle",p.x,p.y-40,4,{sp:.5});
    pl.c=null;pl.p=0;pl.w=false;pops[i]=1;cheer(i);dirtyUI=true;}}
function bldHit(w){let best=null;for(const id in BLD){const b=BLD[id],im=spr(id);if(!im||!im.width)continue;const h=b.w*im.height/im.width;
    if(w.x>b.x-b.w*.42&&w.x<b.x+b.w*.42&&w.y>b.y-h*.92&&w.y<b.y+8){if(!best||b.y>BLD[best].y)best=id;}}return best;}
function farmHit(mx,my){const w=toW(mx,my);
  for(const tu of TURTLES){if(S.exp[tu.who])continue;const p=turtlePos(tu);if(Math.abs(w.x-p.x)<44&&w.y<p.y&&w.y>p.y-130)return{k:"t",tu};}
  const i=plotAtW(w.x,w.y);if(i>=0){if(!owned(i))return{k:"land",b:blockOf(i)};return null;}
  for(const k in FURN){if(!S.furn[k])continue;const F2=FURN[k];if(Math.abs(w.x-F2.x)<F2.w*.45&&w.y<F2.y+6&&w.y>F2.y-F2.w*.9)return{k:"f",id:k};}
  const b=bldHit(w);if(b)return{k:"b",id:b};
  return{k:"pan"};}
function farmDown(mx,my){viewLayout();const h=farmHit(mx,my);
  if(h){stroke={tap:h,x0:mx,y0:my,cx0:V.cx,cy0:V.cy,done:new Set()};return;}
  stroke={done:new Set(),last:{x:mx,y:my},pt:{x:mx,y:my}};const w=toW(mx,my);apply(plotAtW(w.x,w.y));}
function farmMove(mx,my){if(!stroke)return;
  if(stroke.tap){if(Math.hypot(mx-stroke.x0,my-stroke.y0)>10){stroke.panning=true;}if(stroke.panning){V.cx=stroke.cx0-(mx-stroke.x0)/V.k;V.cy=stroke.cy0-(my-stroke.y0)/V.k;}return;}
  const l=stroke.last,d=Math.hypot(mx-l.x,my-l.y),n=Math.max(1,Math.ceil(d/(TW*V.k*.2)));
  for(let k=1;k<=n;k++){const w=toW(l.x+(mx-l.x)*k/n,l.y+(my-l.y)*k/n);apply(plotAtW(w.x,w.y));}stroke.last={x:mx,y:my};stroke.pt={x:mx,y:my};}
function farmUp(mx,my){if(!stroke)return;const s=stroke;stroke=null;
  if(s.tap&&!s.panning){const h=s.tap;
    if(h.k==="b")buildingTap(h.id);
    else if(h.k==="f"){const u=furnUser[h.id],F2=FURN[h.id];burst("heart",F2.x,F2.y-F2.w*.6,3,{sp:.3});if(u){const tu=TURTLES.find(t=>t.who===u);tu.say=pick(F2.lines);tu.sayT=2.2;}}
    else if(h.k==="t"){h.tu.say=pick(LINES[h.tu.who]);h.tu.sayT=2.2;const p=turtlePos(h.tu);burst("heart",p.x,p.y-115,3,{sp:.3});}
    else if(h.k==="land"){openSheet("land",h.b);}}
  if(!s.tap&&s.done.size)save();}
function buildingTap(id){const b=BLD[id];const x=b.x,y=b.y-150;
  if(id==="barn")return openBarn();
  if(id==="truck")return openSheet("exp");
  const st=S.bld[id];
  if(!st.own){openSheet("build",id);return;}
  if(!b.prod){toast(`${b.n}: ${b.d}`);return;}
  if(st.n<=0){toast(`${b.n}: ${b.d}`);return;}
  const n=Math.min(st.n,S.barnCap-invTotal());if(n<=0){toast("The barn is full.");return;}
  st.n-=n;addInv(b.prod,n);gainXP(n);flyToBarn(b.prod,x,y,n);const s=toS(x,y);float(s.x,s.y,`+${n} ${ITEMS[b.prod].n}`);save();}
function buyBuilding(id){const b=BLD[id];if(S.lvl<b.lvl){toast(`${b.n} unlocks at town level ${b.lvl}.`);return;}if(!spend(b.cost))return;
  S.bld[id]={own:true,n:0,t:Date.now()};giveLC(2);burst("sparkle",b.x,b.y-120,14,{sp:1.2});toast(`${b.n} built!`);save();}

// ---- expeditions ----
const DEST={
  beach:{n:"Sunny Beach",min:3,lvl:1,blurb:"Shells wash up with every wave.",loot:[["shell",1,3,1],["berry",1,2,.6],["seed:strawberry",2,3,.35]],col:"#BFE3EA"},
  forest:{n:"Mushroom Forest",min:8,lvl:2,blurb:"Soft moss, buzzing bees and mushrooms everywhere.",loot:[["mushroom",2,3,1],["honey",1,2,.75],["berry",2,3,.6],["seed:pumpkin",2,2,.3]],col:"#B5DA84"},
  hill:{n:"Starry Hill",min:20,lvl:3,blurb:"Shooting stars leave shards in the grass.",loot:[["starbit",1,2,1],["feather",1,2,.8],["seed:melon",1,2,.5],["honey",1,1,.4]],col:"#E9D6F5"},
};
const expDur=(who,d)=>DEST[d].min*60000*(who==="momo"?.75:1);
const fmtT=ms=>{const s=Math.ceil(ms/1000);return s>=60?`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`:`${s}s`;};
let expSel={who:"momo",dest:"beach",snack:false},postcard=null;
function rollLoot(e){const D=DEST[e.dest],got={};
  for(const[k,a,b,ch]of D.loot){if(Math.random()>ch*(e.snack?1.25:1))continue;let n=a+Math.floor(Math.random()*(b-a+1));if(e.who==="soso"&&Math.random()<.6)n++;if(e.snack)n=Math.ceil(n*1.5);got[k]=(got[k]||0)+n;}
  return got;}
function sendExp(){const {who,dest,snack}=expSel;if(S.exp[who])return;if(S.exp.momo||S.exp.soso){toast("The truck is already out. One trip at a time.");return;}if(S.lvl<DEST[dest].lvl){toast(`${DEST[dest].n} opens at level ${DEST[dest].lvl}.`);return;}
  if(snack){if(!has({egg:1,wheat:2})){toast("A snack needs 1 egg and 2 wheat from the barn.");return;}take({egg:1,wheat:2});}
  S.exp[who]={dest,start:Date.now(),end:Date.now()+expDur(who,dest),snack};
  closeSheet();TRK.state="gone";playDeparture(who,dest);save();}
function collectExp(who){const e=S.exp[who];if(!e||Date.now()<e.end)return;const got=rollLoot(e);
  for(const k in got){if(k.startsWith("seed:")){const c=k.slice(5);S.seeds[c]=(S.seeds[c]||0)+got[k];}else addInv(k,got[k]);}
  S.exp[who]=null;gainXP(5+DEST[e.dest].min);postcard={who,dest:e.dest,got};const tu=TURTLES.find(t=>t.who===who);tu.c=6.4;tu.r=12.6;tu.say="I'm home!";tu.sayT=2.5;save();}

// ---- drawing ----
function drawSeedBag(c,x,y,s,k){const lw=Math.max(1.5,s*.05);c.beginPath();c.moveTo(x-s*.32,y-s*.2);c.quadraticCurveTo(x-s*.4,y+s*.42,x,y+s*.42);c.quadraticCurveTo(x+s*.4,y+s*.42,x+s*.32,y-s*.2);c.closePath();P(c,"#E8CFA0",lw);
  c.beginPath();c.moveTo(x-s*.3,y-s*.2);c.lineTo(x-s*.2,y-s*.38);c.lineTo(x+s*.2,y-s*.38);c.lineTo(x+s*.3,y-s*.2);c.closePath();P(c,"#D9B98F",lw);
  c.strokeStyle="#EE8FA2";c.lineWidth=lw*1.4;c.beginPath();c.moveTo(x-s*.3,y-s*.2);c.lineTo(x+s*.3,y-s*.2);c.stroke();if(k)drawIcon(c,k,x,y+s*.1,s*.42);}
function drawBasket(c,x,y,s){const lw=Math.max(1.5,s*.05);c.strokeStyle=OL;c.lineWidth=lw*2.2;c.beginPath();c.arc(x,y-s*.05,s*.3,Math.PI,0);c.stroke();c.strokeStyle="#D9A45E";c.lineWidth=lw;c.stroke();
  drawIcon(c,"carrot",x-s*.12,y-s*.08,s*.35);drawIcon(c,"tomato",x+s*.12,y-s*.02,s*.3);
  c.beginPath();c.moveTo(x-s*.38,y-s*.02);c.lineTo(x+s*.38,y-s*.02);c.lineTo(x+s*.3,y+s*.36);c.lineTo(x-s*.3,y+s*.36);c.closePath();P(c,"#E3A863",lw);
  c.strokeStyle="rgba(94,59,34,.4)";c.lineWidth=1.2;for(let k=1;k<4;k++){c.beginPath();c.moveTo(x-s*.36+k*s*.02,y-s*.02+k*s*.095);c.lineTo(x+s*.36-k*s*.02,y-s*.02+k*s*.095);c.stroke();}}
function drawToolCursor(){if(!stroke||!stroke.pt)return;const{x,y}=stroke.pt;const s=Math.max(46,TW*V.k*.8);ctx.save();
  if(tool==="water"){const im=IM.canpour;if(im.complete){const w=s*1.3,h=w*im.height/im.width;ctx.translate(x-s*.45,y-s*.7);ctx.rotate(-.15);ctx.drawImage(im,-w/2,-h/2,w,h);}}
  else{const ui=IM[tool==="seed"?"ui_seed":"ui_basket"];if(ui&&ui.complete&&ui.width){const w=s*1.1,h=w*ui.height/ui.width;ctx.translate(x-s*.35,y-s*.7);ctx.rotate(-.12);ctx.drawImage(ui,-w/2,-h/2,w,h);}
    else if(tool==="seed"){ctx.translate(x-s*.3,y-s*.7);drawSeedBag(ctx,0,0,s,S.sel);}else{ctx.translate(x-s*.3,y-s*.65);drawBasket(ctx,0,0,s);}}ctx.restore();}
function drawTile(i,time){if(!owned(i))return;const[c,r]=pcr(i),p=iso(c,r),pl=S.plots[i];const pp=pops[i]>0?Math.sin(pops[i]*Math.PI)*.08:0;
  drawSpr(isWet(pl)&&pl.c?"soilwet":"soil",p.x,p.y-TH*.02,TW*(1.0+pp),.5,0);}
function drawLockedBlocks(time){for(let b=0;b<NB;b++){if(S.blocks[b])continue;const q=blockCorners(b);
    const cx=(q[0].x+q[2].x)/2,cy=(q[0].y+q[2].y)/2;const pp=pops["L"+b]>0?Math.sin(pops["L"+b]*Math.PI)*.04:0;
    const im=spr("locked");if(im&&im.width){const w=(q[1].x-q[3].x)*(1.06+pp),h=w*im.height/im.width;ctx.globalAlpha=.97;ctx.drawImage(im,cx-w/2,q[0].y-h*.1,w,h);ctx.globalAlpha=1;}
    label(cx,cy+TH*.35,`${landCost()}`,{coin:1});}}
function drawCropW(i,time){const pl=S.plots[i];if(!owned(i)||!pl.c)return;const p=tileC(i),st=stage(pl);const pp=pops[i]>0?Math.sin(pops[i]*Math.PI)*.3:0;const sway=Math.sin(time*1.8+i*.7)*.04;
  ctx.save();ctx.translate(p.x,p.y+TH*.18);ctx.rotate(sway);ctx.scale(1+pp*.5,1+pp);
  if(st===0)drawSpr("seedmound",0,0,TW*.55);else if(st===1)drawSpr("sprout",0,0,TW*.48);else if(st===2)drawSpr("young",0,0,TW*.6);
  else{drawSpr("r_"+pl.c,0,0,TW*(pl.c==="pumpkin"||pl.c==="melon"?.74:.66));}
  ctx.restore();
  if(st===3&&(time*1.4+i*.37)%2.6<.3){ctx.fillStyle="#FFF8C8";starP(ctx,p.x+34,p.y-58,11,4);ctx.fill();}
  if(st<3&&!isWet(pl)){const bx=p.x+36,by=p.y-55+Math.sin(time*4+i)*3;E(ctx,bx,by,15,15,"#FFF6E6",3);ctx.beginPath();ctx.moveTo(bx,by-10);ctx.quadraticCurveTo(bx+9,by+1,bx,by+9);ctx.quadraticCurveTo(bx-9,by+1,bx,by-10);ctx.fillStyle="#6BB3E0";ctx.fill();}
  if(st<3){const bw=52,bx=p.x-26,by=p.y+TH*.28;ctx.fillStyle="rgba(94,59,34,.6)";ctx.beginPath();ctx.roundRect(bx,by,bw,7,4);ctx.fill();ctx.fillStyle=isWet(pl)?"#9FD8F2":"#F2C14E";ctx.beginPath();ctx.roundRect(bx+1.2,by+1.2,(bw-2.4)*pl.p,4.6,3);ctx.fill();}}
const LABELS=[];
function label(x,y,txt,opt){LABELS.push({x,y,txt,...(opt||{})});}
function drawLabels(time){for(const L of LABELS){const s=toS(L.x,L.y);ctx.font="700 13px Fredoka,sans-serif";ctx.textAlign="center";
    if(L.bubble){const ic=L.icon;const w=ctx.measureText(L.txt).width+(ic?44:20),bb=Math.sin(time*4)*3;bubble(s.x,s.y+bb,w,30);if(ic)drawIcon(ctx,ic,s.x-w/2+20,s.y+bb-15,22);ctx.fillStyle=L.col||OL;ctx.fillText(L.txt,s.x+(ic?10:0),s.y+bb-10);}
    else if(L.coin){ctx.font="700 15px Fredoka,sans-serif";const w=ctx.measureText(L.txt).width+40;ctx.beginPath();ctx.roundRect(s.x-w/2,s.y-14,w,28,14);P(ctx,"#F0AE62",2.5);E(ctx,s.x-w/2+15,s.y,8,8,"#F2C14E",2);ctx.fillStyle="#fff";ctx.lineWidth=3;ctx.strokeStyle=OL;ctx.strokeText(L.txt,s.x+9,s.y+5);ctx.fillText(L.txt,s.x+9,s.y+5);}
    else{const w=ctx.measureText(L.txt).width+18;ctx.beginPath();ctx.roundRect(s.x-w/2,s.y-12,w,24,12);P(ctx,L.bg||"#FFF6E6",2);ctx.fillStyle=L.col||OL;ctx.fillText(L.txt,s.x,s.y+5);}}
  ctx.textAlign="left";LABELS.length=0;}
const SHAD={};
function shadowOf(k){if(SHAD[k])return SHAD[k];const im=spr(k);if(!im||!im.width)return null;const c=document.createElement("canvas");c.width=im.width;c.height=im.height;const g=c.getContext("2d");g.drawImage(im,0,0);g.globalCompositeOperation="source-in";g.fillStyle="#2E3B12";g.fillRect(0,0,c.width,c.height);return SHAD[k]=c;}
function drawShadow(k,b,h,a){const sh=shadowOf(k);if(!sh)return;ctx.save();ctx.globalAlpha=a;ctx.translate(b.x,b.y-h*.06);ctx.transform(1,0,-.85,.32,0,0);if(b.flip)ctx.scale(-1,1);ctx.drawImage(sh,-b.w/2,-h,b.w,h);ctx.restore();}
function drawBuilding(id,time){if(id==="truck")return drawTruck(time);const b=BLD[id],st=S.bld[id];const im=spr(id);if(!im||!im.width)return;const h=b.w*im.height/im.width;
  let sq=1;if(id==="barn"&&V.barnBounce>0)sq=1+Math.sin(V.barnBounce*Math.PI)*.06;
  drawShadow(id,b,h,st&&!st.own?.12:.26);
  if(st&&!st.own){const g=ghost(id);if(g){ctx.save();ctx.globalAlpha=.75;ctx.translate(b.x,b.y);if(b.flip)ctx.scale(-1,1);ctx.drawImage(g,-b.w/2,-h,b.w,h);ctx.restore();}
    label(b.x,b.y-h*.45,S.lvl>=b.lvl?`🔒 ${b.n}`:`🔒 Lv ${b.lvl}`);return;}
  ctx.save();ctx.translate(b.x,b.y);ctx.scale((b.flip?-1:1)*(2-sq),sq);ctx.drawImage(im,-b.w/2,-h,b.w,h);ctx.restore();
  if(id==="windmill"){/* gentle sail shimmer */ }
  if(id==="barn")label(b.x,b.y+8,`Main Barn · ${invTotal()}/${S.barnCap}`);
  if(st&&b.prod&&st.n>0)label(b.x,b.y-h*.9,`×${st.n}`,{bubble:1,icon:b.prod});
  if(st&&st.own&&(S.upg[id]||{}).auto)label(b.x+b.w*.32,b.y-h*.55,"🧺 auto");
}
// truck: drives down the road when a trip starts, back when it ends
const TRK={mode:null,t:0};
const ROAD={dx:1,dy:.62};
function drawTruck(time){const b=BLD.truck,im=spr("truck");if(!im||!im.width)return;const h=b.w*im.height/im.width;
  const away=["momo","soso"].find(w=>S.exp[w]);const ready=away&&Date.now()>=S.exp[away].end;
  const want=away&&!ready?"gone":"home";
  if(TRK.state===undefined)TRK.state=want;
  if(TRK.state!==want){TRK.state=want;TRK.mode=null;if(want==="home")burst("sparkle",b.x,b.y-h*.5,12,{sp:1});}
  let off=0;
  if(TRK.mode){TRK.t+=1/60;const u=Math.min(1,TRK.t/2.2);const e=u*u*(3-2*u);
    off=TRK.mode==="leave"?e*1100:(1-e)*-1100;
    if(u>=1){TRK.state=TRK.mode==="leave"?"gone":"home";TRK.mode=null;}}
  else if(TRK.state==="gone"){label(b.x,b.y-20,`${away==="momo"?"Momo":"Soso"} away · ${fmtT(S.exp[away].end-Date.now())}`);return;}
  const x=b.x+off*ROAD.dx,y=b.y+off*ROAD.dy;const bob=TRK.mode?Math.abs(Math.sin(time*18))*3:0;
  drawShadow("truck",{x,y,w:b.w},h,.24);
  ctx.save();ctx.translate(x,y-bob);ctx.drawImage(im,-b.w/2,-h,b.w,h);ctx.restore();
  if(TRK.mode)for(let k=0;k<2;k++){ctx.globalAlpha=.4;E(ctx,x-b.w*.45-k*30,y-10-k*12,18+k*6,12+k*4,"#E9D6AA",0);ctx.globalAlpha=1;}
  if(!TRK.mode){if(ready)label(x,y-h*.95,"Back home!",{bubble:1,col:"#C2553D"});else label(x,y+16,"Expedition Truck");}}
let driveT=null;
function playDeparture(who,dest){const el=$("drive");el.hidden=false;const sc=$("drScene");sc.style.backgroundImage=`url(${IMG.dr_road})`;requestAnimationFrame(()=>sc.style.setProperty("--sw",Math.round(sc.offsetHeight*2800/600)+"px"));$("drTruck").src=IMG.dr_truck;
  $("drText").innerHTML=`<img src="${IMG[who+"_explore"]}" alt=""><span>${FNAME[who]} is off to <b>${DEST[dest].n}</b>!</span>`;
  el.classList.remove("go");void el.offsetWidth;el.classList.add("go");clearTimeout(driveT);driveT=setTimeout(endDeparture,3600);}
function endDeparture(){clearTimeout(driveT);$("drive").hidden=true;}
document.getElementById("drive").addEventListener("click",endDeparture);
function drawTurtleW(tu,time){const p=turtlePos(tu);const moving=tu.state==="walk"||tu.state==="wander"||tu.state==="goto";
  const ph=time*(tu.state==="walk"?13:8)+(tu.who==="soso"?1.3:0);const hop=moving?Math.abs(Math.sin(ph))*12:Math.sin(time*2.2+(tu.who==="soso"?1:0))*1.5;const sq=moving?1+Math.cos(ph*2)*.05:1+Math.sin(time*2.2)*.02;
  drawTurtle(ctx,tu.who,tu.view,p.x,p.y,128,tu.flip,hop,sq);
  if(tu.sayT>0&&tu.say){LABELS.push({x:p.x,y:p.y-135,txt:tu.say,bubble:1});}}
function drawFarm(time){viewLayout();
  if(!V.pat&&IM.farmbg.complete&&IM.farmbg.width){const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d");const sx=IM.farmbg.width/WW0;
    g.drawImage(IM.farmbg,1080*sx,650*sx,256*sx,256*sx,0,0,256,256);V.pat=ctx.createPattern(c,"repeat");}
  if(V.pat){V.pat.setTransform(new DOMMatrix([V.k*DPR,0,0,V.k*DPR,V.ox*DPR,V.oy*DPR]));ctx.fillStyle=V.pat;}else ctx.fillStyle="#97B85A";ctx.fillRect(0,0,CW,CH);
  ctx.save();ctx.setTransform(DPR*V.k,0,0,DPR*V.k,DPR*V.ox,DPR*V.oy);
  const bgi=IM.farmbg;if(bgi.complete)ctx.drawImage(bgi,0,0,WW0,WH0);
  for(let i=0;i<NP;i++)drawTile(i,time);
  drawLockedBlocks(time);
  const items=[];
  for(let i=0;i<NP;i++)if(S.plots[i].c&&owned(i)){const p=tileC(i);items.push({y:p.y+TH*.2,f:()=>drawCropW(i,time)});}
  for(const id in BLD)items.push({y:BLD[id].y,f:()=>drawBuilding(id,time)});
  for(const[k,x,y,w]of DECOR)items.push({y,f:()=>drawSpr(k,x,y,w)});
  for(const a of ANIMALS){if(a.b&&!S.bld[a.b].own)continue;items.push({y:a.b?BLD[a.b].y+1+a.y*1e-4:a.y,f:()=>{const bob=a.mv?Math.abs(Math.sin(time*10+a.hx))*5:0;ctx.save();ctx.translate(a.x,a.y-bob);if(a.flip)ctx.scale(-1,1);drawSpr(a.k,0,0,a.w);ctx.restore();}});}
  for(const k in FURN){if(!S.furn[k])continue;const F2=FURN[k];items.push({y:F2.y,f:()=>{const u=furnUser[k];const key=u?`f_${k}_${u}`:`f_${k}`;const im=spr(key)&&spr(key).width?key:`f_${k}`;
    const sw=u&&k==="swing"?Math.sin(time*3)*.06:0;const im2=spr(im);if(!im2||!im2.width)return;const h=F2.w*im2.height/im2.width;drawShadow(im,{x:F2.x,y:F2.y,w:F2.w},h,.2);
    ctx.save();ctx.translate(F2.x,F2.y-h*.85);ctx.rotate(sw);ctx.translate(-F2.x,-(F2.y-h*.85));drawSpr(im,F2.x,F2.y,F2.w*(u?1.0:1));ctx.restore();
    if(u){const tu=TURTLES.find(t=>t.who===u);if(tu&&tu.sayT>0&&tu.say)LABELS.push({x:F2.x,y:F2.y-h-10,txt:tu.say,bubble:1});if(k==="hammock")LABELS.push({x:F2.x+F2.w*.3,y:F2.y-h*.9-Math.sin(time*2)*6,txt:"z z",bubble:0,bg:"#E9F2FF"});}}});}
  for(const tu of TURTLES)if(!S.exp[tu.who]&&tu.state!=="use")items.push({y:turtlePos(tu).y,f:()=>drawTurtleW(tu,time)});
  items.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
  drawParts();
  ctx.restore();
  drawLabels(time);drawToolCursor();
  if(Date.now()<S.sprinklerUntil){ctx.font="600 13px Fredoka,sans-serif";ctx.textAlign="center";const t=`Sprinkler on · ${Math.ceil((S.sprinklerUntil-Date.now())/60000)} min`;const w=ctx.measureText(t).width+20;ctx.beginPath();ctx.roundRect(CW/2-w/2,70,w,24,12);P(ctx,"#BFE3EA",2);ctx.fillStyle=OL;ctx.fillText(t,CW/2,87);ctx.textAlign="left";}}

// ================= PLAZA (free-roaming village square) =================
// World space = pixels of the 2304×1296 village art (assets/oa_village.webp).
const PZW=2304,PZH=1296;
let PZ={k:.5,cx:1152,cy:620,ox:0,oy:0,z:null};
const PSHOP=[
  {id:"bakery",  spr:"oa_s_bakery",  x:560, y:382,w:450,flip:true, lot:{cx:560, cy:230,a:300,b:165}},
  {id:"cafe",    spr:"oa_s_cafe",    x:1160,y:332,w:440,flip:false,lot:{cx:1160,cy:190,a:300,b:160}},
  {id:"clothing",spr:"oa_s_clothing",x:1755,y:382,w:450,flip:false,lot:{cx:1750,cy:230,a:300,b:165}},
  {id:"produce", spr:"oa_s_veggie",  x:350, y:662,w:400,flip:true, lot:{cx:350, cy:510,a:260,b:155}},
  {id:"juice",   spr:"oa_s_juice",   x:1945,y:662,w:400,flip:false,lot:{cx:1940,cy:510,a:260,b:155}},
  {id:"eatery",  spr:"oa_s_eatery",  x:515, y:1002,w:470,flip:true,lot:{cx:510, cy:840,a:310,b:175}},
  {id:"popcorn", spr:"oa_s_popcorn", x:1785,y:972,w:470,flip:false,lot:{cx:1790,cy:820,a:310,b:175}},
];
PSHOP.forEach(b=>{b.door={x:b.x+(b.flip?85:-85),y:b.y+18};});
function plazaLayout(){const port=CW/CH<1;if(PZ.z==null)PZ.z=port?1.05:1.1;
  const cover=Math.max(CW/PZW,CH/PZH);PZ.k=cover*PZ.z;const hw=CW/2/PZ.k,hh=CH/2/PZ.k;
  PZ.cx=Math.max(hw,Math.min(PZW-hw,PZ.cx));PZ.cy=Math.max(hh,Math.min(PZH-hh,PZ.cy));PZ.ox=CW/2-PZ.cx*PZ.k;PZ.oy=CH/2-PZ.cy*PZ.k;}
const toWP=(mx,my)=>({x:(mx-PZ.ox)/PZ.k,y:(my-PZ.oy)/PZ.k});
const toSP=(x,y)=>({x:x*PZ.k+PZ.ox,y:y*PZ.k+PZ.oy});
// ---- walk grid: assets/walkmask.png is a 144×81 map of the cobblestone (16px cells); white = walkable ----
const WC=16,WGW=144,WGH=81;let WG=null;
(function(){const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=WGW;c.height=WGH;const g=c.getContext("2d");g.drawImage(im,0,0);
  const d=g.getImageData(0,0,WGW,WGH).data;WG=new Uint8Array(WGW*WGH);for(let i=0;i<WG.length;i++)WG[i]=d[i*4]>127?1:0;};im.src="assets/walkmask.png";})();
const cellOf=(x,y)=>[Math.max(0,Math.min(WGW-1,Math.floor(x/WC))),Math.max(0,Math.min(WGH-1,Math.floor(y/WC)))];
const okCell=(cx,cy)=>WG&&cx>=0&&cy>=0&&cx<WGW&&cy<WGH&&WG[cy*WGW+cx]===1;
function walkable(x,y){const[cx,cy]=cellOf(x,y);return okCell(cx,cy);}
function nearestWalk(x,y){if(!WG)return{x,y};const[c0,r0]=cellOf(x,y);if(okCell(c0,r0))return{x,y};
  for(let rad=1;rad<40;rad++)for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==rad)continue;if(okCell(c0+dx,r0+dy))return{x:(c0+dx+.5)*WC,y:(r0+dy+.5)*WC};}return{x,y};}
function lineClear(ax,ay,bx,by){const n=Math.ceil(Math.hypot(bx-ax,by-ay)/(WC*.5));for(let i=1;i<n;i++){const t=i/n;if(!walkable(ax+(bx-ax)*t,ay+(by-ay)*t))return false;}return true;}
function findPath(x0,y0,x1,y1){if(!WG)return[{x:x1,y:y1}];const s=nearestWalk(x0,y0),e=nearestWalk(x1,y1);const[sc,sr]=cellOf(s.x,s.y),[ec,er]=cellOf(e.x,e.y);
  const N=WGW*WGH,prev=new Int32Array(N).fill(-1),q=new Int32Array(N);let h=0,t=0;const si=sr*WGW+sc,ei=er*WGW+ec;q[t++]=si;prev[si]=si;
  const D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  while(h<t){const i=q[h++];if(i===ei)break;const cx=i%WGW,cy=(i/WGW)|0;for(const[dx,dy]of D){const nx=cx+dx,ny=cy+dy;if(!okCell(nx,ny))continue;if(dx&&dy&&(!okCell(cx+dx,cy)||!okCell(cx,cy+dy)))continue;const ni=ny*WGW+nx;if(prev[ni]!==-1)continue;prev[ni]=i;q[t++]=ni;}}
  if(prev[ei]===-1)return[e];const cells=[];for(let i=ei;i!==si;i=prev[i])cells.push({x:(i%WGW+.5)*WC,y:(((i/WGW)|0)+.5)*WC});cells.reverse();cells.push(e);
  // string-pull: keep only waypoints needed for a clear line
  const out=[];let cur=s,k=0;while(k<cells.length){let j=cells.length-1;while(j>k&&!lineClear(cur.x,cur.y,cells[j].x,cells[j].y))j--;out.push(cells[j]);cur=cells[j];k=j+1;}
  return out;}
function randWalk(){for(let k=0;k<80;k++){const x=rnd(250,2050),y=rnd(150,1150);if(walkable(x,y))return{x,y};}return{x:1150,y:820};}
function appeal(id){const sh=S.shops[id];return 1+sh.decor+(staffed(id)?1:0)+S.prize.flowerbed;}
// ---- villagers: a few at a time arrive up the street, do 2-4 things, then go home ----
const GATE={x:1150,y:1285};
const VILL=[];let arriveT=1.5;
function maxVisitors(){const open=Object.keys(S.shops).filter(k=>S.shops[k].open).length;return Math.min(FRIENDS.length,2+Math.ceil(open*.6)+(S.prize.fountain?1:0));}
function spawnVillager(){const away=FRIENDS.filter(k=>!VILL.some(v=>v.k===k));if(!away.length)return;const story=away.filter(k=>storyReady(k));const k=story.length&&Math.random()<.7?pick(story):pick(away);
  const v={k,x:GATE.x+rnd(-60,60),y:GATE.y,path:[],st:"idle",t:0,face:1,say:null,sayT:0,mood:null,moodT:0,shop:null,want:null,pal:null,tapT:0,todo:2+Math.floor(Math.random()*3),fade:0};VILL.push(v);
  goTo(v,randWalk(),"walk");}
function goTo(v,p,st){v.path=findPath(v.x,v.y,p.x,p.y);v.st=st;}
const CHAT=[["Nice weather!","So sunny~"],["Did you try the bakery?","Yummy bread!"],["Momo waved at me!","Soso too!"],["I want a new scarf…","Ooh, the wool shop!"],["Popcorn later?","Yes please!"],["Look at the fountain!","Sparkly~"],["Busy day?","Shopping day!"],["I'm hungry…","Eatery time!"],["Heading home soon?","After one more shop!"]];
const GREET={bae:["Hi hi! Love your outfit!","Wool is life~"],bun:["Hop hop!","Carrots, anyone?"],gwoof:["Woof! Hello!","Wanna play?"],kew:["…Hm. Hi.","Coffee. Now."],kuma:["Hello, friend!","Honey is the best~"],piyo:["Piyo piyo!","Hehe!"],popo:["Hello dear!","Hungry? I'm hungry."],rang:["Hey hey!","Popcorn party?"],nono:["Pudding time~","Hello hello!"],momo:["Welcome welcome!","Hehe, come in!"],soso:["Welcome… take your time.","Hm, good choice."]};
function updateVillagers(dt){
  const open=Object.keys(S.shops).filter(k=>S.shops[k].open);
  arriveT-=dt;if(arriveT<=0&&WG){arriveT=rnd(5,11);if(VILL.length<maxVisitors())spawnVillager();}
  for(let vi=VILL.length-1;vi>=0;vi--){const v=VILL[vi];v.sayT-=dt;if(v.moodT>0)v.moodT-=dt;if(v.tapT>0)v.tapT-=dt;
    if(v.st==="await"){v.t-=dt;if(!storyReady(v.k)){v.evt=false;v.st="idle";v.t=1;v.todo=Math.min(v.todo,1);}else if(v.t<=0){v.evt=false;v.todo=0;v.st="idle";v.t=0;}continue;}
    if(v.st==="walk"||v.st==="toshop"||v.st==="leave"||v.st==="toevt"){const tg=v.path[0];
      if(!tg){if(v.st==="toevt"){v.st="await";v.t=150;v.face=v.evtFace||1;continue;}if(v.st==="toshop"){v.st="wait";v.t=1.4;}else if(v.st==="leave"){VILL.splice(vi,1);continue;}else{v.st="idle";v.t=rnd(2,6);}continue;}
      const dx=tg.x-v.x,dy=tg.y-v.y,d=Math.hypot(dx,dy),sp=95;if(Math.abs(dx)>2)v.face=dx>0?1:-1;
      if(d<sp*dt){v.x=tg.x;v.y=tg.y;v.path.shift();}else{v.x+=dx/d*sp*dt;v.y+=dy/d*sp*dt;}}
    else if(v.st==="wait"){v.t-=dt;if(v.t<=0){buy(v);v.moodT=2.6;v.st="idle";v.t=.6;v.shop=null;v.todo--;}}
    else if(v.st==="chat"){v.t-=dt;if(v.t<=0){v.st="idle";v.t=rnd(1,3);v.pal=null;v.todo--;}}
    else{v.t-=dt;if(v.t<=0){
        if(!v.evt&&storyReady(v.k)){startStoryWalk(v);continue;}
        if(v.todo<=0){goTo(v,{x:GATE.x+rnd(-50,50),y:GATE.y+40},"leave");v.path.push({x:v.path.length?v.path[v.path.length-1].x:GATE.x,y:PZH+80});continue;}
        const tot=open.reduce((a,k)=>a+appeal(k),0);
        if(open.length&&Math.random()<.45+.03*tot){let w=Math.random()*tot,shop=open[0];for(const k of open){w-=appeal(k);if(w<=0){shop=k;break;}}
          const b=PSHOP.find(x=>x.id===shop);v.shop=shop;goTo(v,nearestWalk(b.door.x+rnd(-20,20),b.door.y+rnd(0,16)),"toshop");}
        else{goTo(v,randWalk(),"walk");v.todo-=.5;}}}}
  for(let i=0;i<VILL.length;i++)for(let j=i+1;j<VILL.length;j++){const a=VILL[i],b=VILL[j];
    if(a.st!=="idle"||b.st!=="idle")continue;if(Math.hypot(a.x-b.x,a.y-b.y)>220||Math.random()>.006)continue;
    const L=pick(CHAT);a.st=b.st="chat";a.t=b.t=5.5;a.pal=b;b.pal=a;a.face=b.x>a.x?1:-1;b.face=-a.face;a.say=L[0];a.sayT=2.6;setTimeout(()=>{if(b.st==="chat"){b.say=L[1];b.sayT=2.6;}},1500);}}
function updatePlaza(dt){
  const now=Date.now();
  for(const id in S.shops){const sh=S.shops[id],D=SHOPS[id];if(!sh.open||!D)continue;
    const momo=onShift("momo",id),own=ownerOf(id),sp=momo?1.5:own?1.3:1;
    for(let i=sh.q.length-1;i>=0;i--){const q=sh.q[i];if(now>=q.end){sh.shelf[q.r]=(sh.shelf[q.r]||0)+1;sh.q.splice(i,1);gainXP(2);dirtyUI=true;}}
    if(D.rec&&staffed(id)&&sh.repeat){const R=D.rec[sh.repeat];if(R&&sh.q.length<sh.kitchenLv&&has(R.need)&&shelfCount(sh)+sh.q.length<shelfCap(sh)){take(R.need);sh.q.push({r:sh.repeat,end:now+R.t*1000/sp});dirtyUI=true;}}
    if(!D.rec&&staffed(id)){sh.auto=(sh.auto||0)-dt;if(sh.auto<=0){sh.auto=momo?3:5;restockOne(sh);}}}
  updateVillagers(dt);}
function restockOne(sh){if(shelfCount(sh)>=shelfCap(sh))return false;
  const opts=sh.sell.filter(k=>(S.inv[k]||0)>0);if(!opts.length)return false;
  opts.sort((a,b)=>(sh.shelf[a]||0)-(sh.shelf[b]||0));const k=opts[0];S.inv[k]--;sh.shelf[k]=(sh.shelf[k]||0)+1;dirtyUI=true;return true;}
function priceMul(id){return onShift("soso",id)?(S.prize.ribbon?1.35:1.2):ownerOf(id)?1.15:1;}
function buy(cu){const sh=S.shops[cu.shop];if(!sh){cu.mood=null;return;}const avail=Object.keys(sh.shelf).filter(k=>sh.shelf[k]>0);
  if(!avail.length){cu.mood="upset";return;}
  const n=Math.random()<.35?2:1;let total=0;const m=priceMul(cu.shop);
  for(let j=0;j<n;j++){const a=Object.keys(sh.shelf).filter(k=>sh.shelf[k]>0);if(!a.length)break;const k=pick(a);sh.shelf[k]--;cu.want=k;
    total+=Math.round(ITEMS[k].v*m);sh.sales++;S.sales++;S.lcProg++;S.sold=S.sold||{};S.sold[k]=(S.sold[k]||0)+1;sh.sold=sh.sold||{};sh.sold[k]=(sh.sold[k]||0)+1;gainXP(1);}
  sh.reg+=total;cu.mood="happy";
  if(S.lcProg>=8){S.lcProg-=8;const b=PSHOP.find(x=>x.id===cu.shop);const p=toSP(b.x,b.y-200);giveLC(1,p.x,p.y);}
  dirtyUI=true;}
const PLABELS=[];
function plabel(x,y,txt,opt){PLABELS.push({x,y,txt,...(opt||{})});}
function drawShop(b,time){const im=spr(b.spr.replace(/^oa_/,""));if(!im||!im.width)return;const h=b.w*im.height/im.width;
  const sh=S.shops[b.id],D=SHOPS[b.id];const locked=!sh.open;
  drawShadow(b.spr.replace(/^oa_/,""),b,h,locked?.12:.24);
  ctx.save();ctx.translate(b.x,b.y);if(b.flip)ctx.scale(-1,1);
  if(locked){const g=ghost(b.spr.replace(/^oa_/,""));if(g){ctx.globalAlpha=.8;ctx.drawImage(g,-b.w/2,-h,b.w,h);}}else ctx.drawImage(im,-b.w/2,-h,b.w,h);
  ctx.restore();
  if(locked){plabel(b.x,b.y-h*.5,S.lvl>=D.lvl?`🔒 ${D.n} · ${D.rent}`:`🔒 ${D.n} · Lv ${D.lvl}`);return;}
  plabel(b.x,b.y+16,D.n);
  const its=Object.keys(sh.shelf).filter(k=>sh.shelf[k]>0);
  if(!its.length)plabel(b.x+(b.flip?60:-60),b.y-h*.38,"Empty shelf!",{col:"#C2553D"});
  else plabel(b.x+(b.flip?60:-60),b.y-h*.38,`${shelfCount(sh)}`,{shelf:its.slice(0,3)});
  if(sh.q.length){for(let k=0;k<3;k++){const d=(time*.6+k/3)%1;ctx.globalAlpha=.7*(1-d);E(ctx,b.x+(b.flip?-1:1)*b.w*.18+d*10,b.y-h*.95-d*50,12+d*10,10+d*8,"#fff",0);}ctx.globalAlpha=1;}
  const keeper=keeperOf(b.id);
  if(keeper==="momo"||keeper==="soso")drawTurtle(ctx,keeper,"front",b.door.x+(b.flip?28:-28),b.door.y+34,108,false,Math.abs(Math.sin(time*3+(keeper==="soso"?1:0)))*3);
  else if(keeper&&IM["cu_"+keeper]){const im2=IM["cu_"+keeper],hh=112,ww=hh*im2.width/im2.height;ctx.drawImage(im2,b.door.x+(b.flip?28:-28)-ww/2,b.door.y+34-hh-Math.abs(Math.sin(time*3))*3,ww,hh);}
  if(sh.reg>0)plabel(b.x+(b.flip?-1:1)*b.w*.25,b.y-h*.92,`${sh.reg}`,{coinb:1});}
function drawPlabels(time){for(const L of PLABELS){const s=toSP(L.x,L.y);ctx.font="700 14px Fredoka,sans-serif";ctx.textAlign="center";
    if(L.coinb){const bb=Math.sin(time*4)*3,w=ctx.measureText(L.txt).width+42;bubble(s.x,s.y+bb,w,32);E(ctx,s.x-w/2+16,s.y+bb-16,9,9,"#F2C14E",2);ctx.fillStyle=OL;ctx.fillText(L.txt,s.x+9,s.y+bb-10);}
    else if(L.shelf){const tw=L.txt?ctx.measureText(L.txt).width+14:0,w=L.shelf.length*28+tw+14;bubble(s.x,s.y,w,34);L.shelf.forEach((k,j)=>drawIcon(ctx,k,s.x-w/2+20+j*28,s.y-17,24));if(L.txt){ctx.fillStyle=OL;ctx.fillText(L.txt,s.x+w/2-14,s.y-11);}}
    else if(L.evt){const bb=Math.abs(Math.sin(time*4))*6,r=22+Math.sin(time*6)*1.5;ctx.save();ctx.shadowColor="#F7B6C4";ctx.shadowBlur=16;bubble(s.x,s.y-bb,52,44);ctx.restore();bubble(s.x,s.y-bb,52,44);
      ctx.fillStyle=L.kind==="report"?"#4E9A3A":"#EE5F82";ctx.font="700 26px Fredoka,sans-serif";ctx.fillText(L.kind==="report"?"✓":"!",s.x,s.y-bb-13);ctx.font="700 14px Fredoka,sans-serif";}
    else if(L.say){ctx.font="600 13px Fredoka,sans-serif";const w=ctx.measureText(L.txt).width+20;bubble(s.x,s.y,w,26);ctx.fillStyle=OL;ctx.fillText(L.txt,s.x,s.y-8);}
    else{const w=ctx.measureText(L.txt).width+20;ctx.beginPath();ctx.roundRect(s.x-w/2,s.y-13,w,26,13);P(ctx,L.bg||"#FFF6E6",2.5);ctx.fillStyle=L.col||OL;ctx.fillText(L.txt,s.x,s.y+5);}}
  ctx.textAlign="left";PLABELS.length=0;}
function drawPlaza(time){plazaLayout();
  ctx.fillStyle="#9DBB5A";ctx.fillRect(0,0,CW,CH);
  ctx.save();ctx.setTransform(DPR*PZ.k,0,0,DPR*PZ.k,DPR*PZ.ox,DPR*PZ.oy);
  const bg=IM.oa_village;if(bg&&bg.complete)ctx.drawImage(bg,0,0,PZW,PZH);
  const fx=1150,fy=470;for(let k=0;k<6;k++){const d=(time*1.1+k/6)%1,a=k/6*Math.PI*2;ctx.globalAlpha=(1-d)*.9;ctx.fillStyle=S.prize.fountain?"#FFE08A":"#fff";ctx.beginPath();ctx.arc(fx+Math.cos(a)*d*60,fy-30-Math.sin(d*Math.PI)*40+d*60,5,0,7);ctx.fill();}ctx.globalAlpha=1;
  const items=[];
  for(const b of PSHOP)items.push({d:b.y,f:()=>drawShop(b,time)});
  for(const v of VILL)items.push({d:v.y,f:()=>{
    const im=IM["cu_"+v.k+(v.mood==="upset"&&v.moodT>0?"_upset":"")];if(!im||!im.complete)return;const h=120,w=h*im.width/im.height;const moving=v.st==="walk"||v.st==="toshop"||v.st==="toevt"||v.st==="leave";const bob=moving?Math.abs(Math.sin(time*9+v.x*.01))*6:v.st==="chat"?Math.abs(Math.sin(time*5+v.x))*3:0;
    ctx.fillStyle="rgba(60,50,30,.2)";ctx.beginPath();ctx.ellipse(v.x,v.y,w*.35,9,0,0,7);ctx.fill();
    ctx.save();ctx.translate(v.x,v.y-bob);if(v.face<0)ctx.scale(-1,1);ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();
    if(v.st==="await"){const c=v.with;if(c&&keeperOf(v.evtShop)!==c)drawTurtle(ctx,c,"three",v.x-v.face*70,v.y+4,104,v.face>0,Math.abs(Math.sin(time*3))*2);
      plabel(v.x,v.y-h-14,"",{evt:1,kind:storyReady(v.k)});}
    else if(v.sayT>0&&v.say)plabel(v.x,v.y-h-8,v.say,{say:1});
    else if(v.moodT>0){if(v.mood==="happy"&&v.want)plabel(v.x,v.y-h-6,"",{shelf:[v.want]});else if(v.mood==="upset")plabel(v.x,v.y-h-6,"…",{col:"#C2553D"});}
    if(v.tapT>0){ctx.globalAlpha=Math.min(1,v.tapT);const im3=IM.heart;if(im3&&im3.complete)ctx.drawImage(im3,v.x-14,v.y-h-60-(1-v.tapT)*30,28,28);ctx.globalAlpha=1;}}});
  items.sort((a,b)=>a.d-b.d).forEach(o=>o.f());
  ctx.restore();drawPlabels(time);}
let pstroke=null;
function plazaDown(mx,my){plazaLayout();pstroke={x0:mx,y0:my,cx0:PZ.cx,cy0:PZ.cy,pan:false};if(shopMenuOpen){shopMenuOpen=false;renderTray();}}
function plazaMove(mx,my){if(!pstroke)return;if(Math.hypot(mx-pstroke.x0,my-pstroke.y0)>10)pstroke.pan=true;if(pstroke.pan){PZ.cx=pstroke.cx0-(mx-pstroke.x0)/PZ.k;PZ.cy=pstroke.cy0-(my-pstroke.y0)/PZ.k;}}
function plazaUp(mx,my){const s=pstroke;pstroke=null;if(!s||s.pan)return;plazaTap(mx,my);}
function plazaTap(mx,my){const w=toWP(mx,my);
  for(const v of [...VILL].sort((a,b)=>b.y-a.y)){if(v.st==="await"&&Math.abs(w.x-v.x)<46&&w.y<v.y+6&&w.y>v.y-200){playStory(v);return;}
    if(Math.abs(w.x-v.x)<42&&w.y<v.y+6&&w.y>v.y-125){v.say=pick(GREET[v.k]||["Hi!"]);v.sayT=2.4;v.tapT=1.2;if(v.st==="idle"||v.st==="walk"){v.st="idle";v.t=2.5;}
      return;}}
  for(const b of [...PSHOP].sort((a,c)=>c.y-a.y)){const im=spr(b.spr.replace(/^oa_/,""));if(!im||!im.width)continue;const h=b.w*im.height/im.width;
    if(w.x>b.x-b.w*.45&&w.x<b.x+b.w*.45&&w.y>b.y-h*.95&&w.y<b.y+30){openStore(b.id);return;}}}
function focusShop(id){const b=PSHOP.find(x=>x.id===id);if(b){PZ.cx=b.x;PZ.cy=b.y-150;}}

// ================= STORY EVENTS (data in js/events.js) =================
function storyStep(k){const p=partnerOf(k),L=(typeof STORY!=="undefined"&&STORY[k])||[];return L[p.step||0]||null;}
function missionText(m){const n=ITEMS[m.item]?ITEMS[m.item].n:"";if(m.type==="sell")return`Sell ${m.count} ${n}${m.shop?` at the ${SHOPS[m.shop].n}`:""}`;if(m.type==="give")return`Bring ${m.count} ${n}`;return`Open the ${SHOPS[m.shop].n}`;}
function soldCount(m){if(m.shop){const sh=S.shops[m.shop];return(sh&&sh.sold&&sh.sold[m.item])||0;}return(S.sold&&S.sold[m.item])||0;}
function missionProg(k){const p=partnerOf(k),st=storyStep(k);if(!p.m||!st||!st.mission)return null;const m=st.mission;
  if(m.type==="sell")return{have:Math.min(m.count,soldCount(m)-p.m.base),need:m.count};
  if(m.type==="give")return{have:Math.min(m.count,S.inv[m.item]||0),need:m.count};
  return{have:S.shops[m.shop]&&S.shops[m.shop].open?1:0,need:1};}
// "talk" = a new event is ready, "report" = mission done and ready to hand in, null = nothing to show
function storyReady(k){const p=partnerOf(k);if(p.won||p.score>=100)return null;const st=storyStep(k);if(!st)return null;
  if(p.m){const pr=missionProg(k);return pr&&pr.have>=pr.need?"report":null;}
  return Date.now()>=(p.next||0)?"talk":null;}
function startStoryWalk(v){const home=SPECIAL_SHOP[v.k];const turtle=w=>!S.exp[w]&&S.staff[w];
  let shop=home&&S.shops[home].open&&(onShift("momo",home)||onShift("soso",home))?home:null;
  if(!shop)shop=["momo","soso"].map(turtle).find(Boolean)||null;
  if(!shop)shop=home&&S.shops[home].open?home:"produce";
  v.evt=true;v.evtShop=shop;v.with=onShift("momo",shop)?"momo":onShift("soso",shop)?"soso":pick(["momo","soso"]);
  const b=PSHOP.find(x=>x.id===shop);v.evtFace=b.flip?-1:1;goTo(v,nearestWalk(b.door.x+(b.flip?60:-60),b.door.y+50),"toevt");}
function storyStatusHTML(k){const p=partnerOf(k),st=storyStep(k);if(!st)return`<p class="mini">No more story yet.</p>`;
  if(p.m){const pr=missionProg(k),m=st.mission;return`<div class="mission"><b>📜 ${missionText(m)}</b><div class="sb"><i style="width:${100*pr.have/pr.need}%"></i></div><small>${m.type==="open"?(pr.have?"Done! ":"")+"":`${pr.have}/${pr.need}`}${pr.have>=pr.need?` · Find ${FNAME[k]} in the plaza to report!`:""}</small></div>`;}
  const wait=Math.max(0,Math.ceil(((p.next||0)-Date.now())/1000));
  return`<p class="mini">${wait?`${FNAME[k]} will visit again in ${wait}s.`:`Look for ${FNAME[k]} in the plaza and tap the <b style="color:#EE5F82">!</b> bubble.`}</p>`;}
let EV=null;
function fillName(t){return t.replace(/\{me\}/g,FNAME[EV.with]);}
function playStory(v){const k=v.k,mode=storyReady(k),st=storyStep(k),p=partnerOf(k);if(!mode||!st)return;
  const q=[];
  if(mode==="talk"){st.talk.forEach(l=>q.push({line:l}));if(st.choices)q.push({choices:st.choices});if(st.mission)q.push({mission:st.mission});else q.push({reward:st.pts});}
  else{const m=st.mission;if(m.type==="give")q.push({give:m});(st.done||[[k,"Thank you!"]]).forEach(l=>q.push({line:l}));q.push({reward:st.pts});}
  EV={k,v,with:v.with||"momo",q,i:0,bonus:0};$("evt").hidden=false;$("evL").innerHTML=portrait(k);$("evR").innerHTML=portrait(EV.with);evStep();}
function evStep(){const it=EV.q[EV.i];if(!it){endStory();return;}const p=partnerOf(EV.k);$("evCh").innerHTML="";$("evNext").hidden=false;
  const say=(who,text)=>{const w=who==="me"?EV.with:who;$("evName").textContent=FNAME[w]||w;$("evText").textContent=fillName(text);
    $("evL").classList.toggle("talking",w===EV.k);$("evR").classList.toggle("talking",w!==EV.k);$("evBox").classList.remove("pop");void $("evBox").offsetWidth;$("evBox").classList.add("pop");};
  if(it.line)say(it.line[0],it.line[1]);
  else if(it.choices){$("evNext").hidden=true;$("evName").textContent=FNAME[EV.with];$("evText").textContent="…";$("evL").classList.remove("talking");$("evR").classList.add("talking");
    $("evCh").innerHTML=it.choices.map((c,i)=>`<button class="choice" data-evc="${i}">${fillName(c.text)}</button>`).join("");}
  else if(it.reply)say(EV.k,it.reply);
  else if(it.give){const m=it.give;take({[m.item]:m.count});say("me",`Here you go! ${m.count} ${ITEMS[m.item].n}.`);}
  else if(it.mission){const m=it.mission;p.m={base:m.type==="sell"?soldCount(m):0,t:Date.now()};
    $("evName").textContent="New mission!";$("evText").innerHTML=`<span class="evm">${ITEMS[m.item]?img(m.item):""}<b>${missionText(m)}</b></span>`;$("evL").classList.remove("talking");$("evR").classList.remove("talking");}
  else if(it.reward!=null){const st=storyStep(EV.k),pts=it.reward+EV.bonus;p.score=Math.min(100,p.score+pts);p.step=(p.step||0)+1;p.m=null;const nx=storyStep(EV.k);p.next=Date.now()+1000*((nx&&nx.wait)||20);
    $("evName").textContent="";$("evText").innerHTML=`<span class="evr">💗 +${pts} partnership with ${FNAME[EV.k]}<i style="--w:${p.score}%"></i>${p.score>=100?`<b>${FNAME[EV.k]} can now run the ${SHOPS[SPECIAL_SHOP[EV.k]].n}! Pick them in its Shop owner tab.</b>`:""}</span>`;
    $("evL").classList.add("talking");$("evR").classList.remove("talking");giveLC(1);}
  save();dirtyUI=true;}
function endStory(){const v=EV.v;$("evt").hidden=true;v.evt=false;v.st="idle";v.t=1.5;v.todo=Math.max(1,v.todo);v.say="💕";v.sayT=2;v.tapT=1.2;EV=null;save();}
document.getElementById("evt").addEventListener("click",e=>{if(!EV)return;const c=e.target.closest("[data-evc]");
  if(c){const ch=EV.q[EV.i].choices[+c.dataset.evc];EV.bonus+=ch.bonus||0;EV.q.splice(EV.i+1,0,{reply:ch.reply});EV.i++;evStep();return;}
  if(EV.q[EV.i]&&EV.q[EV.i].choices)return;EV.i++;evStep();});

if(/[?&]debug/.test(location.search))window.__moso={VILL,toSP,get S(){return S;},storyReady,playStory};
// ================= STORE SCREEN =================
let storeId=null,storeTab="lineup",chatEv=null;
const SPECIAL_SHOP={};for(const id in SHOPS)if(SHOPS[id].special)SPECIAL_SHOP[SHOPS[id].special]=id;
function partnerOf(k){if(!S.partner)S.partner={};return S.partner[k]||(S.partner[k]={score:0,won:false});}
function ownerOf(id){const sh=S.shops[id];return sh&&sh.owner&&partnerOf(sh.owner).won?sh.owner:null;}
function staffed(id){return onShift("momo",id)||onShift("soso",id)||!!ownerOf(id);}
function keeperOf(id){const o=ownerOf(id);if(o)return o;if(onShift("momo",id))return"momo";if(onShift("soso",id))return"soso";return null;}
function portrait(k){if(k==="nono")return`<div class="pt-ph"><span>?</span><b>Nono</b><small>art coming soon</small></div>`;const src=IMG["pt_"+k]||IMG[k+"_front"];return`<img src="${src}" alt="${FNAME[k]||k}">`;}
function openStore(id){storeId=id;storeTab="lineup";chatEv=null;focusShop(id);shopMenuOpen=false;renderTray();
  const sh=S.shops[id];if(sh.open&&sh.reg>0){S.coins+=sh.reg;toast(`Collected ${sh.reg} coins from the register.`);sh.reg=0;dirtyUI=true;save();}
  $("store").hidden=false;$("store").dataset.shop=id;storeSay(null);renderStore();}
function closeStore(){storeId=null;$("store").hidden=true;}
function storeSay(txt){const id=storeId,sh=S.shops[id],D=SHOPS[id],k=keeperOf(id);
  if(!txt){if(!sh.open)txt=`This ${D.n.toLowerCase()} is for rent! Shall we open it?`;
    else if(!k)txt="Nobody's minding the shop… pick a shopkeeper in the Owner tab!";
    else txt=pick(GREET[k]||["Welcome!"])+(shelfCount(sh)?"":" The shelf is empty though…");}
  $("stBubble").textContent=txt;$("stBubble").classList.remove("pop");void $("stBubble").offsetWidth;$("stBubble").classList.add("pop");}
function renderStore(){if(!storeId)return;const id=storeId,D=SHOPS[id],sh=S.shops[id];const k=keeperOf(id)||(sh.open?null:"momo");
  $("stKeeper").innerHTML=k?portrait(k)+`<span class="kname">${FNAME[k]||""}</span>`:`<img class="emptyk" src="${IMG[PSHOP.find(b=>b.id===id).spr]}" alt="">`;
  $("stName").innerHTML=`${img(D.ic)} ${D.n}`;
  $("stTabs").innerHTML=[["lineup","Line-up"],["owner","Shop owner"],["upg","Upgrades"]].map(([t,n])=>`<button data-stab="${t}" aria-pressed="${storeTab===t}">${n}</button>`).join("");
  let h="";
  if(!sh.open){h=`<div class="rent"><img src="${IMG[PSHOP.find(b=>b.id===id).spr]}" alt=""><p>${D.blurb||""}</p>${S.lvl<D.lvl?`<span class="lockt">🔒 Town level ${D.lvl}</span>`:`<button class="cbtn big" data-a="rent" ${S.coins>=D.rent?"":"disabled"}>Open shop · <i class="cn"></i>${D.rent}</button>`}</div>`;}
  else if(storeTab==="lineup"){
    h+=`<div class="shelfbar"><b>Shelf</b><div class="sb"><i style="width:${100*shelfCount(sh)/shelfCap(sh)}%"></i></div><span>${shelfCount(sh)}/${shelfCap(sh)}</span></div>`;
    if(!D.rec){h+=`<div class="grid">${RAW.map(k2=>{const on=sh.sell.includes(k2);return `<button class="cell ${on?"":"off"}" data-toggle="${k2}" title="${ITEMS[k2].n}">${img(k2)}<span>${sh.shelf[k2]||0}</span><small>${on?"selling":"off"}</small></button>`;}).join("")}</div>
      <button class="gobtn" data-a="restock">Restock from barn</button><p class="mini">Tap items to choose what to sell. ${staffed(id)?"The shopkeeper restocks by themselves.":""}</p>`;}
    else{sh.q.forEach(q=>{const R=D.rec[q.r],left=Math.max(0,Math.ceil((q.end-Date.now())/1000));h+=`<div class="qrow">${img(q.r)}<b>${ITEMS[q.r].n}</b><div class="sb"><i style="width:${Math.max(4,Math.min(100,100*(1-left/R.t)))}%"></i></div><span>${left}s</span></div>`;});
      h+=`<div class="recs">`+Object.keys(D.rec).map(r=>{const R=D.rec[r],ok=has(R.need)&&sh.q.length<sh.kitchenLv&&shelfCount(sh)+sh.q.length<shelfCap(sh);
        return `<div class="rec ${sh.repeat===r?"rep":""}">${img(r,"rimg")}<div class="g"><b>${ITEMS[r].n} <span class="shelfn">×${sh.shelf[r]||0}</span></b>${needHTML(R.need)}<small>⏱ ${R.t}s · <i class="cn"></i> ${Math.round(ITEMS[r].v*priceMul(id))}</small></div><div class="rbtn"><button class="cbtn" data-make="${r}" ${ok?"":"disabled"}>Make</button><button class="ktog" data-rep="${r}" aria-pressed="${sh.repeat===r}">${sh.repeat===r?"✓ Keep":"Keep"}</button></div></div>`;}).join("")+`</div>`;}}
  else if(storeTab==="owner"){const sp=D.special;
    h+=`<div class="owners">`;
    for(const w of["momo","soso"]){const on=S.staff[w]===id&&!ownerOf(id);h+=`<button class="ocard ${on?"on":""}" data-staff="${w}">${portrait(w)}<b>${FNAME[w]}</b><small>${w==="momo"?(D.rec?"Cooks 1.5× faster":"Restocks every 3s"):"Charms +20% on prices"}</small>${S.exp[w]?`<em>on a trip</em>`:on?`<em>on shift ✓</em>`:S.staff[w]?`<em>at ${SHOPS[S.staff[w]].n}</em>`:""}</button>`;}
    h+=`</div>`;
    if(sp){const p=partnerOf(sp),hearts=Math.floor(p.score/20);
      h+=`<div class="special ${p.won?"won":""}"><div class="sphead">${portrait(sp)}<div><b>${FNAME[sp]}</b><span class="hearts">${"♥".repeat(hearts)}${"♡".repeat(5-hearts)}</span><div class="sb"><i style="width:${p.score}%"></i></div><small>Partnership ${p.score}/100</small></div></div>`;
      if(p.won){h+=ownerOf(id)?`<p class="mini">${FNAME[sp]} runs the shop ✓ Auto-restock, faster crafting and +15% prices.</p><button class="ktog" data-staff="none">Let Momo or Soso run it</button>`:`<button class="gobtn" data-owner="${sp}">Ask ${FNAME[sp]} to run the shop</button>`;}
      else if(p.score>=100){h+=`<button class="gobtn pink" data-win="${sp}">${FNAME[sp]} wants to join! 💕</button>`;}
      else h+=storyStatusHTML(sp);
      h+=`</div>`;}
    else h+=`<p class="mini">Only Momo or Soso can run the ${D.n}.</p>`;}
  else{const sc=Math.round(90*Math.pow(1.7,sh.shelfLv-1)),kc=250*sh.kitchenLv,dc=150*(sh.decor+1);
    h+=`<div class="upgs">
      <div class="ubtnrow"><span class="uic">🧺</span><div class="g"><b>Bigger shelf</b><small>${shelfCap(sh)} → ${shelfCap(sh)+4}</small></div><button class="cbtn" data-a="shelf" ${S.coins>=sc?"":"disabled"}><i class="cn"></i>${sc}</button></div>
      ${D.rec?(sh.kitchenLv<3?`<div class="ubtnrow"><span class="uic">🍳</span><div class="g"><b>Another station</b><small>Make ${sh.kitchenLv+1} at once</small></div><button class="cbtn" data-a="kitchen" ${S.coins>=kc?"":"disabled"}><i class="cn"></i>${kc}</button></div>`:`<div class="ubtnrow done"><span class="uic">🍳</span><div class="g"><b>Stations maxed</b></div></div>`):""}
      ${sh.decor<3?`<div class="ubtnrow"><span class="uic">🎀</span><div class="g"><b>Shop decorations</b><small>Appeal +1 · more visitors</small></div><button class="cbtn" data-a="decor" ${S.coins>=dc?"":"disabled"}><i class="cn"></i>${dc}</button></div>`:`<div class="ubtnrow done"><span class="uic">🎀</span><div class="g"><b>Fully decorated</b></div></div>`}
      <p class="mini">${sh.sales} sold here · appeal ${appeal(id)}</p></div>`;}
  const sb=$("stBody"),st=sb.scrollTop;sb.innerHTML=h;sb.scrollTop=st;}
const PEV=[
  {q:"Do you think {shop} could use a little more charm?",a:[["Absolutely, with your help!",12],["It's fine as it is.",4]]},
  {q:"I've been dreaming about running a shop someday…",a:[["You'd be amazing at it!",14],["Running a shop is hard work.",5]]},
  {q:"What's your favourite thing in town?",a:[["Spending time with you!",12],["The fountain, I guess.",6]]},
  {q:"Momo said you work super hard on the farm!",a:[["We all help each other~",10],["Haha, someone has to!",7]]},
];
document.getElementById("store").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;const d=b.dataset,id=storeId,sh=S.shops[id],D=SHOPS[id];
  if(b.id==="stClose"||e.target.id==="store"){closeStore();return;}
  if(d.stab){storeTab=d.stab;chatEv=null;}
  if(d.a==="rent"){if(spend(D.rent)){sh.open=true;giveLC(2);toast(`${D.n} is open for business!`);storeTab="owner";setTimeout(()=>storeSay("We're open! Who should mind the shop?"),0);}}
  if(d.toggle){const i=sh.sell.indexOf(d.toggle);if(i>=0)sh.sell.splice(i,1);else sh.sell.push(d.toggle);}
  if(d.a==="restock"){let n=0;while(restockOne(sh))n++;storeSay(n?`Stocked ${n} item${n>1?"s":""}! Thank you~`:shelfCount(sh)>=shelfCap(sh)?"The shelf is full!":"There's nothing in the barn for us…");}
  if(d.make){const R=D.rec[d.make];if(has(R.need)&&sh.q.length<sh.kitchenLv){take(R.need);sh.q.push({r:d.make,end:Date.now()+R.t*1000/(onShift("momo",id)?1.5:ownerOf(id)?1.3:1)});storeSay(`One ${ITEMS[d.make].n}, coming up!`);}}
  if(d.rep){sh.repeat=sh.repeat===d.rep?null:d.rep;if(sh.repeat&&!staffed(id))storeSay("Pick a shopkeeper so they keep making it!");}
  if(d.staff){if(d.staff==="none"){sh.owner=null;}else{if(S.exp[d.staff]){toast(`${FNAME[d.staff]} is away on a trip.`);return;}for(const w of["momo","soso"])if(S.staff[w]===id&&d.staff!==w)S.staff[w]=null;S.staff[d.staff]=id;sh.owner=null;storeSay(null);}}
  if(d.owner){sh.owner=d.owner;for(const w of["momo","soso"])if(S.staff[w]===id)S.staff[w]=null;storeSay(pick(GREET[d.owner]||["Leave it to me!"]));}
  if(d.chat){const p=partnerOf(d.chat);const ev=pick(PEV);chatEv={k:d.chat,q:ev.q.replace("{shop}",D.n),a:ev.a};}
  if(d.choice!=null&&chatEv){const a=chatEv.a[+d.choice],p=partnerOf(chatEv.k);p.score=Math.min(100,p.score+a[1]);p.next=Date.now()+30000;toast(`+${a[1]} partnership with ${FNAME[chatEv.k]}`);chatEv=null;}
  if(d.win){const p=partnerOf(d.win);p.won=true;sh.owner=d.win;for(const w of["momo","soso"])if(S.staff[w]===id)S.staff[w]=null;giveLC(3);toast(`${FNAME[d.win]} is now the owner of the ${D.n}! 🎉`);}
  if(d.a==="shelf"){const c=Math.round(90*Math.pow(1.7,sh.shelfLv-1));if(spend(c)){sh.shelfLv++;giveLC(2);}}
  if(d.a==="kitchen"){if(spend(250*sh.kitchenLv)){sh.kitchenLv++;giveLC(2);}}
  if(d.a==="decor"){if(spend(150*(sh.decor+1))){sh.decor++;giveLC(2);}}
  dirtyUI=true;save();renderStore();});
document.getElementById("store").addEventListener("pointerdown",e=>{if(e.target.id==="store")closeStore();});

// ================= PACHINKO =================
// Board space = pixels of assets/pk2_frame.webp (720×1280). The mint glass window is x 68–649, y 242–1042,
// the little reel screen is x 240–479, y 132–193. The frame is drawn from the top down to y FRAME_CUT.
const FR={w:720,h:1280,cut:1068,scr:{x1:244,y1:135,x2:475,y2:190}};
const PK={L:78,R:606,T:250,B:1036,lx:626,lane:[610,642],cr:38,br:8,s:1,ox:0,oy:0,slotTop:946};
const SLOTV=[1,3,"?",3,1];
const pegs=[],bumpers=[{x:212,y:520,r:34,k:"pk2_bumper_star"},{x:472,y:520,r:34,k:"pk2_bumper_heart"}],posts=[];
const catcher={x:342,y:720,w:70};
(function buildBoard(){const sw=(PK.R-PK.L)/5;for(let i=1;i<5;i++)posts.push(PK.L+sw*i);
  for(let r=0;;r++){const y=300+r*34;if(y>PK.slotTop-22)break;for(let c=0;;c++){const x=PK.L+18+c*34+(r%2?17:0);if(x>PK.R-12)break;
    if(bumpers.some(b=>Math.hypot(x-b.x,y-b.y)<b.r+22))continue;if(Math.abs(x-catcher.x)<64&&y>catcher.y-44&&y<catcher.y+40)continue;pegs.push({x,y});}}
  pegs.push({x:catcher.x-46,y:catcher.y-22},{x:catcher.x+46,y:catcher.y-22});})();
const balls=[];let fireT=0,firing=false;
const reel={spin:false,t:0,dur:0,res:["momo","carrot","soso"],pend:0,reach:false,win:null};
let fever=0,feverSuper=false,feverMsg=0;const slotFlash=[0,0,0,0,0];let catchFlash=0;
const SYM=["momo","soso","carrot","strawberry","wheat","egg","melon"];
function startReel(){reel.pend--;reel.spin=true;reel.t=0;const r=Math.random();
  if(r<1/9){const s=pick(SYM);reel.res=[s,s,s];reel.win=s;reel.reach=true;}
  else if(r<.32){const s=pick(SYM);let o;do{o=pick(SYM);}while(o===s);reel.res=[s,s,o];reel.win=null;reel.reach=true;}
  else{const a=pick(SYM);let b;do{b=pick(SYM);}while(b===a);reel.res=[a,b,pick(SYM)];reel.win=null;reel.reach=false;}
  reel.dur=reel.reach?3:1.6;}
function award(n,x,y,col){S.balls+=n;dirtyUI=true;float(PK.ox+x*PK.s,PK.oy+y*PK.s,`+${n}`,col||"#FFE08A");}
function updatePachi(dt){
  if(firing&&S.balls>0&&balls.length<40){fireT-=dt;if(fireT<=0){fireT=.3;S.balls--;dirtyUI=true;const pw=+$("power").value/100;balls.push({x:PK.lx,y:PK.B-14,vx:0,vy:0,rail:0,pw:pw*(0.93+Math.random()*.14),hit:0});}}
  if(!reel.spin&&reel.pend>0)startReel();
  if(reel.spin){reel.t+=dt;if(reel.t>=reel.dur){reel.spin=false;if(reel.win){feverSuper=reel.win==="momo"||reel.win==="soso";fever=feverSuper?25:15;feverMsg=2.5;if(feverSuper)giveLC(2);toast(feverSuper?"SUPER FEVER! Every prize ×3 · +2 loyalty coins":"FEVER! Every prize ×2");}}}
  if(fever>0)fever=Math.max(0,fever-dt);if(feverMsg>0)feverMsg-=dt;if(catchFlash>0)catchFlash-=dt;for(let i=0;i<5;i++)if(slotFlash[i]>0)slotFlash[i]-=dt;
  const mul=fever>0?(feverSuper?3:2):1,sub=5,h=dt/sub,g=1300,br=PK.br;
  for(let s=0;s<sub;s++)for(let i=balls.length-1;i>=0;i--){const b=balls[i];
    if(b.rail>=0){b.rail+=h/0.45;const u=b.rail,r=PK.cr,top=PK.T+6;
      if(u<.75){b.x=PK.lx;b.y=(PK.B-14)-((PK.B-14)-(top+r))*(u/.75);}
      else{const a=(u-.75)/.25*Math.PI/2;b.x=PK.lx-r+Math.cos(a)*r;b.y=top+r-Math.sin(a)*r;
        if(u>=1){b.rail=-1;b.x=PK.lx-r-2;b.y=top+br;b.vx=-(170+b.pw*900);b.vy=20;}}continue;}
    b.vy+=g*h;b.x+=b.vx*h;b.y+=b.vy*h;if(b.hit>0)b.hit-=h;
    if(b.y<PK.T+br){b.y=PK.T+br;b.vy=Math.abs(b.vy)*.4;}
    if(b.x<PK.L+br){b.x=PK.L+br;b.vx=Math.abs(b.vx)*.5;}if(b.x>PK.R-br){b.x=PK.R-br;b.vx=-Math.abs(b.vx)*.5;}
    for(const p of pegs){const dx=b.x-p.x,dy=b.y-p.y;if(Math.abs(dx)>14||Math.abs(dy)>14)continue;const d=Math.hypot(dx,dy),m=br+5;if(d<m&&d>0){const nx=dx/d,ny=dy/d;b.x=p.x+nx*m;b.y=p.y+ny*m;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.45*vn*nx;b.vy-=1.45*vn*ny;b.vx+=rnd(-18,18);}}}
    for(const bp of bumpers){const dx=b.x-bp.x,dy=b.y-bp.y,d=Math.hypot(dx,dy),m=bp.r+br;if(d<m&&d>0){const nx=dx/d,ny=dy/d;b.x=bp.x+nx*m;b.y=bp.y+ny*m;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=2.1*vn*nx;b.vy-=2.1*vn*ny;}
      if(b.hit<=0){b.hit=.4;bp.flash=.3;award(1,bp.x,bp.y-bp.r);}}}
    // catcher cup: open at the top, solid rim on the sides
    const c=catcher,cw=fever>0?c.w*1.5:c.w;
    if(b.vy>0&&Math.abs(b.x-c.x)<cw/2-br*.4&&b.y>c.y-12&&b.y<c.y+6){balls.splice(i,1);catchFlash=.4;award(6*mul,c.x,c.y-30,"#FFF3B0");continue;}
    // slot posts
    if(b.y>PK.slotTop-6)for(const px of posts){const dx=b.x-px;if(Math.abs(dx)<br+4){b.x=px+(dx<0?-1:1)*(br+4);b.vx=-b.vx*.4;}}
    if(b.y>PK.B-br){const k=Math.max(0,Math.min(4,Math.floor((b.x-PK.L)/((PK.R-PK.L)/5))));balls.splice(i,1);slotFlash[k]=.5;
      const sx=PK.L+(k+.5)*(PK.R-PK.L)/5;if(SLOTV[k]==="?"){if(reel.pend<4)reel.pend++;award(1,sx,PK.slotTop);}else award(SLOTV[k]*mul,sx,PK.slotTop);}}
  for(const bp of bumpers)if(bp.flash>0)bp.flash-=dt;}
function pkImg(k,x,y,w,ax,ay){const im=IM[k];if(!im||!im.complete||!im.width)return false;const h=w*im.height/im.width;ctx.drawImage(im,x-w*(ax??.5),y-h*(ay??.5),w,h);return true;}
function drawPachi(time){
  ctx.fillStyle="#F2A9B6";ctx.fillRect(0,0,CW,CH);
  const trayH=($("tray").offsetHeight||90),top=46,avH=CH-top-trayH-2;
  const s=Math.min(CW/FR.w,avH/FR.cut);PK.s=s;PK.ox=(CW-FR.w*s)/2;PK.oy=top+(avH-FR.cut*s)/2;
  const fr=IM.pk2_frame;
  ctx.save();ctx.translate(PK.ox,PK.oy);ctx.scale(s,s);
  if(fr&&fr.complete&&fr.width)ctx.drawImage(fr,0,0,fr.width,fr.height*FR.cut/FR.h,0,0,FR.w,FR.cut);
  // marquee bulbs twinkle along the window sides
  for(let k=0;k<14;k++){if(Math.floor(time*5+k)%4)continue;const y=262+k*56;for(const x of[34,686]){ctx.globalAlpha=.55;ctx.fillStyle="#FFFBD0";ctx.beginPath();ctx.arc(x,y,12,0,7);ctx.fill();}}ctx.globalAlpha=1;
  // reels in the small top screen
  const sc=FR.scr,rw=(sc.x2-sc.x1-16)/3,rh=sc.y2-sc.y1-8;
  ctx.fillStyle=fever?"#4A2E44":"#26324A";ctx.beginPath();ctx.roundRect(sc.x1,sc.y1,sc.x2-sc.x1,sc.y2-sc.y1,6);ctx.fill();
  for(let k=0;k<3;k++){const rx=sc.x1+4+k*(rw+4),ry=sc.y1+4;ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,5);ctx.fillStyle="#FFF6E6";ctx.fill();
    const stopAt=reel.dur*(k===2?1:k===1?.55:.35);const spin=reel.spin&&reel.t<stopAt;const sym=spin?SYM[Math.floor(reel.t*14+k*3)%SYM.length]:reel.res[k];
    ctx.save();ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,5);ctx.clip();const cy=ry+rh/2+(spin?((reel.t*14)%1-.5)*rh*.6:0);
    if(sym==="momo"||sym==="soso")drawTurtle(ctx,sym,"front",rx+rw/2,cy+rh*.42,rh*.95,false,0);else drawIcon(ctx,sym,rx+rw/2,cy,rh*.8);ctx.restore();}
  // launch lane + corner guide
  ctx.fillStyle="rgba(94,59,34,.08)";ctx.fillRect(PK.lane[0],PK.T+PK.cr+20,PK.lane[1]-PK.lane[0],PK.B-PK.T-PK.cr-20);
  ctx.strokeStyle="#E7B23C";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(PK.lane[0],PK.B);ctx.lineTo(PK.lane[0],PK.T+PK.cr+60);ctx.stroke();
  ctx.beginPath();ctx.arc(PK.lx-PK.cr,PK.T+6+PK.cr,PK.cr+14,-Math.PI/2,0);ctx.stroke();
  for(const p of pegs)pkImg("pk2_pin",p.x,p.y,11);
  for(const bp of bumpers){ctx.save();if(bp.flash>0){ctx.shadowColor="#FFF3B0";ctx.shadowBlur=24;}const sc2=1+(bp.flash>0?.12:0);pkImg(bp.k,bp.x,bp.y,bp.r*2.1*sc2);ctx.restore();}
  ctx.save();if(catchFlash>0||fever){ctx.shadowColor="#FFF3B0";ctx.shadowBlur=20;}pkImg("pk2_catcher",catcher.x,catcher.y,(fever?catcher.w*1.5:catcher.w)*1.25,.5,.45);ctx.restore();
  ctx.font="700 22px Fredoka,sans-serif";ctx.textAlign="center";ctx.lineWidth=5;ctx.strokeStyle=OL;ctx.fillStyle="#FFF3B0";ctx.strokeText(`+${6*(fever?(feverSuper?3:2):1)}`,catcher.x,catcher.y+40);ctx.fillText(`+${6*(fever?(feverSuper?3:2):1)}`,catcher.x,catcher.y+40);
  // prize slots along the bottom
  const sw=(PK.R-PK.L)/5,mul=fever?(feverSuper?3:2):1;
  for(let k=0;k<5;k++){const x0=PK.L+k*sw,q=SLOTV[k]==="?";ctx.beginPath();ctx.roundRect(x0+5,PK.slotTop,sw-10,PK.B-PK.slotTop,[10,10,4,4]);
    ctx.fillStyle=slotFlash[k]>0?"#FFF3B0":q?"#F7B6C4":"#BFE5B8";ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OL;ctx.stroke();
    if(q){pkImg("pk2_slotq",x0+sw/2,PK.slotTop+44,30);}
    else{pkImg("pk2_coin",x0+sw/2,PK.slotTop+28,30);ctx.font="700 26px Fredoka,sans-serif";ctx.lineWidth=5;ctx.strokeText(SLOTV[k]*mul,x0+sw/2,PK.slotTop+74);ctx.fillStyle="#fff";ctx.fillText(SLOTV[k]*mul,x0+sw/2,PK.slotTop+74);}}
  for(const px of posts)pkImg("pk2_post",px,PK.slotTop+44,20);
  if(fever){ctx.font="700 30px Fredoka,sans-serif";const t=`${feverSuper?"SUPER ":""}FEVER ×${mul} · ${Math.ceil(fever)}s`;ctx.lineWidth=6;ctx.strokeText(t,FR.w/2,226);ctx.fillStyle="#FFE08A";ctx.fillText(t,FR.w/2,226);}
  else if(reel.spin&&reel.reach&&reel.t>reel.dur*.55){ctx.font="700 30px Fredoka,sans-serif";ctx.lineWidth=6;ctx.strokeText("REACH!",FR.w/2,226);ctx.fillStyle="#FF8FB1";ctx.fillText("REACH!",FR.w/2,226);}
  else if(reel.pend){ctx.font="700 22px Fredoka,sans-serif";ctx.lineWidth=5;const t=`Spins ×${reel.pend}`;ctx.strokeText(t,FR.w/2,224);ctx.fillStyle="#fff";ctx.fillText(t,FR.w/2,224);}
  for(const b of balls)pkImg("pk2_ball",b.x,b.y,PK.br*2.2);
  // Momo & Soso cheering from the frame corners
  const ch=fever>0;const bob=Math.abs(Math.sin(time*(ch?9:2.5)))*(ch?14:4);
  pkImg(ch?"ps_momo_cheer":"ps_momo_wave",40,FR.cut-62-bob,84,.5,.5);pkImg(ch?"ps_soso_cheer":"ps_soso_thumbsup",680,FR.cut-62-bob,84,.5,.5);
  ctx.restore();
  if(feverMsg>0){ctx.save();ctx.globalAlpha=Math.min(1,feverMsg);ctx.font=`700 ${Math.round(Math.min(56,CW/8))}px Fredoka,sans-serif`;ctx.textAlign="center";ctx.lineWidth=8;ctx.strokeStyle=OL;const t=feverSuper?"SUPER FEVER!":"FEVER!";const y=PK.oy+600*s;ctx.strokeText(t,CW/2,y);ctx.fillStyle="#FFE08A";ctx.fillText(t,CW/2,y);ctx.restore();}}

// ================= SHEETS =================
let sheetKind=null,sheetArg=null;
function openSheet(kind,arg){sheetKind=kind;sheetArg=arg;$("sheet").dataset.kind=kind;$("veil").hidden=false;$("sbody").scrollTop=0;renderSheet();}
function closeSheet(){$("veil").hidden=true;sheetKind=null;}
$("sclose").onclick=closeSheet;$("veil").addEventListener("pointerdown",e=>{if(e.target.id==="veil")closeSheet();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeSheet();closeStore();}});
let barnTab="upg";
const openBarn=t=>{if(typeof t==="string")barnTab=t;openSheet("barn");},openShop=id=>openStore(id),openSeeds=()=>{barnTab="seeds";openSheet("barn");},openPrizes=()=>openSheet("prizes");
function renderSheet(){if(!sheetKind)return;let t="",h="";
  if(sheetKind==="barn"){t=`<img src="${IMG.oa_barn}" alt="" class="tic" style="transform:scaleX(-1)">Main Barn`;
    const tabs=[["upg","Upgrades",IMG.ui_coin||IMG.oa_chicken],["furn","Furniture",IMG.oa_f_bench||IMG.oa_barn],["store","Storage",IMG.oa_barn],["seeds","Seeds",IMG.ui_seed||SEEDBAG]];
    h+=`<div class="tabs2">${tabs.map(([k,n,src])=>`<button data-btab="${k}" aria-pressed="${barnTab===k}"><img src="${src}" alt="">${n}</button>`).join("")}</div>`;
    if(barnTab==="upg"){const pens=["chicken","cow","sheep","pig"].filter(id=>S.bld[id].own);
      h+=`<div class="upgs">`+pens.map(id=>{const b=BLD[id],u=S.upg[id]||{};
        return `<div class="ucard"><div class="uhead"><img src="${IMG["oa_"+id]}" alt=""><div><b>${b.n}</b><span class="ptag">${img(b.prod)} ${Math.round(penEvery(id))}s · max ${penCap(id)}</span></div></div><div class="ubtns">${Object.keys(UPG).map(k=>{const L=u[k]||0,M=UPG[k].max,done=L>=M,c=done?0:upgCost(id,k);
          return `<button class="ubtn ${done?"max":""}" data-upg="${id}:${k}" ${done||S.coins<c?"disabled":""}><span class="uic">${UPG[k].ic}</span><b>${UPG[k].n}</b><span class="pips">${"●".repeat(L)}${"○".repeat(M-L)}</span>${done?`<em>MAX</em>`:`<em><i class="cn"></i>${c}</em>`}</button>`;}).join("")}</div></div>`;}).join("");
      const sl=S.upg.soil||0;h+=`<div class="ucard"><div class="uhead"><img src="${IMG.oa_soilwet}" alt=""><div><b>Rich Soil</b><span class="ptag">🌱 crops grow +${sl*15}%</span></div></div><div class="ubtns"><button class="ubtn ${sl>=3?"max":""}" data-upg="soil" ${sl>=3||S.coins<SOIL_COST[sl]?"disabled":""}><span class="uic">🌱</span><b>Faster crops</b><span class="pips">${"●".repeat(sl)}${"○".repeat(3-sl)}</span>${sl>=3?"<em>MAX</em>":`<em><i class="cn"></i>${SOIL_COST[sl]}</em>`}</button></div></div></div>`;
      if(pens.length<4)h+=`<p class="mini">🔒 Tap a grey pen on the farm to build it</p>`;}
    if(barnTab==="furn"){h+=`<div class="cards">`+Object.keys(FURN).map(k=>{const F2=FURN[k],own=S.furn[k];
        return `<div class="bcard ${own?"own":""}"><img src="${IMG["oa_f_"+k]||""}" alt=""><b>${F2.n}</b><span class="ptag">${{sit:"🪑 sit",swing:"🎐 swing",nap:"💤 nap",eat:"🥪 snack"}[F2.act]}</span>${own?`<span class="done">✓ Placed</span>`:`<button class="cbtn" data-furn="${k}" ${S.coins>=F2.cost?"":"disabled"}><i class="cn"></i>${F2.cost}</button>`}</div>`;}).join("")+`</div><p class="mini">Momo & Soso will use them when they take a break 💕</p>`;}
    if(barnTab==="store"){const bc=Math.round(120*Math.pow(1.5,(S.barnCap-40)/20)),f=invTotal()/S.barnCap;
      h+=`<div class="storebar"><div class="sb"><i style="width:${Math.min(100,f*100)}%"></i></div><b>${invTotal()}/${S.barnCap}</b><button class="cbtn" data-a="barn" ${S.coins>=bc?"":"disabled"}>+20 · <i class="cn"></i>${bc}</button></div>
      <div class="grid">${RAW.filter(k=>S.inv[k]).map(k=>`<div class="cell" title="${ITEMS[k].n}">${img(k)}${S.inv[k]}</div>`).join("")||'<p class="mini">Empty! Go harvest something.</p>'}</div>`;}
    if(barnTab==="seeds"){h+=`<div class="cards seeds">`+Object.keys(CROPS).map(k=>{const C=CROPS[k];if(C.prize)return S.seeds[k]?`<div class="bcard sd"><img src="${icon(k)}" alt=""><b>${ITEMS[k].n}</b><span class="ptag">×${S.seeds[k]} · prize</span></div>`:"";
        if(C.lvl>S.lvl)return `<div class="bcard sd lock"><img src="${icon(k)}" alt=""><b>${ITEMS[k].n}</b><span class="lockt">🔒 Lv ${C.lvl}</span></div>`;
        return `<div class="bcard sd"><img src="${icon(k)}" alt=""><b>${ITEMS[k].n}</b><span class="ptag">×${S.seeds[k]||0} · ${C.time}s</span><div class="sbtns"><button class="cbtn" data-buy="${k}" data-n="1" ${S.coins>=C.seed?"":"disabled"}>+1 · <i class="cn"></i>${C.seed}</button><button class="cbtn" data-buy="${k}" data-n="5" ${S.coins>=C.seed*5?"":"disabled"}>+5</button></div></div>`;}).join("")+`</div>`;}}
  if(sheetKind==="shop"){const id=sheetArg,D=SHOPS[id],sh=S.shops[id];t=D.n;
    if(!sh.open){h+=`<p class="note">${D.blurb}</p>`;h+=S.lvl<D.lvl?`<p class="note">Opens at town level ${D.lvl}.</p>`:`<button class="btn w" data-a="rent" ${S.coins>=D.rent?"":"disabled"}>Rent the shop · ${D.rent} ¢</button>`;}
    else{
      h+=`<div class="row"><div class="g"><b>Register</b><small>${sh.sales} sold here · appeal ${appeal(id)}</small></div><button class="btn w" data-a="collect" ${sh.reg?"":"disabled"}>Collect ${sh.reg} ¢</button></div>`;
      h+=`<div class="sec">Who's minding the shop</div><div class="staff">
        <button data-staff="none" aria-pressed="${S.staff.momo!==id&&S.staff.soso!==id}"><span style="height:48px;display:grid;place-items:center;font-size:22px">·</span>Nobody<small>You restock by hand</small></button>
        <button data-staff="momo" aria-pressed="${S.staff.momo===id}"><img src="${IMG.momo_front}" alt="">Momo<small>${D.rec?"Cooks 1.5× faster":"Restocks every 3s"}</small></button>
        <button data-staff="soso" aria-pressed="${S.staff.soso===id}"><img src="${IMG.soso_front}" alt="">Soso<small>Charms +${S.prize.ribbon?35:20}% on prices</small></button></div>
        <p class="note">A turtle on shift ${D.rec?"keeps cooking the recipe you mark as Keep making":"restocks the shelf from the barn"} and adds 1 appeal. Each turtle can mind one shop.</p>`;
      h+=`<div class="sec">Shelf · ${shelfCount(sh)}/${shelfCap(sh)}</div><div class="grid">`;
      const shown=D.rec?Object.keys(D.rec):RAW;
      for(const k of shown){const on=D.rec?true:sh.sell.includes(k);h+=`<div class="cell ${on?"":"off"}">${D.rec?"":`<button data-toggle="${k}" title="${on?"Stop selling":"Sell"} ${ITEMS[k].n}" style="display:flex;flex-direction:column;align-items:center;cursor:pointer">`}${img(k)}${sh.shelf[k]||0}${D.rec?"":`<small style="font-size:10px">${on?"selling":"off"}</small></button>`}</div>`;}
      h+=`</div>`;
      if(!D.rec)h+=`<div class="btns"><button class="btn" data-a="restock">Restock from barn</button></div><p class="note">Tap an item to choose what the stand sells. Prices: ${RAW.filter(k=>sh.sell.includes(k)).map(k=>`${ITEMS[k].n} ${ITEMS[k].v}`).join(", ")}.</p>`;
      if(D.rec){h+=`<div class="sec">Kitchen · ${sh.q.length}/${sh.kitchenLv} ovens busy</div>`;
        sh.q.forEach(q=>{const R=D.rec[q.r];const left=Math.max(0,Math.ceil((q.end-Date.now())/1000));h+=`<div class="row">${img(q.r,"ico")}<div class="g"><b>${ITEMS[q.r].n}</b><div class="bar"><i style="width:${100*(1-left/(R.t/(onShift("momo",id)?1.5:1)))}%"></i></div><small>${left}s left</small></div></div>`;});
        for(const k in D.rec){const R=D.rec[k];const ok=has(R.need)&&sh.q.length<sh.kitchenLv&&shelfCount(sh)+sh.q.length<shelfCap(sh);
          h+=`<div class="row">${img(k,"ico")}<div class="g"><b>${ITEMS[k].n}</b>${needHTML(R.need)}<small>${R.t}s · sells for ${ITEMS[k].v}</small></div><div class="btns" style="flex-direction:column"><button class="btn" data-make="${k}" ${ok?"":"disabled"}>Make</button><button class="btn ${sh.repeat===k?"p":"o"}" data-rep="${k}" aria-pressed="${sh.repeat===k}">${sh.repeat===k?"Keep making ✓":"Keep making"}</button></div></div>`;}}
      h+=`<div class="sec">Upgrades · each gives +2 loyalty coins</div>`;
      const sc=Math.round(90*Math.pow(1.7,sh.shelfLv-1));h+=`<div class="row"><div class="g"><b>Bigger shelf</b><small>Holds ${shelfCap(sh)} → ${shelfCap(sh)+4}</small></div><button class="btn w" data-a="shelf" ${S.coins>=sc?"":"disabled"}>${sc} ¢</button></div>`;
      if(D.rec&&sh.kitchenLv<3){const kc=250*sh.kitchenLv;h+=`<div class="row"><div class="g"><b>Another oven</b><small>Cook ${sh.kitchenLv+1} things at once</small></div><button class="btn w" data-a="kitchen" ${S.coins>=kc?"":"disabled"}>${kc} ¢</button></div>`;}
      if(sh.decor<3){const dc=150*(sh.decor+1);h+=`<div class="row"><div class="g"><b>Window decorations</b><small>Appeal +1 · more customers pick this shop</small></div><button class="btn w" data-a="decor" ${S.coins>=dc?"":"disabled"}>${dc} ¢</button></div>`;}}}
  if(sheetKind==="build"){const id=sheetArg,b=BLD[id],lock=S.lvl<b.lvl;t=`<img src="${IMG["oa_"+id]}" alt="" class="tic">${b.n}`;
    h+=`<div class="landbuy"><img src="${IMG["oa_"+id]}" alt=""><span class="ptag">${img(b.prod)} every ${b.every}s · +2 ♥</span>${lock?`<span class="lockt">🔒 Town level ${b.lvl}</span>`:`<button class="cbtn big" data-build="${id}" ${S.coins>=b.cost?"":"disabled"}><i class="cn"></i>${b.cost}</button>`}</div>`;}
  if(sheetKind==="land"){const c=landCost(),b=sheetArg;t=`<img src="${IMG.oa_locked}" alt="" class="tic">New field`;
    h+=`<div class="landbuy"><img src="${IMG.oa_soil}" alt=""><b>9 new plots</b><span class="ptag">+2 ♥</span><button class="cbtn big" data-block="${b}" ${S.coins>=c?"":"disabled"}><i class="cn"></i>${c}</button></div>`;}
  if(sheetKind==="exp"){t=`<img src="${IMG.oa_truck}" alt="" class="tic">${postcard?"Back home!":"Expedition"}`;
    if(postcard){const pc=postcard,nm=pc.who==="momo"?"Momo":"Soso";
      h+=`<div class="postcard" style="--pc:${DEST[pc.dest].col}"><div class="stamp">${DEST[pc.dest].n}</div><img src="${IMG[pc.who+"_explore"]}" alt=""><p>${pc.who==="momo"?"Look what I found!!":"Worth the drive."} <span>— ${nm}</span></p></div>
      <div class="loot">${Object.entries(pc.got).map(([k,n])=>{const kk=k.startsWith("seed:")?k.slice(5):k;return `<div class="lt">${img(kk)}<b>×${n}</b><small>${k.startsWith("seed:")?"seeds":""}</small></div>`;}).join("")||'<p class="mini">Just happy memories this time.</p>'}</div>
      <button class="gobtn" data-a="pc">Yay! Into the barn</button>`;}
    else{const away=["momo","soso"].find(w=>S.exp[w]);
      if(away){const e=S.exp[away],left=e.end-Date.now(),nm=away==="momo"?"Momo":"Soso";
        h+=`<div class="trip" style="--pc:${DEST[e.dest].col}"><img src="${IMG[away+"_explore"]}" alt=""><div class="g"><b>${nm} → ${DEST[e.dest].n}</b>${left>0?`<div class="road"><i style="left:${Math.min(96,100*(1-left/(e.end-e.start)))}%"><img src="${IMG.oa_truck}" alt=""></i></div><span class="timer">⏱ ${fmtT(left)}</span>`:`<span class="timer">Home! 🎒</span>`}</div></div>`;
        if(left<=0)h+=`<button class="gobtn pink" data-a="claim" data-claim="${away}">Open backpack</button>`;
        else h+=`<p class="mini">One truck, one trip at a time.</p>`;}
      else{
        h+=`<div class="who">${["momo","soso"].map(w=>`<button class="av" data-who="${w}" aria-pressed="${expSel.who===w}"><img src="${IMG[w+"_explore"]}" alt=""><b>${w==="momo"?"Momo":"Soso"}</b><span class="ptag">${w==="momo"?"⚡ faster":"✨ lucky"}</span></button>`).join("")}</div>
        <div class="dests">${Object.keys(DEST).map(k=>{const D=DEST[k],lock=S.lvl<D.lvl;return `<button class="dest" data-dest="${k}" aria-pressed="${expSel.dest===k}" ${lock?"disabled":""} style="--pc:${D.col}"><b>${D.n}</b><span class="lootrow">${D.loot.map(([it])=>img(it.startsWith("seed:")?it.slice(5):it)).join("")}</span><span class="timer">${lock?`🔒 Lv ${D.lvl}`:`⏱ ${fmtT(expDur(expSel.who,k))}`}</span></button>`;}).join("")}</div>
        <button class="snack" data-a="snack" aria-pressed="${expSel.snack}"><span class="tick">${expSel.snack?"✓":""}</span>🥪 Snack <span class="ptag">${img("egg")}1 ${img("wheat")}2</span><span class="ptag hot">+50% loot</span></button>
        <button class="gobtn" data-a="send">Let's go, ${expSel.who==="momo"?"Momo":"Soso"}!</button>`;}}}
  if(sheetKind==="prizes"){t=`<img src="${IMG.pk_bell}" alt="" class="tic">Prize Counter`;
    h+=`<div class="pzhead"><img src="${IMG.pk_tray}" alt=""><b>${S.balls}</b><span>balls to spend</span></div><div class="cards">`;
    for(const p of PRIZES){const owned=p.once&&S.prize[p.id],maxed=p.max&&S.prize[p.id]>=p.max;
      h+=`<div class="bcard ${owned||maxed?"own":""}"><img src="${IMG["pz_"+p.id]}" alt=""><b>${p.n}</b><small class="pzd">${p.d}</small>${owned?`<span class="done">✓ Owned</span>`:maxed?`<span class="done">Max</span>`:`<button class="cbtn pk" data-prize="${p.id}" ${S.balls<p.cost?"disabled":""}><img src="${IMG.pk2_ball}" alt="">${p.cost}</button>`}</div>`;}
    h+=`</div>`;}
  $("stitle").innerHTML=t;const sb=$("sbody"),st=sb.scrollTop;sb.innerHTML=h;sb.scrollTop=st;}
$("sbody").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;const d=b.dataset;const id=sheetArg,sh=typeof id==="string"&&S.shops[id];
  if(d.a==="seeds"){barnTab="seeds";}
  if(d.block!=null&&d.block!==""){const bi=+d.block,c=landCost();if(!S.blocks[bi]&&spend(c)){S.blocks[bi]=true;giveLC(2);for(let i=bi*9;i<bi*9+9;i++)pops[i]=1;pops["L"+bi]=0;const q=blockCorners(bi);const cx=(q[0].x+q[2].x)/2,cy=(q[0].y+q[2].y)/2;burst("sparkle",cx,cy,16,{sp:1.4});burst("leaf",cx,cy,12,{sp:1.2});toast("New field! 9 plots ready.");if(sheetKind==="land"){closeSheet();save();return;}}}
  if(d.btab){barnTab=d.btab;$("sbody").scrollTop=0;}
  if(d.build){buyBuilding(d.build);if(sheetKind==="build"){closeSheet();return;}}
  if(d.upg){if(d.upg==="soil"){const L=S.upg.soil||0;if(L<3&&spend(SOIL_COST[L])){S.upg.soil=L+1;giveLC(1);toast("Richer soil! Crops grow faster.");}}
    else{const[id,k]=d.upg.split(":");const u=S.upg[id]||(S.upg[id]={});const L=u[k]||0;if(L<UPG[k].max&&spend(upgCost(id,k))){u[k]=L+1;giveLC(1);toast(`${BLD[id].n}: ${UPG[k].n}!`);}}}
  if(d.furn){const k=d.furn;if(!S.furn[k]&&spend(FURN[k].cost)){S.furn[k]=true;giveLC(1);const F2=FURN[k];burst("sparkle",F2.x,F2.y-60,14,{sp:1.2});toast(`${FURN[k].n} placed! Look by the Chicken Pen.`);V.cx=F2.x;V.cy=F2.y-60;}}
  if(d.a==="send"){sendExp();}
  if(d.who){expSel.who=d.who;}
  if(d.dest){expSel.dest=d.dest;}
  if(d.a==="snack"){expSel.snack=!expSel.snack;}
  if(d.a==="claim"){collectExp(d.claim);}
  if(d.a==="pc"){postcard=null;}
  if(d.a==="barn"){const bc=Math.round(120*Math.pow(1.5,(S.barnCap-40)/20));if(spend(bc)){S.barnCap+=20;giveLC(2);}}
  if(d.buy){const n=+d.n,c=CROPS[d.buy].seed*n;if(spend(c)){S.seeds[d.buy]=(S.seeds[d.buy]||0)+n;S.sel=d.buy;}}
  if(d.a==="rent"){if(spend(SHOPS[id].rent)){sh.open=true;giveLC(2);toast(`${SHOPS[id].n} is open for business!`);}}
  if(d.a==="collect"){S.coins+=sh.reg;sh.reg=0;}
  if(d.staff){for(const w of["momo","soso"])if(S.staff[w]===id&&d.staff!==w)S.staff[w]=null;if(d.staff!=="none")S.staff[d.staff]=id;}
  if(d.toggle){const i=sh.sell.indexOf(d.toggle);if(i>=0)sh.sell.splice(i,1);else sh.sell.push(d.toggle);}
  if(d.a==="restock"){let n=0;while(restockOne(sh))n++;toast(n?`Stocked ${n} item${n>1?"s":""}.`:shelfCount(sh)>=shelfCap(sh)?"The shelf is full.":"Nothing in the barn for this stand. Harvest first.");}
  if(d.make){const R=SHOPS[id].rec[d.make];if(has(R.need)&&sh.q.length<sh.kitchenLv){take(R.need);sh.q.push({r:d.make,end:Date.now()+R.t*1000/(onShift("momo",id)?1.5:1)});}}
  if(d.rep){sh.repeat=sh.repeat===d.rep?null:d.rep;if(sh.repeat&&S.staff.momo!==id&&S.staff.soso!==id)toast("Put Momo or Soso on shift so they keep making it.");}
  if(d.a==="shelf"){const c=Math.round(90*Math.pow(1.7,sh.shelfLv-1));if(spend(c)){sh.shelfLv++;giveLC(2);}}
  if(d.a==="kitchen"){if(spend(250*sh.kitchenLv)){sh.kitchenLv++;giveLC(2);}}
  if(d.a==="decor"){if(spend(150*(sh.decor+1))){sh.decor++;giveLC(2);}}
  if(d.prize){const p=PRIZES.find(x=>x.id===d.prize);if(S.balls>=p.cost){S.balls-=p.cost;
    if(p.id==="pouch")S.coins+=150;
    if(p.id==="boost"){S.plots.forEach(pl=>{if(pl.c)pl.p=Math.min(1,pl.p+.5);});}
    if(p.id==="melon")S.seeds.melon=(S.seeds.melon||0)+2;
    if(p.id==="sprinkler")S.sprinklerUntil=Math.max(Date.now(),S.sprinklerUntil)+600000;
    if(p.id==="flowerbed")S.prize.flowerbed++;
    if(["hat","ribbon","fountain"].includes(p.id))S.prize[p.id]=true;
    toast(`Got: ${p.n}!`);}}
  dirtyUI=true;save();renderSheet();});

// ================= TRAY / HUD =================
let area="farm",dirtyUI=true;
function setArea(a){area=a;closeStore();shopMenuOpen=false;for(const k of["farm","plaza","pachi"])$("tab-"+k).setAttribute("aria-selected",k===a);if(a!=="pachi")firing=false;closeSheet();renderTray();}
for(const k of["farm","plaza","pachi"])$("tab-"+k).onclick=()=>setArea(k);
let SEEDBAG="",BASKET="",toolOpen=false,shopMenuOpen=false;
function toolIcons(){const mk=f=>{const c=document.createElement("canvas");c.width=c.height=120;const g=c.getContext("2d");f(g);return c.toDataURL();};
  SEEDBAG=mk(g=>drawSeedBag(g,60,62,100,null));BASKET=mk(g=>drawBasket(g,60,62,104));}
function renderTray(){$("zoom").hidden=area==="pachi";const T=$("tray");T.classList.toggle("farm",area==="farm");T.classList.toggle("plaza",area==="plaza");let h="";
  if(area==="farm"){
    const TOOLS=[["seed","Plant",IMG.ui_seed||SEEDBAG],["water","Water",IMG.ui_can||IMG.can],["harvest","Harvest",IMG.ui_basket||BASKET]];const cur=TOOLS.find(t=>t[0]===tool);
    h+=`<div class="toolbar ${toolOpen?"open":""}">`;
    if(toolOpen&&tool==="seed"){h+=`<div class="seedcar">`;for(const k in CROPS){const C=CROPS[k];if(C.prize&&!S.seeds[k])continue;if(!C.prize&&C.lvl>S.lvl)continue;
      h+=`<button class="seedchip ${(S.seeds[k]||0)?"":"empty"}" data-seed="${k}" aria-pressed="${S.sel===k}" title="${ITEMS[k].n} seeds"><img src="${icon(k)}" alt=""><span class="cnt">${S.seeds[k]||0}</span></button>`;}
      h+=`<button class="seedchip buy" data-open="seeds" title="Buy seeds"><img src="${IMG.ui_shop||IMG.oa_barn}" alt=""><span class="cnt">+</span></button></div>`;}
    h+=`<div class="fan">`;
    if(toolOpen)h+=TOOLS.map(([k,n,src],j)=>`<button class="tbtn" style="--a:${[0,45,90][j]}deg;--d:${j*45}ms" data-tool="${k}" aria-pressed="${tool===k}" aria-label="${n}"><span class="ring"><img src="${src}" alt=""></span><b>${n}</b></button>`).join("");
    h+=`<button class="fab" data-fab="1" aria-expanded="${toolOpen}" aria-label="Tools: ${cur[1]}"><span class="ring"><img src="${cur[2]}" alt=""></span><b>${toolOpen?"Close":cur[1]}</b>${tool==="seed"&&!toolOpen?`<span class="fseed"><img src="${icon(S.sel)}" alt=""><i class="fcnt">${S.seeds[S.sel]||0}</i></span>`:""}</button></div></div>`;}
  else if(area==="plaza"){h=`<div class="smenu ${shopMenuOpen?"open":""}">`;
    if(shopMenuOpen){h+=`<div class="slist"><button class="srow coll" data-open="collect"><span class="ic coin">¢</span><b>Collect all registers</b></button>`+PSHOP.map(b=>{const sh=S.shops[b.id],D=SHOPS[b.id];return `<button class="srow ${sh.open?"":"lk"}" data-gostore="${b.id}"><img src="${IMG[b.spr]}" alt=""><b>${D.n}</b>${sh.open?(sh.reg?`<em><i class="cn"></i>${sh.reg}</em>`:keeperOf(b.id)?`<small>${FNAME[keeperOf(b.id)]}</small>`:`<small>no keeper</small>`):`<small>🔒</small>`}</button>`;}).join("")+`<button class="srow" data-gopachi="1"><span class="ic">🎰</span><b>Pachinko</b></button></div>`;}
    h+=`<button class="fab" data-smenu="1" aria-expanded="${shopMenuOpen}"><span class="ring"><img src="${IMG.ui_shop}" alt=""></span><b>${shopMenuOpen?"Close":"Shops"}</b></button></div>`;}
  else{h=`<div id="pctl"><div class="pcounter"><img src="${IMG.pk_tray}" alt=""><b id="bcount">${S.balls}</b><small>balls</small></div>
    <label class="ppow" for="power"><span>Power <b id="powv">${pctPower}</b></span><input type="range" id="power" min="0" max="100" value="${pctPower}"></label>
    <button id="fire" aria-label="Hold to fire balls"><img src="${IMG.pk2_button}" alt=""><b>HOLD</b></button>
    <div class="pside"><button class="pbtn" data-open="buyballs" ${S.lc>0?"":"disabled"}><img src="${IMG.pk_heart}" alt="">1 ♥ → 25</button><button class="pbtn" data-open="prizes"><img src="${IMG.pk_bell}" alt="">Prizes</button></div></div>`;}
  T.innerHTML=h;
  if(area==="pachi"){const f=$("fire");const on=e=>{e.preventDefault();if(S.balls<=0){toast(S.lc>0?"Out of balls. Swap a loyalty coin for 25.":"Out of balls. Earn loyalty coins by selling in the plaza and buying upgrades.");return;}firing=true;fireT=0;f.classList.add("on");try{f.setPointerCapture(e.pointerId);}catch(_){}};
    const off=()=>{firing=false;f.classList.remove("on");};f.addEventListener("pointerdown",on);f.addEventListener("pointerup",off);f.addEventListener("pointercancel",off);f.addEventListener("lostpointercapture",off);
    $("power").addEventListener("input",e=>{pctPower=+e.target.value;const k=$("powv");if(k)k.textContent=pctPower;});}}
let pctPower=55;
$("tray").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;const d=b.dataset;
  if(d.seed){S.sel=d.seed;tool="seed";toolOpen=false;renderTray();}
  if(d.tool){tool=d.tool;toolOpen=tool==="seed";renderTray();}
  if(d.fab){toolOpen=!toolOpen;renderTray();}
  if(d.smenu){shopMenuOpen=!shopMenuOpen;renderTray();}
  if(d.gostore){openStore(d.gostore);}
  if(d.gopachi){shopMenuOpen=false;setArea("pachi");}
  if(d.open==="seeds")openSeeds();if(d.open==="barn")openBarn();if(d.open==="prizes")openPrizes();
  if(d.open==="buyballs"&&S.lc>0){S.lc--;S.balls+=25;dirtyUI=true;save();renderTray();}
  if(d.open==="collect"){shopMenuOpen=false;renderTray();let t=0;for(const k in S.shops){t+=S.shops[k].reg;S.shops[k].reg=0;}if(t){S.coins+=t;toast(`Collected ${t} coins.`);save();}else toast("The registers are empty. Keep the shelves stocked.");dirtyUI=true;}});
function renderHUD(){$("coins").textContent=S.coins;$("lc").textContent=S.lc;$("lvl").textContent=S.lvl;$("xp").style.width=(100*S.xp/xpFor(S.lvl))+"%";
  const bc=$("bcount");if(bc)bc.textContent=S.balls;
  if(area==="farm"){const chips=[...$("tray").querySelectorAll("[data-seed]")];const want=tool!=="seed"?[]:Object.keys(CROPS).filter(k=>CROPS[k].prize?S.seeds[k]:CROPS[k].lvl<=S.lvl);
    if(tool==="seed"&&chips.length!==want.length)renderTray();else chips.forEach(c=>{c.querySelector(".cnt").textContent=S.seeds[c.dataset.seed]||0;c.classList.toggle("empty",!(S.seeds[c.dataset.seed]||0));c.setAttribute("aria-pressed",S.sel===c.dataset.seed);});const fc=$("tray").querySelector(".fcnt");if(fc)fc.textContent=S.seeds[S.sel]||0;}
  if(area==="pachi"){const bb=$("tray").querySelector('[data-open="buyballs"]');if(bb)bb.disabled=S.lc<=0;}}

// ================= INPUT =================
const evp=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
// two-finger pinch zoom (farm & plaza)
const PTRS=new Map();let pinch=null,pinchLock=false;
function zoomAt(f,mx,my){if(area==="farm"){viewLayout();const a=toW(mx,my);V.z=Math.max(1,Math.min(3,(V.z||1.4)*f));viewLayout();const b=toW(mx,my);V.cx+=a.x-b.x;V.cy+=a.y-b.y;}
  else if(area==="plaza"){plazaLayout();const a=toWP(mx,my);PZ.z=Math.max(1,Math.min(2.5,(PZ.z||1.1)*f));plazaLayout();const b=toWP(mx,my);PZ.cx+=a.x-b.x;PZ.cy+=a.y-b.y;}}
cv.addEventListener("pointerdown",e=>{PTRS.set(e.pointerId,evp(e));if(PTRS.size>=2&&area!=="pachi"){const[a,b]=[...PTRS.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1};pinchLock=true;stroke=null;pstroke=null;return;}},true);
cv.addEventListener("pointermove",e=>{if(!PTRS.has(e.pointerId))return;PTRS.set(e.pointerId,evp(e));if(pinch&&PTRS.size>=2){e.stopImmediatePropagation();const[a,b]=[...PTRS.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1])||1;zoomAt(d/pinch.d,(a[0]+b[0])/2,(a[1]+b[1])/2);pinch.d=d;}},true);
const ptrEnd=e=>{PTRS.delete(e.pointerId);if(PTRS.size<2)pinch=null;if(pinchLock){e.stopImmediatePropagation();stroke=null;pstroke=null;if(PTRS.size===0)pinchLock=false;}};
cv.addEventListener("pointerup",ptrEnd,true);cv.addEventListener("pointercancel",ptrEnd,true);
cv.addEventListener("pointerdown",e=>{if(pinchLock)return;const[mx,my]=evp(e);
  if(area==="farm"){if(toolOpen){toolOpen=false;renderTray();}try{cv.setPointerCapture(e.pointerId);}catch(_){}farmDown(mx,my);}else if(area==="plaza"){try{cv.setPointerCapture(e.pointerId);}catch(_){}plazaDown(mx,my);}});
cv.addEventListener("pointermove",e=>{if(pinchLock)return;const[mx,my]=evp(e);if(area==="farm"&&stroke)farmMove(mx,my);else if(area==="plaza"&&pstroke)plazaMove(mx,my);});
cv.addEventListener("pointerup",e=>{const[mx,my]=evp(e);if(area==="farm")farmUp(mx,my);else if(area==="plaza")plazaUp(mx,my);});
cv.addEventListener("pointercancel",()=>{stroke=null;pstroke=null;});
$("zoom").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const f=b.dataset.z==="1"?1.25:1/1.25;if(area==="plaza")PZ.z=Math.max(1,Math.min(2.5,(PZ.z||1.1)*f));else V.z=Math.max(1,Math.min(3,(V.z||1.4)*f));});
cv.addEventListener("wheel",e=>{if(area==="pachi")return;e.preventDefault();const[mx,my]=evp(e);zoomAt(e.deltaY<0?1.1:1/1.1,mx,my);},{passive:false});
document.addEventListener("keydown",e=>{if(area==="pachi"&&e.code==="Space"&&!e.repeat&&sheetKind===null){e.preventDefault();if(S.balls>0){firing=true;fireT=0;$("fire")?.classList.add("on");}}});
document.addEventListener("keyup",e=>{if(e.code==="Space"){firing=false;$("fire")?.classList.remove("on");}});

// ================= LOOP =================
let last=performance.now(),lastWall=Date.now(),uiT=0,saveT=0;
function farmTick(wdt){const now=Date.now();for(let i=0;i<NP;i++){const pl=S.plots[i];if(pl.c&&pl.p<1)advance(pl,wdt);}
  for(const id of["chicken","cow","sheep","pig"]){const st=S.bld[id],b=BLD[id];if(!st.own)continue;const ms=penEvery(id)*1000,cap=penCap(id);while(st.n<cap&&now-st.t>=ms){st.n++;st.t+=ms;}if(st.n>=cap)st.t=now;
    if(st.n>0&&(S.upg[id]||{}).auto){const n=Math.min(st.n,S.barnCap-invTotal());if(n>0){st.n-=n;addInv(b.prod,n);gainXP(n);if(area==="farm")flyToBarn(b.prod,b.x,b.y-150,n);dirtyUI=true;}}}}
function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;const wall=Date.now(),wdt=(wall-lastWall)/1000;lastWall=wall;const time=now/1000;
  farmTick(wdt);updateTurtlesFarm(dt);updParts(dt);updAnimals(dt);plazaLayout();updatePlaza(dt);if(area==="pachi")updatePachi(dt);
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(area==="farm")drawFarm(time);else if(area==="plaza")drawPlaza(time);else drawPachi(time);
  drawFloats(dt);
  uiT+=dt;saveT+=dt;if(dirtyUI||uiT>.5){renderHUD();if(sheetKind&&(uiT>.5)&&(sheetKind==="shop"||sheetKind==="exp"))renderSheet();if(storeId&&uiT>.5&&(storeTab!=="owner"||!chatEv))renderStore();dirtyUI=false;if(uiT>.5)uiT=0;}
  if(saveT>5){save();saveT=0;}
  requestAnimationFrame(tick);}
document.addEventListener("visibilitychange",()=>{if(document.hidden){firing=false;save();}});
function start(){S=load()||fresh();if(!S.prize)S.prize={flowerbed:0};if(!S.exp)S.exp={momo:null,soso:null};if(!S.upg)S.upg={};if(!S.furn)S.furn={};if(!S.partner)S.partner={};
  if(S.shops.veggie){S.shops.produce=S.shops.veggie;delete S.shops.veggie;}for(const k in SHOPS)if(!S.shops[k])S.shops[k]=freshShop(k==="produce");
  for(const w of["momo","soso"])if(S.staff[w]==="veggie")S.staff[w]="produce";
  const away=Math.max(0,(Date.now()-(S.savedAt||Date.now()))/1000);for(const pl of S.plots)advance(pl,away);
  resize();grass=grassPattern();stone=stonePattern();toolIcons();renderTray();renderHUD();
  if(!S.xp&&S.lvl===1&&!S.sales)toast("Pick a tool, then swipe across the soil. Tap the Main Barn for upgrades.");
  else if(away>60)toast("Welcome back! The farm kept growing while you were away.");
  requestAnimationFrame(tick);}
window.claude?.hot?.ready?window.claude.hot.ready(start):start();
})();
