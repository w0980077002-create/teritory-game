import { DurableObject } from "cloudflare:workers";

const ZONES=[0,1,2,3];
const ZONE_NAMES=["Голова","Грудь","Пояс","Ноги"];
const MAX_STATE_BYTES=900000;
const REGEN_MS=300000;
const MAX_ENERGY=500;

const START={
  coins:1779,gems:1330,energy:100,hp:120,maxHp:120,
  level:3,exp:120,maxExp:150,strength:12,agility:9,freePoints:0,
  wins:0,losses:0,battles:0,district:"square",forgeLevel:0,rating:1000,
  guildId:"",guildName:"",guildMembers:1,guildContrib:0,
  questDone:false,bonusClaimed:false,dailyClaimed:false,
  seasonClaimed:false,achievementClaimed:false,
  materials:{iron:5,wood:5,leather:3,herbs:3},
  items:[],battle:null,lastEnergyAt:Date.now()
};

const DISTRICTS=[
 {id:"square",name:"Центральная площадь",level:1,cost:0,icon:"🏰"},
 {id:"forest",name:"Северный лес",level:3,cost:3,icon:"🌲"},
 {id:"harbor",name:"Порт Sdolars",level:8,cost:5,icon:"⚓"},
 {id:"industrial",name:"Промзона",level:12,cost:7,icon:"🏭"},
 {id:"fortress",name:"Старая крепость",level:18,cost:10,icon:"🏛️"}
];

const ENEMIES=[
 {id:"street",name:"Уличный боец",hp:90,damage:8,def:3,reward:90,xp:25},
 {id:"merc",name:"Наёмник",hp:125,damage:11,def:6,reward:130,xp:35},
 {id:"troll",name:"Ледяной тролль",hp:170,damage:14,def:9,reward:200,xp:50},
 {id:"champion",name:"Чемпион арены",hp:230,damage:18,def:12,reward:320,xp:80}
];

const CATALOG={
 knife:{name:"Нож",type:"Оружие",icon:"🔪",damage:6,defense:0,price:220},
 heavyaxe:{name:"Тяжёлый топор",type:"Оружие",icon:"🪓",damage:18,defense:0,price:700},
 steel:{name:"Стальная броня",type:"Броня",icon:"🛡️",damage:0,defense:15,price:650},
 bandage:{name:"Аптечка",type:"Расходник",icon:"🩹",damage:0,defense:0,qty:1,price:80}
};

