import { DurableObject } from "cloudflare:workers";

const MAX_STATE_BYTES = 900_000;
const ZONES = [0,1,2,3];
const ATTACK_ZONES = [0,1,2,3];
const MAX_NAME = 40;
const START = {coins:1779, gems:1330, energy:191.38, hp:120, maxHp:120, level:3, exp:120, maxExp:150, strength:12, agility:9, freePoints:0, wins:0, losses:0, battles:0};
const DISTRICTS = [
  {id:'square',name:'Центральная площадь',level:1,cost:0,icon:'🏰'},
  {id:'forest',name:'Северный лес',level:3,cost:3,icon:'🌲'},
  {id:'harbor',name:'Порт Sdolars',level:8,cost:5,icon:'⚓'},
  {id:'industrial',name:'Промзона',level:12,cost:7,icon:'🏭'},
  {id:'fortress',name:'Старая крепость',level:18,cost:10,icon:'🏛️'}
];
const ADVENTURE_QUESTS = [
  {id:'forest_patrol',district:'forest',name:'Патруль Северного леса',goal:3,reward:180,xp:45,energy:8},
  {id:'harbor_run',district:'harbor',name:'Контрабандисты порта',goal:5,reward:320,xp:80,energy:12},
  {id:'industrial_raid',district:'industrial',name:'Рейд на промзону',goal:7,reward:520,xp:120,energy:16},
  {id:'fortress_siege',district:'fortress',name:'Штурм старой крепости',goal:10,reward:900,xp:220,energy:22}
];
const ENEMIES = [
  {name:'Уличный боец',hp:90,damage:8,def:3,reward:90,xp:25},
  {name:'Наёмник',hp:125,damage:11,def:6,reward:130,xp:35},
  {name:'Ледяной тролль',hp:170,damage:14,def:9,reward:200,xp:50},
  {name:'Арена чемпион',hp:230,damage:18,def:12,reward:320,xp:80}
];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,Authorization,X-Telegram-Init-Data'}})}
function cleanId(v){return String(v??'').replace(/[^a-zA-Z0-9_:@.-]/g,'').slice(0,120)}
function safeName(v){return String(v??'Игрок').replace(/[<>]/g,'').slice(0,MAX_NAME)||'Игрок'}
function validMove(m){const attack=Number(m.attack),defs=Array.isArray(m.defs)?m.defs.map(Number):[];return Number.isInteger(attack)&&ATTACK_ZONES.includes(attack)&&defs.length===2&&defs[0]!==defs[1]&&defs.every(x=>Number.isInteger(x)&&ZONES.includes(x))}
function esc(s){return String(s??'').replace(/[<>]/g,'')}

