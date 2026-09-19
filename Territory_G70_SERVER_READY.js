/* Territory G70 — Server-Ready Client Contract
   Prepares the browser client for a future authoritative server/WebSocket.
   No network calls are made here. Local play remains fully functional.
   City visual, PvE and Arena engines are not replaced. */
(function(){'use strict';
 const Store=window.TerritoryStore;
 if(!Store)return;
 const st=Store.state;
 const KEY='territory_save_v1';
 const VERSION='G70';
 const now=()=>Date.now();
 const id=()=>VERSION+'-'+now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 const ensure=()=>{
   st.g70=st.g70||{};
   st.g70.clientVersion=VERSION;
   st.g70.mode=st.g70.mode||'local';
   st.g70.sessionId=st.g70.sessionId||id();
   st.g70.seq=Math.max(0,Number(st.g70.seq||0));
   st.g70.outbox=Array.isArray(st.g70.outbox)?st.g70.outbox:[];
   st.g70.lastAck=Math.max(0,Number(st.g70.lastAck||0));
   st.g70.lastSync=Math.max(0,Number(st.g70.lastSync||0));
   st.g70.pending=!!st.g70.pending;
 };
 const save=reason=>{try{Store.saveNow(reason||'g70')}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}}};
 const emit=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
 function snapshot(){ensure(); return JSON.parse(JSON.stringify({version:VERSION,sessionId:st.g70.sessionId,seq:st.g70.seq,lastAck:st.g70.lastAck,state:st}));}
 function stateDigest(){ensure(); const s=st; return JSON.stringify({level:s.level,exp:s.exp,hp:s.hp,maxHp:s.maxHp,coins:s.coins,gems:s.gems,energy:s.energy,combatStone:s.combatStone,pveProgress:s.pveProgress,cityLevel:s.cityLevel,pveWins:s.pveWins,cityRep:s.cityRep,inventory:s.inventory,equipped:s.equipped,durability:s.durability});}
 function queue(type,payload){ensure(); const event={id:id(),seq:++st.g70.seq,type:String(type||'unknown'),payload:payload||{},at:now(),sessionId:st.g70.sessionId}; st.g70.outbox.push(event); if(st.g70.outbox.length>100)st.g70.outbox=st.g70.outbox.slice(-100); st.g70.pending=true; save('g70-queue'); emit('territory:server-event',{event}); return event;}
 function ack(seq){ensure(); const n=Math.max(0,Number(seq)||0); st.g70.lastAck=Math.max(st.g70.lastAck,n); st.g70.outbox=st.g70.outbox.filter(e=>e.seq>st.g70.lastAck); st.g70.pending=st.g70.outbox.length>0; st.g70.lastSync=now(); save('g70-ack'); emit('territory:server-ack',{seq:st.g70.lastAck});}
 function setMode(mode){ensure(); st.g70.mode=mode==='server'?'server':'local'; save('g70-mode'); emit('territory:server-mode',{mode:st.g70.mode}); return st.g70.mode;}
 function connect(adapter){ensure(); if(adapter&&typeof adapter.send==='function'){st.g70.adapter='custom'; st.g70.pending=st.g70.outbox.length>0; for(const e of st.g70.outbox)try{adapter.send(e)}catch(_){} emit('territory:server-ready',{mode:'adapter'}); return true;} emit('territory:server-ready',{mode:'local'}); return false;}
 function drain(){ensure(); return st.g70.outbox.map(e=>JSON.parse(JSON.stringify(e)));}
 function applyServerPatch(patch){ensure(); if(!patch||typeof patch!=='object')return false; const allowed=['level','exp','maxExp','hp','maxHp','coins','gems','energy','combatStone','strength','agility','defense','endurance','weaponMastery','freePoints','pveProgress','cityLevel','pveWins','hunger','alexQuest','cityRep','merchantRep','inventory','equipped','equipmentSlots','durability','quests','achievements','daily','vipDays']; for(const k of allowed)if(Object.prototype.hasOwnProperty.call(patch,k))st[k]=patch[k]; st.g70.lastSync=now(); save('g70-server-patch'); emit('territory:server-patch',{keys:Object.keys(patch)}); return true;}
 function localAction(type,payload){return queue(type,payload);}
 function status(){ensure();return {version:VERSION,mode:st.g70.mode,sessionId:st.g70.sessionId,seq:st.g70.seq,lastAck:st.g70.lastAck,pending:st.g70.pending,outbox:st.g70.outbox.length,lastSync:st.g70.lastSync};}
 function open(){ensure(); let o=document.getElementById('tgG70'); if(!o){o=document.createElement('div');o.id='tgG70';o.innerHTML='<div class="g70-card"><div class="g70-head"><div><small>SDOLARS · SERVER READY</small><h2>Сетевой контур</h2></div><button data-g70="close">✕</button></div><div id="g70Body"></div><div class="g70-actions"><button data-g70="local">Локальный режим</button><button data-g70="export">Снимок состояния</button></div></div>';document.body.appendChild(o)} render();o.classList.add('show');}
 function render(){const o=document.getElementById('tgG70'),b=document.getElementById('g70Body');if(!o||!b)return;const s=status();b.innerHTML='<div class="g70-row"><span>Режим</span><b>'+s.mode+'</b></div><div class="g70-row"><span>Сессия</span><b>'+s.sessionId.slice(-10)+'</b></div><div class="g70-row"><span>Очередь событий</span><b>'+s.outbox+'</b></div><div class="g70-row"><span>Последняя синхронизация</span><b>'+(s.lastSync?new Date(s.lastSync).toLocaleTimeString():'—')+'</b></div><p class="g70-note">Сейчас игра работает локально. Этот слой готовит единый контракт событий и снимок состояния для будущего WebSocket/серверного режима.</p>';}
 function css(){if(document.getElementById('g70css'))return;const c=document.createElement('style');c.id='g70css';c.textContent='#tgG70{position:fixed;inset:0;z-index:100060;display:none;align-items:flex-end;justify-content:center;background:rgba(1,4,7,.82);padding:10px;box-sizing:border-box}#tgG70.show{display:flex}.g70-card{width:min(620px,100%);border:1px solid #6d5635;border-radius:20px 20px 0 0;background:linear-gradient(180deg,#17242c,#091015);color:#eee4d4;padding:15px;box-sizing:border-box;box-shadow:0 -18px 55px #000b}.g70-head{display:flex;justify-content:space-between;align-items:flex-start}.g70-head small{color:#a89472;font-size:9px;letter-spacing:1.2px}.g70-head h2{margin:3px 0 12px;color:#efd18e;font:700 23px Georgia,serif}.g70-head button{width:40px;height:40px;border:1px solid #665338;border-radius:10px;background:#142027;color:#efd18e;font-weight:900}.g70-row{display:flex;justify-content:space-between;padding:11px;border:1px solid #2d4149;border-radius:10px;background:#0d1a20;margin:6px 0;font-size:11px}.g70-row b{color:#efd18e}.g70-note{font-size:9px;line-height:1.5;color:#81929a}.g70-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.g70-actions button{min-height:40px;border:1px solid #675537;border-radius:9px;background:#17232a;color:#ead8b3}';document.head.appendChild(c)}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g70]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.g70;if(a==='close')document.getElementById('tgG70')?.classList.remove('show');else if(a==='local'){setMode('local');render()}else if(a==='export'){const data=JSON.stringify(snapshot());try{navigator.clipboard?.writeText(data)}catch(_){};emit('territory:server-snapshot',{data});alert('Снимок состояния подготовлен.');}},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g70-open]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
 window.TerritoryServer={version:VERSION,state:st,ensure,snapshot,stateDigest,queue,ack,setMode,connect,drain,applyServerPatch,localAction,status,open};
 ensure(); save('g70-init');
})();
