/* Territory G78 — Real WebSocket Client
   Connects G75 Presence/Party to the G77 Cloudflare Worker.
   PvE, Arena and city visuals remain untouched. */
(function(){'use strict';
 const Store=window.TerritoryStore;
 if(!Store)return;
 const st=Store.state;
 const SERVER='https://territory-sdolars-server.w0660077702.workers.dev';
 const WS=SERVER.replace(/^http/,'ws')+'/api/ws';
 const tg=()=>window.Telegram?.WebApp||null;
 const initData=()=>String(tg()?.initData||'');
 st.social=st.social&&typeof st.social==='object'?st.social:{};
 st.social.realtime=st.social.realtime&&typeof st.social.realtime==='object'?st.social.realtime:{};
 const rt=st.social.realtime;
 rt.version='G78'; rt.server=SERVER; rt.ws=WS; rt.connected=!!rt.connected; rt.authenticated=!!rt.authenticated;
 rt.online=Array.isArray(rt.online)?rt.online:[];
 let socket=null, reconnectTimer=0, pingTimer=0, attempts=0, manualClose=false;
 function save(){try{Store.saveNow?.('g78-realtime')}catch(e){try{localStorage.setItem('territory_save_v1',JSON.stringify(st))}catch(_){} }}
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function notify(text){st.social.notifications=Array.isArray(st.social.notifications)?st.social.notifications:[];st.social.notifications.push({text,at:Date.now()});if(st.social.notifications.length>50)st.social.notifications=st.social.notifications.slice(-50);save();}
 function setOnline(list){rt.online=Array.isArray(list)?list:[];if(window.TerritoryPresence?.state){window.TerritoryPresence.state.friendsOnline=rt.online.map(x=>({id:x.id,name:x.name,level:1,online:true}));window.TerritoryPresence.state.lastSeen=Date.now();}save();emit('territory:presence',{online:rt.online});}
 function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}));}
 function send(obj){if(socket?.readyState===WebSocket.OPEN){socket.send(JSON.stringify(obj));return true}return false;}
 function updateUi(){const ov=document.getElementById('tg72-social');if(!ov)return;const note=ov.querySelector('[data-g78-status]');if(note)note.innerHTML=rt.connected?'🟢 Сервер realtime подключён':'⚪ Сервер realtime не подключён';}
 function handle(data){if(!data||typeof data!=='object')return;
   if(data.type==='hello'){if(initData())send({type:'auth',initData:initData()});return;}
   if(data.type==='authenticated'){rt.authenticated=true;rt.player=data.player||null;setOnline(data.online||[]);attempts=0;notify('Realtime: сервер подключён');updateUi();emit('territory:realtime-auth',{player:data.player});return;}
   if(data.type==='auth_error'){rt.authenticated=false;notify('Realtime: ошибка авторизации');updateUi();return;}
   if(data.type==='presence'){setOnline(data.online||[]);updateUi();return;}
   if(data.type==='pong'){rt.lastPong=Date.now();return;}
   if(data.type==='party_invite'){const from=data.from||{};notify(`Приглашение в группу от ${from.name||'игрока'}`);emit('territory:party-invite',data);if(window.TerritoryParty?.receiveInvite)window.TerritoryParty.receiveInvite(data);return;}
   if(data.type==='chat'){const from=data.from||{};const msg={name:from.name||'Игрок',text:String(data.text||'').slice(0,500),at:Number(data.at)||Date.now(),remote:true};st.social.messages=Array.isArray(st.social.messages)?st.social.messages:[];st.social.messages.push(msg);if(st.social.messages.length>50)st.social.messages=st.social.messages.slice(-50);save();emit('territory:chat',msg);const open=document.getElementById('tg72-social');if(open&&window.TerritorySocial?.open)window.TerritorySocial.open('chat');return;}
 }
 function connect(){if(manualClose||!initData()||socket?.readyState===WebSocket.OPEN||socket?.readyState===WebSocket.CONNECTING)return;clearTimeout(reconnectTimer);try{socket=new WebSocket(WS);}catch(e){schedule();return}
   socket.addEventListener('open',()=>{rt.connected=true;rt.lastConnect=Date.now();updateUi();send({type:'auth',initData:initData()});startPing();emit('territory:realtime-open',{});});
   socket.addEventListener('message',e=>{try{handle(JSON.parse(e.data))}catch(_){}});
   socket.addEventListener('close',()=>{rt.connected=false;rt.authenticated=false;stopPing();updateUi();emit('territory:realtime-close',{});schedule();});
   socket.addEventListener('error',()=>{rt.lastError='WebSocket error';});
 }
 function schedule(){if(manualClose||!initData())return;attempts=Math.min(attempts+1,6);const delay=Math.min(30000,1000*Math.pow(2,attempts-1));clearTimeout(reconnectTimer);reconnectTimer=setTimeout(connect,delay);}
 function startPing(){clearInterval(pingTimer);pingTimer=setInterval(()=>{if(!send({type:'ping'})){clearInterval(pingTimer)}},25000);}
 function stopPing(){clearInterval(pingTimer);pingTimer=0;}
 function setReady(value){if(window.TerritoryPresence?.setReady)window.TerritoryPresence.setReady(!!value);else{st.social.presence=st.social.presence||{};st.social.presence.ready=!!value;save()}send({type:'ready',value:!!value});}
 function invite(targetId,partyId){return send({type:'party_invite',targetId:String(targetId||''),partyId:String(partyId||'')});}
 function sendChat(text){const value=String(text||'').trim().slice(0,500);if(!value)return false;return send({type:'chat',text:value});}
 function status(){return {version:'G78',server:SERVER,ws:WS,telegram:!!initData(),connected:rt.connected,authenticated:rt.authenticated,online:rt.online.length,lastPong:rt.lastPong||0};}
 function close(){manualClose=true;clearTimeout(reconnectTimer);stopPing();try{socket?.close()}catch(_){}socket=null;rt.connected=false;rt.authenticated=false;save();updateUi();}
 // Capture chat before the local G72 form handler so messages use the real server when available.
 document.addEventListener('submit',e=>{const f=e.target.closest('[data-tg72-chat]');if(!f||!rt.connected||!rt.authenticated)return;const input=f.querySelector('input');const value=(input?.value||'').trim();if(!value)return;e.preventDefault();e.stopImmediatePropagation();if(sendChat(value)){if(input)input.value='';}},true);
 // Capture the G75 ready control before its local-only handler when realtime is available.
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g75-ready]');if(!b||!rt.connected||!rt.authenticated)return;e.preventDefault();e.stopImmediatePropagation();const next=!(window.TerritoryPresence?.state?.ready);setReady(next);},true);
 const css=document.createElement('style');css.textContent='.g78-status{margin:8px 0;padding:7px 9px;border:1px solid #ffffff18;border-radius:9px;background:#0d171e;color:#9db0bd;font-size:10px}.g78-status b{color:#efd18e}';document.head.appendChild(css);
 window.addEventListener('territory:server-auth',()=>connect());
 window.addEventListener('online',()=>connect());
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&rt.authenticated)connect();});
 window.TerritoryRealtime={version:'G78',state:rt,connect,close,status,send:send,sendChat,invite,setReady};
 setTimeout(()=>{if(initData())connect();},1200);
})();
