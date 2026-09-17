const SAVE='territory_clean_v1';
const defaults={name:'SSS',level:17,coins:27883,gems:245,hp:120,maxHp:120,energy:100,strength:5,agility:5,defense:0,weapon:'Кулаки',bonusDamage:0,inventory:[]};
let state=load();
function load(){try{const x=JSON.parse(localStorage.getItem(SAVE));return {...defaults,...(x&&typeof x==='object'?x:{})}}catch{return {...defaults}}}
function save(){localStorage.setItem(SAVE,JSON.stringify(state));renderHUD()}
function $(s){return document.querySelector(s)}
function showScreen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));if(id==='arena'&&window.arenaHome)window.arenaHome()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-screen]');if(b){e.preventDefault();showScreen(b.dataset.screen)}});
function renderHUD(){['playerName','profileName'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=state.name});['level','profileLevel'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=state.level});['coins','gems','strength','defense','agility','energy'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=state[id]??0})}
const items=[{name:'Боевой топор',icon:'🪓',damage:12,cost:300},{name:'Стальной меч',icon:'⚔️',damage:18,cost:650},{name:'Молот',icon:'🔨',damage:25,cost:1000},{name:'Арбалет',icon:'🏹',damage:31,cost:1500}];
function renderMarket(){const g=$('#shopGrid');if(!g)return;g.innerHTML=items.map((x,i)=>`<article class="shop-item"><span class="icon">${x.icon}</span><b>${x.name}</b><small>Урон +${x.damage}</small><button data-buy="${i}">${x.cost} 🪙 · КУПИТЬ</button></article>`).join('')}
$('#shopGrid').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b)return;const x=items[Number(b.dataset.buy)];if(state.coins<x.cost){$('#marketLog').textContent='Не хватает монет.';return}state.coins-=x.cost;state.weapon=x.name;state.bonusDamage=x.damage;state.inventory.push(x.icon);$('#marketLog').textContent=`Куплено: ${x.name}`;save()});
const districts={center:['Центр Sdolars','Главная площадь города.'],port:['Старый порт','Причалы и торговые склады.'],ruins:['Старые руины','Опасная окраина города.']};
document.querySelectorAll('[data-district]').forEach(b=>b.addEventListener('click',()=>{const d=districts[b.dataset.district];$('#districtLog').innerHTML=`<b>${d[0]}</b><br>${d[1]}`}));
renderMarket();renderHUD();showScreen('home');
