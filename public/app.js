'use strict';
const tg=window.Telegram?.WebApp; if(tg){try{tg.ready();tg.expand();}catch{}}
const ITEMS={
 knife:{name:'Ржавый нож новичка',type:'weapon',stat:4,price:40,icon:'🔪',desc:'+4 атаки'},
 sword:{name:'Стальной меч',type:'weapon',stat:10,price:180,icon:'⚔️',desc:'+10 атаки'},
 axe:{name:'Тяжёлый топор',type:'weapon',stat:16,price:420,icon:'🪓',desc:'+16 атаки'},
 jacket:{name:'Кожаная куртка',type:'armor',stat:4,price:50,icon:'🧥',desc:'+4 защиты'},
 vest:{name:'Бронежилет',type:'armor',stat:10,price:220,icon:'🦺',desc:'+10 защиты'},
 armor:{name:'Стальная броня',type:'armor',stat:18,price:520,icon:'🛡️',desc:'+18 защиты'},
 bandage:{name:'Бинт',type:'consumable',stat:15,price:20,icon:'🩸',desc:'+15 HP'},
 medkit:{name:'Аптечка',type:'consumable',stat:35,price:45,icon:'🩹',desc:'+35 HP'},
 stim:{name:'Стимулятор',type:'consumable',stat:70,price:120,icon:'💉',desc:'+70 HP'}
};
const ENEMIES=[
 {id:'rat',name:'Гигантская крыса',hp:40,attack:6,def:1,exp:25,coins:18,icon:'🐀'},
 {id:'bandit',name:'Бандит',hp:85,attack:12,def:4,exp:60,coins:55,icon:'🥷'},
 {id:'boss',name:'Босс руин',hp:180,attack:20,def:8,exp:160,coins:140,icon:'👹'}
];
const LOCATIONS=[['Город','🏙️','Безопасная зона'],['Тёмный лес','🌲','Крысы и бандиты'],['Старый завод','🏭','Опасная зона'],['Порт','⚓','Торговцы и игроки']];
const KEY='teritory_complete_v1'; let battle=null,ws=null;
const $=id=>document.getElementById(id); const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function telegramName(){const u=tg?.initDataUnsafe?.user;return (u?.username||[u?.first_name,u?.last_name].filter(Boolean).join(' ')||'Игрок').slice(0,24)}
function fresh(){return {name:telegramName(),level:1,exp:0,nextExp:100,hp:100,maxHp:100,baseAttack:5,baseDefense:2,coins:250,wins:0,losses:0,location:'Город',inventory:[{id:'knife',qty:1},{id:'jacket',qty:1},{id:'bandage',qty:3}],equipment:{weapon:'knife',armor:'jacket'}}}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.inventory&&x.equipment)return x}catch{}return fresh()}
let p=load(); if(tg?.initDataUnsafe?.user && (!p.name||p.name==='Игрок'))p.name=telegramName();
function save(){localStorage.setItem(KEY,JSON.stringify(p))}
function stats(){let attack=p.baseAttack+p.level-1,def=p.baseDefense+Math.floor((p.level-1)/2);const w=ITEMS[p.equipment.weapon],a=ITEMS[p.equipment.armor];if(w)attack+=w.stat;if(a)def+=a.stat;return {attack,def}}
function toast(text){$('toast').textContent=text;$('toast').classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('on'),2200)}
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id)?.classList.add('active');render();window.scrollTo({top:0,behavior:'smooth'})}
function add(id,n=1){let r=p.inventory.find(x=>x.id===id);if(!r){r={id,qty:0};p.inventory.push(r)}r.qty+=n}
function rem(id,n=1){const r=p.inventory.find(x=>x.id===id);if(!r||r.qty<n)return false;r.qty-=n;p.inventory=p.inventory.filter(x=>x.qty>0);return true}
function levelUp(){const gained=[];while(p.exp>=p.nextExp){p.exp-=p.nextExp;p.level++;p.nextExp=Math.floor(p.nextExp*1.35);p.maxHp+=12;p.hp=p.maxHp;p.baseAttack+=2;p.baseDefense++;gained.push(p.level)}return gained}
function render(){const s=stats();$('topHp').textContent=`${p.hp}/${p.maxHp}`;$('topCoins').textContent=p.coins;$('name').textContent=p.name;$('level').textContent=p.level;$('xp').textContent=`${p.exp} / ${p.nextExp} XP`;$('xpBar').style.width=Math.min(100,p.exp/p.nextExp*100)+'%';$('hp').textContent=`${p.hp} / ${p.maxHp}`;$('attack').textContent=s.attack;$('defense').textContent=s.def;$('wins').textContent=p.wins;$('losses').textContent=p.losses;$('location').textContent=p.location;$('shopCoins').textContent=p.coins;$('playerSummary').textContent=`${p.name} · уровень ${p.level} · ${p.coins} 🪙 · ${p.wins} побед`;$('welcome').textContent=`${p.name}, выживи. Стань сильнее. Забери территорию.`;renderEquipment();renderInv();renderShop();renderArena();renderWorld()}
function renderEquipment(){const slots=[['weapon','Оружие'],['armor','Броня']];$('equipment').innerHTML=slots.map(([slot,title])=>{const id=p.equipment[slot],x=ITEMS[id];return `<div class="item"><span>${x?.icon||'⬜'}</span><div><b>${title}: ${x?esc(x.name):'нет'}</b><small>${x?x.desc:'Слот пуст'}</small></div>${x?`<button onclick="unequip('${id}')">СНЯТЬ</button>`:''}</div>`}).join('')}
function renderInv(){$('inv').innerHTML=p.inventory.length?p.inventory.map(r=>{const x=ITEMS[r.id];if(!x)return'';const action=x.type==='consumable'?`<button onclick="useItem('${r.id}')">ИСПОЛЬЗОВАТЬ</button>`:`<button onclick="equip('${r.id}')">НАДЕТЬ</button>`;return `<div class="item"><span>${x.icon}</span><div><b>${esc(x.name)} ×${r.qty}</b><small>${x.desc}</small></div><div>${action}<button onclick="dropItem('${r.id}')">ВЫБРОСИТЬ</button></div></div>`}).join(''):'<div class="card muted">Инвентарь пуст.</div>'}
function renderShop(){$('shopList').innerHTML=Object.entries(ITEMS).map(([id,x])=>`<div class="item"><span>${x.icon}</span><div><b>${esc(x.name)}</b><small>${x.desc} · ${x.price} 🪙</small></div><button class="gold" onclick="buy('${id}')">КУПИТЬ</button></div>`).join('')}
function renderArena(){if(battle){const e=ENEMIES.find(x=>x.id===battle.id);$('battle').innerHTML=`<div class="card fight"><div id="enemyArt" class="enemyArt">${e.icon}</div><h3>${e.name}</h3><div class="bar"><i style="width:${Math.max(0,battle.hp/e.hp*100)}%"></i></div><b>${battle.hp}/${e.hp} HP</b><div style="margin-top:14px"><button class="gold big" onclick="attack()">⚔️ УДАР</button><button onclick="quickHeal()">🩹 ЛЕЧИТЬ</button><button onclick="retreat()">ОТСТУПИТЬ</button></div></div>`;$('enemyList').innerHTML='';return}$('battle').innerHTML='';$('enemyList').innerHTML=ENEMIES.map(e=>`<div class="item enemy"><span>${e.icon}</span><div><b>${e.name}</b><small>❤️ ${e.hp} · ⚔️ ${e.attack} · 🛡️ ${e.def}<br>+${e.exp} XP · +${e.coins} 🪙</small></div><button class="gold" onclick="startBattle('${e.id}')">АТАКА</button></div>`).join('')}
function renderWorld(){$('locations').innerHTML=LOCATIONS.map(x=>`<button class="location" onclick="travel('${x[0]}')"><span>${x[1]}</span><b>${x[0]}</b><small>${x[2]}</small></button>`).join('')}
function equip(id){const x=ITEMS[id];if(!x||x.type==='consumable'||!p.inventory.some(r=>r.id===id))return toast('Предмет отсутствует');p.equipment[x.type]=id;save();render();toast(`${x.name} надет`)}
function unequip(id){const x=ITEMS[id];if(x)p.equipment[x.type]=null;save();render();toast('Предмет снят')}
function dropItem(id){if(!confirm('Выбросить предмет?'))return;if(p.equipment.weapon===id)p.equipment.weapon=null;if(p.equipment.armor===id)p.equipment.armor=null;rem(id);save();render();toast('Предмет выброшен')}
function useItem(id){const x=ITEMS[id];if(!x||x.type!=='consumable'||p.hp>=p.maxHp)return toast(p.hp>=p.maxHp?'HP уже полное':'Предмет нельзя использовать');if(!rem(id))return;p.hp=Math.min(p.maxHp,p.hp+x.stat);save();render();toast(`${x.icon} +${x.stat} HP`)}
function buy(id){const x=ITEMS[id];if(!x)return;if(p.coins<x.price)return toast('Не хватает монет');p.coins-=x.price;add(id);save();render();toast(`Куплено: ${x.name}`)}
function fullHeal(){if(p.hp>=p.maxHp)return toast('HP уже полное');if(p.coins<25)return toast('Нужно 25 монет');p.coins-=25;p.hp=p.maxHp;save();render();toast('❤️ HP полностью восстановлено')}
function travel(name){p.location=name;save();render();toast(`📍 Вы прибыли: ${name}`)}
function startBattle(id){if(p.hp<=0)return toast('Нет HP');battle={id,hp:ENEMIES.find(x=>x.id===id).hp};show('arena');toast('Бой начался')}
function floatDamage(n){const art=$('enemyArt');if(!art)return;const d=document.createElement('div');d.className='damage';d.textContent='-'+n;d.style.left=(45+Math.random()*20)+'%';d.style.top='28%';art.parentElement.appendChild(d);setTimeout(()=>d.remove(),750)}
function attack(){if(!battle)return;const e=ENEMIES.find(x=>x.id===battle.id),s=stats();const crit=Math.random()<Math.min(.35,.08+p.level*.01);let dmg=Math.max(1,s.attack-e.def+Math.floor(Math.random()*5));if(crit)dmg*=2;battle.hp=Math.max(0,battle.hp-dmg);const art=$('enemyArt');art?.classList.add('hit');floatDamage(dmg);setTimeout(()=>art?.classList.remove('hit'),350);if(battle.hp<=0){p.wins++;p.exp+=e.exp;p.coins+=e.coins;const ups=levelUp();battle=null;save();render();toast(`🏆 Победа! +${e.exp} XP +${e.coins} 🪙${crit?' · КРИТ!':''}${ups.length?' · Уровень '+ups.join(' → '):''}`);return}const enemyDmg=Math.max(1,e.attack-s.def+Math.floor(Math.random()*4));p.hp=Math.max(0,p.hp-enemyDmg);if(p.hp===0){p.losses++;p.hp=Math.max(1,Math.floor(p.maxHp*.25));battle=null;toast(`💀 Поражение. -${enemyDmg} HP. Вы восстановлены до ${p.hp} HP.`)}else toast(`${crit?'💥 КРИТ! ':''}Ты нанёс ${dmg}, враг нанёс ${enemyDmg}`);save();render()}
function retreat(){battle=null;render();toast('Ты отступил')}
function quickHeal(){const r=p.inventory.find(x=>['bandage','medkit','stim'].includes(x.id));if(r)useItem(r.id);else toast('Нет аптечек')}
function betValue(){return Math.max(1,Math.min(500,Math.floor(Number($('bet').value)||1)))}
function slots(){const bet=betValue();if(p.coins<bet)return toast('Не хватает монет');p.coins-=bet;$('reels').classList.add('spin');setTimeout(()=>$('reels').classList.remove('spin'),550);const a=['🍒','🍋','🔔','⭐','💎','7️⃣'],r=[0,0,0].map(()=>a[Math.floor(Math.random()*a.length)]);const mult=r[0]===r[1]&&r[1]===r[2]?(r[0]==='7️⃣'?10:5):(r[0]===r[1]||r[1]===r[2]||r[0]===r[2]?2:0);$('reels').textContent=r.join('　');if(mult)p.coins+=bet*mult;save();render();toast(mult?`🎰 Выигрыш x${mult}`:'🎰 Мимо!')}
function rollDice(){const bet=betValue();if(p.coins<bet)return toast('Не хватает монет');p.coins-=bet;const n=1+Math.floor(Math.random()*6),win=n>=4;if(win)p.coins+=bet*2;$('dice').textContent='🎲 '+n;save();render();toast(win?'🎲 Победа x2':'🎲 Проигрыш')}
function appendChat(item){const log=$('chatLog');if(!log)return;const d=document.createElement('div');d.className='msg';const t=new Date(item.time||Date.now()).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});d.innerHTML=`<b>${esc(item.name)}</b> <small class="muted">${t}</small><br>${esc(item.text)}`;log.appendChild(d);log.scrollTop=log.scrollHeight}
async function loadChat(){try{const r=await fetch('/api/chat',{cache:'no-store'});if(!r.ok)return;const data=await r.json();$('chatLog').innerHTML='';(data.messages||[]).forEach(appendChat)}catch{}}
function connect(){try{const proto=location.protocol==='https:'?'wss':'ws';ws=new WebSocket(`${proto}://${location.host}`);ws.onopen=()=>{ws.send(JSON.stringify({type:'hello',name:p.name}));};ws.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='online'){$('topOnline').textContent=m.count;$('onlineBig').textContent=m.count;if(m.history){$('chatLog').innerHTML='';m.history.forEach(appendChat)}}if(m.type==='chat')appendChat(m.message)}catch{}};ws.onclose=()=>setTimeout(connect,3000)}catch{setTimeout(connect,3000)}}
function sendChat(){const input=$('chatInput'),text=input.value.trim();if(!text)return;if(!ws||ws.readyState!==WebSocket.OPEN)return toast('Чат подключается...');ws.send(JSON.stringify({type:'chat',text}));input.value=''}
$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});
window.show=show;window.equip=equip;window.unequip=unequip;window.dropItem=dropItem;window.useItem=useItem;window.buy=buy;window.fullHeal=fullHeal;window.travel=travel;window.startBattle=startBattle;window.attack=attack;window.retreat=retreat;window.quickHeal=quickHeal;window.slots=slots;window.rollDice=rollDice;window.sendChat=sendChat;
render();loadChat();connect();
