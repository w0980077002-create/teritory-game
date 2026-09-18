/* Territory G30 — Quests screen
   Adds a real mobile quests panel without changing the approved City artwork.
*/
(function(){
"use strict";

const KEY="territory_quests_v1";
const QUESTS=[
  {id:"blacksmith", title:"Поговори с кузнецом", text:"Зайди в Кузницу и узнай, что нужно городу.", reward:{coins:100,exp:25}},
  {id:"market", title:"Покупка на рынке", text:"Открой Магазин и сделай покупку.", reward:{coins:150,exp:35}},
  {id:"arena", title:"Проверка бойца", text:"Открой Арену Sdolars.", reward:{coins:200,exp:50}},
  {id:"district", title:"Познакомься с городом", text:"Открой Карту и отправься в один из районов.", reward:{coins:120,exp:30}}
];

function read(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY)||"{}");
    return {done:Array.isArray(v.done)?v.done:[]};
  }catch(e){return {done:[]};}
}
function write(v){localStorage.setItem(KEY,JSON.stringify(v));}
function esc(s){return String(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));}

function reward(r){
  try{
    const k="territory_save";
    const s=JSON.parse(localStorage.getItem(k)||"{}");
    s.coins=Number(s.coins||0)+Number(r.coins||0);
    s.exp=Number(s.exp||0)+Number(r.exp||0);
    while(Number(s.exp||0)>=Number(s.maxExp||100)){
      s.exp=Number(s.exp||0)-Number(s.maxExp||100);
      s.level=Number(s.level||1)+1;
      s.maxHp=Number(s.maxHp||120)+10;
      s.hp=s.maxHp;
    }
    localStorage.setItem(k,JSON.stringify(s));
    if(typeof window.save==="function")window.save();
    if(typeof window.render==="function")window.render();
  }catch(e){}
}

function ensureStyle(){
  if(document.getElementById("territoryG30QuestStyle"))return;
  const s=document.createElement("style");
  s.id="territoryG30QuestStyle";
  s.textContent=`
    #territoryG30QuestModal{position:fixed;inset:0;z-index:100010;display:none;
      background:rgba(2,8,20,.84);padding:12px;box-sizing:border-box;align-items:flex-end}
    #territoryG30QuestModal.show{display:flex}
    .g30q-card{width:100%;max-width:540px;max-height:88vh;margin:0 auto;overflow:hidden;
      display:flex;flex-direction:column;color:#fff;border:1px solid rgba(255,255,255,.16);
      border-radius:22px 22px 12px 12px;background:linear-gradient(180deg,#172743,#07101f);
      box-shadow:0 16px 55px rgba(0,0,0,.7)}
    .g30q-head{display:flex;align-items:center;gap:10px;padding:15px 16px;
      border-bottom:1px solid rgba(255,255,255,.1)}
    .g30q-icon{font-size:28px}
    .g30q-title{font-size:20px;font-weight:900}
    .g30q-sub{font-size:11px;color:#aab8cc;margin-top:2px}
    .g30q-close{margin-left:auto;width:42px;height:42px;border:0;border-radius:12px;
      background:rgba(255,255,255,.08);color:#fff;font-size:24px}
    .g30q-body{padding:13px;overflow:auto}
    .g30q-progress{padding:12px;border-radius:15px;background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1);margin-bottom:10px}
    .g30q-progress b{font-size:13px}
    .g30q-bar{height:7px;background:rgba(255,255,255,.1);border-radius:8px;overflow:hidden;margin-top:8px}
    .g30q-bar i{display:block;height:100%;width:0;background:#2b8cff;border-radius:8px}
    .g30q-item{padding:12px;margin-bottom:9px;border-radius:15px;
      background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1)}
    .g30q-item.current{border-color:rgba(255,204,80,.45);background:rgba(255,204,80,.055)}
    .g30q-row{display:flex;gap:9px;align-items:flex-start}
    .g30q-num{width:26px;height:26px;border-radius:9px;background:rgba(255,255,255,.09);
      display:flex;align-items:center;justify-content:center;font-weight:900;flex:0 0 26px}
    .g30q-name{font-weight:900;font-size:14px}
    .g30q-text{font-size:11px;color:#b7c3d5;line-height:1.45;margin-top:4px}
    .g30q-reward{font-size:11px;color:#e7c867;margin-top:7px}
    .g30q-status{font-size:10px;color:#8fa1b8;margin-top:5px}
    .g30q-btn{margin-top:9px;width:100%;height:40px;border:0;border-radius:11px;
      background:linear-gradient(180deg,#2d83dc,#1756a3);color:#fff;font-weight:900}
    .g30q-btn:disabled{opacity:.55}
  `;
  document.head.appendChild(s);
}

