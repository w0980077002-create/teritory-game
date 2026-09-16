/* Territory v145 — progression systems, isolated from Arena core. */
(()=> {
  const KEY='territory_systems_v145';
  const DAY=86400000;
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
  let s=read();
  s.hunger=Math.max(0,Math.min(100,Number(s.hunger??100)));
  s.durability=Math.max(0,Math.min(300,Number(s.durability??300)));
  s.battles=Number(s.battles||0);s.wins=Number(s.wins||0);s.losses=Number(s.losses||0);
  s.freePoints=Number(s.freePoints||0);s.loginStreak=Number(s.loginStreak||0);s.lastLogin=Number(s.lastLogin||0);
  s.achievements=Array.isArray(s.achievements)?s.achievements:[];s.rewards=Array.isArray(s.rewards)?s.rewards:[];
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
  function toast(t){try{window.arenaToast?.(t)}catch(e){}}
  function daily(){
    const now=Date.now(), last=s.lastLogin;
    if(!last||now-last>2*DAY)s.loginStreak=1;
    else if(now-last>=DAY)s.loginStreak++;
    if(!last||now-last>=DAY){s.lastLogin=now;save();return true}
    return false;
  }
  daily();
  function onBattleTurn(){s.durability=Math.max(0,s.durability-1);save()}
  function onBattleFinished(result){
    s.battles++;
    if(result==='win'){s.wins++;s.freePoints+=1}
    else if(result==='loss'){s.losses++;s.hunger=Math.max(0,s.hunger-5)}
    save();
  }
  function render(){
    const inv=document.getElementById('inventory'); if(!inv)return;
    let box=document.getElementById('territorySystemsPanel');
    if(!box){box=document.createElement('section');box.id='territorySystemsPanel';box.className='territory-systems';inv.appendChild(box)}
    box.innerHTML=`<div class="ts-head"><b>⚙️ Системы</b><small>v145</small></div>
      <div class="ts-grid"><div>🍖 Голод<b>${s.hunger}%</b></div><div>🛡️ Прочность<b>${s.durability}/300</b></div>
      <div>⚔️ Бои<b>${s.battles}</b></div><div>🏆 Победы<b>${s.wins}</b></div></div>`;
  }
  window.territorySystems={render,onBattleTurn,onBattleFinished,toast,claimDaily:daily,getState:()=>({...s})};
  document.addEventListener('DOMContentLoaded',render);
})();
