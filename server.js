'use strict';
const http=require('http');
const crypto=require('crypto');
const WebSocket=require('ws');
const PORT=Number(process.env.PORT||8080);
const BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN||'';
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
  if(req.url==='/health'){return json(res,200,{ok:true,service:'territory-s78',rooms:rooms.size,players:players.size});}
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
      players.set(playerId,{ws,telegramId:auth.telegramId,name:String(m.payload&&m.payload.name||'Игрок').slice(0,32)});
      ws.send(JSON.stringify({type:'WELCOME',playerId,verified:auth.verified}));return;
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
