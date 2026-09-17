/* Territory G6 — Sdolars Districts */
(function(){
  "use strict";

  const DISTRICTS = [
    {id:"center", icon:"🏰", name:"Центральная площадь", desc:"Сердце Sdolars", state:"Открыт"},
    {id:"market", icon:"🛒", name:"Торговый квартал", desc:"Рынок и лавки снаряжения", state:"Открыт"},
    {id:"tavern", icon:"🍺", name:"Старый порт", desc:"Таверна, причалы и наёмники", state:"Открыт"},
    {id:"forge", icon:"⚒️", name:"Кузнечный квартал", desc:"Кузницы и ремонт экипировки", state:"Открыт"},
    {id:"arena", icon:"⚔️", name:"Арена", desc:"Сражения и турнирные бои", state:"Открыт"},
    {id:"castle", icon:"👑", name:"Замковый район", desc:"Дворец и владения города", state:"Скоро"},
    {id:"outskirts", icon:"🌲", name:"Окраины", desc:"Дорога в земли за стенами", state:"Скоро"},
    {id:"docks", icon:"⛵", name:"Большие доки", desc:"Корабли и дальние маршруты", state:"Скоро"}
  ];

  function esc(s){
    return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }

  function styles(){
    if(document.getElementById("territoryDistrictsStyle")) return;
    const st=document.createElement("style");
    st.id="territoryDistrictsStyle";
    st.textContent=`
      #territoryDistrictsModal{position:fixed;inset:0;z-index:100002;display:none;background:rgba(2,8,20,.80);padding:12px;box-sizing:border-box;align-items:flex-end}
      #territoryDistrictsModal.show{display:flex}
      .td-card{width:100%;max-width:540px;margin:0 auto;background:linear-gradient(180deg,#111f38,#07101f);border:1px solid rgba(255,255,255,.14);border-radius:22px 22px 12px 12px;color:#fff;box-shadow:0 12px 45px rgba(0,0,0,.6);overflow:hidden;max-height:91vh;display:flex;flex-direction:column}
      .td-head{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
      .td-title{font-size:19px;font-weight:900;letter-spacing:.5px}
      .td-sub{font-size:11px;color:#93a4bd;margin-top:3px}
      .td-close{border:0;background:rgba(255,255,255,.09);color:#fff;border-radius:11px;font-size:24px;width:42px;height:42px}
      .td-body{padding:13px;overflow:auto}
      .td-city{border:1px solid rgba(255,255,255,.1);border-radius:15px;padding:13px;margin-bottom:12px;background:linear-gradient(135deg,rgba(43,70,112,.35),rgba(255,255,255,.035))}
      .td-city b{font-size:16px}
      .td-city p{margin:5px 0 0;color:#9eacc1;font-size:11px;line-height:1.4}
      .td-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
      .td-district{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.045);border-radius:15px;padding:11px;text-align:left;color:#fff;min-height:112px}
      .td-district.open{background:linear-gradient(145deg,rgba(42,67,104,.62),rgba(255,255,255,.045))}
      .td-district.soon{opacity:.62}
      .td-icon{font-size:30px}
      .td-name{font-size:13px;font-weight:800;margin-top:5px}
      .td-desc{font-size:10px;color:#9eacc1;margin-top:3px;line-height:1.3}
      .td-state{display:inline-block;margin-top:8px;padding:4px 7px;border-radius:7px;background:rgba(255,255,255,.08);font-size:9px;color:#c8d3e3}
    `;
    document.head.appendChild(st);
  }

  function open(){
    styles();
    let modal=document.getElementById("territoryDistrictsModal");
    if(!modal){
      modal=document.createElement("div");
      modal.id="territoryDistrictsModal";
      modal.innerHTML=`<div class="td-card" role="dialog" aria-modal="true">
        <div class="td-head"><div><div class="td-title">🗺️ РАЙОНЫ SDOLARS</div><div class="td-sub">Городская карта</div></div><button class="td-close" type="button">×</button></div>
        <div class="td-body">
          <div class="td-city"><b>🏙️ Sdolars</b><p>Выбери район города. Открытые районы доступны уже сейчас, остальные будут добавляться по мере развития города.</p></div>
          <div class="td-grid"></div>
        </div>
      </div>`;
      document.body.appendChild(modal);
      modal.querySelector(".td-grid").innerHTML=DISTRICTS.map(d=>`
        <button class="td-district ${d.state==="Открыт"?"open":"soon"}" data-district="${d.id}">
          <div class="td-icon">${d.icon}</div><div class="td-name">${esc(d.name)}</div>
          <div class="td-desc">${esc(d.desc)}</div><span class="td-state">${d.state==="Открыт"?"ВОЙТИ":"СКОРО"}</span>
        </button>`).join("");
      modal.addEventListener("click",e=>{
        if(e.target===modal || e.target.closest(".td-close")){close();return;}
        const b=e.target.closest("[data-district]");
        if(!b)return;
        const d=DISTRICTS.find(x=>x.id===b.dataset.district);
        if(!d)return;
        if(d.state!=="Открыт"){
          alert("Этот район появится позже.");
          return;
        }
        if(d.id==="market" && window.TerritoryMarket){close();window.TerritoryMarket.open();return;}
        if(d.id==="arena"){
          close();
          const nav=document.querySelector('[data-screen="arena"]');
          if(nav) nav.click();
          return;
        }
        if(d.id==="tavern" || d.id==="forge"){
          close();
          let t=document.getElementById("refToast");
          if(t){t.textContent=d.icon+" "+d.name+" — раздел готовится";t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600);}
          return;
        }
        close();
        let t=document.getElementById("refToast");
        if(t){t.textContent=d.icon+" "+d.name; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1600);}
      });
    }
    modal.classList.add("show");
  }

  function close(){
    const m=document.getElementById("territoryDistrictsModal");
    if(m)m.classList.remove("show");
  }

  document.addEventListener("click",function(e){
    const b=e.target.closest('button[data-screen="districts"],a[data-screen="districts"],[data-screen="districts"]');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open();
  },true);

  window.TerritoryDistricts={open,close,districts:DISTRICTS};
})();
