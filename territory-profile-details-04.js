/* TERRITORY — PROFILE / CHARACTER
   The profile is the only detailed VIP/character view. Home stays clean.
*/
(function(){
'use strict';
if(window.TerritoryProfileDetails04)return;
const S=()=>window.TerritoryStore?.state||{};
const A=()=>window.TerritoryTelegramAuth;
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const TIERS={0:['Без VIP',0,0,0],1:['VIP I',5,5,45],2:['VIP II',8,8,60],3:['VIP III',12,10,80],4:['VIP IV',16,13,105],5:['VIP V',20,16,135],6:['VIP VI',25,20,170],7:['VIP VII',30,24,215],8:['VIP VIII',36,28,270],9:['VIP IX',42,33,335],10:['VIP X',50,40,420]};
function render(){
 const el=document.getElementById('hero');if(!el||!el.classList.contains('active'))return;
 const s=S(),p=s.profile||{},level=n(s.level,1),vip=Math.max(0,Math.min(10,n(p.vip,0))),hp=n(s.hp,0),maxHp=n(s.maxHp,100),energy=n(s.energy,0),maxEnergy=n(s.maxEnergy,100),coins=n(s.coins,0),gems=n(s.gems,0),red=n(s.redGems??s.red_gems,0),xp=n(s.xp??s.exp,0),rank=p.rank||s.rank||'SSS',name=p.displayName||p.username||'Игрок';
 const t=TIERS[vip]||TIERS[0], rows=Object.keys(TIERS).filter(k=>Number(k)>0).map(k=>{const x=TIERS[k];return `<div class="p04-vip-tier ${Number(k)===vip?'active':''}"><b>${x[0]}</b><span>+${x[1]}% XP</span><span>+${x[2]} энергии</span><span>${x[3]} 🪙/день</span></div>`}).join('');
 el.dataset.profileDetails04='1';
 el.innerHTML=`<header class="panel-head"><button data-back>‹</button><h1>👤 Профиль</h1><span class="wallet">VIP ${vip}</span></header><div class="profile04-scroll">
 <section class="p04-id"><div class="p04-avatar">${p.photoUrl?`<img src="${esc(p.photoUrl)}" alt="Telegram">`:`⚔️`}</div><div><h2>${esc(name)}</h2><p>${esc(rank)} · Lv. ${level}</p></div></section>
 <section class="p04-vip"><b>👑 ${esc(t[0])}</b><p>Текущий VIP берётся из серверного профиля Telegram. На главной дополнительных VIP-виджетов нет.</p><div class="p04-vip-current"><span>XP</span><strong>+${t[1]}%</strong><span>Энергия</span><strong>+${t[2]}</strong><span>Ежедневно</span><strong>${t[3]} 🪙</strong></div></section>
 <section class="p04-card"><h3>📊 Характеристики</h3><div class="p04-stats"><span>❤️ HP <strong>${hp} / ${maxHp}</strong></span><span>⚡ Энергия <strong>${energy} / ${maxEnergy}</strong></span><span>🪙 Монеты <strong>${coins.toLocaleString('ru-RU')}</strong></span><span>💎 Алмазы <strong>${gems.toLocaleString('ru-RU')}</strong></span><span>🔴 Красные <strong>${red.toLocaleString('ru-RU')}</strong></span><span>✨ XP <strong>${xp.toLocaleString('ru-RU')}</strong></span></div></section>
 <section class="p04-card"><h3>👑 Все уровни VIP</h3><div class="p04-vip-list">${rows}</div></section>
 <section class="p04-card"><h3>🛡️ Персонаж</h3><div class="p04-row">Telegram ID <strong>${esc(p.telegramId||A()?.player?.telegram_id||'—')}</strong></div><div class="p04-row">Последователь <strong>${esc(s.followers?.activeFollower||s.activeFollower||'—')}</strong></div></section>
 <section class="p04-card"><h3>⚔️ Экипировка</h3><div class="p04-equip">${(Array.isArray(s.equipment)?s.equipment.slice(0,6):[]).map((x,i)=>`<span>${['Оружие','Шлем','Броня','Обувь','Эликсир','Аксессуар'][i]} ${x?'· Lv. '+n(x.level,1):'· —'}</span>`).join('')}</div></section>
 </div>`;
}
document.addEventListener('click',e=>{if(e.target?.closest?.('#home .home-hit.profile'))setTimeout(render,80)},true);
window.addEventListener('territory:state-changed',()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});
window.addEventListener('territory:telegram-authenticated',()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});
window.TerritoryProfileDetails04={render};
})();