function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{
  "content-type":"application/json; charset=utf-8","cache-control":"no-store",
  "access-control-allow-origin":"*","access-control-allow-headers":"Content-Type,Authorization,X-Telegram-Init-Data,X-Guest-Id,X-Guest-Name",
  "access-control-allow-methods":"GET,POST,OPTIONS"
 }});
}
function cleanId(v){return String(v??"").replace(/[^a-zA-Z0-9_:@.-]/g,"").slice(0,120)}
function safeName(v){return String(v??"Игрок").replace(/[<>]/g,"").slice(0,40)||"Игрок"}
function validMove(m){
 const attack=Number(m?.attack),defs=Array.isArray(m?.defs)?m.defs.map(Number):[];
 return Number.isInteger(attack)&&ZONES.includes(attack)&&defs.length===2&&defs[0]!==defs[1]&&defs.every(x=>Number.isInteger(x)&&ZONES.includes(x));
}
function randInt(n){return Math.floor(Math.random()*n)}
function pickEnemy(state){return ENEMIES[Math.min(ENEMIES.length-1,Math.floor((state.wins||0)/3))]}
function itemStats(state){
 let damage=0,defense=0;
 for(const i of state.items||[]) if(i.equipped){damage+=Number(i.damage||0);defense+=Number(i.defense||0)}
 return {damage,defense}
}
function sanitize(s,name){
 const x=s&&typeof s==="object"?s:{};
 return {
  ...START,playerName:safeName(name||x.playerName||"Игрок"),
  coins:Math.max(0,Math.min(100000,Number(x.coins)||START.coins)),
  gems:Math.max(0,Math.min(100000,Number(x.gems)||START.gems)),
  energy:Math.max(0,Math.min(MAX_ENERGY,Number(x.energy)||START.energy)),
  maxHp:Math.max(100,Math.min(1000,Number(x.maxHp)||START.maxHp)),
  hp:Math.max(1,Math.min(Number(x.maxHp)||START.maxHp,Number(x.hp)||START.hp)),
  level:Math.max(1,Math.min(50,Number(x.level)||START.level)),
  exp:Math.max(0,Math.min(999999,Number(x.exp)||START.exp)),
  maxExp:Math.max(100,Math.min(999999,Number(x.maxExp)||START.maxExp)),
  strength:Math.max(1,Math.min(200,Number(x.strength)||START.strength)),
  agility:Math.max(1,Math.min(100,Number(x.agility)||START.agility)),
  freePoints:Math.max(0,Math.min(500,Number(x.freePoints)||0)),
  wins:Math.max(0,Number(x.wins)||0),losses:Math.max(0,Number(x.losses)||0),battles:Math.max(0,Number(x.battles)||0),
  district:DISTRICTS.some(d=>d.id===x.district)?x.district:"square",
  forgeLevel:Math.max(0,Math.min(20,Number(x.forgeLevel)||0)),rating:Math.max(0,Math.min(5000,Number(x.rating)||1000)),
  guildId:safeName(x.guildId||""),guildName:safeName(x.guildName||""),guildMembers:Math.max(1,Math.min(100,Number(x.guildMembers)||1)),guildContrib:Math.max(0,Number(x.guildContrib)||0),
  questDone:!!x.questDone,bonusClaimed:!!x.bonusClaimed,dailyClaimed:!!x.dailyClaimed,seasonClaimed:!!x.seasonClaimed,achievementClaimed:!!x.achievementClaimed,
  materials:{iron:Math.max(0,Number(x.materials?.iron)||5),wood:Math.max(0,Number(x.materials?.wood)||5),leather:Math.max(0,Number(x.materials?.leather)||3),herbs:Math.max(0,Number(x.materials?.herbs)||3)},
  items:Array.isArray(x.items)?x.items.slice(0,100).map(i=>({id:String(i.id||""),name:safeName(i.name||"Предмет"),type:safeName(i.type||"Предмет"),icon:String(i.icon||"🎒").slice(0,8),damage:Math.max(0,Math.min(200,Number(i.damage)||0)),defense:Math.max(0,Math.min(200,Number(i.defense)||0)),qty:Math.max(1,Math.min(999,Number(i.qty)||1)),equipped:!!i.equipped})):[],
  battle:null,lastEnergyAt:Number(x.lastEnergyAt)||Date.now()
 };
}

async function telegramAuth(initData,botToken){
 if(!initData||!botToken)return null;
 const p=new URLSearchParams(initData),hash=p.get("hash"); if(!hash)return null;
 const authDate=Number(p.get("auth_date")||0); if(!authDate||Date.now()/1000-authDate>86400)return null;
 p.delete("hash");
 const check=[...p.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join("\n");
 const secret=await crypto.subtle.sign("HMAC",await crypto.subtle.importKey("raw",new TextEncoder().encode("WebAppData"),{name:"HMAC",hash:"SHA-256"},false,["sign"]),new TextEncoder().encode(botToken));
 const key=await crypto.subtle.importKey("raw",secret,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(check));
 const got=[...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,"0")).join("");
 if(got!==hash)return null;
 let u;try{u=JSON.parse(p.get("user")||"{}")}catch{return null}
 if(!u?.id)return null;
 return {playerId:`tg_${u.id}`,name:safeName([u.first_name,u.last_name].filter(Boolean).join(" ")||u.username||"Игрок")};
}
async function authRequest(req,env){
 if(env.TELEGRAM_BOT_TOKEN)return telegramAuth(req.headers.get("X-Telegram-Init-Data")||"",env.TELEGRAM_BOT_TOKEN);
 return {playerId:cleanId(req.headers.get("X-Guest-Id")||"guest_default"),name:safeName(req.headers.get("X-Guest-Name")||"Игрок"),guest:true};
}

