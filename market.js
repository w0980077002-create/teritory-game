/* Territory G5 — Equipment Market */
(function(){
  "use strict";

  const STATE_KEY = "territory_save";

  const PRODUCTS = [
    {id:"axe_steel", name:"Стальной топор", icon:"🪓", price:450, stat:"Урон +18", damage:18, slot:"weapon"},
    {id:"sword_short", name:"Короткий меч", icon:"🗡️", price:650, stat:"Урон +15", damage:15, slot:"weapon"},
    {id:"helmet_iron", name:"Железный шлем", icon:"🪖", price:350, stat:"Защита +5", defense:5, slot:"head"},
    {id:"armor_battle", name:"Боевая броня", icon:"🛡️", price:900, stat:"Защита +10", defense:10, slot:"body"},
    {id:"boots_leather", name:"Кожаные сапоги", icon:"🥾", price:300, stat:"Защита +3", defense:3, slot:"boots"},
    {id:"greaves_iron", name:"Железные поножи", icon:"👖", price:500, stat:"Защита +6", defense:6, slot:"legs"}
  ];

  function readState(){
    try{
      const raw=localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){ return {}; }
  }
  function saveState(s){ localStorage.setItem(STATE_KEY,JSON.stringify(s)); }
  function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

  function ensureStyles(){
    if(document.getElementById("territoryMarketStyle"))return;
    const st=document.createElement("style");
    st.id="territoryMarketStyle";
    st.textContent=`
      #territoryMarketModal{position:fixed;inset:0;z-index:100000;display:none;background:rgba(2,8,20,.78);padding:12px;box-sizing:border-box;align-items:flex-end}
      #territoryMarketModal.show{display:flex}
      .tm-card{width:100%;max-width:520px;margin:0 auto;background:linear-gradient(180deg,#111f38,#07101f);border:1px solid rgba(255,255,255,.14);border-radius:20px 20px 12px 12px;color:#fff;box-shadow:0 12px 45px rgba(0,0,0,.55);overflow:hidden;max-height:90vh;display:flex;flex-direction:column}
      .tm-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
      .tm-head b{font-size:18px;letter-spacing:.5px}
      .tm-coins{font-size:12px;color:#f2c75c;margin-top:3px}
      .tm-close{border:0;background:rgba(255,255,255,.09);color:#fff;border-radius:10px;font-size:24px;width:40px;height:40px}
      .tm-body{padding:14px;overflow:auto}
      .tm-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
      .tm-tab{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#aebbd0;border-radius:10px;padding:9px 5px;font-size:11px;font-weight:700}
      .tm-tab.active{background:#263f68;color:#fff}
      .tm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
      .tm-product{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:11px}
      .tm-icon{font-size:31px}
      .tm-name{font-weight:800;font-size:13px;margin-top:5px}
      .tm-stat{font-size:11px;color:#b9c5d7;margin-top:3px}
      .tm-buy{width:100%;margin-top:9px;border:0;border-radius:10px;padding:10px;background:#284777;color:#fff;font-weight:800}
      .tm-buy:disabled{opacity:.45}
      .tm-price{color:#f2c75c}
      .tm-toast{position:fixed;left:50%;bottom:86px;transform:translate(-50%,18px);opacity:0;pointer-events:none;background:#14243d;color:#fff;border:1px solid rgba(255,255,255,.12);padding:10px 15px;border-radius:12px;z-index:100001;font-weight:700;font-size:13px;transition:.2s}
      .tm-toast.show{opacity:1;transform:translate(-50%,0)}
    `;
    document.head.appendChild(st);
  }

  let filter="all";

  function render(){
    const modal=document.getElementById("territoryMarketModal");
    if(!modal)return;
    const s=readState();
    const coins=Number(s.coins||0);
    const list=PRODUCTS.filter(p=>filter==="all" || (filter==="weapon"&&p.slot==="weapon") || (filter==="armor"&&p.slot!=="weapon"));
    modal.querySelector(".tm-coins").textContent="🪙 "+coins.toLocaleString("ru-RU")+" монет";
    modal.querySelector(".tm-grid").innerHTML=list.map(p=>{
      const can=coins>=p.price;
      return `<div class="tm-product">
        <div class="tm-icon">${p.icon}</div>
        <div class="tm-name">${esc(p.name)}</div>
        <div class="tm-stat">${esc(p.stat)}</div>
        <button class="tm-buy" data-tm-buy="${p.id}" ${can?"":"disabled"}>
          <span class="tm-price">🪙 ${p.price.toLocaleString("ru-RU")}</span>
        </button>
      </div>`;
    }).join("");
    modal.querySelectorAll(".tm-tab").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));
  }

  function toast(msg){
    let t=document.getElementById("territoryMarketToast");
    if(!t){t=document.createElement("div");t.id="territoryMarketToast";t.className="tm-toast";document.body.appendChild(t);}
    t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);
    toast._t=setTimeout(()=>t.classList.remove("show"),1700);
  }

  function buy(id){
    const p=PRODUCTS.find(x=>x.id===id);
    if(!p)return;
    const s=readState();
    const price=Number(p.price);
    if(Number(s.coins||0)<price){toast("Недостаточно монет");return;}
    s.coins=Number(s.coins||0)-price;
    if(!Array.isArray(s.inventory))s.inventory=[];
    s.inventory.push({name:p.name,icon:p.icon,damage:p.damage||0,defense:p.defense||0,slot:p.slot});
    saveState(s);
    try{
      window.dispatchEvent(new CustomEvent("territory:marketPurchase",{detail:p}));
      if(typeof window.save==="function")window.save();
      if(typeof window.render==="function")window.render();
    }catch(e){}
    toast("Куплено: "+p.name);
    render();
  }

  function open(){
    ensureStyles();
    let modal=document.getElementById("territoryMarketModal");
    if(!modal){
      modal=document.createElement("div");
      modal.id="territoryMarketModal";
      modal.innerHTML=`<div class="tm-card" role="dialog" aria-modal="true">
        <div class="tm-head"><div><b>🛒 РЫНОК СНАРЯЖЕНИЯ</b><div class="tm-coins"></div></div><button class="tm-close" type="button">×</button></div>
        <div class="tm-body">
          <div class="tm-tabs">
            <button class="tm-tab active" data-filter="all">ВСЁ</button>
            <button class="tm-tab" data-filter="weapon">ОРУЖИЕ</button>
            <button class="tm-tab" data-filter="armor">БРОНЯ</button>
          </div>
          <div class="tm-grid"></div>
        </div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click",e=>{
        if(e.target===modal || e.target.closest(".tm-close")){close();return;}
        const tab=e.target.closest("[data-filter]");
        if(tab){filter=tab.dataset.filter;render();return;}
        const b=e.target.closest("[data-tm-buy]");
        if(b){e.preventDefault();e.stopPropagation();buy(b.dataset.tmBuy);}
      });
    }
    render();modal.classList.add("show");
  }

  function close(){
    const m=document.getElementById("territoryMarketModal");
    if(m)m.classList.remove("show");
  }

  function isMarketButton(el){
    if(!el)return false;
    const a=(el.getAttribute("data-action")||"").toLowerCase();
    const id=(el.id||"").toLowerCase();
    const txt=(el.textContent||"").trim().toLowerCase();
    return a==="shop" || a==="market" || id.includes("shop") || id.includes("market") ||
           txt==="магазин" || txt.includes("рынок снаряжения");
  }

  document.addEventListener("click",function(e){
    const b=e.target.closest("button,a,[role=button]");
    if(!b||!isMarketButton(b))return;
    e.stopImmediatePropagation();
    e.preventDefault();
    open();
  },true);

  window.TerritoryMarket={open,close,products:PRODUCTS};
})();
