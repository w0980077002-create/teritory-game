const key='territory_save_v1';
let s=JSON.parse(localStorage.getItem(key)||'null')||{gold:1250,diamonds:240,coc:0,energy:100,level:1,xp:0,hp:100,chapter:1,ship:1,battle:0,hero:'Валькирия',gear:['Стальной топор','Кожаная броня'],runes:3,quests:0,mined:0,plundered:0,last:Date.now()};
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
function hero(){shell(`<div class="hero"><div class="motion-scene"><div class="motion-glow"></div><div class="motion-character">🧝‍♀️</div><div class="motion-sword">⚔️</div><i class="motion-particle p1"></i><i class="motion-particle p2"></i><i class="motion-particle p3"></i></div><div class="rarity">★ ★ ★ ★ ★</div><h2>${s.hero}</h2><div class="muted">Сила судьбы · ${s.level} уровень</div><div class="bars"><div class="muted">HP ${s.hp}/100</div><div class="bar"><i style="width:${s.hp}%"></i></div><div class="muted">Опыт ${s.xp}/${s.level*100}</div><div class="bar"><i style="width:${s.xp/(s.level*100)*100}%"></i></div></div></div><div class="section"><h2>Экипировка</h2><button class="tab" onclick="shop()">Открыть магазин</button></div><div class="list">${s.gear.map((g,i)=>`<div class="row move-row"><div class="ico">${i?'🛡️':'🪓'}</div><div class="grow"><b>${g}</b><small>Сила +${8+i*7} · Уровень ${s.level}</small></div><button class="tab" onclick="toast('Предмет экипирован')">Надеть</button></div>`).join('')}</div><div class="section"><h2>Характеристики</h2></div><div class="grid"><div class="card"><div class="big">${40+s.level*8}</div><div class="muted">Атака</div></div><div class="card"><div class="big">${25+s.level*6}</div><div class="muted">Защита</div></div><div class="card"><div class="big">${10+s.level}</div><div class="muted">Крит</div></div><div class="card"><div class="big">${s.energy}</div><div class="muted">Энергия</div></div></div>`,'hero')}
function mine(){shell(`<div class="hero"><div class="heroart"><span class="anim-pick">⛏️</span><i class="spark s2"></i><i class="spark s4"></i></div><h2>COC Mining</h2><div class="timer" id="timer">00:10:00</div><div class="muted">Автоматическая добыча награды. Чем выше уровень и вес, тем больше доход.</div><button class="btn green" onclick="mineNow()">ДОБЫВАТЬ СЕЙЧАС</button></div><div class="grid"><div class="card"><h3><span class="anim-ship">⛵</span> Sailing</h3><div class="big">${s.ship}</div><div class="muted">Уровень корабля</div><button class="btn alt" onclick="sail()">Отправить</button></div><div class="card"><h3>🏴‍☠️ Plunder</h3><div class="big">${s.plundered}</div><div class="muted">Успешных рейдов</div><button class="btn" onclick="plunder()">Грабить</button></div></div><div class="notice">Показатель веса: <b>${(1+s.level/10).toFixed(2)}×</b>. В оригинальной механике проекта награды зависели от прогресса, VIP/скинов и глав.</div>`,'mine')}
function mineNow(){let n=5+s.level*2;s.coc+=n;s.mined+=n;save();toast('Добыто +'+n.toFixed(0)+' COC');mine()}
function sail(){let n=20+s.ship*12;s.gold+=n;s.coc+=2;save();toast('Корабль вернулся: +'+n+' золота');home()}
function plunder(){if(s.energy<5){toast('Нужна энергия');return}s.energy-=5;s.plundered++;let n=40+s.chapter*15;s.gold+=n;s.coc+=3;save();toast('Успешный грабёж +'+n+' золота');mine()}
function shop(){shell(`<div class="section"><h2>🛒 Магазин</h2></div><div class="list">${[['🪓','Топор берсерка',350,'+20 атаки'],['🛡️','Щит викинга',300,'+18 защиты'],['🔮','Набор рун',120,'+5 рун'],['⚡','Ускорение',80,'30 минут добычи']].map(x=>`<div class="row move-row"><div class="ico">${x[0]}</div><div class="grow"><b>${x[1]}</b><small>${x[3]}</small></div><button class="tab" onclick="buy(${x[2]},'${x[1]}')">${x[2]} 🪙</button></div>`).join('')}</div><div class="notice">Все покупки в демо-версии оплачиваются игровой валютой и не являются финансовыми операциями.</div>`,'more')}
function buy(cost,name){if(s.gold<cost){toast('Не хватает золота');return}s.gold-=cost;if(name.includes('руны'))s.runes+=5;else s.gear.push(name);save();toast('Куплено: '+name);shop()}
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
  requestAnimationFrame(startMotion);
};

home();
startMotion();
