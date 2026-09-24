/* Territory Game — STEP-05-B
   Real PvE battle layer. District selection remains in STEP-05-A.
   Uses TerritoryStore and the currently selected follower.
*/
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const save=r=>window.TerritoryStore?.saveNow?.(r||'pve-battle');
const $=(s,r=document)=>r.querySelector(s);
const districts=[
{id:'harbor',name:'ПОРТ',icon:'⚓',req:1,energy:8,coins:90,xp:18,enemies:['Портовый головорез','Контрабандист','Морской рейдер']},
{id:'walls',name:'СЕВЕРНЫЕ СТЕНЫ',icon:'🛡️',req:2,energy:10,coins:125,xp:25,enemies:['Дозорный стены','Северный воин','Щитоносец']},
{id:'quarter',name:'ЦЕНТРАЛЬНЫЙ КВАРТАЛ',icon:'🏰',req:3,energy:12,coins:170,xp:34,enemies:['Городской наёмник','Варяжский страж','Капитан квартала']},
{id:'old-town',name:'СТАРЫЙ ГОРОД',icon:'🏚️',req:5,energy:15,coins:240,xp:48,enemies:['Разбойник','Теневой боец','Старший наёмник']},
{id:'fortress',name:'КРЕПОСТЬ',icon:'👑',req:8,energy:20,coins:350,xp:70,enemies:['Элитный страж','Командир крепости','Ярл крепости']}
];
let battle=null;

