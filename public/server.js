const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'players.json');
let players = {};
try { if (fs.existsSync(DB_FILE)) players = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || {}; } catch (e) { players = {}; }
function persist(){ try { fs.writeFileSync(DB_FILE, JSON.stringify(players, null, 2)); } catch(e) { console.error('DB save:', e.message); } }
function cleanKey(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80); }
function sendJson(res, code, data){ const out=JSON.stringify(data); res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}); res.end(out); }
function readBody(req){ return new Promise((resolve,reject)=>{ let b=''; req.on('data',c=>{b+=c;if(b.length>1000000){req.destroy();reject(new Error('body too large'));}}); req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}}); req.on('error',reject); }); }
function serveStatic(req,res){
  let u = decodeURIComponent((req.url||'/').split('?')[0]);
  if(u==='/' || u==='/index.html') u='/index.html';
  const file=path.normalize(path.join(ROOT,u));
  if(!file.startsWith(ROOT)) return sendJson(res,403,{error:'forbidden'});
  fs.stat(file,(err,st)=>{ if(err||!st.isFile()) return sendJson(res,404,{error:'not found'}); const ext=path.extname(file); const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'}; res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'}); fs.createReadStream(file).pipe(res); });
}
const server=http.createServer(async (req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end();}
  const u=(req.url||'').split('?')[0];
  if(u==='/api/health') return sendJson(res,200,{ok:true,players:Object.keys(players).length,time:Date.now()});
  if(u.startsWith('/api/player/')){
    const key=cleanKey(u.slice('/api/player/'.length));
    if(!key) return sendJson(res,400,{error:'bad player id'});
    if(req.method==='GET') return sendJson(res,200,{ok:true,state:players[key]||null});
    if(req.method==='POST'){
      try{ const body=await readBody(req); if(!body.state || typeof body.state!=='object') return sendJson(res,400,{error:'state required'}); players[key]={...body.state,_updatedAt:Date.now()}; persist(); return sendJson(res,200,{ok:true,savedAt:players[key]._updatedAt}); }
      catch(e){ return sendJson(res,400,{error:'invalid json'}); }
    }
  }
  serveStatic(req,res);
});
const wss=new WebSocket.Server({server});
const clients=new Set(); const rooms={global:[],clan:[]}; const online=new Map();
function broadcastOnline(){const names=[...online.values()].map(x=>x.name).filter(Boolean).slice(0,100); for(const c of clients){ if(c.readyState===WebSocket.OPEN)c.send(JSON.stringify({type:'online',names})); }}
function history(room){return rooms[room]||[];}
wss.on('connection',ws=>{
  clients.add(ws); let meta={name:'Игрок',room:'global',id:Math.random().toString(36).slice(2)}; online.set(meta.id,meta);
  ws.on('message',raw=>{try{const m=JSON.parse(raw.toString());
    if(m.type==='hello'){meta.name=String(m.name||'Игрок').slice(0,40);meta.room=m.room==='clan'?'clan':'global';online.set(meta.id,meta);ws.send(JSON.stringify({type:'history',room:meta.room,messages:history(meta.room)}));broadcastOnline();return;}
    if(m.type==='message'){const room=m.room==='clan'?'clan':'global';const msg={name:meta.name,text:String(m.message?.text||'').slice(0,180),time:String(m.message?.time||''),online:true};rooms[room].push(msg);if(rooms[room].length>100)rooms[room].splice(0,rooms[room].length-100);for(const c of clients){if(c.readyState===WebSocket.OPEN)c.send(JSON.stringify({type:'message',room,message:msg}));}}
  }catch(e){}});
  ws.on('close',()=>{clients.delete(ws);online.delete(meta.id);broadcastOnline();});
});
server.listen(PORT,()=>console.log(`Territory Sdolars s25 server: http://localhost:${PORT}`));
