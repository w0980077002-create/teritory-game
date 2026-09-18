/* Territory G34 — Rewards / Bonuses center */
(function(){
"use strict";
var KEY="territory_daily_reward_v34";

function state(){
 try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return {}}
}
function save(v){localStorage.setItem(KEY,JSON.stringify(v))}
function style(){
 if(document.getElementById("g34RewardsStyle"))return;
 var s=document.createElement("style");s.id="g34RewardsStyle";
 s.textContent=`
 #g34Rewards{position:fixed;inset:0;z-index:100070;display:none;align-items:flex-end;background:rgba(2,8,20,.78);padding:10px;box-sizing:border-box}
 #g34Rewards.show{display:flex}
 .g34-card{width:100%;max-width:540px;max-height:88vh;margin:auto;background:linear-gradient(180deg,#162944,#07111f);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:22px;overflow:hidden;box-shadow:0 15px 50px rgba(0,0,0,.65)}
 .g34-head{display:flex;align-items:center;padding:16px;border-bottom:1px solid rgba(255,255,255,.1)}
 .g34-head b{font-size:20px}.g34-head small{display:block;color:#aebbd0;margin-top:3px}
 .g34-close{margin-left:auto;width:42px;height:42px;border:0;border-radius:12px;background:#263751;color:#fff;font-size:24px}
 .g34-body{padding:14px;overflow:auto}
 .g34-banner{padding:15px;border-radius:16px;background:linear-gradient(145deg,rgba(224,194,103,.16),rgba(255,255,255,.045));border:1px solid rgba(224,194,103,.35)}
 .g34-banner b{font-size:17px}.g34-banner p{margin:6px 0 0;color:#c2cede;line-height:1.4;font-size:12px}
 .g34-reward{margin-top:12px;padding:15px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
 .g34-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
 .g34-coins{font-size:20px;font-weight:900;color:#e5c66c}.g34-xp{font-size:12px;color:#aebbd0}
 .g34-claim{width:100%;margin-top:13px;border:0;border-radius:14px;padding:13px;background:linear-gradient(180deg,#b88b2e,#765719);color:#fff;font-weight:900;font-size:15px}
 .g34-claim:disabled{opacity:.5}
 .g34-note{margin-top:10px;text-align:center;color:#8799b1;font-size:11px}
 `;
 document.head.appendChild(s);
}
function open(){
 style();
 var m=document.getElementById("g34Rewards");
 if(!m){
  m=document.createElement("div");m.id="g34Rewards";
  m.innerHTML='<div class="g34-card"><div class="g34-head"><div><b>🎁 Бонусы</b><small>Награды Sdolars</small></div><button class="g34-close" type="button">×</button></div><div class="g34-body"><div class="g34-banner"><b>Ежедневная награда</b><p>Заходи каждый день и забирай награду. Серия посещений будет развиваться дальше.</p></div><div class="g34-reward"><div class="g34-row"><div class="g34-coins">🪙 +100 монет</div><div class="g34-xp">⭐ +20 XP</div></div><button class="g34-claim" id="g34Claim">ЗАБРАТЬ НАГРАДУ</button><div class="g34-note" id="g34Note"></div></div></div></div>';
  document.body.appendChild(m);
  m.querySelector(".g34-close").onclick=close;
  m.addEventListener("click",function(e){if(e.target===m)close()});
  m.querySelector("#g34Claim").onclick=claim;
 }
 render();
 m.classList.add("show");
}
function render(){
 var p=state(), now=new Date().toISOString().slice(0,10);
 var b=document.getElementById("g34Claim"),n=document.getElementById("g34Note");
 var claimed=p.day===now;
 if(b){b.disabled=claimed;b.textContent=claimed?"✓ НАГРАДА ПОЛУЧЕНА":"ЗАБРАТЬ НАГРАДУ"}
 if(n)n.textContent=claimed?"Сегодня награда уже получена. Возвращайся завтра.":"Награда доступна прямо сейчас.";
}
function claim(){
 var now=new Date().toISOString().slice(0,10),p=state();
 if(p.day===now)return;
 p.day=now;p.streak=Number(p.streak||0)+1;save(p);
 try{
  var k="territory_save",s=JSON.parse(localStorage.getItem(k)||"{}");
  s.coins=Number(s.coins||0)+100;s.exp=Number(s.exp||0)+20;
  while(Number(s.exp||0)>=Number(s.maxExp||100)){s.exp-=Number(s.maxExp||100);s.level=Number(s.level||1)+1;s.maxHp=Number(s.maxHp||120)+10;s.hp=s.maxHp}
  localStorage.setItem(k,JSON.stringify(s));
  if(typeof window.save==="function")window.save();
  if(typeof window.render==="function")window.render();
 }catch(e){}
 render();
}
function close(){var m=document.getElementById("g34Rewards");if(m)m.classList.remove("show")}

function install(){
 var home=document.getElementById("home");if(!home)return;
 function bind(id,action){
  var b=document.getElementById(id);if(!b||b.dataset.g34==="1")return;
  b.dataset.g34="1";b.removeAttribute("data-action");
  b.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();open()},true);
 }
 bind("g23-left1");
 bind("g23-daily");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,150);setTimeout(install,500);setTimeout(install,1000);setTimeout(install,1800);
window.TerritoryRewards={open:open,close:close,claim:claim};
})();