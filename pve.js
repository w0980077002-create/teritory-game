/* Territory Game — STEP-05-C
   Full PvE district progression:
   3 encounters per district -> boss -> stars -> next district unlock.
   Persistent progression lives in TerritoryStore.state.pve.
*/
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const save=r=>window.TerritoryStore?.saveNow?.(r||'pve-progress');
const $=(s,r=document)=>r.querySelector(s);
const districts=[
 {id:'harbor',name:'ПОРТ',icon:'⚓',req:1,energy:[8,9,11],coins:[90,120,180],xp:[18,24,38],enemies:['Портовый головорез','Контрабандист','Морской рейдер']},
 {id:'walls',name:'СЕВЕРНЫЕ СТЕНЫ',icon:'🛡️',req:2,energy:[10,11,14],coins:[125,165,240],xp:[25,32,50],enemies:['Дозорный стены','Северный воин','Щитоносец']},
 {id:'quarter',name:'ЦЕНТРАЛЬНЫЙ КВАРТАЛ',icon:'🏰',req:3,energy:[12,14,17],coins:[170,220,320],xp:[34,44,68],enemies:['Городской наёмник','Варяжский страж','Капитан квартала']},
 {id:'old-town',name:'СТАРЫЙ ГОРОД',icon:'🏚️',req:5,energy:[15,17,21],coins:[240,310,450],xp:[48,62,96],enemies:['Разбойник','Теневой боец','Старший наёмник']},
 {id:'fortress',name:'КРЕПОСТЬ',icon:'👑',req:8,energy:[20,23,28],coins:[350,450,700],xp:[70,90,145],enemies:['Элитный страж','Командир крепости','Ярл крепости']}
];
let battle=null;

