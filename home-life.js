(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const FOLLOWERS=()=>window.Followers;
const CONFIG={
 liabro:{name:'Лиабро',icon:'⚔️',role:'Крит',accent:'crit'},
 teralel:{name:'Тералель',icon:'🛡️',role:'Защита',accent:'guard'},
 king_cows:{name:'Король Коров',icon:'❤️',role:'Лечение',accent:'heal'},
 mort:{name:'Морт',icon:'🌀',role:'Уворот',accent:'dodge'},
 stone_face:{name:'Каменное Лицо',icon:'💀',role:'Контроль',accent:'control'}
};
function activeFollower(){
 const id=FOLLOWERS?.getActiveId?.()||S().followers?.activeFollower||'liabro';
 const c=CONFIG[id]||CONFIG.liabro;
 return {id,name:c.name,icon:c.icon,role:c.role,accent:c.accent};
}
function safe(v){return String(v??'').replace(/[<>&"]/g,'');}
function ensure(){
 const home=document.getElementById('home'); if(!home)return null;
 let layer=home.querySelector('.home-life'); if(layer)return layer;
 layer=document.createElement('div'); layer.className='home-life';
 layer.innerHTML=`
  <div class="life-vignette"></div><div class="life-moon"></div>
  <div class="life-snow" aria-hidden="true">${'<i></i>'.repeat(16)}</div>
  <div class="life-fire fire-left"><i></i><b></b><em></em></div>
  <div class="life-fire fire-right"><i></i><b></b><em></em></div>
  <div class="life-ambient"><i></i><i></i><i></i></div>
  <div class="life-ground-runes" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="life-world-pulse" data-world-pulse></div>
  <div class="life-hero" data-life-hero aria-label="Герой">
    <div class="life-shadow"></div><div class="hero-aura"></div><div class="hero-glow"></div>
    <div class="hero-cape"></div><div class="hero-body"><i class="hero-belt"></i><i class="hero-chest"></i><i class="hero-arm left"></i><i class="hero-arm right"></i></div>
    <div class="hero-head"><i class="hero-hood"></i><i class="hero-face"></i><i class="hero-eye"></i></div>
    <div class="hero-weapon"><i></i><b></b></div><div class="hero-boots"><i></i><i></i></div>
    <div class="hero-spark"><i></i><i></i><i></i></div>
    <div class="hero-status" data-hero-status></div>
  </div>
  <button class="life-follower" data-life-follower aria-label="Последователь слева от героя">
    <div class="life-shadow"></div><div class="follower-aura"></div><div class="follower-glow"></div>
    <div class="follower-body"><i class="follower-cape"></i><i class="follower-head"></i><i class="follower-arm left"></i><i class="follower-arm right"></i><i class="follower-blade"></i><span data-life-follower-icon>⚔️</span></div>
    <div class="follower-spark"><i></i><i></i></div><div class="follower-status" data-follower-status></div>
  </button>
  <div class="life-nameplate" data-life-nameplate></div><div class="follower-nameplate" data-follower-nameplate></div>
  <div class="life-weather"><span></span><span></span><span></span></div>
  <div class="life-tap" data-life-tap></div>
  <div class="life-toast" data-life-toast></div>`;
 home.appendChild(layer); return layer;
}
let lastSnap=null;
function paint(){
 const layer=ensure(); if(!layer)return;
 const s=S(), p=s.profile||{}, f=activeFollower();
 const snap={level:Number(s.level)||Number(p.level)||1,hp:Number(s.hp??100),coins:Number(s.coins??s.gold??0),gems:Number(s.gems??0),redgems:Number(s.redgems??s.redGems??0),xp:Number(s.xp??0),follower:f.id};
 if(lastSnap){
   if(snap.level>lastSnap.level) react('level-up');
   else if(snap.hp<lastSnap.hp-1) react('damage');
   else if(snap.hp>lastSnap.hp+1) react('heal');
   if(snap.coins>lastSnap.coins || snap.gems>lastSnap.gems || snap.redgems>lastSnap.redgems) react('reward',{text:'🎁 Награда получена'});
   if(snap.follower!==lastSnap.follower){ layer.classList.add('follower-switch'); burst('follower','blue'); setTimeout(()=>layer.classList.remove('follower-switch'),900); }
 }
 lastSnap=snap;
 const hp=Math.max(0,Number(s.hp??100)), maxHp=Math.max(1,Number(s.maxHp??100));
 const hero=layer.querySelector('[data-life-hero]'), fol=layer.querySelector('[data-life-follower]');
 const plate=layer.querySelector('[data-life-nameplate]'), fplate=layer.querySelector('[data-follower-nameplate]');
 const icon=layer.querySelector('[data-life-follower-icon]'); if(!hero||!fol)return;
 hero.classList.toggle('hero-lowhp',hp/maxHp<.35); hero.classList.toggle('hero-hurt',hp/maxHp<.7);
 icon.textContent=f.icon; fol.dataset.follower=f.id; fol.dataset.accent=f.accent;
 plate.innerHTML='<b>'+safe(p.displayName||'Игрок')+'</b><small>Lv.'+(Number(s.level)||1)+' · Герой</small>';
 fplate.innerHTML='<b>'+safe(f.name)+'</b><small>'+safe(f.role)+'</small>';
 fol.setAttribute('aria-label',f.name+' — последователь слева от героя'); layer.dataset.follower=f.id;
}
function pulse(x){
 const layer=ensure(),tap=layer?.querySelector('[data-life-tap]'); if(!tap)return;
 tap.style.left=x.clientX+'px';tap.style.top=x.clientY+'px';tap.classList.remove('show');void tap.offsetWidth;tap.classList.add('show');
}
function toast(text,kind){
 const layer=ensure(),t=layer?.querySelector('[data-life-toast]');if(!t)return;
 t.textContent=text;t.dataset.kind=kind||'info';t.classList.remove('show');void t.offsetWidth;t.classList.add('show');
}
function burst(target,kind){
 const layer=ensure();if(!layer)return;
 const el=document.createElement('i');el.className='life-burst '+(kind||'gold');el.dataset.target=target;el.textContent=kind==='heal'?'♥':kind==='damage'?'✦':'✦';layer.appendChild(el);
 requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>el.remove(),900);
}
function react(name,detail){
 const layer=ensure();if(!layer)return;
 const type=String(name||'').toLowerCase(), d=detail||{};
 if(/level|level-up|levelup|xp/i.test(type)){layer.classList.add('level-up');worldPulse('gold');burst('hero','gold');toast('✨ Новый уровень!','level');setTimeout(()=>layer.classList.remove('level-up'),1100);return;}
 if(/damage|hurt|hit|attack/i.test(type)){layer.classList.add('combat-hit');worldPulse('damage');burst('hero','damage');setTimeout(()=>layer.classList.remove('combat-hit'),420);return;}
 if(/heal|recover|regen/i.test(type)){layer.classList.add('combat-heal');worldPulse('heal');burst('hero','heal');toast('♥ Восстановление','heal');setTimeout(()=>layer.classList.remove('combat-heal'),700);return;}
 if(/reward|loot|coin|gem|chest/i.test(type)){worldPulse('gold');burst('hero','gold');toast(d.text||'🎁 Награда получена','reward');return;}
}
function bind(){
 const layer=ensure();if(!layer||layer.dataset.bound)return;layer.dataset.bound='1';
 layer.querySelector('[data-life-follower]')?.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();pulse(e);layer.classList.add('follower-hello');burst('follower','blue');
   setTimeout(()=>layer.classList.remove('follower-hello'),650);
   const f=activeFollower();window.TerritoryNavigation?.info?.('👥 '+f.name,'Твой последователь. Роль: '+f.role+'. Он находится слева и чуть позади героя и участвует в бою и развитии персонажа.');
 });
 layer.querySelector('[data-life-hero]')?.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();pulse(e);layer.classList.add('hero-hello');burst('hero','gold');
   setTimeout(()=>layer.classList.remove('hero-hello'),700);window.TerritoryNavigation?.go?.('hero');
 });
 window.addEventListener('territory:state-changed',paint);
 ['territory:level-up','territory:levelup','territory:damage','territory:hit','territory:heal','territory:reward'].forEach(ev=>window.addEventListener(ev,e=>react(ev,e?.detail)));
 window.addEventListener('territory:combat-event',e=>react(e?.detail?.type,e?.detail));
}
function init(){bind();paint();setInterval(paint,1500);}
window.HomeLife={refresh:paint,react};
document.addEventListener('DOMContentLoaded',init);
})();