async function hmacHex(keyBytes,data){const key=await crypto.subtle.importKey('raw',keyBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(data));return [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function telegramAuth(initData,botToken,maxAge=86400){
  if(!initData||!botToken)return null;
  const p=new URLSearchParams(initData), hash=p.get('hash'); if(!hash)return null;
  const authDate=Number(p.get('auth_date')||0); if(!authDate||Date.now()/1000-authDate>maxAge)return null;
  p.delete('hash'); const dataCheck=[...p.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n');
  const secretBuf=await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',new TextEncoder().encode('WebAppData'),{name:'HMAC',hash:'SHA-256'},false,['sign']),new TextEncoder().encode(botToken));
  const calc=await hmacHex(secretBuf,dataCheck); if(calc!==hash)return null;
  let user; try{user=JSON.parse(p.get('user')||'{}')}catch{return null}
  if(!user?.id)return null;
  return {playerId:'tg_'+String(user.id),name:safeName([user.first_name,user.last_name].filter(Boolean).join(' ')||user.username||'Игрок'),telegramId:String(user.id),username:safeName(user.username||'')};
}
async function authRequest(request,env){
  const init=request.headers.get('X-Telegram-Init-Data')||new URL(request.url).searchParams.get('initData');
  if(env.TELEGRAM_BOT_TOKEN){return telegramAuth(init,env.TELEGRAM_BOT_TOKEN)}
  /* Development/test fallback: if Telegram bot secret is not configured,
     keep the game playable on Cloudflare using a stable guest id.
     Telegram authentication becomes authoritative automatically once
     TELEGRAM_BOT_TOKEN is added as a Worker secret. */
  {
    const gid=cleanId(request.headers.get('X-Guest-Id')||'guest_'+(crypto.randomUUID?.()||Math.random().toString(36).slice(2)));
    return {playerId:gid,name:safeName(request.headers.get('X-Guest-Name')||'Игрок'),telegramId:null,username:'',guest:true};
  }
  return null;
}
function sanitizedSeed(seed,auth){
  const s=seed&&typeof seed==='object'?seed:{};
  const items=Array.isArray(s.items)?s.items.slice(0,80).map(x=>({id:String(x.id||''),name:safeName(x.name||'Предмет'),type:safeName(x.type||'Предмет'),icon:String(x.icon||'🎒').slice(0,8),damage:Math.min(100,Math.max(0,Number(x.damage)||0)),defense:Math.min(100,Math.max(0,Number(x.defense)||0)),qty:Math.min(99,Math.max(1,Number(x.qty)||1)),equipped:!!x.equipped})):[];
  return {playerName:auth.name,coins:Math.min(5000,Math.max(0,Number(s.coins)||START.coins)),gems:Math.min(5000,Math.max(0,Number(s.gems)||START.gems)),energy:Math.min(500,Math.max(0,Number(s.energy)||START.energy)),hp:Math.min(START.maxHp,Math.max(1,Number(s.hp)||START.hp)),maxHp:Math.min(500,Math.max(100,Number(s.maxHp)||START.maxHp)),level:Math.min(50,Math.max(1,Number(s.level)||START.level)),exp:Math.min(9999,Math.max(0,Number(s.exp)||START.exp)),maxExp:Math.min(9999,Math.max(100,Number(s.maxExp)||START.maxExp)),strength:Math.min(100,Math.max(1,Number(s.strength)||START.strength)),agility:Math.min(100,Math.max(1,Number(s.agility)||START.agility)),freePoints:Math.min(100,Math.max(0,Number(s.freePoints)||0)),wins:Math.min(99999,Math.max(0,Number(s.wins)||0)),losses:Math.min(99999,Math.max(0,Number(s.losses)||0)),battles:Math.min(99999,Math.max(0,Number(s.battles)||0)),items,lang:s.lang==='EN'?'EN':'RU',questDone:!!s.questDone,bonusClaimed:!!s.bonusClaimed,dailyStreak:Math.min(365,Math.max(0,Number(s.dailyStreak)||0)),dailyLast:String(s.dailyLast||''),eventProgress:Math.min(100,Math.max(0,Number(s.eventProgress)||0)),recruited:Array.isArray(s.recruited)?s.recruited.slice(0,20).map(x=>safeName(x)):[],guildId:s.guildId?safeName(s.guildId):'',guildName:s.guildName?safeName(s.guildName):'',guildMembers:Math.min(100,Math.max(1,Number(s.guildMembers)||1)),rating:Math.min(5000,Math.max(0,Number(s.rating)||1000)),achievements:Array.isArray(s.achievements)?s.achievements.slice(0,50).map(x=>safeName(x)):[],mail:Array.isArray(s.mail)?s.mail.slice(0,30):[],district:String(s.district||'square'),completedQuests:Array.isArray(s.completedQuests)?s.completedQuests.slice(0,50):[],activeQuest:s.activeQuest&&typeof s.activeQuest==='object'?s.activeQuest:null,heroes:Array.isArray(s.heroes)?s.heroes.slice(0,20):[],forgeLevel:Math.min(20,Math.max(0,Number(s.forgeLevel)||0)),materials:{iron:3,wood:2,leather:2,herbs:2},dailyMissions:null,season:{id:new Date().toISOString().slice(0,7),rating:Math.min(5000,Math.max(0,Number(s.rating)||1000)),bestRating:Math.min(5000,Math.max(0,Number(s.rating)||1000)),wins:0},lastEnergyAt:Number(s.lastEnergyAt)||Date.now()};
}

const INDEX_HTML = '<!doctype html><html><head><meta charset="utf-8"><title>Territory — Sdolars</title></head><body><h1>Territory — Sdolars</h1><p>Static asset index.html was not loaded.</p></body></html>';

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Telegram-Init-Data,X-Guest-Id,X-Guest-Name'}});
    if(url.pathname==='/api/health')return json({ok:true,service:'Territory Sdolars',version:'s88-fixed',serverTime:Date.now(),telegramAuth:!!env.TELEGRAM_BOT_TOKEN});
    if(url.pathname==='/api/auth'&&request.method==='POST'){
      const auth=await authRequest(request,env); if(!auth)return json({ok:false,error:'telegram_auth_required'},401);
      const id=env.GAME_HUB.idFromName('main'); return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/auth',request.url),{method:'POST',headers:{'content-type':'application/json','x-player-id':auth.playerId,'x-player-name':auth.name,'x-telegram-id':auth.telegramId||''},body:JSON.stringify({seed:await request.json().catch(()=>null),auth})}));
    }
    if((url.pathname.startsWith('/api/player/')) && (request.method==='GET' || request.method==='POST')){
      const auth=await authRequest(request,env);if(!auth)return json({ok:false,error:'auth_required'},401);
      const requested=cleanId(decodeURIComponent(url.pathname.slice('/api/player/'.length)));
      /* Only allow the authenticated player id; never let a client read another player. */
      if(requested && requested!==auth.playerId)return json({ok:false,error:'forbidden'},403);
      const id=env.GAME_HUB.idFromName('main');
      if(request.method==='GET')return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/me',request.url),{headers:{'x-player-id':auth.playerId,'x-player-name':auth.name}}));
      const body=await request.text();
      return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/auth',request.url),{method:'POST',headers:{'content-type':'application/json','x-player-id':auth.playerId,'x-player-name':auth.name,'x-telegram-id':auth.telegramId||''},body}));
    }
    if(url.pathname==='/api/me'&&request.method==='GET'){
      const auth=await authRequest(request,env);if(!auth)return json({ok:false,error:'telegram_auth_required'},401);
      const id=env.GAME_HUB.idFromName('main');return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/me',request.url),{headers:{'x-player-id':auth.playerId,'x-player-name':auth.name}}));
    }
    if(url.pathname==='/api/action'&&request.method==='POST'){
      const auth=await authRequest(request,env);if(!auth)return json({ok:false,error:'telegram_auth_required'},401);
      const id=env.GAME_HUB.idFromName('main');return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/action',request.url),{method:'POST',headers:{'content-type':'application/json','x-player-id':auth.playerId,'x-player-name':auth.name},body:await request.text()}));
    }
    if(url.pathname==='/ws'){
      if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Expected WebSocket',{status:426});
      const auth=await authRequest(request,env);if(!auth)return new Response('Telegram authentication required',{status:401});
      const id=env.GAME_HUB.idFromName('main');
      const h=new Headers(request.headers);h.set('x-player-id',auth.playerId);h.set('x-player-name',auth.name);h.set('x-telegram-id',auth.telegramId||'');
      return env.GAME_HUB.get(id).fetch(new Request(request.url,{method:'GET',headers:h}));
    }
    if(url.pathname==='/api/players'&&request.method==='GET'){
      const id=env.GAME_HUB.idFromName('main');return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/players',request.url),request));
    }
    if(url.pathname==='/api/leaderboard'&&request.method==='GET'){
      const id=env.GAME_HUB.idFromName('main');return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/leaderboard',request.url),request));
    }
    if(url.pathname==='/' || url.pathname==='/index.html'){if(env.ASSETS)return env.ASSETS.fetch(new Request(new URL('/index.html',request.url)));return new Response(INDEX_HTML,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});}
    return new Response('Not found',{status:404});
  }
};

