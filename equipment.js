/* Territory G4 — Equipment / Inventory */
(function(){
  "use strict";

  const KEY = "territory_equipment_v1";
  const STATE_KEY = "territory_save";

  const DEFAULT_EQUIPMENT = {
    weapon: {name:"Боевой топор", icon:"🪓", damage:12},
    head: null,
    body: null,
    legs: null,
    boots: null
  };

  function readJSON(key, fallback){
    try{
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    }catch(e){ return fallback; }
  }

  function saveEquipment(eq){
    localStorage.setItem(KEY, JSON.stringify(eq));
  }

  function getEquipment(){
    const saved = readJSON(KEY, null);
    if(saved && typeof saved === "object") return Object.assign({}, DEFAULT_EQUIPMENT, saved);
    const st = readJSON(STATE_KEY, {});
    const eq = Object.assign({}, DEFAULT_EQUIPMENT);
    if(st && st.equipment && typeof st.equipment === "object"){
      Object.assign(eq, st.equipment);
    }
    saveEquipment(eq);
    return eq;
  }

  function getInventory(){
    const st = readJSON(STATE_KEY, {});
    let inv = Array.isArray(st.inventory) ? st.inventory.slice() : [];
    if(!inv.length) inv = ["🪓"];
    return inv;
  }

  function itemFromToken(token){
    if(typeof token === "object" && token) return token;
    const t = String(token || "");
    if(t.includes("🪓") || /топор/i.test(t)) return {name:"Боевой топор",icon:"🪓",damage:12};
    if(t.includes("🗡") || /меч/i.test(t)) return {name:"Короткий меч",icon:"🗡️",damage:8};
    if(t.includes("🛡") || /щит/i.test(t)) return {name:"Железный щит",icon:"🛡️",defense:5};
    if(t.includes("🪖") || /шлем/i.test(t)) return {name:"Стальной шлем",icon:"🪖",defense:3};
    if(t.includes("🥋") || /брон/i.test(t)) return {name:"Боевая броня",icon:"🥋",defense:8};
    return {name:t || "Предмет",icon:"📦"};
  }

  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }

  function ensureStyles(){
    if(document.getElementById("territoryEquipmentStyle")) return;
    const st=document.createElement("style");
    st.id="territoryEquipmentStyle";
    st.textContent=`
      #territoryEquipmentModal{position:fixed;inset:0;z-index:99999;display:none;background:rgba(2,8,20,.78);padding:12px;box-sizing:border-box;align-items:flex-end}
      #territoryEquipmentModal.show{display:flex}
      .te-card{width:100%;max-width:520px;margin:0 auto;background:linear-gradient(180deg,#101d35,#07101f);border:1px solid rgba(255,255,255,.14);border-radius:20px 20px 12px 12px;color:#fff;box-shadow:0 12px 45px rgba(0,0,0,.55);overflow:hidden;max-height:88vh;display:flex;flex-direction:column}
      .te-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
      .te-head b{font-size:18px;letter-spacing:.5px}
      .te-close{border:0;background:rgba(255,255,255,.09);color:#fff;border-radius:10px;font-size:24px;width:40px;height:40px}
      .te-body{padding:14px;overflow:auto}
      .te-section-title{font-size:12px;color:#aebbd0;text-transform:uppercase;letter-spacing:1px;margin:4px 0 9px}
      .te-slots{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
      .te-slot{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px;min-height:74px}
      .te-slot.weapon{grid-column:1/-1}
      .te-slot-label{font-size:10px;color:#8e9db6;text-transform:uppercase}
      .te-item{display:flex;align-items:center;gap:9px;margin-top:7px}
      .te-icon{font-size:27px}
      .te-name{font-weight:700;font-size:13px}
      .te-stat{font-size:11px;color:#b9c5d7;margin-top:2px}
      .te-empty{color:#71809a;font-size:12px;margin-top:9px}
      .te-inv{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
      .te-item-card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px}
      .te-item-card button{width:100%;margin-top:8px;border:0;border-radius:10px;padding:9px;background:#243b61;color:#fff;font-weight:700}
      .te-note{font-size:11px;color:#8795aa;text-align:center;margin-top:12px}
    `;
    document.head.appendChild(st);
  }

  function render(){
    const modal=document.getElementById("territoryEquipmentModal");
    if(!modal) return;
    const eq=getEquipment();
    const inv=getInventory();

    const slots=[
      ["weapon","⚔️ Оружие"],
      ["head","🪖 Голова"],
      ["body","🛡️ Тело"],
      ["legs","👖 Ноги"],
      ["boots","🥾 Обувь"]
    ];

    const slotHTML=slots.map(([key,label])=>{
      const it=eq[key];
      return `<div class="te-slot ${key==="weapon"?"weapon":""}">
        <div class="te-slot-label">${label}</div>
        ${it
          ? `<div class="te-item"><span class="te-icon">${esc(it.icon||"📦")}</span><div><div class="te-name">${esc(it.name)}</div><div class="te-stat">${it.damage?`Урон +${it.damage}`:""}${it.defense?`Защита +${it.defense}`:""}</div></div></div>`
          : `<div class="te-empty">Пусто</div>`}
      </div>`;
    }).join("");

    const cards=inv.map((raw,i)=>{
      const it=itemFromToken(raw);
      const equipped = Object.values(eq).some(x=>x && x.name===it.name);
      return `<div class="te-item-card">
        <div class="te-item"><span class="te-icon">${esc(it.icon)}</span><div><div class="te-name">${esc(it.name)}</div><div class="te-stat">${it.damage?`Урон +${it.damage}`:""}${it.defense?`Защита +${it.defense}`:""}</div></div></div>
        <button data-te-equip="${i}">${equipped?"Надето":"НАДЕТЬ"}</button>
      </div>`;
    }).join("");

    modal.querySelector(".te-body").innerHTML=
      `<div class="te-section-title">Экипировка</div><div class="te-slots">${slotHTML}</div>
       <div class="te-section-title" style="margin-top:16px">Инвентарь</div>
       <div class="te-inv">${cards || '<div class="te-empty">Инвентарь пуст</div>'}</div>
       <div class="te-note">Экипировка сохраняется на этом устройстве. Серверная синхронизация подключается на следующем этапе.</div>`;
  }

  function equip(index){
    const inv=getInventory();
    const it=itemFromToken(inv[index]);
    const eq=getEquipment();

    let slot="weapon";
    if(it.defense && /шлем/i.test(it.name)) slot="head";
    else if(it.defense && /брон/i.test(it.name)) slot="body";
    else if(/ног/i.test(it.name)) slot="legs";
    else if(/обув/i.test(it.name)) slot="boots";

    eq[slot]=it;
    saveEquipment(eq);

    const st=readJSON(STATE_KEY,{});
    st.equipment=eq;
    if(slot==="weapon"){
      st.weapon=it.name;
      st.bonusDamage=Number(it.damage||0);
    }
    localStorage.setItem(STATE_KEY,JSON.stringify(st));
    window.dispatchEvent(new CustomEvent("territory:equipmentChanged",{detail:{slot,item:it}}));
    render();
  }

  function open(){
    ensureStyles();
    let modal=document.getElementById("territoryEquipmentModal");
    if(!modal){
      modal=document.createElement("div");
      modal.id="territoryEquipmentModal";
      modal.innerHTML=`<div class="te-card" role="dialog" aria-modal="true">
        <div class="te-head"><b>🎒 ЭКИПИРОВКА</b><button class="te-close" type="button">×</button></div>
        <div class="te-body"></div>
      </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click",e=>{
        if(e.target===modal || e.target.closest(".te-close")) close();
        const b=e.target.closest("[data-te-equip]");
        if(b){ e.preventDefault(); e.stopPropagation(); equip(Number(b.dataset.teEquip)); }
      });
    }
    render();
    modal.classList.add("show");
  }

  function close(){
    const m=document.getElementById("territoryEquipmentModal");
    if(m)m.classList.remove("show");
  }

  function isInventoryButton(el){
    if(!el) return false;
    const a=(el.getAttribute("data-action")||"").toLowerCase();
    const id=(el.id||"").toLowerCase();
    const txt=(el.textContent||"").trim().toLowerCase();
    return a==="inventory" || a==="equipment" || id.includes("inventory") || id.includes("equipment") ||
           txt==="инвентарь" || txt.includes("инвентарь") || txt.includes("экипировка");
  }

  document.addEventListener("click",function(e){
    const b=e.target.closest("button,a,[role=button]");
    if(!b || !isInventoryButton(b)) return;
    if(document.getElementById("territoryEquipmentModal")) e.stopImmediatePropagation();
    e.preventDefault();
    open();
  },true);

  window.TerritoryEquipment={open,close,getEquipment};
})();
