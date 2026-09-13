/* Territory S98 — Compact Backpack / Inventory
   Mobile-first in-game UI. Does not modify index.html.
   Usage: load this file, then call window.openTerritoryS98(playerId)
*/
(() => {
  const ZONES = {head:"Голова", chest:"Грудь", belt:"Пояс", legs:"Ноги"};
  const TYPE = {weapon:"Оружие", armor:"Броня", belt:"Пояс"};
  const ICON = {iron_sword:"⚔️", viking_axe:"🪓", steel_armor:"🛡️", leather_belt:"🥋", fists:"✊"};

  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
  async function api(url, opt={}) {
    const r=await fetch(url,{headers:{"Content-Type":"application/json"},...opt});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.error||"Ошибка");
    return d;
  }

  function normalize(data){
    const items = Array.isArray(data?.items) ? data.items :
                  Array.isArray(data?.inventory) ? data.inventory :
                  Array.isArray(data) ? data : [];
    const equipment = data?.equipment || {};
    const counts = {};
    items.forEach(x=>{
      const id=x.id||x.itemId||x.key;
      if(!id)return;
      counts[id]=(counts[id]||0)+(Number(x.quantity||x.qty||1)||1);
    });
    return {items,counts,equipment,coins:Number(data?.coins||0)};
  }

  async function load(pid){
    const [eq, econ] = await Promise.all([
      api("/api/equipment?playerId="+encodeURIComponent(pid)),
      api("/api/economy?playerId="+encodeURIComponent(pid)).catch(()=>({coins:0}))
    ]);
    return normalize({
      ...(eq||{}),
      coins:econ?.coins ?? eq?.coins ?? 0
    });
  }

  function make(pid){
    const old=document.getElementById("territory-s98");
    if(old) old.remove();
    const el=document.createElement("div");
    el.id="territory-s98";
    el.innerHTML=`
      <div class="s98-backdrop"></div>
      <section class="s98-sheet">
        <header class="s98-head">
          <div><b>🎒 Рюкзак</b><small id="s98-sub">Снаряжение</small></div>
          <div class="s98-money">🪙 <span id="s98-coins">0</span></div>
          <button class="s98-close" aria-label="Закрыть">×</button>
        </header>
        <nav class="s98-tabs">
          <button data-filter="all" class="active">Все</button>
          <button data-filter="weapon">⚔️ Оружие</button>
          <button data-filter="armor">🛡️ Броня</button>
          <button data-filter="belt">🥋 Пояса</button>
        </nav>
        <div class="s98-main">
          <div class="s98-grid" id="s98-grid"></div>
          <div class="s98-detail" id="s98-detail">
            <div class="s98-empty">Выбери предмет</div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(el);

    const state={data:null,filter:"all",selected:null};

    function render(){
      const d=state.data||{items:[],counts:{},equipment:{}};
      const grid=el.querySelector("#s98-grid");
      const entries=[];
      const seen=new Set();
      d.items.forEach(x=>{
        const id=x.id||x.itemId||x.key;if(!id||seen.has(id))return;seen.add(id);
        const type=x.type||x.category||"weapon";
        if(state.filter!=="all" && type!==state.filter)return;
        entries.push({...x,id,type,qty:d.counts[id]||Number(x.quantity||1)||1});
      });
      if(!entries.length){grid.innerHTML='<div class="s98-empty-grid">Рюкзак пуст</div>';return;}
      grid.innerHTML=entries.map(x=>{
        const eq=(d.equipment.weapon===x.id||d.equipment.armor===x.id||d.equipment.belt===x.id);
        return `<button class="s98-item ${state.selected===x.id?"selected":""}">
          <span class="s98-icon">${ICON[x.id]||"📦"}</span>
          <span class="s98-name">${esc(x.name||x.title||x.id)}</span>
          <span class="s98-qty">×${x.qty}</span>${eq?'<span class="s98-equipped">ЭКИП.</span>':""}
        </button>`;
      }).join("");
      [...grid.children].forEach((b,i)=>b.onclick=()=>{state.selected=entries[i].id;render();detail(entries[i]);});
      el.querySelector("#s98-coins").textContent=d.coins;
    }

    function detail(x){
      const d=state.data;
      const equipped = d.equipment.weapon===x.id || d.equipment.armor===x.id || d.equipment.belt===x.id;
      const sell=Number(x.sellPrice ?? x.sell ?? Math.floor(Number(x.price||0)/2));
      const type=x.type||x.category||"weapon";
      el.querySelector("#s98-detail").innerHTML=`
        <div class="s98-detail-top"><span class="s98-bigicon">${ICON[x.id]||"📦"}</span>
          <div><b>${esc(x.name||x.title||x.id)}</b><small>${TYPE[type]||type}</small></div>
          <span class="s98-detail-qty">×${d.counts[x.id]||1}</span></div>
        <div class="s98-stats">
          ${x.damage!=null?`<span>⚔️ Урон <b>+${x.damage}</b></span>`:""}
          ${x.power!=null?`<span>💪 Сила <b>+${x.power}</b></span>`:""}
          ${x.hp!=null?`<span>❤️ HP <b>+${x.hp}</b></span>`:""}
          ${x.crit!=null?`<span>🎯 Крит <b>+${x.crit}%</b></span>`:""}
        </div>
        <div class="s98-actions">
          ${type!=="fists" ? `<button class="primary" id="s98-equip">${equipped?"Снять":"Экипировать"}</button>`:""}
          ${sell>0 && x.id!=="fists" ? `<button id="s98-sell">Продать · ${sell} 🪙</button>`:""}
          ${x.id!=="fists" ? `<button class="danger" id="s98-drop">Выбросить</button>`:""}
        </div>`;
      const eq=el.querySelector("#s98-equip");
      if(eq)eq.onclick=async()=>{
        try{
          const url=equipped?"/api/equipment/unequip":"/api/equipment/equip";
          await api(url,{method:"POST",body:JSON.stringify({playerId:pid,itemId:x.id})});
          state.data=await load(pid);render();detail(x);
        }catch(e){alert(e.message)}
      };
      const sellBtn=el.querySelector("#s98-sell");
      if(sellBtn)sellBtn.onclick=async()=>{
        try{await api("/api/market/sell",{method:"POST",body:JSON.stringify({playerId:pid,itemId:x.id,quantity:1})});
          state.data=await load(pid);state.selected=null;render();
        }catch(e){alert(e.message)}
      };
      const drop=el.querySelector("#s98-drop");
      if(drop)drop.onclick=async()=>{
        if(!confirm("Выбросить 1 предмет?"))return;
        try{await api("/api/equipment/drop",{method:"POST",body:JSON.stringify({playerId:pid,itemId:x.id,quantity:1})});
          state.data=await load(pid);state.selected=null;render();
        }catch(e){alert(e.message)}
      };
    }

    el.querySelector(".s98-close").onclick=()=>el.remove();
    el.querySelector(".s98-backdrop").onclick=()=>el.remove();
    el.querySelectorAll(".s98-tabs button").forEach(b=>b.onclick=()=>{
      el.querySelectorAll(".s98-tabs button").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");state.filter=b.dataset.filter;state.selected=null;render();
      el.querySelector("#s98-detail").innerHTML='<div class="s98-empty">Выбери предмет</div>';
    });
    load(pid).then(d=>{state.data=d;render()}).catch(e=>{
      el.querySelector("#s98-grid").innerHTML='<div class="s98-empty-grid">Не удалось загрузить рюкзак</div>';
      console.error(e);
    });
  }
  window.openTerritoryS98 = make;
})();