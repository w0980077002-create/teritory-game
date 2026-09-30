/* Territory Fix 18 — Telegram identity UI. UI-only. */
(function(){
'use strict';
if(window.TerritoryTelegramProfileUI18)return;
const S=()=>window.TerritoryStore?.state||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function get(){
 const s=S(),p=s.profile||{},a=window.TerritoryTelegramAuth?.player||{},u=window.Telegram?.WebApp?.initDataUnsafe?.user||{};
 return {name:p.displayName||a.first_name||u.first_name||a.username||u.username||'Игрок',
 username:p.username||a.username||u.username||'',id:String(p.telegramId||a.telegram_id||u.id||''),
 photo:p.photoUrl||a.photo_url||u.photo_url||''};
}
function css(){
 if(document.getElementById('tg18css'))return;
 const x=document.createElement('style');x.id='tg18css';x.textContent=`
.tg18-home{position:absolute;left:10px;top:10px;z-index:500;display:flex;align-items:center;gap:8px;max-width:78%;padding:6px 10px 6px 6px;border:1px solid #e8c76b;border-radius:15px;background:rgba(5,13,19,.88);color:#fff;box-shadow:0 8px 25px #0008;cursor:pointer;pointer-events:auto}
.tg18-home img,.tg18-avatar{width:43px;height:43px;min-width:43px;border-radius:50%;object-fit:cover;background:#173244;border:1px solid #e8c76b;display:grid;place-items:center;font-size:20px}
.tg18-name{font-size:12px;font-weight:900;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tg18-user{font-size:9px;color:#e8c76b;display:block;margin-top:3px}.tg18-id{font-size:8px;color:#9fb0ba;display:block;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hero .tg18-card{margin:0 14px 12px;padding:13px;border:1px solid rgba(232,199,107,.38);border-radius:16px;background:rgba(7,19,27,.75);text-align:center}
#hero .tg18-card img,#hero .tg18-card .tg18-avatar{width:86px;height:86px;margin:auto}.tg18-card b{display:block;margin-top:7px;color:#e8c76b;font-size:18px}.tg18-card small{display:block;color:#b8c4c9;margin-top:3px;font-size:10px}.tg18-copy{margin-top:8px;border:1px solid #536873;border-radius:9px;background:#10222d;color:#fff;padding:7px 10px;font-size:9px;font-weight:800}
.tg18-modal{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px;background:#000b}.tg18-modal>div{width:min(390px,100%);padding:20px;border:1px solid #e8c76b;border-radius:18px;background:#0b1821;text-align:center;color:#fff}.tg18-modal img,.tg18-modal .tg18-avatar{width:92px;height:92px;margin:auto}.tg18-modal h2{color:#e8c76b;margin:10px 0 3px}.tg18-modal p{font-size:11px;color:#b8c4c9}.tg18-modal button{width:100%;min-height:40px;margin-top:8px;border-radius:10px;border:1px solid #536873;background:#10222d;color:#fff;font-weight:800}
`;
 document.head.appendChild(x);
}
function avatar(v,cls){return v.photo?'<img class="'+cls+'" src="'+esc(v.photo)+'" alt="Telegram">':'<div class="'+cls+' tg18-avatar">👤</div>'}
function open(){
 const v=get(),m=document.createElement('div');m.className='tg18-modal';
 m.innerHTML='<div>'+avatar(v,'')+'<h2>'+esc(v.name)+'</h2><p>'+(v.username?'@'+esc(v.username):'Telegram игрок')+'</p><p>Telegram ID: <b>'+esc(v.id||'не получен')+'</b></p><button data-copy>📋 Скопировать ID</button><button data-close>ЗАКРЫТЬ</button></div>';
 document.body.appendChild(m);m.onclick=e=>{if(e.target===m||e.target.closest('[data-close]'))m.remove()};
 m.querySelector('[data-copy]').onclick=async()=>{if(!v.id)return;try{await navigator.clipboard.writeText(v.id);e=m.querySelector('[data-copy]');e.textContent='✓ ID скопирован';setTimeout(()=>e.textContent='📋 Скопировать ID',1200)}catch(_){}};
}
function render(){
 css();const v=get();
 const home=document.querySelector('#home .home-reference-host');
 if(home){let b=home.querySelector('.tg18-home');if(!b){b=document.createElement('button');b.className='tg18-home';b.type='button';b.onclick=open;home.appendChild(b)}
 b.innerHTML=avatar(v,'tg18-photo')+'<span><b class="tg18-name">'+esc(v.name)+'</b><small class="tg18-user">'+(v.username?'@'+esc(v.username):'Telegram игрок')+'</small><small class="tg18-id">ID: '+esc(v.id||'не получен')+'</small></span>';}
 const hero=document.getElementById('hero');
 if(hero&&!hero.querySelector('.tg18-card')){
   const card=document.createElement('div');card.className='tg18-card';
   const old=hero.querySelector('.hero-card');if(old)old.after(card);else hero.prepend(card);
 }
 const card=hero?.querySelector('.tg18-card');
 if(card)card.innerHTML=avatar(v,'tg18-photo')+'<b>'+esc(v.name)+'</b><small>'+(v.username?'@'+esc(v.username):'Telegram игрок')+'</small><small>Telegram ID: '+esc(v.id||'не получен')+'</small><button class="tg18-copy">📋 Скопировать Telegram ID</button>';
 card?.querySelector('.tg18-copy')?.addEventListener('click',async()=>{if(!v.id)return;try{await navigator.clipboard.writeText(v.id);const b=card.querySelector('.tg18-copy');b.textContent='✓ ID скопирован';setTimeout(()=>b.textContent='📋 Скопировать Telegram ID',1200)}catch(_){}},{once:true});
}
function boot(){render();let n=0;const t=setInterval(()=>{render();if(++n>60)clearInterval(t)},500);window.addEventListener('territory:state-changed',render);window.addEventListener('territory:telegram-authenticated',render);window.addEventListener('pageshow',()=>setTimeout(render,200));}
window.TerritoryTelegramProfileUI18={render,get};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();