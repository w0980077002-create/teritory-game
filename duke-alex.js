/* Territory G7 — Duke Alex: first story quest NPC */
(function(){
  "use strict";

  const KEY="territory_alex_quests_v1";

  const QUESTS=[
    {id:"welcome", title:"Добро пожаловать в Sdolars", text:"Познакомься с городом и сделай первый шаг по его улицам.", reward:{coins:150,exp:40}, goal:1},
    {id:"market", title:"Следы на торговой площади", text:"Зайди в Торговый квартал и осмотри рынок снаряжения.", reward:{coins:250,exp:60}, goal:1},
    {id:"arena", title:"Проверка бойца", text:"Посети Арену Sdolars и приготовься к своему первому серьёзному испытанию.", reward:{coins:400,exp:100}, goal:1}
  ];

  function read(){
    try{
      const v=localStorage.getItem(KEY);
      return v?JSON.parse(v):{current:0,claimed:[]};
    }catch(e){return {current:0,claimed:[]};}
  }
  function write(v){localStorage.setItem(KEY,JSON.stringify(v));}
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

  function styles(){
    if(document.getElementById("territoryAlexStyle"))return;
    const st=document.createElement("style");
    st.id="territoryAlexStyle";
    st.textContent=`
      #territoryAlexModal{position:fixed;inset:0;z-index:100004;display:none;background:rgba(2,8,20,.82);padding:12px;box-sizing:border-box;align-items:flex-end}
      #territoryAlexModal.show{display:flex}
      .ta-card{width:100%;max-width:540px;margin:0 auto;background:linear-gradient(180deg,#172743,#07101f);border:1px solid rgba(255,255,255,.15);border-radius:22px 22px 12px 12px;color:#fff;box-shadow:0 14px 48px rgba(0,0,0,.65);overflow:hidden;max-height:91vh;display:flex;flex-direction:column}
      .ta-head{display:flex;gap:12px;align-items:center;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
      .ta-portrait{width:58px;height:58px;border-radius:15px;background:linear-gradient(145deg,#7d6330,#b9964c);display:grid;place-items:center;font-size:35px;border:1px solid rgba(255,255,255,.2)}
      .ta-title{font-size:18px;font-weight:900}
      .ta-rank{font-size:11px;color:#d6bd7c;margin-top:3px}
      .ta-close{margin-left:auto;border:0;background:rgba(255,255,255,.09);color:#fff;border-radius:11px;font-size:24px;width:42px;height:42px}
      .ta-body{padding:14px;overflow:auto}
      .ta-dialogue{padding:13px;border-radius:15px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);font-size:13px;line-height:1.5;color:#dbe4f2}
      .ta-section{font-size:11px;color:#93a4bd;text-transform:uppercase;letter-spacing:1px;margin:15px 0 8px}
      .ta-quest{padding:12px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);margin-bottom:9px}
      .ta-quest.current{background:linear-gradient(145deg,rgba(62,86,128,.48),rgba(255,255,255,.045))}
      .ta-quest-title{font-weight:900;font-size:14px}
      .ta-quest-text{font-size:11px;color:#aebbd0;line-height:1.4;margin-top:4px}
      .ta-reward{font-size:11px;color:#e0c267;margin-top:7px}
      .ta-status{font-size:10px;color:#9fb0c7;margin-top:6px}
      .ta-btn{width:100%;border:0;border-radius:11px;padding:10px;margin-top:9px;background:#294a79;color:#fff;font-weight:800}
    `;
    document.head.appendChild(st);
  }

  function addReward(reward){
    try{
      const raw=localStorage.getItem("territory_save");
      const s=raw?JSON.parse(raw):{};
      s.coins=Number(s.coins||0)+Number(reward.coins||0);
      s.exp=Number(s.exp||0)+Number(reward.exp||0);
      localStorage.setItem("territory_save",JSON.stringify(s));
      if(typeof window.save==="function")window.save();
      if(typeof window.render==="function")window.render();
    }catch(e){}
  }

  function render(){
    const modal=document.getElementById("territoryAlexModal");
    if(!modal)return;
    const p=read();
    modal.querySelector(".ta-body").innerHTML=`
      <div class="ta-dialogue">«Добро пожаловать в Sdolars. Я герцог Alex. Если хочешь стать частью этого города — начнём с малого. Покажи мне, что ты готов двигаться вперёд.»</div>
      <div class="ta-section">Цепочка заданий</div>
      ${QUESTS.map((q,i)=>{
        const claimed=p.claimed.includes(q.id);
        const current=i===p.current&&!claimed;
        return `<div class="ta-quest ${current?"current":""}">
          <div class="ta-quest-title">${i+1}. ${esc(q.title)}</div>
          <div class="ta-quest-text">${esc(q.text)}</div>
          <div class="ta-reward">🎁 +${q.reward.coins} монет · ⭐ +${q.reward.exp} XP</div>
          <div class="ta-status">${claimed?"✓ Награда получена":current?"Текущее задание":"Закрыто"}</div>
          ${current?`<button class="ta-btn" data-ta-claim="${q.id}">ОТМЕТИТЬ ВЫПОЛНЕННЫМ</button>`:""}
        </div>`;
      }).join("")}
    `;
  }

  function open(){
    styles();
    let modal=document.getElementById("territoryAlexModal");
    if(!modal){
      modal=document.createElement("div");
      modal.id="territoryAlexModal";
      modal.innerHTML=`<div class="ta-card" role="dialog" aria-modal="true">
        <div class="ta-head">
          <div class="ta-portrait">👑</div>
          <div><div class="ta-title">Герцог Alex</div><div class="ta-rank">Хранитель Sdolars</div></div>
          <button class="ta-close" type="button">×</button>
        </div>
        <div class="ta-body"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click",e=>{
        if(e.target===modal||e.target.closest(".ta-close")){close();return;}
        const b=e.target.closest("[data-ta-claim]");
        if(!b)return;
        const p=read(), q=QUESTS.find(x=>x.id===b.dataset.taClaim);
        if(!q)return;
        if(!p.claimed.includes(q.id)){
          p.claimed.push(q.id);
          p.current=Math.min(p.current+1,QUESTS.length);
          write(p);
          addReward(q.reward);
          render();
        }
      });
    }
    render();modal.classList.add("show");
  }

  function close(){
    const m=document.getElementById("territoryAlexModal");
    if(m)m.classList.remove("show");
  }

  /* Add a small quest-giver button to the existing home HUD without replacing the city. */
  function injectButton(){
    if(document.getElementById("territoryAlexButton"))return;
    const b=document.createElement("button");
    b.id="territoryAlexButton";
    b.type="button";
    b.innerHTML="👑<span>Alex</span>";
    b.title="Герцог Alex";
    b.style.cssText="position:fixed;left:10px;top:50%;transform:translateY(-50%);z-index:9000;width:54px;min-height:54px;border:1px solid rgba(255,215,120,.45);border-radius:15px;background:rgba(25,38,62,.86);color:#fff;box-shadow:0 5px 18px rgba(0,0,0,.35);font-weight:800;font-size:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;";
    b.querySelector("span").style.cssText="font-size:9px;letter-spacing:.4px";
    b.addEventListener("click",open);
    document.body.appendChild(b);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",injectButton);
  else injectButton();

  window.TerritoryDukeAlex={open,close,quests:QUESTS};
})();
