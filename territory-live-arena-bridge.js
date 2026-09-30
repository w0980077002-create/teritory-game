/* Territory COMPLETE PASS — Live Arena bridge.
 * Keeps the existing Cloudflare RoomHub but renders the same tactical UX
 * as the local arena: zones, hit, auto, chat and shared bottom navigation.
 */
(function(){
'use strict';
if(window.TerritoryLiveArena?.completePass)return;

const A=window.TerritoryTelegramAuth;
const tg=()=>window.Telegram?.WebApp||null;
const SERVER='https://territory-sdolars-server.w0660077702.workers.dev';
let ws=null,room=null,selfId='',turnSeq=0,activeId=null,mode='duel',auto=false,selectedAttack='',selectedDefense=[],timer=null;

const zones=[['head','Голова'],['chest','Грудь'],['waist','Пояс'],['legs','Ноги']];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=()=>document.getElementById('territory-live-arena');
const body=()=>document.getElementById('laBody');

function css(){
 if(document.getElementById('territory-live-arena-complete-css'))return;
 const s=document.createElement('style');s.id='territory-live-arena-complete-css';
 s.textContent=`
 #territory-live-arena{position:fixed;inset:0;z-index:120000;background:#061018;color:#fff;overflow:auto;font-family:system-ui,sans-serif}
 #territory-live-arena .la-wrap{min-height:100%;padding-bottom:68px}
 #territory-live-arena .la-head{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 8px;background:#050d13;border-bottom:1px solid rgba(232,199,107,.2);font-size:9px}
 #territory-live-arena .la-head b{color:#e8c76b}
 #territory-live-arena .la-stage{position:relative;height:305px;background:linear-gradient(#0002,#0005),url('./arena-night-approved.png') center/cover;overflow:hidden}
 #territory-live-arena .la-fighter{position:absolute;bottom:7px;width:122px;text-align:center}
 #territory-live-arena .la-me{left:20%}.la-enemy{right:20%}
 #territory-live-arena .la-avatar{font-size:88px;filter:drop-shadow(0 8px 6px #000)}
 #territory-live-arena .la-name{font-size:9px;font-weight:900;text-shadow:0 2px 4px #000}
 #territory-live-arena .la-hp{height:17px;border:1px solid #fff6;border-radius:9px;background:#061018;overflow:hidden;position:relative}
 #territory-live-arena .la-hp i{position:absolute;inset:0 auto 0 0;background:#3fbf62}
 #territory-live-arena .la-hp b{position:absolute;inset:0;text-align:center;line-height:16px;font-size:8px}
 #territory-live-arena .la-zones{position:absolute;top:50%;transform:translateY(-50%);z-index:5;display:flex;flex-direction:column;gap:4px;width:47px}
 #territory-live-arena .la-zones.left{left:3px}.la-zones.right{right:3px}
 #territory-live-arena .la-zone{height:45px;border:1px solid rgba(232,199,107,.35);border-radius:8px;background:#061018b0;color:#fff;font-size:7px;font-weight:900}
 #territory-live-arena .la-zone.active{border-color:#e8c76b;background:#805b1ccc;color:#ffe9a8}
 #territory-live-arena .la-command{height:40px;display:grid;grid-template-columns:1fr 50px 68px 55px 55px;gap:3px;align-items:center;padding:3px 6px;background:#050d13;border-bottom:1px solid #ffffff16}
 #territory-live-arena .la-command button{height:30px;border-radius:7px;border:1px solid #394f5c;background:#0b1821;color:#cbd4d8;font-size:7px;font-weight:900}
 #territory-live-arena .la-command .hit{border-color:#c59e4d;background:linear-gradient(#e5c56a,#9c711f);color:#171107}
 #territory-live-arena .la-command .auto.active{background:#5d491c;border-color:#e8c76b;color:#f0cf91}
 #territory-live-arena .la-loadout{padding:5px 7px;background:#07131c;border-bottom:1px solid #ffffff18}
 #territory-live-arena .la-title{font-size:8px;color:#e8c76b;font-weight:900;margin-bottom:4px}
 #territory-live-arena .la-items{display:flex;gap:4px;overflow:auto}
 #territory-live-arena .la-item{min-width:67px;height:47px;border:1px solid #344a56;border-radius:8px;background:#0d1b25;color:#fff;font-size:8px;font-weight:800}
 #territory-live-arena .la-chat{margin:5px 7px;border:1px solid #324b58;border-radius:9px;background:#08151e}
 #territory-live-arena .la-chat-toggle{width:100%;height:30px;border:0;background:transparent;color:#cbd4d8;text-align:left;padding:0 9px;font-weight:900}
 #territory-live-arena .la-chat-log{max-height:140px;overflow:auto;padding:6px;font-size:8px}
 #territory-live-arena .la-chat-compose{display:flex;gap:4px;padding:5px;border-top:1px solid #ffffff12}
 #territory-live-arena .la-chat-compose input{flex:1;min-width:0;height:29px;background:#0d1d27;border:1px solid #344b57;border-radius:7px;color:#fff;font-size:8px;padding:0 7px}
 #territory-live-arena .la-chat-compose button{width:34px;border:1px solid #c59e4d;border-radius:7px;background:#9c711f;color:#171107}
 #territory-live-arena .la-menu{padding:14px}.la-card{padding:14px;border:1px solid #2b414d;border-radius:14px;background:#0d1b25;margin-bottom:8px}
 #territory-live-arena .la-menu button{width:100%;min-height:44px;margin:4px 0;border:1px solid #c59e4d;border-radius:10px;background:linear-gradient(#e6c66c,#9c711f);color:#171107;font-weight:900}
 #territory-live-arena .la-close{position:fixed;top:4px;left:5px;z-index:20;width:30px;height:28px;border:1px solid #e8c76b;border-radius:8px;background:#07131c;color:#e8c76b}
 `;
 document.head.appendChild(s);
}
function close(){try{ws?.send(JSON.stringify({type:'leave'}))}catch(_){}try{ws?.close()}catch(_){}ws=null;room=null;clearInterval(timer);document.getElementById('territory-live-arena')?.remove();document.body.classList.remove('territory-arena-combat')}
function open(){
 css(); if(root())return;
 const el=document.createElement('div');el.id='territory-live-arena';
 el.innerHTML='<button class="la-close" id="laClose">‹</button><div id="laBody"></div>';
 document.body.appendChild(el);document.getElementById('laClose').onclick=close;menu();
}
function menu(){
 auto=false;body().innerHTML=`<div class="la-menu"><div class="la-card"><b>⚔️ ЖИВАЯ АРЕНА</b><p style="opacity:.6;font-size:10px">Живые игроки в приоритете. Если очередь долго пуста, сервер подставит бота.</p>
 <button id="laDuel">⚔️ 1 × 1</button><button id="laGroup">⚔️ 3 × 3</button></div></div>`;
 document.getElementById('laDuel').onclick=()=>queue('duel');
 document.getElementById('laGroup').onclick=()=>queue('group');
}
function queue(m){
 const w=tg();if(!w?.initData){body().innerHTML='<div class="la-menu"><div class="la-card">Открой игру внутри Telegram, чтобы использовать живую арену.</div></div>';return}
 mode=m;const name=A?.player?.first_name||A?.player?.username||'Игрок',level=Math.max(1,n(A?.player?.level,1));
 const u=new URL(SERVER+'/api/arena/ws');u.searchParams.set('initData',w.initData);
 try{ws=new WebSocket(u.toString().replace(/^http/,'ws'))}catch(e){body().innerHTML='<div class="la-menu"><div class="la-card">Не удалось открыть соединение Arena.</div></div>';return}
 ws.onopen=()=>ws.send(JSON.stringify({type:'queue',mode,name,level}));
 ws.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(_){return}handle(d)};
 ws.onerror=()=>{body().innerHTML='<div class="la-menu"><div class="la-card">Ошибка соединения с Arena.</div></div>'};
 body().innerHTML='<div class="la-menu"><div class="la-card"><h3>Поиск соперника…</h3><p style="opacity:.6;font-size:10px">Ждём игрока; сервер может заполнить место ботом.</p></div></div>';
}
function handle(d){
 if(d.type==='queued')return;
 if(d.type==='room_start'||d.type==='reconnect_state'||d.type==='state'){
   selfId=d.selfId||selfId;turnSeq=n(d.turnSeq,turnSeq);activeId=d.activeId||activeId;room=d.room||room;renderRoom();return;
 }
 if(d.type==='chat'){if(room){room.log=room.log||[];room.log.push('💬 '+d.name+': '+d.text);renderRoom()};return}
 if(d.type==='player_left'){if(room){room.players=room.players.filter(p=>p.id!==d.id);renderRoom()};return}
 if(d.type==='result'){room=d.room||room;renderResult(d);return}
 if(d.type==='error')alert(d.message||'Ошибка Arena');
}
function selectedEnemy(){
 const me=room?.players?.find(p=>p.id===selfId);
 return room?.players?.find(p=>!p.left&&!p.defeated&&p.team!==me?.team);
}
function sendAttack(){
 if(!room||activeId!==selfId)return;
 const target=selectedEnemy();if(!target)return;
 const defense=selectedDefense.slice(0,2);
 if(defense.length<2)while(defense.length<2){const z=zones[Math.floor(Math.random()*zones.length)][0];if(!defense.includes(z))defense.push(z)}
 const attack=selectedAttack||zones[Math.floor(Math.random()*zones.length)][0];
 ws?.send(JSON.stringify({type:'attack',targetId:target.id,turnSeq,actionId:crypto.randomUUID(),defense}));
 selectedAttack='';selectedDefense=[];
}
function autoStep(){
 if(!auto||!room||activeId!==selfId)return;
 selectedDefense=[];while(selectedDefense.length<2){const z=zones[Math.floor(Math.random()*zones.length)][0];if(!selectedDefense.includes(z))selectedDefense.push(z)}
 selectedAttack=zones[Math.floor(Math.random()*zones.length)][0];renderRoom();setTimeout(()=>{if(auto)sendAttack()},220);
}
function chatSend(){
 const i=document.querySelector('#territory-live-arena [data-la-chat-input]');if(!i?.value.trim())return;
 ws?.send(JSON.stringify({type:'chat',text:i.value.trim().slice(0,180)}));i.value='';renderRoom();
}
function renderRoom(){
 if(!room)return;
 const me=room.players.find(p=>p.id===selfId),enemy=selectedEnemy(),can=activeId===selfId&&!room.result;
 const hp=p=>Math.max(0,n(p?.hp)),mx=p=>Math.max(1,n(p?.maxHp,1));
 body().innerHTML=`<div class="la-wrap">
 <div class="la-head"><b>ХОД ${room.round||1}</b><span>Рейтинг ${n(A?.player?.rating,1000)}</span><span>${can?'ТВОЙ ХОД':'ХОД СОПЕРНИКА'}</span></div>
 <div class="la-stage">
  <div class="la-zones left"><small style="color:#e8c76b;font-size:6px">ЗАЩИТА · 2</small>${zones.map(z=>`<button class="la-zone ${selectedDefense.includes(z[0])?'active':''}" data-defense="${z[0]}">${z[1]}</button>`).join('')}</div>
  <div class="la-zones right"><small style="color:#e8c76b;font-size:6px">АТАКА · 1</small>${zones.map(z=>`<button class="la-zone ${selectedAttack===z[0]?'active':''}" data-attack="${z[0]}">${z[1]}</button>`).join('')}</div>
  <div class="la-fighter la-me"><div class="la-name">${esc(me?.name||'Игрок')} · Lv.${n(me?.level,1)}</div><div class="la-hp"><i style="width:${Math.round(hp(me)/mx(me)*100)}%"></i><b>${hp(me)}/${mx(me)} ❤️</b></div><div class="la-avatar">🪓</div></div>
  <div class="la-fighter la-enemy"><div class="la-name">${esc(enemy?.name||'Соперник')} · Lv.${n(enemy?.level,1)}</div><div class="la-hp"><i style="width:${Math.round(hp(enemy)/mx(enemy)*100)}%"></i><b>${hp(enemy)}/${mx(enemy)} ❤️</b></div><div class="la-avatar">🛡️</div></div>
 </div>
 <div class="la-command"><span>${can?'Выбери 2 защиты + 1 атаку':'Ждём ход соперника'}</span><button class="auto ${auto?'active':''}" id="laAuto">↻ АВТО</button><button class="hit" id="laHit" ${can?'':'disabled'}>⚔️ УДАР</button><button id="laSurrender">Сдаться</button><button id="laExit">Выйти</button></div>
 <div class="la-loadout"><div class="la-title">СНАРЯЖЕНИЕ</div><div class="la-items">${['⚔️ Оружие','🪖 Шлем','🛡️ Броня','🎗️ Пояс','🥾 Сапоги','💍 Кольцо','🔮 Амулет'].map(x=>`<button class="la-item">${x}</button>`).join('')}</div><div class="la-title">ЭЛИКСИРЫ И БОЕВЫЕ ПРЕДМЕТЫ</div><div class="la-items">${['🧪 HP','🔵 Энергия','🔥 Атака','🛡️ Защита'].map(x=>`<button class="la-item">${x}</button>`).join('')}</div></div>
 <div class="la-chat"><button class="la-chat-toggle" id="laChatToggle">💬 История и чат</button><div class="la-chat-log" id="laChatLog">${(room.log||[]).slice(-20).map(x=>`<div>${esc(x)}</div>`).join('')}</div><div class="la-chat-compose"><input data-la-chat-input maxlength="180" placeholder="Написать сообщение…"><button id="laChatSend">➤</button></div></div>
 </div>`;
 document.querySelectorAll('#territory-live-arena [data-defense]').forEach(b=>b.onclick=()=>{const z=b.dataset.defense;const i=selectedDefense.indexOf(z);if(i>=0)selectedDefense.splice(i,1);else if(selectedDefense.length<2)selectedDefense.push(z);renderRoom()});
 document.querySelectorAll('#territory-live-arena [data-attack]').forEach(b=>b.onclick=()=>{selectedAttack=b.dataset.attack;renderRoom()});
 document.getElementById('laHit').onclick=sendAttack;document.getElementById('laAuto').onclick=()=>{auto=!auto;renderRoom();if(auto)autoStep()};
 document.getElementById('laSurrender').onclick=close;document.getElementById('laExit').onclick=close;document.getElementById('laChatSend').onclick=chatSend;
 document.getElementById('laChatToggle').onclick=()=>document.getElementById('laChatLog')?.classList.toggle('collapsed');
 const input=document.querySelector('#territory-live-arena [data-la-chat-input]');input?.addEventListener('keydown',e=>{if(e.key==='Enter')chatSend()});
 if(auto&&can)setTimeout(autoStep,250);
}
function renderResult(d){
 body().innerHTML=`<div class="la-menu"><div class="la-card"><h2>${esc(d.result||'Бой завершён')}</h2><p>Награда: ${n(d.rewards?.coins)} 🪙 · ${n(d.rewards?.xp)} XP</p><button id="laAgain">Ещё бой</button><button id="laClose2">Закрыть</button></div></div>`;
 document.getElementById('laAgain').onclick=()=>{try{ws?.close()}catch(_){}ws=null;room=null;menu()};
 document.getElementById('laClose2').onclick=close;
}
function boot(){
 const old=window.ArenaGame?.open;
 if(window.ArenaGame&&typeof old==='function'&&!old.__completePass){
   const f=function(){open()};f.__completePass=true;window.ArenaGame.open=f;window.ArenaGame.__completePass=true;
 }
}
window.TerritoryLiveArena={open,close,completePass:true};
setTimeout(boot,100);setInterval(boot,1000);
})();
