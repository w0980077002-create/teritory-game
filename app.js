const SAVE='territory_clean_v1';
const defaults={name:'SSS',level:17,coins:27883,gems:245,hp:120,maxHp:120,energy:100,strength:5,agility:5,defense:0,weapon:'Кулаки',bonusDamage:0,inventory:[]};
let state=load();
let lang=localStorage.getItem('territory_lang')||'ru';
function load(){try{const x=JSON.parse(localStorage.getItem(SAVE));return {...defaults,...(x&&typeof x==='object'?x:{})}}catch{return {...defaults}}}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch{}renderHUD()}
function $(s){return document.querySelector(s)}
const T={
 ru:{city:'Город',arena:'Арена',districts:'Районы',profile:'Профиль',shop:'Магазин',cityLabel:'ГОРОД',arenaLabel:'АРЕНА',districtsLabel:'ГОРОД',profileLabel:'ПЕРСОНАЖ',marketLabel:'SDOLARS',arenaTitle:'АРЕНА',districtsTitle:'РАЙОНЫ',profileTitle:'ПРОФИЛЬ',marketTitle:'РЫНОК',fights:'Бои',trade:'Торговля',town:'Город',market:'Рынок',districts2:'Районы',level:'Уровень',merchant:'ТОРГОВЕЦ',equipment:'Снаряжение',strength:'Сила',defense:'Защита',agility:'Ловкость',energy:'Энергия',localSave:'Профиль и прогресс сохраняются локально на устройстве.',chooseDistrict:'Выбери район.',merchantWait:'Торговец ждёт сделки.',buy:'КУПИТЬ',notEnough:'Не хватает монет.',bought:'Куплено'},
 en:{city:'City',arena:'Arena',districts:'Districts',profile:'Profile',shop:'Shop',cityLabel:'CITY',arenaLabel:'ARENA',districtsLabel:'CITY',profileLabel:'CHARACTER',marketLabel:'SDOLARS',arenaTitle:'ARENA',districtsTitle:'DISTRICTS',profileTitle:'PROFILE',marketTitle:'MARKET',fights:'Fights',trade:'Trade',town:'City',market:'Market',districts2:'Districts',level:'Level',merchant:'MERCHANT',equipment:'Equipment',strength:'Strength',defense:'Defense',agility:'Agility',energy:'Energy',localSave:'Profile and progress are saved locally on this device.',chooseDistrict:'Choose a district.',merchantWait:'The merchant is waiting for a deal.',buy:'BUY',notEnough:'Not enough coins.',bought:'Purchased'}
};
function tr(k){return T[lang][k]||k}
function applyLanguage(){
 document.documentElement.lang=lang;
 const map={
  '#citySmall':'cityLabel','#arenaSmall':'arenaLabel','#districtsSmall':'districtsLabel','#profileSmall':'profileLabel','#marketSmall':'marketLabel',
  '#homeArenaText':'arena','#homeMarketText':'market','#homeDistrictText':'districts2','#arenaTitle':'arenaTitle','#districtsTitle':'districtsTitle','#profileTitle':'profileTitle','#marketTitle':'marketTitle',
  '#marketMerchant':'merchant','#marketEquipment':'equipment','#strengthLabel':'strength','#defenseLabel':'defense','#agilityLabel':'agility','#energyLabel':'energy','#profileSave':'localSave','#districtLog':'chooseDistrict','#marketLog':'merchantWait','#langBtn':'lang'
 };
 Object.entries(map).forEach(([sel,key])=>{const e=$(sel);if(e)e.textContent=tr(key)});
 document.querySelectorAll('[data-lang]').forEach(e=>e.textContent=lang.toUpperCase());
 renderMarket();renderHUD();
}
function toggleLanguage(){lang=lang==='ru'?'en':'ru';try{localStorage.setItem('territory_lang',lang)}catch{}applyLanguage();if(window.arenaHome)window.arenaHome()}
function showScreen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));if(id==='arena'&&window.arenaHome)window.arenaHome()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-screen]');if(b){e.preventDefault();showScreen(b.dataset.screen)}});
function renderHUD(){['playerName','profileName'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=state.name});['level','profileLevel'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=state.level});['coins','gems','strength','defense','agility','energy'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=state[id]??0})}
const items=[{name:'Боевой топор',icon:'🪓',damage:12,cost:300},{name:'Стальной меч',icon:'⚔️',damage:18,cost:650},{name:'Молот',icon:'🔨',damage:25,cost:1000},{name:'Арбалет',icon:'🏹',damage:31,cost:1500}];
function renderMarket(){const g=$('#shopGrid');if(!g)return;g.innerHTML=items.map((x,i)=>`<article class="shop-item"><span class="icon">${x.icon}</span><b>${lang==='ru'?x.name:x.name.replace('Боевой топор','Battle Axe').replace('Стальной меч','Steel Sword').replace('Молот','Hammer').replace('Арбалет','Crossbow')}</b><small>⚔️ +${x.damage}</small><button data-buy="${i}">${x.cost} 🪙 · ${tr('buy')}</button></article>`).join('')}
$('#shopGrid').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b)return;const x=items[Number(b.dataset.buy)];if(state.coins<x.cost){$('#marketLog').textContent=tr('notEnough');return}state.coins-=x.cost;state.weapon=x.name;state.bonusDamage=x.damage;state.inventory.push(x.icon);$('#marketLog').textContent=`${tr('bought')}: ${x.name}`;save()});
const districts={center:['Центр Sdolars','Главная площадь города.'],port:['Старый порт','Причалы и торговые склады.'],ruins:['Старые руины','Опасная окраина города.']};
document.querySelectorAll('[data-district]').forEach(b=>b.addEventListener('click',()=>{const d=districts[b.dataset.district];$('#districtLog').innerHTML=`<b>${d[0]}</b><br>${d[1]}`}));
$('#langBtn')?.addEventListener('click',toggleLanguage);
renderMarket();renderHUD();applyLanguage();showScreen('home');
