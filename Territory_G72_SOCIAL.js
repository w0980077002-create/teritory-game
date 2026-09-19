/* Territory G72 — Social / Profile / Chat Foundation
   Local-first social shell. Ready for future Telegram/WebSocket transport. */
(function(){'use strict';
 const KEY='territory_save_v1';
 const st=window.TerritoryStore?.state || window.TerritoryCore?.getState?.() || {};
 st.social=st.social&&typeof st.social==='object'?st.social:{};
 st.social.friends=Array.isArray(st.social.friends)?st.social.friends:[];
 st.social.messages=Array.isArray(st.social.messages)?st.social.messages:[];
 st.social.notifications=Array.isArray(st.social.notifications)?st.social.notifications:[];
 function save(){try{if(window.TerritoryStore?.saveNow)window.TerritoryStore.saveNow('social');else localStorage.setItem(KEY,JSON.stringify(st));}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){} }}
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function close(){document.querySelector('#tg72-social')?.remove();}
 function addMessage(name,text){st.social.messages.push({name,text,at:Date.now()});if(st.social.messages.length>50)st.social.messages=st.social.messages.slice(-50);save();}
 function render(tab){
   const name=esc(st.name||'SSS'), level=Number(st.level||1), rep=Number(st.cityRep||0);
   const friends=st.social.friends;
   const msgs=st.social.messages.slice(-12);
   const body=tab==='profile'?`<div class="tg72-card tg72-profile"><div class="tg72-avatar">👤</div><div><b>${name}</b><small>Уровень ${level} · Sdolars</small><span>Репутация города: ${rep}</span></div></div><div class="tg72-stats"><div><b>${Number(st.pveWins||0)}</b><small>PvE побед</small></div><div><b>${Number(st.arenaWins||0)}</b><small>Arena</small></div><div><b>${friends.length}</b><small>Друзья</small></div></div>`
   :tab==='friends'?`<div class="tg72-card"><b>Мои друзья</b><p class="tg72-muted">Локальный список для прототипа. Позже сюда подключим Telegram/сервер.</p>${friends.length?friends.map((f,i)=>`<div class="tg72-row"><span>🟢 ${esc(f.name)}</span><small>ур. ${Number(f.level||1)}</small></div>`).join(''):'<div class="tg72-empty">Пока друзей нет.</div>'}<button data-tg72-add>＋ Добавить тестового игрока</button></div>`
   :tab==='chat'?`<div class="tg72-card tg72-chat"><b>Городской чат</b><div class="tg72-messages">${msgs.length?msgs.map(m=>`<div><strong>${esc(m.name)}</strong><span>${esc(m.text)}</span></div>`).join(''):'<div class="tg72-empty">Чат пуст. Напиши первое сообщение.</div>'}</div><form data-tg72-chat><input maxlength="120" placeholder="Сообщение..." autocomplete="off"><button>➤</button></form></div>`
   :`<div class="tg72-card"><b>Уведомления</b><p class="tg72-muted">Сюда будут приходить приглашения, сообщения и события Arena.</p>${st.social.notifications.length?st.social.notifications.slice(-8).map(x=>`<div class="tg72-row">🔔 ${esc(x.text)}</div>`).join(''):'<div class="tg72-empty">Новых уведомлений нет.</div>'}</div>`;
   return `<div class="tg72-head"><div><small>S D O L A R S · SOCIAL</small><h2>Социальный центр</h2></div><button data-tg72-close>✕</button></div><nav>${[['profile','Профиль'],['friends','Друзья'],['chat','Чат'],['notifications','Уведомления']].map(x=>`<button data-tg72-tab="${x[0]}" class="${tab===x[0]?'on':''}">${x[1]}</button>`).join('')}</nav><main>${body}</main>`;
 }
 function open(tab='profile'){
   close(); const ov=document.createElement('div');ov.id='tg72-social';ov.innerHTML=render(tab);document.body.appendChild(ov);
   ov.addEventListener('click',e=>{const b=e.target.closest('[data-tg72-tab]');if(b){ov.innerHTML=render(b.dataset.tg72Tab);return;}if(e.target.closest('[data-tg72-close]')){close();return;}const add=e.target.closest('[data-tg72-add]');if(add){st.social.friends.push({name:'Игрок Sdolars',level:Math.max(1,levelSafe())});save();ov.innerHTML=render('friends');}});
   ov.addEventListener('submit',e=>{const f=e.target.closest('[data-tg72-chat]');if(!f)return;e.preventDefault();const input=f.querySelector('input');const text=(input?.value||'').trim();if(!text)return;addMessage(st.name||'SSS',text);ov.innerHTML=render('chat');});
 }
 function levelSafe(){return Number(st.level||1);}
 document.addEventListener('click',e=>{
   const b=e.target.closest('[data-ui="profile"],[data-ui="messages"]');if(!b)return;
   e.preventDefault();e.stopImmediatePropagation();open(b.dataset.ui==='messages'?'chat':'profile');
 },true);
 window.TerritorySocial={open,close,addMessage,state:st,version:'G72'};
})();
