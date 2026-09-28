/* Territory — VIP Center PASS 31
   Fair-choice foundation: VIP changes presentation/convenience only.
   No client-side purchase or premium-currency grant is performed here.
*/
(function(){
'use strict';
const TIERS = [
 {id:0,name:'Без VIP',title:'Странник',price:'—'},
 {id:1,name:'VIP I',title:'Искра',price:'$1'},
 {id:2,name:'VIP II',title:'Знак',price:'$3'},
 {id:3,name:'VIP III',title:'Страж',price:'$7'},
 {id:4,name:'VIP IV',title:'Герой',price:'$15'},
 {id:5,name:'VIP V',title:'Мастер',price:'$30'},
 {id:6,name:'VIP VI',title:'Легенда',price:'$55'},
 {id:7,name:'VIP VII',title:'Владыка',price:'$90'},
 {id:8,name:'VIP VIII',title:'Титан',price:'$140'},
 {id:9,name:'VIP IX',title:'Архонт',price:'$200'},
 {id:10,name:'VIP X',title:'Император',price:'$300'}
];
const CONVENIENCE = [
 'косметическая аура героя и спутника',
 'уникальный титул над героем',
 'дополнительные удобства интерфейса',
 'не меняет базовый урон обычного игрока',
 'не отнимает контент у игроков без VIP'
];
function store(){return window.TerritoryStore?.state||null}
function vip(){return Math.max(0,Math.min(10,Number(store()?.profile?.vip)||0))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function open(){
 let modal=document.getElementById('territoryVipCenter');
 if(!modal){modal=document.createElement('div');modal.id='territoryVipCenter';modal.className='tvip-modal';document.body.appendChild(modal)}
 const level=vip(), t=TIERS[level];
 modal.innerHTML=`<div class="tvip-backdrop" data-vip-close></div>
 <section class="tvip-card" role="dialog" aria-modal="true" aria-label="VIP Territory">
  <button class="tvip-x" type="button" data-vip-close>×</button>
  <div class="tvip-crown">♛</div>
  <div class="tvip-kicker">TERRITORY VIP</div>
  <h2>${esc(t.name)}</h2>
  <div class="tvip-title">${esc(t.title)}</div>
  <p class="tvip-status">${level?`Текущий уровень: VIP ${level}`:'Сейчас ты играешь без VIP — весь основной игровой контент доступен.'}</p>
  <div class="tvip-choice">
   <b>Твой стиль игры</b>
   <span>VIP — добровольный выбор. Базовая сила и основной прогресс остаются доступны всем.</span>
  </div>
  <div class="tvip-list">${CONVENIENCE.map(x=>`<div>✦ ${esc(x)}</div>`).join('')}</div>
  <div class="tvip-grid">${TIERS.map(x=>`<button type="button" class="tvip-tier ${x.id===level?'active':''}" data-vip-tier="${x.id}">
    <strong>${esc(x.name)}</strong><span>${esc(x.title)}</span><em>${esc(x.price)}</em>
  </button>`).join('')}</div>
  <div class="tvip-note">Покупка здесь намеренно не выполняется. Реальный VIP должен подтверждаться сервером, чтобы его нельзя было подделать через клиент.</div>
 </section>`;
 modal.classList.add('show');
}
function close(){document.getElementById('territoryVipCenter')?.classList.remove('show')}
function mount(){
 if(document.getElementById('territoryVipLauncher'))return;
 const host=document.getElementById('home')||document.body;
 const b=document.createElement('button');b.id='territoryVipLauncher';b.type='button';b.className='tvip-launcher';
 b.innerHTML='<span>♛</span><b>VIP</b>';b.title='Territory VIP';
 b.addEventListener('click',open);host.appendChild(b);
 document.addEventListener('click',e=>{
   const c=e.target.closest('[data-vip-close]'); if(c){e.preventDefault();close();return}
   const tier=e.target.closest('[data-vip-tier]');
   if(tier){
     const requested=Number(tier.dataset.vipTier)||0;
     const current=vip();
     const m=document.getElementById('territoryVipCenter');
     const note=m?.querySelector('.tvip-note');
     if(note) note.textContent=requested<=current
       ? 'Этот уровень уже доступен в текущем профиле. Для будущего подключения покупка должна подтверждаться сервером.'
       : `Выбран VIP ${requested}. Цена: ${TIERS[requested].price}. Здесь ничего не списывается — подключение выполняется только через серверную проверку.`;
   }
 });
}
document.addEventListener('DOMContentLoaded',mount);
window.TerritoryVIPCenter={open,close,tiers:TIERS};
})();
