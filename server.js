'use strict';
const http=require('http');
const crypto=require('crypto');
const WebSocket=require('ws');
const PORT=Number(process.env.PORT||8080);
const BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN||'';
const fs=require('fs');
const DATA_FILE=process.env.TERRITORY_DATA_FILE||'./territory-data.json';
let db={players:{},clans:{}};
try{if(fs.existsSync(DATA_FILE))db=Object.assign(db,JSON.parse(fs.readFileSync(DATA_FILE,'utf8')))}catch(e){}
function persist(){try{fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2))}catch(e){}}
const rooms=new Map();
const players=new Map();
const MAX_ROOM=50;
function json(res,code,obj){const body=JSON.stringify(obj);res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'});res.end(body);}
function safeRoom(v){return String(v||'').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,12);}
function roomCode(){let c;do{c=Math.random().toString(36).slice(2,8).toUpperCase();}while(rooms.has(c));return c;}
function verifyTelegram(initData){
  if(!BOT_TOKEN)return {ok:true,telegramId:null,verified:false};
  if(!initData||typeof initData!=='string')return {ok:false,reason:'missing_init_data'};
  const p=new URLSearchParams(initData);const hash=p.get('hash');if(!hash)return {ok:false,reason:'missing_hash'};p.delete('hash');
  const data=[...p.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>k+'='+v).join('\n');
  const secret=crypto.createHmac('sha256','WebAppData').update(BOT_TOKEN).digest();
  const calc=crypto.createHmac('sha256',secret).update(data).digest('hex');
  const ok=hash.length===calc.length&&crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(calc));
  let user=null;try{user=JSON.parse(p.get('user')||'null');}catch(e){}
  return {ok,telegramId:user&&user.id||null,verified:true};
}
function snapshot(room){return {room,players:[...rooms.get(room).values()].map(x=>({playerId:x.playerId,name:x.name||'Игрок',connected:true}))};}
function broadcast(room,msg,except){const set=rooms.get(room);if(!set)return;const raw=JSON.stringify(msg);for(const c of set){if(c!==except&&c.readyState===WebSocket.OPEN)c.send(raw);}}
const server=http.createServer((req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-telegram-init-data'});return res.end();}
  if(req.url==='/health'){return json(res,200,{ok:true,service:'territory-s79',rooms:rooms.size,online:players.size,accounts:Object.keys(db.players).length,clans:Object.keys(db.clans).length});}
  if(req.url==='/api/profile'&&req.method==='GET'){const u=new URL(req.url,'http://territory');const id=String(u.searchParams.get('id')||'');if(!id||!db.players[id])return json(res,404,{ok:false,error:'profile_not_found'});return json(res,200,{ok:true,profile:db.players[id]});}
  if(req.url==='/api/profile'&&req.method==='POST'){let raw='';req.on('data',d=>raw+=d);req.on('end',()=>{let b={};try{b=JSON.parse(raw||'{}')}catch(e){};const id=String(b.telegramId||'');if(!id)return json(res,400,{ok:false,error:'telegram_id_required'});const old=db.players[id]||{};db.players[id]={id,name:String(b.name||old.name||'Игрок').slice(0,32),clan:String(b.clan||old.clan||'Клан Sdolars').slice(0,32),level:Number(b.level||old.level||1),xp:Number(b.xp||old.xp||0),updatedAt:Date.now()};persist();json(res,200,{ok:true,profile:db.players[id]});});return;}
  if(req.url==='/api/clan'&&req.method==='GET'){const u=new URL(req.url,'http://territory');const id=String(u.searchParams.get('id')||'');const c=db.clans[id];if(!c)return json(res,404,{ok:false,error:'clan_not_found'});return json(res,200,{ok:true,clan:c});}
  if(req.url==='/api/room'&&req.method==='POST'){
    let raw='';req.on('data',d=>raw+=d);req.on('end',()=>{let b={};try{b=JSON.parse(raw||'{}')}catch(e){}const r=roomCode();rooms.set(r,new Set());json(res,201,{ok:true,room:r});});return;
  }
  json(res,404,{ok:false,error:'not_found'});
});
const wss=new WebSocket.Server({server,path:'/ws'});
wss.on('connection',(ws,req)=>{
  let current=null,playerId=null;
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw.toString())}catch(e){ws.send(JSON.stringify({type:'ERROR',error:'invalid_json'}));return;}
    const type=String(m.type||'');playerId=String(m.playerId||playerId||crypto.randomUUID());
    if(type==='HELLO'){
      const auth=verifyTelegram(req.headers['x-telegram-init-data']||'');
      if(!auth.ok){ws.send(JSON.stringify({type:'AUTH_ERROR',error:auth.reason||'telegram_auth_failed'}));return ws.close();}
      const name=String(m.payload&&m.payload.name||'Игрок').slice(0,32);
      players.set(playerId,{ws,telegramId:auth.telegramId,name});
      if(auth.telegramId){const old=db.players[String(auth.telegramId)]||{};db.players[String(auth.telegramId)]={id:String(auth.telegramId),name,clan:String(m.payload&&m.payload.clan||old.clan||'Клан Sdolars').slice(0,32),level:Number(m.payload&&m.payload.level||old.level||1),xp:Number(m.payload&&m.payload.xp||old.xp||0),updatedAt:Date.now()};persist();}
      ws.send(JSON.stringify({type:'WELCOME',playerId,telegramId:auth.telegramId,verified:auth.verified,profile:auth.telegramId?db.players[String(auth.telegramId)]:null}));return;
    }
    if(!players.has(playerId)){ws.send(JSON.stringify({type:'ERROR',error:'hello_required'}));return;}
    if(type==='ROOM_CREATE'){const r=roomCode();rooms.set(r,new Set([ws]));current=r;players.get(playerId).room=r;ws.send(JSON.stringify({type:'ROOM_CREATED',room:r,state:snapshot(r)}));return;}
    if(type==='ROOM_JOIN'){
      const r=safeRoom(m.room||m.payload&&m.payload.room);if(!r||!rooms.has(r)){ws.send(JSON.stringify({type:'ERROR',error:'room_not_found'}));return;}
      const set=rooms.get(r);if(set.size>=MAX_ROOM){ws.send(JSON.stringify({type:'ERROR',error:'room_full'}));return;}
      if(current&&rooms.has(current))rooms.get(current).delete(ws);current=r;set.add(ws);players.get(playerId).room=r;
      broadcast(r,{type:'PLAYER_JOIN',room:r,playerId,name:players.get(playerId).name},ws);ws.send(JSON.stringify({type:'ROOM_STATE',room:r,state:snapshot(r)}));return;
    }
    if(type==='ROOM_LEAVE'){if(current&&rooms.has(current)){rooms.get(current).delete(ws);broadcast(current,{type:'PLAYER_LEAVE',playerId},ws);}current=null;return;}
    if(type==='GAME_ACTION'){
      if(!current||!rooms.has(current)){ws.send(JSON.stringify({type:'ERROR',error:'not_in_room'}));return;}
      const action={type:'GAME_ACTION',room:current,playerId,payload:m.payload||{},ts:Date.now()};broadcast(current,action);ws.send(JSON.stringify({type:'ACTION_ACCEPTED',event:action}));return;
    }
  });
  ws.on('close',()=>{if(current&&rooms.has(current)){rooms.get(current).delete(ws);broadcast(current,{type:'PLAYER_LEAVE',playerId},ws);if(rooms.get(current).size===0)rooms.delete(current);}if(playerId)players.delete(playerId);});
});
server.listen(PORT,()=>console.log(`Territory S78 server listening on ${PORT}`));
