const tg=window.Telegram?.WebApp; tg?.ready(); tg?.expand();
const initData=tg?.initData||"";
let player=null, enemyHp=100, damage=10;
const $=x=>document.getElementById(x);
function render(){
 if(!player)return;
 $("coins").textContent=player.coins; $("gems").textContent=player.gems; $("energy").textContent=player.energy;
 $("level").textContent=`Уровень ${player.level}`; $("territory").textContent=player.territory; $("power").textContent=player.power;
 $("enemyhp").textContent=enemyHp; $("hpbar").style.width=enemyHp+"%";
}
async function api(url,options={}){
 options.headers={...(options.headers||{}),"x-telegram-init-data":initData,"Content-Type":"application/json"};
 const r=await fetch(url,options), data=await r.json(); if(!r.ok)throw Error(data.error||"Ошибка"); return data;
}
async function load(){
 try{ const d=await api("/api/me"); player=d.player; render(); }
 catch(e){ $("notice").textContent="Открой игру через Telegram-бота"; $("notice").style.height="auto"; }
}
document.querySelectorAll(".skill").forEach(b=>b.onclick=()=>{document.querySelectorAll(".skill").forEach(x=>x.classList.remove("active"));b.classList.add("active");damage=+b.dataset.damage});
$("attack").onclick=async()=>{
 try{
  $("attack").disabled=true;
  const d=await api("/api/battle",{method:"POST",body:JSON.stringify({damage,enemyHp})});
  player=d.player; enemyHp=d.enemyHp;
  if(d.victory){tg?.HapticFeedback?.notificationOccurred("success"); enemyHp=100; alert(`Победа! +${d.reward} 🪙 и +2 💎`)}
  else tg?.HapticFeedback?.impactOccurred("medium");
  render();
 }catch(e){alert(e.message)}finally{$("attack").disabled=false}
};
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");if(t.dataset.tab==="shop")alert("Магазин: Клинок моря — 500 🪙; Броня капитана — 700 🪙; Энергия — 150 🪙");if(t.dataset.tab==="map")alert("Карта территорий: твоя территория №"+(player?.territory||1));if(t.dataset.tab==="profile")alert(`${player?.first_name||"Игрок"} • уровень ${player?.level||1}`)});
load();
