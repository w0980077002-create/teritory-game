import { DurableObject } from "cloudflare:workers";

const MAX_STATE_BYTES = 900_000;
const ZONES = [0,1,2,3,4];
const MAX_NAME = 40;
const START = {coins:1779, gems:1330, energy:191.38, hp:120, maxHp:120, level:3, exp:120, maxExp:150, strength:12, agility:9, freePoints:0, wins:0, losses:0, battles:0};
const ENEMIES = [
  {name:'Уличный боец',hp:90,damage:8,def:3,reward:90,xp:25},
  {name:'Наёмник',hp:125,damage:11,def:6,reward:130,xp:35},
  {name:'Ледяной тролль',hp:170,damage:14,def:9,reward:200,xp:50},
  {name:'Арена чемпион',hp:230,damage:18,def:12,reward:320,xp:80}
];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-headers':'Content-Type,Authorization,X-Telegram-Init-Data'}})}
function cleanId(v){return String(v??'').replace(/[^a-zA-Z0-9_:@.-]/g,'').slice(0,120)}
function safeName(v){return String(v??'Игрок').replace(/[<>]/g,'').slice(0,MAX_NAME)||'Игрок'}
function validMove(m){const attack=Number(m.attack),defs=Array.isArray(m.defs)?m.defs.map(Number):[];return Number.isInteger(attack)&&ZONES.includes(attack)&&defs.length===2&&defs[0]!==defs[1]&&defs.every(x=>Number.isInteger(x)&&ZONES.includes(x))}
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
  if(env.ALLOW_GUESTS==='true'){
    const gid=cleanId(request.headers.get('X-Guest-Id')||'guest_'+(crypto.randomUUID?.()||Math.random().toString(36).slice(2)));
    return {playerId:gid,name:safeName(request.headers.get('X-Guest-Name')||'Гость'),telegramId:null,username:''};
  }
  return null;
}
function sanitizedSeed(seed,auth){
  const s=seed&&typeof seed==='object'?seed:{};
  const items=Array.isArray(s.items)?s.items.slice(0,80).map(x=>({id:String(x.id||''),name:safeName(x.name||'Предмет'),type:safeName(x.type||'Предмет'),icon:String(x.icon||'🎒').slice(0,8),damage:Math.min(100,Math.max(0,Number(x.damage)||0)),defense:Math.min(100,Math.max(0,Number(x.defense)||0)),qty:Math.min(99,Math.max(1,Number(x.qty)||1)),equipped:!!x.equipped})):[];
  return {playerName:auth.name,coins:Math.min(5000,Math.max(0,Number(s.coins)||START.coins)),gems:Math.min(5000,Math.max(0,Number(s.gems)||START.gems)),energy:Math.min(500,Math.max(0,Number(s.energy)||START.energy)),hp:Math.min(START.maxHp,Math.max(1,Number(s.hp)||START.hp)),maxHp:Math.min(500,Math.max(100,Number(s.maxHp)||START.maxHp)),level:Math.min(50,Math.max(1,Number(s.level)||START.level)),exp:Math.min(9999,Math.max(0,Number(s.exp)||START.exp)),maxExp:Math.min(9999,Math.max(100,Number(s.maxExp)||START.maxExp)),strength:Math.min(100,Math.max(1,Number(s.strength)||START.strength)),agility:Math.min(100,Math.max(1,Number(s.agility)||START.agility)),freePoints:Math.min(100,Math.max(0,Number(s.freePoints)||0)),wins:Math.min(99999,Math.max(0,Number(s.wins)||0)),losses:Math.min(99999,Math.max(0,Number(s.losses)||0)),battles:Math.min(99999,Math.max(0,Number(s.battles)||0)),items,lang:s.lang==='EN'?'EN':'RU',questDone:!!s.questDone,bonusClaimed:!!s.bonusClaimed,recruited:Array.isArray(s.recruited)?s.recruited.slice(0,20).map(x=>safeName(x)):[],guildMembers:Math.min(100,Math.max(1,Number(s.guildMembers)||1)};
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'Content-Type,Authorization,X-Telegram-Init-Data,X-Guest-Id,X-Guest-Name'}});
    if(url.pathname==='/api/health')return json({ok:true,service:'Territory Sdolars',version:'s29',serverTime:Date.now(),telegramAuth:!!env.TELEGRAM_BOT_TOKEN});
    if(url.pathname==='/api/auth'&&request.method==='POST'){
      const auth=await authRequest(request,env); if(!auth)return json({ok:false,error:'telegram_auth_required'},401);
      const id=env.GAME_HUB.idFromName('main'); return env.GAME_HUB.get(id).fetch(new Request(new URL('/hub/auth',request.url),{method:'POST',headers:{'content-type':'application/json','x-player-id':auth.playerId,'x-player-name':auth.name,'x-telegram-id':auth.telegramId||''},body:JSON.stringify({seed:await request.json().catch(()=>null),auth})}));
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
    return env.ASSETS.fetch(request);
  }
};

