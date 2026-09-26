(function(){
'use strict';
const DEFAULT={
 profile:{displayName:'Игрок',level:1,vip:0},
 level:1,coins:0,gems:0,redGems:0,battleStones:30,energy:100,maxEnergy:100,hp:100,maxHp:100,
 xp:0,xpNext:100,exp:0,expToNext:100,dice:10,pos:0,equipment:Array(7).fill(null),
 activeFollower:null,auto:false,
 currentChapter:1,chapterStage:1,chapterProgress:0,chapterBossUnlocked:false,chapterBossDefeated:false,chapterCompleted:false,
 pve:{chapter:1,stage:1,progress:0,bossPending:false,bossActive:false,bossDefeated:0}
};
window.TerritoryStore=window.TerritoryStore||{};
const Store=window.TerritoryStore;
function clone(v){return JSON.parse(JSON.stringify(v))}
function normalize(saved){
 const s=Object.assign(clone(DEFAULT),saved||{});
 s.profile=Object.assign({},DEFAULT.profile,s.profile||{});
 s.level=Math.max(1,Number(s.level||s.profile.level)||1);s.profile.level=s.level;
 s.xp=Math.max(0,Number(s.xp??s.exp)||0);s.xpNext=Math.max(1,Number(s.xpNext??s.expToNext)||100);
 s.exp=s.xp;s.expToNext=s.xpNext;
 s.coins=Math.max(0,Number(s.coins)||0);s.gems=Math.max(0,Number(s.gems)||0);s.redGems=Math.max(0,Number(s.redGems)||0);s.battleStones=Math.max(0,Number(s.battleStones??30)||0);
 s.energy=Math.max(0,Number(s.energy)||0);s.maxEnergy=Math.max(1,Number(s.maxEnergy)||100);
 s.maxHp=Math.max(1,Number(s.maxHp)||100);s.hp=Math.max(0,Math.min(s.maxHp,Number(s.hp??s.maxHp)||s.maxHp));
 s.equipment=Array.isArray(s.equipment)?s.equipment.slice(0,7):Array(7).fill(null);while(s.equipment.length<7)s.equipment.push(null);
 s.currentChapter=Math.max(1,Math.min(240,Number(s.currentChapter||s.pve?.chapter)||1));
 s.chapterStage=Math.max(1,Number(s.chapterStage||s.pve?.stage)||1);
 s.chapterProgress=Math.max(0,Math.min(100,Number(s.chapterProgress??s.pve?.progress)||0));
 s.chapterBossUnlocked=Boolean(s.chapterBossUnlocked||s.pve?.bossPending||s.chapterProgress>=100);
 s.chapterBossDefeated=Boolean(s.chapterBossDefeated||false);
 s.pve=Object.assign({},DEFAULT.pve,s.pve||{},{chapter:s.currentChapter,stage:s.chapterStage,progress:s.chapterProgress,bossPending:s.chapterBossUnlocked,bossActive:Boolean(s.pve?.bossActive)});
 return s;
}
let saved=null;try{saved=JSON.parse(localStorage.getItem('territory_store_v1')||'null')}catch(_){}
Store.state=normalize(saved);
Store.saveNow=function(){try{localStorage.setItem('territory_store_v1',JSON.stringify(Store.state))}catch(_){};window.dispatchEvent(new CustomEvent('territory:state-changed'))};
Store.addXp=function(amount){
 let s=Store.state;s.xp+=Math.max(0,Number(amount)||0);
 while(s.xp>=s.xpNext){s.xp-=s.xpNext;s.level++;s.profile.level=s.level;s.xpNext=Math.floor(s.xpNext*1.12+25)}
 s.exp=s.xp;s.expToNext=s.xpNext;Store.saveNow()
};
Store.getDerivedStats=function(){return {maxHp:Store.state.maxHp,strength:125+Store.state.level*2,defense:98+Store.state.level,agility:101+Store.state.level}};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function show(id){
 const aliases={market:'shop',casino:'games',districts:'quests'};id=aliases[id]||id;
 $$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
 document.body.dataset.screen=id;window.dispatchEvent(new CustomEvent('territory:screen',{detail:id}));
 if(id==='roadmap')roadmap();if(id==='inventory')inventory();if(id==='shop')shop();if(id==='games')games();
}
window.TerritoryUI={show,home:()=>show('home')};window.showScreen=show;
function modal(title,body){$('#modalBody').innerHTML='<h2>'+title+'</h2>'+body;$('#modal').classList.add('show')}
$('#modalClose').onclick=()=>$('#modal').classList.remove('show');
function roadmap(){
 const s=Store.state,n=$('#roadNodes');if(!n)return;n.innerHTML='';
 for(let i=1;i<=4;i++){const b=document.createElement('button');b.className='node '+(i<s.chapterStage?'done ':'')+(i===Math.min(4,s.chapterStage)?'current':'');b.textContent=i;b.onclick=()=>{s.chapterStage=i;Store.saveNow();roadmap()};n.appendChild(b)}
 $('#roadChapter').textContent='ГЛАВА '+s.currentChapter;$('#stageTitle').textContent=s.currentChapter+'-'+Math.min(4,s.chapterStage);$('#stageProgress').textContent=s.chapterProgress+'%';
 $('#roadBoss').style.display=s.chapterBossUnlocked?'block':'none';
}
const inv=[['⚔️','Топор','Оружие'],['🪖','Шлем','Броня'],['🛡️','Доспех','Броня'],['🎗️','Пояс','Аксессуар'],['🥾','Сапоги','Аксессуар'],['💍','Кольцо','Аксессуар'],['🔮','Амулет','Аксессуар'],['🧪','Эликсир HP','Предмет']];
function cards(id,arr){const el=$(id);if(!el)return;el.innerHTML=arr.map((x,i)=>`<button class="card" data-item="${i}"><div>${x[0]}</div><b>${x[1]}</b><span>${x[2]}</span></button>`).join('');$$('#'+id+' .card').forEach(b=>b.onclick=()=>modal('Предмет',`<p>${arr[+b.dataset.item][1]}</p>`))}
function inventory(){
 const groups={Оружие:inv.slice(0,1),Броня:inv.slice(1,3),Аксессуары:inv.slice(3,7),Предметы:inv.slice(7)};
 const tabs=$$('#inventory .tabs button');
 tabs.forEach((b,i)=>b.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));b.classList.add('active');cards('#inventoryGrid',groups[b.textContent.trim()]||inv)});
 cards('#inventoryGrid',groups[tabs.find(x=>x.classList.contains('active'))?.textContent.trim()||'Оружие']||inv);
}
function shop(){
 const items=[['🧪','Зелье HP','Восстановление'],['🔵','Энергия','Восстановление'],['🔴','Атака','Бафф'],['🟡','Защита','Бафф'],['🟣','Адреналин','Возрождение'],['💠','Ускорение','Бой']];
 const groups={Эликсиры:items.slice(0,2),Оружие:items.slice(2,3),Броня:items.slice(3,4),Боевые:items.slice(4)};
 const tabs=$$('#shop .tabs button');
 tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));b.classList.add('active');cards('#shopGrid',groups[b.textContent.trim()]||items)});
 cards('#shopGrid',groups[tabs.find(x=>x.classList.contains('active'))?.textContent.trim()||'Эликсиры']||items);
 $$('[data-coins]').forEach(e=>e.textContent=Math.floor(Store.state.coins).toLocaleString('ru-RU'))
}
function games(){const b=$('#board');if(!b)return;b.innerHTML='';for(let i=0;i<25;i++){const c=document.createElement('button');c.className='cell '+(i===Store.state.pos?'active':'');c.textContent=i+1;c.onclick=()=>{Store.state.pos=i;Store.saveNow();games()};b.appendChild(c)}$$('[data-dice]').forEach(x=>x.textContent=Store.state.dice)}
$('#roll').onclick=()=>{if(!Store.state.dice)return modal('Кубики','<p>Кубики закончились.</p>');Store.state.dice--;Store.state.pos=(Store.state.pos+1+Math.floor(Math.random()*6))%25;Store.saveNow();games();$('#rollLog').textContent='Позиция '+(Store.state.pos+1)};
$('#followersBtn').onclick=()=>modal('Последователи','<p>Лиабро — Крит</p><p>Тералель — Защита</p><p>Король-коров — Лечение</p><p>Морт — Уклонение</p><p>Каменное Лицо — Контроль</p>');
$$('[data-home]').forEach(b=>b.onclick=()=>show('home'));$$('[data-roadmap]').forEach(b=>b.onclick=()=>show('map'));
$('#roadBattle').onclick=()=>window.HomeRebuild?.startRunner?.(false);$('#roadBoss').onclick=()=>window.HomeRebuild?.openBoss?.();
function paintGlobal(){
 const s=Store.state,p=s.profile||{};$('#heroName').textContent=p.displayName||'Игрок';$('#heroLevel').textContent='Lv. '+s.level+' · VIP '+(p.vip||0);$('#heroHp').textContent=Math.floor(s.hp).toLocaleString('ru-RU');$$('[data-coins]').forEach(e=>e.textContent=Math.floor(s.coins).toLocaleString('ru-RU'));
 const pct=s.chapterProgress;const qp=$('#questProgress');if(qp)qp.textContent=pct+'%';const qb=$('#questBar');if(qb)qb.style.width=pct+'%';
}
window.addEventListener('territory:state-changed',paintGlobal);
inventory();shop();games();paintGlobal();
})();