const key='territory_save_v1';
var langKey='territory_language_v1';
var currentLang=localStorage.getItem(langKey)||'ru';
let s=JSON.parse(localStorage.getItem(key)||'null')||{gold:1250,diamonds:240,coc:0,energy:100,level:1,xp:0,hp:100,chapter:1,ship:1,battle:0,hero:'Валькирия',gear:['Стальной топор','Кожаная броня'],runes:3,quests:0,mined:0,plundered:0,last:Date.now()};
// Territory v3: equipment/inventory migration
if(!Array.isArray(s.inventory)){s.inventory=[]}
if(!s.equipped){s.equipped={weapon:s.gear&&s.gear[0]||'Стальной топор',armor:s.gear&&s.gear[1]||'Кожаная броня',helmet:null,accessory:null}}
var starterItems=[
{id:'w1',name:'Стальной топор',type:'weapon',icon:'🪓',atk:8,def:0,price:350},
{id:'w2',name:'Меч северянина',type:'weapon',icon:'⚔️',atk:15,def:0,price:650},
{id:'a1',name:'Кожаная броня',type:'armor',icon:'🛡️',atk:0,def:7,price:300},
{id:'a2',name:'Броня валькирии',type:'armor',icon:'🛡️',atk:0,def:16,price:700},
{id:'h1',name:'Шлем викинга',type:'helmet',icon:'⛑️',atk:2,def:6,price:450},
{id:'r1',name:'Амулет судьбы',type:'accessory',icon:'🔮',atk:7,def:4,price:550}
];
if(s.inventory.length===0){s.inventory=['w2','a2','h1','r1'];save()}
function itemById(id){for(var i=0;i<starterItems.length;i++){if(starterItems[i].id===id)return starterItems[i]}return null}
function syncGear(){s.gear=[];['weapon','armor','helmet','accessory'].forEach(function(slot){if(s.equipped[slot]){var it=itemById(s.equipped[slot]);if(it)s.gear.push(it.name)}})}
syncGear();
function save(){localStorage.setItem(key,JSON.stringify(s))}
function addXP(n){s.xp+=n;if(s.xp>=s.level*100){s.xp-=s.level*100;s.level++;s.energy=Math.min(100,s.energy+20);toast('Новый уровень: '+s.level+'!')}}
function toast(t){let x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),1600)}
function nav(active){return `<nav class="nav">${[['home','🏠','Главная'],['raid','⚔️','Приключение'],['hero','🛡️','Герой'],['mine','⛏️','Добыча'],['more','☰','Ещё']].map(a=>`<button class="${active===a[0]?'active':''}" onclick="go('${a[0]}')"><span>${a[1]}</span>${a[2]}</button>`).join('')}</nav>`}
function shell(body,active='home'){document.getElementById('app').innerHTML=`<div class="app"><header class="top"><div class="brand"><div class="logo">⚔️</div><div><div class="title">Territory</div><div class="sub">Глава ${s.chapter} · Уровень ${s.level}</div></div></div><div class="stats"><div class="pill"><b>🪙 ${s.gold}</b><span>Золото</span></div><div class="pill"><b>💎 ${s.diamonds}</b><span>Алмазы</span></div><div class="pill"><b>🪙 ${s.coc.toFixed(2)}</b><span>COC</span></div></div></header><main class="screen">${body}</main>${nav(active)}</div>`}
function home(){shell(`<div class="hero"><div class="heroart"><span class="anim-float">🧝‍♀️<span class="anim-swing">⚔️</span></span><i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i></div><div class="rarity">★ ★ ★ ★ ★</div><h2>${s.hero}</h2><div class="muted">Сила судьбы · ${s.level} уровень</div><div class="bars"><div class="muted">HP ${s.hp}/100</div><div class="bar"><i style="width:${s.hp}%"></i></div><div class="muted">Опыт ${s.xp}/${s.level*100}</div><div class="bar"><i style="width:${s.xp/(s.level*100)*100}%"></i></div></div></div><div class="section"><h2>Быстрые действия</h2></div><div class="grid"><div class="card"><h3>⚔️ Рейд</h3><div class="muted">Автобой и награды</div><button class="btn" onclick="go('raid')">В бой</button></div><div class="card"><h3>⛏️ Добыча</h3><div class="muted">Пассивный доход</div><button class="btn green" onclick="go('mine')">Добывать</button></div><div class="card"><h3>🚢 Плавание</h3><div class="muted">Отправить корабль</div><button class="btn alt" onclick="sail()">Отправить</button></div><div class="card"><h3>🎲 Лотерея</h3><div class="muted">Ежедневные розыгрыши</div><button class="btn alt" onclick="lottery()">Участвовать</button></div></div><div class="section"><h2>События</h2></div><div class="notice">🔥 Чем активнее играешь, тем больше наград. В этой версии экономика учебная: реальные деньги и криптокошельки не подключены.</div>`,'home')}
function raid(){shell(`<div class="section"><h2>⚔️ Приключение</h2><span class="muted">Глава ${s.chapter}</span></div><div class="hero"><div class="heroart anim-battle"><span class="anim-boss">🐉</span><i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i><i class="spark s4"></i></div><h2>Хранитель фьорда</h2><div class="muted">Сложность: ${'★'.repeat(Math.min(5,s.chapter+1))}</div><div class="grid"><div class="card"><b>❤️ 180</b><div class="muted">Здоровье врага</div></div><div class="card"><b>🏆 +${100+s.chapter*20}</b><div class="muted">Награда</div></div></div><button class="btn red" onclick="fight()">НАЧАТЬ АВТОБОЙ</button></div><div class="section"><h2>Руны и усиления</h2></div><div class="list"><div class="row move-row"><div class="ico">🔮</div><div class="grow"><b>Руна ярости</b><small>+15% к атаке на 1 бой</small></div><b>×${s.runes}</b></div><div class="row move-row"><div class="ico">⚡</div><div class="grow"><b>Ускорение</b><small>Сокращает время добычи</small></div><button class="btn alt" style="width:auto;margin:0" onclick="useBoost()">Исп.</button></div></div>`,'raid')}
function fight(){
 if(s.energy<10){toast('Недостаточно энергии');return}
 s.energy-=10;
 save();
 raid();
 var dmg=document.createElement('div');dmg.className='damage-fx';dmg.textContent='-'+(65+s.level*7);
 document.body.appendChild(dmg);
 setTimeout(function(){
   var reward=120+s.chapter*35;
   s.gold+=reward;
   s.coc+=Math.random()*2+1;
   addXP(35);
   s.battle++;
   if(s.battle%3===0)s.chapter++;
   save();
   toast('⚔️ Победа! +'+reward+' золота');
   raid();
 },850);
}
function hero(){
 var slots=[['weapon','⚔️','Оружие'],['armor','🛡️','Броня'],['helmet','⛑️','Шлем'],['accessory','🔮','Амулет']];
 var atk=40+s.level*8,def=25+s.level*6;
 slots.forEach(function(x){if(s.equipped[x[0]]){var it=itemById(s.equipped[x[0]]);if(it){atk+=it.atk;def+=it.def}}});
 var inv=s.inventory.map(function(id){return itemById(id)}).filter(Boolean);
 shell('<div class="hero hero-v3"><div class="motion-scene"><div class="motion-glow"></div><div class="motion-character hero-character-v3">🧝‍♀️</div><div class="motion-sword">⚔️</div><i class="motion-particle p1"></i><i class="motion-particle p2"></i><i class="motion-particle p3"></i><div class="equipment-aura"></div></div><div class="rarity">★ ★ ★ ★ ★</div><h2>'+s.hero+'</h2><div class="muted">Сила судьбы · '+s.level+' уровень</div><div class="bars"><div class="muted">HP '+s.hp+'/100</div><div class="bar"><i style="width:'+s.hp+'%"></i></div><div class="muted">Опыт '+s.xp+'/'+s.level*100+'</div><div class="bar"><i style="width:'+s.xp/(s.level*100)*100+'%"></i></div></div></div><div class="section"><h2>⚔️ Экипировка</h2><span class="muted">'+inv.length+' предметов</span></div><div class="equip-grid">'+slots.map(function(x){var it=s.equipped[x[0]]?itemById(s.equipped[x[0]]):null;return '<div class="equip-slot '+(it?'filled':'empty')+'"><div class="slot-icon">'+(it?it.icon:x[1])+'</div><b>'+x[2]+'</b><small>'+(it?it.name:'Пусто')+'</small>'+(it?'<button class="tab" onclick="unequip(\''+x[0]+'\')">Снять</button>':'<button class="tab" onclick="inventory()">Выбрать</button>')+'</div>'}).join('')+'</div><div class="section"><h2>🎒 Инвентарь</h2><button class="tab" onclick="inventory()">Открыть всё</button></div><div class="list">'+inv.map(function(it){var equipped=Object.keys(s.equipped).some(function(k){return s.equipped[k]===it.id});return '<div class="row move-row item-row"><div class="ico item-icon">'+it.icon+'</div><div class="grow"><b>'+it.name+'</b><small>'+itemType(it.type)+' · ⚔️ +'+it.atk+' · 🛡️ +'+it.def+'</small></div>'+(equipped?'<span class="equipped-badge">НАДЕТО</span>':'<button class="tab" onclick="equip(\''+it.id+'\')">Надеть</button>')+'</div>'}).join('')+'</div><div class="section"><h2>📊 Характеристики</h2></div><div class="grid"><div class="card"><div class="big">'+atk+'</div><div class="muted">Атака</div></div><div class="card"><div class="big">'+def+'</div><div class="muted">Защита</div></div><div class="card"><div class="big">'+(10+s.level)+'</div><div class="muted">Крит</div></div><div class="card"><div class="big">'+s.energy+'</div><div class="muted">Энергия</div></div></div>','hero');
}
function itemType(t){return t==='weapon'?'Оружие':t==='armor'?'Броня':t==='helmet'?'Шлем':'Аксессуар'}
function equip(id){var it=itemById(id);if(!it)return;var old=s.equipped[it.type];s.equipped[it.type]=id;syncGear();save();toast('⚔️ '+it.name+' экипирован');hero()}
function unequip(slot){var old=s.equipped[slot];if(!old)return;s.equipped[slot]=null;syncGear();save();toast('Предмет снят');hero()}
function dropItem(id){var it=itemById(id);if(!it)return;var used=false;Object.keys(s.equipped).forEach(function(k){if(s.equipped[k]===id)used=true});if(used){toast('Сначала сними предмет');return} s.inventory=s.inventory.filter(function(x){return x!==id});save();toast('🗑️ '+it.name+' выброшен');inventory()}
function inventory(){var inv=s.inventory.map(function(id){return itemById(id)}).filter(Boolean);shell('<div class="section"><h2>🎒 Инвентарь Territory</h2><span class="muted">'+inv.length+' предметов</span></div><div class="notice">Здесь можно надеть, снять или выбросить предмет. Надетая экипировка сразу меняет характеристики героя.</div><div class="inventory-full">'+inv.map(function(it){var used=Object.keys(s.equipped).some(function(k){return s.equipped[k]===it.id});return '<div class="inventory-card '+(used?'is-equipped':'')+'"><div class="inv-top"><div class="inv-icon">'+it.icon+'</div><div><b>'+it.name+'</b><small>'+itemType(it.type)+'</small></div></div><div class="inv-stats">⚔️ +'+it.atk+' &nbsp; 🛡️ +'+it.def+'</div><div class="inv-actions">'+(used?'<button class="tab" onclick="unequip(\''+it.type+'\');inventory()">Снять</button>':'<button class="btn green" onclick="equip(\''+it.id+'\');inventory()">Надеть</button>')+'<button class="tab danger-tab" onclick="dropItem(\''+it.id+'\')">Выбросить</button></div></div>'}).join('')+'</div><button class="btn alt" onclick="hero()">← Вернуться к герою</button>','hero')}
function mine(){shell(`<div class="hero"><div class="heroart"><span class="anim-pick">⛏️</span><i class="spark s2"></i><i class="spark s4"></i></div><h2>COC Mining</h2><div class="timer" id="timer">00:10:00</div><div class="muted">Автоматическая добыча награды. Чем выше уровень и вес, тем больше доход.</div><button class="btn green" onclick="mineNow()">ДОБЫВАТЬ СЕЙЧАС</button></div><div class="grid"><div class="card"><h3><span class="anim-ship">⛵</span> Sailing</h3><div class="big">${s.ship}</div><div class="muted">Уровень корабля</div><button class="btn alt" onclick="sail()">Отправить</button></div><div class="card"><h3>🏴‍☠️ Plunder</h3><div class="big">${s.plundered}</div><div class="muted">Успешных рейдов</div><button class="btn" onclick="plunder()">Грабить</button></div></div><div class="notice">Показатель веса: <b>${(1+s.level/10).toFixed(2)}×</b>. В оригинальной механике проекта награды зависели от прогресса, VIP/скинов и глав.</div>`,'mine')}
function mineNow(){let n=5+s.level*2;s.coc+=n;s.mined+=n;save();toast('Добыто +'+n.toFixed(0)+' COC');mine()}
function sail(){let n=20+s.ship*12;s.gold+=n;s.coc+=2;save();toast('Корабль вернулся: +'+n+' золота');home()}
function plunder(){if(s.energy<5){toast('Нужна энергия');return}s.energy-=5;s.plundered++;let n=40+s.chapter*15;s.gold+=n;s.coc+=3;save();toast('Успешный грабёж +'+n+' золота');mine()}
function shop(){shell(`<div class="section"><h2>🛒 Магазин</h2></div><div class="list">${[['🪓','Топор берсерка',350,'+20 атаки'],['🛡️','Щит викинга',300,'+18 защиты'],['🔮','Набор рун',120,'+5 рун'],['⚡','Ускорение',80,'30 минут добычи']].map(x=>`<div class="row move-row"><div class="ico">${x[0]}</div><div class="grow"><b>${x[1]}</b><small>${x[3]}</small></div><button class="tab" onclick="buy(${x[2]},'${x[1]}')">${x[2]} 🪙</button></div>`).join('')}</div><div class="notice">Все покупки в демо-версии оплачиваются игровой валютой и не являются финансовыми операциями.</div>`,'more')}
function buy(cost,name){if(s.gold<cost){toast('Не хватает золота');return}s.gold-=cost;if(name.includes('руны')){s.runes+=5}else{var found=null;for(var i=0;i<starterItems.length;i++){if(starterItems[i].name===name){found=starterItems[i];break}}if(found)s.inventory.push(found.id)}syncGear();save();toast('Куплено: '+name);shop()}
function quests(){shell(`<div class="section"><h2>📜 Задания</h2></div><div class="list">${[['⚔️','Победить 3 врагов','+200 🪙',s.battle%3],['⛏️','Добыть 20 COC','+50 💎',s.mined],['🚢','Совершить плавание','+100 🪙',s.chapter]].map(q=>`<div class="row move-row"><div class="ico">${q[0]}</div><div class="grow"><b>${q[1]}</b><small>Награда ${q[2]} · прогресс ${q[3]}</small></div><button class="tab" onclick="toast('Награда проверена')">Забрать</button></div>`).join('')}</div>`,'more')}
function community(){shell(`<div class="section"><h2>🌐 Сообщество Territory</h2></div><div class="list"><div class="row move-row"><div class="ico">📢</div><div class="grow"><b>Канал Territory</b><small>Новости, обновления и события</small></div><button class="tab" onclick="openTelegram('https://t.me/CLUBo50')">Открыть</button></div><div class="row move-row"><div class="ico">💬</div><div class="grow"><b>Чат Territory</b><small>Общий чат игроков</small></div><button class="tab" onclick="openTelegram('https://t.me/chatCLUB50')">Открыть</button></div><div class="row move-row"><div class="ico">🗨️</div><div class="grow"><b>Обсуждение канала</b><small>Обсуждение публикаций Territory</small></div><button class="tab" onclick="openTelegram('https://t.me/chatCLUB50')">Открыть</button></div><div class="row move-row"><div class="ico">🤖</div><div class="grow"><b>@TeritoryGameBot</b><small>Открыть бота Territory</small></div><button class="tab" onclick="openTelegram('https://t.me/TeritoryGameBot')">Открыть</button></div></div><div class="notice">💬 Чат Territory подключён: t.me/chatCLUB50</div>`,'more')}
function openTelegram(url){try{if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.openTelegramLink){window.Telegram.WebApp.openTelegramLink(url);}else{window.location.href=url;}}catch(e){window.location.href=url;}}
function more(){shell(`<div class="section"><h2>☰ Ещё</h2></div><div class="grid"><div class="card"><h3>📜 Задания</h3><button class="btn" onclick="quests()">Открыть</button></div><div class="card"><h3>🛒 Магазин</h3><button class="btn" onclick="shop()">Открыть</button></div><div class="card"><h3>🎲 Лотерея</h3><button class="btn" onclick="lottery()">Розыгрыш</button></div><div class="card"><h3>🏆 Рейтинг</h3><button class="btn alt" onclick="rank()">Смотреть</button></div><div class="card"><h3>🌐 Сообщество</h3><div class="muted">Канал и обсуждение</div><button class="btn green" onclick="community()">Открыть</button></div><div class="card"><h3>👥 Пригласить</h3><div class="muted">Бонус за друзей</div><button class="btn green" onclick="toast('Ссылка приглашения скопирована')">Пригласить</button></div><div class="card"><h3>⚙️ Настройки</h3><button class="btn alt" onclick="resetGame()">Сбросить демо</button></div></div>`,'more')}
function lottery(){if(s.gold<50){toast('Нужно 50 золота');return}s.gold-=50;let n=Math.floor(Math.random()*5)+1;s.diamonds+=n*10;save();toast('🎉 Выигрыш: '+n*10+' алмазов');home()}
function rank(){shell(`<div class="section"><h2>🏆 Рейтинг</h2></div><div class="list">${['Ragnar','Odin','Valkyrie','Bjorn','Ты'].map((x,i)=>`<div class="row move-row"><div class="ico">${i+1}</div><div class="grow"><b>${x}</b><small>Уровень ${20-i*2} · Глава ${12-i}</small></div><b>${(98700-i*8120).toLocaleString()}</b></div>`).join('')}</div>`,'more')}
function useBoost(){toast('Ускорение активировано на 5 минут')}
function resetGame(){localStorage.removeItem(key);location.reload()}
function go(p){if(p==='home')home();else if(p==='raid')raid();else if(p==='hero')hero();else if(p==='mine')mine();else more()}
function startMotion(){
  if(window.__territoryMotionStarted)return;
  window.__territoryMotionStarted=true;
  var phase=0,last=0;
  function tick(ts){
    if(ts-last>16){
      phase=ts/1000;
      var hero=document.querySelector('.anim-float');
      if(hero){
        var y=Math.sin(phase*2.4)*9;
        var r=Math.sin(phase*1.2)*2.2;
        hero.style.transform='translate3d(0,'+y+'px,0) rotate('+r+'deg)';
      }
      var sword=document.querySelector('.anim-swing');
      if(sword){
        var sr=Math.sin(phase*5.0)*24;
        sword.style.transform='rotate('+sr+'deg) translate3d(0,'+(Math.abs(Math.sin(phase*5))*3)+'px,0)';
      }
      var boss=document.querySelector('.anim-boss');
      if(boss){
        var by=Math.sin(phase*2.0)*8;
        var bs=1+Math.sin(phase*2.0)*0.035;
        boss.style.transform='translate3d(0,'+by+'px,0) scale('+bs+')';
      }
      var pick=document.querySelector('.anim-pick');
      if(pick){
        var pr=-28+Math.sin(phase*4.5)*38;
        pick.style.transform='rotate('+pr+'deg)';
      }
      var ship=document.querySelector('.anim-ship');
      if(ship){
        var sx=Math.sin(phase*1.8)*10;
        var sy=Math.sin(phase*3.6)*3;
        ship.style.transform='translate3d('+sx+'px,'+sy+'px,0) rotate('+(Math.sin(phase*1.8)*2)+'deg)';
      }
      var sparks=document.querySelectorAll('.spark');
      for(var i=0;i<sparks.length;i++){
        var a=phase*1.7+i*1.57;
        sparks[i].style.transform='translate3d('+Math.sin(a)*16+'px,'+Math.cos(a)*20+'px,0) scale('+(0.7+0.5*(Math.sin(a)+1)/2)+')';
        sparks[i].style.opacity=(0.25+0.75*(Math.sin(a)+1)/2).toFixed(2);
      }
      last=ts;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Re-start motion whenever a screen is rendered.
var _oldShell=shell;
shell=function(body,active){
  _oldShell(body,active);
  addLanguageButton();
  applyLanguage();
  requestAnimationFrame(startMotion);
};

function addLanguageButton(){
  var top=document.querySelector('.top');
  if(!top)return;
  var old=document.getElementById('languageBtn');
  if(old)old.remove();
  var b=document.createElement('button');
  b.id='languageBtn';
  b.className='language-btn';
  b.type='button';
  b.textContent=currentLang==='ru'?'EN':'RU';
  b.onclick=function(){
    currentLang=currentLang==='ru'?'en':'ru';
    localStorage.setItem(langKey,currentLang);
    applyLanguage();
    addLanguageButton();
  };
  top.appendChild(b);
}

var RU_EN=[
 ['Главная','Home'],['Приключение','Adventure'],['Герой','Hero'],['Добыча','Mining'],['Ещё','More'],
 ['Золото','Gold'],['Алмазы','Diamonds'],['Глава','Chapter'],['Уровень','Level'],['Сила судьбы','Fate Power'],
 ['Быстрые действия','Quick Actions'],['Рейд','Raid'],['Автобой и награды','Auto battle and rewards'],['В бой','Fight'],
 ['Добывать','Mine'],['Плавание','Sailing'],['Отправить','Send'],['Лотерея','Lottery'],['Участвовать','Enter'],
 ['События','Events'],['Чем активнее играешь, тем больше наград.','The more you play, the more rewards you get.'],
 ['Автобой','Auto battle'],['Хранитель фьорда','Fjord Guardian'],['Сложность','Difficulty'],['Здоровье врага','Enemy health'],
 ['Награда','Reward'],['НАЧАТЬ АВТОБОЙ','START AUTO BATTLE'],['Руны и усиления','Runes and boosts'],['Руна ярости','Rune of Fury'],
 ['Ускорение','Speed Boost'],['Сокращает время добычи','Reduces mining time'],['Исп.','Use'],['Экипировка','Equipment'],
 ['Оружие','Weapon'],['Броня','Armor'],['Шлем','Helmet'],['Амулет','Amulet'],['Пусто','Empty'],['Снять','Unequip'],
 ['Выбрать','Choose'],['Инвентарь','Inventory'],['Открыть всё','Open all'],['Надеть','Equip'],['НАДЕТО','EQUIPPED'],
 ['Характеристики','Stats'],['Атака','Attack'],['Защита','Defense'],['Крит','Crit'],['Энергия','Energy'],
 ['Обычная атака','Basic attack'],['Грозовой удар','Thunder strike'],['Защита','Defense'],['Автоматический бой','Automatic battle'],
 ['Команда атакует сама каждые 2 секунды','The team attacks automatically every 2 seconds'],['НАЧАТЬ БОЙ','START BATTLE'],
 ['ПОБЕДА!','VICTORY!'],['Следующий рейд','NEXT RAID'],['Открыть','Open'],['Задания','Quests'],['Магазин','Shop'],
 ['Рейтинг','Ranking'],['Сообщество','Community'],['Канал и обсуждение','Channel and discussion'],['Пригласить','Invite'],
 ['Бонус за друзей','Friend bonus'],['Настройки','Settings'],['Сбросить демо','Reset demo'],['Новости Territory','Territory News'],
 ['Чат Territory','Territory Chat'],['Обсуждение канала','Channel Discussion'],['Открыть бота Territory','Open Territory bot'],
 ['Общий чат игроков','Players common chat'],['Обсуждение публикаций Territory','Discuss Territory posts'],['Предмет снят','Item unequipped'],
 ['Нужно 50 золота','50 gold required'],['Недостаточно энергии','Not enough energy'],['Ускорение активировано на 5 минут','Speed boost activated for 5 minutes'],
 ['Ссылка приглашения скопирована','Invite link copied'],['Розыгрыш','Draw'],['Смотреть','View'],['Открыть всё','Open all'],
 ['Это игровая демо-механика.','This is a gameplay demo mechanic.'],['Предмет выброшен','Item discarded'],['Сначала сними предмет','Unequip the item first'],
 ['Оружие','Weapon'],['Броня','Armor'],['Шлем','Helmet'],['Аксессуар','Accessory'],['Золото','Gold'],['Алмазы','Diamonds']
];
function applyLanguage(){
  var root=document.getElementById('app'); if(!root)return;
  root.setAttribute('lang',currentLang);
  var nodes=root.querySelectorAll('*');
  for(var i=0;i<nodes.length;i++){
    if(nodes[i].id==='languageBtn')continue;
    if(nodes[i].children.length===0 && nodes[i].textContent.trim()){
      var txt=nodes[i].textContent;
      if(currentLang==='en'){
        for(var j=0;j<RU_EN.length;j++)txt=txt.split(RU_EN[j][0]).join(RU_EN[j][1]);
      }else{
        for(var j=0;j<RU_EN.length;j++)txt=txt.split(RU_EN[j][1]).join(RU_EN[j][0]);
      }
      nodes[i].textContent=txt;
    }
  }
  // Dynamic strings that are built outside leaf text nodes
  var els=root.querySelectorAll('.sub');
  for(var k=0;k<els.length;k++)els[k].textContent=(currentLang==='en'?'Chapter ':'Глава ')+s.chapter+' · '+(currentLang==='en'?'Level ':'Уровень ')+s.level;
  var title=root.querySelector('.title'); if(title)title.textContent='Territory';
}
function setLanguage(v){currentLang=v==='en'?'en':'ru';localStorage.setItem(langKey,currentLang);applyLanguage();addLanguageButton()}

home();
startMotion();

/* ===== Territory v2 gameplay layer ===== */
var battleTimer=null;
var battleState={hp:180,max:180,auto:true,turn:0,ended:false,inBattle:false};
function stopBattleTimer(){if(battleTimer){clearInterval(battleTimer);battleTimer=null}}
function battleLog(text){var box=document.getElementById('combatLog');if(!box)return;var d=document.createElement('div');d.innerHTML=text;box.insertBefore(d,box.firstChild);while(box.children.length>6)box.removeChild(box.lastChild)}
function spawnDamage(n){var a=document.getElementById('battleArena');if(!a)return;var d=document.createElement('div');d.className='float-damage';d.textContent='-'+n;a.appendChild(d);setTimeout(function(){d.remove()},800)}
function animateUnit(id,cls){var el=document.getElementById(id);if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
function updateBossBar(){var i=document.getElementById('bossHp');var t=document.getElementById('bossHpText');if(i)i.style.width=Math.max(0,battleState.hp/battleState.max*100)+'%';if(t)t.textContent=Math.max(0,battleState.hp)+' / '+battleState.max}
function enemyHit(dmg,source){if(battleState.ended)return;battleState.hp=Math.max(0,battleState.hp-dmg);animateUnit('enemyUnit','hit');spawnDamage(dmg);battleLog('<b>'+source+'</b> наносит '+dmg+' урона.');updateBossBar();if(battleState.hp<=0)winBattle()}
function allyAttack(id,name,base){if(battleState.ended)return;animateUnit(id,'attacking');setTimeout(function(){var dmg=base+Math.floor(Math.random()*12);enemyHit(dmg,name)},170)}
function autoTurn(){if(!battleState.auto||battleState.ended)return;battleState.turn++;var n=battleState.turn%3;if(n===1)allyAttack('allyUnit1','Валькирия',24);else if(n===2)allyAttack('allyUnit2','Берсерк',20);else allyAttack('allyUnit3','Следопыт',18)}
function toggleAuto(){battleState.auto=!battleState.auto;var b=document.getElementById('autoBtn');if(b){b.className='switch '+(battleState.auto?'on':'');b.innerHTML='<i></i>'}toast(battleState.auto?'Автобой включён':'Автобой выключен')}
function useSkill(kind){if(battleState.ended)return;if(kind==='rage'){enemyHit(48+s.level*3,'Руна ярости');animateUnit('allyUnit1','attacking')}else if(kind==='storm'){enemyHit(32+s.level*2,'Грозовой удар');animateUnit('allyUnit2','attacking')}else{enemyHit(24+s.level,'Обычная атака');animateUnit('allyUnit3','attacking')}}
function winBattle(){battleState.ended=true;battleState.inBattle=false;stopBattleTimer();var reward=150+s.chapter*40;s.gold+=reward;s.coc+=2.5;addXP(45);s.battle++;if(s.battle%3===0)s.chapter++;save();battleLog('<b>ПОБЕДА!</b> Получено '+reward+' золота.');toast('🏆 Победа! +'+reward+' золота');var b=document.getElementById('fightBtn');if(b){b.textContent='СЛЕДУЮЩИЙ РЕЙД';b.className='btn green';b.onclick=function(){startBattle()}}}
function startBattle(){if(s.energy<10){toast('Недостаточно энергии');return}s.energy-=10;save();battleState={hp:180+s.chapter*10,max:180+s.chapter*10,auto:true,turn:0,ended:false,inBattle:true};raid();setTimeout(function(){battleLog('<b>Бой начался!</b> Отряд готов атаковать.');autoTurn()},350)}
function raid(){stopBattleTimer();shell('<div class="section"><h2>⚔️ Приключение</h2><span class="muted">Глава '+s.chapter+'</span></div><div class="battle-top"><div class="bossbar"><div class="label"><span>☠️ Хранитель фьорда</span><span id="bossHpText">'+battleState.hp+' / '+battleState.max+'</span></div><div class="bar"><i id="bossHp" style="width:'+(battleState.hp/battleState.max*100)+'%"></i></div></div></div><div class="battle-arena" id="battleArena"><div class="battle-sky"></div><div class="skill-ring"></div><div class="fighter ally1" id="allyUnit1"><span class="unit">🧝‍♀️</span><div class="name">Валькирия</div><div class="hpmini"><i></i></div></div><div class="fighter ally2" id="allyUnit2"><span class="unit">🪓</span><div class="name">Берсерк</div><div class="hpmini"><i></i></div></div><div class="fighter ally3" id="allyUnit3"><span class="unit">🏹</span><div class="name">Следопыт</div><div class="hpmini"><i></i></div></div><div class="fighter enemy" id="enemyUnit"><span class="unit">🐉</span><div class="name">Хранитель</div><div class="hpmini"><i id="enemyMiniHp" style="width:'+(battleState.hp/battleState.max*100)+'%"></i></div></div><div class="battle-ground"></div></div><div class="battle-actions"><button class="skill primary" onclick="useSkill(\'rage\')"><b>🔥</b>Руна ярости<small>48+ урона</small></button><button class="skill" onclick="useSkill(\'storm\')"><b>⚡</b>Грозовой удар<small>32+ урона</small></button><button class="skill" onclick="useSkill(\'hit\')"><b>⚔️</b>Атака<small>24+ урона</small></button><button class="skill" onclick="toast(\'🛡️ Защита активна\')"><b>🛡️</b>Защита<small>Щит отряда</small></button></div><div class="auto-row"><div><b>Автоматический бой</b><div class="muted">Команда атакует сама каждые 2 секунды</div></div><button id="autoBtn" class="switch on" onclick="toggleAuto()"><i></i></button></div><div class="combat-log" id="combatLog"><div><b>Система:</b> Выбери навык или включи автобой.</div></div><button id="fightBtn" class="btn red" onclick="startBattle()">НАЧАТЬ БОЙ · 10 ⚡</button><div class="notice">Команда: 3 героя · награда зависит от главы. Это игровая демо-механика.</div>','raid');updateBossBar();if(battleState.inBattle){battleTimer=setInterval(autoTurn,2000)}}
