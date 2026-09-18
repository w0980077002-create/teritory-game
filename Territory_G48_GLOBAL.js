/* Territory G47 GLOBAL — integrated gameplay pass over the preserved G40 City and G43 Arena. */
(function(){'use strict';
 const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const KEY='territory_save_v1';
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
 let st=load();
 const defaults={name:'SSS',level:1,exp:0,maxExp:100,hp:120,maxHp:120,coins:1000,gems:25,energy:100,combatStone:20,strength:5,agility:5,defense:0,endurance:12,weaponMastery:1,freePoints:0,weapon:'Кулаки',bonusDamage:0,inventory:[],equipped:{},equipmentSlots:{weapon:null,helmet:null,armor:null,gloves:null,boots:null},durability:{},pveProgress:0,cityLevel:1,pveWins:0,hunger:100,lang:'ru',dailyClaim:'',vipDays:0};
 st={...defaults,...st,equipped:{...defaults.equipped,...(st.equipped||{})},equipmentSlots:{...defaults.equipmentSlots,...(st.equipmentSlots||{})},durability:{...defaults.durability,...(st.durability||{})}};
 const slotFor=id=>({axe:'weapon',sword:'weapon',helm:'helmet',armor:'armor',gloves:'gloves',boots:'boots'}[id]||'armor');
 Object.keys(st.equipped).forEach(id=>{if(st.equipped[id]&&!st.equipmentSlots[slotFor(id)])st.equipmentSlots[slotFor(id)]=id;});
 Object.values(st.equipmentSlots).forEach(id=>{if(id)st.equipped[id]=true;});
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st));localStorage.setItem('territory_save',JSON.stringify(st))}catch(e){}; if(typeof window.render==='function')window.render(); updateHud();};
 function updateHud(){const map={playerName:st.name,level:st.level,coins:st.coins,gems:st.gems};Object.entries(map).forEach(([id,v])=>{const e=$('#'+id);if(e)e.textContent=v});}
 function toast(t){let x=$('#tgToast');if(!x){x=document.createElement('div');x.id='tgToast';x.className='tg-toast';document.body.appendChild(x)}x.textContent=t;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),1800)}
 function overlay(id,title,body){let o=$('#'+id);if(!o){o=document.createElement('div');o.id=id;o.className='tg-overlay';o.innerHTML='<div class="tg-panel"><div class="tg-head"><h2></h2><button class="tg-x">✕</button></div><div class="tg-body"></div></div>';document.body.appendChild(o);o.querySelector('.tg-x').onclick=()=>o.classList.remove('show');o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('show')})}o.querySelector('h2').textContent=title;o.querySelector('.tg-body').innerHTML=body;o.classList.add('show');return o}
 const items=[
  {id:'axe',name:'Боевой топор',icon:'🪓',damage:12,cost:300,type:'weapon'},
  {id:'sword',name:'Стальной меч',icon:'⚔️',damage:18,cost:650,type:'weapon'},
  {id:'helm',name:'Стальной шлем',icon:'🪖',defense:4,cost:500,type:'armor',slot:'helmet'},
  {id:'armor',name:'Волчья броня',icon:'🥋',defense:7,cost:900,type:'armor',slot:'armor'},
  {id:'gloves',name:'Боевые перчатки',icon:'🥊',defense:3,cost:420,type:'armor',slot:'gloves'},
  {id:'boots',name:'Стальные сапоги',icon:'🥾',defense:3,cost:420,type:'armor',slot:'boots'}
 ];
 function addItem(it){st.inventory.push(it.id);if(it.type==='weapon'&&!st.weapon)st.weapon=it.name;st.durability[it.id]=300;save()}
 function profile(){const d={power:Math.round(st.strength*2+st.agility*1.5+st.defense*2+st.endurance+st.weaponMastery*3+st.bonusDamage),crit:Math.min(60,st.strength*2),dodge:Math.min(45,Math.round(st.agility*1.5)),damage:Math.max(1,5+st.strength+st.weaponMastery+st.bonusDamage),block:Math.min(70,Math.round(st.defense*1.8))};overlay('tgProfile','👤 Профиль персонажа',`<div class="tg-card tg-row"><div class="tg-icon">🧔</div><div class="tg-grow"><b>${esc(st.name)}</b><div class="tg-muted">Уровень ${st.level} · XP ${st.exp}/${st.maxExp}</div><div class="tg-bar"><i style="width:${Math.min(100,st.exp/st.maxExp*100)}%"></i></div></div></div><div class="tg-grid">${[['💪','Сила',st.strength],['🏃','Ловкость',st.agility],['🛡️','Защита',st.defense],['❤️','Выносливость',st.endurance],['⚔️','Мастерство',st.weaponMastery],['🏆','Мощь',d.power],['💥','Крит',d.crit+'%'],['🌀','Уклонение',d.dodge+'%'],['⚔️','Урон',d.damage],['🛡️','Блок',d.block+'%']].map(x=>`<div class="tg-stat"><b>${x[0]} ${x[2]}</b><small>${x[1]}</small></div>`).join('')}</div><div class="tg-card"><b>Свободные очки: ${st.freePoints}</b><div class="tg-grid" style="margin-top:8px">${[['strength','Сила'],['agility','Ловкость'],['defense','Защита'],['endurance','Выносливость'],['weaponMastery','Мастерство']].map(x=>`<button class="tg-btn" data-addstat="${x[0]}" ${st.freePoints<1?'disabled':''}>+ ${x[1]}</button>`).join('')}</div></div>`)}
 function equipmentTotals(){return Object.values(st.equipmentSlots||{}).reduce((a,id)=>{const it=items.find(x=>x.id===id);if(!it)return a;const dur=Number(st.durability[id]??300);if(dur<=0)return a;a.damage+=Number(it.damage||0);a.defense+=Number(it.defense||0);return a},{damage:0,defense:0})}
 function equipItem(id){const it=items.find(x=>x.id===id);if(!it||!st.inventory.includes(id))return;const slot=it.slot||slotFor(id);const old=st.equipmentSlots[slot];if(old===id){delete st.equipped[id];st.equipmentSlots[slot]=null;}else{if(old)delete st.equipped[old];st.equipmentSlots[slot]=id;st.equipped[id]=true;}const total=equipmentTotals();st.weapon=st.equipmentSlots.weapon?(items.find(x=>x.id===st.equipmentSlots.weapon)?.name||'Оружие'):'Кулаки';st.bonusDamage=total.damage;save();}
 function inventory(){const total=equipmentTotals();const slots=[['weapon','⚔️','Оружие'],['helmet','🪖','Шлем'],['armor','🛡️','Броня'],['gloves','🥊','Перчатки'],['boots','🥾','Сапоги']];const slotHtml=slots.map(([slot,ico,label])=>{const id=st.equipmentSlots[slot];const it=id&&items.find(x=>x.id===id);return `<div class="tg-slot ${it?'filled':''}"><span>${ico}</span><div><b>${label}</b><small>${it?esc(it.name):'Пусто'}</small></div></div>`}).join('');const counts={};st.inventory.forEach(id=>counts[id]=(counts[id]||0)+1);const list=Object.keys(counts).length?Object.entries(counts).map(([id,n])=>{const it=items.find(x=>x.id===id)||{id,name:id,icon:'📦'};const dur=st.durability[id]??300;const slot=it.slot||slotFor(id);const active=st.equipmentSlots[slot]===id;return `<div class="tg-card tg-item ${active?'is-equipped':''}"><div class="tg-icon">${it.icon}</div><div class="tg-grow"><b>${esc(it.name)}</b><div class="tg-muted">${it.damage?'Урон +'+it.damage:''}${it.defense?'Защита +'+it.defense:''} · слот: ${slot}</div><div class="tg-tag">Прочность ${dur}/300</div></div><button class="tg-btn" data-equip="${id}">${active?'Снять':'Надеть'}</button></div>`}).join(''):'<div class="tg-card tg-muted">Инвентарь пока пуст.</div>';overlay('tgInv','🎒 Экипировка',`<div class="tg-card"><b>Снаряжение героя</b><div class="tg-slots">${slotHtml}</div><div class="tg-muted">Итог: ⚔️ +${total.damage} урона · 🛡️ +${total.defense} защиты</div><button class="tg-btn" style="margin-top:8px;width:100%" data-ui="repair">🔨 Открыть кузницу</button></div>${list}`)}
 function market(){overlay('tgMarket','🛒 Рынок',`<div class="tg-card"><b>Репутация торговца</b><div class="tg-muted">Покупай оружие и броню. Прочность каждой вещи — 300 ударов.</div></div>${items.map(it=>`<div class="tg-card tg-item"><div class="tg-icon">${it.icon}</div><div class="tg-grow"><b>${it.name}</b><div class="tg-muted">${it.damage?'Урон +'+it.damage:''} ${it.defense?'Защита +'+it.defense:''} · ${it.cost} 🪙</div></div><button class="tg-btn" data-buyitem="${it.id}">Купить</button></div>`).join('')}`)}
 function bonuses(){const day=new Date().toISOString().slice(0,10);overlay('tgBonus','🎁 Бонусы',`<div class="tg-card"><b>Ежедневный бонус</b><p class="tg-muted">+100 🪙 · +5 ⚔️ Боевых камней</p><button class="tg-btn gold" data-daily ${st.dailyClaim===day?'disabled':''}>${st.dailyClaim===day?'Уже получено':'Забрать бонус'}</button></div><div class="tg-card"><b>Текущие ресурсы</b><div class="tg-muted">⚡ ${st.energy}/200 · ⚔️ ${st.combatStone}</div></div>`)}
 function events(){overlay('tgEvents','📅 События',`<div class="tg-card"><b>Город живёт</b><p class="tg-muted">Встречи Alex, караваны, торговые случаи и городские задания уже работают в City.</p><button class="tg-btn" data-eventclaim>Проверить события</button></div><div class="tg-card"><b>Задание Alex</b><p class="tg-muted">Следи за городом и помогай при тревогах.</p></div>`)}
 function vip(){overlay('tgVip','👑 VIP',`<div class="tg-card"><b>VIP ${st.vipDays>0?'активен':'не активен'}</b><p class="tg-muted">В прототипе VIP даёт дополнительный ежедневный бонус. Покупки за реальные деньги здесь не подключены.</p><button class="tg-btn" data-vip>Активировать тестовый VIP на 1 день</button></div>`)}
 function tavern(){overlay('tgTavern','🍺 Таверна',`<div class="tg-card"><b>Голод: ${st.hunger}%</b><div class="tg-bar"><i style="width:${st.hunger}%"></i></div><p class="tg-muted">Еда восстанавливает сытость. Проигрыш в бою будет снижать голод.</p><button class="tg-btn" data-food ${st.coins<80?'disabled':''}>Поесть · 80 🪙</button></div>`)}
 function settings(){overlay('tgSettings','⚙️ Настройки',`<div class="tg-card"><b>Язык</b><p class="tg-muted">Русский / English. Основные игровые панели переключаются; текст, запечатанный непосредственно в арт-фоне, остаётся частью изображения.</p><button class="tg-btn" data-lang>${st.lang==='ru'?'Switch to English':'Переключить на русский'}</button></div><div class="tg-card"><b>Сохранение</b><p class="tg-muted">Прогресс хранится локально на устройстве.</p></div>`)}
 function messages(){overlay('tgMessages','✉️ Сообщения',`<div class="tg-card"><b>Система Territory</b><p class="tg-muted">Добро пожаловать в Sdolars. Город, PvE и Arena разделены.</p></div><div class="tg-card"><b>Alex</b><p class="tg-muted">«В Sdolars каждый воин может стать легендой.»</p></div>`)}
 function achievements(){overlay('tgAch','🏆 Достижения',`<div class="tg-grid"><div class="tg-stat"><b>🏰 Горожанин</b><small>Открой город</small></div><div class="tg-stat"><b>⚔️ Первый бой</b><small>Победи бота</small></div><div class="tg-stat"><b>🪙 Торговец</b><small>Купи предмет</small></div><div class="tg-stat"><b>👑 Охотник на боссов</b><small>Победи босса</small></div></div>`)}
 function repair(){
   const owned=Object.keys(st.durability||{}).filter(id=>st.inventory.includes(id));
   const rows=owned.map(id=>{const it=items.find(x=>x.id===id)||{name:id,icon:'📦'};const d=Number(st.durability[id]??300);const missing=Math.max(0,300-d);const cost=Math.max(0,Math.ceil(missing*0.8));return `<div class="tg-card tg-item"><div class="tg-icon">${it.icon}</div><div class="tg-grow"><b>${esc(it.name)}</b><div class="tg-muted">Прочность ${d}/300 · ремонт ${cost} 🪙</div></div><button class="tg-btn" data-repair="${id}" ${missing===0||st.coins<cost?'disabled':''}>${missing===0?'Исправно':'Ремонт'}</button></div>`}).join('')||'<div class="tg-card tg-muted">Нет предметов для ремонта.</div>';
   overlay('tgRepair','🔨 Кузница',`<div class="tg-card"><b>Ремонт экипировки</b><p class="tg-muted">Каждый предмет рассчитан на 300 попаданий. Стоимость зависит от потраченной прочности.</p></div>${rows}`);
 }
 function equipment(){inventory();}

 const pve={enemy:null,attack:null,def:[],round:0,started:false,boss:false,bossEndsAt:0,log:[]};
 const enemies=[
  {name:'Разбойник у ворот',ico:'👹',hp:90,damage:10,reward:45,xp:12},
  {name:'Наёмник Sdolars',ico:'🗡️',hp:120,damage:14,reward:65,xp:17},
  {name:'Гвардеец замка',ico:'🛡️',hp:155,damage:18,reward:90,xp:23},
  {name:'Капитан стражи',ico:'⚔️',hp:195,damage:22,reward:125,xp:30},
  {name:'Элитный страж',ico:'🔥',hp:240,damage:26,reward:165,xp:38}
 ];
 const pveBoss=()=>{const c=Math.max(1,Number(st.cityLevel)||1);return {name:'Городской босс',ico:'👑',hp:Math.round(420+c*18),damage:Math.round(30+c*1.4),reward:300+Math.round(c*8),xp:80+Math.round(c*2)}};
 const zoneNames={head:'Голова',chest:'Грудь',stomach:'Живот',legs:'Ноги'};
 const pickDefense=()=>{const a=Object.keys(zoneNames).sort(()=>Math.random()-.5);return a.slice(0,2)};
 function pveOpen(){
   clearInterval(pve.timer);pve.started=false;pve.enemy=null;pve.attack=null;pve.def=[];pve.round=0;pve.boss=false;pve.bossEndsAt=0;pve.log=[];
   const o=overlay('tgPve','⚔️ Городской бой',`<div id="tgPveBody"></div>`);renderPve(o.querySelector('#tgPveBody'));
 }
 function pveBegin(host){
   if(st.pveProgress>=100){pve.boss=true;pve.enemy={...pveBoss(),maxHp:pveBoss().hp};pve.bossEndsAt=Date.now()+60000;pve.log=['👑 100% достигнуто. Начался бой с городским боссом. Таймер — 60 секунд.'];clearInterval(pve.timer);pve.timer=setInterval(()=>{if(Date.now()>=pve.bossEndsAt){clearInterval(pve.timer);pveDefeat(host,'Время босса вышло.');}else renderPve(host)},1000)}
   else {const idx=Math.min(enemies.length-1,Math.floor(st.pveProgress/20));const e=enemies[idx];pve.enemy={...e,maxHp:e.hp};pve.boss=false;pve.log=[`🤖 На пути появился: ${e.name}.`];}
   pve.started=true;
 }
 function pveRoute(){
   const nodes=[0,20,40,60,80,100];
   return `<div class="tg-route">${nodes.map((n,i)=>`<span class="${st.pveProgress>=n?'done':''} ${st.pveProgress===n?'current':''}"><b>${n===100?'👑':'⚔️'}</b><small>${n}%</small></span>`).join('')}</div>`;
 }
 function pveLogHtml(){return `<div class="tg-card tg-log" id="tgPveLog"><div class="tg-card-head"><b>Боевой журнал</b><button class="tg-log-toggle" data-pve-log>Скрыть</button></div><div class="tg-log-lines">${pve.log.slice(-8).map(x=>`<div>${esc(x)}</div>`).join('')}</div></div>`}
 function renderPve(host){
   if(!host)return;
   const e=pve.enemy;
   if(!e){
     const pct=Math.min(100,Number(st.pveProgress||0));
     const bossReady=pct>=100;
     host.innerHTML=`<div class="tg-pve-route"><div class="tg-route-head"><b>⚔️ Городской бой</b><span>${st.cityLevel||1} город</span></div><div class="tg-route-line"><i style="width:${pct}%"></i></div><div class="tg-route-points"><span>🧔</span><span>🤖</span><span>🤖</span><span>🤖</span><span>🤖</span><span>👑</span></div><div class="tg-route-caption">Прогресс города: <b>${pct}%</b>${bossReady?' · БОСС ДОСТУПЕН':''}</div></div><div class="tg-card"><b>${bossReady?'👑 БОСС ГОРОДА':'🤖 Следующий противник'}</b><p class="tg-muted">${bossReady?'100% пройдено. Теперь можно бросить вызов боссу.':'Иди дальше по городу и сражайся с последовательными ботами.'}</p><button class="tg-btn gold" data-pve-start>${bossReady?'👑 Начать бой с боссом':'⚔️ Встретить следующего бота'}</button></div>${pveLogHtml()}`;
     host.querySelector('[data-pve-start]')?.addEventListener('click',()=>pveBegin(host));
     return;
   }
   const pct=Math.max(0,Math.min(100,e.hp/e.maxHp*100));
   const timer=pve.boss?`<span class="tg-boss-timer">⏱️ ${Math.max(0,Math.ceil((pve.bossEndsAt-Date.now())/1000))}с</span>`:'';
   host.innerHTML=`<div class="tg-route-compact"><b>${pve.boss?'👑 БОСС ГОРОДА':'⚔️ ГОРОДСКОЙ PvE-БОЙ'}</b><span>${pve.boss?'Переход на следующий город':'Прогресс '+st.pveProgress+'%'}</span></div><div class="tg-battle-stage ${pve.boss?'tg-boss-stage':''}"><div class="tg-battle-top"><span>${pve.boss?'👑 БОСС':'🤖 БОТ'}</span><b>Раунд ${pve.round||1}</b>${timer}</div><div class="tg-fighters"><div class="tg-fighter hero"><div class="tg-fighter-ico">🧔</div><b>${esc(st.name)}</b><span>HP ${st.hp}/${st.maxHp}</span><div class="tg-bar tg-hp"><i style="width:${Math.max(0,st.hp/st.maxHp*100)}%"></i></div></div><div class="tg-vs">VS</div><div class="tg-fighter enemy"><div class="tg-fighter-ico">${e.ico}</div><b>${e.name}</b><span>HP ${Math.max(0,e.hp)}/${e.maxHp}</span><div class="tg-bar tg-hp"><i style="width:${pct}%"></i></div><small>Урон ${e.damage}</small></div></div></div><div class="tg-card tg-pve-actions"><div class="tg-card-head"><b>${pve.boss?'Победи босса до окончания таймера':'Твой ход'}</b><span>⚔️ ${st.combatStone}</span></div><p class="tg-muted">Это городской PvE. Здесь нет команд, комнат и PvP-механик Arena. Игрок сам нажимает боевое действие.</p><button class="tg-btn gold tg-pve-main-hit" data-pve-hit ${st.combatStone<1?'disabled':''}>⚔️ УДАР · 1 Боевой камень</button></div>${pveLogHtml()}<div class="tg-card tg-reward-preview"><b>${pve.boss?'🏆 Награда босса':'🎁 Награда за бота'}</b><span>🪙 ${e.reward} · ⭐ ${e.xp} XP</span></div>`;
   if(pve.boss){clearInterval(pve.timer);pve.timer=setInterval(()=>{if(!pve.enemy)return; if(Date.now()>=pve.bossEndsAt){clearInterval(pve.timer);pveDefeat(host,'Время босса вышло.')}else renderPve(host)},1000)}
   host.querySelector('[data-pve-hit]')?.addEventListener('click',()=>pveHit(host));
 }
 function pveAction(type,val,host){ renderPve(host) }
 function pveDefeat(host,reason){
   clearInterval(pve.timer);pve.started=false;pve.enemy=null;pve.attack=null;pve.def=[];pve.boss=false;pve.bossEndsAt=0;st.hunger=Math.max(0,st.hunger-5);st.hp=Math.ceil(st.maxHp*.35);pve.log.push(`💀 Поражение: ${reason||'ты проиграл бой'}`);save();toast('Поражение. Голод -5%.');renderPve(host);
 }
 function pveHit(host){
   if(!pve.enemy||st.combatStone<1||!pve.attack||pve.def.length!==2)return;
   st.combatStone--;pve.round++;const eq=equipmentTotals();
   const dmgBase=Math.max(4,5+st.strength+st.weaponMastery+eq.damage);const crit=Math.random()<Math.min(.6,st.strength*.02);const dmg=crit?Math.round(dmgBase*1.6):dmgBase;
   pve.enemy.hp=Math.max(0,pve.enemy.hp-dmg);
   pve.log.push(`Раунд ${pve.round}: ты нанёс удар${crit?' — КРИТ':''}. Урон: ${dmg}.`);
   if(pve.enemy.hp<=0){
     if(pve.boss){st.coins+=pve.enemy.reward;addXP(pve.enemy.xp);st.pveWins++;st.cityLevel++;st.pveProgress=0;markPve(true,true);pve.log.push(`🏆 БОСС ПОБЕЖДЁН! +${pve.enemy.reward} 🪙 и +${pve.enemy.xp} XP. Открыт город ${st.cityLevel}.`);toast('Босс побеждён! Открыт следующий город.');pve.started=false;pve.enemy=null;clearInterval(pve.timer);pve.boss=false;pve.bossEndsAt=0;st.hp=st.maxHp;
     }else{st.coins+=pve.enemy.reward;addXP(pve.enemy.xp);st.pveProgress=Math.min(100,st.pveProgress+20);markPve(true,false);pve.log.push(`✅ Бот побеждён. +${pve.enemy.reward} 🪙 · +${pve.enemy.xp} XP · прогресс ${st.pveProgress}%.`);toast(st.pveProgress>=100?'100%! Вперёд к боссу.':'Победа! Следующий противник.');pve.enemy=null;pve.started=false;}
     pve.attack=null;pve.def=[];save();renderPve(host);return;
   }
   const armorBonus=eq.defense;let enemyHit=Math.max(0,pve.enemy.damage-(st.defense*1.5)-armorBonus);if(pve.def.includes('head'))enemyHit=Math.max(0,enemyHit-3);if(pve.def.includes('chest'))enemyHit=Math.max(0,enemyHit-3);if(pve.def.includes('legs'))enemyHit=Math.max(0,enemyHit-2);
   const dodge=Math.random()<Math.min(.45,st.agility*.015);if(dodge)enemyHit=0;
   st.hp=Math.max(0,st.hp-enemyHit);pve.log.push(dodge?`💨 Бот атаковал в ответ, но ты уклонился.`:`🤖 Ответный удар: -${enemyHit} HP.`);
   if(st.hp<=0){pveDefeat(host,'Твоё HP достигло 0.');return;}
   Object.keys(st.equipped||{}).forEach(id=>{if(st.equipped[id]){st.durability[id]=Math.max(0,(st.durability[id]??300)-1);}});
   pve.attack=null;pve.def=[];save();renderPve(host);
 }

 // G46 — unified progression/economy API used by Arena and future SERVER bridge.
 const CORE_KEY='territory_save_v1';
 st.quests=Array.isArray(st.quests)?st.quests:[];
 st.achievements=Array.isArray(st.achievements)?st.achievements:[];
 st.stats=st.stats||{pveBattles:0,pveWins:0,arenaBattles:0,arenaWins:0,itemsBought:0,repairs:0,bosses:0};
 st.daily={date:'',streak:0,claimed:false,...(st.daily||{})};
 const today=()=>new Date().toISOString().slice(0,10);
 const touchQuest=(id,amount=1)=>{const q=st.quests.find(x=>x.id===id);if(q){q.value=Math.min(q.goal,(q.value||0)+amount);return;}const defs={pve:{title:'Городской боец',goal:5,reward:120},arena:{title:'Арена',goal:3,reward:100},buy:{title:'Торговец',goal:1,reward:80},repair:{title:'Кузнец',goal:1,reward:60}};const d=defs[id];if(d)st.quests.push({id,title:d.title,goal:d.goal,value:Math.min(d.goal,amount),reward:d.reward,claimed:false});};
 const unlock=(id,title,desc,reward=0)=>{if(!st.achievements.some(a=>a.id===id)){st.achievements.push({id,title,desc,claimed:true,at:Date.now()});if(reward)st.coins+=reward;return true}return false};
 const addXP=(amount)=>{st.exp+=Math.max(0,Number(amount)||0);while(st.exp>=st.maxExp){st.exp-=st.maxExp;st.level++;st.freePoints+=3;st.maxExp=Math.round(st.maxExp*1.15);st.maxHp+=10;st.hp=st.maxHp;unlock('level'+st.level,'Новый уровень','Достигнут уровень '+st.level,0);}};
 const awardQuestRewards=()=>{for(const q of st.quests){if(q.value>=q.goal&&!q.claimed){q.claimed=true;st.coins+=q.reward;toast('Задание выполнено: +'+q.reward+' 🪙');}}};
 const markPve=(win,boss=false)=>{st.stats.pveBattles++;if(win){st.stats.pveWins++;touchQuest('pve');unlock('first-pve','Первый бой','Победа в PvE');if(boss){st.stats.bosses++;unlock('boss','Охотник на боссов','Побеждён городской босс',250);}}awardQuestRewards();};
 const markArena=(win)=>{st.stats.arenaBattles++;if(win){st.stats.arenaWins++;touchQuest('arena');unlock('first-arena','Арена','Первая победа на Arena');}awardQuestRewards();};
 const buyMark=()=>{st.stats.itemsBought++;touchQuest('buy');unlock('merchant','Торговец','Куплен первый предмет');awardQuestRewards();};
 const repairMark=()=>{st.stats.repairs++;touchQuest('repair');awardQuestRewards();};
 window.TerritoryCore={getState:()=>st,save,addXP,markPve,markArena,buyMark,repairMark,unlock,awardQuestRewards,today};

 document.addEventListener('click',e=>{const b=e.target.closest('[data-ui]');if(b){e.preventDefault();e.stopPropagation();({profile,bonuses,messages,achievements,settings,language:settings,events,vip,tavern,repair})[b.dataset.ui]?.();return}const ds=e.target.closest('[data-screen]');if(ds&&ds.dataset.screen==='pve'){e.preventDefault();e.stopImmediatePropagation();pveOpen();return}if(ds&&ds.dataset.screen==='inventory'){e.preventDefault();e.stopImmediatePropagation();inventory();return}if(ds&&ds.dataset.screen==='market'){e.preventDefault();e.stopImmediatePropagation();market();return}} ,true);
 document.addEventListener('click',e=>{const pa=e.target.closest('[data-pve-a]');const host=document.querySelector('#tgPveBody');if(pa){pveAction('a',pa.dataset.pveA,host);return}const pd=e.target.closest('[data-pve-d]');if(pd){pveAction('d',pd.dataset.pveD,host);return}if(e.target.closest('[data-pve-hit]')){pveHit(host);return}if(e.target.closest('[data-pve-retry]')){pve.started=false;pve.enemy=null;pve.attack=null;pve.def=[];pve.log=[];renderPve(host);return}if(e.target.closest('[data-pve-log]')){const lines=document.querySelector('#tgPveLog .tg-log-lines');const btn=e.target.closest('[data-pve-log]');if(lines){lines.style.display=lines.style.display==='none'?'':'none';btn.textContent=lines.style.display==='none'?'Показать':'Скрыть'}return}const b=e.target.closest('[data-addstat]');if(b&&st.freePoints>0){st[b.dataset.addstat]++;st.freePoints--;save();profile()}const buy=e.target.closest('[data-buyitem]');if(buy){const it=items.find(x=>x.id===buy.dataset.buyitem);if(it&&st.coins>=it.cost){st.coins-=it.cost;addItem(it);buyMark();toast('Предмет куплен')}else toast('Не хватает монет')}const rep=e.target.closest('[data-repair]');if(rep){const id=rep.dataset.repair;const d=Number(st.durability[id]??300);const cost=Math.max(0,Math.ceil(Math.max(0,300-d)*0.8));if(st.coins>=cost){st.coins-=cost;st.durability[id]=300;repairMark();save();toast('Предмет отремонтирован')}else toast('Не хватает монет')}const eq=e.target.closest('[data-equip]');if(eq){equipItem(eq.dataset.equip);inventory()}if(e.target.closest('[data-daily]')){const d=today(); if(st.dailyClaim!==d){st.dailyClaim=d; st.daily=st.daily||{}; st.daily.streak=Number(st.daily.streak||0)+1; st.coins+=100+Math.min(100,st.daily.streak*10); st.combatStone+=5; save(); bonuses()}}if(e.target.closest('[data-vip]')){st.vipDays=1;save();vip()}if(e.target.closest('[data-food]')){if(st.coins>=80){st.coins-=80;st.hunger=Math.min(100,st.hunger+30);save();tavern()}}if(e.target.closest('[data-lang]')){st.lang=st.lang==='ru'?'en':'ru';save();settings()}if(e.target.closest('[data-eventclaim]'))toast('В городе новые встречи.')} );
 updateHud();
})();
