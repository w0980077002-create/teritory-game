/* Territory G75 — Player Presence / Party Ready Foundation
   Local-first presence model. Online state is a prototype until a server heartbeat exists. */
(function(){'use strict';
 const st=window.TerritoryStore?.state||window.TerritoryCore?.getState?.()||{};
 st.social=st.social&&typeof st.social==='object'?st.social:{};
 st.social.presence=st.social.presence&&typeof st.social.presence==='object'?st.social.presence:{};
 const p=st.social.presence;
 p.status=p.status||'online';
 p.ready=!!p.ready;
 p.lastSeen=Date.now();
 p.friendsOnline=Array.isArray(p.friendsOnline)?p.friendsOnline:[];
 p.version='G75';
 function save(){try{window.TerritoryStore?.saveNow?.('presence')||localStorage.setItem('territory_save_v1',JSON.stringify(st));}catch(e){}}
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function setReady(v){p.ready=!!v;p.lastSeen=Date.now();save();renderIntoSocial();}
 function heartbeat(){p.lastSeen=Date.now();if(p.status!=='away')p.status='online';save();}
 function setAway(){p.status='away';p.lastSeen=Date.now();save();}
 function statusText(x){return x==='online'?'🟢 Онлайн':x==='away'?'🟡 Отошёл':'⚫ Оффлайн';}
 function panel(){
   const party=st.social.party||{members:[],invites:[]};
   const members=Array.isArray(party.members)?party.members:[];
   const onlineFriends=(Array.isArray(st.social.friends)?st.social.friends:[]).filter(f=>f&&f.online!==false);
   return `<div class="tg75-card"><div class="tg75-title"><b>Статус игрока</b><span>${statusText(p.status)}</span></div><div class="tg75-me"><div class="tg75-avatar">👤</div><div><b>${esc(st.name||'SSS')}</b><small>Player ID: ${esc(st.identity?.playerId||'локальный')}</small></div></div><div class="tg75-ready"><span>Готов к группе / Arena</span><button data-g75-ready>${p.ready?'✓ ГОТОВ':'ГОТОВ'}</button></div><div class="tg75-divider"></div><b>Кто доступен</b>${onlineFriends.length?onlineFriends.slice(0,10).map(f=>`<div class="tg75-row"><span>🟢 ${esc(f.name||'Игрок')}</span><small>ур. ${Number(f.level||1)}</small></div>`).join(''):'<div class="tg75-empty">Пока нет подтверждённых онлайн-друзей.</div>'}<div class="tg75-divider"></div><b>Группа</b>${members.length?members.map(m=>`<div class="tg75-row"><span>${m.online===false?'⚫':'🟢'} ${esc(m.name||'Игрок')}</span><small>${m.ready?'✓ готов':'ожидает'}</small></div>`).join(''):'<div class="tg75-empty">Группа пока не собрана.</div>'}<p class="tg75-note">Онлайн-статус локальный. Настоящий статус между игроками появится после серверного heartbeat.</p></div>`;
 }
 function renderIntoSocial(){
   const ov=document.getElementById('tg72-social');if(!ov)return;
   const nav=ov.querySelector('nav');if(!nav)return;
   let b=nav.querySelector('[data-g75-tab]');
   if(!b){b=document.createElement('button');b.dataset.g75Tab='presence';b.textContent='Онлайн';nav.appendChild(b);}
   if(b.classList.contains('on')){const main=ov.querySelector('main');if(main)main.innerHTML=panel();}
 }
 document.addEventListener('click',e=>{
   const tab=e.target.closest('[data-g75-tab]');
   if(tab){e.preventDefault();e.stopImmediatePropagation();const ov=document.getElementById('tg72-social');if(!ov)return;ov.querySelectorAll('[data-tg72-tab]').forEach(x=>x.classList.remove('on'));ov.querySelectorAll('[data-g75-tab]').forEach(x=>x.classList.remove('on'));tab.classList.add('on');const main=ov.querySelector('main');if(main)main.innerHTML=panel();return;}
   const ready=e.target.closest('[data-g75-ready]');
   if(ready){e.preventDefault();e.stopImmediatePropagation();setReady(!p.ready);}
 },true);
 const css=document.createElement('style');css.textContent='.tg75-card{padding:14px;border-radius:14px;background:rgba(20,29,39,.96);border:1px solid #3b4b5c;color:#e7edf2}.tg75-title,.tg75-me,.tg75-ready,.tg75-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.tg75-title{margin-bottom:12px}.tg75-title span{font-size:11px}.tg75-me{justify-content:flex-start;padding:10px 0}.tg75-avatar{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:#263544;font-size:24px}.tg75-me small{display:block;color:#93a3b3;font-size:9px;margin-top:3px}.tg75-ready{margin-top:8px;padding:9px;border-radius:10px;background:#101923}.tg75-ready button{border:1px solid #8d6a36;border-radius:8px;background:#2d2519;color:#f0d39a;padding:7px 10px;font-weight:800}.tg75-row{padding:8px 0;border-bottom:1px solid #ffffff12}.tg75-row small,.tg75-empty,.tg75-note{color:#96a5b4;font-size:10px}.tg75-divider{height:1px;background:#ffffff12;margin:12px 0}.tg75-note{line-height:15px;margin:12px 0 0}';document.head.appendChild(css);
 heartbeat();
 setInterval(()=>{if(document.visibilityState==='visible')heartbeat();},30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')heartbeat();else setAway();});
 const mo=new MutationObserver(renderIntoSocial);mo.observe(document.documentElement,{childList:true,subtree:true});
 setTimeout(renderIntoSocial,0);
 window.TerritoryPresence={version:'G75',state:p,setReady,heartbeat,setAway,panel};
})();
