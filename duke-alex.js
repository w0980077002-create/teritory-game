/* Territory G8 — Duke Alex, cleaner quest flow */
(function(){
"use strict";
const KEY="territory_alex_quests_v2";
const QUESTS=[
{id:"welcome",title:"Добро пожаловать в Sdolars",text:"Познакомься с Герцогом Alex и начни свой путь в городе.",reward:{coins:150,exp:40}},
{id:"market",title:"Следы на торговой площади",text:"Сделай покупку на рынке снаряжения.",reward:{coins:250,exp:60}},
{id:"arena",title:"Проверка бойца",text:"Зайди на Арену Sdolars и приготовься к первому испытанию.",reward:{coins:400,exp:100}}
];
function read(){try{const v=localStorage.getItem(KEY);return v?JSON.parse(v):{claimed:[]}}catch(e){return{claimed:[]}}}
function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function reward(r){try{const k="territory_save",s=JSON.parse(localStorage.getItem(k)||"{}");s.coins=Number(s.coins||0)+r.coins;s.exp=Number(s.exp||0)+r.exp;localStorage.setItem(k,JSON.stringify(s));if(typeof window.save==="function")window.save();if(typeof window.render==="function")window.render()}catch(e){}}
function claim(id){
 const q=QUESTS.find(x=>x.id===id),p=read();if(!q||p.claimed.includes(id))return;
 p.claimed.push(id);write(p);reward(q.reward);render();
}
function ensure(){
 if(document.getElementById("territoryAlexStyleV2"))return;
 const s=document.createElement("style");s.id="territoryAlexStyleV2";
 s.textContent=`#territoryAlexModal{position:fixed;inset:0;z-index:100004;display:none;background:rgba(2,8,20,.82);padding:12px;box-sizing:border-box;align-items:flex-end}#territoryAlexModal.show{display:flex}.ta2-card{width:100%;max-width:540px;margin:0 auto;background:linear-gradient(180deg,#172743,#07101f);border:1px solid rgba(255,255,255,.15);border-radius:22px 22px 12px 12px;color:#fff;box-shadow:0 14px 48px rgba(0,0,0,.65);overflow:hidden;max-height:91vh;display:flex;flex-direction:column}.ta2-head{display:flex;gap:12px;align-items:center;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.1)}.ta2-portrait{width:58px;height:58px;border-radius:15px;background:linear-gradient(145deg,#7d6330,#b9964c);display:grid;place-items:center;font-size:35px;border:1px solid rgba(255,255,255,.2)}.ta2-title{font-size:18px;font-weight:900}.ta2-rank{font-size:11px;color:#d6bd7c;margin-top:3px}.ta2-close{margin-left:auto;border:0;background:rgba(255,255,255,.09);color:#fff;border-radius:11px;font-size:24px;width:42px;height:42px}.ta2-body{padding:14px;overflow:auto}.ta2-dialogue{padding:13px;border-radius:15px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);font-size:13px;line-height:1.5;color:#dbe4f2}.ta2-section{font-size:11px;color:#93a4bd;text-transform:uppercase;letter-spacing:1px;margin:15px 0 8px}.ta2-q{padding:12px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);margin-bottom:9px}.ta2-q.current{background:linear-gradient(145deg,rgba(62,86,128,.48),rgba(255,255,255,.045))}.ta2-qt{font-weight:900;font-size:14px}.ta2-t{font-size:11px;color:#aebbd0;line-height:1.4;margin-top:4px}.ta2-r{font-size:11px;color:#e0c267;margin-top:7px}.ta2-st{font-size:10px;color:#9fb0c7;margin-top:6px}.ta2-btn{width:100%;border:0;border-radius:11px;padding:10px;margin-top:9px;background:#294a79;color:#fff;font-weight:800}.ta2-hint{font-size:10px;color:#7f90a8;margin-top:7px}`;
 document.head.appendChild(s);
}
function render(){
 const m=document.getElementById("territoryAlexModal");if(!m)return;
 const p=read();
 m.querySelector(".ta2-body").innerHTML=`<div class="ta2-dialogue">«Добро пожаловать в Sdolars. Я герцог Alex. Если хочешь стать частью этого города — покажи, что готов двигаться вперёд.»</div><div class="ta2-section">Цепочка заданий</div>`+
 QUESTS.map((q,i)=>{const c=p.claimed.includes(q.id),active=!c&&((i===0)||p.claimed.includes(QUESTS[i-1].id));return `<div class="ta2-q ${active?"current":""}"><div class="ta2-qt">${i+1}. ${esc(q.title)}</div><div class="ta2-t">${esc(q.text)}</div><div class="ta2-r">🎁 +${q.reward.coins} монет · ⭐ +${q.reward.exp} XP</div><div class="ta2-st">${c?"✓ Награда получена":active?"Текущее задание":"Закрыто"}</div>${active?`<div class="ta2-hint">Выполнение засчитывается автоматически по действию в игре.</div>`:""}</div>`}).join("");
}
function open(){
 ensure();let m=document.getElementById("territoryAlexModal");
 if(!m){m=document.createElement("div");m.id="territoryAlexModal";m.innerHTML=`<div class="ta2-card" role="dialog" aria-modal="true"><div class="ta2-head"><div class="ta2-portrait">👑</div><div><div class="ta2-title">Герцог Alex</div><div class="ta2-rank">Хранитель Sdolars</div></div><button class="ta2-close" type="button">×</button></div><div class="ta2-body"></div></div>`;document.body.appendChild(m);
 m.addEventListener("click",e=>{if(e.target===m||e.target.closest(".ta2-close"))close()});
 }
 render();m.classList.add("show");
 /* Meeting Alex completes the welcome quest. */
 claim("welcome");
}
function close(){const m=document.getElementById("territoryAlexModal");if(m)m.classList.remove("show")}
function button(){
 if(document.getElementById("territoryAlexButton"))return;
 const b=document.createElement("button");b.id="territoryAlexButton";b.type="button";b.innerHTML="👑<span>Alex</span>";b.title="Герцог Alex";
 /* Put Alex below the existing left HUD stack instead of over the Game button. */
 b.style.cssText="position:fixed;left:8px;top:calc(50% + 105px);z-index:9000;width:56px;min-height:54px;border:1px solid rgba(255,215,120,.45);border-radius:15px;background:rgba(25,38,62,.9);color:#fff;box-shadow:0 5px 18px rgba(0,0,0,.35);font-weight:800;font-size:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;";
 b.querySelector("span").style.cssText="font-size:9px;letter-spacing:.4px";b.addEventListener("click",open);document.body.appendChild(b);
}
document.addEventListener("territory:marketPurchase",function(){claim("market")});
document.addEventListener("click",function(e){const b=e.target.closest('[data-screen="arena"]');if(b)setTimeout(function(){claim("arena")},0)},true);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",button);else button();
window.TerritoryDukeAlex={open,close,quests:QUESTS};
})();
