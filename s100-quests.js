/* Territory S100 — Quest Center */
(()=> {
  const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  async function api(url,opt={}){const r=await fetch(url,{headers:{"Content-Type":"application/json"},...opt});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Ошибка");return d}
  function open(pid){
    document.getElementById("territory-s100")?.remove();
    const el=document.createElement("div");el.id="territory-s100";
    el.innerHTML=`<div class="s100-bg"></div><section class="s100-sheet">
      <header><div><b>📜 Задания Сдоларса</b><small>Бои • награды • прогресс</small></div><button class="s100-x">×</button></header>
      <div class="s100-progress"><span id="s100-count">0</span> заданий доступно <i></i></div>
      <main id="s100-list"></main>
    </section>`;document.body.appendChild(el);
    const list=el.querySelector("#s100-list");
    async function load(){
      const d=await api("/api/quests?playerId="+encodeURIComponent(pid));
      const qs=Array.isArray(d?.quests)?d.quests:Array.isArray(d)?d:[];
      const claimed=new Set(d?.claimed||[]);
      el.querySelector("#s100-count").textContent=qs.length;
      list.innerHTML=qs.length?qs.map((q,i)=>{
        const progress=Number(q.progress??q.current??q.value??0), target=Number(q.target??q.required??1);
        const done=Boolean(q.completed||q.complete||progress>=target), isClaimed=claimed.has(q.id)||q.claimed;
        const pct=Math.max(0,Math.min(100,Math.round(progress/Math.max(1,target)*100)));
        const xp=Number(q.xpReward??q.xp??0), coins=Number(q.coinReward??q.coins??0);
        return `<article class="s100-q ${done?"done":""}">
          <div class="s100-icon">${done?"🏆":"⚔️"}</div><div class="s100-info">
          <b>${esc(q.name||q.title||q.id||"Задание")}</b><small>${esc(q.description||"Выполни условие, чтобы получить награду")}</small>
          <div class="bar"><span style="width:${pct}%"></span></div><label>${Math.min(progress,target)} / ${target}</label></div>
          <div class="reward">⭐ ${xp}<br>🪙 ${coins}</div>
          <button class="claim" ${(!done||isClaimed)?"disabled":""} data-id="${esc(q.id)}">${isClaimed?"Получено":done?"Забрать":"В процессе"}</button>
        </article>`
      }).join(""):`<div class="empty">Новых заданий пока нет</div>`;
      list.querySelectorAll(".claim:not([disabled])").forEach(b=>b.onclick=async()=>{
        try{await api("/api/quests/claim",{method:"POST",body:JSON.stringify({playerId:pid,questId:b.dataset.id})});await load()}
        catch(e){alert(e.message)}
      });
    }
    el.querySelector(".s100-x").onclick=()=>el.remove();el.querySelector(".s100-bg").onclick=()=>el.remove();
    load().catch(e=>{list.innerHTML=`<div class="empty">Не удалось загрузить задания</div>`;console.error(e)});
  }
  window.openTerritoryS100=open;
})();