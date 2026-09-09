(function () {
  'use strict';

  var app = document.getElementById('app');
  var S = {gold:84090000,gems:6752,tokens:39628,level:1017,damage:115.8,boss:100,auto:true};
  var autoTimer = null;

  function loadSave(){
    try {
      if(window.localStorage){
        var raw=window.localStorage.getItem('territorySave');
        if(raw){
          var x=JSON.parse(raw);
          if(x && typeof x==='object'){
            for(var k in S){ if(Object.prototype.hasOwnProperty.call(x,k) && x[k]!==undefined) S[k]=x[k]; }
          }
        }
      }
    } catch(e) {}
  }
  function save(){ try{ if(window.localStorage) window.localStorage.setItem('territorySave',JSON.stringify(S)); }catch(e){} }
  function fmt(n){ n=Number(n)||0; if(n>=1000000000)return (n/1000000000).toFixed(2)+'B'; if(n>=1000000)return (n/1000000).toFixed(2)+'M'; return Math.round(n).toLocaleString('ru-RU'); }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function top(){
    return '<div class="top"><button class="close" onclick="Territory.reload()">×</button><small>Закрыть</small><div class="stats">'+
      '<div class="avatar">⚔️</div><div class="pill red">🔥 3.09T</div><div class="pill gold">🪙 '+fmt(S.gold)+'</div><div class="pill violet">💎 '+fmt(S.gems)+'</div><div class="pill coins">🟡 85,240</div></div>'+
      '<button class="right" onclick="Territory.menu()">⋮</button></div>';
  }
  function bottom(){
    return '<div class="bottom"><div class="nav">'+
      '<button class="navbtn active" onclick="Territory.map()"><div class="navico">⚓</div>Порт</button>'+ 
      '<button class="navbtn" onclick="Territory.skills()"><div class="navico">📕</div>Навыки</button>'+ 
      '<button class="navbtn" onclick="Territory.battle()"><div class="navico">🛡️</div>Бой</button>'+ 
      '<button class="navbtn" onclick="Territory.adventure()"><div class="navico">🗺️</div>Приключения</button>'+ 
      '<button class="navbtn" onclick="Territory.shop()"><div class="navico">🎁</div>Магазин</button>'+ 
      '</div></div>';
  }
  function stopAuto(){ if(autoTimer){clearInterval(autoTimer);autoTimer=null;} }

  function map(){
    stopAuto();
    app.innerHTML=top()+'<div class="scene"><div class="map"><div class="water"></div><div class="island i1"></div><div class="island i2"></div><div class="island i3"></div><div class="sign">Приключение</div>'+ 
      '<button class="node node1" onclick="Territory.battle(\'Пустошь\')"><h3>☠ Хаотическое Пепелище</h3><b>Сегодняшние рейды 2/2</b><div class="building">🏚️</div></button>'+ 
      '<button class="node node2" onclick="Territory.battle(\'Энергия\')"><h3>☠ Тайное Царство<br>Тёмной Энергии</h3><div class="building">🔮</div></button>'+ 
      '<button class="node node3" onclick="Territory.battle(\'Босс\')"><h3>☠ Битва с Боссом</h3><b>Сегодняшние рейды 5/5</b><div class="building">🏰</div></button>'+ 
      '</div></div>'+bottom();
  }

  function battle(name){
    stopAuto();
    if(!name) name='Лиабро';
    if(S.boss<=0 || S.boss>100) S.boss=100;
    app.innerHTML=top()+'<div class="scene"><div class="battle"><div class="cave"></div>'+ 
      '<div class="bossbar"><div class="bossname">'+esc(name)+'</div><div class="hpbar"><i id="hp" style="width:'+S.boss+'%"></i></div><div>⌛ <b id="timer">81</b></div></div>'+ 
      '<div class="boss">🐉</div><div class="treasure">💰🗡️</div>'+ 
      '<div class="heroes"><div class="hero">🛡️</div><div class="hero h2">🧙</div><div class="hero h3">🗡️</div></div>'+ 
      '<div class="damage" id="dmg">115.8B</div></div></div>'+ 
      '<div class="bottom"><div class="battleBar"><button class="orb redo" onclick="Territory.hit()">⚔</button><div class="xp"><i></i><span>'+S.level+' &nbsp; 27,918/115.3K</span></div><button class="orb blue" onclick="Territory.toggleAuto()">'+(S.auto?'▶':'Ⅱ')+'</button></div>'+ 
      '<div class="skills"><h3>Навык</h3><div class="skillrow"><button class="skill" onclick="Territory.skillHit(1)">🪨</button><button class="skill" onclick="Territory.skillHit(2)">⚡</button><button class="skill" onclick="Territory.skillHit(3)">🔥</button><button class="skill" onclick="Territory.skillHit(4)">❄️</button><button class="skill" onclick="Territory.skillHit(5)">💥</button></div></div>'+ 
      '<button class="auto" onclick="Territory.toggleAuto()">'+(S.auto?'🔄':'⏸')+'</button></div>';
    if(S.auto) startAuto();
  }
  function startAuto(){ stopAuto(); autoTimer=setInterval(function(){ if(S.auto) hit(); },1200); }
  function updateBattle(dmg){
    var hp=document.getElementById('hp'); if(hp) hp.style.width=S.boss+'%';
    var d=document.getElementById('dmg'); if(d) d.textContent=dmg+'B';
  }
  function hit(){
    S.boss-=Math.random()*4+1;
    if(S.boss<=0){S.boss=100;S.gold+=250000;S.gems+=15;S.level++;toast('Босс побеждён! +250K золота');}
    updateBattle((90+Math.random()*35).toFixed(1)); save();
  }
  function skillHit(n){
    S.boss-=n*4;
    if(S.boss<=0){S.boss=100;S.gold+=500000;S.gems+=30;S.level++;toast('Победа! Награда получена');}
    updateBattle((n*27.5).toFixed(1)); save();
  }
  function toggleAuto(){S.auto=!S.auto;save();battle();}

  function skills(){
    var names=['Удар грома','Огненный взрыв','Ледяной клинок','Землетрясение','Вызов берсерка'];
    var icons=['⚡','🔥','❄️','🪨','🩸']; var h='<div class="panel"><h2>Навыки героя</h2>';
    for(var i=0;i<names.length;i++) h+='<div class="shopitem"><span class="emoji">'+icons[i]+'</span><b>'+names[i]+'</b><span>Ур. '+(i+2)+'</span><button class="buy" onclick="Territory.upgrade('+i+')">УЛУЧШИТЬ</button></div>';
    h+='</div>'; panel('Навыки',h);
  }
  function shop(){
    var h='<div class="panel"><h2>Магазин</h2>'+
      '<div class="shopitem"><span class="emoji">⚔️</span><b>Клинок викинга</b><span>+25% урона</span><button class="buy" onclick="Territory.buy(100000)">100K</button></div>'+ 
      '<div class="shopitem"><span class="emoji">🛡️</span><b>Щит дракона</b><span>+40% HP</span><button class="buy" onclick="Territory.buy(250000)">250K</button></div>'+ 
      '<div class="shopitem"><span class="emoji">💎</span><b>Сундук рун</b><span>случайная награда</span><button class="buy" onclick="Territory.buy(500000)">500K</button></div></div>';
    panel('Магазин',h);
  }
  function adventure(){panel('Приключения','<div class="panel"><h2>Приключения</h2><p>⚔️ Рейд на Пепелище — 2/2</p><p>🔮 Тёмная Энергия — доступно</p><p>🔥 Босс дня — 5/5</p><button class="buy" onclick="Territory.battle(\'Босс дня\')">НАЧАТЬ РЕЙД</button></div>');}
  function panel(title,body){stopAuto();app.innerHTML=top()+'<div class="screen"><button class="closePanel" onclick="Territory.map()">×</button><div style="padding:14px 14px 0;font-size:24px;font-weight:900">'+title+'</div>'+body+'</div>'+bottom();}
  function buy(cost){if(S.gold>=cost){S.gold-=cost;S.gems+=Math.floor(cost/100000);save();toast('Покупка совершена');}else toast('Недостаточно золота');}
  function upgrade(i){S.damage+=2+i;save();toast('Навык улучшен');}
  function menu(){panel('Меню','<div class="panel"><h2>TERRITORY</h2><p>👤 Профиль</p><p>🏆 Рейтинг</p><p>⚙️ Настройки</p><p>🛡️ Клан</p><button class="communityBtn" onclick="Territory.community()">💬 СООБЩЕСТВО</button><button class="buy" onclick="Territory.map()">В ИГРУ</button></div>');}
  function community(){
    stopAuto();
    app.innerHTML=top()+'<div class="screen"><button class="closePanel" onclick="Territory.map()">×</button><div style="padding:14px 14px 0;font-size:24px;font-weight:900">Сообщество Territory</div><div class="panel communityPanel">'+
      '<div class="communityLogo">⚔️</div><h2>TERRITORY</h2><p class="communityText">Новости, общение игроков и запуск игры в Telegram.</p>'+ 
      '<button class="communityCard" onclick="Territory.openTG(\'https://t.me/CLUBo50\')"><span>📢</span><div><b>Канал Territory</b><small>857 подписчиков · новости и события</small></div></button>'+ 
      '<button class="communityCard" onclick="Territory.openTG(\'https://t.me/CLUBo50\')"><span>💬</span><div><b>Обсуждение Territory</b><small>Открыть обсуждение канала</small></div></button>'+ 
      '<button class="communityCard" onclick="Territory.openTG(\'https://t.me/TeritoryGameBot\')"><span>🤖</span><div><b>@TeritoryGameBot</b><small>Открыть бота и игру</small></div></button>'+ 
      '<div class="communityHint">Чат Territory подключён к каналу как обсуждение.</div></div></div>'+bottom();
  }
  function openTG(url){try{window.location.href=url;}catch(e){try{window.open(url,'_blank');}catch(e2){}}}
  function reload(){location.reload();}
  function toast(t){var e=document.createElement('div');e.textContent=t;e.style='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99;background:#201b27;border:3px solid #f2d36d;padding:14px 20px;border-radius:12px;font-weight:900;color:white';document.body.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},1100);}

  window.Territory={map:map,battle:battle,skills:skills,shop:shop,adventure:adventure,menu:menu,community:community,hit:hit,skillHit:skillHit,toggleAuto:toggleAuto,buy:buy,upgrade:upgrade,openTG:openTG,reload:reload};
  loadSave();
  map();
})();
