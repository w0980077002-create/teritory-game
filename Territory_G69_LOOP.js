/* Territory G69 — Gameplay Loop Core
   Connects existing systems without replacing them:
   PvE/Arena/quests/economy/character/city progression.
   No new combat engine and no city visual changes. */
(function(){'use strict';
 const Store=window.TerritoryStore;
 if(!Store)return;
 const st=Store.state;
 const KEY='territory_save_v1';
 const today=()=>new Date().toISOString().slice(0,10);
 const ensure=()=>{
   st.g69=st.g69||{};
   st.g69.day=st.g69.day||today();
   if(st.g69.day!==today()){st.g69.day=today();st.g69.pveToday=0;st.g69.arenaToday=0;st.g69.buysToday=0;st.g69.repairsToday=0;}
   for(const k of ['pveToday','arenaToday','buysToday','repairsToday','loopXp','loopCoins'])st.g69[k]=Math.max(0,Number(st.g69[k]||0));
 };
 const save=reason=>{try{Store.saveNow?.(reason||'g69')}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}}};
 const emit=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
 function mark(type,amount=1){ensure();const map={pve:'pveToday',arena:'arenaToday',buy:'buysToday',repair:'repairsToday'};const k=map[type];if(!k)return;st.g69[k]+=Math.max(0,Number(amount)||0);save('loop:'+type);emit('territory:loop',{type,amount,state:st.g69});}
 function reward(){ensure();const p=window.TerritoryProgression;
   const pve=st.g69.pveToday>=3, arena=st.g69.arenaToday>=2, buy=st.g69.buysToday>=1;
   const claims=st.g69.claims||(st.g69.claims=[]); const out=[];
   const grant=(id,coins,xp)=>{if(claims.includes(id))return;claims.push(id);st.coins=(Number(st.coins)||0)+coins;st.exp=(Number(st.exp)||0)+xp;out.push({id,coins,xp});};
   if(pve)grant('pve3',120,30); if(arena)grant('arena2',100,20); if(buy)grant('buy1',80,15);
   if(out.length){st.g69.loopCoins+=out.reduce((a,x)=>a+x.coins,0);st.g69.loopXp+=out.reduce((a,x)=>a+x.xp,0);if(typeof window.render==='function')window.render();save('loop-reward');}
   return out;
 }
 function snapshot(){ensure();return {day:st.g69.day,pveToday:st.g69.pveToday,arenaToday:st.g69.arenaToday,buysToday:st.g69.buysToday,repairsToday:st.g69.repairsToday,loopCoins:st.g69.loopCoins,loopXp:st.g69.loopXp,claims:[...(st.g69.claims||[])]};}
 function open(){ensure();reward();let o=document.getElementById('tgG69');if(!o){o=document.createElement('div');o.id='tgG69';o.innerHTML='<div class="g69-card"><div class="g69-head"><h2>🔄 Игровой цикл</h2><button data-g69="close">✕</button></div><p class="g69-sub">Твои действия связываются в одну прогрессию Sdolars.</p><div id="g69Body"></div></div>';document.body.appendChild(o)}
   const s=snapshot(); const rows=[['⚔️ PvE',s.pveToday,'3 победы'],['🏟️ Арена',s.arenaToday,'2 боя'],['🛒 Покупки',s.buysToday,'1 покупка'],['🔨 Ремонт',s.repairsToday,'учёт ремонта']];
   o.querySelector('#g69Body').innerHTML=rows.map(r=>`<div class="g69-row"><div><b>${r[0]}</b><small>${r[2]}</small></div><strong>${r[1]}</strong></div>`).join('')+`<div class="g69-reward"><b>Награды цикла</b><span>🪙 ${s.loopCoins} · ⭐ ${s.loopXp} XP</span></div><div class="g69-note">Задания, экономика, персонаж и развитие города остаются отдельными модулями; этот слой только связывает их прогресс.</div>`;
   o.classList.add('show');
 }
 function css(){if(document.getElementById('g69css'))return;const c=document.createElement('style');c.id='g69css';c.textContent=`#tgG69{position:fixed;inset:0;z-index:100040;display:none;align-items:flex-end;justify-content:center;background:rgba(2,5,8,.82);padding:10px;box-sizing:border-box}#tgG69.show{display:flex}.g69-card{width:min(620px,100%);border:1px solid #735c3d;border-radius:20px 20px 0 0;background:linear-gradient(180deg,#17242c,#091015);color:#eee4d4;padding:14px;box-shadow:0 -18px 60px #000b}.g69-head{display:flex;align-items:center;gap:8px}.g69-head h2{margin:0;flex:1;color:#efd08e;font:700 21px Georgia,serif}.g69-head button{width:40px;height:40px;border:1px solid #665338;border-radius:10px;background:#142027;color:#efd08e;font-weight:900}.g69-sub{font-size:11px;color:#9aa9af}.g69-row{display:flex;justify-content:space-between;align-items:center;padding:11px;border:1px solid #2d4149;border-radius:11px;background:#0d1a20;margin:6px 0}.g69-row small{display:block;color:#899aa2;font-size:9px;margin-top:3px}.g69-row strong{font-size:18px;color:#efd18c}.g69-reward{margin-top:9px;padding:12px;border:1px solid #7d633e;border-radius:12px;background:#211b14;display:flex;justify-content:space-between;gap:8px}.g69-reward span{color:#f0d28d}.g69-note{margin-top:9px;font-size:9px;line-height:1.4;color:#7f9199}`;document.head.appendChild(c)}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g69]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.g69==='close')document.getElementById('tgG69')?.classList.remove('show')},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g69-open]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-screen="profile"],[data-g59="profile"],#g40-profile');if(!b)return; /* profile stays owned by existing character UI */},true);
 window.addEventListener('territory:character-updated',()=>{ensure();reward()});
 window.addEventListener('territory:economy',()=>{ensure();reward()});
 window.addEventListener('territory:loop-mark',e=>{if(e.detail?.type)mark(e.detail.type,e.detail.amount||1)});
 window.TerritoryLoop={version:'G69',state:st,mark,reward,snapshot,open};
 css(); ensure(); save('g69-init');
})();