function ensureModal(){
  ensureStyle();
  let m=document.getElementById("territoryG30QuestModal");
  if(m)return m;
  m=document.createElement("div");
  m.id="territoryG30QuestModal";
  m.innerHTML=`<div class="g30q-card" role="dialog" aria-modal="true">
    <div class="g30q-head">
      <div class="g30q-icon">📜</div>
      <div><div class="g30q-title">Задания</div><div class="g30q-sub">Путь героя в Sdolars</div></div>
      <button class="g30q-close" type="button">×</button>
    </div>
    <div class="g30q-body"></div>
  </div>`;
  document.body.appendChild(m);
  m.addEventListener("click",e=>{
    if(e.target===m || e.target.closest(".g30q-close")) close();
  });
  return m;
}

function render(){
  const m=ensureModal(), body=m.querySelector(".g30q-body"), p=read();
  const done=p.done.length, pct=Math.round(done/QUESTS.length*100);
  body.innerHTML=`
    <div class="g30q-progress">
      <b>Прогресс: ${done}/${QUESTS.length}</b>
      <div class="g30q-bar"><i style="width:${pct}%"></i></div>
    </div>`+
    QUESTS.map((q,i)=>{
      const completed=p.done.includes(q.id);
      const active=!completed && (i===0 || p.done.includes(QUESTS[i-1].id));
      return `<div class="g30q-item ${active?"current":""}">
        <div class="g30q-row">
          <div class="g30q-num">${completed?"✓":i+1}</div>
          <div style="flex:1">
            <div class="g30q-name">${esc(q.title)}</div>
            <div class="g30q-text">${esc(q.text)}</div>
            <div class="g30q-reward">🎁 +${q.reward.coins} 🪙 · +${q.reward.exp} XP</div>
            <div class="g30q-status">${completed?"Награда получена":active?"Текущее задание":"Заблокировано"}</div>
            ${active?`<button class="g30q-btn" data-quest-claim="${q.id}">Выполнить задание</button>`:""}
          </div>
        </div>
      </div>`;
    }).join("");
}

function open(){render();ensureModal().classList.add("show");}
function close(){const m=document.getElementById("territoryG30QuestModal");if(m)m.classList.remove("show");}

document.addEventListener("click",function(e){
  const b=e.target.closest("[data-quest-claim]");
  if(!b)return;
  const id=b.dataset.questClaim, q=QUESTS.find(x=>x.id===id), p=read();
  if(!q || p.done.includes(id))return;
  p.done.push(id); write(p); reward(q.reward); render();
},true);

/* Bottom "Задания" opens this panel instead of the map. */
document.addEventListener("click",function(e){
  const b=e.target.closest("#g23-bottom5");
  if(!b)return;
  e.preventDefault(); e.stopImmediatePropagation();
  open();
},true);

/* Also expose a small API for future real action hooks. */
window.TerritoryQuests={open,close,quests:QUESTS,complete:function(id){
  const q=QUESTS.find(x=>x.id===id), p=read();
  if(!q||p.done.includes(id))return false;
  p.done.push(id);write(p);reward(q.reward);return true;
}};
})();