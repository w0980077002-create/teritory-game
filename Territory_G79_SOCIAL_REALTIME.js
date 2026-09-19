/* Territory G79 — Social Realtime Integration
   Connects the existing Social Center to G78 realtime transport without changing
   the approved City visual, PvE or Arena rules. */
(function(){'use strict';
 const Store=window.TerritoryStore;
 const social=window.TerritorySocial;
 if(!Store||!social)return;
 const st=Store.state;
 st.social=st.social&&typeof st.social==='object'?st.social:{};
 st.social.party=st.social.party&&typeof st.social.party==='object'?st.social.party:{id:null,name:'',members:[],invites:[]};
 st.social.notifications=Array.isArray(st.social.notifications)?st.social.notifications:[];
 function save(){try{Store.saveNow?.('g79-social')}catch(e){try{localStorage.setItem('territory_save_v1',JSON.stringify(st))}catch(_){} }}
 function notify(text,type='info'){st.social.notifications.push({text:String(text||''),type,at:Date.now()});if(st.social.notifications.length>50)st.social.notifications=st.social.notifications.slice(-50);save();render();}
 function ensureParty(){st.social.party=st.social.party||{id:null,name:'',members:[],invites:[]};st.social.party.members=Array.isArray(st.social.party.members)?st.social.party.members:[];st.social.party.invites=Array.isArray(st.social.party.invites)?st.social.party.invites:[];return st.social.party;}
 function partyPanel(){const p=ensureParty(), me=st.identity?.playerId||'local';const online=window.TerritoryRealtime?.state?.online||[];const members=p.members;return `<div class="tg79-card"><div class="tg79-title"><b>Группа</b><span>${members.length?members.length+'/5':'пусто'}</span></div><div class="tg79-note">Группа готова к серверным приглашениям. Реальное состояние участников приходит через G78.</div>${members.length?members.map(m=>`<div class="tg79-row"><span>🟢 ${esc(m.name||'Игрок')}</span><small>${m.id===me?'Вы':(m.ready?'✓ готов':'ожидает')}</small></div>`).join(''):'<div class="tg79-empty">Пока в группе только вы. Приглашения появятся здесь.</div>'}<div class="tg79-online"><b>Сейчас онлайн: ${online.length}</b>${online.slice(0,8).map(x=>`<div class="tg79-row"><span>🟢 ${esc(x.name||'Игрок')}</span><small>${x.ready?'✓ готов':'онлайн'}</small></div>`).join('')}</div></div>`;}
 function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
 function realtimePanel(){const s=window.TerritoryRealtime?.status?.()||{connected:false,authenticated:false,online:0};return `<div class="tg79-card"><div class="tg79-title"><b>Realtime</b><span>${s.connected&&s.authenticated?'🟢 Онлайн':'⚪ Ожидание'}</span></div><div class="tg79-row"><span>Сервер</span><small>${s.connected?'подключён':'не подключён'}</small></div><div class="tg79-row"><span>Игроков онлайн</span><small>${Number(s.online||0)}</small></div><div class="tg79-row"><span>Telegram</span><small>${s.telegram?'✓ подтверждён':'не доступен'}</small></div><button data-g79-reconnect>🔄 Обновить соединение</button></div>`;}
 const originalOpen=social.open;
 function render(){const ov=document.getElementById('tg72-social');if(!ov)return;const tab=ov.querySelector('[data-tg72-tab].on')?.dataset.tg72Tab||ov.querySelector('[data-g79-tab].on')?.dataset.g79Tab; if(tab==='party'){const main=ov.querySelector('main');if(main)main.innerHTML=partyPanel();} else if(tab==='realtime'){const main=ov.querySelector('main');if(main)main.innerHTML=realtimePanel();}}
 social.notify=notify;
 social.party=function(){social.open('party');};
 function addTabs(ov){const nav=ov?.querySelector('nav');if(!nav)return; if(!nav.querySelector('[data-g79-tab="party"]')){const b=document.createElement('button');b.dataset.g79Tab='party';b.textContent='Группа';nav.appendChild(b);} if(!nav.querySelector('[data-g79-tab="realtime"]')){const b=document.createElement('button');b.dataset.g79Tab='realtime';b.textContent='Онлайн';nav.appendChild(b);}}
 function refreshOnline(){const ov=document.getElementById('tg72-social');if(ov)addTabs(ov);}
 social.open=function(tab='profile'){originalOpen(tab);const ov=document.getElementById('tg72-social');addTabs(ov); if(tab==='party'||tab==='realtime'){const main=ov.querySelector('main');if(main)main.innerHTML=tab==='party'?partyPanel():realtimePanel();}};
 document.addEventListener('click',e=>{const tab=e.target.closest('[data-g79-tab]');if(tab){e.preventDefault();e.stopImmediatePropagation();const ov=document.getElementById('tg72-social');if(!ov)return;ov.querySelectorAll('[data-tg72-tab],[data-g79-tab]').forEach(x=>x.classList.remove('on'));tab.classList.add('on');const main=ov.querySelector('main');if(main)main.innerHTML=tab.dataset.g79Tab==='party'?partyPanel():realtimePanel();return;} const rec=e.target.closest('[data-g79-reconnect]');if(rec){e.preventDefault();e.stopImmediatePropagation();window.TerritoryRealtime?.connect?.();setTimeout(render,400);}} ,true);
 window.addEventListener('territory:realtime-auth',()=>{notify('Realtime: игрок подтверждён','realtime');refreshOnline();});
 window.addEventListener('territory:presence',()=>{refreshOnline();render();});
 window.addEventListener('territory:party-invite',e=>{const d=e.detail||{},p=ensureParty();p.invites.push({from:d.from?.name||'Игрок',partyId:d.partyId||'',at:Date.now()});if(p.invites.length>20)p.invites=p.invites.slice(-20);notify('Новое приглашение в группу от '+(d.from?.name||'игрока'),'invite');});
 window.addEventListener('territory:chat',()=>{refreshOnline();});
 const css=document.createElement('style');css.textContent='.tg79-card{padding:14px;border-radius:14px;background:rgba(20,29,39,.96);border:1px solid #4a5a69;color:#e7edf2}.tg79-title,.tg79-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.tg79-title{margin-bottom:10px}.tg79-title span,.tg79-row small{font-size:10px;color:#9aa9b6}.tg79-row{padding:8px 0;border-bottom:1px solid #ffffff12}.tg79-note,.tg79-empty{font-size:10px;line-height:1.5;color:#95a5b2;margin:8px 0}.tg79-online{margin-top:12px}.tg79-card button{margin-top:12px;width:100%;min-height:40px;border:1px solid #8d6a36;border-radius:9px;background:#2d2519;color:#f0d39a;font-weight:800}';document.head.appendChild(css);
 refreshOnline();
 const observer=new MutationObserver(()=>{const ov=document.getElementById('tg72-social');if(ov)addTabs(ov);});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 window.TerritorySocialRealtime={version:'G79',notify,party:()=>social.open('party'),realtime:()=>social.open('realtime')};
})();
