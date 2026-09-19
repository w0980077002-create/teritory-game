/* Territory G67 — Progression Core
   One progression contract for character level, city level and district unlocks.
   Uses the existing TerritoryStore state; does not replace PvE, Arena or City art.
*/
(function(){'use strict';
 const Store=window.TerritoryStore;if(!Store)return;
 const st=Store.state;
 const KEY='territory_save_v1';
 const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const cityRules=[
  {level:1,name:'Сердце Sdolars',desc:'Базовые районы города открыты.',districts:['center','forge','tavern','market','arena','gates']},
  {level:2,name:'Старый порт',desc:'Город расширился: открыт Старый порт.',districts:['port']},
  {level:3,name:'Старые руины',desc:'Открыта опасная зона за стеной.',districts:['ruins']},
  {level:4,name:'Новый рубеж',desc:'Следующий этап развития города. Контент будет добавлен позже.',districts:[]}
 ];
 function cityLevel(){return Math.max(1,num(st.cityLevel,1))}
 function playerLevel(){return Math.max(1,num(st.level,1))}
 function xpToNext(){return Math.max(1,num(st.maxExp,100))}
 function playerProgress(){return clamp(num(st.exp)/xpToNext()*100,0,100)}
 function save(reason){try{Store.saveNow(reason||'progression')}catch(_){try{Store.save()}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(__){}}}}
 function snapshot(){return {playerLevel:playerLevel(),playerXp:num(st.exp),playerMaxXp:xpToNext(),playerProgress:playerProgress(),cityLevel:cityLevel(),pveProgress:clamp(num(st.pveProgress),0,100),pveWins:Math.max(0,num(st.pveWins)),cityRep:Math.max(0,num(st.cityRep)),hunger:clamp(num(st.hunger,100),0,100)}}
 function districtUnlocked(id){if(['center','forge','tavern','market','arena','gates'].includes(id))return cityLevel()>=1;if(id==='port')return cityLevel()>=2;if(id==='ruins')return cityLevel()>=3;return false}
 function districtRequirement(id){if(['center','forge','tavern','market','arena','gates'].includes(id))return 1;if(id==='port')return 2;if(id==='ruins')return 3;return 99}
 function levelUp(){
  let leveled=0,need=xpToNext();
  while(num(st.exp)>=need&&leveled<20){st.exp-=need;st.level=playerLevel()+1;leveled++;need=xpToNext();}
  if(leveled){st.freePoints=num(st.freePoints)+leveled*3;st.maxHp=num(st.maxHp,120)+leveled*8;st.hp=clamp(num(st.hp),0,st.maxHp);save('player-level-up')}
  return leveled;
 }
 function advanceCity(){
  const old=cityLevel();const next=old+1;st.cityLevel=next;st.pveProgress=0;st.pveWins=num(st.pveWins);st.cityMilestones=Array.isArray(st.cityMilestones)?st.cityMilestones:[];
  if(!st.cityMilestones.includes(next)){st.cityMilestones.push(next);st.cityRep=num(st.cityRep)+2;}
  save('city-level-up');return {from:old,to:next,unlocked:cityRules.find(x=>x.level===next)?.districts||[]};
 }
 function reconcile(){
  st.cityLevel=Math.max(1,num(st.cityLevel,1));st.level=Math.max(1,num(st.level,1));st.pveProgress=clamp(num(st.pveProgress),0,100);st.hunger=clamp(num(st.hunger,100),0,100);st.cityMilestones=Array.isArray(st.cityMilestones)?st.cityMilestones:[];
  return snapshot();
 }
 function open(){
  reconcile();let o=document.getElementById('tgG67');if(!o){o=document.createElement('div');o.id='tgG67';o.innerHTML='<div class="g67-card"><button class="g67-x" type="button" data-g67="close">✕</button><div class="g67-kicker">SDOLARS · ПРОГРЕССИЯ</div><h2>Развитие города</h2><div id="g67Body"></div></div>';document.body.appendChild(o)}render();o.classList.add('show');}
 function render(){const o=document.getElementById('tgG67'),b=document.getElementById('g67Body');if(!o||!b)return;const s=snapshot();const city=cityRules.find(x=>x.level===s.cityLevel)||cityRules[cityRules.length-1];b.innerHTML=`<div class="g67-stat"><span>Герой</span><b>Уровень ${s.playerLevel}</b><em>${s.playerXp} / ${s.playerMaxXp} XP</em><i><u style="width:${s.playerProgress}%"></u></i></div><div class="g67-stat"><span>Город Sdolars</span><b>Уровень ${s.cityLevel}</b><em>${city.name}</em><i><u style="width:${Math.min(100,(s.cityLevel/4)*100)}%"></u></i></div><div class="g67-stat"><span>PvE-путь</span><b>${s.pveProgress}%</b><em>${s.pveWins} побед · до следующего этапа города</em><i><u style="width:${s.pveProgress}%"></u></i></div><div class="g67-box"><b>Что открыто сейчас</b><p>${city.desc}</p><div class="g67-tags">${['center','forge','tavern','market','arena','gates','port','ruins'].map(id=>`<span class="${districtUnlocked(id)?'on':''}">${id==='center'?'🏙️ Центр':id==='forge'?'⚒️ Кузница':id==='tavern'?'🍺 Таверна':id==='market'?'🛒 Рынок':id==='arena'?'⚔️ Арена':id==='gates'?'🛡️ Ворота':id==='port'?'⚓ Порт':'🏚️ Руины'} ${districtUnlocked(id)?'✓':'🔒'}</span>`).join('')}</div></div><div class="g67-box"><b>Следующий рубеж</b><p>${s.cityLevel<4?`Уровень города ${s.cityLevel+1}: ${cityRules.find(x=>x.level===s.cityLevel+1)?.desc||'новый контент'}`:'Базовая линия развития достигнута. Дальше добавим новые районы и сюжет.'}</p></div>`}
 function css(){if(document.getElementById('tgG67css'))return;const c=document.createElement('style');c.id='tgG67css';c.textContent=`#tgG67{position:fixed;inset:0;z-index:100020;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.76);padding:10px;box-sizing:border-box}#tgG67.show{display:flex}.g67-card{width:min(700px,100%);max-height:92vh;overflow:auto;border:1px solid #6d5635;border-radius:20px 20px 0 0;background:linear-gradient(180deg,#18242b,#091015);color:#f3eadc;padding:15px;box-sizing:border-box;box-shadow:0 -18px 55px #000b}.g67-x{float:right;border:1px solid #6d5635;background:#172128;color:#f5d79a;border-radius:10px;padding:8px 11px;font-weight:900}.g67-kicker{font-size:10px;letter-spacing:1.2px;color:#a89472}.g67-card h2{margin:3px 0 14px;color:#efd18e;font:700 24px Georgia,serif}.g67-stat,.g67-box{border:1px solid #2e414a;background:#0d1a20;border-radius:14px;padding:11px;margin:8px 0}.g67-stat{display:grid;grid-template-columns:1fr auto;gap:3px 8px}.g67-stat span{font-size:11px;color:#91a1aa}.g67-stat b{text-align:right;color:#f0d18c}.g67-stat em{grid-column:1/-1;font-style:normal;font-size:11px;color:#9faeb5}.g67-stat i{grid-column:1/-1;height:7px;background:#071015;border-radius:8px;overflow:hidden;margin-top:5px}.g67-stat i u{display:block;height:100%;background:#c89f50;text-decoration:none}.g67-box b{color:#efd18e}.g67-box p{font-size:12px;line-height:1.4;color:#aebbc0;margin:6px 0}.g67-tags{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.g67-tags span{padding:8px;border-radius:9px;background:#121d22;border:1px solid #273940;color:#697981;font-size:10px}.g67-tags span.on{color:#d9dfdc;border-color:#53624e;background:#18251f}@media(max-width:390px){.g67-card{padding:11px}.g67-tags{grid-template-columns:1fr 1fr}}`;document.head.appendChild(c)}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g67]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.g67==='close')document.getElementById('tgG67')?.classList.remove('show')},true);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-g67-open]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
 window.TerritoryProgression={version:'G67',state:st,snapshot,reconcile,playerProgress,districtUnlocked,districtRequirement,levelUp,advanceCity,open,render,cityRules};
 css();reconcile();
})();
