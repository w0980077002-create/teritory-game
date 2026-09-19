/* Territory G74 — Telegram Identity / Player ID Foundation
   Local-first identity bridge. Telegram WebApp data is read when available,
   but server verification is intentionally deferred to the future backend. */
(function(){'use strict';
 const KEY='territory_save_v1';
 const st=window.TerritoryStore?.state||window.TerritoryCore?.getState?.()||{};
 st.identity=st.identity&&typeof st.identity==='object'?st.identity:{};
 function id(){return 'tg_'+Math.random().toString(36).slice(2)+Date.now().toString(36);}
 function save(reason){try{window.TerritoryStore?.saveNow?.(reason||'identity')||localStorage.setItem(KEY,JSON.stringify(st));}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){} }}
 function readTelegram(){
   const tg=window.Telegram?.WebApp;
   const u=tg?.initDataUnsafe?.user;
   return {available:!!tg,hasInitData:!!(tg&&tg.initData),user:u?{id:String(u.id||''),firstName:String(u.first_name||''),lastName:String(u.last_name||''),username:String(u.username||''),languageCode:String(u.language_code||'')} : null};
 }
 function ensure(){
   if(!st.identity.playerId)st.identity.playerId=id();
   const t=readTelegram();
   st.identity.telegramAvailable=t.available;
   st.identity.telegramDataPresent=t.hasInitData;
   if(t.user){st.identity.telegramId=t.user.id;st.identity.firstName=t.user.firstName;st.identity.lastName=t.user.lastName;st.identity.username=t.user.username;st.identity.languageCode=t.user.languageCode;st.identity.displayName=(t.user.username?'@'+t.user.username:[t.user.firstName,t.user.lastName].filter(Boolean).join(' ')||st.name||'Игрок Sdolars');}
   else st.identity.displayName=st.identity.displayName||String(st.name||'Игрок Sdolars');
   st.identity.version='G74';
   return st.identity;
 }
 function snapshot(){const x=ensure();return JSON.parse(JSON.stringify(x));}
 function queueIdentity(){ensure();if(window.TerritoryServer?.queue){window.TerritoryServer.queue('identity.snapshot',{identity:snapshot()});}save('identity-queue');}
 function open(){
   ensure();
   const old=document.getElementById('tg74-identity'); if(old)old.remove();
   const x=st.identity;
   const verified=x.telegramDataPresent?'Данные Telegram доступны клиенту':'Telegram ID пока не передан';
   const ov=document.createElement('div');ov.id='tg74-identity';
   ov.innerHTML='<div class="tg74-card"><div class="tg74-head"><div><small>SDOLARS · IDENTITY</small><h2>Идентичность игрока</h2></div><button data-g74-close>✕</button></div><div class="tg74-row"><span>Player ID</span><b>'+x.playerId+'</b></div><div class="tg74-row"><span>Имя</span><b>'+esc(x.displayName)+'</b></div><div class="tg74-row"><span>Telegram</span><b>'+esc(verified)+'</b></div><p class="tg74-note">Это локальный фундамент. Настоящая серверная проверка Telegram initData будет выполняться на сервере, а не в браузере.</p><button class="tg74-primary" data-g74-sync>📡 Подготовить идентичность</button></div>';
   document.body.appendChild(ov);
   ov.addEventListener('click',e=>{if(e.target.closest('[data-g74-close]')){ov.remove();return;}if(e.target.closest('[data-g74-sync]')){queueIdentity();e.target.closest('[data-g74-sync]').textContent='✓ В очередь сервера';}});
 }
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function inject(){
   const ov=document.getElementById('tg72-social'); if(!ov)return;
   if(ov.querySelector('[data-g74-identity]'))return;
   const nav=ov.querySelector('nav'); if(!nav)return;
   const b=document.createElement('button');b.type='button';b.dataset.g74Identity='1';b.textContent='Telegram ID';nav.appendChild(b);
   b.addEventListener('click',e=>{e.preventDefault();open();});
 }
 const css=document.createElement('style');css.textContent='#tg74-identity{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,8,13,.82);font-family:system-ui,sans-serif}#tg74-identity .tg74-card{width:min(420px,94vw);max-height:90vh;overflow:auto;background:linear-gradient(180deg,#17212c,#0c141c);border:1px solid #465568;border-radius:18px;box-shadow:0 18px 50px #000b;color:#e9eef3;padding:16px}.tg74-head{display:flex;justify-content:space-between;gap:12px}.tg74-head small{font-size:9px;letter-spacing:2px;color:#9eacbb}.tg74-head h2{margin:4px 0 14px;font-size:22px}.tg74-head button{border:0;background:#263442;color:#dce4eb;border-radius:9px;width:34px;height:34px}.tg74-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #2d3946}.tg74-row span{color:#93a2b1}.tg74-row b{max-width:62%;text-align:right;word-break:break-all}.tg74-note{font-size:12px;line-height:17px;color:#aeb9c4}.tg74-primary{width:100%;padding:12px;border:1px solid #9b7136;border-radius:10px;background:#332919;color:#f2d39a;font-weight:700}';document.head.appendChild(css);
 ensure();
 const mo=new MutationObserver(inject); mo.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(inject,0);
 window.TerritoryIdentity={version:'G74',state:st,ensure,snapshot,queue:queueIdentity,open};
})();
