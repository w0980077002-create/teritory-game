/* Territory G2 — VIP panel + VIP badge
   Drop this file into the GAME repo and load it from index.html.
*/
(function(){
  "use strict";

  const VIP_AUTOBATTLE_LEVEL = 1;

  const style = document.createElement("style");
  style.textContent = `
    .territory-vip-badge{
      position:absolute; z-index:40; left:7px; top:66px;
      min-width:54px; height:24px; padding:0 9px;
      border:1px solid rgba(255,220,92,.9); border-radius:9px;
      background:linear-gradient(180deg,#5b4214,#241b0a);
      color:#ffe36b; font:900 11px/22px Arial,sans-serif;
      box-shadow:0 0 9px rgba(255,196,35,.28), inset 0 1px 0 rgba(255,255,255,.18);
      text-align:center; cursor:pointer;
    }
    .territory-vip-badge:active{transform:scale(.96)}
    .territory-vip-badge .crown{font-size:12px;margin-right:2px}

    .territory-vip-overlay{
      position:fixed; inset:0; z-index:10000;
      display:none; align-items:center; justify-content:center;
      padding:18px 10px; box-sizing:border-box;
      background:rgba(0,0,0,.74);
    }
    .territory-vip-overlay.show{display:flex}
    .territory-vip-card{
      width:min(100%,520px); max-height:92vh; overflow:auto;
      border:2px solid #8e6220; border-radius:18px;
      background:linear-gradient(180deg,#321d18 0,#171319 100%);
      color:#fff; box-shadow:0 18px 50px rgba(0,0,0,.75);
      font-family:Arial,sans-serif;
    }
    .tvip-head{
      position:relative; padding:11px 48px 10px; text-align:center;
      border-bottom:1px solid rgba(255,220,92,.35);
      background:linear-gradient(180deg,#4a2925,#2b1918);
    }
    .tvip-head b{font-size:23px;color:#ffe17a;text-shadow:0 2px 3px #000}
    .tvip-close{
      position:absolute; right:8px; top:7px; width:38px; height:38px;
      border:0; border-radius:50%; background:#ef3d70; color:#fff;
      font-size:25px; font-weight:900; box-shadow:inset 0 1px 0 rgba(255,255,255,.3);
    }
    .tvip-progress{margin:10px 12px 8px;padding:11px;border-radius:12px;background:#61331f;border:1px solid #9b5b2b;text-align:center}
    .tvip-progress .lvl{font-size:17px;color:#ffe17a;font-weight:900}
    .tvip-progress .bar{height:12px;margin:8px 0 5px;border-radius:99px;background:#e9e3da;overflow:hidden}
    .tvip-progress .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffcc45,#fff08a)}
    .tvip-progress small{opacity:.82}
    .tvip-bonus{margin:0 12px 10px;padding:10px;border-radius:11px;background:#9b512c;color:#fff1b0;text-align:center;font-weight:900}
    .tvip-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 10px}
    .tvip-item{min-height:70px;padding:9px;border-radius:11px;background:#241d20;border:1px solid #60404a}
    .tvip-item b{display:block;color:#ffe17a;font-size:13px;margin-bottom:4px}
    .tvip-item span{font-size:11px;opacity:.82}
    .tvip-section{margin:0 12px 10px;padding:10px;border-radius:12px;background:#1c171b;border:1px solid #57424a}
    .tvip-section h3{margin:0 0 7px;color:#ffe17a;font-size:14px}
    .tvip-pack{display:flex;align-items:center;gap:9px}
    .tvip-pack .art{font-size:38px}
    .tvip-pack div{flex:1}.tvip-pack b{display:block}.tvip-pack small{opacity:.7}
    .tvip-buy{border:0;border-radius:10px;padding:10px 13px;background:linear-gradient(180deg,#ffd34d,#e39b1d);font-weight:900;color:#211507}
    .tvip-foot{padding:10px 12px 14px;text-align:center;font-size:9px;opacity:.55}
    @media(max-width:390px){
      .territory-vip-card{max-height:94vh}
      .tvip-grid{grid-template-columns:1fr}
      .tvip-head b{font-size:20px}
    }
  `;
  document.head.appendChild(style);

  function getVipLevel(){
    const n = Number(localStorage.getItem("territory_vip_level") || 0);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  function ensureModal(){
    if(document.getElementById("territoryVipOverlay")) return;

    const el=document.createElement("div");
    el.id="territoryVipOverlay";
    el.className="territory-vip-overlay";
    el.innerHTML=`
      <div class="territory-vip-card" role="dialog" aria-modal="true" aria-labelledby="territoryVipTitle">
        <div class="tvip-head">
          <button class="tvip-close" type="button" aria-label="Закрыть">×</button>
          <b id="territoryVipTitle">👑 VIP</b>
        </div>
        <div class="tvip-progress">
          <div class="lvl" id="tvipLevel">VIP 0</div>
          <div class="bar"><i id="tvipBar"></i></div>
          <small id="tvipProgressText">VIP-статус пока не активирован</small>
        </div>
        <div class="tvip-bonus" id="tvipBonus">VIP открывает дополнительные возможности Territory</div>
        <div class="tvip-grid">
          <div class="tvip-item"><b>⚔️ Автобой</b><span>Доступен только при активном VIP.</span></div>
          <div class="tvip-item"><b>🎁 VIP-награды</b><span>Дополнительные ежедневные бонусы.</span></div>
          <div class="tvip-item"><b>👑 VIP-облик</b><span>Особый визуальный стиль персонажа.</span></div>
          <div class="tvip-item"><b>✨ Бонусы</b><span>Специальные бонусы уровня VIP.</span></div>
        </div>
        <div class="tvip-section">
          <h3>🎁 Ежедневный VIP-набор</h3>
          <div class="tvip-pack">
            <div class="art">💎🎁</div>
            <div><b>Награды VIP</b><small>Будут выдаваться по правилам выбранного уровня</small></div>
            <button class="tvip-buy" type="button">VIP</button>
          </div>
        </div>
        <div class="tvip-foot">Покупка и права VIP позже будут проверяться сервером.</div>
      </div>`;
    document.body.appendChild(el);

    const close=el.querySelector(".tvip-close");
    close.onclick=()=>closeVip();
    el.addEventListener("click",e=>{if(e.target===el)closeVip()});
    el.querySelector(".tvip-buy").onclick=()=>showVipMessage();
  }

  function renderVip(){
    ensureModal();
    const level=getVipLevel();
    const bar=document.getElementById("tvipBar");
    const text=document.getElementById("tvipProgressText");
    const title=document.getElementById("tvipLevel");
    const bonus=document.getElementById("tvipBonus");
    title.textContent="VIP "+level;
    bar.style.width=(level?Math.min(100,level*20):0)+"%";
    if(level>0){
      text.textContent="VIP активен · уровень "+level;
      bonus.textContent="👑 VIP даёт доступ к дополнительным функциям";
    }else{
      text.textContent="VIP-статус пока не активирован";
      bonus.textContent="🔒 Автобой и VIP-возможности недоступны без VIP";
    }
  }

  function openVip(){renderVip();document.getElementById("territoryVipOverlay").classList.add("show")}
  function closeVip(){const el=document.getElementById("territoryVipOverlay");if(el)el.classList.remove("show")}
  function showVipMessage(){
    const level=getVipLevel();
    const msg=level>0 ? "👑 VIP уже активен." : "🔒 Выберите VIP-пакет, чтобы активировать VIP.";
    if(typeof window.refToast==="function") window.refToast(msg);
    else alert(msg);
  }

  function injectBadge(){
    if(document.querySelector(".territory-vip-badge")) return;
    const profile=document.querySelector(".ref-profile");
    if(!profile) return;
    profile.style.position="relative";
    const b=document.createElement("button");
    b.type="button";
    b.className="territory-vip-badge";
    b.dataset.action="vip";
    b.innerHTML='<span class="crown">👑</span><span>VIP '+getVipLevel()+'</span>';
    b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openVip()});
    profile.appendChild(b);
  }

  document.addEventListener("click",function(e){
    const b=e.target.closest('[data-action="vip"]');
    if(!b || b.classList.contains("territory-vip-badge")) return;
    e.preventDefault(); e.stopPropagation(); openVip();
  },true);

  window.TerritoryVIP={
    getLevel:getVipLevel,
    open:openVip,
    close:closeVip,
    setLevel:function(level){
      const n=Math.max(0,Math.floor(Number(level)||0));
      localStorage.setItem("territory_vip_level",String(n));
      const b=document.querySelector(".territory-vip-badge");
      if(b)b.querySelector("span:last-child").textContent="VIP "+n;
      renderVip();
    },
    canAutoBattle:function(){return getVipLevel()>=VIP_AUTOBATTLE_LEVEL;}
  };

  function boot(){
    ensureModal();
    injectBadge();
    setTimeout(injectBadge,500);
    setTimeout(injectBadge,1500);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();
