/* Territory G76 — Real Server Bridge
   Connects the local-first client to the existing Cloudflare Worker over HTTP.
   Telegram initData is sent to the server for verification; no bot token is ever
   exposed to the browser. WebSocket/multiplayer transport remains a later step. */
(function(){'use strict';
 const Store=window.TerritoryStore;
 if(!Store)return;
 const st=Store.state;
 const SERVER='https://territory-sdolars-server.w0660077702.workers.dev';
 const KEY='territory_save_v1';
 const g70=()=>window.TerritoryServer;
 let authenticated=false, syncing=false, timer=0;
 function tg(){return window.Telegram?.WebApp||null}
 function initData(){return String(tg()?.initData||'')}
 function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}))}
 function saveLocal(reason){try{Store.saveNow?.(reason||'g76')}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){} }}
 function safeApply(serverState){
   if(!serverState||typeof serverState!=='object')return false;
   if(g70?.()) return g70().applyServerPatch(serverState);
   Object.assign(st,serverState); saveLocal('g76-server-state'); return true;
 }
 async function request(path,body){
   const r=await fetch(SERVER+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
   let data=null; try{data=await r.json()}catch(_){}
   if(!r.ok||!data?.ok)throw new Error(data?.error||('HTTP '+r.status));
   return data;
 }
 async function health(){
   const r=await fetch(SERVER+'/api/health',{cache:'no-store'}); let d=null;try{d=await r.json()}catch(_){}
   return !!(r.ok&&d?.ok);
 }
 async function auth(){
   const data=initData();
   if(!data)return {ok:false,reason:'not-telegram'};
   const result=await request('/api/auth',{initData:data});
   authenticated=true;
   if(result.state)safeApply(result.state);
   st.g76=st.g76||{}; st.g76.authenticated=true;st.g76.server=SERVER;st.g76.lastAuth=Date.now();st.g76.serverPlayerId=String(result.user?.id||'');st.g76.created=!!result.created;
   if(g70?.())g70().setMode('server');
   saveLocal('g76-auth'); emit('territory:server-auth',{user:result.user,created:result.created});
   return {ok:true,result};
 }
 async function saveRemote(reason){
   if(!authenticated||syncing)return false;
   const data=initData(); if(!data)return false;
   syncing=true;
   try{
     const result=await request('/api/save',{initData:data,state:Store.state});
     st.g76=st.g76||{};st.g76.lastSave=Date.now();st.g76.lastSaveReason=reason||'sync';saveLocal('g76-save');
     if(g70?.())g70().ack(g70().status().seq);
     emit('territory:server-save',{savedAt:result.savedAt,reason:reason||'sync'});
     return true;
   }catch(e){st.g76=st.g76||{};st.g76.lastError=String(e.message||e);emit('territory:server-error',{stage:'save',error:String(e.message||e)});return false}
   finally{syncing=false}
 }
 function scheduleSave(reason){clearTimeout(timer);timer=setTimeout(()=>saveRemote(reason),2500)}
 function status(){st.g76=st.g76||{};return {server:SERVER,telegram:!!initData(),authenticated:authenticated||!!st.g76.authenticated,lastAuth:st.g76.lastAuth||0,lastSave:st.g76.lastSave||0,lastError:st.g76.lastError||''}}
 function open(){
   let o=document.getElementById('tgG76');if(!o){o=document.createElement('div');o.id='tgG76';o.innerHTML='<div class="g76-card"><div class="g76-head"><div><small>SDOLARS · SERVER</small><h2>Сервер Territory</h2></div><button data-g76="close">✕</button></div><div id="g76Body"></div><div class="g76-actions"><button data-g76="auth">🔐 Подключить Telegram</button><button data-g76="save">💾 Синхронизировать</button></div></div>';document.body.appendChild(o);}
   render();o.classList.add('show');
 }
 function render(){const o=document.getElementById('tgG76'),b=document.getElementById('g76Body');if(!o||!b)return;const s=status();b.innerHTML='<div class="g76-row"><span>Worker</span><b>'+SERVER.replace('https://','')+'</b></div><div class="g76-row"><span>Telegram initData</span><b>'+(s.telegram?'доступен':'нет')+'</b></div><div class="g76-row"><span>Авторизация</span><b>'+(s.authenticated?'✓ подключено':'не подключено')+'</b></div><div class="g76-row"><span>Последнее сохранение</span><b>'+(s.lastSave?new Date(s.lastSave).toLocaleTimeString():'—')+'</b></div>'+(s.lastError?'<p class="g76-error">'+esc(s.lastError)+'</p>':'')+'<p class="g76-note">Сейчас используется защищённый HTTP API Worker. WebSocket и настоящий multiplayer подключаются следующим этапом.</p>';}
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 const css=document.createElement('style');css.textContent='#tgG76{position:fixed;inset:0;z-index:100070;display:none;align-items:flex-end;justify-content:center;background:rgba(1,4,7,.84);padding:10px;box-sizing:border-box}#tgG76.show{display:flex}.g76-card{width:min(620px,100%);border:1px solid #6d5635;border-radius:20px 20px 0 0;background:linear-gradient(180deg,#17242c,#091015);color:#eee4d4;padding:15px;box-sizing:border-box;box-shadow:0 -18px 55px #000b}.g76-head{display:flex;justify-content:space-between;align-items:flex-start}.g76-head small{color:#a89472;font-size:9px;letter-spacing:1.2px}.g76-head h2{margin:3px 0 12px;color:#efd18e;font:700 23px Georgia,serif}.g76-head button{width:40px;height:40px;border:1px solid #665338;border-radius:10px;background:#142027;color:#efd18e;font-weight:900}.g76-row{display:flex;justify-content:space-between;gap:12px;padding:10px;border:1px solid #2d4149;border-radius:10px;background:#0d1a20;margin:6px 0;font-size:10px}.g76-row b{color:#efd18e;text-align:right;word-break:break-all}.g76-note,.g76-error{font-size:9px;line-height:1.5;color:#81929a}.g76-error{color:#e6a7a7}.g76-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.g76-actions button{min-height:42px;border:1px solid #675537;border-radius:9px;background:#17232a;color:#ead8b3}';document.head.appendChild(css);
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-g76]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const a=b.dataset.g76;if(a==='close'){document.getElementById('tgG76')?.classList.remove('show');return}if(a==='auth'){b.disabled=true;b.textContent='Подключение…';try{await auth();b.textContent='✓ Telegram подключён';}catch(err){st.g76=st.g76||{};st.g76.lastError=String(err.message||err);b.textContent='⚠️ Ошибка';}render();b.disabled=false;}else if(a==='save'){b.disabled=true;b.textContent='Сохранение…';await saveRemote('manual');b.textContent='💾 Синхронизировать';render();b.disabled=false;}},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g76-open]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
 window.addEventListener('territory:server-event',()=>scheduleSave('event'));
 window.addEventListener('pagehide',()=>{if(authenticated){try{navigator.sendBeacon?.(SERVER+'/api/save',new Blob([JSON.stringify({initData:initData(),state:Store.state})],{type:'application/json'}))}catch(_){} }});
 async function boot(){st.g76=st.g76||{};st.g76.server=SERVER;if(!initData()){st.g76.mode='local';return}try{await auth();}catch(e){st.g76.lastError=String(e.message||e);emit('territory:server-error',{stage:'auth',error:String(e.message||e)});}}
 window.TerritoryServerBridge={version:'G76',server:SERVER,auth,save:saveRemote,health,status,open};
 setTimeout(boot,900);
})();
