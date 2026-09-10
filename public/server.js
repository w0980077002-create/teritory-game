const http=require('http');
const fs=require('fs');
const path=require('path');
const WebSocket=require('ws');
const PORT=process.env.PORT||3000;
const root=__dirname;
const history={global:[],clan:[]};
const clients=new Map();
function broadcastOnline(){
  const names=[...clients.values()].map(c=>c.name).filter(Boolean);
  const payload=JSON.stringify({type:'online',names:[...new Set(names)]});
  for(const ws of clients.keys()) if(ws.readyState===1) ws.send(payload);
}
function sendHistory(ws,room){ws.send(JSON.stringify({type:'history',room,messages:history[room]||[]}));}
const server=http.createServer((req,res)=>{
  let u=(req.url||'/').split('?')[0]; if(u==='/' )u='/index.html';
  const file=path.join(root,decodeURIComponent(u));
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end('Not found')}
  const ext=path.extname(file); const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
  res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
const wss=new WebSocket.Server({server});
wss.on('connection',ws=>{
  const client={name:'Игрок',room:'global'};clients.set(ws,client);sendHistory(ws,'global');broadcastOnline();
  ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch(e){return}
    if(m.type==='hello'){client.name=String(m.name||'Игрок').slice(0,32);client.room=m.room==='clan'?'clan':'global';sendHistory(ws,client.room);broadcastOnline();return}
    if(m.type==='room'){client.room=m.room==='clan'?'clan':'global';sendHistory(ws,client.room);return}
    if(m.type==='message'){const room=m.room==='clan'?'clan':'global';const text=String(m.message?.text||'').trim().slice(0,180);if(!text)return;const msg={name:client.name,text,time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}),online:true};history[room].push(msg);if(history[room].length>100)history[room].shift();const payload=JSON.stringify({type:'message',room,message:msg});for(const [peer,c] of clients)if(c.room===room&&peer.readyState===1)peer.send(payload);}
  });
  ws.on('close',()=>{clients.delete(ws);broadcastOnline()});
});
server.listen(PORT,()=>console.log(`Territory chat server: http://localhost:${PORT}`));