export class GameHub extends DurableObject {
  constructor(ctx,env){super(ctx,env);this.ctx=ctx;this.env=env;this.sql=ctx.storage.sql;this.sql.exec(`CREATE TABLE IF NOT EXISTS players (player_id TEXT PRIMARY KEY,name TEXT NOT NULL,state_json TEXT NOT NULL,updated_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS guilds (guild_id TEXT PRIMARY KEY,name TEXT NOT NULL,owner_id TEXT NOT NULL,created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS guild_members (guild_id TEXT NOT NULL,player_id TEXT NOT NULL,role TEXT NOT NULL,PRIMARY KEY(guild_id,player_id));`);this.matches=new Map();this.pending=new Map();this.pveBattles=new Map()}
  sockets(){return this.ctx.getWebSockets()}
  attachment(ws){return ws.deserializeAttachment?.()||null}
  ensureMeta(s){
    const day=new Date().toISOString().slice(0,10);
    if(!s.materials||typeof s.materials!=='object')s.materials={iron:3,wood:2,leather:2,herbs:2};
    else {for(const k of ['iron','wood','leather','herbs'])s.materials[k]=Math.max(0,Math.min(999,Number(s.materials[k])||0))}
    if(!s.dailyMissions||s.dailyMissions.day!==day){
      const n=(new Date().getUTCDate()%3);
      const sets=[
        [{id:'wins',goal:3,progress:0,reward:180,xp:35},{id:'scout',goal:2,progress:0,reward:120,xp:25},{id:'forge',goal:1,progress:0,reward:220,xp:45}],
        [{id:'wins',goal:5,progress:0,reward:260,xp:55},{id:'scout',goal:3,progress:0,reward:180,xp:35},{id:'forge',goal:1,progress:0,reward:240,xp:50}],
        [{id:'wins',goal:4,progress:0,reward:220,xp:45},{id:'scout',goal:4,progress:0,reward:210,xp:40},{id:'forge',goal:2,progress:0,reward:320,xp:70}]
      ];
      s.dailyMissions={day,items:sets[n].map(x=>({...x,claimed:false}))};
    }
    s.season=s.season&&typeof s.season==='object'?s.season:{id:day.slice(0,7),rating:Number(s.rating)||1000,bestRating:Number(s.rating)||1000,wins:0};
    s.season.rating=Number(s.rating)||Number(s.season.rating)||1000;
    s.season.bestRating=Math.max(Number(s.season.bestRating)||0,s.season.rating);
    return s;
  }
  send(ws,o){if(!ws)return;try{ws.send(JSON.stringify(o))}catch{}}
  online(){return this.sockets().map(ws=>this.attachment(ws)).filter(x=>x?.playerId).map(x=>({playerId:x.playerId,name:x.name}))}
  broadcastOnline(){const list=this.online();for(const ws of this.sockets())this.send(ws,{type:'online',players:list,names:list.map(x=>x.name)})}
  socketByPlayer(pid){return this.sockets().find(ws=>this.attachment(ws)?.playerId===pid)||null}
  getState(pid){const row=this.sql.exec('SELECT state_json FROM players WHERE player_id=?',pid).one();if(!row?.state_json)return null;let s;try{s=JSON.parse(row.state_json)}catch{return null}s=this.ensureMeta(s);const now=Date.now(),last=Number(s.lastEnergyAt)||now;const gain=Math.floor((now-last)/300000);if(gain>0){s.energy=Math.min(200,(Number(s.energy)||0)+gain);s.lastEnergyAt=last+gain*300000}return s}
  putState(pid,name,state){const now=Date.now();state.playerName=name;state._serverUpdatedAt=now;this.sql.exec('INSERT INTO players(player_id,name,state_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(player_id) DO UPDATE SET name=excluded.name,state_json=excluded.state_json,updated_at=excluded.updated_at',pid,name,JSON.stringify(state),now);return state}
  async fetch(request){const url=new URL(request.url),pid=cleanId(request.headers.get('x-player-id')),name=safeName(request.headers.get('x-player-name')||'Игрок');
    if(url.pathname==='/hub/players')return json({ok:true,players:this.online()});
    if(url.pathname==='/hub/leaderboard'){const rows=this.sql.exec('SELECT name,state_json FROM players ORDER BY updated_at DESC LIMIT 100').toArray().map(r=>{let x={};try{x=JSON.parse(r.state_json)}catch{}return {name:r.name,rating:Number(x.rating)||1000,wins:Number(x.wins)||0,level:Number(x.level)||1}}).sort((a,b)=>b.rating-a.rating||b.wins-a.wins).slice(0,20);return json({ok:true,players:rows})}
    if(url.pathname==='/hub/auth'&&request.method==='POST'){const body=await request.json().catch(()=>({}));let state=this.getState(pid);const firstLogin=!state;if(firstLogin){state=sanitizedSeed(body.seed?.state||body.seed,{name});state=this.putState(pid,name,state)}else{state.playerName=name;state=this.putState(pid,name,state)}return json({ok:true,player:state,playerId:pid,firstLogin});}
    if(url.pathname==='/hub/me'&&request.method==='GET'){const state=this.getState(pid);return json({ok:true,authenticated:!!pid,player:state||null,online:this.online()});}
    if(url.pathname==='/hub/action'&&request.method==='POST')return this.action(pid,name,await request.json().catch(()=>({})));
    if(url.pathname==='/ws'){const pair=new WebSocketPair(),client=pair[0],server=pair[1];if(!pid)return new Response('Unauthorized',{status:401});this.ctx.acceptWebSocket(server);server.serializeAttachment({playerId:pid,name});this.putState(pid,name,this.getState(pid)||{...START,playerName:name,items:[],lang:'RU'});this.send(server,{type:'hello.ok',playerId:pid,name});this.broadcastOnline();return new Response(null,{status:101,webSocket:client})}
    return new Response('not found',{status:404});
  }
  action(pid,name,a){let s=this.getState(pid);if(!s)return json({ok:false,error:'player_not_initialized'},400);const type=String(a.type||'');
    if(type==='battle.start'){
      const existing=[...this.pveBattles.values()].find(x=>x.playerId===pid&&!x.done);
      if(existing)return json({ok:true,player:s,battle:{id:existing.id,enemy:existing.enemy,enemyIndex:existing.enemyIndex,playerHp:existing.playerHp,maxPlayerHp:existing.maxPlayerHp,enemyHp:existing.enemyHp,turn:existing.turn}});
      const idx=Math.min(ENEMIES.length-1,Math.floor((s.wins||0)/3)),e=ENEMIES[idx];
      const id='pve_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
      const b={id,playerId:pid,enemyIndex:idx,enemy:e,playerHp:Math.min(Number(s.hp)||s.maxHp,s.maxHp),maxPlayerHp:s.maxHp,enemyHp:e.hp,turn:1,done:false,createdAt:Date.now()};
      this.pveBattles.set(id,b);
      return json({ok:true,player:s,battle:{id,enemy:e,enemyIndex:idx,playerHp:b.playerHp,maxPlayerHp:b.maxPlayerHp,enemyHp:b.enemyHp,turn:1}});
    }
    if(type==='battle.move'){
      const id=safeName(a.battleId||''),b=this.pveBattles.get(id);
      if(!b||b.playerId!==pid||b.done)return json({ok:false,error:'battle_not_found'},404);
      if(Date.now()-b.createdAt>30*60*1000){this.pveBattles.delete(id);return json({ok:false,error:'battle_expired'},410)}
      const attack=Number(a.attack),defs=Array.isArray(a.defs)?a.defs.map(Number):[];
      if(!Number.isInteger(attack)||!ZONES.includes(attack)||defs.length!==2||defs[0]===defs[1]||!defs.every(x=>Number.isInteger(x)&&ZONES.includes(x)))return json({ok:false,error:'invalid_move'},400);
      const enemyAttack=Math.floor(Math.random()*4),enemyDefs=[];while(enemyDefs.length<2){const x=Math.floor(Math.random()*4);if(!enemyDefs.includes(x))enemyDefs.push(x)}
      const weapon=(s.items||[]).find(x=>x.equipped&&x.type==='Оружие'),armor=(s.items||[]).find(x=>x.equipped&&x.type==='Броня');
      const totalDamage=15+(weapon?.damage||0)+Math.floor((s.strength||0)*.7),totalDefense=(armor?.defense||0)+Math.floor((s.agility||0)*.35);
      const hit=!enemyDefs.includes(attack),crit=hit&&Math.random()<Math.min(.45,.06+(s.strength||0)*.012),dodge=Math.random()<Math.min(.35,.03+(s.agility||0)*.012);
      const playerDamage=hit?(crit?Math.round(totalDamage*1.5):totalDamage):0,blocked=defs.includes(enemyAttack),enemyDamage=blocked||dodge?0:Math.max(1,b.enemy.damage+Math.floor(Math.random()*4)-Math.floor(totalDefense*.35));
      b.enemyHp=Math.max(0,b.enemyHp-playerDamage);b.playerHp=Math.max(0,b.playerHp-enemyDamage);b.turn++;
      let result='continue';if(b.enemyHp<=0)result='win';else if(b.playerHp<=0)result='loss';
      if(result==='win'){b.done=true;s.coins+=b.enemy.reward;s.exp+=b.enemy.xp;s.wins++;s.battles++;s.hp=s.maxHp;const wm=s.dailyMissions?.items?.find(x=>x.id==='wins');if(wm)wm.progress=Math.min(wm.goal,(wm.progress||0)+1);this.level(s);this.putState(pid,name,s);this.pveBattles.delete(id)}
      else if(result==='loss'){b.done=true;s.losses++;s.battles++;s.hp=Math.max(1,Math.round(s.maxHp*.35));this.putState(pid,name,s);this.pveBattles.delete(id)}
      else{this.putState(pid,name,{...s,hp:b.playerHp})}
      return json({ok:true,player:s,battle:{id,turn:b.turn,enemyHp:b.enemyHp,playerHp:b.playerHp,enemyAttack,enemyDefs,attack,defs,hit,crit,dodge,blocked,playerDamage,enemyDamage,result,reward:result==='win'?{coins:b.enemy.reward,xp:b.enemy.xp}:null}});
    }
    if(type==='battle.reward'){const idx=Math.min(ENEMIES.length-1,Math.floor((s.wins||0)/3)),e=ENEMIES[idx];s.coins+=e.reward;s.exp+=e.xp;s.wins++;s.battles++;s.hp=s.maxHp;const wm=s.dailyMissions?.items?.find(x=>x.id==='wins');if(wm)wm.progress=Math.min(wm.goal,(wm.progress||0)+1);while(s.exp>=s.maxExp){s.exp-=s.maxExp;s.level++;s.maxExp=Math.round(s.maxExp*1.25);s.maxHp+=8;s.hp=s.maxHp;s.freePoints+=2}s=this.putState(pid,name,s);return json({ok:true,player:s,reward:{coins:e.reward,xp:e.xp}})}
    if(type==='battle.loss'){s.losses++;s.battles++;s.hp=Math.max(1,Math.round(s.maxHp*.35));s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='quest.complete'){if(s.questDone)return json({ok:false,error:'already_claimed'},409);s.questDone=true;s.coins+=150;s.exp+=80;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='bonus.claim'){if(s.bonusClaimed)return json({ok:false,error:'already_claimed'},409);s.bonusClaimed=true;s.coins+=250;s.exp+=20;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='stat.add'){const k=a.stat;if(!['strength','agility'].includes(k)||s.freePoints<=0)return json({ok:false,error:'invalid_stat'},400);s[k]++;s.freePoints--;s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='item.buy'){const catalog={knife:{name:'Нож',type:'Оружие',icon:'🔪',damage:6,price:220},heavyaxe:{name:'Тяжёлый топор',type:'Оружие',icon:'🪓',damage:18,price:700},steel:{name:'Стальная броня',type:'Броня',icon:'🛡️',defense:15,price:650},bandage:{name:'Аптечка',type:'Расходник',icon:'🩹',qty:1,price:80}};const c=catalog[a.item];if(!c||s.coins<c.price)return json({ok:false,error:'not_enough_or_unknown'},400);s.coins-=c.price;const old=(s.items||[]).find(x=>x.name===c.name);if(old&&c.qty)old.qty=(old.qty||0)+1;else s.items=[...(s.items||[]),{...c,id:c.name+'_'+Date.now(),equipped:false}];s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='item.use'){const i=Number(a.index),it=(s.items||[])[i];if(!it||it.name!=='Аптечка')return json({ok:false,error:'invalid_item'},400);s.hp=Math.min(s.maxHp,s.hp+30);it.qty--;if(it.qty<=0)s.items.splice(i,1);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='daily.claim'){const day=new Date().toISOString().slice(0,10);if(s.dailyLast===day)return json({ok:false,error:'already_claimed'},409);const y=new Date(Date.now()-86400000).toISOString().slice(0,10);s.dailyStreak=s.dailyLast===y?Math.min(365,(s.dailyStreak||0)+1):1;s.dailyLast=day;const reward=200+Math.min(1000,s.dailyStreak*50);s.coins+=reward;s.exp+=20+s.dailyStreak*5;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s,reward})}
    if(type==='event.fight'){if((s.energy||0)<5)return json({ok:false,error:'no_energy'},400);s.energy-=5;s.eventProgress=Math.min(100,(s.eventProgress||0)+1);s.coins+=80;s.exp+=20;s.wins++;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s,reward:{coins:80,xp:20},progress:s.eventProgress})}
    if(type==='tavern.recruit'){const roster={ragnar:{name:'Рагнар',cost:500,role:'Воин'},astrid:{name:'Астрид',cost:650,role:'Разведчица'},ulf:{name:'Ульф',cost:900,role:'Берсерк'}};const c=roster[String(a.hero||'')];if(!c||s.coins<c.cost)return json({ok:false,error:'not_enough_or_unknown'},400);s.recruited=s.recruited||[];if(s.recruited.includes(c.name))return json({ok:false,error:'already_recruited'},409);s.coins-=c.cost;s.recruited.push(c.name);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='item.equip'){const i=Number(a.index),it=(s.items||[])[i];if(!it||it.type==='Расходник')return json({ok:false,error:'invalid_item'},400);s.items.forEach(x=>{if(x.type===it.type)x.equipped=false});it.equipped=true;s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='item.drop'){const i=Number(a.index),it=(s.items||[])[i];if(!it||it.equipped)return json({ok:false,error:'invalid_item'},400);if(it.qty>1)it.qty--;else s.items.splice(i,1);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='market.sell'){const i=Number(a.index),it=(s.items||[])[i];if(!it||it.equipped)return json({ok:false,error:'invalid_item'},400);const value=Math.max(10,Math.round((it.price||((it.damage||0)*80+(it.defense||0)*50+50))*0.45));if(it.qty>1)it.qty--;else s.items.splice(i,1);s.coins+=value;s=this.putState(pid,name,s);return json({ok:true,player:s,value})}
    if(type==='guild.create'){if(s.guildId)return json({ok:false,error:'already_in_guild'},409);const g='g_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);const gn=safeName(a.name||('Гильдия '+name)).slice(0,32);this.sql.exec('INSERT INTO guilds(guild_id,name,owner_id,created_at) VALUES(?,?,?,?)',g,gn,pid,Date.now());this.sql.exec('INSERT INTO guild_members(guild_id,player_id,role) VALUES(?,?,?)',g,pid,'owner');s.guildId=g;s.guildName=gn;s.guildMembers=1;s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='guild.join'){if(s.guildId)return json({ok:false,error:'already_in_guild'},409);const row=this.sql.exec('SELECT guild_id,name FROM guilds ORDER BY created_at DESC LIMIT 1').one();if(!row)return json({ok:false,error:'no_guild'},404);this.sql.exec('INSERT OR IGNORE INTO guild_members(guild_id,player_id,role) VALUES(?,?,?)',row.guild_id,pid,'member');s.guildId=row.guild_id;s.guildName=row.name;s.guildMembers=2;s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='guild.leave'){if(!s.guildId)return json({ok:false,error:'not_in_guild'},400);this.sql.exec('DELETE FROM guild_members WHERE guild_id=? AND player_id=?',s.guildId,pid);s.guildId='';s.guildName='';s.guildMembers=1;s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='mission.claim'){
      const id=safeName(a.id||'');const ms=s.dailyMissions?.items||[];const m=ms.find(x=>x.id===id);
      if(!m)return json({ok:false,error:'unknown_mission'},400);if(m.claimed)return json({ok:false,error:'already_claimed'},409);if(Number(m.progress||0)<Number(m.goal||0))return json({ok:false,error:'mission_locked'},400);
      m.claimed=true;s.coins+=Number(m.reward)||0;s.exp+=Number(m.xp)||0;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s,reward:{coins:m.reward,xp:m.xp}})
    }
    if(type==='craft'){
      const recipes={
        sharpened_axe:{name:'Заточённый топор',type:'Оружие',icon:'🪓',damage:26,cost:500,need:{iron:3,wood:2}},
        hunter_armor:{name:'Охотничья броня',type:'Броня',icon:'🥋',defense:22,cost:450,need:{iron:2,leather:3}},
        medkit_pack:{name:'Большая аптечка',type:'Расходник',icon:'🩹',qty:2,cost:120,need:{herbs:2}}
      };
      const r=recipes[String(a.recipe||'')];if(!r)return json({ok:false,error:'unknown_recipe'},400);s.materials=s.materials||{};
      if(s.coins<r.cost)return json({ok:false,error:'not_enough_coins'},400);for(const [k,v] of Object.entries(r.need))if((s.materials[k]||0)<v)return json({ok:false,error:'not_enough_materials',material:k},400);
      s.coins-=r.cost;for(const [k,v] of Object.entries(r.need))s.materials[k]-=v;const old=(s.items||[]).find(x=>x.name===r.name);if(old&&r.qty)old.qty=(old.qty||0)+r.qty;else s.items=[...(s.items||[]),{...r,id:r.name+'_'+Date.now(),equipped:false}];s=this.putState(pid,name,s);return json({ok:true,player:s})
    }
    if(type==='guild.contribute'){
      const amount=Math.max(10,Math.min(1000,Math.floor(Number(a.amount)||0)));if(!s.guildId)return json({ok:false,error:'not_in_guild'},400);if(s.coins<amount)return json({ok:false,error:'not_enough_coins'},400);s.coins-=amount;s.guildContribution=(Number(s.guildContribution)||0)+amount;s.guildLevel=Math.min(20,1+Math.floor((s.guildContribution||0)/1000));s=this.putState(pid,name,s);return json({ok:true,player:s,contributed:amount})
    }
    if(type==='achievement.claim'){const id=safeName(a.id||'');s.achievements=s.achievements||[];if(s.achievements.includes(id))return json({ok:false,error:'already_claimed'},409);const rewards={first_win:[100,20],ten_wins:[500,80],rich:[1000,100],rating1500:[800,120]};const r=rewards[id];if(!r)return json({ok:false,error:'unknown_achievement'},400);if(id==='first_win'&&(s.wins||0)<1)return json({ok:false,error:'locked'},400);if(id==='ten_wins'&&(s.wins||0)<10)return json({ok:false,error:'locked'},400);if(id==='rich'&&(s.coins||0)<2000)return json({ok:false,error:'locked'},400);if(id==='rating1500'&&(s.rating||1000)<1500)return json({ok:false,error:'locked'},400);s.achievements.push(id);s.coins+=r[0];s.exp+=r[1];s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='district.travel'){const d=DISTRICTS.find(x=>x.id===String(a.id||''));if(!d)return json({ok:false,error:'unknown_district'},400);if((s.level||1)<d.level)return json({ok:false,error:'level_locked',level:d.level},400);const cost=Number(d.cost)||0;if((s.energy||0)<cost)return json({ok:false,error:'no_energy'},400);s.energy-=cost;s.district=d.id;s.lastEnergyAt=Date.now();s=this.putState(pid,name,s);return json({ok:true,player:s,district:d})}
    if(type==='quest.start'){const q=ADVENTURE_QUESTS.find(x=>x.id===String(a.id||''));if(!q)return json({ok:false,error:'unknown_quest'},400);if(s.activeQuest)return json({ok:false,error:'quest_active'},409);if((s.level||1)<(DISTRICTS.find(d=>d.id===q.district)?.level||1))return json({ok:false,error:'district_locked'},400);s.activeQuest={id:q.id,progress:0,startedAt:Date.now()};s=this.putState(pid,name,s);return json({ok:true,player:s,quest:q})}
    if(type==='quest.progress'){const aq=s.activeQuest;if(!aq)return json({ok:false,error:'no_active_quest'},400);const q=ADVENTURE_QUESTS.find(x=>x.id===aq.id);if(!q)return json({ok:false,error:'unknown_quest'},400);const n=Math.max(1,Math.min(3,Number(a.amount)||1));if((s.energy||0)<n)return json({ok:false,error:'no_energy'},400);s.energy-=n;aq.progress=Math.min(q.goal,(aq.progress||0)+n);s.activeQuest=aq;s.lastEnergyAt=Date.now();s=this.putState(pid,name,s);return json({ok:true,player:s,quest:q})}
    if(type==='quest.claim'){const aq=s.activeQuest;if(!aq)return json({ok:false,error:'no_active_quest'},400);const q=ADVENTURE_QUESTS.find(x=>x.id===aq.id);if(!q||Number(aq.progress||0)<q.goal)return json({ok:false,error:'quest_not_ready'},400);s.coins+=q.reward;s.exp+=q.xp;s.completedQuests=s.completedQuests||[];if(!s.completedQuests.includes(q.id))s.completedQuests.push(q.id);s.activeQuest=null;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s,reward:{coins:q.reward,xp:q.xp}})}
    if(type==='scout'){const d=DISTRICTS.find(x=>x.id===String(s.district||'square'))||DISTRICTS[0];const cost=2;if((s.energy||0)<cost)return json({ok:false,error:'no_energy'},400);s.energy-=cost;s.exp+=10;s.coins+=25+Math.floor((s.level||1)*5);const sm=s.dailyMissions?.items?.find(x=>x.id==='scout');if(sm)sm.progress=Math.min(sm.goal,(sm.progress||0)+1);s.lastEnergyAt=Date.now();s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s,district:d.id,reward:{coins:25+Math.floor((s.level||1)*5),xp:10}})}
    if(type==='hero.train'){const id=safeName(a.id||'');s.heroes=s.heroes||[];const h=s.heroes.find(x=>x.id===id);if(!h||s.coins<250)return json({ok:false,error:'cannot_train'},400);s.coins-=250;h.level=Math.min(20,(h.level||1)+1);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='forge.upgrade'){const w=(s.items||[]).find(x=>x.equipped&&x.type==='Оружие');const cost=250+((s.forgeLevel||0)*100);if(!w||s.coins<cost)return json({ok:false,error:'cannot_upgrade',cost},400);s.coins-=cost;w.damage=Math.min(100,(w.damage||0)+4);s.forgeLevel=(s.forgeLevel||0)+1;const fm=s.dailyMissions?.items?.find(x=>x.id==='forge');if(fm)fm.progress=Math.min(fm.goal,(fm.progress||0)+1);s=this.putState(pid,name,s);return json({ok:true,player:s,cost})}
    if(type==='resource.gather'){
      const cost=3;if((s.energy||0)<cost)return json({ok:false,error:'no_energy'},400);
      s.energy-=cost;s.materials=s.materials||{iron:0,wood:0,leather:0,herbs:0};
      const keys=['iron','wood','leather','herbs'];const key=keys[Math.floor(Math.random()*keys.length)];const amount=2+Math.floor(Math.random()*4);s.materials[key]=(s.materials[key]||0)+amount;
      s.exp+=15;const sm=s.dailyMissions?.items?.find(x=>x.id==='scout');if(sm)sm.progress=Math.min(sm.goal,(sm.progress||0)+1);s.lastEnergyAt=Date.now();s=this.level(s);s=this.putState(pid,name,s);
      return json({ok:true,player:s,reward:{material:key,amount,xp:15}})
    }
    if(type==='rest'){
      const cost=75;if((s.coins||0)<cost)return json({ok:false,error:'not_enough_coins'},400);
      const heal=Math.max(1,Math.ceil((s.maxHp||120)*.5));s.coins-=cost;s.hp=Math.min(s.maxHp,(s.hp||1)+heal);s=this.putState(pid,name,s);return json({ok:true,player:s,heal})
    }
    if(type==='season.claim'){
      const month=new Date().toISOString().slice(0,7);s.season=s.season||{};if(s.season.claimed===month)return json({ok:false,error:'already_claimed'},409);
      const rating=Number(s.rating||1000);if(rating<1200)return json({ok:false,error:'rating_locked'},400);const reward=Math.min(2500,300+Math.floor(rating/10));s.coins+=reward;s.exp+=100;s.season.claimed=month;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s,reward})
    }
    return json({ok:false,error:'unknown_action'},400);
  }
  level(s){while(s.exp>=s.maxExp){s.exp-=s.maxExp;s.level++;s.maxExp=Math.round(s.maxExp*1.25);s.maxHp+=8;s.hp=s.maxHp;s.freePoints+=2}return s}
  async webSocketMessage(ws,message){let m;try{m=JSON.parse(typeof message==='string'?message:new TextDecoder().decode(message))}catch{return}const meta=this.attachment(ws)||{};if(m.type==='hello'){this.send(ws,{type:'hello.ok',playerId:meta.playerId,name:meta.name});this.broadcastOnline();return}if(!meta.playerId)return;
    if(m.type==='message'){const msg={name:meta.name,text:esc(m.message?.text).slice(0,180),time:String(m.message?.time||''),online:true};for(const c of this.sockets())this.send(c,{type:'message',room:m.room==='clan'?'clan':'global',message:msg});return}
    if(m.type==='pvp.challenge'){const target=cleanId(m.target),to=this.socketByPlayer(target);if(to&&target!==meta.playerId){this.pending.set(target,{from:meta.playerId,to:target});this.send(to,{type:'pvp.challenge',from:meta.playerId,name:meta.name})}return}
    if(m.type==='pvp.accept'){const from=cleanId(m.from),challenger=this.socketByPlayer(from);if(challenger){const a=this.attachment(challenger);this.pending.delete(meta.playerId);this.startMatch(a,meta,challenger,ws)}return}
    if(m.type==='pvp.move'){const match=this.matches.get(String(m.matchId||''));if(!match||!validMove(m))return;if(meta.playerId!==match.a.playerId&&meta.playerId!==match.b.playerId)return;if(match.choices[meta.playerId])return;match.choices[meta.playerId]={attack:Number(m.attack),defs:m.defs.map(Number)};this.send(ws,{type:'pvp.waiting'});if(match.choices[match.a.playerId]&&match.choices[match.b.playerId])this.resolve(match)}
  }
  startMatch(a,b,aw,bw){const id='m_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),m={id,a,b,turn:1,hp:{[a.playerId]:100,[b.playerId]:100},choices:{},aw,bw};this.matches.set(id,m);this.send(aw,{type:'pvp.start',matchId:id,turn:1,opponent:b.name,opponentPlayerId:b.playerId});this.send(bw,{type:'pvp.start',matchId:id,turn:1,opponent:a.name,opponentPlayerId:a.playerId})}
  resolve(m){const A=m.choices[m.a.playerId],B=m.choices[m.b.playerId],sa=this.getState(m.a.playerId)||START,sb=this.getState(m.b.playerId)||START;const hitA=!B.defs.includes(A.attack),hitB=!A.defs.includes(B.attack);const critA=Math.random()<Math.min(.5,(sa.strength||0)/100),critB=Math.random()<Math.min(.5,(sb.strength||0)/100);const dodgeA=Math.random()<Math.min(.35,(sa.agility||0)/100),dodgeB=Math.random()<Math.min(.35,(sb.agility||0)/100);const baseA=10+Math.floor((sa.strength||0)*.7),baseB=10+Math.floor((sb.strength||0)*.7);const dmgA=hitA&&!dodgeB?(critA?Math.round(baseA*1.8):baseA):0,dmgB=hitB&&!dodgeA?(critB?Math.round(baseB*1.8):baseB):0;m.hp[m.a.playerId]=Math.max(0,m.hp[m.a.playerId]-dmgB);m.hp[m.b.playerId]=Math.max(0,m.hp[m.b.playerId]-dmgA);let winner=null;if(!m.hp[m.a.playerId]&&!m.hp[m.b.playerId])winner='draw';else if(!m.hp[m.a.playerId])winner=m.b.playerId;else if(!m.hp[m.b.playerId])winner=m.a.playerId;this.send(m.aw,{type:'pvp.result',matchId:m.id,turn:m.turn,dmgYou:dmgA,dmgOpponent:dmgB,yourHp:m.hp[m.a.playerId],opponentHp:m.hp[m.b.playerId],winner,critYou:critA,dodgeOpponent:dodgeB});this.send(m.bw,{type:'pvp.result',matchId:m.id,turn:m.turn,dmgYou:dmgB,dmgOpponent:dmgA,yourHp:m.hp[m.b.playerId],opponentHp:m.hp[m.a.playerId],winner,critYou:critB,dodgeOpponent:dodgeA});if(winner){const winnerPid=winner==='draw'?null:winner;for(const pid of [m.a.playerId,m.b.playerId]){const s=this.getState(pid);if(s){s.battles++;if(winner==='draw'){s.hp=s.maxHp}else if(pid===winnerPid){s.wins++;s.coins+=100;s.exp+=30;s.hp=s.maxHp;s.rating=Math.min(5000,(Number(s.rating)||1000)+25);s.season=this.ensureMeta(s).season;s.season.rating=s.rating;s.season.bestRating=Math.max(s.season.bestRating||0,s.rating);s.season.wins=(s.season.wins||0)+1;this.level(s)}else{s.losses++;s.hp=Math.max(1,Math.round(s.maxHp*.35));s.rating=Math.max(0,(Number(s.rating)||1000)-18);s.season=this.ensureMeta(s).season;s.season.rating=s.rating}this.putState(pid,pid===m.a.playerId?m.a.name:m.b.name,s)}}this.matches.delete(m.id)}else{m.turn++;m.choices={}}}
  async webSocketClose(ws){const meta=this.attachment(ws);if(!meta?.playerId)return;for(const [id,m] of this.matches){if(m.a.playerId===meta.playerId||m.b.playerId===meta.playerId){const other=m.a.playerId===meta.playerId?m.b:m.a;this.send(this.socketByPlayer(other.playerId),{type:'pvp.end',reason:'opponent_offline'});this.matches.delete(id)}}this.broadcastOnline()}
  async webSocketError(ws){await this.webSocketClose(ws)}
}
