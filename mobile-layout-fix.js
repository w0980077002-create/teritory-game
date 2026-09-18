/* Territory G20 — one visual HUD, accurate touch zones */
(function(){
"use strict";

function addStyle(){
 var s=document.getElementById("territoryG20Style");
 if(s)return;
 s=document.createElement("style");
 s.id="territoryG20Style";
 s.textContent=`
  body:has(#home.active){overflow:hidden!important;background:#07111b!important}
  body:has(#home.active) #app{max-width:none!important;width:100%!important;height:100dvh!important;background:#07111b!important}
  body:has(#home.active) main{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important}
  body:has(#home.active) #home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important}
  body:has(#home.active) .real-home{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#07111b!important}
  body:has(#home.active) .real-home-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;object-position:center!important;margin:0!important;padding:0!important;display:block!important}

  /* The approved background already contains the complete HUD artwork.
     Hide the duplicate HTML HUD only; do not change the artwork. */
  body:has(#home.active) .ref-hud{display:none!important}
  body:has(#home.active) .living-scene{display:none!important}
  body:has(#home.active) .v5-zone{display:none!important;pointer-events:none!important}

  /* Transparent, correctly aligned touch targets over the artwork. */
  .territory-g20-hit{position:absolute!important;display:block!important;background:transparent!important;border:0!important;padding:0!important;margin:0!important;z-index:9000!important;pointer-events:auto!important}
  #g20-left1{left:0;top:15.5%;width:14%;height:6.5%}
  #g20-left2{left:0;top:21.5%;width:14%;height:6.5%}
  #g20-left3{left:0;top:27.5%;width:14%;height:6.5%}
  #g20-left4{left:0;top:33.5%;width:14%;height:6.5%}
  #g20-right1{right:0;top:20%;width:15%;height:8%}
  #g20-right2{right:0;top:28%;width:15%;height:8%}
  #g20-right3{right:0;top:36%;width:15%;height:8%}

  #g20-bottom1{left:0;bottom:0;width:16.7%;height:14%}
  #g20-bottom2{left:16.7%;bottom:0;width:16.7%;height:14%}
  #g20-bottom3{left:33.4%;bottom:0;width:16.7%;height:14%}
  #g20-bottom4{left:50.1%;bottom:0;width:16.7%;height:14%}
  #g20-bottom5{left:66.8%;bottom:0;width:16.6%;height:14%}
  #g20-bottom6{right:0;bottom:0;width:16.6%;height:14%}

  /* Top interactive areas. */
  #g20-profile{left:0;top:0;width:39%;height:11%}
  #g20-res1{left:39%;top:0;width:20%;height:7%}
  #g20-res2{left:39%;top:7%;width:20%;height:6%}
  #g20-res3{left:59%;top:0;width:20%;height:7%}
  #g20-msg{left:59%;top:7%;width:9%;height:7%}
  #g20-ach{left:68%;top:7%;width:9%;height:7%}
  #g20-settings{left:77%;top:7%;width:9%;height:7%}
  #g20-lang{right:0;top:7%;width:14%;height:7%}
  #g20-task{left:0;top:10%;width:40%;height:10%}
  #g20-daily{right:0;top:10%;width:31%;height:10%}

  #territoryAlexButton{display:none!important}
  #territoryAlexHit{z-index:8990!important}
 `;
 document.head.appendChild(s);
}

function hit(id, attrs){
 if(document.getElementById(id))return;
 var b=document.createElement("button");
 b.id=id;b.type="button";b.className="territory-g20-hit";
 for(var k in attrs)b.setAttribute(k,attrs[k]);
 document.getElementById("home").appendChild(b);
}

function install(){
 addStyle();
 var home=document.getElementById("home");
 if(!home)return;
 if(home.dataset.g20==="1")return;
 home.dataset.g20="1";

 hit("g20-left1",{"data-action":"bonuses","aria-label":"Бонусы"});
 hit("g20-left2",{"data-action":"events","aria-label":"События"});
 hit("g20-left3",{"data-action":"vip","aria-label":"VIP"});
 hit("g20-left4",{"data-screen":"game","aria-label":"Game"});

 hit("g20-right1",{"data-action":"forge","aria-label":"Кузница"});
 hit("g20-right2",{"data-action":"tavern","aria-label":"Таверна"});
 hit("g20-right3",{"data-action":"shop","aria-label":"Магазин"});

 hit("g20-bottom1",{"data-action":"fight","aria-label":"Бой"});
 hit("g20-bottom2",{"data-screen":"arena","aria-label":"Арена"});
 hit("g20-bottom3",{"data-screen":"inventory","aria-label":"Инвентарь"});
 hit("g20-bottom4",{"data-screen":"profile","aria-label":"Экипировка"});
 hit("g20-bottom5",{"data-screen":"districts","aria-label":"Задания"});
 hit("g20-bottom6",{"data-screen":"districts","aria-label":"Карта"});

 hit("g20-profile",{"data-screen":"profile","aria-label":"Профиль"});
 hit("g20-res1",{"data-action":"gems","aria-label":"Кристаллы"});
 hit("g20-res2",{"data-action":"combatstone","aria-label":"Боевой камень"});
 hit("g20-res3",{"data-action":"energy","aria-label":"Энергия"});
 hit("g20-msg",{"data-action":"messages","aria-label":"Сообщения"});
 hit("g20-ach",{"data-action":"achievements","aria-label":"Достижения"});
 hit("g20-settings",{"data-action":"settings","aria-label":"Настройки"});
 hit("g20-lang",{"data-action":"language","aria-label":"Язык"});
 hit("g20-task",{"data-action":"forge","aria-label":"Текущее задание"});
 hit("g20-daily",{"data-action":"bonuses","aria-label":"Ежедневный бонус"});
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,300);
setTimeout(install,1000);
})();