/* Territory G32 — БОЙ is a real tactical battle, not Monopoly */
(function(){
"use strict";

var attackZone=null, defenseZone=null, enemyHp=300, playerHp=120, turn=1, timer=null, seconds=30;
var zones=["Голова","Грудь","Живот","Ноги"];

function style(){
 if(document.getElementById("g32BattleStyle"))return;
 var s=document.createElement("style");s.id="g32BattleStyle";
 s.textContent=`
 #g32Battle{position:fixed;inset:0;z-index:100050;background:linear-gradient(180deg,#071326,#020711);color:#fff;display:none;flex-direction:column;font-family:Arial,sans-serif}
 #g32Battle.show{display:flex}
 .g32-head{padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(15,31,55,.96)}
 .g32-head b{font-size:19px}.g32-close{margin-left:auto;width:42px;height:42px;border:0;border-radius:12px;background:#263751;color:#fff;font-size:25px}
 .g32-arena{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-between;padding:14px}
 .g32-fighter{padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.045)}
 .g32-name{font-weight:900;font-size:16px}.g32-hpbar{height:12px;border-radius:8px;background:#273346;overflow:hidden;margin-top:8px}.g32-hp{height:100%;background:#2ca66f;width:100%;transition:.25s}
 .g32-enemy .g32-hp{background:#bd3e4a}
 .g32-vs{text-align:center;font-size:27px;font-weight:900;margin:5px 0}
 .g32-zones{background:rgba(15,28,48,.95);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:12px}
 .g32-label{font-size:11px;color:#9fb0c7;margin:2px 0 7px;text-transform:uppercase;letter-spacing:.8px}
 .g32-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 .g32-zone{border:1px solid rgba(255,255,255,.14);background:#1a2a43;color:#fff;border-radius:12px;padding:12px 7px;font-weight:800;font-size:13px}
 .g32-zone.selected{outline:2px solid #e1b84a;background:#354765}
 .g32-attack{width:100%;margin-top:10px;border:0;border-radius:14px;padding:14px;background:linear-gradient(180deg,#b73b32,#7d2022);color:#fff;font-weight:900;font-size:16px}
 .g32-status{text-align:center;font-size:12px;color:#aebbd0;min-height:18px;margin-top:7px}
 .g32-log{max-height:95px;overflow:auto;font-size:11px;color:#b9c6d8;padding:8px;border-radius:12px;background:rgba(0,0,0,.22)}
 @media(min-width:600px){#g32Battle{max-width:540px;left:50%;right:auto;transform:translateX(-50%);box-shadow:0 0 50px #000}}
 `;
 document.head.appendChild(s);
}

function open(){
 style();
 var m=document.getElementById("g32Battle");
 if(!m){
  m=document.createElement("div");m.id="g32Battle";
  m.innerHTML=`<div class="g32-head"><b>⚔️ БОЙ Sdolars</b><span id="g32Timer">30с</span><button class="g32-close" id="g32Close">×</button></div>
  <div class="g32-arena">
   <div class="g32-fighter g32-enemy"><div class="g32-name">⚔️ Воин противника · Ур. 3</div><div class="g32-hpbar"><div class="g32-hp" id="g32EnemyHp"></div></div><div id="g32EnemyText" class="g32-status">300 / 300 HP</div></div>
   <div class="g32-vs">VS</div>
   <div class="g32-fighter"><div class="g32-name">🛡️ Ты · Ур. 3</div><div class="g32-hpbar"><div class="g32-hp" id="g32PlayerHp"></div></div><div id="g32PlayerText" class="g32-status">120 / 120 HP</div></div>
   <div class="g32-zones">
    <div class="g32-label">1. Выбери зону атаки</div>
    <div class="g32-grid" id="g32Attack"></div>
    <div class="g32-label" style="margin-top:11px">2. Выбери зону защиты</div>
    <div class="g32-grid" id="g32Defense"></div>
    <button class="g32-attack" id="g32Strike">⚔️ НАНЕСТИ УДАР</button>
    <div class="g32-status" id="g32Status">Выбери атаку и защиту</div>
   </div>
   <div class="g32-log" id="g32Log">Боевой журнал: бой начался.</div>
  </div>`;
  document.body.appendChild(m);
  document.getElementById("g32Close").onclick=close;
  m.querySelectorAll(".g32-zone").forEach(function(){});
  buildZones();
  document.getElementById("g32Strike").onclick=strike;
 }
 reset();
 m.classList.add("show");
}

function buildZones(){
 var a=document.getElementById("g32Attack"),d=document.getElementById("g32Defense");
 a.innerHTML=zones.map(function(z,i){return '<button class="g32-zone" data-a="'+i+'">'+z+'</button>'}).join("");
 d.innerHTML=zones.map(function(z,i){return '<button class="g32-zone" data-d="'+i+'">'+z+'</button>'}).join("");
 a.onclick=function(e){var b=e.target.closest("[data-a]");if(!b)return;attackZone=Number(b.dataset.a);a.querySelectorAll(".g32-zone").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");};
 d.onclick=function(e){var b=e.target.closest("[data-d]");if(!b)return;defenseZone=Number(b.dataset.d);d.querySelectorAll(".g32-zone").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");};
}

function reset(){
 attackZone=null;defenseZone=null;enemyHp=300;playerHp=120;turn=1;seconds=30;
 document.getElementById("g32Attack").querySelectorAll(".g32-zone").forEach(x=>x.classList.remove("selected"));
 document.getElementById("g32Defense").querySelectorAll(".g32-zone").forEach(x=>x.classList.remove("selected"));
 update();
 document.getElementById("g32Log").textContent="Боевой журнал: выбери атаку и защиту.";
 document.getElementById("g32Status").textContent="Твой ход · выбери 1 атаку и 1 защиту";
 clearInterval(timer);timer=setInterval(function(){seconds--;var t=document.getElementById("g32Timer");if(t)t.textContent=seconds+"с";if(seconds<=0){seconds=30;enemyTurn()}},1000);
}

function update(){
 var e=document.getElementById("g32EnemyHp"),p=document.getElementById("g32PlayerHp");
 if(e)e.style.width=Math.max(0,enemyHp/300*100)+"%";
 if(p)p.style.width=Math.max(0,playerHp/120*100)+"%";
 var et=document.getElementById("g32EnemyText"),pt=document.getElementById("g32PlayerText");
 if(et)et.textContent=enemyHp+" / 300 HP";if(pt)pt.textContent=playerHp+" / 120 HP";
}

function log(t){var l=document.getElementById("g32Log");if(l)l.textContent=t+" "+l.textContent}

function enemyTurn(){
 var hit=Math.floor(Math.random()*zones.length), blocked=defenseZone===hit, dmg=blocked?5:12;
 playerHp=Math.max(0,playerHp-dmg);
 log(blocked?"Ты заблокировал удар в "+zones[hit]+". -"+dmg+" HP":"Противник ударил в "+zones[hit]+". -"+dmg+" HP");
 defenseZone=null;turn++;update();
 if(playerHp<=0){document.getElementById("g32Status").textContent="Поражение";clearInterval(timer);}
 else document.getElementById("g32Status").textContent="Твой ход";
}

function strike(){
 if(attackZone===null||defenseZone===null){document.getElementById("g32Status").textContent="Сначала выбери атаку и защиту";return;}
 var enemyBlock=Math.floor(Math.random()*zones.length);
 var blocked=enemyBlock===attackZone;
 var dmg=blocked?4:18;
 enemyHp=Math.max(0,enemyHp-dmg);
 log(blocked?"Противник заблокировал "+zones[attackZone]+". -"+dmg+" HP":"Ты попал в "+zones[attackZone]+". -"+dmg+" HP");
 attackZone=null;document.getElementById("g32Attack").querySelectorAll(".g32-zone").forEach(x=>x.classList.remove("selected"));
 update();
 if(enemyHp<=0){document.getElementById("g32Status").textContent="🏆 Победа!";clearInterval(timer);return;}
 document.getElementById("g32Status").textContent="Удар нанесён · следующий ход";
 setTimeout(enemyTurn,350);
}

function close(){var m=document.getElementById("g32Battle");if(m)m.classList.remove("show");clearInterval(timer)}

function install(){
 var home=document.getElementById("home");
 if(!home)return;
 var btn=document.getElementById("g23-bottom1");
 if(btn && btn.dataset.g32Battle!=="1"){
  btn.dataset.g32Battle="1";
  btn.removeAttribute("data-action");
  btn.setAttribute("aria-label","Бой");
  btn.addEventListener("click",function(e){
   e.preventDefault();e.stopImmediatePropagation();open();
  },true);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,200);setTimeout(install,600);setTimeout(install,1200);setTimeout(install,2000);
window.TerritoryBattle={open,close};
})();