function ensure(){
 const s=S(); s.pve=s.pve&&typeof s.pve==='object'?s.pve:{};s.pve.districts=s.pve.districts||{};
 districts.forEach((d,i)=>{
   let x=s.pve.districts[d.id];
   if(!x)x={stage:0,wins:0,stars:0,completed:false,bossDefeated:false,unlocked:i===0};
   /* migrate STEP-05-A/B progress */
   if(x.stage===undefined){
     const oldWins=Math.max(0,Number(x.wins)||0);
     x.stage=x.completed?0:Math.min(2,oldWins);
   }
   x.stage=Math.max(0,Math.min(2,Number(x.stage)||0));
   x.wins=Math.max(0,Number(x.wins)||0);
   x.stars=Math.max(0,Math.min(3,Number(x.stars)||0));
   x.completed=Boolean(x.completed);
   x.bossDefeated=Boolean(x.bossDefeated);
   x.unlocked=Boolean(x.unlocked)||(i===0);
   s.pve.districts[d.id]=x;
 });
 const lv=Math.max(1,Number(s.level)||1);
 districts.forEach(d=>{if(lv>=d.req && d.id==='harbor')s.pve.districts[d.id].unlocked=true;});
 /* A district after the first is unlocked by completing the previous district. */
 districts.forEach((d,i)=>{if(i>0 && s.pve.districts[districts[i-1].id]?.completed)s.pve.districts[d.id].unlocked=true;});
}
function follower(){
 const s=S(),id=s.followers?.activeFollower,f=id&&window.Followers?.get?.(id),cfg=id&&window.Followers?.CATALOG?.[id],st=id&&window.Followers?.getStats?.(id);
 return f?.owned&&cfg?{id,f,cfg,st:st||{}}:null;
}
function district(id){return districts.find(d=>d.id===id)||districts[0]}
function stageOf(d){return Math.max(0,Math.min(2,Number(S().pve?.districts?.[d.id]?.stage)||0))}
function open(){ensure();renderCity()}
function renderCity(){
 ensure();const root=$('#districts');if(!root)return;const s=S(),lv=Number(s.level)||1,current=s.pve.current||'harbor';
 root.innerHTML=`<header class="pve-head"><button class="back" data-screen="home">‹</button><div><small>ГОРОД</small><h2>РАЙОНЫ</h2></div><div class="pve-wallet">⚡ ${Math.floor(s.energy||0)}/${Math.floor(s.maxEnergy||200)}</div></header>
 <div class="pve-intro"><div><span>🏙️</span><div><b>ГОРОД</b><small>Пройди три этапа района, победи босса и открой следующий.</small></div></div><strong>Lv.${lv}</strong></div>
 <div class="pve-map">${districts.map((d,i)=>{
   const st=s.pve.districts[d.id]||{},u=!!st.unlocked;
   return `<button class="pve-district ${u?'':'locked'} ${current===d.id?'selected':''}" data-pve-district="${d.id}" ${u?'':'disabled'}>
    <span class="pve-icon">${u?d.icon:'🔒'}</span><span class="pve-copy"><b>${d.name}</b><small>${u?`${st.completed?'Район пройден':'Этап '+(stageOf(d)+1)+' из 3'} · ${d.enemies[stageOf(d)]}`:`Открывается после ${i?'прохождения предыдущего района':'уровня '+d.req}`}</small><em>${u?`⭐ ${st.stars||0}/3 · Победы ${st.wins||0}`:`Требуется ${i?'прохождение района':'Lv.'+d.req}`}</em></span><i>›</i>
   </button>`;
 }).join('')}</div><div class="pve-panel">${panel(current)}</div>`;
}
function panel(id){
 const d=district(id),s=S(),st=s.pve.districts[id]||{},stage=stageOf(d),f=follower(),cost=d.energy[stage],can=Number(s.energy||0)>=cost,complete=!!st.completed;
 const label=complete?'РАЙОН ПРОЙДЕН':`ЭТАП ${stage+1} / 3`;
 return `<div class="pve-selected"><div class="pve-selected-title"><span>${d.icon}</span><div><small>${label}</small><h3>${d.name}</h3></div></div>
 <div class="pve-stage-track">${[0,1,2].map(i=>`<span class="${i<stage||complete?'done':''} ${i===stage&&!complete?'active':''}">${i===2?'👑':i+1}</span>`).join('')}</div>
 <p>${complete?'Все три этапа пройдены. Можно повторять район ради ресурсов и XP.':'Следующий бой: '+d.enemies[stage]+(stage===2?' — БОСС РАЙОНА.':'')+'.'}</p>
 <div class="pve-enemies">${d.enemies.map((n,i)=>`<div class="${i<stage||complete?'cleared':''}"><b>${i===2?'👑':i+1}</b><span>${n}</span><small>${i<stage||complete?'✓ Пройден':i===stage?'Текущий этап':'Закрыт'}</small></div>`).join('')}</div>
 <div class="pve-follower-line">${f?`${f.cfg.icon||'✦'} Спутник: <b>${f.cfg.name}</b> · ур.${f.f.level}`:'✦ Спутник не выбран'}</div>
 <div class="pve-reward-row"><span>⚡ ${cost}</span><span>🪙 +${d.coins[stage]}</span><span>✨ +${d.xp[stage]} XP</span></div>
 <button class="pve-start" data-pve-start="${d.id}" ${can?'':'disabled'}>${complete?'⚔️ ПОВТОРИТЬ БОЙ':'⚔️ НАЧАТЬ ЭТАП'}</button>
 ${can?'':`<small class="pve-warn">Недостаточно энергии. Нужно ещё ${cost-Math.floor(Number(s.energy)||0)}.</small>`}
 <div class="pve-progress">Прогресс: <b>${complete?'3 / 3':stage+' / 3'}</b> · ⭐ <b>${st.stars||0}/3</b></div></div>`;
}
function start(id){
 ensure();const d=district(id),s=S(),st=s.pve.districts[id];if(!st?.unlocked)return renderCity();
 const stage=stageOf(d),cost=d.energy[stage];if(Number(s.energy||0)<cost)return renderCity();
 s.pve.current=id;s.energy=Math.max(0,Number(s.energy||0)-cost);save('pve-energy');
 const f=follower(),lv=Math.max(1,Number(s.level)||1),fs=f?.st||{};
 const p={hp:Math.max(1,Number(s.hp)||Number(s.maxHp)||120),maxHp:Math.max(1,Number(s.maxHp)||120),attack:Math.max(1,Number(s.strength)||5),defense:Math.max(0,Number(s.defense)||0),dodge:.03,crit:.06};
 if(f){p.attack+=Math.floor((Number(fs.attack)||0)/4);p.defense+=Math.floor((Number(fs.defense)||0)/4);p.maxHp+=Math.floor((Number(fs.hp)||0)/20);p.hp=Math.min(p.maxHp,p.hp+Math.floor((Number(fs.hp)||0)/20));p.dodge=Math.min(.7,p.dodge+(Number(fs.dodge)||0)/100);p.crit=Math.min(.65,p.crit+(Number(fs.critChance)||0)/200);}
 const boss=stage===2,scale=boss?1.28:stage===1?1.1:1;
 const hp=Math.round((90+lv*16+stage*35)*scale);
 battle={district:d,stage,boss,player:p,enemy:{name:d.enemies[stage],level:lv+stage,hp,maxHp:hp,attack:Math.round((7+lv*2+stage*4)*scale),defense:Math.round((2+lv+stage*2)*scale),dodge:.03+stage*.02,crit:.05+stage*.02},follower:f,turn:1,attackReady:true,guard:false,control:false,logs:[`⚔️ ${d.name}: этап ${stage+1}/3`,f?`${f.cfg.icon||'✦'} ${f.cfg.name} вступает в бой.`:'⚠️ Спутник не выбран.']};
 renderBattle();
}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function renderBattle(){
 const r=$('#districts');if(!r||!battle)return;const p=battle.player,e=battle.enemy,f=battle.follower;
 r.innerHTML=`<div class="pve-battle"><header class="pve-battle-head"><button class="back" data-pve-city>‹</button><div><small>${battle.district.name} · ${battle.boss?'БОСС':'ЭТАП '+(battle.stage+1)}</small><h2>⚔️ БОЙ</h2></div><b>ХОД ${battle.turn}</b></header>
 <div class="pve-battle-progress">${[0,1,2].map(i=>`<span class="${i<battle.stage?'done':''} ${i===battle.stage?'active':''}">${i===2?'👑':i+1}</span>`).join('')}</div>
 <div class="pve-arena"><div class="pve-fighter player"><span class="pve-avatar">🪓</span><b>Ты</b><small>Lv.${Number(S().level)||1}</small><div class="pve-hp"><i style="width:${Math.max(0,p.hp/p.maxHp*100)}%"></i></div><em>${Math.max(0,p.hp)} / ${p.maxHp}</em></div>
 <div class="pve-vs">VS</div><div class="pve-fighter enemy ${battle.boss?'boss':''}"><span class="pve-avatar">${battle.boss?'👑':'⚔️'}</span><b>${esc(e.name)}</b><small>Lv.${e.level}</small><div class="pve-hp"><i style="width:${Math.max(0,e.hp/e.maxHp*100)}%"></i></div><em>${Math.max(0,e.hp)} / ${e.maxHp}</em></div></div>
 <div class="pve-follower-battle">${f?`${f.cfg.icon||'✦'} <b>${esc(f.cfg.name)}</b> · ${esc(f.cfg.role)} · ур.${f.f.level}`:'Спутник не выбран'}</div>
 <div class="pve-battle-actions"><button data-pve-attack>⚔️ АТАКА</button><button data-pve-guard>🛡️ ЗАЩИТА</button><button data-pve-follower>✦ СПОСОБНОСТЬ</button></div>
 <div class="pve-log">${battle.logs.slice(-7).map(x=>`<div>${esc(x)}</div>`).join('')}</div><button class="pve-leave" data-pve-city>Выйти</button></div>`;
}
function nextTurn(){if(!battle||battle.ended)return;battle.turn++;battle.attackReady=true;battle.guard=false;renderBattle()}
function playerAttack(){
 if(!battle||battle.ended||!battle.attackReady)return;battle.attackReady=false;const p=battle.player,e=battle.enemy;let dmg=Math.max(1,p.attack-e.defense);
 if(Math.random()<e.dodge)battle.logs.push(`💨 ${e.name} увернулся.`);
 else{if(Math.random()<p.crit){dmg=Math.floor(dmg*1.8);battle.logs.push(`💥 Критический удар: ${dmg}`)}else battle.logs.push(`⚔️ Ты нанёс ${dmg} урона.`);e.hp=Math.max(0,e.hp-dmg)}
 if(e.hp<=0)return win();enemyTurn();
}
function guard(){if(!battle||battle.ended||!battle.attackReady)return;battle.attackReady=false;battle.guard=true;battle.logs.push('🛡️ Ты приготовился к удару.');enemyTurn()}
function followerAbility(){
 if(!battle||battle.ended||!battle.attackReady||!battle.follower)return;
 const f=battle.follower,st=f.st||{},id=f.id;battle.attackReady=false;
 if(id==='liabro'){const dmg=Math.max(1,Math.floor(Math.max(1,battle.player.attack-battle.enemy.defense)*1.9));battle.enemy.hp=Math.max(0,battle.enemy.hp-dmg);battle.logs.push(`⚔️ Лиабро: усиленный крит −${dmg}.`)}
 else if(id==='teralel'){battle.guard=true;battle.player.defense+=Math.max(1,Math.floor((Number(st.defense)||0)/5));battle.logs.push('🛡️ Тералель: защитная стойка активна.')}
 else if(id==='king_cows'){const heal=Math.max(5,Math.floor((Number(st.heal)||10)*.7));battle.player.hp=Math.min(battle.player.maxHp,battle.player.hp+heal);battle.logs.push(`❤️ Король-коров: +${heal} HP.`)}
 else if(id==='mort'){battle.player.dodge=Math.min(.7,battle.player.dodge+(Number(st.dodge)||8)/100);battle.logs.push('🌀 Морт: уклонение усилено.')}
 else if(id==='stone_face'){const chance=Math.min(.8,(Number(st.control)||10)/100);if(Math.random()<chance){battle.control=true;battle.logs.push(`💀 Каменное Лицо: ${battle.enemy.name} оглушён.`)}else battle.logs.push('💀 Каменное Лицо: контроль не сработал.')}
 if(battle.enemy.hp<=0)return win();enemyTurn()
}
function enemyTurn(){
 if(!battle||battle.ended)return;if(battle.control){battle.control=false;battle.logs.push(`💀 ${battle.enemy.name} пропускает ход.`);return nextTurn()}
 const p=battle.player,e=battle.enemy;let dmg=Math.max(1,e.attack-p.defense);
 if(Math.random()<p.dodge)battle.logs.push('💨 Ты увернулся.')
 else{if(battle.guard)dmg=Math.max(1,Math.floor(dmg*.35));p.hp=Math.max(0,p.hp-dmg);battle.logs.push(`⚔️ ${e.name} нанёс ${dmg} урона.`)}
 if(p.hp<=0)return lose();nextTurn()
}
function win(){
 if(!battle)return;const b=battle,s=S(),d=b.district,st=s.pve.districts[d.id],firstTime=!st.completed;st.wins=(Number(st.wins)||0)+1;st.stars=Math.max(st.stars,Math.min(3,b.stage+1));
 if(b.boss){st.completed=true;st.bossDefeated=true;st.stage=0;const idx=districts.findIndex(x=>x.id===d.id);if(idx>=0&&districts[idx+1])s.pve.districts[districts[idx+1].id].unlocked=true}
 else st.stage=Math.min(2,b.stage+1);
 s.hp=Math.max(1,b.player.hp);s.coins=Math.max(0,Number(s.coins||0)+d.coins[b.stage]);s.exp=Math.max(0,Number(s.exp||0)+d.xp[b.stage]);
 if(b.boss&&firstTime){s.gems=Math.max(0,Number(s.gems||0)+5);s.coins+=Math.round(d.coins[b.stage]*.5);s.exp+=Math.round(d.xp[b.stage]*.5)}
 save('pve-stage-win');b.ended=true;b.logs.push(`🏆 Победа! +${d.coins[b.stage]} 🪙 · +${d.xp[b.stage]} XP`);if(b.boss&&firstTime)b.logs.push('🎁 Первое прохождение: +5 💎 и бонусная награда.');renderBattle();setTimeout(()=>showEnd(true),300)
}
function lose(){if(!battle)return;const b=battle,s=S();s.hp=1;save('pve-stage-lose');b.ended=true;b.logs.push('☠️ Поражение. Прогресс этапа сохранён.');renderBattle();setTimeout(()=>showEnd(false),300)}
function showEnd(win){
 const b=battle,d=b.district,st=S().pve.districts[d.id],complete=!!st.completed;
 const text=win?(b.boss?(complete?'👑 Район полностью пройден!':'Босс побеждён!'):'Этап пройден!'):'Бой окончен.';
 const layer=document.createElement('div');layer.className='pve-result';layer.innerHTML=`<div class="pve-result-card"><span>${win?(b.boss?'👑':'🏆'):'☠️'}</span><small>${win?'ПОБЕДА':'ПОРАЖЕНИЕ'}</small><h2>${esc(d.name)}</h2><b>${text}</b><div>${win?`<span>🪙 +${d.coins[b.stage]}</span><span>✨ +${d.xp[b.stage]} XP</span>${b.boss&&complete?'<span>🎁 +5 💎</span>':''}`:'<span>💪 Этап можно повторить</span>'}</div><button data-pve-close>ПРОДОЛЖИТЬ</button></div>`;document.body.appendChild(layer)
}
document.addEventListener('click',e=>{
 const d=e.target.closest?.('[data-pve-district]');if(d){ensure();S().pve.current=d.dataset.pveDistrict;save('pve-select');renderCity();return}
 const st=e.target.closest?.('[data-pve-start]');if(st){start(st.dataset.pveStart);return}
 if(e.target.closest?.('[data-pve-attack]'))return playerAttack();
 if(e.target.closest?.('[data-pve-guard]'))return guard();
 if(e.target.closest?.('[data-pve-follower]'))return followerAbility();
 if(e.target.closest?.('[data-pve-city]')){battle=null;renderCity();return}
 if(e.target.closest?.('[data-pve-close]')){document.querySelector('.pve-result')?.remove();battle=null;renderCity()}
});
document.addEventListener('territory:render',()=>{if($('#districts')?.classList.contains('active')&&!battle)renderCity()});
document.addEventListener('DOMContentLoaded',ensure);
window.PvEGame={open,render:renderCity,ensure,start};
})();