export class GameHub extends DurableObject {
  constructor(ctx,env){super(ctx,env);this.ctx=ctx;this.env=env;this.sql=ctx.storage.sql;this.sql.exec(`CREATE TABLE IF NOT EXISTS players (player_id TEXT PRIMARY KEY,name TEXT NOT NULL,state_json TEXT NOT NULL,updated_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS guilds (guild_id TEXT PRIMARY KEY,name TEXT NOT NULL,owner_id TEXT NOT NULL,created_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS guild_members (guild_id TEXT NOT NULL,player_id TEXT NOT NULL,role TEXT NOT NULL,PRIMARY KEY(guild_id,player_id));`);this.matches=new Map();this.pending=new Map()}
  sockets(){return this.ctx.getWebSockets()}
  attachment(ws){return ws.deserializeAttachment?.()||null}
  send(ws,o){if(!ws)return;try{ws.send(JSON.stringify(o))}catch{}}
  online(){return this.sockets().map(ws=>this.attachment(ws)).filter(x=>x?.playerId).map(x=>({playerId:x.playerId,name:x.name}))}
  broadcastOnline(){const list=this.online();for(const ws of this.sockets())this.send(ws,{type:'online',players:list,names:list.map(x=>x.name)})}
  socketByPlayer(pid){return this.sockets().find(ws=>this.attachment(ws)?.playerId===pid)||null}
  getState(pid){const row=this.sql.exec('SELECT state_json FROM players WHERE player_id=?',pid).one();return row?.state_json?JSON.parse(row.state_json):null}
  putState(pid,name,state){const now=Date.now();state.playerName=name;state._serverUpdatedAt=now;this.sql.exec('INSERT INTO players(player_id,name,state_json,updated_at) VALUES(?,?,?,?) ON CONFLICT(player_id) DO UPDATE SET name=excluded.name,state_json=excluded.state_json,updated_at=excluded.updated_at',pid,name,JSON.stringify(state),now);return state}
  async fetch(request){const url=new URL(request.url),pid=cleanId(request.headers.get('x-player-id')),name=safeName(request.headers.get('x-player-name')||'Игрок');
    if(url.pathname==='/hub/players')return json({ok:true,players:this.online()});
    if(url.pathname==='/hub/auth'&&request.method==='POST'){const body=await request.json().catch(()=>({}));let state=this.getState(pid);const firstLogin=!state;if(firstLogin){state=sanitizedSeed(body.seed?.state||body.seed,{name});state=this.putState(pid,name,state)}else{state.playerName=name;state=this.putState(pid,name,state)}return json({ok:true,player:state,playerId:pid,firstLogin});}
    if(url.pathname==='/hub/me'&&request.method==='GET'){const state=this.getState(pid);return json({ok:true,authenticated:!!pid,player:state||null,online:this.online()});}
    if(url.pathname==='/hub/action'&&request.method==='POST')return this.action(pid,name,await request.json().catch(()=>({})));
    if(url.pathname==='/ws'){const pair=new WebSocketPair(),client=pair[0],server=pair[1];if(!pid)return new Response('Unauthorized',{status:401});this.ctx.acceptWebSocket(server);server.serializeAttachment({playerId:pid,name});this.putState(pid,name,this.getState(pid)||{...START,playerName:name,items:[],lang:'RU'});this.send(server,{type:'hello.ok',playerId:pid,name});this.broadcastOnline();return new Response(null,{status:101,webSocket:client})}
    return new Response('not found',{status:404});
  }
  action(pid,name,a){let s=this.getState(pid);if(!s)return json({ok:false,error:'player_not_initialized'},400);const type=String(a.type||'');
    if(type==='battle.reward'){const idx=Math.min(ENEMIES.length-1,Math.floor((s.wins||0)/3)),e=ENEMIES[idx];s.coins+=e.reward;s.exp+=e.xp;s.wins++;s.battles++;s.hp=s.maxHp;while(s.exp>=s.maxExp){s.exp-=s.maxExp;s.level++;s.maxExp=Math.round(s.maxExp*1.25);s.maxHp+=8;s.hp=s.maxHp;s.freePoints+=2}s=this.putState(pid,name,s);return json({ok:true,player:s,reward:{coins:e.reward,xp:e.xp}})}
    if(type==='battle.loss'){s.losses++;s.battles++;s.hp=Math.max(1,Math.round(s.maxHp*.35));s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='quest.complete'){if(s.questDone)return json({ok:false,error:'already_claimed'},409);s.questDone=true;s.coins+=150;s.exp+=80;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='bonus.claim'){if(s.bonusClaimed)return json({ok:false,error:'already_claimed'},409);s.bonusClaimed=true;s.coins+=250;s.exp+=20;s=this.level(s);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='stat.add'){const k=a.stat;if(!['strength','agility'].includes(k)||s.freePoints<=0)return json({ok:false,error:'invalid_stat'},400);s[k]++;s.freePoints--;s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='item.buy'){const catalog={knife:{name:'Нож',type:'Оружие',icon:'🔪',damage:6,price:220},heavyaxe:{name:'Тяжёлый топор',type:'Оружие',icon:'🪓',damage:18,price:700},steel:{name:'Стальная броня',type:'Броня',icon:'🛡️',defense:15,price:650},bandage:{name:'Аптечка',type:'Расходник',icon:'🩹',qty:1,price:80}};const c=catalog[a.item];if(!c||s.coins<c.price)return json({ok:false,error:'not_enough_or_unknown'},400);s.coins-=c.price;const old=(s.items||[]).find(x=>x.name===c.name);if(old&&c.qty)old.qty=(old.qty||0)+1;else s.items=[...(s.items||[]),{...c,id:c.name+'_'+Date.now(),equipped:false}];s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='item.use'){const i=Number(a.index),it=(s.items||[])[i];if(!it||it.name!=='Аптечка')return json({ok:false,error:'invalid_item'},400);s.hp=Math.min(s.maxHp,s.hp+30);it.qty--;if(it.qty<=0)s.items.splice(i,1);s=this.putState(pid,name,s);return json({ok:true,player:s})}
    if(type==='forge.upgrade'){const w=(s.items||[]).find(x=>x.equipped&&x.type==='Оружие');if(!w||s.coins<200)return json({ok:false,error:'cannot_upgrade'},400);s.coins-=200;w.damage=Math.min(100,(w.damage||0)+3);s=this.putState(pid,name,s);return json({ok:true,player:s})}
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
  resolve(m){const A=m.choices[m.a.playerId],B=m.choices[m.b.playerId],sa=this.getState(m.a.playerId)||START,sb=this.getState(m.b.playerId)||START;const hitA=!B.defs.includes(A.attack),hitB=!A.defs.includes(B.attack);const critA=Math.random()<Math.min(.5,(sa.strength||0)/100),critB=Math.random()<Math.min(.5,(sb.strength||0)/100);const dodgeA=Math.random()<Math.min(.35,(sa.agility||0)/100),dodgeB=Math.random()<Math.min(.35,(sb.agility||0)/100);const baseA=10+Math.floor((sa.strength||0)*.7),baseB=10+Math.floor((sb.strength||0)*.7);const dmgA=hitA&&!dodgeB?(critA?Math.round(baseA*1.8):baseA):0,dmgB=hitB&&!dodgeA?(critB?Math.round(baseB*1.8):baseB):0;m.hp[m.a.playerId]=Math.max(0,m.hp[m.a.playerId]-dmgB);m.hp[m.b.playerId]=Math.max(0,m.hp[m.b.playerId]-dmgA);let winner=null;if(!m.hp[m.a.playerId]&&!m.hp[m.b.playerId])winner='draw';else if(!m.hp[m.a.playerId])winner=m.b.playerId;else if(!m.hp[m.b.playerId])winner=m.a.playerId;this.send(m.aw,{type:'pvp.result',matchId:m.id,turn:m.turn,dmgYou:dmgA,dmgOpponent:dmgB,yourHp:m.hp[m.a.playerId],opponentHp:m.hp[m.b.playerId],winner,critYou:critA,dodgeOpponent:dodgeB});this.send(m.bw,{type:'pvp.result',matchId:m.id,turn:m.turn,dmgYou:dmgB,dmgOpponent:dmgA,yourHp:m.hp[m.b.playerId],opponentHp:m.hp[m.a.playerId],winner,critYou:critB,dodgeOpponent:dodgeA});if(winner){const winnerPid=winner==='draw'?null:winner;for(const pid of [m.a.playerId,m.b.playerId]){const s=this.getState(pid);if(s){s.battles++;if(winner==='draw'){s.hp=s.maxHp}else if(pid===winnerPid){s.wins++;s.coins+=100;s.exp+=30;s.hp=s.maxHp;this.level(s)}else{s.losses++;s.hp=Math.max(1,Math.round(s.maxHp*.35))}this.putState(pid,pid===m.a.playerId?m.a.name:m.b.name,s)}}this.matches.delete(m.id)}else{m.turn++;m.choices={}}}
  async webSocketClose(ws){const meta=this.attachment(ws);if(!meta?.playerId)return;for(const [id,m] of this.matches){if(m.a.playerId===meta.playerId||m.b.playerId===meta.playerId){const other=m.a.playerId===meta.playerId?m.b:m.a;this.send(this.socketByPlayer(other.playerId),{type:'pvp.end',reason:'opponent_offline'});this.matches.delete(id)}}this.broadcastOnline()}
  async webSocketError(ws){await this.webSocketClose(ws)}
}
