const http=require('http'),fs=require('fs'),path=require('path');
const WebSocket=require('ws');
const PORT=process.env.PORT||3000,ROOT=__dirname,DB_FILE=path.join(ROOT,'players.json');
let players={}; try{if(fs.existsSync(DB_FILE))players=JSON.parse(fs.readFileSync(DB_FILE,'utf8'))||{}}catch(e){}
function persist(){try{fs.writeFileSync(DB_FILE,JSON.stringify(players,null,2))}catch(e){}}
function cleanKey(v){return String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)}
function sendJson(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data))}
function body(req){return new Promise((ok,bad)=>{let s='';req.on('data',c=>{s+=c;if(s.length>1000000)bad(new Error('large'))});req.on('end',()=>{try{ok(JSON.parse(s||'{}'))}catch(e){bad(e)}});req.on('error',bad)})}
function staticFile(req,res){let u=decodeURIComponent((req.url||'/').split('?')[0]);if(u==='/'||u==='/index.html')u='/index.html';const f=path.normalize(path.join(ROOT,u));if(!f.startsWith(ROOT))return sendJson(res,403,{error:'forbidden'});fs.stat(f,(e,st)=>{if(e||!st.isFile())return sendJson(res,404,{error:'not found'});const t={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};res.writeHead(200,{'Content-Type':t[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(f).pipe(res)})}
const server=http.createServer(async(req,res)=>{if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end()}
 const u=(req.url||'').split('?')[0];
 if(u==='/api/health')return sendJson(res,200,{ok:true,players:Object.keys(players).length,time:Date.now()});
 if(u==='/api/players'&&req.method==='GET'){const list=[...online.values()].map(x=>({playerId:x.playerId,name:x.name}));return sendJson(res,200,{ok:true,players:list})}
 if(u.startsWith('/api/player/')){const key=cleanKey(u.slice(12));if(!key)return sendJson(res,400,{error:'bad player id'});if(req.method==='GET')return sendJson(res,200,{ok:true,state:players[key]||null});if(req.method==='POST'){try{const b=await body(req);if(!b.state||typeof b.state!=='object')return sendJson(res,400,{error:'state required'});players[key]={...b.state,_updatedAt:Date.now()};persist();return sendJson(res,200,{ok:true,savedAt:players[key]._updatedAt})}catch(e){return sendJson(res,400,{error:'invalid json'})}}}
 staticFile(req,res);
});
const wss=new WebSocket.Server({server, path:'/ws'}),clients=new Set(),online=new Map(),rooms={global:[],clan:[]},matches=new Map(),pending=new Map();
function send(ws,o){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(o))}
function onlineList(){return [...online.values()].map(x=>({playerId:x.playerId,name:x.name}))}
function broadcastOnline(){const list=onlineList();for(const ws of clients)send(ws,{type:'online',names:list.map(x=>x.name),players:list})}
function wsByPlayer(pid){for(const ws of clients){const x=online.get(ws.__onlineId);if(x&&x.playerId===pid)return ws}return null}
function pvpStart(a,b){const id='m_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);const m={id,a,b,turn:1,hp:{[a.playerId]:100,[b.playerId]:100},choices:{}};matches.set(id,m);send(a.ws,{type:'pvp.start',matchId:id,turn:1,opponent:b.name,opponentPlayerId:b.playerId});send(b.ws,{type:'pvp.start',matchId:id,turn:1,opponent:a.name,opponentPlayerId:a.playerId})}
function resolve(m){const A=m.choices[m.a.playerId],B=m.choices[m.b.playerId];const hitA=!B.defs.includes(A.attack),hitB=!A.defs.includes(B.attack);const dmgA=hitA?8+Math.floor(Math.random()*7):0,dmgB=hitB?8+Math.floor(Math.random()*7):0;m.hp[m.a.playerId]=Math.max(0,m.hp[m.a.playerId]-dmgB);m.hp[m.b.playerId]=Math.max(0,m.hp[m.b.playerId]-dmgA);let winner=null;if(!m.hp[m.a.playerId]&&!m.hp[m.b.playerId])winner='draw';else if(!m.hp[m.a.playerId])winner=m.b.playerId;else if(!m.hp[m.b.playerId])winner=m.a.playerId;send(m.a.ws,{type:'pvp.result',matchId:m.id,turn:m.turn,dmgYou:dmgA,dmgOpponent:dmgB,yourHp:m.hp[m.a.playerId],opponentHp:m.hp[m.b.playerId],winner});send(m.b.ws,{type:'pvp.result',matchId:m.id,turn:m.turn,dmgYou:dmgB,dmgOpponent:dmgA,yourHp:m.hp[m.b.playerId],opponentHp:m.hp[m.a.playerId],winner});if(winner)matches.delete(m.id);else{m.turn++;m.choices={}}}
wss.on('connection',ws=>{clients.add(ws);const meta={id:Math.random().toString(36).slice(2),playerId:'',name:'Игрок',room:'global',ws};ws.__onlineId=meta.id;online.set(meta.id,meta);broadcastOnline();
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch(e){return}
  if(m.type==='hello'){meta.name=String(m.name||'Игрок').slice(0,40);meta.playerId=String(m.playerId||meta.id).slice(0,80);meta.room=m.room==='clan'?'clan':'global';online.set(meta.id,meta);send(ws,{type:'history',room:meta.room,messages:rooms[meta.room]});broadcastOnline();return}
  if(m.type==='message'){const room=m.room==='clan'?'clan':'global',msg={name:meta.name,text:String(m.message?.text||'').slice(0,180),time:String(m.message?.time||''),online:true};rooms[room].push(msg);if(rooms[room].length>100)rooms[room].shift();for(const c of clients)send(c,{type:'message',room,message:msg});return}
  if(m.type==='pvp.challenge'){const target=String(m.target||''),to=wsByPlayer(target);if(to&&target!==meta.playerId){pending.set(meta.playerId,{from:meta.playerId,to:target});send(to,{type:'pvp.challenge',from:meta.playerId,name:meta.name});}return}
  if(m.type==='pvp.accept'){const from=String(m.from||''),challenger=wsByPlayer(from);if(challenger){pending.delete(from);pvpStart(meta,online.get(challenger.__onlineId));}return}
  if(m.type==='pvp.decline'){pending.delete(String(m.from||''));return}
  if(m.type==='pvp.move'){const id=String(m.matchId||''),match=matches.get(id);if(!match)return;if(meta.playerId!==match.a.playerId&&meta.playerId!==match.b.playerId)return;const attack=Number(m.attack),defs=Array.isArray(m.defs)?m.defs.map(Number):[];if(!Number.isInteger(attack)||attack<0||attack>4||defs.length!==2||defs[0]===defs[1]||defs.some(x=>!Number.isInteger(x)||x<0||x>4))return;match.choices[meta.playerId]={attack,defs};send(ws,{type:'pvp.waiting'});if(match.choices[match.a.playerId]&&match.choices[match.b.playerId])resolve(match);return}
 });
 ws.on('close',()=>{clients.delete(ws);online.delete(meta.id);for(const [id,m] of matches){if(m.a.playerId===meta.playerId||m.b.playerId===meta.playerId){const other=m.a.playerId===meta.playerId?m.b:m.a;send(other.ws,{type:'pvp.end',reason:'opponent_offline'});matches.delete(id)}}broadcastOnline()})
});
server.listen(PORT,()=>console.log('Territory Sdolars s26 server on '+PORT));
