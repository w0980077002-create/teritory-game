/* TERRITORY — PROFILE DETAILS 04
   The detailed character/VIP view exists only on the profile screen.
   Home receives no extra VIP nameplate.
*/
(function(){
'use strict';
if(window.TerritoryProfileDetails04)return;
const S=()=>window.TerritoryStore?.state||{};const A=()=>window.TerritoryTelegramAuth;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
function render(){
 const el=document.getElementById('hero');if(!el||!el.classList.contains('active'))return;
 const s=S(),p=s.profile||{},name=p.displayName||p.username||'Игрок',level=n(s.level,1),vip=n(p.vip,0),hp=n(s.hp,0),maxHp=n(s.maxHp,0),energy=n(s.energy,0),maxEnergy=n(s.maxEnergy,0),coins=n(s.coins,0),gems=n(s.gems,0),red=n(s.redGems,0),xp=n(s.xp,0),rank=p.rank||s.rank||'SSS';
 el.dataset.profileDetails04='1';
 el.innerHTML='<header class="panel-head"><button data-back>‹</button><h1>👤 Профиль</h1><span class="wallet">VIP '+vip+'</span></header>'+`<div class="profile04-scroll"><section class="p04-id"><div class="p04-avatar">⚔️</div><div><h2>${esc(name)}</h2><p>${esc(rank)} · Lv. ${level}</p></div></section><section class="p04-vip"><b>👑 VIP ${vip}</b><p>Уровень VIP берётся только из серверного профиля Telegram.</p></section><section class="p04-card"><h3>📊 Характеристики</h3><div class="p04-stats"><span>❤️ HP <strong>${hp}${maxHp?' / '+maxHp:''}</strong></span><span>⚡ Энергия <strong>${energy}${maxEnergy?' / '+maxEnergy:''}</strong></span><span>🪙 Монеты <strong>${coins.toLocaleString('ru-RU')}</strong></span><span>💎 Алмазы <strong>${gems.toLocaleString('ru-RU')}</strong></span><span>🔴 Красные <strong>${red.toLocaleString('ru-RU')}</strong></span><span>✨ XP <strong>${xp.toLocaleString('ru-RU')}</strong></span></div></section><section class="p04-card"><h3>🛡️ Персонаж</h3><div class="p04-row">Telegram ID <strong>${esc(p.telegramId||'—')}</strong></div><div class="p04-row">Последователь <strong>${esc(s.followers?.activeFollower||'—')}</strong></div></section><section class="p04-card"><h3>⚔️ Экипировка</h3><div class="p04-equip"><span>Оружие</span><span>Шлем</span><span>Броня</span><span>Обувь</span><span>Аксессуар</span></div></section></div>`;
}
document.addEventListener('click',e=>{if(e.target?.closest?.('#home .home-hit.profile'))setTimeout(render,100)},true);window.addEventListener('territory:state-changed',()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});window.addEventListener('territory:telegram-authenticated',()=>{if(document.getElementById('hero')?.classList.contains('active'))render()});window.TerritoryProfileDetails04={render};
})();