export class GameHub extends DurableObject{
 constructor(ctx,env){
  super(ctx,env);this.ctx=ctx;this.env=env;
  this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, state TEXT NOT NULL, updated_at INTEGER NOT NULL)`);
 }
 updateEnergy(state){
  const now=Date.now(),last=Number(state.lastEnergyAt)||now,elapsed=Math.max(0,now-last),ticks=Math.floor(elapsed/REGEN_MS);
  if(ticks>0){state.energy=Math.min(MAX_ENERGY,Number(state.energy||0)+ticks);state.lastEnergyAt=last+ticks*REGEN_MS}
  return state;
 }
 async readState(pid,name){
  const row=this.ctx.storage.sql.exec(`SELECT state FROM players WHERE id = ?`,pid).one();
  let s=row?.state?JSON.parse(row.state):sanitize({},name);
  s=sanitize(s,name);s=this.updateEnergy(s);s.playerName=safeName(name||s.playerName);
  await this.saveState(pid,s);return s;
 }
 async saveState(pid,state){
  if(JSON.stringify(state).length>MAX_STATE_BYTES)throw new Error("state_too_large");
  this.ctx.storage.sql.exec(`INSERT OR REPLACE INTO players(id,state,updated_at) VALUES(?,?,?)`,pid,JSON.stringify(state),Date.now());
  return state;
 }
 levelUp(s){
  while(s.exp>=s.maxExp&&s.level<50){s.exp-=s.maxExp;s.level++;s.maxExp=Math.round(s.maxExp*1.25);s.maxHp+=8;s.hp=s.maxHp;s.freePoints+=2}
  return s;
 }
 async action(pid,name,a){
  let state=await this.readState(pid,name);
  // Required: energy regeneration is calculated before ANY action.
  state=this.updateEnergy(state);
  const type=String(a?.type||"");

  if(type==="district.travel"){
   const d=DISTRICTS.find(x=>x.id===a.district);if(!d)return json({ok:false,error:"unknown_district"},400);
   if(state.level<d.level)return json({ok:false,error:"level_required"},400);
   const cost=Number(d.cost)||0;
   if((state.energy||0)<cost){await this.saveState(pid,state);return json({ok:false,error:"no_energy"},400)}
   state.energy-=cost;state.district=d.id;await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="stat.add"){
   const stat=a.stat;if(!["strength","agility"].includes(stat)||state.freePoints<1)return json({ok:false,error:"invalid_stat"},400);
   state[stat]++;state.freePoints--;await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="item.buy"){
   const c=CATALOG[a.item];if(!c)return json({ok:false,error:"item_not_found"},404);
   if(state.coins<c.price)return json({ok:false,error:"not_enough_coins"},400);
   state.coins-=c.price;
   const old=state.items.find(i=>i.name===c.name&&!i.equipped);
   if(old&&c.type==="Расходник")old.qty++;
   else state.items.push({id:crypto.randomUUID(),...c,qty:c.qty||1,equipped:false});
   await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="item.equip"||type==="item.unequip"){
   const item=state.items.find(i=>i.id===String(a.id));if(!item)return json({ok:false,error:"item_not_found"},404);
   if(type==="item.equip"&&item.type==="Оружие")for(const i of state.items)if(i.type==="Оружие")i.equipped=false;
   if(type==="item.equip"&&item.type==="Броня")for(const i of state.items)if(i.type==="Броня")i.equipped=false;
   item.equipped=type==="item.equip";await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="item.use"){
   const item=state.items.find(i=>i.id===String(a.id));if(!item||item.type!=="Расходник"||item.qty<1)return json({ok:false,error:"item_not_usable"},400);
   state.hp=Math.min(state.maxHp,state.hp+35);item.qty--;if(item.qty<=0)state.items=state.items.filter(i=>i.id!==item.id);
   await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="daily.claim"||type==="bonus.claim"){
   if(state.dailyClaimed||state.bonusClaimed)return json({ok:false,error:"already_claimed"},409);
   state.dailyClaimed=true;state.bonusClaimed=true;state.coins+=250;state.energy=Math.min(MAX_ENERGY,state.energy+10);state.exp+=20;this.levelUp(state);
   await this.saveState(pid,state);return json({ok:true,state,player:state,reward:{coins:250,energy:10,xp:20}});
  }

  if(type==="event.fight"){
   if(state.energy<3)return json({ok:false,error:"no_energy"},400);
   state.energy-=3;const reward=70+randInt(81);state.coins+=reward;state.exp+=15;this.levelUp(state);await this.saveState(pid,state);
   return json({ok:true,state,player:state,reward:{coins:reward,xp:15}});
  }

  if(type==="tavern.recruit"){
   const cost=300;if(state.coins<cost)return json({ok:false,error:"not_enough_coins"},400);
   state.coins-=cost;state.rating+=25;state.guildMembers=Math.min(100,state.guildMembers+1);
   await this.saveState(pid,state);return json({ok:true,state,player:state,recruit:{name:"Наёмник Sdolars",power:12}});
  }

  if(type==="craft"){
   const need={iron:2,wood:2,leather:1};for(const k of Object.keys(need))if((state.materials[k]||0)<need[k])return json({ok:false,error:"not_enough_materials"},400);
   for(const k of Object.keys(need))state.materials[k]-=need[k];
   state.items.push({id:crypto.randomUUID(),name:"Кованый клинок",type:"Оружие",icon:"⚔️",damage:12+state.forgeLevel,defense:0,qty:1,equipped:false});
   state.forgeLevel=Math.min(20,state.forgeLevel+1);await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="guild.contribute"){
   const amount=Math.floor(Number(a.amount)||0);if(amount<1||amount>1000||state.coins<amount)return json({ok:false,error:"invalid_contribution"},400);
   state.coins-=amount;state.guildContrib+=amount;state.rating+=Math.floor(amount/20);if(!state.guildId){state.guildId="sdolars";state.guildName="Sdolars";state.guildMembers=1}
   await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="achievement.claim"){
   if(state.achievementClaimed||state.wins<1)return json({ok:false,error:"achievement_locked"},400);
   state.achievementClaimed=true;state.gems+=25;state.coins+=100;await this.saveState(pid,state);return json({ok:true,state,player:state,reward:{gems:25,coins:100}});
  }

  if(type==="resource.gather"){
   const cost=2;if(state.energy<cost)return json({ok:false,error:"no_energy"},400);state.energy-=cost;
   const gain={iron:1+randInt(2),wood:1+randInt(2),leather:randInt(2),herbs:randInt(2)};
   for(const k of Object.keys(gain))state.materials[k]=(state.materials[k]||0)+gain[k];
   await this.saveState(pid,state);return json({ok:true,state,player:state,reward:gain});
  }

  if(type==="rest"){
   const healed=Math.min(state.maxHp-state.hp,30);if(healed<=0)return json({ok:false,error:"full_hp"},400);
   const cost=1;if(state.energy<cost)return json({ok:false,error:"no_energy"},400);state.energy-=cost;state.hp+=healed;
   await this.saveState(pid,state);return json({ok:true,state,player:state,healed});
  }

  if(type==="season.claim"){
   if(state.seasonClaimed||state.level<5)return json({ok:false,error:"season_locked"},400);
   state.seasonClaimed=true;state.gems+=50;state.coins+=500;await this.saveState(pid,state);return json({ok:true,state,player:state,reward:{gems:50,coins:500}});
  }

  if(type==="quest.complete"){
   if(state.questDone)return json({ok:false,error:"already_claimed"},409);state.questDone=true;state.coins+=150;state.exp+=80;this.levelUp(state);
   await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  if(type==="battle.start"){
   if(state.battle)return json({ok:false,error:"battle_active"},409);
   if(state.energy<5)return json({ok:false,error:"no_energy"},400);
   const e=pickEnemy(state);state.energy-=5;state.battle={id:crypto.randomUUID(),enemyId:e.id,enemyHp:e.hp,playerHp:state.hp,turn:1,status:"active"};
   await this.saveState(pid,state);return json({ok:true,state,player:state,battle:{id:state.battle.id,enemy:e,enemyHp:e.hp,playerHp:state.hp,turn:1}});
  }

  if(type==="battle.turn"){
   if(!validMove(a))return json({ok:false,error:"invalid_move"},400);
   if(!state.battle||state.battle.status!=="active")return json({ok:false,error:"no_active_battle"},409);
   const e=ENEMIES.find(x=>x.id===state.battle.enemyId)||pickEnemy(state), moveAttack=Number(a.attack),defs=a.defs.map(Number);
   const enemyAttack=randInt(4),enemyDefs=[...ZONES].sort(()=>Math.random()-.5).slice(0,2),stats=itemStats(state);
   const crit=Math.random()<Math.min(.5,state.strength/120),dodge=Math.random()<Math.min(.45,state.agility/100);
   const hit=!enemyDefs.includes(moveAttack),blocked=defs.includes(enemyAttack);
   const playerDamage=hit?Math.max(1,Math.round(7+state.strength*.7+stats.damage-e.def*.35)*(crit?2:1)):0;
   const enemyDamage=(blocked||dodge)?0:Math.max(1,Math.round(e.damage-stats.defense*.35));
   state.battle.enemyHp=Math.max(0,state.battle.enemyHp-playerDamage);
   state.battle.playerHp=Math.max(0,state.battle.playerHp-enemyDamage);
   state.battle.turn++;
   let result="continue";
   if(state.battle.enemyHp<=0){result="win";state.battle.status="won"}
   else if(state.battle.playerHp<=0){result="loss";state.battle.status="lost"}
   state.hp=state.battle.playerHp;
   await this.saveState(pid,state);
   return json({ok:true,state,player:state,result,round:{attack:moveAttack,defs,enemyAttack,enemyDefs,hit,crit,blocked,dodge,playerDamage,enemyDamage,playerHp:state.battle.playerHp,enemyHp:state.battle.enemyHp}});
  }

  if(type==="battle.reward"){
   if(!state.battle||state.battle.status!=="won")return json({ok:false,error:"reward_locked"},400);
   const e=ENEMIES.find(x=>x.id===state.battle.enemyId)||pickEnemy(state);state.coins+=e.reward;state.exp+=e.xp;state.wins++;state.battles++;state.hp=state.maxHp;state.battle=null;this.levelUp(state);
   await this.saveState(pid,state);return json({ok:true,state,player:state,reward:{coins:e.reward,xp:e.xp}});
  }

  if(type==="battle.loss"){
   if(!state.battle||state.battle.status!=="lost")return json({ok:false,error:"loss_locked"},400);
   state.losses++;state.battles++;state.hp=Math.max(1,Math.round(state.maxHp*.35));state.battle=null;
   await this.saveState(pid,state);return json({ok:true,state,player:state});
  }

  return json({ok:false,error:"unknown_action"},400);
 }

 async fetch(request){
  const url=new URL(request.url);
  if(request.method==="OPTIONS")return json({ok:true});
  if(url.pathname==="/api/health")return json({ok:true,build:"S89-FINAL",zones:4,energyRegenMs:REGEN_MS,sqlite:true});
  const auth=await authRequest(request,this.env);if(!auth)return json({ok:false,error:"unauthorized"},401);
  if(url.pathname==="/api/state"&&request.method==="POST"){
   const body=await request.json().catch(()=>({}));const state=await this.readState(auth.playerId,auth.name);
   return json({ok:true,state,player:state});
  }
  if(url.pathname==="/api/action"&&request.method==="POST"){
   const body=await request.json().catch(()=>({}));return this.action(auth.playerId,auth.name,body);
  }
  return json({ok:false,error:"not_found"},404);
 }
}

export default{
 async fetch(request,env){
  if(request.method==="OPTIONS")return json({ok:true});
  const url=new URL(request.url);
  if(url.pathname==="/api/health")return json({ok:true,build:"S89-FINAL",zones:4,energyRegenMs:REGEN_MS,sqlite:true});
  if(url.pathname.startsWith("/api/")){
   const auth=await authRequest(request,env);if(!auth)return json({ok:false,error:"unauthorized"},401);
   const id=env.GAME_HUB.idFromName(auth.playerId);return env.GAME_HUB.get(id).fetch(request);
  }
  if(url.pathname==="/ws"){
   const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();
   server.send(JSON.stringify({type:"system",text:"Чат Sdolars подключён",time:new Date().toISOString()}));
   server.addEventListener("message",e=>{try{const m=JSON.parse(e.data);if(m.type!=="chat")return;server.send(JSON.stringify({type:"chat",name:safeName(m.name||"Игрок"),text:String(m.text||"").slice(0,500),time:new Date().toISOString()}))}catch{}});
   return new Response(null,{status:101,webSocket:client});
  }
  if(env.ASSETS)return env.ASSETS.fetch(request);
  return new Response("Territory Sdolars",{status:404});
 }
};