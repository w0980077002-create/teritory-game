/* Territory S99 — Market 2.0
   Compact mobile market connected to inventory/equipment APIs.
   Usage: <script src="s99-market.js"></script>
           openTerritoryS99(playerId)
*/
(() => {
  const ICON={iron_sword:"⚔️",viking_axe:"🪓",steel_armor:"🛡️",leather_belt:"🥋",fists:"✊"};
  const TYPE={weapon:"Оружие",armor:"Броня",belt:"Пояс"};
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  async function api(url,opt={}){
    const r=await fetch(url,{headers:{"Content-Type":"application/json"},...opt});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw Error(d.error||"Ошибка");
    return d;
  }
  function open(pid){
    document.getElementById("territory-s99")?.remove();
    const el=document.createElement("div");
    el.id="territory-s99";
    el.innerHTML=`<div class="s99-bg"></div><section class="s99-sheet">
      <header><div><b>🏪 Рынок Сдоларса</b><small>Снаряжение и торговля</small></div>
      <div class="s99-coins">🪙 <span>0</span></div><button class="s99-x">×</button></header>
      <nav><button class="on" data-f="all">Все</button><button data-f="weapon">⚔️ Оружие</button>
      <button data-f="armor">🛡️ Броня</button><button data-f="belt">🥋 Пояса</button></nav>
      <main><div class="s99-list"></div><aside><div class="s99-selected">Выберите товар</div></aside></main>
    </section>`;
    document.body.appendChild(el);
    const st={items:[],filter:"all",sel:null,coins:0,equip:{}};
    const list=el.querySelector(".s99-list"), side=el.querySelector("aside");

    async function load(){
      const [m,e]=await Promise.all([
        api("/api/market?playerId="+encodeURIComponent(pid)),
        api("/api/equipment?playerId="+encodeURIComponent(pid)).catch(()=>({}))
      ]);
      st.items=Array.isArray(m?.items)?m.items:Array.isArray(m?.market)?m.market:Array.isArray(m)?m:[];
      st.coins=Number(m?.coins??e?.coins??0);
      st.equip=e?.equipment||{};
      render();
    }
    function render(){
      el.querySelector(".s99-coins span").textContent=st.coins;
      const a=st.items.filter(x=>st.filter==="all"||(x.type||x.category)===st.filter);
      list.innerHTML=a.length?a.map(x=>`<button class="s99-card ${st.sel===x.id?"sel":""}">
        <span class="ico">${ICON[x.id]||"📦"}</span><b>${esc(x.name||x.title||x.id)}</b>
        <small>${TYPE[x.type||x.category]||""}</small><strong>${Number(x.price||x.buyPrice||0)} 🪙</strong></button>`).join("")
        :`<div class="empty">Нет товаров</div>`;
      [...list.children].forEach((b,i)=>b.onclick=()=>{st.sel=a[i].id;render();detail(a[i]);});
      if(!st.sel) side.innerHTML=`<div class="s99-selected"><span>🏪</span><b>Выберите товар</b><small>Купленные предметы появятся в рюкзаке</small></div>`;
    }
    function detail(x){
      const price=Number(x.price??x.buyPrice??0), type=x.type||x.category||"";
      side.innerHTML=`<div class="s99-detail"><div class="hero">${ICON[x.id]||"📦"}</div>
       <h3>${esc(x.name||x.title||x.id)}</h3><small>${TYPE[type]||type}</small>
       <div class="stats">${x.damage!=null?`<span>⚔️ Урон +${x.damage}</span>`:""}${x.power!=null?`<span>💪 Сила +${x.power}</span>`:""}
       ${x.hp!=null?`<span>❤️ HP +${x.hp}</span>`:""}${x.crit!=null?`<span>🎯 Крит +${x.crit}%</span>`:""}</div>
       <div class="price">${price} 🪙</div><button class="buy">Купить</button></div>`;
      side.querySelector(".buy").onclick=async()=>{
        try{
          await api("/api/market/buy",{method:"POST",body:JSON.stringify({playerId:pid,itemId:x.id,quantity:1})});
          st.sel=null;await load();
          if(window.openTerritoryS98) window.openTerritoryS98(pid);
        }catch(e){alert(e.message)}
      };
    }
    el.querySelector(".s99-x").onclick=()=>el.remove();
    el.querySelector(".s99-bg").onclick=()=>el.remove();
    el.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{
      el.querySelectorAll("nav button").forEach(q=>q.classList.remove("on"));b.classList.add("on");
      st.filter=b.dataset.f;st.sel=null;render();
    });
    load().catch(e=>{list.innerHTML=`<div class="empty">Не удалось загрузить рынок</div>`;console.error(e)});
  }
  window.openTerritoryS99=open;
})();