function ensure(){
 const s=S(); s.pve=s.pve&&typeof s.pve==='object'?s.pve:{}; s.pve.districts=s.pve.districts||{};
 districts.forEach((d,i)=>{if(!s.pve.districts[d.id])s.pve.districts[d.id]={wins:0,stars:0,bossDefeated:false,unlocked:i===0};});
 const lv=Math.max(1,Number(s.level)||1);districts.forEach(d=>{if(lv>=d.req)s.pve.districts[d.id].unlocked=true;});
}
function activeFollower(){
 const s=S(),id=s.followers?.activeFollower;
 const f=id&&window.Followers?.get?.(id),cfg=id&&window.Followers?.CATALOG?.[id],st=id&&window.Followers?.getStats?.(id);
 return f?.owned&&cfg?{id,f,cfg,st:st||{}}:null;
}
function district(id){return districts.find(d=>d.id===id)||districts[0]}
function open(){
 ensure(); renderCity();
}
function renderCity(){
 ensure(); const root=$('#districts');if(!root)return;const s=S(),lv=Number(s.level)||1,current=s.pve.current||'harbor';
 root.innerHTML=`<header class="pve-head"><button class="back" data-screen="home">‹</button><div><small>ГОРОД</small><h2>РАЙОНЫ</h2></div><div class="pve-wallet">⚡ ${Math.floor(s.energy||0)}/${Math.floor(s.maxEnergy||200)}</div></header>
 <div class="pve-intro"><div><span>🏙️</span><div><b>ГОРОД</b><small>Открывай районы, побеждай врагов и забирай награды.</small></div></div><strong>Lv.${lv}</strong></div>
 <div class="pve-map">${districts.map(d=>{const st=s.pve.districts[d.id]||{},u=!!st.unlocked;return `<button class="pve-district ${u?'':'locked'} ${current===d.id?'selected':''}" data-pve-district="${d.id}" ${u?'':'disabled'}><span class="pve-icon">${u?d.icon:'🔒'}</span><span class="pve-copy"><b>${d.name}</b><small>${u?enemySummary(d):`Открывается с уровня ${d.req}`}</small><em>${u?`Победы ${st.wins||0} · ⭐ ${st.stars||0}/3`:`Требуется Lv.${d.req}`}</em></span><i>›</i></button>`}).join('')}</div>
 <div class="pve-panel">${panel(current)}</div>`;
}
function enemySummary(d){return d.enemies.join(' · ')}
function panel(id){
 const d=district(id),s=S(),st=s.pve.districts[id]||{},f=activeFollower(),en=Number(s.energy||0),can=en>=d.energy;
 return `<div class="pve-selected"><div class="pve-selected-title"><span>${d.icon}</span><div><small>РАЙОН</small><h3>${d.name}</h3></div></div>
 <p>Проведи бой против трёх противников. Третий — усиленный этап района.</p>
 <div class="pve-enemies">${d.enemies.map((n,i)=>`<div><b>${i===2?'👑':'⚔️'}</b><span>${n}</span><small>${i===2?'Элитный':'Обычный'} · Lv.${Math.max(1,(Number(s.level)||1)+i)}</small></div>`).join('')}</div>
 <div class="pve-follower-line">${f?`${f.cfg.icon||'✦'} Спутник: <b>${f.cfg.name}</b> · ур.${f.f.level}`:'✦ Спутник не выбран'}</div>
 <div class="pve-reward-row"><span>⚡ ${d.energy}</span><span>🪙 +${d.coins}</span><span>✨ +${d.xp} XP</span></div>
 <button class="pve-start" data-pve-start="${d.id}" ${can?'':'disabled'}>⚔️ НАЧАТЬ БОЙ</button>
 ${can?'':`<small class="pve-warn">Недостаточно энергии. Нужно ещё ${d.energy-en}.</small>`}<div class="pve-progress">Победы: <b>${st.wins||0}</b> · Босс: <b>${st.bossDefeated?'побеждён':'не побеждён'}</b></div></div>`;
}
function start(id){
 ensure();const d=district(id),s=S(),st=s.pve.districts[id];if(!st?.unlocked||Number(s.energy||0)<d.energy)return renderCity();
 s.pve.current=id;s.energy=Math.max(0,Number(s.energy||0)-d.energy);save('pve-battle-energy');
 const f=activeFollower(),lv=Math.max(1,Number(s.level)||1),fs=f?.st||{};
 const player={hp:Math.max(1,Number(s.hp)||Number(s.maxHp)||120),maxHp:Math.max(1,Number(s.maxHp)||120),attack:Math.max(1,Number(s.strength)||5),defense:Math.max(0,Number(s.defense)||0),dodge:.03,crit:.06};
 if(f){player.attack+=Math.floor((Number(fs.attack)||0)/4);player.defense+=Math.floor((Number(fs.defense)||0)/4);player.maxHp+=Math.floor((Number(fs.hp)||0)/20);player.hp=Math.min(player.maxHp,player.hp+Math.floor((Number(fs.hp)||0)/20));player.dodge+=(Number(fs.dodge)||0)/100;player.crit+=(Number(fs.critChance)||0)/200;}
 const stage=Math.min(2,Math.floor((Number(st.wins)||0)/3));
 const enemy={name:d.enemies[stage],level:lv+stage,hp:90+lv*16+stage*35,maxHp:90+lv*16+stage*35,attack:7+lv*2+stage*4,defense:2+lv+stage*2,dodge:.03+stage*.02,crit:.05+stage*.02};
 battle={district:d,stage,player,enemy,follower:f,turn:1,attackReady:true,guard:false,logs:[`⚔️ Бой начался: ${d.name}`,f?`${f.cfg.icon||'✦'} ${f.cfg.name} вступает в бой.`:'⚠️ Спутник не выбран.'],ended:false,control:false};
 renderBattle();
}
function renderBattle(){
 const r=$('#districts');if(!r||!battle)return;
 const p=battle.player,e=battle.enemy,f=battle.follower;
 r.innerHTML=`<div class="pve-battle"><header class="pve-battle-head"><button class="back" data-pve-city>‹</button><div><small>${battle.district.name}</small><h2>⚔️ БОЙ</h2></div><b>ХОД ${battle.turn}</b></header>
 <div class="pve-arena"><div class="pve-fighter player"><span class="pve-avatar">🪓</span><b>Ты</b><small>Lv.${Number(S().level)||1}</small><div class="pve-hp"><i style="width:${p.hp/p.maxHp*100}%"></i></div><em>${Math.max(0,p.hp)} / ${p.maxHp}</em></div>
 <div class="pve-vs">VS</div><div class="pve-fighter enemy"><span class="pve-avatar">${battle.stage===2?'👑':'⚔️'}</span><b>${e.name}</b><small>Lv.${e.level}</small><div class="pve-hp"><i style="width:${e.hp/e.maxHp*100}%"></i></div><em>${Math.max(0,e.hp)} / ${e.maxHp}</em></div></div>
 <div class="pve-follower-battle">${f?`${f.cfg.icon||'✦'} <b>${f.cfg.name}</b> · ${f.cfg.role} · ур.${f.f.level}`:'Спутник не выбран'}</div>
 <div class="pve-battle-actions"><button data-pve-attack>⚔️ АТАКА</button><button data-pve-guard>🛡️ ЗАЩИТА</button><button data-pve-follower>✦ СПОСОБНОСТЬ</button></div>
 <div class="pve-log">${battle.logs.slice(-6).map(x=>`<div>${esc(x)}</div>`).join('')}</div><button class="pve-leave" data-pve-city>Выйти</button></div>`;
}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function playerAttack(){
 if(!battle||battle.ended||!battle.attackReady)return;
 battle.attackReady=false;const p=battle.player,e=battle.enemy;
 let dmg=Math.max(1,p.attack-e.defense);
 if(Math.random()<e.dodge){battle.logs.push(`💨 ${e.name} увернулся.`);}
 else if(Math.random()<p.crit){dmg=Math.floor(dmg*1.8);e.hp=Math.max(0,e.hp-dmg);battle.logs.push(`💥 Критический удар: ${dmg}`);}
 else{e.hp=Math.max(0,e.hp-dmg);battle.logs.push(`⚔️ Ты нанёс ${dmg} урона.`);}
 if(e.hp<=0)return win();
 enemyTurn();
}
function guard(){if(!battle||battle.ended||!battle.attackReady)return;battle.guard=true;battle.attackReady=false;battle.logs.push('🛡️ Ты готовишься принять удар.');enemyTurn();}
function followerAbility(){
 if(!battle||battle.ended||!battle.attackReady||!battle.follower)return;
 const f=battle.follower,st=f.st||{},id=f.id; battle.attackReady=false;
 if(id==='liabro'){const dmg=Math.max(1,Math.floor((battle.player.attack-battle.enemy.defense)*1.9));battle.enemy.hp=Math.max(0,battle.enemy.hp-dmg);battle.logs.push(`⚔️ Лиабро: усиленный критический удар −${dmg}.`);}
 else if(id==='teralel'){battle.guard=true;battle.player.defense+=Math.max(1,Math.floor((Number(st.defense)||0)/5));battle.logs.push(`🛡️ Тералель: защитная стойка.`);}
 else if(id==='king_cows'){const heal=Math.max(5,Math.floor((Number(st.heal)||10)*.7));battle.player.hp=Math.min(battle.player.maxHp,battle.player.hp+heal);battle.logs.push(`❤️ Король-коров: +${heal} HP.`);}
 else if(id==='mort'){battle.player.dodge=Math.min(.65,battle.player.dodge+(Number(st.dodge)||8)/100);battle.logs.push('🌀 Морт: уклонение усилено до следующего хода.');}
 else if(id==='stone_face'){const chance=Math.min(.8,(Number(st.control)||10)/100);if(Math.random()<chance){battle.control=true;battle.logs.push(`💀 Каменное Лицо: ${battle.enemy.name} оглушён.`);}else battle.logs.push('💀 Каменное Лицо: контроль не сработал.');}
 if(battle.enemy.hp<=0)return win();enemyTurn();
}
function enemyTurn(){
 if(!battle||battle.ended)return;
 if(battle.control){battle.control=false;battle.logs.push(`💀 ${battle.enemy.name} пропускает ход.`);nextTurn();return;}
 const p=battle.player,e=battle.enemy;let dmg=Math.max(1,e.attack-p.defense);
 if(Math.random()<p.dodge){battle.logs.push('💨 Ты увернулся.');}
 else{if(battle.guard)dmg=Math.max(1,Math.floor(dmg*.35));p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`⚔️ ${e.name} нанёс ${dmg} урона.`);}
 battle.guard=false;if(p.hp<=0)return lose();nextTurn();
}
function nextTurn(){battle.turn++;battle.attackReady=true;renderBattle();}
function win(){
 if(!battle)return;battle.ended=true;const s=S(),d=battle.district,st=s.pve.districts[d.id];
 st.wins=(Number(st.wins)||0)+1;st.stars=Math.min(3,Math.floor(st.wins/3));if(battle.stage===2)st.bossDefeated=true;
 s.hp=Math.max(1,battle.player.hp);s.coins=Math.max(0,Number(s.coins||0)+d.coins);s.exp=Math.max(0,Number(s.exp||0)+d.xp);save('pve-win');
 battle.logs.push(`🏆 Победа! +${d.coins} 🪙 · +${d.xp} XP`);renderBattle();setTimeout(()=>showEnd(true),350);
}
function lose(){if(!battle)return;battle.ended=true;const s=S();s.hp=1;save('pve-lose');battle.logs.push('☠️ Поражение. Энергия потрачена.');renderBattle();setTimeout(()=>showEnd(false),350);}
function showEnd(win){
 const layer=document.createElement('div');layer.className='pve-result';layer.innerHTML=`<div class="pve-result-card"><span>${win?'🏆':'☠️'}</span><small>${win?'ПОБЕДА':'ПОРАЖЕНИЕ'}</small><h2>${battle.enemy.name}</h2><b>${win?'Районный бой завершён.':'Бой окончен.'}</b><div>${win?`<span>🪙 +${battle.district.coins}</span><span>✨ +${battle.district.xp} XP</span>`:'<span>💪 Попробуй снова</span>'}</div><button data-pve-close>ПРОДОЛЖИТЬ</button></div>`;document.body.appendChild(layer);
}
document.addEventListener('click',e=>{
 const d=e.target.closest?.('[data-pve-district]');if(d){ensure();S().pve.current=d.dataset.pveDistrict;save('pve-select');renderCity();return}
 const st=e.target.closest?.('[data-pve-start]');if(st){start(st.dataset.pveStart);return}
 if(e.target.closest?.('[data-pve-attack]')){playerAttack();return}
 if(e.target.closest?.('[data-pve-guard]')){guard();return}
 if(e.target.closest?.('[data-pve-follower]')){followerAbility();return}
 if(e.target.closest?.('[data-pve-city]')){battle=null;renderCity();return}
 if(e.target.closest?.('[data-pve-close]')){document.querySelector('.pve-result')?.remove();battle=null;renderCity();}
});
document.addEventListener('territory:render',()=>{if($('#districts')?.classList.contains('active')&&!battle)renderCity();});
document.addEventListener('DOMContentLoaded',ensure);
window.PvEGame={open,render:renderCity,ensure,start};
})();