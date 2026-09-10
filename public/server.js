const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const PUBLIC = path.join(__dirname);
const rooms = { global: new Map(), clan: new Map() };
const history = {
  global: [
    { name: 'Система Sdolars', text: 'Добро пожаловать в общий чат игры!', time: 'сейчас', system: true },
    { name: 'Рагнар', text: 'Кто идёт на арену?', time: 'сейчас' }
  ],
  clan: [{ name: 'Клан Sdolars', text: 'Чат клана открыт. Добро пожаловать!', time: 'сейчас', system: true }]
};

function safeText(v, max = 180) {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}
function roomName(v) { return v === 'clan' ? 'clan' : 'global'; }
function broadcast(room, data) {
  const raw = JSON.stringify(data);
  for (const client of rooms[room].keys()) {
    if (client.readyState === WebSocket.OPEN) client.send(raw);
  }
}
function online(room) {
  const names = [];
  for (const client of rooms[room].keys()) if (client.playerName) names.push(client.playerName);
  return [...new Set(names)].slice(0, 50);
}
function announceOnline(room) { broadcast(room, { type: 'online', names: online(room) }); }
function move(client, room) {
  room = roomName(room);
  for (const r of ['global','clan']) rooms[r].delete(client);
  rooms[room].set(client, true);
  client.room = room;
  client.send(JSON.stringify({ type: 'history', room, messages: history[room].slice(-60) }));
  announceOnline('global');
  announceOnline('clan');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  file = path.normalize(file).replace(/^([.][.][\\/])+/, '');
  const full = path.join(PUBLIC, file);
  if (!full.startsWith(PUBLIC) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404); return res.end('Not found');
  }
  const ext = path.extname(full).toLowerCase();
  const types = { '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(full).pipe(res);
});

const wss = new WebSocket.Server({ server, maxPayload: 4096 });
wss.on('connection', client => {
  client.playerName = 'Игрок';
  client.room = 'global';
  move(client, 'global');

  client.on('message', raw => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === 'hello') {
        client.playerName = safeText(data.name, 40) || 'Игрок';
        move(client, roomName(data.room));
        return;
      }
      if (data.type === 'room') { move(client, data.room); return; }
      if (data.type === 'message') {
        const room = roomName(data.room || client.room);
        if (client.room !== room) return;
        const text = safeText(data.message?.text, 180);
        if (!text) return;
        const msg = { name: client.playerName, text, time: new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' }), online: true };
        history[room].push(msg);
        if (history[room].length > 60) history[room].splice(0, history[room].length - 60);
        broadcast(room, { type: 'message', room, message: msg });
      }
    } catch (_) {}
  });
  client.on('close', () => { const room = client.room; rooms.global.delete(client); rooms.clan.delete(client); announceOnline(room); announceOnline('global'); announceOnline('clan'); });
  client.on('error', () => {});
});

setInterval(() => { for (const client of wss.clients) if (client.readyState === WebSocket.OPEN) client.ping(); }, 25000);
server.listen(PORT, HOST, () => console.log(`Territory Sdolars server: http://${HOST}:${PORT}`));
