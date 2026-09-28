(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const FOLLOWERS=()=>window.Followers;
const CONFIG={
 liabro:{name:'Лиабро',icon:'⚔️',role:'Крит'},
 teralel:{name:'Тералель',icon:'🛡️',role:'Защита'},
 king_cows:{name:'Король Коров',icon:'❤️',role:'Лечение'},
 mort:{name:'Морт',icon:'🌀',role:'Уворот'},
 stone_face:{name:'Каменное Лицо',icon:'💀',role:'Контроль'}
};
function activeFollower(){
 const id=FOLLOWERS?.getActiveId?.()||S().followers?.activeFollower||'liabro';
 const c=CONFIG[id]||CONFIG.liabro;
 return {id,name:c.name,icon:c.icon,role:c.role};
}
function ensure(){
 const home=document.getElementById('home');
 if(!home)return null;
 let layer=home.querySelector('.home-life');
 if(layer)return layer;
 layer=document.createElement('div');
 layer.className='home-life';
 layer.innerHTML=`
   <div class="life-vignette"></div>
   <div class="life-moon"></div>
   <div class="life-snow" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
   <div class="life-fire fire-left"><i></i><b></b><em></em></div>
   <div class="life-fire fire-right"><i></i><b></b><em></em></div>
   <div class="life-hero" data-life-hero>
     <div class="life-shadow"></div>
     <div class="life-body"><i class="life-cloak"></i><i class="life-head">🪖</i><i class="life-weapon">🪓</i></div>
   </div>
   <button class="life-follower" data-life-follower aria-label="Последователь">
     <div class="life-shadow"></div><div class="life-follower-body"><span data-life-follower-icon>⚔️</span></div>
   </button>
   <div class="life-nameplate" data-life-nameplate></div>
   <div class="life-weather"><span></span><span></span><span></span></div>
 `;
 home.appendChild(layer);
 return layer;
}
function paint(){
 const layer=ensure(); if(!layer)return;
 const s=S(), p=s.profile||{}, f=activeFollower();
 const hp=Math.max(0,Number(s.hp??100)), maxHp=Math.max(1,Number(s.maxHp??100));
 const hero=layer.querySelector('[data-life-hero]');
 const fol=layer.querySelector('[data-life-follower]');
 const plate=layer.querySelector('[data-life-nameplate]');
 const icon=layer.querySelector('[data-life-follower-icon]');
 if(!hero||!fol)return;
 hero.classList.toggle('hero-lowhp',hp/maxHp<.35);
 icon.textContent=f.icon;
 plate.innerHTML='<b>'+String(p.displayName||'Игрок').replace(/[<>&"]/g,'')+'</b><small>Lv.'+(Number(s.level)||1)+' · '+f.name+'</small>';
 const key=String(f.id||'liabro').replace(/[^a-z0-9_-]/gi,'');
 fol.dataset.follower=key;
}
function bind(){
 const layer=ensure();if(!layer||layer.dataset.bound)return;
 layer.dataset.bound='1';
 layer.querySelector('[data-life-follower]')?.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   const f=activeFollower();
   window.TerritoryNavigation?.info?.('👥 '+f.name,'Твой последователь. Роль: '+f.role+'. Нажми на раздел «Герой», чтобы открыть его развитие.');
 });
 layer.querySelector('[data-life-hero]')?.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   window.TerritoryNavigation?.go?.('hero');
 });
}
function init(){bind();paint();window.addEventListener('territory:state-changed',paint);setInterval(paint,1500);}
window.HomeLife={refresh:paint};
document.addEventListener('DOMContentLoaded',init);
})();