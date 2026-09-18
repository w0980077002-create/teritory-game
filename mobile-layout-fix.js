/* Territory G22 — single click layer, no overlapping legacy hitboxes */
(function(){
"use strict";

function addStyle(){
  if(document.getElementById("territoryG22Style")) return;
  var s=document.createElement("style");
  s.id="territoryG22Style";
  s.textContent=`
    body:has(#home.active){overflow:hidden!important;background:#07111b!important}
    body:has(#home.active) #app{max-width:none!important;width:100%!important;height:100dvh!important;background:#07111b!important}
    body:has(#home.active) main{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important}
    body:has(#home.active) #home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important}
    body:has(#home.active) .real-home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#07111b!important}
    body:has(#home.active) .real-home-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;object-position:center!important;margin:0!important;padding:0!important;display:block!important}

    /* The approved artwork stays untouched. Only old transparent hitboxes are disabled. */
    body:has(#home.active) .ref-hud{display:none!important}
    body:has(#home.active) .living-scene{display:none!important}
    body:has(#home.active) .v5-zone{display:none!important;pointer-events:none!important}
    body:has(#home.active) .v5-click-layer{display:none!important;pointer-events:none!important}
    body:has(#home.active) .hotspot{display:none!important;pointer-events:none!important}
    body:has(#home.active) .npc-label{display:none!important;pointer-events:none!important}

    .territory-g22-hit{
      position:absolute!important;display:block!important;
      background:transparent!important;border:0!important;
      padding:0!important;margin:0!important;
      z-index:9000!important;pointer-events:auto!important;
      -webkit-tap-highlight-color:transparent!important;
    }

    /* Left column — matched to the visible artwork. */
    #g22-left1{left:0;top:20%;width:14%;height:8.5%}
    #g22-left2{left:0;top:28.5%;width:14%;height:8.5%}
    #g22-left3{left:0;top:37%;width:14%;height:8.5%}
    #g22-left4{left:0;top:45.5%;width:14%;height:8.5%}

    /* Right column. */
    #g22-right1{right:0;top:30%;width:15%;height:9.5%}
    #g22-right2{right:0;top:40%;width:15%;height:9.5%}
    #g22-right3{right:0;top:50%;width:15%;height:9.5%}

    /* Bottom six buttons. */
    #g22-bottom1{left:0;bottom:0;width:16.7%;height:14%}
    #g22-bottom2{left:16.7%;bottom:0;width:16.7%;height:14%}
    #g22-bottom3{left:33.4%;bottom:0;width:16.7%;height:14%}
    #g22-bottom4{left:50.1%;bottom:0;width:16.7%;height:14%}
    #g22-bottom5{left:66.8%;bottom:0;width:16.6%;height:14%}
    #g22-bottom6{right:0;bottom:0;width:16.6%;height:14%}

    /* Top HUD — four independent resource zones, no overlap. */
    #g22-profile{left:0;top:0;width:37%;height:10%}
    #g22-gems{left:37%;top:.5%;width:19%;height:5%}
    #g22-coins{left:56%;top:.5%;width:20%;height:5%}
    #g22-energy{left:76%;top:.5%;width:22%;height:5%}
    #g22-stone{left:38.5%;top:5.5%;width:17%;height:4%}
    #g22-msg{left:53%;top:5%;width:12%;height:7%}
    #g22-ach{left:65%;top:5%;width:12%;height:7%}
    #g22-settings{left:77%;top:5%;width:12%;height:7%}
    #g22-lang{right:0;top:5%;width:11%;height:7%}

    /* Task/daily sit below the header and never overlap the left/right columns. */
    #g22-task{left:0;top:10%;width:36%;height:9.5%}
    #g22-daily{right:0;top:12%;width:30%;height:7.5%}

    /* Alex is a transparent touch area only; artwork is unchanged. */
    #g22-alex{left:27%;top:31%;width:30%;height:30%;z-index:8995!important}
  `;
  document.head.appendChild(s);
}

function hit(id, attrs, handler){
  if(document.getElementById(id)) return;
  var b=document.createElement("button");
  b.id=id; b.type="button"; b.className="territory-g22-hit";
  for(var k in attrs) b.setAttribute(k,attrs[k]);
  if(handler) b.addEventListener("click",handler,true);
  document.getElementById("home").appendChild(b);
}

function install(){
  addStyle();
  var home=document.getElementById("home");
  if(!home || home.dataset.g22==="1") return;
  home.dataset.g22="1";

  hit("g22-profile",{"data-screen":"profile","aria-label":"Профиль"});
  hit("g22-gems",{"data-action":"gems","aria-label":"Алмазы"});
  hit("g22-coins",{"data-action":"coins","aria-label":"Монеты"});
  hit("g22-energy",{"data-action":"energy","aria-label":"Энергия"});
  hit("g22-stone",{"data-action":"combatstone","aria-label":"Боевой камень"});
  hit("g22-msg",{"data-action":"messages","aria-label":"Сообщения"});
  hit("g22-ach",{"data-action":"achievements","aria-label":"Достижения"});
  hit("g22-settings",{"data-action":"settings","aria-label":"Настройки"});
  hit("g22-lang",{"data-action":"language","aria-label":"Язык"});

  hit("g22-task",{"data-action":"forge","aria-label":"Текущее задание"});
  hit("g22-daily",{"data-action":"bonuses","aria-label":"Ежедневный бонус"});

  hit("g22-left1",{"data-action":"bonuses","aria-label":"Бонусы"});
  hit("g22-left2",{"data-action":"events","aria-label":"События"});
  hit("g22-left3",{"data-action":"vip","aria-label":"VIP"});
  hit("g22-left4",{"data-screen":"game","aria-label":"Game"});

  hit("g22-right1",{"data-action":"forge","aria-label":"Кузница"});
  hit("g22-right2",{"data-action":"tavern","aria-label":"Таверна"});
  hit("g22-right3",{"data-action":"shop","aria-label":"Магазин"});

  hit("g22-bottom1",{"data-action":"fight","aria-label":"Бой"});
  hit("g22-bottom2",{"data-screen":"arena","aria-label":"Арена"});
  hit("g22-bottom3",{"data-screen":"inventory","aria-label":"Инвентарь"});
  hit("g22-bottom4",{"data-screen":"inventory","aria-label":"Экипировка"});
  hit("g22-bottom5",{"data-screen":"districts","aria-label":"Задания"});
  hit("g22-bottom6",{"data-screen":"districts","aria-label":"Карта"});

  hit("g22-alex",{"aria-label":"Герцог Alex"},function(e){
    e.preventDefault(); e.stopPropagation();
    if(window.TerritoryDukeAlex && typeof window.TerritoryDukeAlex.open==="function"){
      window.TerritoryDukeAlex.open();
    }
  });
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,300);
setTimeout(install,1000);
setTimeout(install,1800);
})();