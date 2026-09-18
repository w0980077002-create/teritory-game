/* Territory G27 — G26 working layout + remove floating Alex crown */
(function(){
"use strict";

function addStyle(){
  if(document.getElementById("territoryG26Style")) return;
  var s=document.createElement("style");
  s.id="territoryG26Style";
  s.textContent=`
    body:has(#home.active){overflow:hidden!important;background:#07111b!important}
    body:has(#home.active) #app{max-width:none!important;width:100%!important;height:100dvh!important;background:#07111b!important}
    body:has(#home.active) main{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important}
    body:has(#home.active) #home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important}
    body:has(#home.active) .real-home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#07111b!important}
    body:has(#home.active) .real-home-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;object-position:center!important;display:block!important}

    /* Keep the approved city artwork. Disable every legacy transparent layer. */
    body:has(#home.active) .ref-hud,
    body:has(#home.active) .living-scene,
    body:has(#home.active) .v5-zone,
    body:has(#home.active) .v5-click-layer,
    body:has(#home.active) .hotspot,
    body:has(#home.active) .npc-label{
      display:none!important;
      pointer-events:none!important;
    }

    /* G26: remove the old floating Alex crown on every screen. */
    #territoryAlexButton{display:none!important;pointer-events:none!important;}

    .territory-g23-hit{
      position:absolute!important;display:block!important;
      background:transparent!important;border:0!important;
      padding:0!important;margin:0!important;
      z-index:9000!important;pointer-events:auto!important;
      -webkit-tap-highlight-color:transparent!important;
    }

    /* THESE SIDE POSITIONS ARE THE TESTED ALIGNMENT FROM G20/G21. */
    #g23-left1{left:0;top:15.5%;width:14%;height:6.5%}
    #g23-left2{left:0;top:21.5%;width:14%;height:6.5%}
    #g23-left3{left:0;top:27.5%;width:14%;height:6.5%}
    #g23-left4{left:0;top:33.5%;width:14%;height:6.5%}

    #g23-right1{right:0;top:20%;width:15%;height:8%}
    #g23-right2{right:0;top:28%;width:15%;height:8%}
    #g23-right3{right:0;top:36%;width:15%;height:8%}

    #g23-bottom1{left:0;bottom:0;width:16.7%;height:14%}
    #g23-bottom2{left:16.7%;bottom:0;width:16.7%;height:14%}
    #g23-bottom3{left:33.4%;bottom:0;width:16.7%;height:14%}
    #g23-bottom4{left:50.1%;bottom:0;width:16.7%;height:14%}
    #g23-bottom5{left:66.8%;bottom:0;width:16.6%;height:14%}
    #g23-bottom6{right:0;bottom:0;width:16.6%;height:14%}

    #g23-profile{left:0;top:0;width:37%;height:10%}
    #g23-gems{left:37%;top:.5%;width:19%;height:5%}
    #g23-coins{left:56%;top:.5%;width:20%;height:5%}
    #g23-energy{left:76%;top:.5%;width:22%;height:5%}
    #g23-stone{left:38.5%;top:5.5%;width:17%;height:4%}
    #g23-msg{left:53%;top:5%;width:12%;height:7%}
    #g23-ach{left:65%;top:5%;width:12%;height:7%}
    #g23-settings{left:77%;top:5%;width:12%;height:7%}
    #g23-lang{right:0;top:5%;width:11%;height:7%}
    #g23-task{left:0;top:10%;width:36%;height:9.5%}
    #g23-daily{right:0;top:12%;width:30%;height:7.5%}

    #g23-alex{left:27%;top:31%;width:30%;height:30%;z-index:8995!important}
  `;
  document.head.appendChild(s);
}

function hit(id, attrs, handler){
  if(document.getElementById(id)) return;
  var b=document.createElement("button");
  b.id=id;b.type="button";b.className="territory-g23-hit";
  for(var k in attrs)b.setAttribute(k,attrs[k]);
  if(handler)b.addEventListener("click",handler,true);
  document.getElementById("home").appendChild(b);
}

function install(){
  addStyle();
  var home=document.getElementById("home");
  if(!home || home.dataset.g26==="1") return;
  home.dataset.g26="1";

  hit("g23-profile",{"data-screen":"profile","aria-label":"Профиль"});
  hit("g23-gems",{"data-action":"gems","aria-label":"Алмазы"});
  hit("g23-coins",{"data-action":"coins","aria-label":"Монеты"});
  hit("g23-energy",{"data-action":"energy","aria-label":"Энергия"});
  hit("g23-stone",{"data-action":"combatstone","aria-label":"Боевой камень"});
  hit("g23-msg",{"data-action":"messages","aria-label":"Сообщения"});
  hit("g23-ach",{"data-action":"achievements","aria-label":"Достижения"});
  hit("g23-settings",{"data-action":"settings","aria-label":"Настройки"});
  hit("g23-lang",{"data-action":"language","aria-label":"Язык"});
  hit("g23-task",{"data-action":"forge","aria-label":"Текущее задание"});
  hit("g23-daily",{"data-action":"bonuses","aria-label":"Ежедневный бонус"});

  hit("g23-left1",{"data-action":"bonuses","aria-label":"Бонусы"});
  hit("g23-left2",{"data-action":"events","aria-label":"События"});
  hit("g23-left3",{"data-action":"vip","aria-label":"VIP"});
  hit("g23-left4",{"data-screen":"game","aria-label":"Game"});

  hit("g23-right1",{"data-action":"forge","aria-label":"Кузница"});
  hit("g23-right2",{"data-action":"tavern","aria-label":"Таверна"});
  hit("g23-right3",{"data-action":"shop","aria-label":"Магазин"});

  hit("g23-bottom1",{"data-action":"fight","aria-label":"Бой"});
  hit("g23-bottom2",{"data-screen":"arena","aria-label":"Арена"});
  hit("g23-bottom3",{"data-screen":"inventory","aria-label":"Инвентарь"});
  hit("g23-bottom4",{"data-screen":"inventory","aria-label":"Экипировка"});
  hit("g23-bottom5",{"data-screen":"districts","aria-label":"Задания"});
  hit("g23-bottom6",{"data-screen":"districts","aria-label":"Карта"});

  hit("g23-alex",{"aria-label":"Герцог Alex"},function(e){
    e.preventDefault();e.stopPropagation();
    if(window.TerritoryDukeAlex&&typeof window.TerritoryDukeAlex.open==="function")
      window.TerritoryDukeAlex.open();
  });
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,300);
setTimeout(install,1000);
setTimeout(install,1800);
})();

/* Territory G27 — HP baseline fix, based on golden G26 */
(function(){
  "use strict";
  function fixHP(){
    try{
      var raw=localStorage.getItem("territory_save_v1");
      if(!raw)return;
      var s=JSON.parse(raw);
      if(!s || typeof s!=="object")return;
      if(Number(s.hp)===120 && Number(s.maxHp)!==120){
        s.maxHp=120;
        localStorage.setItem("territory_save_v1",JSON.stringify(s));
      }
    }catch(e){}
  }
  fixHP();
})();
